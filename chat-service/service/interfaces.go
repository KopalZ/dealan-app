package service

import (
	"context"
	"github.com/najmialifah/Dealan/chat-service/domain"
)

type ChatService interface {
	Send(ctx context.Context, req domain.ChatRequest) (*domain.ChatResponse, error)
}