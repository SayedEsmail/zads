const prisma = require('../config/database');
const response = require('../utils/response');

/**
 * Create contact request (parent to teacher)
 */
const createRequest = async (req, res, next) => {
    try {
        const parentId = req.user.parent?.id;
        const { teacherId, subjectId, stageId, message } = req.body;

        if (!parentId) {
            return response.error(res, 'Parent profile not found', 404);
        }

        const contactRequest = await prisma.contactRequest.create({
            data: {
                parentId,
                teacherId,
                subjectId,
                stageId,
                message
            },
            include: {
                teacher: {
                    include: {
                        user: { select: { name: true } }
                    }
                }
            }
        });

        // TODO: Send push notification to teacher

        return response.created(res, contactRequest, 'Contact request sent');

    } catch (error) {
        next(error);
    }
};

/**
 * Create contact request (teacher to parent/client)
 */
const createRequestAsTeacher = async (req, res, next) => {
    try {
        const teacherId = req.user.teacher?.id;
        const { parentId, subjectId, stageId, message } = req.body;

        if (!teacherId) {
            return response.error(res, 'Teacher profile not found', 404);
        }

        const contactRequest = await prisma.contactRequest.create({
            data: {
                parentId,
                teacherId,
                subjectId,
                stageId,
                message,
                initiatedBy: 'teacher'
            },
            include: {
                parent: {
                    include: {
                        user: { select: { name: true } }
                    }
                }
            }
        });

        return response.created(res, contactRequest, 'Contact request sent to parent');

    } catch (error) {
        next(error);
    }
};

/**
 * Get my contact requests (for parent)
 */
const getMyRequestsAsParent = async (req, res, next) => {
    try {
        const parentId = req.user.parent?.id;

        if (!parentId) {
            return response.error(res, 'Parent profile not found', 404);
        }

        const requests = await prisma.contactRequest.findMany({
            where: { parentId },
            include: {
                teacher: {
                    include: {
                        user: { select: { name: true, phone: true, avatarUrl: true } }
                    }
                },
                subject: true,
                stage: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return response.success(res, requests);

    } catch (error) {
        next(error);
    }
};

/**
 * Get incoming requests (for teacher)
 */
const getIncomingRequests = async (req, res, next) => {
    try {
        const teacherId = req.user.teacher?.id;

        if (!teacherId) {
            return response.error(res, 'Teacher profile not found', 404);
        }

        const { status } = req.query;

        const requests = await prisma.contactRequest.findMany({
            where: {
                teacherId,
                ...(status && { status })
            },
            include: {
                parent: {
                    include: {
                        user: { select: { name: true, phone: true, avatarUrl: true } }
                    }
                },
                subject: true,
                stage: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return response.success(res, requests);

    } catch (error) {
        next(error);
    }
};

/**
 * Update request status (teacher accepts/rejects)
 */
const updateRequestStatus = async (req, res, next) => {
    try {
        const teacherId = req.user.teacher?.id;
        const { requestId } = req.params;
        const { status, replyMessage } = req.body;

        if (!teacherId) {
            return response.error(res, 'Teacher profile not found', 404);
        }

        if (status && !['accepted', 'rejected'].includes(status)) {
            return response.error(res, 'Invalid status', 400);
        }

        const request = await prisma.contactRequest.update({
            where: {
                id: requestId,
                teacherId // Ensure ownership
            },
            data: { 
                ...(status && { status }),
                ...(replyMessage !== undefined && { replyMessage })
            }
        });

        // TODO: Send push notification to parent

        return response.success(res, request, `Request status updated`);

    } catch (error) {
        next(error);
    }
};

/**
 * Update request message by parent (client)
 */
const updateRequestMessage = async (req, res, next) => {
    try {
        const parentId = req.user.parent?.id;
        const { requestId } = req.params;
        const { message } = req.body;

        if (!parentId) {
            return response.error(res, 'Parent profile not found', 404);
        }

        const request = await prisma.contactRequest.update({
            where: {
                id: requestId,
                parentId // Ensure ownership
            },
            data: { 
                ...(message !== undefined && { message })
            }
        });

        return response.success(res, request, `Request message updated`);

    } catch (error) {
        next(error);
    }
};

/**
 * Update request status by parent (accept/reject teacher initiated request)
 */
const updateRequestStatusAsParent = async (req, res, next) => {
    try {
        const parentId = req.user.parent?.id;
        const { requestId } = req.params;
        const { status, replyMessage } = req.body;

        if (!parentId) {
            return response.error(res, 'Parent profile not found', 404);
        }

        if (status && !['accepted', 'rejected'].includes(status)) {
            return response.error(res, 'Invalid status', 400);
        }

        const request = await prisma.contactRequest.update({
            where: {
                id: requestId,
                parentId // Ensure ownership
            },
            data: { 
                ...(status && { status }),
                ...(replyMessage !== undefined && { replyMessage })
            }
        });

        return response.success(res, request, `Request status updated by parent`);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createRequest,
    createRequestAsTeacher,
    getMyRequestsAsParent,
    getIncomingRequests,
    updateRequestStatus,
    updateRequestMessage,
    updateRequestStatusAsParent
};
