"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { useT } from "@/i18n/client"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import type { Testimonial } from "@/types"

function ArrowButton({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  const t = useT()
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? t("home.prevTestimonial") : t("home.nextTestimonial")}
      className={`absolute top-1/2 z-10 grid h-9 w-6 -translate-y-1/2 place-items-center rounded-md bg-ink text-white shadow hover:bg-brand ${
        dir === "prev" ? "-left-3" : "-right-3"
      }`}
    >
      <Icon className="size-4" />
    </button>
  )
}

export function TestimonialCarousel({ items }: { items: Testimonial[] }) {
  const [api, setApi] = useState<CarouselApi>()
  return (
    <div className="relative">
      <Carousel setApi={setApi} opts={{ loop: true, align: "start" }}>
        <CarouselContent className="-ml-6 pb-8">
          {items.map((item) => (
            <CarouselItem key={item.id} className="basis-1/3 pl-6">
              <figure className="relative flex h-full flex-col items-center rounded-xl border border-surface-2 bg-card px-8 pt-8 pb-12 text-center">
                <blockquote className="text-[15px] leading-relaxed text-ink">“{item.quote}”</blockquote>
                <figcaption className="mt-4 font-heading text-xs font-semibold text-ink-muted">{item.author}</figcaption>
                <span className="absolute -bottom-6 size-12 rounded-full border-4 border-white bg-surface-2" aria-hidden />
              </figure>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <ArrowButton dir="prev" onClick={() => api?.scrollPrev()} />
      <ArrowButton dir="next" onClick={() => api?.scrollNext()} />
    </div>
  )
}
