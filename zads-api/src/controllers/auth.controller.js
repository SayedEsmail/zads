const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { jwtSecret, jwtExpiresIn } = require('../config/env');
const response = require('../utils/response');
const { normalizeEgyptianPhone } = require('../utils/validators');

/**
 * Register a new teacher
 */
const registerTeacher = async (req, res, next) => {
    try {
        const {
            phone,
            password,
            name,
            email,
            bio,
            experienceYears,
            qualification,
            areaId,
            lessonTypes
        } = req.body;

        const cleanPhone = normalizeEgyptianPhone(phone);

        // Check if phone already exists
        const existingUser = await prisma.user.findUnique({
            where: { phone: cleanPhone }
        });

        if (existingUser) {
            return response.error(res, 'Phone number already registered', 409);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user and teacher in transaction
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    phone: cleanPhone,
                    passwordHash,
                    name,
                    email,
                    userType: 'teacher'
                }
            });

            const teacher = await tx.teacher.create({
                data: {
                    userId: user.id,
                    bio,
                    experienceYears,
                    qualification,
                    areaId,
                    lessonTypes: lessonTypes || ['at_teacher', 'at_student']
                }
            });

            return { user, teacher };
        });

        // Generate JWT
        const token = jwt.sign(
            { userId: result.user.id, userType: 'teacher' },
            jwtSecret,
            { expiresIn: jwtExpiresIn }
        );

        return response.created(res, {
            user: {
                id: result.user.id,
                phone: result.user.phone,
                name: result.user.name,
                email: result.user.email,
                userType: result.user.userType
            },
            teacher: {
                id: result.teacher.id,
                areaId: result.teacher.areaId
            },
            token
        }, 'Teacher registered successfully');

    } catch (error) {
        next(error);
    }
};

/**
 * Register a new parent
 */
const registerParent = async (req, res, next) => {
    try {
        const { phone, password, name, email, areaId, clientAccountKind } = req.body;
        const cleanPhone = normalizeEgyptianPhone(phone);

        // Check if phone already exists
        const existingUser = await prisma.user.findUnique({
            where: { phone: cleanPhone }
        });

        if (existingUser) {
            return response.error(res, 'Phone number already registered', 409);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user and parent in transaction
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    phone: cleanPhone,
                    passwordHash,
                    name,
                    email,
                    userType: 'parent'
                }
            });

            const parent = await tx.parent.create({
                data: {
                    userId: user.id,
                    areaId,
                    ...(clientAccountKind && { clientAccountKind })
                }
            });

            return { user, parent };
        });

        // Generate JWT
        const token = jwt.sign(
            { userId: result.user.id, userType: 'parent' },
            jwtSecret,
            { expiresIn: jwtExpiresIn }
        );

        return response.created(res, {
            user: {
                id: result.user.id,
                phone: result.user.phone,
                name: result.user.name,
                email: result.user.email,
                userType: result.user.userType
            },
            parent: {
                id: result.parent.id,
                areaId: result.parent.areaId,
                clientAccountKind: result.parent.clientAccountKind
            },
            token
        }, 'Parent registered successfully');

    } catch (error) {
        next(error);
    }
};

/**
 * Login user (teacher or parent)
 */
const login = async (req, res, next) => {
    try {
        const { phone, email, password } = req.body;

        // Find user
        let user;
        const searchPhone = (phone && phone !== 'undefined') ? normalizeEgyptianPhone(phone) : null;
        const searchEmail = (email && email !== 'undefined') ? email : null;

        if (searchPhone) {
            user = await prisma.user.findUnique({
                where: { phone: searchPhone },
                include: {
                    teacher: true,
                    parent: true
                }
            });
        } else if (searchEmail) {
            user = await prisma.user.findUnique({
                where: { email: searchEmail },
                include: {
                    teacher: true,
                    parent: true
                }
            });
        }

        if (!user) {
            return response.error(res, 'Invalid phone or password', 401);
        }

        if (user.status !== 'active') {
            return response.error(res, 'Account is suspended', 403);
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isValidPassword) {
            return response.error(res, 'Invalid phone or password', 401);
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, userType: user.userType },
            jwtSecret,
            { expiresIn: jwtExpiresIn }
        );

        return response.success(res, {
            user: {
                id: user.id,
                phone: user.phone,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                userType: user.userType
            },
            teacher: user.teacher,
            parent: user.parent,
            token
        }, 'Login successful');

    } catch (error) {
        next(error);
    }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res, next) => {
    try {
        const user = req.user;

        return response.success(res, {
            user: {
                id: user.id,
                phone: user.phone,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                userType: user.userType
            },
            teacher: user.teacher,
            parent: user.parent
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Update FCM token for push notifications
 */
const updateFcmToken = async (req, res, next) => {
    try {
        const { fcmToken } = req.body;

        await prisma.user.update({
            where: { id: req.user.id },
            data: { fcmToken }
        });

        return response.success(res, null, 'FCM token updated');

    } catch (error) {
        next(error);
    }
};

/**
 * Update current user profile (name, phone, password, email)
 */
const updateProfile = async (req, res, next) => {
    try {
        const { name, email, avatarUrl, phone, password, currentPassword } = req.body;
        const userId = req.user.id;
        const cleanPhone = phone ? normalizeEgyptianPhone(phone) : undefined;

        // Check if phone is being updated and if it belongs to someone else
        if (cleanPhone && cleanPhone !== req.user.phone) {
            const existingUser = await prisma.user.findUnique({
                where: { phone: cleanPhone }
            });
            if (existingUser) {
                return response.error(res, 'Phone number already registered', 409);
            }
        }

        const dataToUpdate = {
            ...(name && { name }),
            ...(email !== undefined && { email }),
            ...(avatarUrl !== undefined && { avatarUrl }),
            ...(cleanPhone && { phone: cleanPhone }),
        };

        if (password) {
            if (!currentPassword) {
                return response.error(res, 'Current password is required to change password', 400);
            }
            const isMatch = await bcrypt.compare(currentPassword, req.user.passwordHash);
            if (!isMatch) {
                return response.error(res, 'Current password is incorrect', 401);
            }
            dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate,
            include: {
                teacher: true,
                parent: true
            }
        });

        return response.success(res, {
            user: {
                id: updatedUser.id,
                phone: updatedUser.phone,
                name: updatedUser.name,
                email: updatedUser.email,
                avatarUrl: updatedUser.avatarUrl,
                userType: updatedUser.userType
            },
            teacher: updatedUser.teacher,
            parent: updatedUser.parent
        }, 'Profile updated successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerTeacher,
    registerParent,
    login,
    getProfile,
    updateFcmToken,
    updateProfile
};
