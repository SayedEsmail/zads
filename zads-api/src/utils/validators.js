const { z } = require('zod');

// Phone number regex for Egyptian numbers (matches local 010/011/012/015 or international +20/0020/20)
const phoneRegex = /^(\+20|0020|20)?0?1[0125][0-9]{8}$/;

/**
 * Standardize Egyptian phone numbers to local 11-digit format (01xxxxxxxxx)
 */
function normalizeEgyptianPhone(input) {
    if (!input) return input;
    let cleaned = String(input).trim().replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('+20')) {
        cleaned = '0' + cleaned.substring(3);
    } else if (cleaned.startsWith('0020')) {
        cleaned = '0' + cleaned.substring(4);
    } else if (cleaned.startsWith('20') && cleaned.length === 12) {
        cleaned = '0' + cleaned.substring(2);
    } else if (cleaned.length === 10 && cleaned.startsWith('1')) {
        cleaned = '0' + cleaned;
    }
    return cleaned;
}

const registerTeacherSchema = z.object({
    phone: z.string().regex(phoneRegex, 'Invalid Egyptian phone number (must start with 010, 011, 012, or 015)'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email().optional().nullable(),
    bio: z.string().optional(),
    experienceYears: z.number().int().min(0).max(50).optional(),
    qualification: z.string().optional(),
    areaId: z.string().optional().nullable(),
    lessonTypes: z.array(z.enum(['at_teacher', 'at_student', 'group'])).optional()
});

const registerParentSchema = z.object({
    phone: z.string().regex(phoneRegex, 'Invalid Egyptian phone number (must start with 010, 011, 012, or 015)'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email().optional().nullable(),
    areaId: z.string().optional().nullable(),
    clientAccountKind: z.enum(['student', 'guardian']).optional()
});

const loginSchema = z.object({
    phone: z.string().regex(phoneRegex, 'Invalid Egyptian phone number').optional(),
    email: z.string().email('Invalid email address').optional(),
    password: z.string().min(1, 'Password is required')
}).refine(data => data.phone || data.email, {
    message: "Either phone or email must be provided",
    path: ["phone"]
});

const updateProfileSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional().nullable(),
    avatarUrl: z.string().url().optional().nullable(),
    phone: z.string().regex(phoneRegex, 'Invalid Egyptian phone number').optional(),
    currentPassword: z.string().min(1, 'Current password is required to change password').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    newPassword: z.string().min(6, 'Password must be at least 6 characters').optional()
}).refine(data => (!data.password && !data.newPassword) || data.currentPassword, {
    message: "Current password is required to set a new password",
    path: ["currentPassword"]
});

module.exports = {
    phoneRegex,
    normalizeEgyptianPhone,
    registerTeacherSchema,
    registerParentSchema,
    loginSchema,
    updateProfileSchema
};
