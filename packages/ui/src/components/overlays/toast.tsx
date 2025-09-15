"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

// Iconos personalizados
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

interface ToastNotificationProps {
  id: string
  title: string
  message?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose: (id: string) => void
}

export function ToastNotification({
  id,
  title,
  message,
  type = 'info',
  duration = 5000,
  onClose,
}: ToastNotificationProps) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          onClose(id)
          return 0
        }
        return prev - (100 / (duration / 100))
      })
    }, 100)

    return () => clearInterval(interval)
  }, [duration, id, onClose])

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={`p-4 rounded-lg border shadow-lg max-w-sm ${getStyles()}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium">{title}</h4>
          {message && <p className="text-sm mt-1">{message}</p>}
        </div>
        <button
          onClick={() => onClose(id)}
          className="ml-4 text-gray-400 hover:text-gray-600"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-2 bg-gray-200 rounded-full h-1">
        <motion.div
          className="bg-current h-1 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  )
}

// Sistema de notificaciones globales
interface ToastNotificationItem extends Omit<ToastNotificationProps, 'onClose'> { }

let toastId = 0
const toasts: ToastNotificationItem[] = []
const listeners: ((toasts: ToastNotificationItem[]) => void)[] = []

export const toastSystem = {
  show: (toast: Omit<ToastNotificationItem, 'id'>) => {
    const newToast = { ...toast, id: (++toastId).toString() }
    toasts.push(newToast)
    listeners.forEach(listener => listener([...toasts]))

    // Auto-remove after duration
    setTimeout(() => {
      toastSystem.remove(newToast.id)
    }, toast.duration || 5000)
  },

  remove: (id: string) => {
    const index = toasts.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.splice(index, 1)
      listeners.forEach(listener => listener([...toasts]))
    }
  },

  subscribe: (listener: (toasts: ToastNotificationItem[]) => void) => {
    listeners.push(listener)
    return () => {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  },

  success: (title: string, message?: string) => {
    toastSystem.show({ title, message, type: 'success' })
  },

  error: (title: string, message?: string) => {
    toastSystem.show({ title, message, type: 'error' })
  },

  warning: (title: string, message?: string) => {
    toastSystem.show({ title, message, type: 'warning' })
  },

  info: (title: string, message?: string) => {
    toastSystem.show({ title, message, type: 'info' })
  },
}
