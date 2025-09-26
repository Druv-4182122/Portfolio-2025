import React, { useRef, useMemo, useEffect, useState } from 'react';
import { shaderMaterial, useTexture } from '@react-three/drei';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import coffeeSmokeVertexShader from './smokey/coffeeSmoke/vertex.glsl?raw';
import coffeeSmokeFragmentShader from './smokey/coffeeSmoke/fragment.glsl?raw';

const CoffeeSmokeMaterial = shaderMaterial(
  {
    uTime: 0,
    uTwistStrength: 10.0,
    uWindStrength: 10.0,
    uTwistSpeed: 0.005,
    uWindSpeed: 0.01,
    uPerlinTexture: null,
  },
  coffeeSmokeVertexShader,
  coffeeSmokeFragmentShader,
  (material) => {
    material.side = THREE.DoubleSide;
    material.transparent = true;
    material.depthWrite = false;
  }
);

extend({ CoffeeSmokeMaterial });

export function CoffeeSmoke({ visible = true }) {
  const materialRef = useRef();
  const meshRef = useRef();
  const [isReady, setIsReady] = useState(false);
  
  const perlinTexture = useTexture('/img/perlin.png');
  
  useEffect(() => {
    if (perlinTexture) {
      perlinTexture.wrapS = THREE.RepeatWrapping;
      perlinTexture.wrapT = THREE.RepeatWrapping;
      setIsReady(true);
    }
  }, [perlinTexture]);

  useFrame((state) => {
    if (materialRef.current && isReady && visible) {
      // Use modulo to prevent floating point precision issues with large time values
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime() % 1000;
    }
  });

  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 0.5, 16, 64);
    g.translate(0, 0.5, 0);
    g.scale(1.5, 6, 1.5);
    return g;
  }, []);

  if (!isReady) return null;

  return (
    <mesh 
      ref={meshRef}
      position={[-0.13, 0.95, 0.5]} 
      rotation-y={-Math.PI * 0.5} 
      scale={0.05} 
      geometry={geometry}
      visible={visible}
    >
      <coffeeSmokeMaterial ref={materialRef} uPerlinTexture={perlinTexture} />
    </mesh>
  );
}