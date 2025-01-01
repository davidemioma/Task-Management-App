package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"server/internal/database"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (app *application) createMemberHandler(ctx context.Context, workspace_id uuid.UUID, user_id uuid.UUID, role string) (error) {
	err := app.storage.DB.CreateMember(ctx, database.CreateMemberParams{
		ID: uuid.New(),
		UserID: user_id,
		WorkspaceID: workspace_id,
		Role: role,
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	})

	if err != nil {
		return err
	}

	return nil
}

func (app *application) getMemberHandler(ctx context.Context, workspace_id uuid.UUID, user_id uuid.UUID) (database.Member) {
	member, err := app.storage.DB.GetMember(ctx, database.GetMemberParams{
		UserID: user_id,
		WorkspaceID: workspace_id,
	})

	if err != nil {
		return database.Member{}
	}

	return member
}

func (app *application) getWorkspaceMembersHandler(w http.ResponseWriter, r *http.Request, user database.User) {
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
	workspace, checkErr := app.storage.DB.GetWorkspaceById(r.Context(), database.GetWorkspaceByIdParams{
		ID: validId,
		UserID: user.ID,
	})

	if checkErr != nil {
		fmt.Printf("Couldn't find workspace: %v", checkErr)

		respondWithError(w, http.StatusNotFound, "Couldn't find workspace")

		return
	}

	members, err := app.storage.DB.GetWorkspaceMembers(r.Context(), workspace.ID)

	if err != nil {
		fmt.Printf("Couldn't get members: %v", err)

		respondWithError(w, http.StatusInternalServerError, "Couldn't get members")

		return
	}

	respondWithJSON(w, http.StatusOK, databaseMembersToMembers(members))
}


func (app *application) deleteWorkspaceMember(w http.ResponseWriter, r *http.Request, user database.User) {
	// Get the workspace id from the URL params
    workspaceId := chi.URLParam(r, "workspaceId")

	memberId := chi.URLParam(r, "memberId")

    if workspaceId == "" || memberId == "" {
		respondWithError(w, http.StatusBadRequest, "Workspace and member ID required")
        
        return
    }

	validWorkspaceId, invalidIdErr := uuid.Parse(workspaceId)

	if invalidIdErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Workspace ID format")
        
        return
	}

	validMemberId, wrongIdErr := uuid.Parse(memberId)

	if wrongIdErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Member ID format")
        
        return
	}

	// Check if current user is a member and an admin
	member := app.getMemberHandler(r.Context(), validWorkspaceId, user.ID)

	if (member.ID == uuid.Nil){
		respondWithError(w, http.StatusUnauthorized, "You are not a member of this workspace.")
        
        return
	}

	if (member.Role != "ADMIN"){
		respondWithError(w, http.StatusUnauthorized, "You are not authorized to remove a member.")
        
        return
	}

	// Check if member exists
	memberToDelete, checkErr := app.storage.DB.GetMemberById(r.Context(), database.GetMemberByIdParams{
		ID: validMemberId,
		WorkspaceID: validWorkspaceId,
	})

	if checkErr != nil {
		respondWithError(w, http.StatusNotFound, "Cannot find member")
        
        return
	}

	// Check if you are trying to remove yourself
	if member.ID == memberToDelete.ID{
		respondWithError(w, http.StatusUnauthorized, "You are not authorized to remove yourself")
        
        return
	}

	dbErr := app.storage.DB.DeleteMember(r.Context(), database.DeleteMemberParams{
		ID: memberToDelete.ID,
		WorkspaceID: memberToDelete.WorkspaceID,
	})
	
	if dbErr != nil{
		respondWithError(w, http.StatusInternalServerError, "Couldn't remove member")

		return
	}

	respondWithJSON(w, http.StatusOK, "Member has been removed")
}

func (app *application) updateWorkspaceMember(w http.ResponseWriter, r *http.Request, user database.User) {
	// Get params to update
	type parameters struct {
		Role  string  `json:"role"`
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

	if params.Role == "" {
		respondWithError(w, http.StatusBadRequest, "Invalid Parameters")

		return
	}

	// Get the workspace id from the URL params
    workspaceId := chi.URLParam(r, "workspaceId")

	memberId := chi.URLParam(r, "memberId")

    if workspaceId == "" || memberId == "" {
		respondWithError(w, http.StatusBadRequest, "Workspace and member ID required")
        
        return
    }

	validWorkspaceId, invalidIdErr := uuid.Parse(workspaceId)

	if invalidIdErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Workspace ID format")
        
        return
	}

	validMemberId, wrongIdErr := uuid.Parse(memberId)

	if wrongIdErr != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Member ID format")
        
        return
	}

	// Check if current user is a member and an admin
	member := app.getMemberHandler(r.Context(), validWorkspaceId, user.ID)

	if (member.ID == uuid.Nil){
		respondWithError(w, http.StatusUnauthorized, "You are not a member of this workspace.")
        
        return
	}

	if (member.Role != "ADMIN"){
		respondWithError(w, http.StatusUnauthorized, "You are not authorized to update a member.")
        
        return
	}

	// Check if member exists
	memberToUpdate, checkErr := app.storage.DB.GetMemberById(r.Context(), database.GetMemberByIdParams{
		ID: validMemberId,
		WorkspaceID: validWorkspaceId,
	})

	if checkErr != nil {
		respondWithError(w, http.StatusNotFound, "Cannot find member")
        
        return
	}

	// Check if you are trying to update yourself
	if member.ID == memberToUpdate.ID{
		respondWithError(w, http.StatusUnauthorized, "You are not authorized to update yourself")
        
        return
	}

	dbErr := app.storage.DB.UpdateMemberRole(r.Context(), database.UpdateMemberRoleParams{
		ID: memberToUpdate.ID,
		WorkspaceID: memberToUpdate.WorkspaceID,
		Role: params.Role,
	})
	
	if dbErr != nil{
		respondWithError(w, http.StatusInternalServerError, "Couldn't update member")

		return
	}

	respondWithJSON(w, http.StatusOK, "Member has been updated")
}