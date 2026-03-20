import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { usePersona } from '../context/PersonaContext';

function WalkingTARS({ phase, slitColor, personaColor }) {
  const leftRef = useRef();
  const rightRef = useRef();
  const bodyRef = useRef();

  useFrame(() => {
    const t = Date.now() * 0.003;

    if (!leftRef.current || !rightRef.current) return;

    if (phase === 'walk' || phase === 'walkin' || phase === 'walkout') {
      // Panels alternate like legs.
      leftRef.current.rotation.y = Math.sin(t) * 1.0;
      rightRef.current.rotation.y = Math.PI + Math.sin(t + Math.PI) * 1.0;
      // Body bobs.
      if (bodyRef.current) {
        bodyRef.current.position.y = Math.abs(Math.sin(t * 2)) * 0.1 - 0.05;
      }
    } else if (phase === 'spin') {
      if (bodyRef.current) bodyRef.current.rotation.y += 0.1;
      leftRef.current.rotation.y = 1.2;
      rightRef.current.rotation.y = Math.PI - 1.2;
    } else if (phase === 'bow') {
      if (bodyRef.current) {
        bodyRef.current.rotation.x += (0.45 - bodyRef.current.rotation.x) * 0.08;
      }
      leftRef.current.rotation.y += (0.4 - leftRef.current.rotation.y) * 0.1;
      rightRef.current.rotation.y += (Math.PI - 0.4 - rightRef.current.rotation.y) * 0.1;
    } else if (phase === 'strut') {
      const slow = Date.now() * 0.0015;
      leftRef.current.rotation.y = Math.sin(slow) * 0.7;
      rightRef.current.rotation.y = Math.PI + Math.sin(slow + Math.PI) * 0.7;
      if (bodyRef.current) {
        bodyRef.current.position.y = Math.abs(Math.sin(slow * 2)) * 0.12;
        bodyRef.current.rotation.y = Math.sin(slow * 0.4) * 0.2;
        bodyRef.current.rotation.x += (0 - bodyRef.current.rotation.x) * 0.05;
      }
    } else {
      // Idle - panels return to center.
      leftRef.current.rotation.y += (0 - leftRef.current.rotation.y) * 0.08;
      rightRef.current.rotation.y += (Math.PI - rightRef.current.rotation.y) * 0.08;
      if (bodyRef.current) {
        bodyRef.current.position.y += (0 - bodyRef.current.position.y) * 0.08;
        bodyRef.current.rotation.x += (0 - bodyRef.current.rotation.x) * 0.08;
        bodyRef.current.rotation.y += (0 - bodyRef.current.rotation.y) * 0.08;
      }
    }
  });

  return (
    <group ref={bodyRef}>
      {/* Left panel */}
      <group ref={leftRef} position={[-0.26, 0, 0]}>
        <RoundedBox args={[0.22, 1.4, 0.18]} radius={0.03} smoothness={4}>
          <meshStandardMaterial
            color="#070d1c"
            emissive="#0c1535"
            emissiveIntensity={0.6}
            roughness={0.05}
            metalness={0.98}
          />
        </RoundedBox>
        <mesh position={[0, 0.1, 0.094]}>
          <boxGeometry args={[0.14, 0.02, 0.008]} />
          <meshStandardMaterial color={slitColor} emissive={slitColor} emissiveIntensity={5} />
        </mesh>
        <mesh position={[0.108, 0, 0]}>
          <boxGeometry args={[0.005, 1.3, 0.008]} />
          <meshBasicMaterial color={slitColor} transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Right panel */}
      <group ref={rightRef} position={[0.26, 0, 0]}>
        <RoundedBox args={[0.22, 1.4, 0.18]} radius={0.03} smoothness={4}>
          <meshStandardMaterial
            color="#070d1c"
            emissive="#0c1535"
            emissiveIntensity={0.6}
            roughness={0.05}
            metalness={0.98}
          />
        </RoundedBox>
        <mesh position={[0, 0.1, 0.094]}>
          <boxGeometry args={[0.14, 0.02, 0.008]} />
          <meshStandardMaterial color={slitColor} emissive={slitColor} emissiveIntensity={5} />
        </mesh>
        <mesh position={[-0.108, 0, 0]}>
          <boxGeometry args={[0.005, 1.3, 0.008]} />
          <meshBasicMaterial color={slitColor} transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Top connector */}
      <mesh position={[0, 0.74, 0]}>
        <boxGeometry args={[0.56, 0.055, 0.16]} />
        <meshStandardMaterial
          color="#060b18"
          emissive={personaColor}
          emissiveIntensity={0.4}
          roughness={0.05}
          metalness={0.98}
        />
      </mesh>

      {/* Bottom connector */}
      <mesh position={[0, -0.74, 0]}>
        <boxGeometry args={[0.56, 0.055, 0.16]} />
        <meshStandardMaterial
          color="#060b18"
          emissive={personaColor}
          emissiveIntensity={0.4}
          roughness={0.05}
          metalness={0.98}
        />
      </mesh>

      {/* Antenna */}
      <group position={[0.1, 0.84, 0]}>
        <mesh>
          <cylinderGeometry args={[0.01, 0.014, 0.26, 8]} />
          <meshStandardMaterial color="#0d1828" metalness={0.98} roughness={0.05} />
        </mesh>
        <mesh position={[0, 0.16, 0]}>
          <sphereGeometry args={[0.034, 14, 14]} />
          <meshStandardMaterial color={slitColor} emissive={slitColor} emissiveIntensity={5} />
        </mesh>
      </group>

      <pointLight color={personaColor} intensity={2.5} distance={4} decay={2} />
    </group>
  );
}

