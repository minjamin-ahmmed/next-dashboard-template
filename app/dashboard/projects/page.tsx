"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  AnimateCard,
  AnimateCardHeader,
  AnimateCardTitle,
  AnimateCardContent,
} from "@/components/animate/animate-card";
import { FadeIn } from "@/components/animate/page-transition";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { API_BASE_URL, projectApi, type ApiProject } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AnimateButton } from "@/components/animate/animate-button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IMAGE_BASE_URL } from "@/lib/api/client";

// Form validation schema for Create Project
const createProjectFormSchema = z.object({
  title: z.string().min(2, "Project title must be at least 2 characters"),
  short_description: z
    .string()
    .min(10, "Short description must be at least 10 characters"),
  category: z.string().min(2, "Category must be at least 2 characters"),
  imageFile: z.instanceof(File).optional().nullable(),
  duration: z.string().min(2, "Duration must be at least 2 characters"),
  team_size: z.string().min(2, "Team size must be at least 2 characters"),
  rating: z.string().regex(/^\d+(\.\d+)?$/, "Rating must be a valid number"),
  client: z.string().min(2, "Client name must be at least 2 characters"),
  year: z.string().regex(/^\d{4}$/, "Year must be a valid 4-digit number"),
  live_url: z.string().url("Invalid live URL"),
  github_url: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
  technologies: z
    .array(
      z.object({
        name: z.string().min(1, "Technology name is required"),
        icon: z.string().min(1, "Icon is required"),
      }),
    )
    .default([]),
  status: z.boolean().default(true),
});

type CreateProjectFormValues = z.infer<typeof createProjectFormSchema>;

// Form validation schema for Edit Project
const editProjectFormSchema = z.object({
  title: z.string().min(2, "Project title must be at least 2 characters"),
  short_description: z
    .string()
    .min(10, "Short description must be at least 10 characters"),
  category: z.string().min(2, "Category must be at least 2 characters"),
  imageFile: z.instanceof(File).optional().nullable(),
  duration: z.string().min(2, "Duration must be at least 2 characters"),
  team_size: z.string().min(2, "Team size must be at least 2 characters"),
  rating: z.string().regex(/^\d+(\.\d+)?$/, "Rating must be a valid number"),
  client: z.string().min(2, "Client name must be at least 2 characters"),
  year: z.string().regex(/^\d{4}$/, "Year must be a valid 4-digit number"),
  live_url: z.string().url("Invalid live URL"),
  github_url: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
  technologies: z
    .array(
      z.object({
        name: z.string().min(1, "Technology name is required"),
        icon: z.string().min(1, "Icon is required"),
      }),
    )
    .default([]),
  status: z.boolean().default(true),
});

type EditProjectFormValues = z.infer<typeof editProjectFormSchema>;

