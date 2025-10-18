import { useRef, useEffect, useState } from 'react';
import { generateRingtone, generateCallTone } from '../assets/audio/ringtone';

export const useCallAudio = () => {
  const ringingAudioRef = useRef(null);
  const callingAudioRef = useRef(null);
  const [isRinging, setIsRinging] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  // Initialize audio elements
  useEffect(() => {
    // Create ringing sound (incoming call)
    ringingAudioRef.current = new Audio();
    ringingAudioRef.current.loop = true;
    ringingAudioRef.current.volume = 0.7;
    
    // Create calling sound (outgoing call)
    callingAudioRef.current = new Audio();
    callingAudioRef.current.loop = true;
    callingAudioRef.current.volume = 0.5;

    // Generate audio data URLs for sounds
    generateRingingSound();
    generateCallingSound();

    return () => {
      stopRinging();
      stopCalling();
    };
  }, []);

  // Generate ringing sound using the ringtone generator
  const generateRingingSound = () => {
    try {
      const buffer = generateRingtone();
      const wav = encodeWAV(buffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      ringingAudioRef.current.src = URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error generating ringing sound:', error);
    }
  };

  // Generate calling sound using the call tone generator
  const generateCallingSound = () => {
    try {
      const buffer = generateCallTone();
      const wav = encodeWAV(buffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      callingAudioRef.current.src = URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error generating calling sound:', error);
    }
  };


  // Encode audio buffer to WAV format
  const encodeWAV = (buffer) => {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);
    
    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(0)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
    
    return arrayBuffer;
  };

  const startRinging = () => {
    if (ringingAudioRef.current && !isRinging) {
      ringingAudioRef.current.play().catch(e => {
        console.log('Could not play ringing sound:', e);
      });
      setIsRinging(true);
    }
  };

  const stopRinging = () => {
    if (ringingAudioRef.current && isRinging) {
      ringingAudioRef.current.pause();
      ringingAudioRef.current.currentTime = 0;
      setIsRinging(false);
    }
  };

  const startCalling = () => {
    if (callingAudioRef.current && !isCalling) {
      callingAudioRef.current.play().catch(e => {
        console.log('Could not play calling sound:', e);
      });
      setIsCalling(true);
    }
  };

  const stopCalling = () => {
    if (callingAudioRef.current && isCalling) {
      callingAudioRef.current.pause();
      callingAudioRef.current.currentTime = 0;
      setIsCalling(false);
    }
  };

  const setRingingVolume = (volume) => {
    if (ringingAudioRef.current) {
      ringingAudioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  };

  const setCallingVolume = (volume) => {
    if (callingAudioRef.current) {
      callingAudioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  };

  return {
    startRinging,
    stopRinging,
    startCalling,
    stopCalling,
    setRingingVolume,
    setCallingVolume,
    isRinging,
    isCalling
  };
};
