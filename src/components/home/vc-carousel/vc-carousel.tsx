"use client"

/**
 * Vitacost-style product shelf, adapted from the user's `VcCarousel` component
 * (GitHub release "vc-header": VcCarousel.zip + vc-carousel.css). Changes from the original:
 * desktop only; the store's Product type instead of VcProduct (that file was missing);
 * links use the i18n Link; images use next/image; labels come from the dictionary;
 * the "+" adds the default variant (one-time purchase) to the backend cart;
 * loading / empty / error states and scroll persistence were dropped (data is server-rendered).
 */
import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import { useAddToCart } from "@/components/product/product-actions"
import { useI18n } from "@/i18n/client"
import { Link } from "@/i18n/navigation"
import { defaultVariant, toCartLine } from "@/lib/product"
import { useCart } from "@/lib/store/cart"
import type { Product } from "@/types"
import "./vc-carousel.css"

function Stars({ rating, label }: { rating: number; label: string }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100))
  return (
    <span className="vcc__stars" role="img" aria-label={label}>
      <span className="vcc__stars-bg" aria-hidden="true">
        ★★★★★
      </span>
      <span className="vcc__stars-fg" style={{ width: `${pct}%` }} aria-hidden="true">
        ★★★★★
      </span>
    </span>
  )
}

function ProductCard({ product }: { product: Product }) {
  const { t, fmt } = useI18n()
  const addToCart = useAddToCart()
  const cartBusy = useCart((s) => s.pending)
  const [adding, setAdding] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const href = `/product/${product.slug}`
  const variant = defaultVariant(product)

  const handleAdd = useCallback(async () => {
    if (adding) return
    setAdding(true)
    try {
      await addToCart(toCartLine(product, variant, { type: "once" }))
    } finally {
      setTimeout(() => setAdding(false), 600)
    }
  }, [adding, addToCart, product, variant])

  return (
    <div className="vcc__item">
      <div className="vcc__product-card">
        <div className="vcc__product-image-wrapper">
          <Link className="vcc__product-image-link" href={href} tabIndex={-1} aria-hidden="true">
            {product.image && (
              <Image
                className={`vcc__product-image${imgLoaded ? " is-loaded" : ""}`}
                src={product.image}
                alt=""
                fill
                sizes="270px"
                unoptimized={/^https?:/.test(product.image)}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgLoaded(true)}
              />
            )}
          </Link>

          <button
            type="button"
            className={`vcc__atc-button${adding ? " loading" : ""}`}
            onClick={handleAdd}
            disabled={!variant.available || cartBusy}
            aria-label={`${variant.available ? t("product.addToCart") : t("product.outOfStock")}: ${product.title}`}
          >
            <span className="vcc__atc-icon" aria-hidden="true">
              +
            </span>
            <span className="vcc__atc-text">{variant.available ? t("product.addToCart") : t("product.outOfStock")}</span>
            {adding && <span className="vcc__spinner" aria-hidden="true" />}
          </button>
        </div>

        <Link className="vcc__product-title-link" href={href}>
          <h3 className="vcc__product-title">{product.title}</h3>
        </Link>

        {product.rating && product.rating.value > 0 && (
          <div className="vcc__rating">
            <Stars rating={product.rating.value} label={t("product.ratedOutOf", { value: product.rating.value.toFixed(1) })} />
            <span className="vcc__reviews">{product.rating.count}</span>
          </div>
        )}

        <div className="vcc__product-price">
          <span>{fmt.price(variant.price)}</span>
        </div>
      </div>
    </div>
  )
}

export function VcCarousel({
  title,
  products,
  shopAllHref,
  green = false,
  perView = 5,
}: {
  title: string
  products: Product[]
  /** locale-less store path for the "Shop all" button */
  shopAllHref?: string
  /** light-green shelf (vitacost.com alternates white and green) */
  green?: boolean
  perView?: number
}) {
  const { t } = useI18n()
  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const sync = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    sync()
    el.addEventListener("scroll", sync, { passive: true })
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", sync)
      ro.disconnect()
    }
  }, [sync, products.length])

  if (products.length === 0) return null

  // one screen at a time, leaving part of a card so it is clear there is more
  const page = (dir: 1 | -1) => trackRef.current?.scrollBy({ left: dir * trackRef.current.clientWidth * 0.9, behavior: "smooth" })

  return (
    <section className={`vcc-section${green ? " is-green" : ""}`} style={{ ["--vcc-per-view" as string]: perView }}>
      <div className="vcc__inner">
        <h2 className="vcc__heading">{title}</h2>

        <div className="vcc__carousel-wrapper vcc--expand">
          {canPrev && (
            <button type="button" className="vcc__nav vcc__nav--prev" onClick={() => page(-1)} aria-label={t("home.shelfPrevious")}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          <div className="vcc__carousel" ref={trackRef}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {canNext && (
            <button type="button" className="vcc__nav vcc__nav--next" onClick={() => page(1)} aria-label={t("home.shelfNext")}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        {shopAllHref && (
          <div className="vcc__footer">
            <Link className="vcc__shop-all" href={shopAllHref}>
              {t("home.shopAll")}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
