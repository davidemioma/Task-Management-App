# Go Application

This is a Go-based application using SQLC, Goose, and Air for hot-reloading during development.

## Prerequisites

Ensure you have the following installed:

- Go (https://go.dev/dl/)
- Air (for hot-reloading): `go install github.com/cosmtrek/air@latest`

## Project Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. **Initialize Go modules:**

   ```bash
   go mod init <app-name>
   go mod tidy
   go mod download
   go mod vendor
   ```

3. **Install dependencies:**

   ```bash
   go get github.com/joho/godotenv
   go get github.com/go-chi/chi
   go get github.com/go-chi/cors
   ```

4. **Setup Environment:**
   - Create a `.env` file by copying `.env.example`

## Running the App

Use Air for hot-reloading during development:

```bash
air
```

Alternatively, you can run the app manually with:

```bash
go run main.go
```

## Database Migrations

Refer to the PostgreSQL README for migration instructions.

## Folder Structure

- `server/api`: Contains API route handlers.
- `server/internal`: Contains database setup and queries.
- `sql`: Contains SQL migrations and SQLC configurations.
- `.env`: Environment variables.
