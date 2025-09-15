"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import VoiceHeader from '@/components/voice-header'
import { useState } from 'react'

export default function VoiceIntegrationExample() {
  const [invoices, setInvoices] = useState<any[]>([])

  const handleCreateInvoice = (invoiceData: any) => {
    const newInvoice = {
      id: Date.now().toString(),
      ...invoiceData,
      createdAt: new Date().toISOString(),
    }
    setInvoices(prev => [...prev, newInvoice])
    console.log('Factura creada:', newInvoice)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header con componentes de voz integrados */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                TributariApp
              </h1>
            </div>

            {/* Componente de voz integrado en el header */}
            <VoiceHeader
              onCreateInvoice={handleCreateInvoice}
              className="flex items-center gap-2"
            />

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Configuración
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Panel de comandos de voz */}
          <Card>
            <CardHeader>
              <CardTitle>🎤 Comandos de Voz Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Comandos Globales</h4>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• "Ayuda" - Ver comandos disponibles</li>
                    <li>• "Crear factura" - Abrir creación de factura</li>
                    <li>• "Ver estadísticas" - Mostrar estadísticas</li>
                    <li>• "Configuración" - Abrir configuración</li>
                  </ul>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900">Crear Facturas</h4>
                  <ul className="text-sm text-green-700 mt-1 space-y-1">
                    <li>• "Factura de 100 euros por desarrollo web"</li>
                    <li>• "Crear factura de 50 euros por consultoría"</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de facturas creadas */}
          <Card>
            <CardHeader>
              <CardTitle>📄 Facturas Creadas ({invoices.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No hay facturas creadas aún. Usa los comandos de voz para crear una.
                </p>
              ) : (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{invoice.description || 'Factura'}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(invoice.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            €{invoice.amount || '0'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instrucciones de uso */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🚀 Cómo Usar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">1. Comandos Globales</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Haz clic en el botón de micrófono (🎤) en el header para acceder a comandos globales.
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <strong>Ejemplos:</strong>
                  <br />• Di "Ayuda" para ver comandos
                  <br />• Di "Crear factura" para abrir el modal de facturas
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">2. Crear Facturas por Voz</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Haz clic en el botón de documento (📄) para crear facturas directamente por voz.
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <strong>Ejemplos:</strong>
                  <br />• "Factura de 100 euros por desarrollo web"
                  <br />• "Crear factura de 50 euros por consultoría"
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
