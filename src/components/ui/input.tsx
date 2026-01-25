import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    const inputStyle = {
      boxShadow: isFocused
        ? 'inset 0 2px 8px rgba(0,0,0,0.18), inset 0 1px 0 rgba(0,0,0,0.08), 0 0 0 3px color-mix(in srgb, var(--ring) 30%, transparent)'
        : 'inset 0 2px 6px rgba(0,0,0,0.12), inset 0 1px 0 rgba(0,0,0,0.05)',
    }

    return (
      <motion.input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-2xl border border-[var(--border)] bg-background px-3 py-2 text-sm",
          "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-[var(--input-border)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200",
          className
        )}
        style={inputStyle}
        onFocus={(e) => {
          setIsFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          props.onBlur?.(e)
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
