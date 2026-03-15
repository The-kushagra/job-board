import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 active:scale-95 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-b from-purple-600 to-purple-700 text-white shadow-md hover:from-purple-500 hover:to-purple-600",
        destructive: "bg-gradient-to-b from-red-500 to-red-600 text-white shadow-md hover:from-red-400 hover:to-red-500",
        outline: "border-2 border-secondary bg-transparent text-foreground hover:bg-secondary hover:text-white dark:border-secondary/50 dark:hover:bg-secondary/80",
        secondary: "bg-secondary/50 text-foreground hover:bg-secondary/80 border border-border",
        ghost: "hover:bg-primary/10 hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        xs: "h-7 gap-1 rounded-md px-2.5 text-xs",
        sm: "h-9 gap-1.5 rounded-md px-4 text-sm",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "size-11",
        "icon-xs": "size-7 rounded-md",
        "icon-sm": "size-9 rounded-md",
        "icon-lg": "size-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
