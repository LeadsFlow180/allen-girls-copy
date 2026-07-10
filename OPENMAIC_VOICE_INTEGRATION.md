# OpenMAIC Voice Integration Guide

This repository (`allen-girls-adventures`) integrates with a separate OpenMAIC repository for orchestration and ASR, plus an IndexTTS2 microservice for S.P.A.R.K voice synthesis.

This guide is the implementation contract for Phase 1.

## 1) Boundary and Ownership

- AGA repo owns: lesson UI, parent consent checks, student state/progress UI, secure API proxy routes.
- OpenMAIC repo owns: lesson orchestration, agent turn logic, ASR flow, TTS provider execution.
- IndexTTS2 service owns: voice synthesis (`spark_tts_service.py`).
- Claude API is called server-side only (no client-side secret exposure).

## 2) Required Environment Variables (AGA)

Add these to AGA `.env.local`:

```bash
# OpenMAIC service base URL (separate repo deployment)
OPENMAIC_BASE_URL=http://localhost:4000

# Service-to-service auth token shared with OpenMAIC
OPENMAIC_SERVICE_TOKEN=replace_with_strong_token

# Local route timeout budget in milliseconds
OPENMAIC_TIMEOUT_MS=30000
```

## 3) AGA API Proxy Endpoints (implemented in this repo)

These routes are server-side proxies so browser code never talks directly to OpenMAIC:

- `POST /api/voice/session/start`
- `POST /api/voice/practice/attempt`
- `POST /api/voice/session/complete`

### Request/Response Contracts

#### `POST /api/voice/session/start`

Request:

```json
{
  "learnerId": "uuid-or-stable-student-id",
  "lessonId": "section-1-unit-1",
  "phase": "start",
  "targetLanguage": "es",
  "phrase": "Hola"
}
```

Response:

```json
{
  "sessionId": "voice_session_id",
  "audioUrl": "https://.../audio.wav",
  "mode": "instructional"
}
```

#### `POST /api/voice/practice/attempt`

Request:

```json
{
  "sessionId": "voice_session_id",
  "learnerId": "uuid-or-stable-student-id",
  "targetPhrase": "Hola",
  "attemptAudioBase64": "base64-encoded-audio",
  "attemptIndex": 1,
  "maxAttempts": 3,
  "targetLanguage": "es"
}
```

Response:

```json
{
  "transcript": "ola",
  "score": 0.82,
  "attemptIndex": 1,
  "isPass": true,
  "feedbackText": "Great job. Keep the H soft and clear.",
  "feedbackAudioUrl": "https://.../feedback.wav",
  "mode": "encouraging"
}
```

#### `POST /api/voice/session/complete`

Request:

```json
{
  "sessionId": "voice_session_id",
  "learnerId": "uuid-or-stable-student-id",
  "lessonId": "section-1-unit-1",
  "phase": "finish",
  "xpEarned": 10
}
```

Response:

```json
{
  "saved": true,
  "summaryText": "You improved pronunciation in this session.",
  "summaryAudioUrl": "https://.../summary.wav"
}
```

## 4) OpenMAIC Endpoints To Implement (in separate repo)

OpenMAIC must expose:

- `POST /api/voice/session/start`
- `POST /api/voice/practice/attempt`
- `POST /api/voice/session/complete`

OpenMAIC responsibilities per endpoint:

- `session/start`: initialize orchestration context and return first audio line for S.P.A.R.K.
- `practice/attempt`: run ASR, score with Claude, synthesize feedback with IndexTTS2, return structured result.
- `session/complete`: persist summary and generate close-out feedback line.

## 5) Security and COPPA Rules

- Never expose Anthropic keys or service tokens to client code.
- Never store child raw voice audio beyond processing window.
- Require explicit parent consent before enabling microphone for practice phase.
- Use short-lived URLs for synthesized audio.
- Keep mic usage logs available for parent audit surfaces.

## 6) Phase 1 Implementation Checklist

- [x] Add AGA voice proxy route structure and typed validation.
- [x] Add OpenMAIC forwarding client with timeout and auth header.
- [ ] Add parent consent gate in lesson practice UI before mic enable.
- [ ] Wire mission step to call AGA voice endpoints.
- [ ] Validate E2E: phrase modeling -> mic attempt -> scoring -> spoken feedback.

## 7) Test Plan

- AGA route validation rejects malformed payloads with `400`.
- Missing OpenMAIC env config returns deterministic `500` with clear error code.
- OpenMAIC non-2xx responses are propagated with normalized error envelope.
- Timeout path returns `504` from AGA proxy layer.
- Happy path returns audio URLs and score data for mission UI consumption.

