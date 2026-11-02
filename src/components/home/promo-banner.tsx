import { ChevronRight } from "lucide-react"
import { ButtonLink } from "@/components/common/button-link"

export function PromoBanner({
  eyebrow,
  title,
  cta,
  href,
}: {
  eyebrow: string
  title: string
  cta: string
  href: string
}) {
  return (
    <section className="leaf-pattern flex h-[280px] flex-col justify-between rounded-xl p-8">
      <div>
        <p className="font-heading text-xs font-semibold text-brand">{eyebrow}</p>
        <h2 className="mt-2 text-[22px] font-semibold text-ink">{title}</h2>
      </div>
      <ButtonLink href={href} variant="outline" className="w-fit">
        {cta}
        <ChevronRight className="size-4 text-brand" />
      </ButtonLink>
    </section>
  )
}
