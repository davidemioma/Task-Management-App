package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"server/internal/database"
	"time"

	"github.com/go-chi/chi/v5"
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
	id := uuid.New()

	type returnType struct {
		ID uuid.UUID `json:"id"`
	}

	dbErr := app.storage.DB.CreateWorkspace(r.Context(), database.CreateWorkspaceParams{
		ID: id,
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

	// Create member
	memberErr := app.createMemberHandler(r.Context(), id, user.ID, "ADMIN")

	if memberErr != nil {
		fmt.Printf("Couldn't create member: %v", memberErr)

		respondWithError(w, http.StatusInternalServerError, "Couldn't create member")

		return
	}

	respondWithJSON(w, http.StatusCreated, returnType{
		ID: id,
	})
}

func (app *application) getWorkspacesByUserId(w http.ResponseWriter, r *http.Request, user database.User) {
	workspaces, err := app.storage.DB.GetWorkspaces(r.Context(), user.ID)

	if err != nil {
		fmt.Printf("Couldn't get workspaces: %v", err)

		respondWithError(w, http.StatusNotFound, "Couldn't get workspaces")

		return
	}

	respondWithJSON(w, http.StatusOK, databaseWorkspacesToWorkspaces(workspaces))
}

func (app *application) updateWorkspaceHandler(w http.ResponseWriter, r *http.Request, user database.User) {
	// Get the workspace id from the URL params
    workspace_id := chi.URLParam(r, "workspaceId")

    if workspace_id == "" {
		fmt.Printf("Workspace ID is required")

		respondWithError(w, http.StatusBadRequest, "Workspace ID required")
        
        return
    }

	validId, idErr := uuid.Parse(workspace_id)

	if idErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Workspace ID format")
        
        return
	}

	// Check if workspace exists, user is a member and Admin
	workspace, checkErr := app.storage.DB.GetWorkspaceAdmin(r.Context(), database.GetWorkspaceAdminParams{
		WorkspaceID: validId,
		UserID: user.ID,
	})

	if checkErr != nil {
		fmt.Printf("Couldn't find workspace: %v", checkErr)

		respondWithError(w, http.StatusNotFound, "Couldn't find workspace")

		return
	}

	if workspace.Role != "ADMIN" {
		fmt.Printf("User is not an admin")

		respondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this task!")

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

	// Check if there is an imageUrl or a file from the form
	url := r.FormValue("image")

	file, fileHeader, fileErr := r.FormFile("image")

	if url != "" {
		imageUrl = url
	} else if fileErr == nil {
		defer file.Close()

		// Validate content type
		contentType := fileHeader.Header.Get("Content-Type")

		valid := isValidContentType(contentType)

		if !valid {
			fmt.Printf("Invalid image type")

			respondWithError(w, http.StatusBadRequest, "Invalid image type")

			return
		}

		// Delete previous File from s3
		if workspace.ImageUrl.Valid {
			s3Key := extractKeyFromImageUrl(workspace.ImageUrl.String)

			s3DelErr := DeleteObjectFromS3(app.storage.bucket, s3Key)

			if s3DelErr != nil {
				fmt.Printf("Could not delete object: %v", s3DelErr)

				respondWithError(w, http.StatusInternalServerError, "Could not delete object")

				return
			}
		}

		// Generate a unique key for the S3 object
		uniqueID := uuid.New().String()

		fileExtension := getFileExtension(contentType)

		key := "uploads/" + uniqueID + fileExtension

		// Upload to S3 and get URL
		s3Err := UploadToS3(app.storage.bucket, key, file)

		if s3Err != nil {
			fmt.Printf("Could not generate presigned URL: %v", s3Err)

			respondWithError(w, http.StatusInternalServerError, "Could not generate presigned URL")

			return
		}

		imageUrl = app.storage.cloudfront_url + "/" + key + "#t=1"
	} else {
		imageUrl = ""
	}

	// Update Workspace
	dbErr := app.storage.DB.UpdateWorkspace(r.Context(), database.UpdateWorkspaceParams{
		ID: workspace.ID,
		UserID: user.ID, 
		Name: name,
		ImageUrl: sql.NullString{String: imageUrl, Valid: imageUrl != ""},
	})

	if dbErr != nil {
		fmt.Printf("Couldn't update workspace: %v", dbErr)

		respondWithError(w, http.StatusInternalServerError, "Couldn't update workspace")

		return
	}

	respondWithJSON(w, http.StatusOK, "Workspace Updated!")
}

func (app *application) getWorkspaceById(w http.ResponseWriter, r *http.Request, user database.User) {
	// Get the workspace id from the URL params
    workspaceId := chi.URLParam(r, "workspaceId")

    if workspaceId == "" {
		fmt.Printf("Workspace ID is required")

		respondWithError(w, http.StatusBadRequest, "Workspace ID required")
        
        return
    }

	validId, idErr := uuid.Parse(workspaceId)

	if idErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Workspace ID format")
        
        return
	}

	workspace, err := app.storage.DB.GetWorkspaceById(r.Context(), database.GetWorkspaceByIdParams{
		ID: validId,
		UserID: user.ID,
	})

	if err != nil {
		fmt.Printf("Couldn't get workspace: %v", err)

		respondWithError(w, http.StatusNotFound, "Couldn't get workspace")

		return
	}

	respondWithJSON(w, http.StatusOK, databaseWorkspacetoSafeWorkspace(workspace))
}

