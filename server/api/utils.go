package main

import "strings"

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