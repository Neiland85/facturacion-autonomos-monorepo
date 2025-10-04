import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'Facturación Autónomos',
  description: 'Sistema completo de gestión de facturación para autónomos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="bg-gray-800 text-white shadow-md">
            <div className="container mx-auto flex items-center justify-between py-4 px-6">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold">TributariApp</h1>
                <nav className="flex space-x-4">
                  <a href="/" className="hover:underline">Inicio</a>
                  <a href="/dashboard" className="hover:underline">Dashboard</a>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm">Estado: 🟢 Sistema Online</span>
              </div>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