func (app *application) deleteWorkspaceHandler(w http.ResponseWriter, r *http.Request, user database.User) {
	// Get the workspace id from the URL params
    workspaceId := chi.URLParam(r, "workspaceId")

    if workspaceId == "" {
		fmt.Printf("Workspace ID is required")

		respondWithError(w, http.StatusBadRequest, "Workspace ID required")
        
        return
    }

	validId, idErr := uuid.Parse(workspaceId)

	if idErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Workspace ID format")
        
        return
	}

	// Check if workspace exists, user is a member and Admin
	workspace, checkErr := app.storage.DB.GetWorkspaceAdmin(r.Context(), database.GetWorkspaceAdminParams{
		WorkspaceID: validId,
		UserID: user.ID,
	})

	if checkErr != nil {
		fmt.Printf("Couldn't find workspace: %v", checkErr)

		respondWithError(w, http.StatusNotFound, "Couldn't find workspace")

		return
	}

	if workspace.Role != "ADMIN" {
		fmt.Printf("User is not an admin")

		respondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this task!")

		return
	}

	// Delete image from S3 bucker
	if workspace.ImageUrl.Valid {
		s3Key := extractKeyFromImageUrl(workspace.ImageUrl.String)

		s3DelErr := DeleteObjectFromS3(app.storage.bucket, s3Key)

		if s3DelErr != nil {
			fmt.Printf("Could not delete object: %v", s3DelErr)

			respondWithError(w, http.StatusInternalServerError, "Could not delete object")

			return
		}
	}

	// Delete Workspace
	dbErr := app.storage.DB.DeleteWorkspace(r.Context(), database.DeleteWorkspaceParams{
		ID: workspace.ID,
		UserID: user.ID,
	})

	if dbErr != nil {
		fmt.Printf("Couldn't delete workspace: %v", dbErr)

		respondWithError(w, http.StatusInternalServerError, "Couldn't delete workspace")

		return
	}

	respondWithJSON(w, http.StatusOK, "Workspace has been deleted!")
}

