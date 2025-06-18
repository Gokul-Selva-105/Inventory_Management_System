# Inventory Management System API

This is the backend API for the Inventory Management System built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- RESTful API endpoints for products, categories, users, and stock history
- JWT authentication and authorization
- MongoDB database integration
- CORS enabled for frontend integration

## Setup Instructions

1. Install dependencies:

   ```
   npm install
   ```

2. Set up environment variables in `.env` file (already created)

3. Start the development server:

   ```
   npm run dev
   ```

4. For production:
   ```
   npm start
   ```

## API Endpoints

### Products

- GET /api/products - Get all products
- GET /api/products/:id - Get product by ID
- POST /api/products - Create a new product
- PUT /api/products/:id - Update a product
- DELETE /api/products/:id - Delete a product

### Categories

- GET /api/categories - Get all categories
- GET /api/categories/:id - Get category by ID
- POST /api/categories - Create a new category
- PUT /api/categories/:id - Update a category
- DELETE /api/categories/:id - Delete a category

### Users

- POST /api/users/register - Register a new user
- POST /api/users/login - Login user
- GET /api/users/profile - Get user profile (protected)
- PUT /api/users/profile - Update user profile (protected)

### Stock History

- GET /api/stock-history - Get all stock history entries
- GET /api/stock-history/:productId - Get stock history for a specific product
- POST /api/stock-history - Create a new stock history entry

## Folder Structure

```
/api
  /controllers
    - productController.js
    - categoryController.js
    - userController.js
    - stockHistoryController.js
  /middleware
    - authMiddleware.js
    - errorMiddleware.js
  /models
    - productModel.js
    - categoryModel.js
    - userModel.js
    - stockHistoryModel.js
  /routes
    - productRoutes.js
    - categoryRoutes.js
    - userRoutes.js
    - stockHistoryRoutes.js
  - server.js
  - package.json
  - .env
```

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- cors for cross-origin resource sharing
