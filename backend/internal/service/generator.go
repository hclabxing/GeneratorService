package service

import (
	"errors"
	"math/rand"
	"time"
)

var (
	// ErrInvalidArgument 表示参数错误（如 min > max）
	ErrInvalidArgument = errors.New("invalid argument")
)

// GeneratorService 封装随机数与名言逻辑
// rng 使用 math/rand.Rand 以便测试自定义种子

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

// GenerateNumber 生成 [min, max] 范围内的随机整数；当 min > max 返回 ErrInvalidArgument。
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

// RandomQuote 返回一条随机名言（quotes 非空时）。
func (s *GeneratorService) RandomQuote() string {
	if len(s.quotes) == 0 {
		return ""
	}
	idx := s.rng.Intn(len(s.quotes))
	return s.quotes[idx]
}
