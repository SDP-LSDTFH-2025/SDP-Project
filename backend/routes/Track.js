const express = require("express");
const router = express.Router();
const Topics = require('../models/Topics');
const StudyLogs = require('../models/StudyLogs');
const { Op } = require("sequelize");
const { Sequelize } = require("sequelize");

/**
 * @swagger
 * tags:
 *   name: Tracks
 *   description: Track topics, study logs, and streaks
 */

/**
 * @swagger
 * /api/v1/track/topic:
 *   post:
 *     summary: Add a new topic
 *     tags: [track]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, course, title]
 *             properties:
 *               userId:
 *                 type: string
 *               course:
 *                 type: string
 *               title:
 *                 type: string
 *             example:
 *               userId: "4b28ed21-c278-4a85-ae6f-a8c7d6aa1e25"
 *               course: "Data Structures"
 *               title: "Binary Trees"
 *     responses:
 *       201:
 *         description: Topic created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post("/topic", async (req, res) => {
  try {
    const { userId, course, title } = req.body;
    if (!userId || !course || !title)
      return res.status(400).json({ success: false, error: "Missing fields" });

    const topic = await Topics.create({
      user_id: userId,
      course,
      title,
      completed: false,
    });

    res.status(201).json({ success: true, topic });
  } catch (err) {
    console.error("Add topic error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/v1/track/topic/toggle:
 *   post:
 *     summary: Toggle topic completion
 *     tags: [track]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [topicId]
 *             properties:
 *               topicId:
 *                 type: integer
 *             example:
 *               topicId: 42
 *     responses:
 *       200:
 *         description: Topic toggled successfully
 *       404:
 *         description: Topic not found
 *       500:
 *         description: Internal server error
 */
router.post("/topic/toggle", async (req, res) => {
  try {
    const { topicId } = req.body;
    const topic = await Topics.findByPk(topicId);

    if (!topic)
      return res.status(404).json({ success: false, error: "Topic not found" });

    topic.completed = !topic.completed;
    await topic.save();

    res.json({ success: true, topic });
  } catch (err) {
    console.error("Toggle topic error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/v1/track/study-log:
 *   post:
 *     summary: Add or update study hours for today
 *     tags: [track]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, hours]
 *             properties:
 *               userId:
 *                 type: string
 *               hours:
 *                 type: number
 *             example:
 *               userId: "4b28ed21-c278-4a85-ae6f-a8c7d6aa1e25"
 *               hours: 2.5
 *     responses:
 *       200:
 *         description: Study log saved successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post("/study-log", async (req, res) => {
  try {
    const { userId, hours } = req.body;
    if (!userId || hours == null) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    // Automatically set date to today
    const today = new Date().toISOString().slice(0, 10);

    const [log, created] = await StudyLogs.upsert(
      { user_id: userId, date: today, hours },
      { returning: true }
    );

    res.json({ success: true, log, created });
  } catch (err) {
    console.error("Study log error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});


/**
 * @swagger
 * /api/v1/track/{userId}:
 *   get:
 *     summary: Get user's study progress, topics, and streak
 *     tags: [track]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User progress summary
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const topics = await Topics.findAll({
      where: { user_id: userId },
      order: [["created_at", "ASC"]],
    });

    // --- Calculate progress per course ---
    const courseMap = {};
    topics.forEach((t) => {
      if (!courseMap[t.course]) courseMap[t.course] = { total: 0, completed: 0 };
      courseMap[t.course].total += 1;
      if (t.completed) courseMap[t.course].completed += 1;
    });

    const progress = Object.entries(courseMap).map(([course, data]) => ({
      course,
      total: data.total,
      completed: data.completed,
      percentage: Math.round((data.completed / data.total) * 100),
    }));

    // --- Calculate study hours (last 7 days) ---
    const logs = await StudyLogs.findAll({
      where: {
        user_id: userId,
        date: { [Op.gte]: Sequelize.literal("CURRENT_DATE - INTERVAL '7 day'") },
      },
    });

    const totalHours = logs.reduce((sum, l) => sum + l.hours, 0);

    // --- Calculate streak ---
    let streak = 0;
    const sortedDates = logs
      .map((l) => l.date)
      .sort((a, b) => new Date(b) - new Date(a));

    const today = new Date();
    for (let i = 0; i < sortedDates.length; i++) {
      const diff =
        (today - new Date(sortedDates[i])) / (1000 * 60 * 60 * 24);
      if (diff <= i) streak++;
      else break;
    }

    res.json({ success: true, topics, progress, totalHours, streak });
  } catch (err) {
    console.error("Get progress error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

module.exports = router;
