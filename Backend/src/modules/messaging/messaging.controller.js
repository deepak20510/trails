import prisma from "../../db.js";
import { emitNewMessage, emitNotification } from "../../socket/socket.js";

export const getOrCreateConversation = async (req, res, next) => {
    try {
        const { participantId } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (userId === participantId) {
            return res.status(400).json({ success: false, message: "Cannot start conversation with yourself" });
        }

        // Get participant details to check role
        const participant = await prisma.user.findUnique({
            where: { id: participantId },
            select: { id: true, role: true, firstName: true, lastName: true }
        });

        if (!participant) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // ROLE RESTRICTION: Only TRAINER-INSTITUTION messaging allowed
        const allowedCombinations = [
            { user: "TRAINER", participant: "INSTITUTION" },
            { user: "INSTITUTION", participant: "TRAINER" }
        ];

        const isAllowed = allowedCombinations.some(
            combo => combo.user === userRole && combo.participant === participant.role
        );

        if (!isAllowed) {
            return res.status(403).json({ 
                success: false, 
                message: "Messaging is only allowed between trainers and institutions" 
            });
        }

        // CHECK CONNECTION: Users must be connected to message each other
        const connection = await prisma.connection.findFirst({
            where: {
                OR: [
                    { senderId: userId, receiverId: participantId, status: "ACCEPTED" },
                    { senderId: participantId, receiverId: userId, status: "ACCEPTED" }
                ]
            }
        });

        if (!connection) {
            return res.status(403).json({ 
                success: false, 
                message: "You must be connected with this user to start a conversation" 
            });
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
                    select: { id: true, firstName: true, lastName: true, role: true, profilePicture: true }
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
                    select: { id: true, firstName: true, lastName: true, role: true, profilePicture: true }
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
                    select: { id: true, firstName: true, lastName: true, role: true, profilePicture: true }
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: "desc" },
                    include: {
                        sender: {
                            select: { id: true, firstName: true, lastName: true }
                        }
                    }
                },
                _count: {
                    select: {
                        messages: {
                            where: {
                                senderId: { not: userId },
                                isRead: false
                            }
                        }
                    }
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

        // Verify user is participant
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                participants: { some: { id: senderId } }
            },
            include: {
                participants: {
                    select: { id: true, firstName: true, lastName: true, role: true }
                }
            }
        });

        if (!conversation) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }

        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId,
                content
            },
            include: {
                sender: {
                    select: { id: true, firstName: true, lastName: true, profilePicture: true }
                }
            }
        });

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });

        // Emit real-time message via Socket.io
        emitNewMessage(conversationId, message);

        // Send notification to other participants
        const otherParticipants = conversation.participants.filter(p => p.id !== senderId);
        for (const participant of otherParticipants) {
            const notification = await prisma.notification.create({
                data: {
                    userId: participant.id,
                    type: "MESSAGE",
                    title: "New Message",
                    message: `${req.user.firstName || 'Someone'} sent you a message`,
                    link: `/messages/${conversationId}`
                }
            });
            emitNotification(participant.id, notification);
        }

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
            include: {
                sender: {
                    select: { id: true, firstName: true, lastName: true, profilePicture: true }
                }
            },
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
