## Features

- React + TypeScript frontend
- Express + TypeScript backend
- Raw fetch integration with the mimOE local inference API
- Streaming response from backend to frontend
- Minimal local AI agent flow
- UI filtering for `<think>` tags from local reasoning models
- Basic error handling for local endpoint failures

---

## Architecture

```text
React UI
  |
  | POST /api/agent/stream
  v
Express Backend
  |
  | buildAgentMessages()
  | streamMimoeChat()
  | raw fetch with stream=true
  v
mimOE local OpenAI-compatible endpoint
  |
  v
Local model, e.g. qwen3-1.7b
```

The frontend does not call mimOE directly. The Express backend owns:

- endpoint configuration
- API key usage
- prompt construction
- streaming response handling
- error handling

---

## Why Raw Fetch

Since mimOE exposes an OpenAI-compatible HTTP endpoint, raw fetch keeps the integration transparent, easy to debug, and easy to explain.

---

## Streaming

The frontend uses a single streaming endpoint:

```text
POST /api/agent/stream
```

The backend calls mimOE with:

```json
{
  "stream": true
}
```

Then it forwards tokens to the browser using Server-Sent Events.

This gives the user a real-time local inference experience while keeping mimOE configuration on the backend.

---

## API Endpoints

### POST `/api/agent/stream`

Streams a response from the local mimOE model.

Request:

```json
{
  "message": "Explain what local AI inference means in simple terms."
}
```

The response is streamed as Server-Sent Events:

```text
event: token
data: {"token":"..."}

event: done
data: {"ok":true}
```

---

## Setup

### 1. Start mimOE Studio

Install mimOE Studio, load a local model, and open the API panel.

Example model:

```text
qwen3-1.7b
```

Example endpoint:

```text
http://10.0.0.27:8083/mimik-ai/openai/v1
```

---

### 2. Run the backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Example `.env`:

```env
PORT=4000
MIMOE_BASE_URL=http://10.0.0.27:8083/mimik-ai/openai/v1
MIMOE_API_KEY=1234
MIMOE_MODEL=qwen3-1.7b
```

Backend runs at:

```text
http://localhost:4000
```

---

### 3. Run the frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs at the Vite local URL, usually:

```text
http://localhost:5173
```
