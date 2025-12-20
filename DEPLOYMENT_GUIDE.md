# Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free tier)
- Render account (free tier)

## Deploying to Vercel (Frontend)

### Using Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository (aryan083/pokedex)
4. Configure project settings:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variable:
   - `VITE_API_BASE_URL` = `https://your-render-backend.onrender.com/api`
6. Click "Deploy"

### Using Vercel CLI
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to your Vercel account
vercel login

# Deploy the frontend
cd frontend
vercel --prod
```

## Deploying to Render (Backend)

### Using Render Dashboard
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - Name: `pokedex-backend`
   - Region: Ohio (or your preference)
   - Branch: main
   - Root Directory: `backend`
   - Runtime: Docker
   - Plan: Free

5. Environment Variables:
   ```
   NODE_ENV=production
   PORT=3000
   CORS_ORIGIN=https://your-vercel-frontend.vercel.app
   ```

6. Click "Create Web Service"

7. Create PostgreSQL Database:
   - Click "New" → "PostgreSQL"
   - Name: `pokedex-db`
   - Database: `pokedex`
   - User: `postgres`
   - Plan: Free

8. Create Redis Instance:
   - Click "New" → "Redis"
   - Name: `pokedex-cache`
   - Plan: Free

9. Update your web service environment variables with the database and Redis connection strings.

### Using Render CLI
```bash
# Install Render CLI
npm install -g render-cli

# Login to Render
render login

# Deploy using the render.yaml configuration
render deploy
```

## Post-Deployment Steps

### Seed the Database
Once your backend is deployed on Render:

1. Go to your Render dashboard
2. Navigate to your `pokedex-backend` service
3. Click on "Shell" tab
4. Run the seeding command:
```bash
npm run fetch-seed
```

This will populate your database with all 1350+ Pokémon data. It may take 2-3 hours to complete due to PokeAPI rate limiting.

### Update CORS Settings
After deploying your frontend on Vercel:

1. Get your Vercel frontend URL
2. Update the `CORS_ORIGIN` environment variable in your Render backend service
3. Redeploy the backend service

## Environment Variables Summary

### Frontend (.env or Vercel)
```
VITE_API_BASE_URL=https://your-render-backend.onrender.com/api
```

### Backend (Render)
```
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-vercel-frontend.vercel.app
DATABASE_URL=postgresql://username:password@host:port/database
REDIS_URL=redis://username:password@host:port
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `CORS_ORIGIN` matches your frontend URL exactly
   - Include protocol (https://) and no trailing slash

2. **Frontend Can't Connect to Backend**
   - Verify backend is deployed and running
   - Check Render logs for errors
   - Confirm `VITE_API_BASE_URL` is correct

3. **Database Connection Issues**
   - Ensure `DATABASE_URL` is properly set
   - Check if database service is provisioned
   - Verify database credentials

4. **Slow First Load**
   - Render free tier services sleep after 15 minutes of inactivity
   - First request may take 30-60 seconds to wake up

## Monitoring

### Render Health Checks
- Backend: `https://your-backend.onrender.com/health`
- Should return: `{"status":"healthy"}`

### Logs
- **Render**: Dashboard → Your Service → Logs
- **Vercel**: Dashboard → Your Project → Deployments → View Function Logs

## Cost Estimate

**Free Tier Coverage:**
- Render Web Service: Free (750 hours/month)
- Render PostgreSQL: Free (90 days trial)
- Render Redis: Free (90 days trial)
- Vercel Hosting: Free

All services fit within the free tier for this project.

## Support

For deployment issues:
1. Check service logs on Render/Vercel
2. Verify all environment variables are set
3. Test API endpoints directly
4. Check browser console for frontend errors