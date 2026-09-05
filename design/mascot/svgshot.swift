import Cocoa
import WebKit

let args = CommandLine.arguments
guard args.count >= 4, let px = Double(args[3]) else { exit(2) }
let srcURL = URL(fileURLWithPath: args[1])
let outURL = URL(fileURLWithPath: args[2])

let app = NSApplication.shared
app.setActivationPolicy(.prohibited)

final class Shot: NSObject, WKNavigationDelegate {
  let web: WKWebView
  let out: URL
  let px: Double
  init(px: Double, out: URL) {
    self.px = px; self.out = out
    web = WKWebView(frame: NSRect(x: 0, y: 0, width: px, height: px), configuration: WKWebViewConfiguration())
    super.init()
    web.setValue(false, forKey: "drawsBackground")
    web.navigationDelegate = self
  }
  func load(_ url: URL) throws {
    let svg = try String(contentsOf: url, encoding: .utf8)
    let head = "<style>html,body{margin:0;padding:0;background:transparent;}svg{display:block;width:\(Int(px))px;height:\(Int(px))px;}</style>"
    web.loadHTMLString(head + svg, baseURL: nil)
  }
  func webView(_ w: WKWebView, didFinish n: WKNavigation!) {
    let cfg = WKSnapshotConfiguration()
    cfg.rect = NSRect(x: 0, y: 0, width: px, height: px)
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
      w.takeSnapshot(with: cfg) { img, _ in
        guard let img else { exit(5) }
        guard let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: Int(self.px), pixelsHigh: Int(self.px),
          bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
          colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0) else { exit(6) }
        rep.size = NSSize(width: self.px, height: self.px)
        NSGraphicsContext.saveGraphicsState()
        NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
        NSGraphicsContext.current?.imageInterpolation = .high
        img.draw(in: NSRect(x: 0, y: 0, width: self.px, height: self.px))
        NSGraphicsContext.restoreGraphicsState()
        guard let data = rep.representation(using: .png, properties: [:]) else { exit(7) }
        do { try data.write(to: self.out) } catch { exit(8) }
        print("\(rep.pixelsWide)x\(rep.pixelsHigh)")
        exit(0)
      }
    }
  }
}

let shot = Shot(px: px, out: outURL)
try shot.load(srcURL)
app.run()
