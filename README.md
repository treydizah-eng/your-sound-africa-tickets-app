# YoTicketsAfrica Platform

Enterprise ticketing platform for Michael Mahendere Ministries.

## Monorepo Structure

```
yoticketsafrica/
├── apps/
│   ├── api/          # NestJS REST API (Node.js + TypeScript)
│   └── web/          # Next.js 15 public website
├── ysams-connector/  # PHP adapter for YSAMS (music-bos)
│   ├── yor-api/      # PHP files → upload to webzim.co.zw
│   └── migrate_yor_sync.sql
├── .env.example      # Copy to .env and fill in values
├── package.json
└── turbo.json
```

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Set up the database
```bash
cd apps/api
npx prisma migrate dev --name init
```

### 4. Run development servers
```bash
npm run dev
# API:  http://localhost:4000/api
# Web:  http://localhost:3000
```

## Key URLs (Development)

| Service | URL |
|---------|-----|
| Web App | http://localhost:3000 |
| API | http://localhost:4000/api |
| Prisma Studio | Run `npm run prisma:studio` in `apps/api` |

## PayNow Sandbox Credentials
- Integration ID: `13`
- Key: `9c4d3ca0-4ed8-40ee-8e0f-f97fdda2878d`
- Test card: use any Visa/Mastercard details on the PayNow sandbox redirect

## YSAMS Connector
See `ysams-connector/README.md` for deployment instructions.
