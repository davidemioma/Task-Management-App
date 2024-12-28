package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"server/internal/database"
	"time"

	"github.com/google/uuid"
)

func (app *application) createWorkspaceHandler(w http.ResponseWriter, r *http.Request, user database.User) {
	type parameters struct {
		Name string `json:"name"`
	}

	// Validating body
	decoder := json.NewDecoder(r.Body)

	params := parameters{}

	err := decoder.Decode(&params)

	if err != nil {
		fmt.Printf("Error parsing JSON: %v", err)
		
		respondWithError(w, http.StatusBadRequest, "Error parsing JSON")

		return
	}

	if params.Name == "" {
		respondWithError(w, http.StatusBadRequest, "Name is required")

		return
	}

	// Create Workspace
	dbErr := app.storage.DB.CreateWorkspace(r.Context(), database.CreateWorkspaceParams{
		ID: uuid.New(),
		UserID: user.ID, 
		Name: params.Name,
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	})

	if dbErr != nil {
		fmt.Printf("Couldn't create workspace: %v", dbErr)

		respondWithError(w, http.StatusInternalServerError, "Couldn't create workspace")

		return
	}

	respondWithJSON(w, http.StatusCreated, "New workspace created")
}