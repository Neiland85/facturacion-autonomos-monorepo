interface VoiceInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    isListening: boolean;
    transcript: string;
    feedbackMessage: string | null;
    error: string | null;
    startListening: () => void;
    stopListening: () => void;
    hasSupport: boolean;
    onCreateInvoice: (data: any) => void;
}
export default function VoiceInvoiceModal({ isOpen, onClose, isListening, transcript, feedbackMessage, error, startListening, stopListening, hasSupport, onCreateInvoice, }: VoiceInvoiceModalProps): import("react").JSX.Element;
export {};
