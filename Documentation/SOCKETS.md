c

## Sockets Setup and Rationale

This backend uses Socket.IO to deliver realtime features for private chats. This document explains how sockets are set up in the codebase and why we chose sockets over alternatives.

### Why Sockets?

- Realtime delivery: Messages, typing indicators, and read receipts need low-latency, bidirectional communication.
- Efficient connections: A single persistent connection is more efficient than frequent HTTP requests for chat workloads.
- Built-in reliability: Socket.IO adds automatic reconnection, event acknowledgements, and fallback transports.
- Room semantics: Targeted delivery to users or conversations via rooms is first-class in Socket.IO.

Alternatives considered:
- HTTP polling/long polling: Higher latency and server load; harder to scale for chat.
- Server-Sent Events (SSE): One-way (server → client) and not ideal for client → server events like send/typing/read.
- Webhooks: Not suitable for user-to-user, per-connection messaging; they target server-to-server notifications.

### Architecture Overview

- Transport: Socket.IO over WebSocket.
- Namespace: `${API_PREFIX}/sockets` (defaults to `/api/v1/sockets`).
- Auth: JWT in handshake (Bearer token). On success, `socket.user.id` is populated.
- Rooms:
  - `user-{userId}`: Joined on connect for multi-device delivery.
  - `chat-{chatId}`: Optional room for conversation scoping via `private:join`.
- Persistence: Messages saved in `private_chats` table via Sequelize model `PrivateChats`.

### Code Layout

- `backend/sockets/server.js`: Boots Socket.IO, configures CORS, attaches auth, mounts namespace at `${API_PREFIX}/sockets`, and registers feature modules.
- `backend/sockets/privateChats.js`: Private chat events (join, message, typing, read) with DB persistence and acks.
- `backend/server.js`: Creates HTTP server and attaches the Socket.IO server. Swagger includes a WebSocket server entry and scans `./sockets/*.js` for documentation.
- `backend/models/PrivateChats.js`: Sequelize model for `private_chats` table.
- `backend/schema/14_private_chats.sql`: Schema with `sender_id`/`receiver_id` as UUID FKs to `users(id)`.

### Handshake Authentication

- Client provides JWT as either `handshake.auth.token = 'Bearer <JWT>'` or `Authorization: Bearer <JWT>` header.
- Token is verified with `process.env.JWT_SECRET`.
- On success, `socket.user = { id: decoded.id }`.
- On failure, connection is rejected (Unauthorized).

### Namespacing and API Prefix

- Namespace is derived from `API_PREFIX` to keep realtime and REST paths consistent.
- Example default namespace: `/api/v1/sockets`.

### Events Implemented (Private Chats)

- `private:join` — Join a specific chat room
  - Payload: `{ chatId: string }`.
  - Effect: `socket.join('chat-' + chatId)`.

- `private:message` — Send a private message
  - Payload: `{ receiverId: string (uuid), message: string, tempId?: string }`.
  - Persists message, emits `private:message:new` to sender and `user-{receiverId}`.
  - Ack: `{ ok: boolean, data?: PrivateMessage, error?: string }`.

- `private:typing` — Typing indicator
  - Payload: `{ receiverId: string (uuid), isTyping: boolean }`.
  - Broadcasts to `user-{receiverId}` as `{ from, isTyping }`.

- `private:read` — Mark messages as read
  - Payload: `{ fromUserId: string (uuid) }`.
  - Updates unread messages from `fromUserId` → current user; emits `{ by: currentUserId }` to `user-{fromUserId}`.

Message shape:
```ts
type PrivateMessage = {
  id: number;
  sender_id: string;   // uuid
  receiver_id: string; // uuid
  message: string;
  created_at: string;  // ISO
  tempId?: string;
};
```

### Client Connection Example

```js
import { io } from 'socket.io-client';

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const NAMESPACE = '/api/v1/sockets'; // keep in sync with API_PREFIX

const socket = io(`${BASE_URL}${NAMESPACE}`, {
  auth: { token: 'Bearer YOUR_JWT' }
});

socket.emit('private:message', { receiverId: '<uuid>', message: 'Hello', tempId: 'tmp-1' }, (ack) => {
  if (!ack?.ok) return console.error('failed', ack?.error);
  console.log('sent', ack.data);
});
```

### Configuration

- `API_PREFIX` (default `/api/v1`) controls REST and socket namespace base.
- `JWT_SECRET` protects socket auth.
- CORS origins for sockets are aligned with REST in `backend/server.js`.

### Operational Notes

- Acks confirm send success and provide basic error reporting.
- Rooms ensure targeted delivery to recipients and multi-device support.
- Socket auth is minimal (JWT-only). Extend with user status checks as needed.

### Why Not X?

- Polling/long-polling: Overhead and latency are suboptimal for chat; more infrastructure load.
- SSE: One-directional (server → client), unsuitable for interactive chat.
- GRPC streams: Adds operational complexity for web clients; Socket.IO is simpler for browsers.

### Future Enhancements

- Delivery tracking (`delivered_at`) and richer status updates.
- Message retries/idempotency improvements using `tempId` mapping.
- Rate limiting per event to mitigate abuse.
- Presence (online/offline) and device counts per user room.

c