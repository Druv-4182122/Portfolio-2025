import React, { useMemo, useRef, useEffect, useState } from "react"
import * as THREE from "three"
import { useGLTF, useTexture, useProgress } from "@react-three/drei"
import { useThree, useFrame } from "@react-three/fiber"
import { CoffeeSmoke } from "./CoffeeSmoke"
import gsap from "gsap"

const textureMap = {
  First: "./Squooshed/Final_FirstTexture.webp",
  Second: "./Squooshed/Final_Second_Texture.webp",
  Third: "./Squooshed/ThirdTexture.webp",
  Fourth: "./Squooshed/Fourth_Texture.webp",
  Outside: "./Squooshed/Outside.webp",
  Sixth: "./Squooshed/SixthTexture_Final.webp",
  Seven: "./Squooshed/Seventh.webp",
  Eighth: "./Squooshed/Eighth.webp",
  AboutMe: "./img/about_me3.png",
}

const socialLinks = {
  linkedin: "https://www.linkedin.com/in/druv-nagpal/",
  github: "https://github.com/Druv-4182122",
  Threejs: "https://threejs-journey.com/certificate/view/15155",
  Luffy: "https://drive.google.com/file/d/1PIZh0LnVV4e7hdPr55YhotOcyEIZcGMg/view",
  CV: "https://drive.google.com/your-cv-link", 
  Project1: "https://sunnyday-beta.vercel.app/",
  Project2: "https://funhouse-alpha.vercel.app/",
  Project3: "https://hauntedscene.vercel.app/"
}

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

