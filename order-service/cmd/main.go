package main

import (
	"github.com/najmialifah/Dealan/order-service/controller"
	"github.com/najmialifah/Dealan/order-service/repository"
	"github.com/najmialifah/Dealan/order-service/routes"
	"github.com/najmialifah/Dealan/order-service/service"
	"github.com/najmialifah/Dealan/order-service/models"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// 1. Initialize DB
	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:password@localhost:5432/dealan?sslmode=disable"
	}
	db, err := gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		log.Fatalf("[Order Service] Gagal terhubung ke database: %v", err)
	}
	
	// Auto Migrate
	err = db.AutoMigrate(&models.Order{})
	if err != nil {
		log.Fatalf("[Order Service] Gagal migrasi database: %v", err)
	}

	// 2. Dependency injection
	repo := repository.NewOrderRepository(db)
	svc := service.NewOrderService(repo, nil, "")
	ctrl := controller.NewOrderController(svc)

	// 3. Setup router
	router := gin.Default()
	routes.SetupRoutes(router, ctrl)

	// 4. Run server
	port := os.Getenv("PORT")
	if port == "" {
		port = "3004" // Port resmi sesuai kong.yml
	}
	log.Printf("[Order Service] Berjalan di port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("[Order Service] Gagal menjalankan server: %v", err)
	}
}
