# Security Documentation

## Overview

This document outlines the comprehensive security measures implemented in the SDP Project backend API. The security architecture follows industry best practices and provides multiple layers of protection against common web application vulnerabilities.

## Security Layers

### 1. Authentication & Authorization

#### JWT (JSON Web Tokens)
- **Implementation**: Stateless authentication using JWT
- **Token Structure**: `{ id: user.id, email: user.email }`
- **Expiration**: Configurable via `JWT_EXPIRES_IN` (default: 24h)
- **Secret**: Strong secret key via `JWT_SECRET`

#### Password Security
- **Hashing**: bcryptjs with configurable rounds (default: 12)
- **Salt**: Automatic salt generation
- **Validation**: Strong password requirements
- **Comparison**: Secure password comparison method

#### Token Blacklisting
- **Purpose**: Invalidate tokens on logout
- **Storage**: In-memory Set with automatic cleanup
- **Timeout**: 24-hour cleanup for old tokens
- **Implementation**: `blacklistToken()` and `isTokenBlacklisted()`

### 2. Input Validation & Sanitization

#### Express Validator
```javascript
// Registration validation
userValidation.register = [
  body('email').isEmail().normalizeEmail(),
  body('username').isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
  body('first_name').optional().isLength({ min: 1, max: 50 }),
  body('last_name').optional().isLength({ min: 1, max: 50 })
];
```

#### XSS Protection
- **Library**: `xss` package
- **Implementation**: `sanitizeInput` middleware
- **Scope**: All string values in request body
- **Sanitization**: HTML entity encoding

#### Request Size Limiting
- **Limit**: 10MB maximum request size
- **Implementation**: `requestSizeLimit` middleware
- **Response**: 413 Payload Too Large

### 3. Rate Limiting & DDoS Protection

#### Express Rate Limiting
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: 'Too many requests' }
});
```

#### Express Slow Down
```javascript
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100, // After 100 requests
  delayMs: (used, req) => {
    const delayAfter = req.slowDown.limit;
    return (used - delayAfter) * 500; // 500ms per request
  }
});
```

#### Specific Rate Limiters
- **Authentication**: `authLimiter` for login attempts
- **Registration**: `registerLimiter` for signup attempts
- **Custom Limits**: Configurable via environment variables

### 4. HTTP Security Headers

#### Helmet.js Configuration
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
```

#### Custom Security Headers
```javascript
const securityHeaders = (req, res, next) => {
  res.removeHeader('X-Powered-By');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
};
```

### 5. CORS (Cross-Origin Resource Sharing)

#### Configuration
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

#### Security Features
- **Origin Restriction**: Configurable allowed origins
- **Credentials**: Support for cookies and authentication
- **Methods**: Explicitly allowed HTTP methods
- **Headers**: Controlled header access

### 6. HTTP Parameter Pollution Protection

#### HPP Middleware
```javascript
const hppMiddleware = hpp();
app.use(hppMiddleware);
```

#### Protection Against
- **Array Pollution**: `?user=john&user=jane`
- **Object Pollution**: `?user[name]=john&user[email]=john@example.com`
- **Type Confusion**: Multiple parameter types

### 7. Database Security

#### SQL Injection Prevention
- **ORM**: Sequelize with parameterized queries
- **Validation**: Input validation before database operations
- **Escaping**: Automatic parameter escaping

#### Connection Security
```javascript
dialectOptions: {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
}
```

### 8. Error Handling & Information Disclosure

#### Centralized Error Handler
```javascript
// middleware/errorHandler.js
app.use((error, req, res, next) => {
  // Generic error messages in production
  // Detailed errors only in development
});
```

#### Security Features
- **No Stack Traces**: In production
- **Generic Messages**: For security errors
- **Logging**: Secure error logging
- **Status Codes**: Proper HTTP status codes

## Security Middleware Stack

### Order of Execution
1. **Helmet** - Security headers
2. **Security Headers** - Custom headers
3. **HPP** - Parameter pollution protection
4. **Request Size Limit** - Payload size control
5. **Slow Down** - Progressive rate limiting
6. **CORS** - Cross-origin configuration
7. **Compression** - Response compression
8. **Body Parsers** - Request parsing
9. **Morgan** - Request logging
10. **Rate Limiting** - Global rate limiting
11. **Routes** - Application routes
12. **Error Handler** - Error processing

## Environment Variables for Security

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000

