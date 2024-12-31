// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: workspaces.sql

package database

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
)

const createWorkspace = `-- name: CreateWorkspace :exec
INSERT INTO workspaces (id, user_id, name, image_url, created_at, updated_at, invite_code)
VALUES ($1, $2, $3, $4, $5, $6, encode(sha256(random()::text::bytea), 'hex'))
`

type CreateWorkspaceParams struct {
	ID        uuid.UUID
	UserID    uuid.UUID
	Name      string
	ImageUrl  sql.NullString
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (q *Queries) CreateWorkspace(ctx context.Context, arg CreateWorkspaceParams) error {
	_, err := q.db.ExecContext(ctx, createWorkspace,
		arg.ID,
		arg.UserID,
		arg.Name,
		arg.ImageUrl,
		arg.CreatedAt,
		arg.UpdatedAt,
	)
	return err
}

const deleteWorkspace = `-- name: DeleteWorkspace :exec
DELETE FROM workspaces
WHERE workspaces.id = $1 AND (workspaces.user_id = $2 OR EXISTS (
    SELECT 1 FROM members m 
    WHERE m.workspace_id = workspaces.id AND m.user_id = $2 AND m.role = 'ADMIN'
))
`

type DeleteWorkspaceParams struct {
	ID     uuid.UUID
	UserID uuid.UUID
}

func (q *Queries) DeleteWorkspace(ctx context.Context, arg DeleteWorkspaceParams) error {
	_, err := q.db.ExecContext(ctx, deleteWorkspace, arg.ID, arg.UserID)
	return err
}

const getSigleWorkspace = `-- name: GetSigleWorkspace :one
SELECT id, name, invite_code FROM workspaces WHERE id = $1
`

type GetSigleWorkspaceRow struct {
	ID         uuid.UUID
	Name       string
	InviteCode string
}

func (q *Queries) GetSigleWorkspace(ctx context.Context, id uuid.UUID) (GetSigleWorkspaceRow, error) {
	row := q.db.QueryRowContext(ctx, getSigleWorkspace, id)
	var i GetSigleWorkspaceRow
	err := row.Scan(&i.ID, &i.Name, &i.InviteCode)
	return i, err
}

const getWorkspaceAdmin = `-- name: GetWorkspaceAdmin :one
SELECT w.id, w.user_id, w.name, w.created_at, w.updated_at, w.image_url, w.invite_code, m.role
FROM members m
JOIN workspaces w ON m.workspace_id = w.id
WHERE m.user_id = $1 AND m.workspace_id = $2
`

type GetWorkspaceAdminParams struct {
	UserID      uuid.UUID
	WorkspaceID uuid.UUID
}

type GetWorkspaceAdminRow struct {
	ID         uuid.UUID
	UserID     uuid.UUID
	Name       string
	CreatedAt  time.Time
	UpdatedAt  time.Time
	ImageUrl   sql.NullString
	InviteCode string
	Role       string
}

func (q *Queries) GetWorkspaceAdmin(ctx context.Context, arg GetWorkspaceAdminParams) (GetWorkspaceAdminRow, error) {
	row := q.db.QueryRowContext(ctx, getWorkspaceAdmin, arg.UserID, arg.WorkspaceID)
	var i GetWorkspaceAdminRow
	err := row.Scan(
		&i.ID,
		&i.UserID,
		&i.Name,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.ImageUrl,
		&i.InviteCode,
		&i.Role,
	)
	return i, err
}

const getWorkspaceById = `-- name: GetWorkspaceById :one
SELECT w.id, w.user_id, name, w.created_at, w.updated_at, image_url, invite_code, m.id, m.user_id, workspace_id, role, m.created_at, m.updated_at FROM workspaces w
LEFT JOIN members m ON w.id = m.workspace_id
WHERE w.id = $1 AND (w.user_id = $2 OR m.user_id = $2)
`

type GetWorkspaceByIdParams struct {
	ID     uuid.UUID
	UserID uuid.UUID
}

type GetWorkspaceByIdRow struct {
	ID          uuid.UUID
	UserID      uuid.UUID
	Name        string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	ImageUrl    sql.NullString
	InviteCode  string
	ID_2        uuid.NullUUID
	UserID_2    uuid.NullUUID
	WorkspaceID uuid.NullUUID
	Role        sql.NullString
	CreatedAt_2 sql.NullTime
	UpdatedAt_2 sql.NullTime
}

func (q *Queries) GetWorkspaceById(ctx context.Context, arg GetWorkspaceByIdParams) (GetWorkspaceByIdRow, error) {
	row := q.db.QueryRowContext(ctx, getWorkspaceById, arg.ID, arg.UserID)
	var i GetWorkspaceByIdRow
	err := row.Scan(
		&i.ID,
		&i.UserID,
		&i.Name,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.ImageUrl,
		&i.InviteCode,
		&i.ID_2,
		&i.UserID_2,
		&i.WorkspaceID,
		&i.Role,
		&i.CreatedAt_2,
		&i.UpdatedAt_2,
	)
	return i, err
}

const getWorkspaces = `-- name: GetWorkspaces :many
SELECT w.id, w.user_id, w.name, w.created_at, w.updated_at, w.image_url, w.invite_code 
FROM workspaces w
LEFT JOIN members m ON w.id = m.workspace_id
WHERE w.user_id = $1 OR m.user_id = $1
ORDER BY w.created_at DESC
`

func (q *Queries) GetWorkspaces(ctx context.Context, userID uuid.UUID) ([]Workspace, error) {
	rows, err := q.db.QueryContext(ctx, getWorkspaces, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Workspace
	for rows.Next() {
		var i Workspace
		if err := rows.Scan(
			&i.ID,
			&i.UserID,
			&i.Name,
			&i.CreatedAt,
			&i.UpdatedAt,
			&i.ImageUrl,
			&i.InviteCode,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const updateWorkspace = `-- name: UpdateWorkspace :exec
UPDATE workspaces
SET 
    name = $1,
    image_url = $2,
    updated_at = NOW()
WHERE workspaces.id = $3 AND (workspaces.user_id = $4 OR EXISTS (
    SELECT 1 FROM members m 
    WHERE m.workspace_id = workspaces.id AND m.user_id = $4 AND m.role = 'ADMIN'
))
`

type UpdateWorkspaceParams struct {
	Name     string
	ImageUrl sql.NullString
	ID       uuid.UUID
	UserID   uuid.UUID
}

func (q *Queries) UpdateWorkspace(ctx context.Context, arg UpdateWorkspaceParams) error {
	_, err := q.db.ExecContext(ctx, updateWorkspace,
		arg.Name,
		arg.ImageUrl,
		arg.ID,
		arg.UserID,
	)
	return err
}

const updateWorkspaceInviteCode = `-- name: UpdateWorkspaceInviteCode :exec
UPDATE workspaces
SET 
    invite_code = encode(sha256(random()::text::bytea), 'hex'),
    updated_at = NOW()
WHERE workspaces.id = $1 AND (workspaces.user_id = $2 OR EXISTS (
    SELECT 1 FROM members m 
    WHERE m.workspace_id = workspaces.id AND m.user_id = $2 AND m.role = 'ADMIN'
))
`

type UpdateWorkspaceInviteCodeParams struct {
	ID     uuid.UUID
	UserID uuid.UUID
}

func (q *Queries) UpdateWorkspaceInviteCode(ctx context.Context, arg UpdateWorkspaceInviteCodeParams) error {
	_, err := q.db.ExecContext(ctx, updateWorkspaceInviteCode, arg.ID, arg.UserID)
	return err
}
