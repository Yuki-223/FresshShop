import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Breadcrumbs } from "@/components/common/breadcrumbs"
import { ButtonLink } from "@/components/common/button-link"
import { infoPages } from "@/lib/data/pages"

export function generateStaticParams() {
  return Object.keys(infoPages).map((page) => ({ page }))
}

export async function generateMetadata({ params }: PageProps<"/[page]">): Promise<Metadata> {
  return { title: infoPages[(await params).page]?.title ?? "Not found" }
}

export default async function InfoPage({ params }: PageProps<"/[page]">) {
  const info = infoPages[(await params).page]
  if (!info) notFound()
  return (
    <div className="container-page">
      <Breadcrumbs items={[{ label: info.title }]} />
      <div className="max-w-2xl py-12">
        <h1 className="text-[32px] font-semibold text-ink">{info.title}</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{info.intro}</p>
        <ButtonLink href="/category/all" className="mt-8">
          Browse products
        </ButtonLink>
      </div>
    </div>
  )
}
