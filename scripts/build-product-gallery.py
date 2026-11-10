#!/usr/bin/env python3
"""Build the product photos from the collected Metagenics image set (2026-10-31 collection).

    python3 scripts/build-product-gallery.py <collection>/2026-10-31 [--cache DIR]

For every product of src/lib/data/metagenics/catalog.json it takes the image gallery of the
default size (assets/detail-manifest.json, source order; 120px thumbnails folded into their big
version) and sorts each image:

  front       the first big transparent cut-out (else the first image): the main photo
  facts       "Supplement / Nutrition Facts" label           ┐
  directions  "Take 2 tablets daily", "2 scoops per day" …   ├ photo gallery (neutral)
  photo       no headline on a light background (pill in a   ┘
              hand, sachet, allergen icons)
  promo       everything else: benefit call-outs, customer quotes, doctor portraits, claim
              badges → "From the Brand" on the product page

Facts / directions are recognised from the headline (top third of the image, tesseract OCR);
the result was checked by eye on contact sheets and the few misses are fixed in OVERRIDES.
Small "#1 Doctor Recommended" cut-outs (badges) are dropped.

Writes
  public/products/<slug>.jpg               main photo, 800px, shadow removed, white background
  public/products/<slug>/g<n>.webp         gallery photos, 1000px
  public/products/<slug>/p<n>.webp         brand images, 1000px
  public/products/<slug>/v-<sku>.jpg       front photo of another size / flavour, 800px
  src/lib/data/metagenics/product-gallery.json   {slug: {gallery: [...], promo: [...]}}
  src/lib/data/metagenics/product-images.json    where each main photo came from

Needs Pillow and the tesseract command. --cache keeps per-image results between runs.
Afterwards run `pnpm import:metagenics` in backend/ to upload the new main photos.
"""
import argparse, json, os, re, shutil, subprocess, sys
from concurrent.futures import ProcessPoolExecutor
from importlib.machinery import SourceFileLoader
from pathlib import Path
from PIL import Image, ImageStat

REPO = Path(__file__).resolve().parent.parent
clean = SourceFileLoader("clean_product_image", str(REPO / "scripts/clean-product-image.py")).load_module().clean

FACTS = re.compile(r"(supplement|nutrition|nutritional)\s*f\s*a\s*c\s*t\s*s|medical\s*food\s*facts|serving\s*size", re.I)
DIRECTIONS = re.compile(
    r"\btake\s+(\d|one|two|three|1-2|up)\b|\b\d\s*-?\s*scoops?\b|\bscoops?\b.*\b(day|daily)\b|\bmix\b.*\b(water|scoop)"
    r"|\bper\s+day\b|\bdaily\b.*\b(tablet|capsule|softgel|chew)",
    re.I,
)
# (slug, index in the de-duplicated gallery) → kind; found by looking at the contact sheets
OVERRIDES = {
    ("magactive-magnesium-night-powder", 10): "promo",  # "Up to 9 hours of sleep in one box"
    # "Clinically tested / studied / proven" badges and claims without a headline
    ("bone-builder-prime", 5): "promo",
    ("chasteberry-plus", 4): "promo",
    ("endura-electrolyte-powder", 4): "promo",
    ("gi-sustain", 3): "promo",
    ("hemagenics", 4): "promo",
    ("immune-active", 5): "promo",
    ("omegagenics-fish-oil-epa-dha-500", 5): "promo",
    ("tran-q-sleep", 5): "promo",
    ("ultra-potent-c-1000-vitamin-c", 9): "promo",
    ("ultraclear-plus-detox-powder", 4): "promo",
}

ROOT = Path()
CACHE = None


def on_white(path):
    im = Image.open(path).convert("RGBA")
    bg = Image.new("RGBA", im.size, "white")
    bg.alpha_composite(im)
    return bg.convert("RGB")


def meta(rel):
    c = CACHE and CACHE / (Path(rel).name + ".meta")
    if c and c.exists():
        return json.loads(c.read_text())
    im = Image.open(ROOT / rel)
    cut = im.mode in ("RGBA", "LA", "P") and im.convert("RGBA").getchannel("A").getextrema()[0] < 250
    small = on_white(ROOT / rel).convert("L").resize((32, 32))
    m = {"w": max(im.size), "cut": cut, "sig": list(small.getdata())}
    if c:
        c.write_text(json.dumps(m))
    return m


def headline(rel):
    """OCR of the top third (where the headline is), at 900px."""
    c = CACHE and CACHE / (Path(rel).name + ".txt")
    if c and c.exists():
        return c.read_text()
    g = on_white(ROOT / rel).convert("L")
    g.thumbnail((900, 900))
    g = g.crop((0, 0, g.width, int(g.height * 0.32)))
    tmp = f"/tmp/gallery-ocr-{os.getpid()}.png"
    g.save(tmp)
    try:
        t = subprocess.run(["tesseract", tmp, "-", "--psm", "6"], capture_output=True, text=True, timeout=40,
                           env={**os.environ, "OMP_THREAD_LIMIT": "1"}).stdout
    except subprocess.TimeoutExpired:
        t = ""
    if c:
        c.write_text(t)
    return t


def light(rel):
    im = Image.open(ROOT / rel).convert("L")
    im.thumbnail((200, 200))
    return ImageStat.Stat(im).mean[0] > 205


def dist(a, b):
    return sum(abs(x - y) for x, y in zip(a, b)) / len(a)


