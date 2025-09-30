const express = require('express');
const https = require('https');
const { URL } = require('url');
const { Events} = require('../models');

const router = express.Router();

// Base URL for Planit API (can be overridden via env)
const PLANIT_BASE_URL = process.env.PLANIT_BASE_URL;

function buildPlanitUrl(pathname) {
  const url = new URL(PLANIT_BASE_URL);
  // Ensure no double slashes
  url.pathname = pathname.replace(/\/+/, '/');
  return url;
}

function forwardToPlanit(method, pathname, req, bodyObj) {
  return new Promise((resolve, reject) => {
    const url = buildPlanitUrl(pathname);
    const payload = bodyObj ? Buffer.from(JSON.stringify(bodyObj)) : null;

    const headers = {
      'Content-Type': 'application/json'
    };

    // Pass-through Authorization token if present
    if (req.headers && req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const options = {
      method,
      hostname: url.hostname,
      protocol: url.protocol,
      path: url.pathname + (url.search || ''),
      headers
    };

    const request = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        let parsed;
        try {
          parsed = raw ? JSON.parse(raw) : null;
        } catch (e) {
          parsed = raw;
        }
        resolve({ status: res.statusCode || 500, data: parsed });
      });
    });

    request.on('error', (err) => reject(err));
    if (payload) request.write(payload);
    request.end();
  });
}

function requireUserId(req, res) {
  const userId = req.headers['user_id'] || req.headers['x-user-id'] || req.query.user_id || req.body?.user_id;
  if (!userId) {
    res.status(400).json({ success: false, error: 'user_id is required' });
    return null;
  }
  return String(userId);
}

// Swagger: Planit Proxy tag
/**
 * @swagger
 * tags:
 *   name: Planit
 *   description: Proxy endpoints to Planit external API. Backend applies business logic using user_id.
 */

// ========== Events ==========
/**
 * @swagger
 * /api/v1/planit/events:
 *   get:
 *     summary: List Events by user_id (Planit proxy)
 *     tags: [Planit]
 *     parameters:
 *       - in: header
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     events:
 *                       type: array
 *                       items:
 *                         type: object
 *                         description: Event object returned by Planit API
 *                     guests:
 *                       type: array
 *                       items:
 *                         type: object
 *                         description: Guests list per event returned by Planit API
 */
router.get('/events', async (req, res) => {
  const eventPlanner = requireUserId(req, res);
  if (!eventPlanner) return;
  try {
    const events = await Events.findAll({ where: { eventPlanner } });
    const eventIds = events.map(e => e.event_id);

    // Fetch events and guests in parallel to reduce latency
    const eventPromises = eventIds.map(id => forwardToPlanit('GET', `/api/events/${encodeURIComponent(id)}`, req));
    const guestPromises = eventIds.map(id => forwardToPlanit('GET', `/api/guests/event/${encodeURIComponent(id)}`, req));

    const [eventResults, guestResults] = await Promise.all([
      Promise.all(eventPromises),
      Promise.all(guestPromises)
    ]);

    const events_data = eventResults.map(r => r.data);
    const guests_data = guestResults.map(r => r.data);
    console.log("Events data:", events_data);
    console.log("Guests data:", guests_data);

    res.status(200).json({ success: true, data: { events: events_data, guests: guests_data } });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Upstream error' });
  }
});


