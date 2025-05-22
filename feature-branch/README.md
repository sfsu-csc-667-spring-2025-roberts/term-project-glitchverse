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