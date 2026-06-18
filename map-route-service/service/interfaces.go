package service

import (
	"context"
	"github.com/najmialifah/Dealan/map-route-service/domain"
)

type MapService interface {
	GetRoute(ctx context.Context, req domain.RouteRequest) (*domain.RouteResponse, error)
}