"use client"

import { useState, useMemo, useEffect } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { ShieldPlus, Users } from "lucide-react"
import { AnimateCard, AnimateCardHeader, AnimateCardTitle, AnimateCardContent } from "@/components/animate/animate-card"
import { FadeIn } from "@/components/animate/page-transition"
import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { rolesApi } from "@/lib/api"

// Role type for table display
interface Role {
  id: string
  name: string
  members: number
}

// Mobile Card Component for individual role
function MobileRoleCard({
  role,
  index,
}: {
  role: Role
  index: number
}) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">#{index + 1}</span>
          <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
            {role.name}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
          <Users className="h-4 w-4" />
          <span>{role.members} members</span>
        </div>
      </div>
    </div>
  )
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mobileSearch, setMobileSearch] = useState("")

  // Filter roles for mobile view
  const filteredRoles = useMemo(() => {
    if (!mobileSearch.trim()) return roles
    const searchLower = mobileSearch.toLowerCase()
    return roles.filter((role) => role.name.toLowerCase().includes(searchLower))
  }, [roles, mobileSearch])

  // Fetch roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        // Fetch both role list and role wise users
        const [rolesResponse, usersResponse] = await Promise.all([
          rolesApi.getRoles(),
          rolesApi.getRoleWiseUsers(),
        ])

        if (rolesResponse.status === "success") {
          // Transform roles object to array
          const rolesArray: Role[] = Object.entries(rolesResponse.roles).map(([id, name]) => ({
            id,
            name,
            members: usersResponse.status === "success"
              ? (usersResponse.roles[name]?.length || 0)
              : 0,
          }))
          setRoles(rolesArray)
        }
      } catch (err) {
        console.error("Failed to fetch roles:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoles()
  }, [])

  const columns = useMemo<ColumnDef<Role>[]>(
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
        header: "Role",
        cell: ({ row }) => (
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {row.original.name}
          </Badge>
        ),
      },
      {
        accessorKey: "members",
        header: "Members",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{row.original.members}</span>
          </div>
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
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Roles</h1>
            <p className="text-sm text-muted-foreground sm:text-base">Define permissions and access levels for your team.</p>
          </div>
        </FadeIn>
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-20 sm:h-24" />
        </div>
        <AnimateCard delay={0.2}>
          <AnimateCardHeader className="px-4 py-3 sm:px-6 sm:py-4">
            <AnimateCardTitle className="text-base sm:text-lg">Role Directory</AnimateCardTitle>
          </AnimateCardHeader>
          <AnimateCardContent className="p-4 sm:p-6">
            {/* Mobile skeleton */}
            <div className="space-y-3 md:hidden">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
            {/* Desktop skeleton */}
            <div className="hidden md:block space-y-4">
              {[...Array(3)].map((_, i) => (
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
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Roles</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Define permissions and access levels for your team.</p>
        </div>
      </FadeIn>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnimateCard hover={false}>
          <AnimateCardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-6">
            <div className="rounded-full bg-primary/10 p-2.5 sm:p-3">
              <ShieldPlus className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground sm:text-sm">Total Roles</p>
              <p className="text-xl font-semibold sm:text-2xl">{roles.length}</p>
            </div>
          </AnimateCardContent>
        </AnimateCard>
      </div>

      <AnimateCard>
        <AnimateCardHeader className="px-4 py-3 sm:px-6 sm:py-4">
          <AnimateCardTitle className="text-base sm:text-lg">Role Directory</AnimateCardTitle>
        </AnimateCardHeader>
        <AnimateCardContent className="p-4 sm:p-6">
          {/* Mobile View - Card Layout */}
          <div className="md:hidden space-y-4">
            <Input
              placeholder="Search roles..."
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              className="h-10"
            />
            <div className="space-y-3">
              {filteredRoles.length > 0 ? (
                filteredRoles.map((role, index) => (
                  <MobileRoleCard
                    key={role.id}
                    role={role}
                    index={index}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No roles found.
                </div>
              )}
            </div>
            {filteredRoles.length > 0 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                Showing {filteredRoles.length} of {roles.length} roles
              </p>
            )}
          </div>

          {/* Desktop View - Table Layout */}
          <div className="hidden md:block">
            <DataTable
              columns={columns}
              data={roles}
              searchKey="name"
              searchPlaceholder="Search roles..."
            />
          </div>
        </AnimateCardContent>
      </AnimateCard>
    </div>
  )
}
