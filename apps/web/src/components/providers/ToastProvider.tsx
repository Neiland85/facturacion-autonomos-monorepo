'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast: 'bg-white border border-gray-200 shadow-lg',
          title: 'text-gray-900 font-medium',
          description: 'text-gray-600',
          actionButton: 'bg-blue-600 text-white',
          cancelButton: 'bg-gray-100 text-gray-600',
          closeButton: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
        },
      }}
    />
  );
}
