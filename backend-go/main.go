package main

import (
	"log"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Health struct {
	Status string `json:"status"`
}

type User struct {
	gorm.Model
	Phone        string `gorm:"uniqueIndex;size:20" json:"phone"`
	Email        string `gorm:"unique;size:255" json:"email,omitempty"`
	PasswordHash string `gorm:"size:255" json:"-"`
	Role         string `gorm:"default:student" json:"role"`
}

type Claims struct {
	UserID string `json:"user_id"`
	jwt.RegisteredClaims
}

type Course struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

var DB *gorm.DB

func health(c *gin.Context) {
	c.JSON(http.StatusOK, Health{Status: "ok"})
}

func courses(c *gin.Context) {
	// Stub - replace with real GORM query
	coursesList := []Course{
		{ID: 1, Name: "Rust Fundamentals"},
		{ID: 2, Name: "Go Microservices"},
	}
	c.JSON(http.StatusOK, coursesList)
}

func register(c *gin.Context) {
	var req struct {
		Phone    string `json:"phone" binding:"required"`
		Password string `json:"password" binding:"required,min=8"`
		Email    string `json:"email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if !phoneRegex.MatchString(req.Phone) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid phone format (E.164)"})
		return
	}

	// Check if phone exists
	var existing User
	if err := DB.Where("phone = ?", req.Phone).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Phone already registered"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Hash failed"})
		return
	}

	user := User{
		Phone:        req.Phone,
		Email:        req.Email,
		PasswordHash: string(hash),
	}

	if err := DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	token := generateToken(strconv.FormatUint(uint64(user.ID), 10))
	c.JSON(http.StatusCreated, gin.H{"token": token, "user": user})
}

func login(c *gin.Context) {
	var req struct {
		Phone    string `json:"phone" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user User
	if err := DB.Where("phone = ?", req.Phone).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token := generateToken(strconv.FormatUint(uint64(user.ID), 10))
	c.JSON(http.StatusOK, gin.H{"token": token, "user": user})
}

func generateToken(userID string) string {
	claims := Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, _ := token.SignedString([]byte(JWT_SECRET))
	return signed
}

func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(JWT_SECRET), nil
		})
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}
		c.Set("user_id", claims.UserID)
		c.Next()
	}
}

const JWT_SECRET = "lms_super_secret_change_me_32chars+"

var phoneRegex = regexp.MustCompile(`^\\+[1-9]\\d{1,14}$`)

func initDB() {
	var err error
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:lms_secure_pass_2024_change_me@localhost:5432/lms?sslmode=disable"
	}
	DB, err = gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		log.Fatal("DB connect failed:", err)
	}

	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatal("DB failed:", err)
	}
	if err = sqlDB.Ping(); err != nil {
		log.Fatal("DB ping failed:", err)
	}

	if err := DB.AutoMigrate(&User{}); err != nil {
		log.Fatal("Migration failed:", err)
	}
	log.Println("Go backend GORM DB ready, migrated")
}

func main() {
	initDB()

	r := gin.Default()
	r.GET("/health", health)
	r.GET("/api/courses", courses)

	api := r.Group("/api")
	{
		authGroup := api.Group("/auth")
		authGroup.POST("/register", register)
		authGroup.POST("/login", login)

		protected := api.Group("/protected")
		protected.Use(authMiddleware())
		protected.GET("/user", func(c *gin.Context) {
			userID := c.GetString("user_id")
			var user User
			DB.First(&user, userID)
			c.JSON(http.StatusOK, user)
		})
	}

	log.Println("Go backend Gin running on :8080")
	r.Run(":8080")
}
