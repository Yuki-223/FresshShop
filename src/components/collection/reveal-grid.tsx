"use client"

import { Children, useEffect, useLayoutEffect, useRef, useState } from "react"
import "./collection.css"

const FIRST = 8 // two rows of four
const STEP = 4 // one row
const DELAY = 220 // ms between rows when several are due at once (tall screens, fast scrolling)

/**
 * Shows a page of product cards a row at a time: the first 8, then one more row of 4 each time
 * the bottom of the grid comes near the viewport, until the page (24) is complete; `footer`
 * (the page numbers) appears once every card is shown. The cards are already loaded — this is
 * a progressive reveal with a fade-up, and the images inside are lazy-loaded as usual.
 *
 * The number shown is remembered per list (sessionStorage), so going back from a product page
 * shows the same cards and the browser can restore the scroll position.
 * Give the component a `key` that changes with the page / filters to start again at 8.
 */
export function RevealGrid({ children, footer, storageKey }: { children: React.ReactNode; footer?: React.ReactNode; storageKey: string }) {
  const items = Children.toArray(children)
  const total = items.length
  const [shown, setShown] = useState(Math.min(FIRST, total))
  /** cards up to this index appear without the fade-up (the first 8, or those restored on back navigation) */
  const [animateFrom, setAnimateFrom] = useState(FIRST)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // back navigation: show as many cards as before, before the browser restores the scroll position
  useLayoutEffect(() => {
    try {
      const saved = Number(sessionStorage.getItem(`reveal:${storageKey}`))
      if (saved > FIRST) {
        const n = Math.min(saved, total)
        // sessionStorage can't be read during render (the server render must match), so the
        // restore happens here, before paint, so the browser can scroll back to the same card
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShown(n)
        setAnimateFrom(n)
      }
    } catch {}
  }, [storageKey, total])

  useEffect(() => {
    try {
      sessionStorage.setItem(`reveal:${storageKey}`, String(shown))
    } catch {}
  }, [shown, storageKey])

  // one more row whenever the bottom of the grid is within 300px of the viewport; re-observing
  // after each row makes a still-visible sentinel fire again (tall screens)
  useEffect(() => {
    if (shown >= total) return
    const el = sentinelRef.current
    if (!el) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || timer) return
        timer = setTimeout(() => setShown((n) => Math.min(n + STEP, total)), DELAY)
      },
      { rootMargin: "0px 0px 300px 0px" },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      if (timer) clearTimeout(timer)
    }
  }, [shown, total])

  return (
    <>
      <div className="mt-5 grid grid-cols-4 gap-x-2 gap-y-[26px]">
        {items.slice(0, shown).map((item, i) => (
          <div key={(item as React.ReactElement).key ?? i} className={i >= animateFrom ? "vc-reveal" : undefined}>
            {item}
          </div>
        ))}
      </div>
      {shown < total ? <div ref={sentinelRef} aria-hidden="true" className="h-px" /> : footer}
    </>
  )
}
