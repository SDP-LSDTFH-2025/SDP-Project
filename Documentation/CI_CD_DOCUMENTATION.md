# CI/CD Documentation

## Overview

This document outlines the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the SDP Project backend API. The pipeline uses GitHub Actions for CI/CD and Render for hosting.

## Architecture

### CI/CD Flow
```
GitHub Repository → GitHub Actions → Render Deployment
     ↓
   Code Push → Tests → Build → Deploy
```

### Components
- **GitHub Actions**: CI/CD automation
- **Render**: Cloud hosting platform
- **PostgreSQL**: Database service (Render managed)
- **Jest**: Testing framework
- **ESLint**: Code quality checks

## GitHub Actions Workflow

### Workflow File: `.github/workflows/deploy.yml`

#### Triggers
- Push to `main` branch → Full CI/CD pipeline
- Push to `develop` branch → Testing only
- Pull requests to `main` → Testing only

#### Jobs

##### 1. Test Job
- **Runs on**: Ubuntu latest
- **Services**: PostgreSQL 17
- **Steps**:
  - Checkout code
  - Setup Node.js 18
  - Install dependencies
  - Create test environment
  - Run tests
  - Run linting
  - Security audit

##### 2. Build Job
- **Runs on**: Ubuntu latest
- **Triggers**: Only on main branch
- **Steps**:
  - Checkout code
  - Setup Node.js 18
  - Install production dependencies
  - Build application
  - Create deployment artifact

##### 3. Deploy Job
- **Runs on**: Ubuntu latest
- **Triggers**: Only on main branch
- **Steps**:
  - Download build artifact
  - Deploy to Render

## Render Configuration

### Render Blueprint: `render.yaml`

#### Web Service Configuration
```yaml
services:
  - type: web
    name: sdp-backend-api
    env: node
    plan: starter
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /health
    autoDeploy: true
    branch: main
```

#### Environment Variables
- **NODE_ENV**: production
- **PORT**: 10000 (Render default)
- **ENABLE_DB_SYNC**: false (production safety)
- **JWT_SECRET**: auto-generated
- **SESSION_SECRET**: auto-generated
- **CORS_ORIGIN**: your frontend domain

#### Database Configuration
```yaml
databases:
  - name: sdp-postgres-db
    databaseName: sdp_database
    user: sdp_user
    plan: starter
```

## Setup Instructions

### 1. GitHub Repository Setup

#### Create Repository
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit with CI/CD setup"

# Add remote repository
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

#### Configure GitHub Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:
- `RENDER_SERVICE_ID`: Your Render service ID
- `RENDER_API_KEY`: Your Render API key

### 2. Render Setup

