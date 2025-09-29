// ========================================
// OBJECT SETUP HELPERS - Helper functions for setting up 3D objects
// ========================================
import * as THREE from "three"

// Setup social link objects with hover animations
export const setupSocialLink = (child, refKey, hoverableObjects, animationObjectsRef) => {
  child.userData.initialRotation = new THREE.Euler().copy(child.rotation)
  child.userData.initialPosition = child.position.clone()
  child.position.y = 3  // Move off-screen for intro animation
  hoverableObjects.current.push(child)
  animationObjectsRef.current[refKey] = child
}

// Setup Music_Eighth (intro animation only, no hover)
export const setupMusicEighthLink = (child, refKey, clickableObjects, animationObjectsRef) => {
  child.userData.initialRotation = new THREE.Euler().copy(child.rotation)
  child.userData.initialPosition = child.position.clone()
  child.userData.initialScale = new THREE.Vector3().copy(child.scale)
  child.position.y = 3  // Move off-screen for intro animation
  clickableObjects.current.push(child)  // Add to clickable objects for cursor and click effects
  animationObjectsRef.current[refKey] = child
}

// Setup plushie objects with scaling animations
export const setupPlushie = (child, refKey, plushieObjects, animationObjectsRef) => {
  child.userData.initialScale = new THREE.Vector3().copy(child.scale)
  child.userData.initialRotation = new THREE.Euler().copy(child.rotation)
  child.scale.set(0, 0, 0)  // Start invisible for intro animation
  plushieObjects.current.push(child)
  animationObjectsRef.current[refKey] = child
}

// Setup notes objects for intro animations
export const setupNotesObject = (child, refKey, animationObjectsRef, offsetX = 0, offsetY = 3, offsetZ = 0) => {
  child.userData.initialPosition = child.position.clone()
  child.position.x = offsetX !== 0 ? offsetX : child.position.x
  child.position.y = offsetY
  child.position.z = offsetZ !== 0 ? offsetZ : child.position.z
  animationObjectsRef.current[refKey] = child
}