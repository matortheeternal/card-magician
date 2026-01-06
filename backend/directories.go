package main

import (
    "io"
    "fmt"
	"os"
	"path/filepath"
)

var installDir, dataDir string

func ensureWritableDir(path string) error {
	return os.MkdirAll(path, 0o755)
}

func validateReadableDir(dir string) error {
	f, err := os.Open(dir)
	if err != nil {
		return err
	}
	defer f.Close()

	_, err = f.Readdir(1)
	if err != nil && err != io.EOF {
		return err
	}

	return nil
}

func isPackagedInstall(dir string) bool {
	return validateReadableDir(filepath.Join(dir, "games")) == nil
}

func resolveInstallDir(appDir string) (string, error) {
    if appDir != "" {
        return appDir, nil
    }

	exe, err := os.Executable()
	if err != nil {
	    return "", err
	}

    exeDir := filepath.Dir(exe)
    if isPackagedInstall(exeDir) {
        return exeDir, nil
    }

	return "", fmt.Errorf(
		"could not find readable runtime assets (expected 'games' directory)",
	)
}

func validateInstallDir(dir string) error {
    for _, sub := range []string{"modules", "templates", "games"} {
        path := filepath.Join(dir, sub)
        err := validateReadableDir(path)
        if err != nil {
            return fmt.Errorf("required directory '%s' is not accessible: %w", path, err)
        }
    }
    return nil
}

func InitDirectories(appName string, appDir string) error {
	dir, err := resolveInstallDir(appDir)
	if err != nil {
		return fmt.Errorf("failed to resolve install directory: %w", err)
	}

    if err := validateInstallDir(dir); err != nil {
		return fmt.Errorf("failed to validate install directory: %w", err)
    }
    fmt.Println("Using installDir:", dir)
	installDir = dir

	configDir, err := os.UserConfigDir()
	if err != nil {
		return fmt.Errorf("failed to resolve user config directory: %w", err)
	}

    dataDir = filepath.Join(configDir, appName)
    fmt.Println("Using dataDir:", dataDir)
    cacheDir := filepath.Join(dataDir, "cache", "images")
    if err := ensureWritableDir(cacheDir); err != nil {
        return fmt.Errorf("failed to initialize cache: %w", err)
    }

    return nil
}
