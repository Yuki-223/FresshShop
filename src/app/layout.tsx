import type { Metadata } from "next"
import { Open_Sans, Poppins } from "next/font/google"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: { default: "Freshnesecom — Fresh food from local farms", template: "%s | Freshnesecom" },
  description: "Fresh fruit, vegetables, meat and bakery products delivered from local farms.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.variable} ${openSans.variable} antialiased`}>
      <body className="min-h-screen min-w-[1280px] bg-background">
        {children}
        <CartDrawer />
        <Toaster theme="light" position="top-center" richColors={false} />
      </body>
    </html>
  )
}
