package main

import (
    "os"
	"path/filepath"
	"context"
)

type App struct {
	ctx context.Context
	cfg AppConfig
}

func NewApp(cfg AppConfig) *App {
	return &App{
	    cfg: cfg,
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) GetConfig() AppConfig {
	return a.cfg
}

func (a *App) ReadFile(path string) (string, error) {
	data, err := os.ReadFile(path)
	return string(data), err
}

func (a *App) WriteFile(path string, data string) error {
	return os.WriteFile(path, []byte(data), 0644)
}

func (a *App) ReadBinaryFile(path string) ([]byte, error) {
	return os.ReadFile(path)
}

func (a *App) WriteBinaryFile(path string, data []byte) error {
	return os.WriteFile(path, data, 0644)
}

func (a *App) ReadDirectory(path string) ([]os.DirEntry, error) {
	return os.ReadDir(path)
}

func (a *App) GetStats(path string) (os.FileInfo, error) {
	return os.Stat(path)
}

func (a *App) CreateDirectory(path string) error {
	return os.MkdirAll(path, 0755)
}

func (a *App) GetAbsolutePath(path string) (string, error) {
	return filepath.Abs(path)
}
