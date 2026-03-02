# Messaging & Discovery Features

## Overview
This document describes the newly implemented messaging, discovery, and real-time notification features with connection-based restrictions.

## Features Implemented

### 1. Real-time Messaging (Connected Users Only)
- **Connection Requirement**: Users can only message other users they're connected with
- **Role Restriction**: Only trainers and institutions can message each other (students cannot participate)
- **Real-time Communication**: Socket.io integration for instant message delivery
- **Typing Indicators**: See when the other person is typing
- **Read Receipts**: Messages show "Read" status when viewed
- **Conversation Management**: Automatic conversation creation between connected participants
- **Panel Interface**: Accessible via messaging icon in navbar (no separate page)
- **Two Views**: 
  - Conversations: Active message threads
  - Connections: List of connected users to start new conversations

**Routes:**
- `GET /api/v1/messaging/conversations` - Get all conversations
- `POST /api/v1/messaging/conversation` - Create/get conversation with a connected user
- `POST /api/v1/messaging/send` - Send a message
- `GET /api/v1/messaging/:conversationId/messages` - Get messages in a conversation
- `PATCH /api/v1/messaging/read/:conversationId` - Mark messages as read

**Frontend:**
- `MessagingPanel` component - Opens from navbar messaging icon
- Components: `ConversationList`, `ChatWindow`

### 2. Advanced Discovery/Search
- **Multi-criteria Search**: Filter by role, skill, location, rating, experience
- **Trainer-specific Filters**: Skills, experience range, verified status
- **Institution Filters**: Location, rating
- **Sorting Options**: Rating, experience, newest
- **Connection Requests**: Send connection requests directly from search results
- **Panel Interface**: Accessible via search bar click in navbar (no separate page)

**Routes:**
- `GET /api/v1/discovery/search` - Advanced search with filters
- `GET /api/v1/discovery/skills` - Get all available skills

**Query Parameters:**
- `role`: TRAINER | INSTITUTION
- `skill`: Skill name (for trainers)
- `location`: Location search (case-insensitive)
- `minRating`: Minimum rating (0-5)
- `minExperience`: Minimum years of experience
- `maxExperience`: Maximum years of experience
- `verified`: true (for verified trainers only)
- `sort`: rating_desc | rating_asc | experience_desc | experience_asc | newest
- `page`: Page number
- `limit`: Results per page

**Frontend:**
- `DiscoveryPanel` component - Opens from search bar click

### 3. Real-time Notifications
- **Socket.io Integration**: Instant notification delivery
- **Notification Types**: MESSAGE, REQUEST, REVIEW, CONNECTION
- **Notification Bell**: Unread count badge
- **Mark as Read**: Individual or bulk mark as read
- **Click to Navigate**: Notifications link to relevant pages

**Routes:**
- `GET /api/v1/notifications` - Get user notifications
- `PATCH /api/v1/notifications/:id/read` - Mark notification as read
- `PATCH /api/v1/notifications/read-all` - Mark all as read
- `DELETE /api/v1/notifications/:id` - Delete notification

**Frontend:**
- `NotificationBell` component in navbar
- Real-time updates via Socket.io

### 4. Connection System
Users must be connected before they can message each other.

**Routes:**
- `POST /api/v1/networking/connect/:userId` - Send connection request
- `POST /api/v1/networking/respond/:requestId` - Accept/reject connection request
- `GET /api/v1/networking/my-network` - Get all connections
- `GET /api/v1/networking/pending` - Get pending connection requests
- `GET /api/v1/networking/suggestions` - Get connection suggestions
- `DELETE /api/v1/networking/remove/:userId` - Remove connection

## User Flow

### Connecting with Users
1. Click search bar in navbar to open Discovery panel
2. Apply filters to find trainers/institutions
3. Click "Connect" button on user card
4. Connection request sent

### Accepting Connections
1. Receive notification of connection request
2. Navigate to connections section
3. Accept or reject request

### Starting a Conversation
1. Click messaging icon in navbar
2. Switch to "Connections" tab
3. Click on a connected user
4. Start messaging

### Messaging
1. Type message in chat window
2. Message delivered in real-time via Socket.io
3. See typing indicators when other person is typing
4. Messages marked as read automatically

## Database Schema

### Notification Model
```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String
  type      String   // MESSAGE, REQUEST, REVIEW, CONNECTION
  title     String
  message   String
  link      String?
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([isRead])
  @@index([createdAt])
}
```

### Connection Model (Existing)
```prisma
model Connection {
  id         String        @id @default(uuid())
  senderId   String
  receiverId String
  status     RequestStatus @default(PENDING) // PENDING, ACCEPTED, REJECTED
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt

  sender   User @relation("SentConnections", fields: [senderId], references: [id])
  receiver User @relation("ReceivedConnections", fields: [receiverId], references: [id])

  @@unique([senderId, receiverId])
  @@index([senderId])
  @@index([receiverId])
  @@index([status])
}
```

## Socket.io Events

### Client → Server
- `join_conversation(conversationId)` - Join a conversation room
- `leave_conversation(conversationId)` - Leave a conversation room
- `typing({ conversationId, isTyping })` - Send typing indicator
- `mark_read({ conversationId })` - Mark messages as read

### Server → Client
- `new_message(message)` - New message received
- `user_typing({ userId, isTyping })` - User typing status
- `messages_read({ conversationId, readBy })` - Messages marked as read
- `notification(notification)` - New notification

## Authentication
All Socket.io connections require JWT authentication via the `auth.token` handshake parameter.

## Usage Examples

### Send Connection Request (Frontend)
```javascript
await ApiService.connectUser(userId);
```

### Start a Conversation (Frontend)
```javascript
const response = await ApiService.createConversation({ 
  participantId: userId 
});
// Opens in messaging panel
```

### Advanced Search (Frontend)
```javascript
const response = await ApiService.request('/discovery/search', {
  role: 'TRAINER',
  skill: 'JavaScript',
  location: 'New York',
  minRating: 4,
  verified: true,
  sort: 'rating_desc'
});
```

### Send Message (Frontend)
```javascript
const response = await ApiService.sendMessage({
  conversationId: 'conv-id',
  content: 'Hello!'
});
```

## Environment Variables
Add to `.env`:
```
CLIENT_URL=http://localhost:5173
```

## Dependencies Added

### Backend
- `socket.io` - Real-time communication

### Frontend
- `socket.io-client` - Socket.io client library

## Key Restrictions

1. **Connection Required**: Users must be connected before messaging
2. **Role Restriction**: Only TRAINER ↔ INSTITUTION messaging allowed
3. **No Student Messaging**: Students cannot send or receive messages
4. **Panel-based UI**: No separate pages, everything accessible from navbar

## Testing

1. **Connections**:
   - Create trainer and institution accounts
   - Click search bar to open discovery
   - Send connection request
   - Accept connection from other account

2. **Messaging**:
   - Click messaging icon in navbar
   - Switch to "Connections" tab
   - Click on connected user
   - Send messages and verify real-time delivery
   - Test typing indicators and read receipts

3. **Discovery**:
   - Click search bar in navbar
   - Apply various filters
   - Verify search results
   - Test connection requests

4. **Notifications**:
   - Send a message to trigger notification
   - Check notification bell for unread count
   - Click notification to navigate
   - Mark as read and verify count updates

## Notes
- Students cannot access messaging (role restriction enforced on backend)
- Users can only message connected users (enforced on backend)
- Socket.io automatically reconnects on connection loss
- Notifications are stored in database and delivered in real-time when user is online
- All messaging routes require authentication and connection verification
- Panels close when clicking outside or pressing close button
