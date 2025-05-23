# Game Framework Project

A multiplayer game framework built with TypeScript, Express, PostgreSQL, and WebSocket.

## Members of Group 13

- Eiffel Valentino
- Jiqing Liu
- Shoaib Perouz
- Alexander Diaz

## Core Features

### 1. User System

- [x] Registration/Login
- [x] Profile Management
- [ ] Avatar Upload

### 2. Game System

- [x] Game Lobby
- [x] Game Room Creation
- [x] Real-time Game Battles

### 3. Social Features

- [x] Real-time Chat
- [x] In-game Communication

### 4. Data Storage

- [x] PostgreSQL Database
- [x] User Data Persistence
- [x] Game State Management

## Tech Stack

- Frontend: TypeScript, WebSocket
- Backend: Node.js, Express, Socket.IO
- Database: PostgreSQL
- Template Engine: EJS
- Styling: CSS Modules

## Development Tools

- Husky (Git Hooks)
- ESBuild (Build Tool)
- Node-PG-Migrate (Database Migration)

## Getting Started

### 0. Prerequisites

Before you begin, ensure you have installed:

- Node.js (v20 or higher)
- PostgreSQL (v12 or higher)

### 1. Environment Setup

After cloning the repository, create a `.env` file in the project root directory with the following configuration:

```env
## Database Configuration
# Example: postgres://postgres:testpassword@localhost:5432/glitchverse
DATABASE_URL={point_to_postgres_database}

## Session Configuration
# Type a randomized hash here
SESSION_SECRET={your_session_secret_here}
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Migration

```bash
npm run db:migrate
```

> Make sure your `DATABASE_URL` is set properly with credentials and the PostgreSQL server also has the database created.

### 4. Start Development Server

```bash
npm run start:dev
```
