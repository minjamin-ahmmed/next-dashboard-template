"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AnimateCard, AnimateCardHeader, AnimateCardTitle, AnimateCardContent } from "@/components/animate/animate-card"
import { FadeIn } from "@/components/animate/page-transition"
import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { seoApi, type ApiSeoPage } from "@/lib/api"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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

// Form validation schema for Create SEO
const createSeoFormSchema = z.object({
  page_name: z.string().min(2, "Page name must be at least 2 characters"),
  page_slug: z.string().min(2, "Page slug must be at least 2 characters"),
  meta_title: z.string().min(5, "Meta title must be at least 5 characters"),
  meta_description: z.string().min(10, "Meta description must be at least 10 characters"),
  meta_keywords: z.string().min(3, "Meta keywords must be at least 3 characters"),
  status: z.boolean().default(true),
})

type CreateSeoFormValues = z.infer<typeof createSeoFormSchema>

// Form validation schema for Edit SEO
const editSeoFormSchema = createSeoFormSchema
type EditSeoFormValues = CreateSeoFormValues

// Mobile Card Component for individual SEO page
function MobileSeoCard({
  seoPage,
  index,
}: {
  seoPage: ApiSeoPage
  index: number
}) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">#{index + 1}</span>
          <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
            {seoPage.page_name}
          </Badge>
        </div>
        <Badge variant={seoPage.status ? "default" : "secondary"} className="text-xs shrink-0">
          {seoPage.status ? "Active" : "Inactive"}
        </Badge>
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Slug</p>
          <p className="text-sm">{seoPage.page_slug}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Meta Title</p>
          <p className="text-sm line-clamp-1">{seoPage.meta_title}</p>
        </div>
      </div>
    </div>
  )
}

