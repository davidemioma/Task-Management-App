-- name: CreateUser :one
INSERT INTO users (id, clerk_id, email, username, image, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: GetUserByClerkId :one
SELECT * FROM users WHERE clerk_id = $1;