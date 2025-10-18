const express = require('express');
const router = express.Router();
const { Courses,UserCourses } = require('../models');
const { Op } = require('sequelize');
const { optimizedAuth } = require('../middleware/optimizedAuth');

// Debug: Check if Courses model is properly loaded
console.log('Courses model loaded:', !!Courses);
if (!Courses) {
  console.error('ERROR: Courses model is undefined!');
}

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: API endpoints for managing courses
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         code:
 *           type: string
 *         name:
 *           type: string
 *         school:
 *           type: string
 *         approved:
 *           type: boolean
 *         created_by:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: List of all courses
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
 *                     $ref: '#/components/schemas/Course'
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const courses = await Courses.findAll();
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
/**
 * @swagger
 * /api/v1/courses/add:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - school
 *               - created_by
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               school:
 *                 type: string
 *               approved:
 *                 type: boolean
 *                 default: false
 *               created_by:
 *                 type: string
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 *      
 */
router.post('/add', optimizedAuth, async (req, res) => {
  try {
    const { code, name, school, approved, created_by } = req.body;
    
    // Validate required fields
    if (!code || !name || !school || !created_by) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: code, name, school, created_by'
      });
    }
    const existingCourse = await Courses.findOne({ where: { code } });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        error: 'Course with this code already exists'
      });
    }
    
    const course = await Courses.create({ code, name, school, approved, created_by });
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
/**
 * @swagger
 * /api/v1/courses/update:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               school:
 *                 type: string
 *               approved:
 *                 type: boolean
 *               created_by:
 *                 type: string
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 *                   description: Number of affected rows
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal server error
 */
