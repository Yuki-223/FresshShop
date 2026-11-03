import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Breadcrumbs } from "@/components/common/breadcrumbs"
import { ButtonLink } from "@/components/common/button-link"
import { getI18n } from "@/i18n/server"
import { getInfoPage, infoPageSlugs } from "@/lib/api"

export function generateStaticParams() {
  return infoPageSlugs().map((page) => ({ page }))
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[page]">): Promise<Metadata> {
  const { locale } = await getI18n()
  return { title: (await getInfoPage((await params).page, locale))?.title }
}

export default async function InfoPage({ params }: PageProps<"/[lang]/[page]">) {
  const { t, locale } = await getI18n()
  const info = await getInfoPage((await params).page, locale)
  if (!info) notFound()
  return (
    <div className="container-page">
      <Breadcrumbs items={[{ label: info.title }]} />
      <div className="max-w-2xl py-12">
        <h1 className="text-[32px] font-semibold text-ink">{info.title}</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{info.intro}</p>
        <ButtonLink href="/category/all" className="mt-8">
          {t("common.browseProducts")}
        </ButtonLink>
      </div>
    </div>
  )
}
