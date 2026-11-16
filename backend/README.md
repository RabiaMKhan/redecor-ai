# Redecor AI — API

Backend for **Redecor AI**. A user uploads a photo of a room or any part of their home (hallway, balcony, kitchen corner, staircase, patio…). Claude (Anthropic) studies the photo and writes a plan: overview paragraphs, a design direction, a 5-colour palette, 4–8 concrete changes and what to keep. Then Replicate's FLUX Kontext edits **the same photo** into the redesigned version, so the user gets a before/after visual at the end.

Express + MongoDB (Mongoose), JWT auth with email OTP verification, CommonJS JavaScript.

## Setup

```bash
npm install
cp .env.example .env   # then set JWT_SECRET at least
npm run dev            # nodemon, http://localhost:8080
npm test               # node:test + supertest, uses the redecor_ai_test database
```

Needs Node 22 (pinned in `package.json` for Vercel; newer versions work locally) and MongoDB (local `mongodb://127.0.0.1:27017` or Atlas).

## Environment

| Variable | Required | What it does |
|---|---|---|
| `PORT` | no | Default `8080` |
| `MONGO_URL` or `MONGODB_URI` | yes | MongoDB connection string. Vercel's MongoDB Atlas integration sets `MONGODB_URI` for you |
| `JWT_SECRET` | yes | Long random string for signing tokens (also keys the OTP hashes) |
| `MEDIA_SECRET` | no | Signs the private image links. Falls back to `JWT_SECRET` |
| `CLIENT_URL` | no | Frontend origin(s) for CORS, comma separated. Default `http://localhost:3000` |
| `TRUST_PROXY` | no | Set to `1` behind a proxy (Render, Railway, Nginx) so image URLs use https. Automatic on Vercel |
| `EMAIL_USER` / `EMAIL_PASS` | prod only | Gmail address + [app password](https://support.google.com/accounts/answer/185833). Empty in development: emails print to the console as `[dev-mail]` |
| `ANTHROPIC_API_KEY` | for live analysis | Claude API key. Empty = demo analysis |
| `CLAUDE_MODEL` | no | Default `claude-opus-5-5` |
| `AI_DEMO_MODE` | no | `true` forces the demo analysis even with a key |
| `AI_DAILY_LIMIT` | no | Analyses per user per 24 h. Default `20` |
| `REPLICATE_API_TOKEN` | for live visuals | Replicate API token. Empty = demo visual |
| `REPLICATE_MODEL` | no | Default `black-forest-labs/flux-kontext-pro` |
| `VISUAL_DEMO_MODE` | no | `true` forces the demo visual even with a token |
| `VISUAL_DAILY_LIMIT` | no | Visuals per user per 24 h. Default `10` |
| `GUEST_AI_DAILY_LIMIT` / `GUEST_VISUAL_DAILY_LIMIT` | no | The same limits for guest accounts. Default `5` each |
| `GUEST_RATE_LIMIT` | no | Guest accounts per IP per hour. Default `10` |

## How a design is made

1. `POST /ai/analyze` — the photo is auto-rotated and resized to max 1568 px JPEG with sharp. That one JPEG is sent to Claude **and** stored as the "before" image.
   Claude is called with structured outputs (Zod schema) and returns the analysis plus a hidden `imagePrompt` for the image model (kept in the database, never sent to the browser). Refusal fallback is on (`fallbacks: "default"`), so a policy decline is retried on another model server-side.
2. `POST /ai/designs/:id/visualize` — the stored photo and `imagePrompt` go to Replicate:
   `{ prompt, input_image, aspect_ratio: "match_input_image", output_format: "jpg", safety_tolerance: 2 }`
   (2 is the highest safety tolerance FLUX Kontext allows with an input image). The result is downloaded, re-encoded to WebP and stored, because Replicate's output links are temporary. A design can be visualised again ("regenerate"); the old image is then replaced.

The two steps are separate requests, so the user sees the written plan first while the image is being made.

## Demo modes (no keys needed)

The two services switch to demo independently. The startup log says which mode each is in.

- **Analysis demo** (no `ANTHROPIC_API_KEY`, or `AI_DEMO_MODE=true`): a hand-written sample plan for a living space. The first overview paragraph says it is a demo and the photo was not analysed.
- **Visual demo** (no `REPLICATE_API_TOKEN`, or `VISUAL_DEMO_MODE=true`): the original photo with a warm colour grade and a "DEMO PREVIEW · add a Replicate key for the real redesign" band, after a short delay so the loading state is visible.

To go live: create the keys yourself ([platform.claude.com](https://platform.claude.com) and [replicate.com](https://replicate.com/account/api-tokens)), add them to `.env`, set the demo flags to `false` (or empty) and restart.

## Costs

- Analysis: one Claude request with one photo, roughly a few US cents on Opus.
- Visual: **$0.04 per output image** for `flux-kontext-pro` (Replicate price, Nov 2026).
- Daily caps per user (`AI_DAILY_LIMIT`, `VISUAL_DAILY_LIMIT`) and short-window rate limits protect the bill. Caps count attempts in a separate `usage` collection, so deleting designs does not reset them.

## Guest accounts

`POST /auth/guest` creates a one-click demo account, so visitors (for example recruiters opening the portfolio link) can try the app without signing up or receiving an email.

- Username `Guest`, a random `guest-…@guest.redecor.ai` email and a random password nobody knows. The token lasts 24 hours.
- Guests can analyse, create visuals and change their name and photo. Changing email or password returns `403 GUEST_NOT_ALLOWED`. Deleting a guest account needs no password.
- Smaller daily limits: 5 analyses and 5 visuals. At most 10 guest accounts per IP per hour.
- After 24 hours the token is refused (`401`), and the next guest sign-in deletes expired guests with all their designs, images and usage rows.

## Privacy

- Images (the resized original, the generated visual and profile photos) are stored in MongoDB (`media` collection) under random names, because serverless hosts have no permanent disk. They are never public: the API returns signed links (`/media/<file>?exp=&sig=`, HMAC-SHA256, valid about 24 h) that work in `<img>` tags without exposing the token.
- Deleting a design deletes its images. Deleting the account deletes every design, image and usage row.
- Photos are sent to Anthropic (analysis) and Replicate (visual) for processing. Say so in the app's privacy notice.
- MongoDB Atlas' free tier holds 512 MB, roughly 2,000–3,000 designs. For more, swap `utils/storage.js` for S3, Cloudinary or Vercel Blob; the controllers don't change.

## Deploy on Vercel

The backend is its own Vercel project with root directory `backend` (the frontend is a second project).

- `api/index.js` exports the Express app as one serverless function, and `vercel.json` sends every path to it (`maxDuration` 60 s).
- MongoDB connects once per function instance (`Models/db.js` → `ensureConnected`). If it can't connect, requests get `503 SERVICE_UNAVAILABLE` (with CORS headers, so the browser can show the message).
- `trust proxy` is turned on automatically when `VERCEL` is set, so signed image links use `https` and rate limits see the real client IP.
- Vercel rejects request bodies over **4.5 MB**, so the frontend resizes photos in the browser before uploading.

| Variable | Value |
|---|---|
| `MONGODB_URI` | Added automatically by the MongoDB Atlas integration (Vercel dashboard → Storage → MongoDB Atlas → connect to this project) |
| `JWT_SECRET` | Long random string |
| `MEDIA_SECRET` | A different long random string |
| `CLIENT_URL` | The frontend's Vercel URL, e.g. `https://redecor-ai.vercel.app` |
| `AI_DEMO_MODE`, `VISUAL_DEMO_MODE` | `true` (no paid AI keys) |
| `EMAIL_USER`, `EMAIL_PASS` | Your Gmail address and a Gmail [App Password](https://support.google.com/accounts/answer/185833) (needs 2-step verification), so sign-up codes are emailed |

Add each one with `vercel env add NAME production` (or in the dashboard), then redeploy.

## API

All responses: `{ success, message, data?, code? }`. Auth: `Authorization: Bearer <accessToken>`.

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/auth/signup` | | `username, email, password` | Sends a 6-digit code. `409 EMAIL_TAKEN` if a verified account exists |
| POST | `/auth/verify-email` | | `email` | Sends a fresh code (resend / start password reset). Same reply for unknown emails |
| POST | `/auth/verify-otp` | | `email, otp` | Verifies the email. `INVALID_OTP`, `OTP_EXPIRED`, `TOO_MANY_ATTEMPTS` |
| POST | `/auth/reset-password` | | `email, otp, newPassword` | |
| POST | `/auth/login` | | `email, password` | Returns user + `accessToken` (7 days). `403 EMAIL_NOT_VERIFIED` sends a new code |
| POST | `/auth/guest` | | | One-click guest account: user + `accessToken` (24 hours). `429 RATE_LIMITED` after 10 per IP per hour |
| GET | `/auth/me` | ✓ | | Current user |
| PUT | `/auth/update-profile` | ✓ | multipart `username?`, `profileImage?` (≤2 MB) | Photo re-encoded to 512 px WebP, returned as a signed link |
| PATCH | `/auth/update-email` | ✓ | `email` | Code goes to the new address. Guests: `403 GUEST_NOT_ALLOWED` |
| POST | `/auth/confirm-email` | ✓ | `otp` | Switches to the new email. Guests: `403 GUEST_NOT_ALLOWED` |
| POST | `/auth/change-password` | ✓ | `currentPassword, newPassword` | `WRONG_PASSWORD`. Guests: `403 GUEST_NOT_ALLOWED` |
| DELETE | `/auth/delete-user` | ✓ | `password` (not needed for guests) | Deletes account, designs, stored images and profile photo |
| POST | `/auth/send-message` | | `firstName, lastName, emailAddress, message` | Contact form |
| POST | `/ai/analyze` | ✓ | multipart `image` (jpeg/png/webp ≤10 MB), `notes?` (≤500) | `201`, design with `visual.status: "pending"`. `IMAGE_REQUIRED`, `INVALID_IMAGE`, `DAILY_LIMIT`, `AI_REFUSED`, `AI_BUSY`, `AI_FAILED` |
| POST | `/ai/designs/:id/visualize` | ✓ | | Creates or regenerates the visual. `VISUAL_IN_PROGRESS` (409), `VISUAL_DAILY_LIMIT` (429), `AI_VISUAL_REFUSED` (422), `AI_VISUAL_FAILED` (502) |
| GET | `/ai/designs` | ✓ | | Your last 50 designs, newest first |
| GET | `/ai/designs/:id` | ✓ | | One design |
| DELETE | `/ai/designs/:id` | ✓ | | Deletes the design and its images |
| GET | `/media/:file?exp=&sig=` | signed link | | Sends a stored image. `403 FORBIDDEN` for a bad or expired link, `404` if it was deleted |

Design object:

```js
{
  id, notes, createdAt,
  demo: { analysis: boolean, visual: boolean },
  original: { url },                 // signed link to the stored photo
  analysis: {
    title, spaceType,
    overview: [string],              // 2–3 paragraphs
    direction: { name, description },
    changes: [{ title, area, priority, budget, why, steps: [string] }],  // 4–8
    palette: [{ name, hex, usage }], // exactly 5
    keep: [string],                  // 0–4
    summary
  },
  visual: { status: "pending" | "processing" | "ready" | "failed", url?, error?, demo?, updatedAt? }
}
```

User object (login, guest, `/auth/me`): `{ id, username, email, profileImage, emailVerified, isGuest, guestExpiresAt, createdAt }`.

`area` is one of `layout, colour, lighting, furniture, textiles, storage, decor, flooring, walls, plants`; `priority` and `budget` are `high | medium | low`. `visual.url` is only present when the status is `ready`.

## Folder layout

```
index.js              local server: loads .env, connects MongoDB, starts listening
server.js             Express app (exported for tests and Vercel)
api/index.js          Vercel serverless entry (vercel.json rewrites every path here)
Routes/               AuthRouter, AIRouter, MediaRouter
controllers/          AuthController, AIController, MediaController, AuthValidation (Joi)
Middlewares/          Auth (JWT), Upload (multer), RateLimit, ErrorHandler
Models/               Users, Designs, Usage, Media (stored images), db
utils/                claude.js, replicate.js, storage.js, accounts.js, demoAnalysis.js, mailer.js, otp.js, AppError.js
test/                 api.test.js (integration), claude.test.js, replicate.test.js (mocked clients)
```
