import React, { useState, useEffect, useRef } from 'react';
import { XIcon } from './icons';
import { useSound } from '../hooks/useSound';
import { processVoiceCommand } from '../services/geminiService';
import { VoiceInvoiceData } from '../types';

interface VoiceCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommandComplete: (data: VoiceInvoiceData) => void;
}

// Check for SpeechRecognition API
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

const VoiceCommandModal: React.FC<VoiceCommandModalProps> = ({ isOpen, onClose, onCommandComplete }) => {
    const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'error'>('idle');
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);
    const { playSound } = useSound();
    const finalTranscriptRef = useRef('');

    useEffect(() => {
        if (!isOpen) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setStatus('idle');
            setTranscript('');
            finalTranscriptRef.current = '';
            setError(null);
            return;
        }

        if (!isSpeechRecognitionSupported) {
            setError("El reconocimiento de voz no es compatible con tu navegador. Prueba con Chrome o Edge.");
            setStatus('error');
            return;
        }
        
        playSound('open');
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.interimResults = true;
        recognition.continuous = false;
        recognitionRef.current = recognition;

        recognition.onstart = () => {
            setStatus('listening');
            setError(null);
            setTranscript('');
            finalTranscriptRef.current = '';
        };

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            finalTranscriptRef.current = finalTranscript;
            setTranscript(interimTranscript);
        };

        recognition.onend = () => {
            if (finalTranscriptRef.current.trim()) {
                 setTranscript(finalTranscriptRef.current);
                 setStatus('processing');
            } else if (status === 'listening') {
                 setError('No he detectado ninguna voz. Inténtalo de nuevo.');
                 setStatus('error');
                 playSound('error');
            }
        };
        
        recognition.onerror = (event: any) => {
             if (event.error === 'no-speech') {
                setError('No he detectado ninguna voz. Inténtalo de nuevo.');
            } else {
                setError('Ha ocurrido un error con el reconocimiento de voz.');
            }
            setStatus('error');
            playSound('error');
        };

        recognition.start();

        return () => {
            recognition.stop();
        };

    }, [isOpen]);

    useEffect(() => {
        const processTranscript = async () => {
            if (status === 'processing' && finalTranscriptRef.current) {
                try {
                    const data = await processVoiceCommand(finalTranscriptRef.current);
                    playSound('success');
                    onCommandComplete(data);
                    onClose();
                } catch (e: any) {
                    setError(e.message || "La IA no pudo procesar tu solicitud.");
                    setStatus('error');
                    playSound('error');
                }
            }
        }
        processTranscript();
    }, [status, onCommandComplete, onClose, playSound]);

    const handleClose = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setStatus('idle');
        onClose();
    };
    
    const MicrophoneIcon = () => (
        <svg className={`w-16 h-16 text-white transition-transform duration-300 ${status === 'listening' ? 'scale-110' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 016 0v8.25a3 3 0 01-3 3z" />
        </svg>
    );

    const getStatusText = () => {
        switch (status) {
            case 'listening': return 'Escuchando...';
            case 'processing': return 'Procesando con IA...';
            case 'error': return '¡Ups! Algo ha salido mal.';
            default: return 'Dime qué factura quieres crear';
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex flex-col justify-center items-center p-4 backdrop-blur-sm" onClick={handleClose}>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl w-full max-w-lg flex flex-col border border-slate-700 relative" onClick={e => e.stopPropagation()}>
                <button onClick={handleClose} className="absolute top-4 right-4 text-slate-500 hover:text-white z-10">
                    <XIcon className="w-6 h-6" />
                </button>
                <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[350px]">
                    <div className={`relative w-32 h-32 flex items-center justify-center rounded-full bg-orange-500`}>
                        {status === 'listening' && <div className="absolute inset-0 bg-orange-400 rounded-full animate-ping"></div>}
                        <MicrophoneIcon />
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-8">{getStatusText()}</h2>
                    <p className="text-slate-400 mt-2 min-h-[48px] text-center px-4">
                        {status === 'error' ? error : transcript || "Ej: 'Crea una factura proforma de 500€ para Acme Corp'"}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VoiceCommandModal;