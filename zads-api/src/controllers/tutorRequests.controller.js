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
        const { subjectId, stageId, areaId } = req.query;

        const where = {
            status: 'active',
            OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
            ]
        };

        if (subjectId) where.subjectId = subjectId;
        if (stageId) where.stageId = stageId;
        if (areaId) where.areaId = areaId;
        if (req.query.studyMode) where.studyMode = req.query.studyMode;
        if (req.query.requestTarget) where.requestTarget = req.query.requestTarget;

        const requests = await prisma.tutorRequest.findMany({
            where,
            include: {
                parent: {
                    include: {
                        user: { select: { name: true } }
                    }
                },
                subject: true,
                stage: true,
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

        // Proximity Sorting based on logged-in teacher's location
        const teacherAreaId = req.user?.teacher?.areaId;
        if (teacherAreaId) {
            const teacherArea = await prisma.area.findUnique({
                where: { id: teacherAreaId },
                include: { city: true }
            });

            if (teacherArea) {
                requests.sort((a, b) => {
                    // Priority 1: Same neighborhood/area
                    const aSameArea = a.areaId === teacherAreaId ? 1 : 0;
                    const bSameArea = b.areaId === teacherAreaId ? 1 : 0;
                    if (aSameArea !== bSameArea) return bSameArea - aSameArea;

                    // Priority 2: Same city
                    const aSameCity = a.area?.cityId === teacherArea.cityId ? 1 : 0;
                    const bSameCity = b.area?.cityId === teacherArea.cityId ? 1 : 0;
                    if (aSameCity !== bSameCity) return bSameCity - aSameCity;

                    // Priority 3: Same governorate
                    const aSameGov = a.area?.city?.governorateId === teacherArea.city?.governorateId ? 1 : 0;
                    const bSameGov = b.area?.city?.governorateId === teacherArea.city?.governorateId ? 1 : 0;
                    if (aSameGov !== bSameGov) return bSameGov - aSameGov;

                    // Default to creation date descending
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
            }
        }

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
