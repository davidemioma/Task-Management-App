-- name: CreateProject :exec
INSERT INTO projects (id, workspace_id, name, image_url, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6);

-- name: GetProjects :many
SELECT * FROM projects WHERE workspace_id = $1 ORDER BY created_at DESC;