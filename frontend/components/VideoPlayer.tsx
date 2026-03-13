"use client"

import { useEffect, useRef } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

interface VideoPlayerProps {
  fileId: string
}

export function VideoPlayer({ fileId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<any>(null)

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement(\"video-js\")
      videoElement.classList.add('vjs-default-skin')
      
      if (videoRef.current) {
        videoRef.current.parentNode?.replaceChild(videoElement, videoRef.current)
        videoRef.current = videoElement as HTMLVideoElement
      }

      const player = videojs(videoElement, {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
          src: `http://localhost:8080/api/video/${fileId}`,
          type: 'video/mp4'
        }]
      })

      playerRef.current = player
    } else {
      // Update source
      playerRef.current.src({ src: `http://localhost:8080/api/video/${fileId}`, type: 'video/mp4' })
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose()
        playerRef.current = null
      }
    }
  }, [fileId])

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered" />
    </div>
  )
}

export default VideoPlayer

