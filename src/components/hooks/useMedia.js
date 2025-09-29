// ========================================
// MEDIA HOOK - Custom hook for video and audio management
// ========================================
import { useRef, useState, useMemo, useEffect } from "react"
import * as THREE from "three"

export const useMedia = () => {
  // Media references
  const videoRef = useRef(null)
  const videoTextureRef = useRef(null)
  const backgroundAudioRef = useRef(null)

  // Screen states
  const [isMonitorOn, setIsMonitorOn] = useState(true)
  const [isScreen1On, setIsScreen1On] = useState(true)

  // Screen mesh references
  const screen1MeshRef = useRef(null)
  const screen2MeshRef = useRef(null)
  const button1MeshRef = useRef(null)
  const button2MeshRef = useRef(null)

  // Video setup for monitor screen
  if (!videoRef.current) {
    const video = document.createElement("video")
    video.src = "/video/bideo.mp4"
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.autoplay = true
    video.play()
    videoRef.current = video

    const videoTexture = new THREE.VideoTexture(video)
    videoTexture.flipY = true
    videoTexture.colorSpace = THREE.SRGBColorSpace
    videoTexture.wrapS = THREE.RepeatWrapping
    videoTexture.repeat.x = -1
    videoTextureRef.current = videoTexture
  }

  // Background audio setup
  if (!backgroundAudioRef.current) {
    const backgroundAudio = document.createElement("audio")
    backgroundAudio.src = "/video/val.mp4"
    backgroundAudio.loop = true
    backgroundAudio.volume = 0.1
    
    backgroundAudio.addEventListener('ended', () => {
      backgroundAudio.currentTime = 0
      backgroundAudio.play().catch(console.error)
    })
    
    backgroundAudioRef.current = backgroundAudio
  }

  // Materials for monitor ON/OFF states
  const { onMaterial, offMaterial } = useMemo(() => {
    return {
      onMaterial: new THREE.MeshBasicMaterial({
        map: videoTextureRef.current,
      }),
      offMaterial: new THREE.MeshBasicMaterial({ color: 0x000000 }),
    }
  }, [videoTextureRef.current])

  // Toggle monitor material and video playback
  useEffect(() => {
    if (screen2MeshRef.current && videoRef.current) {
      if (isMonitorOn) {
        screen2MeshRef.current.material = onMaterial
        videoRef.current.play()
      } else {
        screen2MeshRef.current.material = offMaterial
        videoRef.current.pause()
      }
    }
  }, [isMonitorOn, onMaterial, offMaterial])

  return {
    videoRef,
    videoTextureRef,
    backgroundAudioRef,
    isMonitorOn,
    setIsMonitorOn,
    isScreen1On,
    setIsScreen1On,
    screen1MeshRef,
    screen2MeshRef,
    button1MeshRef,
    button2MeshRef,
    onMaterial,
    offMaterial
  }
}