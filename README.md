# AI Marketing Dashboard - Render Deployment

## Quick Deploy (5 minutes)

### Step 1: Push to GitHub
```bash
cd ~/ai-dashboard-render
git init
git add .
git commit -m "Initial commit"
gh repo create ai-dashboard --public --source=. --push
```

### Step 2: Deploy Backend
1. Go to https://render.com (sign up if needed)
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Settings:
   - Name: `ai-dashboard-backend`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Instance Type: Free
5. Click "Create Web Service"
6. Copy the backend URL (e.g., `https://ai-dashboard-backend.onrender.com`)

### Step 3: Deploy Frontend
1. Click "New +" → "Static Site"
2. Connect same GitHub repo
3. Settings:
   - Name: `ai-dashboard-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `.next`
   - Add Environment Variable:
     - Key: `NEXT_PUBLIC_API_URL`
     - Value: [Your backend URL from Step 2]
4. Click "Create Static Site"

### Step 4: Test
Visit your frontend URL and login with:
- Email: user@example.com
- Password: password

Done!

## Alternative: Deploy Locally
```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:3000
