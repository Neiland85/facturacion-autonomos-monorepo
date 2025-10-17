import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { authService } from '@/services/auth.service';

export const metadata = {
  title: 'Iniciar Sesión | TributariApp',
};

export default async function LoginPage() {
  // Verificar si ya está autenticado
  try {
    await authService.getCurrentUser();
    redirect('/dashboard');
  } catch {
    // No autenticado, mostrar login
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">TributariApp</h1>
          <p className="mt-2 text-gray-600">Inicia sesión en tu cuenta</p>
        </div>

        <LoginForm />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <a href="/register" className="text-blue-600 hover:underline">
              Regístrate aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
