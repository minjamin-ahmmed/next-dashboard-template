"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Plus, Shield, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AnimateCard, AnimateCardHeader, AnimateCardTitle, AnimateCardContent } from "@/components/animate/animate-card"
import { FadeIn } from "@/components/animate/page-transition"
import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { permissionsApi, type ApiPermission } from "@/lib/api"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { AnimateButton } from "@/components/animate/animate-button"
import { useToast } from "@/hooks/use-toast"
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

// Form validation schema for Create Permission
const createPermissionFormSchema = z.object({
  name: z.string().min(2, "Permission name must be at least 2 characters"),
  guard_name: z.string().optional(),
})

type CreatePermissionFormValues = z.infer<typeof createPermissionFormSchema>

// Form validation schema for Edit Permission
const editPermissionFormSchema = z.object({
  name: z.string().min(2, "Permission name must be at least 2 characters"),
  guard_name: z.string().optional(),
})

type EditPermissionFormValues = z.infer<typeof editPermissionFormSchema>

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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<ApiPermission | null>(null)
  const [deletingPermission, setDeletingPermission] = useState<ApiPermission | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const createForm = useForm<CreatePermissionFormValues>({
    resolver: zodResolver(createPermissionFormSchema),
    defaultValues: {
      name: "",
      guard_name: "",
    },
  })

  const editForm = useForm<EditPermissionFormValues>({
    resolver: zodResolver(editPermissionFormSchema),
    defaultValues: {
      name: "",
      guard_name: "",
    },
  })

  // Filter permissions for mobile view
  const filteredPermissions = useMemo(() => {
    if (!permissions || permissions.length === 0) return []
    if (!mobileSearch.trim()) return permissions
    const searchLower = mobileSearch.toLowerCase()
    return permissions.filter((permission) => permission?.name?.toLowerCase().includes(searchLower))
  }, [permissions, mobileSearch])

  // Fetch permissions from API
  const fetchPermissions = async () => {
    try {
      setIsLoading(true)
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

  useEffect(() => {
    fetchPermissions()
  }, [])

  // Handle create permission form submit
  const onCreateSubmit = async (values: CreatePermissionFormValues) => {
    setIsSubmitting(true)
    try {
      const response = await permissionsApi.createPermission({
        name: values.name,
        guard_name: values.guard_name,
      })

      if (response.status === "success" || response.status === "Success") {
        setIsCreateDialogOpen(false)
        createForm.reset()
        toast({
          title: "Permission created successfully",
          description: response.message || "Permission has been created.",
        })
        fetchPermissions() // Refresh permissions list
      } else {
        throw new Error(response.message || "Failed to create permission")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create permission"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open edit dialog
  const openEditDialog = useCallback((permission: ApiPermission) => {
    setEditingPermission(permission)
    editForm.reset({
      name: permission.name,
      guard_name: permission.guard_name || "",
    })
    setIsEditDialogOpen(true)
  }, [editForm])

  // Open delete dialog
  const openDeleteDialog = useCallback((permission: ApiPermission) => {
    setDeletingPermission(permission)
    setIsDeleteDialogOpen(true)
  }, [])

  // Handle edit permission form submit
  const onEditSubmit = async (values: EditPermissionFormValues) => {
    if (!editingPermission) return

    setIsSubmitting(true)
    try {
      const response = await permissionsApi.updatePermission(editingPermission.id, {
        name: values.name,
        guard_name: values.guard_name,
      })

      if (response.status === "success" || response.status === "Success") {
        setIsEditDialogOpen(false)
        setEditingPermission(null)
        editForm.reset()
        toast({
          title: "Permission updated successfully",
          description: response.message || "Permission has been updated.",
        })
        fetchPermissions() // Refresh permissions list
      } else {
        throw new Error(response.message || "Failed to update permission")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update permission"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete permission
  const onDeleteSubmit = async () => {
    if (!deletingPermission) return

    setIsSubmitting(true)
    try {
      const response = await permissionsApi.deletePermission(deletingPermission.id)

      if (response.status === "success" || response.status === "Success") {
        setIsDeleteDialogOpen(false)
        setDeletingPermission(null)
        toast({
          title: "Permission deleted successfully",
          description: response.message || "Permission has been deleted.",
        })
        fetchPermissions() // Refresh permissions list
      } else {
        throw new Error(response.message || "Failed to delete permission")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete permission"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => {
          const permission = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEditDialog(permission)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => openDeleteDialog(permission)}
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
    [openEditDialog, openDeleteDialog],
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
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Permissions</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Control access to different areas and actions within the platform.</p>
        </div>
        <div>
            <Button 
              variant="default" 
              className="w-full sm:w-auto"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Permission
            </Button>
          </div> 
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

      {/* Create Permission Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (!open) createForm.reset()
        }}
      >
        <DialogContent className="w-[95vw] max-w-md sm:w-full">
          <DialogHeader>
            <DialogTitle>Create New Permission</DialogTitle>
            <DialogDescription>Add a new permission to control access within the platform.</DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permission Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., user-create, user-edit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="guard_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guard Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., web" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <AnimateButton type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
                  Create Permission
                </AnimateButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Permission Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setEditingPermission(null)
            editForm.reset()
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-md sm:w-full">
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
            <DialogDescription>Update permission information.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permission Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., user-create, user-edit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="guard_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guard Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., web" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <AnimateButton type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
                  Update Permission
                </AnimateButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Permission Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the permission{" "}
              <strong>{deletingPermission?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteSubmit}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
