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