def main():
    global ROOT, CACHE
    ap = argparse.ArgumentParser()
    ap.add_argument("collection")
    ap.add_argument("--cache")
    args = ap.parse_args()
    ROOT = Path(args.collection)
    if args.cache:
        CACHE = Path(args.cache)
        CACHE.mkdir(parents=True, exist_ok=True)

    catalog = json.loads((REPO / "src/lib/data/metagenics/catalog.json").read_text())["products"]
    manifest = json.loads((ROOT / "assets/detail-manifest.json").read_text())
    downloaded = [it for it in manifest if it.get("downloadStatus") == "downloaded"]
    paths = sorted({it["localPath"] for it in downloaded})
    with ProcessPoolExecutor() as ex:
        M = dict(zip(paths, ex.map(meta, paths, chunksize=8)))

    data = REPO / "src/lib/data/metagenics"
    previous = json.loads((data / "product-images.json").read_text())
    by_slug = {p["slug"]: p for p in catalog}
    galleries = {}
    for p in catalog:
        slug, sku = p["slug"], p["variants"][0]["sku"]
        cands = sorted({(r["position"], it["localPath"]) for it in downloaded for r in it["relations"]
                        if r["role"] == "variant_gallery_image" and r["productUrl"].rstrip("/").split("/")[-1] == slug and r.get("sku") == sku})
        big = [c for c in cands if M[c[1]]["w"] >= 400]
        kept = []
        for _, path in cands:
            if M[path]["w"] < 400:  # a thumbnail stands for its big version, which takes this position
                m = min(big, key=lambda b: dist(M[b[1]]["sig"], M[path]["sig"]), default=None)
                if m and dist(M[m[1]]["sig"], M[path]["sig"]) < 10 and m[1] not in kept:
                    kept.append(m[1])
            elif path not in kept:
                kept.append(path)
        galleries[slug] = kept

    opaque = sorted({k for v in galleries.values() for k in v if not M[k]["cut"]})
    with ProcessPoolExecutor() as ex:
        T = dict(zip(opaque, ex.map(headline, opaque, chunksize=4)))

    out_gallery, out_sources = {}, {}
    pub = REPO / "public/products"
    for slug, kept in galleries.items():
        kinds, front = [], None
        for i, path in enumerate(kept):
            text = " ".join(T.get(path, "").split())
            if M[path]["cut"] and front is None and M[path]["w"] >= 800:
                k = "front"
            elif M[path]["cut"]:
                k = "promo" if M[path]["w"] >= 800 else "badge"  # small cut-outs: "#1 Doctor Recommended"
            elif FACTS.search(text):
                k = "facts"
            elif DIRECTIONS.search(text):
                k = "directions"
            elif len(re.findall(r"[A-Za-z]", text)) < 8 and light(path):
                k = "photo"
            else:
                k = "promo"
            k = OVERRIDES.get((slug, i), k)
            if k == "front":
                front = path
            kinds.append(k)
        if front is None and kept:
            front = kept[0]
            kinds[0] = "front"

        # main photo: only from a cut-out (shadow removed). Without one the collected photo has the
        # shadow baked in, so the current clean photo (Vitacost / earlier clean-up) stays.
        if M[front]["cut"]:
            img = clean(ROOT / front)
            img.thumbnail((800, 800))
            img.save(pub / f"{slug}.jpg", quality=86)
            out_sources[slug] = {"source": "metagenics-2026-10-31", "file": Path(front).name}
        else:
            out_sources[slug] = {**previous.get(slug, {}), "kept": "collected photo has a baked-in shadow"}

        folder = pub / slug
        shutil.rmtree(folder, ignore_errors=True)
        gallery, promo = [], []
        for path, k in zip(kept, kinds):
            if k in ("front", "badge"):
                continue
            target = gallery if k in ("facts", "directions", "photo") else promo
            folder.mkdir(exist_ok=True)
            name = f"{'g' if target is gallery else 'p'}{len(target) + 1}.webp"
            im = on_white(ROOT / path)
            im.thumbnail((1000, 1000))
            im.save(folder / name, quality=80)
            target.append(f"/products/{slug}/{name}")
        # other sizes / flavours: their own front photo (e.g. the 180-capsule bottle) when the
        # collection has a different cut-out for them; the rest of the gallery is shared
        variants = {}
        for v in by_slug[slug]["variants"][1:]:
            own = sorted((r["position"], it["localPath"]) for it in downloaded for r in it["relations"]
                         if r["role"] == "variant_gallery_image" and r["productUrl"].rstrip("/").split("/")[-1] == slug and r.get("sku") == v["sku"])
            vf = next((path for _, path in own if M[path]["cut"] and M[path]["w"] >= 800), None)
            if vf and vf != front:
                folder.mkdir(exist_ok=True)
                img = clean(ROOT / vf)
                img.thumbnail((800, 800))
                name = f"v-{re.sub(r'[^A-Za-z0-9_-]', '', v['sku'])}.jpg"
                img.save(folder / name, quality=86)
                variants[v["sku"]] = f"/products/{slug}/{name}"
        out_gallery[slug] = {"gallery": gallery, "promo": promo, **({"variants": variants} if variants else {})}
        print(slug, "gallery", 1 + len(gallery), "promo", len(promo), file=sys.stderr)

    (data / "product-gallery.json").write_text(json.dumps(out_gallery, indent=1) + "\n")
    (data / "product-images.json").write_text(json.dumps(out_sources, indent=1) + "\n")


if __name__ == "__main__":
    main()
