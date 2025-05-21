# Game Framework Project

A multiplayer game framework built with TypeScript, Express, PostgreSQL, and WebSocket.

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

