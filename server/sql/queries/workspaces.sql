-- name: CreateWorkspace :exec
INSERT INTO workspaces (id, user_id, name, image_url, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6);