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

        const idempotencyKey = req.headers['idempotency-key'] || req.body.idempotencyKey || null;

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

        // 1. Idempotency Key check: if an existing request has this exact key, return it immediately
        if (idempotencyKey) {
            const existingByKey = await prisma.contactRequest.findFirst({
                where: { idempotencyKey },
                include: {
                    teacher: {
                        include: { user: { select: { id: true, name: true, avatarUrl: true } } }
                    },
                    subject: true,
                    stage: true
                }
            });
            if (existingByKey) {
                return response.success(res, existingByKey, 'Contact request returned (idempotent retry)', 200);
            }
        }

        // 2. Pending duplicate check & lost-response retry handling
        const existingPending = await prisma.contactRequest.findFirst({
            where: {
                parentId,
                teacherId,
                subjectId: subjectId || null,
                status: 'pending'
            },
            include: {
                teacher: {
                    include: { user: { select: { id: true, name: true, avatarUrl: true } } }
                },
                subject: true,
                stage: true
            }
        });

        if (existingPending) {
            // If the client sent an idempotency key or marked as retry, return the pending request gracefully
            if (idempotencyKey || req.body.isRetry) {
                return response.success(res, existingPending, 'Contact request returned (idempotent retry)', 200);
            }
            return response.error(res, 'A pending contact request already exists for this teacher and subject', 409);
        }

        let contactRequest;
        try {
            contactRequest = await prisma.contactRequest.create({
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
                    status: 'pending',
                    idempotencyKey
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
        } catch (createErr) {
            // Handle concurrent duplicate insertion race condition (Prisma P2002)
            if (createErr.code === 'P2002') {
                const winning = await prisma.contactRequest.findFirst({
                    where: {
                        parentId,
                        teacherId,
                        status: 'pending'
                    },
                    include: {
                        teacher: {
                            include: { user: { select: { id: true, name: true, avatarUrl: true } } }
                        },
                        subject: true,
                        stage: true
                    }
                });
                if (winning) {
                    return response.success(res, winning, 'Contact request created (concurrent duplicate resolved)', 200);
                }
            }
            throw createErr;
        }

        // Authoritative server-side analytics logging (NO sensitive PII)
        try {
            await prisma.platformEvent.create({
                data: {
                    eventType: 'contact_request_create',
                    userId: req.user.id,
                    entityId: contactRequest.id,
                    metadata: {
                        teacherId,
                        initiatedBy: 'parent',
                        studyMode: studyMode || null,
                        hasSubject: !!subjectId,
                        hasStage: !!stageId
                    }
                }
            });
        } catch (analyticsErr) {
            console.warn('[ANALYTICS] event log error:', analyticsErr.message);
        }

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

        const idempotencyKey = req.headers['idempotency-key'] || req.body.idempotencyKey || null;

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

        // 1. Idempotency Key check
        if (idempotencyKey) {
            const existingByKey = await prisma.contactRequest.findFirst({
                where: { idempotencyKey },
                include: {
                    parent: {
                        include: { user: { select: { id: true, name: true, avatarUrl: true } } }
                    },
                    subject: true,
                    stage: true
                }
            });
            if (existingByKey) {
                return response.success(res, existingByKey, 'Contact request returned (idempotent retry)', 200);
            }
        }

        // 2. Pending duplicate check & lost-response retry handling
        const existingPending = await prisma.contactRequest.findFirst({
            where: {
                parentId,
                teacherId,
                subjectId: subjectId || null,
                status: 'pending'
            },
            include: {
                parent: {
                    include: { user: { select: { id: true, name: true, avatarUrl: true } } }
                },
                subject: true,
                stage: true
            }
        });

        if (existingPending) {
            if (idempotencyKey || req.body.isRetry) {
                return response.success(res, existingPending, 'Contact request returned (idempotent retry)', 200);
            }
            return response.error(res, 'A pending contact request already exists for this parent and subject', 409);
        }

        let contactRequest;
        try {
            contactRequest = await prisma.contactRequest.create({
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
                    status: 'pending',
                    idempotencyKey
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
        } catch (createErr) {
            if (createErr.code === 'P2002') {
                const winning = await prisma.contactRequest.findFirst({
                    where: {
                        parentId,
                        teacherId,
                        status: 'pending'
                    },
                    include: {
                        parent: {
                            include: { user: { select: { id: true, name: true, avatarUrl: true } } }
                        },
                        subject: true,
                        stage: true
                    }
                });
                if (winning) {
                    return response.success(res, winning, 'Contact request created (concurrent duplicate resolved)', 200);
                }
            }
            throw createErr;
        }

        // Authoritative server-side analytics logging (NO sensitive PII)
        try {
            await prisma.platformEvent.create({
                data: {
                    eventType: 'contact_request_create',
                    userId: req.user.id,
                    entityId: contactRequest.id,
                    metadata: {
                        parentId,
                        initiatedBy: 'teacher',
                        studyMode: studyMode || null,
                        hasSubject: !!subjectId,
                        hasStage: !!stageId
                    }
                }
            });
        } catch (analyticsErr) {
            console.warn('[ANALYTICS] event log error:', analyticsErr.message);
        }

        return response.created(res, contactRequest, 'Contact request sent to client successfully');

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

        // Recipient-only atomic transition: only update if currently pending and recipient is teacher
        const updateResult = await prisma.contactRequest.updateMany({
            where: {
                id: requestId,
                teacherId,
                status: 'pending',
                initiatedBy: 'parent'
            },
            data: {
                status,
                ...(replyMessage !== undefined && { replyMessage })
            }
        });

        if (updateResult.count === 0) {
            const existing = await prisma.contactRequest.findUnique({
                where: { id: requestId }
            });

            if (!existing) {
                return response.error(res, 'Contact request not found', 404);
            }
            if (existing.teacherId !== teacherId) {
                return response.error(res, 'You do not have permission to update this request', 403);
            }
            if (existing.initiatedBy === 'teacher') {
                return response.error(res, 'You cannot accept or reject a request that you initiated', 403);
            }
            if (existing.status !== 'pending') {
                return response.error(res, `Cannot change status of a request that is already ${existing.status}`, 409);
            }
            return response.error(res, 'Could not transition request', 400);
        }

        const updated = await prisma.contactRequest.findUnique({
            where: { id: requestId },
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

        // Authoritative server-side analytics logging
        try {
            await prisma.platformEvent.create({
                data: {
                    eventType: 'contact_request_transition',
                    userId: req.user.id,
                    entityId: requestId,
                    metadata: {
                        newStatus: status,
                        previousStatus: 'pending',
                        transitionedBy: 'teacher'
                    }
                }
            });
        } catch (analyticsErr) {
            console.warn('[ANALYTICS] event log error:', analyticsErr.message);
        }

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

        // Recipient-only atomic transition: only update if currently pending and recipient is parent
        const updateResult = await prisma.contactRequest.updateMany({
            where: {
                id: requestId,
                parentId,
                status: 'pending',
                initiatedBy: 'teacher'
            },
            data: {
                status,
                ...(replyMessage !== undefined && { replyMessage })
            }
        });

        if (updateResult.count === 0) {
            const existing = await prisma.contactRequest.findUnique({
                where: { id: requestId }
            });

            if (!existing) {
                return response.error(res, 'Contact request not found', 404);
            }
            if (existing.parentId !== parentId) {
                return response.error(res, 'You do not have permission to update this request', 403);
            }
            if (existing.initiatedBy === 'parent') {
                return response.error(res, 'You cannot accept or reject a request that you initiated', 403);
            }
            if (existing.status !== 'pending') {
                return response.error(res, `Cannot change status of a request that is already ${existing.status}`, 409);
            }
            return response.error(res, 'Could not transition request', 400);
        }

        const updated = await prisma.contactRequest.findUnique({
            where: { id: requestId },
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

        // Authoritative server-side analytics logging
        try {
            await prisma.platformEvent.create({
                data: {
                    eventType: 'contact_request_transition',
                    userId: req.user.id,
                    entityId: requestId,
                    metadata: {
                        newStatus: status,
                        previousStatus: 'pending',
                        transitionedBy: 'parent'
                    }
                }
            });
        } catch (analyticsErr) {
            console.warn('[ANALYTICS] event log error:', analyticsErr.message);
        }

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
