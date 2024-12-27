package main

import (
	"fmt"
	"net/http"
	"server/internal/auth"
	"server/internal/database"
)

type AuthHandler func (http.ResponseWriter, *http.Request, database.User)

func (app *application) middlewareAuth(handler AuthHandler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		clerk_id, err := auth.GetClerkId(r.Header)

		if err != nil {
		    fmt.Printf("Couldn't get clerk id: %v", err)

		    respondWithError(w, http.StatusNotFound, "Couldn't get clerk id")

		    return
	    }

		user, dbErr := app.storage.DB.GetUserByClerkId(r.Context(), clerk_id)

	    if dbErr != nil {
		    fmt.Printf("Couldn't get user: %v", err)

		    respondWithError(w, http.StatusInternalServerError, "Couldn't get user")

		    return
	    }

		handler(w, r, user)
	}
}