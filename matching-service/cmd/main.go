package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/najmialifah/Dealan/matching-service/controller"
	"github.com/najmialifah/Dealan/matching-service/repository"
	"github.com/najmialifah/Dealan/matching-service/routes"
	"github.com/najmialifah/Dealan/matching-service/service"
	"github.com/segmentio/kafka-go"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// 1. Baca Konfigurasi dari Environment Variables
	port := os.Getenv("PORT")
	if port == "" {
		port = "3005" // Port resmi sesuai kong.yml
	}

	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:password@localhost:5432/dealan?sslmode=disable"
	}

	kafkaBrokers := os.Getenv("KAFKA_BROKERS")
	if kafkaBrokers == "" {
		kafkaBrokers = "localhost:9092"
	}

	// 2. SETUP DATABASE (PostgreSQL)
	log.Println("Menghubungkan ke PostgreSQL di:", dbURL)
	db, err := gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		log.Println("[Warning] Gagal connect Database:", err)
	} else {
		log.Println("[Info] Berhasil connect ke Database PostgreSQL")
	}

	// 3. SETUP KAFKA PRODUCER
	kafkaWriter := &kafka.Writer{
		Addr:     kafka.TCP(kafkaBrokers),
		Topic:    "order.matched",
		Balancer: &kafka.LeastBytes{},
	}
	defer kafkaWriter.Close()

	// 4. WIRING (Merakit Clean Architecture)
	repo := repository.NewMatchingRepository(db)
	svc := service.NewMatchingService(repo, kafkaWriter, "order.matched")
	ctrl := controller.NewMatchingController(svc)

	// 5. SETUP ROUTER GIN
	router := gin.Default()

	// Endpoint Health Check
	router.GET("/matching/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "matching-service",
		})
	})

	// 6. DAFTARKAN ROUTES DARI FOLDER ROUTES
	routes.SetupRoutes(router, ctrl)

	// 7. JALANKAN SERVER
	log.Printf("Matching Service berjalan di port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Gagal menjalankan server: ", err)
	}
}