'use client'

import { Toaster as HotToaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'

export function Toaster() {
  const { theme } = useTheme()

  return (
    <HotToaster
      position="top-center"
      reverseOrder={false}
      gutter={12}
      containerClassName="!top-6"
      containerStyle={{
        top: '1.5rem',
        zIndex: 9999,
      }}
      toastOptions={{
        // Default options for all toasts
        className: '',
        duration: 4000,
        style: {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          maxWidth: '400px',
          minWidth: '300px',
          border: '1px solid hsl(var(--border))',
        },
        // Success toast
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#ffffff',
            secondary: '#10b981',
          },
          style: {
            background: '#10b981',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          },
          className: 'success-toast',
        },
        // Error toast
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#ffffff',
            secondary: '#ef4444',
          },
          style: {
            background: '#ef4444',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
          },
          className: 'error-toast',
        },
        // Loading toast
        loading: {
          iconTheme: {
            primary: 'hsl(var(--primary))',
            secondary: '#ffffff',
          },
          style: {
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          className: 'loading-toast',
        },
      }}
    />
  )
}
