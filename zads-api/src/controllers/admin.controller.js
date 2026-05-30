const prisma = require('../config/database');
const response = require('../utils/response');

/**
 * Get dashboard statistics
 */
const getDashboardStats = async (req, res, next) => {
    try {
        const [
            totalTeachers,
            activeTeachers,
            totalParents,
            totalContactRequests,
            pendingContactRequests,
            recentTeachers,
            recentParents
        ] = await Promise.all([
            prisma.teacher.count(),
            prisma.teacher.count({
                where: { user: { status: 'active' } }
            }),
            prisma.parent.count(),
            prisma.contactRequest.count(),
            prisma.contactRequest.count({
                where: { status: 'pending' }
            }),
            prisma.teacher.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            }),
            prisma.parent.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            })
        ]);

        return response.success(res, {
            teachers: {
                total: totalTeachers,
                active: activeTeachers,
                newLast7Days: recentTeachers
            },
            parents: {
                total: totalParents,
                newLast7Days: recentParents
            },
            contactRequests: {
                total: totalContactRequests,
                pending: pendingContactRequests
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get all teachers (paginated)
 */
const getAllTeachers = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        if (status) {
            where.user = { status };
        }

        if (search) {
            where.user = {
                ...where.user,
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search } }
                ]
            };
        }

        const [teachers, total] = await Promise.all([
            prisma.teacher.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                            email: true,
                            status: true,
                            avatarUrl: true,
                            createdAt: true
                        }
                    },
                    subjects: {
                        include: {
                            subject: true,
                            stage: true
                        }
                    }
                },
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.teacher.count({ where })
        ]);

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
 * Get all parents (paginated)
 */
const getAllParents = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        if (search) {
            where.user = {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search } }
                ]
            };
        }

        const [parents, total] = await Promise.all([
            prisma.parent.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                            email: true,
                            status: true,
                            createdAt: true
                        }
                    }
                },
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.parent.count({ where })
        ]);

        return response.paginated(res, parents, {
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
 * Update user status (suspend/activate)
 */
const updateUserStatus = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;

        if (!['active', 'suspended'].includes(status)) {
            return response.error(res, 'Invalid status', 400);
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { status },
            select: {
                id: true,
                name: true,
                status: true
            }
        });

        return response.success(res, user, `User ${status}`);

    } catch (error) {
        next(error);
    }
};

/**
 * Get contact requests statistics
 */
const getContactStats = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        const where = {};
        if (startDate) where.createdAt = { gte: new Date(startDate) };
        if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };

        const [total, byStatus] = await Promise.all([
            prisma.contactRequest.count({ where }),
            prisma.contactRequest.groupBy({
                by: ['status'],
                where,
                _count: true
            })
        ]);

        return response.success(res, {
            total,
            byStatus: byStatus.reduce((acc, curr) => {
                acc[curr.status] = curr._count;
                return acc;
            }, {})
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get all tutor requests (paginated)
 */
const getAllTutorRequests = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        if (status) {
            where.status = status;
        }

        if (search) {
            where.parent = {
                user: {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { phone: { contains: search } }
                    ]
                }
            };
        }

        const [requests, total] = await Promise.all([
            prisma.tutorRequest.findMany({
                where,
                include: {
                    parent: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    phone: true,
                                    avatarUrl: true
                                }
                            }
                        }
                    },
                    subject: true,
                    stage: true
                },
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.tutorRequest.count({ where })
        ]);

        return response.paginated(res, requests, {
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
 * Delete a tutor request
 */
const deleteTutorRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;

        await prisma.tutorRequest.delete({
            where: { id: requestId }
        });

        return response.success(res, null, 'Request deleted successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Toggle teacher verification status
 */
const toggleTeacherVerification = async (req, res, next) => {
    try {
        const { teacherId } = req.params;
        const { isVerified } = req.body;

        if (typeof isVerified !== 'boolean') {
            return response.error(res, 'isVerified must be a boolean', 400);
        }

        const teacher = await prisma.teacher.update({
            where: { id: teacherId },
            data: { isVerified },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        status: true
                    }
                }
            }
        });

        return response.success(res, teacher, isVerified ? 'Teacher verified' : 'Teacher unverified');

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getAllTeachers,
    getAllParents,
    updateUserStatus,
    getContactStats,
    getAllTutorRequests,
    deleteTutorRequest,
    toggleTeacherVerification
};
