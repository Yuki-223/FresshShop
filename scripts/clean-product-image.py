#!/usr/bin/env python3
"""Remove the soft drop shadow / reflection from a transparent product PNG and put it on white.

    python3 scripts/clean-product-image.py in.png out.jpg

Used on 2026-11-05 for the 87 products in src/lib/data/metagenics/product-images.json marked
"cleaned" (Metagenics photos with no clean Vitacost counterpart). The source PNGs are cut-outs:
the product is opaque, the shadow under it is semi-transparent. Pixels below alpha 180 are
dropped, 180–250 are ramped for smooth edges; the product is centred on a white square with a
~6 % margin. Needs Pillow. (Photos already on a white background can't be cleaned this way.)
"""
import sys
from PIL import Image


def clean(src, lo=180, hi=250):
    im = Image.open(src).convert("RGBA")
    alpha = im.getchannel("A").point(lambda v: 0 if v < lo else 255 if v >= hi else int((v - lo) * 255 / (hi - lo)))
    im.putalpha(alpha)
    im = im.crop(alpha.getbbox())
    w, h = im.size
    side = int(max(w, h) * 1.12)
    out = Image.new("RGBA", (side, side), (255, 255, 255, 255))
    out.alpha_composite(im, ((side - w) // 2, (side - h) // 2))
    return out.convert("RGB")


if __name__ == "__main__":
    clean(sys.argv[1]).save(sys.argv[2], quality=90)
