import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"

// Neumorphic Card Styles
const CARD_STYLES = {
  raised: {
    boxShadow: '0 8px 24px color-mix(in srgb, var(--primary) 25%, transparent), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.05)',
    hoverBoxShadow: '0 12px 32px color-mix(in srgb, var(--primary) 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.08)',
  },
  inset: {
    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(0,0,0,0.05)',
    hoverBoxShadow: 'inset 0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(0,0,0,0.08)',
  },
  default: {
    boxShadow: '0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.05)',
    hoverBoxShadow: '0 6px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.08)',
  },
}

export interface CardProps extends HTMLMotionProps<"div"> {
  variant?: keyof typeof CARD_STYLES
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false)
    const styleConfig = CARD_STYLES[variant]

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-2xl bg-card text-card-foreground",
          "transition-all duration-200",
          "hover:scale-[1.02]",
          className
        )}
        style={{
          boxShadow: isHovered ? styleConfig.hoverBoxShadow : styleConfig.boxShadow,
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
