package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"

	_ "github.com/lib/pq"
)

type Health struct {
	Status string `json:"status"`
}

type Course struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

var db *sql.DB

func health(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Health{Status: "ok"})
}

func courses(w http.ResponseWriter, r *http.Request) {
	// Stub - replace with real DB query
	courses := []Course{
		{ID: 1, Name: "Rust Fundamentals"},
		{ID: 2, Name: "Go Microservices"},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(courses)
}

func initDB() {
	var err error
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:lms_secure_pass_2024_change_me@localhost:5432/lms?sslmode=disable"
	}
	db, err = sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("DB connect failed:", err)
	}
	if err = db.Ping(); err != nil {
		log.Fatal("DB ping failed:", err)
	}
	log.Println("Go backend DB ready")
}

func main() {
	initDB()
	defer db.Close()

	http.HandleFunc("/health", health)
	http.HandleFunc("/api/courses", courses)
	log.Println("Go backend running on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
