-- name: GetTasksByMonth :many
SELECT id FROM tasks
WHERE 
    workspace_id = $1
    AND project_id = $2
    AND created_at >= $3::timestamp
    AND created_at <= $4::timestamp
ORDER BY created_at DESC;

-- name: GetAssignedTasksByMonth :many
SELECT id FROM tasks
WHERE 
    workspace_id = $1
    AND project_id = $2
    AND assignee_id = $3
    AND created_at >= $4::timestamp
    AND created_at <= $5::timestamp
ORDER BY created_at DESC;

-- name: GetIncompleteTasksByMonth :many
SELECT id FROM tasks
WHERE 
    workspace_id = $1
    AND project_id = $2
    AND status != 'DONE'
    AND created_at >= $3::timestamp
    AND created_at <= $4::timestamp
ORDER BY created_at DESC;

-- name: GetCompletedTasksByMonth :many
SELECT id FROM tasks
WHERE 
    workspace_id = $1
    AND project_id = $2
    AND status = 'DONE'
    AND created_at >= $3::timestamp
    AND created_at <= $4::timestamp
ORDER BY created_at DESC;

-- name: GetOverdueTasksByMonth :many
SELECT id FROM tasks
WHERE 
    workspace_id = $1
    AND project_id = $2
    AND status = 'DONE'
    AND due_date < NOW()
    AND created_at >= $3::timestamp
    AND created_at <= $4::timestamp
ORDER BY due_date ASC;

-- name: GetWorkspaceTasksByMonth :many
SELECT id FROM tasks
WHERE 
    workspace_id = $1
    AND created_at >= $2::timestamp
    AND created_at <= $3::timestamp
ORDER BY created_at DESC;

-- name: GetWorkspaceAssignedTasksByMonth :many
SELECT id FROM tasks
WHERE 
    workspace_id = $1
    AND assignee_id = $2
    AND created_at >= $3::timestamp
    AND created_at <= $4::timestamp
ORDER BY created_at DESC;

-- name: GetWorkspaceIncompleteTasksByMonth :many
SELECT id FROM tasks
WHERE 
    workspace_id = $1
    AND status != 'DONE'
    AND created_at >= $2::timestamp
    AND created_at <= $3::timestamp
ORDER BY created_at DESC;

-- name: GetWorkspaceCompletedTasksByMonth :many
SELECT id FROM tasks
WHERE 
    workspace_id = $1
    AND status = 'DONE'
    AND created_at >= $2::timestamp
    AND created_at <= $3::timestamp
ORDER BY created_at DESC;

-- name: GetWorkspaceOverdueTasksByMonth :many
SELECT id FROM tasks
WHERE 
    workspace_id = $1
    AND status = 'DONE'
    AND due_date < NOW()
    AND created_at >= $2::timestamp
    AND created_at <= $3::timestamp
ORDER BY due_date ASC;