router.put('/update', optimizedAuth, async (req, res) => {
  try {
    const { code, name, school, approved, created_by } = req.body;

    const existingCourse = await Courses.findOne({ where: { code } });
    if (!existingCourse) {
      return res.status(400).json({
        success: false,
        error: 'This course does not exist'
      });
    }
    if(existingCourse.created_by != created_by){
      return res.status(400).json({
        success: false,
        error: 'You are not the owner of this course'
      });
    }
   await Courses.update(
    { code, name, school, approved, created_by },
    { where: { code: req.body.code } }
   );
   const updatedCourse = await Courses.findOne({ where: { code: req.body.code } });
    
    res.json({ success: true, data: updatedCourse });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
/**
 * @swagger
 * /api/v1/courses:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - created_by
 *               - code
 *             properties:
 *               created_by:
 *                 type: string
 *                 description: Creator code of the course
 *               code:
 *                 type: string
 *                 description: Course code
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: string
 *                   description: Course deleted successfully
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal server error
 */
router.delete('/', optimizedAuth, async (req, res) => {
  try {
    const {created_by, code} = req.body;

    const course = await Courses.findOne({ where: { code: req.body.code } });
    if(!course){
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }
    if(course.created_by != created_by){
      return res.status(400).json({
        success: false,
        error: 'You are not the owner of this course'
      });
    }
   await Courses.destroy({ where: { code: req.body.code } });

    
    res.json({ success: true, message: 'Course deleted successfully'});
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/v1/courses/search:
 *   get:
 *     summary: Search courses by name or code
 *     tags: [Courses]
 *     parameters:
 *       - name: search
 *         in: query
 *         required: true
 *         description: Search term for course name or code
 *         type: string
 *     responses:
 *       200:
 *         description: List of matching courses
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
 *                     $ref: '#/components/schemas/Course'
 *       400:
 *         description: Search parameter required
 *       500:
 *         description: Internal server error
 */
router.get('/search', async (req, res) => {
  try {
    const { search } = req.query;
    
    if (!search) {
      return res.status(400).json({
        success: false,
        error: 'Search parameter is required'
      });
    }
    
    const courses = await Courses.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { code: { [Op.iLike]: `%${search}%` } }
        ]
      }
    });
    
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Search courses error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/v1/courses/school:
 *   get:
 *     summary: Get courses by school
 *     tags: [Courses]
 *     parameters:
 *       - name: school
 *         in: query
 *         required: true
 *         description: School name
 *         type: string
 *     responses:
 *       200:
 *         description: List of courses from the specified school
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
 *                     $ref: '#/components/schemas/Course'
 *       400:
 *         description: School parameter required
 *       500:
 *         description: Internal server error
 */
router.get('/school', async (req, res) => {
  try {
    const { school } = req.query;
    
    if (!school) {
      return res.status(400).json({
        success: false,
        error: 'School parameter is required'
      });
    }
    
    const courses = await Courses.findAll({ where: { school } });
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Get courses by school error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
/**
 * @swagger
 * /api/v1/courses/code:
 *   get:
 *     summary: Get courses by code
 *     tags: [Courses]
 *     parameters:
 *       - name: code
 *         in: query
 *         required: true
 *         description: Course code
 *         type: string
 *     responses:
 *       200:
 *         description: List of courses with the specified code
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
 *                     $ref: '#/components/schemas/Course'
 *       400:
 *         description: Code parameter required
 *       500:
 *         description: Internal server error
 */
router.get('/code', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code parameter is required'
      });
    }
    
    const courses = await Courses.findAll({ where: { code } });
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Get courses by code error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
/**
 * @swagger
 * /api/v1/courses/name:
 *   get:
 *     summary: Get courses by name
 *     tags: [Courses]
 *     parameters:
 *       - name: name
 *         in: query
 *         required: true
 *         description: Course name
 *         type: string
 *     responses:
 *       200:
 *         description: List of courses with the specified name
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
 *                     $ref: '#/components/schemas/Course'
 *       400:
 *         description: Name parameter required
 *       500:
 *         description: Internal server error
 */
router.get('/name', async (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name parameter is required'
      });
    }
    
    const courses = await Courses.findAll({ where: { name } });
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Get courses by name error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
/**
 * @swagger
 * /api/v1/courses/approved:
 *   get:
 *     summary: Get courses by approval status
 *     tags: [Courses]
 *     parameters:
 *       - name: approved
 *         in: query
 *         required: false
 *         description: Approval status (true for approved, false for not approved)
 *         type: boolean
 *         default: true
 *     responses:
 *       200:
 *         description: List of courses with the specified approval status
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
 *                     $ref: '#/components/schemas/Course'
 *       500:
 *         description: Internal server error
 */
router.get('/approved', async (req, res) => {
  try {
    const { approved = true } = req.query;
    const courses = await Courses.findAll({ where: { approved: approved === 'true' } });
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Get courses by approval status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
/**
 * @swagger
 * /api/v1/courses/created_by:
 *   get:
 *     summary: Get courses by creator
 *     tags: [Courses]
 *     parameters:
 *       - name: created_by
 *         in: query
 *         required: true
 *         description: User ID of the course creator
 *         type: string
 *     responses:
 *       200:
 *         description: List of courses created by the specified user
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
 *                     $ref: '#/components/schemas/Course'
 *       400:
 *         description: Created_by parameter required
 *       500:
 *         description: Internal server error
 */
router.get('/created_by', async (req, res) => {
  try {
    const { created_by } = req.query;
    
    if (!created_by) {
      return res.status(400).json({
        success: false,
        error: 'Created_by parameter is required'
      });
    }
    
    const courses = await Courses.findAll({ where: { created_by } });
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Get courses by creator error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
/**
 * @swagger
 * /api/v1/courses/pending:
 *   get:
 *     summary: Get pending approval courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: List of courses pending approval
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
 *                     $ref: '#/components/schemas/Course'
 *       500:
 *         description: Internal server error
 */
router.get('/pending', async (req, res) => {
  try {
    const courses = await Courses.findAll({ where: { approved: false } });
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Get pending courses error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
 
/**
 * @swagger
 * /api/v1/courses/approve:
 *   put:
 *     summary: Approve a course
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approved:
 *                 type: boolean
 *                 default: true
 *               code:
 *                 type: string
 *                 description: Course code
 *     responses:
 *       200:
 *         description: Course approval status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: number
 *                   description: Number of affected rows
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal server error
 */
router.put('/approve', optimizedAuth, async (req, res) => {
  try {
    const { approved = true, code } = req.body;
    const updatedCourse = await Courses.update({ approved }, { where: { code: req.body.code } });
    
    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }
    
    res.json({ success: true, message: 'Course approved successfully' });
  } catch (error) {
    console.error('Approve course error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
/**
 * @swagger
 * /api/v1/courses/reject:
 *   put:
 *     summary: Reject a course
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: Course code
 *     responses:
 *       200:
 *         description: Course rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: string
 *                   description: Number of affected rows
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal server error
 */
router.put('/reject', optimizedAuth, async (req, res) => {
  try {
    const { code } = req.body;
    await Courses.update({ approved: false }, { where: { code: req.body.code } });
    
    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }
    
    res.json({ success: true, message: 'Course rejected successfully' });
  } catch (error) {
    console.error('Reject course error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/v1/courses/recent:
 *   get:
 *     summary: Get recent courses
 *     tags: [Courses]
 *     parameters:
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of courses to return (default 10)
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of recent courses
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
 *                     $ref: '#/components/schemas/Course'
 *       500:
 *         description: Internal server error
 */
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const courses = await Courses.findAll({
      order: [['created_at', 'DESC']],
      limit: parseInt(limit)
    });
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Get recent courses error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});


module.exports = router;