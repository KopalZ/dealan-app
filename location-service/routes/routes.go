package routes

import (
	"github.com/gin-gonic/gin"

	"github.com/najmialifah/Dealan/location-service/controller"
)

func SetupRoutes(router *gin.Engine, ctrl *controller.LocationController) {
	api := router.Group("/api/v1")
	{
		locationRoutes := api.Group("/locations")
		{
			// Endpoint driver update lokasi
			locationRoutes.POST("/update", ctrl.UpdateLocation)
			// Endpoint user mencari driver terdekat
			locationRoutes.GET("/nearby", ctrl.FindNearby)
		}
	}
}
