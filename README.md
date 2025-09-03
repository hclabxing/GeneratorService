## GeneratorService

A simple full‑stack service that exposes two endpoints via a Go backend and a Next.js frontend.

### Backend

Run the service from the `backend` directory.

Setup and start:

```
cd backend
go mod tidy
go run ./cmd/server
```

API endpoints (default base URL `http://localhost:8080`):

- `POST /GetRandomNumber`
  - Request body: `{ "min": 1, "max": 10 }`
- `POST /GetRandomQuote`
  - Request body: `{}`

### Frontend

Run the Next.js app from the `frontend` directory.

Install and start:

```
cd frontend
npm i
npm run dev
```

### Configuration

- If the backend base URL is not the default, set the environment variable `NEXT_PUBLIC_BACKEND_URL` for the frontend.

### Testing

- Backend (from `backend`):

```
go test ./...
```

- Frontend (from `frontend`):

```
npm test
```

### Error Handling

- When `min > max` for `GetRandomNumber`, the backend returns an `InvalidArgument` error via ConnectRPC, and the frontend displays the corresponding error message.
