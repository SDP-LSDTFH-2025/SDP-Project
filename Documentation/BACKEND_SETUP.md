# Backend Setup Documentation

## Overview

This document provides a comprehensive guide to setting up and running the SDP Project backend API. The backend is built with Node.js, Express, Sequelize ORM, and PostgreSQL (NeonDB).

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (NeonDB)
- **ORM**: Sequelize
- **Documentation**: Swagger
- **Authentication**: JWT (JSON Web Tokens)
- **Development**: Nodemon

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database (NeonDB recommended)
- Git

## Installation

### 1. Clone and Navigate
```bash
git clone https://github.com/SDP-LSDTFH-2025/Backend.git
cd backend
```

### 2. Install Dependencies
```bash
npm install
npm install firebase
```

### 3. Environment Configuration
```bash
# Copy the example environment file
cp env.example .env

# Edit the .env file with your configuration
nano .env
```

### 4. Database Setup

#### Option A: Local PostgreSQL
1. Install PostgreSQL locally
2. Create a database
3. Update `.env` with local credentials

#### Option B: NeonDB (Recommended)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Update `.env` with NeonDB credentials

### 5. Environment Variables

```env
# Server Configuration
NODE_ENV=development
ENABLE_DB_SYNC=true
PORT=3000

# Database Configuration
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-username
DB_PASSWORD=your-password

# For NeonDB, use:
# DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# API Configuration
API_PREFIX=/api/v1
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Database Operations
```bash
# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Reset database
npm run db:reset
```

## Project Structure

```
backend/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── errorHandler.js      # Error handling
│   ├── security.js          # Security middleware
│   └── validation.js        # Input validation
├── models/
│   ├── index.js             # Model associations
│   └── User.js              # User model
├── routes/
│   ├── index.js             # Main router
│   ├── auth.js              # Authentication routes
│   └── users.js             # User management routes
├── server.js                # Main application file
├── package.json             # Dependencies and scripts
└── env.example              # Environment variables template
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user profile
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/google` - Google OAuth URL
- `GET /api/v1/auth/google/callback` - Google OAuth callback
- `POST /api/v1/auth/google/mock` - Mock Google login

### User Management
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/profile` - Update user profile
- `PUT /api/v1/users/profile/password` - Change password

### System
- `GET /health` - Health check
- `GET /api-docs` - API documentation

## Database Configuration

### Sequelize Setup
The application uses Sequelize ORM with PostgreSQL. Key configuration:

```javascript
// config/database.js
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);
```

### Models
- **User**: Stores user authentication and profile data
- Extensible for additional models as needed

## Development Workflow

### 1. Starting Development
```bash
# Install dependencies
npm install

# Set up environment
cp env.example .env
# Edit .env with your database credentials

# Start development server
npm run dev
```

### 2. Database Changes
```bash
# Enable database sync for development
# In .env: ENABLE_DB_SYNC=true

# Or use migrations for production
npm run db:migrate
```

### 3. Testing APIs
- Visit `http://localhost:3000/api-docs` for interactive documentation
- Use tools like Postman or curl for API testing

## Production Deployment

### 1. Environment Setup
```bash
NODE_ENV=production
ENABLE_DB_SYNC=false  # Never sync in production
```

### 2. Security Considerations
- Change all default secrets
- Use strong JWT secrets
- Enable HTTPS
- Set up proper CORS origins
- Configure rate limiting

### 3. Database
- Use production-grade PostgreSQL
- Set up proper backups
- Configure connection pooling
- Use migrations instead of sync

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database credentials in `.env`
   - Verify database is running
   - Check network connectivity

2. **Port Already in Use**
   - Change `PORT` in `.env`
   - Kill existing process: `npx kill-port 3000`

3. **Module Not Found**
   - Run `npm install`
   - Check Node.js version compatibility

4. **Database Sync Issues**
   - Set `ENABLE_DB_SYNC=true` for development
   - Use migrations for production
   - Check database permissions

### Logs
- Application logs are in console
- Database queries logged in development
- Error details in development mode

## Scripts Reference

```json
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "test": "jest",
  "db:migrate": "sequelize-cli db:migrate",
  "db:seed": "sequelize-cli db:seed:all",
  "db:reset": "sequelize-cli db:drop && sequelize-cli db:create && sequelize-cli db:migrate && sequelize-cli db:seed:all"
}
```

## Next Steps

1. **Add More Models**: Extend the data model as needed
2. **Implement Testing**: Add unit and integration tests
3. **Add Logging**: Implement structured logging
4. **Monitoring**: Add health checks and monitoring
5. **CI/CD**: Set up automated deployment pipeline

## Support

For issues and questions:
- Check the troubleshooting section
- Review API documentation at `/api-docs`
- Check console logs for error details
- Ensure all environment variables are set correctly 