// Mobile Card Component for individual project
function MobileProjectCard({
  project,
  index,
}: {
  project: ApiProject;
  index: number;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">
            #{index + 1}
          </span>
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary text-xs"
          >
            {project.title}
          </Badge>
        </div>
        <Badge
          variant={project.status ? "default" : "secondary"}
          className="text-xs shrink-0"
        >
          {project.status ? "Active" : "Inactive"}
        </Badge>
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Category</p>
          <p className="text-sm">{project.category}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Client</p>
          <p className="text-sm line-clamp-1">{project.client}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Rating</p>
          <p className="text-sm">{project.rating}/5.0</p>
        </div>
        {project.technologies && project.technologies.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Technologies
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {project.technologies.map((tech, index) => (
                <Badge
                  key={`${tech.name}-${tech.icon}-${index}`}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0.5"
                >
                  {tech.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Image Preview Component
function ImagePreview({
  preview,
  label,
  onRemove,
}: {
  preview: string | null;
  label: string;
  onRemove?: () => void;
}) {
  const getImageSrc = () => {
    if (!preview) return "";
    // If it's already an absolute URL or a data URL, use as-is
    if (
      preview.startsWith("http://") ||
      preview.startsWith("https://") ||
      preview.startsWith("data:")
    ) {
      return preview;
    }
    // Otherwise, treat it as a relative path from IMAGE_BASE_URL
    return `${IMAGE_BASE_URL}/${preview}`;
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label} Preview</p>
      {preview ? (
        <div className="relative group rounded-lg overflow-hidden border-2 border-primary/20 bg-muted">
          <img
            src={getImageSrc()}
            alt={label}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
          <div className="absolute top-2 right-2 flex items-center gap-2">
            <div className="bg-primary/90 text-white text-xs px-2 py-1 rounded-md">
              Ready to upload
            </div>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full h-48 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/30">
          <p className="text-sm text-muted-foreground">No image selected</p>
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileSearch, setMobileSearch] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ApiProject | null>(null);
  const [deletingProject, setDeletingProject] = useState<ApiProject | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createImagePreview, setCreateImagePreview] = useState<string | null>(
    null,
  );
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const createForm = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: {
      title: "",
      short_description: "",
      category: "",
      imageFile: null,
      duration: "",
      team_size: "",
      rating: "",
      client: "",
      year: new Date().getFullYear().toString(),
      live_url: "",
      github_url: "",
      technologies: [],
      status: true,
    },
  });

  const editForm = useForm<EditProjectFormValues>({
    resolver: zodResolver(editProjectFormSchema),
    defaultValues: {
      title: "",
      short_description: "",
      category: "",
      imageFile: null,
      duration: "",
      team_size: "",
      rating: "",
      client: "",
      year: new Date().getFullYear().toString(),
      live_url: "",
      github_url: "",
      technologies: [],
      status: true,
    },
  });

  // Filter projects for mobile view
  const filteredProjects = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    if (!mobileSearch.trim()) return projects;
    const searchLower = mobileSearch.toLowerCase();
    return projects.filter(
      (project) =>
        project?.title?.toLowerCase().includes(searchLower) ||
        project?.category?.toLowerCase().includes(searchLower) ||
        project?.client?.toLowerCase().includes(searchLower),
    );
  }, [projects, mobileSearch]);

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await projectApi.getProjects();
      if (response.status === "success" || response.status === "Success") {
        setProjects(response.data || []);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setProjects([]);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Handle image file change for create form
  const handleCreateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      createForm.setValue("imageFile", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCreateImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image file change for edit form
  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      editForm.setValue("imageFile", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle create project form submit
  const onCreateSubmit = async (values: CreateProjectFormValues) => {
    setIsSubmitting(true);
    try {
      let response;

      // If image file is provided, send multipart/form-data so backend receives a real image file
      if (values.imageFile) {
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("short_description", values.short_description);
        formData.append("category", values.category);
        formData.append("duration", values.duration);
        formData.append("team_size", values.team_size);
        formData.append("rating", values.rating);
        formData.append("client", values.client);
        formData.append("year", values.year);
        formData.append("live_url", values.live_url);
        formData.append("github_url", values.github_url || "");
        formData.append("status", values.status ? "1" : "0");
        (values.technologies || []).forEach((tech, index) => {
          formData.append(`technologies[${index}][name]`, tech.name);
          formData.append(`technologies[${index}][icon]`, tech.icon);
        });
        formData.append("image_url", values.imageFile);

        response = await projectApi.createProject(formData);
      } else {
        // Fallback to JSON body when no image is uploaded
        response = await projectApi.createProject({
          title: values.title,
          short_description: values.short_description,
          category: values.category,
          duration: values.duration,
          team_size: values.team_size,
          rating: values.rating,
          client: values.client,
          year: values.year,
          technologies: values.technologies || [],
          live_url: values.live_url,
          github_url: values.github_url || null,
          status: values.status,
        });
      }

      if (response.status === "success" || response.status === "Success") {
        setIsCreateDialogOpen(false);
        setCreateImagePreview(null);
        createForm.reset();
        toast({
          title: "Project created successfully",
          description: response.message || "Project has been created.",
        });
        fetchProjects(); // Refresh projects list
      } else {
        throw new Error(response.message || "Failed to create project");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create project";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit dialog
  const openEditDialog = useCallback(
    (project: ApiProject) => {
      setEditingProject(project);
      setEditImagePreview(project.image_url);
      editForm.reset({
        title: project.title,
        short_description: project.short_description,
        category: project.category,
        imageFile: null,
        duration: project.duration,
        team_size: project.team_size,
        rating: project.rating,
        client: project.client,
        year: project.year,
        live_url: project.live_url || "",
        github_url: project.github_url || "",
        technologies: project.technologies || [],
        status: project.status,
      });
      setIsEditDialogOpen(true);
    },
    [editForm],
  );

  // Open delete dialog
  const openDeleteDialog = useCallback((project: ApiProject) => {
    setDeletingProject(project);
    setIsDeleteDialogOpen(true);
  }, []);

  // Handle edit project form submit
  const onEditSubmit = async (values: EditProjectFormValues) => {
    if (!editingProject) return;

    setIsSubmitting(true);
    try {
      let response;

      // If a new image file is provided, send multipart/form-data with file upload
      if (values.imageFile) {
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("short_description", values.short_description);
        formData.append("category", values.category);
        formData.append("duration", values.duration);
        formData.append("team_size", values.team_size);
        formData.append("rating", values.rating);
        formData.append("client", values.client);
        formData.append("year", values.year);
        formData.append("live_url", values.live_url);
        formData.append("github_url", values.github_url || "");
        formData.append("status", values.status ? "1" : "0");
        (values.technologies || []).forEach((tech, index) => {
          formData.append(`technologies[${index}][name]`, tech.name);
          formData.append(`technologies[${index}][icon]`, tech.icon);
        });
        formData.append("image_url", values.imageFile);

        response = await projectApi.updateProject(editingProject.id, formData);
      } else {
        // If no new image is uploaded, keep using JSON body
        response = await projectApi.updateProject(editingProject.id, {
          title: values.title,
          short_description: values.short_description,
          category: values.category,
          duration: values.duration,
          team_size: values.team_size,
          rating: values.rating,
          client: values.client,
          year: values.year,
          technologies: values.technologies || [],
          live_url: values.live_url,
          github_url: values.github_url || null,
          status: values.status,
        });
      }

      if (response.status === "success" || response.status === "Success") {
        setIsEditDialogOpen(false);
        setEditingProject(null);
        setEditImagePreview(null);
        editForm.reset();
        toast({
          title: "Project updated successfully",
          description: response.message || "Project has been updated.",
        });
        fetchProjects(); // Refresh projects list
      } else {
        throw new Error(response.message || "Failed to update project");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update project";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete project
  const onDeleteSubmit = async () => {
    if (!deletingProject) return;

    setIsSubmitting(true);
    try {
      const response = await projectApi.deleteProject(deletingProject.id);

      if (response.status === "success" || response.status === "Success") {
        setIsDeleteDialogOpen(false);
        setDeletingProject(null);
        toast({
          title: "Project deleted successfully",
          description: response.message || "Project has been deleted.",
        });
        fetchProjects(); // Refresh projects list
      } else {
        throw new Error(response.message || "Failed to delete project");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete project";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo<ColumnDef<ApiProject>[]>(
    () => [
      {
        accessorKey: "serial",
        header: "SL No.",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.index + 1}</span>
        ),
        enableSorting: false,
        size: 60,
      },
      {
        accessorKey: "title",
        header: "Project Title",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md overflow-hidden border bg-muted flex-shrink-0">
              {row.original.image_url ? (
                <img
                  src={`${IMAGE_BASE_URL}/${row.original.image_url}`}
                  alt={row.original.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src="/placeholder.svg"
                  alt="Project placeholder"
                  className="h-full w-full object-cover opacity-60"
                />
              )}
            </div>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary max-w-xs truncate"
            >
              {row.original.title}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.category}
          </span>
        ),
      },
      {
        accessorKey: "client",
        header: "Client",
        cell: ({ row }) => (
          <span className="text-sm line-clamp-1 max-w-md">
            {row.original.client}
          </span>
        ),
      },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.rating}/5.0</Badge>
        ),
      },
      {
        accessorKey: "technologies",
        header: "Technologies",
        cell: ({ row }) => {
          const techs = row.original.technologies || [];
          if (!techs.length) {
            return <span className="text-xs text-muted-foreground">-</span>;
          }
          const names = techs.map((t) => t.name).slice(0, 3);
          const extra = techs.length > 3 ? ` +${techs.length - 3}` : "";
          return (
            <span className="text-sm text-muted-foreground">
              {names.join(", ")}
              {extra}
            </span>
          );
        },
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
          const project = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEditDialog(project)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => openDeleteDialog(project)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [openEditDialog, openDeleteDialog],
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <FadeIn>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
              Projects Management
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Manage your portfolio projects and client work.
            </p>
          </div>
        </FadeIn>
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-20 sm:h-24" />
        </div>
        <AnimateCard delay={0.2}>
          <AnimateCardHeader className="px-4 py-3 sm:px-6 sm:py-4">
            <AnimateCardTitle className="text-base sm:text-lg">
              Projects Directory
            </AnimateCardTitle>
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
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <FadeIn>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
              Projects Management
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Manage your portfolio projects and client work.
            </p>
          </div>
          <div>
            <Button
              variant="default"
              className="w-full sm:w-auto"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Project
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
              <p className="text-xs text-muted-foreground sm:text-sm">
                Total Projects
              </p>
              <p className="text-xl font-semibold sm:text-2xl">
                {projects?.length || 0}
              </p>
            </div>
          </AnimateCardContent>
        </AnimateCard>
      </div>

      <AnimateCard>
        <AnimateCardHeader className="px-4 py-3 sm:px-6 sm:py-4">
          <AnimateCardTitle className="text-base sm:text-lg">
            Projects Directory
          </AnimateCardTitle>
        </AnimateCardHeader>
        <AnimateCardContent className="p-4 sm:p-6">
          {/* Mobile View - Card Layout */}
          <div className="md:hidden space-y-4">
            <Input
              placeholder="Search projects..."
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              className="h-10"
            />
            <div className="space-y-3">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, index) => (
                  <MobileProjectCard
                    key={project.id}
                    project={project}
                    index={index}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No projects found.
                </div>
              )}
            </div>
            {filteredProjects && filteredProjects.length > 0 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                Showing {filteredProjects.length} of {projects?.length || 0}{" "}
                projects
              </p>
            )}
          </div>

          {/* Desktop View - Table Layout */}
          <div className="hidden md:block">
            <DataTable
              columns={columns}
              data={projects}
              searchKey="title"
              searchPlaceholder="Search projects..."
            />
          </div>
        </AnimateCardContent>
      </AnimateCard>

      {/* Create Project Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            createForm.reset();
            setCreateImagePreview(null);
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-6xl sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Add a new project to your portfolio.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="short_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={createForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={createForm.control}
                name="imageFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Image (Optional)</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            handleCreateImageChange(e);
                            field.onChange(e.target.files?.[0]);
                          }}
                          className="hidden"
                          id="create-image-input"
                        />
                        <label
                          htmlFor="create-image-input"
                          className="flex items-center justify-center gap-2 cursor-pointer px-4 py-2 border-2 border-dashed border-muted-foreground/30 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors duration-200"
                        >
                          <Plus className="h-4 w-4" />
                          Click to upload image
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {createImagePreview && (
                <ImagePreview
                  preview={createImagePreview}
                  label="Project Image"
                  onRemove={() => {
                    setCreateImagePreview(null);
                    createForm.setValue("imageFile", null);
                  }}
                />
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={createForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="team_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Size</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={createForm.control}
                name="technologies"
                render={({ field }) => {
                  const technologies = field.value || [];
                  return (
                    <FormItem>
                      <FormLabel>Technologies</FormLabel>
                      <div className="space-y-2">
                        {technologies.map((tech, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                          >
                            <Input
                              placeholder="Technology name (e.g. Laravel)"
                              value={tech.name}
                              onChange={(e) => {
                                const updated = [...technologies];
                                updated[index] = {
                                  ...updated[index],
                                  name: e.target.value,
                                };
                                field.onChange(updated);
                              }}
                            />
                            <Input
                              placeholder="Icon (e.g. mdi:laravel)"
                              value={tech.icon}
                              onChange={(e) => {
                                const updated = [...technologies];
                                updated[index] = {
                                  ...updated[index],
                                  icon: e.target.value,
                                };
                                field.onChange(updated);
                              }}
                            />
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            field.onChange([
                              ...(technologies || []),
                              { name: "", icon: "" },
                            ])
                          }
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Technology
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={createForm.control}
                name="live_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Live URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="github_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub URL (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                        Enable or disable this project
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
                <AnimateButton
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Create Project
                </AnimateButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingProject(null);
            editForm.reset();
            setEditImagePreview(null);
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-6xl sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update project information.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="short_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={editForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="imageFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Image (Optional)</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            handleEditImageChange(e);
                            field.onChange(e.target.files?.[0]);
                          }}
                          className="hidden"
                          id="edit-image-input"
                        />
                        <label
                          htmlFor="edit-image-input"
                          className="flex items-center justify-center gap-2 cursor-pointer px-4 py-2 border-2 border-dashed border-muted-foreground/30 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors duration-200"
                        >
                          <Plus className="h-4 w-4" />
                          Click to change image
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {editImagePreview && (
                <ImagePreview
                  preview={editImagePreview}
                  label="Project Image"
                  onRemove={() => {
                    setEditImagePreview(null);
                    editForm.setValue("imageFile", null);
                  }}
                />
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="team_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Size</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="live_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Live URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="github_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub URL (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="technologies"
                render={({ field }) => {
                  const technologies = field.value || [];
                  return (
                    <FormItem>
                      <FormLabel>Technologies</FormLabel>
                      <div className="space-y-2">
                        {technologies.map((tech, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                          >
                            <Input
                              placeholder="Technology name (e.g. Laravel)"
                              value={tech.name}
                              onChange={(e) => {
                                const updated = [...technologies];
                                updated[index] = {
                                  ...updated[index],
                                  name: e.target.value,
                                };
                                field.onChange(updated);
                              }}
                            />
                            <Input
                              placeholder="Icon (e.g. mdi:laravel)"
                              value={tech.icon}
                              onChange={(e) => {
                                const updated = [...technologies];
                                updated[index] = {
                                  ...updated[index],
                                  icon: e.target.value,
                                };
                                field.onChange(updated);
                              }}
                            />
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            field.onChange([
                              ...(technologies || []),
                              { name: "", icon: "" },
                            ])
                          }
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Technology
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable or disable this project
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
                <AnimateButton
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Update Project
                </AnimateButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project <strong>{deletingProject?.title}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
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
  );
}
