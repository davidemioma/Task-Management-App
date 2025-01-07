package main

import (
	"context"
	"fmt"
	"server/internal/database"
	"strings"
	"time"
)

func getFileExtension(contentType string) string {
    switch contentType {
		case "image/jpeg":
			return ".jpeg"
		case "image/jpg":
			return ".jpg"	
		case "image/png":
			return ".png"
		case "image/svg":
			return ".svg"
		case "image/webp":
			return ".webp"
		default:
			return ""
		}
}

func isValidContentType(contentType string) bool {
    validTypes := map[string]bool{
        "image/jpeg": true,
        "image/jpg":  true,
        "image/png":  true,
        "image/svg":  true,
        "image/webp": true,
	}

	return validTypes[contentType]
}

func extractKeyFromImageUrl(imageUrl string) string {
	// Split the URL by "/" and get the last part before the "#"
	parts := strings.Split(imageUrl, "/")

	if len(parts) < 2 {
		return ""
	}

	// Get the last part and remove the "#t=1" if it exists
	keyWithFragment := parts[len(parts)-1]
	
	key := strings.Split(keyWithFragment, "#")[0]

	// Return the key
	return "uploads/" + key
}

func parseDueDate(dueDateStr string) (time.Time, error) {
	layout := time.RFC3339

	parsedTime, err := time.Parse(layout, dueDateStr)

	if err != nil {
		return time.Time{}, err
	}

	return parsedTime, nil
}

func (app *application) WithTx(ctx context.Context, fn func(*database.Queries) error) error {
	tx, err := app.config.db.BeginTx(ctx, nil)

    if err != nil {
        return err
    }

	// Initialize sqlc transaction handler
	qtx := database.New(tx)

	err = fn(qtx)

	if err != nil {
        if rbErr := tx.Rollback(); rbErr != nil {
            return fmt.Errorf("tx err: %v, rb err: %v", err, rbErr)
        }

        return err
    }

	return tx.Commit()
}
