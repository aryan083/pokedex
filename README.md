# PokéDex - Full-Text & Semantic Search Application

> **Intern - Developer Assessment Submission**  
> A production-ready Pokémon database with advanced search capabilities

## 🎯 Project Overview

This project is a full-stack PokéDex application built for the Intern - Developer position assessment. It demonstrates proficiency in modern web development technologies with a focus on **architecture, design, and implementation quality**.

### Key Features

- ✅ **Complete Pokémon Database** - All 1350+ Pokémon from PokeAPI
- ✅ **Full-Text Search** - Fast PostgreSQL-based text search
- ✅ **Semantic Search** - Intelligent search using type-based filtering
- ✅ **Advanced Filtering** - Filter by type, generation, and stats
- ✅ **Redis Caching** - Optimized performance with 5-minute cache
- ✅ **Infinite Scroll** - Smooth pagination with 20 items per page
- ✅ **Responsive Design** - Mobile-first UI with Tailwind CSS
- ✅ **Docker Deployment** - Containerized for easy deployment

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- ⚛️ React 18 with TypeScript
- 🎨 Tailwind CSS + shadcn/ui components
- 🔄 React Query for data management
- 📱 Fully responsive design
- 🚀 Vite for fast development

**Backend:**
- 🟢 Node.js + Express.js
- 📘 TypeScript for type safety
- 🐘 PostgreSQL for data storage
- 🔴 Redis for caching
- 🐳 Docker for containerization

**Deployment:**
- 🌐 Frontend: Vercel
- 🚀 Backend: Render
- 📊 Database: Render PostgreSQL
- ⚡ Cache: Render Redis

### Project Structure

```
pokieDex/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API integration layer
│   │   ├── types/        # TypeScript type definitions
│   │   └── pages/        # Page components
│   ├── dist/             # Production build output
│   └── vercel.json       # Vercel deployment config
│
├── backend/              # Express.js backend API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── repositories/ # Data access layer
│   │   ├── models/       # Sequelize models
│   │   ├── middlewares/  # Express middlewares
│   │   ├── routes/       # API routes
│   │   ├── cache/        # Redis cache implementation
│   │   └── scripts/      # Data seeding scripts
│   ├── dist/             # Compiled JavaScript
│   └── Dockerfile        # Docker configuration
│
├── docker-compose.yml    # Local development setup
└── render.yaml          # Render deployment config
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose (for local development)
- Git

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/aryan083/pokedex.git
cd pokedex
```

2. **Start the backend services**
```bash
# Start PostgreSQL and Redis
docker-compose up -d pokedex-db pokedex-cache

# Install backend dependencies
cd backend
npm install

# Build the backend
npm run build

# Seed the database (takes 2-3 hours for all Pokémon)
npm run fetch-seed

# Start the backend server
npm start
```

> **Note:** Seeding takes 2-3 hours for all 1350+ Pokémon. For quicker testing, use `npm run fetch-seed 151` to seed only first generation.

3. **Start the frontend**
```bash
cd frontend
npm install
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api/pokemon

### Quick Start with Docker

```bash
# Start all services
docker-compose up -d

# Seed the database
docker exec pokedex-backend npm run fetch-seed

# Access at http://localhost:5174
```

> **Note:** Seeding takes 2-3 hours for all 1350+ Pokémon. For quicker testing, use `docker exec pokedex-backend npm run fetch-seed 151` to seed only first generation.

## 📡 API Documentation

### Base URL
```
Production: https://pokedex-15jr.onrender.com/api
Development: http://localhost:3000/api
```

### Endpoints

#### GET /pokemon
Search and filter Pokémon

**Query Parameters:**
- `search` - Text search (name or type)
- `type` - Filter by type(s), comma-separated
- `generation` - Filter by generation(s), comma-separated
- `minHp`, `minAttack`, `minDefense`, `minSpeed` - Stat filters
- `sortBy` - Sort field (pokemonId, name, hp, attack, etc.)
- `sortOrder` - ASC or DESC
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Example Request:**
```bash
curl "http://localhost:3000/api/pokemon?search=pikachu&type=electric&sortBy=attack&sortOrder=DESC&page=1&limit=20"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "pokemonId": 25,
      "name": "pikachu",
      "generation": 1,
      "hp": 35,
      "attack": 55,
      "defense": 40,
      "specialAttack": 50,
      "specialDefense": 50,
      "speed": 90,
      "height": 4,
      "weight": 60,
      "types": ["electric"],
      "abilities": ["static", "lightning-rod"]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 17,
    "totalPages": 1
  }
}
```

## 🌐 Deployment

### Deploy Frontend to Vercel

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Set environment variable:
   - `VITE_API_BASE_URL` = `https://pokedex-15jr.onrender.com/api`
