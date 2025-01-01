package main

import (
	"database/sql"
	"net/http"
	"server/internal/database"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (app *application) getProjectById(w http.ResponseWriter, r *http.Request, user database.User) {
	// Get the workspace and project Id from the URL params
    workspaceId := chi.URLParam(r, "workspaceId")

	projectId := chi.URLParam(r, "projectId")

    if workspaceId == "" || projectId == "" {
		respondWithError(w, http.StatusBadRequest, "Workspace and project ID required")
        
        return
    }

	validWorkspaceId, invalidIdErr := uuid.Parse(workspaceId)

	if invalidIdErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Workspace ID format")
        
        return
	}

	validProjectId, invalidProjIdErr := uuid.Parse(projectId)

	if invalidProjIdErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Project ID format")
        
        return
	}

	// Check if user is a member of the workspace
	member := app.getMemberHandler(r.Context(), validWorkspaceId, user.ID)

	if (member.ID == uuid.Nil){
		respondWithError(w, http.StatusUnauthorized, "You are not a member of this workspace.")
        
        return
	}

	// Get project
	project, err := app.storage.DB.GetProjectById(r.Context(), database.GetProjectByIdParams{
		WorkspaceID: member.WorkspaceID,
		ID: validProjectId,
	})

	if (err != nil){
		app.logger.Printf("Unable to get workspace project: %v", err)
		
		respondWithError(w, http.StatusNotFound, "Unable to get workspace project.")
        
        return
	}

	respondWithJSON(w, http.StatusOK, projectToJson(project))
}

func (app *application) getWorkspaceProjects(w http.ResponseWriter, r *http.Request, user database.User) {
	// Get the workspace id from the URL params
    workspaceId := chi.URLParam(r, "workspaceId")

    if workspaceId == "" {
		respondWithError(w, http.StatusBadRequest, "Workspace ID required")
        
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
		app.logger.Printf("Unable to get workspace projects: %v", err)
		
		respondWithError(w, http.StatusNotFound, "Unable to get workspace projects.")
        
        return
	}

	respondWithJSON(w, http.StatusOK, projectsToJson(projects))
}

func (app *application) createWorkspaceProject(w http.ResponseWriter, r *http.Request, user database.User) {
	// Get the workspace id from the URL params
    workspaceId := chi.URLParam(r, "workspaceId")

    if workspaceId == "" {
		respondWithError(w, http.StatusBadRequest, "Workspace ID required")
        
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
		app.logger.Printf("Unable to parse form: %v", err)

		respondWithError(w, http.StatusBadRequest, "Unable to parse form")
      
        return
    }

	 // Get the name from the form
    name := r.FormValue("name")

    if name == "" {
		app.logger.Printf("Name is required")

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
			app.logger.Printf("Invalid image type")

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
			app.logger.Printf("Could not upload to s3: %v", s3Err)

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
		app.logger.Printf("Unable to create project: %v", err)
		
		respondWithError(w, http.StatusInternalServerError, "Unable to create project.")
        
        return
	}

	respondWithJSON(w, http.StatusCreated, returnType{
		ID: id,
	})
}

