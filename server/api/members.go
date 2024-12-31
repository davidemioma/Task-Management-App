package main

import (
	"context"
	"server/internal/database"
	"time"

	"github.com/google/uuid"
)

func (app *application) createMemberHandler(ctx context.Context, workspace_id uuid.UUID, user_id uuid.UUID, role string) (error) {
	err := app.storage.DB.CreateMember(ctx, database.CreateMemberParams{
		ID: uuid.New(),
		UserID: user_id,
		WorkspaceID: workspace_id,
		Role: role,
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	})

	if err != nil {
		return err
	}

	return nil
}

func (app *application) getMemberHandler(ctx context.Context, workspace_id uuid.UUID, user_id uuid.UUID) (database.Member) {
	member, err := app.storage.DB.GetMember(ctx, database.GetMemberParams{
		UserID: user_id,
		WorkspaceID: workspace_id,
	})

	if err != nil {
		return database.Member{}
	}

	return member
}