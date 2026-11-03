import { Link } from "@/i18n/navigation"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function SectionHeader({
  title,
  href,
  linkLabel = "Button",
  className,
}: {
  title: string
  href?: string
  linkLabel?: string
  className?: string
}) {
  return (
    <div className={cn("mb-8 flex items-center justify-between", className)}>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      {href && <ArrowLink href={href}>{linkLabel}</ArrowLink>}
    </div>
  )
}

export function ArrowLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-1 font-heading text-sm font-bold text-ink hover:text-brand", className)}
    >
      {children}
      <ChevronRight className="size-4 text-brand transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
