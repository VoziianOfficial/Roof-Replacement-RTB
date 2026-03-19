#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np


def _read_ppm_tokens(f) -> list[bytes]:
    tokens: list[bytes] = []
    while len(tokens) < 4:
        b = f.read(1)
        if not b:
            break
        if b in b" \t\r\n":
            continue
        if b == b"#":
            f.readline()
            continue
        buf = bytearray()
        buf.extend(b)
        while True:
            c = f.read(1)
            if not c or c in b" \t\r\n":
                break
            buf.extend(c)
        tokens.append(bytes(buf))
    return tokens


def read_ppm(path: Path) -> np.ndarray:
    with path.open("rb") as f:
        tokens = _read_ppm_tokens(f)
        if len(tokens) < 4:
            raise ValueError("Invalid PPM header")
        magic, w, h, maxv = tokens[:4]
        if magic != b"P6":
            raise ValueError(f"Unsupported PPM magic: {magic!r} (expected P6)")
        width = int(w)
        height = int(h)
        maxval = int(maxv)
        if maxval != 255:
            raise ValueError(f"Unsupported maxval: {maxval} (expected 255)")

        expected = width * height * 3
        data = f.read(expected)
        if len(data) != expected:
            raise ValueError(f"Truncated PPM: expected {expected} bytes, got {len(data)}")

    img = np.frombuffer(data, dtype=np.uint8).reshape((height, width, 3))
    return img


def write_ppm(path: Path, img: np.ndarray) -> None:
    if img.dtype != np.uint8:
        raise ValueError("write_ppm expects uint8 image")
    h, w, c = img.shape
    if c != 3:
        raise ValueError("write_ppm expects 3-channel image")
    header = f"P6\n{w} {h}\n255\n".encode("ascii")
    with path.open("wb") as f:
        f.write(header)
        f.write(img.tobytes(order="C"))


def box_blur_3x3(imgf: np.ndarray) -> np.ndarray:
    # imgf: HxWx3 float32/float64
    p = np.pad(imgf, ((1, 1), (1, 1), (0, 0)), mode="edge")
    s = (
        p[:-2, :-2]
        + p[:-2, 1:-1]
        + p[:-2, 2:]
        + p[1:-1, :-2]
        + p[1:-1, 1:-1]
        + p[1:-1, 2:]
        + p[2:, :-2]
        + p[2:, 1:-1]
        + p[2:, 2:]
    )
    return s / 9.0


def unsharp_mask(img: np.ndarray, amount: float) -> np.ndarray:
    imgf = img.astype(np.float32)
    blur = box_blur_3x3(imgf)
    out = imgf + (imgf - blur) * np.float32(amount)
    out = np.clip(out, 0, 255).astype(np.uint8)
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description="Apply a gentle unsharp mask to a binary PPM (P6).")
    ap.add_argument("input", type=Path)
    ap.add_argument("output", type=Path)
    ap.add_argument("--amount", type=float, default=0.55, help="Sharpen amount (recommended 0.35..0.75)")
    ns = ap.parse_args()

    img = read_ppm(ns.input)
    out = unsharp_mask(img, ns.amount)
    write_ppm(ns.output, out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

