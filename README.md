# 📝 ToDo Application

A full-stack **ToDo Application** built using **React (Vite)** for the frontend, **Node.js + Express** for the backend, and **MongoDB Atlas** for the database.  
It allows users to create, view, check/uncheck, and delete tasks with persistent data storage.

---

## 🚀 Features

- ✅ Add new tasks
- 🗑️ Delete tasks
- 🔁 Mark tasks as completed (toggle)
- 💾 Persistent storage with MongoDB
- ⚡ Modern UI built with React + Vite
- 🌐 RESTful API using Express.js
- 🧩 Deployed on Render (Backend) and Vercel (Frontend)

---

## 🧱 Tech Stack

| Layer | Technology |
|:------|:------------|
| Frontend | React (Vite), TailwindCSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Deployment | Render (API) & Vercel (Frontend) |

---

## 📁 Project Structure

```
Todo-Application/
│
├── backend/
│   ├── app.js               # Express server entry
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── package.json         # Backend dependencies
│   └── .env                 # Environment variables (local)
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.js
│   └── index.html
│
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file inside `/backend` with the following values:

```
MONGO_URI=your_mongodb_atlas_connection_string
PORT=5000
```

---

## 🧑‍💻 Local Development Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/ADIBAINS/Todo-Application.git
cd Todo-Application
```

### 2️⃣ Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3️⃣ Run the Application Locally
Open two terminals:

#### Terminal 1 – Backend
```bash
cd backend
npm start
```

#### Terminal 2 – Frontend
```bash
cd frontend
npm run dev
```

The app should now be live on:
- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`

---

## ☁️ Deployment Guide

### 🌍 Backend (Render)

1. Push your code to GitHub.  
2. Create a new **Render Web Service**.  
3. Connect your repository.  
4. Root Directory: `backend`  
5. Build Command:  
   ```
   npm install
   ```
6. Start Command:  
   ```
   node app.js
   ```
7. Add environment variables (`MONGO_URI`, `PORT`).  
8. Deploy.

Your API will be available at something like:
```
https://todo-backend.onrender.com
```

---

### 🌐 Frontend (Vercel)

1. Go to [Vercel](https://vercel.com/).  
2. Import your GitHub repo.  
3. Configure the project:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. In `frontend/src`, make sure your API URL points to your deployed backend:
   ```js
   const API_BASE_URL = "https://todo-backend.onrender.com";
   ```
5. Deploy.

---

## 📸 Screenshots

| Feature | Screenshot |
|----------|-------------|
| Home Page | *(Add here)* |
| Completed Task | *(Add here)* |
| API Endpoint | *(Add here)* |

---

## 🧾 License

This project is licensed under the **MIT License**.

---

## 💡 Author

**👨‍💻 Adi Bains**  
📍 B.Tech in Computer Science, IP University, New Delhi  
🌐 [GitHub Profile](https://github.com/ADIBAINS)

---

## ⭐ Support

If you found this project helpful, consider giving it a **star ⭐** on GitHub — it really helps!
