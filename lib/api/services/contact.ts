import { api } from "../client"
import type { ContactMessagesResponse } from "../types/contact"

// Contact API functions
export const contactApi = {
  // Get contact messages
  getMessages: async (): Promise<ContactMessagesResponse> => {
    return api.get<ContactMessagesResponse>("/contact-messages")
  },
}
