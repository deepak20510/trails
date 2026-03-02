import prisma from "../../db.js";

export const advancedSearch = async (req, res, next) => {
    try {
        const {
            role,
            skill,
            location,
            minRating,
            minExperience,
            maxExperience,
            verified,
            page = 1,
            limit = 20,
            sort = "rating_desc"
        } = req.query;

        const where = {};
        const userWhere = { isActive: true };

        // Role filter
        if (role && ["TRAINER", "INSTITUTION"].includes(role)) {
            userWhere.role = role;
        }

        // Location filter
        if (location) {
            userWhere.location = {
                contains: location,
                mode: "insensitive"
            };
        }

        // Build profile-specific filters
        let profileWhere = { isActive: true };

        if (role === "TRAINER") {
            if (skill) {
                profileWhere.skills = { has: skill };
            }
            if (minRating) {
                profileWhere.rating = { gte: parseFloat(minRating) };
            }
            if (minExperience !== undefined || maxExperience !== undefined) {
                profileWhere.experience = {
                    ...(minExperience && { gte: parseInt(minExperience) }),
                    ...(maxExperience && { lte: parseInt(maxExperience) })
                };
            }
            if (verified === "true") {
                profileWhere.verified = true;
            }
        } else if (role === "INSTITUTION") {
            if (minRating) {
                profileWhere.rating = { gte: parseFloat(minRating) };
            }
        }

        // Sorting
        const sortMap = {
            rating_desc: { rating: "desc" },
            rating_asc: { rating: "asc" },
            experience_desc: { experience: "desc" },
            experience_asc: { experience: "asc" },
            newest: { createdAt: "desc" }
        };

        const orderBy = sortMap[sort] || sortMap.rating_desc;

        // Query based on role
        let results = [];
        let total = 0;

        if (!role || role === "TRAINER") {
            const [trainers, trainerCount] = await Promise.all([
                prisma.trainerProfile.findMany({
                    where: profileWhere,
                    include: {
                        user: {
                            where: userWhere,
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                profilePicture: true,
                                bio: true,
                                headline: true,
                                location: true,
                                role: true
                            }
                        }
                    },
                    orderBy,
                    skip: (parseInt(page) - 1) * parseInt(limit),
                    take: parseInt(limit)
                }),
                prisma.trainerProfile.count({ where: profileWhere })
            ]);

            results = trainers
                .filter(t => t.user)
                .map(t => ({
                    ...t.user,
                    profile: {
                        id: t.id,
                        bio: t.bio,
                        location: t.location,
                        experience: t.experience,
                        skills: t.skills,
                        rating: t.rating,
                        verified: t.verified,
                        completionRate: t.completionRate,
                        responseTime: t.responseTime
                    }
                }));
            total = trainerCount;
        } else if (role === "INSTITUTION") {
            const [institutions, institutionCount] = await Promise.all([
                prisma.institutionProfile.findMany({
                    where: profileWhere,
                    include: {
                        user: {
                            where: userWhere,
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                profilePicture: true,
                                bio: true,
                                headline: true,
                                location: true,
                                role: true
                            }
                        }
                    },
                    orderBy: { rating: orderBy.rating || "desc" },
                    skip: (parseInt(page) - 1) * parseInt(limit),
                    take: parseInt(limit)
                }),
                prisma.institutionProfile.count({ where: profileWhere })
            ]);

            results = institutions
                .filter(i => i.user)
                .map(i => ({
                    ...i.user,
                    profile: {
                        id: i.id,
                        name: i.name,
                        location: i.location,
                        rating: i.rating
                    }
                }));
            total = institutionCount;
        }

        res.json({
            success: true,
            data: results,
            meta: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getAvailableSkills = async (req, res, next) => {
    try {
        const trainers = await prisma.trainerProfile.findMany({
            where: { isActive: true },
            select: { skills: true }
        });

        const allSkills = trainers.flatMap(t => t.skills);
        const uniqueSkills = [...new Set(allSkills)].sort();

        res.json({ success: true, data: uniqueSkills });
    } catch (error) {
        next(error);
    }
};
