package repository

import (
	"context"

	"github.com/najmialifah/Dealan/map-route-service/models"
)

type MapRepository interface {
	GetRoute(ctx context.Context, origin string, destination string) (*models.MapRoute, error)
	SaveRoute(ctx context.Context, route *models.MapRoute) error
}