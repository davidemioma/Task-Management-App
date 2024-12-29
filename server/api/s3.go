package main

import (
	"fmt"
	"io"
	"log"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/lpernett/godotenv"
)

func UploadToS3(bucket string, key string, body io.ReadSeeker) (error) {
	envErr := godotenv.Load(".env")

	if envErr != nil {
	    log.Fatal("Error loading .env file")
	}

	sess, err := session.NewSession(&aws.Config{
        Region: aws.String("eu-west-2"),
    })

	if err != nil {
		fmt.Printf("Could not create AWS session: %v\n", err)

        return err
    }

	svc := s3.New(sess)

	// Upload the object to S3
	_, reqErr := svc.PutObject(&s3.PutObjectInput{
        Bucket: aws.String(bucket),
        Key:    aws.String(key),
        Body:   body,
    })

	if reqErr != nil {
		fmt.Printf("PutObjectRequest Error: %v\n", reqErr)

        return fmt.Errorf("failed to create PutObjectRequest: %v", reqErr)
    }

	return nil
}

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
   