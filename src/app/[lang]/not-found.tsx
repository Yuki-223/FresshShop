import { ButtonLink } from "@/components/common/button-link"
import { Logo } from "@/components/layout/site-header"
import { getI18n } from "@/i18n/server"

export default async function NotFound() {
  const { t } = await getI18n()
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center">
      <Logo />
      <p className="mt-12 font-heading text-6xl font-semibold text-brand">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-ink">{t("notFound.title")}</h1>
      <p className="mt-2 text-sm text-ink-muted">{t("notFound.body")}</p>
      <ButtonLink href="/" className="mt-8">
        {t("notFound.back")}
      </ButtonLink>
    </div>
  )
}
