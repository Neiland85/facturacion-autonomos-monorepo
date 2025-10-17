import React, { useState } from 'react';
import { useSound } from '../hooks/useSound';
import { XIcon, ExclamationTriangleIcon } from './icons';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [reason, setReason] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const { playSound } = useSound();
    
    const handleConfirm = () => {
        playSound('click');
        setIsProcessing(true);
        // This simulates an API call
        setTimeout(() => {
            setIsProcessing(false);
            playSound('success');
            onConfirm();
        }, 1500);
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
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cancelar Suscripción</h2>
                    <button onClick={handleClose} disabled={isProcessing} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                <main className="p-6 space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-yellow-500/10 rounded-lg">
                        <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                        <div>
                            <h3 className="font-bold text-yellow-800 dark:text-yellow-300">¿Estás seguro?</h3>
                            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">Perderás acceso a las funciones Pro al final de tu ciclo de facturación actual. Tus datos se conservarán por si decides volver.</p>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="cancel-reason" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Motivo de la cancelación (opcional)</label>
                        <select
                            id="cancel-reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="mt-1 w-full bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-600"
                        >
                            <option value="">Selecciona un motivo</option>
                            <option>Es demasiado caro</option>
                            <option>No uso todas las funciones</option>
                            <option>Encontré una alternativa mejor</option>
                            <option>Ya no lo necesito</option>
                            <option>Otro motivo</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="feedback" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Comentarios adicionales (opcional)</label>
                        <textarea
                            id="feedback"
                            rows={3}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Agradecemos tus comentarios para mejorar."
                            className="mt-1 w-full bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-600"
                        />
                    </div>
                </main>
                <footer className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-4">
                    <button
                      onClick={handleClose}
                      disabled={isProcessing}
                      className="w-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        No, mantener suscripción
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={isProcessing}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-75"
                    >
                      {isProcessing ? 'Cancelando...' : 'Sí, cancelar suscripción'}
                    </button>
                </footer>
            </div>
        </div>
    );
}

export default CancelSubscriptionModal;
