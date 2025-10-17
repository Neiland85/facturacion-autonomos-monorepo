interface VoiceInvoiceButtonProps {
    onClick: () => void;
    isListening: boolean;
    disabled?: boolean;
    className?: string;
}
export default function VoiceInvoiceButton({ onClick, isListening, disabled, className, }: VoiceInvoiceButtonProps): import("react").JSX.Element;
export {};