func (app *application) updateInviteCodeHandler(w http.ResponseWriter, r *http.Request, user database.User) {
	// Get the workspace id from the URL params
    workspaceId := chi.URLParam(r, "workspaceId")

    if workspaceId == "" {
		fmt.Printf("Workspace ID is required")

		respondWithError(w, http.StatusBadRequest, "Workspace ID required")
        
        return
    }

	validId, idErr := uuid.Parse(workspaceId)

	if idErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Workspace ID format")
        
        return
	}

	// Check if workspace exists, user is a member and Admin
	workspace, checkErr := app.storage.DB.GetWorkspaceAdmin(r.Context(), database.GetWorkspaceAdminParams{
		WorkspaceID: validId,
		UserID: user.ID,
	})

	if checkErr != nil {
		fmt.Printf("Couldn't find workspace: %v", checkErr)

		respondWithError(w, http.StatusNotFound, "Couldn't find workspace")

		return
	}

	if workspace.Role != "ADMIN" {
		fmt.Printf("User is not an admin")

		respondWithError(w, http.StatusUnauthorized, "You are not authorized to perform this task!")

		return
	}

	// Update Workspace invite code
	dbErr := app.storage.DB.UpdateWorkspaceInviteCode(r.Context(), database.UpdateWorkspaceInviteCodeParams{
		ID: workspace.ID,
		UserID: user.ID,
	})

	if dbErr != nil {
		fmt.Printf("Couldn't update workspace invite code: %v", dbErr)

		respondWithError(w, http.StatusInternalServerError, "Couldn't update workspace invite code")

		return
	}

	respondWithJSON(w, http.StatusOK, "Updated workspace invite code!")
}

func (app *application) joinWorkspaceHandler(w http.ResponseWriter, r *http.Request, user database.User) {
	// Get the invite code
	type parameters struct {
		Code  string  `json:"code"`
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

	if params.Code == "" {
		respondWithError(w, http.StatusBadRequest, "Invite code is required")

		return
	}

	// Get the workspace id from the URL params
    workspaceId := chi.URLParam(r, "workspaceId")

    if workspaceId == "" {
		fmt.Printf("Workspace ID is required")

		respondWithError(w, http.StatusBadRequest, "Workspace ID required")
        
        return
    }

	validId, idErr := uuid.Parse(workspaceId)

	if idErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Workspace ID format")
        
        return
	}

	// Check if workspace exists
	workspace, checkErr := app.storage.DB.GetSigleWorkspace(r.Context(), validId)

	if checkErr != nil {
		fmt.Printf("Couldn't find workspace: %v", checkErr)

		respondWithError(w, http.StatusNotFound, "Couldn't find workspace")

		return
	}

	// Check if user is a member
	member := app.getMemberHandler(r.Context(), workspace.ID, user.ID)

	if member.ID != uuid.Nil {
		respondWithJSON(w, http.StatusOK, "Already a member")
        
        return
	}

	// Check if workspace code equals code
	if workspace.InviteCode != params.Code {
		respondWithError(w, http.StatusUnauthorized, "Invite code is not valid")

		return
	}

	// Create a new member
	memberErr := app.createMemberHandler(r.Context(), workspace.ID, user.ID, "MEMBER")

	if memberErr != nil {
		fmt.Printf("Couldn't create member: %v", memberErr)

		respondWithError(w, http.StatusInternalServerError, "Couldn't create member")

		return
	}

	respondWithJSON(w, http.StatusOK, "Your invite was accepted!")
}

func (app *application) getSigleWorkspace(w http.ResponseWriter, r *http.Request, user database.User) {
	// Get the workspace id from the URL params
    workspaceId := chi.URLParam(r, "workspaceId")

    if workspaceId == "" {
		fmt.Printf("Workspace ID is required")

		respondWithError(w, http.StatusBadRequest, "Workspace ID required")
        
        return
    }

	validId, idErr := uuid.Parse(workspaceId)

	if idErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Workspace ID format")
        
        return
	}

	workspace, err := app.storage.DB.GetSigleWorkspace(r.Context(), validId)

	if err != nil {
		fmt.Printf("Couldn't get workspace: %v", err)

		respondWithError(w, http.StatusNotFound, "Couldn't get workspace")

		return
	}

	respondWithJSON(w, http.StatusOK, databaseWorkspacetoSingleWorkspace(workspace))
}


