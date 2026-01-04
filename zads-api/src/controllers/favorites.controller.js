const prisma = require('../config/database');
const response = require('../utils/response');

/**
 * Get my favorites (parent)
 */
const getMyFavorites = async (req, res, next) => {
    try {
        const parentId = req.user.parent?.id;

        if (!parentId) {
            return response.error(res, 'Parent profile not found', 404);
        }

        const favorites = await prisma.favorite.findMany({
            where: { parentId },
            include: {
                teacher: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatarUrl: true
                            }
                        },
                        subjects: {
                            where: { isActive: true },
                            include: {
                                subject: true,
                                stage: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return response.success(res, favorites);

    } catch (error) {
        next(error);
    }
};

/**
 * Add teacher to favorites
 */
const addFavorite = async (req, res, next) => {
    try {
        const parentId = req.user.parent?.id;
        const { teacherId } = req.body;

        if (!parentId) {
            return response.error(res, 'Parent profile not found', 404);
        }

        // Check if already favorited
        const existing = await prisma.favorite.findUnique({
            where: {
                parentId_teacherId: { parentId, teacherId }
            }
        });

        if (existing) {
            return response.error(res, 'Already in favorites', 409);
        }

        const favorite = await prisma.favorite.create({
            data: { parentId, teacherId }
        });

        return response.created(res, favorite, 'Added to favorites');

    } catch (error) {
        next(error);
    }
};

/**
 * Remove teacher from favorites
 */
const removeFavorite = async (req, res, next) => {
    try {
        const parentId = req.user.parent?.id;
        const { teacherId } = req.params;

        if (!parentId) {
            return response.error(res, 'Parent profile not found', 404);
        }

        await prisma.favorite.delete({
            where: {
                parentId_teacherId: { parentId, teacherId }
            }
        });

        return response.success(res, null, 'Removed from favorites');

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMyFavorites,
    addFavorite,
    removeFavorite
};
