/**
 * @swagger
 * tags:
 *   name: Sockets
 *   description: Real-time events via Socket.IO (namespace /v1)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PrivateMessage:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         sender_id:
 *           type: string
 *           format: uuid
 *         receiver_id:
 *           type: string
 *           format: uuid
 *         message:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         tempId:
 *           type: string
 *           description: Client temporary id for idempotency
  *     PrivateJoinRequest:
  *       type: object
  *       required: [chatId]
  *       properties:
  *         chatId:
  *           type: string
  *           description: Chat identifier to join (room key)
  *     PrivateMessageRequest:
  *       type: object
  *       required: [receiverId, message]
  *       properties:
  *         receiverId:
  *           type: string
  *           format: uuid
  *         message:
  *           type: string
  *         tempId:
  *           type: string
  *           description: Client temporary id for idempotency
  *     PrivateTypingRequest:
  *       type: object
  *       required: [receiverId, isTyping]
  *       properties:
  *         receiverId:
  *           type: string
  *           format: uuid
  *         isTyping:
  *           type: boolean
  *     PrivateReadRequest:
  *       type: object
  *       required: [fromUserId]
  *       properties:
  *         fromUserId:
  *           type: string
  *           format: uuid
  *     SocketAckResponse:
  *       type: object
  *       properties:
  *         ok:
  *           type: boolean
  *         data:
  *           oneOf:
  *             - $ref: '#/components/schemas/PrivateMessage'
  *         error:
  *           type: string
  *           nullable: true
 */
