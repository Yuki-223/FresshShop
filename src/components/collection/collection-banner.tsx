import Image from "next/image"

/**
 * Collection banner in the spirit of vitacost.com's (theirs are photos with the title painted in,
 * 1300×317): a light panel with the collection name in Roboto Slab on the left and up to three
 * product shots on the right (the first products of the list); with none the banner shows the title alone.
 */
export function CollectionBanner({ title, subtitle, images }: { title: string; subtitle?: string; images: string[] }) {
  const shots = images.slice(0, 3)
  return (
    <div className="relative flex h-[330px] items-center overflow-hidden bg-[#f3f4f1]">
      <div className="relative z-10 max-w-[560px] pl-16">
        <h1 className="text-[56px] leading-[1.1] font-bold text-[#121212]">{title}</h1>
        {subtitle && <p className="mt-4 font-display text-xl text-[#121212]/80">{subtitle}</p>}
      </div>
      {shots.length > 0 && (
        <div className="absolute inset-y-0 right-10 flex items-center gap-2" aria-hidden="true">
          {shots.map((src, i) => (
            <div
              key={src}
              className="relative size-[230px] overflow-hidden rounded-md bg-white shadow-[0_6px_18px_rgba(0,0,0,0.08)]"
              style={{ transform: `rotate(${[-7, 2, 8][i]}deg) translateY(${[10, -12, 14][i]}px)` }}
            >
              <Image src={src} alt="" fill sizes="230px" unoptimized={/^https?:/.test(src)} className="object-contain p-3" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
