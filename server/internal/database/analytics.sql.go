// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: analytics.sql

package database

import (
	"context"
	"time"

	"github.com/google/uuid"
)

const getAssignedTasksByMonth = `-- name: GetAssignedTasksByMonth :many
SELECT id FROM tasks
WHERE 
    workspace_id = $1
    AND project_id = $2
    AND assignee_id = $3
    AND created_at >= $4::timestamp
    AND created_at <= $5::timestamp
ORDER BY created_at DESC
`

type GetAssignedTasksByMonthParams struct {
	WorkspaceID uuid.UUID
	ProjectID   uuid.UUID
	AssigneeID  uuid.NullUUID
	Column4     time.Time
	Column5     time.Time
}

func (q *Queries) GetAssignedTasksByMonth(ctx context.Context, arg GetAssignedTasksByMonthParams) ([]uuid.UUID, error) {
	rows, err := q.db.QueryContext(ctx, getAssignedTasksByMonth,
		arg.WorkspaceID,
		arg.ProjectID,
		arg.AssigneeID,
		arg.Column4,
		arg.Column5,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []uuid.UUID
	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		items = append(items, id)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getCompletedTasksByMonth = `-- name: GetCompletedTasksByMonth :many
SELECT id FROM tasks
WHERE 
    workspace_id = $1
    AND project_id = $2
    AND status = 'DONE'
    AND created_at >= $3::timestamp
    AND created_at <= $4::timestamp
ORDER BY created_at DESC
`

type GetCompletedTasksByMonthParams struct {
	WorkspaceID uuid.UUID
	ProjectID   uuid.UUID
	Column3     time.Time
	Column4     time.Time
}

func (q *Queries) GetCompletedTasksByMonth(ctx context.Context, arg GetCompletedTasksByMonthParams) ([]uuid.UUID, error) {
	rows, err := q.db.QueryContext(ctx, getCompletedTasksByMonth,
		arg.WorkspaceID,
		arg.ProjectID,
		arg.Column3,
		arg.Column4,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []uuid.UUID
	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		items = append(items, id)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getIncompleteTasksByMonth = `-- name: GetIncompleteTasksByMonth :many
SELECT id FROM tasks
WHERE 
    workspace_id = $1
    AND project_id = $2
    AND status != 'DONE'
    AND created_at >= $3::timestamp
    AND created_at <= $4::timestamp
ORDER BY created_at DESC
`

type GetIncompleteTasksByMonthParams struct {
	WorkspaceID uuid.UUID
	ProjectID   uuid.UUID
	Column3     time.Time
	Column4     time.Time
}

func (q *Queries) GetIncompleteTasksByMonth(ctx context.Context, arg GetIncompleteTasksByMonthParams) ([]uuid.UUID, error) {
	rows, err := q.db.QueryContext(ctx, getIncompleteTasksByMonth,
		arg.WorkspaceID,
		arg.ProjectID,
		arg.Column3,
		arg.Column4,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []uuid.UUID
	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		items = append(items, id)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getOverdueTasksByMonth = `-- name: GetOverdueTasksByMonth :many
SELECT id FROM tasks
WHERE 
    workspace_id = $1
    AND project_id = $2
    AND status = 'DONE'
    AND due_date < NOW()
    AND created_at >= $3::timestamp
    AND created_at <= $4::timestamp
ORDER BY due_date ASC
`

type GetOverdueTasksByMonthParams struct {
	WorkspaceID uuid.UUID
	ProjectID   uuid.UUID
	Column3     time.Time
	Column4     time.Time
}

func (q *Queries) GetOverdueTasksByMonth(ctx context.Context, arg GetOverdueTasksByMonthParams) ([]uuid.UUID, error) {
	rows, err := q.db.QueryContext(ctx, getOverdueTasksByMonth,
		arg.WorkspaceID,
		arg.ProjectID,
		arg.Column3,
		arg.Column4,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []uuid.UUID
	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		items = append(items, id)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getTasksByMonth = `-- name: GetTasksByMonth :many
SELECT id FROM tasks
WHERE 
    workspace_id = $1
    AND project_id = $2
    AND created_at >= $3::timestamp
    AND created_at <= $4::timestamp
ORDER BY created_at DESC
`

type GetTasksByMonthParams struct {
	WorkspaceID uuid.UUID
	ProjectID   uuid.UUID
	Column3     time.Time
	Column4     time.Time
}

func (q *Queries) GetTasksByMonth(ctx context.Context, arg GetTasksByMonthParams) ([]uuid.UUID, error) {
	rows, err := q.db.QueryContext(ctx, getTasksByMonth,
		arg.WorkspaceID,
		arg.ProjectID,
		arg.Column3,
		arg.Column4,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []uuid.UUID
	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		items = append(items, id)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getWorkspaceAssignedTasksByMonth = `-- name: GetWorkspaceAssignedTasksByMonth :many
SELECT id FROM tasks
WHERE 
    workspace_id = $1
    AND assignee_id = $2
    AND created_at >= $3::timestamp
    AND created_at <= $4::timestamp
ORDER BY created_at DESC
`

type GetWorkspaceAssignedTasksByMonthParams struct {
	WorkspaceID uuid.UUID
	AssigneeID  uuid.NullUUID
	Column3     time.Time
	Column4     time.Time
}

func (q *Queries) GetWorkspaceAssignedTasksByMonth(ctx context.Context, arg GetWorkspaceAssignedTasksByMonthParams) ([]uuid.UUID, error) {
	rows, err := q.db.QueryContext(ctx, getWorkspaceAssignedTasksByMonth,
		arg.WorkspaceID,
		arg.AssigneeID,
		arg.Column3,
		arg.Column4,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []uuid.UUID
	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		items = append(items, id)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getWorkspaceCompletedTasksByMonth = `-- name: GetWorkspaceCompletedTasksByMonth :many
SELECT id FROM tasks
WHERE 
    workspace_id = $1
    AND status = 'DONE'
    AND created_at >= $2::timestamp
    AND created_at <= $3::timestamp
ORDER BY created_at DESC
`

type GetWorkspaceCompletedTasksByMonthParams struct {
	WorkspaceID uuid.UUID
	Column2     time.Time
	Column3     time.Time
}

func (q *Queries) GetWorkspaceCompletedTasksByMonth(ctx context.Context, arg GetWorkspaceCompletedTasksByMonthParams) ([]uuid.UUID, error) {
	rows, err := q.db.QueryContext(ctx, getWorkspaceCompletedTasksByMonth, arg.WorkspaceID, arg.Column2, arg.Column3)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []uuid.UUID
	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		items = append(items, id)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getWorkspaceIncompleteTasksByMonth = `-- name: GetWorkspaceIncompleteTasksByMonth :many
SELECT id FROM tasks
WHERE 
    workspace_id = $1
    AND status != 'DONE'
    AND created_at >= $2::timestamp
    AND created_at <= $3::timestamp
ORDER BY created_at DESC
`

type GetWorkspaceIncompleteTasksByMonthParams struct {
	WorkspaceID uuid.UUID
	Column2     time.Time
	Column3     time.Time
}

func (q *Queries) GetWorkspaceIncompleteTasksByMonth(ctx context.Context, arg GetWorkspaceIncompleteTasksByMonthParams) ([]uuid.UUID, error) {
	rows, err := q.db.QueryContext(ctx, getWorkspaceIncompleteTasksByMonth, arg.WorkspaceID, arg.Column2, arg.Column3)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []uuid.UUID
	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		items = append(items, id)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getWorkspaceOverdueTasksByMonth = `-- name: GetWorkspaceOverdueTasksByMonth :many
SELECT id FROM tasks
WHERE 
    workspace_id = $1
    AND status = 'DONE'
    AND due_date < NOW()
    AND created_at >= $2::timestamp
    AND created_at <= $3::timestamp
ORDER BY due_date ASC
`

type GetWorkspaceOverdueTasksByMonthParams struct {
	WorkspaceID uuid.UUID
	Column2     time.Time
	Column3     time.Time
}

func (q *Queries) GetWorkspaceOverdueTasksByMonth(ctx context.Context, arg GetWorkspaceOverdueTasksByMonthParams) ([]uuid.UUID, error) {
	rows, err := q.db.QueryContext(ctx, getWorkspaceOverdueTasksByMonth, arg.WorkspaceID, arg.Column2, arg.Column3)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []uuid.UUID
	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		items = append(items, id)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getWorkspaceTasksByMonth = `-- name: GetWorkspaceTasksByMonth :many
SELECT id FROM tasks
WHERE 
    workspace_id = $1
    AND created_at >= $2::timestamp
    AND created_at <= $3::timestamp
ORDER BY created_at DESC
`

type GetWorkspaceTasksByMonthParams struct {
	WorkspaceID uuid.UUID
	Column2     time.Time
	Column3     time.Time
}

func (q *Queries) GetWorkspaceTasksByMonth(ctx context.Context, arg GetWorkspaceTasksByMonthParams) ([]uuid.UUID, error) {
	rows, err := q.db.QueryContext(ctx, getWorkspaceTasksByMonth, arg.WorkspaceID, arg.Column2, arg.Column3)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []uuid.UUID
	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		items = append(items, id)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}