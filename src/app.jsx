import React, { useRef, useEffect, useState } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, useProgress } from "@react-three/drei"
import Model from "./ModelRefactored"
import LoadingScreen from "./LoadingScreen"

function Controls({ controlsRef }) {
  const ref = useRef()
  const { camera } = useThree()

  useEffect(() => {
    if (!ref.current) return
    
    const controls = ref.current
    controls.enableDamping = true
    controls.maxDistance = 10
    controls.minPolarAngle = 0
    controls.maxPolarAngle = Math.PI / 2
    controls.minAzimuthAngle = 0
    controls.maxAzimuthAngle = Math.PI
    controls.target.set(-0.5347883276206734, 0.6471834122468871, 0.1438416559725952)
    
    try { 
      controls.panSpeed = 0.5 
    } catch (e) {
      // Ignore if panSpeed is not available
    }
    
    controls.update()
    
    // Expose controls reference
    if (controlsRef) {
      controlsRef.current = controls
    }
  }, [controlsRef])

  return <OrbitControls ref={ref} enableDamping />
}

function LoadingManager({ onUserInteraction }) {
  const { progress } = useProgress()
  const [showLoading, setShowLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)

  useEffect(() => {
    setLoadingProgress(progress)
  }, [progress])

  const handleLoadingComplete = (withAudio = false) => {
    setShowLoading(false)
    if (onUserInteraction) {
      onUserInteraction(withAudio)
    }
  }

  return (
    <>
      {showLoading && (
        <LoadingScreen 
          progress={loadingProgress} 
          onComplete={handleLoadingComplete}
        />
      )}
    </>
  )
}

export default function App() {
  const controlsRef = useRef()
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [shouldAutoPlayAudio, setShouldAutoPlayAudio] = useState(false)

  const handleUserInteraction = (withAudio) => {
    setHasUserInteracted(true)
    setShouldAutoPlayAudio(withAudio)
  }

  return (
    <>
      <LoadingManager onUserInteraction={handleUserInteraction} />
      <Canvas
        flat
        camera={{
          position: [2.988389442190818, 2.0308409462503008, 2.407836573389637],
          fov: 35,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 2]}
        style={{ width: "100vw", height: "100vh" }}
      >
        <Controls controlsRef={controlsRef} />
        <Model 
          controlsRef={controlsRef} 
          hasUserInteracted={hasUserInteracted}
          shouldAutoPlayAudio={shouldAutoPlayAudio}
        />
      </Canvas>
    </>
  )
}