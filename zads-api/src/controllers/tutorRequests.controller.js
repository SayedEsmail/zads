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
            budgetMin,
            budgetMax,
            latitude,
            longitude
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
                budgetMin,
                budgetMax,
                latitude,
                longitude,
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
        const { subjectId, stageId, latitude, longitude, radiusKm = 20 } = req.query;

        const where = {
            status: 'active',
            expiresAt: { gt: new Date() }
        };

        if (subjectId) where.subjectId = subjectId;
        if (stageId) where.stageId = stageId;

        let requests = await prisma.tutorRequest.findMany({
            where,
            include: {
                parent: {
                    include: {
                        user: { select: { name: true } }
                    }
                },
                subject: true,
                stage: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Filter by location if provided
        if (latitude && longitude) {
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            const radius = parseFloat(radiusKm);

            requests = requests.filter(req => {
                if (!req.latitude || !req.longitude) return true;
                const distance = calculateDistance(
                    lat, lng,
                    parseFloat(req.latitude),
                    parseFloat(req.longitude)
                );
                return distance <= radius;
            });
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
        const { description, preferredLessonType, budgetMin, budgetMax } = req.body;

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
