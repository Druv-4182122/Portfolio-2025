// ========================================
// INTERACTION MANAGER - Handles mouse events and raycasting
// ========================================
import React, { useRef, useEffect } from "react"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"

export const InteractionManager = ({ 
  camera, 
  size, 
  controlsRef,
  whiteboardSurface,
  isDrawingRef,
  drawOnBoard,
  setIsDrawing,
  boardWidth,
  boardHeight,
  boardContext,
  snapshot,
  // Hover objects and states
  hoverableObjects,
  plushieObjects,
  buttonObjects,
  currentHoveredObject,
  setCurrentHoveredObject,
  currentHoveredPlushie,
  setCurrentHoveredPlushie,
  currentHoveredButton,
  setCurrentHoveredButton,
  currentHoveredMarker,
  setCurrentHoveredMarker,
  // Zoom objects and states
  zoomableObjects,
  clickableObjects,
  isZoomed,
  zoomTargets,
  // Animation functions
  animatelinks,
  playHoverAnimation,
  animateMarkerHover,
  // Other objects
  fanObjects,
  scene
}) => {
  // Raycaster and mouse for hover detection
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())
  const sizesRef = useRef({ width: 0, height: 0 })

  // Mouse movement tracking for hover detection and drawing
  useEffect(() => {
    sizesRef.current = { width: size.width, height: size.height }

    const handleMouseMove = (event) => {
      const { width, height } = sizesRef.current
      mouse.current.x = (event.clientX / width) * 2 - 1
      mouse.current.y = -(event.clientY / height) * 2 + 1

      // Drawing logic when moving mouse while drawing on whiteboard
      if (isDrawingRef.current && whiteboardSurface.current) {
        raycaster.current.setFromCamera(mouse.current, camera)
        const whiteboardIntersects = raycaster.current.intersectObject(whiteboardSurface.current)
        
        if (whiteboardIntersects.length > 0) {
          const uv = whiteboardIntersects[0].uv
          drawOnBoard(uv)
        }
      }
    }

    const handleMouseDown = (event) => {
      if (!whiteboardSurface.current) return
      const { width, height } = sizesRef.current
      mouse.current.x = (event.clientX / width) * 2 - 1
      mouse.current.y = -(event.clientY / height) * 2 + 1

      raycaster.current.setFromCamera(mouse.current, camera)
      const intersects = raycaster.current.intersectObject(whiteboardSurface.current)

      if (intersects.length > 0) {
        const uv = intersects[0].uv
        const mouseX = uv.x * boardWidth
        const mouseY = uv.y * boardHeight

        setIsDrawing(true)
        isDrawingRef.current = true
        if (boardContext.current) {
          snapshot.current = boardContext.current.getImageData(0, 0, boardWidth, boardHeight)
          boardContext.current.beginPath()
          boardContext.current.moveTo(mouseX, mouseY)
        }
      }
    }

    const handleMouseUp = () => {
      setIsDrawing(false)
      isDrawingRef.current = false
    }

    const handleMouseLeave = () => {
      setIsDrawing(false)
      isDrawingRef.current = false
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [camera, controlsRef, whiteboardSurface, isDrawingRef, drawOnBoard, setIsDrawing, boardWidth, boardHeight, boardContext, snapshot])

  // Raycasting for hover detection on every frame
  useFrame(() => {
    raycaster.current.setFromCamera(mouse.current, camera)
    
    // Check for social link objects
    const intersects = raycaster.current.intersectObjects(hoverableObjects.current)
    
    if (intersects.length > 0) {
      const hoveredObject = intersects[0].object
      
      if (hoveredObject !== currentHoveredObject) {
        if (currentHoveredObject) {
          animatelinks(currentHoveredObject, false)
        }
        animatelinks(hoveredObject, true)
        setCurrentHoveredObject(hoveredObject)
      }
    } else {
      if (currentHoveredObject) {
        animatelinks(currentHoveredObject, false)
        setCurrentHoveredObject(null)
      }
    }

    // Check for plushie objects
    const plushieIntersects = raycaster.current.intersectObjects(plushieObjects.current)
    
    if (plushieIntersects.length > 0) {
      const hoveredPlushie = plushieIntersects[0].object
      
      if (hoveredPlushie !== currentHoveredPlushie) {
        if (currentHoveredPlushie) {
          playHoverAnimation(currentHoveredPlushie, false)
        }
        playHoverAnimation(hoveredPlushie, true)
        setCurrentHoveredPlushie(hoveredPlushie)
      }
    } else {
      if (currentHoveredPlushie) {
        playHoverAnimation(currentHoveredPlushie, false)
        setCurrentHoveredPlushie(null)
      }
    }

    // Check for button objects
    const buttonIntersects = raycaster.current.intersectObjects(buttonObjects.current)
    
    if (buttonIntersects.length > 0) {
      const hoveredButton = buttonIntersects[0].object
      
      if (hoveredButton !== currentHoveredButton) {
        setCurrentHoveredButton(hoveredButton)
      }
    } else {
      if (currentHoveredButton) {
        setCurrentHoveredButton(null)
      }
    }

    // Check for marker objects when zoomed into whiteboard
    const controls = controlsRef?.current
    const isWhiteboardZoomed = isZoomed && controls && 
      controls.target.distanceTo(zoomTargets.whiteboard.targetPos) < 0.1
    
    if (isWhiteboardZoomed) {
      const allIntersects = raycaster.current.intersectObjects(scene.children, true)
      let newHoveredMarker = null
      
      for (const intersect of allIntersects) {
        if (intersect.object.name.startsWith('marker_')) {
          newHoveredMarker = intersect.object
          break
        }
      }
      
      if (newHoveredMarker !== currentHoveredMarker) {
        if (currentHoveredMarker) {
          animateMarkerHover(currentHoveredMarker, false)
        }
        if (newHoveredMarker) {
          animateMarkerHover(newHoveredMarker, true)
        }
        setCurrentHoveredMarker(newHoveredMarker)
      }
    } else {
      if (currentHoveredMarker) {
        animateMarkerHover(currentHoveredMarker, false)
        setCurrentHoveredMarker(null)
      }
    }

    // Check for zoomable and clickable objects
    const zoomableIntersects = raycaster.current.intersectObjects(zoomableObjects.current)
    const clickableIntersects = raycaster.current.intersectObjects(clickableObjects.current)
    
    let hoveredZoomableObject = zoomableIntersects.length > 0 ? zoomableIntersects[0].object : null
    let hoveredClickableObject = clickableIntersects.length > 0 ? clickableIntersects[0].object : null

    // Cursor logic
    const setCursor = (cursor) => {
      document.body.style.cursor = cursor
    }

    if (hoveredZoomableObject) {
      const controls = controlsRef?.current
      const isScreen1Zoomed = isZoomed && controls && 
        controls.target.distanceTo(zoomTargets.Screen_1.targetPos) < 0.1
      const isScreen2Zoomed = isZoomed && controls && 
        controls.target.distanceTo(zoomTargets.Screen_2.targetPos) < 0.1

      if (isScreen1Zoomed || isScreen2Zoomed) {
        setCursor('default')
      }
      else if (hoveredZoomableObject.name.includes("Screen_1") || 
               hoveredZoomableObject.name.includes("Screen_2") || 
               hoveredZoomableObject.name.includes("whiteboard_raycaster_pointer")) {
        setCursor('pointer')
      }
      else {
        setCursor('default')
      }
    } else if (hoveredClickableObject) {
      setCursor('pointer')
    } else {
      if (currentHoveredObject || currentHoveredPlushie || currentHoveredButton) {
        setCursor('pointer')
      } else {
        setCursor('default')
      }
    }

    // Rotate fan objects continuously
    fanObjects.current.forEach((fan) => {
      fan.rotation.y += 0.1
    })
  })

  return null // This component doesn't render anything visual
}

export default InteractionManager