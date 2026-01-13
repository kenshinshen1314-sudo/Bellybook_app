import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"

// Neumorphic Button Styles
const BUTTON_STYLES = {
  default: {
    background: 'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, black) 50%, color-mix(in srgb, var(--primary) 70%, black) 100%)',
    boxShadow: '0 4px 12px color-mix(in srgb, var(--primary) 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)',
    hoverBoxShadow: '0 6px 20px color-mix(in srgb, var(--primary) 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.15)',
  },
  primary: {
    background: 'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, black) 50%, color-mix(in srgb, var(--primary) 70%, black) 100%)',
    boxShadow: '0 4px 12px color-mix(in srgb, var(--primary) 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)',
    hoverBoxShadow: '0 6px 20px color-mix(in srgb, var(--primary) 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.15)',
  },
  destructive: {
    background: 'linear-gradient(135deg, var(--destructive) 0%, color-mix(in srgb, var(--destructive) 85%, black) 50%, color-mix(in srgb, var(--destructive) 70%, black) 100%)',
    boxShadow: '0 4px 12px color-mix(in srgb, var(--destructive) 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)',
    hoverBoxShadow: '0 6px 20px color-mix(in srgb, var(--destructive) 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.15)',
  },
  accent: {
    background: 'linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 85%, black) 50%, color-mix(in srgb, var(--accent) 70%, black) 100%)',
    boxShadow: '0 4px 12px color-mix(in srgb, var(--accent) 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)',
    hoverBoxShadow: '0 6px 20px color-mix(in srgb, var(--accent) 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.15)',
  },
  secondary: {
    background: 'linear-gradient(135deg, var(--secondary) 0%, color-mix(in srgb, var(--secondary) 85%, black) 50%, color-mix(in srgb, var(--secondary) 70%, black) 100%)',
    boxShadow: '0 4px 12px color-mix(in srgb, var(--secondary) 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)',
    hoverBoxShadow: '0 6px 20px color-mix(in srgb, var(--secondary) 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.15)',
  },
  outline: {
    background: 'transparent',
    boxShadow: 'none',
    hoverBoxShadow: '0 4px 12px color-mix(in srgb, var(--primary) 25%, transparent)',
  },
  ghost: {
    background: 'transparent',
    boxShadow: 'none',
    hoverBoxShadow: '0 2px 8px color-mix(in srgb, var(--primary) 20%, transparent)',
  },
  link: {
    background: 'transparent',
    boxShadow: 'none',
    hoverBoxShadow: 'none',
  },
  gold: {
    background: 'linear-gradient(135deg, #E0CEB5 0%, #D4AF37 100%)',
    boxShadow: '0 4px 12px color-mix(in srgb, #D4AF37 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.1)',
    hoverBoxShadow: '0 6px 20px color-mix(in srgb, #D4AF37 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.15)',
  },
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLMotionProps<"button"> {
  variant?: keyof typeof BUTTON_STYLES
  size?: "sm" | "default" | "lg" | "xl"
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", fullWidth = false, children, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false)
    const styleConfig = BUTTON_STYLES[variant]

    const combinedStyle = {
      background: styleConfig.background,
      boxShadow: isHovered ? styleConfig.hoverBoxShadow : styleConfig.boxShadow,
      border: variant === 'outline' ? '1px solid var(--border)' : 'none',
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "whitespace-nowrap text-sm font-medium",
          "rounded-2xl transition-all duration-200",
          "active:scale-[0.97] hover:scale-[1.02]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          {
            "h-8 px-4 text-xs rounded-xl": size === "sm",
            "h-9 px-5 py-2 rounded-2xl": size === "default",
            "h-12 px-10 rounded-2xl": size === "lg",
            "h-14 px-12 rounded-2xl": size === "xl",
            "w-full": fullWidth,
          },
          variant === "default" && "text-primary-foreground",
          variant === "primary" && "text-primary-foreground",
          variant === "destructive" && "text-destructive-foreground",
          variant === "accent" && "text-accent-foreground",
          variant === "secondary" && "text-secondary-foreground",
          variant === "outline" && "text-foreground",
          variant === "ghost" && "text-foreground hover:bg-accent hover:text-accent-foreground",
          variant === "link" && "text-primary underline-offset-4 hover:underline",
          variant === "gold" && "text-black",
          className
        )}
        style={combinedStyle}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileTap={{ scale: 0.96 }}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)
Button.displayName = "Button"

export { Button }
