/* Minimal Socket.IO sender for testing private chats */
const { io } = require('socket.io-client');

const BASE = process.env.BACKEND_URL || 'http://localhost:3000';
const NAMESPACE = (process.env.API_PREFIX || '/api/v1') + '/sockets';
const TOKEN = process.env.JWT; // Optional now
const SENDER_ID = process.env.SENDER_ID; // UUID of sender (required if no JWT)
const RECEIVER_ID = process.env.RECEIVER_ID; // UUID of receiver

if (!SENDER_ID && !TOKEN) {
  console.error('Missing SENDER_ID or JWT. Set SENDER_ID (uuid) when auth is disabled, or provide JWT.');
  process.exit(1);
}
if (!RECEIVER_ID) {
  console.error('Missing RECEIVER_ID. Set environment variable RECEIVER_ID to the target user UUID.');
  process.exit(1);
}

const auth = {};
if (TOKEN) auth.token = `Bearer ${TOKEN}`;
if (SENDER_ID) auth.userId = SENDER_ID;
const socket = io(`${BASE}${NAMESPACE}`, { auth });

socket.on('connect', () => {
  console.log('sender connected', socket.id);

  // Optional: join a chat room if you have one
  // socket.emit('private:join', { chatId: 'chat-123' });

  // Send message with tempId
  socket.emit('private:message', {
    senderId: SENDER_ID,
    receiverId: RECEIVER_ID,
    message: 'Hello from sender test',
    tempId: `tmp-${Date.now()}`
  }, (ack) => {
    console.log('ack', ack);
  });

  // Typing indicator
  setTimeout(() => {
    socket.emit('private:typing', { senderId: SENDER_ID, receiverId: RECEIVER_ID, isTyping: true });
  }, 500);

  // Mark read (simulate reading messages from receiver)
  setTimeout(() => {
    socket.emit('private:read', { senderId: SENDER_ID, fromUserId: RECEIVER_ID });
  }, 1500);
});

socket.on('connect_error', (e) => console.error('sender connect_error', e.message));
socket.on('private:message:new', (msg) => console.log('sender echo/new', msg));
socket.on('disconnect', (reason) => console.log('sender disconnected', reason));


