import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Settings, Bell } from 'lucide-react';
import { useCallAudio } from '../hooks/useCallAudio';

export default function AudioSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [ringingVolume, setRingingVolume] = useState(0.7);
  const [callingVolume, setCallingVolume] = useState(0.5);
  
  const {
    setRingingVolume: setAudioRingingVolume,
    setCallingVolume: setAudioCallingVolume,
    isRinging,
    isCalling
  } = useCallAudio();

  // Load settings from localStorage
  useEffect(() => {
    const savedAudioEnabled = localStorage.getItem('callAudioEnabled');
    const savedRingingVolume = localStorage.getItem('callRingingVolume');
    const savedCallingVolume = localStorage.getItem('callCallingVolume');
    
    if (savedAudioEnabled !== null) {
      setAudioEnabled(JSON.parse(savedAudioEnabled));
    }
    if (savedRingingVolume !== null) {
      setRingingVolume(parseFloat(savedRingingVolume));
    }
    if (savedCallingVolume !== null) {
      setCallingVolume(parseFloat(savedCallingVolume));
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('callAudioEnabled', JSON.stringify(audioEnabled));
  }, [audioEnabled]);

  useEffect(() => {
    localStorage.setItem('callRingingVolume', ringingVolume.toString());
    setAudioRingingVolume(ringingVolume);
  }, [ringingVolume, setAudioRingingVolume]);

  useEffect(() => {
    localStorage.setItem('callCallingVolume', callingVolume.toString());
    setAudioCallingVolume(callingVolume);
  }, [callingVolume, setAudioCallingVolume]);

  const handleRingingVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    setRingingVolume(volume);
  };

  const handleCallingVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    setCallingVolume(volume);
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  return (
    <div className="relative">
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        title="Audio Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80 z-50">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              iPhone-Style Call Audio Settings
            </h3>

            {/* Audio Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Enable Call Sounds</span>
              <button
                onClick={toggleAudio}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  audioEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    audioEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Ringing Volume */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Ringing Volume</span>
                <span className="text-xs text-gray-500">{Math.round(ringingVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={ringingVolume}
                onChange={handleRingingVolumeChange}
                disabled={!audioEnabled}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
              {isRinging && (
                <div className="flex items-center text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  Currently ringing
                </div>
              )}
            </div>

            {/* Calling Volume */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Calling Volume</span>
                <span className="text-xs text-gray-500">{Math.round(callingVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={callingVolume}
                onChange={handleCallingVolumeChange}
                disabled={!audioEnabled}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
              {isCalling && (
                <div className="flex items-center text-xs text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                  Currently calling
                </div>
              )}
            </div>

            {/* Test Sounds */}
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Test iPhone-style sounds (when audio is enabled):</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    if (audioEnabled) {
                      // Test iPhone ringing sound
                      startRinging();
                      setTimeout(() => stopRinging(), 2000); // Play for 2 seconds
                    }
                  }}
                  disabled={!audioEnabled}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Test iPhone Ring
                </button>
                <button
                  onClick={() => {
                    if (audioEnabled) {
                      // Test iPhone calling sound
                      startCalling();
                      setTimeout(() => stopCalling(), 1500); // Play for 1.5 seconds
                    }
                  }}
                  disabled={!audioEnabled}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Test iPhone Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
