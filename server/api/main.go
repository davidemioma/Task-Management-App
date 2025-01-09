// Run go mod init <app name> to initialise app
// Run "echo 'export PATH=$PATH:$(go env GOPATH)/bin' >> ~/.zshrc", "source ~/.zshrc" and "air" to start server.
// If you need a port, install "go get github.com/lpernett/godotenv", run "go mod vendor" and run "go mod tidy".
// To run a server, install "go get github.com/go-chi/chi" and "go get github.com/go-chi/cors", run "go mod vendor" and run "go mod tidy"

package main

import (
	"database/sql"
	"log"
	"os"
	"server/internal/database"

	"github.com/lpernett/godotenv"

	_ "github.com/lib/pq"
)

func main() {
	godotenv.Load(".env")

	port := os.Getenv("PORT")

	if port == ""{
	    log.Fatal("PORT not found")
	}

	bucket := os.Getenv("AWS_BUCKET_NAME")

	if bucket == ""{
	    log.Fatal("AWS_BUCKET_NAME not found")
	}

	cloudfront_url := os.Getenv("AWS_CLOUD_FRONT_STREAM_URL")

	if cloudfront_url == ""{
	    log.Fatal("AWS_CLOUD_FRONT_STREAM_URL not found")
	}

	// Postgres DB
	dbUrl := os.Getenv("DATABASE_URL")

	if dbUrl == ""{
		log.Fatal("DATABASE_URL not found")
	}

	db, err := sql.Open("postgres", dbUrl)

	if err != nil {
		log.Fatal("Can't connect to database:", err)
	}

	// Create a logger
	logger := log.New(os.Stdout, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile)

	cfg := config{
		db: db,
	}

	storage := storage{
		DB: database.New(db),
		bucket: bucket,
		cloudfront_url: cloudfront_url,
	}

	app := application{
		config: cfg,
		storage: storage,
		logger: logger,
	}

	r:= app.mount()

	log.Printf("Server running on port %v", port)

	log.Fatal(app.run("0.0.0.0:" + port, r))
}

