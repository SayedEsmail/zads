const prisma = require('../config/database');
const notificationService = require('../services/notification.service');

/**
 * Update FCM Token for current user
 */
exports.registerToken = async (req, res, next) => {
    try {
        const { fcmToken } = req.body;
        const userId = req.user.id; // From auth middleware

        if (!fcmToken) {
            return res.status(400).json({
                success: false,
                message: 'fcmToken is required'
            });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { fcmToken }
        });

        res.status(200).json({
            success: true,
            message: 'FCM token updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Send notification (Admin only)
 */
exports.sendNotification = async (req, res, next) => {
    try {
        const { userId, title, body, data } = req.body;

        if (!userId || !title || !body) {
            return res.status(400).json({
                success: false,
                message: 'userId, title, and body are required'
            });
        }

        const result = await notificationService.sendToUser(userId, title, body, data);

        if (result.delivered) {
            return res.status(200).json({
                success: true,
                delivered: true,
                message: 'Notification delivered successfully via Firebase',
                messageId: result.messageId
            });
        }

        if (result.reason === 'NO_FCM_TOKEN') {
            return res.status(400).json({
                success: false,
                delivered: false,
                message: 'User does not have an active registered FCM device token'
            });
        }

        if (result.reason === 'FIREBASE_NOT_INITIALIZED') {
            return res.status(503).json({
                success: false,
                delivered: false,
                message: 'Push notification delivery service is unavailable (Firebase credentials not configured).'
            });
        }

        return res.status(500).json({
            success: false,
            delivered: false,
            message: 'Failed to deliver notification',
            error: result.error
        });
    } catch (error) {
        next(error);
    }
};
