import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2 } from "lucide-react";

export default function VoiceRecorder({ onRecordingComplete, onCancel }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  console.log("VoiceRecorder rendered");
  
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const playRecording = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingTime(0);
  };

  const sendRecording = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
      deleteRecording();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="voice-recorder">
      <div className="voice-recorder-content">
        {!audioBlob ? (
          <div className="recording-controls">
            <div className="recording-status">
              {isRecording ? (
                <div className="recording-indicator">
                  <div className="recording-dot"></div>
                  <span>Recording... {formatTime(recordingTime)}</span>
                </div>
              ) : (
                <span>Tap to record voice message</span>
              )}
            </div>
            
            <div className="recording-actions">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="record-btn start"
                >
                  <Mic size={24} />
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="record-btn stop"
                >
                  <Square size={20} />
                </button>
              )}
              
              <button
                onClick={onCancel}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="playback-controls">
            <div className="playback-info">
              <span>Voice message ({formatTime(recordingTime)})</span>
            </div>
            
            <div className="playback-actions">
              <button
                onClick={playRecording}
                className="play-btn"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              
              <button
                onClick={deleteRecording}
                className="delete-btn"
              >
                <Trash2 size={20} />
              </button>
              
              <button
                onClick={sendRecording}
                className="send-btn"
              >
                Send
              </button>
            </div>
            
            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
