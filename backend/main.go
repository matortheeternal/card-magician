package main

import (
    "fmt"
    "os"
	"embed"
	"context"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

var assets embed.FS

func main() {
    fmt.Println("os.Args:", os.Args)
	cfg := ParseConfig()
    startupErr := InitDirectories("card-magician", cfg.AppDir)

	handler := &MountHandler{
		Mounts: defaultMounts(),
	}

	app := NewApp(cfg)

	err := wails.Run(&options.App{
		Title:  "wails-poc",
		Width:  1024,
		Height: 768,
		Frameless: true,
		AssetServer: &assetserver.Options{
			Assets: assets,
			Handler: handler,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func (ctx context.Context) {
		    if startupErr != nil {
		        runtime.MessageDialog(ctx, runtime.MessageDialogOptions{
		            Type: runtime.ErrorDialog,
		            Title: "Startup error",
		            Message: startupErr.Error(),
		        })
                runtime.Quit(ctx)
                return
		    }
		    app.startup(ctx)
		},
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
