const prisma = require('../config/database');
const response = require('../utils/response');

/**
 * Get all governorates
 */
const getGovernorates = async (req, res, next) => {
    try {
        const governorates = await prisma.governorate.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            select: {
                id: true,
                nameAr: true,
                nameEn: true
            }
        });

        return response.success(res, governorates);
    } catch (error) {
        next(error);
    }
};

/**
 * Get cities by governorate
 */
const getCitiesByGovernorate = async (req, res, next) => {
    try {
        const governorateId = req.params.governorateId || req.query.governorateId;

        if (!governorateId) {
            return response.error(res, 'Governorate ID is required', 400);
        }

        const cities = await prisma.city.findMany({
            where: {
                governorateId,
                isActive: true
            },
            orderBy: { sortOrder: 'asc' },
            select: {
                id: true,
                nameAr: true,
                nameEn: true
            }
        });

        return response.success(res, cities);
    } catch (error) {
        next(error);
    }
};

/**
 * Get areas by city
 */
const getAreasByCity = async (req, res, next) => {
    try {
        const cityId = req.params.cityId || req.query.cityId;

        if (!cityId) {
            return response.error(res, 'City ID is required', 400);
        }

        const areas = await prisma.area.findMany({
            where: {
                cityId,
                isActive: true
            },
            orderBy: { sortOrder: 'asc' },
            select: {
                id: true,
                nameAr: true,
                nameEn: true
            }
        });

        return response.success(res, areas);
    } catch (error) {
        next(error);
    }
};

/**
 * Get full location hierarchy (for dropdown on profile edit)
 */
const getFullHierarchy = async (req, res, next) => {
    try {
        const governorates = await prisma.governorate.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            select: {
                id: true,
                nameAr: true,
                nameEn: true,
                cities: {
                    where: { isActive: true },
                    orderBy: { sortOrder: 'asc' },
                    select: {
                        id: true,
                        nameAr: true,
                        nameEn: true,
                        areas: {
                            where: { isActive: true },
                            orderBy: { sortOrder: 'asc' },
                            select: {
                                id: true,
                                nameAr: true,
                                nameEn: true
                            }
                        }
                    }
                }
            }
        });

        return response.success(res, governorates);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getGovernorates,
    getCitiesByGovernorate,
    getAreasByCity,
    getFullHierarchy
};
