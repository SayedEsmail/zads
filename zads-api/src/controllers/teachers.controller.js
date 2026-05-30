const prisma = require('../config/database');
const response = require('../utils/response');

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

        // Determine active location filters (defaulting to logged-in parent's location if no search filters provided)
        let activeAreaId = areaId;
        let activeCityId = cityId;
        let activeGovId = governorateId;

        const parent = req.user?.parent;
        if (parent?.areaId && !areaId && !cityId && !governorateId) {
            const parentArea = await prisma.area.findUnique({
                where: { id: parent.areaId },
                include: { city: true }
            });
            if (parentArea) {
                activeAreaId = parentArea.id;
                activeCityId = parentArea.cityId;
                activeGovId = parentArea.city?.governorateId;
            }
        }

        // Apply governorate restriction (always show teachers within the target governorate)
        if (activeAreaId) {
            const area = await prisma.area.findUnique({
                where: { id: activeAreaId },
                include: { city: true }
            });
            if (area?.city?.governorateId) {
                teacherWhere.area = { city: { governorateId: area.city.governorateId } };
                activeGovId = area.city.governorateId;
                activeCityId = area.cityId;
            }
        } else if (activeCityId) {
            const city = await prisma.city.findUnique({
                where: { id: activeCityId }
            });
            if (city?.governorateId) {
                teacherWhere.area = { city: { governorateId: city.governorateId } };
                activeGovId = city.governorateId;
            }
        } else if (activeGovId) {
            teacherWhere.area = { city: { governorateId: activeGovId } };
        }

        // Lesson type filter
        if (lessonType) {
            teacherWhere.lessonTypes = { has: lessonType };
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
        // studyMode filter: online → priceOnline not null, offline → priceOffline not null
        if (studyMode === 'online') subjectWhere.priceOnline = { not: null };
        else if (studyMode === 'offline') subjectWhere.priceOffline = { not: null };
        if (minPrice) {
            subjectWhere.OR = [
                { priceAtTeacher: { gte: parseInt(minPrice) } },
                { priceAtStudent: { gte: parseInt(minPrice) } },
                { priceGroup: { gte: parseInt(minPrice) } }
            ];
        }
        if (maxPrice) {
            const priceFilter = { lte: parseInt(maxPrice) };
            subjectWhere.OR = [
                { priceAtTeacher: priceFilter },
                { priceAtStudent: priceFilter },
                { priceGroup: priceFilter }
            ];
        }

        // Get all teachers in the governorate
        let teachers = await prisma.teacher.findMany({
            where: {
                ...teacherWhere,
                ...(subjectId || stageId ? { subjects: { some: subjectWhere } } : {})
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
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

        return response.paginated(res, teachers, {
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

        const teacher = await prisma.teacher.findUnique({
            where: { id },
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

        return response.success(res, teacher);

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

        const updated = await prisma.teacher.update({
            where: { id: teacherId },
            data: {
                ...(bio !== undefined && { bio }),
                ...(experienceYears !== undefined && { experienceYears }),
                ...(qualification !== undefined && { qualification }),
                ...(areaId !== undefined && { areaId }),
                ...(lessonTypes !== undefined && { lessonTypes }),
                ...(certificateUrl !== undefined && { certificateUrl })
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

        // Validate slots
        for (const slot of slots) {
            if (slot.dayOfWeek < 0 || slot.dayOfWeek > 6) {
                return response.error(res, 'Invalid day of week', 400);
            }
            if (!slot.startTime || !slot.endTime) {
                return response.error(res, 'Start time and end time are required', 400);
            }
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
