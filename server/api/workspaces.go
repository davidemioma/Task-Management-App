package main

import (
	"database/sql"
	"fmt"
	"net/http"
	"server/internal/database"
	"time"

	"github.com/google/uuid"
)

func (app *application) createWorkspaceHandler(w http.ResponseWriter, r *http.Request, user database.User) {
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

		// Generate a pre-signed URL for S3 upload
		s3Err := UploadToS3(app.storage.bucket, key, file)

		if s3Err != nil {
			fmt.Printf("Could not generate presigned URL: %v", s3Err)

			respondWithError(w, http.StatusInternalServerError, "Could not generate presigned URL")

			return
		}

		imageUrl = app.storage.cloudfront_url + "/" + key + "#t=1"
    }

	// Create Workspace
	dbErr := app.storage.DB.CreateWorkspace(r.Context(), database.CreateWorkspaceParams{
		ID: uuid.New(),
		UserID: user.ID, 
		Name: name,
		ImageUrl: sql.NullString{String: imageUrl, Valid: imageUrl != ""},
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