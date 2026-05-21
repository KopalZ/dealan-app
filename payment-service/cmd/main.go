package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	port := ":8093"
	fmt.Printf("Payment Service is starting and running on port %s...\n", port)

	// Endpoint dasar untuk memeriksa kesehatan service
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Payment Service is Up and Running!"))
	})

	// Endpoint dummy untuk transaksi (bisa dikembangkan nanti)
	http.HandleFunc("/charge", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "success", "message": "Hit endpoint transaksi payment-service"}`))
	})

	// Jalankan server HTTP
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatalf("Gagal menjalankan Payment Service: %v", err)
	}
}