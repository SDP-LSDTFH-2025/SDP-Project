// iPhone-style ringtone generator
export const generateRingtone = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const sampleRate = audioContext.sampleRate;
  const duration = 2.0; // 2 seconds for iPhone ringtone
  const samples = sampleRate * duration;
  
  const buffer = audioContext.createBuffer(1, samples, sampleRate);
  const data = buffer.getChannelData(0);
  
  // iPhone ringtone frequencies and pattern
  const frequencies = [800, 1000, 1200, 800]; // Classic iPhone ringtone frequencies
  const noteDuration = 0.5; // Each note lasts 0.5 seconds
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const noteIndex = Math.floor(t / noteDuration) % frequencies.length;
    const frequency = frequencies[noteIndex];
    
    // Generate the note with iPhone-style envelope
    const noteTime = t % noteDuration;
    const envelope = Math.exp(-noteTime * 3) * (1 - Math.exp(-noteTime * 20)); // iPhone-style envelope
    
    // Generate the tone with harmonics
    let sample = 0;
    for (let harmonic = 1; harmonic <= 3; harmonic++) {
      const amplitude = 0.3 / harmonic; // Decreasing amplitude for harmonics
      sample += amplitude * Math.sin(2 * Math.PI * frequency * harmonic * t);
    }
    
    data[i] = sample * envelope * 0.3; // iPhone ringtone volume
  }
  
  return buffer;
};

export const generateCallTone = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const sampleRate = audioContext.sampleRate;
  const duration = 1.5; // 1.5 seconds for iPhone calling tone
  const samples = sampleRate * duration;
  
  const buffer = audioContext.createBuffer(1, samples, sampleRate);
  const data = buffer.getChannelData(0);
  
  // iPhone calling tone pattern (shorter, more urgent)
  const frequencies = [1000, 1200, 1000, 1200]; // iPhone calling tone frequencies
  const noteDuration = 0.375; // Each note lasts 0.375 seconds
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const noteIndex = Math.floor(t / noteDuration) % frequencies.length;
    const frequency = frequencies[noteIndex];
    
    // Generate the note with iPhone-style envelope
    const noteTime = t % noteDuration;
    const envelope = Math.exp(-noteTime * 4) * (1 - Math.exp(-noteTime * 25)); // More urgent envelope
    
    // Generate the tone with harmonics
    let sample = 0;
    for (let harmonic = 1; harmonic <= 3; harmonic++) {
      const amplitude = 0.25 / harmonic; // Slightly lower amplitude for calling tone
      sample += amplitude * Math.sin(2 * Math.PI * frequency * harmonic * t);
    }
    
    data[i] = sample * envelope * 0.4; // iPhone calling tone volume
  }
  
  return buffer;
};
