'use client'

import { useEffect, useRef } from 'react'
import { videoApi } from '@/lib/api'

interface SecureVideoPlayerProps {
  filename: string
  className?: string
}

export function SecureVideoPlayer({ filename, className = '' }: SecureVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!filename) return

    const videoEl = videoRef.current
    if (!videoEl) return

    const streamUrl = videoApi.getStreamUrl(filename)
    videoEl.src = streamUrl

    // Prevent right-click
    const handleContext = (e: MouseEvent) => e.preventDefault()
    videoEl.addEventListener('contextmenu', handleContext)

    return () => {
      videoEl.removeEventListener('contextmenu', handleContext)
    }
  }, [filename])

  if (!filename) return null

  return (
    <div
      ref={containerRef}
      className={`secure-video-container relative rounded-xl overflow-hidden bg-black group ${className}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <video
        ref={videoRef}
        controls
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        playsInline
        className="w-full h-full object-contain relative z-20"
        style={{ maxHeight: '500px' }}
        onDragStart={(e) => e.preventDefault()}
      />
      {/* Watermark overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10 select-none z-30">
        <span className="text-white text-4xl font-black tracking-widest rotate-[-25deg]">
          FITVIBE
        </span>
      </div>
      <style jsx>{`
        .secure-video-container video::-webkit-media-controls-enclosure {
          overflow: hidden;
        }
        .secure-video-container video::-webkit-media-controls-panel {
          z-index: 20;
          position: relative;
        }
      `}</style>
    </div>
  )
}
