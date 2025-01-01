package main

import (
	"database/sql"
	"fmt"
	"net/http"
	"server/internal/database"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (app *application) getWorkspaceProjects(w http.ResponseWriter, r *http.Request, user database.User) {
	// Get the workspace id from the URL params
    workspaceId := chi.URLParam(r, "workspaceId")

    if workspaceId == "" {
		respondWithError(w, http.StatusBadRequest, "Workspace and member ID required")
        
        return
    }

	validWorkspaceId, invalidIdErr := uuid.Parse(workspaceId)

	if invalidIdErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Workspace ID format")
        
        return
	}

	// Check if user is a member of the workspace
	member := app.getMemberHandler(r.Context(), validWorkspaceId, user.ID)

	if (member.ID == uuid.Nil){
		respondWithError(w, http.StatusUnauthorized, "You are not a member of this workspace.")
        
        return
	}

	// Get projects
	projects, err := app.storage.DB.GetProjects(r.Context(), member.WorkspaceID)

	if (err != nil){
		fmt.Printf("Unable to get workspace projects: %v", err)
		
		respondWithError(w, http.StatusNotFound, "Unable to get workspace projects.")
        
        return
	}

	respondWithJSON(w, http.StatusOK, projectsToJson(projects))
}

func (app *application) createWorkspaceProject(w http.ResponseWriter, r *http.Request, user database.User) {
	// Get the workspace id from the URL params
    workspaceId := chi.URLParam(r, "workspaceId")

    if workspaceId == "" {
		respondWithError(w, http.StatusBadRequest, "Workspace and member ID required")
        
        return
    }

	validWorkspaceId, invalidIdErr := uuid.Parse(workspaceId)

	if invalidIdErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Workspace ID format")
        
        return
	}

	// Check if user is a member of the workspace
	member := app.getMemberHandler(r.Context(), validWorkspaceId, user.ID)

	if (member.ID == uuid.Nil){
		respondWithError(w, http.StatusUnauthorized, "You are not a member of this workspace.")
        
        return
	}

	// Parse the multipart form
    err := r.ParseMultipartForm(10 << 20)

    if err != nil {
		fmt.Printf("Unable to parse form: %v", err)

		respondWithError(w, http.StatusBadRequest, "Unable to parse form")
      
        return
    }

	 // Get the name from the form
    name := r.FormValue("name")

    if name == "" {
		fmt.Printf("Name is required")

		respondWithError(w, http.StatusBadRequest, "Name is required")
        
        return
    }

    var imageUrl string

	// Get the file from the form
    file, fileHeader, fileErr := r.FormFile("image")

	if fileErr == nil {
		defer file.Close()

		 // Validate content type
		contentType := fileHeader.Header.Get("Content-Type")

		valid := isValidContentType(contentType)

		if !valid {
			fmt.Printf("Invalid image type")

			respondWithError(w, http.StatusBadRequest, "Invalid image type")

			return
        }

		// Generate a unique key for the S3 object
		uniqueID := uuid.New().String()

		fileExtension := getFileExtension(contentType)

		key := "uploads/" + uniqueID + fileExtension

		// Upload to S3 and create a URL with cloudfront
		s3Err := UploadToS3(app.storage.bucket, key, file)

		if s3Err != nil {
			fmt.Printf("Could not upload to s3: %v", s3Err)

			respondWithError(w, http.StatusInternalServerError, "Could not upload to s3")

			return
		}

		imageUrl = app.storage.cloudfront_url + "/" + key + "#t=1"
	}

	// Create projects
	id := uuid.New()

	type returnType struct {
		ID uuid.UUID `json:"id"`
	}

	dbErr := app.storage.DB.CreateProject(r.Context(), database.CreateProjectParams{
		ID: id,
		WorkspaceID: member.WorkspaceID,
		Name: name,
		ImageUrl: sql.NullString{String: imageUrl, Valid: imageUrl != ""},
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	})

	if (dbErr != nil){
		fmt.Printf("Unable to create project: %v", err)
		
		respondWithError(w, http.StatusInternalServerError, "Unable to create project.")
        
        return
	}

	respondWithJSON(w, http.StatusCreated, returnType{
		ID: id,
	})
}