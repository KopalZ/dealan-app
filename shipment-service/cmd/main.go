package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	port := ":8094"
	fmt.Printf("Shipment Service is starting and running on port %s...\n", port)

	// Endpoint dasar untuk memeriksa kesehatan service
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Shipment Service is Up and Running!"))
	})

	// Endpoint dummy untuk pelacakan pengiriman (bisa dikembangkan nanti)
	http.HandleFunc("/track", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "success", "message": "Hit endpoint tracking shipment-service"}`))
	})

	// Jalankan server HTTP
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatalf("Gagal menjalankan Shipment Service: %v", err)
	}
}