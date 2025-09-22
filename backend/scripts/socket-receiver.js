/* Minimal Socket.IO receiver for testing private chats */
const { io } = require('socket.io-client');

const BASE = process.env.BACKEND_URL || 'http://localhost:3000';
const NAMESPACE = (process.env.API_PREFIX || '/api/v1') + '/sockets';
const TOKEN = process.env.JWT; // Optional
const USER_ID = process.env.SENDER_ID || process.env.USER_ID; // UUID of this receiver when auth disabled

if (!TOKEN) {
  console.error('Missing JWT. Set environment variable JWT to a valid token for the receiver user.');
  process.exit(1);
}

const auth = {};
if (TOKEN) auth.token = `Bearer ${TOKEN}`;
if (USER_ID) auth.userId = USER_ID;
const socket = io(`${BASE}${NAMESPACE}`, { auth });

socket.on('connect', () => console.log('receiver connected', socket.id));
socket.on('connect_error', (e) => console.error('receiver connect_error', e.message));
socket.on('disconnect', (reason) => console.log('receiver disconnected', reason));

socket.on('private:message:new', (msg) => console.log('receiver message', msg));
socket.on('private:typing', (p) => console.log('receiver typing', p));
socket.on('private:read', (p) => console.log('receiver read', p));


