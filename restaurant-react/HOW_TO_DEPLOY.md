# 🤑 100% FREE Deployment Guide: The Zero-Cost Stack

If you want to publish your website **completely for free** (no credit card required) while keeping your data safe forever, follow this guide.

---

## 🏗️ The "Zero-Cost" Architecture
- **Frontend**: [Firebase Hosting](https://firebase.google.com/) (Free storage and CDN).
- **Backend**: [Render.com](https://render.com/) (Free "Web Service" tier).
- **Database**: [Supabase](https://supabase.com/) (Free persistent PostgreSQL - better than SQLite for the cloud!).

---

## 🗄️ Step 1: Set up your Database (Supabase)
Since we can't use a local SQLite file in the cloud for free, we use a cloud database.

1.  Create a free account on [Supabase.com](https://supabase.com/).
2.  Create a new project named `MealUp`.
3.  Go to **Project Settings** > **Database**.
4.  Copy the **Connection String** (URI). It looks like: `postgres://postgres:[YOUR_PASSWORD]@xxx.supabase.co:5432/postgres`
5.  **Keep this URL safe.**

---

## 🐳 Step 2: Deploy the Backend (Render)
Render is the easiest way to host a Node.js server for free.

1.  Push your code to **GitHub**.
2.  Create a free account on [Render.com](https://render.com/).
3.  Click **New +** > **Web Service**.
4.  Connect your GitHub repository.
5.  **Configure**:
    - **Build Command**: `npm install` (within the backend folder)
    - **Start Command**: `node server.js`
6.  **Environment Variables** (Very Important!):
    - `DATABASE_URL`: (Paste your Supabase URL here)
    - `PORT`: `10000` (Render's default)
    - `NODE_ENV`: `production`
7.  **Deploy**: Render will build your app. Once finished, you'll get a URL like `https://mealup-backend.onrender.com`.

---

## 🌐 Step 3: Configure the Frontend
Now we link the website to your new live backend.

1.  Open [frontend/.env.production](file:///c:/Users/Innovatech/Desktop/fin__pro_IHM_V2/restaurant-react/frontend/.env.production).
2.  Paste your Render URL:
    ```env
    VITE_API_URL=https://mealup-backend.onrender.com/api
    ```

---

## 🔥 Step 4: Deploy the Frontend (Firebase)
Firebase Hosting is free and incredibly fast.

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2.  In your terminal (local machine):
    ```powershell
    npm install -g firebase-tools
    firebase login
    cd frontend
    firebase init
    ```
    - Select **Hosting**.
    - Choose your project.
    - Public directory: `dist`
    - Configure as single-page app: **Yes**
3.  **Build & Deploy**:
    ```powershell
    npm run build
    firebase deploy
    ```

---

## 💡 Pro Tips for "Free Tier" users:
- **Wake up time**: Render's free tier "sleeps" after 15 minutes of inactivity. The first time you open the site after a break, it might take 30 seconds to start.
- **Database Size**: Supabase allows up to 500MB for free, which is enough for thousands of orders!

---

**🎉 Congratulations! Your restaurant is officially online and it costs you $0.00!**
