-- name: CreateMember :exec
INSERT INTO members (id, user_id, workspace_id, role, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6);

-- name: GetMember :one
SELECT * FROM members WHERE workspace_id = $1 AND user_id = $2;