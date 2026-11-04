"use client"

/**
 * Vitacost-style hero slideshow, adapted from the user's `vc-slideshow` component
 * (GitHub release "vc-header", default.zip). Changes from the original: desktop only,
 * no text layer (the banners carry their own text), links use the i18n Link, images use
 * next/image, control labels come from the dictionary.
 *
 * Behaviour as on vitacost.com: autoplay every 3 s, paused while hovered or focused,
 * "‹ 1 / 3 › ⏸" under the image, native scroll-snap track.
 */
import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import { useT } from "@/i18n/client"
import { Link } from "@/i18n/navigation"
import type { VcSlide } from "./types"
import "./vc-slideshow.css"

function CaretIcon() {
  return (
    <svg className="vcs__icon-caret" viewBox="0 0 10 6" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M9.354.646a.5.5 0 0 0-.708 0L5 4.293 1.354.646a.5.5 0 0 0-.708.708l4 4a.5.5 0 0 0 .708 0l4-4a.5.5 0 0 0 0-.708"
        clipRule="evenodd"
      />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg className="vcs__icon-pause" viewBox="0 0 8 12" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M1.2.75c-.387 0-.7.235-.7.525v9.45c0 .29.313.525.7.525s.7-.235.7-.525v-9.45c0-.29-.313-.525-.7-.525m5.6 0c-.387 0-.7.235-.7.525v9.45c0 .29.313.525.7.525s.7-.235.7-.525v-9.45c0-.29-.313-.525-.7-.525"
      />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg className="vcs__icon-play" viewBox="0 0 10 14" aria-hidden="true" focusable="false">
      <path fill="currentColor" fillRule="evenodd" d="M1.482.815A1 1 0 0 0 0 1.69v10.517a1 1 0 0 0 1.525.851L10.54 7.5a1 1 0 0 0-.043-1.728z" clipRule="evenodd" />
    </svg>
  )
}

export function VcSlideshow({
  slides,
  interval = 3000,
  /** height / width × 100 (525 / 1920) */
  ratio = 27.34375,
}: {
  slides: VcSlide[]
  interval?: number
  ratio?: number
}) {
  const t = useT()
  const trackRef = useRef<HTMLDivElement>(null)
  const indexRef = useRef(0)
  const [index, setIndex] = useState(0)
  /** turned off with the pause button (persists) */
  const [autoplayOn, setAutoplayOn] = useState(true)
  /** temporary pause while hovered / focused */
  const [hovered, setHovered] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const count = slides.length

  /** scroll to slide i (wraps around) */
  const goTo = useCallback(
    (i: number) => {
      const el = trackRef.current
      if (!el || count === 0) return
      const target = ((i % count) + count) % count
      el.scrollTo({ left: target * el.clientWidth, behavior: reducedMotion ? "auto" : "smooth" })
      indexRef.current = target
      setIndex(target)
    },
    [count, reducedMotion],
  )

  // keep the counter in sync with manual scrolling (rAF-throttled)
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    let raf = 0
    const sync = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const w = el.clientWidth
        if (!w) return
        const i = Math.round(el.scrollLeft / w)
        if (i >= 0 && i < count && i !== indexRef.current) {
          indexRef.current = i
          setIndex(i)
        }
      })
    }
    el.addEventListener("scroll", sync, { passive: true })
    return () => {
      el.removeEventListener("scroll", sync)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [count])

  // autoplay; paused while hovered/focused
  useEffect(() => {
    if (!autoplayOn || hovered || reducedMotion || count <= 1) return
    const id = window.setInterval(() => goTo(indexRef.current + 1), Math.max(1200, interval))
    return () => window.clearInterval(id)
  }, [autoplayOn, hovered, reducedMotion, interval, count, goTo])

  // re-align after a resize so we never stop between two slides
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const onResize = () => el.scrollTo({ left: indexRef.current * el.clientWidth, behavior: "auto" })
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  if (count === 0) return null

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      goTo(indexRef.current - 1)
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      goTo(indexRef.current + 1)
    }
  }

  return (
    <section
      className="vcs"
      style={{ ["--vcs-ratio" as string]: `${ratio}%` }}
      aria-roledescription="carousel"
      aria-label={t("home.slideshow")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
      onKeyDown={onKeyDown}
    >
      <div className="vcs__viewport">
        <div className="vcs__track" ref={trackRef} aria-live={autoplayOn && !hovered ? "off" : "polite"} aria-atomic="true">
          {slides.map((slide, i) => {
            const active = i === index
            const media = (
              <Image
                className="vcs__img"
                src={slide.image}
                alt={slide.alt}
                fill
                sizes="1350px"
                priority={i === 0}
                draggable={false}
              />
            )
            return (
              <div
                key={slide.id}
                className="vcs__slide"
                role="group"
                aria-roledescription="slide"
                aria-label={t("home.slideOf", { current: i + 1, total: count })}
                aria-hidden={active ? undefined : true}
              >
                <div className="vcs__media">
                  {slide.href ? (
                    <Link className="vcs__link" href={slide.href} tabIndex={active ? undefined : -1} aria-label={slide.alt}>
                      {media}
                    </Link>
                  ) : (
                    media
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {count > 1 && (
        <div className="vcs__controls">
          <button type="button" className="vcs__btn vcs__btn--prev" aria-label={t("home.slidePrevious")} onClick={() => goTo(indexRef.current - 1)}>
            <span className="vcs__icon-wrap">
              <CaretIcon />
            </span>
          </button>
          <p className="vcs__counter">
            <span className="vcs__counter-current">{index + 1}</span>
            <span aria-hidden="true">&nbsp;/&nbsp;</span>
            <span className="vcs__counter-total">{count}</span>
          </p>
          <button type="button" className="vcs__btn vcs__btn--next" aria-label={t("home.slideNext")} onClick={() => goTo(indexRef.current + 1)}>
            <span className="vcs__icon-wrap">
              <CaretIcon />
            </span>
          </button>
          <button
            type="button"
            className={`vcs__btn vcs__btn--play${autoplayOn ? "" : " is-paused"}`}
            aria-label={autoplayOn ? t("home.slidePause") : t("home.slidePlay")}
            onClick={() => setAutoplayOn((v) => !v)}
          >
            <span className="vcs__icon-wrap">
              <PauseIcon />
              <PlayIcon />
            </span>
          </button>
        </div>
      )}
    </section>
  )
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (!window.matchMedia) return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])
  return reduced
}
