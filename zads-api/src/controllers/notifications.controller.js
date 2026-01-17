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

        const success = await notificationService.sendToUser(userId, title, body, data);

        if (success) {
            res.status(200).json({
                success: true,
                message: 'Notification sent successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send notification'
            });
        }
    } catch (error) {
        next(error);
    }
};
