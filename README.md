# LinkSnip — Smart URL Shortener

A modern, full-stack URL shortening platform built with the MERN stack (MongoDB, Express, React, Node.js). 

LinkSnip allows users to quickly shorten long URLs, create custom aliases, and track link engagement (clicks and last accessed dates) through a clean, glassmorphic dashboard. It also includes a protected Admin Panel for platform-wide analytics.

---

## ✨ Features

- **User Authentication**: Secure signup and login using JWT.
- **URL Shortening**: Instantly convert long URLs into tiny, shareable links.
- **Custom Aliases**: Choose your own custom short code (e.g., `linksnip.com/my-custom-name`).
- **Click Tracking**: Tracks total clicks and the date/time the link was last visited.
- **Personal Dashboard**: Users can view, copy, and delete their own created links.
- **Admin Panel**: Role-based access control. Admins can view platform-wide stats (total URLs, total clicks, active vs inactive), view all registered users, and delete any URL.
- **Dark/Light Mode**: Fully responsive React UI with built-in theme toggling.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Chart.js, Vanilla CSS.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Authentication**: JSON Web Tokens (JWT), bcryptjs.

---

## 📂 Project Architecture

The repository is organized into two distinct directories representing the client and server:

```text
url-shortener-platform/
├── backend/                  # Node.js + Express API
│   ├── controllers/          # Request handlers (auth, url)
│   ├── cron/                 # Background jobs (e.g., deleting inactive URLs)
│   ├── db/                   # MongoDB connection setup
│   ├── errors/               # Custom error classes (NotFound, BadRequest, etc.)
│   ├── middleware/           # Express middlewares (auth, admin, error handling)
│   ├── models/               # Mongoose schemas (User, Url)
│   ├── routes/               # API endpoint definitions
│   └── app.js                # Main Express server entry point
│
└── frontend/                 # React + Vite Client
    ├── src/
    │   ├── components/       # Reusable UI components (Sidebar, StatCard, etc.)
    │   ├── context/          # React Contexts (Theme, Toast notifications)
    │   ├── pages/            # Main route pages (Dashboard, Login, etc.)
    │   │   └── admin/        # Admin-specific pages and layouts
    │   ├── utils/            # Helper functions and API wrappers
    │   ├── App.jsx           # React Router configuration
    │   ├── index.css         # Global design tokens and styles
    │   └── main.jsx          # React DOM entry point
    └── vite.config.js        # Vite config with backend proxy setup
```

---

## 🚀 How to Run Locally

Because this project is separated into a frontend and a backend, you will need to run two separate terminals.

### 1. Database Setup
Ensure you have a MongoDB cluster (like MongoDB Atlas) and have your connection string ready. 

### 2. Backend Setup
Open a terminal and navigate to the `backend` folder:
```bash
cd backend
npm install
```
Create a `.env` file inside the `backend` folder with the following variables:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_LIFETIME=30d
```
Start the backend server:
```bash
npm start
```
*The API will run on http://localhost:5000*

### 3. Frontend Setup
Open a second terminal and navigate to the `frontend` folder:
```bash
cd frontend
npm install
```
Start the Vite development server:
```bash
npm run dev
```
*The React app will run on http://localhost:3000 (or 3001). Vite is configured to automatically proxy API requests to your local backend.*

---

## 🌍 Deployment

To deploy this application to production:
1. **Backend (e.g., Render)**: Deploy the `backend` folder as a Node Web Service. Make sure to add your `.env` variables in the deployment dashboard.
2. **Frontend (e.g., Vercel)**: Deploy the `frontend` folder. Add an environment variable named `VITE_API_URL` and set it to your live backend URL (e.g., `https://your-api.onrender.com`).

---

## 🛡️ License

This project is open-source and available under the MIT License.
