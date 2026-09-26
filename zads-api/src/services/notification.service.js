const admin = require('../config/firebase');
const prisma = require('../config/database');

class NotificationService {
    /**
     * Send notification to a specific user
     * @param {string} userId - User ID
     * @param {string} title - Notification title
     * @param {string} body - Notification body
     * @param {object} data - Optional data payload
     */
    async sendToUser(userId, title, body, data = {}) {
        try {
            // Get user's FCM token
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { fcmToken: true }
            });

            if (!user || !user.fcmToken) {
                console.warn(`⚠️ User ${userId} has no FCM token. Notification skipped.`);
                return { success: false, delivered: false, reason: 'NO_FCM_TOKEN' };
            }

            if (!admin.apps || !admin.apps.length) {
                console.warn(`[NOTIFICATIONS BLOCKED] Cannot send push notification to ${userId}: Firebase credentials unconfigured.`);
                return { success: false, delivered: false, reason: 'FIREBASE_NOT_INITIALIZED' };
            }

            const message = {
                notification: { title, body },
                data: {
                    ...data,
                    click_action: 'FLUTTER_NOTIFICATION_CLICK'
                },
                token: user.fcmToken
            };

            const response = await admin.messaging().send(message);
            console.log('✅ Notification delivered via Firebase:', response);
            return { success: true, delivered: true, messageId: response };
        } catch (error) {
            console.error('❌ Error delivering notification via Firebase:', error);
            return { success: false, delivered: false, error: error.message };
        }
    }

    /**
     * Send notification to multiple users
     * @param {string[]} userIds - Array of User IDs
     * @param {string} title - Notification title
     * @param {string} body - Notification body
     * @param {object} data - Optional data payload
     */
    async sendToUsers(userIds, title, body, data = {}) {
        // Implementation for batch sending usually involves fetching all tokens
        // and using sendEachForMulticast
        // keeping it simple for now
        const results = await Promise.all(userIds.map(id => this.sendToUser(id, title, body, data)));
        return results.every(r => r === true);
    }
}

module.exports = new NotificationService();
