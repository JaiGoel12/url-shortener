# URL Shortener with Analytics

A microservices-based URL shortener featuring React frontend, two Node.js backend services communicating via gRPC, Apache Kafka for event streaming, PostgreSQL + Cassandra for polyglot persistence, and Redis for caching + rate limiting.

## Architecture

```
┌──────────────┐     REST API      ┌──────────────────┐
│  React SPA   │ ←──────────────→  │   URL Service    │
│  (Vite + TW) │                   │  (Express + TS)  │
└──────────────┘                   └─────────┬────────┘
                                             │
                    ┌────────────────────────┬┴───────────────┐
                    │                        │                │
              ┌─────▼─────┐          ┌───────▼──────┐  ┌─────▼─────┐
              │   Redis    │          │  PostgreSQL  │  │   Kafka   │
              │ Cache+Rate │          │  Users/URLs  │  │  Events   │
              └───────────┘          └──────────────┘  └─────┬─────┘
                                                             │
                                                     ┌───────▼────────┐
                                         gRPC        │   Analytics    │
                                     ←───────────→   │    Service     │
                                                     └───────┬────────┘
                                                             │
                                                     ┌───────▼────────┐
                                                     │   Cassandra    │
                                                     │  Click Events  │
                                                     └────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS, Recharts, Vite |
| URL Service | Node.js, Express, TypeScript, Prisma |
| Analytics Service | Node.js, TypeScript, gRPC, KafkaJS |
| Databases | PostgreSQL (relational), Apache Cassandra (time-series) |
| Message Broker | Apache Kafka |
| Cache & Rate Limiting | Redis |
| Inter-service Communication | gRPC (Protocol Buffers) |
| Containerization | Docker, Docker Compose |

## Key System Design Concepts

- **Microservices Architecture** - Two independent services with clear boundaries
- **gRPC** - Binary protobuf communication for internal service calls
- **Event-Driven Architecture** - Kafka decouples redirect from analytics
- **Polyglot Persistence** - PostgreSQL for relational, Cassandra for time-series
- **Cache-Aside Pattern** - Redis for hot URL lookups (< 50ms redirects)
- **Sliding Window Rate Limiting** - Redis-backed per-IP throttling
- **Base62 Encoding** - Collision-free short code generation
- **Counter Tables** - Pre-aggregated analytics in Cassandra

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm

### 1. Start Infrastructure

```bash
docker-compose up -d
```

This starts PostgreSQL, Redis, Kafka, Zookeeper, and Cassandra.

### 2. Setup URL Service

```bash
cd url-service
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### 3. Setup Analytics Service

```bash
cd analytics-service
npm install
npm run migrate   # Creates Cassandra tables
npm run dev
```

### 4. Setup Frontend

```bash
cd client
npm install
npm run dev
```

Open http://localhost:3000

## API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login (returns JWT)
- `POST /api/auth/refresh` - Refresh token

### URLs
- `POST /api/urls` - Create short URL
- `GET /api/urls` - List user's URLs (paginated)
- `GET /api/urls/:id` - Get URL details
- `PATCH /api/urls/:id` - Update URL
- `DELETE /api/urls/:id` - Deactivate URL

### Redirect
- `GET /:shortCode` - 301 redirect + async analytics

### Analytics (via gRPC proxy)
- `GET /api/analytics/:urlId` - Full analytics summary
- `GET /api/analytics/:urlId/clicks` - Click events
- `GET /api/analytics/:urlId/geo` - Geo breakdown

## Deployment (Free Tier)

| Service | Provider | Cost |
|---------|----------|------|
| Frontend | Vercel | $0 |
| URL Service | Render | $0 |
| Analytics Service | Render | $0 |
| PostgreSQL | Neon | $0 |
| Redis | Upstash | $0 |
| Kafka | Aiven | $0 |
| Cassandra | DataStax Astra DB | $0 |

## License

MIT
