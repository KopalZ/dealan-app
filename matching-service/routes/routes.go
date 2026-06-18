package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/najmialifah/Dealan/matching-service/controller"
)

func SetupRoutes(router *gin.Engine, ctrl *controller.MatchingController) {
	matchingRoutes := router.Group("/matching")
	{
		matchingRoutes.POST("/match", ctrl.MatchDriver)
	}
}
