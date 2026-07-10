# AI School ↔ Allen Girls Adventures — playback contract

Use this document in the **AI School** repo (Cursor agent prompt below).  
AGA uses a **single classroom id** everywhere: `l4gHC6hvRo` (override with `AI_SCHOOL_DEFAULT_CLASSROOM_ID` / `NEXT_PUBLIC_LEARN_CLASSROOM_ID`).

## Model

| Layer | Meaning |
|--------|--------|
| **Classroom** | One embed (`/classroom/l4gHC6hvRo`) with **N slides** (default **5**). Progress within a session = slide index. |
| **Ladder step** | One of `start`, `lesson`, `chest`, `practice`, `review` on Explore — **each step = one full classroom run**. |
| **Unit** | 5 ladder steps; when all 5 are **complete**, Explore opens **next unit**, first ladder step. |

## Signed redirect payload (AGA → AI School)

AGA opens:

`/classroom/l4gHC6hvRo?payload=<base64>&sig=<hmac>`

Decoded payload fields (extend as needed):

```json
{
  "learnerId": null,
  "guestSessionId": "uuid",
  "language": "es",
  "sectionId": 1,
  "unitIndex": 0,
  "step": "start",
  "dbSectionId": 1,
  "dbUnitId": 1,
  "classroomId": "l4gHC6hvRo",
  "resumeSceneIndex": 2,
  "resumeSceneId": "bqi9RS5oNgB2A8S5q2QLk",
  "totalSlides": 5,
  "issuedAt": "...",
  "expiresAt": "...",
  "nonce": "...",
  "source": "allen-girls-adventures"
}
```

**Resume:** If `resumeSceneIndex` / `resumeSceneId` are set, open the classroom on that slide (user left off).

## POST `/api/learn/content` (AI School → AGA)

HMAC sign the JSON body (same secret as redirect). Send on slide change and on mission end.

### `status: "progress"` (each slide / skip)

```json
{
  "learnerId": null,
  "guestSessionId": "<same uuid as redirect>",
  "status": "progress",
  "source": "allen-girls-adventures",
  "sig": "<hmac>",
  "details": {
    "classroomId": "l4gHC6hvRo",
    "sectionId": 1,
    "unitIndex": 0,
    "dbSectionId": 1,
    "dbUnitId": 1,
    "ladderStep": "start",
    "ladderStepIndex": 0,
    "totalSlides": 5,
    "currentSceneId": "<scene id>",
    "sceneIndex": 2,
    "actionIndex": 1,
    "consumedDiscussions": [],
    "playbackCompleted": false
  }
}
```

- **`sceneIndex`**: 0-based slide index (0..totalSlides-1).
- **`totalSlides`**: actual slide count for this classroom from AI-School (not a fixed default).
- **`playbackCompleted`**: `true` when the **current slide** finished — resume checkpoint only. Does **not** mean the ladder mission is done.

### `status: "complete"` (one ladder mission / classroom finished)

Same shape, with mission completion signaled by row status and/or explicit flag:

```json
"status": "complete",
"missionComplete": true
```

`playbackCompleted` may also be `true` on the last slide, but **mission-complete UI** must use `status === "complete"` or `details.missionComplete === true`, not `playbackCompleted` alone.

AGA stores `missionComplete` on the matching `details.stepProgress` entry and increments completed ladder steps. When a unit reaches **5** missions, Explore advances to the **next unit**.

### `status: "quiz"` — graded quiz (does NOT complete a ladder mission)

```json
{
  "status": "quiz",
  "guestSessionId": "<uuid>",
  "source": "allen-girls-adventures",
  "sig": "<hmac>",
  "details": {
    "classroomId": "l4gHC6hvRo",
    "ladderStep": "lesson",
    "sceneIndex": 2
  },
  "quiz": {
    "sceneId": "...",
    "classroomId": "l4gHC6hvRo",
    "score": 8,
    "totalPoints": 10,
    "percent": 80,
    "correctCount": 8,
    "incorrectCount": 2,
    "questionCount": 10,
    "submittedAt": "2026-05-22T12:00:00.000Z",
    "results": [{ "questionId": "q1", "status": "correct", "earned": 1 }],
    "answers": { "q1": "option-a" }
  }
}
```

AGA inserts `learn_quiz_submissions` and stores `lastQuiz` on `learn_playback_progress.details`. Response: `{ ok: true, persisted: true, kind: "quiz" }`.

## HMAC (AGA verification)

1. Remove `sig` from body; `source` must be `allen-girls-adventures`.
2. `b64 = Buffer.from(JSON.stringify(bodyWithoutSig), 'utf8').toString('base64')` (standard base64).
3. `sig = HMAC-SHA256(AI_SCHOOL_REDIRECT_SECRET, b64).hex`
4. Reject if `details.expiresAt` is in the past.

## Classroom id

Always use **`l4gHC6hvRo`** in `details.classroomId` until multi-classroom is added.

## Cursor agent prompt (paste in AI School project)

```
Integrate Allen Girls Adventures (AGA) playback sync for classroom l4gHC6hvRo.

Requirements:
1. Read signed query params payload+sig on /classroom/[id]. Decode base64 JSON. Verify HMAC with AI_SCHOOL_REDIRECT_SECRET (sha256 over base64 payload bytes, same as AGA redirect route).

2. Resume: only when AGA sends resume for the **same** ladder mission. `resumeSceneIndex: 0` + `resumePlaybackCompleted: false` = start slide 1 (new classroom). Non-zero `resumeSceneIndex` or in-progress same mission = resume that slide. Do **not** reuse the DB row's top-level `scene_index` when opening a different `payload.step`. `payload.totalSlides` is the real classroom slide count.

3. On every slide change (and when user skips), POST to AGA NEXT_PUBLIC_AGA_URL or configured host + /api/learn/content with signed body:
   - status: "progress"
   - guestSessionId from payload (or learnerId if logged in)
   - details: classroomId "l4gHC6hvRo", sectionId, unitIndex, dbSectionId, dbUnitId, ladderStep (= payload.step), ladderStepIndex (0-4 for start..review), totalSlides (5), sceneIndex (0-based), currentSceneId, actionIndex, consumedDiscussions[], playbackCompleted false

4. When user finishes all slides for this ladder visit (one full classroom session), POST status: "complete" with missionComplete true (and totalSlides from the classroom). playbackCompleted true on the last slide is optional resume metadata only.

5. Ladder semantics: payload.step is one of start|lesson|chest|practice|review — one classroom run per step. Do not mix ladder steps in one session without updating ladderStep in details.

6. Do not change AGA repo. Only AI School: classroom player, slide index state, resume on load, and content API client with shared secret signing.

Reference: AGA docs/AI_SCHOOL_PLAYBACK_INTEGRATION.md in allen-girls-adventures repo.
```
