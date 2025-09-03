package service

import (
	"errors"
	"math/rand"
	"time"
)

var (
	// ErrInvalidArgument indicates invalid arguments (e.g., min > max).
	ErrInvalidArgument = errors.New("invalid argument")
)

// GeneratorService encapsulates random number and quote logic.
// rng uses math/rand.Rand to allow custom seeds in tests.

type GeneratorService struct {
	rng    *rand.Rand
	quotes []string
}

func NewGeneratorService(quotes []string) *GeneratorService {
	return &GeneratorService{
		rng:    rand.New(rand.NewSource(time.Now().UnixNano())),
		quotes: quotes,
	}
}

// GenerateNumber returns a random integer in [min, max]; returns ErrInvalidArgument when min > max.
func (s *GeneratorService) GenerateNumber(min, max int64) (int64, error) {
	if min > max {
		return 0, ErrInvalidArgument
	}
	if min == max {
		return min, nil
	}
	v := s.rng.Int63n(max-min+1) + min
	return v, nil
}

// RandomQuote returns a random quote when quotes is non-empty.
func (s *GeneratorService) RandomQuote() string {
	if len(s.quotes) == 0 {
		return ""
	}
	idx := s.rng.Intn(len(s.quotes))
	return s.quotes[idx]
}
