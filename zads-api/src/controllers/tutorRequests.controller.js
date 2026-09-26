const prisma = require('../config/database');
const response = require('../utils/response');

/**
 * Create tutor request (parent posts "I need a tutor")
 */
const createRequest = async (req, res, next) => {
    try {
        const parentId = req.user.parent?.id;

        if (!parentId) {
            return response.error(res, 'Parent profile not found', 404);
        }

        const {
            subjectId,
            stageId,
            description,
            preferredLessonType,
            requestTarget,
            studyMode,
            parentChildId,
            budgetMin,
            budgetMax,
            areaId
        } = req.body;

        // Set expiry to 30 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const tutorRequest = await prisma.tutorRequest.create({
            data: {
                parentId,
                subjectId,
                stageId,
                description,
                preferredLessonType,
                requestTarget: requestTarget ?? (parentChildId ? 'dependent' : 'self'),
                studyMode: studyMode ?? 'both',
                parentChildId: parentChildId ?? null,
                budgetMin,
                budgetMax,
                areaId,
                expiresAt
            },
            include: {
                subject: true,
                stage: true
            }
        });

        return response.created(res, tutorRequest, 'Tutor request created');

    } catch (error) {
        next(error);
    }
};

/**
 * Get tutor requests (teachers can browse)
 */
