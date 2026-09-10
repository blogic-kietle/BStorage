package wails

import (
	"os"
	"testing"

	"github.com/wailsapp/wails/v3/pkg/updater"
	"github.com/wailsapp/wails/v3/pkg/updater/providers/github"
)

func TestMatchAsset(t *testing.T) {
	assets := []github.ReleaseAsset{{Name: "Soteria-0.2.0-macOS-apple-silicon.dmg"}, {Name: "Soteria-0.2.0-Windows-x64-Setup.exe"}, {Name: "Soteria-0.2.0-windows-amd64.zip"}, {Name: "Soteria-0.2.0-darwin-arm64.zip"}, {Name: "SHA256SUMS.txt"}}
	for req, want := range map[updater.CheckRequest]int{{Platform: "darwin", Arch: "arm64"}: 3, {Platform: "windows", Arch: "amd64"}: 2, {Platform: "linux", Arch: "amd64"}: -1} {
		if got := matchAsset(req, assets); got != want {
			t.Errorf("%s/%s: got %d, want %d", req.Platform, req.Arch, got, want)
		}
	}
}

func TestWritableDir(t *testing.T) {
	if !writableDir(t.TempDir()) {
		t.Fatal("temp dir should be writable")
	}
	ro := t.TempDir()
	os.Chmod(ro, 0o500)
	if os.Getuid() != 0 && writableDir(ro) {
		t.Fatal("read-only dir should not be writable")
	}
}
