

Key Security Measures

1. Authentication & Authorization
Google Authentication
Why we chose it:
Implementing authentication from scratch is risky and time-consuming. Using Google Auth gives us a secure, trusted solution that users are already familiar with.

What makes it a good choice:

Users can log in quickly using their Google accounts no need to remember another password

Leverages Google’s secure authentication infrastructure, reducing the risk of security flaws

Simplifies account creation and login flow, improving user experience

Easy to integrate into both backend (OAuth2.0) and frontend with minimal setup

Ensures we meet modern security standards like token expiration, refresh tokens, and scopes


JWT (JSON Web Tokens): Stateless login with signed tokens including user ID and email. Tokens expire after 24 hours.

Password Hashing: Uses bcrypt (12 rounds) for strong password encryption.

Logout Security: Blacklisted tokens are stored in memory to prevent reuse.

2. Input Validation & Sanitization

Validation: Express-validator enforces format and strength rules for fields like email, password, and username.

XSS Protection: All input fields are sanitized with the xss library.

Request Limits: Payloads are limited to 10MB to prevent abuse.

3. Rate Limiting & DDoS Mitigation

Request Caps: Max 100 requests per 15 minutes per IP using express-rate-limit.

Slowdown Logic: Requests beyond the limit are delayed progressively using express-slow-down.

Custom Limits: Separate throttling for login, registration, and other sensitive routes.

4. Security Headers

Helmet.js: Sets secure HTTP headers, including content security policies.

Custom Headers: Blocks framing, sniffing, and enforces referrer policy.

5. CORS Configuration

Restricted Origins: Only requests from allowed frontends are accepted.

Credentialed Requests: Supports cookies and auth headers securely.

6. HTTP Parameter Pollution (HPP)

HPP Middleware: Prevents attackers from exploiting duplicate query parameters.

7. Database Protection

ORM Safety: Sequelize uses parameterized queries to prevent SQL injection.

Secure Connections: Enforced SSL between app and NeonDB.

8. Error Handling

Generic Messages: In production, errors don't leak internal info.

Central Handler: All API errors pass through a central logging and response system.