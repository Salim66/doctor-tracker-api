# Doctor Tracker API

## Description

Doctor Tracker API is the backend for a small clinic admin portal. It handles secure login and exposes REST endpoints for managing doctors, their patients, and dashboard analytics so the frontend can stay focused on UI.

## Setup Guide

### Requirements

- Node.js 18+
- MongoDB (local or Atlas)

### Steps

1. Clone the repository

```bash
git clone https://github.com/Salim66/doctor-tracker-api.git
cd doctor-tracker-api
```

2. Install dependencies

```bash
npm install
```

3. Create your env file

```bash
cp .env.example .env
```

Update `.env` with your MongoDB URI and JWT secret.

4. Seed sample data (optional but useful for demo)

```bash
npm run seed
```

Demo login after seed:

- Email: `admin@doctortracker.com`
- Password: `admin123`

5. Run the server

```bash
npm run dev
```

API base URL: `http://localhost:5000/api`

Health check: `GET /api/health`

### .env.example

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/doctor-tracker
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

## System Architecture

```text
Client (Next.js)
   |
   |  REST + JWT Bearer token
   v
Express API
   |
   |  Mongoose
   v
MongoDB
```

Flow:

1. Client sends login credentials to `POST /api/auth/login`
2. API verifies the user and returns a JWT
3. Client sends the token on protected requests
4. Controllers query MongoDB through Mongoose models
5. Dashboard stats are calculated with MongoDB aggregations

Main modules:

- `src/models` — User, Doctor, Patient
- `src/routes` + `src/controllers` — auth, doctors, patients, dashboard
- `src/middleware/auth.js` — JWT protection
- `src/scripts/seed.js` — demo data

## Technical Decisions

### 1. Separate Express API instead of Next.js API routes

The assignment asks for a separate frontend and backend with a live API URL. Keeping Express as its own service makes deployment clearer (Render for API, Vercel for client) and keeps auth, validation, and aggregations in one place.

### 2. MongoDB indexes for search, filter, and pagination

Doctor and patient lists support search and date filters. Text indexes and compound indexes were added so those queries stay efficient when the dataset grows, instead of scanning whole collections on every request.

## Visual Evidence

This is an API repository, so UI screenshots live in the client repo:

- [doctor-tracker-client screenshots](https://github.com/Salim66/doctor-tracker-client/tree/master/public/screenshots)

You can also verify endpoints with Postman using the seeded admin token.

## Main Endpoints

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/auth/login` | No |
| GET | `/api/auth/me` | Yes |
| GET/POST | `/api/doctors` | Yes |
| GET/PUT/DELETE | `/api/doctors/:id` | Yes |
| GET/POST | `/api/doctors/:id/patients` | Yes |
| GET/POST | `/api/patients` | Yes |
| GET/PUT/DELETE | `/api/patients/:id` | Yes |
| GET | `/api/dashboard/stats` | Yes |
