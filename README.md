# Redecor AI

**Live demo: [redecorai.vercel.app](https://redecorai.vercel.app)**. Click "Try as a guest" to look around without signing up. The live demo runs in demo mode, so the analysis is a sample plan and the visual is a simple colour preview.

Upload a photo of any room or part of your home. Redecor AI:

1. **Analyses it**: a few paragraphs on what the space is like today and what already works.
2. **Suggests changes**: 4–8 concrete changes, each with the reason, steps, a priority and a budget level, plus a direction and a 5-colour palette.
3. **Shows the result**: the same photo redesigned with those changes, with a before/after slider.

Redecor AI grew out of Redecor, my final-year Computer Science project (Superior University, graded A+).

## How it works

```
React app ──► POST /ai/analyze ──► sharp (resize) ──► Claude (vision, structured output)
                                                        └─► analysis + image prompt saved in MongoDB
          ──► POST /ai/designs/:id/visualize ──► Replicate FLUX Kontext edits the same photo
                                                        └─► image stored privately, served via signed URLs
```

| Part | Tech |
|---|---|
| `frontend/` | React 18 (CRA), Redux Toolkit + Saga, React Router, Tailwind CSS |
| `backend/` | Node.js, Express, MongoDB (Mongoose), JWT + email codes, Joi, sharp |
| Analysis | Claude (`claude-opus-5-5`) through the Anthropic SDK, structured outputs |
| Visual | Replicate `black-forest-labs/flux-kontext-pro` ($0.04 per image) |

Both AI parts have a **demo mode**, so the whole app runs locally without any API keys.

## Run locally

Needs Node 22+ (frontend is pinned to 22 in `.nvmrc`) and MongoDB on `localhost:27017`.

```bash
cd backend && cp .env.example .env   # then fill in JWT_SECRET; leave AI keys empty for demo mode
npm install && npm run dev            # http://localhost:8080
```

```bash
cd frontend && cp .env.example .env
npm install && PORT=3002 npm start    # http://localhost:3002
```

Without email settings, sign-up codes are printed in the backend console as `[dev-mail]`.

## Turning on the real AI

| Key | Where to get it | Env vars in `backend/.env` |
|---|---|---|
| Anthropic | console.anthropic.com | `ANTHROPIC_API_KEY=...`, `AI_DEMO_MODE=false` |
| Replicate | replicate.com/account/api-tokens | `REPLICATE_API_TOKEN=...`, `VISUAL_DEMO_MODE=false` |

Each part can be switched on separately. See [backend/README.md](backend/README.md) for every setting and endpoint.

## Privacy

Photos are sent to Anthropic (analysis) and Replicate (visual) for processing. The resized original and the visual are stored privately on the server and are only reachable through signed links that expire after 24 hours. Deleting a design, or the account, deletes its images.
