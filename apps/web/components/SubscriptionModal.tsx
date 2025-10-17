
import React, { useState } from 'react';
import { useSound } from '../hooks/useSound';
import { XIcon, ShieldCheckIcon } from './icons';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  plan: 'premium' | 'enterprise';
}

const planDetails = {
    premium: {
        name: 'Pro',
        price: 58.00,
    },
    enterprise: {
        name: 'Empresa',
        price: 385.00,
    }
};

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onConfirm, plan }) => {
    const [includeVat, setIncludeVat] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const { playSound } = useSound();
    
    const details = planDetails[plan];
    const vatRate = 0.21;
    const price = details.price;
    const total = includeVat ? price * (1 + vatRate) : price;

    const handleConfirm = () => {
        playSound('click');
        setIsProcessing(true);
        // This simulates a successful payment call to Stripe and our backend
        setTimeout(() => {
            setIsProcessing(false);
            onConfirm();
        }, 2500);
    }
    
    const handleClose = () => {
        if (isProcessing) return;
        playSound('close');
        onClose();
    }
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={handleClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md flex flex-col border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
                <header className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Confirmar Suscripción</h2>
                    <button onClick={handleClose} disabled={isProcessing} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                <main className="p-6 space-y-4">
                    <p className="text-slate-600 dark:text-slate-300">Estás a punto de suscribirte al plan <span className="font-bold text-slate-800 dark:text-white">{details.name}</span>.</p>
                    <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-800 dark:text-white">Plan {details.name}</span>
                            <span className="font-semibold text-slate-600 dark:text-slate-300">€{price.toFixed(2)} / mes</span>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <label htmlFor="vat-toggle" className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                Incluir 21% IVA
                            </label>
                            <button
                                id="vat-toggle"
                                onClick={() => setIncludeVat(!includeVat)}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${includeVat ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                            >
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${includeVat ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                             <div className="flex justify-between items-baseline">
                                <span className="font-bold text-slate-800 dark:text-white">Total a pagar hoy</span>
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">€{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                     <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                        Al confirmar, aceptas nuestros <a href="#" className="underline hover:text-orange-500">Términos de Suscripción</a>. La suscripción se renueva automáticamente cada mes. Puedes cancelarla en cualquier momento.
                    </p>
                </main>
                <footer className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={handleConfirm}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-amber-500 to-rose-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-transform disabled:opacity-75 disabled:hover:scale-100"
                    >
                      {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Procesando Pago...</span>
                          </>
                      ) : (
                          <>
                            <ShieldCheckIcon className="w-5 h-5"/>
                            <span>Confirmar y Pagar</span>
                          </>
                      )}
                    </button>
                </footer>
            </div>
        </div>
    );
}

export default SubscriptionModal;