#### Create Render Account
1. Sign up at [render.com](https://render.com)
2. Connect your GitHub account
3. Create a new Web Service

#### Deploy from GitHub
1. Connect your GitHub repository
2. Render will automatically detect the `render.yaml` file
3. Configure environment variables
4. Deploy

#### Manual Setup (Alternative)
If not using `render.yaml`:

1. **Create Web Service**
   - Name: `sdp-backend-api`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Create PostgreSQL Database**
   - Name: `sdp-postgres-db`
   - Plan: `Starter`

3. **Configure Environment Variables**
   ```env
   NODE_ENV=production
   PORT=10000
   ENABLE_DB_SYNC=false
   JWT_SECRET=your-secure-jwt-secret
   JWT_EXPIRES_IN=24h
   API_PREFIX=/api/v1
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   CORS_ORIGIN=https://your-frontend-domain.com
   ALLOWED_IPS=127.0.0.1,::1
   SESSION_SECRET=your-secure-session-secret
   BCRYPT_ROUNDS=12
   LOG_LEVEL=info
   ```

4. **Database Connection**
   - Use the internal database URL provided by Render
   - Format: `postgresql://user:password@host:port/database`

### 3. Environment Configuration

#### Development Environment
```env
NODE_ENV=development
ENABLE_DB_SYNC=true
PORT=3000
```

#### Production Environment (Render)
```env
NODE_ENV=production
ENABLE_DB_SYNC=false
PORT=10000
```

## Testing Strategy

### Unit Tests
- **Framework**: Jest
- **Coverage**: 70% minimum
- **Location**: `tests/` directory
- **Command**: `npm test`

### Integration Tests
- **Framework**: Jest + Supertest
- **Database**: PostgreSQL test instance
- **Command**: `npm test`

### Code Quality
- **Linting**: ESLint
- **Command**: `npm run lint`
- **Auto-fix**: `npm run lint:fix`

### Security
- **Audit**: npm audit
- **Command**: `npm run security:audit`
- **Auto-fix**: `npm run security:fix`

## Deployment Process

### Automatic Deployment
1. **Push to main branch**
2. **GitHub Actions triggers**
3. **Tests run automatically**
4. **Build creates artifact**
5. **Deploy to Render**
6. **Health check confirms deployment**

### Manual Deployment
```bash
# Deploy to Render manually
git push origin main
```

### Rollback Process
1. **Render Dashboard** → Service → Deployments
2. **Select previous deployment**
3. **Click "Promote to Live"**

## Monitoring and Logs

### Render Dashboard
- **Service Status**: Real-time monitoring
- **Logs**: Application and build logs
- **Metrics**: Performance metrics
- **Alerts**: Automatic health checks

### Health Checks
- **Endpoint**: `/health`
- **Frequency**: Every 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3 attempts

### Log Access
```bash
# View Render logs
render logs sdp-backend-api

# View specific deployment
render logs sdp-backend-api --deployment-id <id>
```

## Security Considerations

### Environment Variables
- **Secrets**: Never commit to repository
- **Generation**: Use Render's secret generation
- **Rotation**: Regular secret updates

### Database Security
- **SSL**: Always enabled
- **Access**: IP restrictions
- **Backups**: Automatic daily backups

### Application Security
- **HTTPS**: Always enabled
- **Headers**: Security headers configured
- **Rate Limiting**: DDoS protection

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check build logs
render logs sdp-backend-api --type build

# Common fixes:
# - Update dependencies
# - Fix linting errors
# - Resolve security vulnerabilities
```

#### 2. Deployment Failures
```bash
# Check deployment logs
render logs sdp-backend-api --type deploy

# Common fixes:
# - Verify environment variables
# - Check database connection
# - Validate start command
```

#### 3. Health Check Failures
```bash
# Check application logs
render logs sdp-backend-api --type app

# Common fixes:
# - Verify PORT configuration
# - Check database connectivity
# - Validate health endpoint
```

#### 4. Database Issues
```bash
# Check database logs
render logs sdp-postgres-db

# Common fixes:
# - Verify connection string
# - Check database permissions
# - Validate SSL configuration
```

### Debug Commands
```bash
# Local testing
npm test
npm run lint
npm run security:audit

# Render CLI
render logs sdp-backend-api
render ps sdp-backend-api
render env ls sdp-backend-api
```

## Performance Optimization

### Build Optimization
- **Dependencies**: Production-only install
- **Caching**: npm cache in CI/CD
- **Parallel**: Concurrent job execution

### Runtime Optimization
- **Compression**: gzip enabled
- **Caching**: Static asset caching
- **Pooling**: Database connection pooling

### Monitoring
- **Metrics**: Response times, error rates
- **Alerts**: Performance thresholds
- **Scaling**: Automatic scaling rules

## Cost Optimization

### Render Plans
- **Starter**: $7/month (web service)
- **Starter**: $7/month (database)
- **Total**: ~$14/month

### Optimization Tips
- **Auto-sleep**: Enable for development
- **Resource limits**: Monitor usage
- **Cleanup**: Remove unused services

## Best Practices

### Code Quality
- **Linting**: Pre-commit hooks
- **Testing**: High coverage
- **Documentation**: Up-to-date docs

### Security
- **Secrets**: Secure management
- **Updates**: Regular dependency updates
- **Audits**: Security scanning

### Monitoring
- **Logs**: Centralized logging
- **Metrics**: Performance monitoring
- **Alerts**: Proactive notifications

## Future Enhancements

### Planned Improvements
1. **Multi-environment**: Staging/production
2. **Blue-green deployment**: Zero downtime
3. **Advanced monitoring**: APM integration
4. **Automated rollbacks**: Smart rollback logic
5. **Performance testing**: Load testing in CI/CD

### Advanced Features
1. **Canary deployments**: Gradual rollout
2. **Feature flags**: A/B testing support
3. **Database migrations**: Automated schema updates
4. **Backup automation**: Scheduled backups
5. **Security scanning**: SAST/DAST integration

## Support and Resources

### Documentation
- [Render Documentation](https://render.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [ESLint Configuration](https://eslint.org/docs/user-guide/configuring)

### Tools
- **Render CLI**: `npm install -g @render/cli`
- **GitHub CLI**: `gh auth login`
- **PostgreSQL Client**: `psql` for database access

### Contact
For CI/CD issues:
- Check GitHub Actions logs
- Review Render deployment logs
- Consult this documentation
- Contact development team 