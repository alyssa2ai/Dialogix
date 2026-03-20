import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { PERSONA_CONFIGS } from '../data/tarsQuotes';
import { usePersona } from '../context/PersonaContext';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../hooks/useSound';
import { useTARSState } from '../hooks/useTARSState';
import { useTARSVoice } from '../hooks/useTARSVoice';

function useMouse() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e) =>
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });

    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return mouse;
}

function GargantuaCore({ isThinking, isTransmitting, isCelebrating, personaColor, diskColor }) {
  const disk1Ref = useRef();
  const disk2Ref = useRef();
  const disk3Ref = useRef();
  const lensRef = useRef();
  const coreRef = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const speed = isCelebrating ? 5 : isThinking ? 3.5 : isTransmitting ? 2.5 : 1.0;

    if (disk1Ref.current) disk1Ref.current.rotation.z += 0.008 * speed;
    if (disk2Ref.current) disk2Ref.current.rotation.z -= 0.005 * speed;
    if (disk3Ref.current) {
      disk3Ref.current.rotation.z += 0.003 * speed;
      disk3Ref.current.rotation.x = Math.sin(t * 0.3) * 0.4;
    }
    if (lensRef.current) {
      lensRef.current.rotation.z -= 0.0025 * speed;
      lensRef.current.rotation.y = Math.sin(t * 0.25) * 0.35;
    }

    if (coreRef.current) {
      coreRef.current.material.distort = isThinking
        ? 0.6 + 0.2 * Math.sin(t * 4)
        : 0.2 + 0.05 * Math.sin(t * 1.2);
    }

    if (glowRef.current) {
      glowRef.current.material.opacity = isCelebrating
        ? 0.4 + 0.2 * Math.sin(t * 6)
        : isThinking
        ? 0.25 + 0.15 * Math.sin(t * 3)
        : 0.08 + 0.04 * Math.sin(t);
    }
  });

  return (
    <group>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.52, 32, 32]} />
        <meshBasicMaterial color={personaColor} transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>

      <mesh>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshBasicMaterial color="#000005" />
      </mesh>

      <mesh ref={coreRef}>
        <sphereGeometry args={[0.26, 64, 64]} />
        <MeshDistortMaterial
          color="#0a0018"
          emissive="#1e1040"
          emissiveIntensity={0.5}
          distort={0.2}
          speed={1.5}
          roughness={0}
          metalness={1}
        />
      </mesh>

      <mesh ref={disk1Ref} rotation={[Math.PI * 0.15, 0, 0]}>
        <ringGeometry args={[0.32, 0.48, 64]} />
        <meshBasicMaterial
          color={diskColor}
          transparent
          opacity={isCelebrating ? 1 : 0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh ref={disk2Ref} rotation={[Math.PI * 0.18, 0.3, 0]}>
        <ringGeometry args={[0.48, 0.62, 64]} />
        <meshBasicMaterial color={personaColor} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      <mesh ref={disk3Ref} rotation={[Math.PI * 0.5, 0.6, 0]}>
        <ringGeometry args={[0.62, 0.72, 64]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      <mesh ref={lensRef} rotation={[Math.PI * 0.26, 0.42, 0]}>
        <torusGeometry args={[0.57, 0.018, 16, 100]} />
        <meshBasicMaterial color={personaColor} transparent opacity={0.16} />
      </mesh>

      <pointLight
        color={personaColor}
        intensity={isCelebrating ? 6 : isThinking ? 4 : 1.5}
        distance={3}
        decay={2}
      />
    </group>
  );
}

