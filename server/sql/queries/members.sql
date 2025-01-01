-- name: CreateMember :exec
INSERT INTO members (id, user_id, workspace_id, role, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6);

-- name: GetMember :one
SELECT * FROM members WHERE workspace_id = $1 AND user_id = $2;

-- name: GetMemberById :one
SELECT * FROM members WHERE id = $1 AND workspace_id = $2;

-- name: GetWorkspaceMembers :many
SELECT m.*, u.username, u.email, u.image
FROM members m
JOIN users u ON m.user_id = u.id
WHERE m.workspace_id = $1
ORDER BY m.created_at ASC;

-- name: DeleteMember :exec
DELETE FROM members WHERE id = $1 AND workspace_id = $2;

-- name: UpdateMemberRole :exec
UPDATE members 
SET role = $1, updated_at = NOW()
WHERE id = $2 AND workspace_id = $3 AND role <> $1;