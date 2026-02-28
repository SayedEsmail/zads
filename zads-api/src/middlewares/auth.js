const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const prisma = require('../config/database');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                teacher: true,
                parent: true
            }
        });

        if (!user || user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Optional Authentication middleware
 * Verifies JWT token and attaches user to request if present, but doesn't block if missing
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, jwtSecret);
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                include: {
                    teacher: true,
                    parent: true
                }
            });

            if (user && user.status === 'active') {
                req.user = user;
            }
        } catch (e) {
            // ignore token errors for optional auth
        }

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Check if user is a teacher
 */
const isTeacher = (req, res, next) => {
    if (req.user.userType !== 'teacher') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Teachers only.'
        });
    }
    next();
};

/**
 * Check if user is a parent
 */
const isParent = (req, res, next) => {
    if (req.user.userType !== 'parent') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Parents only.'
        });
    }
    next();
};

/**
 * Check if user is an admin
 */
const isAdmin = (req, res, next) => {
    if (req.user.userType !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admins only.'
        });
    }
    next();
};

module.exports = { auth, optionalAuth, isTeacher, isParent, isAdmin };
