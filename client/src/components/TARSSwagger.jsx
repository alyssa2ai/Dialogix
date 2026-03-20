import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { usePersona } from '../context/PersonaContext';

// Simplified TARS for the swagger sequence
function SwaggerTARS({ phase, progress, personaColor, slitColor }) {
  const groupRef  = useRef();
  const leftRef   = useRef();
  const rightRef  = useRef();
  const leftAng   = useRef(0);
  const rightAng  = useRef(0);

  useFrame(() => {
    if (!groupRef.current) return;

    // Phase-based animations
    switch(phase) {
      case 'walk-in': {
        // Walking from left — panels alternate like legs
        const t = Date.now() * 0.003;
        leftAng.current  += (Math.sin(t) * 0.8 - leftAng.current)  * 0.15;
        rightAng.current += (Math.sin(t + Math.PI) * 0.8 - rightAng.current) * 0.15;
        // Bob up and down while walking
        groupRef.current.position.y = Math.sin(t * 2) * 0.08;
        break;
      }
      case 'spin': {
        groupRef.current.rotation.y += 0.08;
        leftAng.current  += (1.2 - leftAng.current)  * 0.05;
        rightAng.current += (-1.2 - rightAng.current) * 0.05;
        break;
      }
      case 'bow': {
        groupRef.current.rotation.x += (0.5 - groupRef.current.rotation.x) * 0.06;
        leftAng.current  += (0.4 - leftAng.current)  * 0.06;
        rightAng.current += (-0.4 - rightAng.current) * 0.06;
        break;
      }
      case 'strut': {
        // Confident slow walk — panels held at angles
        const t = Date.now() * 0.002;
        leftAng.current  += (Math.sin(t) * 0.6 - leftAng.current)  * 0.1;
        rightAng.current += (Math.sin(t + Math.PI) * 0.6 - rightAng.current) * 0.1;
        groupRef.current.position.y = Math.abs(Math.sin(t * 2)) * 0.12;
        groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.15;
        break;
      }
      case 'walk-out': {
        const t = Date.now() * 0.003;
        leftAng.current  += (Math.sin(t) * 0.8 - leftAng.current)  * 0.15;
        rightAng.current += (Math.sin(t + Math.PI) * 0.8 - rightAng.current) * 0.15;
        groupRef.current.position.y = Math.sin(t * 2) * 0.08;
        break;
      }
      default: {
        leftAng.current  += (0 - leftAng.current)  * 0.08;
        rightAng.current += (0 - rightAng.current) * 0.08;
        groupRef.current.rotation.x += (0 - groupRef.current.rotation.x) * 0.08;
      }
    }

    if (leftRef.current) {
      leftRef.current.rotation.y   = leftAng.current;
      leftRef.current.position.x   = -0.26 + Math.sin(leftAng.current) * 0.28;
    }
    if (rightRef.current) {
      rightRef.current.rotation.y  = Math.PI + rightAng.current;
      rightRef.current.position.x  = 0.26 + Math.sin(rightAng.current) * 0.28;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Left panel */}
      <group ref={leftRef} position={[-0.26, 0, 0]}>
        <RoundedBox args={[0.22, 1.4, 0.18]} radius={0.03} smoothness={4}>
          <meshStandardMaterial color="#070d1c" emissive="#0a1230" emissiveIntensity={0.5} roughness={0.05} metalness={0.98}/>
        </RoundedBox>
        <mesh position={[0, 0.1, 0.093]}>
          <boxGeometry args={[0.14, 0.02, 0.008]}/>
          <meshStandardMaterial color={slitColor} emissive={slitColor} emissiveIntensity={4}/>
        </mesh>
        <mesh position={[0.108, 0, 0]}>
          <boxGeometry args={[0.005, 1.3, 0.008]}/>
          <meshBasicMaterial color={slitColor} transparent opacity={0.5}/>
        </mesh>
      </group>

      {/* Right panel */}
      <group ref={rightRef} position={[0.26, 0, 0]}>
        <RoundedBox args={[0.22, 1.4, 0.18]} radius={0.03} smoothness={4}>
          <meshStandardMaterial color="#070d1c" emissive="#0a1230" emissiveIntensity={0.5} roughness={0.05} metalness={0.98}/>
        </RoundedBox>
        <mesh position={[0, 0.1, 0.093]}>
          <boxGeometry args={[0.14, 0.02, 0.008]}/>
          <meshStandardMaterial color={slitColor} emissive={slitColor} emissiveIntensity={4}/>
        </mesh>
        <mesh position={[-0.108, 0, 0]}>
          <boxGeometry args={[0.005, 1.3, 0.008]}/>
          <meshBasicMaterial color={slitColor} transparent opacity={0.5}/>
        </mesh>
      </group>

      {/* Connectors */}
      {[0.74, -0.74].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <boxGeometry args={[0.56, 0.054, 0.16]}/>
          <meshStandardMaterial color="#060b18" emissive={personaColor} emissiveIntensity={0.3} roughness={0.05} metalness={0.98}/>
        </mesh>
      ))}

      {/* Antenna */}
      <group position={[0.11, 0.83, 0]}>
        <mesh>
          <cylinderGeometry args={[0.01, 0.014, 0.26, 8]}/>
          <meshStandardMaterial color="#0d1828" metalness={0.98} roughness={0.05}/>
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.034, 14, 14]}/>
          <meshStandardMaterial color={slitColor} emissive={slitColor} emissiveIntensity={5}/>
        </mesh>
      </group>

      <pointLight color={personaColor} intensity={2} distance={3} decay={2}/>
    </group>
  );
}

