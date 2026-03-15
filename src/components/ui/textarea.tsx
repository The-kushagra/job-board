import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-32 w-full rounded-lg border border-border/50 bg-slate-800/50 px-4 py-3 text-base text-white shadow-sm transition-all outline-none placeholder:text-slate-500 disabled:opacity-50 md:text-sm",
        "focus:border-primary focus:ring-2 focus:ring-primary/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
