package main

import (
    "fmt"
    "flag"
)

type AppConfig struct {
	Localize bool
	RunTests bool
	AppDir   string
}

func ParseConfig() AppConfig {
	var cfg AppConfig

	flag.StringVar(&cfg.AppDir, "app-dir", "", "Application directory override")
	flag.BoolVar(&cfg.Localize, "localize", false, "Run localization mode")
	flag.BoolVar(&cfg.RunTests, "run-tests", false, "Run tests on startup")

	flag.Parse()
    fmt.Println("flags:", cfg)

	return cfg
}
