"use client"

import { useState, useMemo, useCallback } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Mail, Shield, UserCog, Trash2, Plus } from "lucide-react"
import { AnimateCard, AnimateCardHeader, AnimateCardTitle, AnimateCardContent } from "@/components/animate/animate-card"
import { AnimateButton } from "@/components/animate/animate-button"
import { FadeIn } from "@/components/animate/page-transition"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user" | "viewer"
  status: "active" | "inactive" | "pending"
  avatar: string
  joinedAt: string
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    status: "active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    joinedAt: "Jan 15, 2024",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    status: "active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
    joinedAt: "Feb 20, 2024",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "viewer",
    status: "pending",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
    joinedAt: "Mar 10, 2024",
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice@example.com",
    role: "user",
    status: "active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
    joinedAt: "Mar 25, 2024",
  },
  {
    id: "5",
    name: "Charlie Wilson",
    email: "charlie@example.com",
    role: "viewer",
    status: "inactive",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=charlie",
    joinedAt: "Apr 5, 2024",
  },
]

const roleColors = {
  admin: "bg-primary/10 text-primary",
  user: "bg-blue-500/10 text-blue-600",
  viewer: "bg-gray-500/10 text-gray-600",
}
const statusColors = {
  active: "bg-green-500/10 text-green-600",
  inactive: "bg-red-500/10 text-red-600",
  pending: "bg-yellow-500/10 text-yellow-600",
}

export default function UsersPage() {
  const [users, setUsers] = useState(mockUsers)

  const handleDeleteUser = useCallback(
    (userId: string) => setUsers((prev) => prev.filter((u) => u.id !== userId)),
    [],
  )

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(value) => table.toggleAllPageRowsSelected((value.target as HTMLInputElement).checked)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={row.getIsSelected()}
            onChange={(value) => row.toggleSelected((value.target as HTMLInputElement).checked)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        accessorKey: "serial",
        header: "SL No.",
        cell: ({ row }) => <span className="text-sm text-muted-foreground text-center">{row.index + 1}</span>,
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge variant="outline" className={roleColors[row.original.role]}>
            {row.original.role}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant="outline" className={statusColors[row.original.status]}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "joinedAt",
        header: "Joined",
        cell: ({ row }) => <span className="text-sm text-muted-foreground text-center">{row.original.joinedAt}</span>,
      },
      {
        id: "actions",
        header: () => <div className="text-center pr-2">Actions</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-center pr-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <UserCog className="mr-2 h-4 w-4" />
                  Edit User
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Shield className="mr-2 h-4 w-4" />
                  Change Role
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => handleDeleteUser(row.original.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [handleDeleteUser],
  )

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Users</h1>
            <p className="text-muted-foreground">Manage your team members and their roles.</p>
          </div>
          <AnimateButton leftIcon={<Plus className="h-4 w-4" />}>Add User</AnimateButton>
        </div>
      </FadeIn>

      <AnimateCard delay={0.2}>
        <AnimateCardHeader>
          <AnimateCardTitle>Team Members</AnimateCardTitle>
        </AnimateCardHeader>
        <AnimateCardContent>
          <DataTable
            columns={columns}
            data={users}
            searchKey="name"
            searchPlaceholder="Search users..."
            filterOptions={[
              {
                key: "role",
                label: "Role",
                options: [
                  { label: "Admin", value: "admin" },
                  { label: "User", value: "user" },
                  { label: "Viewer", value: "viewer" },
                ],
              },
            ]}
          />
        </AnimateCardContent>
      </AnimateCard>
    </div>
  )
}
