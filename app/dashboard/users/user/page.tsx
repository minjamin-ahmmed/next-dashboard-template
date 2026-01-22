"use client"

import { useState, useMemo, useEffect } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { Plus, MoreHorizontal, Pencil, Trash2, Calendar } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AnimateCard, AnimateCardHeader, AnimateCardTitle, AnimateCardContent } from "@/components/animate/animate-card"
import { AnimateButton } from "@/components/animate/animate-button"
import { FadeIn } from "@/components/animate/page-transition"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { usersApi, type ApiUser } from "@/lib/api"

// Form validation schema for Create
const createFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

// Form validation schema for Edit
const editFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
})

type CreateFormValues = z.infer<typeof createFormSchema>
type EditFormValues = z.infer<typeof editFormSchema>

// Helper function to format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

// Helper function to get primary role name
function getPrimaryRole(user: ApiUser): string {
  return user.roles.length > 0 ? user.roles[0].name : "No Role"
}

// Mobile Card Component for individual user
function MobileUserCard({
  user,
  index,
  onEdit,
  onDelete,
}: {
  user: ApiUser
  index: number
  onEdit: (user: ApiUser) => void
  onDelete: (id: number) => void
}) {
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
  const roleName = getPrimaryRole(user)

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">#{index + 1}</span>
              <p className="font-medium text-sm truncate">{user.name}</p>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(user.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1 border-t">
        <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
          {roleName}
        </Badge>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>Joined {formatDate(user.created_at)}</span>
        </div>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState<ApiUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null)
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [mobileSearch, setMobileSearch] = useState("")
  const { toast } = useToast()

  // Filter users for mobile view
  const filteredUsers = useMemo(() => {
    if (!mobileSearch.trim()) return users
    const searchLower = mobileSearch.toLowerCase()
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
    )
  }, [users, mobileSearch])

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  })

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const response = await usersApi.getUsers()
      if (response.status === "success") {
        setUsers(response.users.data)
      }
    } catch (err) {
      console.error("Failed to fetch users:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Handle create form submit
  const onCreateSubmit = async (values: CreateFormValues) => {
    setIsSubmitting(true)
    try {
      const response = await usersApi.register({
        name: values.name,
        email: values.email,
        password: values.password,
        roles: "user",
      })

      if (response.status === "success") {
        setIsCreateDialogOpen(false)
        createForm.reset()
        toast({
          title: "User created successfully",
          description: response.message,
        })
        fetchUsers()
      } else {
        throw new Error(response.message || "Failed to create user")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create user"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit form submit
  const onEditSubmit = async (values: EditFormValues) => {
    if (!editingUser) return

    setIsSubmitting(true)
    try {
      const response = await usersApi.updateUser(editingUser.id, {
        name: values.name,
        email: values.email,
        roles: editingUser.roles.map((r) => r.name.toLowerCase()),
      })

      if (response.status === "success") {
        setIsEditDialogOpen(false)
        setEditingUser(null)
        editForm.reset()
        toast({
          title: "User updated successfully",
          description: response.message,
        })
        fetchUsers()
      } else {
        throw new Error(response.message || "Failed to update user")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update user"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!deleteUserId) return

    setIsDeleting(true)
    try {
      const response = await usersApi.deleteUser(deleteUserId)
      if (response.status === "success") {
        toast({
          title: "User deleted",
          description: response.message,
        })
        fetchUsers()
      } else {
        throw new Error(response.message || "Failed to delete user")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete user"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteUserId(null)
    }
  }

  // Open edit dialog with user data
  const openEditDialog = (user: ApiUser) => {
    setEditingUser(user)
    editForm.reset({
      name: user.name,
      email: user.email,
    })
    setIsEditDialogOpen(true)
  }

  const columns = useMemo<ColumnDef<ApiUser>[]>(
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
        header: "User",
        cell: ({ row }) => {
          const user = row.original
          const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
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
        accessorKey: "roles",
        header: "Role",
        cell: ({ row }) => {
          const roleName = getPrimaryRole(row.original)
          return (
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {roleName}
            </Badge>
          )
        },
      },
      {
        accessorKey: "created_at",
        header: "Joined",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.created_at)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => {
          const user = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEditDialog(user)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteUserId(user.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
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
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Users</h1>
            <p className="text-sm text-muted-foreground sm:text-base">Manage your team members and their roles.</p>
          </div>
        </FadeIn>
        <AnimateCard delay={0.2}>
          <AnimateCardHeader className="px-4 py-3 sm:px-6 sm:py-4">
            <AnimateCardTitle className="text-base sm:text-lg">Team Members</AnimateCardTitle>
          </AnimateCardHeader>
          <AnimateCardContent className="p-4 sm:p-6">
            {/* Mobile skeleton */}
            <div className="space-y-3 md:hidden">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-lg" />
              ))}
            </div>
            {/* Desktop skeleton */}
            <div className="hidden md:block space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                </div>
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Users</h1>
            <p className="text-sm text-muted-foreground sm:text-base">Manage your team members and their roles.</p>
          </div>
          <AnimateButton 
            leftIcon={<Plus className="h-4 w-4" />} 
            onClick={() => setIsCreateDialogOpen(true)}
            className="w-full sm:w-auto"
          >
            Add New User
          </AnimateButton>
        </div>
      </FadeIn>

      {/* Create User Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (!open) createForm.reset()
        }}
      >
        <DialogContent className="w-[95vw] max-w-md sm:w-full">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account.</DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
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
                control={createForm.control}
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
                control={createForm.control}
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
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <AnimateButton type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
                  Create User
                </AnimateButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setEditingUser(null)
            editForm.reset()
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-md sm:w-full">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
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
                control={editForm.control}
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
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <AnimateButton type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
                  Update User
                </AnimateButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteUserId !== null} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent className="w-[95vw] max-w-md sm:w-full">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel disabled={isDeleting} className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AnimateCard delay={0.2}>
        <AnimateCardHeader className="px-4 py-3 sm:px-6 sm:py-4">
          <AnimateCardTitle className="text-base sm:text-lg">Team Members</AnimateCardTitle>
        </AnimateCardHeader>
        <AnimateCardContent className="p-4 sm:p-6">
          {/* Mobile View - Card Layout */}
          <div className="md:hidden space-y-4">
            <Input
              placeholder="Search users..."
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              className="h-10"
            />
            <div className="space-y-3">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <MobileUserCard
                    key={user.id}
                    user={user}
                    index={index}
                    onEdit={openEditDialog}
                    onDelete={setDeleteUserId}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No users found.
                </div>
              )}
            </div>
            {filteredUsers.length > 0 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                Showing {filteredUsers.length} of {users.length} users
              </p>
            )}
          </div>

          {/* Desktop View - Table Layout */}
          <div className="hidden md:block">
            <DataTable
              columns={columns}
              data={users}
              searchKey="name"
              searchPlaceholder="Search users..."
            />
          </div>
        </AnimateCardContent>
      </AnimateCard>
    </div>
  )
}
