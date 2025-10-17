const express = require('express');
const https = require('https');
const { URL } = require('url');
const { Events } = require('../models');

const router = express.Router();

// Base URL for Planit API (can be overridden via env)
const PLANIT_BASE_URL = process.env.PLANIT_BASE_URL;

function buildPlanitUrl(pathname) {
  if (!PLANIT_BASE_URL) {
    throw new Error('PLANIT_BASE_URL environment variable is not set');
  }
  const url = new URL(PLANIT_BASE_URL);
  // Ensure no double slashes
  url.pathname = pathname.replace(/\/+/, '/');
  return url;
}

function forwardToPlanit(method, pathname, req, bodyObj) {
  return new Promise((resolve, reject) => {
    try {
      const url = buildPlanitUrl(pathname);
      const payload = bodyObj ? Buffer.from(JSON.stringify(bodyObj)) : null;

      const headers = {
        'Content-Type': 'application/json'
      };

      // Pass-through Authorization token if present
      if (req.headers && req.headers.authorization) {
        headers['Authorization'] = req.headers.authorization;
      }

      // Pass-through user_id header if present
      if (req.headers && req.headers.user_id) {
        headers['user_id'] = req.headers.user_id;
      }

      // Also check for x-user-id header
      if (req.headers && req.headers['x-user-id']) {
        headers['x-user-id'] = req.headers['x-user-id'];
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

      console.log(`Forwarding ${method} request to: ${url.href}`);

      const request = https.request(options, (res) => {
        const chunks = [];
        res.on('data', (d) => chunks.push(d));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8');
          let parsed;
          try {
            parsed = raw ? JSON.parse(raw) : null;
          } catch (e) {
            console.error('Failed to parse response JSON:', e);
            console.error('Raw response:', raw);
            // If it's a plain text error, wrap it in a proper error object
            parsed = {
              success: false,
              error: raw || 'Unknown error',
              message: raw || 'Unknown error'
            };
          }
          
          // Log response details for debugging
          console.log(`Planit API response: ${method} ${pathname} - Status: ${res.statusCode}`);
          if (res.statusCode >= 400) {
            console.error('Planit API error response:', parsed);
          }
          
          resolve({ status: res.statusCode || 500, data: parsed });
        });
      });

      request.on('error', (err) => {
        console.error('Planit request error:', err);
        reject(new Error(`Planit service error: ${err.message}`));
      });
      
      if (payload) request.write(payload);
      request.end();
    } catch (error) {
      console.error('Error building Planit request:', error);
      reject(error);
    }
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
    console.log('Planit events request - eventPlanner:', eventPlanner);
    console.log('Request headers:', req.headers);
    
    // Check if PLANIT_BASE_URL is configured
    if (!PLANIT_BASE_URL) {
      console.error('PLANIT_BASE_URL environment variable is not set');
      return res.status(500).json({ 
        success: false, 
        error: 'Planit service configuration error: PLANIT_BASE_URL not set' 
      });
    }

    console.log('PLANIT_BASE_URL:', PLANIT_BASE_URL);

    // Get event IDs from our local database for this user
    const events = await Events.findAll({ where: { eventPlanner } });
    console.log('Found events in database:', events.length, events);
    const eventIds = events.map(e => e.event_id).filter(id => id);

    // If no events found, return empty arrays
    if (eventIds.length === 0) {
      console.log('No events found for user, returning empty arrays');
      return res.status(200).json({ 
        success: true, 
        data: { events: [], guests: [] } 
      });
    }

    console.log('Fetching events from Planit API for IDs:', eventIds);

    // Fetch events and guests in parallel to reduce latency
    const eventPromises = eventIds.map(id => 
      forwardToPlanit('GET', `/api/events/${encodeURIComponent(id)}`, req)
        .catch(err => {
          console.log(`Failed to fetch event ${id}:`, err.message);
          return { data: null, status: 404 }; // Return null if event fetch fails
        })
    );
    
    const guestPromises = eventIds.map(id => 
      forwardToPlanit('GET', `/api/guests/event/${encodeURIComponent(id)}`, req)
        .catch(err => {
          console.log(`Failed to fetch guests for event ${id}:`, err.message);
          return { data: [] }; // Return empty array if guest fetch fails
        })
    );

    const [eventResults, guestResults] = await Promise.all([
      Promise.all(eventPromises),
      Promise.all(guestPromises)
    ]);

    // Filter out null events (failed fetches) and extract data
    const events_data = eventResults
      .filter(result => result.data !== null)
      .map(result => result.data);
    
    const guests_data = guestResults
      .map(result => result.data)
      .flat()
      .filter(guest => guest !== null);

    console.log("Events data:", events_data);
    console.log("Guests data:", guests_data);

    res.status(200).json({ 
      success: true, 
      data: { events: events_data, guests: guests_data } 
    });
    
  } catch (e) {
    console.error('Planit events error:', e);
    res.status(500).json({ 
      success: false, 
      error: e.message || 'Upstream error',
      details: process.env.NODE_ENV === 'development' ? e.stack : undefined
    });
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
    console.log('Creating event for planner:', eventPlanner, 'with body:', body);
    
    const response = await forwardToPlanit('POST', '/api/events', req, body);
    console.log("Planit create event response:", response);
    
    // Check if the response is successful
    if (response.status === 201) {
      console.log("Planit API returned success status:", response.status);
      console.log("Response data structure:", JSON.stringify(response.data, null, 2));
      
      // Check if we have an event ID to store locally (Planit uses _id for MongoDB)
      const eventId = response.data?.id || response.data?._id;
      if (eventId) {
        try {
          const event = await Events.create({
            eventPlanner,
            event_id: eventId
          });
          console.log("Successfully created local event record:", event);
        } catch (dbError) {
          console.error("Failed to create local event record:", dbError);
          // Don't fail the entire request if local DB save fails
          console.warn("Event created in Planit but failed to save locally");
        }
      } else {
        console.warn("Planit API returned success but no event ID found in response");
        console.warn("Response data keys:", Object.keys(response.data || {}));
      }
      
      // Always return the Planit response for successful status codes
      res.status(response.status).json(response.data);
    } else {
      console.error("Planit API returned error status:", response.status);
      console.error("Error response data:", response.data);
      res.status(response.status || 500).json({
        success: false,
        error: response.data?.message || `Planit API error: ${response.status}`,
        details: response.data
      });
    }
    
  } catch (e) {
    console.error("Create event error:", e);
    res.status(500).json({ 
      success: false, 
      error: e.message || 'Failed to create event',
      details: process.env.NODE_ENV === 'development' ? e.stack : undefined
    });
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
    console.log('Creating guest for event:', eventId, 'by user:', userId, 'with body:', req.body);
    
    const response = await forwardToPlanit('POST', `/api/guests/event/${encodeURIComponent(eventId)}`, req, req.body || {});
    console.log("Planit create guest response:", response);
    
    // Check if the response is successful
    if (response.status >= 200 && response.status < 300) {
      console.log("Planit API returned success status:", response.status);
      console.log("Response data structure:", JSON.stringify(response.data, null, 2));
      
      // Check if we have a guest ID to store locally (Planit uses _id for MongoDB)
      const guestId = response.data?.id || response.data?._id;
      if (guestId) {
        try {
          // For now, just log the guest creation - the Events table design only supports one guest per event
          // In a proper implementation, we'd have a separate Guests table
          console.log("Guest created in Planit with ID:", guestId);
          console.log("Note: Current Events table design only supports one guest per event");
        } catch (dbError) {
          console.error("Failed to process guest creation:", dbError);
          // Don't fail the entire request if local processing fails
          console.warn("Guest created in Planit but local processing failed");
        }
      } else {
        console.warn("Planit API returned success but no guest ID found in response");
        console.warn("Response data keys:", Object.keys(response.data || {}));
      }
      
      // Always return the Planit response for successful status codes
      res.status(response.status).json(response.data);
    } else {
      console.error("Planit API returned error status:", response.status);
      console.error("Error response data:", response.data);
      
      // Handle different types of error responses
      let errorMessage = 'Failed to create guest';
      if (typeof response.data === 'string') {
        errorMessage = response.data;
      } else if (response.data?.message) {
        errorMessage = response.data.message;
      } else if (response.data?.error) {
        errorMessage = response.data.error;
      }
      
      res.status(response.status || 500).json({
        success: false,
        error: errorMessage,
        details: response.data
      });
    }
    
  } catch (e) {
    console.error("Create guest error:", e);
    res.status(500).json({ 
      success: false, 
      error: e.message || 'Failed to create guest',
      details: process.env.NODE_ENV === 'development' ? e.stack : undefined
    });
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


