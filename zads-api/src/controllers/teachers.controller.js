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

        // Location filter - always filter by governorate to show all teachers in the governorate
        if (governorateId) {
            teacherWhere.area = { city: { governorateId } };
        } else if (cityId) {
            teacherWhere.area = { city: { governorateId: { not: null } } };
        } else if (areaId) {
            // If only areaId provided, get the governorate from it
            const area = await prisma.area.findUnique({
                where: { id: areaId },
                include: { city: true }
            });
            if (area?.city?.governorateId) {
                teacherWhere.area = { city: { governorateId: area.city.governorateId } };
            }
        }

        // Lesson type filter
        if (lessonType) {
            teacherWhere.lessonTypes = { has: lessonType };
        }

        // Subject/Stage filter
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
            const aInSameArea = areaId && a.areaId === areaId ? 1 : 0;
            const bInSameArea = areaId && b.areaId === areaId ? 1 : 0;
            if (aInSameArea !== bInSameArea) return bInSameArea - aInSameArea;

            // Priority 2: Same city
            const aInSameCity = cityId && a.area?.cityId === cityId ? 1 : 0;
            const bInSameCity = cityId && b.area?.cityId === cityId ? 1 : 0;
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
            lessonTypes
        } = req.body;

        const updated = await prisma.teacher.update({
            where: { id: teacherId },
            data: {
                ...(bio !== undefined && { bio }),
                ...(experienceYears !== undefined && { experienceYears }),
                ...(qualification !== undefined && { qualification }),
                ...(areaId !== undefined && { areaId }),
                ...(lessonTypes !== undefined && { lessonTypes })
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
    getMySubjects
};
