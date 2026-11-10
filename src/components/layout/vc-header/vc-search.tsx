"use client"

import { Search } from "lucide-react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useEffect, useId, useRef, useState } from "react"
import { useI18n, useT } from "@/i18n/client"
import { Link, useRouter } from "@/i18n/navigation"
import type { Suggestion } from "@/lib/api"
import { suggest } from "@/lib/search/actions"

const HAN = /[㐀-鿿]/
/** One Chinese character ("镁") is enough; Latin needs two letters. */
const searchable = (term: string) => HAN.test(term) || term.length >= 2

type Result = { term: string; items: Suggestion[]; total: number }

/**
 * Long rounded search box (Vitacost style): searches the whole catalog. While typing it shows
 * up to 6 matching products underneath (asked 0.2s after the last key press; an older, slower
 * answer is dropped). ↑↓ choose, Enter opens the chosen product or the full results, Esc closes.
 */
export function VcSearch() {
  const { t, fmt, locale } = useI18n()
  const router = useRouter()
  const listId = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const latest = useRef(0)
  const [q, setQ] = useState(useSearchParams().get("q") ?? "")
  const [result, setResult] = useState<Result | null>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)

  const term = q.trim()
  useEffect(() => {
    if (!searchable(term)) return
    const ask = ++latest.current
    const timer = setTimeout(async () => {
      const res = await suggest(term, locale).catch(() => null)
      if (res && ask === latest.current) {
        setResult({ term, ...res })
        setActive(-1)
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [term, locale])

  // close when clicking anywhere else
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!formRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])

  // only show the answer for what is in the box now
  const shown = open && searchable(term) && result?.term === term ? result : null
  const items = shown?.items ?? []

  const close = () => {
    setOpen(false)
    setActive(-1)
    formRef.current?.querySelector("input")?.blur()
  }
  const searchAll = () => {
    close()
    router.push(term ? `/category/all?q=${encodeURIComponent(term)}` : "/category/all")
  }

  return (
    <form
      ref={formRef}
      className="vch__search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        if (shown && active >= 0 && items[active]) {
          close()
          router.push(`/product/${items[active].slug}`)
        } else searchAll()
      }}
    >
      <input
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          setOpen(true)
          setActive(-1)
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape" && shown) {
            e.preventDefault() // the browser would also empty a type="search" box
            setOpen(false)
          }
          if (!shown || !items.length) return
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault()
            const step = e.key === "ArrowDown" ? 1 : -1
            // -1 = back in the text box
            setActive((i) => ((i + step + 1 + items.length + 1) % (items.length + 1)) - 1)
          }
        }}
        placeholder={t("nav.searchPlaceholder")}
        aria-label={t("header.searchLabel")}
        role="combobox"
        aria-expanded={!!shown}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={shown && active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
      />
      <button type="submit" aria-label={t("header.search")}>
        <Search className="size-5" strokeWidth={1.6} />
      </button>

      {shown && (
        <div className="vch__suggest">
          {items.length ? (
            <>
              <ul id={listId} role="listbox" aria-label={t("header.suggestions")}>
                {items.map((p, i) => (
                  <li key={p.slug} id={`${listId}-${i}`} role="option" aria-selected={i === active} onMouseEnter={() => setActive(i)}>
                    <Link href={`/product/${p.slug}`} onClick={close} tabIndex={-1}>
                      <span className="vch__suggest-img">
                        {p.image && <Image src={p.image} alt="" fill sizes="52px" unoptimized={/^https?:/.test(p.image)} className="object-contain" />}
                      </span>
                      <span className="vch__suggest-name">
                        {p.productLine && <small>{p.productLine}</small>}
                        <Highlight text={p.title} term={term} />
                      </span>
                      <span className="vch__suggest-price">
                        {p.multiPrice && <small>{t("product.from")}</small>}
                        {fmt.price(p.price)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="vch__suggest-foot">
                <button type="button" onClick={searchAll}>
                  {t.plural("header.suggestAll", shown.total)}
                </button>
                <span>{t("header.suggestHint")}</span>
              </div>
            </>
          ) : (
            <p className="vch__suggest-none">{t("header.suggestNone", { q: term })}</p>
          )}
        </div>
      )}
    </form>
  )
}

/** Bold the typed letters in an English name (a Chinese query has no letters to bold). */
function Highlight({ text, term }: { text: string; term: string }) {
  const i = HAN.test(term) ? -1 : text.toLowerCase().indexOf(term.toLowerCase())
  if (i < 0) return <span>{text}</span>
  return (
    <span>
      {text.slice(0, i)}
      <b>{text.slice(i, i + term.length)}</b>
      {text.slice(i + term.length)}
    </span>
  )
}

/** Prerendered shell (search params are request-time). */
export function VcSearchFallback() {
  const t = useT()
  return (
    <form className="vch__search" role="search">
      <input type="search" placeholder={t("nav.searchPlaceholder")} aria-label={t("header.searchLabel")} readOnly />
      <button type="button" aria-label={t("header.search")}>
        <Search className="size-5" strokeWidth={1.6} />
      </button>
    </form>
  )
}