function TARSPanel({ position, rotation, openAngle, slitColor, isBlinking, panelIndex }) {
  const panelRef = useRef();
  const slitRef = useRef();
  const rimRef = useRef();
  const currentAngle = useRef(0);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    currentAngle.current += (openAngle - currentAngle.current) * 0.04;
    if (panelRef.current) {
      panelRef.current.rotation.y = currentAngle.current;
      panelRef.current.position.x = position[0] + Math.sin(currentAngle.current) * 0.28;
    }

    if (slitRef.current) {
      const targetY = isBlinking ? 0.08 : 1.0;
      slitRef.current.scale.y += (targetY - slitRef.current.scale.y) * 0.25;
    }

    if (rimRef.current) {
      rimRef.current.material.opacity = 0.4 + 0.3 * Math.sin(t * 2 + panelIndex);
    }
  });

  return (
    <group ref={panelRef} position={position} rotation={rotation}>
      <RoundedBox args={[0.22, 1.4, 0.18]} radius={0.03} smoothness={4}>
        <meshStandardMaterial
          color="#080e1e"
          emissive="#0a1230"
          emissiveIntensity={0.5}
          roughness={0.05}
          metalness={0.98}
        />
      </RoundedBox>

      {[-0.5, -0.3, -0.1, 0.1, 0.3, 0.5].map((y, i) => (
        <mesh key={i} position={[0, y, 0.092]}>
          <boxGeometry args={[i % 2 === 0 ? 0.14 : 0.1, 0.004, 0.005]} />
          <meshBasicMaterial color={slitColor} transparent opacity={0.15} />
        </mesh>
      ))}

      <mesh position={[0.05, 0, 0.092]}>
        <boxGeometry args={[0.004, 1.2, 0.005]} />
        <meshBasicMaterial color={slitColor} transparent opacity={0.1} />
      </mesh>

      <mesh ref={slitRef} position={[0, 0.1, 0.093]}>
        <boxGeometry args={[0.15, 0.022, 0.008]} />
        <meshStandardMaterial
          color={slitColor}
          emissive={slitColor}
          emissiveIntensity={4}
          roughness={0}
          metalness={1}
        />
      </mesh>

      <mesh position={[0, -0.05, 0.092]}>
        <boxGeometry args={[0.08, 0.008, 0.005]} />
        <meshStandardMaterial color={slitColor} emissive={slitColor} emissiveIntensity={2} />
      </mesh>

      <mesh ref={rimRef} position={[0.108, 0, 0]}>
        <boxGeometry args={[0.006, 1.3, 0.008]} />
        <meshBasicMaterial color={slitColor} transparent opacity={0.5} />
      </mesh>

      {[[-0.08, 0.62], [0.08, 0.62], [-0.08, -0.62], [0.08, -0.62]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.092]}>
          <circleGeometry args={[0.012, 8]} />
          <meshBasicMaterial color={slitColor} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function TARSBody({
  emotion,
  isThinking,
  isTransmitting,
  mouse,
  hovered,
  spinCount,
  personaColor,
  diskColor,
  slitColor,
}) {
  const bodyRef = useRef();
  const currentRot = useRef({ x: 0, y: 0, z: 0 });
  const targetRot = useRef({ x: 0, y: 0, z: 0 });
  const spinRef = useRef(0);
  const lastSpin = useRef(0);
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    let stopped = false;
    let blinkTimer;
    let nextTimer;

    const doBlink = () => {
      if (stopped) return;
      setIsBlinking(true);
      blinkTimer = setTimeout(() => setIsBlinking(false), 150);
      nextTimer = setTimeout(doBlink, 2500 + Math.random() * 4000);
    };

    nextTimer = setTimeout(doBlink, 2000 + Math.random() * 3000);

    return () => {
      stopped = true;
      if (blinkTimer) clearTimeout(blinkTimer);
      if (nextTimer) clearTimeout(nextTimer);
    };
  }, []);

  const panelOpen = ['thinking', 'celebrate', 'spin', 'konami', 'greeting'].includes(emotion);

  const panelAngles = {
    thinking: { L: 0.7, R: -0.7 },
    celebrate: { L: 1.1, R: -1.1 },
    greeting: { L: 0.5, R: -0.5 },
    spin: { L: 1.2, R: -1.2 },
    konami: { L: 1.4, R: -1.4 },
    confused: { L: 0.3, R: -0.1 },
    shake: { L: 0.1, R: -0.1 },
    typing: { L: 0.45, R: -0.45 },
    idle: { L: 0.0, R: 0.0 },
  };

  const angles = panelAngles[emotion] || { L: 0, R: 0 };

  useFrame(() => {
    if (spinCount > lastSpin.current) {
      spinRef.current += Math.PI * 2 * (spinCount - lastSpin.current);
      lastSpin.current = spinCount;
    }

    if (spinRef.current > 0.01) {
      spinRef.current -= 0.08;
      if (bodyRef.current) bodyRef.current.rotation.y += 0.08;
      return;
    }

    const hoverMult = hovered ? 1.5 : 1.0;
    targetRot.current.z = 0;

    switch (emotion) {
      case 'thinking':
        targetRot.current.x = 0.25;
        targetRot.current.y = Math.sin(Date.now() * 0.0008) * 0.12;
        break;
      case 'greeting':
        targetRot.current.x = 0.3;
        targetRot.current.y = 0;
        break;
      case 'shake':
        targetRot.current.y = Math.sin(Date.now() * 0.02) * 0.4;
        targetRot.current.x = 0;
        break;
      case 'celebrate':
        targetRot.current.x = -0.15;
        targetRot.current.y = Math.sin(Date.now() * 0.003) * 0.3;
        break;
      case 'typing':
        // Lean toward the lower message/input area while interaction is active.
        targetRot.current.y = -0.35;
        targetRot.current.x = 0.25;
        break;
      case 'confused':
        targetRot.current.x = 0.1;
        targetRot.current.y = -0.35;
        targetRot.current.z = 0.15;
        break;
      default:
        targetRot.current.y = mouse.x * 0.6 * hoverMult;
        targetRot.current.x = -mouse.y * 0.35 * hoverMult;
    }

    currentRot.current.x += (targetRot.current.x - currentRot.current.x) * 0.045;
    currentRot.current.y += (targetRot.current.y - currentRot.current.y) * 0.045;
    currentRot.current.z += (targetRot.current.z - currentRot.current.z) * 0.045;

    if (bodyRef.current) {
      bodyRef.current.rotation.x = currentRot.current.x;
      bodyRef.current.rotation.y = currentRot.current.y;
      bodyRef.current.rotation.z = currentRot.current.z;
    }
  });

  const isCelebrating = emotion === 'celebrate' || emotion === 'konami';

  return (
    <group ref={bodyRef}>
      <TARSPanel
        position={[-0.26, 0, 0]}
        rotation={[0, 0, 0]}
        openAngle={angles.L}
        slitColor={slitColor}
        isBlinking={isBlinking}
        panelIndex={0}
      />

      <TARSPanel
        position={[0.26, 0, 0]}
        rotation={[0, Math.PI, 0]}
        openAngle={angles.R}
        slitColor={slitColor}
        isBlinking={isBlinking}
        panelIndex={1}
      />

      <group scale={panelOpen ? 0.85 : 0.68}>
        <GargantuaCore
          isThinking={isThinking}
          isTransmitting={isTransmitting}
          isCelebrating={isCelebrating}
          personaColor={personaColor}
          diskColor={diskColor}
        />
      </group>

      <group position={[0, 0.74, 0]}>
        <mesh>
          <boxGeometry args={[0.58, 0.055, 0.16]} />
          <meshStandardMaterial
            color="#060c1a"
            emissive={personaColor}
            emissiveIntensity={0.3}
            roughness={0.05}
            metalness={0.98}
          />
        </mesh>
        {[-0.18, 0, 0.18].map((x, i) => (
          <mesh key={i} position={[x, 0, 0.082]}>
            <boxGeometry args={[0.04, 0.03, 0.01]} />
            <meshBasicMaterial color={slitColor} transparent opacity={0.4} />
          </mesh>
        ))}
      </group>

      <mesh position={[0, -0.74, 0]}>
        <boxGeometry args={[0.58, 0.055, 0.16]} />
        <meshStandardMaterial
          color="#060c1a"
          emissive={personaColor}
          emissiveIntensity={0.3}
          roughness={0.05}
          metalness={0.98}
        />
      </mesh>

      <group position={[0.12, 0.84, 0]}>
        <mesh>
          <cylinderGeometry args={[0.01, 0.015, 0.28, 8]} />
          <meshStandardMaterial color="#0f1a30" metalness={0.98} roughness={0.05} />
        </mesh>
        <mesh position={[0, 0.16, 0]}>
          <sphereGeometry args={[0.036, 14, 14]} />
          <meshStandardMaterial color={slitColor} emissive={slitColor} emissiveIntensity={isCelebrating ? 6 : 4} />
        </mesh>
      </group>

      <group position={[-0.08, 0.78, 0]}>
        <mesh>
          <cylinderGeometry args={[0.006, 0.008, 0.16, 6]} />
          <meshStandardMaterial color="#0f1a30" metalness={0.98} roughness={0.05} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.022, 10, 10]} />
          <meshStandardMaterial color={personaColor} emissive={personaColor} emissiveIntensity={3} />
        </mesh>
      </group>

      <pointLight
        position={[0, 0.1, 0.8]}
        color={personaColor}
        intensity={isCelebrating ? 3.5 : isThinking ? 2.5 : 1.2}
        distance={2.5}
        decay={2}
      />

      <pointLight
        position={[0, -1, 0.5]}
        color={diskColor}
        intensity={0.4}
        distance={2}
        decay={2}
      />
    </group>
  );
}

