# API Documentation Builder - Backend

This directory contains the Express.js and MongoDB backend for the Interactive API Documentation Builder.

## Features

- **RESTful API** for managing controllers and routes.
- **MongoDB Integration** using Mongoose for data persistence.
- **Data Validation** via Mongoose schemas.
- **Environment-based Configuration** for easy setup.
- **Data Seeding Script** to initialize the database with sample data.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- A MongoDB Atlas cluster or a local MongoDB installation.

## Setup & Installation

1.  **Navigate to the backend directory:**

    ```bash
    cd backend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Check your environment file:**

    The project now includes a `.env` file with the necessary `MONGODB_URI`. Please ensure it points to your correct MongoDB database if you need to change it.

## Running the Server

-   **Development Mode:**
    This command starts the server using `nodemon`, which will automatically restart on file changes.

    ```bash
    npm run dev
    ```
    Look for the output `Server running on port 5000` and `MongoDB Connected...` in your terminal. This is critical for the frontend to work.

-   **Production Mode:**

    ```bash
    npm start
    ```

The server will be running on the port specified in your `.env` file (default is `5000`).

## Troubleshooting

### "Failed to fetch" or "Could not connect to the API server" Error

This is a network error that means the frontend (in your browser) could not connect to the backend server. Follow these steps to fix it:

1.  **Is the backend server running?** This is the most common cause. Make sure you have run `npm run dev` inside the `backend` directory and that you see **both** the "Server running..." and "MongoDB Connected..." messages.
2.  **Is the MongoDB URI correct?** Double-check your `.env` file. If the `MONGODB_URI` is incorrect, the server will crash right after starting.
3.  **Are the ports correct?** The frontend expects the backend to be at `http://localhost:5000`. Ensure your `.env` file has `PORT=5000` and that no other service is using that port.
4.  **Check for Firewall/Proxy issues:** Ensure that no firewall or network proxy is blocking local connections.

## Seeding the Database (Optional)

If you want to populate the database with initial sample data, run the seed script.

**Warning:** This script will first **delete all existing controllers** in the database.

```bash
npm run seed
```

This is useful for getting a clean slate or for initial setup.

## API Endpoints

The API is available under the `/api` prefix (e.g., `http://localhost:5000/api/controllers`).

- `GET /api/controllers` - Get all controllers and their routes.
- `POST /api/controllers` - Create a new controller.
- `PUT /api/controllers/:id` - Update a controller.
- `DELETE /api/controllers/:id` - Delete a controller.
- `POST /api/controllers/:id/routes` - Add a route to a controller.
- `PUT /api/controllers/:controllerId/routes/:routeId` - Update a specific route.
- `DELETE /api/controllers/:controllerId/routes/:routeId` - Delete a specific route.