"use client"

import { useState, useMemo, useEffect } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { Shield } from "lucide-react"
import { AnimateCard, AnimateCardHeader, AnimateCardTitle, AnimateCardContent } from "@/components/animate/animate-card"
import { FadeIn } from "@/components/animate/page-transition"
import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { permissionsApi, type PermissionItem } from "@/lib/api"

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<PermissionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch permissions from API
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await permissionsApi.getPermissions()
        if (response.status === "success") {
          setPermissions(response.permission)
        }
      } catch (err) {
        console.error("Failed to fetch permissions:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPermissions()
  }, [])

  const columns = useMemo<ColumnDef<PermissionItem>[]>(
    () => [
      {
        accessorKey: "serial",
        header: "SL No.",
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.index + 1}</span>,
        enableSorting: false,
        size: 60,
      },
      {
        accessorKey: "name",
        header: "Permission",
        cell: ({ row }) => (
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {row.original.name}
          </Badge>
        ),
      },
    ],
    [],
  )

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <FadeIn>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Permissions</h1>
            <p className="text-muted-foreground">Control access to different areas and actions within the platform.</p>
          </div>
        </FadeIn>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24" />
        </div>
        <AnimateCard delay={0.2}>
          <AnimateCardHeader>
            <AnimateCardTitle>Permission Directory</AnimateCardTitle>
          </AnimateCardHeader>
          <AnimateCardContent>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </AnimateCardContent>
        </AnimateCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Permissions</h1>
          <p className="text-muted-foreground">Control access to different areas and actions within the platform.</p>
        </div>
      </FadeIn>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnimateCard hover={false}>
          <AnimateCardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-primary/10 p-3">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Permissions</p>
              <p className="text-2xl font-semibold">{permissions.length}</p>
            </div>
          </AnimateCardContent>
        </AnimateCard>
      </div>

      <AnimateCard>
        <AnimateCardHeader>
          <AnimateCardTitle>Permission Directory</AnimateCardTitle>
        </AnimateCardHeader>
        <AnimateCardContent>
          <DataTable
            columns={columns}
            data={permissions}
            searchKey="name"
            searchPlaceholder="Search permissions..."
          />
        </AnimateCardContent>
      </AnimateCard>
    </div>
  )
}
