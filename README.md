# Zentro - Zen Productivity App

A minimalist and calming productivity tool that helps users stay focused using the Pomodoro technique, task management, and a unique reward/punishment system.

## Features

- 🎯 Pomodoro Timer (25/5 minutes)
- ✅ Task Management
- 🎁 Reward System
- ⚡ Punishment System
- 🔐 User Authentication

## Tech Stack

- Frontend: React + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB
- Authentication: JWT + bcrypt

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd zentro-timer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `server` directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/zentro
   JWT_SECRET=your-very-secret-key
   ```

4. Start the development server:
   ```bash
   npm run dev:full
   ```

This will start both the frontend (Vite) and backend (Express) servers concurrently.

## Usage

1. Register a new account
2. Add some tasks
3. Start a Pomodoro session
4. Complete tasks and earn rewards
5. Stay focused and avoid punishments!

## Development

- Frontend runs on: http://localhost:5173
- Backend runs on: http://localhost:5000

## License

MIT
