-- name: GetSomeProjects :many
SELECT * FROM projects
WHERE workspace_id = $1
ORDER BY created_at DESC
LIMIT 5;

-- name: GetSomeMembers :many
SELECT m.id, m.role, u.username, u.email, u.image
FROM members m
JOIN users u ON m.user_id = u.id
WHERE m.workspace_id = $1
ORDER BY m.created_at ASC
LIMIT 5;