export default function SeoPage() {
  const [seoPages, setSeoPages] = useState<ApiSeoPage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mobileSearch, setMobileSearch] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingSeoPage, setEditingSeoPage] = useState<ApiSeoPage | null>(null)
  const [deletingSeoPage, setDeletingSeoPage] = useState<ApiSeoPage | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const createForm = useForm<CreateSeoFormValues>({
    resolver: zodResolver(createSeoFormSchema),
    defaultValues: {
      page_name: "",
      page_slug: "",
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      status: true,
    },
  })

  const editForm = useForm<EditSeoFormValues>({
    resolver: zodResolver(editSeoFormSchema),
    defaultValues: {
      page_name: "",
      page_slug: "",
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      status: true,
    },
  })

  // Filter SEO pages for mobile view
  const filteredSeoPages = useMemo(() => {
    if (!seoPages || seoPages.length === 0) return []
    if (!mobileSearch.trim()) return seoPages
    const searchLower = mobileSearch.toLowerCase()
    return seoPages.filter(
      (page) =>
        page?.page_name?.toLowerCase().includes(searchLower) ||
        page?.page_slug?.toLowerCase().includes(searchLower) ||
        page?.meta_title?.toLowerCase().includes(searchLower)
    )
  }, [seoPages, mobileSearch])

  // Fetch SEO pages from API
  const fetchSeoPages = async () => {
    try {
      setIsLoading(true)
      const response = await seoApi.getSeoPages()
      if (response.status === "success" || response.status === "Success") {
        setSeoPages(response.data || [])
      } else {
        setSeoPages([])
      }
    } catch (err) {
      console.error("Failed to fetch SEO pages:", err)
      setSeoPages([])
      toast({
        title: "Error",
        description: "Failed to load SEO pages",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSeoPages()
  }, [])

  // Handle create SEO form submit
  const onCreateSubmit = async (values: CreateSeoFormValues) => {
    setIsSubmitting(true)
    try {
      const response = await seoApi.createSeoPage({
        page_name: values.page_name,
        page_slug: values.page_slug,
        meta_title: values.meta_title,
        meta_description: values.meta_description,
        meta_keywords: values.meta_keywords,
        status: values.status,
      })

      if (response.status === "success" || response.status === "Success") {
        setIsCreateDialogOpen(false)
        createForm.reset()
        toast({
          title: "SEO page created successfully",
          description: response.message || "SEO page has been created.",
        })
        fetchSeoPages() // Refresh SEO pages list
      } else {
        throw new Error(response.message || "Failed to create SEO page")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create SEO page"
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
  const openEditDialog = useCallback((seoPage: ApiSeoPage) => {
    setEditingSeoPage(seoPage)
    editForm.reset({
      page_name: seoPage.page_name,
      page_slug: seoPage.page_slug,
      meta_title: seoPage.meta_title,
      meta_description: seoPage.meta_description,
      meta_keywords: seoPage.meta_keywords,
      status: seoPage.status,
    })
    setIsEditDialogOpen(true)
  }, [editForm])

  // Open delete dialog
  const openDeleteDialog = useCallback((seoPage: ApiSeoPage) => {
    setDeletingSeoPage(seoPage)
    setIsDeleteDialogOpen(true)
  }, [])

  // Handle edit SEO form submit
  const onEditSubmit = async (values: EditSeoFormValues) => {
    if (!editingSeoPage) return

    setIsSubmitting(true)
    try {
      const response = await seoApi.updateSeoPage(editingSeoPage.id, {
        page_name: values.page_name,
        page_slug: values.page_slug,
        meta_title: values.meta_title,
        meta_description: values.meta_description,
        meta_keywords: values.meta_keywords,
        status: values.status,
      })

      if (response.status === "success" || response.status === "Success") {
        setIsEditDialogOpen(false)
        setEditingSeoPage(null)
        editForm.reset()
        toast({
          title: "SEO page updated successfully",
          description: response.message || "SEO page has been updated.",
        })
        fetchSeoPages() // Refresh SEO pages list
      } else {
        throw new Error(response.message || "Failed to update SEO page")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update SEO page"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete SEO page
  const onDeleteSubmit = async () => {
    if (!deletingSeoPage) return

    setIsSubmitting(true)
    try {
      const response = await seoApi.deleteSeoPage(deletingSeoPage.id)

      if (response.status === "success" || response.status === "Success") {
        setIsDeleteDialogOpen(false)
        setDeletingSeoPage(null)
        toast({
          title: "SEO page deleted successfully",
          description: response.message || "SEO page has been deleted.",
        })
        fetchSeoPages() // Refresh SEO pages list
      } else {
        throw new Error(response.message || "Failed to delete SEO page")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete SEO page"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = useMemo<ColumnDef<ApiSeoPage>[]>(
    () => [
      {
        accessorKey: "serial",
        header: "SL No.",
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.index + 1}</span>,
        enableSorting: false,
        size: 60,
      },
      {
        accessorKey: "page_name",
        header: "Page Name",
        cell: ({ row }) => (
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {row.original.page_name}
          </Badge>
        ),
      },
      {
        accessorKey: "page_slug",
        header: "Slug",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground font-mono">{row.original.page_slug}</span>
        ),
      },
      {
        accessorKey: "meta_title",
        header: "Meta Title",
        cell: ({ row }) => (
          <span className="text-sm line-clamp-1 max-w-md">{row.original.meta_title}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.status ? "default" : "secondary"}>
            {row.original.status ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => {
          const seoPage = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEditDialog(seoPage)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => openDeleteDialog(seoPage)}
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
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">SEO Management</h1>
            <p className="text-sm text-muted-foreground sm:text-base">Manage SEO metadata for all pages on your website.</p>
          </div>
        </FadeIn>
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-20 sm:h-24" />
        </div>
        <AnimateCard delay={0.2}>
          <AnimateCardHeader className="px-4 py-3 sm:px-6 sm:py-4">
            <AnimateCardTitle className="text-base sm:text-lg">SEO Pages Directory</AnimateCardTitle>
          </AnimateCardHeader>
          <AnimateCardContent className="p-4 sm:p-6">
            {/* Mobile skeleton */}
            <div className="space-y-3 md:hidden">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">SEO Management</h1>
            <p className="text-sm text-muted-foreground sm:text-base">Manage SEO metadata for all pages on your website.</p>
          </div>
          <div>
            <Button
              variant="default"
              className="w-full sm:w-auto"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New SEO Page
            </Button>
          </div>
        </div>
      </FadeIn>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnimateCard hover={false}>
          <AnimateCardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-6">
            <div className="rounded-full bg-primary/10 p-2.5 sm:p-3">
              <Search className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground sm:text-sm">Total SEO Pages</p>
              <p className="text-xl font-semibold sm:text-2xl">{seoPages?.length || 0}</p>
            </div>
          </AnimateCardContent>
        </AnimateCard>
      </div>

      <AnimateCard>
        <AnimateCardHeader className="px-4 py-3 sm:px-6 sm:py-4">
          <AnimateCardTitle className="text-base sm:text-lg">SEO Pages Directory</AnimateCardTitle>
        </AnimateCardHeader>
        <AnimateCardContent className="p-4 sm:p-6">
          {/* Mobile View - Card Layout */}
          <div className="md:hidden space-y-4">
            <Input
              placeholder="Search SEO pages..."
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              className="h-10"
            />
            <div className="space-y-3">
              {filteredSeoPages.length > 0 ? (
                filteredSeoPages.map((seoPage, index) => (
                  <MobileSeoCard
                    key={seoPage.id}
                    seoPage={seoPage}
                    index={index}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No SEO pages found.
                </div>
              )}
            </div>
            {filteredSeoPages && filteredSeoPages.length > 0 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                Showing {filteredSeoPages.length} of {seoPages?.length || 0} SEO pages
              </p>
            )}
          </div>

          {/* Desktop View - Table Layout */}
          <div className="hidden md:block">
            <DataTable
              columns={columns}
              data={seoPages}
              searchKey="page_name"
              searchPlaceholder="Search SEO pages..."
            />
          </div>
        </AnimateCardContent>
      </AnimateCard>

      {/* Create SEO Page Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (!open) createForm.reset()
        }}
      >
        <DialogContent className="w-[95vw] max-w-2xl sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New SEO Page</DialogTitle>
            <DialogDescription>Add SEO metadata for a new page on your website.</DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="page_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Home, About Us" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="page_slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., home, about-us" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={createForm.control}
                name="meta_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Welcome to Our Website" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="meta_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Discover our services and products..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="meta_keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Keywords</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., home, welcome, services, products"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable or disable this SEO page
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
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
                  Create SEO Page
                </AnimateButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit SEO Page Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setEditingSeoPage(null)
            editForm.reset()
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-2xl sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit SEO Page</DialogTitle>
            <DialogDescription>Update SEO metadata for this page.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="page_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Home, About Us" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="page_slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., home, about-us" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="meta_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Welcome to Our Website" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="meta_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Discover our services and products..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="meta_keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Keywords</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., home, welcome, services, products"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable or disable this SEO page
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
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
                  Update SEO Page
                </AnimateButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete SEO Page Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the SEO page{" "}
              <strong>{deletingSeoPage?.page_name}</strong>.
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
