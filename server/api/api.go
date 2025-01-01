package main

import (
	"net/http"
	"server/internal/database"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

type config struct {}

type storage struct {
	DB *database.Queries
	bucket string
	cloudfront_url string
}

type application struct {
	config  config
	storage storage
}

// Handle Routes
func (app *application) mount() http.Handler {
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.RequestID)
	
	r.Use(middleware.RealIP)

	r.Use(middleware.Logger)

	r.Use(middleware.Recoverer)

	r.Use(middleware.Timeout(60 * time.Second))

	// Cors
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	// Routes
	r.Route("/v1", func(r chi.Router) {
		r.Get("/health", handlerReadiness)

		r.Get("/err", handlerErr)

        // Auth
		r.Post("/onboard", app.createUserHandler)

		r.Get("/auth/user", app.middlewareAuth(app.getUserByClerkId))

		// Workspaces
		r.Get("/workspaces", app.middlewareAuth(app.getWorkspacesByUserId))

		r.Post("/workspaces", app.middlewareAuth(app.createWorkspaceHandler))

		// Workspace
		r.Get("/workspaces/{workspaceId}", app.middlewareAuth(app.getWorkspaceById))

		r.Get("/workspaces/{workspaceId}/single", app.middlewareAuth(app.getSigleWorkspace))

		r.Patch("/workspaces/{workspaceId}", app.middlewareAuth(app.updateWorkspaceHandler))

		r.Delete("/workspaces/{workspaceId}", app.middlewareAuth(app.deleteWorkspaceHandler))

		r.Patch("/workspaces/{workspaceId}/invite-code", app.middlewareAuth(app.updateInviteCodeHandler))

		r.Post("/workspaces/{workspaceId}/join", app.middlewareAuth(app.joinWorkspaceHandler))

		// Members
		r.Get("/workspaces/{workspaceId}/members", app.middlewareAuth(app.getWorkspaceMembersHandler))

		r.Patch("/workspaces/{workspaceId}/members/{memberId}", app.middlewareAuth(app.updateWorkspaceMember))

		r.Delete("/workspaces/{workspaceId}/members/{memberId}", app.middlewareAuth(app.deleteWorkspaceMember))

		// Projects
		r.Get("/workspaces/{workspaceId}/projects", app.middlewareAuth(app.getWorkspaceProjects))

		r.Post("/workspaces/{workspaceId}/projects", app.middlewareAuth(app.createWorkspaceProject))
	})

	return r
}

// Run Server
func (app *application) run(port string, handler http.Handler) error {
	srv := &http.Server{
		Addr:         port,
		Handler:      handler,
		WriteTimeout: time.Second * 30,
		ReadTimeout:  time.Second * 10,
		IdleTimeout:  time.Minute,
	}

	err := srv.ListenAndServe()

	if err != nil {
		return err
	}

	return nil
}