#!/usr/bin/env python3
"""Remove the painted-in title / brand logo from a vitacost.com collection banner.

    python3 scripts/erase-banner-text.py in.jpg out.jpg X0 X1 [Y0 Y1]

X0..X1 (and Y0..Y1, default 0.15..0.85) are fractions of the width/height that contain the
text. Inside that box every pixel that stands out from the light background (different from a
31px median blur, saturated, or dark) is masked, the mask is dilated and filled with OpenCV's
Telea inpainting. Needs opencv-python-headless and numpy.

Used on 2026-11-06 for public/collection-banners/ (source banner → file, box):
  metagenics → herbs-softgels 0.30–0.70      nordic-naturals → fish-oil-lemon 0.33–0.67
  pure-encapsulations → capsule-bowls 0.33–0.67   life-extension → heart-dishes 0.30–0.70
  jarrow-formulas → mortar-herbs 0.28–0.72   codeage → citrus-softgels 0.335–0.665
  solaray → leaf-capsules 0.28–0.72          nutricost → beet-powder 0.28–0.72
  thorne → shaker-powder 0.28–0.72           frontier-co-op → spices 0.30–0.70
  supplements → spoons-beige 0.05–0.42       sports → dumbbells 0.03–0.40
Banners whose logo is a large solid shape (Bob's Red Mill, Garden of Life, New Chapter) leave a
smudge and were not used.
"""
import sys

import cv2
import numpy as np


def erase(src, dst, x0, x1, y0=0.15, y1=0.85, thr=22):
    im = cv2.imread(src)
    h, w = im.shape[:2]
    X0, X1, Y0, Y1 = int(w * x0), int(w * x1), int(h * y0), int(h * y1)
    bg = cv2.medianBlur(im, 31).astype(int)
    diff = np.abs(im.astype(int) - bg).max(axis=2)
    hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
    stands_out = (diff > thr) | (hsv[:, :, 1] > 60) | (hsv[:, :, 2] < 170)
    mask = np.zeros((h, w), np.uint8)
    mask[Y0:Y1, X0:X1] = stands_out[Y0:Y1, X0:X1].astype(np.uint8) * 255
    mask = cv2.dilate(mask, np.ones((9, 9), np.uint8))
    cv2.imwrite(dst, cv2.inpaint(im, mask, 9, cv2.INPAINT_TELEA), [cv2.IMWRITE_JPEG_QUALITY, 92])


if __name__ == "__main__":
    a = sys.argv
    erase(a[1], a[2], *map(float, a[3:]))
