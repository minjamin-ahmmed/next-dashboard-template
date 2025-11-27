"use client"

import type React from "react"

import { motion, type HTMLMotionProps } from "framer-motion"
import { forwardRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import * as LucideIcons from "lucide-react"

interface IconWrapperProps extends Omit<HTMLMotionProps<"span">, "ref"> {
  children?: ReactNode
  name?: keyof typeof LucideIcons
  size?: number
  animate?: boolean
}

export const IconWrapper = forwardRef<HTMLSpanElement, IconWrapperProps>(
  ({ className, children, name, size = 20, animate = true, ...props }, ref) => {
    const LucideIcon = name ? (LucideIcons[name] as React.ComponentType<{ size?: number; className?: string }>) : null
    const iconContent = children || (LucideIcon ? <LucideIcon size={size} /> : null)

    if (!animate) {
      return (
        <span ref={ref} className={cn("inline-flex items-center justify-center", className)}>
          {iconContent}
        </span>
      )
    }

    return (
      <motion.span
        ref={ref}
        className={cn("inline-flex items-center justify-center", className)}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        {...props}
      >
        {iconContent}
      </motion.span>
    )
  },
)

IconWrapper.displayName = "IconWrapper"