const QUOTES = [
  'Swagger protocol: engaged.',
  'Humor setting: maximum.',
  'TARS has entered the chat.',
  '12% of my walking capacity.',
  'Executing dramatic entrance.',
];

export default function TARSSwagger({ onComplete }) {
  const { config } = usePersona();
  const [phase, setPhase] = useState('walkin');
  const [posX, setPosX] = useState(-15);
  const [posY, setPosY] = useState(50);
  const [visible, setVisible] = useState(true);
  const [quote, setQuote] = useState('');
  const [showQ, setShowQ] = useState(false);
  useEffect(() => {
    let t1;
    let t2;
    let t3;
    let t4;
    let t5;
    let rafId;
    const startTime = Date.now();
    const duration = 8000;

    // Sinusoidal path across screen.
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        setVisible(false);
        setTimeout(onComplete, 400);
        return;
      }

      // X goes from -15% to 115% (left to right, off screen).
      const x = -15 + progress * 130;

      // Y oscillates between 25% and 75% of the viewport.
      const y = 50 + Math.sin(progress * Math.PI * 3) * 25;

      setPosX(x);
      setPosY(y);

      rafId = requestAnimationFrame(animate);
    };

    setPhase('walk');
    rafId = requestAnimationFrame(animate);

    t1 = setTimeout(() => {
      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
      setShowQ(true);
    }, 1500);
    t2 = setTimeout(() => {
      setShowQ(false);
    }, 3000);
    t3 = setTimeout(() => {
      setPhase('spin');
    }, 3500);
    t4 = setTimeout(() => {
      setPhase('strut');
      setQuote('Your mission awaits.');
      setShowQ(true);
    }, 5000);
    t5 = setTimeout(() => {
      setShowQ(false);
    }, 7000);

    return () => {
      cancelAnimationFrame(rafId);
      [t1, t2, t3, t4, t5].forEach(clearTimeout);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        pointerEvents: 'none',
      }}
    >
      {/* Subtle overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(1,2,8,0.25)',
          backdropFilter: 'blur(0.5px)',
        }}
      />

      {/* TARS */}
      <div
        style={{
          position: 'absolute',
          left: `${posX}vw`,
          top: `${posY}vh`,
          transform: 'translate(-50%, -50%)',
          width: '200px',
          height: '280px',
          filter: `drop-shadow(0 0 28px ${config.color}90)`,
          transition: 'none',
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 3.4], fov: 46 }}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={0.25} />
          <directionalLight position={[3, 4, 3]} intensity={0.5} />
          <WalkingTARS phase={phase} personaColor={config.color} slitColor={config.slitColor} />
        </Canvas>

        {/* Quote above TARS */}
        {showQ && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: '8px',
              whiteSpace: 'nowrap',
              padding: '7px 14px',
              background: 'rgba(4,8,20,0.97)',
              border: `0.5px solid ${config.color}70`,
              borderRadius: '20px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: config.color,
              letterSpacing: '0.06em',
              boxShadow: `0 0 16px ${config.color}40`,
              animation: 'signal-in 0.3s ease forwards',
            }}
          >
            {quote}
          </div>
        )}

        {/* Shadow under TARS */}
        <div
          style={{
            position: 'absolute',
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60px',
            height: '8px',
            background: `radial-gradient(ellipse, ${config.color}40, transparent)`,
            borderRadius: '50%',
          }}
        />
      </div>

      {/* Bottom label */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-ui)',
          fontSize: '9px',
          color: `${config.color}50`,
          letterSpacing: '0.25em',
        }}
      >
        T · A · R · S · P · R · O · T · O · C · O · L
      </div>
    </div>
  );
}