/**
 * @swagger
 * /api/v1/planit/events:
 *   post:
 *     summary: Create Event (Planit proxy)
 *     tags: [Planit]
 *     parameters:
 *       - in: header
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 * 
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventPlanner:
 *                 type: string
 *                 description: The ID of the event planner
 *               title:
 *                 type: string
 *                 description: The title of the event
 *               description:
 *                 type: string
 *                 description: The description of the event
 *               location:
 *                 type: string
 *                 description: The location of the event
 *               category:
 *                 type: string
 *                 description: The category of the event
 *               capacity:
 *                 type: number
 *                 description: The capacity of the event
 *               budget:
 *                 type: number
 *                 description: The budget of the event
 *               theme:
 *                 type: string
 *                 description: The theme of the event
 *               date:
 *                 type: string
 *                 description: The date of the event
 *               startTime:
 *                 type: string
 *                 description: The start time of the event
 *               endTime:
 *                 type: string
 *                 description: The end time of the event
 *               endDate:
 *                 type: string
 *                 description: The end date of the event
 *      
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/events', async (req, res) => {
  const eventPlanner = requireUserId(req, res);
  if (!eventPlanner) return;
  const body = Object.assign({}, req.body || {});
  // business rule: eventPlanner defaults to user_id
  if (!body.eventPlanner) body.eventPlanner = eventPlanner;
  try {
    const response = await forwardToPlanit('POST', '/api/events', req, body);
    if (Events && Events.create && response?.data?.id) {
      const event = await Events.create({
        eventPlanner,
        event_id: response.data.id
      });
      console.log("create Event:", event);
    }
    console.log("create event Response data:", response.data);
    
    res.status(response.status).json(response.data);
  } catch (e) {
    console.log("create event Error:", e);
    res.status(500).json({ success: false, error: 'Upstream error' });
  }
});

/**
 * @swagger
 * /api/v1/planit/events/{id}:
 *   patch:
 *     summary: Update Event by ID (Planit proxy)
 *     tags: [Planit]
 *     parameters:
 *       - in: header
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventPlanner:
 *                 type: string
 *                 description: The ID of the event planner
 *               title:
 *                 type: string
 *                 description: The title of the event
 *               description:
 *                 type: string
 *                 description: The description of the event
 *               location:
 *                 type: string
 *                 description: The location of the event
 *               category:
 *                 type: string
 *                 description: The category of the event
 *               capacity:
 *                 type: number
 *                 description: The capacity of the event
 *               budget:
 *                 type: number
 *                 description: The budget of the event
 *               theme:
 *                 type: string
 *                 description: The theme of the event
 *               date:
 *                 type: string
 *                 description: The date of the event
 *               startTime:
 *                 type: string
 *                 description: The start time of the event
 *               endTime:
 *                 type: string
 *                 description: The end time of the event
 *               endDate:
 *                 type: string
 *                 description: The end date of the event
 *     responses:
 *       200:
 *         description: Success
 */
router.patch('/events/:id', async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const { id } = req.params;
  try {
    const response = await forwardToPlanit('PATCH', `/api/events/${encodeURIComponent(id)}`, req, req.body || {});
    console.log("update event Response data:", response.data);
    res.status(response.status).json(response.data);
  } catch (e) {
    console.log("update event Error:", e);
      res.status(500).json({ success: false, error: 'Upstream error' });
  }
});

router.delete('/events/:id', async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const { id } = req.params;
  try {
    const response = await forwardToPlanit('DELETE', `/api/events/${encodeURIComponent(id)}`, req);
    await Events.destroy({ where: { event_id: id } });
    console.log("delete event Response data:", response.data);
    res.status(response.status).json(response.data);
  } catch (e) {
    console.log("delete event Error:", e);
    res.status(500).json({ success: false, error: 'Upstream error' });
  }
});

// ========== Guests ==========
/**
 * @swagger
 * /api/v1/planit/guests/event/{eventId}:
 *   post:
 *     summary: Create Guest for Event (Planit proxy)
 *     tags: [Planit]
 *     parameters:
 *       - in: header
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the guest
 *               email:
 *                 type: string
 *                 description: The email of the guest
 *               phone:
 *                 type: string
 *                 description: The phone of the guest
 *               rsvpStatus:
 *                 type: string
 *                 description: The RSVP status of the guest
 *               dietaryPreferences:
 *                 type: string
 *                 description: The dietary preferences of the guest
 *     responses:
 *       200:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the created guest
 *                 name:
 *                   type: string
 *                   description: The name of the guest
 *                   example: "Jane Doe"
 *                 email:
 *                   type: string
 *                   description: The email of the guest
 *                   example: "jane@example.com"
 *                 phone:
 *                   type: string
 *                   description: The phone of the guest
 *                   example: "1234567890"
 *                 rsvpStatus:
 *                   type: string
 *                   description: The RSVP status of the guest
 *                   example: "Pending"
 *                 dietaryPreferences:
 *                   type: string
 *                   description: The dietary preferences of the guest
 *                   example: "Vegetarian"
 *              
 */
