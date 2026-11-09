import Image from "next/image"
import { getI18n } from "@/i18n/server"

/**
 * The brand's own marketing images (benefit and ingredient call-outs, customer quotes, badges),
 * kept out of the photo gallery so it stays clean: a "From the brand" block above "Details",
 * two square images per row. The wording on them is the manufacturer's, shown as collected.
 */
export async function ProductPromo({ images, title }: { images: string[]; title: string }) {
  const { t } = await getI18n()
  if (!images.length) return null
  return (
    <section className="mt-14" aria-labelledby="promo-heading">
      <h2 id="promo-heading" className="text-center text-2xl leading-[31px] font-bold tracking-[0.6px] text-[#121212]">
        {t("productPage.fromTheBrand")}
      </h2>
      <p className="mt-1 text-center text-xs text-[#121212]/55">{t("productPage.fromTheBrandNote")}</p>
      <ul className="mx-auto mt-5 grid max-w-[1000px] grid-cols-2 gap-3">
        {images.map((src, i) => (
          <li key={src} className="relative aspect-square overflow-hidden bg-[#f7f7f7]">
            <Image src={src} alt={`${title} – ${i + 1}`} fill sizes="500px" className="object-cover" />
          </li>
        ))}
      </ul>
    </section>
  )
}
