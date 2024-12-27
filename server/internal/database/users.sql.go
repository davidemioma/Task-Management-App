// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: users.sql

package database

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
)

const createUser = `-- name: CreateUser :one
INSERT INTO users (id, clerk_id, email, username, image, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, clerk_id, email, username, image, created_at, updated_at
`

type CreateUserParams struct {
	ID        uuid.UUID
	ClerkID   string
	Email     string
	Username  string
	Image     sql.NullString
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (q *Queries) CreateUser(ctx context.Context, arg CreateUserParams) (User, error) {
	row := q.db.QueryRowContext(ctx, createUser,
		arg.ID,
		arg.ClerkID,
		arg.Email,
		arg.Username,
		arg.Image,
		arg.CreatedAt,
		arg.UpdatedAt,
	)
	var i User
	err := row.Scan(
		&i.ID,
		&i.ClerkID,
		&i.Email,
		&i.Username,
		&i.Image,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getUserByClerkId = `-- name: GetUserByClerkId :one
SELECT id, clerk_id, email, username, image, created_at, updated_at FROM users WHERE clerk_id = $1
`

func (q *Queries) GetUserByClerkId(ctx context.Context, clerkID string) (User, error) {
	row := q.db.QueryRowContext(ctx, getUserByClerkId, clerkID)
	var i User
	err := row.Scan(
		&i.ID,
		&i.ClerkID,
		&i.Email,
		&i.Username,
		&i.Image,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}
