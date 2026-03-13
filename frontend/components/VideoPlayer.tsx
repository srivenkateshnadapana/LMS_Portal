"use client"

import { useState, useRef, useEffect } from 'react';

interface VideoPlayerProps {
  fileId: string;
}

export default function VideoPlayer({ fileId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  const videoSrc = `http://localhost:8080/api/video/${fileId}`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      if (video.duration > 0) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  const progressWidth = Math.max(progress, 0);

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
      <video
        ref={videoRef}
        src={videoSrc}
        controls
        className="w-full h-full object-contain"
        preload="metadata"
        poster={`/api/thumbnail/${fileId}`}
      >
        Your browser does not support the video tag.
      </video>
      <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm text-white p-3 rounded-lg">
        <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-400 to-purple-500 h-1.5 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
        {duration > 0 && (
          <div className="text-xs mt-1 flex justify-between">
            <span>{Math.floor(progress)}%</span>
            <span>{Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