export default function Model({ controlsRef, hasUserInteracted, shouldAutoPlayAudio }) {
  const { gl, camera, size } = useThree()
  const { scene } = useGLTF("/model/roomPortfolio_NoMaterials_V33.glb")
  const loadedTextures = useTexture(Object.values(textureMap))
  const { progress } = useProgress()

  // Loading state
  const [isLoaded, setIsLoaded] = useState(false)

  // Raycaster and mouse for hover detection
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())
  const [currentHoveredObject, setCurrentHoveredObject] = useState(null)
  const [currentHoveredPlushie, setCurrentHoveredPlushie] = useState(null)
  const [currentHoveredButton, setCurrentHoveredButton] = useState(null)
  
  // Whiteboard drawing variables
  const whiteboardSurface = useRef(null)
  const boardCanvas = useRef(null)
  const boardContext = useRef(null)
  const whiteboardTexture = useRef(null)
  const boardWidth = 2048
  const boardHeight = 1024
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState('#000000') // default black marker
  const snapshot = useRef(null)
  const [currentHoveredMarker, setCurrentHoveredMarker] = useState(null)

  // Stable refs to avoid stale closures in window listeners
  const isDrawingRef = useRef(false)
  const currentColorRef = useRef('#000000')
  const sizesRef = useRef({ width: 0, height: 0 })
  
  // Zoom functionality state
  const [isZoomed, setIsZoomed] = useState(false)
  const originalCameraPosition = useRef(new THREE.Vector3())
  const originalControlsTarget = useRef(new THREE.Vector3())
  
  // Store object refs for interactions
  const hoverableObjects = useRef([])
  const plushieObjects = useRef([])
  const buttonObjects = useRef([])
  const clickableObjects = useRef([])
  const zoomableObjects = useRef([])
  const fanObjects = useRef([])

  // Setup video element + texture
  const videoRef = useRef(null)
  const videoTextureRef = useRef(null)
  
  // Setup val.mp4 audio element for background music
  const backgroundAudioRef = useRef(null)

  if (!videoRef.current) {
    const video = document.createElement("video")
    video.src = "/video/bideo.mp4" // place in /public/video/
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.autoplay = true // start ON
    video.play()
    videoRef.current = video

    const videoTexture = new THREE.VideoTexture(video)
    videoTexture.flipY = true
    videoTexture.colorSpace = THREE.SRGBColorSpace
    videoTexture.wrapS = THREE.RepeatWrapping
    videoTexture.repeat.x = -1
    videoTextureRef.current = videoTexture
  }

  // Setup background audio
  if (!backgroundAudioRef.current) {
    const backgroundAudio = document.createElement("audio")
    backgroundAudio.src = "/video/val.mp4"
    backgroundAudio.loop = true
    backgroundAudio.volume = 0.1 // Set volume to 10% for subtle background music
    
    // Add event listeners for audio state management
    backgroundAudio.addEventListener('ended', () => {
      backgroundAudio.currentTime = 0
      backgroundAudio.play().catch(console.error)
    })
    
    backgroundAudioRef.current = backgroundAudio
  }

  // Memoize materials for ON and OFF states
  const { onMaterial, offMaterial } = useMemo(() => {
    return {
      onMaterial: new THREE.MeshBasicMaterial({
        map: videoTextureRef.current,
      }),
      offMaterial: new THREE.MeshBasicMaterial({ color: 0x000000 }),
    }
  }, [videoTextureRef.current])

  const [isMonitorOn, setIsMonitorOn] = useState(true)
  const [isScreen1On, setIsScreen1On] = useState(true)
  const screen1MeshRef = useRef(null)
  const screen2MeshRef = useRef(null)
  const button1MeshRef = useRef(null)
  const button2MeshRef = useRef(null)

  // Refs for intro animation objects
  const animationObjectsRef = useRef({
    linkedin: null,
    github: null,
    Threejs: null,
    Luffy: null,
    Music_Eighth: null,
    car: null,
    notes: null,
    notes_001: null,
    notes_002: null,
    notes_003: null,
    notes_004: null,
    notes_005: null,
    headset: null,
    plushie1: null,
    plushie2: null,
    chair: null,
    partokurchi: null
  })

  // Ref to track if intro animation has played
  const hasPlayedIntro = useRef(false)

  // Handle loading completion
  useEffect(() => {
    if (progress === 100 && scene && loadedTextures.length > 0 && !isLoaded) {
      // Small delay to ensure everything is ready
      const timer = setTimeout(() => {
        setIsLoaded(true)
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [progress, scene, loadedTextures, isLoaded])

  // Trigger intro animation after loading is complete AND user has interacted
  useEffect(() => {
    if (isLoaded && !hasPlayedIntro.current && hasUserInteracted) {
      // Small additional delay to ensure all objects are set up
      const timer = setTimeout(() => {
        playIntroAnimation()
        hasPlayedIntro.current = true
      }, 200)
      
      return () => clearTimeout(timer)
    }
  }, [isLoaded, hasUserInteracted])

  // Try to start background audio when loading is complete
  useEffect(() => {
    if (isLoaded && backgroundAudioRef.current && hasUserInteracted && shouldAutoPlayAudio) {
      // Only start audio after user has interacted with the page AND chose "Enter with Audio"
      backgroundAudioRef.current.play()
        .catch((error) => {
          console.log("Failed to start background music:", error)
        })
    }
  }, [isLoaded, hasUserInteracted, shouldAutoPlayAudio])

  // keep isDrawingRef in sync for any React state updates triggered elsewhere
  useEffect(() => {
    isDrawingRef.current = isDrawing
  }, [isDrawing])

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
        texture.rotation = Math.PI * 1 // Rotate 180 degrees
        texture.center.set(0.5, 0.5) // Set rotation center
        texture.offset.set(-0.01, -0.009) // Move to bottom right
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

  // Animation function for hover effects
  const animatelinks = (object, isHovering) => {
    if (!object || !object.userData.initialRotation) return
    
    gsap.killTweensOf([object.scale, object.rotation, object.position])
    if (isHovering) {
      gsap.to(object.rotation, {
        z: object.userData.initialRotation.z - Math.PI / 5,
        duration: 0.4,
        ease: "power4.out(2.5)"
      })
    } else {
      gsap.to(object.rotation, {
        z: object.userData.initialRotation.z,
        duration: 0.3,
        ease: "bounce.out(2.5)"
      })
    }
  }

  // Animation function for plushie hover effects
  const playHoverAnimation = (object, isHovering) => {
    if (!object || !object.userData.initialScale) return
    
    gsap.killTweensOf([object.scale, object.rotation, object.position])
    if (isHovering) {
      gsap.to(object.scale, {
        y: object.userData.initialScale.y * 1.5,
        z: object.userData.initialScale.z * 1.5,
        x: object.userData.initialScale.x * 1.5,
        duration: 0.5,
        ease: "bounce.out(5)"
      })
    } else {
      gsap.to(object.scale, {
        x: object.userData.initialScale.x,
        y: object.userData.initialScale.y,
        z: object.userData.initialScale.z,
        duration: 0.3,
        ease: "bounce.out(1.8)"
      })
      gsap.to(object.rotation, {
        x: object.userData.initialRotation.x,
        duration: 0.3,
        ease: "bounce.out(1.8)"
      })
    }
  }

  // Animation function for marker hover effects
  const animateMarkerHover = (object, isHovering) => {
    if (!object || !object.userData.initialScale) return
    
    gsap.killTweensOf(object.scale)
    const targetScale = isHovering ? 1.175 : 1
    gsap.to(object.scale, {
      x: object.userData.initialScale.x * targetScale,
      y: object.userData.initialScale.y * targetScale,
      z: object.userData.initialScale.z * targetScale,
      duration: 0.3,
      ease: "power2.out"
    })
  }

  // Animation function for clickable objects (button press effect)
  const animateClickEffect = (object) => {
    if (!object || !object.userData.initialScale) return
    
    gsap.killTweensOf(object.scale)
    
    // Press in animation followed by bounce out
    gsap.timeline()
      .to(object.scale, {
        x: object.userData.initialScale.x * 0.85,
        y: object.userData.initialScale.y * 0.85,
        z: object.userData.initialScale.z * 0.85,
        duration: 0.1,
        ease: "power2.out"
      })
      .to(object.scale, {
        x: object.userData.initialScale.x,
        y: object.userData.initialScale.y,
        z: object.userData.initialScale.z,
        duration: 0.4,
        ease: "back.out(1.7)"
      })
  }

  // Intro animation function
  const playIntroAnimation = () => {
    const { linkedin, github, Threejs, Luffy, Music_Eighth, CV, Project1, Project2, Project3, car, notes, notes_001, notes_002, 
            notes_003, notes_004, notes_005, headset, plushie1, plushie2, chair, partokurchi } = animationObjectsRef.current

    let t1 = gsap.timeline({
      defaults: {
        duration: 0.8,
        ease: "back.out(1.8)"
      }
    })

    // CAR
    if (car) {
      t1.to(car.position, { 
        y: car.userData.initialPosition.y,
        duration: 1.5,
        ease: "bounce.out(1.8)"
      })
      .add("iconsStart", "-=0.4")
    }

    // Social links animation (LinkedIn, GitHub, Threejs, Luffy, Music_Eighth, CV, Project1, Project2, Project3)
    const socialLinks = [linkedin, github, Threejs, Luffy, Music_Eighth, CV, Project1, Project2, Project3]
    socialLinks.forEach((link) => {
      if (link) {
        t1.to(link.position, {
          y: link.userData.initialPosition.y,
          duration: 0.8,
          ease: "back.out(0.8)"
        }, "iconsStart")
        .to(link.rotation, {
          z: link.userData.initialRotation.z - Math.PI / 5,
          duration: 0.5,
          ease: "power4.out(2.5)"
        }, "iconsRotate")
        .to(link.rotation, {
          z: link.userData.initialRotation.z,
          duration: 0.3,
          ease: "bounce.out(2.5)"
        }, "iconsRotateBack")
      }
    })
    
    t1.add("iconsRotate")
    .add("iconsRotateBack")

    // Notes animations (consolidated)
    const notesObjects = [
      { obj: notes, props: { y: notes?.userData.initialPosition.y } },
      { obj: notes_001, props: { x: notes_001?.userData.initialPosition.x, y: notes_001?.userData.initialPosition.y } },
      { obj: notes_002, props: { z: notes_002?.userData.initialPosition.z, y: notes_002?.userData.initialPosition.y } },
      { obj: notes_003, props: { z: notes_003?.userData.initialPosition.z, y: notes_003?.userData.initialPosition.y } },
      { obj: notes_004, props: { x: notes_004?.userData.initialPosition.x, y: notes_004?.userData.initialPosition.y, z: notes_004?.userData.initialPosition.z } },
      { obj: notes_005, props: { x: notes_005?.userData.initialPosition.x, y: notes_005?.userData.initialPosition.y, z: notes_005?.userData.initialPosition.z } }
    ]
    
    notesObjects.forEach(({ obj, props }) => {
      if (obj) {
        t1.to(obj.position, {
          ...props,
          duration: 1.5,
          ease: "power4.out(0.8)"
        }, "iconsStart")
      }
    })

    // Toys (headset, plushies, chair, partokurchi)
    const toyObjects = [headset, plushie1, plushie2, chair, partokurchi]
    toyObjects.forEach((toyObj) => {
      if (toyObj) {
        t1.to(toyObj.scale, { 
          x: 1, y: 1, z: 1, 
          duration: 0.8, 
          ease: "back.out(2.2)" 
        }, "toys")
      }
    })

    t1.add("toys")
  }

  // Zoom functionality
  const zoomToObject = (target) => {
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
  }

  const zoomOut = () => {
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
  }

  // Marker selection function
  const selectMarker = (color) => {
    const newColor = (color === 'white') ? '#FFFFFF' : color
    setCurrentColor(newColor)
    currentColorRef.current = newColor
    
    // Reset snapshot when switching markers for smoother start
    if (boardContext.current) {
      snapshot.current = boardContext.current.getImageData(0, 0, boardWidth, boardHeight)
      boardContext.current.beginPath()
    }
  }

  // Drawing function for whiteboard (ported from script2.js)
  const drawOnBoard = (uv) => {
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
  }

  // Setup back button click handler
  useEffect(() => {
    const backButton = document.getElementById('back-btn')
    if (backButton) {
      backButton.addEventListener('click', zoomOut)
      return () => backButton.removeEventListener('click', zoomOut)
    }
  }, [])

  // Helper function to setup social link objects
  const setupSocialLink = (child, refKey) => {
    child.userData.initialRotation = new THREE.Euler().copy(child.rotation)
    child.userData.initialPosition = child.position.clone()
    child.position.y = 3  // Move off-screen for intro animation
    hoverableObjects.current.push(child)
    animationObjectsRef.current[refKey] = child
  }

  // Helper function to setup Music_Eighth (intro animation only, no hover)
  const setupMusicEighthLink = (child, refKey) => {
    child.userData.initialRotation = new THREE.Euler().copy(child.rotation)
    child.userData.initialPosition = child.position.clone()
    child.userData.initialScale = new THREE.Vector3().copy(child.scale)
    child.position.y = 3  // Move off-screen for intro animation
    // Note: NOT adding to hoverableObjects.current to prevent hover animations
    clickableObjects.current.push(child)  // Add to clickable objects for cursor and click effects
    animationObjectsRef.current[refKey] = child
  }

  // Helper function to setup plushie objects
  const setupPlushie = (child, refKey) => {
    child.userData.initialScale = new THREE.Vector3().copy(child.scale)
    child.userData.initialRotation = new THREE.Euler().copy(child.rotation)
    child.scale.set(0, 0, 0)  // Start invisible for intro animation
    plushieObjects.current.push(child)
    animationObjectsRef.current[refKey] = child
  }

  // Helper function to setup notes objects
  const setupNotesObject = (child, refKey, offsetX = 0, offsetY = 3, offsetZ = 0) => {
    child.userData.initialPosition = child.position.clone()
    child.position.x = offsetX !== 0 ? offsetX : child.position.x
    child.position.y = offsetY
    child.position.z = offsetZ !== 0 ? offsetZ : child.position.z
    animationObjectsRef.current[refKey] = child
  }

  // Assign materials + store refs
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        // Setup the whiteboard using the dedicated raycaster pointer mesh if present
        if (child.name.includes("whiteboard_raycaster_pointer")) {
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
        }
        // Fallback: if no pointer mesh, bind to any 'whiteboard' mesh once
        else if (!whiteboardSurface.current && child.name.includes("whiteboard") && !child.name.includes("raycaster")) {
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
        }

        // Store hoverable objects and their initial rotation using helper function
        if (child.name.includes("linkedin")) {
          setupSocialLink(child, "linkedin")
        } else if (child.name.includes("github")) {
          setupSocialLink(child, "github")
        } else if (child.name.includes("Threejs")) {
          setupSocialLink(child, "Threejs")
        } else if (child.name.includes("Luffy")) {
          setupSocialLink(child, "Luffy")
        } else if (child.name.includes("Music_Eighth")) {
          setupMusicEighthLink(child, "Music_Eighth")
        } else if (child.name.includes("CV_Seven")) {
          setupSocialLink(child, "CV")
        } else if (child.name.includes("Project1_Seven")) {
          setupSocialLink(child, "Project1")
        } else if (child.name.includes("Project2_Seven")) {
          setupSocialLink(child, "Project2")
        } else if (child.name.includes("Project3_Seven")) {
          setupSocialLink(child, "Project3")
        }

        // Store car object
        if (child.name.includes("car")) {
          child.userData.initialPosition = child.position.clone()
          child.position.y = child.userData.initialPosition.y + 8  // Move car up
          animationObjectsRef.current.car = child
        }

        // Store fan objects for continuous rotation
        if (child.name.includes("fan")) {
          fanObjects.current.push(child)
        }

        // Store notes objects using helper function
        if (child.name.includes("notes_First") && !child.name.includes("001") && !child.name.includes("002") && !child.name.includes("003") && !child.name.includes("004") && !child.name.includes("005")) {
          setupNotesObject(child, "notes")
        } else if (child.name.includes("no1tes") || child.name.includes("notes_First001")) {
          setupNotesObject(child, "notes_001", 3, 3, 0)
        } else if (child.name.includes("no2tes")) {
          setupNotesObject(child, "notes_002", 0, 7, 7)
        } else if (child.name.includes("no3tes")) {
          setupNotesObject(child, "notes_003", 0, -7, -7)
        } else if (child.name.includes("no4tes")) {
          setupNotesObject(child, "notes_004", 7, -7, 7)
        } else if (child.name.includes("no5tes")) {
          setupNotesObject(child, "notes_005", 25, 0, 11)
        }

        // Store plushie objects using helper function
        if (child.name.includes("plushie_1")) {
          setupPlushie(child, "plushie1")
        } else if (child.name.includes("plushie_2")) {
          setupPlushie(child, "plushie2")
        } else if (child.name.includes("headset")) {
          setupPlushie(child, "headset")
        }

        // Store marker objects for hover animations
        if (child.name.startsWith("marker_")) {
          child.userData.initialScale = new THREE.Vector3().copy(child.scale)
        }

        // Store other objects for intro animation
        if (child.name.includes("chair")) {
          child.userData.initialScale = new THREE.Vector3().copy(child.scale)
          child.scale.set(0, 0, 0)
          animationObjectsRef.current.chair = child
        } else if (child.name.includes("partokurchi")) {
          child.userData.initialScale = new THREE.Vector3().copy(child.scale)
          child.userData.initialPosition = child.position.clone()
          child.userData.initialRotation = new THREE.Euler().copy(child.rotation)
          child.scale.set(0, 0, 0)
          animationObjectsRef.current.partokurchi = child
        }

        if (child.name.includes("Glass")) {
          child.material = new THREE.MeshPhysicalMaterial({
            transmission: 1,
            opacity: 1,
            metalness: 0,
            roughness: 0,
            ior: 1,
            thickness: 0.05,
            envMapIntensity: 1,
          })
        } else if (child.name.includes("Screen_2")) {
          screen2MeshRef.current = child
          child.material = onMaterial // Start with video material
          zoomableObjects.current.push(child) // Add to zoomable objects
        } else if (child.name.includes("Screen_1")) {
          // Apply about_me.png texture to Screen_1
          screen1MeshRef.current = child
          child.material = screen1OnMaterial // Start with texture material
          child.userData.zoomable = true
          child.userData.name = child.name
          zoomableObjects.current.push(child) // Add to zoomable objects
        } else if (
          child.name.includes("whiteboard_raycaster_pointer")) {
          child.userData.zoomable = true
          child.userData.name = child.name
          zoomableObjects.current.push(child) // Add to zoomable objects
        }
 
        else {
          for (const key of Object.keys(materials)) {
            if (child.name.includes(key)) {
              child.material = materials[key]

              // Store button1 ref but keep its baked material
              if (child.name.includes("button1")) {
                button1MeshRef.current = child
                buttonObjects.current.push(child)
              }
              
              // Store button2 ref but keep its baked material
              if (child.name.includes("button2")) {
                button2MeshRef.current = child
                buttonObjects.current.push(child)
              }
              
              if (child.name.includes("back")) {
                  child.material.side = THREE.DoubleSide
              }

              break
            }
          }
        }
      }
    })

    // Force default black marker selection after whiteboard setup
    if (whiteboardSurface.current && boardContext.current) {
      selectMarker('black')
    }
  }, [scene, materials, onMaterial])

  // Mouse movement tracking for hover detection
  useEffect(() => {
    // keep sizes current for global listeners
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
      // Update mouse position for click
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

    // Cleanup event listeners
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [camera, controlsRef])

  // Toggle monitor material and video playback based on state
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

  // Toggle Screen_1 material based on state
  useEffect(() => {
    if (screen1MeshRef.current) {
      if (isScreen1On) {
        screen1MeshRef.current.material = screen1OnMaterial
      } else {
        screen1MeshRef.current.material = screen1OffMaterial
      }
    }
  }, [isScreen1On, screen1OnMaterial, screen1OffMaterial])

  // Raycasting for hover detection on every frame
  useFrame(() => {
    raycaster.current.setFromCamera(mouse.current, camera)
    
    // Check for social link objects (linkedin, github, Threejs, Luffy)
    const intersects = raycaster.current.intersectObjects(hoverableObjects.current)
    
    if (intersects.length > 0) {
      const hoveredObject = intersects[0].object
      
      if (hoveredObject !== currentHoveredObject) {
        // Stop animation on previous object
        if (currentHoveredObject) {
          animatelinks(currentHoveredObject, false)
        }
        
        // Start animation on new object
        animatelinks(hoveredObject, true)
        setCurrentHoveredObject(hoveredObject)
      }
    } else {
      // No hover on social links
      if (currentHoveredObject) {
        animatelinks(currentHoveredObject, false)
        setCurrentHoveredObject(null)
      }
    }

    // Check for plushie objects (plushie_1, plushie_2, headset)
    const plushieIntersects = raycaster.current.intersectObjects(plushieObjects.current)
    
    if (plushieIntersects.length > 0) {
      const hoveredPlushie = plushieIntersects[0].object
      
      if (hoveredPlushie !== currentHoveredPlushie) {
        // Stop animation on previous plushie
        if (currentHoveredPlushie) {
          playHoverAnimation(currentHoveredPlushie, false)
        }
        
        // Start animation on new plushie
        playHoverAnimation(hoveredPlushie, true)
        setCurrentHoveredPlushie(hoveredPlushie)
      }
    } else {
      // No hover on plushies
      if (currentHoveredPlushie) {
        playHoverAnimation(currentHoveredPlushie, false)
        setCurrentHoveredPlushie(null)
      }
    }

    // Check for button objects (button1, button2)
    const buttonIntersects = raycaster.current.intersectObjects(buttonObjects.current)
    
    if (buttonIntersects.length > 0) {
      const hoveredButton = buttonIntersects[0].object
      
      if (hoveredButton !== currentHoveredButton) {
        setCurrentHoveredButton(hoveredButton)
      }
    } else {
      // No hover on buttons
      if (currentHoveredButton) {
        setCurrentHoveredButton(null)
      }
    }

    // Check for marker objects when zoomed into whiteboard
    const controls = controlsRef?.current
    const isWhiteboardZoomed = isZoomed && controls && 
      controls.target.distanceTo(zoomTargets.whiteboard.targetPos) < 0.1
    
    if (isWhiteboardZoomed) {
      // Get all intersects and find markers
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
      // Reset marker hover when not in whiteboard
      if (currentHoveredMarker) {
        animateMarkerHover(currentHoveredMarker, false)
        setCurrentHoveredMarker(null)
      }
    }

    // Check for zoomable objects (Screen_1, Screen_2, whiteboard)
    const zoomableIntersects = raycaster.current.intersectObjects(zoomableObjects.current)
    let hoveredZoomableObject = null
    
    if (zoomableIntersects.length > 0) {
  hoveredZoomableObject = zoomableIntersects[0].object
    }

    // Check for clickable objects (Music_Eighth)
    const clickableIntersects = raycaster.current.intersectObjects(clickableObjects.current)
    let hoveredClickableObject = null
    
    if (clickableIntersects.length > 0) {
      hoveredClickableObject = clickableIntersects[0].object
    }

    // Cursor logic
    const setCursor = (cursor) => {
      document.body.style.cursor = cursor
    }

    if (hoveredZoomableObject) {
      // Check if we're zoomed into Screen_1 or Screen_2
      const controls = controlsRef?.current
      const isScreen1Zoomed = isZoomed && controls && 
        controls.target.distanceTo(zoomTargets.Screen_1.targetPos) < 0.1
      const isScreen2Zoomed = isZoomed && controls && 
        controls.target.distanceTo(zoomTargets.Screen_2.targetPos) < 0.1

      // If zoomed into Screen_1 or Screen_2, use default cursor
      if (isScreen1Zoomed || isScreen2Zoomed) {
        setCursor('default')
      }
      // If not zoomed or zoomed into whiteboard, show pointer for zoomable objects
      else if (hoveredZoomableObject.name.includes("Screen_1") || 
               hoveredZoomableObject.name.includes("Screen_2") || 
               hoveredZoomableObject.name.includes("whiteboard_raycaster_pointer")) {
        setCursor('pointer')
      }
      else {
        setCursor('default')
      }
    } else if (hoveredClickableObject) {
      // Show pointer for clickable objects (Music_Eighth)
      setCursor('pointer')
    } else {
      // No zoomable or clickable object hovered, check other interactive objects
      if (currentHoveredObject || currentHoveredPlushie || currentHoveredButton) {
        setCursor('pointer')
      } else {
        setCursor('default')
      }
    }

    // Rotate fan objects continuously
    fanObjects.current.forEach((fan) => {
      fan.rotation.y += 0.069
    })
  })

  // Handle clicks on the scene using R3F's event system
  const handleSceneClick = (event) => {
    // Prevent clicks from bubbling up to other elements
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

  return (
    <group>
      <primitive 
        object={scene} 
        onClick={handleSceneClick}
      />
      <CoffeeSmoke visible={progress >= 100} />
    </group>
  )
}

// Preload the GLTF model and textures for loading manager
useGLTF.preload("/model/roomPortfolio_NoMaterials_V33.glb")

// Preload all textures
Object.values(textureMap).forEach(texturePath => {
  useTexture.preload(texturePath)
})
