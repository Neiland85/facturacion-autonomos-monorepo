import { redirect } from 'next/navigation';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { authService } from '@/services/auth.service';

export const metadata = {
  title: 'Registro | TributariApp',
};

export default async function RegisterPage() {
  // Verificar si ya está autenticado
  try {
    await authService.getCurrentUser();
    redirect('/dashboard');
  } catch {
    // No autenticado, mostrar registro
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">TributariApp</h1>
          <p className="mt-2 text-gray-600">Crea tu cuenta</p>
        </div>

        <RegisterForm />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Inicia sesión aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
