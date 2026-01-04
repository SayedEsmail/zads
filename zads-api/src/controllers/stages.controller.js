const prisma = require('../config/database');
const response = require('../utils/response');

/**
 * Get all active stages
 */
const getAllStages = async (req, res, next) => {
    try {
        const stages = await prisma.stage.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        });

        return response.success(res, stages);
    } catch (error) {
        next(error);
    }
};

/**
 * Create stage (admin only)
 */
const createStage = async (req, res, next) => {
    try {
        const { nameAr, nameEn, sortOrder } = req.body;

        const stage = await prisma.stage.create({
            data: { nameAr, nameEn, sortOrder }
        });

        return response.created(res, stage);
    } catch (error) {
        next(error);
    }
};

/**
 * Update stage (admin only)
 */
const updateStage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nameAr, nameEn, sortOrder, isActive } = req.body;

        const stage = await prisma.stage.update({
            where: { id },
            data: {
                ...(nameAr !== undefined && { nameAr }),
                ...(nameEn !== undefined && { nameEn }),
                ...(sortOrder !== undefined && { sortOrder }),
                ...(isActive !== undefined && { isActive })
            }
        });

        return response.success(res, stage, 'Stage updated');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllStages,
    createStage,
    updateStage
};
