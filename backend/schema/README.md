# Database Schema

This folder contains the database schema files for the SDP Project.

## File Structure

- `schema.sql` - Complete schema file with all tables in the correct order
- Individual table files (01_users.sql, 02_follows.sql, etc.) - Separate files for each table

## Tables Overview

1. **users** - User accounts with Google authentication
2. **follows** - User following relationships
3. **courses** - Course information
4. **similar_courses** - Course similarity relationships
5. **resources** - Educational resources shared by users
6. **resource_tags** - Tags for resources
7. **resource_threads** - Comments/discussions on resources
8. **resource_reports** - Reports for inappropriate resources
9. **notifications** - User notifications
10. **user_courses** - User enrollment in courses
11. **study_groups** - Study group information
12. **group_members** - Study group membership
13. **group_chats** - Chat messages in study groups
14. **private_chats** - Private messages between users
15. **progress** - User study progress tracking
16. **study_sessions** - Scheduled study sessions

## Usage

### To create all tables:
```sql
-- Execute the complete schema
\i backend/schema/schema.sql
```

### To create individual tables:
```sql
-- Execute individual table files in order
\i backend/schema/01_users.sql
\i backend/schema/02_follows.sql
-- ... and so on
```

## Database Requirements

- PostgreSQL database (compatible with NeonDB)
- All tables use proper foreign key constraints
- Timestamps are used for audit trails
- JSON data type is used for flexible notification messages

## Notes

- The schema is designed to work with Google authentication (google_id as primary key)
- All foreign key relationships are properly defined
- Tables are numbered to ensure correct creation order
- The schema supports a comprehensive study platform with social features 