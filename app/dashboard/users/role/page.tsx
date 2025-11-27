 "use client"
 
 import { useMemo } from "react"
 import { type ColumnDef } from "@tanstack/react-table"
 import { ShieldPlus, Users, Calendar, PlusCircle } from "lucide-react"
 import { AnimateCard, AnimateCardHeader, AnimateCardTitle, AnimateCardContent } from "@/components/animate/animate-card"
 import { FadeIn } from "@/components/animate/page-transition"
 import { DataTable } from "@/components/data-table"
 import { Badge } from "@/components/ui/badge"
 import { Button } from "@/components/ui/button"
 
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
 
 export default function RolesPage() {
   const columns = useMemo<ColumnDef<Role>[]>(
     () => [
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
           <Button size="lg" className="gap-2">
             <PlusCircle className="h-4 w-4" />
             Add New Role
           </Button>
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
            data={mockRoles}
            searchKey="name"
            searchPlaceholder="Search roles..."
            filterOptions={[
              {
                key: "name",
                label: "Role",
                options: mockRoles.map((role) => ({ label: role.name, value: role.name })),
              },
            ]}
          />
        </AnimateCardContent>
      </AnimateCard>
    </div>
  )
}

