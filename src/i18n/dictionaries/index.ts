import type { Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n/dictionary"
import { en } from "@/i18n/dictionaries/en"
import { zh } from "@/i18n/dictionaries/zh"

export const dictionaries: Record<Locale, Dictionary> = { en, zh }
