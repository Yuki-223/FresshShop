import Image from "next/image"
import type { ReactNode } from "react"
import { PlaceholderImage } from "@/components/common/placeholder-image"

/** Product photo on the grey surface used by the design; falls back to the plain placeholder. */
export function ProductImage({
  src,
  alt,
  className,
  sizes = "300px",
  priority,
  children,
}: {
  src?: string
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
  children?: ReactNode
}) {
  return (
    <PlaceholderImage className={className}>
      {src && <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-contain p-[8%] mix-blend-multiply" />}
      {children}
    </PlaceholderImage>
  )
}
