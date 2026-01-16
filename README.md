# Comment System

A full-stack comment system with real-time updates using React, Redux, Node.js, Express, MongoDB, and Socket.io.

## Demo
Here will be demo : 
https://comment-system-frontend.onrender.com/


## Project Structure

```
comment-system/
├── backend-comment-system/    # Node.js + Express + MongoDB backend
└── frontend-comment-system/   # React + Redux frontend
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend-comment-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The backend will be available at `http://localhost:5000`

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend-comment-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend root directory:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_API_SOCKET=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get single post with comments
- `POST /api/posts` - Create a new post

### Comments
- `POST /api/comments` - Create a new comment
- `PUT /api/comments/:id` - Update a comment
- `DELETE /api/comments/:id` - Delete a comment
- `POST /api/comments/:id/reactions` - Toggle reaction on a comment

## Features

- User authentication (register/login)
- Create, read, update, and delete comments
- Nested comments with unlimited depth
- Real-time updates using Socket.io
- Like/dislike comments
- Responsive design

## Technologies Used

### Frontend
- React
- Redux Toolkit
- TypeScript
- Tailwind CSS
- Socket.io Client
- React Router
- Axios

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- Socket.io
- TypeScript

## Environment Variables

### Backend
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT

### Frontend
- `VITE_API_BASE_URL` - Base URL for API requests
- `VITE_API_SOCKET` - WebSocket server URL

## License

MIT