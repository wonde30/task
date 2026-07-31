# TaskFlow — Modern Workspace Management App

A premium, full-stack Task Management application featuring a high-fidelity **Vue 3 (Composition API)** frontend, styled with **Tailwind CSS v4** (light/white design), backed by a RESTful **Laravel 13** API utilizing **Sanctum** token authentication.

---

## Technical Stack & Architecture

### Backend (`/server`)
*   **Framework**: Laravel 13
*   **PHP**: 8.4+
*   **Database**: MySQL (`task_management` database)
*   **Authentication**: Laravel Sanctum (token-based api authentication)
*   **Key Controllers**:
    *   `AuthController`: Manages registration, logins, dynamic profile updates, password modifications, and session termination.
    *   `TaskController`: Custom-built paginated query handler with full text searching, status toggling, and multi-field sorting.
    *   `CategoryController`: Workspace separation manager with counting aggregates.
    *   `DashboardController`: Computes week-over-week trends comparing task velocity stats.

### Frontend (`/client`)
*   **Core**: Vue 3 with TypeScript
*   **Styling**: Tailwind CSS v4 (light theme design)
*   **State Management**: Pinia (auth, tasks, dashboard stores)
*   **Routing**: Vue Router 5 (dynamic authentication hydration checks)
*   **Visual Charts**: Chart.js 4 & vue-chartjs 5

---

## Local Development Setup

### 1. Database Setup
Ensure you have MySQL running locally. Set up the credentials in your `server/.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=task_management
DB_USERNAME=root
DB_PASSWORD=
```
Run migrations to build the tables:
```bash
cd server
php artisan migrate
```

### 2. Populate Test Data
To view the line charts, completion metrics, and week-over-week analytics immediately upon login, seed the database:
```bash
php artisan db:seed
```
This registers a default testing user:
*   **Email**: `test@example.com`
*   **Password**: `password`

### 3. Running Servers
Start the backend Laravel server on port `8000`:
```bash
cd server
php artisan serve
```

Start the frontend Vite server on port `5173`:
```bash
cd client
npm run dev
```

Visit the workspace in your browser at `http://localhost:5173`.

---

## Core Features & Testing

### Verification Commands
To execute the automated PHP test suite for the REST controller API:
```bash
cd server
php artisan test
```

To run TypeScript verification and compile the assets:
```bash
cd client
npm run build
```
