// ========================================
// WHITEBOARD HOOK - Custom hook for whiteboard functionality
// ========================================
import { useRef, useState, useEffect, useCallback } from "react"
import * as THREE from "three"

export const useWhiteboard = () => {
  // Whiteboard drawing variables
  const whiteboardSurface = useRef(null)
  const boardCanvas = useRef(null)
  const boardContext = useRef(null)
  const whiteboardTexture = useRef(null)
  const boardWidth = 2048
  const boardHeight = 1024
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState('#000000')
  const snapshot = useRef(null)
  const [currentHoveredMarker, setCurrentHoveredMarker] = useState(null)

  // Stable refs to avoid stale closures in window listeners
  const isDrawingRef = useRef(false)
  const currentColorRef = useRef('#000000')

  // keep isDrawingRef in sync
  useEffect(() => {
    isDrawingRef.current = isDrawing
  }, [isDrawing])

  // Marker selection function
  const selectMarker = useCallback((color) => {
    const newColor = (color === 'white') ? '#FFFFFF' : color
    setCurrentColor(newColor)
    currentColorRef.current = newColor
    
    // Reset snapshot when switching markers for smoother start
    if (boardContext.current) {
      snapshot.current = boardContext.current.getImageData(0, 0, boardWidth, boardHeight)
      boardContext.current.beginPath()
    }
  }, [boardWidth, boardHeight])

  // Drawing function for whiteboard
  const drawOnBoard = useCallback((uv) => {
    // Use refs to avoid stale closures from window listeners
    const isDrawingNow = isDrawingRef.current
    const colorNow = currentColorRef.current
    
    if (!boardContext.current || !isDrawingNow) return

    const mouseX = uv.x * boardWidth
    const mouseY = uv.y * boardHeight

    if (snapshot.current) boardContext.current.putImageData(snapshot.current, 0, 0)

    boardContext.current.strokeStyle = colorNow
    boardContext.current.lineWidth = (colorNow === '#FFFFFF') ? 80 : 20
    boardContext.current.lineCap = "round"
    boardContext.current.lineJoin = "round"

    boardContext.current.lineTo(mouseX, mouseY)
    boardContext.current.stroke()

    whiteboardTexture.current.needsUpdate = true
  }, [boardWidth, boardHeight])

  // Setup whiteboard surface
  const setupWhiteboardSurface = useCallback((child) => {
    whiteboardSurface.current = child
    boardCanvas.current = document.createElement('canvas')
    boardCanvas.current.width = boardWidth
    boardCanvas.current.height = boardHeight
    boardContext.current = boardCanvas.current.getContext('2d', { willReadFrequently: true })
    boardContext.current.fillStyle = 'white'
    boardContext.current.fillRect(0, 0, boardWidth, boardHeight)

    whiteboardTexture.current = new THREE.CanvasTexture(boardCanvas.current)
    whiteboardTexture.current.flipY = false
    whiteboardTexture.current.colorSpace = THREE.SRGBColorSpace

    const whiteboardMaterial = new THREE.MeshBasicMaterial({ map: whiteboardTexture.current })
    child.material = whiteboardMaterial

    // Force default black marker selection after whiteboard setup
    selectMarker('black')
  }, [boardWidth, boardHeight, selectMarker])

  return {
    whiteboardSurface,
    boardCanvas,
    boardContext,
    whiteboardTexture,
    boardWidth,
    boardHeight,
    isDrawing,
    setIsDrawing,
    currentColor,
    currentHoveredMarker,
    setCurrentHoveredMarker,
    isDrawingRef,
    currentColorRef,
    snapshot,
    selectMarker,
    drawOnBoard,
    setupWhiteboardSurface
  }
}