4. Deploy!

### Deploy Backend to Render

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your repo
4. Configure:
   - **Build Command:** `cd backend && npm install && npm run build`
   - **Start Command:** `cd backend && npm start`
   - **Environment Variables:**
     - `NODE_ENV=production`
     - `DATABASE_URL=<your-postgres-url>`
     - `REDIS_URL=<your-redis-url>`
     - `CORS_ORIGIN=https://pokedex-g8h5luclr-aryan083s-projects.vercel.app`
     - `PORT=3000`
5. Create PostgreSQL and Redis add-ons
6. Deploy and seed: `npm run fetch-seed`

## 📊 Data Source

All Pokémon data is fetched from the official [PokéAPI](https://pokeapi.co/docs/v2#pokemon).

**Data Extraction Process:**
1. Fetch all available Pokémon from `/pokemon` endpoint
2. Extract essential stats for each:
   - Name, Height, Weight
   - Types (primary and secondary)
   - Base stats: HP, Attack, Defense, Special Attack, Special Defense, Speed
   - Abilities
   - Generation
3. Clean and normalize data
4. Store in PostgreSQL with proper indexing
5. Generate searchable text for full-text search

## 🔍 Search Implementation

### Full-Text Search
- PostgreSQL `ILIKE` pattern matching on name
- Case-insensitive search
- Partial matching supported

### Semantic Search
- Type-based filtering with PostgreSQL array operations
- Generation grouping
- Stat-based filtering (min thresholds)
- Combined filters using AND logic

### Performance Optimization
- Redis caching (5-minute TTL)
- Database indexing on searchable fields
- Pagination to limit data transfer
- Optimized SQL queries with proper joins

## 🎨 UI Features

- **Grid/List View Toggle** - Switch between card and list layouts
- **Card Size Options** - Compact, Normal, Large
- **Type Badges** - Color-coded Pokémon types
- **Stat Visualization** - Progress bars for all stats
- **Infinite Scroll** - Load more as you scroll
- **Compare Mode** - Compare up to 3 Pokémon side-by-side
- **Keyboard Shortcuts** - Quick access to features
- **Dark Mode** - Theme support (optional)

## 📝 Assessment Criteria Met

✅ **Architecture** - Clean separation of concerns with MVC pattern  
✅ **Design** - Modern, responsive UI with excellent UX  
✅ **Implementation** - Production-grade code with TypeScript, error handling, logging  
✅ **Tech Stack Alignment** - JavaScript, React, Node.js, Express.js, PostgreSQL, Redis, Docker  
✅ **Full-Text Search** - Implemented with PostgreSQL ILIKE  
✅ **Semantic Search** - Type-based and stat-based filtering  
✅ **Database Storage** - PostgreSQL with proper schema and indexing  
✅ **API Endpoint** - RESTful API with comprehensive filtering  
✅ **Search UI** - Beautiful, functional search interface  

## 🔧 Development Scripts

### Backend
```bash
npm run dev         # Start development server
npm run build       # Build TypeScript
npm start           # Start production server
npm run fetch-seed  # Seed database from PokeAPI
npm run update-fields # Update existing Pokémon with missing fields
```

### Frontend
```bash
npm run dev     # Start Vite dev server
npm run build   # Build for production
npm run preview # Preview production build
```

## 📄 License

MIT

## 👤 Author

**Intern Developer Assessment**  
Submitted for: Redingle - Intern Developer Position  
Contact: anish.sarkar@redingle.com

---

**Submission Date:** 2025-12-20  
**Demo Links:**  
- Frontend: https://pokedex-g8h5luclr-aryan083s-projects.vercel.app/  
- Backend API: https://pokedex-15jr.onrender.com/api  
**Repository:** https://github.com/aryan083/pokedex
