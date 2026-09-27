const prisma = require('../config/database');
const response = require('../utils/response');
const path = require('path');

/**
 * Search teachers with filters (location by area, subject, stage)
 */
const searchTeachers = async (req, res, next) => {
    try {
        const {
            areaId,
            cityId,
            governorateId,
            subjectId,
            stageId,
            lessonType,
            studyMode,
            minPrice,
            maxPrice,
            page = 1,
            limit = 20
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        const teacherWhere = {
            user: { status: 'active' }
        };

        // Location filtering:
        // For online discovery without explicit location query, do NOT restrict geographically.
        const isOnlineSearch = studyMode === 'online';
        const hasExplicitLocation = !!(areaId || cityId || governorateId);

        let activeAreaId = areaId || null;
        let activeCityId = cityId || null;
        let activeGovId = governorateId || null;

        if (!isOnlineSearch || hasExplicitLocation) {
            if (areaId) {
                // Strict explicit area filter - DO NOT expand to governorate!
                teacherWhere.areaId = areaId;
                activeAreaId = areaId;
            } else if (cityId) {
                // Explicit city filter
                teacherWhere.area = { cityId };
                activeCityId = cityId;
            } else if (governorateId) {
                teacherWhere.area = { city: { governorateId } };
                activeGovId = governorateId;
            } else if (!isOnlineSearch) {
                // For offline discovery without explicit location query, default to parent's city if available
                const parent = req.user?.parent;
                if (parent?.areaId) {
                    const parentArea = await prisma.area.findUnique({
                        where: { id: parent.areaId },
                        include: { city: true }
                    });
                    if (parentArea?.cityId) {
                        teacherWhere.area = { cityId: parentArea.cityId };
                        activeCityId = parentArea.cityId;
                    }
                }
            }
        }

        // Lesson type filter (PostgreSQL Json column)
        if (lessonType) {
            teacherWhere.lessonTypes = { array_contains: lessonType };
        }

        // Subject/Stage filter
        const parentId = req.user?.parent?.id;
        if (parentId && !subjectId) {
            const childSubjects = await prisma.parentChildSubject.findMany({
                where: { parentChild: { parentId } },
                select: { subjectId: true }
            });

            const tutorRequests = await prisma.tutorRequest.findMany({
                where: { parentId },
                select: { subjectId: true }
            });

            const neededSubjectIds = Array.from(new Set([
                ...childSubjects.map(cs => cs.subjectId),
                ...tutorRequests.map(tr => tr.subjectId)
            ]));

            if (neededSubjectIds.length > 0) {
                teacherWhere.subjects = {
                    some: {
                        subjectId: { in: neededSubjectIds },
                        isActive: true
                    }
                };
            }
        }

        const subjectWhere = { isActive: true };
        if (subjectId) subjectWhere.subjectId = subjectId;
        if (stageId) subjectWhere.stageId = stageId;

        // Pricing and Mode consistency (prevents cross-column price matching)
        const hasMin = minPrice !== undefined && minPrice !== null && minPrice !== '';
        const hasMax = maxPrice !== undefined && maxPrice !== null && maxPrice !== '';
        const minVal = hasMin ? Number(minPrice) : 0;
        const maxVal = hasMax ? Number(maxPrice) : Infinity;
        const hasPriceFilter = hasMin || hasMax;

        if ((hasMin && (!Number.isSafeInteger(minVal) || minVal < 0)) ||
            (hasMax && (!Number.isSafeInteger(maxVal) || maxVal < 0)) ||
            (hasMin && hasMax && minVal > maxVal)) {
            return response.error(res, 'Invalid price range', 400);
        }

        const makePriceRange = () => {
            // Prices at or below zero are not displayed as offers. A null price means
            // negotiated and is intentionally excluded from numeric range filters.
            const r = { gte: hasMin ? Math.max(1, minVal) : 1 };
            if (hasMax) r.lte = maxVal;
            return r;
        };

        if (studyMode === 'online') {
            subjectWhere.isOnline = true;
            if (hasPriceFilter) {
                subjectWhere.priceOnline = makePriceRange();
            }
        } else if (studyMode === 'offline') {
            subjectWhere.isOffline = true;
            if (hasPriceFilter) {
                const range = makePriceRange();
                subjectWhere.OR = [
                    { priceOffline: range },
                    { priceAtStudent: range },
                    { priceAtTeacher: range }
                ];
            }
        } else {
            // No studyMode specified: if price filter is provided, ensure matched mode satisfies the price
            if (hasPriceFilter) {
                const range = makePriceRange();
                subjectWhere.OR = [
                    { isOnline: true, priceOnline: range },
                    { isOffline: true, priceOffline: range },
                    { isOffline: true, priceAtStudent: range },
                    { isOffline: true, priceAtTeacher: range }
                ];
            }
        }

        const hasSubjectFilter = subjectId || stageId || studyMode || hasPriceFilter;

        // Get all teachers in the governorate
        let teachers = await prisma.teacher.findMany({
            where: {
                ...teacherWhere,
                ...(hasSubjectFilter ? { subjects: { some: subjectWhere } } : {})
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true
                    }
                },
                area: {
                    include: {
                        city: {
                            include: {
                                governorate: true
                            }
                        }
                    }
                },
                subjects: {
                    where: { isActive: true },
                    include: {
                        subject: true,
                        stage: true
                    }
                }
            }
        });

        // Sort by proximity: same area > same city > same governorate
        // Also consider verification and rating
        teachers.sort((a, b) => {
            // Priority 1: Same area
            const aInSameArea = activeAreaId && a.areaId === activeAreaId ? 1 : 0;
            const bInSameArea = activeAreaId && b.areaId === activeAreaId ? 1 : 0;
            if (aInSameArea !== bInSameArea) return bInSameArea - aInSameArea;

            // Priority 2: Same city
            const aInSameCity = activeCityId && a.area?.cityId === activeCityId ? 1 : 0;
            const bInSameCity = activeCityId && b.area?.cityId === activeCityId ? 1 : 0;
            if (aInSameCity !== bInSameCity) return bInSameCity - aInSameCity;

            // Priority 3: Verified
            if (a.isVerified !== b.isVerified) return b.isVerified ? 1 : -1;

            // Priority 4: Rating
            const aRating = parseFloat(a.avgRating) || 0;
            const bRating = parseFloat(b.avgRating) || 0;
            if (aRating !== bRating) return bRating - aRating;

            // Priority 5: Views
            return (b.viewsCount || 0) - (a.viewsCount || 0);
        });

        // Pagination
        const total = teachers.length;
        teachers = teachers.slice(skip, skip + parseInt(limit));

        // Privacy: Strip certificateUrl from public search results
        const sanitizedTeachers = teachers.map(({ certificateUrl, ...rest }) => rest);

        // Server-side authoritative event logging for search outcomes (no PII)
        try {
            await prisma.platformEvent.create({
                data: {
                    eventType: 'search_outcome',
                    userId: req.user?.id || null,
                    metadata: {
                        stageId: stageId || null,
                        subjectId: subjectId || null,
                        studyMode: studyMode || null,
                        cityId: cityId || null,
                        areaId: areaId || null,
                        resultsCount: total,
                        isZeroResult: total === 0
                    }
                }
            });
        } catch (analyticsErr) {
            // Analytics logging should never fail user requests
        }

        return response.paginated(res, sanitizedTeachers, {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit))
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get teacher by ID
 */
const getTeacherById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const teacher = await prisma.teacher.findFirst({
            where: {
                id,
                user: { status: 'active' }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true
                    }
                },
                area: {
                    include: {
                        city: {
                            include: {
                                governorate: true
                            }
                        }
                    }
                },
                subjects: {
                    where: { isActive: true },
                    include: {
                        subject: true,
                        stage: true
                    }
                },
                availabilities: {
                    orderBy: [
                        { dayOfWeek: 'asc' },
                        { startTime: 'asc' }
                    ]
                }
            }
        });

        if (!teacher) {
            return response.error(res, 'Teacher not found', 404);
        }

        // Increment views count
        await prisma.teacher.update({
            where: { id },
            data: { viewsCount: { increment: 1 } }
        });

        // Server-side authoritative event logging for profile view (no PII)
        try {
            await prisma.platformEvent.create({
                data: {
                    eventType: 'profile_view',
                    userId: req.user?.id || null,
                    entityId: id,
                    metadata: {
                        isVerified: teacher.isVerified,
                        subjectsCount: teacher.subjects?.length || 0
                    }
                }
            });
        } catch (analyticsErr) {
            // Analytics logging should never fail user requests
        }

        // Privacy: Hide certificateUrl unless requester is admin or the teacher themselves
        const isOwner = req.user?.userType === 'teacher' && req.user?.teacher?.id === teacher.id;
        const isAdmin = req.user?.userType === 'admin';

        let sanitizedTeacher = teacher;
        if (!isOwner && !isAdmin) {
            const { certificateUrl, ...rest } = teacher;
            sanitizedTeacher = rest;
        }

        return response.success(res, sanitizedTeacher);

    } catch (error) {
        next(error);
    }
};

/**
 * Update teacher profile
 */
const updateTeacher = async (req, res, next) => {
    try {
        const teacherId = req.user.teacher?.id;

        if (!teacherId) {
            return response.error(res, 'Teacher profile not found', 404);
        }

        const {
            bio,
            experienceYears,
            qualification,
            areaId,
            lessonTypes,
            certificateUrl
        } = req.body;

        const currentTeacher = await prisma.teacher.findUnique({
            where: { id: teacherId },
            select: { certificateUrl: true, isVerified: true }
        });

        const updateData = {
            ...(bio !== undefined && { bio }),
            ...(experienceYears !== undefined && { experienceYears }),
            ...(qualification !== undefined && { qualification }),
            ...(areaId !== undefined && { areaId }),
            ...(lessonTypes !== undefined && { lessonTypes }),
        };

        // Handle certificateUrl security (R1):
        // Reject arbitrary external certificate URLs.
        // Certificate files must be uploaded via the dedicated upload endpoint.
        if (certificateUrl !== undefined) {
            if (certificateUrl === null || certificateUrl === '') {
                // Removing certificate invalidates verification
                updateData.certificateUrl = null;
                updateData.isVerified = false;
                updateData.verifiedAt = null;
                updateData.verifiedBy = null;
                updateData.verificationNotes = null;
            } else {
                if (typeof certificateUrl !== 'string' || certificateUrl.includes('://') || certificateUrl.startsWith('//')) {
                    return response.error(res, 'External certificate URLs are not allowed', 400);
                }
                // Only server-uploaded certificate paths can be retained. Legacy absolute
                // URLs are never trusted or echoed back into the profile.
                const isServerCertificatePath = /^\/uploads\/certificates\/[^/]+$/.test(certificateUrl);
                if (!isServerCertificatePath || currentTeacher?.certificateUrl !== certificateUrl) {
                    return response.error(res, 'Certificates must be uploaded through the upload endpoint', 400);
                }
            }
        }

        const updated = await prisma.teacher.update({
            where: { id: teacherId },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true
                    }
                },
                area: {
                    include: {
                        city: {
                            include: {
                                governorate: true
                            }
                        }
                    }
                }
            }
        });

        return response.success(res, updated, 'Profile updated');

    } catch (error) {
        next(error);
    }
};

