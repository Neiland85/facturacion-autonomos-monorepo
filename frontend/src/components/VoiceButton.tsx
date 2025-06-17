import React, { useState } from 'react';

const VoiceButton = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      sendToBot(text);
    };
    recognition.start();
  };

  const sendToBot = async (text: string) => {
    try {
      const response = await fetch('/api/voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: text }),
      });
      const data = await response.json();
      alert(`Respuesta del bot: ${data.response}`);
    } catch (error) {
      console.error('Error al enviar el comando al bot:', error);
    }
  };

  return (
    <div>
      <button onClick={startListening} disabled={isListening}>
        {isListening ? 'Escuchando...' : 'Hablar con el bot'}
      </button>
      {transcript && <p>Transcripción: {transcript}</p>}
    </div>
  );
};

export default VoiceButton;
