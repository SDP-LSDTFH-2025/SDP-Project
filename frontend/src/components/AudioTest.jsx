import React from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import { useCallAudio } from '../hooks/useCallAudio';

export default function AudioTest() {
  const {
    startRinging,
    stopRinging,
    startCalling,
    stopCalling,
    isRinging,
    isCalling
  } = useCallAudio();

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Audio Test</h3>
      
      <div className="space-y-4">
        {/* Ringing Sound Test */}
        <div className="flex items-center space-x-4">
          <button
            onClick={isRinging ? stopRinging : startRinging}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              isRinging 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>{isRinging ? 'Stop Ringing' : 'Test Ringing'}</span>
          </button>
          
          {isRinging && (
            <div className="flex items-center text-sm text-red-600">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
              Ringing...
            </div>
          )}
        </div>

        {/* Calling Sound Test */}
        <div className="flex items-center space-x-4">
          <button
            onClick={isCalling ? stopCalling : startCalling}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              isCalling 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isCalling ? 'Stop Calling' : 'Test Calling'}</span>
          </button>
          
          {isCalling && (
            <div className="flex items-center text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              Calling...
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600">
          <p>• <strong>Ringing:</strong> Simulates incoming call sound</p>
          <p>• <strong>Calling:</strong> Simulates outgoing call sound</p>
          <p>• Both sounds will loop until stopped</p>
        </div>
      </div>
    </div>
  );
}
