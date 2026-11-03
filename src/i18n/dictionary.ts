import type { en } from "@/i18n/dictionaries/en"

/** Same shape as `en`, but every leaf is a plain string (so other languages can differ). */
type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> }
export type Dictionary = Widen<typeof en>

type Plural = { one: string; other: string }

/** Dot paths to string leaves, e.g. "product.buyNow". */
type StringPaths<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : T[K] extends Plural
      ? never
      : StringPaths<T[K], `${P}${K}.`>
}[keyof T & string]

/** Dot paths to plural entries, e.g. "product.deliveryIn". */
type PluralPaths<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? never
    : T[K] extends Plural
      ? `${P}${K}`
      : PluralPaths<T[K], `${P}${K}.`>
}[keyof T & string]

export type MessageKey = StringPaths<Dictionary>
export type PluralKey = PluralPaths<Dictionary>
export type Params = Record<string, string | number>

export interface Translator {
  (key: MessageKey, params?: Params): string
  plural: (key: PluralKey, count: number, params?: Params) => string
}

function lookup(dict: Dictionary, path: string): unknown {
  return path.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], dict)
}

function interpolate(template: string, params?: Params) {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (m, name: string) => (name in params ? String(params[name]) : m))
}

export function createTranslator(dict: Dictionary): Translator {
  const t = ((key: MessageKey, params?: Params) => {
    const value = lookup(dict, key)
    return typeof value === "string" ? interpolate(value, params) : key
  }) as Translator
  t.plural = (key, count, params) => {
    const entry = lookup(dict, key) as Plural | undefined
    if (!entry) return key
    return interpolate(count === 1 ? entry.one : entry.other, { count, ...params })
  }
  return t
}