/**
 * Add subject to teacher
 */
const addSubject = async (req, res, next) => {
    try {
        const teacherId = req.user.teacher?.id;

        if (!teacherId) {
            return response.error(res, 'Teacher profile not found', 404);
        }

        const {
            subjectId,
            stageId,
            priceAtTeacher,
            priceAtStudent,
            priceGroup,
            priceOnline,
            priceOffline,
            isOnline,
            isOffline,
            priceNegotiable,
            durationMinutes
        } = req.body;

        const teacherSubject = await prisma.teacherSubject.create({
            data: {
                teacherId,
                subjectId,
                stageId,
                priceAtTeacher,
                priceAtStudent,
                priceGroup,
                priceOnline,
                priceOffline,
                ...(isOnline !== undefined && { isOnline }),
                ...(isOffline !== undefined && { isOffline }),
                priceNegotiable,
                durationMinutes
            },
            include: {
                subject: true,
                stage: true
            }
        });

        return response.created(res, teacherSubject, 'Subject added');

    } catch (error) {
        next(error);
    }
};

/**
 * Update teacher subject pricing
 */
const updateSubject = async (req, res, next) => {
    try {
        const teacherId = req.user.teacher?.id;
        const { teacherSubjectId } = req.params;

        if (!teacherId) {
            return response.error(res, 'Teacher profile not found', 404);
        }

        const {
            priceAtTeacher,
            priceAtStudent,
            priceGroup,
            priceOnline,
            priceOffline,
            isOnline,
            isOffline,
            priceNegotiable,
            durationMinutes,
            isActive
        } = req.body;

        const updated = await prisma.teacherSubject.update({
            where: {
                id: teacherSubjectId,
                teacherId // Ensure ownership
            },
            data: {
                ...(priceAtTeacher !== undefined && { priceAtTeacher }),
                ...(priceAtStudent !== undefined && { priceAtStudent }),
                ...(priceGroup !== undefined && { priceGroup }),
                ...(priceOnline !== undefined && { priceOnline }),
                ...(priceOffline !== undefined && { priceOffline }),
                ...(isOnline !== undefined && { isOnline }),
                ...(isOffline !== undefined && { isOffline }),
                ...(priceNegotiable !== undefined && { priceNegotiable }),
                ...(durationMinutes !== undefined && { durationMinutes }),
                ...(isActive !== undefined && { isActive })
            },
            include: {
                subject: true,
                stage: true
            }
        });

        return response.success(res, updated, 'Subject updated');

    } catch (error) {
        next(error);
    }
};

