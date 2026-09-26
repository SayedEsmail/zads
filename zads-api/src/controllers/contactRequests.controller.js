const prisma = require('../config/database');
const response = require('../utils/response');

/**
 * Create contact request (parent to teacher)
 */
const createRequest = async (req, res, next) => {
    try {
        const parentId = req.user.parent?.id;
        const {
            teacherId,
            subjectId,
            stageId,
            message,
            studyMode,
            teachingPlace,
            preferredTime,
            tutorRequestId
        } = req.body;

        if (!parentId) {
            return response.error(res, 'Parent profile not found', 404);
        }

        if (!teacherId) {
            return response.error(res, 'Teacher ID is required', 400);
        }

        // Validate teacher exists and is active
        const teacher = await prisma.teacher.findFirst({
            where: {
                id: teacherId,
                user: { status: 'active' }
            }
        });

        if (!teacher) {
            return response.error(res, 'Teacher not found or inactive', 404);
        }

        // Idempotency: Prevent duplicate pending requests for same parent + teacher + subject
        const existingPending = await prisma.contactRequest.findFirst({
            where: {
                parentId,
                teacherId,
                subjectId: subjectId || null,
                status: 'pending'
            }
        });

        if (existingPending) {
            return response.error(res, 'A pending contact request already exists for this teacher and subject', 409);
        }

        const contactRequest = await prisma.contactRequest.create({
            data: {
                parentId,
                teacherId,
                subjectId: subjectId || null,
                stageId: stageId || null,
                message: message || null,
                studyMode: studyMode || null,
                teachingPlace: teachingPlace || null,
                preferredTime: preferredTime || null,
                tutorRequestId: tutorRequestId || null,
                initiatedBy: 'parent',
                status: 'pending'
            },
            include: {
                teacher: {
                    include: {
                        user: { select: { id: true, name: true, avatarUrl: true } }
                    }
                },
                subject: true,
                stage: true
            }
        });

        return response.created(res, contactRequest, 'Contact request sent successfully');

    } catch (error) {
        next(error);
    }
};

/**
 * Create contact request (teacher to parent/client in response to tutor request)
 */
const createRequestAsTeacher = async (req, res, next) => {
    try {
        const teacherId = req.user.teacher?.id;
        const {
            parentId,
            subjectId,
            stageId,
            message,
            studyMode,
            teachingPlace,
            preferredTime,
            tutorRequestId
        } = req.body;

        if (!teacherId) {
            return response.error(res, 'Teacher profile not found', 404);
        }

        if (!parentId) {
            return response.error(res, 'Parent ID is required', 400);
        }

        // Validate parent exists and is active
        const parent = await prisma.parent.findFirst({
            where: {
                id: parentId,
                user: { status: 'active' }
            }
        });

        if (!parent) {
            return response.error(res, 'Parent not found or inactive', 404);
        }

        // Idempotency: Prevent duplicate pending requests
        const existingPending = await prisma.contactRequest.findFirst({
            where: {
                parentId,
                teacherId,
                subjectId: subjectId || null,
                status: 'pending'
            }
        });

        if (existingPending) {
            return response.error(res, 'A pending contact request already exists for this parent and subject', 409);
        }

        const contactRequest = await prisma.contactRequest.create({
            data: {
                parentId,
                teacherId,
                subjectId: subjectId || null,
                stageId: stageId || null,
                message: message || null,
                studyMode: studyMode || null,
                teachingPlace: teachingPlace || null,
                preferredTime: preferredTime || null,
                tutorRequestId: tutorRequestId || null,
                initiatedBy: 'teacher',
                status: 'pending'
            },
            include: {
                parent: {
                    include: {
                        user: { select: { id: true, name: true, avatarUrl: true } }
                    }
                },
                subject: true,
                stage: true
            }
        });

        return response.created(res, contactRequest, 'Contact request sent to parent');

    } catch (error) {
        next(error);
    }
};

