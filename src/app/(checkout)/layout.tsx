import { Copyright } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"

/** Checkout uses a reduced footer (design: "Copyright © 2020 Freshnesecom" only). */
export default function CheckoutLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <footer className="container-page mt-12">
        <Copyright owner="Freshnesecom" />
      </footer>
    </>
  )
}
