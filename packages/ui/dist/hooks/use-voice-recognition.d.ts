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
export declare function useVoiceRecognition({ onResult, onError, onStart, onEnd, continuous, interimResults, lang, }?: UseVoiceRecognitionOptions): UseVoiceRecognitionReturn;
declare global {
    interface Window {
        SpeechRecognition: typeof SpeechRecognition;
        webkitSpeechRecognition: typeof SpeechRecognition;
    }
}
export {};
