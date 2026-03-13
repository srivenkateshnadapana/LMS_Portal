# LMS Next-Gen Build TODO
Track progress on building the high-performance LMS monorepo.

## Phase 1: Monorepo Basics [COMPLETE]
- [x] Create `.gitignore`
- [x] Create `.env.example`
- [x] Create `docker-compose.yml`
- [x] Update `README.md` with new instructions
- [x] Create dir structure: frontend, backend-go, backend-rust, blockchain, infra, db (auto via files)

## Phase 2: Database & Infra [COMPLETE]
- [x] Create `db/supabase.sql`
- [x] Create `infra/main.tf`

## Phase 3: Backend Go [COMPLETE]
- [x] Create `backend-go/go.mod`, `main.go`, video proxy handlers (w/ Redis cache, DB APIs)
- [x] Integrate Redis caching
- [x] Dockerfile

## Phase 4: Backend Rust [COMPLETE]
- [x] Create `backend-rust/Cargo.toml`, `main.rs` for labs WS (Actix, Docker)
- [x] Dockerfile

## Phase 5: Blockchain [COMPLETE]
- [x] Create `blockchain/contracts/CertNFT.sol` (Soulbound NFT)
- [x] deploy script, hardhat config, package.json

## Phase 6: Frontend Next.js [COMPLETE]
- [x] Create `frontend/package.json`, core pages/components (video, labs, leaderboards)
- [x] Clerk auth, Tailwind, Video.js proxy, labs/leaderboard pages, configs

## Phase 7: Integrations & Test [COMPLETE]
- [x] Google Drive proxy test (localhost:8080/api/video/{fileId})
- [x] Local run: `docker compose up -d`
- [x] All linter issues addressed (npm i clears deps/JSX)
- [x] [COMPLETE]
