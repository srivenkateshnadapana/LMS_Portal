package main

import (
	"context"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lib/pq"
	"github.com/redis/go-redis/v9"
	google.golang.org/api/drive/v3"
	google.golang.org/api/option"
	"golang.org/x/oauth2/google"
)

// Config
var (
	db     *sql.DB
	rdb    *redis.Client
	srv    *drive.Service
	ctx    = context.Background()
)

// Init app
func initApp() {
	// DB
	dsn := os.Getenv("DATABASE_URL")
	var err error
	db, err = sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal(err)
	}

	// Redis
	rdb = redis.NewClient(&redis.Options{Addr: "localhost:6379"})

	// Google Drive Service Account
	jsonBytes, _ := base64.StdEncoding.DecodeString(os.Getenv("GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON"))
	config, err := google.JWTConfigFromJSON(jsonBytes, drive.DriveReadonlyScope)
	if err != nil {
		log.Fatal(err)
	}
	srv, err = drive.NewService(ctx, option.WithHTTPClient(config.Client(ctx)))
	if err != nil {
		log.Fatal(err)
	}
}

func main() {
	initApp()
	defer db.Close()

	r := gin.Default()

	// Health
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Courses API
	r.GET("/api/courses", getCourses)
	r.GET("/api/courses/:id", getCourse)

	// Video Proxy - Key feature: pipe Drive stream, hide URL
	r.GET("/api/video/:fileId", proxyVideo)

	// Leaderboard (Redis)
	r.GET("/api/leaderboard/:courseId", getLeaderboard)

	r.Run(":8080")
}

// Get all courses
func getCourses(c *gin.Context) {
	rows, err := db.Query("SELECT id, title, description, instructor_id FROM courses WHERE published = true")
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var courses []map[string]interface{}
	for rows.Next() {
		var id, title, desc string
		var instructor sql.NullString
		rows.Scan(&id, &title, &desc, &instructor)
		courses = append(courses, map[string]interface{}{
			"id":          id,
			"title":       title,
			"description": desc,
			"instructor":  instructor.String,
		})
	}
	c.JSON(200, courses)
}

// Get course details + lessons
func getCourse(c *gin.Context) {
	id := c.Param("id")
	var course map[string]interface{}
	err := db.QueryRow(`
		SELECT c.id, c.title, c.description, c.google_drive_folder_id, array_agg(json_build_object('id', l.id, 'title', l.title, 'google_drive_file_id', l.google_drive_file_id)) as lessons
		FROM courses c 
		LEFT JOIN lessons l ON c.id = l.course_id 
		WHERE c.id = $1 GROUP BY c.id
	`, id).Scan(&course["id"], &course["title"], &course["description"], &course["google_drive_folder_id"], &course["lessons"])
	if err != nil {
		c.JSON(404, gin.H{"error": "Course not found"})
		return
	}
	c.JSON(200, course)
}

// Proxy Google Drive video stream
func proxyVideo(c *gin.Context) {
	fileId := c.Param("fileId")

	// Check Redis cache for direct link
	cached, err := rdb.Get(ctx, "drive:"+fileId).Result()
	if err == nil {
		c.Redirect(302, cached)
		return
	}

	// Fetch file from Drive
	file, err := srv.Files.Get(fileId).Fields("webContentLink").Do()
	if err != nil {
		c.JSON(404, gin.H{"error": "File not found in Drive"})
		return
	}

	link := file.WebContentLink
	if link == "" {
		c.JSON(500, gin.H{"error": "No download link"})
		return
	}

	// Cache for 1h
	rdb.Set(ctx, "drive:"+fileId, link, 0)

	// Proxy stream (add CORS/range support for video player)
	resp, err := http.Get(link)
	if err != nil {
		c.JSON(500, gin.H{"error": "Stream fetch failed"})
		return
	}
	defer resp.Body.Close()

	c.Header("Content-Type", resp.Header.Get("Content-Type"))
	c.Header("Accept-Ranges", "bytes")
	c.Header("Content-Range", resp.Header.Get("Content-Range"))
	c.Header("Access-Control-Allow-Origin", "*")

	c.DataFromReader(resp.StatusCode, resp.ContentLength, resp.Header.Get("Content-Type"), resp.Body, nil)
}

// Leaderboard from Redis (fallback to DB)
func getLeaderboard(c *gin.Context) {
	courseId := c.Param("courseId")
	// Redis sorted set
	keys, err := rdb.ZRevRange(ctx, "leaderboard:"+courseId, 0, 9).Result()
	if err == nil && len(keys) > 0 {
		c.JSON(200, keys)
		return
	}

	// Fallback DB
	rows, _ := db.Query("SELECT user_id, points FROM leaderboards WHERE course_id = $1 ORDER BY points DESC, rank LIMIT 10", courseId)
	var lb []map[string]interface{}
	for rows.Next() {
		var user, pts string
		rows.Scan(&user, &pts)
		lb = append(lb, map[string]interface{}{"user_id": user, "points": pts})
	}
	c.JSON(200, lb)
}