const getTutorRequests = async (req, res, next) => {
    try {
        const { subjectId, stageId, areaId, cityId, governorateId } = req.query;

        const where = {
            status: 'active',
            OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
            ]
        };

        if (subjectId) where.subjectId = subjectId;
        if (stageId) where.stageId = stageId;
        if (req.query.studyMode) where.studyMode = req.query.studyMode;
        if (req.query.requestTarget) where.requestTarget = req.query.requestTarget;

        // Determine active location filters (defaulting to logged-in teacher's location if no search filters provided)
        let activeAreaId = areaId;
        let activeCityId = cityId;
        let activeGovId = governorateId;

        const teacher = req.user?.teacher;
        if (teacher?.areaId && !areaId && !cityId && !governorateId) {
            const teacherArea = await prisma.area.findUnique({
                where: { id: teacher.areaId },
                include: { city: true }
            });
            if (teacherArea) {
                activeAreaId = teacherArea.id;
                activeCityId = teacherArea.cityId;
                activeGovId = teacherArea.city?.governorateId;
            }
        }

        // Apply location filtering:
        // If specific area is requested, filter by areaId.
        // Otherwise, allow city-wide browsing prioritized by proximity.
        if (areaId) {
            where.areaId = areaId;
        } else if (activeCityId) {
            where.area = { cityId: activeCityId };
        } else if (activeGovId) {
            where.area = { city: { governorateId: activeGovId } };
        }

        // Subject filter: if explicitly provided, filter by it.
        // Otherwise, load teacher's subjects to prioritize matches in sorting.
        let teacherSubjectIds = [];
        const teacherId = req.user?.teacher?.id;
        if (teacherId) {
            const teacherSubjects = await prisma.teacherSubject.findMany({
                where: { teacherId, isActive: true },
                select: { subjectId: true }
            });
            teacherSubjectIds = teacherSubjects.map(ts => ts.subjectId);
        }

        const requests = await prisma.tutorRequest.findMany({
            where,
            include: {
                parent: {
                    include: {
                        user: { select: { id: true, name: true, avatarUrl: true } }
                    }
                },
                subject: true,
                stage: true,
                parentChild: {
                    select: {
                        id: true,
                        name: true,
                        gender: true,
                        schoolType: true,
                        stage: true
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
            },
            orderBy: { createdAt: 'desc' }
        });

        // Proximity & Relevance Sorting based on active location (defaulting to teacher's home location)
        let sortAreaId = teacher?.areaId;
        let sortCityId = null;
        let sortGovId = null;

        if (sortAreaId) {
            const teacherArea = await prisma.area.findUnique({
                where: { id: sortAreaId },
                include: { city: true }
            });
            if (teacherArea) {
                sortCityId = teacherArea.cityId;
                sortGovId = teacherArea.city?.governorateId;
            }
        }

        // If specific search filters were explicitly provided, use them to prioritize sorting
        if (areaId) {
            sortAreaId = areaId;
        }
        if (cityId) {
            sortCityId = cityId;
        }
        if (governorateId) {
            sortGovId = governorateId;
        }

        requests.sort((a, b) => {
            // Priority 1: Same neighborhood/area
            const aSameArea = sortAreaId && a.areaId === sortAreaId ? 1 : 0;
            const bSameArea = sortAreaId && b.areaId === sortAreaId ? 1 : 0;
            if (aSameArea !== bSameArea) return bSameArea - aSameArea;

            // Priority 2: Same city
            const aSameCity = sortCityId && a.area?.cityId === sortCityId ? 1 : 0;
            const bSameCity = sortCityId && b.area?.cityId === sortCityId ? 1 : 0;
            if (aSameCity !== bSameCity) return bSameCity - aSameCity;

            // Priority 3: Same governorate
            const aSameGov = sortGovId && a.area?.city?.governorateId === sortGovId ? 1 : 0;
            const bSameGov = sortGovId && b.area?.city?.governorateId === sortGovId ? 1 : 0;
            if (aSameGov !== bSameGov) return bSameGov - aSameGov;

            // Priority 4: Matches teacher's taught subjects
            const aMatchesSubject = teacherSubjectIds.includes(a.subjectId) ? 1 : 0;
            const bMatchesSubject = teacherSubjectIds.includes(b.subjectId) ? 1 : 0;
            if (aMatchesSubject !== bMatchesSubject) return bMatchesSubject - aMatchesSubject;

            // Priority 5: Creation date (newest first)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return response.success(res, requests);

    } catch (error) {
        next(error);
    }
};

/**
 * Get my tutor requests (parent)
 */
const getMyRequests = async (req, res, next) => {
    try {
        const parentId = req.user.parent?.id;

        if (!parentId) {
            return response.error(res, 'Parent profile not found', 404);
        }

        const requests = await prisma.tutorRequest.findMany({
            where: { parentId },
            include: {
                subject: true,
                stage: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Get contact requests count for each tutor request
        const requestsWithCounts = await Promise.all(
            requests.map(async (request) => {
                const contactCount = await prisma.contactRequest.count({
                    where: {
                        parentId,
                        subjectId: request.subjectId,
                        stageId: request.stageId
                    }
                });

                return {
                    ...request,
                    contactCount
                };
            })
        );

        return response.success(res, requestsWithCounts);

    } catch (error) {
        next(error);
    }
};

/**
 * Close tutor request (parent)
 */
const closeRequest = async (req, res, next) => {
    try {
        const parentId = req.user.parent?.id;
        const { requestId } = req.params;

        if (!parentId) {
            return response.error(res, 'Parent profile not found', 404);
        }

        const request = await prisma.tutorRequest.update({
            where: {
                id: requestId,
                parentId // Ensure ownership
            },
            data: { status: 'closed' }
        });

        return response.success(res, request, 'Request closed');

    } catch (error) {
        next(error);
    }
};

/**
 * Update tutor request (parent)
 */
const updateRequest = async (req, res, next) => {
    try {
        const parentId = req.user.parent?.id;
        const { requestId } = req.params;
        const { description, preferredLessonType, requestTarget, studyMode, budgetMin, budgetMax } = req.body;

        if (!parentId) {
            return response.error(res, 'Parent profile not found', 404);
        }

        const request = await prisma.tutorRequest.update({
            where: {
                id: requestId,
                parentId // Ensure ownership
            },
            data: {
                ...(description !== undefined && { description }),
                ...(preferredLessonType !== undefined && { preferredLessonType }),
                ...(requestTarget !== undefined && { requestTarget }),
                ...(studyMode !== undefined && { studyMode }),
                ...(budgetMin !== undefined && { budgetMin }),
                ...(budgetMax !== undefined && { budgetMax })
            },
            include: {
                subject: true,
                stage: true
            }
        });

        return response.success(res, request, 'Request updated');

    } catch (error) {
        next(error);
    }
};

/**
 * Delete tutor request (parent)
 */
const deleteRequest = async (req, res, next) => {
    try {
        const parentId = req.user.parent?.id;
        const { requestId } = req.params;

        if (!parentId) {
            return response.error(res, 'Parent profile not found', 404);
        }

        await prisma.tutorRequest.delete({
            where: {
                id: requestId,
                parentId // Ensure ownership
            }
        });

        return response.success(res, null, 'Request deleted');

    } catch (error) {
        next(error);
    }
};

// Helper function
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

module.exports = {
    createRequest,
    getTutorRequests,
    getMyRequests,
    closeRequest,
    updateRequest,
    deleteRequest
};
