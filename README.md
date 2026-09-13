# Online Survey and Analytics Platform

Bachelor qualification project: a full-stack web application for creating, publishing, completing, and analyzing online surveys.

## Features

- User registration and JWT-based authentication
- Role-based access for users, advanced users, and administrators
- Survey creation and management
- Multiple survey types: single choice, multiple choice, text responses, and rating scales
- Public and private survey workflows
- Response collection and result analytics
- Charts and reporting
- Administration and moderation workflows
- MySQL-backed data storage

## Tech stack

### Frontend
- React 19
- React Router
- Axios
- Bootstrap
- Recharts

### Backend
- Node.js
- Express
- MySQL
- JWT
- bcrypt

## Project structure

```text
backend/     Express REST API and business logic
frontend/    React client application
database/    MySQL schema
```

## Local setup

### Requirements

- Node.js 22+ recommended
- MySQL 5.7+ / compatible MySQL server

### 1. Database

Create a database named `onlinevoting_db`, then import:

```text
database/schema.sql
```

The public repository contains the database schema only. User records, password hashes, and other local development data were intentionally removed.

### 2. Backend

```bash
cd backend
npm install
```

Copy the example environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Fill in your MySQL settings and use a strong random `JWT_SECRET`, then start the API:

```bash
npm start
```

The backend runs on `http://localhost:5000` by default.

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

The frontend runs on `http://localhost:3000` by default and connects to the backend at `http://localhost:5000`.

## Security notes

- Real `.env` files are intentionally excluded from version control.
- The repository includes `.env.example` with placeholders only.
- The database dump was sanitized to remove users, emails, password hashes, votes, and other populated development records.
- JWT secrets and database credentials must be configured locally.

## Academic context

Developed as a Bachelor qualification project in Software Engineering at Kryvyi Rih National University. The project focuses on client-server architecture, REST APIs, relational database design, authentication/authorization, survey management, analytics, and testing.
