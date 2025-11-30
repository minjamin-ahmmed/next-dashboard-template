"use client"

import { useState, useMemo, useCallback } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Mail, Shield, UserCog, Trash2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface User {
  id: string
  name: string
  email: string
  role: "super-admin" | "admin" | "editor" | "user" | "viewer"
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
  "super-admin": "bg-purple-500/10 text-purple-600",
  admin: "bg-primary/10 text-primary",
  editor: "bg-blue-500/10 text-blue-600",
  user: "bg-green-500/10 text-green-600",
  viewer: "bg-gray-500/10 text-gray-600",
}
const statusColors = {
  active: "bg-green-500/10 text-green-600",
  inactive: "bg-red-500/10 text-red-600",
  pending: "bg-yellow-500/10 text-yellow-600",
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["super-admin", "admin", "editor", "user", "viewer"], {
    required_error: "Please select a user type",
  }),
})

type FormValues = z.infer<typeof formSchema>



export default function UsersPage() {
  const [users, setUsers] = useState(mockUsers)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
    },
  })

  const handleDeleteUser = useCallback(
    (userId: string) => setUsers((prev) => prev.filter((u) => u.id !== userId)),
    [],
  )

  const onSubmit = (values: FormValues) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      name: values.name,
      email: values.email,
      role: values.role,
      status: "active",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${values.email}`,
      joinedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    }

    setUsers((prev) => [newUser, ...prev])
    setIsDialogOpen(false)
    form.reset()
    toast({
      title: "User added successfully",
      description: `${values.name} has been added to the team.`,
      variant: "default",
    })
  }

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
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/users/user/update?id=${row.original.id}`} className="flex items-center">
                    <UserCog className="mr-2 h-4 w-4" />
                    Edit User
                  </Link>
                </DropdownMenuItem>
                
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
          <AnimateButton leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsDialogOpen(true)}>
            Add User
          </AnimateButton>
        </div>
      </FadeIn>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            form.reset()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account. Fill in all the required information.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="super-admin">Super Admin</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    form.reset()
                  }}
                >
                  Cancel
                </Button>
                <AnimateButton type="submit" isLoading={form.formState.isSubmitting}>
                  Add User
                </AnimateButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
                  { label: "Super Admin", value: "super-admin" },
                  { label: "Admin", value: "admin" },
                  { label: "Editor", value: "editor" },
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
