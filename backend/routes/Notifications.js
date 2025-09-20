const express = require('express');
const router = express.Router();
const { Notifications, User } = require('../models');
const { Op } = require('sequelize');
/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: API endpoints for managing notifications
 */
/**
 * @swagger
 * /api/v1/notifications:
 *   post:
 *     summary: Create a new notification
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       500:
 *         description: Internal server error
 */

router.post('/', async (req, res) => {
  const {user_id,title,message } = req.body;
  try{

    const user = await User.findByPk(user_id);
    if(!user){
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    const notification = await Notifications.create({user_id,title,message });
    res.json({ success: true, data: notification });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   get:
 *     summary: Get notifications for a user
 *     tags: [Notifications]
 *     parameters:  
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *       500:
 *         description: Internal server error
 */
router.get('/:id', async (req, res) => {
    try{
  const notifications = await Notifications.findAll({
    where:{
        user_id:req.params.id,
        read:false
    }
    });
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   put:
 *     summary: Update a notification
 *     tags: [Notifications]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the notification
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:    
 *           schema:
 *             type: object
 *             properties:
 *               read:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Notification updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       500:
 *         description: Internal server error
 */
router.put('/:id', async (req, res) => {
  try {
    const { read } = req.body;
    const notification = await Notifications.update({ read }, { where: { id: req.params.id } });
    res.json({ success: true, data: notification });
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the notification
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notifications.destroy({ where: { id: req.params.id } });
    res.json({ success: true, data: notification });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});



/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get all notifications
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: List of all notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const notifications = await Notifications.findAll();
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Get all notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});



/**
 * @swagger
 * /api/v1/notifications/mark-all-as-read/{id}:
 *   put:
 *     summary: Mark all notifications as read for a user
 *     tags: [Notifications]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All notifications marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: number
 *                   description: Number of notifications updated
 *       500:
 *         description: Internal server error
 */
router.put('/mark-all-as-read/:id', async (req, res) => {
  try {
    const notifications = await Notifications.update({ read: true }, { where: { user_id:req.params.id, read: false } });
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});


/**
 * @swagger
 * /api/v1/notifications/unread-count/{id}:
 *   get:
 *     summary: Get unread notifications count for a user
 *     tags: [Notifications]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unread notifications count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: number
 *                   description: Number of unread notifications
 *       500:
 *         description: Internal server error
 */
router.get('/unread-count/:id', async (req, res) => {
  try {
    const count = await Notifications.count({ where: { user_id:req.params.id, read: false } });
    res.json({ success: true, data: count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

//clear all as read notifications
/**
 * @swagger
 * /api/v1/notifications/clear-all-as-read/{id}:
 *   put:
 *     summary: Clear all as read notifications
 *     tags: [Notifications]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notifications cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *       500:
 *         description: Internal server error
 */
router.put('/clear-all-as-read/:id', async (req, res) => {
  try{
    const notifications = await Notifications.update({ read: true }, { where: {user_id:req.params.id, read: false } });
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Clear all as read notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

//get notifications by date range
/**
 * @swagger
 * /api/v1/notifications/date-range/{id}:
 *   get:
 *     summary: Get notifications by date range
 *     tags: [Notifications]
 *     parameters:  
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *       - name: start_date
 *         in: query
 *         required: true
 *         description: The start date
 *         schema:
 *           type: string
 *       - name: end_date
 *         in: query
 *         required: true
 *         description: The end date
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *       500:
 *         description: Internal server error
 */
router.get('/date-range/:id', async (req, res) => {
    try{
  const notifications = await Notifications.findAll({ where: { user_id:req.params.id, created_at: { [Op.between]: [req.query.start_date, req.query.end_date] } } });
  res.json({ success: true, data: notifications });
    } catch (error) {
        console.error('Get notifications by date range error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }

});


module.exports = router;



