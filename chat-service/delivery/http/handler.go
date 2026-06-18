package http

import (
	"encoding/json"
	"net/http"

	"github.com/najmialifah/Dealan/chat-service/domain"
	"github.com/najmialifah/Dealan/chat-service/service"
)

type ChatHandler struct {
	Service service.ChatService
}

func NewChatHandler(s service.ChatService) *ChatHandler {
	return &ChatHandler{s}
}

func (h *ChatHandler) Send(w http.ResponseWriter, r *http.Request) {

	req := domain.ChatRequest{
		Message: "hello",
	}

	res, _ := h.Service.Send(r.Context(), req)

	json.NewEncoder(w).Encode(res)
}
