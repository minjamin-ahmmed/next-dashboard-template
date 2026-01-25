"use client"

import { useState, useMemo, useEffect } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { Shield } from "lucide-react"
import { AnimateCard, AnimateCardHeader, AnimateCardTitle, AnimateCardContent } from "@/components/animate/animate-card"
import { FadeIn } from "@/components/animate/page-transition"
import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { permissionsApi, type ApiPermission } from "@/lib/api"

// Mobile Card Component for individual permission
function MobilePermissionCard({
  permission,
  index,
}: {
  permission: ApiPermission
  index: number
}) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">#{index + 1}</span>
        <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
          {permission.name}
        </Badge>
      </div>
    </div>
  )
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<ApiPermission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mobileSearch, setMobileSearch] = useState("")

  // Filter permissions for mobile view
  const filteredPermissions = useMemo(() => {
    if (!permissions || permissions.length === 0) return []
    if (!mobileSearch.trim()) return permissions
    const searchLower = mobileSearch.toLowerCase()
    return permissions.filter((permission) => permission?.name?.toLowerCase().includes(searchLower))
  }, [permissions, mobileSearch])

  // Fetch permissions from API
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await permissionsApi.getPermissions()
        if (response.status === "success" || response.status === "Success") {
          setPermissions(response.permissions || [])
        } else {
          setPermissions([])
        }
      } catch (err) {
        console.error("Failed to fetch permissions:", err)
        setPermissions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPermissions()
  }, [])

  const columns = useMemo<ColumnDef<ApiPermission>[]>(
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
      <div className="space-y-4 sm:space-y-6">
        <FadeIn>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Permissions</h1>
            <p className="text-sm text-muted-foreground sm:text-base">Control access to different areas and actions within the platform.</p>
          </div>
        </FadeIn>
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-20 sm:h-24" />
        </div>
        <AnimateCard delay={0.2}>
          <AnimateCardHeader className="px-4 py-3 sm:px-6 sm:py-4">
            <AnimateCardTitle className="text-base sm:text-lg">Permission Directory</AnimateCardTitle>
          </AnimateCardHeader>
          <AnimateCardContent className="p-4 sm:p-6">
            {/* Mobile skeleton */}
            <div className="space-y-3 md:hidden">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
            {/* Desktop skeleton */}
            <div className="hidden md:block space-y-4">
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
    <div className="space-y-4 sm:space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Permissions</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Control access to different areas and actions within the platform.</p>
        </div>
      </FadeIn>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnimateCard hover={false}>
          <AnimateCardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-6">
            <div className="rounded-full bg-primary/10 p-2.5 sm:p-3">
              <Shield className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground sm:text-sm">Total Permissions</p>
              <p className="text-xl font-semibold sm:text-2xl">{permissions?.length || 0}</p>
            </div>
          </AnimateCardContent>
        </AnimateCard>
      </div>

      <AnimateCard>
        <AnimateCardHeader className="px-4 py-3 sm:px-6 sm:py-4">
          <AnimateCardTitle className="text-base sm:text-lg">Permission Directory</AnimateCardTitle>
        </AnimateCardHeader>
        <AnimateCardContent className="p-4 sm:p-6">
          {/* Mobile View - Card Layout */}
          <div className="md:hidden space-y-4">
            <Input
              placeholder="Search permissions..."
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              className="h-10"
            />
            <div className="space-y-3">
              {filteredPermissions.length > 0 ? (
                filteredPermissions.map((permission, index) => (
                  <MobilePermissionCard
                    key={permission.id}
                    permission={permission}
                    index={index}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No permissions found.
                </div>
              )}
            </div>
            {filteredPermissions && filteredPermissions.length > 0 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                Showing {filteredPermissions.length} of {permissions?.length || 0} permissions
              </p>
            )}
          </div>

          {/* Desktop View - Table Layout */}
          <div className="hidden md:block">
            <DataTable
              columns={columns}
              data={permissions}
              searchKey="name"
              searchPlaceholder="Search permissions..."
            />
          </div>
        </AnimateCardContent>
      </AnimateCard>
    </div>
  )
}
