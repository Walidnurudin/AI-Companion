# AI Companion

A minimal full-stack AI chat app with persona management and usage metrics.

## Quick Start 

**First time setup** (rebuilds native SQLite bindings):
```bash
npm run setup
npm run dev
```

**Subsequent runs**:
```bash
npm run dev
```

This starts both the backend (port 3001) and frontend (port 5173) simultaneously.

**Frontend**: http://localhost:5173  
**Backend API**: http://localhost:3001/api

## Setup

### 1. Initial Setup (First Time Only)

```bash
npm run setup
```

This installs all dependencies and rebuilds the native SQLite bindings for your platform.

### 2. Configure Environment Variables

Copy `.env.example` to both backend and frontend:

```bash
cp .env.example backend/.env
cp .env.example frontend/.env
```

Edit the files with your settings:

**backend/.env**:
```
PORT=3001
API_KEY=dev-123

# LLM Provider: mock, openai, or ollama
LLM_PROVIDER=mock
OPENAI_API_KEY=sk-your-key-here
OLLAMA_BASE_URL=http://localhost:11434
LLM_MODEL=gpt-3.5-turbo
```

**frontend/.env**:
```
VITE_API_URL=http://localhost:3001/api
VITE_API_KEY=dev-123
```

### 3. Run

```bash
npm run dev
```

## API Endpoints

All endpoints require the `x-api-key` header.

### Personas

**List all personas**:
```bash
curl http://localhost:3001/api/personas \
  -H "x-api-key: dev-123"
```

**Create a persona**:
```bash
curl -X POST http://localhost:3001/api/personas \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-123" \
  -d '{
    "name": "Helpful Assistant",
    "system_prompt": "You are a helpful and friendly assistant."
  }'
```

**Update a persona**:
```bash
curl -X PUT http://localhost:3001/api/personas/persona-1 \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-123" \
  -d '{
    "name": "Updated Name",
    "system_prompt": "Updated system prompt"
  }'
```

### Chat

**Send a message**:
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-123" \
  -d '{
    "user_id": "user-1",
    "persona_id": "persona-1",
    "message": "Hello, how are you?"
  }'
```

**Response**:
```json
{
  "reply": "I'm doing well, thank you for asking!",
  "latency_ms": 245,
  "tokens_used": 42
}
```

### Metrics

**Get usage summary**:
```bash
curl http://localhost:3001/api/metrics/summary \
  -H "x-api-key: dev-123"
```

**Response**:
```json
{
  "total_users": 5,
  "total_messages": 42,
  "personas": [
    {
      "persona_id": "persona-1",
      "name": "Helpful Assistant",
      "message_count": 20
    },
    {
      "persona_id": "persona-2",
      "name": "Creative Writer",
      "message_count": 22
    }
  ]
}
```

## Architecture

### Backend (Express + TypeScript)

- **Database**: SQLite (auto-initialized in `data/companion.db`)
- **LLM Providers**: Ollama, Mock, or OpenAI (pluggable)
- **Safety**: Banned term filtering for child safety
- **Auth**: API key via `x-api-key` header

**Key Files**:
- `src/index.ts` - Express server setup
- `src/routes/chat.ts` - Chat endpoint
- `src/routes/personas.ts` - Persona management
- `src/routes/metrics.ts` - Usage metrics
- `src/llm/` - LLM provider implementations
- `src/db.ts` - SQLite database setup

### Frontend (React + Vite + TypeScript)

- **Chat Page**: Select persona, chat thread, typing indicator
- **Dashboard**: Create/edit personas, view metrics table

**Key Files**:
- `src/App.tsx` - Main app with navigation
- `src/components/ChatPage.tsx` - Chat interface
- `src/components/DashboardPage.tsx` - Admin dashboard
- `src/api.ts` - API client

## Features

- ✅ Chat with AI personas
- ✅ Create/edit personas with custom system prompts
- ✅ Usage metrics (total users, messages, per-persona counts)
- ✅ Safety filtering (banned terms: minor, under 18, teen, child, high school)
- ✅ Pluggable LLM providers (Ollama, Mock, OpenAI)
- ✅ Latency tracking
- ✅ Typing indicator
- ✅ Auto-scrolling chat
- ✅ One-command dev setup

## Development

### Running Tests

```bash
npm run test
```

Tests are in `backend/src/__tests__/` and cover:
- Happy path chat flow
- Required field validation
- Safety violation handling

### Adding a New LLM Provider

1. Create a new file in `backend/src/llm/` implementing the `LLMProvider` interface
2. Add a case to `createLLMProvider()` in `backend/src/llm/factory.ts`
3. Update `.env.example` with new environment variables

### Database Schema

**personas**:
```sql
CREATE TABLE personas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  created_at INTEGER NOT NULL
)
```

**messages**:
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  persona_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  latency_ms INTEGER,
  tokens_used INTEGER,
  created_at INTEGER NOT NULL
)
```

## Troubleshooting

### SQLite Binding Error

If you see `Could not locate the bindings file` error:

```bash
npm run setup
```

This rebuilds the native SQLite bindings for your platform.

### Backend won't start

- Check that port 3001 is available
- Verify `.env` file exists in `backend/` directory
- Check that `data/` directory is writable
- Run `npm run setup` to rebuild native modules

### Frontend can't connect to backend

- Verify backend is running on port 3001
- Check `VITE_API_URL` in `frontend/.env`
- Check `VITE_API_KEY` matches backend `API_KEY`

### LLM not responding

- If using OpenAI: verify `OPENAI_API_KEY` is set correctly || check billing account on OpenAi account dashboard
- If using Ollama: verify Ollama is running on `OLLAMA_BASE_URL` || download ollama model used in this project
- Try switching to `LLM_PROVIDER=mock` for testing

## Notes

- Database file: `data/companion.db` (auto-created)
- Mock provider returns deterministic responses for testing
- All timestamps are Unix milliseconds
- Messages are stored per user/persona combination
- Safety check happens before LLM call for banned terms