/**
 * Get my contact requests (for parent/client)
 * Phone privacy: phone is ONLY revealed if status === 'accepted'
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
                        user: { select: { id: true, name: true, phone: true, avatarUrl: true } }
                    }
                },
                subject: true,
                stage: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Privacy: phone is only revealed when status is accepted
        const sanitized = requests.map(reqItem => {
            const data = { ...reqItem };
            if (data.status !== 'accepted' && data.teacher?.user) {
                data.teacher = {
                    ...data.teacher,
                    user: {
                        ...data.teacher.user,
                        phone: null
                    }
                };
            }
            return data;
        });

        return response.success(res, sanitized);

    } catch (error) {
        next(error);
    }
};

/**
 * Get incoming requests (for teacher)
 * Phone privacy: phone is ONLY revealed if status === 'accepted'
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
                        user: { select: { id: true, name: true, phone: true, avatarUrl: true } }
                    }
                },
                subject: true,
                stage: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Privacy: phone is only revealed when status is accepted
        const sanitized = requests.map(reqItem => {
            const data = { ...reqItem };
            if (data.status !== 'accepted' && data.parent?.user) {
                data.parent = {
                    ...data.parent,
                    user: {
                        ...data.parent.user,
                        phone: null
                    }
                };
            }
            return data;
        });

        return response.success(res, sanitized);

    } catch (error) {
        next(error);
    }
};

/**
 * Update request status (teacher accepts/rejects parent-initiated request)
 */
const updateRequestStatus = async (req, res, next) => {
    try {
        const teacherId = req.user.teacher?.id;
        const { requestId } = req.params;
        const { status, replyMessage } = req.body;

        if (!teacherId) {
            return response.error(res, 'Teacher profile not found', 404);
        }

        if (!status || !['accepted', 'rejected'].includes(status)) {
            return response.error(res, 'Invalid status. Must be accepted or rejected', 400);
        }

        const existing = await prisma.contactRequest.findFirst({
            where: {
                id: requestId,
                teacherId
            }
        });

        if (!existing) {
            return response.error(res, 'Contact request not found', 404);
        }

        // Initiator cannot accept/reject their own request
        if (existing.initiatedBy === 'teacher') {
            return response.error(res, 'You cannot accept or reject a request that you initiated', 403);
        }

        // State Machine: Can only transition from pending
        if (existing.status !== 'pending') {
            return response.error(res, `Cannot change status of a request that is already ${existing.status}`, 400);
        }

        const updated = await prisma.contactRequest.update({
            where: { id: requestId },
            data: {
                status,
                ...(replyMessage !== undefined && { replyMessage })
            },
            include: {
                parent: {
                    include: {
                        user: { select: { id: true, name: true, phone: true, avatarUrl: true } }
                    }
                },
                subject: true,
                stage: true
            }
        });

        // If rejected, keep phone hidden
        if (status !== 'accepted' && updated.parent?.user) {
            updated.parent.user.phone = null;
        }

        return response.success(res, updated, `Request ${status} successfully`);

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

        const existing = await prisma.contactRequest.findFirst({
            where: {
                id: requestId,
                parentId
            }
        });

        if (!existing) {
            return response.error(res, 'Contact request not found', 404);
        }

        if (existing.status !== 'pending') {
            return response.error(res, 'Cannot edit message for a request that has already been resolved', 400);
        }

        const updated = await prisma.contactRequest.update({
            where: { id: requestId },
            data: {
                ...(message !== undefined && { message })
            }
        });

        return response.success(res, updated, 'Request message updated');

    } catch (error) {
        next(error);
    }
};

/**
 * Update request status by parent (accept/reject teacher-initiated request)
 */
const updateRequestStatusAsParent = async (req, res, next) => {
    try {
        const parentId = req.user.parent?.id;
        const { requestId } = req.params;
        const { status, replyMessage } = req.body;

        if (!parentId) {
            return response.error(res, 'Parent profile not found', 404);
        }

        if (!status || !['accepted', 'rejected'].includes(status)) {
            return response.error(res, 'Invalid status. Must be accepted or rejected', 400);
        }

        const existing = await prisma.contactRequest.findFirst({
            where: {
                id: requestId,
                parentId
            }
        });

        if (!existing) {
            return response.error(res, 'Contact request not found', 404);
        }

        // Initiator cannot accept/reject their own request
        if (existing.initiatedBy !== 'teacher') {
            return response.error(res, 'You cannot accept or reject a request that you initiated', 403);
        }

        // State Machine: Can only transition from pending
        if (existing.status !== 'pending') {
            return response.error(res, `Cannot change status of a request that is already ${existing.status}`, 400);
        }

        const updated = await prisma.contactRequest.update({
            where: { id: requestId },
            data: {
                status,
                ...(replyMessage !== undefined && { replyMessage })
            },
            include: {
                teacher: {
                    include: {
                        user: { select: { id: true, name: true, phone: true, avatarUrl: true } }
                    }
                },
                subject: true,
                stage: true
            }
        });

        // If rejected, keep phone hidden
        if (status !== 'accepted' && updated.teacher?.user) {
            updated.teacher.user.phone = null;
        }

        return response.success(res, updated, `Request ${status} by parent`);

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
