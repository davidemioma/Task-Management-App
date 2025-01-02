package main

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"server/internal/database"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (app *application) createTaskHandler(w http.ResponseWriter, r *http.Request, user database.User) {
	// Get the workspace from the URL params
    workspaceId := chi.URLParam(r, "workspaceId")

    if workspaceId == "" {
		respondWithError(w, http.StatusBadRequest, "Workspace ID is required")
        
        return
    }

	validWorkspaceId, invalidIdErr := uuid.Parse(workspaceId)

	if invalidIdErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Workspace ID format")
        
        return
	}
	
	type parameters struct {
		AssigneeId  string  `json:"assigneeId"`
		ProjectId   string  `json:"projectId"`
		Name        string  `json:"name"`
		Description string  `json:"description"`
		Status      string  `json:"status"`
		DueDate     string  `json:"dueDate"`
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

	if params.ProjectId == "" || params.AssigneeId == "" || params.Name == "" || params.Status == "" || params.DueDate == "" {
		respondWithError(w, http.StatusBadRequest, "Invalid Parameters")

		app.logger.Printf("Invalid Parameters")

		return
	}

	validProjectId, invalidProjIdErr := uuid.Parse(params.ProjectId)

	if invalidProjIdErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Project ID format")
        
        return
	}

	validAssigneeId, invalidAssIdErr := uuid.Parse(params.AssigneeId)

	if invalidAssIdErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Assignee ID format")
        
        return
	}

	// Check if current user is a member and an admin
	member := app.getMemberHandler(r.Context(), validWorkspaceId, user.ID)

	if (member.ID == uuid.Nil){
		respondWithError(w, http.StatusUnauthorized, "You are not a member of this workspace.")

		app.logger.Printf("Create Task Error: You are not a member of this workspace.")
        
        return
	}

	// Get highest task position
	highestPosition, _ := app.storage.DB.GetTaskWithHighestPosition(r.Context(), database.GetTaskWithHighestPositionParams{
		WorkspaceID: member.WorkspaceID,
		ProjectID: validProjectId,
	})

	// Create task
	var position int

	if highestPosition > 0 {
		position = int(highestPosition) + 1
	} else {
		position = 1
	}

	due_date, dateErr := parseDueDate(params.DueDate)

	if(dateErr != nil){
		respondWithError(w, http.StatusBadRequest, "Invalid due date.")

		app.logger.Printf("Invalid due date: %v", dateErr)
        
        return
	}

	dbErr := app.storage.DB.CreateTask(r.Context(), database.CreateTaskParams{
		ID: uuid.New(),
		WorkspaceID: member.WorkspaceID,
		ProjectID: validProjectId,
		AssigneeID: validAssigneeId,
		Name: params.Name,
		Description: sql.NullString{String: params.Description, Valid: params.Description != ""},
		Status: params.Status,
		DueDate: due_date,
		Position: int32(position),
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	})

	if dbErr != nil {
		app.logger.Printf("Couldn't create task: %v", dbErr)

		respondWithError(w, http.StatusInternalServerError, "Couldn't create task")

		return
	}

	respondWithJSON(w, http.StatusCreated, "New task created")
}

