package main

import (
	"server/internal/database"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID      `json:"id"`
	ClerkID   string         `json:"clerkId"`
	Email     string         `json:"email"`
	Username  string         `json:"username"`
	Image     string         `json:"image"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
}

func databaseUsertoUser(user database.User) User {
	var image string

	if user.Image.Valid {
		image = user.Image.String
	}

	return User{
		ID: user.ID,
		ClerkID: user.ClerkID,
		Email: user.Email,
		Username: user.Username,
		Image: image,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}
}

type Workspace struct {
	ID        uuid.UUID  `json:"id"`
	UserID    uuid.UUID  `json:"userId"`
	Name      string     `json:"name"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
	ImageUrl  string     `json:"imageUrl"`
	InviteCode string    `json:"inviteCode"`
}

type SigleWorkspace struct {
	ID        uuid.UUID  `json:"id"`
	Name      string     `json:"name"`
}

func databaseWorkspacetoWorkspace(workspace database.Workspace) Workspace {
	var imageUrl string

	if workspace.ImageUrl.Valid {
		imageUrl = workspace.ImageUrl.String
	}

	return Workspace{
		ID: workspace.ID,
		UserID: workspace.UserID,
		Name: workspace.Name,
		ImageUrl: imageUrl,
		InviteCode: workspace.InviteCode,
		CreatedAt: workspace.CreatedAt,
		UpdatedAt: workspace.UpdatedAt,
	}
}

func databaseWorkspacetoSafeWorkspace(workspace database.GetWorkspaceByIdRow) Workspace {
	var imageUrl string

	if workspace.ImageUrl.Valid {
		imageUrl = workspace.ImageUrl.String
	}

	return Workspace{
		ID: workspace.ID,
		UserID: workspace.UserID,
		Name: workspace.Name,
		ImageUrl: imageUrl,
		InviteCode: workspace.InviteCode,
		CreatedAt: workspace.CreatedAt,
		UpdatedAt: workspace.UpdatedAt,
	}
}

func databaseWorkspacetoSingleWorkspace(workspace database.GetSigleWorkspaceRow) SigleWorkspace {
	return SigleWorkspace{
		ID: workspace.ID,
		Name: workspace.Name,
	}
}

func databaseWorkspacesToWorkspaces(workspaces []database.Workspace) [] Workspace{
	var newWorkspaces [] Workspace

	for _, workspace := range workspaces{
		newWorkspaces = append(newWorkspaces, databaseWorkspacetoWorkspace(workspace))
	}

	return newWorkspaces
}

type WorkspaceMembers struct {
	ID          uuid.UUID   `json:"id"`
	UserID      uuid.UUID   `json:"userId"`
	WorkspaceID uuid.UUID   `json:"workspaceId"`
	Role        string      `json:"role"`
	CreatedAt   time.Time   `json:"createdAt"`
	UpdatedAt   time.Time   `json:"updatedAt"`
	Username    string      `json:"username"`
	Email       string      `json:"email"`
	Image       string      `json:"image"`
}

func databaseMemberToMember(member database.GetWorkspaceMembersRow) WorkspaceMembers {
	return WorkspaceMembers{
		ID: member.ID,
		UserID: member.UserID,
		WorkspaceID: member.WorkspaceID,
		Role: member.Role,
		CreatedAt: member.CreatedAt,
		UpdatedAt: member.UpdatedAt,
		Username: member.Username,
		Email: member.Email,
		Image: member.Image.String,
	}
}

func databaseMembersToMembers(members []database.GetWorkspaceMembersRow) [] WorkspaceMembers{
	var newMembers [] WorkspaceMembers

	for _, member := range members{
		newMembers = append(newMembers, databaseMemberToMember(member))
	}

	return newMembers
}

type Project struct {
	ID          uuid.UUID `json:"id"`
	WorkspaceID uuid.UUID `json:"workspaceId"`
	Name        string    `json:"name"`
	ImageUrl    string    `json:"imageUrl"`
	CreatedAt time.Time   `json:"createdAt"`
	UpdatedAt time.Time   `json:"updatedAt"`
}

