"use client"

import type { ReactNode } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function CheckoutSection({
  title,
  subtitle,
  step,
  total = 5,
  children,
}: {
  title: string
  subtitle: string
  step: number
  total?: number
  children: ReactNode
}) {
  return (
    <section className="pb-16" aria-labelledby={`step-${step}`}>
      <h2 id={`step-${step}`} className="text-[22px] font-semibold text-ink">
        {title}
      </h2>
      <div className="mb-8 flex items-center justify-between text-xs text-ink-muted">
        <p>{subtitle}</p>
        <p>
          Step {step} of {total}
        </p>
      </div>
      {children}
    </section>
  )
}

export function Field({
  id,
  label,
  error,
  children,
  className,
}: {
  id: string
  label: string
  error?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-2 font-heading text-xs font-semibold text-ink">
        {label}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

export const fieldInputClass = "h-11 rounded-xl bg-surface px-4 text-sm placeholder:text-ink-muted"

export function TextInput({ id, error, className, ...props }: React.ComponentProps<typeof Input> & { error?: string }) {
  return (
    <Input
      id={id}
      aria-invalid={!!error || undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={cn(fieldInputClass, className)}
      {...props}
    />
  )
}

/** Bordered row used for delivery/payment options and consent checkboxes. */
export function OptionRow({
  control,
  children,
  aside,
  active,
  className,
  htmlFor,
}: {
  control: ReactNode
  children: ReactNode
  aside?: ReactNode
  active?: boolean
  className?: string
  htmlFor: string
}) {
  // The label sits *next to* the control (not around it): Base UI controls keep their
  // hidden <input> inside the root, so a wrapping label would toggle them twice.
  return (
    <div
      className={cn(
        "flex min-h-11 items-center gap-4 rounded-xl border border-line bg-surface pl-4 transition-colors hover:border-brand-light",
        active && "border-brand-light bg-white",
        className,
      )}
    >
      {control}
      <label htmlFor={htmlFor} className="flex flex-1 cursor-pointer items-center gap-4 self-stretch py-2.5 pr-4 text-sm text-ink">
        <span className="flex-1">{children}</span>
        {aside}
      </label>
    </div>
  )
}

/** Simple text wordmarks for carriers / payment providers (no third-party assets). */
export function Wordmark({ name }: { name: "fedex" | "dhl" | "visa" | "paypal" | "bitcoin" }) {
  switch (name) {
    case "fedex":
      return (
        <span className="font-heading text-lg font-extrabold tracking-tight">
          <span className="text-[#4d148c]">Fed</span>
          <span className="text-[#ff6600]">Ex</span>
        </span>
      )
    case "dhl":
      return <span className="font-heading text-lg font-extrabold italic tracking-tighter text-[#d40511]">DHL</span>
    case "visa":
      return (
        <span className="flex items-center gap-2">
          <span className="font-heading text-lg font-extrabold italic text-[#1a1f71]">VISA</span>
          <span className="relative flex" aria-label="Mastercard">
            <span className="size-5 rounded-full bg-[#eb001b]" />
            <span className="-ml-2 size-5 rounded-full bg-[#f79e1b]/90" />
          </span>
        </span>
      )
    case "paypal":
      return (
        <span className="font-heading text-lg font-extrabold italic">
          <span className="text-[#003087]">Pay</span>
          <span className="text-[#009cde]">Pal</span>
        </span>
      )
    case "bitcoin":
      return <span className="font-heading text-lg font-bold italic text-[#f7931a]">₿itcoin</span>
  }
}
