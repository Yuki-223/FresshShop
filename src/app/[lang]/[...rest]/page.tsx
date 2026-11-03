import { notFound } from "next/navigation"

/** Any unknown deep path under /zh or /en renders the localized not-found page. */
export default function CatchAll() {
  notFound()
}
