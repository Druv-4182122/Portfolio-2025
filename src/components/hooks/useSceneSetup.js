// ========================================
// SCENE SETUP - Handles material assignment and object setup
// ========================================
import { useEffect } from "react"
import * as THREE from "three"
import { 
  setupSocialLink, 
  setupMusicEighthLink, 
  setupPlushie, 
  setupNotesObject 
} from "../utils/objectSetup"

export const useSceneSetup = ({
  scene,
  materials,
  onMaterial,
  screen1OnMaterial,
  // Whiteboard
  setupWhiteboardSurface,
  // Object refs
  hoverableObjects,
  plushieObjects,
  buttonObjects,
  clickableObjects,
  zoomableObjects,
  fanObjects,
  animationObjectsRef,
  // Screen refs
  screen1MeshRef,
  screen2MeshRef,
  button1MeshRef,
  button2MeshRef,
  // Functions
  selectMarker
}) => {
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        // Setup the whiteboard
        if (child.name.includes("whiteboard_raycaster_pointer")) {
          setupWhiteboardSurface(child)
        }
        // Fallback for whiteboard
        else if (!child.name.includes("raycaster") && child.name.includes("whiteboard")) {
          setupWhiteboardSurface(child)
        }

        // Setup social link objects
        if (child.name.includes("linkedin")) {
          setupSocialLink(child, "linkedin", hoverableObjects, animationObjectsRef)
        } else if (child.name.includes("github")) {
          setupSocialLink(child, "github", hoverableObjects, animationObjectsRef)
        } else if (child.name.includes("Threejs")) {
          setupSocialLink(child, "Threejs", hoverableObjects, animationObjectsRef)
        } else if (child.name.includes("Luffy")) {
          setupSocialLink(child, "Luffy", hoverableObjects, animationObjectsRef)
        } else if (child.name.includes("Music_Eighth")) {
          setupMusicEighthLink(child, "Music_Eighth", clickableObjects, animationObjectsRef)
        } else if (child.name.includes("CV_Seven")) {
          setupSocialLink(child, "CV", hoverableObjects, animationObjectsRef)
        } else if (child.name.includes("Project1_Seven")) {
          setupSocialLink(child, "Project1", hoverableObjects, animationObjectsRef)
        } else if (child.name.includes("Project2_Seven")) {
          setupSocialLink(child, "Project2", hoverableObjects, animationObjectsRef)
        } else if (child.name.includes("Project3_Seven")) {
          setupSocialLink(child, "Project3", hoverableObjects, animationObjectsRef)
        }

        // Setup car object
        if (child.name.includes("car")) {
          child.userData.initialPosition = child.position.clone()
          child.position.y = child.userData.initialPosition.y + 5  // Move car higher above its final position
          animationObjectsRef.current.car = child
        }

        // Store fan objects for continuous rotation
        if (child.name.includes("fan")) {
          fanObjects.current.push(child)
        }

        // Setup notes objects
        if (child.name.includes("notes_First") && !child.name.includes("001") && !child.name.includes("002") && !child.name.includes("003") && !child.name.includes("004") && !child.name.includes("005")) {
          setupNotesObject(child, "notes", animationObjectsRef)
        } else if (child.name.includes("no1tes") || child.name.includes("notes_First001")) {
          setupNotesObject(child, "notes_001", animationObjectsRef, 3, 3, 0)
        } else if (child.name.includes("no2tes")) {
          setupNotesObject(child, "notes_002", animationObjectsRef, 0, 7, 7)
        } else if (child.name.includes("no3tes")) {
          setupNotesObject(child, "notes_003", animationObjectsRef, 0, -7, -7)
        } else if (child.name.includes("no4tes")) {
          setupNotesObject(child, "notes_004", animationObjectsRef, 7, -7, 7)
        } else if (child.name.includes("no5tes")) {
          setupNotesObject(child, "notes_005", animationObjectsRef, 25, 0, 11)
        }

        // Setup plushie objects
        if (child.name.includes("plushie_1")) {
          setupPlushie(child, "plushie1", plushieObjects, animationObjectsRef)
        } else if (child.name.includes("plushie_2")) {
          setupPlushie(child, "plushie2", plushieObjects, animationObjectsRef)
        } else if (child.name.includes("headset")) {
          setupPlushie(child, "headset", plushieObjects, animationObjectsRef)
        }

        // Store marker objects for hover animations
        if (child.name.startsWith("marker_")) {
          child.userData.initialScale = new THREE.Vector3().copy(child.scale)
        }

        // Setup other objects for intro animation
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

        // Apply special materials and setup references
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
          screen1MeshRef.current = child
          child.material = screen1OnMaterial // Start with texture material
          child.userData.zoomable = true
          child.userData.name = child.name
          zoomableObjects.current.push(child) // Add to zoomable objects
        } else if (child.name.includes("whiteboard_raycaster_pointer")) {
          child.userData.zoomable = true
          child.userData.name = child.name
          zoomableObjects.current.push(child) // Add to zoomable objects
        }
        else {
          // Apply texture materials based on name matching
          for (const key of Object.keys(materials)) {
            if (child.name.includes(key)) {
              child.material = materials[key]

              // Store button refs but keep their baked material
              if (child.name.includes("button1")) {
                button1MeshRef.current = child
                buttonObjects.current.push(child)
              }
              
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
    selectMarker('black')
  }, [scene, materials, onMaterial, screen1OnMaterial, setupWhiteboardSurface, selectMarker])
}