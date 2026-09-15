# Online Survey & Analytics Platform

A full-stack web application for creating, moderating, completing, and analyzing online surveys. The project includes role-based access, four survey types, analytics, an administration dashboard, and a bilingual Ukrainian/English interface.

## Main features

- Registration and JWT authentication
- Roles: `user`, `advanced`, and `admin`
- Advanced-access request workflow for standard users
- Survey creation, editing, activation/deactivation, moderation, and deletion
- Single choice, multiple choice, text response, and 1–5 rating surveys
- Public/private surveys and public survey discovery
- One response per user per survey
- Results and charts for survey owners and administrators
- Administration dashboard and read-only database viewer
- Ukrainian / English interface with persistent language selection
- MySQL / Aiven MySQL support with TLS

## Tech stack

**Frontend:** React 19, React Router, Axios, Bootstrap, Recharts  
**Backend:** Node.js, Express, MySQL2, JWT, bcrypt  
**Database:** MySQL

## Project structure

```text
backend/     Express REST API, authentication, business logic
database/    MySQL schema
frontend/    React client
```

## Requirements

- Node.js 20 or 22 LTS recommended (Node.js 24 also runs the project but older Create React App dependencies may print deprecation warnings)
- npm
- MySQL-compatible database (local MySQL or Aiven MySQL)

## Using the existing Aiven database

If you already have the Aiven database used by this project, **do not import `database/schema.sql` again**. Keep the existing cloud database and configure the backend with its current connection details. Existing users, surveys, votes, and analytics remain in Aiven and are not stored in this repository.

Copy your existing private `backend/.env` into the updated project, or create it from `.env.example`. Never commit that file.

## Fresh database setup

For a new empty database, import:

```text
database/schema.sql
```

The schema is compatible with the Aiven setting `sql_require_primary_key` and creates the application tables plus default categories. Do not run it over an already populated database unless you intentionally want to perform a fresh setup.

## Backend setup

```bash
cd backend
npm install
```

Create the private environment file:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Example configuration:

```env
PORT=5000
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=4h

DBHOST=localhost
DBPORT=3306
DBNAME=onlinevoting_db
DBUSER=root
DBPASS=your_database_password
DBSSL=false
DBCA=
DB_CONNECTION_LIMIT=10

CORS_ORIGINS=http://localhost:3000
```

For Aiven, use the host, port, username, password, and database shown in the Aiven console. Put the downloaded CA certificate at `backend/config/ca.pem`. When `DBSSL` is not explicitly set, remote database hosts are automatically treated as TLS connections.

Start the API:

```bash
npm start
```

Health check:

```text
http://localhost:5000/health
```

A healthy response reports both the API and database connection.

## Frontend setup

```bash
cd frontend
npm install
```

Optional environment file:

```bash
cp .env.example .env
```

For local development the default API URL is already `http://localhost:5000`.

Start the client:

```bash
npm start
```

Open:

```text
http://localhost:3000
```

The **EN / UA** button in the lower-right corner switches the interface language. The selection is stored in the browser.

## Roles and first administrator

New registrations always receive the safe default role `user`. A user can request `advanced` access from Settings; an administrator can approve that request.

For a completely fresh installation, promote the first trusted administrator directly in your database console once:

```sql
UPDATE users SET role = 'admin' WHERE username = 'your_username';
```

Log out and sign in again after changing a role so the JWT reflects the current permissions.

## Production configuration

Frontend:

```env
REACT_APP_API_URL=https://your-api.example.com
```

Backend:

```env
CORS_ORIGINS=https://your-frontend.example.com
```

Multiple allowed origins can be comma-separated. Keep all secrets only in the hosting provider's environment-variable settings.

## Verification

Frontend production build:

```bash
cd frontend
npm run build
```

Frontend tests:

```bash
npm test -- --watchAll=false
```

The project deliberately does not use `npm audit fix --force` automatically because forced dependency upgrades can introduce breaking changes in the Create React App toolchain.

## Security notes

- `.env` is ignored and must never be committed.
- Registration cannot self-assign elevated roles.
- Password hashes are not returned by administration APIs.
- Administrative SQL access is read-only and blocks sensitive fields.
- Full survey results are limited to the survey owner and administrators.
- Use a strong unique `JWT_SECRET` and rotate any credential that is accidentally exposed.

## Author

Nikita Savchuk
