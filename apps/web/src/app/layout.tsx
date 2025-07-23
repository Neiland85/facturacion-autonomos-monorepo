import type { Metadata } from 'next';
import ClientLayout from '../components/layouts/ClientLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'Facturación Autónomos',
  description: 'Sistema completo de gestión de facturación para autónomos',
};

function Header() {
  return (
    <header className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">TributariApp</h1>
          <nav className="flex space-x-4">
            <a href="/" className="hover:underline">
              Inicio
            </a>
            <a href="/facturas" className="hover:underline">
              Facturas
            </a>
            <a href="/clientes" className="hover:underline">
              Clientes
            </a>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md">
            Escanear Factura
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md">
            Configuración
          </button>
        </div>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 antialiased">
        <ClientLayout>
          <Header />
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
