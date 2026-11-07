"use client"

import { cn } from "@/lib/utils"

/** Labelled text input of the account pages (44px, 1px #c4c4c4, radius 4). */
export function AccountInput({
  id,
  label,
  hint,
  className,
  ...input
}: { id: string; label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-bold tracking-[0.3px] text-[#121212]">
        {label}
      </label>
      <input
        id={id}
        {...input}
        className={cn(
          "h-11 w-full rounded border border-[#c4c4c4] bg-white px-3 text-[15px] text-[#121212] outline-none transition-colors focus:border-[#121212] disabled:bg-[#f5f5f5] disabled:text-[#121212]/60",
        )}
      />
      {hint && <p className="mt-1 text-xs text-[#121212]/55">{hint}</p>}
    </div>
  )
}

export function PrimaryButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "h-10 rounded-[2px] bg-brand px-6 text-sm font-bold tracking-[1px] text-white transition-colors hover:bg-brand-dark disabled:bg-[#c8c8c8]",
        className,
      )}
    />
  )
}

export function OutlineButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "h-10 rounded-[2px] border border-[#121212] bg-white px-5 text-sm font-bold tracking-[1px] text-[#121212] transition-colors hover:bg-[#121212] hover:text-white disabled:opacity-50",
        className,
      )}
    />
  )
}
