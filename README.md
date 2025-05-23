# Game Framework Project

A multiplayer game framework built with TypeScript, Express, PostgreSQL, and WebSocket.

## Core Features

### 1. User System

- Registration/Login
- Profile Management
- Avatar Upload

### 2. Game System

- Game Lobby
- Game Room Creation
- Real-time Game Battles

### 3. Social Features

- Real-time Chat
- In-game Communication

### 4. Data Storage

- PostgreSQL Database
- User Data Persistence
- Game State Management

## Tech Stack

- Frontend: TypeScript, WebSocket
- Backend: Node.js, Express
- Database: PostgreSQL
- Template Engine: EJS
- Styling: CSS Modules

## Development Tools

- Husky (Git Hooks)
- ESBuild (Build Tool)
- Node-PG-Migrate (Database Migration)


## Getting Started

### 1. Environment Setup

Create a `.env` file in the project root directory with the following configuration:

```env
# Database Configuration
DATABASE_URL=postgres://postgres:csc667@localhost:5432/glitchverse

# Session Configuration
SESSION_SECRET=your_session_secret_here
```
### 2. Install Dependencies
```bash
npm install
```
### 3. Database Migration
```bash
npm run db:migrate
```
### 4. Start Development Server
```bash
npm run start:dev
```

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm (comes with Node.js)

## Database Setup

1. Install PostgreSQL from [official website](https://www.postgresql.org/download/)
2. During installation, set password as 'csc667'
3. Start PostgreSQL service
4. Open SQL Shell (psql) and connect:
   ```bash
   psql -U postgres
   CREATE DATABASE glitchverse;
\c glitchverse

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  image VARCHAR(255)
);

CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES games(id),
  username VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO games (name, description, status, image) VALUES 
('Bingo', 'Bingo game for multiple players', 'waiting', '/assets/bingo.jpg'),
('Poker', 'Classic card game for multiple players', 'waiting', '/assets/poker.jpg'),
('Chess', 'Strategic board game for multi-players', 'waiting', '/assets/chess.jpg');

