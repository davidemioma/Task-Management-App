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