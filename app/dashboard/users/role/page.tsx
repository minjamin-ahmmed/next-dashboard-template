"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Plus, ShieldPlus, Trash2, Users } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AnimateCard, AnimateCardHeader, AnimateCardTitle, AnimateCardContent } from "@/components/animate/animate-card"
import { AnimateButton } from "@/components/animate/animate-button"
import { FadeIn } from "@/components/animate/page-transition"
import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
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
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { rolesApi, permissionsApi, type ApiPermission } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Role type for table display
interface Role {
  id: number
  name: string
  members: number
  permissions: Array<{
    id: number
    name: string
  }>
}

// Form validation schema for Create Role
const createRoleFormSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  permissions: z.array(z.number()).min(1, "Please select at least one permission"),
})

type CreateRoleFormValues = z.infer<typeof createRoleFormSchema>

// Form validation schema for Edit Role (same as create)
const editRoleFormSchema = createRoleFormSchema
type EditRoleFormValues = CreateRoleFormValues

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
      <div className="flex items-center justify-between gap-3 mb-3">
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
      {role.permissions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Permissions:</p>
          <div className="flex flex-wrap gap-1.5">
            {role.permissions.map((perm) => (
              <Badge key={perm.id} variant="secondary" className="text-xs">
                {perm.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mobileSearch, setMobileSearch] = useState("")
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [permissions, setPermissions] = useState<ApiPermission[]>([])
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const permissionsFetchedRef = useRef(false)
  const editPermissionsFetchedRef = useRef(false)
  const lastEditedRoleIdRef = useRef<number | null>(null)
  const editFormSetRef = useRef<number | null>(null)
  const { toast } = useToast()

  const createRoleForm = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleFormSchema),
    defaultValues: {
      name: "",
      permissions: [],
    },
  })

  const editRoleForm = useForm<EditRoleFormValues>({
    resolver: zodResolver(editRoleFormSchema),
    defaultValues: {
      name: "",
      permissions: [],
    },
  })

  // Filter roles for mobile view
  const filteredRoles = useMemo(() => {
    if (!mobileSearch.trim()) return roles
    const searchLower = mobileSearch.toLowerCase()
    return roles.filter((role) => role.name.toLowerCase().includes(searchLower))
  }, [roles, mobileSearch])

  // Fetch roles from API
  const fetchRoles = async () => {
    try {
      setIsLoading(true)
      // Fetch both role list and role wise users
      const [rolesResponse, usersResponse] = await Promise.all([
        rolesApi.getRoles(),
        rolesApi.getRoleWiseUsers(),
      ])

      const isRolesSuccess = rolesResponse.status === "success" || rolesResponse.status === "Success"
      const isUsersSuccess = usersResponse.status === "success"
      
      if (isRolesSuccess) {
        // Transform roles array to match our Role interface
        const rolesArray: Role[] = rolesResponse.role.map((role) => ({
          id: role.id,
          name: role.name,
          members: isUsersSuccess
            ? (usersResponse.roles[role.name]?.length || 0)
            : 0,
          permissions: role.permissions.map((perm) => ({
            id: perm.id,
            name: perm.name,
          })),
        }))
        setRoles(rolesArray)
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  // Fetch permissions when create dialog opens
  useEffect(() => {
    if (isCreateDialogOpen && !permissionsFetchedRef.current) {
      permissionsFetchedRef.current = true
      setIsLoadingPermissions(true)
      const fetchPermissions = async () => {
        try {
          const response = await permissionsApi.getPermissions()
          if (response.status === "success" || response.status === "Success") {
            setPermissions(response.permissions || [])
          }
        } catch (err) {
          console.error("Failed to fetch permissions:", err)
          toast({
            title: "Error",
            description: "Failed to load permissions",
            variant: "destructive",
          })
          permissionsFetchedRef.current = false
        } finally {
          setIsLoadingPermissions(false)
        }
      }
      fetchPermissions()
    }
    
    // Reset ref when dialog closes
    if (!isCreateDialogOpen) {
      permissionsFetchedRef.current = false
    }
  }, [isCreateDialogOpen, toast])

  // Fetch permissions when edit dialog opens
  useEffect(() => {
    if (isEditDialogOpen && editingRole) {
      // Check if role changed
      const roleChanged = lastEditedRoleIdRef.current !== editingRole.id
      
      if (roleChanged) {
        editPermissionsFetchedRef.current = false
        editFormSetRef.current = null
        lastEditedRoleIdRef.current = editingRole.id
      }
      
      // Fetch permissions if needed
      if (!editPermissionsFetchedRef.current) {
        editPermissionsFetchedRef.current = true
        setIsLoadingPermissions(true)
        const fetchPermissions = async () => {
          try {
            const response = await permissionsApi.getPermissions()
            if (response.status === "success" || response.status === "Success") {
              setPermissions(response.permissions || [])
            }
          } catch (err) {
            console.error("Failed to fetch permissions:", err)
            toast({
              title: "Error",
              description: "Failed to load permissions",
              variant: "destructive",
            })
            editPermissionsFetchedRef.current = false
          } finally {
            setIsLoadingPermissions(false)
          }
        }
        fetchPermissions()
      }
    }
    
    // Reset refs when dialog closes
    if (!isEditDialogOpen) {
      editPermissionsFetchedRef.current = false
      lastEditedRoleIdRef.current = null
      editFormSetRef.current = null
    }
  }, [isEditDialogOpen, editingRole])

  // Set form values when permissions are loaded (only once per role)
  useEffect(() => {
    if (
      isEditDialogOpen && 
      editingRole && 
      permissions.length > 0 && 
      !isLoadingPermissions && 
      editFormSetRef.current !== editingRole.id
    ) {
      editFormSetRef.current = editingRole.id
      editRoleForm.reset({
        name: editingRole.name,
        permissions: editingRole.permissions.map((p) => p.id),
      })
    }
  }, [isEditDialogOpen, editingRole?.id, permissions.length, isLoadingPermissions])

  // Handle create role form submit
  const onCreateRoleSubmit = async (values: CreateRoleFormValues) => {
    setIsSubmitting(true)
    try {
      // Map permission IDs to permission names
      const permissionNames = values.permissions
        .map((permId) => {
          const permission = permissions.find((p) => p.id === permId)
          return permission?.name
        })
        .filter((name): name is string => Boolean(name))

      const response = await rolesApi.createRole({
        name: values.name,
        permission: permissionNames, // API expects permission names (strings)
      })

      if (response.status === "success" || response.status === "Success") {
        setIsCreateDialogOpen(false)
        createRoleForm.reset()
        toast({
          title: "Role created successfully",
          description: response.message || "Role has been created.",
        })
        fetchRoles() // Refresh roles list
      } else {
        throw new Error(response.message || "Failed to create role")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create role"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit role form submit
  const onEditRoleSubmit = async (values: EditRoleFormValues) => {
    if (!editingRole) return

    setIsSubmitting(true)
    try {
      // Map permission IDs to permission names
      const permissionNames = values.permissions
        .map((permId) => {
          const permission = permissions.find((p) => p.id === permId)
          return permission?.name
        })
        .filter((name): name is string => Boolean(name))

      const response = await rolesApi.updateRole(editingRole.id, {
        name: values.name,
        permission: permissionNames, // API expects permission names (strings)
      })

      if (response.status === "success" || response.status === "Success") {
        setIsEditDialogOpen(false)
        setEditingRole(null)
        editRoleForm.reset()
        toast({
          title: "Role updated successfully",
          description: response.message || "Role has been updated.",
        })
        fetchRoles() // Refresh roles list
      } else {
        throw new Error(response.message || "Failed to update role")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update role"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open edit dialog with role data
  const openEditDialog = (role: Role) => {
    setEditingRole(role)
    setIsEditDialogOpen(true)
  }

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
      {
        accessorKey: "permissions",
        header: "Permissions",
        cell: ({ row }) => {
          const permissions = row.original.permissions
          if (permissions.length === 0) {
            return <span className="text-sm text-muted-foreground">No permissions</span>
          }
          return (
            <div className="flex flex-wrap gap-1.5 max-w-md">
              {permissions.slice(0, 3).map((perm) => (
                <Badge key={perm.id} variant="secondary" className="text-xs">
                  {perm.name}
                </Badge>
              ))}
              {permissions.length > 3 && (
                <Badge 
                  variant="outline" 
                  className="text-xs cursor-pointer hover:bg-accent transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedRole(row.original)
                    setIsPermissionsDialogOpen(true)
                  }}
                >
                  +{permissions.length - 3} more
                </Badge>
              )}
            </div>
          )
        },
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => {
          const role = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEditDialog(role)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Roles</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Define permissions and access levels for your team.</p>
          </div>
          <div>
            <Button 
              variant="default" 
              className="w-full sm:w-auto"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Role
            </Button>
          </div>
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

      {/* Permissions Dialog */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Permissions for {selectedRole?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                {selectedRole.permissions.length} permission{selectedRole.permissions.length !== 1 ? 's' : ''} assigned
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedRole.permissions.map((perm) => (
                  <Badge key={perm.id} variant="secondary" className="text-sm">
                    {perm.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Role Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (!open) createRoleForm.reset()
        }}
      >
        <DialogContent className="w-[95vw] max-w-md sm:w-full">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>Add a new role with specific permissions.</DialogDescription>
          </DialogHeader>
          <Form {...createRoleForm}>
            <form onSubmit={createRoleForm.handleSubmit(onCreateRoleSubmit)} className="space-y-4">
              <FormField
                control={createRoleForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Editor, Viewer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createRoleForm.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Permissions</FormLabel>
                      {isLoadingPermissions && (
                        <p className="text-sm text-muted-foreground">Loading permissions...</p>
                      )}
                    </div>
                    {!isLoadingPermissions && permissions.length > 0 && (
                      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                        <div className="space-y-2">
                          {permissions.map((permission) => (
                            <FormField
                              key={permission.id}
                              control={createRoleForm.control}
                              name="permissions"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={permission.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(permission.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, permission.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== permission.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {permission.name}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                    {!isLoadingPermissions && permissions.length === 0 && (
                      <p className="text-sm text-muted-foreground">No permissions available</p>
                    )}
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
                  Create Role
                </AnimateButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setEditingRole(null)
            editRoleForm.reset()
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-md sm:w-full">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update role information and permissions.</DialogDescription>
          </DialogHeader>
          <Form {...editRoleForm}>
            <form onSubmit={editRoleForm.handleSubmit(onEditRoleSubmit)} className="space-y-4">
              <FormField
                control={editRoleForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Editor, Viewer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editRoleForm.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Permissions</FormLabel>
                      {isLoadingPermissions && (
                        <p className="text-sm text-muted-foreground">Loading permissions...</p>
                      )}
                    </div>
                    {!isLoadingPermissions && permissions.length > 0 && (
                      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                        <div className="space-y-2">
                          {permissions.map((permission) => (
                            <FormField
                              key={permission.id}
                              control={editRoleForm.control}
                              name="permissions"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={permission.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(permission.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, permission.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== permission.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {permission.name}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                    {!isLoadingPermissions && permissions.length === 0 && (
                      <p className="text-sm text-muted-foreground">No permissions available</p>
                    )}
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
                  Update Role
                </AnimateButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
