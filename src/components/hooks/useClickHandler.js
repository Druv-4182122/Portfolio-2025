// ========================================
// CLICK HANDLER - Handles all click interactions
// ========================================
import { socialLinks } from "../constants"

export const useClickHandler = ({
  // Media controls
  button1MeshRef,
  button2MeshRef,
  setIsMonitorOn,
  setIsScreen1On,
  backgroundAudioRef,
  // Whiteboard
  isZoomed,
  controlsRef,
  zoomTargets,
  selectMarker,
  // Zoom
  zoomToObject,
  // Animations
  animateClickEffect
}) => {
  const handleSceneClick = (event) => {
    event.stopPropagation()
    const clickedObject = event.object

    // Check if the clicked object is the monitor button
    if (clickedObject === button1MeshRef.current) {
      setIsMonitorOn((prev) => !prev)
      return
    }

    // Check if the clicked object is the Screen_1 button
    if (clickedObject === button2MeshRef.current) {
      setIsScreen1On((prev) => !prev)
      return
    }

    // Check for social links
    let isSocialLink = false
    for (const [key, url] of Object.entries(socialLinks)) {
      if (clickedObject.name.toLowerCase().includes(key.toLowerCase())) {
        window.open(url, "_blank")
        isSocialLink = true
        break
      }
    }
    
    if (isSocialLink) return

    // Check for Music_Eighth click (toggles background audio)
    if (clickedObject.name.includes("Music_Eighth")) {
      animateClickEffect(clickedObject)
      
      // Toggle background audio playback
      if (backgroundAudioRef.current) {
        if (backgroundAudioRef.current.paused) {
          backgroundAudioRef.current.play().catch(console.error)
        } else {
          backgroundAudioRef.current.pause()
        }
      }
      return
    }

    // Check for marker clicks when zoomed into whiteboard
    const controls = controlsRef?.current
    const isWhiteboardZoomed = isZoomed && controls && 
      controls.target.distanceTo(zoomTargets.whiteboard.targetPos) < 0.1
    
    if (isWhiteboardZoomed && clickedObject.name.startsWith('marker_')) {
      const selectedColor = clickedObject.name.split('_')[1]
      selectMarker(selectedColor)
      return
    }

    // Zoom logic
    if (!isZoomed) {
      if (clickedObject.name.includes("Screen_1") || clickedObject.name.includes("Screen_2") || clickedObject.name.includes("whiteboard_raycaster_pointer")) {
        const targetName = clickedObject.name.includes("Screen_1") ? "Screen_1" : 
                          clickedObject.name.includes("Screen_2") ? "Screen_2" : "whiteboard"
        zoomToObject(zoomTargets[targetName])
      }
    }
  }

  return { handleSceneClick }
}