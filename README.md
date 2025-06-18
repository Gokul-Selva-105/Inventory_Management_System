# Inventory Management System

A full-stack inventory management application with a React frontend and Node.js/Express backend.

## Project Structure

This project is organized as a monorepo with the following structure:

```
/
├── api/                  # Backend Node.js/Express API
│   ├── controllers/      # API controllers
│   ├── middleware/       # Express middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── .env              # Backend environment variables
│   ├── package.json      # Backend dependencies
│   └── server.js         # Express server entry point
│
├── inventory-management-system/  # Frontend React application
│   ├── public/           # Static assets
│   ├── src/              # Source code
│   │   ├── components/   # React components
│   │   ├── context/      # React context providers
│   │   ├── pages/        # Page components
│   │   ├── routes/       # React Router configuration
│   │   ├── services/     # API service functions
│   │   ├── styles/       # CSS styles
│   │   ├── utils/        # Utility functions
│   │   ├── App.jsx       # Main App component
│   │   └── main.jsx      # Application entry point
│   ├── .env              # Frontend environment variables
│   ├── package.json      # Frontend dependencies
│   └── vite.config.js    # Vite configuration
│
├── .gitignore            # Git ignore file
├── package.json          # Root package.json for monorepo
└── README.md             # Project documentation
```

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)

## Setup Instructions

1. **Clone the repository**

```bash
git clone <repository-url>
```

2. **Install dependencies**

```bash
npm install
```

This will install dependencies for both the frontend and backend.

3. **Environment Variables**

- Backend (.env in api folder):

```
NODE_ENV=development
PORT=5000
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRE=30d
```

- Frontend (.env in inventory-management-system folder):

```
VITE_API_URL=http://localhost:5000/api
```

4. **Start Development Servers**

```bash
npm run dev
```

This will start both the backend server (http://localhost:5000) and the frontend development server (http://localhost:5173).

## Building for Production

```bash
npm run build
```

This will build the frontend application for production deployment.

## API Endpoints

- **Auth**: `/api/users/login`, `/api/users/register`
- **Products**: `/api/products`
- **Categories**: `/api/categories`
- **Stock History**: `/api/stock-history`
- **QR Events**: `/api/qr-events`

## Technologies Used

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing

### Frontend
- React
- Vite
- React Router
- React Bootstrap
- Axios
- Framer Motion
- React Toastify