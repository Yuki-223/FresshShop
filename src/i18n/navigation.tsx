"use client"

import NextLink from "next/link"
import { usePathname as useNextPathname, useRouter as useNextRouter } from "next/navigation"
import type { ComponentProps } from "react"
import { localizeHref, stripLocale } from "@/i18n/config"
import { useI18n } from "@/i18n/client"

/**
 * Locale-aware drop-ins for next/link and next/navigation.
 * Components keep writing "/product/x"; the current locale prefix is added here.
 */
export function Link({ href, ...props }: Omit<ComponentProps<typeof NextLink>, "href"> & { href: string }) {
  const { locale } = useI18n()
  return <NextLink href={localizeHref(href, locale)} {...props} />
}

export function useRouter() {
  const router = useNextRouter()
  const { locale } = useI18n()
  return {
    ...router,
    push: (href: string, opts?: Parameters<typeof router.push>[1]) => router.push(localizeHref(href, locale), opts),
    replace: (href: string, opts?: Parameters<typeof router.replace>[1]) => router.replace(localizeHref(href, locale), opts),
  }
}

/** Pathname without the locale prefix ("/zh/blog" → "/blog"). */
export function usePathname() {
  return stripLocale(useNextPathname())
}
