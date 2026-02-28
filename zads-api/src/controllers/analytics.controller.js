const prisma = require('../config/database');
const response = require('../utils/response');

/**
 * Log a WhatsApp click event
 */
const logWhatsAppClick = async (req, res, next) => {
    try {
        const { teacherId } = req.body;
        const parentId = req.user?.parent?.id; // Optional, might be from an authenticated parent

        if (!teacherId) {
            return response.error(res, 'Teacher ID is required', 400);
        }

        const click = await prisma.whatsAppClick.create({
            data: {
                teacherId,
                parentId: parentId || null
            }
        });

        return response.created(res, click, 'WhatsApp click logged');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    logWhatsAppClick
};
