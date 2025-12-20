# PokéDex Backend API

A production-grade REST API for Pokémon data with advanced search, filtering, and comparison capabilities.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Database Schema](#database-schema)
- [Caching Strategy](#caching-strategy)
- [Observability](#observability)
- [Deployment](#deployment)

## Features

- **Smart Search**: Search by name, type, or semantic terms (fast, tank, glass)
- **Advanced Filtering**: Filter by type, generation, and stat ranges
- **Sorting**: Sort by any stat in ascending or descending order
- **Pagination**: Support for both traditional pagination and infinite scroll
- **Comparison**: Compare 2-3 Pokémon side-by-side
- **Caching**: Redis-based caching for improved performance
- **Observability**: Full tracing, metrics, and structured logging
- **Type Safety**: End-to-end TypeScript support

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Sequelize ORM
- **Caching**: Redis
- **Logging**: Pino (structured logging)
- **Observability**: OpenTelemetry (tracing & metrics)
- **Validation**: Zod
- **Deployment**: Docker-ready

## Architecture

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│   Client    │───▶│  Controller  │───▶│   Service    │
└─────────────┘    └──────────────┘    └──────────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │   Repository     │
                                    └──────────────────┘
                                              │
                    ┌───────────────┬─────────┴─────────┬───────────────┐
                    ▼               ▼                   ▼               ▼
              ┌──────────┐    ┌──────────┐      ┌──────────┐    ┌──────────┐
              │ Database │    │   Cache  │      │   Logs   │    │  Traces  │
              └──────────┘    └──────────┘      └──────────┘    └──────────┘
```

### Design Principles

- **Separation of Concerns**: Clean architecture with distinct layers
- **Single Responsibility**: Each component has a focused purpose
- **Dependency Injection**: Loose coupling between components
- **Error Handling**: Comprehensive error handling with proper HTTP codes
- **Observability**: Built-in tracing, metrics, and logging

## API Endpoints

### GET `/api/pokemon`

Search and filter Pokémon with pagination support.

**Query Parameters:**

| Parameter    | Type   | Description                          |
|--------------|--------|--------------------------------------|
| page         | number | Page number (default: 1)             |
| limit        | number | Items per page (default: 20)         |
| search       | string | Search term (name, type, or semantic)|
| type         | string | Filter by Pokémon type               |
| generation   | number | Filter by generation                 |
| minHp        | number | Minimum HP                           |
| minAttack    | number | Minimum Attack                       |
| minDefense   | number | Minimum Defense                      |
| minSpeed     | number | Minimum Speed                        |
| sortBy       | string | Field to sort by                     |
| sortOrder    | string | Sort order (ASC or DESC)             |

**Semantic Search Terms:**
- `fast`: Speed > 100
- `tank`: HP + Defense > 200
- `glass`: Attack > 100 AND Defense < 70

**Response:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 151,
    "totalPages": 8
  }
}
```

### POST `/api/pokemon/compare`

Compare 2-3 Pokémon by name or ID.

**Request Body:**
```json
{
  "pokemon": ["pikachu", "charizard"]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "pokemonId": 25,
      "name": "pikachu",
      "hp": 35,
      "attack": 55,
      "defense": 40,
      "speed": 90
    },
    {
      "pokemonId": 6,
      "name": "charizard",
      "hp": 78,
      "attack": 84,
      "defense": 78,
      "speed": 100
    }
  ]
}
```

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 13
- Redis >= 6

### Environment Variables

Create a `.env` file in `src/config/`:

```env
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pokedex
DB_USER=postgres
DB_PASS=postgres

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_TTL=300
```

### Installation

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start development server
npm run dev

# Start production server
npm start
```

### Database Setup

```bash
# Run migrations
npx sequelize-cli db:migrate

# Seed with sample data
npm run seed

# Or fetch from PokeAPI
npm run fetch-seed
```

## Database Schema

```sql
Table: pokemons
- pokemonId (INTEGER, PRIMARY KEY)
- name (STRING, UNIQUE)
- generation (INTEGER)
- hp (INTEGER)
- attack (INTEGER)
- defense (INTEGER)
- speed (INTEGER)
- types (ARRAY<STRING>)
- searchText (TEXT)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### Indexes

- Primary key on `pokemonId`
- Unique index on `name`
- Indexes on all filterable fields
- GIN index on `searchText` for full-text search

## Caching Strategy

### Cache Keys

- Search: `search:{page}:{limit}:{type}:{generation}:{minHp}:{minAttack}:{minDefense}:{minSpeed}:{search}:{sortBy}:{sortOrder}`
- Compare: `compare:{pokemon_list_sorted}`

### TTL Settings

- Search results: 5 minutes
- Comparison results: 1 hour

### Cache Invalidation

- Automatic expiration based on TTL
- No manual invalidation required for this use case

## Observability

### Logging

Structured logging with Pino:
- All HTTP requests logged with trace IDs
- Error logs with stack traces
- Performance logs for slow operations

### Tracing

OpenTelemetry auto-instrumentation with Jaeger:
- HTTP requests
- Database queries
- Redis operations
- Custom spans in service methods
- Distributed tracing across services

To view traces:
1. Start the application with `docker-compose up`
2. Access Jaeger UI at http://localhost:16686
3. Search for traces by service, operation, or tags

### Metrics

OpenTelemetry metrics exported to Prometheus:
- Request count
- Request latency
- Error rates
- Database connection pool

To view metrics:
1. Start the application with `docker-compose up`
2. Access Prometheus UI at http://localhost:9090
3. Query metrics using PromQL

Common metrics to explore:
- `http_server_duration_seconds`
- `http_server_requests_total`
- `process_cpu_seconds_total`
- `process_memory_usage_bytes`

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment-Specific Config

- Use environment variables for all configuration
- Different settings for development, staging, and production
- Secure secrets management in production

### Scaling

- Stateless design enables horizontal scaling
- Connection pooling for database and Redis
- Load balancing compatible

## Development

### Project Structure

```
src/
├── app.ts          # Express app setup
├── server.ts       # Server entry point
├── cache/          # Redis cache implementation
├── config/         # Configuration files
├── controllers/    # Route handlers
├── middlewares/    # Express middleware
├── models/         # Sequelize models
├── observability/  # OpenTelemetry setup
├── repositories/   # Data access layer
├── routes/         # Route definitions
├── services/       # Business logic
├── utils/          # Utility functions
└── scripts/        # Helper scripts
```

### Scripts

```bash
# Development
npm run dev         # Run with ts-node
npm run watch       # Run with nodemon

# Building
npm run build       # Compile TypeScript
npm run lint        # Run ESLint

# Database
npm run seed        # Seed sample data
npm run fetch-seed  # Fetch from PokeAPI
```

### Testing

```bash
# TODO: Add test scripts
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT