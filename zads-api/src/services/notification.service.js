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
                return false;
            }

            if (!admin.apps || !admin.apps.length) {
                console.log(`[MOCK] Sending notification to ${userId}: ${title} - ${body}`);
                return true;
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
            console.log('✅ Notification sent:', response);
            return true;
        } catch (error) {
            console.error('❌ Error sending notification:', error);
            return false;
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
