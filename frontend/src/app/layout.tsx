import Link from 'next/link';
import VoiceButton from '../components/VoiceButton';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <nav>
          <ul>
            <li><Link href="/">Inicio</Link></li>
            <li><Link href="/Reports">Ver Reportes</Link></li>
            <li><Link href="/AddClient">Añadir Cliente</Link></li>
          </ul>
        </nav>
        {children}
        <VoiceButton />
      </body>
    </html>
  );
}