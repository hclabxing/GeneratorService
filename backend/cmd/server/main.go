package main

import (
	"log"
	"net/http"

	"example.com/generator/internal/service"
	"example.com/generator/internal/transport"
)

const defaultAddr = ":8080"

func main() {
	svc := service.NewGeneratorService([]string{
		"Stay hungry, stay foolish.",
		"Simplicity is the soul of efficiency.",
		"Programs must be written for people to read.",
		"The only way to do great work is to love what you do.",
		"Talk is cheap. Show me the code.",
	})

	mux := transport.NewMux(svc)
	h := transport.WithCORS(transport.Logging(mux))

	log.Printf("generator server listening on %s", defaultAddr)
	if err := http.ListenAndServe(defaultAddr, h); err != nil {
		log.Fatal(err)
	}
}