router.post('/guests/event/:eventId', async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const { eventId } = req.params;
  try {
    const response = await forwardToPlanit('POST', `/api/guests/event/${encodeURIComponent(eventId)}`, req, req.body || {});
    // Store guest_id in Events table for this event
   const event = await Events.create({
      event_id: eventId,
      guest_id: response.data.id,
      eventPlanner: userId
    });
    console.log("create guest Response data:", response.data);
    console.log(" create guest Event:", event);
    res.status(response.status).json(response.data);
  } catch (e) {
    console.log("create guest Error:", e);
    res.status(500).json({ success: false, error: 'Upstream error' });
  }
});

/**
 * @swagger
 * /api/v1/planit/guests/event/{eventId}/guest/{guestId}:
 *   patch:
 *     summary: Update Guest for Event (Planit proxy)
 *     tags: [Planit]
 *     parameters:
 *       - in: header
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.patch('/guests/event/:eventId/guest/:guestId', async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const { eventId, guestId } = req.params;
  try {
    const response = await forwardToPlanit('PATCH', `/api/guests/event/${encodeURIComponent(eventId)}/guest/${encodeURIComponent(guestId)}`, req, req.body || {});
    console.log("update guest Response data:", response.data);
    res.status(response.status).json(response.data);
  } catch (e) {
    console.log("update guest Error:", e);
    res.status(500).json({ success: false, error: 'Upstream error' });
  }
});

/**
 * @swagger
 * /api/v1/planit/guests/event/{eventId}/guest/{guestId}:
 *   delete:
 *     summary: Delete Guest for Event (Planit proxy)
 *     tags: [Planit]
 *     parameters:
 *       - in: header
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/guests/event/:eventId/guest/:guestId', async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const { eventId, guestId } = req.params;
  try {
   
    const response = await forwardToPlanit('DELETE', `/api/guests/event/${encodeURIComponent(eventId)}/guest/${encodeURIComponent(guestId)}`, req);
    // Remove guest_id from Events table for this event
    await Events.destroy({ where: { event_id: eventId, guest_id: guestId } });
    console.log("delete guest Response data:", response.data);
    res.status(response.status).json(response.data);
  } catch (e) {
    console.log("delete guest Error:", e);
    res.status(500).json({ success: false, error: 'Upstream error' });
  }
});

// ========== Venues ==========
/**
 * @swagger
 * /api/v1/planit/venues/event/{eventId}:
 *   get:
 *     summary: Get Venues for Event (Planit proxy)
 *     tags: [Planit]
 *     parameters:
 *       - in: header
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/venues/event/:eventId', async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const { eventId } = req.params;
  try {
    const response = await forwardToPlanit('GET', `/api/venues/event/${encodeURIComponent(eventId)}`, req);
    res.status(response.status).json(response.data);
  } catch (e) {
    console.log("get venues Error:", e);
    res.status(500).json({ success: false, error: 'Upstream error' });
  }
});

/**
 * @swagger
 * /api/v1/planit/venues/event/{eventId}:
 *   post:
 *     summary: Create Venue for Event (Planit proxy)
 *     tags: [Planit]
 *     parameters:
 *       - in: header
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/venues/event/:eventId', async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const { eventId } = req.params;
  try {
    const response   = await forwardToPlanit('POST', `/api/venues/event/${encodeURIComponent(eventId)}`, req, req.body || {});
    if (Events && Events.update && response?.data?.id) {
      await Events.update(
        { venue_id: response.data.id },
        { where: { event_id: eventId } }
      );
    }
    res.status(response.status).json(response.data);
  } catch (e) {
    console.log("create venue Error:", e);
    res.status(500).json({ success: false, error: 'Upstream error' });
  }
});

/**
 * @swagger
 * /api/v1/planit/venues/event/{eventId}/venue/{venueId}:
 *   patch:
 *     summary: Update Venue for Event (Planit proxy)
 *     tags: [Planit]
 *     parameters:
 *       - in: header
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.patch('/venues/event/:eventId/venue/:venueId', async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const { eventId, venueId } = req.params;
  try {
    const response = await forwardToPlanit('PATCH', `/api/venues/event/${encodeURIComponent(eventId)}/venue/${encodeURIComponent(venueId)}`, req, req.body || {});
    res.status(response.status).json(response.data);
  } catch (e) {
    console.log("update venue Error:", e);
    res.status(500).json({ success: false, error: 'Upstream error' });
  }
});

/**
 * @swagger
 * /api/v1/planit/venues/event/{eventId}/venue/{venueId}:
 *   delete:
 *     summary: Delete Venue for Event (Planit proxy)
 *     tags: [Planit]
 *     parameters:
 *       - in: header
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/venues/event/:eventId/venue/:venueId', async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const { eventId, venueId } = req.params;
  try {
    const response = await forwardToPlanit('DELETE', `/api/venues/event/${encodeURIComponent(eventId)}/venue/${encodeURIComponent(venueId)}`, req);
    await Events.destroy({ where: {event_id: eventId, venue_id: venueId } });
    res.status(response.status).json(response.data);
  } catch (e) {
    console.log("delete venue Error:", e);
    res.status(500).json({ success: false, error: 'Upstream error' });
  }
});

// ========== Schedules ==========
/**
 * @swagger
 * /api/v1/planit/schedules/event/{eventId}:
 *   get:
 *     summary: Get Schedules for Event (Planit proxy)
 *     tags: [Planit]
 *     parameters:
 *       - in: header
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
    router.get('/schedules/event/:eventId', async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const { eventId } = req.params;
  try {
    const response = await forwardToPlanit('GET', `/api/schedules/event/${encodeURIComponent(eventId)}`, req);
    res.status(response.status).json(response.data);
  } catch (e) {
    console.log("get schedules Error:", e);
    res.status(500).json({ success: false, error: 'Upstream error' });
  }
});

/**
 * @swagger
 * /api/v1/planit/schedules/event/{eventId}:
 *   post:
 *     summary: Create Schedule for Event (Planit proxy)
 *     tags: [Planit]
 *     parameters:
 *       - in: header
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/schedules/event/:eventId', async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const { eventId } = req.params;
  try {
    const response = await forwardToPlanit('POST', `/api/schedules/event/${encodeURIComponent(eventId)}`, req, req.body || {});
    res.status(response.status).json(response.data);
  } catch (e) {
    console.log("create schedule Error:", e);
    res.status(500).json({ success: false, error: 'Upstream error' });
  }
});

/**
 * @swagger
 * /api/v1/planit/schedules/event/{eventId}/schedule/{scheduleId}:
 *   patch:
 *     summary: Update Schedule for Event (Planit proxy)
 *     tags: [Planit]
 *     parameters:
 *       - in: header
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.patch('/schedules/event/:eventId/schedule/:scheduleId', async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const { eventId, scheduleId } = req.params;
  try {
    const response = await forwardToPlanit('PATCH', `/api/schedules/event/${encodeURIComponent(eventId)}/schedule/${encodeURIComponent(scheduleId)}`, req, req.body || {});
    res.status(response.status).json(response.data);
  } catch (e) {
    console.log("update schedule Error:", e);
    res.status(500).json({ success: false, error: 'Upstream error' });
  }
});

/**
 * @swagger
 * /api/v1/planit/schedules/event/{eventId}/schedule/{scheduleId}:
 *   delete:
 *     summary: Delete Schedule for Event (Planit proxy)
 *     tags: [Planit]
 *     parameters:
 *       - in: header
*         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
    router.delete('/schedules/event/:eventId/schedule/:scheduleId', async (req, res) => {
    const userId = requireUserId(req, res);
  if (!userId) return;
  const { eventId, scheduleId } = req.params;
  try {
    const response = await forwardToPlanit('DELETE', `/api/schedules/event/${encodeURIComponent(eventId)}/schedule/${encodeURIComponent(scheduleId)}`, req);
    res.status(response.status).json(response.data);
  } catch (e) {
    console.log("delete schedule Error:", e);
    res.status(500).json({ success: false, error: 'Upstream error' });
  }
});

// ========== Export ==========
/**
 * @swagger
 * /api/v1/planit/export/event/{eventId}:
 *   get:
 *     summary: Export Event (Planit proxy)
 *     tags: [Planit]
 *     parameters:
 *       - in: header
*         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/export/event/:eventId', async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const { eventId } = req.params;
  try {
    const response = await forwardToPlanit('GET', `/api/export/event/${encodeURIComponent(eventId)}`, req);
    res.status(response.status).json(response.data);
  } catch (e) {
    console.log("export event Error:", e);
      res.status(500).json({ success: false, error: 'Upstream error' });
  }
});

module.exports = router;


