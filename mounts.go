package main

import (
	"net/http"
	"path/filepath"
	"strings"
)

type Mount struct {
	Prefix string
	Dir    string
}

func defaultMounts() []Mount {
	return []Mount{
		{Prefix: "/modules/",   Dir: filepath.Join(installDir, "modules")},
		{Prefix: "/templates/", Dir: filepath.Join(installDir, "templates")},
		{Prefix: "/games/",     Dir: filepath.Join(installDir, "games")},
		{Prefix: "/cache/",     Dir: filepath.Join(dataDir, "cache")},
	}
}

type MountHandler struct {
	Mounts []Mount
}

func (h *MountHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	println(path)
	for _, m := range h.Mounts {
		if !strings.HasPrefix(path, m.Prefix) { continue }
        rel := strings.TrimPrefix(path, m.Prefix)

        if strings.Contains(rel, "..") {
            http.Error(w, "Invalid path", http.StatusBadRequest)
            return
        }

        fullPath := filepath.Join(m.Dir, rel)
        http.ServeFile(w, r, fullPath)
        return
	}

	http.NotFound(w, r)
}
