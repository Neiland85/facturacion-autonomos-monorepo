"use client";

import { useEffect, useRef, useState } from "react";

interface UseVoiceRecognitionOptions {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
}

interface UseVoiceRecognitionReturn {
  transcript: string;
  isListening: boolean;
  error: string | null;
  hasSupport: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useVoiceRecognition({
  onResult,
  onError,
  onStart,
  onEnd,
  continuous = false,
  interimResults = true,
  lang = "es-ES",
}: UseVoiceRecognitionOptions = {}): UseVoiceRecognitionReturn {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSupport, setHasSupport] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Verificar soporte del navegador
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setHasSupport(true);
      recognitionRef.current = new SpeechRecognition();

      const recognition = recognitionRef.current;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        onStart?.();
      };

      recognition.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result?.isFinal && result[0]) {
            finalTranscript += result[0].transcript;
          } else if (result?.[0]) {
            interimTranscript += result[0].transcript;
          }
        }

        const currentTranscript = finalTranscript || interimTranscript;
        setTranscript(currentTranscript);

        if (finalTranscript) {
          onResult?.(finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        const errorMessage = getErrorMessage(event.error);
        setError(errorMessage);
        setIsListening(false);
        onError?.(errorMessage);
      };

      recognition.onend = () => {
        setIsListening(false);
        onEnd?.();
      };
    } else {
      setHasSupport(false);
      setError("El reconocimiento de voz no está soportado en este navegador");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [continuous, interimResults, lang, onResult, onError, onStart, onEnd]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        setError("Error al iniciar el reconocimiento de voz");
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const resetTranscript = () => {
    setTranscript("");
    setError(null);
  };

  return {
    transcript,
    isListening,
    error,
    hasSupport,
    startListening,
    stopListening,
    resetTranscript,
  };
}

function getErrorMessage(error: string): string {
  switch (error) {
    case "no-speech":
      return "No se detectó habla. Inténtalo de nuevo.";
    case "audio-capture":
      return "Error al capturar audio. Verifica los permisos del micrófono.";
    case "not-allowed":
      return "Acceso al micrófono denegado. Permite el acceso e inténtalo de nuevo.";
    case "network":
      return "Error de red. Verifica tu conexión a internet.";
    case "service-not-allowed":
      return "Servicio de reconocimiento de voz no disponible.";
    case "aborted":
      return "Reconocimiento de voz cancelado.";
    case "language-not-supported":
      return "Idioma no soportado.";
    default:
      return `Error desconocido: ${error}`;
  }
}

// Declaraciones de tipos para TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
