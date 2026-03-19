import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Ring, Trail } from '@react-three/drei';
import * as THREE from 'three';

// ── Inner glowing orb ──
function CoreOrb({ isThinking, isTransmitting }) {
  const meshRef   = useRef();
  const glowRef   = useRef();
  const ringRef1  = useRef();
  const ringRef2  = useRef();
  const ringRef3  = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (!meshRef.current) return;

    // Rotation — faster when thinking
    const speed = isThinking ? 3.5 : 0.6;
    meshRef.current.rotation.y += 0.005 * speed;
    meshRef.current.rotation.z += 0.003 * speed;

    // Pulse scale when transmitting
    if (isTransmitting) {
      meshRef.current.scale.setScalar(1 + 0.06 * Math.sin(t * 12));
    } else {
      meshRef.current.scale.setScalar(1 + 0.015 * Math.sin(t * 1.5));
    }

    // Glow orb breathes
    if (glowRef.current) {
      const glowScale = isThinking
        ? 1.3 + 0.15 * Math.sin(t * 4)
        : 1.15 + 0.05 * Math.sin(t * 1.2);
      glowRef.current.scale.setScalar(glowScale);
      glowRef.current.material.opacity = isThinking
        ? 0.18 + 0.08 * Math.sin(t * 3)
        : 0.08 + 0.03 * Math.sin(t * 1.2);
    }

    // Rings orbit
    if (ringRef1.current) {
      ringRef1.current.rotation.x = t * (isThinking ? 1.2 : 0.4);
      ringRef1.current.rotation.y = t * (isThinking ? 0.8 : 0.25);
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.x = -t * (isThinking ? 0.9 : 0.3);
      ringRef2.current.rotation.z = t * (isThinking ? 1.1 : 0.35);
    }
    if (ringRef3.current) {
      ringRef3.current.rotation.y = t * (isThinking ? 1.4 : 0.5);
      ringRef3.current.rotation.z = -t * (isThinking ? 0.6 : 0.2);
    }
  });

  // Colors shift based on state
  const coreColor   = isThinking ? '#c084fc' : isTransmitting ? '#06b6d4' : '#a855f7';
  const emissive    = isThinking ? '#7c3aed' : isTransmitting ? '#0891b2' : '#581c87';
  const emissiveInt = isThinking ? 2.5 : isTransmitting ? 2.0 : 1.2;
  const ringColor   = isThinking ? '#e879f9' : '#818cf8';

  return (
    <group>
      {/* Outer glow sphere */}
      <Sphere ref={glowRef} args={[1.0, 32, 32]}>
        <meshBasicMaterial
          color={coreColor}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Main distorted orb */}
      <Sphere ref={meshRef} args={[0.62, 128, 128]}>
        <MeshDistortMaterial
          color={coreColor}
          emissive={emissive}
          emissiveIntensity={emissiveInt}
          distort={isThinking ? 0.55 : 0.25}
          speed={isThinking ? 5 : 1.8}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>

      {/* Orbital ring 1 */}
      <Ring ref={ringRef1} args={[0.82, 0.88, 64]}>
        <meshBasicMaterial color={ringColor} transparent opacity={isThinking ? 0.7 : 0.4} side={THREE.DoubleSide}/>
      </Ring>

      {/* Orbital ring 2 — tilted */}
      <Ring ref={ringRef2} args={[0.95, 0.99, 64]}>
        <meshBasicMaterial color="#06b6d4" transparent opacity={isThinking ? 0.5 : 0.25} side={THREE.DoubleSide}/>
      </Ring>

      {/* Orbital ring 3 — thin accent */}
      <Ring ref={ringRef3} args={[1.08, 1.10, 64]}>
        <meshBasicMaterial color="#e879f9" transparent opacity={isThinking ? 0.4 : 0.15} side={THREE.DoubleSide}/>
      </Ring>

      {/* Point light — makes the orb illuminate nearby space */}
      <pointLight
        color={coreColor}
        intensity={isThinking ? 3.5 : 1.5}
        distance={4}
        decay={2}
      />
    </group>
  );
}

// ── Floating particles around the core ──
function CoreParticles({ isThinking }) {
  const pointsRef = useRef();
  const count = 80;

  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = 1.3 + Math.random() * 0.8;
    positions[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i*3+2] = r * Math.cos(phi);
  }

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += isThinking ? 0.006 : 0.002;
      pointsRef.current.rotation.x += isThinking ? 0.003 : 0.001;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]}/>
      </bufferGeometry>
      <pointsMaterial
        size={isThinking ? 0.025 : 0.015}
        color={isThinking ? '#e879f9' : '#818cf8'}
        transparent opacity={isThinking ? 0.9 : 0.5}
        sizeAttenuation
      />
    </points>
  );
}

// ── Main exported component ──
export default function AICore({ isThinking, isTransmitting }) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative'
    }}>
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.2} />
        <Float
          speed={isThinking ? 3 : 1.5}
          rotationIntensity={isThinking ? 0.4 : 0.15}
          floatIntensity={isThinking ? 0.6 : 0.3}
        >
          <CoreOrb isThinking={isThinking} isTransmitting={isTransmitting} />
          <CoreParticles isThinking={isThinking} />
        </Float>
      </Canvas>

      {/* Status label under the core */}
      <div style={{
        position: 'absolute', bottom: '8px', left: 0, right: 0,
        textAlign: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: '9px',
        letterSpacing: '0.15em',
        transition: 'color 0.5s',
        color: isThinking ? '#e879f9' : isTransmitting ? '#06b6d4' : '#4a5568'
      }}>
        {isThinking ? '● DECODING SIGNAL' : isTransmitting ? '● TRANSMITTING' : '○ SYNAPSE CORE'}
      </div>
    </div>
  );
}