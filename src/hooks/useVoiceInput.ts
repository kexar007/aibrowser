import { useState, useEffect } from 'react';
import type { VoiceInput } from './types';

export const useVoiceInput = (): VoiceInput => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startListening = (callback: (transcript: string) => void) => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join('');
      callback(transcript);
    };

    recognition.onerror = (event: any) => {
      setError(`Error occurred in recognition: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return {
    isListening,
    startListening,
    stopListening
  };
};