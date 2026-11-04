"use client"

/**
 * Vitacost-style header, adapted from the user's `vc-header` component (GitHub release "vc-header").
 * Changes from the original: desktop only (mobile drawer removed), links use the i18n Link
 * (locale prefix + client-side navigation), the logo / search / action icons are slots filled
 * by the server header, labels come from the dictionary, and menus close after a link is clicked.
 */
import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "@/i18n/navigation"
import type { AnnouncementConfig, NavGroup, NavItem, NavLink, SidebarPanel } from "./types"
import "./vc-header.css"

const Icon = {
  down: (
    <svg viewBox="0 0 10 6" width="10" height="6" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M1 1l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  right: (
    <svg viewBox="0 0 6 10" width="6" height="10" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M1 1l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

function Count({ n }: { n?: number }) {
  return n == null ? null : <span className="vch__count">{n}</span>
}

function SidebarMega({ panels, shopAllLabel }: { panels: SidebarPanel[]; shopAllLabel: string }) {
  const [active, setActive] = useState(0)
  const cur = panels[active] ?? panels[0]
  if (!cur) return null

  return (
    <div className="vch__mega vch__mega--sidebar">
      <ul className="vch__sidebar">
        {panels.map((p, i) => (
          <li key={p.label}>
            <Link
              href={p.href}
              className={`vch__sidebar-link${i === active ? " is-active" : ""}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
            >
              <span>{p.label}</span>
              <span className="vch__chev">{Icon.right}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="vch__panel">
        <div className="vch__panel-head">
          <p className="vch__panel-title">{cur.heading}</p>
          {cur.shopAll && (
            <Link className="vch__chip" href={cur.shopAll}>
              {shopAllLabel}
            </Link>
          )}
        </div>
        <div className="vch__columns">
          {cur.links.map((l) => (
            <Link className="vch__col-link" href={l.href} key={l.href}>
              {l.label}
              <Count n={l.count} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function ColumnsMega({ groups }: { groups: NavGroup[] }) {
  return (
    <div className={`vch__mega vch__mega--columns${groups.length > 2 ? " has-3" : ""}`}>
      {groups.map((g) => (
        <div className="vch__group" key={g.title}>
          {g.href ? (
            <Link className="vch__group-title" href={g.href}>
              {g.title}
            </Link>
          ) : (
            <p className="vch__group-title">{g.title}</p>
          )}
          <ul className="vch__group-list">
            {g.links.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>
                  {l.label}
                  <Count n={l.count} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function CondensedMega({ links, width }: { links: NavLink[]; width?: number }) {
  return (
    <div className="vch__mega vch__mega--condensed" style={width ? { width } : undefined}>
      <ul className="vch__condensed-list">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href}>
              {l.label}
              <Count n={l.count} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Mega({ item, shopAllLabel }: { item: NavItem; shopAllLabel: string }) {
  if (!item.menu) return null
  if (item.menu.type === "sidebar") return <SidebarMega panels={item.menu.panels} shopAllLabel={shopAllLabel} />
  if (item.menu.type === "columns") return <ColumnsMega groups={item.menu.groups} />
  return <CondensedMega links={item.menu.links} width={item.menu.width} />
}

export interface VcHeaderProps {
  navItems: NavItem[]
  announcement?: AnnouncementConfig
  logo: React.ReactNode
  search: React.ReactNode
  /** account / language / cart */
  actions: React.ReactNode
  navLabel: string
  shopAllLabel: string
  /** pin the bar + nav to the top once scrolled past (default on) */
  sticky?: boolean
}

export function VcHeader({ navItems, announcement, logo, search, actions, navLabel, shopAllLabel, sticky = true }: VcHeaderProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [stickyH, setStickyH] = useState(0)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const pinnedRef = useRef(false)
  const anchorRef = useRef(0)

  const open = useCallback((i: number) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenIndex(i)
  }, [])

  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpenIndex(null), 140)
  }, [])

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  // sticky: once scrolled past its original position the bar becomes fixed;
  // a same-height placeholder keeps the page from jumping
  useEffect(() => {
    if (!sticky) return
    const el = stickyRef.current
    if (!el) return

    const measure = () => {
      // while fixed, getBoundingClientRect().top is 0 — only sample the anchor when not pinned
      if (!pinnedRef.current) anchorRef.current = el.getBoundingClientRect().top + window.scrollY
      setStickyH(el.offsetHeight)
    }
    const onScroll = () => {
      const should = window.scrollY > anchorRef.current
      if (should !== pinnedRef.current) {
        pinnedRef.current = should
        setPinned(should)
      }
      setScrolled(window.scrollY > 4)
    }

    measure()
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", measure)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", measure)
    }
  }, [sticky])

  // Esc or a click outside closes the open menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenIndex(null)
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpenIndex(null)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onClick)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onClick)
    }
  }, [])

  // client-side navigation keeps the header mounted, so close the menu when a link inside it is clicked
  const closeOnLink = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a")) setOpenIndex(null)
  }

  return (
    <div className="vch" ref={rootRef}>
      {announcement && (
        <div className="vch__announce">
          <div className="vch__announce-inner">
            <Link className="vch__announce-text" href={announcement.href ?? "/"}>
              {announcement.text}
              <span className="vch__announce-arrow" aria-hidden="true">
                →
              </span>
            </Link>
            {announcement.actionLabel && (
              <Link className="vch__announce-action" href={announcement.actionHref ?? "/"}>
                {announcement.actionLabel}
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="vch__sticky-slot" style={pinned ? { height: stickyH } : undefined}>
        <div
          ref={stickyRef}
          className={`vch__sticky${sticky ? " is-sticky" : ""}${pinned ? " is-pinned" : ""}${scrolled ? " is-scrolled" : ""}`}
        >
          <header className="vch__bar">
            <div className="vch__logo">{logo}</div>
            {search}
            <div className="vch__actions">{actions}</div>
          </header>

          <nav className="vch__nav" aria-label={navLabel}>
            <ul className="vch__menu">
              {navItems.map((item, i) => (
                <li
                  key={item.label}
                  className="vch__menu-item"
                  onMouseEnter={() => item.menu && open(i)}
                  onMouseLeave={scheduleClose}
                >
                  {item.menu ? (
                    <button
                      type="button"
                      className={`vch__menu-link${item.accent ? " is-accent" : ""}${openIndex === i ? " is-open" : ""}`}
                      aria-expanded={openIndex === i}
                      onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    >
                      {item.label}
                      <span className={`vch__caret${openIndex === i ? " is-up" : ""}`}>{Icon.down}</span>
                    </button>
                  ) : (
                    <Link className={`vch__menu-link${item.accent ? " is-accent" : ""}`} href={item.href}>
                      {item.label}
                    </Link>
                  )}

                  {item.menu && openIndex === i && (
                    <div className="vch__mega-wrap" onMouseEnter={cancelClose} onMouseLeave={scheduleClose} onClick={closeOnLink}>
                      <Mega item={item} shopAllLabel={shopAllLabel} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  )
}
