"use client"

import { useState, useEffect, type ReactNode } from "react"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import type { Transition } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/providers/auth-provider"
import { useSidebarStore } from "@/stores/sidebar-store"
import {
  Home,
  Users,
  BarChart3,
  Settings,
  Shield,
  ShieldPlus,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Phone,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

// useSidebar hook - wraps Zustand store for backward compatibility
export function useSidebar() {
  const isOpen = useSidebarStore((state) => state.isOpen)
  const isCollapsed = useSidebarStore((state) => state.isCollapsed)
  const isMobile = useSidebarStore((state) => state.isMobile)
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar)
  const toggleCollapse = useSidebarStore((state) => state.toggleCollapse)
  const closeMobileSidebar = useSidebarStore((state) => state.closeMobileSidebar)

  return {
    isOpen,
    isCollapsed,
    isMobile,
    toggleSidebar,
    toggleCollapse,
    closeMobileSidebar,
  }
}

interface SidebarNavItem {
  title: string
  href?: string
  icon: typeof Home
  children?: {
    title: string
    href: string
    icon?: typeof Home
  }[]
}

const MotionLink = motion(Link)
const springTransition: Transition = { type: "spring", stiffness: 240, damping: 28 }

const navItems: SidebarNavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
    children: [
      { title: "User", href: "/dashboard/users/user", icon: Users },
      { title: "Role", href: "/dashboard/users/role", icon: Shield },
      { title: "Permission", href: "/dashboard/users/permission", icon: ShieldPlus },
    ],
  },
  { title: "Contacts", href: "/dashboard/contact", icon: Phone },
  { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface SidebarProps {
  navItems: SidebarNavItem[]
  pathname: string
  isCollapsed: boolean
  closeMobileSidebar: () => void
}

export interface SidebarItemProps {
  item: SidebarNavItem
  pathname: string
  isCollapsed: boolean
  closeMobileSidebar: () => void
}

export function Sidebar({ navItems, pathname, isCollapsed, closeMobileSidebar }: SidebarProps) {
  return (
    <LayoutGroup>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => (
          <motion.div layout transition={springTransition} key={item.href ?? item.title}>
            <SidebarItem
              item={item}
              pathname={pathname}
              isCollapsed={isCollapsed}
              closeMobileSidebar={closeMobileSidebar}
            />
          </motion.div>
        ))}
      </nav>
    </LayoutGroup>
  )
}

