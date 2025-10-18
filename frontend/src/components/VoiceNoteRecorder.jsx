import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2, Send, Download } from "lucide-react";

export default function VoiceNoteRecorder({ onSend, onCancel }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingState, setRecordingState] = useState("idle"); // idle, recording, recorded, playing

  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setRecordingState("recorded");
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event.error);
        setRecordingState("idle");
        setIsRecording(false);
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      setRecordingState("recording");
      setAudioBlob(null);
      setAudioUrl(null);
      setIsPlaying(false);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please ensure it's connected and permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        setRecordingState("recorded");
      } else {
        audioRef.current.play();
        setIsPlaying(true);
        setRecordingState("playing");
      }
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob);
      // Reset state
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
      setRecordingState("idle");
      setIsPlaying(false);
    }
  };

  const handleCancel = () => {
    // Clean up
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setRecordingState("idle");
    setIsPlaying(false);
    onCancel();
  };

  const handleDelete = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setRecordingState("idle");
    setIsPlaying(false);
  };

  const downloadRecording = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voice-note-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getWaveformData = () => {
    // Simple waveform visualization - in a real app, you'd use Web Audio API
    const bars = 20;
    const data = [];
    for (let i = 0; i < bars; i++) {
      data.push(Math.random() * 100);
    }
    return data;
  };

  return (
    <div className="voice-note-recorder">
      <div className="voice-note-content">
        {recordingState === "idle" && (
          <div className="recording-prompt">
            <div className="mic-icon">
              <Mic size={48} />
            </div>
            <p>Hold to record voice note</p>
            <button 
              className="start-recording-btn"
              onMouseDown={startRecording}
              onTouchStart={startRecording}
            >
              <Mic size={24} />
            </button>
          </div>
        )}

        {recordingState === "recording" && (
          <div className="recording-active">
            <div className="recording-visualization">
              <div className="waveform">
                {getWaveformData().map((height, index) => (
                  <div 
                    key={index}
                    className="wave-bar"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="recording-info">
              <div className="recording-indicator">
                <div className="recording-dot"></div>
                <span>Recording</span>
              </div>
              <div className="recording-time">{formatTime(recordingTime)}</div>
            </div>
            <button 
              className="stop-recording-btn"
              onMouseUp={stopRecording}
              onTouchEnd={stopRecording}
            >
              <Square size={24} />
            </button>
          </div>
        )}

        {recordingState === "recorded" && (
          <div className="recording-playback">
            <div className="playback-visualization">
              <div className="waveform static">
                {getWaveformData().map((height, index) => (
                  <div 
                    key={index}
                    className="wave-bar"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="playback-info">
              <div className="playback-time">{formatTime(recordingTime)}</div>
              <div className="playback-status">Voice note recorded</div>
            </div>
            <div className="playback-controls">
              <button 
                className="play-btn"
                onClick={togglePlayback}
                title="Play/Pause"
              >
                <Play size={20} />
              </button>
              <button 
                className="delete-btn"
                onClick={handleDelete}
                title="Delete"
              >
                <Trash2 size={20} />
              </button>
              <button 
                className="download-btn"
                onClick={downloadRecording}
                title="Download"
              >
                <Download size={20} />
              </button>
              <button 
                className="send-btn"
                onClick={handleSend}
                title="Send"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}

        {recordingState === "playing" && (
          <div className="recording-playback">
            <div className="playback-visualization">
              <div className="waveform playing">
                {getWaveformData().map((height, index) => (
                  <div 
                    key={index}
                    className="wave-bar"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="playback-info">
              <div className="playback-time">{formatTime(recordingTime)}</div>
              <div className="playback-status">Playing...</div>
            </div>
            <div className="playback-controls">
              <button 
                className="play-btn"
                onClick={togglePlayback}
                title="Pause"
              >
                <Pause size={20} />
              </button>
              <button 
                className="delete-btn"
                onClick={handleDelete}
                title="Delete"
              >
                <Trash2 size={20} />
              </button>
              <button 
                className="download-btn"
                onClick={downloadRecording}
                title="Download"
              >
                <Download size={20} />
              </button>
              <button 
                className="send-btn"
                onClick={handleSend}
                title="Send"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Hidden audio element for playback */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => {
              setIsPlaying(false);
              setRecordingState("recorded");
            }}
            onPause={() => {
              setIsPlaying(false);
              setRecordingState("recorded");
            }}
          />
        )}

        {/* Cancel button */}
        <button 
          className="cancel-btn"
          onClick={handleCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
