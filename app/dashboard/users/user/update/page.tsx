"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { ArrowLeft, Save, User, Mail, Lock, Shield, Calendar } from "lucide-react"
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
  AnimateCardHeader,
  AnimateCardTitle,
  AnimateCardDescription,
  AnimateCardContent,
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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  role: "super-admin" | "admin" | "editor" | "user" | "viewer"
  status: "active" | "inactive" | "pending"
  avatar: string
  joinedAt: string
}

// Mock users data - in real app, this would come from API/context
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
    role: "editor",
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

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().optional().or(z.literal("")),
  role: z.enum(["super-admin", "admin", "editor", "user", "viewer"], {
    required_error: "Please select a user type",
  }),
  status: z.enum(["active", "inactive", "pending"], {
    required_error: "Please select a status",
  }),
})

type FormValues = z.infer<typeof formSchema>

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

export default function UpdateUserPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get("id")
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
      status: "active",
    },
  })

  useEffect(() => {
    if (!userId) {
      router.push("/dashboard/users/user")
      return
    }

    // In real app, fetch user from API
    const foundUser = mockUsers.find((u) => u.id === userId)
    if (foundUser) {
      setUser(foundUser)
      form.reset({
        name: foundUser.name,
        email: foundUser.email,
        password: "",
        role: foundUser.role,
        status: foundUser.status,
      })
      setIsLoading(false)
    } else {
      toast({
        title: "User not found",
        description: "The user you're trying to edit doesn't exist.",
        variant: "destructive",
      })
      router.push("/dashboard/users/user")
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const onSubmit = async (values: FormValues) => {
    if (!user) return

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In real app, update user via API
    const updatedUser: User = {
      ...user,
      name: values.name,
      email: values.email,
      role: values.role,
      status: values.status,
    }

    setUser(updatedUser)
    setIsLoading(false)

    toast({
      title: "User updated successfully",
      description: `${values.name}'s information has been updated.`,
    })

    // Redirect back to users list after a short delay
    setTimeout(() => {
      router.push("/dashboard/users/user")
    }, 1500)
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading user data...</p>
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
                <Link href="/dashboard/users/user">User Management</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit User</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </FadeIn>

      {/* Header */}
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/dashboard/users/user")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Edit User</h1>
              <p className="text-muted-foreground">Update user information and permissions.</p>
            </div>
          </div>
        </div>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Info Card */}
        <AnimateCard delay={0.1} className="lg:col-span-1">
          <AnimateCardHeader>
            <AnimateCardTitle>User Information</AnimateCardTitle>
            <AnimateCardDescription>Current user details</AnimateCardDescription>
          </AnimateCardHeader>
          <AnimateCardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Role
                </span>
                <Badge variant="outline" className={roleColors[user.role]}>
                  {user.role}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Status
                </span>
                <Badge variant="outline" className={statusColors[user.status]}>
                  {user.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Joined
                </span>
                <span className="text-sm font-medium">{user.joinedAt}</span>
              </div>
            </div>
          </AnimateCardContent>
        </AnimateCard>

        {/* Edit Form */}
        <AnimateCard delay={0.2} className="lg:col-span-2">
          <AnimateCardHeader>
            <AnimateCardTitle>Edit User Details</AnimateCardTitle>
            <AnimateCardDescription>Update the user's information below.</AnimateCardDescription>
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
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input placeholder="John Doe" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </SlideIn>

                  <SlideIn direction="right" delay={0.15}>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input type="email" placeholder="john@example.com" className="pl-10" {...field} />
                            </div>
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
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="password"
                              placeholder="Leave blank to keep current password"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">Leave blank if you don't want to change the password</p>
                      </FormItem>
                    )}
                  />
                </SlideIn>

                <div className="grid gap-4 sm:grid-cols-2">
                  <SlideIn direction="right" delay={0.25}>
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
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </SlideIn>

                  <SlideIn direction="right" delay={0.3}>
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </SlideIn>
                </div>

                <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-end pt-4 border-t">
                  <AnimateButton
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/users/user")}
                  >
                    Cancel
                  </AnimateButton>
                  <AnimateButton type="submit" isLoading={isLoading} leftIcon={<Save className="h-4 w-4" />}>
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

