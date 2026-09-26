const crypto = require('crypto');
const prisma = require('../config/database');
const response = require('../utils/response');

// Helper to recursively sanitize metadata and strip any sensitive PII at all depths
const sanitizeMetadata = (val) => {
    if (val === null || val === undefined) return val;
    if (Array.isArray(val)) {
        return val.map(item => sanitizeMetadata(item));
    }
    if (typeof val === 'object') {
        const clean = {};
        const forbidden = ['phone', 'password', 'token', 'email', 'secret', 'childname', 'message', 'child', 'cert'];
        for (const [key, v] of Object.entries(val)) {
            if (forbidden.some(f => key.toLowerCase().includes(f))) {
                continue; // strip key
            }
            clean[key] = sanitizeMetadata(v);
        }
        return clean;
    }
    if (typeof val === 'string') {
        const trimmed = val.trim();
        // Redact values that look like phone numbers or emails
        if (/^(\+20|0020|20)?0?1[0125][0-9]{8}$/.test(trimmed) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            return '[REDACTED]';
        }
    }
    return val;
};

/**
 * Generic event logger with deduplication & PII protection
 */
const logEvent = async (req, res, next) => {
    try {
        const { eventType, entityId, metadata, sessionId } = req.body;
        if (!eventType) {
            return response.error(res, 'eventType is required', 400);
        }

        const cleanMeta = sanitizeMetadata(metadata);
        const userId = req.user?.id || null;

        // Deduplication: 1-minute bucket per sessionId/IP + eventType + entityId
        const bucket = Math.floor(Date.now() / 60000);
        const rawKey = `${sessionId || req.ip}_${eventType}_${entityId || ''}_${bucket}`;
        const dedupKey = crypto.createHash('sha256').update(rawKey).digest('hex');

        try {
            const event = await prisma.platformEvent.create({
                data: {
                    eventType,
                    sessionId: sessionId || null,
                    userId,
                    entityId: entityId || null,
                    metadata: cleanMeta,
                    dedupKey
                }
            });
            return response.created(res, event, 'Event logged');
        } catch (dbErr) {
            if (dbErr.code === 'P2002') {
                return response.success(res, { deduplicated: true }, 'Event deduplicated', 200);
            }
            throw dbErr;
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Log Attribution (UTM parameters on arrival)
 */
const logAttribution = async (req, res, next) => {
    try {
        const { utmSource, utmMedium, utmCampaign, utmTerm, landingPage, sessionId } = req.body;
        const metadata = sanitizeMetadata({ utmSource, utmMedium, utmCampaign, utmTerm, landingPage });
        
        const bucket = Math.floor(Date.now() / 300000); // 5-minute bucket for attribution
        const rawKey = `attr_${sessionId || req.ip}_${utmSource || ''}_${utmCampaign || ''}_${bucket}`;
        const dedupKey = crypto.createHash('sha256').update(rawKey).digest('hex');

        try {
            const event = await prisma.platformEvent.create({
                data: {
                    eventType: 'attribution',
                    sessionId: sessionId || null,
                    userId: req.user?.id || null,
                    metadata,
                    dedupKey
                }
            });
            return response.created(res, event, 'Attribution logged');
        } catch (dbErr) {
            if (dbErr.code === 'P2002') {
                return response.success(res, { deduplicated: true }, 'Attribution deduplicated', 200);
            }
            throw dbErr;
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Log Authorized Contact Click
 */
const logAuthorizedContactClick = async (req, res, next) => {
    try {
        const { requestId, channel } = req.body; // channel: 'whatsapp' | 'phone'
        if (!requestId) {
            return response.error(res, 'requestId is required', 400);
        }

        // Verify request is actually accepted and caller is a participant
        const contactReq = await prisma.contactRequest.findUnique({
            where: { id: requestId },
            include: {
                parent: { select: { userId: true } },
                teacher: { select: { userId: true } }
            }
        });

        if (!contactReq) {
            return response.error(res, 'Contact request not found', 404);
        }

        if (contactReq.status !== 'accepted') {
            return response.error(res, 'Cannot log contact click for non-accepted request', 403);
        }

        const callerUserId = req.user?.id;
        const isParticipant = callerUserId && (
            contactReq.parent?.userId === callerUserId ||
            contactReq.teacher?.userId === callerUserId ||
            req.user?.userType === 'admin'
        );

        if (!isParticipant) {
            return response.error(res, 'Unauthorized: you are not a participant in this contact request', 403);
        }

        const bucket = Math.floor(Date.now() / 60000);
        const rawKey = `click_${req.user?.id || req.ip}_${requestId}_${channel || 'whatsapp'}_${bucket}`;
        const dedupKey = crypto.createHash('sha256').update(rawKey).digest('hex');

        try {
            const event = await prisma.platformEvent.create({
                data: {
                    eventType: 'authorized_contact_click',
                    userId: req.user?.id || null,
                    entityId: requestId,
                    metadata: {
                        teacherId: contactReq.teacherId,
                        channel: channel || 'whatsapp'
                    },
                    dedupKey
                }
            });
            return response.created(res, event, 'Authorized contact click logged');
        } catch (dbErr) {
            if (dbErr.code === 'P2002') {
                return response.success(res, { deduplicated: true }, 'Click deduplicated', 200);
            }
            throw dbErr;
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Log a WhatsApp click event (legacy endpoint)
 */
const logWhatsAppClick = async (req, res, next) => {
    try {
        const { teacherId } = req.body;
        const parentId = req.user?.parent?.id;

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
    logEvent,
    logAttribution,
    logAuthorizedContactClick,
    logWhatsAppClick
};
