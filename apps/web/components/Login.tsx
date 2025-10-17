import React, { useState } from 'react';
import { View } from '../types';
import TributariAppLogo from './TributariAppLogo';
import { MailIcon, LockClosedIcon, ShieldCheckIcon, ArrowLeftIcon } from './icons';
import { useSound } from '../hooks/useSound';

interface LoginProps {
  setView: (view: View) => void;
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ setView, onLoginSuccess }) => {
  const [loginStep, setLoginStep] = useState<'credentials' | '2fa'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const { playSound } = useSound();

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playSound('click');
    setLoginStep('2fa');
  };
  
  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError(null);

    // Simulate API call to verify the code
    if (verificationCode === '123456') {
      playSound('success');
      onLoginSuccess();
    } else {
      playSound('error');
      setVerificationError('El código de verificación es incorrecto. Inténtalo de nuevo.');
    }
  };

  const handleRegisterClick = () => {
    playSound('click');
    setView('register');
  }
  
  const handleBackToCredentials = () => {
    playSound('click');
    setVerificationCode('');
    setVerificationError(null);
    setLoginStep('credentials');
  }

  const inputBaseClasses = "w-full bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500";
  const inputWithIconClasses = `${inputBaseClasses} pl-10 pr-4 py-3`;
  const iconClasses = "absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <TributariAppLogo className="justify-center" />
        </div>

        {loginStep === 'credentials' && (
            <>
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bienvenido de nuevo</h1>
                    <p className="text-slate-500 dark:text-slate-400">Inicia sesión para gestionar tu negocio.</p>
                </div>
                <form onSubmit={handleCredentialsSubmit} className="space-y-6">
                    <div className="relative">
                        <MailIcon className={iconClasses} />
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputWithIconClasses} required />
                    </div>
                    <div className="relative">
                        <LockClosedIcon className={iconClasses} />
                        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className={inputWithIconClasses} required />
                    </div>
                    <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                        Iniciar Sesión
                    </button>
                </form>
                <p className="text-center mt-6 text-slate-500 dark:text-slate-400">
                    ¿No tienes una cuenta?{' '}
                    <button onClick={handleRegisterClick} className="font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-500">
                        Regístrate
                    </button>
                </p>
            </>
        )}

        {loginStep === '2fa' && (
            <>
                <div className="text-center mb-8">
                    <ShieldCheckIcon className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Verificación en Dos Pasos</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Hemos enviado un código a tu dispositivo. Introdúcelo para continuar. (Pista: es 123456)
                    </p>
                </div>
                 <form onSubmit={handleVerificationSubmit} className="space-y-6">
                    <input 
                        type="text" 
                        maxLength={6} 
                        placeholder="_ _ _ _ _ _" 
                        value={verificationCode}
                        onChange={(e) => {
                            setVerificationCode(e.target.value);
                            if (verificationError) setVerificationError(null);
                        }}
                        className="w-full text-center text-2xl tracking-[.5em] bg-slate-100 dark:bg-slate-800 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-orange-500" 
                        required
                    />
                    {verificationError && (
                        <p className="text-red-500 text-sm text-center -mt-4">{verificationError}</p>
                    )}
                    <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                        Verificar y Entrar
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <button onClick={handleBackToCredentials} className="text-slate-500 dark:text-slate-400 hover:text-orange-500 font-semibold p-2 flex items-center gap-2 mx-auto">
                        <ArrowLeftIcon className="w-4 h-4" />
                        Volver
                    </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default Login;