export default function RobotHead({ isThinking, isTransmitting, embedded }) {
  const mouse = useMouse();
  const [hovered, setHovered] = useState(false);
  const [showPersona, setShowPersona] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const lastSpokenRef = useRef('');
  const { persona, setPersona, config } = usePersona();
  const { user } = useAuth();
  const { playNewChat, playSend } = useSound();
  const { speak, stop, ready } = useTARSVoice();

  const {
    emotion,
    quote,
    showQuote,
    spinCount,
    missionTime,
    showClock,
    handleClick,
    handleDoubleClick,
    handleHoverStart,
    handleHoverEnd,
    handleTypingStart,
    handleTypingEnd,
    handleEmptySubmit,
    handleMessageReceived,
    handleError,
    handleKeywordCheck,
  } = useTARSState(user?.username);

  useEffect(() => {
    window.TARS = {
      onTypingStart: handleTypingStart,
      onTypingEnd: handleTypingEnd,
      onEmptySubmit: handleEmptySubmit,
      onMessageReceived: handleMessageReceived,
      onError: handleError,
      onKeywordCheck: handleKeywordCheck,
    };

    return () => {
      delete window.TARS;
    };
  }, [
    handleTypingStart,
    handleTypingEnd,
    handleEmptySubmit,
    handleMessageReceived,
    handleError,
    handleKeywordCheck,
  ]);

  useEffect(() => {
    if (!showQuote || !quote || !voiceEnabled || !ready) return;
    if (quote === lastSpokenRef.current) return;
    lastSpokenRef.current = quote;
    speak(quote, voiceEnabled);
  }, [showQuote, quote, voiceEnabled, ready, speak]);

  useEffect(() => {
    if (!showQuote) {
      stop();
    }
  }, [showQuote, stop]);

  const handlePersonaChange = (key) => {
    setPersona(key);
    setShowPersona(false);
    playNewChat();
  };

  const onRobotClick = () => {
    playSend();
    handleClick();
  };

  const emotionColor =
    {
      confused: '#ef4444',
      celebrate: '#22c55e',
      konami: '#f59e0b',
      greeting: config.color,
      shake: '#ef4444',
      spin: '#38bdf8',
      typing: '#93c5fd',
    }[emotion] || config.color;

  return (
    <div
      style={embedded ? {
        position: 'relative',
        width: '100%',
        height: '100%',
        zIndex: 50,
      } : {
        position: 'fixed',
        bottom: '36px',
        right: '28px',
        zIndex: 50,
      }}
    >
      {!embedded && showQuote && (
        <div
          style={{
            position: 'absolute',
            bottom: '218px',
            right: '0',
            width: '230px',
            padding: '12px 14px',
            background: 'rgba(7,16,42,0.97)',
            border: `0.5px solid ${emotionColor}50`,
            borderRadius: '12px 12px 4px 12px',
            backdropFilter: 'blur(16px)',
            boxShadow: `0 0 24px ${emotionColor}25`,
            animation: 'signal-in 0.3s ease forwards',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <div
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: emotionColor,
                boxShadow: `0 0 6px ${emotionColor}`,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-orbitron)',
                fontSize: '8px',
                color: emotionColor,
                letterSpacing: '0.15em',
              }}
            >
              {emotion.toUpperCase()}
            </span>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: '#e6eef8',
              letterSpacing: '0.03em',
              lineHeight: 1.65,
            }}
          >
            {quote}
          </div>
        </div>
      )}

      {!embedded && showClock && !showQuote && (
        <div
          style={{
            position: 'absolute',
            bottom: '218px',
            right: '0',
            padding: '10px 14px',
            background: 'rgba(7,16,42,0.97)',
            border: `0.5px solid ${config.color}40`,
            borderRadius: '10px',
            backdropFilter: 'blur(12px)',
            animation: 'signal-in 0.2s ease forwards',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-orbitron)',
              fontSize: '8px',
              color: 'var(--text-dim)',
              letterSpacing: '0.15em',
              marginBottom: '4px',
            }}
          >
            MISSION CLOCK
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: config.color,
              letterSpacing: '0.1em',
              textShadow: `0 0 10px ${config.color}`,
            }}
          >
            {missionTime}
          </div>
          <div
            style={{
              marginTop: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--text-dim)',
            }}
          >
            LAZARUS MISSION - DEEP SPACE
          </div>
        </div>
      )}

      {!embedded && showPersona && (
        <div
          style={{
            position: 'absolute',
            bottom: '218px',
            right: '0',
            width: '200px',
            padding: '12px',
            background: 'rgba(7,16,42,0.97)',
            border: '0.5px solid rgba(168,85,247,0.25)',
            borderRadius: '12px',
            backdropFilter: 'blur(16px)',
            animation: 'signal-in 0.25s ease forwards',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-orbitron)',
              fontSize: '9px',
              color: 'var(--text-dim)',
              letterSpacing: '0.15em',
              marginBottom: '10px',
            }}
          >
            SELECT PERSONA
          </div>
          {Object.entries(PERSONA_CONFIGS).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => handlePersonaChange(key)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                marginBottom: '4px',
                borderRadius: '8px',
                cursor: 'pointer',
                border: 'none',
                background: persona === key ? `${cfg.color}18` : 'transparent',
                outline: persona === key ? `0.5px solid ${cfg.color}50` : '0.5px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: cfg.color,
                  boxShadow: `0 0 6px ${cfg.color}`,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: persona === key ? cfg.color : 'var(--text-muted)',
                  letterSpacing: '0.08em',
                }}
              >
                {cfg.label}
              </span>
            </button>
          ))}
          <div
            style={{
              marginTop: '8px',
              paddingTop: '8px',
              borderTop: '0.5px solid rgba(255,255,255,0.06)',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--text-dim)',
              textAlign: 'center',
              letterSpacing: '0.1em',
            }}
          >
            TRY: UP UP DOWN DOWN LEFT RIGHT LEFT RIGHT
          </div>
        </div>
      )}

      <div
        onClick={onRobotClick}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => {
          setHovered(true);
          handleHoverStart();
        }}
        onMouseLeave={() => {
          setHovered(false);
          handleHoverEnd();
        }}
        style={embedded ? {
          // Embedded in left panel — fills parent
          width: '100%',
          height: '100%',
          position: 'relative',
          cursor: 'pointer',
          filter: `drop-shadow(0 0 ${hovered ? 32 : 16}px rgba(124,92,191,${hovered ? 0.7 : 0.4}))`,
          transition: 'filter 0.4s'
        } : {
          // Fixed corner position
          width: '160px',
          height: '200px',
          cursor: 'pointer',
          filter: `drop-shadow(0 0 ${hovered ? 36 : 20}px ${emotionColor}${hovered ? 'b3' : '66'})`,
          transition: 'filter 0.4s',
        }}
      >
        <Canvas
          camera={{ position: [0, 0, embedded ? 2.8 : 3.6], fov: embedded ? 52 : 38 }}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={0.15} />
          <directionalLight position={[3, 4, 3]} intensity={0.4} />
          <Float speed={isThinking ? 2.5 : 1.5} floatIntensity={0.3} rotationIntensity={0}>
            <TARSBody
              emotion={isThinking ? 'thinking' : emotion}
              isThinking={isThinking}
              isTransmitting={isTransmitting}
              mouse={mouse}
              hovered={hovered}
              spinCount={spinCount}
              personaColor={emotionColor}
              diskColor={config.diskColor}
              slitColor={config.slitColor}
            />
          </Float>
        </Canvas>

        {embedded && showQuote && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            right: '10px',
            padding: '8px 12px',
            background: 'rgba(4,8,20,0.96)',
            border: `0.5px solid ${emotionColor}50`,
            borderRadius: '8px',
            backdropFilter: 'blur(12px)',
            boxShadow: `0 0 16px ${emotionColor}20`,
            animation: 'signal-in 0.3s ease forwards',
            zIndex: 5,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              marginBottom: '4px',
            }}>
              <div style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: emotionColor,
                boxShadow: `0 0 4px ${emotionColor}`,
              }} />
              <span style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '8px',
                color: emotionColor,
                letterSpacing: '0.12em',
              }}>
                {emotion.toUpperCase()}
              </span>
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-1)',
              lineHeight: 1.55,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {quote}
            </div>
          </div>
        )}
      </div>

      {!embedded && (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 4px',
          marginTop: '-8px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '8px',
            letterSpacing: '0.15em',
            color: hovered ? emotionColor : 'var(--text-dim)',
            transition: 'color 0.4s',
          }}
        >
          TARS
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setVoiceEnabled((v) => !v);
            }}
            title={voiceEnabled ? 'Mute TARS' : 'Unmute TARS'}
            style={{
              background: 'none',
              border: `0.5px solid ${voiceEnabled ? `${config.color}60` : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '6px',
              padding: '3px 6px',
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)',
              fontSize: '8px',
              color: voiceEnabled ? config.color : 'var(--text-3)',
              letterSpacing: '0.08em',
              transition: 'all 0.2s',
            }}
          >
            {voiceEnabled ? 'VOICE' : 'MUTE'}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPersona((p) => !p);
            }}
            style={{
              background: 'none',
              border: `0.5px solid ${config.color}40`,
              borderRadius: '6px',
              padding: '3px 8px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '8px',
              color: config.color,
              letterSpacing: '0.08em',
              transition: 'all 0.2s',
            }}
          >
            {config.label.split(' ')[0]}
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
