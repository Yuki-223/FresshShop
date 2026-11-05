import Image from "next/image"
import { Link } from "@/i18n/navigation"

export interface ExploreCircle {
  /** image in public/circles/ (vitacost.com homepage circles, 360×360) */
  image: string
  label: string
  /** locale-less store path */
  href: string
}

/**
 * "Explore More" row, as on vitacost.com (measured at 1440px): Roboto Slab 24px bold heading,
 * six 170×170 images 48px apart and centred, Helvetica 18px labels underneath.
 * The pictures are Vitacost's; labels and links are this store's categories.
 */
export function ExploreCircles({ title, items }: { title: string; items: ExploreCircle[] }) {
  return (
    <section aria-labelledby="explore-more">
      <h2 id="explore-more" className="text-center text-2xl font-bold text-ink">
        {title}
      </h2>
      <ul className="mt-[30px] flex justify-center gap-12">
        {items.map((c) => (
          <li key={c.href} className="w-[170px]">
            <Link href={c.href} className="group block text-center">
              <Image src={c.image} alt="" width={170} height={170} sizes="170px" className="size-[170px] transition-transform duration-200 group-hover:scale-[1.03]" />
              {/* our category names are longer than Vitacost's labels: let them use the 48px gaps (one line) */}
              <span className="-mx-6 mt-[30px] block text-lg tracking-[0.6px] whitespace-nowrap text-ink/75 group-hover:text-ink group-hover:underline">
                {c.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