func (app *application) updateProjectHandler(w http.ResponseWriter, r *http.Request, user database.User) {
	// Get the workspace and project id from the URL params
    workspaceId := chi.URLParam(r, "workspaceId")

	projectId := chi.URLParam(r, "projectId")

    if workspaceId == "" || projectId == "" {
		respondWithError(w, http.StatusBadRequest, "Workspace and project ID required")
        
        return
    }

	validWorkspaceId, invalidIdErr := uuid.Parse(workspaceId)

	if invalidIdErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Workspace ID format")
        
        return
	}

	validProjectId, invalidProjIdErr := uuid.Parse(projectId)

	if invalidProjIdErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Project ID format")
        
        return
	}

	// Check if user is a member of the workspace
	member := app.getMemberHandler(r.Context(), validWorkspaceId, user.ID)

	if (member.ID == uuid.Nil){
		respondWithError(w, http.StatusUnauthorized, "You are not a member of this workspace.")
        
        return
	}

	// Check if project exists
	project, projectErr := app.storage.DB.GetProjectById(r.Context(), database.GetProjectByIdParams{
		ID: validProjectId,
		WorkspaceID: member.WorkspaceID,
	})

	if (projectErr != nil){
		app.logger.Printf("Project not found: %v", projectErr)

		respondWithError(w, http.StatusNotFound, "Project not found!")
        
        return
	}
	
	// Parse the multipart form
    err := r.ParseMultipartForm(10 << 20)

    if err != nil {
		app.logger.Printf("Unable to parse form: %v", err)

		respondWithError(w, http.StatusBadRequest, "Unable to parse form")
      
        return
    }

	// Get the name from the form
    name := r.FormValue("name")

    if name == "" {
		app.logger.Printf("Name is required")

		respondWithError(w, http.StatusBadRequest, "Name is required")
        
        return
    }

    var imageUrl string

	// Check if there is an imageUrl or a file from the form
	url := r.FormValue("image")

	file, fileHeader, fileErr := r.FormFile("image")

	app.logger.Printf("url: %s, file: %v", url, file)

	if url != "" {
		imageUrl = url
	} else if url == "" && fileErr == nil {
		defer file.Close()

		// Validate content type
		contentType := fileHeader.Header.Get("Content-Type")

		valid := isValidContentType(contentType)

		if !valid {
			app.logger.Printf("Invalid image type")

			respondWithError(w, http.StatusBadRequest, "Invalid image type")

			return
		}

		// Delete previous File from s3
		if project.ImageUrl.Valid {
			s3Key := extractKeyFromImageUrl(project.ImageUrl.String)

			s3DelErr := DeleteObjectFromS3(app.storage.bucket, s3Key)

			if s3DelErr != nil {
				app.logger.Printf("Could not delete object: %v", s3DelErr)

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
			app.logger.Printf("Could not upload to s3: %v", s3Err)

			respondWithError(w, http.StatusInternalServerError, "Could not upload to s3")

			return
		}

		imageUrl = app.storage.cloudfront_url + "/" + key + "#t=1"
	} else  {
		// Delete previous File from s3
		if project.ImageUrl.Valid {
			s3Key := extractKeyFromImageUrl(project.ImageUrl.String)

			s3DelErr := DeleteObjectFromS3(app.storage.bucket, s3Key)

			if s3DelErr != nil {
				app.logger.Printf("Could not delete object: %v", s3DelErr)

				respondWithError(w, http.StatusInternalServerError, "Could not delete object")

				return
			}
		} 

		imageUrl = ""
		
	}

	// Update Workspace
	dbErr := app.storage.DB.UpdateProject(r.Context(), database.UpdateProjectParams{
		ID: project.ID,
		WorkspaceID: member.WorkspaceID, 
		Name: name,
		ImageUrl: sql.NullString{String: imageUrl, Valid: imageUrl != ""},
	})

	if dbErr != nil {
		app.logger.Printf("Couldn't update project: %v", dbErr)

		respondWithError(w, http.StatusInternalServerError, "Couldn't update project")

		return
	}

	respondWithJSON(w, http.StatusOK, "Project Updated!")
}

func (app *application) deleteProjectHandler(w http.ResponseWriter, r *http.Request, user database.User) {
	// Get the workspace and project Id from the URL params
    workspaceId := chi.URLParam(r, "workspaceId")

	projectId := chi.URLParam(r, "projectId")

    if workspaceId == "" || projectId == "" {
		respondWithError(w, http.StatusBadRequest, "Workspace and project ID required")
        
        return
    }

	validWorkspaceId, invalidIdErr := uuid.Parse(workspaceId)

	if invalidIdErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Workspace ID format")
        
        return
	}

	validProjectId, invalidProjIdErr := uuid.Parse(projectId)

	if invalidProjIdErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Project ID format")
        
        return
	}

	// Check if user is a member of the workspace
	member := app.getMemberHandler(r.Context(), validWorkspaceId, user.ID)

	if (member.ID == uuid.Nil){
		respondWithError(w, http.StatusUnauthorized, "You are not a member of this workspace.")
        
        return
	}

	// Delete project
	err := app.storage.DB.DeleteProject(r.Context(), database.DeleteProjectParams{
		ID: validProjectId,
		WorkspaceID: member.WorkspaceID,
	})

	if (err != nil){
		app.logger.Printf("Unable to delete workspace project: %v", err)
		
		respondWithError(w, http.StatusInternalServerError, "Unable to delete workspace project.")
        
        return
	}

	respondWithJSON(w, http.StatusOK, "Project Deleted!")
}