const express = require('express');
const router = express.Router();
const { Courses } = require('../models');
const { Op } = require('sequelize');


/**
 * @swagger
 * /api/v1/public/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Public]
 */
router.get('/courses', async (req, res) => {
  const courses = await Courses.findAll({ where: { approved: true } });
  res.json({
    success: true,
    data: courses
  });
});
module.exports = router;