// ========================================
// MAIN MODEL COMPONENT - Refactored and componentized
// ========================================
import React, { useMemo, useRef, useEffect, useState } from "react"
import * as THREE from "three"
import { useGLTF, useTexture, useProgress } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { CoffeeSmoke } from "./CoffeeSmoke"

// Custom hooks
import { useWhiteboard } from "./components/hooks/useWhiteboard"
import { useZoom } from "./components/hooks/useZoom"
import { useAnimations } from "./components/hooks/useAnimations"
import { useMedia } from "./components/hooks/useMedia"
import { useSceneSetup } from "./components/hooks/useSceneSetup"
import { useClickHandler } from "./components/hooks/useClickHandler"

// Components
import InteractionManager from "./components/InteractionManager"

// Constants
import { textureMap } from "./components/constants"

export default function Model({ controlsRef, hasUserInteracted, shouldAutoPlayAudio }) {
  
  // ========================================
  // BASIC THREE.JS SETUP
  // ========================================
  const { gl, camera, size } = useThree()
  const { scene } = useGLTF("/model/roomPortfolio_NoMaterials_V33.glb")
  const loadedTextures = useTexture(Object.values(textureMap))
  const { progress } = useProgress()

  // ========================================
  // LOADING STATE
  // ========================================
  const [isLoaded, setIsLoaded] = useState(false)

  // ========================================
  // HOVER STATES
  // ========================================
  const [currentHoveredObject, setCurrentHoveredObject] = useState(null)
  const [currentHoveredPlushie, setCurrentHoveredPlushie] = useState(null)
  const [currentHoveredButton, setCurrentHoveredButton] = useState(null)

  // ========================================
  // OBJECT COLLECTION REFS
  // ========================================
  const hoverableObjects = useRef([])
  const plushieObjects = useRef([])
  const buttonObjects = useRef([])
  const clickableObjects = useRef([])
  const zoomableObjects = useRef([])
  const fanObjects = useRef([])

  // ========================================
  // CUSTOM HOOKS
  // ========================================
  
  // Whiteboard functionality
  const whiteboard = useWhiteboard()

  // Zoom functionality  
  const zoom = useZoom(camera, controlsRef)

  // Animation functionality
  const animations = useAnimations()

  // Media functionality (video & audio)
  const media = useMedia()

  // Click handler
  const clickHandler = useClickHandler({
    button1MeshRef: media.button1MeshRef,
    button2MeshRef: media.button2MeshRef,
    setIsMonitorOn: media.setIsMonitorOn,
    setIsScreen1On: media.setIsScreen1On,
    backgroundAudioRef: media.backgroundAudioRef,
    isZoomed: zoom.isZoomed,
    controlsRef,
    zoomTargets: zoom.zoomTargets,
    selectMarker: whiteboard.selectMarker,
    zoomToObject: zoom.zoomToObject,
    animateClickEffect: animations.animateClickEffect
  })

  // ========================================
  // MATERIALS (MEMOIZED)
  // ========================================
  const materials = useMemo(() => {
    const maxAnisotropy = gl.capabilities?.getMaxAnisotropy() || 1
    const materialCache = {}

    Object.keys(textureMap).forEach((key, index) => {
      const texture = loadedTextures[index]
      texture.flipY = false
      texture.colorSpace = THREE.SRGBColorSpace
      texture.minFilter = THREE.LinearFilter
      texture.anisotropy = maxAnisotropy

      // Special handling for AboutMe texture to fix orientation
      if (key === 'AboutMe') {
        texture.rotation = Math.PI * 1
        texture.center.set(0.5, 0.5)
        texture.offset.set(-0.01, -0.009)
      }

      materialCache[key] = new THREE.MeshBasicMaterial({ map: texture })
    })
    return materialCache
  }, [loadedTextures, gl])

  // Materials for Screen_1 on/off states
  const { screen1OnMaterial, screen1OffMaterial } = useMemo(() => {
    return {
      screen1OnMaterial: materials.AboutMe,
      screen1OffMaterial: new THREE.MeshBasicMaterial({ color: 0x000000 }),
    }
  }, [materials])

  // ========================================
  // SCENE SETUP
  // ========================================
  useSceneSetup({
    scene,
    materials,
    onMaterial: media.onMaterial,
    screen1OnMaterial,
    setupWhiteboardSurface: whiteboard.setupWhiteboardSurface,
    hoverableObjects,
    plushieObjects,
    buttonObjects,
    clickableObjects,
    zoomableObjects,
    fanObjects,
    animationObjectsRef: animations.animationObjectsRef,
    screen1MeshRef: media.screen1MeshRef,
    screen2MeshRef: media.screen2MeshRef,
    button1MeshRef: media.button1MeshRef,
    button2MeshRef: media.button2MeshRef,
    selectMarker: whiteboard.selectMarker
  })

  // ========================================
  // LIFECYCLE EFFECTS
  // ========================================
  
  // Handle loading completion
  useEffect(() => {
    if (progress === 100 && scene && loadedTextures.length > 0 && !isLoaded) {
      const timer = setTimeout(() => {
        setIsLoaded(true)
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [progress, scene, loadedTextures, isLoaded])

  // Trigger intro animation after loading is complete AND user has interacted
  useEffect(() => {
    if (isLoaded && !animations.hasPlayedIntro.current && hasUserInteracted) {
      const timer = setTimeout(() => {
        animations.playIntroAnimation()
        animations.hasPlayedIntro.current = true
      }, 200)
      
      return () => clearTimeout(timer)
    }
  }, [isLoaded, hasUserInteracted, animations])

  // Try to start background audio when loading is complete
  useEffect(() => {
    if (isLoaded && media.backgroundAudioRef.current && hasUserInteracted && shouldAutoPlayAudio) {
      media.backgroundAudioRef.current.play()
        .catch((error) => {
          console.log("Failed to start background music:", error)
        })
    }
  }, [isLoaded, hasUserInteracted, shouldAutoPlayAudio, media.backgroundAudioRef])

  // Toggle Screen_1 material based on state
  useEffect(() => {
    if (media.screen1MeshRef.current) {
      if (media.isScreen1On) {
        media.screen1MeshRef.current.material = screen1OnMaterial
      } else {
        media.screen1MeshRef.current.material = screen1OffMaterial
      }
    }
  }, [media.isScreen1On, screen1OnMaterial, screen1OffMaterial, media.screen1MeshRef])

  // ========================================
  // RENDER
  // ========================================
  return (
    <group>
      <primitive 
        object={scene} 
        onClick={clickHandler.handleSceneClick}
      />
      <CoffeeSmoke visible={progress >= 100} />
      
      <InteractionManager
        camera={camera}
        size={size}
        controlsRef={controlsRef}
        whiteboardSurface={whiteboard.whiteboardSurface}
        isDrawingRef={whiteboard.isDrawingRef}
        drawOnBoard={whiteboard.drawOnBoard}
        setIsDrawing={whiteboard.setIsDrawing}
        boardWidth={whiteboard.boardWidth}
        boardHeight={whiteboard.boardHeight}
        boardContext={whiteboard.boardContext}
        snapshot={whiteboard.snapshot}
        hoverableObjects={hoverableObjects}
        plushieObjects={plushieObjects}
        buttonObjects={buttonObjects}
        currentHoveredObject={currentHoveredObject}
        setCurrentHoveredObject={setCurrentHoveredObject}
        currentHoveredPlushie={currentHoveredPlushie}
        setCurrentHoveredPlushie={setCurrentHoveredPlushie}
        currentHoveredButton={currentHoveredButton}
        setCurrentHoveredButton={setCurrentHoveredButton}
        currentHoveredMarker={whiteboard.currentHoveredMarker}
        setCurrentHoveredMarker={whiteboard.setCurrentHoveredMarker}
        zoomableObjects={zoomableObjects}
        clickableObjects={clickableObjects}
        isZoomed={zoom.isZoomed}
        zoomTargets={zoom.zoomTargets}
        animatelinks={animations.animatelinks}
        playHoverAnimation={animations.playHoverAnimation}
        animateMarkerHover={animations.animateMarkerHover}
        fanObjects={fanObjects}
        scene={scene}
      />
    </group>
  )
}

// ========================================
// PRELOADING
// ========================================
useGLTF.preload("/model/roomPortfolio_NoMaterials_V33.glb")

Object.values(textureMap).forEach(texturePath => {
  useTexture.preload(texturePath)
})