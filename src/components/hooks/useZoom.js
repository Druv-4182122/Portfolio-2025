// ========================================
// ZOOM HOOK - Custom hook for camera zoom functionality
// ========================================
import { useRef, useState, useEffect, useCallback } from "react"
import * as THREE from "three"
import gsap from "gsap"

// Zoom targets for Screen_1, Screen_2, and whiteboard
const zoomTargets = {
  Screen_1: {
    cameraPos: new THREE.Vector3(-0.04645542207916764, 1.2464933582268107, 0.08367438691966088),
    targetPos: new THREE.Vector3(-0.7047212714321677, 1.2217938661807093, 0.08331173048551843)
  },
  Screen_2: {
    cameraPos: new THREE.Vector3(0.1651, 1.3805, 0.0805),
    targetPos: new THREE.Vector3(-0.6861, 1.2078, 0.5688)
  },
  whiteboard: {
    cameraPos: new THREE.Vector3(-0.0711717885970552, 1.5520976655983074, 0.14909727748137303),
    targetPos: new THREE.Vector3(-0.0711717885970552, 1.5520976655983074, -0.7502441896975681)
  }
}

export const useZoom = (camera, controlsRef) => {
  // Zoom functionality state
  const [isZoomed, setIsZoomed] = useState(false)
  const originalCameraPosition = useRef(new THREE.Vector3())
  const originalControlsTarget = useRef(new THREE.Vector3())

  // Zoom into specific objects
  const zoomToObject = useCallback((target) => {
    setIsZoomed(true)
    const controls = controlsRef?.current
    if (controls) controls.enabled = false
    
    // Store original positions
    originalCameraPosition.current.copy(camera.position)
    originalControlsTarget.current.copy(controls ? controls.target : new THREE.Vector3(0, 0, 0))
    
    // Animate camera position
    gsap.to(camera.position, {
      duration: 1.2,
      x: target.cameraPos.x,
      y: target.cameraPos.y,
      z: target.cameraPos.z,
      ease: "power3.inOut"
    })

    // Animate controls target
    if (controls) {
      gsap.to(controls.target, {
        duration: 1.2,
        x: target.targetPos.x,
        y: target.targetPos.y,
        z: target.targetPos.z,
        ease: "power3.inOut",
        onUpdate: () => controls.update()
      })
    }

    // Show back button
    const backButton = document.getElementById('back-btn')
    if (backButton) backButton.style.display = 'block'
  }, [camera, controlsRef])

  // Zoom out to original view
  const zoomOut = useCallback(() => {
    const controls = controlsRef?.current
    
    // Animate back to original camera position
    gsap.to(camera.position, {
      duration: 1.2,
      x: originalCameraPosition.current.x,
      y: originalCameraPosition.current.y,
      z: originalCameraPosition.current.z,
      ease: "power3.inOut"
    })

    // Animate back to original controls target
    if (controls) {
      gsap.to(controls.target, {
        duration: 1.2,
        x: originalControlsTarget.current.x,
        y: originalControlsTarget.current.y,
        z: originalControlsTarget.current.z,
        ease: "power3.inOut",
        onUpdate: () => controls.update(),
        onComplete: () => {
          controls.enabled = true
          setIsZoomed(false)
        }
      })
    } else {
      setIsZoomed(false)
    }
    
    // Hide back button
    const backButton = document.getElementById('back-btn')
    if (backButton) backButton.style.display = 'none'
  }, [camera, controlsRef])

  // Setup back button click handler
  useEffect(() => {
    const backButton = document.getElementById('back-btn')
    if (backButton) {
      backButton.addEventListener('click', zoomOut)
      return () => backButton.removeEventListener('click', zoomOut)
    }
  }, [zoomOut])

  return {
    isZoomed,
    setIsZoomed,
    zoomTargets,
    zoomToObject,
    zoomOut,
    originalCameraPosition,
    originalControlsTarget
  }
}