# Security
ALLOWED_IPS=127.0.0.1,::1
SESSION_SECRET=your-super-secret-session-key
BCRYPT_ROUNDS=12
```

## Security Testing

### Manual Testing Checklist

#### Authentication
- [ ] Test weak passwords (should be rejected)
- [ ] Test multiple login attempts (should be rate limited)
- [ ] Test invalid tokens (should be rejected)
- [ ] Test expired tokens (should be rejected)
- [ ] Test logout (should blacklist token)

#### Input Validation
- [ ] Test XSS attempts in input fields
- [ ] Test SQL injection attempts
- [ ] Test large request bodies
- [ ] Test malformed JSON
- [ ] Test parameter pollution

#### Rate Limiting
- [ ] Test rapid requests (should be limited)
- [ ] Test progressive slowdown
- [ ] Test different endpoints
- [ ] Test IP-based limiting

#### Headers
- [ ] Verify security headers are present
- [ ] Test CORS restrictions
- [ ] Verify no information disclosure

### Automated Testing

#### Security Headers Test
```bash
curl -I http://localhost:3000/health
# Check for security headers in response
```

#### Rate Limiting Test
```bash
# Test rate limiting
for i in {1..110}; do
  curl -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test"}'
done
```

#### XSS Test
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"test","password":"Test123!","first_name":"<script>alert(\"xss\")</script>"}'
```

## Security Best Practices

### 1. Production Deployment

#### Environment Security
- [ ] Use strong, unique secrets
- [ ] Enable HTTPS only
- [ ] Set proper CORS origins
- [ ] Disable database sync
- [ ] Use environment-specific configs

#### Database Security
- [ ] Use connection pooling
- [ ] Enable SSL connections
- [ ] Regular security updates
- [ ] Backup encryption
- [ ] Access logging

#### Server Security
- [ ] Keep dependencies updated
- [ ] Use security headers
- [ ] Implement logging
- [ ] Monitor for attacks
- [ ] Regular security audits

### 2. Development Security

#### Code Security
- [ ] Input validation on all endpoints
- [ ] Proper error handling
- [ ] No sensitive data in logs
- [ ] Secure default configurations
- [ ] Regular dependency updates

#### Testing Security
- [ ] Security testing in CI/CD
- [ ] Automated vulnerability scanning
- [ ] Penetration testing
- [ ] Code security reviews

## Security Monitoring

### Logging
- **Authentication Events**: Login attempts, failures, successes
- **Rate Limiting**: Blocked requests, slow-down events
- **Security Violations**: XSS attempts, injection attempts
- **Error Tracking**: Security-related errors

### Alerts
- **Failed Login Attempts**: Multiple failures from same IP
- **Rate Limiting**: Excessive requests
- **Security Headers**: Missing or incorrect headers
- **Database Errors**: Connection or query issues

## Incident Response

### Security Breach Response
1. **Immediate Actions**
   - Block suspicious IPs
   - Rotate secrets
   - Review logs
   - Assess impact

2. **Investigation**
   - Analyze attack vectors
   - Review security logs
   - Check for data compromise
   - Document findings

3. **Recovery**
   - Patch vulnerabilities
   - Update security measures
   - Notify stakeholders
   - Implement additional protections

## Compliance

### GDPR Compliance
- **Data Minimization**: Only collect necessary data
- **User Rights**: Right to be forgotten, data portability
- **Consent Management**: Track user consent
- **Data Protection**: Encrypt sensitive data

### OWASP Top 10
- ✅ **A01:2021 - Broken Access Control**: JWT authentication, role-based access
- ✅ **A02:2021 - Cryptographic Failures**: HTTPS, secure JWT, bcrypt
- ✅ **A03:2021 - Injection**: Input validation, parameterized queries
- ✅ **A04:2021 - Insecure Design**: Security-first architecture
- ✅ **A05:2021 - Security Misconfiguration**: Secure defaults, headers
- ✅ **A06:2021 - Vulnerable Components**: Regular updates, monitoring
- ✅ **A07:2021 - Authentication Failures**: Strong auth, rate limiting
- ✅ **A08:2021 - Software and Data Integrity**: Secure dependencies
- ✅ **A09:2021 - Security Logging**: Comprehensive logging
- ✅ **A10:2021 - SSRF**: Input validation, URL restrictions

## Future Security Enhancements

### Planned Improvements
1. **Multi-Factor Authentication (MFA)**
2. **API Key Management**
3. **Advanced Monitoring**
4. **Automated Security Testing**
5. **Threat Intelligence Integration**

### Advanced Security Features
1. **Behavioral Analysis**
2. **Machine Learning Detection**
3. **Real-time Threat Response**
4. **Advanced Encryption**
5. **Zero-Trust Architecture**

## Security Resources

### Tools
- **OWASP ZAP**: Web application security scanner
- **Nmap**: Network security scanner
- **Burp Suite**: Web application security testing
- **SonarQube**: Code quality and security

### References
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practices-security.html)
- [JWT Security](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

## Contact

For security issues or questions:
- Review this documentation
- Check security logs
- Contact security team
- Follow incident response procedures 