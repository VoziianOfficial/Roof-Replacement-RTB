#!/usr/bin/env swift
import Foundation
import CoreImage
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

struct Args {
    var inputPath: String
    var outputPath: String
    var radius: Double = 2.0
    var intensity: Double = 0.45
    var contrast: Double = 1.04
    var saturation: Double = 1.02
    var quality: Double = 0.92
}

func die(_ message: String) -> Never {
    fputs("error: \(message)\n", stderr)
    exit(1)
}

func parseArgs() -> Args {
    var argv = CommandLine.arguments
    _ = argv.removeFirst()
    guard argv.count >= 2 else {
        die("Usage: sharpen-image.swift <input.jpg> <output.jpg> [--radius N] [--intensity N] [--contrast N] [--saturation N] [--quality 0..1]")
    }

    var a = Args(inputPath: argv[0], outputPath: argv[1])
    var i = 2
    while i < argv.count {
        let flag = argv[i]
        func takeValue() -> String {
            guard i + 1 < argv.count else { die("Missing value for \(flag)") }
            let v = argv[i + 1]
            i += 2
            return v
        }

        switch flag {
        case "--radius":
            a.radius = Double(takeValue()) ?? a.radius
        case "--intensity":
            a.intensity = Double(takeValue()) ?? a.intensity
        case "--contrast":
            a.contrast = Double(takeValue()) ?? a.contrast
        case "--saturation":
            a.saturation = Double(takeValue()) ?? a.saturation
        case "--quality":
            a.quality = Double(takeValue()) ?? a.quality
        default:
            die("Unknown arg: \(flag)")
        }
    }
    return a
}

let args = parseArgs()

let inputURL = URL(fileURLWithPath: args.inputPath)
let outputURL = URL(fileURLWithPath: args.outputPath)

let options: [CIImageOption: Any] = [
    .applyOrientationProperty: true
]

guard var image = CIImage(contentsOf: inputURL, options: options) else {
    die("Failed to read image: \(args.inputPath)")
}

let originalExtent = image.extent

// 1) Gentle contrast/saturation bump for perceived crispness.
if let controls = CIFilter(name: "CIColorControls") {
    controls.setValue(image, forKey: kCIInputImageKey)
    controls.setValue(args.contrast, forKey: kCIInputContrastKey)
    controls.setValue(args.saturation, forKey: kCIInputSaturationKey)
    if let out = controls.outputImage {
        image = out
    }
}

// 2) Unsharp mask (subtle) to increase edge clarity without harsh halos.
if let unsharp = CIFilter(name: "CIUnsharpMask") {
    unsharp.setValue(image, forKey: kCIInputImageKey)
    unsharp.setValue(args.radius, forKey: kCIInputRadiusKey)
    unsharp.setValue(args.intensity, forKey: kCIInputIntensityKey)
    if let out = unsharp.outputImage {
        image = out
    }
}

// Some CoreImage filters may produce an "infinite" extent. Keep the render stable.
if !originalExtent.isInfinite {
    // Clamp first to avoid transparent/undefined edges, then crop back.
    image = image.clampedToExtent().cropped(to: originalExtent)
}

let context = CIContext(options: [
    // Software renderer is more reliable in sandboxed CLI environments.
    .useSoftwareRenderer: true
])

let finalOutputURL: URL
let shouldReplaceInPlace = inputURL.standardizedFileURL == outputURL.standardizedFileURL
if shouldReplaceInPlace {
    let dir = outputURL.deletingLastPathComponent()
    let tmp = dir.appendingPathComponent(".tmp-sharpen-\(UUID().uuidString).jpg")
    finalOutputURL = tmp
} else {
    finalOutputURL = outputURL
}

let q = max(0.0, min(1.0, args.quality))

let renderExtent = originalExtent.isInfinite ? image.extent : originalExtent
guard let cg = context.createCGImage(image, from: renderExtent) else {
    die("Failed to render image")
}

guard let dest = CGImageDestinationCreateWithURL(finalOutputURL as CFURL, UTType.jpeg.identifier as CFString, 1, nil) else {
    die("Failed to create destination for: \(finalOutputURL.path)")
}

let props: [CFString: Any] = [
    kCGImageDestinationLossyCompressionQuality: q
]
CGImageDestinationAddImage(dest, cg, props as CFDictionary)

guard CGImageDestinationFinalize(dest) else {
    die("Failed to write JPEG: \(finalOutputURL.path)")
}

if shouldReplaceInPlace {
    do {
        // Atomic-ish replacement on the same filesystem.
        try FileManager.default.replaceItemAt(outputURL, withItemAt: finalOutputURL)
    } catch {
        die("Failed to replace original image: \(error)")
    }
}

print("ok: wrote \(outputURL.path)")
