# Calendar Integration Test Guide

## Overview
This document outlines how to test the new calendar integration that displays study sessions alongside Google Calendar events.

## Changes Made

### Backend Changes
1. **Added Study Sessions API Endpoint** (`/api/v1/planit/study-sessions`)
   - Fetches study sessions from the database
   - Formats them for FullCalendar display
   - Includes venue information and proper styling

2. **Updated Database Schema**
   - Added `created_at` timestamp to `study_sessions` table
   - Updated both individual schema file and main schema file

3. **Updated Study Sessions Model**
   - Added `created_at` field to the Sequelize model

### Frontend Changes
1. **Updated Home.jsx Calendar Component**
   - Added study sessions query using React Query
   - Combined Google Calendar events with study sessions
   - Enhanced event modal to show different information for study sessions vs Google Calendar events
   - Added color coding: Blue for study sessions, Green for Google Calendar events

2. **Added API Function**
   - Created `getStudySessions()` function in `frontend/src/api/groups.js`

## Testing Steps

### 1. Database Setup
```sql
-- Run the updated schema to add created_at column
\i backend/schema/16_study_sessions.sql
-- OR update the main schema
\i backend/schema/schema.sql
```

### 2. Add Sample Study Sessions
```sql
-- Insert sample study sessions for testing
INSERT INTO study_sessions (user_id, title, start_time, end_time, reminder_sent, venue_name, venue_id, created_at) VALUES
('your-user-id-here', 'Calculus Study Group', '2024-01-15 14:00:00', '2024-01-15 16:00:00', false, 'Library Room 101', 1, NOW()),
('your-user-id-here', 'Physics Problem Solving', '2024-01-16 10:00:00', '2024-01-16 12:00:00', false, 'Physics Lab 2', 2, NOW()),
('your-user-id-here', 'Linear Algebra Review', '2024-01-17 15:30:00', '2024-01-17 17:30:00', false, 'Math Building Room 205', 3, NOW());
```

### 3. Test the API Endpoint
```bash
# Test the study sessions endpoint
curl -X GET "http://localhost:3000/api/v1/planit/study-sessions" \
  -H "user_id: your-user-id-here"
```

Expected response:
```json
{
  "success": true,
  "sessions": [
    {
      "id": 1,
      "title": "Calculus Study Group",
      "start": "2024-01-15T14:00:00.000Z",
      "end": "2024-01-15T16:00:00.000Z",
      "location": "Library Room 101",
      "color": "#3b82f6",
      "extendedProps": {
        "type": "study_session",
        "venue": "Library Room 101"
      }
    }
  ]
}
```

### 4. Test Frontend Integration
1. Start the frontend application
2. Navigate to the home page
3. Look at the calendar component in the sidebar
4. Verify that:
   - Study sessions appear as blue dots/events
   - Google Calendar events appear as green dots/events
   - Clicking on study sessions shows venue information
   - Clicking on Google Calendar events shows location information
   - Event modal displays correct type and details

### 5. Visual Verification
- **Study Sessions**: Should appear as blue events with venue information
- **Google Calendar Events**: Should appear as green events with location information
- **Event Modal**: Should show different styling and information based on event type

## Expected Behavior

1. **Calendar Display**: Both study sessions and Google Calendar events appear on the same calendar
2. **Color Coding**: 
   - Blue (#3b82f6) for study sessions
   - Green (#10b981) for Google Calendar events
3. **Event Details**: Clicking events shows appropriate information based on type
4. **Real-time Updates**: Study sessions update when data changes (React Query caching)

## Troubleshooting

1. **No Study Sessions Appearing**: Check if the API endpoint is working and returning data
2. **Color Issues**: Verify the color properties are being set correctly in the API response
3. **Modal Issues**: Check that the event click handler is properly extracting extendedProps
4. **Database Issues**: Ensure the created_at column was added successfully

## Future Enhancements

1. Add ability to create study sessions directly from the calendar
2. Add different colors for different types of study sessions
3. Add filtering options to show/hide different event types
4. Add drag-and-drop functionality for rescheduling study sessions
