import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { ButtonLink } from "@/components/common/button-link"

/** Left column used on the homepage: title, list of green links and a "More …" button. */
export function LinkListSidebar({
  title,
  links,
  more,
}: {
  title: string
  links: { label: string; href: string }[]
  more?: { label: string; href: string }
}) {
  return (
    <aside className="flex flex-col">
      <h2 className="mb-4 text-lg font-semibold text-ink">{title}</h2>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-sm text-brand underline underline-offset-2 hover:text-brand-dark">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      {more && (
        <ButtonLink href={more.href} variant="soft" className="mt-10 w-fit">
          {more.label}
          <ChevronRight className="size-4" />
        </ButtonLink>
      )}
    </aside>
  )
}