func (app *application) getTasksHandler(w http.ResponseWriter, r *http.Request, user database.User) {
	// Get the workspace and project Id from the URL params
    workspaceId := chi.URLParam(r, "workspaceId")

    if workspaceId == "" {
		respondWithError(w, http.StatusBadRequest, "Workspace and project ID required")
        
        return
    }

	validWorkspaceId, invalidIdErr := uuid.Parse(workspaceId)

	if invalidIdErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Workspace ID format")
        
        return
	}
	
	// Check if current user is a member and an admin
	member := app.getMemberHandler(r.Context(), validWorkspaceId, user.ID)

	if (member.ID == uuid.Nil){
		respondWithError(w, http.StatusUnauthorized, "You are not a member of this workspace.")

		app.logger.Printf("Create Task Error: You are not a member of this workspace.")
        
        return
	}

	// Retrieve query parameters
    projectId, _ := uuid.Parse(r.URL.Query().Get("projectId"))
    status := r.URL.Query().Get("status") 
    dueDate, _ := parseDueDate(r.URL.Query().Get("due_date"))
    assigneeId, _ := uuid.Parse(r.URL.Query().Get("assignee_id"))
    search := r.URL.Query().Get("search") 

	// Get tasks
	tasks, dbErr := app.storage.DB.GetTasksByFilters(r.Context(), database.GetTasksByFiltersParams{
		Column1: projectId,
		Column2: status,
		Column3: dueDate,
		Column4: assigneeId,
		Column5: sql.NullString{String: search, Valid: search != ""},
	})

    if dbErr != nil {
 		respondWithError(w, http.StatusInternalServerError, "Unable to get tasks.")

		app.logger.Printf("Unable to get tasks: %v", dbErr)

        return
    }

	var allTasks []JsonTask

	for _, task := range tasks{
		user, usrErr := app.storage.DB.GetUserById(r.Context(), task.AssigneeID)

		if usrErr != nil {
			respondWithError(w, http.StatusNotFound, "Unable to get user.")

			app.logger.Printf("Unable to get user: %v", usrErr)

			return
        }

		project, projErr := app.storage.DB.GetTaskProject(r.Context(), database.GetTaskProjectParams{
			ID: task.ProjectID,
			WorkspaceID: task.WorkspaceID,
		})

		if projErr != nil {
			respondWithError(w, http.StatusNotFound, "Unable to get project.")

			app.logger.Printf("Unable to get project: %v", projErr)

			return
        }

		allTasks = append(allTasks, JsonTask{
			ID: task.ID,
			WorkspaceID: task.WorkspaceID,
			ProjectID: task.ProjectID,
			AssigneeID: task.AssigneeID,
			Name: task.Name,
			Description: task.Description.String,
			Position: task.Position,
			DueDate: task.DueDate,
			Status: task.Status,
			CreatedAt: task.CreatedAt,
			UpdatedAt: task.UpdatedAt,
			User: TaskUser{
				Username: user.Username,
				Image: user.Image.String,
			},
			Project: TaskProject{
				Name: project.Name,
				ImageUrl: project.ImageUrl.String,
			},
		})
	}

	respondWithJSON(w, http.StatusOK, allTasks)
}

func (app *application) getTaskOptions(w http.ResponseWriter, r *http.Request, user database.User) {
	// Get the workspace and project Id from the URL params
    workspaceId := chi.URLParam(r, "workspaceId")

    if workspaceId == "" {
		respondWithError(w, http.StatusBadRequest, "Workspace and project ID required")
        
        return
    }

	validWorkspaceId, invalidIdErr := uuid.Parse(workspaceId)

	if invalidIdErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Workspace ID format")
        
        return
	}
	
	// Check if current user is a member and an admin
	member := app.getMemberHandler(r.Context(), validWorkspaceId, user.ID)

	if (member.ID == uuid.Nil){
		respondWithError(w, http.StatusUnauthorized, "You are not a member of this workspace.")

		app.logger.Printf("Create Task Error: You are not a member of this workspace.")
        
        return
	}

	// Get Projects
	projects, dbProjErr := app.storage.DB.GetTaskProjects(r.Context(), member.WorkspaceID)

    if dbProjErr != nil {
 		respondWithError(w, http.StatusInternalServerError, "Unable to get projects.")

		app.logger.Printf("Unable to get projects: %v", dbProjErr)

        return
    }

	// Get members
	members, dbErr := app.storage.DB.GetTaskMembers(r.Context(), member.WorkspaceID)

    if dbErr != nil {
 		respondWithError(w, http.StatusInternalServerError, "Unable to get members.")

		app.logger.Printf("Unable to get members: %v", dbErr)

        return
    }

	respondWithJSON(w, http.StatusOK, JsonOptions{
		Projects: projectsToJsonProjects(projects),
		Members: membersToJsonMembers(members),
	})
}