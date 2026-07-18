# Security Plan

## Password Security

Passwords are hashed using bcrypt.

Plain-text passwords are never stored.

---

## JWT Security

JWT tokens contain:

- user_id
- email
- role
- expiration timestamp

Sensitive information is never stored inside JWT.

---

## Authorization

Role-based access control is implemented using:

- ADMIN
- TEACHER
- STUDENT

---

## Secret Management

Application secrets are stored using environment variables.

Examples:

- SECRET_KEY
- DATABASE_URL
- SMTP_PASSWORD

---

## Future Security Enhancements

- Refresh Tokens
- Account Lockout
- Rate Limiting
- Multi-Factor Authentication