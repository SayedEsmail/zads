const { z } = require('zod');

// Phone number regex for Egyptian numbers
const phoneRegex = /^(\+20|0)?1[0125][0-9]{8}$/;

const registerTeacherSchema = z.object({
    phone: z.string().regex(phoneRegex, 'Invalid Egyptian phone number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email().optional().nullable(),
    bio: z.string().optional(),
    experienceYears: z.number().int().min(0).max(50).optional(),
    qualification: z.string().optional(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    lessonTypes: z.array(z.enum(['at_teacher', 'at_student', 'group'])).optional()
});

const registerParentSchema = z.object({
    phone: z.string().regex(phoneRegex, 'Invalid Egyptian phone number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email().optional().nullable(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional()
});

const loginSchema = z.object({
    phone: z.string().regex(phoneRegex, 'Invalid Egyptian phone number'),
    password: z.string().min(1, 'Password is required')
});

const updateProfileSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional().nullable(),
    avatarUrl: z.string().url().optional().nullable(),
    phone: z.string().regex(phoneRegex, 'Invalid Egyptian phone number').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional()
});

module.exports = {
    registerTeacherSchema,
    registerParentSchema,
    loginSchema,
    updateProfileSchema
};
