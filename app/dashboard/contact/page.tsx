"use client"

import { useState, useMemo, useEffect } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Eye, Mail, MessageSquare, Phone, Building2, Calendar } from "lucide-react"
import { AnimateCard, AnimateCardHeader, AnimateCardTitle, AnimateCardContent } from "@/components/animate/animate-card"
import { FadeIn } from "@/components/animate/page-transition"
import { DataTable } from "@/components/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
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

// Mobile Card Component for individual message
function MobileMessageCard({
  message,
  index,
  onView
}: {
  message: ContactMessage
  index: number
  onView: (message: ContactMessage) => void
}) {
  const fullName = `${message.first_name} ${message.last_name}`

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">#{index + 1}</span>
            <p className="font-medium text-sm truncate">{fullName}</p>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-1">{message.email_address}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(message)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {message.subject && (
        <p className="text-sm font-medium">{message.subject}</p>
      )}

      <p className="text-xs text-muted-foreground line-clamp-2">
        {message.message}
      </p>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1 border-t">
        <div className="flex items-center gap-1">
          <Phone className="h-3 w-3" />
          <span>{message.phone_number}</span>
        </div>
        {message.company && (
          <div className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            <span>{message.company}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(message.created_at)}</span>
        </div>
      </div>
    </div>
  )
}

export default function ContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewingMessage, setViewingMessage] = useState<ContactMessage | null>(null)
  const [mobileSearch, setMobileSearch] = useState("")

  // Filter messages for mobile view
  const filteredMessages = useMemo(() => {
    if (!mobileSearch.trim()) return messages
    const searchLower = mobileSearch.toLowerCase()
    return messages.filter(
      (msg) =>
        msg.first_name.toLowerCase().includes(searchLower) ||
        msg.last_name.toLowerCase().includes(searchLower) ||
        msg.email_address.toLowerCase().includes(searchLower) ||
        msg.subject?.toLowerCase().includes(searchLower) ||
        msg.message.toLowerCase().includes(searchLower)
    )
  }, [messages, mobileSearch])

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
      <div className="space-y-4 sm:space-y-6">
        <FadeIn>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Contact Messages</h1>
            <p className="text-sm text-muted-foreground sm:text-base">View and manage contact form submissions.</p>
          </div>
        </FadeIn>
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-20 sm:h-24" />
        </div>
        <AnimateCard delay={0.2}>
          <AnimateCardHeader className="px-4 py-3 sm:px-6 sm:py-4">
            <AnimateCardTitle className="text-base sm:text-lg">Messages</AnimateCardTitle>
          </AnimateCardHeader>
          <AnimateCardContent className="p-4 sm:p-6">
            {/* Mobile skeleton */}
            <div className="space-y-3 md:hidden">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
            {/* Desktop skeleton */}
            <div className="hidden md:block space-y-4">
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
    <div className="space-y-4 sm:space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Contact Messages</h1>
          <p className="text-sm text-muted-foreground sm:text-base">View and manage contact form submissions.</p>
        </div>
      </FadeIn>

      {/* Stats Card */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnimateCard hover={false}>
          <AnimateCardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-6">
            <div className="rounded-full bg-primary/10 p-2.5 sm:p-3">
              <MessageSquare className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground sm:text-sm">Total Messages</p>
              <p className="text-xl font-semibold sm:text-2xl">{messages.length}</p>
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
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-2xl overflow-y-auto sm:w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Mail className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
              <span className="truncate">{viewingMessage?.subject || "No Subject"}</span>
            </DialogTitle>
            <DialogDescription className="break-all text-xs sm:text-sm">
              From: {viewingMessage?.first_name} {viewingMessage?.last_name} ({viewingMessage?.email_address})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 sm:gap-4 sm:text-sm">
              <div>
                <span className="text-muted-foreground">Phone:</span>{" "}
                <span className="font-medium">{viewingMessage?.phone_number}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Company:</span>{" "}
                <span className="font-medium">{viewingMessage?.company || "-"}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-muted-foreground">Received:</span>{" "}
                <span className="font-medium">{viewingMessage && formatDate(viewingMessage.created_at)}</span>
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 sm:p-4">
              <p className="whitespace-pre-wrap text-xs sm:text-sm">{viewingMessage?.message}</p>
            </div>
            <div className="flex justify-center sm:justify-end">
              <Button
                variant="default"
                size="sm"
                className="w-full sm:w-auto"
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
        <AnimateCardHeader className="px-4 py-3 sm:px-6 sm:py-4">
          <AnimateCardTitle className="text-base sm:text-lg">Messages</AnimateCardTitle>
        </AnimateCardHeader>
        <AnimateCardContent className="p-4 sm:p-6">
          {/* Mobile View - Card Layout */}
          <div className="md:hidden space-y-4">
            <Input
              placeholder="Search messages..."
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              className="h-10"
            />
            <div className="space-y-3">
              {filteredMessages.length > 0 ? (
                filteredMessages.map((message, index) => (
                  <MobileMessageCard
                    key={message.id}
                    message={message}
                    index={index}
                    onView={openViewDialog}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No messages found.
                </div>
              )}
            </div>
            {filteredMessages.length > 0 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                Showing {filteredMessages.length} of {messages.length} messages
              </p>
            )}
          </div>

          {/* Desktop View - Table Layout */}
          <div className="hidden md:block">
            <DataTable
              columns={columns}
              data={messages}
              searchKey="first_name"
              searchPlaceholder="Search by sender name..."
            />
          </div>
        </AnimateCardContent>
      </AnimateCard>
    </div>
  )
}
