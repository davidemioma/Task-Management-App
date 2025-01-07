-- name: CreateTask :exec
INSERT INTO tasks (id, workspace_id, project_id, assignee_id, name, description, position, due_date, status, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);

-- name: GetTaskWithHighestPosition :one
SELECT position FROM tasks WHERE workspace_id = $1 AND project_id = $2 ORDER BY position DESC LIMIT 1;

-- name: GetAllTasksByProjId :many
SELECT * FROM tasks
WHERE 
    workspace_id = $1
    AND project_id = $2
ORDER BY created_at DESC;

-- name: GetFilteredTasks :many
SELECT * FROM tasks
WHERE 
    workspace_id = $1
    AND project_id = $2
    AND ($3::uuid IS NULL OR assignee_id = $3::uuid)
    AND ($4 = '' OR status = $4)
    AND ($5::timestamp IS NULL OR due_date = $5::timestamp)  
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

-- name: UpdateTask :exec
UPDATE tasks
SET 
    name = $1,
    description = $2,
    status = $3,
    due_date = $4,
    assignee_id = $5,
    project_id = $6,
    position = $7,
    updated_at = NOW()
WHERE id = $8 AND workspace_id = $9;

-- name: CheckForProjectChange :one
SELECT id, project_id, position FROM tasks WHERE workspace_id = $1 AND id = $2;

-- name: DeleteTask :exec
DELETE FROM tasks WHERE id = $1 AND workspace_id = $2 AND project_id = $3;

-- name: GetNumberOfTasks :one
SELECT COUNT(*) as total_tasks 
FROM tasks 
WHERE status = $1 AND workspace_id = $2 AND project_id = $3;

-- name: UpdateTaskStatusAndPosition :exec
UPDATE tasks
SET 
   status = $1,
   position = $2,
   updated_at = NOW()
WHERE id = $3 AND workspace_id = $4; 

-- name: GetMyTasks :many
SELECT * FROM tasks
WHERE 
    workspace_id = $1
    AND assignee_id = $2
ORDER BY created_at DESC;

-- name: GetTaskById :one
SELECT * FROM tasks
WHERE id = $1 AND workspace_id = $2;