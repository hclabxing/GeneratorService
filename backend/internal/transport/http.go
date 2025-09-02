package transport

import (
	"encoding/json"
	"net/http"
	"time"

	"connectrpc.com/connect"
	"example.com/generator/internal/service"
)

const (
	PathGetRandomNumber            = "/GetRandomNumber"
	PathGetRandomQuote             = "/GetRandomQuote"
	PathHealth                     = "/healthz"
	headerAccessControlAllowOrigin = "Access-Control-Allow-Origin"
	headerAccessControlAllowHeaders = "Access-Control-Allow-Headers"
	headerAccessControlAllowMethods = "Access-Control-Allow-Methods"
)

type GetRandomNumberRequest struct {
	Min int64 `json:"min"`
	Max int64 `json:"max"`
}

type GetRandomNumberResponse struct {
	Value int64 `json:"value"`
}

type GetRandomQuoteRequest struct{}

type GetRandomQuoteResponse struct {
	Quote string `json:"quote"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

// NewMux 创建并返回 HTTP 路由。
func NewMux(svc *service.GeneratorService) *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc(PathGetRandomNumber, func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.Header().Set("Allow", http.MethodPost)
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		var in GetRandomNumberRequest
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "invalid JSON"})
			return
		}
		v, err := svc.GenerateNumber(in.Min, in.Max)
		if err != nil {
			if err == service.ErrInvalidArgument {
				err = connect.NewError(connect.CodeInvalidArgument, err)
			}
			if ce, ok := err.(*connect.Error); ok {
				switch ce.Code() {
				case connect.CodeInvalidArgument:
					writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: ce.Message()})
				default:
					writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: ce.Message()})
				}
				return
			}
			writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
			return
		}
		writeJSON(w, http.StatusOK, GetRandomNumberResponse{Value: v})
	})
	mux.HandleFunc(PathGetRandomQuote, func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.Header().Set("Allow", http.MethodPost)
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		q := svc.RandomQuote()
		writeJSON(w, http.StatusOK, GetRandomQuoteResponse{Quote: q})
	})
	mux.HandleFunc(PathHealth, func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	})
	return mux
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

// WithCORS 简单 CORS 中间件（开发环境）。
func WithCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set(headerAccessControlAllowOrigin, "*")
		w.Header().Set(headerAccessControlAllowHeaders, "*")
		w.Header().Set(headerAccessControlAllowMethods, "POST, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// Logging 简单访问日志中间件。
func Logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		_ = start // keep timestamp; real app could log with a logger
	})
}
