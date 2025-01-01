package main

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/internal/database"
	"time"

	"github.com/google/uuid"
)

func (app *application) createUserHandler(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		ClerkID  string  `json:"clerk_id"`
		Username string  `json:"username"`
		Email    string  `json:"email"`
		Image    string  `json:"image"`
	}

	// Validating body
	decoder := json.NewDecoder(r.Body)

	params := parameters{}

	err := decoder.Decode(&params)

	if err != nil {
		app.logger.Printf("Error parsing JSON: %v", err)
		
		respondWithError(w, http.StatusBadRequest, "Error parsing JSON")

		return
	}

	if params.ClerkID == "" || params.Username == "" || params.Email == "" {
		respondWithError(w, http.StatusBadRequest, "ClerkID, Username, and Email are required")

		return
	}

	// Check if user already exists
	existingUser, existsErr := app.storage.DB.GetUserByClerkId(r.Context(), params.ClerkID) 

	if existsErr == nil && existingUser != (database.User{}) {
		respondWithJSON(w, http.StatusOK, "User already exists with this email")
		
		return
	}

	// Create user
	_, dbErr := app.storage.DB.CreateUser(r.Context(), database.CreateUserParams{
		ID: uuid.New(),
		ClerkID: params.ClerkID, 
		Username: params.Username,
		Email: params.Email,
		Image: sql.NullString{String: params.Image, Valid: params.Image != ""},
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	})

	if dbErr != nil {
		app.logger.Printf("Couldn't create user: %v", dbErr)

		respondWithError(w, http.StatusInternalServerError, "Couldn't create user")

		return
	}

	respondWithJSON(w, http.StatusOK, "New user created")
}

func (app *application) getUserByClerkId(w http.ResponseWriter, r *http.Request, user database.User) {
	respondWithJSON(w, http.StatusOK, databaseUsertoUser(user))
}