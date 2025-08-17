import { useState, useEffect, useRef } from 'react';

export const useVoiceInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      // Initialize speech recognition
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      // Handle errors
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        // Provide user-friendly error messages
        switch (event.error) {
          case 'no-speech':
            console.log('No speech detected. Please try again.');
            break;
          case 'audio-capture':
            console.log('No microphone found. Please check your microphone.');
            break;
          case 'not-allowed':
            console.log('Microphone access denied. Please allow microphone access.');
            break;
          default:
            console.log('Speech recognition error occurred.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setIsSupported(false);
      console.log('Speech recognition not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = (onResult) => {
    if (!recognitionRef.current || isListening) return;

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return {
    isListening,
    isSupported,
    startListening,
    stopListening
  };
};