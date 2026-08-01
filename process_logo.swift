import Cocoa

let inputPath = "/Users/garnek_matrix_sol/flood releif/helpaxomlogo.jpeg"
let badgeOutputPath = "/Users/garnek_matrix_sol/flood releif/public/helpaxom_badge.png"
let fullTransparentPath = "/Users/garnek_matrix_sol/flood releif/public/helpaxom_logo_transparent.png"

guard let image = NSImage(contentsOfFile: inputPath),
      let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    print("Failed to load image")
    exit(1)
}

let width = cgImage.width
let height = cgImage.height
print("Processing image width: \(width), height: \(height)")

// 1. Process Full Logo with Transparent Background
let colorSpace = CGColorSpaceCreateDeviceRGB()
let bytesPerPixel = 4
let bytesPerRow = bytesPerPixel * width
let rawData = UnsafeMutablePointer<UInt8>.allocate(capacity: height * bytesPerRow)
defer { rawData.deallocate() }

guard let context = CGContext(
    data: rawData,
    width: width,
    height: height,
    bitsPerComponent: 8,
    bytesPerRow: bytesPerRow,
    space: colorSpace,
    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue | CGBitmapInfo.byteOrder32Big.rawValue
) else {
    print("Failed to create CGContext")
    exit(1)
}

context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))

// Replace white/near-white pixels with transparent
for y in 0..<height {
    for x in 0..<width {
        let byteIndex = (y * bytesPerRow) + (x * bytesPerPixel)
        let r = rawData[byteIndex]
        let g = rawData[byteIndex + 1]
        let b = rawData[byteIndex + 2]
        
        // If pixel is white / near white (threshold > 230)
        if r > 230 && g > 230 && b > 230 {
            rawData[byteIndex] = 0
            rawData[byteIndex + 1] = 0
            rawData[byteIndex + 2] = 0
            rawData[byteIndex + 3] = 0 // alpha = 0
        }
    }
}

guard let transparentCGImage = context.makeImage() else {
    print("Failed to create transparent CGImage")
    exit(1)
}

let fullBitmap = NSBitmapImageRep(cgImage: transparentCGImage)
if let pngData = fullBitmap.representation(using: .png, properties: [:]) {
    try? pngData.write(to: URL(fileURLWithPath: fullTransparentPath))
    print("Saved full transparent logo to \(fullTransparentPath)")
}

// 2. Crop ONLY the circular badge emblem cleanly (x: 10, y: 15, width: 475, height: 495)
let badgeCropRect = CGRect(x: 15, y: 15, width: 475, height: 495)

if let badgeCGImage = transparentCGImage.cropping(to: badgeCropRect) {
    let badgeBitmap = NSBitmapImageRep(cgImage: badgeCGImage)
    if let pngData = badgeBitmap.representation(using: .png, properties: [:]) {
        try? pngData.write(to: URL(fileURLWithPath: badgeOutputPath))
        print("Saved clean badge emblem to \(badgeOutputPath)")
    }
}
