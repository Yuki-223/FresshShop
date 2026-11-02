import { ButtonLink } from "@/components/common/button-link"
import { Logo } from "@/components/layout/site-header"

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center">
      <Logo />
      <p className="mt-12 font-heading text-6xl font-semibold text-brand">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-ink">This page is not in our basket</h1>
      <p className="mt-2 text-sm text-ink-muted">The page you are looking for doesn&apos;t exist (yet).</p>
      <ButtonLink href="/" className="mt-8">
        Back to homepage
      </ButtonLink>
    </div>
  )
}
