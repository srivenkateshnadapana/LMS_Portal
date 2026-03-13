# Next-Gen LMS Portal

High-performance, cloud-native LMS with Go/Rust/Next.js stack, Google Drive video proxy, blockchain certs, real-time labs.

## Quick Start (Local Dev)
1. Copy `.env.example` to `.env` and fill vars (Clerk keys, Google service account JSON base64, Supabase URL).
2. `docker compose up -d` (starts Postgres, Redis, Go API, Rust WS).
3. `cd frontend && npm install && npm run dev` (http://localhost:3000).
4. Admin login via Clerk dashboard.

## Architecture
- Frontend: Next.js 15 (SSR, Video.js proxy streams)
- Backend: Go (API/video proxy), Rust (Actix real-time labs)
- DB: Supabase/Postgres + Redis
- Auth: Clerk
- Blockchain: Polygon NFT certs
- Labs: Monaco + Xterm + Docker pods

See TODO.md for build progress.

