package auth

import (
	"errors"
	"net/http"
	"strings"
)

func GetClerkId (headers http.Header) (string, error){
	val := headers.Get("Authorization")

	if val == "" {
		return "", errors.New("no header 'Authorization' found")
	}

	vals := strings.Split(val, " ")

	if len(vals) != 2 {
		return "", errors.New("invalid auth headers")
	}

	if vals[0] != "clerkId" {
		return "", errors.New("clerk id not found in auth headers")
	}

	return vals[1], nil
}