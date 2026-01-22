"use client"

import { useState, useMemo, useEffect } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { ShieldPlus, Users } from "lucide-react"
import { AnimateCard, AnimateCardHeader, AnimateCardTitle, AnimateCardContent } from "@/components/animate/animate-card"
import { FadeIn } from "@/components/animate/page-transition"
import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { rolesApi } from "@/lib/api"

// Role type for table display
interface Role {
  id: string
  name: string
  members: number
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
      <div className="space-y-6">
        <FadeIn>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Roles</h1>
            <p className="text-muted-foreground">Define permissions and access levels for your team.</p>
          </div>
        </FadeIn>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24" />
        </div>
        <AnimateCard delay={0.2}>
          <AnimateCardHeader>
            <AnimateCardTitle>Role Directory</AnimateCardTitle>
          </AnimateCardHeader>
          <AnimateCardContent>
            <div className="space-y-4">
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
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Roles</h1>
          <p className="text-muted-foreground">Define permissions and access levels for your team.</p>
        </div>
      </FadeIn>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnimateCard hover={false}>
          <AnimateCardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-primary/10 p-3">
              <ShieldPlus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Roles</p>
              <p className="text-2xl font-semibold">{roles.length}</p>
            </div>
          </AnimateCardContent>
        </AnimateCard>
      </div>

      <AnimateCard>
        <AnimateCardHeader>
          <AnimateCardTitle>Role Directory</AnimateCardTitle>
        </AnimateCardHeader>
        <AnimateCardContent>
          <DataTable
            columns={columns}
            data={roles}
            searchKey="name"
            searchPlaceholder="Search roles..."
          />
        </AnimateCardContent>
      </AnimateCard>
    </div>
  )
}
