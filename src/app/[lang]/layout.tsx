import type { Metadata } from "next"
import { Noto_Sans_SC, Roboto_Slab } from "next/font/google"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { CartSync } from "@/components/cart/cart-sync"
import { Toaster } from "@/components/ui/sonner"
import { I18nProvider } from "@/i18n/client"
import { localeConfig, locales } from "@/i18n/config"
import { dictionaries } from "@/i18n/dictionaries"
import { getI18n } from "@/i18n/server"
import "../globals.css"

// Headings: Roboto Slab (as on vitacost.com). Everything else uses the system Helvetica / Arial (globals.css).
const robotoSlab = Roboto_Slab({ variable: "--font-roboto-slab", subsets: ["latin"] })
// CJK font: served in unicode-range chunks, so browsers only download the glyphs a page uses
const notoSansSC = Noto_Sans_SC({ variable: "--font-noto-sc", weight: ["400", "500", "600", "700"], preload: false })

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return {
    title: { default: t("meta.title"), template: "%s | Freshnesecom" },
    description: t("meta.description"),
    alternates: { languages: Object.fromEntries(locales.map((l) => [localeConfig[l].intl, `/${l}`])) },
  }
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const { locale } = await getI18n()
  return (
    <html lang={localeConfig[locale].intl} className={`${robotoSlab.variable} ${notoSansSC.variable} antialiased`}>
      <body className="min-h-screen min-w-[1280px] bg-background">
        <I18nProvider locale={locale} dictionary={dictionaries[locale]}>
          {children}
          <CartSync />
          <CartDrawer />
          <Toaster theme="light" position="top-center" richColors={false} />
        </I18nProvider>
      </body>
    </html>
  )
}
