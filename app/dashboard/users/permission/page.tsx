 "use client"
 
 import { useMemo } from "react"
 import { type ColumnDef } from "@tanstack/react-table"
 import { Shield, ListChecks, Users, PlusCircle, Calendar } from "lucide-react"
 import { AnimateCard, AnimateCardHeader, AnimateCardTitle, AnimateCardContent } from "@/components/animate/animate-card"
 import { FadeIn } from "@/components/animate/page-transition"
 import { DataTable } from "@/components/data-table"
 import { Badge } from "@/components/ui/badge"
 import { Button } from "@/components/ui/button"
 
 interface Permission {
   id: string
   name: string
   description: string
   module: string
   rolesAssigned: number
   updatedAt: string
 }
 
 const mockPermissions: Permission[] = [
   {
     id: "perm-1",
     name: "Manage Users",
     description: "Create, update, and delete user accounts",
     module: "Users",
     rolesAssigned: 3,
     updatedAt: "Mar 05, 2024",
   },
   {
     id: "perm-2",
     name: "View Analytics",
     description: "Access analytics dashboards and reports",
     module: "Analytics",
     rolesAssigned: 4,
     updatedAt: "Feb 18, 2024",
   },
   {
     id: "perm-3",
     name: "Manage Billing",
     description: "Handle invoices, subscriptions, and refunds",
     module: "Billing",
     rolesAssigned: 2,
     updatedAt: "Mar 20, 2024",
   },
   {
     id: "perm-4",
     name: "Edit Content",
     description: "Create and update knowledge base content",
     module: "Content",
     rolesAssigned: 5,
     updatedAt: "Jan 30, 2024",
   },
 ]
 
 export default function PermissionsPage() {
   const columns = useMemo<ColumnDef<Permission>[]>(
     () => [
       {
         accessorKey: "name",
         header: "Permission",
         cell: ({ row }) => (
           <div>
             <p className="font-medium">{row.original.name}</p>
             <p className="text-sm text-muted-foreground">{row.original.description}</p>
           </div>
         ),
       },
       {
         accessorKey: "module",
         header: "Module",
         cell: ({ row }) => <Badge variant="outline">{row.original.module}</Badge>,
       },
       {
         accessorKey: "rolesAssigned",
         header: "Roles Assigned",
         cell: ({ row }) => (
           <div className="flex items-center gap-2">
             <Users className="h-4 w-4 text-muted-foreground" />
             <span>{row.original.rolesAssigned}</span>
           </div>
         ),
       },
       {
         accessorKey: "updatedAt",
         header: "Last Updated",
         cell: ({ row }) => (
           <div className="flex items-center gap-2 text-sm text-muted-foreground">
             <Calendar className="h-4 w-4" />
             {row.original.updatedAt}
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
             <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Permissions</h1>
             <p className="text-muted-foreground">Control access to different areas and actions within the platform.</p>
           </div>
           <Button size="lg" className="gap-2">
             <PlusCircle className="h-4 w-4" />
             Add New Permission
           </Button>
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
               <p className="text-2xl font-semibold">{mockPermissions.length}</p>
             </div>
           </AnimateCardContent>
         </AnimateCard>
 
         <AnimateCard hover={false}>
           <AnimateCardContent className="flex items-center gap-4 p-6">
             <div className="rounded-full bg-primary/10 p-3">
               <ListChecks className="h-6 w-6 text-primary" />
             </div>
             <div>
               <p className="text-sm text-muted-foreground">Modules Covered</p>
               <p className="text-2xl font-semibold">{new Set(mockPermissions.map((p) => p.module)).size}</p>
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
             data={mockPermissions}
             searchKey="name"
             searchPlaceholder="Search permissions..."
             filterOptions={[
               {
                 key: "module",
                 label: "Module",
                 options: Array.from(new Set(mockPermissions.map((p) => p.module))).map((module) => ({
                   label: module,
                   value: module,
                 })),
               },
             ]}
           />
         </AnimateCardContent>
       </AnimateCard>
     </div>
   )
 }

