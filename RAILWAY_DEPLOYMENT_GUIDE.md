# Railway Deployment Guide

This guide will walk you through deploying your full-stack application to Railway using GitHub Actions.

## 🏗️ Architecture Overview

```
Railway Project Structure:
├── PostgreSQL Service    (Managed Database)
├── Backend Service       (FastAPI + Docker)
└── Frontend Service      (React/Vite + nginx)
```

## 📋 Step-by-Step Setup

### Phase 1: Railway Project Setup

1. **Create Railway Account & Project**
   ```bash
   # Install Railway CLI locally (optional for testing)
   npm install -g @railway/cli
   railway login
   ```

2. **Create New Project**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project"
   - Choose "Empty Project"
   - Name it: `test-spectrum-system`

3. **Add PostgreSQL Service**
   - In your project, click "Create Service"
   - Select "Database" → "PostgreSQL"
   - Railway will create managed PostgreSQL instance

4. **Create Backend Service**
   - Click "Create Service" → "Empty Service"
   - Name it: `backend`
   - Go to Settings → Connect to GitHub
   - Select your repository
   - Set root directory: `backend`

5. **Create Frontend Service**
   - Click "Create Service" → "Empty Service" 
   - Name it: `frontend`
   - Connect to same GitHub repository
   - Set root directory: `frontend`

### Phase 2: Environment Variables Configuration

#### Backend Service Environment Variables

1. **Go to your Backend Service:**
   - In Railway dashboard, click on your `backend` service
   - Click on the **"Variables"** tab

2. **Add these variables one by one:**
   
   **Click "Add Variable" for each:**
   
   ```
   LOG_LEVEL = info
   ```
   
   ```
   ENVIRONMENT = production
   ```

3. **Add DATABASE_URL:**
   - Click "Add Variable"
   - Variable Name: `DATABASE_URL`
   - Variable Value: `${{Postgres.DATABASE_URL}}` 
   - This references your PostgreSQL service automatically
   
   **Alternative if above doesn't work:**
   - Go to your PostgreSQL service → Variables tab
   - Copy the `DATABASE_URL` value 
   - Paste it into your backend service variables

#### Frontend Service Environment Variables

1. **Go to your Frontend Service:**
   - Click on your `frontend` service  
   - Click on the **"Variables"** tab

2. **Add this variable:**
   ```
   VITE_API_BASE_URL = ${{backend.RAILWAY_PUBLIC_DOMAIN}}
   ```
   
   **OR** if the above doesn't work, you'll need to:
   - First deploy your backend service to get its URL
   - Then come back and set: `VITE_API_BASE_URL = https://your-actual-backend-url.railway.app`

#### Step-by-Step in Railway UI:

**For Backend Variables:**
1. Backend Service → Variables Tab → "Add Variable"
2. Variable Name: `LOG_LEVEL`, Value: `info` → Save
3. Variable Name: `ENVIRONMENT`, Value: `production` → Save
4. Variable Name: `DATABASE_URL`, Value: `${{Postgres.DATABASE_URL}}` → Save

**For Frontend Variables:**
1. Frontend Service → Variables Tab → "Add Variable"  
2. Variable Name: `VITE_API_BASE_URL`, Value: `${{backend.RAILWAY_PUBLIC_DOMAIN}}` → Save

#### What You Should See:

**Backend Variables:**
- ✅ `LOG_LEVEL = info`
- ✅ `ENVIRONMENT = production`  
- ✅ `DATABASE_URL = postgresql://postgres:...` (auto-created by Railway)

**Frontend Variables:**
- ✅ `VITE_API_BASE_URL = https://backend-production-xxxx.up.railway.app`

💡 **Pro Tip:** Railway's variable reference `${{backend.RAILWAY_PUBLIC_DOMAIN}}` automatically updates if your backend URL changes. If this doesn't work initially, you can set the actual URL after your first backend deployment.

### Phase 3: GitHub Secrets Setup

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```
RAILWAY_TOKEN=your_railway_token
RAILWAY_PROJECT_ID=your_project_id  
RAILWAY_BACKEND_SERVICE_ID=backend_service_id
RAILWAY_FRONTEND_SERVICE_ID=frontend_service_id
```

**To get these values:**

1. **Railway Token:**
   - Go to Railway Dashboard → Account Settings → Tokens
   - Create new token with deployment permissions

2. **Project ID:**
   - In your Railway project, go to Settings → General
   - Copy the Project ID

3. **Service IDs:**
   - Click on each service → Settings → General
   - Copy the Service ID for both backend and frontend

### Phase 4: Dockerfile Updates (Minor)

Your existing Dockerfiles are already optimized! The only change needed:

#### Backend Dockerfile:
```dockerfile
# Change the CMD to use Railway's PORT environment variable
CMD ["/app/.venv/bin/python", "-m", "uvicorn", "test_spectrum_system.main:app", "--host", "0.0.0.0", "--port", "${PORT:-8000}"]
```

#### Frontend is already perfect - nginx handles port 80 by default.

### Phase 5: Health Check Endpoints

Add to your FastAPI backend (`backend/src/test_spectrum_system/main.py`):

```python
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "backend"}
```

### Phase 6: Database Migrations

Your Alembic setup will work automatically! The GitHub Action runs:
```bash
railway run alembic upgrade head
```

## 🚀 Deployment Process

### Automatic Deployments:
- Push changes to `main` branch
- GitHub Actions will automatically deploy:
  - Changes in `backend/` → deploys backend
  - Changes in `frontend/` → deploys frontend

### Manual Deployments:
- Go to GitHub Actions tab
- Click "Run workflow" on either deployment workflow

## 🔍 Monitoring & Troubleshooting

### Check Deployment Status:
```bash
# Using Railway CLI
railway status
railway logs
```

### Common Issues:

1. **Database Connection Issues:**
   - Verify `DATABASE_URL` in backend service variables
   - Check PostgreSQL service is running

2. **Frontend Can't Reach Backend:**
   - Verify `VITE_API_BASE_URL` points to correct backend URL
   - Check CORS settings in FastAPI

3. **Migration Failures:**
   - Check database permissions
   - Verify alembic configuration

## 🎯 Expected Results

After successful deployment:

- **Database**: `postgresql://user:pass@host/dbname`
- **Backend**: `https://backend-production-xxxx.up.railway.app`
- **Frontend**: `https://frontend-production-xxxx.up.railway.app`

## 💡 Pro Tips

1. **Custom Domains**: Add custom domains in Railway service settings
2. **Environment Variables**: Use Railway's variable references between services
3. **Scaling**: Railway auto-scales based on usage
4. **Logs**: Use `railway logs` or Railway dashboard for debugging
5. **Rollbacks**: Redeploy previous commits via GitHub Actions

## 🏁 Next Steps

1. Follow Phase 1-3 to set up Railway project
2. Add GitHub secrets
3. Push to main branch - deployments will start automatically!
4. Monitor deployment in GitHub Actions and Railway dashboard

Your application will be live with professional CI/CD pipeline! 🎉 