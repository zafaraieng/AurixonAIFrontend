# Aurixon Frontend

React + Vite frontend for the Aurixon multi-platform content publishing system.

Works with the [Aurixon Backend](https://github.com/zafaraieng/AurixonAIBackend).

---

## Product Overview

Aurixon helps creators publish media to **YouTube**, **Instagram**, **Facebook**, and **TikTok** from a single interface. Users connect their platform accounts via OAuth, upload media once, set metadata and a schedule, and track per-platform status.

## Features

- Landing page and authenticated dashboard
- Platform connection flows (Google/YouTube, Facebook/Instagram, TikTok)
- Media upload form with title, description/caption, schedule, and platform selection
- Scheduled content list and status tracking
- Content analysis UI components
- Title / caption optimization helpers
- Responsive layout (desktop-first, with basic mobile support)

## Tech Stack

- React 18
- Vite 5
- React Router 6
- Axios
- MUI + Tailwind CSS utilities
- date-fns

## Scripts (from `package.json`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |

There is **no** `npm start` script. Use the commands above.

## Local Development

```bash
git clone https://github.com/zafaraieng/AurixonAIFrontend.git
cd AurixonAIFrontend
npm install

# Point the frontend at a running backend (create a .env if needed)
# e.g. VITE_API_BASE_URL=http://localhost:4000

npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

## Production Build

```bash
npm run build
npm run preview   # optional local check
```

Deploy the `dist/` output to Vercel, Netlify, or any static host.  
Set the backend API base URL via environment variables appropriate for your hosting platform.

## Architecture Notes

- `src/pages/` — Landing, Dashboard, legal pages
- `src/components/` — Upload form, schedule list, platform setup, analysis UI, shared chrome
- `src/api/` — Thin Axios wrappers for auth, upload, Instagram, AI endpoints
- State is primarily local component state + browser cookies / tokens managed by the backend session

## Connection to Backend

All authenticated API calls expect the backend to be reachable and to share the same origin policy / CORS configuration defined in the backend.  
OAuth callback URLs must match the values registered with Google, Facebook, and TikTok and the `CLIENT_URL` / redirect URIs configured on the backend.

## Environment

Do not commit production API keys or private configuration.  
Use a `.env` (or host-specific environment variables) for any frontend-visible base URLs.  
`.gitignore` already excludes `.env` files.

## Related Repository

Backend: [zafaraieng/AurixonAIBackend](https://github.com/zafaraieng/AurixonAIBackend)

---

*Part of the Aurixon full-stack project. Documentation and test coverage will continue to be expanded.*
