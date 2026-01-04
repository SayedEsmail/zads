const prisma = require('../config/database');
const response = require('../utils/response');

/**
 * Get all active subjects
 */
const getAllSubjects = async (req, res, next) => {
    try {
        const subjects = await prisma.subject.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        });

        return response.success(res, subjects);
    } catch (error) {
        next(error);
    }
};

/**
 * Create subject (admin only)
 */
const createSubject = async (req, res, next) => {
    try {
        const { nameAr, nameEn, icon, sortOrder } = req.body;

        const subject = await prisma.subject.create({
            data: { nameAr, nameEn, icon, sortOrder }
        });

        return response.created(res, subject);
    } catch (error) {
        next(error);
    }
};

/**
 * Update subject (admin only)
 */
const updateSubject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nameAr, nameEn, icon, sortOrder, isActive } = req.body;

        const subject = await prisma.subject.update({
            where: { id },
            data: {
                ...(nameAr !== undefined && { nameAr }),
                ...(nameEn !== undefined && { nameEn }),
                ...(icon !== undefined && { icon }),
                ...(sortOrder !== undefined && { sortOrder }),
                ...(isActive !== undefined && { isActive })
            }
        });

        return response.success(res, subject, 'Subject updated');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllSubjects,
    createSubject,
    updateSubject
};
