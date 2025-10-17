import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, IdVerificationData } from '../types';
import TributariAppLogo from './TributariAppLogo';
import { MailIcon, LockClosedIcon, UserIcon, DeviceMobileIcon, CheckCircleIcon, ArrowLeftIcon, CameraIcon, ShieldCheckIcon } from './icons';
import { useSound } from '../hooks/useSound';
import { verifyIdentity } from '../services/geminiService';

interface RegisterProps {
  setView: (view: View) => void;
  onRegisterSuccess: () => void;
}

const ProgressIndicator = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => (
    <div className="flex items-center justify-center gap-2 mb-8">
        {Array.from({ length: totalSteps }, (_, i) => (
            <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                    i < currentStep ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-700'
                } ${i + 1 === currentStep ? 'w-12' : 'w-6'}`}
            />
        ))}
    </div>
);

const ImageUploader = ({ label, onFileSelect, previewSrc, id }: { label: string, onFileSelect: (file: File) => void, previewSrc: string | null, id: string }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
    };

    return (
        <div className="text-left">
             <label
                htmlFor={id}
                className="w-full cursor-pointer bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 flex items-center justify-center text-center hover:border-orange-500 transition-colors"
            >
                {previewSrc ? (
                    <img src={previewSrc} alt={`${label} preview`} className="h-24 object-contain" />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
                        <CameraIcon className="w-8 h-8"/>
                        <span className="font-semibold">{label}</span>
                        <span className="text-xs">Pulsa para subir imagen</span>
                    </div>
                )}
            </label>
            <input type="file" id={id} accept="image/png, image/jpeg" className="hidden" onChange={handleFileChange} />
        </div>
    );
};


const Register: React.FC<RegisterProps> = ({ setView, onRegisterSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      password: '',
      consent: false,
  });
  const [code, setCode] = useState('');
  const [idFront, setIdFront] = useState<{ file: File, preview: string } | null>(null);
  const [idBack, setIdBack] = useState<{ file: File, preview: string } | null>(null);
  const [selfie, setSelfie] = useState<{ file: File, preview: string } | null>(null);
  const [verificationStep, setVerificationStep] = useState<'upload' | 'verifying' | 'review'>('upload');
  const [extractedIdData, setExtractedIdData] = useState<IdVerificationData | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { playSound } = useSound();
  const initialEmailSent = useRef(false);
  const [loadingMessage, setLoadingMessage] = useState('Iniciando proceso seguro...');

  useEffect(() => {
    if (verificationStep === 'verifying') {
        const messages = [
            'Subiendo imágenes de forma segura...',
            'Analizando la nitidez del documento...',
            'Extrayendo datos con IA...',
            'Comparando selfie con el documento...',
            'Finalizando verificación...'
        ];
        let messageIndex = 0;
        setLoadingMessage(messages[messageIndex]);
        const interval = setInterval(() => {
            messageIndex++;
            if (messageIndex < messages.length) {
                setLoadingMessage(messages[messageIndex]);
            } else {
                clearInterval(interval);
            }
        }, 700);
        return () => clearInterval(interval);
    }
  }, [verificationStep]);

  const sendVerificationEmail = useCallback(() => {
    const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`%c[SIMULACIÓN DE EMAIL] El código para ${formData.email} es: ${mockCode}`, 'color: #f97316; font-weight: bold;');
    playSound('notify');
    setResendCooldown(60);
  }, [formData.email, playSound]);

  useEffect(() => {
    if (step === 3 && !initialEmailSent.current) {
        sendVerificationEmail();
        initialEmailSent.current = true;
    }
    if (step !== 3) {
        initialEmailSent.current = false;
    }
  }, [step, sendVerificationEmail]);

  useEffect(() => {
    let timer: number;
    if (resendCooldown > 0) {
        timer = setInterval(() => {
            setResendCooldown((prev) => prev - 1);
        }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleFileSelect = (file: File, setter: React.Dispatch<React.SetStateAction<{ file: File, preview: string } | null>>) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        setter({ file, preview: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  const handleNext = () => {
    playSound('click');
    setCode(''); // Reset code for next step
    setStep(prev => prev + 1);
  };
  
  const handleBack = () => {
      playSound('click');
      setCode(''); // Reset code for previous step
      if (step === 5) {
          setVerificationStep('upload');
          setVerificationError(null);
          setExtractedIdData(null);
      }
      setStep(prev => prev - 1);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleNext();
  };
  
  const handleVerifyIdentity = async () => {
    if (!idFront || !idBack || !selfie) return;

    playSound('click');
    setVerificationError(null);
    setVerificationStep('verifying');
    try {
      const data = await verifyIdentity(idFront.preview, idBack.preview, selfie.preview);
      setExtractedIdData(data);
      setVerificationStep('review');
      playSound('success');
    } catch (error: any) {
      setVerificationError(error.message || 'Ocurrió un error desconocido.');
      setVerificationStep('upload');
      playSound('error');
    }
  };


  const handleFinish = () => {
    playSound('success');
    onRegisterSuccess();
  };

  const inputBaseClasses = "w-full bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500";
  const inputWithIconClasses = `${inputBaseClasses} pl-10 pr-4 py-3`;
  const iconClasses = "absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500";
  const totalSteps = 6;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-6">Privacidad y Consentimiento</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Antes de empezar, necesitamos tu consentimiento para gestionar tus datos de forma segura.</p>
            <div className="mt-8 text-left p-4 bg-slate-100 dark:bg-slate-800 rounded-lg space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Al continuar, aceptas nuestra <a href="#" className="text-orange-500 font-semibold">Política de Privacidad</a> y los <a href="#" className="text-orange-500 font-semibold">Términos de Servicio</a>.
                </p>
                <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} className="mt-1 h-5 w-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500" />
                    <span className="text-slate-700 dark:text-slate-300">
                        Entiendo y acepto que mis datos serán procesados para proporcionarme el servicio, de acuerdo con el RGPD.
                    </span>
                </label>
            </div>
             <button onClick={handleNext} disabled={!formData.consent} className="mt-8 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600">
                Continuar
            </button>
          </>
        );
      case 2:
        return (
          <>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-6">Crea tu Cuenta</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Introduce tus datos para registrarte.</p>
            <form onSubmit={handleSubmit} className="space-y-6 mt-8">
              <div className="relative"><UserIcon className={iconClasses} /><input type="text" name="name" placeholder="Nombre completo" value={formData.name} onChange={handleChange} className={inputWithIconClasses} required /></div>
              <div className="relative"><MailIcon className={iconClasses} /><input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className={inputWithIconClasses} required /></div>
              <div className="relative"><DeviceMobileIcon className={iconClasses} /><input type="tel" name="phone" placeholder="Teléfono" value={formData.phone} onChange={handleChange} className={inputWithIconClasses} required /></div>
              <div className="relative"><LockClosedIcon className={iconClasses} /><input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} className={inputWithIconClasses} required /></div>
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">Crear Cuenta</button>
            </form>
          </>
        );
      case 3:
        return (
          <>
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-6">Verifica tu Email</h1>
             <p className="text-slate-500 dark:text-slate-400 mt-2">
                Hemos enviado un código de 6 dígitos a <span className="font-semibold text-slate-800 dark:text-slate-200">{formData.email}</span>. El código es válido por 15 minutos.
             </p>
             <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="mt-8">
                <input 
                    type="text" 
                    maxLength={6} 
                    placeholder="_ _ _ _ _ _" 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full text-center text-2xl tracking-[.5em] bg-slate-100 dark:bg-slate-800 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-orange-500" 
                    required
                />
                <button type="submit" className="mt-8 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">Verificar y Continuar</button>
            </form>
             <div className="mt-6 text-center text-sm">
                {resendCooldown > 0 ? (
                    <p className="text-slate-500 dark:text-slate-400">
                        Puedes reenviar el código en {resendCooldown} segundos.
                    </p>
                ) : (
                    <p className="text-slate-500 dark:text-slate-400">
                        ¿No recibiste el código?{' '}
                        <button
                            type="button"
                            onClick={sendVerificationEmail}
                            className="font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-500"
                        >
                            Reenviar
                        </button>
                    </p>
                )}
            </div>
          </>
        );
      case 4:
        return (
          <>
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-6">Verifica tu Teléfono</h1>
             <p className="text-slate-500 dark:text-slate-400 mt-2">
                Hemos enviado un código de 6 dígitos a <span className="font-semibold text-slate-800 dark:text-slate-200">{formData.phone}</span>.
             </p>
             <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="mt-8">
                <input 
                    type="text" 
                    maxLength={6} 
                    placeholder="_ _ _ _ _ _" 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full text-center text-2xl tracking-[.5em] bg-slate-100 dark:bg-slate-800 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-orange-500" 
                    required
                />
                <button type="submit" className="mt-8 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">Verificar Teléfono</button>
            </form>
          </>
        );
      case 5:
        return (
            <>
                {verificationStep === 'upload' && (
                    <>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-6">Verificación de Identidad (Opcional)</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Aumenta la seguridad de tu cuenta verificando tu identidad.</p>
                        <div className="space-y-4 mt-8">
                            <ImageUploader id="id-front-upload" label="DNI/NIE (Anverso)" previewSrc={idFront?.preview || null} onFileSelect={(file) => handleFileSelect(file, setIdFront)} />
                            <ImageUploader id="id-back-upload" label="DNI/NIE (Reverso)" previewSrc={idBack?.preview || null} onFileSelect={(file) => handleFileSelect(file, setIdBack)} />
                            <ImageUploader id="selfie-upload" label="Selfie" previewSrc={selfie?.preview || null} onFileSelect={(file) => handleFileSelect(file, setSelfie)} />
                        </div>
                        {verificationError && (
                            <div className="text-red-800 dark:text-red-400 bg-red-500/10 p-3 rounded-lg mt-4 text-left">
                                <p className="font-bold">Error de Verificación</p>
                                <p className="text-sm mt-1">{verificationError}</p>
                            </div>
                        )}
                        <button onClick={handleVerifyIdentity} disabled={!idFront || !idBack || !selfie} className="mt-8 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 flex items-center justify-center gap-2">
                           <ShieldCheckIcon className="w-5 h-5" /> Verificar Identidad
                        </button>
                        <button onClick={handleNext} className="mt-4 w-full text-slate-500 dark:text-slate-400 font-semibold hover:text-orange-500">
                            Omitir por ahora
                        </button>
                    </>
                )}
                {verificationStep === 'verifying' && (
                    <div className="text-center p-10 flex flex-col items-center justify-center min-h-[400px]">
                        <div className="relative w-24 h-24">
                            <ShieldCheckIcon className="w-24 h-24 text-slate-300 dark:text-slate-600" />
                            <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-8">Verificando identidad...</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 h-6 transition-opacity duration-300">
                            {loadingMessage}
                        </p>
                    </div>
                )}
                {verificationStep === 'review' && extractedIdData && (
                    <>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-6">Confirma tus Datos</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Hemos extraído esta información de tu documento. Por favor, revísala.</p>
                        <div className="mt-8 text-left p-4 bg-slate-100 dark:bg-slate-800 rounded-lg space-y-3 border border-slate-200 dark:border-slate-700">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Nombre Completo</p>
                                <p className="font-mono text-slate-800 dark:text-white">{extractedIdData.fullName}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Número de Documento</p>
                                <p className="font-mono text-slate-800 dark:text-white">{extractedIdData.documentNumber}</p>
                            </div>
                             <div>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Fecha de Nacimiento</p>
                                <p className="font-mono text-slate-800 dark:text-white">{extractedIdData.birthDate}</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-left">
                            Si los datos no son correctos, puedes volver atrás y subir las imágenes de nuevo.
                        </p>
                         <button onClick={handleNext} className="mt-8 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                            Confirmar Datos y Finalizar
                        </button>
                    </>
                )}
            </>
        );
      case 6:
        return (
            <>
                <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto" />
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-6">¡Todo listo!</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Tu cuenta ha sido creada con éxito. Ya puedes empezar a gestionar tus finanzas.
                </p>
                <button onClick={handleFinish} className="mt-8 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">Ir al Dashboard</button>
            </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <TributariAppLogo className="justify-center" />
        </div>
        
        {step < 6 && <ProgressIndicator currentStep={step} totalSteps={totalSteps} />}

        <div className="text-center">
            {renderStep()}
        </div>

        <div className="mt-6 text-center">
            {step > 1 && step < 6 && (
                <button onClick={handleBack} className="text-slate-500 dark:text-slate-400 hover:text-orange-500 font-semibold p-2 flex items-center gap-2 mx-auto">
                    <ArrowLeftIcon className="w-4 h-4" />
                    Volver
                </button>
            )}
            {step === 1 && (
                 <p className="text-slate-500 dark:text-slate-400">
                    ¿Ya tienes una cuenta?{' '}
                    <button onClick={() => setView('login')} className="font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-500">
                        Inicia sesión
                    </button>
                </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default Register;