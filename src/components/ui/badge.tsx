import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-primary/50 [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary text-white border-transparent shadow-sm",
        secondary: "bg-slate-800 text-slate-300 border-white/5",
        destructive: "bg-red-500/10 text-red-400 border-red-500/20",
        outline: "bg-transparent text-slate-400 border-white/10 hover:border-white/20 hover:text-white",
        success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        match: "bg-gradient-to-r from-purple-600 to-teal-500 text-white border-transparent shadow-lg shadow-teal-500/20",
        ghost: "border-transparent text-slate-400 hover:text-white",
        link: "text-primary underline-offset-4 hover:underline border-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
