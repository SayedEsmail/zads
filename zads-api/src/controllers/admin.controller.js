const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const response = require('../utils/response');
const { normalizeEgyptianPhone, phoneRegex } = require('../utils/validators');

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
        const { page = 1, limit = 20, status, search, isVerified, areaId } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        if (status) {
            where.user = { status };
        }

        if (isVerified !== undefined && isVerified !== '') {
            where.isVerified = isVerified === 'true' || isVerified === true;
        }

        if (areaId) {
            where.areaId = areaId;
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
 * Update user profile fields (admin)
 */
const updateUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { name, phone, email, password } = req.body;

        const existing = await prisma.user.findUnique({ where: { id: userId } });
        if (!existing) {
            return response.error(res, 'User not found', 404);
        }

        if (existing.userType === 'admin') {
            return response.error(res, 'Admin accounts cannot be edited here', 403);
        }

        const data = {};

        if (name !== undefined) {
            const trimmed = String(name).trim();
            if (trimmed.length < 2) {
                return response.error(res, 'Name must be at least 2 characters', 400);
            }
            data.name = trimmed;
        }

        if (phone !== undefined) {
            const cleanPhone = normalizeEgyptianPhone(phone);
            if (!phoneRegex.test(cleanPhone)) {
                return response.error(res, 'Invalid Egyptian phone number', 400);
            }
            const phoneOwner = await prisma.user.findUnique({ where: { phone: cleanPhone } });
            if (phoneOwner && phoneOwner.id !== userId) {
                return response.error(res, 'Phone number already registered', 409);
            }
            data.phone = cleanPhone;
        }

        if (email !== undefined) {
            const normalizedEmail = email === null || email === '' ? null : String(email).trim().toLowerCase();
            if (normalizedEmail) {
                const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
                if (!emailOk) {
                    return response.error(res, 'Invalid email address', 400);
                }
                const emailOwner = await prisma.user.findUnique({ where: { email: normalizedEmail } });
                if (emailOwner && emailOwner.id !== userId) {
                    return response.error(res, 'Email already registered', 409);
                }
            }
            data.email = normalizedEmail;
        }

        if (password !== undefined && password !== null && password !== '') {
            if (String(password).length < 6) {
                return response.error(res, 'Password must be at least 6 characters', 400);
            }
            data.passwordHash = await bcrypt.hash(String(password), 10);
        }

        if (Object.keys(data).length === 0) {
            return response.error(res, 'No fields to update', 400);
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                status: true,
                userType: true,
                avatarUrl: true
            }
        });

        return response.success(res, user, 'User updated successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Permanently delete a teacher or client account (admin)
 */
const deleteUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const existing = await prisma.user.findUnique({ where: { id: userId } });
        if (!existing) {
            return response.error(res, 'User not found', 404);
        }

        if (existing.userType === 'admin') {
            return response.error(res, 'Admin accounts cannot be deleted', 403);
        }

        if (req.user?.id && req.user.id === userId) {
            return response.error(res, 'You cannot delete your own account', 403);
        }

        await prisma.user.delete({ where: { id: userId } });

        return response.success(res, { id: userId }, 'User deleted successfully');
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
        const { isVerified, verificationNotes } = req.body;

        if (typeof isVerified !== 'boolean') {
            return response.error(res, 'isVerified must be a boolean', 400);
        }

        const adminId = req.user?.id || 'admin';
        const teacher = await prisma.teacher.update({
            where: { id: teacherId },
            data: {
                isVerified,
                verifiedAt: isVerified ? new Date() : null,
                verifiedBy: isVerified ? adminId : null,
                ...(verificationNotes !== undefined ? { verificationNotes } : {})
            },
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

/**
 * Get all contact requests (paginated with filters for admin)
 */
const getAllContactRequests = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            search,
            initiatedBy,
            startDate,
            endDate
        } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        if (status) {
            where.status = status;
        }

        if (initiatedBy) {
            where.initiatedBy = initiatedBy;
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { teacher: { user: { name: { contains: search, mode: 'insensitive' } } } },
                { teacher: { user: { phone: { contains: search } } } },
                { parent: { user: { name: { contains: search, mode: 'insensitive' } } } },
                { parent: { user: { phone: { contains: search } } } }
            ];
        }

        const [contactRequests, total] = await Promise.all([
            prisma.contactRequest.findMany({
                where,
                include: {
                    teacher: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    phone: true,
                                    email: true,
                                    avatarUrl: true,
                                    status: true
                                }
                            }
                        }
                    },
                    parent: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    phone: true,
                                    email: true,
                                    avatarUrl: true,
                                    status: true
                                }
                            }
                        }
                    },
                    subject: true,
                    stage: true,
                    tutorRequest: true
                },
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.contactRequest.count({ where })
        ]);

        return response.paginated(res, contactRequests, {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit))
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getAllTeachers,
    getAllParents,
    updateUserStatus,
    updateUser,
    deleteUser,
    getContactStats,
    getAllContactRequests,
    getAllTutorRequests,
    deleteTutorRequest,
    toggleTeacherVerification
};
