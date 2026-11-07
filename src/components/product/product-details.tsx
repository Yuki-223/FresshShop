import { getI18n } from "@/i18n/server"
import type { ContentBlock, ProductDetail } from "@/types"

/**
 * "Details" of vitacost.com product pages (measured at 1440px): a centred Roboto Slab 24px heading,
 * then one box (1px #e5e5e5, 30px vertical padding) with everything open — description, directions,
 * storage, cautions/warnings and FAQ on the left (Roboto Slab 18px semibold headings, 14px/20px body),
 * the Supplement Facts table on the right (1px cells at 20% ink, 14px padding).
 */

function Heading({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 text-lg leading-[23px] font-semibold tracking-[0.6px] text-[#121212]">{children}</h3>
}

function Blocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-3">
      {blocks.map((b, i) =>
        b.type === "heading" ? (
          <p key={i} className="pt-1 font-bold text-[#121212]">
            {b.text}
          </p>
        ) : b.type === "list" ? (
          <ul key={i} className="list-disc space-y-1.5 pl-[65px]">
            {b.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{b.text}</p>
        ),
      )}
    </div>
  )
}

/**
 * The collected cautions/warnings glue each product's label straight onto its text
 * ("Magnesium GlycinateKeep out of …", bundles: "…nursing.UltraFlora® Healthy WeightNot for …").
 * Split them into paragraphs with the label in bold: a new paragraph where a sentence end runs into
 * a capital letter (not inside "www.P65warnings…"), and a label where text runs into a sentence start.
 */
const SENTENCE_START = String.raw`(?:If|Do|Consult|Keep|Not|This|Caution|Notice|Recommended|Excess|Excessive|May|Swallow|For|As)\b`
const LABEL = new RegExp(String.raw`^(.{2,90}?[A-Za-z0-9®™°)])(?=` + SENTENCE_START + ")")

function Labelled({ text }: { text: string }) {
  const parts = text.split(/(?<=[.!?])(?<!www\.)(?=[A-Z])/)
  return (
    <div className="space-y-2">
      {parts.map((part, i) => {
        const label = part.match(LABEL)?.[1]
        return (
          <p key={i}>
            {label && <span className="font-bold text-[#121212]">{label}: </span>}
            {label ? part.slice(label.length) : part}
          </p>
        )
      })}
    </div>
  )
}

export async function ProductDetails({ product }: { product: ProductDetail }) {
  const { t } = await getI18n()
  const facts = product.supplementFacts
  // the first row of the collected table repeats the column names ("Ingredient | Amount | % Daily Value")
  const rows = facts?.rows.filter((r, i) => !(i === 0 && /^ingredient/i.test(r.name) && /amount/i.test(r.amount))) ?? []
  const sections: { title: string; body: React.ReactNode }[] = [
    { title: t("productPage.tabDescription"), body: product.content.length ? <Blocks blocks={product.content} /> : <p>{product.summary}</p> },
    ...(product.directions ? [{ title: t("productPage.directions"), body: <p>{product.directions}</p> }] : []),
    ...(product.storage ? [{ title: t("productPage.storage"), body: <p>{product.storage}</p> }] : []),
    ...(product.cautions ? [{ title: t("productPage.cautions"), body: <Labelled text={product.cautions} /> }] : []),
    ...(product.warnings ? [{ title: t("productPage.warnings"), body: <Labelled text={product.warnings} /> }] : []),
  ]

  return (
    <section className="mt-14" aria-labelledby="details-heading">
      <h2 id="details-heading" className="text-center text-2xl leading-[31px] font-bold tracking-[0.6px] text-[#121212]">
        {t("productPage.details")}
      </h2>
      <div className={`mt-2.5 grid gap-x-[5%] border border-[#e5e5e5] py-[30px] pr-[60px] pl-[60px] ${facts ? "grid-cols-[1fr_1fr]" : "grid-cols-1"}`}>
        <div className="space-y-8 text-sm leading-5 tracking-[0.6px] text-[#121212]/75">
          {sections.map((s) => (
            <div key={s.title}>
              <Heading>{s.title}</Heading>
              {s.body}
            </div>
          ))}
          {product.faq.length > 0 && (
            <div>
              <Heading>{t("productPage.faq")}</Heading>
              <dl className="space-y-4">
                {product.faq.map((item) => (
                  <div key={item.q}>
                    <dt className="font-bold text-[#121212]">{item.q}</dt>
                    <dd className="mt-1">{item.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        {facts && (
          <div>
            <table className="w-full border-collapse text-sm leading-5 tracking-[0.6px] text-[#121212]/75">
              <tbody>
                <tr>
                  <th colSpan={3} className="border border-[#121212]/20 p-3.5 text-left font-bold">
                    {t("productPage.tabFacts")}
                  </th>
                </tr>
                {facts.servingSize && (
                  <tr>
                    <td colSpan={3} className="border border-[#121212]/20 p-3.5">
                      <span className="font-bold">{t("productPage.servingSize")}:</span> {facts.servingSize}
                    </td>
                  </tr>
                )}
                {facts.servings && (
                  <tr>
                    <td colSpan={3} className="border border-[#121212]/20 p-3.5">
                      <span className="font-bold">{t("productPage.servings")}:</span> {facts.servings}
                    </td>
                  </tr>
                )}
                <tr className="font-bold">
                  <td className="border border-[#121212]/20 p-3.5">{t("productPage.ingredient")}</td>
                  <td className="w-[90px] border border-[#121212]/20 p-3.5">{t("productPage.amountPerServing")}</td>
                  <td className="w-[90px] border border-[#121212]/20 p-3.5">{t("productPage.dailyValue")}</td>
                </tr>
                {rows.map((row, i) =>
                  row.amount || row.dv ? (
                    <tr key={`${i}-${row.name}`}>
                      <td className="border border-[#121212]/20 p-3.5">{row.name}</td>
                      <td className="border border-[#121212]/20 p-3.5">{row.amount}</td>
                      <td className="border border-[#121212]/20 p-3.5">{row.dv}</td>
                    </tr>
                  ) : (
                    // footnotes ("**Daily Value not established.") span the whole row
                    <tr key={`${i}-${row.name}`}>
                      <td colSpan={3} className="border border-[#121212]/20 p-3.5 text-xs">
                        {row.name}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
