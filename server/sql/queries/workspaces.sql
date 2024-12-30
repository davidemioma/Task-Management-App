-- name: CreateWorkspace :exec
INSERT INTO workspaces (id, user_id, name, image_url, created_at, updated_at, invite_code)
VALUES ($1, $2, $3, $4, $5, $6, encode(sha256(random()::text::bytea), 'hex'));

-- name: GetWorkspaces :many
SELECT w.* 
FROM workspaces w
LEFT JOIN members m ON w.id = m.workspace_id
WHERE w.user_id = $1 OR m.user_id = $1
ORDER BY w.created_at DESC;