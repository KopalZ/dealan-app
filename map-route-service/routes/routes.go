package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/najmialifah/Dealan/map-route-service/controller"
)

// SetupRoutes mendefinisikan routing endpoint untuk map-route-service.
func SetupRoutes(r *gin.Engine, ctrl *controller.MapController) {
	// Mendukung metode GET dan POST pada endpoint /route
	r.GET("/route", ctrl.GetRoute)
	r.POST("/route", ctrl.GetRoute)
}
