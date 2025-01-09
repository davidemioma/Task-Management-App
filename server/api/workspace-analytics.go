package main

import (
	"net/http"
	"server/internal/database"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (app *application) getWorkspaceAnalytics(w http.ResponseWriter, r *http.Request, user database.User) {
	// Get the workspace Id from the URL params
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

	type Result struct {
		Projects  []Project      `json:"projects"`
		Members   []HomeMember   `json:"members"`
		Analytics Analytics      `json:"analytics"`
	}

	var data = Result{}

	// Execute transaction to update tasks
	tsxErr := app.WithTx(r.Context(), func(q *database.Queries) error {
		// Get this month tasks
		thisMonthTasks, thisMonthTasksErr := app.storage.DB.GetWorkspaceTasksByMonth(r.Context(), database.GetWorkspaceTasksByMonthParams{
			WorkspaceID: member.WorkspaceID,
			Column2: monthStart,
			Column3: monthEnd,
		})

		if (thisMonthTasksErr != nil){
			respondWithError(w, http.StatusInternalServerError, "Unable to get this month tasks")

			app.logger.Printf("Unable to get this month tasks %v", thisMonthTasksErr)
			
			return thisMonthTasksErr
		}

		// Get last month tasks
		lastMonthTasks, lastMonthTasksErr := app.storage.DB.GetWorkspaceTasksByMonth(r.Context(), database.GetWorkspaceTasksByMonthParams{
			WorkspaceID: member.WorkspaceID,
			Column2: lastMonthStart,
			Column3: lastMonthEnd,
		})

		if (lastMonthTasksErr != nil){
			respondWithError(w, http.StatusInternalServerError, "Unable to get last month tasks")

			app.logger.Printf("Unable to get last month tasks %v", lastMonthTasksErr)
			
			return lastMonthTasksErr
		}

		tasksCount := len(thisMonthTasks)

		tasksDifference := tasksCount - len(lastMonthTasks)

		// Get this month assigned tasks
		thisMonthAssignedTasks, thisMonthAssignedTasksErr := app.storage.DB.GetWorkspaceAssignedTasksByMonth(r.Context(), database.GetWorkspaceAssignedTasksByMonthParams{
			WorkspaceID: member.WorkspaceID,
			AssigneeID: uuid.NullUUID{UUID: user.ID, Valid: user.ID != uuid.Nil},
			Column3: monthStart,
			Column4: monthEnd,
		})

		if (thisMonthAssignedTasksErr != nil){
			respondWithError(w, http.StatusInternalServerError, "Unable to get this month assigned tasks")

			app.logger.Printf("Unable to get this month assigned tasks %v", thisMonthAssignedTasksErr)
			
			return thisMonthAssignedTasksErr
		}

		// Get last month assigned tasks
		lastMonthAssignedTasks, lastMonthAssignedTasksErr := app.storage.DB.GetWorkspaceAssignedTasksByMonth(r.Context(), database.GetWorkspaceAssignedTasksByMonthParams{
			WorkspaceID: member.WorkspaceID,
			AssigneeID: uuid.NullUUID{UUID: user.ID, Valid: user.ID != uuid.Nil},
			Column3: lastMonthStart,
			Column4: lastMonthEnd,
		})

		if (lastMonthAssignedTasksErr != nil){
			respondWithError(w, http.StatusInternalServerError, "Unable to get last month assigned tasks")

			app.logger.Printf("Unable to get last month assigned tasks %v", lastMonthAssignedTasksErr)
			
			return lastMonthAssignedTasksErr
		}

		assignedTasksCount := len(thisMonthAssignedTasks)

		assignedTasksDifference := assignedTasksCount - len(lastMonthAssignedTasks)

		// Get this month incomplete tasks
		thisMonthIncompleteTasks, thisMonthIncompleteTasksErr := app.storage.DB.GetWorkspaceIncompleteTasksByMonth(r.Context(), database.GetWorkspaceIncompleteTasksByMonthParams{
			WorkspaceID: member.WorkspaceID,
			Column2: monthStart,
			Column3: monthEnd,
		})

		if (thisMonthIncompleteTasksErr != nil){
			respondWithError(w, http.StatusInternalServerError, "Unable to get this month incomplete tasks")

			app.logger.Printf("Unable to get this month incomplete tasks %v", thisMonthIncompleteTasksErr)
			
			return thisMonthIncompleteTasksErr
		}

		// Get last month incomplete tasks
		lastMonthIncompleteTasks, lastMonthIncompleteTasksErr := app.storage.DB.GetWorkspaceIncompleteTasksByMonth(r.Context(), database.GetWorkspaceIncompleteTasksByMonthParams{
			WorkspaceID: member.WorkspaceID,
			Column2: lastMonthStart,
			Column3: lastMonthEnd,
		})

		if (lastMonthIncompleteTasksErr != nil){
			respondWithError(w, http.StatusInternalServerError, "Unable to get last month incomplete tasks")

			app.logger.Printf("Unable to get last month incomplete tasks %v", lastMonthIncompleteTasksErr)
			
			return lastMonthIncompleteTasksErr
		}

		incompleteTasksCount := len(thisMonthIncompleteTasks)

		incompleteTasksDifference := incompleteTasksCount - len(lastMonthIncompleteTasks)

		// Get this month completed tasks
		thisMonthCompletedTasks, thisMonthCompletedTasksErr := app.storage.DB.GetWorkspaceCompletedTasksByMonth(r.Context(), database.GetWorkspaceCompletedTasksByMonthParams{
			WorkspaceID: member.WorkspaceID,
			Column2: monthStart,
			Column3: monthEnd,
		})

		if (thisMonthCompletedTasksErr != nil){
			respondWithError(w, http.StatusInternalServerError, "Unable to get this month completed tasks")

			app.logger.Printf("Unable to get this month completed tasks %v", thisMonthCompletedTasksErr)
			
			return thisMonthCompletedTasksErr
		}

		// Get last month completed tasks
		lastMonthCompletedTasks, lastMonthCompletedTasksErr := app.storage.DB.GetWorkspaceCompletedTasksByMonth(r.Context(), database.GetWorkspaceCompletedTasksByMonthParams{
			WorkspaceID: member.WorkspaceID,
			Column2: lastMonthStart,
			Column3: lastMonthEnd,
		})

		if (lastMonthCompletedTasksErr != nil){
			respondWithError(w, http.StatusInternalServerError, "Unable to get last month completed tasks")

			app.logger.Printf("Unable to get last month completed tasks %v", lastMonthCompletedTasksErr)
			
			return lastMonthCompletedTasksErr
		}

		completedTasksCount := len(thisMonthCompletedTasks)

		completedTasksDifference := completedTasksCount - len(lastMonthCompletedTasks)

		// Get this month overdue tasks
		thisMonthOverdueTasks, thisMonthOverdueTasksErr := app.storage.DB.GetWorkspaceOverdueTasksByMonth(r.Context(), database.GetWorkspaceOverdueTasksByMonthParams{
			WorkspaceID: member.WorkspaceID,
			Column2: monthStart,
			Column3: monthEnd,
		})

		if (thisMonthOverdueTasksErr != nil){
			respondWithError(w, http.StatusInternalServerError, "Unable to get this month overdue tasks")

			app.logger.Printf("Unable to get this month overdue tasks %v", thisMonthOverdueTasksErr)
			
			return thisMonthOverdueTasksErr
		}

		// Get last month overdue tasks
		lastMonthOverdueTasks, lastMonthOverdueTasksErr := app.storage.DB.GetWorkspaceOverdueTasksByMonth(r.Context(), database.GetWorkspaceOverdueTasksByMonthParams{
			WorkspaceID: member.WorkspaceID,
			Column2: lastMonthStart,
			Column3: lastMonthEnd,
		})

		if (lastMonthOverdueTasksErr != nil){
			respondWithError(w, http.StatusInternalServerError, "Unable to get last month overdue tasks")

			app.logger.Printf("Unable to get last month overdue tasks %v", lastMonthOverdueTasksErr)
			
			return lastMonthOverdueTasksErr
		}

		overdueTasksCount := len(thisMonthOverdueTasks)

		overdueTasksDifference := overdueTasksCount - len(lastMonthOverdueTasks)

		// Get some projects
		projects, projErr := app.storage.DB.GetSomeProjects(r.Context(), member.WorkspaceID)

		if projErr != nil{
			respondWithError(w, http.StatusInternalServerError, "Unable to get projects")

			app.logger.Printf("Unable to get projects %v", projErr)
			
			return projErr
		}

		// Get some members
		members, memErr := app.storage.DB.GetSomeMembers(r.Context(), member.WorkspaceID)

		if memErr != nil{
			respondWithError(w, http.StatusInternalServerError, "Unable to get members")

			app.logger.Printf("Unable to get members %v", memErr)
			
			return memErr
		}

		data = Result{
			Projects: projectsToJson(projects),
			Members: getJsonMembers(members),
			Analytics: Analytics{
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
		    },
		}

		return nil
	})

	if tsxErr != nil {
		app.logger.Printf("Error getting workspace analytics: %v", tsxErr)

        respondWithError(w, http.StatusInternalServerError, "Failed to get workspace analytics")

        return
	}

	respondWithJSON(w, http.StatusOK, data)
}