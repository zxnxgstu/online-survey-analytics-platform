# Security Policy

Do not commit `.env` files, database passwords, JWT secrets, or hosting credentials.

If a secret is exposed, rotate it immediately and remove it from Git history before publishing the repository.

## Application safeguards

- New accounts always start with the `user` role.
- Elevated roles are controlled by administrators.
- Password hashes are excluded from profile/admin responses.
- Database administration queries are read-only and sensitive fields are blocked.
- Survey result access is restricted to survey owners and administrators.
- CORS origins can be restricted with `CORS_ORIGINS` in production.

For a production deployment, use HTTPS, strong secrets, a managed database with TLS, and provider-managed environment variables.
