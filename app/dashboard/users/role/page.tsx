"use client"

import { useState, useMemo } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ShieldPlus, Users, Calendar, PlusCircle } from "lucide-react"
import { AnimateCard, AnimateCardHeader, AnimateCardTitle, AnimateCardContent } from "@/components/animate/animate-card"
import { AnimateButton } from "@/components/animate/animate-button"
import { FadeIn } from "@/components/animate/page-transition"
import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
 
 interface Role {
   id: string
   name: string
   description: string
   members: number
   permissions: string[]
   createdAt: string
 }
 
const mockRoles: Role[] = [
  {
    id: "1",
    name: "Administrator",
    description: "Full system access and configuration rights",
    members: 4,
    permissions: ["Users", "Analytics", "Billing"],
    createdAt: "Jan 05, 2024",
  },
  {
    id: "2",
    name: "Project Manager",
    description: "Manage teams, projects and reports",
    members: 12,
    permissions: ["Projects", "Tasks", "Reports"],
    createdAt: "Feb 12, 2024",
  },
  {
    id: "3",
    name: "Support",
    description: "Assist customers and manage tickets",
    members: 7,
    permissions: ["Tickets", "Knowledge Base"],
    createdAt: "Mar 01, 2024",
  },
  {
    id: "4",
    name: "Viewer",
    description: "Read-only access to dashboards",
    members: 15,
    permissions: ["Dashboard"],
    createdAt: "Mar 22, 2024",
  },
]

const availablePermissions = [
  "Users",
  "Analytics",
  "Billing",
  "Projects",
  "Tasks",
  "Reports",
  "Tickets",
  "Knowledge Base",
  "Dashboard",
  "Settings",
]

const formSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  permissions: z.array(z.string()).min(1, "Please select at least one permission"),
})

type FormValues = z.infer<typeof formSchema>

export default function RolesPage() {
  const [roles, setRoles] = useState(mockRoles)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  })

  const onSubmit = (values: FormValues) => {
    const newRole: Role = {
      id: crypto.randomUUID(),
      name: values.name,
      description: values.description,
      members: 0,
      permissions: values.permissions,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    }

    setRoles((prev) => [newRole, ...prev])
    setIsDialogOpen(false)
    form.reset()
    toast({
      title: "Role created successfully",
      description: `${values.name} role has been created.`,
    })
  }

  const columns = useMemo<ColumnDef<Role>[]>(
     () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <div>{row.original.id}</div>
        ),
      },
       {
         accessorKey: "name",
         header: "Role",
         cell: ({ row }) => (
           <div>
             <p className="font-medium">{row.original.name}</p>
             <p className="text-sm text-muted-foreground">{row.original.description}</p>
           </div>
         ),
       },
       {
         accessorKey: "permissions",
         header: "Permissions",
         cell: ({ row }) => (
           <div className="flex flex-wrap gap-1">
             {row.original.permissions.map((permission) => (
               <Badge key={permission} variant="outline">
                 {permission}
               </Badge>
             ))}
           </div>
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
         accessorKey: "createdAt",
         header: "Created",
         cell: ({ row }) => (
           <div className="flex items-center gap-2 text-sm text-muted-foreground">
             <Calendar className="h-4 w-4" />
             {row.original.createdAt}
           </div>
         ),
       },
     ],
     [],
   )
 
   return (
     <div className="space-y-6">
       <FadeIn>
         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
           <div>
             <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Roles</h1>
             <p className="text-muted-foreground">Define permissions and access levels for your team.</p>
           </div>
          <AnimateButton leftIcon={<PlusCircle className="h-4 w-4" />} onClick={() => setIsDialogOpen(true)}>
            Add New Role
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
            <DialogTitle>Add New Role</DialogTitle>
            <DialogDescription>Create a new role with specific permissions and access levels.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Project Manager" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the role's responsibilities and access level..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Permissions</FormLabel>
                      <p className="text-sm text-muted-foreground">Select the permissions for this role</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto p-4 border rounded-lg">
                      {availablePermissions.map((permission) => (
                        <FormField
                          key={permission}
                          control={form.control}
                          name="permissions"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={permission}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(permission)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, permission])
                                        : field.onChange(
                                            field.value?.filter((value) => value !== permission),
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer text-sm">
                                  {permission}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
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
                  Create Role
                </AnimateButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
         <AnimateCard hover={false}>
           <AnimateCardContent className="flex items-center gap-4 p-6">
             <div className="rounded-full bg-primary/10 p-3">
               <ShieldPlus className="h-6 w-6 text-primary" />
             </div>
             <div>
               <p className="text-sm text-muted-foreground">Total Roles</p>
               <p className="text-2xl font-semibold">{mockRoles.length}</p>
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
            filterOptions={[
              {
                key: "name",
                label: "Role",
                options: roles.map((role) => ({ label: role.name, value: role.name })),
              },
            ]}
          />
        </AnimateCardContent>
      </AnimateCard>
    </div>
  )
}

