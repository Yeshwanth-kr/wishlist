# 🧾 Shared Wishlist App

A full-stack web application that allows users to create, manage, and share wishlists with others in real-time.

Built for the FlockShop Full Stack Internship Assignment using:

- ⚛️ React (Frontend)
- 🧪 Express.js + MongoDB (Backend)
- ⚡ Socket.IO (Real-time sync)
- 🎨 Tailwind CSS (Styling)

---

## ✨ Features

### 🔐 Authentication

- Sign up and log in using email & password (JWT-based)
- Protected routes and auto-redirect for logged-in users

### 📋 Wishlists

- Create and delete wishlists
- Invite members by email
- View only the wishlists you created or were invited to
- Realtime sync of deletions and invites via Socket.IO

### 📦 Products

- Add/delete products inside a wishlist
- See who added each product
- Real-time product sync across all members

### 👥 Members

- Invite others to a wishlist
- Only invited users can see shared wishlists
- Socket.io rooms for per-user & per-wishlist updates

---

## 💻 Tech Stack

| Category  | Tech                  |
| --------- | --------------------- |
| Frontend  | React, Tailwind CSS   |
| Backend   | Express, Node.js      |
| Database  | MongoDB with Mongoose |
| Real-Time | Socket.IO             |
| Auth      | JWT + bcrypt          |

---

## 🚀 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Yeshwanth-kr/wishlist.git
cd wishlist
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a .env file in /server:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wishlist
JWT_SECRET=your_jwt_secret
ORIGIN = "http://localhost:3000"
```

Start the backend:

```bash
npm run server
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run start
```

Create a .env file in /client:

```env
REACT_APP_URL = "http://localhost:5000"
```

## Links

# Server available on (https://wishlist-server-7tua.onrender.com)

# Live App available on (https://wishlist-six-sable.vercel.app)

## 📸 Loom video

[![Watch the video](https://github.com/Yeshwanth-kr/wishlist/blob/main/assets/wishlist.png)](https://www.loom.com/share/723191aaf03f4e388c44130a08424709?sid=5d279032-f5cf-45c8-b276-84bf137502f9)

## 📂 Project Structure

```pgsql
/client       --> React frontend
/server       --> Express + MongoDB backend
```

## 📌 Future Improvements

- 🔁 Add emoji reactions and product comments
- 📝 Edit product functionality
- 📱 Mobile-first responsive layout
- 🔔 Toast alerts for real-time changes

## 🧠 Learnings & Scaling Ideas

- 👥 Socket.IO room logic for users and wishlists
- 🔐 JWT-based stateless authentication
- 🔌 Easily extendable to Firebase/Auth0 for production
- 🧵 Could use Redis pub/sub for socket scaling in production

## 🧑‍💻 Author

- Developed by Yeshwanth Krishna
- GitHub: @Yeshwanth-kr
