'use client';

import { useState } from 'react';
import { invoiceService } from '@/services/invoice.service';
import { useErrorHandler } from '@/hooks/useErrorHandler';

// Importaciones de componentes UI
interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: string;
  size?: string;
  className?: string;
  children: React.ReactNode;
  'aria-busy'?: boolean;
  title?: string;
}

// Componente Button simple si no hay librería de componentes
const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  disabled, 
  className, 
  children, 
  title,
  ...props 
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    title={title}
    {...props}
  >
    {children}
  </button>
);

// Iconos simples si no hay lucide-react
const Download = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

interface DownloadXmlButtonProps {
  /** El ID de la factura cuyo XML se va a descargar. */
  invoiceId: string;
  /** Prop para deshabilitar el botón desde fuera. */
  disabled?: boolean;
}

/**
 * Un componente de botón que gestiona la descarga del XML firmado de una factura.
 * Muestra un estado de carga y utiliza el sistema de notificaciones para
 * informar al usuario del resultado de la operación.
 */
export function DownloadXmlButton({
  invoiceId,
  disabled = false,
}: DownloadXmlButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { handleError, showSuccess } = useErrorHandler();

  const handleDownload = async () => {
    if (isDownloading || disabled) return;

    setIsDownloading(true);
    try {
      await invoiceService.downloadSignedXml(invoiceId);
      showSuccess('Archivo XML descargado correctamente');
    } catch (error) {
      handleError(error, 'Error al descargar el archivo XML');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={disabled || isDownloading}
      variant="outline"
      size="sm"
      className="inline-flex items-center gap-2"
      aria-busy={isDownloading}
      title={isDownloading ? 'Descargando...' : 'Descargar XML firmado'}
    >
      {isDownloading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {isDownloading ? 'Descargando...' : 'Descargar XML'}
    </Button>
  );
}