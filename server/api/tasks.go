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

	// Check if task for a stutus is less than 30
	tasksCount, tasksCountErr := app.storage.DB.GetNumberOfTasks(r.Context(), database.GetNumberOfTasksParams{
		Status: sql.NullString{String: params.Status, Valid: params.Status != ""},
		ProjectID: validProjectId,
		WorkspaceID: member.WorkspaceID,
	})

	if tasksCountErr == nil && tasksCount == 30 {
		respondWithError(w, http.StatusNotAcceptable, "Max tasks created")

		app.logger.Printf("Max tasks created!")
        
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
		position = 0
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
		AssigneeID: uuid.NullUUID{UUID: validAssigneeId, Valid: validAssigneeId != uuid.UUID{}},
		Name: params.Name,
		Description: sql.NullString{String: params.Description, Valid: params.Description != ""},
		Status: sql.NullString{String: params.Status, Valid: params.Status != ""},
		DueDate: sql.NullTime{Time: due_date, Valid: due_date != time.Time{}},
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
	
	// Check if current user is a member and an admin
	member := app.getMemberHandler(r.Context(), validWorkspaceId, user.ID)

	if (member.ID == uuid.Nil){
		respondWithError(w, http.StatusUnauthorized, "You are not a member of this workspace.")

		app.logger.Printf("Create Task Error: You are not a member of this workspace.")
        
        return
	}

	// Retrieve query parameters
    statusStr := r.URL.Query().Get("status") 
    dueDateStr := r.URL.Query().Get("dueDate")
    assigneeIdStr := r.URL.Query().Get("assigneeId")

	app.logger.Printf("status=%v, dueDate=%v, assignedId=%v", statusStr, dueDateStr, assigneeIdStr)

	// Get tasks
	var tasks []database.Task

	hasFilters := statusStr != "" || dueDateStr != "" || assigneeIdStr != ""

	if hasFilters {
		var assignedId uuid.UUID

		var status sql.NullString

	    var dueDate time.Time

		if (assigneeIdStr != ""){
			id, err := uuid.Parse(assigneeIdStr)

			if err == nil {
			    assignedId = id
		    }
		}

		if (statusStr != ""){
			status = sql.NullString{String: statusStr, Valid: true}
		}

		if dueDateStr != "" {
			parsedDate, err := parseDueDate(dueDateStr) 

			if err == nil {
				dueDate = parsedDate
			}
	    }

		dbFilteredTasks, dbFilteredErr := app.storage.DB.GetFilteredTasks(r.Context(), database.GetFilteredTasksParams{
			WorkspaceID: member.WorkspaceID,
			ProjectID: validProjectId,
			Column3: assignedId,
			Column4: status,
			Column5: dueDate,
		})

		if dbFilteredErr != nil {
			respondWithError(w, http.StatusInternalServerError, "Unable to get tasks.")

			app.logger.Printf("Unable to get tasks: %v", dbFilteredErr)

			return
		}

		tasks = dbFilteredTasks
	} else {
		dbTasks, dbErr := app.storage.DB.GetAllTasksByProjId(r.Context(), database.GetAllTasksByProjIdParams{
			WorkspaceID: member.WorkspaceID,
			ProjectID: validProjectId,
		})

		if dbErr != nil {
			respondWithError(w, http.StatusInternalServerError, "Unable to get tasks.")

			app.logger.Printf("Unable to get tasks: %v", dbErr)

			return
		}

		tasks = dbTasks
	}

	if (len(tasks) == 0){
		app.logger.Printf("No tasks available")

		respondWithJSON(w, http.StatusOK, nil)
	}

	var allTasks []JsonTask

	for _, task := range tasks{
			assignee, usrErr := app.storage.DB.GetUserById(r.Context(), task.AssigneeID.UUID)

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
				AssigneeID: task.AssigneeID.UUID,
				Name: task.Name,
				Description: task.Description.String,
				Position: task.Position,
				DueDate: task.DueDate.Time,
				Status: task.Status.String,
				CreatedAt: task.CreatedAt,
				UpdatedAt: task.UpdatedAt,
				User: TaskUser{
					Username: assignee.Username,
					Image: assignee.Image.String,
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

func (app *application) deleteTasksHandler(w http.ResponseWriter, r *http.Request, user database.User) {
	// Get the workspace, project and task Id from the URL params
    workspaceId := chi.URLParam(r, "workspaceId")

	projectId := chi.URLParam(r, "projectId")

	taskId := chi.URLParam(r, "taskId")

    if workspaceId == "" || projectId == "" || taskId == "" {
		respondWithError(w, http.StatusBadRequest, "Workspace, project and task ID required")
        
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

	validTaskId, invalidTaskIdErr := uuid.Parse(taskId)

	if invalidTaskIdErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Task ID format")
        
        return
	}
	
	// Check if current user is a member and an admin
	member := app.getMemberHandler(r.Context(), validWorkspaceId, user.ID)

	if (member.ID == uuid.Nil){
		respondWithError(w, http.StatusUnauthorized, "You are not a member of this workspace.")

		app.logger.Printf("Create Task Error: You are not a member of this workspace.")
        
        return
	}

	// Delete task
	dbErr := app.storage.DB.DeleteTask(r.Context(), database.DeleteTaskParams{
		ID: validTaskId,
		WorkspaceID: member.WorkspaceID,
		ProjectID: validProjectId,
	})

	if dbErr != nil {
 		respondWithError(w, http.StatusInternalServerError, "Unable to delete task.")

		app.logger.Printf("Unable to delete task: %v", dbErr)

        return
    }

	respondWithJSON(w, http.StatusOK, "Deleted task!")
}

func (app *application) updateTaskHandler(w http.ResponseWriter, r *http.Request, user database.User) {
	// Get the workspace and task ID from the URL params
    workspaceId := chi.URLParam(r, "workspaceId")

	taskId := chi.URLParam(r, "taskId")

    if workspaceId == "" || taskId == "" {
		respondWithError(w, http.StatusBadRequest, "Workspace ID is required")
        
        return
    }

	validWorkspaceId, invalidIdErr := uuid.Parse(workspaceId)

	if invalidIdErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Workspace ID format")
        
        return
	}

	validTaskId, invalidTaskIdErr := uuid.Parse(taskId)

	if invalidTaskIdErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Task ID format")
        
        return
	}

	// Get current task
	task, taskErr := app.storage.DB.CheckForProjectChange(r.Context(), database.CheckForProjectChangeParams{
		ID: validTaskId,
		WorkspaceID: validWorkspaceId,
	})

	if taskErr != nil {
		app.logger.Printf("Task not found: %v", taskErr)
		
		respondWithError(w, http.StatusNotFound, "Task not found")

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

	due_date, dateErr := parseDueDate(params.DueDate)

	if(dateErr != nil){
		respondWithError(w, http.StatusBadRequest, "Invalid due date.")

		app.logger.Printf("Invalid due date: %v", dateErr)
        
        return
	}

	// Check if project ID is valid
	existingProj, projErr := app.storage.DB.CheckProjectExists(r.Context(),database.CheckProjectExistsParams{
		ID: validProjectId,
		WorkspaceID: member.WorkspaceID,
	})

	if (projErr != nil){
		respondWithError(w, http.StatusNotFound, "Project not found! Invalid Project Id.")

		app.logger.Printf("Project not found! Invalid Project Id: %v", projErr)
        
        return
	}

	// Check if task for a stutus is less than 30
	tasksCount, tasksCountErr := app.storage.DB.GetNumberOfTasks(r.Context(), database.GetNumberOfTasksParams{
		Status: sql.NullString{String: params.Status, Valid: params.Status != ""},
		ProjectID: existingProj.ID,
		WorkspaceID: member.WorkspaceID,
	})

	if tasksCountErr == nil && tasksCount == 30 {
		respondWithError(w, http.StatusNotAcceptable, "Max tasks created")

		app.logger.Printf("Max tasks created!")
        
        return
	}

	// check if current task project is the same. 
	// if same keep position or change position to new project highest position.
	var position int

	if(task.ProjectID == existingProj.ID){
		position = int(task.Position)
	} else {
		highestPosition, _ := app.storage.DB.GetTaskWithHighestPosition(r.Context(), database.GetTaskWithHighestPositionParams{
			WorkspaceID: member.WorkspaceID,
			ProjectID: existingProj.ID,
	    })

		if (highestPosition > 0){
			position = int(highestPosition) + 1
		} else {
			position = 0
		}
	}

    // Update task
	dbErr := app.storage.DB.UpdateTask(r.Context(), database.UpdateTaskParams{
		ID: task.ID,
		WorkspaceID: member.WorkspaceID,
		ProjectID: existingProj.ID,
		AssigneeID: uuid.NullUUID{UUID: validAssigneeId, Valid: validAssigneeId != uuid.UUID{}},
		Name: params.Name,
		Description: sql.NullString{String: params.Description, Valid: params.Description != ""},
		Status: sql.NullString{String: params.Status, Valid: params.Status != ""},
		DueDate: sql.NullTime{Time: due_date, Valid: due_date != time.Time{}},
		Position: int32(position),
	})

	if dbErr != nil {
		app.logger.Printf("Couldn't update task: %v", dbErr)

		respondWithError(w, http.StatusInternalServerError, "Couldn't update task")

		return
	}

	respondWithJSON(w, http.StatusOK, "Task updated")
}

func (app *application) updateKanbanTasks(w http.ResponseWriter, r *http.Request, user database.User) {
	// Get the workspace and project ID from the URL params
    workspaceId := chi.URLParam(r, "workspaceId")

	projectId := chi.URLParam(r, "projectId")

    if workspaceId == "" || projectId == "" {
		respondWithError(w, http.StatusBadRequest, "Workspace and project ID is required")
        
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

	type Task struct {
		Id        string   `json:"id"`
		Status    string   `json:"status"`
		Position  int32    `json:"position"`
	}
	
	type parameters struct {
		Tasks []Task  `json:"tasks"`
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

	// Check if current user is a member and an admin
	member := app.getMemberHandler(r.Context(), validWorkspaceId, user.ID)

	if (member.ID == uuid.Nil){
		respondWithError(w, http.StatusUnauthorized, "You are not a member of this workspace.")

		app.logger.Printf("Create Task Error: You are not a member of this workspace.")
        
        return
	}

	// Execute transaction to update tasks
	tsxErr := app.WithTx(r.Context(), func(q *database.Queries) error {
		for _, task := range(params.Tasks){
			taskId, err := uuid.Parse(task.Id)
			
            if err != nil {
                return fmt.Errorf("invalid task ID: %v", err)
            }

			// Check if task for a stutus is less than 30
			tasksCount, tasksCountErr := app.storage.DB.GetNumberOfTasks(r.Context(), database.GetNumberOfTasksParams{
				Status: sql.NullString{String: task.Status, Valid: task.Status != ""},
				ProjectID: validProjectId,
				WorkspaceID: member.WorkspaceID,
			})

			if tasksCountErr == nil && tasksCount == 30 {
				respondWithError(w, http.StatusNotAcceptable, "Max tasks created")

				app.logger.Printf("Max tasks created!")
				
				return tasksCountErr
			}

			// Get current task
			taskExists, taskErr := app.storage.DB.CheckForProjectChange(r.Context(), database.CheckForProjectChangeParams{
				ID: taskId,
				WorkspaceID: member.WorkspaceID,
			})

			if taskErr != nil {
				app.logger.Printf("Task not found: %v", taskErr)
				
				respondWithError(w, http.StatusNotFound, "Task not found")

				return taskErr
			}

			// Update task
			dbErr := app.storage.DB.UpdateTaskStatusAndPosition(r.Context(), database.UpdateTaskStatusAndPositionParams{
				ID: taskExists.ID,
				WorkspaceID: member.WorkspaceID,
				Status: sql.NullString{String: task.Status, Valid: task.Status != ""},
				Position: int32(task.Position),
			})

			if dbErr != nil {
				app.logger.Printf("Couldn't update task: %v", dbErr)

				respondWithError(w, http.StatusInternalServerError, "Couldn't update task")

				return dbErr
			}
		}

		return nil
	})

	if tsxErr != nil {
		app.logger.Printf("Error updating tasks: %v", err)

        respondWithError(w, http.StatusInternalServerError, "Failed to update tasks")

        return
	}

	respondWithJSON(w, http.StatusOK, "Tasks updated")
	
}

func (app *application) getMyTasksHandler(w http.ResponseWriter, r *http.Request, user database.User) {
	// Get the workspace ID from the URL params
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

	// Check if current user is a member and an admin
	member := app.getMemberHandler(r.Context(), validWorkspaceId, user.ID)

	if (member.ID == uuid.Nil){
		respondWithError(w, http.StatusUnauthorized, "You are not a member of this workspace.")

		app.logger.Printf("Create Task Error: You are not a member of this workspace.")
        
        return
	}

	// Get Tasks
	tasks, tasksErr := app.storage.DB.GetMyTasks(r.Context(), database.GetMyTasksParams{
		WorkspaceID: member.WorkspaceID,
		AssigneeID: uuid.NullUUID{UUID: user.ID, Valid: user.ID != uuid.Nil},
	})

	if tasksErr != nil {
		app.logger.Printf("Error getting tasks: %v", tasksErr)

        respondWithError(w, http.StatusInternalServerError, "Failed to get tasks")

        return
	}


	if (len(tasks) == 0){
		app.logger.Printf("No tasks available")

		respondWithJSON(w, http.StatusOK, nil)
	}

	var allTasks []JsonTask

	for _, task := range tasks{
		assignee, usrErr := app.storage.DB.GetUserById(r.Context(), task.AssigneeID.UUID)

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
			AssigneeID: task.AssigneeID.UUID,
			Name: task.Name,
			Description: task.Description.String,
			Position: task.Position,
			DueDate: task.DueDate.Time,
			Status: task.Status.String,
			CreatedAt: task.CreatedAt,
			UpdatedAt: task.UpdatedAt,
			User: TaskUser{
				Username: assignee.Username,
				Image: assignee.Image.String,
			},
			Project: TaskProject{
				Name: project.Name,
				ImageUrl: project.ImageUrl.String,
			},
		})
	}

	respondWithJSON(w, http.StatusOK, allTasks)
	
}

func (app *application) getTaskByIdHandler(w http.ResponseWriter, r *http.Request, user database.User) {
	// Get the task and workspace ID from the URL params
	taskId := chi.URLParam(r, "taskId")

    workspaceId := chi.URLParam(r, "workspaceId")

    if taskId == "" || workspaceId == "" {
		respondWithError(w, http.StatusBadRequest, "Task and workspace ID is required")
        
        return
    }

	validTaskId, invalidTaskIdErr := uuid.Parse(taskId)

	if invalidTaskIdErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid task ID format")
        
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

	// Get Task
	task, taskErr := app.storage.DB.GetTaskById(r.Context(), database.GetTaskByIdParams{
		ID: validTaskId,
		WorkspaceID: member.WorkspaceID,
	})

	if taskErr != nil {
		app.logger.Printf("Error getting task: %v", taskErr)

        respondWithError(w, http.StatusNotFound, "Failed to get task")

        return
	}

	// Get other task details
	assignee, usrErr := app.storage.DB.GetUserById(r.Context(), task.AssigneeID.UUID)

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

	taskDetails := JsonTask{
		ID: task.ID,
		WorkspaceID: task.WorkspaceID,
		ProjectID: task.ProjectID,
		AssigneeID: task.AssigneeID.UUID,
		Name: task.Name,
		Description: task.Description.String,
		Position: task.Position,
		DueDate: task.DueDate.Time,
		Status: task.Status.String,
		CreatedAt: task.CreatedAt,
		UpdatedAt: task.UpdatedAt,
		User: TaskUser{
			Username: assignee.Username,
			Image: assignee.Image.String,
		},
		Project: TaskProject{
			Name: project.Name,
			ImageUrl: project.ImageUrl.String,
		},
	}

	respondWithJSON(w, http.StatusOK, taskDetails)
	
}