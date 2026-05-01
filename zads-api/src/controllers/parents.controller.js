const prisma = require('../config/database');
const response = require('../utils/response');

/**
 * Get my parent profile
 */
const getMyProfile = async (req, res, next) => {
    try {
        const parentId = req.user.parent?.id;

        if (!parentId) {
            return response.error(res, 'Parent profile not found', 404);
        }

        const parent = await prisma.parent.findUnique({
            where: { id: parentId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        avatarUrl: true,
                        userType: true
                    }
                },
                area: {
                    include: {
                        city: {
                            include: {
                                governorate: true
                            }
                        }
                    }
                },
                children: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        stage: true,
                        subjects: {
                            include: {
                                subject: true
                            }
                        }
                    }
                }
            }
        });

        if (!parent) {
            return response.error(res, 'Parent not found', 404);
        }

        return response.success(res, { parent });

    } catch (error) {
        next(error);
    }
};

/**
 * Update parent profile
 */
const updateProfile = async (req, res, next) => {
    try {
        const parentId = req.user.parent?.id;

        if (!parentId) {
            return response.error(res, 'Parent profile not found', 404);
        }

        const { areaId, clientAccountKind } = req.body;

        const updated = await prisma.parent.update({
            where: { id: parentId },
            data: {
                ...(areaId !== undefined && { areaId }),
                ...(clientAccountKind !== undefined && { clientAccountKind })
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true
                    }
                },
                area: {
                    include: {
                        city: {
                            include: {
                                governorate: true
                            }
                        }
                    }
                }
            }
        });

        return response.success(res, updated, 'Profile updated');

    } catch (error) {
        next(error);
    }
};

/**
 * Get my children
 */
const getChildren = async (req, res, next) => {
    try {
        const parentId = req.user.parent?.id;

        if (!parentId) {
            return response.error(res, 'Parent profile not found', 404);
        }

        const children = await prisma.parentChild.findMany({
            where: { parentId },
            orderBy: { createdAt: 'asc' },
            include: {
                stage: true,
                subjects: {
                    include: {
                        subject: true
                    }
                }
            }
        });

        return response.success(res, children);

    } catch (error) {
        next(error);
    }
};

/**
 * Add child
 */
const addChild = async (req, res, next) => {
    try {
        const parentId = req.user.parent?.id;

        if (!parentId) {
            return response.error(res, 'Parent profile not found', 404);
        }

        const { name, stageId, subjectIds } = req.body;

        if (!name || !stageId) {
            return response.error(res, 'Name and stage are required', 400);
        }

        // Get parent's area for tutor requests
        const parent = await prisma.parent.findUnique({
            where: { id: parentId },
            select: { areaId: true }
        });

        // Create child with subjects
        const child = await prisma.parentChild.create({
            data: {
                parentId,
                name,
                stageId,
                subjects: subjectIds?.length > 0 ? {
                    create: subjectIds.map(subjectId => ({ subjectId }))
                } : undefined
            },
            include: {
                stage: true,
                subjects: {
                    include: {
                        subject: true
                    }
                }
            }
        });

        // Auto-create tutor requests for each subject
        if (subjectIds?.length > 0) {
            const tutorRequestsData = subjectIds.map(subjectId => ({
                parentId,
                parentChildId: child.id,
                subjectId,
                stageId,
                areaId: parent?.areaId,
                requestTarget: 'dependent',
                studyMode: 'both',
                description: `طلب معلم لـ ${name}`,
                status: 'active'
            }));

            await prisma.tutorRequest.createMany({
                data: tutorRequestsData
            });
        }

        return response.success(res, child, 'Child added and tutor requests created');

    } catch (error) {
        next(error);
    }
};

/**
 * Update child
 */
const updateChild = async (req, res, next) => {
    try {
        const parentId = req.user.parent?.id;
        const { childId } = req.params;

        if (!parentId) {
            return response.error(res, 'Parent profile not found', 404);
        }

        // Check ownership
        const existing = await prisma.parentChild.findFirst({
            where: { id: childId, parentId }
        });

        if (!existing) {
            return response.error(res, 'Child not found', 404);
        }

        const { name, stageId, subjectIds } = req.body;

        // Update child
        const child = await prisma.parentChild.update({
            where: { id: childId },
            data: {
                ...(name && { name }),
                ...(stageId && { stageId })
            }
        });

        // Update subjects if provided
        if (subjectIds !== undefined) {
            // Delete existing subjects
            await prisma.parentChildSubject.deleteMany({
                where: { parentChildId: childId }
            });

            // Create new subjects
            if (subjectIds.length > 0) {
                await prisma.parentChildSubject.createMany({
                    data: subjectIds.map(subjectId => ({
                        parentChildId: childId,
                        subjectId
                    }))
                });
            }
        }

        // Fetch updated child with relations
        const updated = await prisma.parentChild.findUnique({
            where: { id: childId },
            include: {
                stage: true,
                subjects: {
                    include: {
                        subject: true
                    }
                }
            }
        });

        return response.success(res, updated, 'Child updated');

    } catch (error) {
        next(error);
    }
};

/**
 * Delete child
 */
const deleteChild = async (req, res, next) => {
    try {
        const parentId = req.user.parent?.id;
        const { childId } = req.params;

        if (!parentId) {
            return response.error(res, 'Parent profile not found', 404);
        }

        // Check ownership
        const existing = await prisma.parentChild.findFirst({
            where: { id: childId, parentId }
        });

        if (!existing) {
            return response.error(res, 'Child not found', 404);
        }

        await prisma.parentChild.delete({
            where: { id: childId }
        });

        return response.success(res, null, 'Child deleted');

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMyProfile,
    updateProfile,
    getChildren,
    addChild,
    updateChild,
    deleteChild
};
