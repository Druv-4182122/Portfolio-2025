// ========================================
// ANIMATIONS HOOK - Custom hook for all GSAP animations
// ========================================
import { useRef, useCallback } from "react"
import gsap from "gsap"

export const useAnimations = () => {
  // Ref to track if intro animation has played
  const hasPlayedIntro = useRef(false)

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

  // Animation for social links hover effects
  const animatelinks = useCallback((object, isHovering) => {
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
  }, [])

  // Animation for plushie hover effects
  const playHoverAnimation = useCallback((object, isHovering) => {
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
  }, [])

  // Animation for marker hover effects
  const animateMarkerHover = useCallback((object, isHovering) => {
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
  }, [])

  // Animation for clickable objects (button press effect)
  const animateClickEffect = useCallback((object) => {
    if (!object || !object.userData.initialScale) return
    
    gsap.killTweensOf(object.scale)
    
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
  }, [])

  // Intro animation function
  const playIntroAnimation = useCallback(() => {
    const { linkedin, github, Threejs, Luffy, Music_Eighth, CV, Project1, Project2, Project3, car, notes, notes_001, notes_002, 
            notes_003, notes_004, notes_005, headset, plushie1, plushie2, chair, partokurchi } = animationObjectsRef.current

    let t1 = gsap.timeline({
      defaults: {
        duration: 0.8,
        ease: "back.out(1.8)"
      }
    })

    // CAR animation - falls from above and lands smoothly
    if (car) {
      t1.to(car.position, { 
        y: car.userData.initialPosition.y,
        duration: 1.2,
        ease: "power2.out"  // Smooth falling motion without bounce
      })
      .add("iconsStart", "-=0.4")
    }

    // Social links animation
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

    // Notes animations
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

    // Toys animation (headset, plushies, chair, partokurchi)
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
  }, [])

  return {
    hasPlayedIntro,
    animationObjectsRef,
    animatelinks,
    playHoverAnimation,
    animateMarkerHover,
    animateClickEffect,
    playIntroAnimation
  }
}