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
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally, or a MongoDB Atlas cluster.

## Setup & Installation

1.  **Navigate to the backend directory:**

    ```bash
    cd backend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Create a `.env` file:**

    Copy the example environment file:
    ```bash
    cp .env.example .env
    ```

4.  **Configure environment variables:**

    Open the newly created `.env` file and update the `MONGODB_URI` to point to your MongoDB instance.

    - **For a local MongoDB instance:**
        `MONGODB_URI=mongodb://127.0.0.1:27017/api-docs-db`

    - **For MongoDB Atlas:**
        Replace `<user>`, `<password>`, and the cluster URL with your credentials.
        `MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/api-docs-db?retryWrites=true&w=majority`

## Running the Server

-   **Development Mode:**
    This command starts the server using `nodemon`, which will automatically restart the server on file changes.

    ```bash
    npm run dev
    ```

-   **Production Mode:**

    ```bash
    npm start
    ```

The server will be running on the port specified in your `.env` file (default is `5000`).

## Seeding the Database (Optional)

If you want to populate the database with the initial sample data from the frontend, you can run the seed script.

**Warning:** This script will first **delete all existing controllers** in the database.

```bash
npm run seed
```

This is useful for getting a clean slate or for initial setup.

## API Endpoints

The API is available under the `/api` prefix.

- `GET /api/controllers` - Get all controllers and their routes.
- `POST /api/controllers` - Create a new controller.
- `PUT /api/controllers/:id` - Update a controller.
- `DELETE /api/controllers/:id` - Delete a controller.
- `POST /api/controllers/:id/routes` - Add a route to a controller.
- `PUT /api/controllers/:controllerId/routes/:routeId` - Update a specific route.
- `DELETE /api/controllers/:controllerId/routes/:routeId` - Delete a specific route.
