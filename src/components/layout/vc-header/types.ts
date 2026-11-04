/**
 * Menu tree for the Vitacost-style header (adapted from the user's vc-header component).
 * hrefs are locale-less ("/category/all"); the header renders them with the i18n Link,
 * which adds /en or /zh.
 */
export interface NavLink {
  label: string
  href: string
  /** product count, shown muted after the label */
  count?: number
}

/** "Categories": groups on the left, the hovered group's links on the right. */
export interface SidebarPanel {
  label: string
  href: string
  heading: string
  shopAll?: string
  links: NavLink[]
}

/** "Shop by Form": a few small columns. */
export interface NavGroup {
  title: string
  href?: string
  links: NavLink[]
}

export type NavMenu =
  | { type: "sidebar"; panels: SidebarPanel[] }
  | { type: "columns"; groups: NavGroup[] }
  | { type: "condensed"; links: NavLink[]; width?: number }

export interface NavItem {
  label: string
  href: string
  /** highlighted (Deals) */
  accent?: boolean
  menu?: NavMenu
}

export interface AnnouncementConfig {
  text: string
  href?: string
  actionLabel?: string
  actionHref?: string
}
