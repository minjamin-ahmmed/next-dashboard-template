"use client"

import { useState, useMemo, useEffect } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Eye, Mail, MessageSquare } from "lucide-react"
import { AnimateCard, AnimateCardHeader, AnimateCardTitle, AnimateCardContent } from "@/components/animate/animate-card"
import { FadeIn } from "@/components/animate/page-transition"
import { DataTable } from "@/components/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { contactApi, type ContactMessage } from "@/lib/api"

// Helper function to format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Helper function to truncate text
function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

export default function ContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewingMessage, setViewingMessage] = useState<ContactMessage | null>(null)

  // Fetch messages from API
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await contactApi.getMessages()
        if (response.success) {
          setMessages(response.data)
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [])

  // Handle view message
  const openViewDialog = (message: ContactMessage) => {
    setViewingMessage(message)
    setIsViewDialogOpen(true)
  }

  const columns = useMemo<ColumnDef<ContactMessage>[]>(
    () => [
      {
        accessorKey: "serial",
        header: "SL No.",
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.index + 1}</span>,
        enableSorting: false,
        size: 60,
      },
      {
        accessorKey: "first_name",
        header: "Sender",
        cell: ({ row }) => {
          const message = row.original
          const fullName = `${message.first_name} ${message.last_name}`
          return (
            <div>
              <p className="font-medium">{fullName}</p>
              <p className="text-sm text-muted-foreground">{message.email_address}</p>
            </div>
          )
        },
      },
      {
        accessorKey: "phone_number",
        header: "Phone",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.phone_number}</span>
        ),
      },
      {
        accessorKey: "company",
        header: "Company",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.company || "-"}
          </span>
        ),
      },
      {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.subject || "-"}
          </span>
        ),
      },
      {
        accessorKey: "message",
        header: "Message",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {truncateText(row.original.message, 30)}
          </span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Received",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.created_at)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => {
          const message = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openViewDialog(message)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
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
      <div className="space-y-6">
        <FadeIn>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Contact Messages</h1>
            <p className="text-muted-foreground">View and manage contact form submissions.</p>
          </div>
        </FadeIn>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24" />
        </div>
        <AnimateCard delay={0.2}>
          <AnimateCardHeader>
            <AnimateCardTitle>Messages</AnimateCardTitle>
          </AnimateCardHeader>
          <AnimateCardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </AnimateCardContent>
        </AnimateCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Contact Messages</h1>
          <p className="text-muted-foreground">View and manage contact form submissions.</p>
        </div>
      </FadeIn>

      {/* Stats Card */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnimateCard hover={false}>
          <AnimateCardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-primary/10 p-3">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Messages</p>
              <p className="text-2xl font-semibold">{messages.length}</p>
            </div>
          </AnimateCardContent>
        </AnimateCard>
      </div>

      {/* View Message Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onOpenChange={(open) => {
          setIsViewDialogOpen(open)
          if (!open) setViewingMessage(null)
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {viewingMessage?.subject || "No Subject"}
            </DialogTitle>
            <DialogDescription>
              From: {viewingMessage?.first_name} {viewingMessage?.last_name} ({viewingMessage?.email_address})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Phone:</span>{" "}
                <span className="font-medium">{viewingMessage?.phone_number}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Company:</span>{" "}
                <span className="font-medium">{viewingMessage?.company || "-"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Received:</span>{" "}
                <span className="font-medium">{viewingMessage && formatDate(viewingMessage.created_at)}</span>
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="whitespace-pre-wrap text-sm">{viewingMessage?.message}</p>
            </div>
            <div className="flex justify-end">
              <Button
                variant="default"
                onClick={() => {
                  window.location.href = `mailto:${viewingMessage?.email_address}?subject=Re: ${viewingMessage?.subject || "Your Message"}`
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                Reply via Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AnimateCard delay={0.2}>
        <AnimateCardHeader>
          <AnimateCardTitle>Messages</AnimateCardTitle>
        </AnimateCardHeader>
        <AnimateCardContent>
          <DataTable
            columns={columns}
            data={messages}
            searchKey="first_name"
            searchPlaceholder="Search by sender name..."
          />
        </AnimateCardContent>
      </AnimateCard>
    </div>
  )
}
