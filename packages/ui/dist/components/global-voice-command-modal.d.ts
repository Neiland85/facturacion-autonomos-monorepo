interface GlobalVoiceCommandModalProps {
    isOpen: boolean;
    onClose: () => void;
    isListening: boolean;
    transcript: string;
    feedbackMessage: string | null;
    error: string | null;
    startListening: () => void;
    stopListening: () => void;
    hasSupport: boolean;
}
export default function GlobalVoiceCommandModal({ isOpen, onClose, isListening, transcript, feedbackMessage, error, startListening, stopListening, hasSupport, }: GlobalVoiceCommandModalProps): import("react").JSX.Element;
export {};
