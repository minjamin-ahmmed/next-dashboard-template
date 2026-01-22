"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, Save, Shield, Users, Calendar, Layers } from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

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

const availableModules = [
  "Users",
  "Analytics",
  "Billing",
  "Content",
  "Projects",
  "Tasks",
  "Reports",
  "Tickets",
  "Knowledge Base",
  "Dashboard",
  "Settings",
]

const formSchema = z.object({
  name: z.string().min(2, "Permission name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  module: z.string().min(1, "Please select a module"),
})

type FormValues = z.infer<typeof formSchema>

export default function UpdatePermissionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const permissionId = searchParams.get("id")
  const { toast } = useToast()

  const [permission, setPermission] = useState<Permission | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      module: "",
    },
  })

  useEffect(() => {
    if (!permissionId) {
      router.push("/dashboard/users/permission")
      return
    }

    const found = mockPermissions.find((p) => p.id === permissionId)
    if (found) {
      setPermission(found)
      form.reset({
        name: found.name,
        description: found.description,
        module: found.module,
      })
      setIsLoading(false)
    } else {
      toast({
        title: "Permission not found",
        description: "The permission you're trying to edit doesn't exist.",
        variant: "destructive",
      })
      router.push("/dashboard/users/permission")
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionId])

  const onSubmit = async (values: FormValues) => {
    if (!permission) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 900))

    const updatedAt = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

    const updatedPermission: Permission = {
      ...permission,
      name: values.name,
      description: values.description,
      module: values.module,
      updatedAt,
    }

    setPermission(updatedPermission)
    setIsLoading(false)

    toast({
      title: "Permission updated successfully",
      description: `${values.name} permission has been updated.`,
    })

    setTimeout(() => {
      router.push("/dashboard/users/permission")
    }, 1500)
  }

  if (isLoading || !permission) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading permission data...</p>
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
                <Link href="/dashboard/users/permission">Permission Management</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit Permission</BreadcrumbPage>
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
              onClick={() => router.push("/dashboard/users/permission")}
            >
          
            </AnimateButton>
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Edit Permission</h1>
              <p className="text-muted-foreground">Update permission name, description and module.</p>
            </div>
          </div>
        </div>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Overview */}
        <AnimateCard delay={0.1} className="lg:col-span-1">
          <AnimateCardHeader>
            <AnimateCardTitle>Permission Overview</AnimateCardTitle>
            <AnimateCardDescription>Current permission details</AnimateCardDescription>
          </AnimateCardHeader>
          <AnimateCardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{permission.name}</h3>
                <p className="text-sm text-muted-foreground">{permission.description}</p>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  Module
                </span>
                <Badge variant="outline">{permission.module}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Roles Assigned
                </span>
                <span className="text-sm font-medium">{permission.rolesAssigned}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Last Updated
                </span>
                <span className="text-sm font-medium">{permission.updatedAt}</span>
              </div>
            </div>
          </AnimateCardContent>
        </AnimateCard>

        {/* Form */}
        <AnimateCard delay={0.2} className="lg:col-span-2">
          <AnimateCardHeader>
            <AnimateCardTitle>Edit Permission Details</AnimateCardTitle>
            <AnimateCardDescription>Modify the permission fields below.</AnimateCardDescription>
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
                          <FormLabel>Permission Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Manage Users" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </SlideIn>

                  <SlideIn direction="right" delay={0.15}>
                    <FormField
                      control={form.control}
                      name="module"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Module</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a module" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableModules.map((module) => (
                                <SelectItem key={module} value={module}>
                                  {module}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </SlideIn>
                </div>

                <SlideIn direction="right" delay={0.2}>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what this permission allows users to do..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </SlideIn>

                <div className="flex flex-col-reverse gap-4 border-t pt-4 sm:flex-row sm:justify-end">
                  <AnimateButton
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/users/permission")}
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

