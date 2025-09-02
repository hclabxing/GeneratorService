package main

import (
	"context"
	"testing"

	"connectrpc.com/connect"
)

func TestGetRandomNumber_Range(t *testing.T) {
	req := connect.NewRequest(&GetRandomNumberRequest{Min: 1, Max: 10})
	resp, err := getRandomNumber(context.Background(), req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.Msg.Value < 1 || resp.Msg.Value > 10 {
		t.Fatalf("value out of range: %d", resp.Msg.Value)
	}
}

func TestGetRandomNumber_Equal(t *testing.T) {
	req := connect.NewRequest(&GetRandomNumberRequest{Min: 5, Max: 5})
	resp, err := getRandomNumber(context.Background(), req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.Msg.Value != 5 {
		t.Fatalf("expected 5, got %d", resp.Msg.Value)
	}
}

func TestGetRandomNumber_InvalidArgs(t *testing.T) {
	req := connect.NewRequest(&GetRandomNumberRequest{Min: 10, Max: 1})
	_, err := getRandomNumber(context.Background(), req)
	if err == nil {
		t.Fatalf("expected error, got nil")
	}
	if connectErr, ok := err.(*connect.Error); ok {
		if connectErr.Code() != connect.CodeInvalidArgument {
			t.Fatalf("expected invalid argument, got %v", connectErr.Code())
		}
	} else {
		t.Fatalf("expected connect error, got %T", err)
	}
}

func TestGetRandomQuote_Basic(t *testing.T) {
	req := connect.NewRequest(&GetRandomQuoteRequest{})
	resp, err := getRandomQuote(context.Background(), req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.Msg.Quote == "" {
		t.Fatalf("empty quote")
	}
	found := false
	for _, q := range quotes {
		if q == resp.Msg.Quote {
			found = true
			break
		}
	}
	if !found {
		t.Fatalf("quote not from preset list: %q", resp.Msg.Quote)
	}
}
