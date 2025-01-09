package main

import (
	"net/http"
	"server/internal/database"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (app *application) getProjectAnalytics(w http.ResponseWriter, r *http.Request, user database.User) {
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

	// Retrieve query parameters
    monthStartStr := r.URL.Query().Get("monthStart") 

    monthEndStr := r.URL.Query().Get("monthEnd")

	lastMonthStartStr := r.URL.Query().Get("lastMonthStart") 

    lastMonthEndStr := r.URL.Query().Get("lastMonthEnd")

	hasFilters := monthStartStr != "" && monthEndStr != "" && lastMonthStartStr != "" && lastMonthEndStr != ""

	if !hasFilters {
		respondWithError(w, http.StatusBadRequest, "Current and last month start and end date required!")

		app.logger.Printf("urrent and last month start and end date required!")
        
        return
	}

	monthStart, monthStartErr := parseDueDate(monthStartStr) 

	if monthStartErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid start date!")

		app.logger.Printf("Invalid start date!")
        
        return
	}

	monthEnd, monthEndErr := parseDueDate(monthEndStr) 

	if monthEndErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid end date!")

		app.logger.Printf("Invalid end date!")
        
        return
	}

	lastMonthStart, lastMonthStartErr := parseDueDate(lastMonthStartStr) 

	if lastMonthStartErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid last month start date!")

		app.logger.Printf("Invalid last month start date!")
        
        return
	}

	lastMonthEnd, lastMonthEndErr := parseDueDate(lastMonthEndStr) 

	if lastMonthEndErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid last month end date!")

		app.logger.Printf("Invalid last month end date!")
        
        return
	}

	// Check if current user is a member and an admin
	member := app.getMemberHandler(r.Context(), validWorkspaceId, user.ID)

	if (member.ID == uuid.Nil){
		respondWithError(w, http.StatusUnauthorized, "You are not a member of this workspace.")

		app.logger.Printf("Create Task Error: You are not a member of this workspace.")
        
        return
	}

	var analytics = Analytics{}

	// Execute transaction to update tasks
	tsxErr := app.WithTx(r.Context(), func(q *database.Queries) error {
		// Get this month tasks
		thisMonthTasks, thisMonthTasksErr := app.storage.DB.GetTasksByMonth(r.Context(), database.GetTasksByMonthParams{
			WorkspaceID: member.WorkspaceID,
			ProjectID: validProjectId,
			Column3: monthStart,
			Column4: monthEnd,
		})

		if (thisMonthTasksErr != nil){
			respondWithError(w, http.StatusInternalServerError, "Unable to get this month tasks")

			app.logger.Printf("Unable to get this month tasks %v", thisMonthTasksErr)
			
			return thisMonthTasksErr
		}

		// Get last month tasks
		lastMonthTasks, lastMonthTasksErr := app.storage.DB.GetTasksByMonth(r.Context(), database.GetTasksByMonthParams{
			WorkspaceID: member.WorkspaceID,
			ProjectID: validProjectId,
			Column3: lastMonthStart,
			Column4: lastMonthEnd,
		})

		if (lastMonthTasksErr != nil){
			respondWithError(w, http.StatusInternalServerError, "Unable to get last month tasks")

			app.logger.Printf("Unable to get last month tasks %v", lastMonthTasksErr)
			
			return lastMonthTasksErr
		}

		tasksCount := len(thisMonthTasks)

		tasksDifference := tasksCount - len(lastMonthTasks)

		// Get this month assigned tasks
		thisMonthAssignedTasks, thisMonthAssignedTasksErr := app.storage.DB.GetAssignedTasksByMonth(r.Context(), database.GetAssignedTasksByMonthParams{
			WorkspaceID: member.WorkspaceID,
			ProjectID: validProjectId,
			AssigneeID: uuid.NullUUID{UUID: user.ID, Valid: user.ID != uuid.Nil},
			Column4: monthStart,
			Column5: monthEnd,
		})

		if (thisMonthAssignedTasksErr != nil){
			respondWithError(w, http.StatusInternalServerError, "Unable to get this month assigned tasks")

			app.logger.Printf("Unable to get this month assigned tasks %v", thisMonthAssignedTasksErr)
			
			return thisMonthAssignedTasksErr
		}

		// Get last month assigned tasks
		lastMonthAssignedTasks, lastMonthAssignedTasksErr := app.storage.DB.GetAssignedTasksByMonth(r.Context(), database.GetAssignedTasksByMonthParams{
			WorkspaceID: member.WorkspaceID,
			ProjectID: validProjectId,
			AssigneeID: uuid.NullUUID{UUID: user.ID, Valid: user.ID != uuid.Nil},
			Column4: lastMonthStart,
			Column5: lastMonthEnd,
		})

		if (lastMonthAssignedTasksErr != nil){
			respondWithError(w, http.StatusInternalServerError, "Unable to get last month assigned tasks")

			app.logger.Printf("Unable to get last month assigned tasks %v", lastMonthAssignedTasksErr)
			
			return lastMonthAssignedTasksErr
		}

		assignedTasksCount := len(thisMonthAssignedTasks)

		assignedTasksDifference := assignedTasksCount - len(lastMonthAssignedTasks)

		// Get this month incomplete tasks
		thisMonthIncompleteTasks, thisMonthIncompleteTasksErr := app.storage.DB.GetIncompleteTasksByMonth(r.Context(), database.GetIncompleteTasksByMonthParams{
			WorkspaceID: member.WorkspaceID,
			ProjectID: validProjectId,
			Column3: monthStart,
			Column4: monthEnd,
		})

		if (thisMonthIncompleteTasksErr != nil){
			respondWithError(w, http.StatusInternalServerError, "Unable to get this month incomplete tasks")

			app.logger.Printf("Unable to get this month incomplete tasks %v", thisMonthIncompleteTasksErr)
			
			return thisMonthIncompleteTasksErr
		}

		// Get last month incomplete tasks
		lastMonthIncompleteTasks, lastMonthIncompleteTasksErr := app.storage.DB.GetIncompleteTasksByMonth(r.Context(), database.GetIncompleteTasksByMonthParams{
			WorkspaceID: member.WorkspaceID,
			ProjectID: validProjectId,
			Column3: lastMonthStart,
			Column4: lastMonthEnd,
		})

		if (lastMonthIncompleteTasksErr != nil){
			respondWithError(w, http.StatusInternalServerError, "Unable to get last month incomplete tasks")

			app.logger.Printf("Unable to get last month incomplete tasks %v", lastMonthIncompleteTasksErr)
			
			return lastMonthIncompleteTasksErr
		}

		incompleteTasksCount := len(thisMonthIncompleteTasks)

		incompleteTasksDifference := incompleteTasksCount - len(lastMonthIncompleteTasks)

		// Get this month completed tasks
		thisMonthCompletedTasks, thisMonthCompletedTasksErr := app.storage.DB.GetCompletedTasksByMonth(r.Context(), database.GetCompletedTasksByMonthParams{
			WorkspaceID: member.WorkspaceID,
			ProjectID: validProjectId,
			Column3: monthStart,
			Column4: monthEnd,
		})

		if (thisMonthCompletedTasksErr != nil){
			respondWithError(w, http.StatusInternalServerError, "Unable to get this month completed tasks")

			app.logger.Printf("Unable to get this month completed tasks %v", thisMonthCompletedTasksErr)
			
			return thisMonthCompletedTasksErr
		}

		// Get last month completed tasks
		lastMonthCompletedTasks, lastMonthCompletedTasksErr := app.storage.DB.GetCompletedTasksByMonth(r.Context(), database.GetCompletedTasksByMonthParams{
			WorkspaceID: member.WorkspaceID,
			ProjectID: validProjectId,
			Column3: lastMonthStart,
			Column4: lastMonthEnd,
		})

		if (lastMonthCompletedTasksErr != nil){
			respondWithError(w, http.StatusInternalServerError, "Unable to get last month completed tasks")

			app.logger.Printf("Unable to get last month completed tasks %v", lastMonthCompletedTasksErr)
			
			return lastMonthCompletedTasksErr
		}

		completedTasksCount := len(thisMonthCompletedTasks)

		completedTasksDifference := completedTasksCount - len(lastMonthCompletedTasks)

		// Get this month overdue tasks
		thisMonthOverdueTasks, thisMonthOverdueTasksErr := app.storage.DB.GetOverdueTasksByMonth(r.Context(), database.GetOverdueTasksByMonthParams{
			WorkspaceID: member.WorkspaceID,
			ProjectID: validProjectId,
			Column3: monthStart,
			Column4: monthEnd,
		})

		if (thisMonthOverdueTasksErr != nil){
			respondWithError(w, http.StatusInternalServerError, "Unable to get this month overdue tasks")

			app.logger.Printf("Unable to get this month overdue tasks %v", thisMonthOverdueTasksErr)
			
			return thisMonthOverdueTasksErr
		}

		// Get last month overdue tasks
		lastMonthOverdueTasks, lastMonthOverdueTasksErr := app.storage.DB.GetOverdueTasksByMonth(r.Context(), database.GetOverdueTasksByMonthParams{
			WorkspaceID: member.WorkspaceID,
			ProjectID: validProjectId,
			Column3: lastMonthStart,
			Column4: lastMonthEnd,
		})

		if (lastMonthOverdueTasksErr != nil){
			respondWithError(w, http.StatusInternalServerError, "Unable to get last month overdue tasks")

			app.logger.Printf("Unable to get last month overdue tasks %v", lastMonthOverdueTasksErr)
			
			return lastMonthOverdueTasksErr
		}

		overdueTasksCount := len(thisMonthOverdueTasks)

		overdueTasksDifference := overdueTasksCount - len(lastMonthOverdueTasks)

		analytics = Analytics{
			TaskCount: tasksCount,
			TaskDifference: tasksDifference,
			AssignedTaskCount: assignedTasksCount,
			AssignedTaskDifference: assignedTasksDifference,
			CompletedTaskCount: completedTasksCount,
			CompletedTaskDifference: completedTasksDifference,
			IncompleteTaskCount: incompleteTasksCount,
			IncompleteTaskDifference: incompleteTasksDifference,
			OverdueTaskCount: overdueTasksCount,
			OverdueTaskDifference: overdueTasksDifference,
		}

		return nil
	})

	if tsxErr != nil {
		app.logger.Printf("Error getting project analytics: %v", tsxErr)

        respondWithError(w, http.StatusInternalServerError, "Failed to get project analytics")

        return
	}

	respondWithJSON(w, http.StatusOK, analytics)
}