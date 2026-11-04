/** One hero slide. The banner images carry their own text, so `alt` repeats what the image says. */
export interface VcSlide {
  id: string
  /** desktop image, 1920×525 */
  image: string
  alt: string
  /** locale-less store path; rendered with the i18n Link */
  href?: string
}