export function SidebarItem({ item, pathname, isCollapsed, closeMobileSidebar }: SidebarItemProps) {
  const hasChildren = !!item.children?.length
  const childActive = item.children?.some(
    (child) => pathname === child.href || pathname.startsWith(`${child.href}/`),
  )
  const isActive =
    !!childActive ||
    (!!item.href &&
      (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`))))

  const [isOpen, setIsOpen] = useState(childActive || false)

  useEffect(() => {
    if (childActive) {
      setIsOpen(true)
    }
  }, [childActive])

  const baseClasses = cn(
    "group relative flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
    isActive
      ? "bg-sidebar-accent text-sidebar-accent-foreground"
      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
  )

  const renderContent = () => (
    <div className="relative z-10 flex w-full items-center gap-3">
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
        <item.icon className="h-5 w-5 shrink-0" />
      </motion.div>
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 truncate text-left"
          >
            {item.title}
          </motion.span>
        )}
      </AnimatePresence>
      {hasChildren && !isCollapsed && (
        <motion.span
          layout
          animate={{ rotate: isOpen ? 0 : -90 }}
          transition={springTransition}
          className="ml-auto text-sidebar-foreground/50"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      )}
    </div>
  )

  const handleParentClick = () => {
    if (hasChildren) {
      setIsOpen((prev) => !prev)
    } else if (item.href) {
      closeMobileSidebar()
    }
  }

  return (
    <div>
      {hasChildren ? (
        <motion.button
          type="button"
          layout
          transition={springTransition}
          onClick={handleParentClick}
          className={cn(baseClasses, "w-full text-left")}
        >
          <motion.span
            layout
            className="absolute inset-0 rounded-lg bg-sidebar-foreground/10 opacity-0 transition-opacity duration-300 group-hover:opacity-40"
          />
          {isActive && (
            <motion.span
              layoutId="sidebar-active-highlight"
              className="absolute inset-0 rounded-lg bg-sidebar-accent"
              transition={springTransition}
            />
          )}
          {renderContent()}
        </motion.button>
      ) : (
        <MotionLink
          layout
          transition={springTransition}
          href={item.href ?? "#"}
          onClick={closeMobileSidebar}
          className={baseClasses}
        >
          <motion.span
            layout
            className="absolute inset-0 rounded-lg bg-sidebar-foreground/10 opacity-0 transition-opacity duration-300 group-hover:opacity-40"
          />
          {isActive && (
            <motion.span
              layoutId="sidebar-active-highlight"
              className="absolute inset-0 rounded-lg bg-sidebar-accent"
              transition={springTransition}
            />
          )}
          {renderContent()}
        </MotionLink>
      )}

      {hasChildren && (
        <AnimatePresence initial={false}>
          {isOpen && !isCollapsed && (
            <motion.div
              layout
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={springTransition}
              className="ml-8 mt-1 flex flex-col gap-1 border-l border-sidebar-border/40 pl-4"
            >
              {item.children?.map((child) => {
                const ChildIcon = child.icon
                const childIsActive = pathname === child.href || pathname.startsWith(`${child.href}/`)
                return (
                  <MotionLink
                    layout
                    transition={springTransition}
                    key={child.href}
                    href={child.href}
                    onClick={closeMobileSidebar}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                      childIsActive
                        ? "bg-sidebar-accent/70 text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent/30 hover:text-sidebar-accent-foreground",
                    )}
                  >
                    {ChildIcon && <ChildIcon className="h-4 w-4" />}
                    <span>{child.title}</span>
                  </MotionLink>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

// SidebarProvider component - initializes mobile detection
export function SidebarProvider({ children }: { children: ReactNode }) {
  const setIsMobile = useSidebarStore((state) => state.setIsMobile)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [setIsMobile])

  return <>{children}</>
}

export function SidebarWrapper() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { isOpen, isCollapsed, isMobile, toggleSidebar, toggleCollapse, closeMobileSidebar } = useSidebar()

  const sidebarWidth = isCollapsed ? "w-[72px]" : "w-[280px]"

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={closeMobileSidebar}
          />
        )}
      </AnimatePresence>

      {/* Mobile Toggle Button */}
      <motion.div layout className="fixed left-4 top-4 z-50 lg:hidden">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </motion.div>

      {/* Sidebar */}
      <motion.aside
        layout
        initial={false}
        animate={{
          x: isMobile ? (isOpen ? 0 : -300) : 0,
          width: isCollapsed && !isMobile ? 72 : 280,
        }}
        transition={springTransition}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:sticky lg:top-0",
          isMobile ? "w-[280px]" : sidebarWidth,
        )}
      >
        {/* Header */}
        <div className="relative flex h-16 items-center justify-between border-b border-sidebar-border bg-linear-to-r from-sidebar/50 to-sidebar-accent/5 px-4 backdrop-blur-sm">
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-sidebar-primary/10 via-transparent to-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative z-10 flex items-center gap-3"
              >
                {/* Enhanced Logo with Glow Effect */}
                <motion.div
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-sidebar-primary via-sidebar-primary/90 to-sidebar-primary/80 shadow-lg shadow-sidebar-primary/20"
                  whileHover={{ scale: 1.05, rotate: [0, -5, 5, -5, 0] }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {/* Glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-sidebar-primary/30 blur-md"
                    animate={{
                      opacity: [0.5, 0.8, 0.5],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <Sparkles className="relative z-10 h-5 w-5 text-sidebar-primary-foreground" />
                </motion.div>

                {/* Enhanced Typography */}
                <div className="flex flex-col">
                  <motion.span
                    className="text-lg font-bold bg-linear-to-r from-sidebar-foreground via-sidebar-foreground to-sidebar-foreground/80 bg-clip-text text-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    Dashboard
                  </motion.span>
                  <motion.span
                    className="text-[10px] font-medium text-sidebar-foreground/50 uppercase tracking-wider"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Admin Panel
                  </motion.span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                  className="relative z-10 flex items-center justify-center"
                >
                  <motion.div
                    className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-sidebar-primary via-sidebar-primary/90 to-sidebar-primary/80 shadow-lg shadow-sidebar-primary/20"
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-sidebar-primary/30 blur-md"
                      animate={{
                        opacity: [0.5, 0.8, 0.5],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <Sparkles className="relative z-10 h-5 w-5 text-sidebar-primary-foreground" />
                  </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Collapse Button */}
          <motion.div
            className="relative z-10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="hidden h-9 w-9 rounded-lg text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:flex"
              onClick={toggleCollapse}
            >
              <motion.div
                animate={{ rotate: isCollapsed ? 0 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </motion.div>
            </Button>
          </motion.div>
        </div>

        {/* Navigation */}
        <Sidebar
          navItems={navItems}
          pathname={pathname}
          isCollapsed={isCollapsed}
          closeMobileSidebar={closeMobileSidebar}
        />

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3">
          <div
            className={cn(
              "mb-3 flex items-center gap-3 rounded-lg bg-sidebar-accent/30 p-2",
              isCollapsed && "justify-center",
            )}
          >
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 overflow-hidden"
                >
                  <p className="truncate text-sm font-medium">{user?.name}</p>
                  <p className="truncate text-xs text-sidebar-foreground/60">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            onClick={() => logout()}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive",
              isCollapsed && "justify-center",
            )}
            whileHover={{ x: isCollapsed ? 0 : 5 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  Log out
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.aside>
    </>
  )
}
