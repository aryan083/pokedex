# PokéDex Frontend

A modern, responsive Pokémon database application with advanced search capabilities.

## Features

- 🔍 Full-text search across all Pokémon
- 🎯 Semantic search with type and generation filters
- 📊 Stat-based filtering (HP, Attack, Defense, Speed)
- 📱 Responsive design for all devices
- ⚡ Infinite scroll pagination
- 🔄 Compare up to 3 Pokémon side-by-side
- 🌙 Dark mode support

## Tech Stack

- ⚛️ React 18 with TypeScript
- 🎨 Tailwind CSS + shadcn/ui components
- 🔄 React Query for data management
- 🚀 Vite for fast development
- 📡 RESTful API integration

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── services/      # API integration layer
├── types/         # TypeScript type definitions
├── pages/         # Page components
└── lib/           # Utility functions
```

## Deployment

This frontend is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel and deploy.

Set the environment variable:
- `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api`

## Learn More

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)