func projectToJson (project database.Project) Project {
	return Project{
		ID: project.ID,
		WorkspaceID: project.WorkspaceID,
		Name: project.Name,
		ImageUrl: project.ImageUrl.String,
		CreatedAt: project.CreatedAt,
		UpdatedAt: project.UpdatedAt,
	}
}

func projectsToJson (projects []database.Project) []Project {
	var newProjects [] Project

	for _, project := range projects{
		newProjects = append(newProjects, projectToJson(project))
	}

	return newProjects
}

type TaskUser struct {
	Username string `json:"username"`
	Image    string `json:"image"`
}

type TaskProject struct {
	Name     string `json:"name"`
	ImageUrl string `json:"imageUrl"`
}

type JsonTask struct {
	ID          uuid.UUID    `json:"id"`
	WorkspaceID uuid.UUID    `json:"workspaceId"`
	ProjectID   uuid.UUID    `json:"projectId"`
	AssigneeID  uuid.UUID    `json:"assigneeId"`
	Name        string       `json:"name"`
	Description string       `json:"description"`
	Position    int32        `json:"position"`
	DueDate     time.Time    `json:"dueDate"`
	Status      string       `json:"status"`
	CreatedAt   time.Time    `json:"createdAt"`
	UpdatedAt   time.Time    `json:"updatedAt"`
	User        TaskUser     `json:"user"`
	Project     TaskProject  `json:"project"`
}

type OptionUser struct {
	ID       uuid.UUID  `json:"id"`
	Username string     `json:"username"`
	Image    string     `json:"image"`
}

type OptionProject struct {
	ID       uuid.UUID `json:"id"`
	Name     string    `json:"name"`
	ImageUrl string    `json:"imageUrl"`
}

type OptionMember struct {
	ID       uuid.UUID  `json:"id"`
	Role     string     `json:"role"`
	User     OptionUser `json:"user"`
}

type JsonOptions struct {
	Projects []OptionProject `json:"projects"`
	Members  []OptionMember  `json:"members"`
}

func projectsToJsonProjects(projects []database.GetTaskProjectsRow) []OptionProject {
	var newProjects [] OptionProject

	for _, project := range projects{
		newProjects = append(newProjects, OptionProject{
			ID: project.ID,
			Name: project.Name,
			ImageUrl: project.ImageUrl.String,
		})
	}

	return newProjects
}

func membersToJsonMembers(members []database.GetTaskMembersRow) []OptionMember {
	var newMembers [] OptionMember

	for _, member := range members{
		newMembers = append(newMembers, OptionMember{
			ID: member.ID,
			Role: member.Role,
			User: OptionUser{
				ID: member.UserID.UUID,
				Username: member.UserUsername.String,
				Image: member.UserImage.String,
			},
		})
	}

	return newMembers
}

type Analytics struct {
	TaskCount                int `json:"taskCount"`
	TaskDifference           int `json:"taskDifference"`
	AssignedTaskCount        int `json:"assignedTaskCount"`
	AssignedTaskDifference   int `json:"assignedTaskDifference"`
	CompletedTaskCount       int `json:"completedTaskCount"`
	CompletedTaskDifference  int `json:"completedTaskDifference"`
	IncompleteTaskCount      int `json:"incompleteTaskCount"`
	IncompleteTaskDifference int `json:"incompleteTaskDifference"`
	OverdueTaskCount         int `json:"overdueTaskCount"`
	OverdueTaskDifference    int `json:"overdueTaskDifference"`
}

type HomeUser struct {
	Email    string     `json:"email"`
	Username string     `json:"username"`
	Image    string     `json:"image"`
}

type HomeMember struct {
	ID       uuid.UUID  `json:"id"`
	Role     string     `json:"role"`
	User     HomeUser   `json:"user"`
}

func getJsonMembers(members []database.GetSomeMembersRow) []HomeMember {
	var newMembers [] HomeMember

	for _, member := range members{
		newMembers = append(newMembers, HomeMember{
			ID: member.ID,
			Role: member.Role,
			User: HomeUser{
				Email: member.Email,
				Username: member.Username,
				Image: member.Image.String,
			},
		})
	}

	return newMembers
}