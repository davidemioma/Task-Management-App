-- name: CreateWorkspace :exec
INSERT INTO workspaces (id, user_id, name, image_url, created_at, updated_at, invite_code)
VALUES ($1, $2, $3, $4, $5, $6, encode(sha256(random()::text::bytea), 'hex'));

-- name: GetWorkspaces :many
SELECT w.* 
FROM workspaces w
LEFT JOIN members m ON w.id = m.workspace_id
WHERE w.user_id = $1 OR m.user_id = $1
ORDER BY w.created_at DESC;

-- name: UpdateWorkspace :exec
UPDATE workspaces
SET 
    name = $1,
    image_url = $2,
    updated_at = NOW()
WHERE id = $3 AND user_id = $4;  

-- name: GetWorkspaceAdmin :one
SELECT w.*, m.role
FROM members m
JOIN workspaces w ON m.workspace_id = w.id
WHERE m.user_id = $1 AND m.workspace_id = $2;

-- name: GetWorkspaceById :one
SELECT * FROM workspaces WHERE id = $1 AND user_id = $2;

-- name: DeleteWorkspace :exec
DELETE FROM workspaces
WHERE id = $1 AND user_id = $2;