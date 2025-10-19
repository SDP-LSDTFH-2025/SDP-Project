import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Trash2 } from "lucide-react";

export default function VoiceNotePlayer({ 
  audioBlob, 
  audioUrl, 
  onDelete, 
  isOwnMessage = false,

}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration || 0);
      const handleLoadStart = () => setIsLoading(true);
      const handleLoadedData = () => setIsLoading(false);
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      const handlePause = () => setIsPlaying(false);

      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('loadstart', handleLoadStart);
      audio.addEventListener('loadeddata', handleLoadedData);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('pause', handlePause);

      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('loadstart', handleLoadStart);
        audio.removeEventListener('loadeddata', handleLoadedData);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('pause', handlePause);
      };
    }
  }, [audioBlob, audioUrl]);

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const getAudioUrl = () => {
    if (audioBlob) {
      return URL.createObjectURL(audioBlob);
    }
    if (audioUrl) {
      // If audioUrl is already a data URL, return it
      if (audioUrl.startsWith('data:')) {
        return audioUrl;
      }
      // If audioUrl is base64 data, format it as data URL
      if (audioUrl.startsWith('data:audio/')) {
        return audioUrl;
      }
      // If it's raw base64, add the data URL prefix
      return `data:audio/webm;base64,${audioUrl}`;
    }
    return null;
  };


  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!duration) return 0;
    return (currentTime / duration) * 100;
  };

  const getWaveformData = () => {
    // Simple waveform visualization
    const bars = 15;
    const data = [];
    for (let i = 0; i < bars; i++) {
      data.push(Math.random() * 100);
    }
    return data;
  };

  return (
    <div className="voice-note-player">
      <div className="voice-note-content">
        {/* Waveform Visualization */}
        <div className="waveform-container">
          <div className="waveform">
            {getWaveformData().map((height, index) => (
              <div 
                key={index}
                className={`wave-bar ${isPlaying ? 'playing' : ''}`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>

        {/* Playback Controls */}
        <div className="playback-controls">
          <button 
            className={`play-btn ${isPlaying ? 'playing' : ''}`}
            onClick={togglePlayback}
            disabled={isLoading}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : isPlaying ? (
              <Pause size={20} />
            ) : (
              <Play size={20} />
            )}
          </button>

          <div className="time-info">
            <span className="current-time">{formatTime(currentTime)}</span>
            <span className="duration">{formatTime(duration)}</span>
          </div>

          <div className="progress-container">
            <div 
              className="progress-bar"
              ref={progressRef}
              onClick={handleSeek}
            >
              <div 
                className="progress-fill"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isOwnMessage && onDelete && (
          <div className="action-buttons">
            <button 
              className="delete-btn"
              onClick={onDelete}
              title="Delete"
            >
              <Trash2 size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Hidden audio element */}
      {(audioBlob || audioUrl) && (
        <audio
          ref={audioRef}
          src={getAudioUrl()}
          preload="metadata"
        />
      )}
    </div>
  );
}
