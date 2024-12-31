package main

import (
	"server/internal/database"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID      `json:"id"`
	ClerkID   string         `json:"clerkId"`
	Email     string         `json:"email"`
	Username  string         `json:"username"`
	Image     string         `json:"image"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
}

func databaseUsertoUser(user database.User) User {
	var image string

	if user.Image.Valid {
		image = user.Image.String
	}

	return User{
		ID: user.ID,
		ClerkID: user.ClerkID,
		Email: user.Email,
		Username: user.Username,
		Image: image,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}
}

type Workspace struct {
	ID        uuid.UUID  `json:"id"`
	UserID    uuid.UUID  `json:"userId"`
	Name      string     `json:"name"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
	ImageUrl  string     `json:"imageUrl"`
	InviteCode string    `json:"inviteCode"`
}

type SigleWorkspace struct {
	ID        uuid.UUID  `json:"id"`
	Name      string     `json:"name"`
}

func databaseWorkspacetoWorkspace(workspace database.Workspace) Workspace {
	var imageUrl string

	if workspace.ImageUrl.Valid {
		imageUrl = workspace.ImageUrl.String
	}

	return Workspace{
		ID: workspace.ID,
		UserID: workspace.UserID,
		Name: workspace.Name,
		ImageUrl: imageUrl,
		InviteCode: workspace.InviteCode,
		CreatedAt: workspace.CreatedAt,
		UpdatedAt: workspace.UpdatedAt,
	}
}

func databaseWorkspacetoSafeWorkspace(workspace database.GetWorkspaceByIdRow) Workspace {
	var imageUrl string

	if workspace.ImageUrl.Valid {
		imageUrl = workspace.ImageUrl.String
	}

	return Workspace{
		ID: workspace.ID,
		UserID: workspace.UserID,
		Name: workspace.Name,
		ImageUrl: imageUrl,
		InviteCode: workspace.InviteCode,
		CreatedAt: workspace.CreatedAt,
		UpdatedAt: workspace.UpdatedAt,
	}
}

func databaseWorkspacetoSingleWorkspace(workspace database.GetSigleWorkspaceRow) SigleWorkspace {
	return SigleWorkspace{
		ID: workspace.ID,
		Name: workspace.Name,
	}
}

func databaseWorkspacesToWorkspaces(workspaces []database.Workspace) [] Workspace{
	var newWorkspaces [] Workspace

	for _, workspace := range workspaces{
		newWorkspaces = append(newWorkspaces, databaseWorkspacetoWorkspace(workspace))
	}

	return newWorkspaces
}