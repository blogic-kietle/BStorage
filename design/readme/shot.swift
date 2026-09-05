// Renders an HTML file to a PNG: shot in.html out.png width height readRoot
import Cocoa
import WebKit

let a = CommandLine.arguments
if a.count < 6 { exit(2) }
let w = Double(a[3]) ?? 0
let h = Double(a[4]) ?? 0
let app = NSApplication.shared
app.setActivationPolicy(.prohibited)

final class Shot: NSObject, WKNavigationDelegate {
  let web = WKWebView(frame: NSRect(x: 0, y: 0, width: w, height: h), configuration: WKWebViewConfiguration())
  override init() {
    super.init()
    web.setValue(false, forKey: "drawsBackground")
    web.navigationDelegate = self
    web.loadFileURL(URL(fileURLWithPath: a[1]), allowingReadAccessTo: URL(fileURLWithPath: a[5]))
  }
  func webView(_ v: WKWebView, didFinish n: WKNavigation!) {
    let cfg = WKSnapshotConfiguration()
    cfg.rect = NSRect(x: 0, y: 0, width: w, height: h)
    DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
      v.takeSnapshot(with: cfg) { img, _ in
        guard let img, let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: Int(w), pixelsHigh: Int(h), bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0) else { exit(5) }
        rep.size = NSSize(width: w, height: h)
        NSGraphicsContext.saveGraphicsState()
        NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
        NSGraphicsContext.current?.imageInterpolation = .high
        img.draw(in: NSRect(x: 0, y: 0, width: w, height: h))
        NSGraphicsContext.restoreGraphicsState()
        guard let png = rep.representation(using: .png, properties: [:]) else { exit(7) }
        try? png.write(to: URL(fileURLWithPath: a[2]))
        print("\(Int(w))x\(Int(h))")
        exit(0)
      }
    }
  }
}
let shot = Shot()
app.run()
