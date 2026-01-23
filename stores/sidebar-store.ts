"use client"

import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

interface SidebarState {
  isOpen: boolean
  isCollapsed: boolean
  isMobile: boolean
  
  // Actions
  toggleSidebar: () => void
  toggleCollapse: () => void
  closeMobileSidebar: () => void
  setIsMobile: (isMobile: boolean) => void
}

export const useSidebarStore = create<SidebarState>()(
  subscribeWithSelector((set) => ({
    isOpen: false,
    isCollapsed: false,
    isMobile: false,

    toggleSidebar: () => {
      set((state) => ({ isOpen: !state.isOpen }))
    },

    toggleCollapse: () => {
      set((state) => ({ isCollapsed: !state.isCollapsed }))
    },

    closeMobileSidebar: () => {
      set({ isOpen: false })
    },

    setIsMobile: (isMobile: boolean) => {
      set({ isMobile })
    },
  }))
)
