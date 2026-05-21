package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	port := ":8092"
	fmt.Printf("Pricing Service is starting and running on port %s...\n", port)

	// Endpoint dasar untuk memeriksa kesehatan service
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Pricing Service is Up and Running!"))
	})

	// Endpoint dummy untuk kalkulasi harga (bisa dikembangkan nanti)
	http.HandleFunc("/calculate", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "success", "message": "Hit endpoint calculate harga pricing-service"}`))
	})

	// Jalankan server HTTP
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatalf("Gagal menjalankan Pricing Service: %v", err)
	}
}