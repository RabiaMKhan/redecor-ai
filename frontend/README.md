# Redecor AI: frontend

React app for Redecor AI. See the [root README](../README.md) for what the product does and how the pieces fit together.

## Stack

- React 18 (Create React App), React Router 6
- Redux Toolkit + Redux-Saga + redux-persist (signed-in user)
- Tailwind CSS 3, lucide-react icons, react-hot-toast
- Axios with one shared instance (`src/redux/https.js`)

## Run locally

Use Node 22 (`.nvmrc`). `react-scripts` 5 is no longer maintained, so newer Node versions are not tested.

```bash
cp .env.example .env
npm install
PORT=3002 npm start
```

| Variable | Default | Purpose |
|---|---|---|
| `REACT_APP_API_ENDPOINT` | `http://localhost:8080` | Base URL of the backend API |

`REACT_APP_*` values are baked into the browser bundle, so never put secrets in them.

## Deploy on Vercel

The frontend is its own Vercel project with root directory `frontend`.

- `vercel.json` rewrites every path to `index.html`, so React Router routes like `/designs/123` work on refresh.
- Set `REACT_APP_API_ENDPOINT` to the backend's Vercel URL **before** building, because CRA bakes it into the bundle. Redeploy after changing it.
- Node is pinned to 22.x in `package.json` (`engines`).
- Photos are resized in the browser to about 1600 px before upload (`src/helpers/resizeImage.js`), because Vercel functions reject request bodies over 4.5 MB.

## Guest accounts

"Try as a guest" (on Sign in and the Studio) calls `POST /auth/guest`, which creates a temporary account. It's deleted with its designs after 24 hours. Guests can analyse spaces and change their name and photo, but not their email or password.

## Pages

| Route | Page | Access |
|---|---|---|
| `/` | Home | anyone |
| `/ai` | Studio: upload a photo + optional notes | anyone can look; analysing needs an account |
| `/designs/:id` | One design: analysis, then the before/after visual | signed-in owner |
| `/gallery` | Style inspiration | anyone |
| `/about`, `/contact-us` | About, contact form | anyone |
| `/login`, `/signup` | Sign in, create account | signed-out only |
| `/verify-email`, `/forget-password` | 6-digit email code, password reset | anyone |
| `/profile` | My designs, account, security | signed-in only |

## How a design is shown

1. `POST /ai/analyze` (photo + notes) returns the design with the written analysis. The studio then opens `/designs/:id`.
2. The design page calls `POST /ai/designs/:id/visualize` once, automatically, and shows a loading state at the end of the page.
3. When the visual is ready, a before/after slider (`components/AI/BeforeAfter`) compares the photos. If generation is already running (`VISUAL_IN_PROGRESS`), the page polls `GET /ai/designs/:id` every 4 seconds.

Image URLs from the API are signed and expire after 24 hours, so pages always load fresh design data.

## Folder layout

```
src/
  assets/images/      room photos (WebP)
  components/
    shared/           Button, TextField, OTP, Modal, Navbar, Footer, layouts…
    HomePage/         home page sections
    AI/               Dropzone, AnalysisView, VisualResult, BeforeAfter, GeneratingState
    ProfilePage/      designs, account and security cards
  pages/              one folder per route
  redux/              store, user slice, sagas, axios instance, endpoints
  routes/             route config + guards
  helpers/            validation and formatting helpers (+ tests)
  utils/              hooks, style data, colour tokens
```

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Dev server |
| `npm run build` | Production build in `build/` |
| `CI=true npm test -- --watchAll=false` | Run the tests once |
