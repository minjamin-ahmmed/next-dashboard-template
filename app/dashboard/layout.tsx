"use client"

import type React from "react"

import { SidebarProvider, SidebarWrapper } from "@/components/dashboard/sidebar-wrapper"
import { Navbar } from "@/components/dashboard/navbar"
import { PageTransition } from "@/components/animate/page-transition"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-muted/30">
        <SidebarWrapper />
        <div className="flex flex-1 flex-col">
          <Navbar />
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
