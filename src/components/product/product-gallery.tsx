"use client"

import Image from "next/image"
import { useState } from "react"
import { useT } from "@/i18n/client"
import { cn } from "@/lib/utils"

const VISIBLE = 6

/**
 * Product photos: the 585px white box of the product page with, when there is more than one
 * photo, a row of square thumbnails under it (6 at a time, arrows to page through the rest).
 * Clicking a thumbnail shows it in the box; "2 / 4" in the corner. Only neutral photos go here
 * (front, Supplement Facts label, directions) — the brand's marketing images are in ProductPromo.
 */
export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const t = useT()
  const [index, setIndex] = useState(0)
  const [start, setStart] = useState(0)
  const current = images[index] ?? images[0]
  const unoptimized = (src: string) => /^https?:/.test(src)
  const select = (i: number) => {
    setIndex(i)
    // keep the selected thumbnail in view
    if (i < start) setStart(i)
    else if (i >= start + VISIBLE) setStart(i - VISIBLE + 1)
  }

  return (
    <div>
      <div className="relative aspect-square border border-[#121212]/[0.05] bg-white">
        {current && <Image key={current} src={current} alt={alt} fill priority={index === 0} sizes="585px" unoptimized={unoptimized(current)} className="object-contain p-6" />}
        {images.length > 1 && (
          <p className="absolute right-3 bottom-2.5 rounded-full bg-white/85 px-2 py-0.5 text-xs text-[#6b6b6b] tabular-nums">
            {index + 1} / {images.length}
          </p>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3.5 flex items-center gap-2">
          <Arrow dir={-1} disabled={start === 0} label={t("productPage.previousImages")} onClick={() => setStart((s) => Math.max(0, s - VISIBLE))} />
          <ul className="grid flex-1 grid-cols-6 gap-2">
            {images.slice(start, start + VISIBLE).map((src, i) => {
              const n = start + i
              return (
                <li key={src}>
                  <button
                    type="button"
                    aria-label={t("productPage.showImage", { n: n + 1 })}
                    aria-current={n === index}
                    onClick={() => select(n)}
                    className={cn(
                      "relative block aspect-square w-full bg-white",
                      n === index ? "border-2 border-[#121212] p-[3px]" : "border border-[#121212]/12 p-1 hover:border-[#121212]/40",
                    )}
                  >
                    <span className="relative block size-full">
                      <Image src={src} alt="" fill sizes="90px" unoptimized={unoptimized(src)} className="object-contain" />
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          <Arrow
            dir={1}
            disabled={start + VISIBLE >= images.length}
            label={t("productPage.nextImages")}
            onClick={() => setStart((s) => Math.min(Math.max(0, images.length - VISIBLE), s + VISIBLE))}
          />
        </div>
      )}
    </div>
  )
}

function Arrow({ dir, disabled, label, onClick }: { dir: -1 | 1; disabled: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-[84px] w-[22px] shrink-0 place-items-center text-[#121212] disabled:text-[#c8c8c8]"
    >
      <svg viewBox="0 0 6 10" className={cn("h-3.5 w-2", dir < 0 && "rotate-180")} aria-hidden="true">
        <path d="M1 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
