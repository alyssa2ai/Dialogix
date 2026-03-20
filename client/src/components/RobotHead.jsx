import { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, RoundedBox, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { PERSONA_CONFIGS } from '../data/tarsQuotes';
import { usePersona } from '../context/PersonaContext';
import { useSound } from '../hooks/useSound';
import { useTARSState } from '../hooks/useTARSState';
import { useTARSVoice } from '../hooks/useTARSVoice';
import { useAuth } from '../context/AuthContext';

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

// -- Gargantua Core --
function GargantuaCore({ isThinking, isTransmitting, isCelebrating, personaColor, diskColor }) {
  const disk1Ref = useRef();
  const disk2Ref = useRef();
  const disk3Ref = useRef();
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
        <ringGeometry args={[0.32, 0.46, 64]} />
        <meshBasicMaterial
          color={diskColor}
          transparent
          opacity={isCelebrating ? 1 : 0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={disk2Ref} rotation={[Math.PI * 0.18, 0.3, 0]}>
        <ringGeometry args={[0.46, 0.58, 64]} />
        <meshBasicMaterial color={personaColor} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={disk3Ref} rotation={[Math.PI * 0.5, 0.6, 0]}>
        <ringGeometry args={[0.58, 0.68, 64]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.2} side={THREE.DoubleSide} />
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

// -- Touch ripple effect --
function TouchRipple({ position, color, onDone }) {
  const ref = useRef();
  const age = useRef(0);

  useFrame((_, delta) => {
    age.current += delta;
    if (ref.current) {
      const scale = 1 + age.current * 4;
      ref.current.scale.setScalar(scale);
      ref.current.material.opacity = Math.max(0, 0.7 - age.current * 1.4);
      if (age.current > 0.5) onDone();
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <ringGeometry args={[0.04, 0.07, 24]} />
      <meshBasicMaterial color={color} transparent opacity={0.7} side={THREE.DoubleSide} />
    </mesh>
  );
}

// -- Single TARS panel with circuit details --
function TARSPanel({
  position,
  rotation,
  targetAngle,
  slitColor,
  isBlinking,
  panelIndex,
  onTouch,
  rippleColor,
}) {
  const panelRef = useRef();
  const slitRef = useRef();
  const rimRef = useRef();
  const currentAngle = useRef(0);
  const [ripples, setRipples] = useState([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Smooth panel rotation
    currentAngle.current += (targetAngle - currentAngle.current) * 0.05;
    if (panelRef.current) {
      panelRef.current.rotation.y = currentAngle.current;
      panelRef.current.position.x = position[0] + Math.sin(currentAngle.current) * 0.28;
    }

    // Eye slit blink
    if (slitRef.current) {
      const targetY = isBlinking ? 0.05 : 1.0;
      slitRef.current.scale.y += (targetY - slitRef.current.scale.y) * 0.3;
    }

    // Rim pulse
    if (rimRef.current) {
      rimRef.current.material.opacity = 0.35 + 0.25 * Math.sin(t * 2.5 + panelIndex * Math.PI);
    }
  });

  return (
    <group ref={panelRef} position={position} rotation={rotation}>
      {/* Main panel */}
      <RoundedBox
        args={[0.22, 1.4, 0.18]}
        radius={0.03}
        smoothness={4}
        onClick={(e) => {
          e.stopPropagation();
          const pt = e.point;
          setRipples((r) => [...r, { id: Date.now(), pos: [pt.x - position[0], pt.y, 0.1] }]);
          onTouch?.();
        }}
      >
        <meshStandardMaterial
          color="#070d1c"
          emissive="#0a1230"
          emissiveIntensity={0.5}
          roughness={0.05}
          metalness={0.98}
        />
      </RoundedBox>

      {/* Circuit lines */}
      {[-0.5, -0.3, -0.1, 0.1, 0.3, 0.5].map((y, i) => (
        <mesh key={i} position={[0, y, 0.092]}>
          <boxGeometry args={[i % 2 === 0 ? 0.13 : 0.09, 0.003, 0.004]} />
          <meshBasicMaterial color={slitColor} transparent opacity={0.12} />
        </mesh>
      ))}

      {/* Vertical circuit line */}
      <mesh position={[0.04, 0, 0.092]}>
        <boxGeometry args={[0.003, 1.2, 0.004]} />
        <meshBasicMaterial color={slitColor} transparent opacity={0.08} />
      </mesh>

      {/* Main eye slit */}
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

      {/* Secondary slit */}
      <mesh position={[0, -0.06, 0.092]}>
        <boxGeometry args={[0.08, 0.007, 0.005]} />
        <meshStandardMaterial color={slitColor} emissive={slitColor} emissiveIntensity={2} />
      </mesh>

      {/* Rim light */}
      <mesh ref={rimRef} position={[0.108, 0, 0]}>
        <boxGeometry args={[0.005, 1.3, 0.008]} />
        <meshBasicMaterial color={slitColor} transparent opacity={0.4} />
      </mesh>

      {/* Corner accents */}
      {[[-0.08, 0.62], [0.08, 0.62], [-0.08, -0.62], [0.08, -0.62]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.092]}>
          <circleGeometry args={[0.011, 8]} />
          <meshBasicMaterial color={slitColor} transparent opacity={0.55} />
        </mesh>
      ))}

      {/* Touch ripples */}
      {ripples.map((r) => (
        <TouchRipple
          key={r.id}
          position={r.pos}
          color={rippleColor}
          onDone={() => setRipples((prev) => prev.filter((x) => x.id !== r.id))}
        />
      ))}
    </group>
  );
}

// -- Panel configuration per emotion --
const CONFIGS = {
  idle: { L: 0.0, R: 0.0, bodyX: 0, bodyZ: 0 },
  thinking: { L: 0.75, R: -0.75, bodyX: 0.25, bodyZ: 0 },
  celebrate: { L: 1.1, R: -1.1, bodyX: -0.1, bodyZ: 0 },
  greeting: { L: 0.45, R: -0.45, bodyX: 0.3, bodyZ: 0 },
  spin: { L: 1.2, R: -1.2, bodyX: 0, bodyZ: 0 },
  konami: { L: 1.4, R: -1.4, bodyX: 0, bodyZ: 0 },
  confused: { L: 0.25, R: -0.05, bodyX: 0.1, bodyZ: 0.12 }, // asymmetric tilt
  shake: { L: 0.08, R: -0.08, bodyX: 0, bodyZ: 0 },
  typing: { L: 0.15, R: -0.15, bodyX: 0.28, bodyZ: -0.1 },
  // TARS movie configurations
  walk_a: { L: 0.0, R: 1.57, bodyX: 0, bodyZ: 0 }, // L-shape
  walk_b: { L: 1.57, R: 0.0, bodyX: 0, bodyZ: 0 }, // reverse L
  walk_c: { L: 0.78, R: -0.78, bodyX: 0, bodyZ: 0 }, // T-shape
  compact: { L: 1.57, R: -1.57, bodyX: 0, bodyZ: 0 }, // fully open
};

// -- Main TARS body --
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
  dragRotation,
  isWalking,
  walkPhase,
  onPanelTouch,
}) {
  const bodyRef = useRef();
  const currentRot = useRef({ x: 0, y: 0, z: 0 });
  const targetRot = useRef({ x: 0, y: 0, z: 0 });
  const spinRef = useRef(0);
  const lastSpin = useRef(0);
  const [isBlinking, setIsBlinking] = useState(false);

  // Random blink
  useEffect(() => {
    let blinkTimer = null;
    let scheduleTimer = null;
    const doBlink = () => {
      setIsBlinking(true);
      blinkTimer = setTimeout(() => setIsBlinking(false), 110);
      scheduleTimer = setTimeout(doBlink, 2200 + Math.random() * 4500);
    };
    const t = setTimeout(doBlink, 1200);
    return () => {
      clearTimeout(t);
      if (blinkTimer) clearTimeout(blinkTimer);
      if (scheduleTimer) clearTimeout(scheduleTimer);
    };
  }, []);

  // Always return to emotion config when walking is off.
  const cfg = (() => {
    if (!isWalking) return CONFIGS[emotion] || CONFIGS.idle;
    const walkConfigs = ['walk_a', 'walk_c', 'walk_b', 'walk_c', 'walk_a', 'walk_c', 'walk_b', 'idle'];
    return CONFIGS[walkConfigs[walkPhase % walkConfigs.length]] || CONFIGS.idle;
  })();

  useFrame(() => {
    // Handle spin
    if (spinCount > lastSpin.current) {
      spinRef.current += Math.PI * 2 * (spinCount - lastSpin.current);
      lastSpin.current = spinCount;
    }
    if (spinRef.current > 0.01) {
      spinRef.current -= 0.1;
      if (bodyRef.current) bodyRef.current.rotation.y += 0.1;
      return;
    }

    // Apply drag rotation on top of emotion rotation
    const dragX = dragRotation.current.x;
    const dragY = dragRotation.current.y;

    const hoverMult = hovered ? 1.5 : 1.0;

    switch (emotion) {
      case 'thinking':
        targetRot.current.x = 0.28 + dragX;
        targetRot.current.y = Math.sin(Date.now() * 0.001) * 0.12 + dragY;
        break;
      case 'greeting':
        targetRot.current.x = 0.32 + dragX;
        targetRot.current.y = dragY;
        break;
      case 'shake':
        targetRot.current.y = Math.sin(Date.now() * 0.025) * 0.45 + dragY;
        targetRot.current.x = dragX;
        break;
      case 'celebrate':
        targetRot.current.x = -0.18 + dragX;
        targetRot.current.y = Math.sin(Date.now() * 0.004) * 0.3 + dragY;
        break;
      case 'typing':
        targetRot.current.y = -0.38 + dragY;
        targetRot.current.x = 0.28 + dragX;
        break;
      case 'confused':
        targetRot.current.x = 0.1 + dragX;
        targetRot.current.y = -0.3 + dragY;
        targetRot.current.z = 0.14;
        break;
      default:
        targetRot.current.y = mouse.x * 0.6 * hoverMult + dragY;
        targetRot.current.x = -mouse.y * 0.35 * hoverMult + dragX;
        targetRot.current.z = cfg.bodyZ || 0;
    }

    currentRot.current.x += (targetRot.current.x - currentRot.current.x) * 0.045;
    currentRot.current.y += (targetRot.current.y - currentRot.current.y) * 0.045;
    currentRot.current.z += ((targetRot.current.z || 0) - currentRot.current.z) * 0.04;

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
        targetAngle={cfg.L}
        slitColor={slitColor}
        isBlinking={isBlinking}
        panelIndex={0}
        onTouch={onPanelTouch}
        rippleColor={personaColor}
      />
      <TARSPanel
        position={[0.26, 0, 0]}
        rotation={[0, Math.PI, 0]}
        targetAngle={cfg.R}
        slitColor={slitColor}
        isBlinking={isBlinking}
        panelIndex={1}
        onTouch={onPanelTouch}
        rippleColor={personaColor}
      />

      {/* Core */}
      <group scale={cfg.L > 0.5 || isCelebrating ? 0.82 : 0.65}>
        <GargantuaCore
          isThinking={isThinking}
          isTransmitting={isTransmitting}
          isCelebrating={isCelebrating}
          personaColor={personaColor}
          diskColor={diskColor}
        />
      </group>

      {/* Connectors */}
      {[0.74, -0.74].map((y, i) => (
        <group key={i} position={[0, y, 0]}>
          <mesh>
            <boxGeometry args={[0.56, 0.054, 0.16]} />
            <meshStandardMaterial
              color="#060b18"
              emissive={personaColor}
              emissiveIntensity={0.25}
              roughness={0.05}
              metalness={0.98}
            />
          </mesh>
          {[-0.16, 0, 0.16].map((x, j) => (
            <mesh key={j} position={[x, 0, 0.082]}>
              <boxGeometry args={[0.035, 0.028, 0.01]} />
              <meshBasicMaterial color={slitColor} transparent opacity={0.35} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Main antenna */}
      <group position={[0.11, 0.83, 0]}>
        <mesh>
          <cylinderGeometry args={[0.01, 0.014, 0.26, 8]} />
          <meshStandardMaterial color="#0d1828" metalness={0.98} roughness={0.05} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.034, 14, 14]} />
          <meshStandardMaterial
            color={slitColor}
            emissive={slitColor}
            emissiveIntensity={isCelebrating ? 6 : 4}
          />
        </mesh>
      </group>

      {/* Secondary antenna */}
      <group position={[-0.09, 0.77, 0]}>
        <mesh>
          <cylinderGeometry args={[0.006, 0.008, 0.15, 6]} />
          <meshStandardMaterial color="#0d1828" metalness={0.98} roughness={0.05} />
        </mesh>
        <mesh position={[0, 0.09, 0]}>
          <sphereGeometry args={[0.021, 10, 10]} />
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
      <pointLight position={[0, -1, 0.5]} color={diskColor} intensity={0.4} distance={2} decay={2} />
    </group>
  );
}

// -- Drag controller -- makes TARS grabbable --
function DragController({ dragRotation, onDragStart, onDragEnd }) {
  const { gl } = useThree();
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = gl.domElement;

    const getPoint = (e) => {
      if ('touches' in e && e.touches?.[0]) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: e.clientX, y: e.clientY };
    };

    const onDown = (e) => {
      const p = getPoint(e);
      if (typeof p.x !== 'number' || typeof p.y !== 'number') return;
      isDragging.current = true;
      lastPos.current = { x: p.x, y: p.y };
      velocity.current = { x: 0, y: 0 };
      onDragStart?.();
    };

    const onMove = (e) => {
      if (!isDragging.current) return;
      const p = getPoint(e);
      if (typeof p.x !== 'number' || typeof p.y !== 'number') return;

      const dx = p.x - lastPos.current.x;
      const dy = p.y - lastPos.current.y;

      velocity.current.x = dy * 0.008;
      velocity.current.y = dx * 0.008;

      dragRotation.current.x += dy * 0.008;
      dragRotation.current.y += dx * 0.008;

      lastPos.current = { x: p.x, y: p.y };
    };

    const onUp = () => {
      isDragging.current = false;
      onDragEnd?.();
    };

    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup', onUp);
    canvas.addEventListener('touchstart', onDown, { passive: true });
    canvas.addEventListener('touchmove', onMove, { passive: true });
    canvas.addEventListener('touchend', onUp);

    return () => {
      canvas.removeEventListener('mousedown', onDown);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('touchstart', onDown);
      canvas.removeEventListener('touchmove', onMove);
      canvas.removeEventListener('touchend', onUp);
    };
  }, [gl, dragRotation, onDragEnd, onDragStart]);

  // Momentum -- TARS keeps spinning after release, slowly decays
  useFrame(() => {
    if (!isDragging.current) {
      velocity.current.x *= 0.92;
      velocity.current.y *= 0.92;
      dragRotation.current.x += velocity.current.x;
      dragRotation.current.y += velocity.current.y;

      // Slowly return to neutral
      dragRotation.current.x *= 0.97;
      dragRotation.current.y *= 0.97;
    }
  });

  return null;
}

export default function RobotHead({ isThinking, isTransmitting, embedded, voiceOverride }) {
  const mouse = useMouse();
  const [hovered, setHovered] = useState(false);
  const [showPersona, setShowPersona] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [walkPhase, setWalkPhase] = useState(0);
  const dragRotation = useRef({ x: 0, y: 0 });
  const walkTimerRef = useRef(null);
  const walkPhaseRef = useRef(null);

  const { persona, setPersona, config } = usePersona();
  const { playNewChat, playSend } = useSound();
  const { user } = useAuth();
  const { speak, stop, ready } = useTARSVoice();
  const [voiceEnabledState, setVoiceEnabledState] = useState(true);
  const voiceEnabled = embedded
    ? (voiceOverride !== undefined ? voiceOverride : true)
    : voiceEnabledState;
  const lastSpokenRef = useRef('');

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

  // Speak quotes
  useEffect(() => {
    if (!showQuote || !quote || !voiceEnabled || !ready) return;
    if (quote === lastSpokenRef.current) return;
    lastSpokenRef.current = quote;
    speak(quote, voiceEnabled);
  }, [showQuote, quote, voiceEnabled, ready, speak]);

  useEffect(() => {
    if (!showQuote) stop();
  }, [showQuote, stop]);

  // Walking animation -- triggers after 30s of idle
  useEffect(() => {
    const startWalk = () => {
      if (emotion !== 'idle' || isWalking) return;
      setIsWalking(true);

      let phase = 0;
      const totalPhases = 8;
      walkPhaseRef.current = setInterval(() => {
        phase++;
        setWalkPhase(phase);
        if (phase >= totalPhases) {
          clearInterval(walkPhaseRef.current);
          // Force back to idle config.
          setIsWalking(false);
          setWalkPhase(0);
        }
      }, 500);
    };

    walkTimerRef.current = setInterval(() => {
      if (emotion === 'idle' && !isWalking) startWalk();
    }, 30000);

    return () => {
      clearInterval(walkTimerRef.current);
      clearInterval(walkPhaseRef.current);
    };
  }, [emotion, isWalking]);

  // Panel touch handler
  const handlePanelTouch = useCallback(() => {
    playSend();
    handleClick();
  }, [playSend, handleClick]);

  // Expose TARS globally
  useEffect(() => {
    window.TARS = {
      onTypingStart: handleTypingStart,
      onTypingEnd: handleTypingEnd,
      onEmptySubmit: handleEmptySubmit,
      onMessageReceived: handleMessageReceived,
      onError: handleError,
      onKeywordCheck: handleKeywordCheck,
    };
  }, [
    handleTypingStart,
    handleTypingEnd,
    handleEmptySubmit,
    handleMessageReceived,
    handleError,
    handleKeywordCheck,
  ]);

  const emotionColor =
    {
      confused: '#ef4444',
      celebrate: '#22c55e',
      konami: '#f59e0b',
      greeting: config.color,
      shake: '#ef4444',
    }[emotion] || config.color;

  const handlePersonaChange = (key) => {
    setPersona(key);
    setShowPersona(false);
    playNewChat();
  };

  const containerStyle = embedded
    ? {
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: isDragging ? 'grabbing' : 'grab',
        filter: `drop-shadow(0 0 ${hovered ? 32 : 16}px ${emotionColor}${hovered ? 'b3' : '55'})`,
        transition: 'filter 0.4s',
      }
    : {
        position: 'fixed',
        bottom: '36px',
        right: '28px',
        width: '160px',
        height: '200px',
        zIndex: 50,
        cursor: isDragging ? 'grabbing' : 'grab',
        filter: `drop-shadow(0 0 ${hovered ? 32 : 16}px ${emotionColor}${hovered ? 'b3' : '55'})`,
        transition: 'filter 0.4s',
      };

  return (
    <div
      style={{
        position: embedded ? 'relative' : 'fixed',
        bottom: embedded ? 'auto' : '36px',
        right: embedded ? 'auto' : '28px',
        width: embedded ? '100%' : '160px',
        height: embedded ? '100%' : '200px',
        zIndex: embedded ? 1 : 50,
      }}
    >
      {/* Speech bubble */}
      {showQuote && (
        <div
          style={{
            position: 'absolute',
            bottom: embedded ? '10px' : '218px',
            left: embedded ? '8px' : '0',
            right: embedded ? '8px' : '0',
            padding: '10px 12px',
            background: 'rgba(4,8,20,0.97)',
            border: `0.5px solid ${emotionColor}50`,
            borderRadius: embedded ? '8px' : '12px 12px 4px 12px',
            backdropFilter: 'blur(16px)',
            boxShadow: `0 0 20px ${emotionColor}20`,
            animation: 'signal-in 0.3s ease forwards',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
            <div
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: emotionColor,
                boxShadow: `0 0 4px ${emotionColor}`,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '8px',
                color: emotionColor,
                letterSpacing: '0.12em',
              }}
            >
              {emotion.toUpperCase()}
            </span>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-1)',
              lineHeight: 1.55,
            }}
          >
            {quote}
          </div>
        </div>
      )}

      {/* Mission clock */}
      {showClock && !showQuote && (
        <div
          style={{
            position: 'absolute',
            bottom: embedded ? '10px' : '218px',
            left: embedded ? '8px' : '0',
            right: embedded ? '8px' : '0',
            padding: '10px 14px',
            background: 'rgba(4,8,20,0.97)',
            border: `0.5px solid ${config.color}40`,
            borderRadius: '10px',
            backdropFilter: 'blur(12px)',
            animation: 'signal-in 0.2s ease forwards',
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '8px',
              color: 'var(--text-3)',
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
            style={{ marginTop: '4px', fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-3)' }}
          >
            LAZARUS MISSION - DEEP SPACE
          </div>
        </div>
      )}

      {/* Persona panel */}
      {showPersona && (
        <div
          style={{
            position: 'absolute',
            bottom: embedded ? '10px' : '218px',
            right: 0,
            width: '200px',
            padding: '12px',
            background: 'rgba(4,8,20,0.97)',
            border: '0.5px solid rgba(124,92,191,0.3)',
            borderRadius: '12px',
            backdropFilter: 'blur(16px)',
            animation: 'signal-in 0.25s ease forwards',
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '9px',
              color: 'var(--text-3)',
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
                outline:
                  persona === key ? `0.5px solid ${cfg.color}50` : '0.5px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <div
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: cfg.color,
                  boxShadow: `0 0 5px ${cfg.color}`,
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
              color: 'var(--text-3)',
              textAlign: 'center',
            }}
          >
            TRY: UU DD LR LR
          </div>
        </div>
      )}

      {/* Canvas */}
      <div
        style={containerStyle}
        onMouseEnter={() => {
          setHovered(true);
          handleHoverStart();
        }}
        onMouseLeave={() => {
          setHovered(false);
          handleHoverEnd();
        }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        <Canvas
          camera={{ position: [0, 0, 3.6], fov: embedded ? 50 : 38 }}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={0.15} />
          <directionalLight position={[3, 4, 3]} intensity={0.4} />

          <DragController
            dragRotation={dragRotation}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
          />

          <Float speed={isWalking ? 0 : isThinking ? 2.5 : 1.5} floatIntensity={isWalking ? 0 : 0.3} rotationIntensity={0}>
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
              dragRotation={dragRotation}
              isWalking={isWalking}
              walkPhase={walkPhase}
              onPanelTouch={handlePanelTouch}
            />
          </Float>
        </Canvas>
      </div>

      {/* Bottom controls */}
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
              fontFamily: 'var(--font-ui)',
              fontSize: '8px',
              letterSpacing: '0.18em',
              color: hovered ? emotionColor : 'var(--text-3)',
              transition: 'color 0.4s',
            }}
          >
            T-A-R-S
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setVoiceEnabledState((v) => !v);
              }}
              style={{
                background: 'none',
                border: `0.5px solid ${voiceEnabled ? config.color + '50' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '5px',
                padding: '2px 5px',
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)',
                fontSize: '8px',
                color: voiceEnabled ? config.color : 'var(--text-3)',
                transition: 'all 0.2s',
              }}
            >
              {voiceEnabled ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPersona((p) => !p);
              }}
              style={{
                background: 'none',
                border: `0.5px solid ${config.color}40`,
                borderRadius: '5px',
                padding: '2px 6px',
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)',
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
