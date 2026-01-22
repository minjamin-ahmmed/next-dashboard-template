// Contact Message type
export interface ContactMessage {
  id: number
  first_name: string
  last_name: string
  phone_number: string
  email_address: string
  company: string | null
  subject: string | null
  message: string
  created_at: string
  updated_at: string
}

// Contact Messages Response
export interface ContactMessagesResponse {
  success: boolean
  data: ContactMessage[]
}
