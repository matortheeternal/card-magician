package main

import (
    "os"
	"path/filepath"
	"context"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx context.Context
	cfg AppConfig
}

type DirectoryEntry struct {
	Path  string `json:"path"`
	IsDir bool   `json:"isDir"`
}

type FileStats struct {
	IsFile bool  `json:"isFile"`
	IsDir  bool  `json:"isDir"`
	Size   int64 `json:"size"`
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
	fullPath, err := resolveAppPath(path)
	if err != nil {
		return "", err
	}
	data, err := os.ReadFile(fullPath)
	if err != nil {
		return "", err
	}

	return string(data), nil
}

func (a *App) WriteFile(path string, data string) error {
	fullPath, err := resolveAppPath(path)
	if err != nil {
		return err
	}

	return os.WriteFile(fullPath, []byte(data), 0644)
}

func (a *App) ReadBinaryFile(path string) ([]byte, error) {
	fullPath, err := resolveAppPath(path)
	if err != nil {
		return nil, err
	}

	return os.ReadFile(fullPath)
}

func (a *App) WriteBinaryFile(path string, data []byte) error {
	fullPath, err := resolveAppPath(path)
	if err != nil {
		return err
	}

	return os.WriteFile(fullPath, data, 0644)
}

func (a *App) ReadDirectory(path string) ([]DirectoryEntry, error) {
	fullPath, err := resolveAppPath(path)
	if err != nil {
		return nil, err
	}

	entries, err := os.ReadDir(fullPath)
	if err != nil {
		return nil, err
	}

	result := make([]DirectoryEntry, 0, len(entries))
	for _, entry := range entries {
		result = append(result, DirectoryEntry{
			Path:  filepath.ToSlash(filepath.Join(path, entry.Name())),
			IsDir: entry.IsDir(),
		})
	}

	return result, nil
}

func (a *App) GetStats(path string) (*FileStats, error) {
	fullPath, err := resolveAppPath(path)
	if err != nil {
		return nil, err
	}

	info, err := os.Stat(fullPath)
	if err != nil {
		return nil, err
	}

	return &FileStats{
		IsFile: info.Mode().IsRegular(),
		IsDir:  info.IsDir(),
		Size:   info.Size(),
	}, nil
}

func (a *App) CreateDirectory(path string) error {
	fullPath, err := resolveAppPath(path)
	if err != nil {
		return err
	}

	return os.MkdirAll(fullPath, 0755)
}

func (a *App) GetAbsolutePath(path string) (string, error) {
	return resolveAppPath(path)
}

func (a *App) OpenFileDialog(title string, filters []runtime.FileFilter) (string, error) {
	selection, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title:      title,
		Filters:    filters,
	})
	if err != nil {
		return "", err
	}

	return selection, nil
}

func (a *App) SaveFileDialog(title, defaultPath string, filters []runtime.FileFilter) (string, error) {
    defaultDirectory := filepath.Dir(defaultPath)
    defaultFilename := filepath.Base(defaultPath)
	return runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:              title,
		DefaultDirectory:   defaultDirectory,
	    DefaultFilename:    defaultFilename,
		Filters:            filters,
	})
}

func (a *App) GetAppDir() string {
    return installDir
}

func (a *App) GetDataDir() string {
    return dataDir
}
