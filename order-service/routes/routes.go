package routes

import (
	"github.com/najmialifah/Dealan/order-service/controller"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine, orderController *controller.OrderController) {
	orderRoutes := router.Group("/orders")
	{
		// Endpoint untuk membuat order baru
		orderRoutes.POST("", orderController.CreateOrder)
	}
}
