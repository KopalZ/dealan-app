package service

import (
	"context"
	"github.com/najmialifah/Dealan/promo-service/domain"
)

type PromoService interface {
	ApplyPromo(ctx context.Context, req domain.PromoRequest) (*domain.PromoResponse, error)
}