"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  ArrowLeft,
  ShieldPlus,
  Users,
  Calendar,
  Save,
  Shield,
  ListChecks,
} from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  AnimateCard,
  AnimateCardContent,
  AnimateCardDescription,
  AnimateCardHeader,
  AnimateCardTitle,
} from "@/components/animate/animate-card"
import { AnimateButton } from "@/components/animate/animate-button"
import { FadeIn, SlideIn } from "@/components/animate/page-transition"
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
import { Badge } from "@/components/ui/badge"
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

export default function UpdateRolePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleId = searchParams.get("id")
  const { toast } = useToast()

  const [role, setRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  })

  useEffect(() => {
    if (!roleId) {
      router.push("/dashboard/users/role")
      return
    }

    const foundRole = mockRoles.find((r) => r.id === roleId)

    if (foundRole) {
      setRole(foundRole)
      form.reset({
        name: foundRole.name,
        description: foundRole.description,
        permissions: foundRole.permissions,
      })
      setIsLoading(false)
    } else {
      toast({
        title: "Role not found",
        description: "The role you're trying to edit doesn't exist.",
        variant: "destructive",
      })
      router.push("/dashboard/users/role")
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleId])

  const onSubmit = async (values: FormValues) => {
    if (!role) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const updatedRole: Role = {
      ...role,
      name: values.name,
      description: values.description,
      permissions: values.permissions,
    }

    setRole(updatedRole)
    setIsLoading(false)

    toast({
      title: "Role updated successfully",
      description: `${values.name} role has been updated.`,
    })

    setTimeout(() => {
      router.push("/dashboard/users/role")
    }, 1500)
  }

  if (isLoading || !role) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading role data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <FadeIn>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/users">Users</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/users/role">Role Management</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit Role</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </FadeIn>

      {/* Header */}
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <AnimateButton
              type="button"
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => router.push("/dashboard/users/role")}
            >
            
            </AnimateButton>
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Edit Role</h1>
              <p className="text-muted-foreground">
                Update role details, description and associated permissions.
              </p>
            </div>
          </div>
        </div>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Role Info Card */}
        <AnimateCard delay={0.1} className="lg:col-span-1">
          <AnimateCardHeader>
            <AnimateCardTitle>Role Overview</AnimateCardTitle>
            <AnimateCardDescription>Current role details</AnimateCardDescription>
          </AnimateCardHeader>
          <AnimateCardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <ShieldPlus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{role.name}</h3>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Members
                </span>
                <span className="text-sm font-medium">{role.members}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Created
                </span>
                <span className="text-sm font-medium">{role.createdAt}</span>
              </div>

              <div className="space-y-2">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Permissions
                </span>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map((permission) => (
                    <Badge key={permission} variant="outline">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </AnimateCardContent>
        </AnimateCard>

        {/* Edit Form */}
        <AnimateCard delay={0.2} className="lg:col-span-2">
          <AnimateCardHeader>
            <AnimateCardTitle>Edit Role Details</AnimateCardTitle>
            <AnimateCardDescription>
              Change the role name, description and permissions below.
            </AnimateCardDescription>
          </AnimateCardHeader>
          <AnimateCardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <SlideIn direction="right" delay={0.1}>
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
                  </SlideIn>

                  <SlideIn direction="right" delay={0.15}>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={4}
                              placeholder="Describe the role's responsibilities and access level..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </SlideIn>
                </div>

                <SlideIn direction="right" delay={0.2}>
                  <FormField
                    control={form.control}
                    name="permissions"
                    render={() => (
                      <FormItem>
                        <div className="mb-4 flex items-center justify-between gap-2">
                          <div>
                            <FormLabel>Permissions</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Select which modules this role can access.
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <ListChecks className="h-3 w-3" />
                            <span>{form.watch("permissions")?.length ?? 0} selected</span>
                          </div>
                        </div>
                        <div className="grid max-h-[220px] grid-cols-2 gap-3 overflow-y-auto rounded-lg border p-4 sm:grid-cols-3">
                          {availablePermissions.map((permission) => (
                            <FormField
                              key={permission}
                              control={form.control}
                              name="permissions"
                              render={({ field }) => {
                                const isChecked = field.value?.includes(permission)
                                return (
                                  <FormItem
                                    key={permission}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={isChecked}
                                        onCheckedChange={(checked) => {
                                          if (checked && !isChecked) {
                                            field.onChange([...field.value, permission])
                                          } else if (!checked && isChecked) {
                                            field.onChange(
                                              field.value?.filter((value) => value !== permission),
                                            )
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="cursor-pointer text-sm font-normal">
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
                </SlideIn>

                <div className="flex flex-col-reverse gap-4 border-t pt-4 sm:flex-row sm:justify-end">
                  <AnimateButton
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/users/role")}
                  >
                    Cancel
                  </AnimateButton>
                  <AnimateButton
                    type="submit"
                    isLoading={isLoading}
                    leftIcon={<Save className="h-4 w-4" />}
                  >
                    Save Changes
                  </AnimateButton>
                </div>
              </form>
            </Form>
          </AnimateCardContent>
        </AnimateCard>
      </div>
    </div>
  )
}

