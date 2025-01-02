-- name: CreateTask :exec
INSERT INTO tasks (id, workspace_id, project_id, assignee_id, name, description, position, due_date, status, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);

-- name: GetTaskWithHighestPosition :one
SELECT position FROM tasks WHERE workspace_id = $1 AND project_id = $2 ORDER BY position DESC LIMIT 1;

-- name: GetTasksByFilters :many
SELECT * FROM tasks
WHERE ($1::uuid IS NULL OR project_id = $1)
  AND ($2::text IS NULL OR status = $2)
  AND ($3::date IS NULL OR due_date = $3)
  AND ($4::uuid IS NULL OR assignee_id = $4)
  AND (LOWER(name) LIKE LOWER('%' || $5 || '%') OR $5 IS NULL)
ORDER BY created_at DESC;

-- name: GetUserById :one
SELECT username, image FROM users WHERE id = $1;

-- name: GetTaskProject :one
SELECT name, image_url FROM projects WHERE workspace_id = $1 AND id = $2;

-- name: GetTaskProjects :many
SELECT id, name, image_url FROM projects WHERE workspace_id = $1 ORDER BY created_at DESC;

-- name: GetTaskMembers :many
SELECT m.id, m.role, u.id AS user_id, u.username AS user_username, u.image AS user_image
FROM members m
LEFT JOIN users u ON m.user_id = u.id
WHERE m.workspace_id = $1
ORDER BY m.created_at ASC;