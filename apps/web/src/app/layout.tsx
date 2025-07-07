import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Facturación Autónomos",
  description: "Sistema completo de gestión de facturación para autónomos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
