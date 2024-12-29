package main

import (
	"io"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

func generatePresignedURL(bucket string, key string, body io.ReadSeeker) (string, error) {
	sess, err := session.NewSession(&aws.Config{
        Region: aws.String("eu-west-2")},
    )

	if err != nil {
        return "", err
    }

	svc := s3.New(sess)

	req, reqErr := svc.PutObjectRequest(&s3.PutObjectInput{
        Bucket: aws.String(bucket),
        Key:    aws.String(key),
        Body:   body,
    })

	if reqErr != nil {
        return "", err
    }

	url, urlErr := req.Presign(15 * time.Minute)

	if urlErr != nil {
        return "", err
    }

	return url, nil
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
   