import express from "express";
import client from "../../db.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/profile", authMiddleware(), async (req, res) => {
    try {
        const user = await client.user.findUnique({
            where: { id: req.user.id },
            include: {
                trainerProfile: true,
                institutionProfile: true,
                studentProfile: true,
                education: true,
                experience: true
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get("/profile/:id", authMiddleware(), async (req, res) => {
    try {
        const user = await client.user.findUnique({
            where: { id: req.params.id },
            include: {
                trainerProfile: true,
                institutionProfile: true,
                studentProfile: true,
                education: true,
                experience: true
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put("/profile", authMiddleware(), async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            firstName, lastName, profilePicture, bio, headline, location,
            skills, experienceYears, company, school, degree
        } = req.body;

        const updatedUser = await client.user.update({
            where: { id: userId },
            data: {
                firstName,
                lastName,
                profilePicture,
                bio,
                headline,
                location
            }
        });

        // Handle role specific profile updates
        if (req.user.role === "TRAINER") {
            await client.trainerProfile.upsert({
                where: { userId },
                update: { bio, location, skills: skills || [] },
                create: { userId, bio, location, skills: skills || [], experience: experienceYears || 0 }
            });
        } else if (req.user.role === "STUDENT") {
            await client.studentProfile.upsert({
                where: { userId },
                update: { bio, location },
                create: { userId, bio, location }
            });
        } else if (req.user.role === "INSTITUTION") {
            await client.institutionProfile.upsert({
                where: { userId },
                update: { location, bio }, // Bio maps to many things
                create: { userId, name: firstName || "Institution", location: location || "Not specified" }
            });
        }


        res.json({ success: true, data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get("/search", authMiddleware(), async (req, res) => {
    try {
        const { query, role, location } = req.query;

        // Simple search across names and roles
        const users = await client.user.findMany({
            where: {
                AND: [
                    query ? {
                        OR: [
                            { firstName: { contains: query, mode: "insensitive" } },
                            { lastName: { contains: query, mode: "insensitive" } },
                            { email: { contains: query, mode: "insensitive" } },
                            { headline: { contains: query, mode: "insensitive" } },
                        ],
                    } : {},
                    role ? { role } : {},
                    location ? { location: { contains: location, mode: "insensitive" } } : {},
                    { NOT: { id: req.user.id } }, // Don't include self
                ],
            },
            include: {
                trainerProfile: true,
                institutionProfile: true,
                studentProfile: true,
            },
            take: 20,
        });

        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
