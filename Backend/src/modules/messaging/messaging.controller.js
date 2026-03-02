import prisma from "../../db.js";

export const getOrCreateConversation = async (req, res, next) => {
    try {
        const { participantId } = req.body;
        const userId = req.user.id;

        if (userId === participantId) {
            return res.status(400).json({ success: false, message: "Cannot start conversation with yourself" });
        }

        // Find if conversation already exists between these two
        const existing = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { id: userId } } },
                    { participants: { some: { id: participantId } } }
                ]
            },
            include: {
                participants: {
                    select: { id: true, firstName: true, lastName: true, role: true }
                }
            }
        });

        if (existing) {
            return res.json({ success: true, data: existing });
        }

        const conversation = await prisma.conversation.create({
            data: {
                participants: {
                    connect: [{ id: userId }, { id: participantId }]
                }
            },
            include: {
                participants: {
                    select: { id: true, firstName: true, lastName: true, role: true }
                }
            }
        });

        res.status(201).json({ success: true, data: conversation });
    } catch (error) {
        next(error);
    }
};

export const getConversations = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const conversations = await prisma.conversation.findMany({
            where: {
                participants: { some: { id: userId } }
            },
            include: {
                participants: {
                    where: { id: { not: userId } },
                    select: { id: true, firstName: true, lastName: true, role: true }
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: "desc" }
                }
            },
            orderBy: { updatedAt: "desc" }
        });

        res.json({ success: true, data: conversations });
    } catch (error) {
        next(error);
    }
};

export const sendMessage = async (req, res, next) => {
    try {
        const { conversationId, content } = req.body;
        const senderId = req.user.id;

        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId,
                content
            }
        });

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });

        res.status(201).json({ success: true, data: message });
    } catch (error) {
        next(error);
    }
};

export const getMessages = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        // Verify user is participant
        const conv = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                participants: { some: { id: userId } }
            }
        });

        if (!conv) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }

        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: "asc" }
        });

        res.json({ success: true, data: messages });
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        await prisma.message.updateMany({
            where: {
                conversationId,
                senderId: { not: userId },
                isRead: false
            },
            data: { isRead: true }
        });

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};