/**
 * Get teacher stats (for teacher dashboard)
 */
const getMyStats = async (req, res, next) => {
    try {
        const teacherId = req.user.teacher?.id;

        if (!teacherId) {
            return response.error(res, 'Teacher profile not found', 404);
        }

        const [teacher, contactRequestsCount] = await Promise.all([
            prisma.teacher.findUnique({
                where: { id: teacherId },
                select: {
                    viewsCount: true,
                    avgRating: true,
                    ratingCount: true
                }
            }),
            prisma.contactRequest.count({
                where: { teacherId }
            })
        ]);

        return response.success(res, {
            views: teacher.viewsCount,
            rating: teacher.avgRating,
            ratingCount: teacher.ratingCount,
            contactRequests: contactRequestsCount
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get my teacher profile
 */
const getMyProfile = async (req, res, next) => {
    try {
        const teacherId = req.user.teacher?.id;

        if (!teacherId) {
            return response.error(res, 'Teacher profile not found', 404);
        }

        const teacher = await prisma.teacher.findUnique({
            where: { id: teacherId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        avatarUrl: true,
                        userType: true
                    }
                },
                area: {
                    include: {
                        city: {
                            include: {
                                governorate: true
                            }
                        }
                    }
                },
                subjects: {
                    where: { isActive: true },
                    include: {
                        subject: true,
                        stage: true
                    }
                }
            }
        });

        if (!teacher) {
            return response.error(res, 'Teacher not found', 404);
        }

        return response.success(res, { teacher });

    } catch (error) {
        next(error);
    }
};

/**
 * Get my subjects
 */
const getMySubjects = async (req, res, next) => {
    try {
        const teacherId = req.user.teacher?.id;

        if (!teacherId) {
            return response.error(res, 'Teacher profile not found', 404);
        }

        const subjects = await prisma.teacherSubject.findMany({
            where: {
                teacherId,
                isActive: true
            },
            include: {
                subject: true,
                stage: true
            },
            orderBy: [
                { subject: { nameAr: 'asc' } },
                { stage: { sortOrder: 'asc' } }
            ]
        });

        return response.success(res, subjects);

    } catch (error) {
        next(error);
    }
};

/**
 * Get my availability slots (Teacher)
 */
const getMyAvailability = async (req, res, next) => {
    try {
        const teacherId = req.user.teacher?.id;
        if (!teacherId) {
            return response.error(res, 'Teacher profile not found', 404);
        }

        const availabilities = await prisma.teacherAvailability.findMany({
            where: { teacherId },
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' }
            ]
        });

        return response.success(res, availabilities);
    } catch (error) {
        next(error);
    }
};

/**
 * Update my availability slots (Teacher)
 */
const updateMyAvailability = async (req, res, next) => {
    try {
        const teacherId = req.user.teacher?.id;
        if (!teacherId) {
            return response.error(res, 'Teacher profile not found', 404);
        }

        const { slots } = req.body; // Array of { dayOfWeek: number, startTime: string, endTime: string }

        if (!Array.isArray(slots)) {
            return response.error(res, 'Slots must be an array', 400);
        }

        // Validate slots (HH:mm format, startTime < endTime, dayOfWeek 0-6, non-overlapping)
        const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
        const slotsByDay = {};

        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            const day = parseInt(slot.dayOfWeek);

            if (isNaN(day) || day < 0 || day > 6) {
                return response.error(res, `Invalid day of week for slot #${i + 1}. Must be between 0 (Sunday) and 6 (Saturday)`, 400);
            }
            if (!slot.startTime || !slot.endTime) {
                return response.error(res, `Start time and end time are required for slot #${i + 1}`, 400);
            }
            if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
                return response.error(res, `Times must be in valid 24-hour HH:mm format for slot #${i + 1}`, 400);
            }
            if (slot.startTime >= slot.endTime) {
                return response.error(res, `Start time (${slot.startTime}) must be earlier than end time (${slot.endTime}) for slot #${i + 1}`, 400);
            }

            if (!slotsByDay[day]) {
                slotsByDay[day] = [];
            }
            // Check for overlap with existing slots on the same day
            for (const existing of slotsByDay[day]) {
                if (slot.startTime < existing.endTime && existing.startTime < slot.endTime) {
                    return response.error(
                        res,
                        `Overlapping time slots detected on day ${day}: (${slot.startTime}-${slot.endTime}) conflicts with (${existing.startTime}-${existing.endTime})`,
                        400
                    );
                }
            }
            slotsByDay[day].push({ startTime: slot.startTime, endTime: slot.endTime });
        }

        // Execute in transaction: delete all existing slots, insert new ones
        const result = await prisma.$transaction(async (tx) => {
            await tx.teacherAvailability.deleteMany({
                where: { teacherId }
            });

            if (slots.length > 0) {
                await tx.teacherAvailability.createMany({
                    data: slots.map(slot => ({
                        teacherId,
                        dayOfWeek: parseInt(slot.dayOfWeek),
                        startTime: slot.startTime,
                        endTime: slot.endTime
                    }))
                });
            }

            return tx.teacherAvailability.findMany({
                where: { teacherId },
                orderBy: [
                    { dayOfWeek: 'asc' },
                    { startTime: 'asc' }
                ]
            });
        });

        return response.success(res, result, 'Availability updated successfully');
    } catch (error) {
        next(error);
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal
}

function toRad(deg) {
    return deg * (Math.PI / 180);
}

module.exports = {
    searchTeachers,
    getTeacherById,
    updateTeacher,
    addSubject,
    updateSubject,
    getMyStats,
    getMyProfile,
    getMySubjects,
    getMyAvailability,
    updateMyAvailability
};
