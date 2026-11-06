import Image from "next/image"
import type { CollectionBanner as Banner } from "@/lib/data/metagenics/collection-banners"

/**
 * Collection banner like vitacost.com's: a full-width photo banner (1024×250, shown at the
 * container width) with the collection name in Roboto Slab where the photo leaves space for it —
 * centred between the photos, or on the left when the photos are on the right.
 */
export function CollectionBanner({ title, subtitle, banner }: { title: string; subtitle?: string; banner: Banner }) {
  const left = banner.align === "left"
  return (
    <div className="relative aspect-[1024/250] overflow-hidden bg-[#f3f4f1]">
      <Image src={banner.src} alt="" fill priority sizes="1350px" className="object-cover" />
      <div className={`absolute inset-y-0 flex flex-col justify-center ${left ? "left-0 w-[45%] pl-[7%]" : "inset-x-[27%] items-center text-center"}`}>
        <h1 className="text-[52px] leading-[1.12] font-bold text-[#121212]">{title}</h1>
        {subtitle && <p className="mt-3 font-display text-xl text-[#121212]/75">{subtitle}</p>}
      </div>
    </div>
  )
}
