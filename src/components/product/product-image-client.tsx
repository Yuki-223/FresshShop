"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

/** Small product thumbnail for client components (cart drawer, checkout summary). */
export function ProductImageClient({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-surface", className)}>
      {src && <Image src={src} alt={alt} fill sizes="100px" unoptimized={/^https?:/.test(src)} className="object-contain p-1.5 mix-blend-multiply" />}
    </div>
  )
}
