"use client"

import { motion, type HTMLMotionProps } from "framer-motion"
import { forwardRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AnimateCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  children: ReactNode
  hover?: boolean
  delay?: number
}

export const AnimateCard = forwardRef<HTMLDivElement, AnimateCardProps>(
  ({ className, children, hover = true, delay = 0, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow",
          hover && "hover:shadow-md",
          className,
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    )
  },
)

AnimateCard.displayName = "AnimateCard"

export function AnimateCardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)}>{children}</div>
}

export function AnimateCardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)}>{children}</h3>
}

export function AnimateCardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
}

export function AnimateCardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>
}

export function AnimateCardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex items-center p-6 pt-0", className)}>{children}</div>
}
