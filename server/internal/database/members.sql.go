// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: members.sql

package database

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
)

const createMember = `-- name: CreateMember :exec
INSERT INTO members (id, user_id, workspace_id, role, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6)
`

type CreateMemberParams struct {
	ID          uuid.UUID
	UserID      uuid.UUID
	WorkspaceID uuid.UUID
	Role        string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func (q *Queries) CreateMember(ctx context.Context, arg CreateMemberParams) error {
	_, err := q.db.ExecContext(ctx, createMember,
		arg.ID,
		arg.UserID,
		arg.WorkspaceID,
		arg.Role,
		arg.CreatedAt,
		arg.UpdatedAt,
	)
	return err
}

const deleteMember = `-- name: DeleteMember :exec
DELETE FROM members WHERE id = $1 AND workspace_id = $2
`

type DeleteMemberParams struct {
	ID          uuid.UUID
	WorkspaceID uuid.UUID
}

func (q *Queries) DeleteMember(ctx context.Context, arg DeleteMemberParams) error {
	_, err := q.db.ExecContext(ctx, deleteMember, arg.ID, arg.WorkspaceID)
	return err
}

const getMember = `-- name: GetMember :one
SELECT id, user_id, workspace_id, role, created_at, updated_at FROM members WHERE workspace_id = $1 AND user_id = $2
`

type GetMemberParams struct {
	WorkspaceID uuid.UUID
	UserID      uuid.UUID
}

func (q *Queries) GetMember(ctx context.Context, arg GetMemberParams) (Member, error) {
	row := q.db.QueryRowContext(ctx, getMember, arg.WorkspaceID, arg.UserID)
	var i Member
	err := row.Scan(
		&i.ID,
		&i.UserID,
		&i.WorkspaceID,
		&i.Role,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getMemberById = `-- name: GetMemberById :one
SELECT id, user_id, workspace_id, role, created_at, updated_at FROM members WHERE id = $1 AND workspace_id = $2
`

type GetMemberByIdParams struct {
	ID          uuid.UUID
	WorkspaceID uuid.UUID
}

func (q *Queries) GetMemberById(ctx context.Context, arg GetMemberByIdParams) (Member, error) {
	row := q.db.QueryRowContext(ctx, getMemberById, arg.ID, arg.WorkspaceID)
	var i Member
	err := row.Scan(
		&i.ID,
		&i.UserID,
		&i.WorkspaceID,
		&i.Role,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getWorkspaceMembers = `-- name: GetWorkspaceMembers :many
SELECT m.id, m.user_id, m.workspace_id, m.role, m.created_at, m.updated_at, u.username, u.email, u.image
FROM members m
JOIN users u ON m.user_id = u.id
WHERE m.workspace_id = $1
ORDER BY m.created_at ASC
`

type GetWorkspaceMembersRow struct {
	ID          uuid.UUID
	UserID      uuid.UUID
	WorkspaceID uuid.UUID
	Role        string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	Username    string
	Email       string
	Image       sql.NullString
}

func (q *Queries) GetWorkspaceMembers(ctx context.Context, workspaceID uuid.UUID) ([]GetWorkspaceMembersRow, error) {
	rows, err := q.db.QueryContext(ctx, getWorkspaceMembers, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetWorkspaceMembersRow
	for rows.Next() {
		var i GetWorkspaceMembersRow
		if err := rows.Scan(
			&i.ID,
			&i.UserID,
			&i.WorkspaceID,
			&i.Role,
			&i.CreatedAt,
			&i.UpdatedAt,
			&i.Username,
			&i.Email,
			&i.Image,
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

const updateMemberRole = `-- name: UpdateMemberRole :exec
UPDATE members 
SET role = $1, updated_at = NOW()
WHERE id = $2 AND workspace_id = $3 AND role <> $1
`

type UpdateMemberRoleParams struct {
	Role        string
	ID          uuid.UUID
	WorkspaceID uuid.UUID
}

func (q *Queries) UpdateMemberRole(ctx context.Context, arg UpdateMemberRoleParams) error {
	_, err := q.db.ExecContext(ctx, updateMemberRole, arg.Role, arg.ID, arg.WorkspaceID)
	return err
}