export default function TARSSwagger({ onComplete }) {
  const { config } = usePersona();
  const [phase, setPhase]         = useState('walk-in');
  const [posX, setPosX]           = useState(-120);  // starts off screen left
  const [opacity, setOpacity]     = useState(0);
  const [quote, setQuote]         = useState('');
  const [showQuote, setShowQuote] = useState(false);
  const animRef = useRef(null);

  const SWAGGER_QUOTES = [
    "Swagger protocol initiated.",
    "Humor setting: maximum.",
    "TARS has entered the chat.",
    "Did someone request a dramatic entrance?",
    "This is 12% of my walking capacity.",
  ];

  useEffect(() => {
    // Fade in
    setOpacity(1);

    const sequence = [
      // Walk in from left
      () => {
        setPhase('walk-in');
        setQuote('');
        setShowQuote(false);
        animateX(-120, 50, 1800, setPosX);
      },
      // Pause center — show quote
      () => {
        setPhase('idle');
        setQuote(SWAGGER_QUOTES[Math.floor(Math.random() * SWAGGER_QUOTES.length)]);
        setShowQuote(true);
      },
      // Spin
      () => {
        setPhase('spin');
        setShowQuote(false);
      },
      // Bow
      () => {
        setPhase('bow');
        setQuote('Your mission awaits.');
        setShowQuote(true);
      },
      // Strut across
      () => {
        setPhase('strut');
        setShowQuote(false);
        animateX(50, 110, 2000, setPosX);
      },
      // Walk out right
      () => {
        setPhase('walk-out');
        animateX(110, 140, 800, setPosX);
      },
      // Fade out and done
      () => {
        setOpacity(0);
        setTimeout(onComplete, 600);
      },
    ];

    const delays = [0, 2000, 3500, 5000, 6500, 8800, 9800];
    delays.forEach((delay, i) => {
      animRef.current = setTimeout(sequence[i], delay);
    });

    return () => clearTimeout(animRef.current);
  }, []);

  // Simple position animator
  const animateX = (from, to, duration, setter) => {
    const start   = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease in-out
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      setter(from + (to - from) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      pointerEvents: 'none',
      opacity: opacity,
      transition: 'opacity 0.5s ease'
    }}>
      {/* Subtle dark overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(1,2,8,0.3)',
        backdropFilter: 'blur(1px)'
      }}/>

      {/* TARS walking on screen */}
      <div style={{
        position: 'absolute',
        left: `${posX}%`,
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '200px',
        height: '260px',
        transition: 'none',
        filter: `drop-shadow(0 0 30px ${config.color}80)`
      }}>
        <Canvas
          camera={{ position: [0, 0, 3.5], fov: 45 }}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={0.2}/>
          <directionalLight position={[3, 4, 3]} intensity={0.5}/>
          <SwaggerTARS
            phase={phase}
            personaColor={config.color}
            slitColor={config.slitColor}
          />
        </Canvas>

        {/* Quote bubble above TARS */}
        {showQuote && (
          <div style={{
            position: 'absolute', top: '-60px', left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            padding: '8px 14px',
            background: 'rgba(4,8,20,0.97)',
            border: `0.5px solid ${config.color}60`,
            borderRadius: '20px',
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            color: config.color, letterSpacing: '0.06em',
            boxShadow: `0 0 16px ${config.color}30`,
            animation: 'signal-in 0.3s ease forwards'
          }}>
            {quote}
          </div>
        )}
      </div>

      {/* Bottom label */}
      <div style={{
        position: 'absolute', bottom: '24px', left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'var(--font-ui)', fontSize: '10px',
        color: 'rgba(124,92,191,0.4)', letterSpacing: '0.2em'
      }}>
        T · A · R · S · P · R · O · T · O · C · O · L
      </div>
    </div>
  );
}