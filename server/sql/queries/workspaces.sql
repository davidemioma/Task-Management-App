-- name: CreateWorkspace :exec
INSERT INTO workspaces (id, user_id, name, image_url, created_at, updated_at, invite_code)
VALUES ($1, $2, $3, $4, $5, $6, encode(sha256(random()::text::bytea), 'hex'));

-- name: GetWorkspaces :many
SELECT DISTINCT w.* 
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
WHERE workspaces.id = $3 AND (workspaces.user_id = $4 OR EXISTS (
    SELECT 1 FROM members m 
    WHERE m.workspace_id = workspaces.id AND m.user_id = $4 AND m.role = 'ADMIN'
));  

-- name: GetWorkspaceAdmin :one
SELECT w.*, m.role
FROM members m
JOIN workspaces w ON m.workspace_id = w.id
WHERE m.user_id = $1 AND m.workspace_id = $2;

-- name: GetWorkspaceById :one
SELECT * FROM workspaces w
LEFT JOIN members m ON w.id = m.workspace_id
WHERE w.id = $1 AND (w.user_id = $2 OR m.user_id = $2);

-- name: GetSigleWorkspace :one
SELECT id, name, invite_code FROM workspaces WHERE id = $1;

-- name: DeleteWorkspace :exec
DELETE FROM workspaces
WHERE workspaces.id = $1 AND (workspaces.user_id = $2 OR EXISTS (
    SELECT 1 FROM members m 
    WHERE m.workspace_id = workspaces.id AND m.user_id = $2 AND m.role = 'ADMIN'
));

-- name: UpdateWorkspaceInviteCode :exec
UPDATE workspaces
SET 
    invite_code = encode(sha256(random()::text::bytea), 'hex'),
    updated_at = NOW()
WHERE workspaces.id = $1 AND (workspaces.user_id = $2 OR EXISTS (
    SELECT 1 FROM members m 
    WHERE m.workspace_id = workspaces.id AND m.user_id = $2 AND m.role = 'ADMIN'
)); 

