-- name: CreateProject :exec
INSERT INTO projects (id, workspace_id, name, image_url, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6);

-- name: GetProjects :many
SELECT * FROM projects WHERE workspace_id = $1 ORDER BY created_at DESC;

-- name: GetProjectById :one
SELECT * FROM projects WHERE workspace_id = $1 AND id = $2;

-- name: UpdateProject :exec
UPDATE projects
SET 
    name = $1,
    image_url = $2,
    updated_at = NOW()
WHERE id = $3 AND workspace_id = $4;

-- name: DeleteProject :exec
DELETE FROM projects WHERE id = $1 AND workspace_id = $2;