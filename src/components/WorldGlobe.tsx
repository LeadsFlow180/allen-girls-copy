"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Html,
  Float,
  MeshDistortMaterial,
  Sphere,
  Stars,
  Cloud,
  Torus,
  Cone,
  Cylinder,
  RoundedBox,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CadetIntroOverlay } from "@/components/cadet/cadet-intro-overlay";
import { worlds as worldsFromLib } from "@/lib/worlds";
import {
  loadCadetProgress,
  markCadetAssessmentComplete,
  placementNextPathForWorld,
  resolveWorldEntryAction,
  setPendingWorldSlug,
} from "@/lib/onboarding/cadet-progress";
import { loadPlacementResult } from "@/lib/placement-storage";

/* ─── GPU shaders ─── */
const ICON_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/* Single-texture: replaces near-black pixels with bgColor */
const ICON_FRAG = `
  uniform sampler2D map;
  uniform vec3 bgColor;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(map, vUv);
    float brightness = max(c.r, max(c.g, c.b));
    gl_FragColor = brightness < 0.15 ? vec4(bgColor, 1.0) : c;
  }
`;


/** Single sphere: near-black pixels are painted with bgColor, coloured pixels show the icon.
 *  Spins slowly on its Y axis like a planet so the icon rotates into view. */
function IconGlobeMesh({ texture, bgColor, size }: { texture: THREE.Texture; bgColor: string; size: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const bgVec = useMemo(() => {
    const c = new THREE.Color(bgColor);
    return new THREE.Vector3(c.r, c.g, c.b);
  }, [bgColor]);
  const uniforms = useMemo(
    () => ({ map: { value: texture }, bgColor: { value: bgVec } }),
    [texture, bgVec],
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    // Slow planet-like spin — one full rotation roughly every 12 seconds
    meshRef.current.rotation.y += delta * 0.52;
  });

  return (
    <mesh ref={meshRef} position={[0, -size * 0.1, 0]}>
      <sphereGeometry args={[size * 0.75, 48, 48]} />
      <shaderMaterial uniforms={uniforms} vertexShader={ICON_VERT} fragmentShader={ICON_FRAG} />
    </mesh>
  );
}

interface WorldData {
  title: string;
  subtitle: string;
  emoji: string;
  desc: string;
  themes: string;
  color: string;
  emissive: string;
  accent: string;
  position: [number, number, number];
  baseSize: number;
  slug: string;
}

const worlds: WorldData[] = [
  {
    title: "The Lost City of Aqua Azul",
    subtitle: "Underwater / Ocean Adventure",
    emoji: "🌊",
    desc: "Beneath the shimmering waves lies a glowing underwater city filled with coral towers, ancient sea secrets, and mysterious currents. Explore shipwrecks, decode ocean riddles, and dive deep into science missions hidden among the reefs.",
    themes: "Ocean science, marine biology, problem-solving, exploration",
    color: "#0EA5E9",
    emissive: "#0369A1",
    accent: "#22D3EE",
    position: [-5.5, -1.2, 2],
    baseSize: 1,
    slug: "aqua-azul",
  },
  {
    title: "Around The Way",
    subtitle: "Neighborhood Exploration",
    emoji: "🏠",
    desc: "Right outside your front door is a world of discovery. Ride bikes, explore backyards, build lemonade stands, and investigate everyday mysteries hiding in plain sight. Sometimes the biggest adventures happen closest to home.",
    themes: "Real-life math, community, measurement, observation, social skills",
    color: "#F97316",
    emissive: "#C2410C",
    accent: "#FBBF24",
    position: [-2.5, -0.6, 4],
    baseSize: 0.9,
    slug: "around-the-way",
  },
  {
    title: "Nova Star Command",
    subtitle: "Space Galaxy HQ",
    emoji: "🚀",
    desc: "High above the islands floats the heart of every mission. From here, new adventures launch across land, sea, and sky. Track your progress in the Nova Core, receive mission briefings, and power up your skills.",
    themes: "Progress tracking, mission launch hub, goal setting",
    color: "#A855F7",
    emissive: "#7C3AED",
    accent: "#E9D5FF",
    position: [0, 4.5, 0],
    baseSize: 1.3,
    slug: "nova-star-command",
  },
  {
    title: "Legends of Long Ago",
    subtitle: "Ancient Civilizations",
    emoji: "🏛",
    desc: "Step into ancient cities where pyramids rise, temples whisper stories, and forgotten civilizations await discovery. Decode symbols, rebuild crumbling monuments, and unlock the knowledge of the past.",
    themes: "History, culture, geography, reading comprehension",
    color: "#EAB308",
    emissive: "#A16207",
    accent: "#FDE68A",
    position: [3, -0.8, 3.5],
    baseSize: 1,
    slug: "legends-long-ago",
  },
  {
    title: "Fossil Frontier",
    subtitle: "Prehistoric Dinosaurs",
    emoji: "🦴",
    desc: "Travel back to a time when giant creatures roamed the land. Excavate fossils, measure dinosaur tracks, and piece together clues from Earth's earliest days. Every discovery brings you closer to prehistoric secrets.",
    themes: "Earth science, measurement, classification, inference",
    color: "#84CC16",
    emissive: "#4D7C0F",
    accent: "#BEF264",
    position: [5.5, -1, 1],
    baseSize: 1.05,
    slug: "fossil-frontier",
  },
  {
    title: "Futuria World",
    subtitle: "Innovation & Tomorrow",
    emoji: "🏙",
    desc: "Welcome to the city of tomorrow. Sky bridges stretch above glowing streets, inventions power entire districts, and big ideas shape the future. Build, calculate, experiment, and imagine what comes next.",
    themes: "Engineering thinking, logic, advanced math, innovation",
    color: "#EC4899",
    emissive: "#BE185D",
    accent: "#F9A8D4",
    position: [4, 1, -2.5],
    baseSize: 0.95,
    slug: "futuria-world",
  },
  {
    title: "The Crystal Tundra",
    subtitle: "Arctic Aurora",
    emoji: "❄️",
    desc: "In the frozen north, glowing crystal spires rise from snow-covered plains beneath dancing auroras. Solve icy challenges, navigate frozen terrain, and uncover hidden energy within the tundra's sparkling landscape.",
    themes: "Climate science, fractions, problem-solving under pressure",
    color: "#06B6D4",
    emissive: "#0E7490",
    accent: "#A5F3FC",
    position: [-4, 1.5, -2],
    baseSize: 0.9,
    slug: "crystal-tundra",
  },
  {
    title: "The Great Jade Jungle",
    subtitle: "Rainforest Adventure",
    emoji: "🌿",
    desc: "Deep within the emerald canopy, rope bridges sway, rivers twist, and ancient ruins hide among towering trees. Decode jungle mysteries, measure river crossings, and study vibrant life beneath the leaves.",
    themes: "Ecology, biodiversity, data interpretation, critical thinking",
    color: "#10B981",
    emissive: "#047857",
    accent: "#6EE7B7",
    position: [-1, -1.5, -3.5],
    baseSize: 1.1,
    slug: "great-jade-jungle",
  },
  {
    title: "Kingdom of the Wild",
    subtitle: "Global Animal Biomes",
    emoji: "🦁",
    desc: "From savannas to forests, deserts to wetlands, the animal world is alive with motion. Track habitats, classify species, and protect ecosystems while exploring the interconnected balance of life.",
    themes: "Animal science, ecosystems, categorization, comparison",
    color: "#D97706",
    emissive: "#92400E",
    accent: "#FCD34D",
    position: [1.5, -1.8, 1],
    baseSize: 1,
    slug: "kingdom-wild",
  },
];

/* ─── Island sub-components ─── */

function AquaIslandTexture({ size }: { size: number }) {
  const texture = useTexture("/aqua-azul-icon-v2.png");

  return (
    <group>
      <IconGlobeMesh texture={texture} bgColor="#71D9E2" size={size} />

      {/* Soft cyan glow ring below */}
      <Torus
        args={[size * 0.82, size * 0.022, 8, 48]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, -size * 0.55, 0]}
      >
        <meshStandardMaterial
          color="#22D3EE"
          emissive="#0EA5E9"
          emissiveIntensity={1.4}
          transparent
          opacity={0.65}
        />
      </Torus>

      {/* Floating bubbles */}
      {[0.55, -0.55, 0].map((x, i) => (
        <Float key={i} speed={2 + i} floatIntensity={0.5}>
          <Sphere
            args={[size * 0.045, 8, 8]}
            position={[x * size, size * (0.7 + i * 0.15), 0]}
          >
            <meshStandardMaterial color="#A5F3FC" transparent opacity={0.55} />
          </Sphere>
        </Float>
      ))}
    </group>
  );
}

function AquaIsland({ size }: { size: number }) {
  return (
    <React.Suspense
      fallback={
        <Sphere args={[size * 0.75, 16, 16]} position={[0, -size * 0.1, 0]}>
          <meshStandardMaterial color="#0EA5E9" emissive="#0369A1" emissiveIntensity={0.4} />
        </Sphere>
      }
    >
      <AquaIslandTexture size={size} />
    </React.Suspense>
  );
}

function NeighborhoodIsland({ size }: { size: number }) {
  return (
    <group>
      <Sphere args={[size * 0.65, 16, 12]} position={[0, -size * 0.1, 0]}>
        <MeshDistortMaterial color="#ef4444" emissive="#b91c1c" emissiveIntensity={0.3} roughness={0.8} distort={0.2} speed={1} />
      </Sphere>
      {[[-0.25, 0.35, 0], [0.2, 0.3, 0.15]].map((p, i) => (
        <group key={i} position={[p[0] * size, p[1] * size, p[2] * size]}>
          <RoundedBox args={[size * 0.18, size * 0.15, size * 0.15]} radius={0.02}>
            <meshStandardMaterial color={i ? "#FBBF24" : "#F97316"} />
          </RoundedBox>
          <Cone args={[size * 0.13, size * 0.1, 4]} position={[0, size * 0.12, 0]} rotation={[0, Math.PI / 4, 0]}>
            <meshStandardMaterial color="#DC2626" />
          </Cone>
        </group>
      ))}
      <group position={[0, size * 0.35, -0.15 * size]}>
        <Cylinder args={[size * 0.025, size * 0.035, size * 0.15, 6]}>
          <meshStandardMaterial color="#92400E" />
        </Cylinder>
        <Sphere args={[size * 0.1, 8, 8]} position={[0, size * 0.1, 0]}>
          <meshStandardMaterial color="#16A34A" />
        </Sphere>
      </group>
    </group>
  );
}

function NovaIsland({ size }: { size: number }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ringRef.current) ringRef.current.rotation.z = s.clock.elapsedTime * 0.5;
    if (innerRef.current) innerRef.current.rotation.y = s.clock.elapsedTime * 0.3;
  });
  return (
    <group>
      <Sphere args={[size * 0.5, 32, 32]}>
        <meshStandardMaterial color="#A855F7" emissive="#7C3AED" emissiveIntensity={0.5} metalness={0.4} roughness={0.2} />
      </Sphere>
      <Sphere args={[size * 0.55, 16, 16]}>
        <meshStandardMaterial color="#E9D5FF" transparent opacity={0.15} side={THREE.DoubleSide} />
      </Sphere>
      <Torus ref={ringRef} args={[size * 0.8, size * 0.03, 8, 32]}>
        <meshStandardMaterial color="#C084FC" emissive="#A855F7" emissiveIntensity={0.6} />
      </Torus>
      <Torus ref={innerRef} args={[size * 0.65, size * 0.02, 8, 32]} rotation={[Math.PI / 3, 0, 0]}>
        <meshStandardMaterial color="#F0ABFC" emissive="#D946EF" emissiveIntensity={0.4} />
      </Torus>
      <Cylinder args={[size * 0.015, size * 0.015, size * 0.35, 4]} position={[0, size * 0.6, 0]}>
        <meshStandardMaterial color="#E9D5FF" />
      </Cylinder>
      <Sphere args={[size * 0.04, 8, 8]} position={[0, size * 0.8, 0]}>
        <meshStandardMaterial color="#F0ABFC" emissive="#E879F9" emissiveIntensity={1} />
      </Sphere>
    </group>
  );
}

function AncientIsland({ size }: { size: number }) {
  return (
    <group>
      <Sphere args={[size * 0.65, 16, 12]} position={[0, -size * 0.12, 0]}>
        <MeshDistortMaterial color="#EAB308" emissive="#A16207" emissiveIntensity={0.2} roughness={0.9} distort={0.15} speed={0.5} />
      </Sphere>
      <Cone args={[size * 0.3, size * 0.45, 4]} position={[0, size * 0.35, 0]} rotation={[0, Math.PI / 4, 0]}>
        <meshStandardMaterial color="#FBBF24" emissive="#F59E0B" emissiveIntensity={0.15} />
      </Cone>
      <Cylinder args={[size * 0.04, size * 0.04, size * 0.3, 6]} position={[-0.3 * size, size * 0.25, 0.15 * size]}>
        <meshStandardMaterial color="#FDE68A" />
      </Cylinder>
      <Cone args={[size * 0.15, size * 0.25, 4]} position={[0.25 * size, size * 0.2, -0.1 * size]} rotation={[0, Math.PI / 6, 0]}>
        <meshStandardMaterial color="#FCD34D" emissive="#EAB308" emissiveIntensity={0.1} />
      </Cone>
    </group>
  );
}

function FossilIslandTexture({ size }: { size: number }) {
  const texture = useTexture("/fossil-frontier-icon.png");

  return (
    <group>
      <IconGlobeMesh texture={texture} bgColor="#1a1205" size={size} />

      {/* Amber glow ring underneath */}
      <Torus
        args={[size * 0.82, size * 0.022, 8, 48]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, -size * 0.55, 0]}
      >
        <meshStandardMaterial
          color="#BEF264"
          emissive="#84CC16"
          emissiveIntensity={1.4}
          transparent
          opacity={0.65}
        />
      </Torus>

      {/* Floating fossil dust particles */}
      {[0.55, -0.55, 0].map((x, i) => (
        <Float key={i} speed={1.5 + i} floatIntensity={0.4}>
          <Sphere
            args={[size * 0.04, 8, 8]}
            position={[x * size, size * (0.65 + i * 0.15), 0]}
          >
            <meshStandardMaterial color="#FDE68A" transparent opacity={0.5} />
          </Sphere>
        </Float>
      ))}
    </group>
  );
}

function FossilIsland({ size }: { size: number }) {
  return (
    <React.Suspense
      fallback={
        <Sphere args={[size * 0.75, 16, 16]} position={[0, -size * 0.1, 0]}>
          <meshStandardMaterial color="#84CC16" emissive="#4D7C0F" emissiveIntensity={0.4} />
        </Sphere>
      }
    >
      <FossilIslandTexture size={size} />
    </React.Suspense>
  );
}

function FuturiaIsland({ size }: { size: number }) {
  const glowRef = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (glowRef.current) {
      glowRef.current.position.y = size * 0.5 + Math.sin(s.clock.elapsedTime * 2) * size * 0.03;
    }
  });
  return (
    <group>
      <Cylinder args={[size * 0.6, size * 0.65, size * 0.2, 6]} position={[0, -size * 0.05, 0]}>
        <meshStandardMaterial color="#EC4899" emissive="#BE185D" emissiveIntensity={0.3} metalness={0.5} roughness={0.2} />
      </Cylinder>
      {[[-0.15, 0, 0.1], [0.2, 0, -0.1], [0, 0, -0.15]].map((p, i) => (
        <RoundedBox key={i} args={[size * 0.1, size * (0.35 + i * 0.08), size * 0.1]} radius={0.02} position={[p[0] * size, size * (0.25 + i * 0.04), p[2] * size]}>
          <meshStandardMaterial color={["#F9A8D4", "#FBCFE8", "#F472B6"][i]} emissive="#EC4899" emissiveIntensity={0.15} metalness={0.3} />
        </RoundedBox>
      ))}
      <Sphere ref={glowRef} args={[size * 0.06, 12, 12]} position={[0, size * 0.5, 0]}>
        <meshStandardMaterial color="#F9A8D4" emissive="#EC4899" emissiveIntensity={1.5} />
      </Sphere>
    </group>
  );
}

function CrystalTundraIslandTexture({ size }: { size: number }) {
  const texture = useTexture("/crystal-tundra-icon.png");

  return (
    <group>
      <IconGlobeMesh texture={texture} bgColor="#ffffff" size={size} />

      <Torus
        args={[size * 0.82, size * 0.022, 8, 48]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, -size * 0.55, 0]}
      >
        <meshStandardMaterial
          color="#A5F3FC"
          emissive="#06B6D4"
          emissiveIntensity={1.4}
          transparent
          opacity={0.65}
        />
      </Torus>

      {[0.55, -0.55, 0].map((x, i) => (
        <Float key={i} speed={2 + i} floatIntensity={0.5}>
          <Sphere
            args={[size * 0.04, 8, 8]}
            position={[x * size, size * (0.7 + i * 0.15), 0]}
          >
            <meshStandardMaterial color="#A5F3FC" transparent opacity={0.55} />
          </Sphere>
        </Float>
      ))}
    </group>
  );
}

function CrystalTundraIsland({ size }: { size: number }) {
  return (
    <React.Suspense
      fallback={
        <Sphere args={[size * 0.75, 16, 16]} position={[0, -size * 0.1, 0]}>
          <meshStandardMaterial color="#06B6D4" emissive="#0E7490" emissiveIntensity={0.4} />
        </Sphere>
      }
    >
      <CrystalTundraIslandTexture size={size} />
    </React.Suspense>
  );
}

function TundraIsland({ size }: { size: number }) {
  return (
    <group>
      <Sphere args={[size * 0.6, 16, 12]} position={[0, -size * 0.1, 0]}>
        <MeshDistortMaterial color="#67E8F9" emissive="#0E7490" emissiveIntensity={0.2} roughness={0.3} metalness={0.1} distort={0.15} speed={0.8} transparent opacity={0.9} />
      </Sphere>
      {[[0, 0.5, 0], [-0.2, 0.35, 0.15], [0.2, 0.38, -0.12]].map((p, i) => (
        <Cone key={i} args={[size * (0.06 - i * 0.01), size * (0.3 + i * 0.05), 5]} position={[p[0] * size, p[1] * size, p[2] * size]}>
          <meshStandardMaterial color="#A5F3FC" emissive="#22D3EE" emissiveIntensity={0.4} transparent opacity={0.8} metalness={0.3} roughness={0.1} />
        </Cone>
      ))}
      <Sphere args={[size * 0.35, 12, 8]} position={[0, size * 0.15, 0]}>
        <meshStandardMaterial color="#F0F9FF" emissive="#E0F2FE" emissiveIntensity={0.1} />
      </Sphere>
    </group>
  );
}

function JungleIsland({ size }: { size: number }) {
  return (
    <group>
      <Sphere args={[size * 0.7, 16, 12]} position={[0, -size * 0.12, 0]}>
        <MeshDistortMaterial color="#10B981" emissive="#047857" emissiveIntensity={0.2} roughness={0.85} distort={0.25} speed={0.6} />
      </Sphere>
      {[[0, 0.55, 0], [-0.25, 0.4, 0.15], [0.2, 0.42, -0.15]].map((p, i) => (
        <group key={i} position={[p[0] * size, p[1] * size, p[2] * size]}>
          <Cylinder args={[size * 0.02, size * 0.03, size * 0.2, 4]}>
            <meshStandardMaterial color="#713F12" />
          </Cylinder>
          <Sphere args={[size * (0.14 - i * 0.02), 8, 8]} position={[0, size * 0.12, 0]}>
            <meshStandardMaterial color={["#059669", "#10B981", "#34D399"][i]} />
          </Sphere>
        </group>
      ))}
      <Cylinder args={[size * 0.008, size * 0.008, size * 0.25, 3]} position={[-0.15 * size, size * 0.35, 0.1 * size]} rotation={[0.2, 0, 0.15]}>
        <meshStandardMaterial color="#6EE7B7" />
      </Cylinder>
    </group>
  );
}

function WildIsland({ size }: { size: number }) {
  return (
    <group>
      <Sphere args={[size * 0.65, 16, 12]} position={[0, -size * 0.12, 0]}>
        <MeshDistortMaterial color="#D97706" emissive="#92400E" emissiveIntensity={0.2} roughness={0.9} distort={0.18} speed={0.4} />
      </Sphere>
      <Sphere args={[size * 0.45, 12, 8]} position={[0, size * 0.1, 0]}>
        <meshStandardMaterial color="#65A30D" roughness={0.95} />
      </Sphere>
      <group position={[0.1 * size, size * 0.3, 0]}>
        <Cylinder args={[size * 0.02, size * 0.03, size * 0.25, 5]}>
          <meshStandardMaterial color="#78350F" />
        </Cylinder>
        <Cylinder args={[size * 0.15, size * 0.02, size * 0.04, 8]} position={[0, size * 0.14, 0]}>
          <meshStandardMaterial color="#4D7C0F" />
        </Cylinder>
      </group>
      <Sphere args={[size * 0.08, 6, 5]} position={[-0.25 * size, size * 0.12, 0.15 * size]}>
        <meshStandardMaterial color="#A8A29E" roughness={0.95} />
      </Sphere>
    </group>
  );
}

const IslandMesh = ({ world }: { world: WorldData }) => {
  const meshMap: Record<string, (props: { size: number }) => JSX.Element> = {
    "The Lost City of Aqua Azul": AquaIsland,
    "Around The Way": NeighborhoodIsland,
    "Nova Star Command": NovaIsland,
    "Legends of Long Ago": AncientIsland,
    "Fossil Frontier": FossilIsland,
    "Futuria World": FuturiaIsland,
    "The Crystal Tundra": CrystalTundraIsland,
    "The Great Jade Jungle": JungleIsland,
    "Kingdom of the Wild": WildIsland,
  };
  const Comp = meshMap[world.title];
  return Comp ? <Comp size={world.baseSize} /> : null;
};

function WorldIsland({
  world,
  onSelect,
  isSelected,
  onHover,
  onActivate,
}: {
  world: WorldData;
  onSelect: (w: WorldData | null) => void;
  isSelected: boolean;
  onHover: (w: WorldData | null) => void;
  onActivate: (w: WorldData) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const active = hovered || isSelected;

  useFrame((state) => {
    if (groupRef.current) {
      const base = world.position[1];
      groupRef.current.position.y = base + Math.sin(state.clock.elapsedTime * 0.6 + world.position[0] * 0.5) * 0.15;
      const target = active ? 1.1 : 1;
      groupRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.08);
    }
  });

  return (
    <group
      ref={groupRef}
      position={world.position}
      onClick={(e) => { e.stopPropagation(); onSelect(world); onActivate(world); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(world); onSelect(world); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); onHover(null); onSelect(null); document.body.style.cursor = "auto"; }}
    >
      <IslandMesh world={world} />

      {active && (
        <Torus args={[world.baseSize * 0.85, 0.02, 8, 32]} position={[0, -world.baseSize * 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color={world.accent} emissive={world.color} emissiveIntensity={1} transparent opacity={0.6} />
        </Torus>
      )}

      <Html
        position={[0, world.baseSize * 0.85, 0]}
        center
        distanceFactor={10}
        style={{ pointerEvents: "auto", userSelect: "none" }}
      >
        <div
          role="link"
          tabIndex={0}
          className={`font-nunito text-center whitespace-nowrap transition-all duration-300 cursor-pointer ${active ? "scale-125 -translate-y-1" : "scale-100"}`}
          onClick={(e) => { e.stopPropagation(); onSelect(world); onActivate(world); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(world); onActivate(world); } }}
        >
          <div
            className="px-2 py-0.5 rounded-full shadow-lg backdrop-blur-sm"
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.02em",
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
              background: active
                ? `linear-gradient(135deg, ${world.color}, ${world.emissive})`
                : `${world.color}99`,
              color: "white",
              textShadow: "0 1px 2px rgba(0,0,0,0.35)",
              border: active ? `1px solid ${world.accent}88` : "1px solid transparent",
            }}
          >
            {world.emoji} {world.title.length > 18 ? world.title.split(" ").slice(0, 3).join(" ") + "…" : world.title}
          </div>
        </div>
      </Html>
    </group>
  );
};

function SceneClouds() {
  return (
    <>
      {[[-6, 2, -5], [7, 1.5, -4], [-3, 3, -6], [5, 3.5, -3], [0, -3, -5]].map((p, i) => (
        <Cloud
          key={i}
          position={p as [number, number, number]}
          opacity={0.15 + i * 0.02}
          speed={0.15}
          segments={6}
          color="#E9D5FF"
        />
      ))}
    </>
  );
}

function OceanPlane() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1 + Math.sin(s.clock.elapsedTime * 0.5) * 0.05;
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.5, 0]}>
      <planeGeometry args={[40, 40, 32, 32]} />
      <meshStandardMaterial color="#1E3A5F" emissive="#0EA5E9" emissiveIntensity={0.1} transparent opacity={0.3} metalness={0.3} roughness={0.4} />
    </mesh>
  );
}

function Scene({
  onSelect,
  selected,
  onHover,
  onActivate,
  showWorlds,
}: {
  onSelect: (w: WorldData | null) => void;
  selected: WorldData | null;
  onHover: (w: WorldData | null) => void;
  onActivate: (w: WorldData) => void;
  showWorlds: boolean;
}) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 12, 6]} intensity={1.2} color="#FFF7ED" castShadow />
      <pointLight position={[-8, 6, -4]} intensity={0.6} color="#C4B5FD" />
      <pointLight position={[0, -4, 8]} intensity={0.3} color="#67E8F9" />
      <hemisphereLight args={["#A78BFA", "#1E3A5F", 0.4]} />

      <Stars radius={80} depth={60} count={5000} factor={4} saturation={0.8} fade speed={0.4} />
      <SceneClouds />
      <OceanPlane />

      {showWorlds &&
        worlds.map((w) => (
          <WorldIsland
            key={w.title}
            world={w}
            onSelect={onSelect}
            isSelected={selected?.title === w.title}
            onHover={onHover}
            onActivate={onActivate}
          />
        ))}

      <OrbitControls
        enableZoom
        enablePan={false}
        minDistance={6}
        maxDistance={18}
        autoRotate
        autoRotateSpeed={0.2}
        maxPolarAngle={Math.PI * 0.75}
        minPolarAngle={Math.PI * 0.2}
      />
    </>
  );
}

// ── World video map — derived from lib/worlds so detail pages and globe stay in sync ──
const worldVideos: Record<string, { vimeoId: string; title: string }> = Object.fromEntries(
  worldsFromLib
    .filter((w) => w.vimeoId)
    .map((w) => [w.slug, { vimeoId: w.vimeoId!, title: w.name }])
);

type WorldGlobeProps = {
  showWorlds?: boolean;
  onShowWorldsChange?: (show: boolean) => void;
};

export default function WorldGlobe({ showWorlds: showWorldsProp, onShowWorldsChange }: WorldGlobeProps = {}) {
  const router = useRouter();
  const [selected, setSelected] = useState<WorldData | null>(null);
  const [hovered, setHovered] = useState<WorldData | null>(null);
  const [introWorldSlug, setIntroWorldSlug] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showWorldsInternal, setShowWorldsInternal] = useState(true);
  const isControlled = showWorldsProp !== undefined && onShowWorldsChange !== undefined;
  const showWorlds = isControlled ? showWorldsProp : showWorldsInternal;
  const setShowWorlds = isControlled
    ? (updater: boolean | ((prev: boolean) => boolean)) => {
        const next = typeof updater === "function" ? updater(showWorlds) : updater;
        onShowWorldsChange(next);
      }
    : setShowWorldsInternal;

  // If they already finished placement before this gate existed, stamp the checkmark.
  useEffect(() => {
    const existing = loadPlacementResult();
    const progress = loadCadetProgress();
    if (existing && !progress.assessmentComplete) {
      markCadetAssessmentComplete();
    }
  }, []);

  const activateWorld = useCallback(
    (world: WorldData) => {
      const action = resolveWorldEntryAction(world.slug);
      setPendingWorldSlug(world.slug);

      if (action.kind === "play_intro") {
        setIntroWorldSlug(world.slug);
        return;
      }
      if (action.kind === "go_assessment") {
        router.push(placementNextPathForWorld(world.slug));
        return;
      }
      router.push(`/worlds/${world.slug}`);
    },
    [router],
  );

  // Refs to each video iframe so we can send postMessage commands
  const videoRefs = useRef<Record<string, HTMLIFrameElement | null>>({});

  // The active slug — hovered takes priority, then clicked/selected
  const activeSlug = hovered?.slug ?? selected?.slug ?? null;
  const isVideoPlaying = !!(activeSlug && worldVideos[activeSlug]);

  // Send a command to a specific Vimeo iframe via postMessage
  const vimeoCmd = useCallback((slug: string, method: string, value?: unknown) => {
    const iframe = videoRefs.current[slug];
    if (!iframe?.contentWindow) return;
    const msg: Record<string, unknown> = { method };
    if (value !== undefined) msg.value = value;
    iframe.contentWindow.postMessage(JSON.stringify(msg), "*");
  }, []);

  // When switching to map-only, close the detail panel
  useEffect(() => {
    if (!showWorlds) setSelected(null);
  }, [showWorlds]);

  // When active world changes: play+unmute the active one, pause+mute all others.
  // Sound only turns on after the kid taps once (browsers block audio until a gesture).
  useEffect(() => {
    const activeVolume = soundEnabled ? 1 : 0;
    Object.keys(worldVideos).forEach((slug) => {
      const isActive = slug === activeSlug;
      if (isActive) {
        vimeoCmd(slug, "setVolume", activeVolume);
        vimeoCmd(slug, "play");
      } else {
        vimeoCmd(slug, "setVolume", 0);
        vimeoCmd(slug, "pause");
      }
      // Retry after 300ms in case Vimeo player wasn't ready yet on first hover
      setTimeout(() => {
        if (isActive) {
          vimeoCmd(slug, "setVolume", activeVolume);
          vimeoCmd(slug, "play");
        } else {
          vimeoCmd(slug, "setVolume", 0);
          vimeoCmd(slug, "pause");
        }
      }, 300);
    });
  }, [activeSlug, soundEnabled, vimeoCmd]);

  // Kid taps "turn on sound" → satisfies the browser gesture, unmutes the active preview.
  const enableSound = useCallback(() => {
    setSoundEnabled(true);
    if (activeSlug) {
      vimeoCmd(activeSlug, "setVolume", 1);
      vimeoCmd(activeSlug, "play");
    }
  }, [activeSlug, vimeoCmd]);

  return (
    <div
      className="relative w-full"
      style={{
        height: "95vh",
        minHeight: 720,
        borderRadius: "1.5rem",
        overflow: "hidden",
        backgroundImage: "url('/worlds-map.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >

      {/* ── Map tint overlay — only when globes/worlds are visible; hidden in map-only for a clear map ── */}
      {showWorlds && (
        <div
          style={{
            position: "absolute", inset: 0, zIndex: 0,
            background: "linear-gradient(to bottom, rgba(10,5,30,0.65) 0%, rgba(10,5,30,0.52) 50%, rgba(10,5,30,0.68) 100%)",
            pointerEvents: "none",
            opacity: isVideoPlaying ? 0 : activeSlug === "crystal-tundra" || activeSlug === "aqua-azul" ? 0 : 1,
            transition: "opacity 0.6s ease",
          }}
        />
      )}

      {/* ── Per-world globe background: white for Crystal Tundra, Aquamarine for Aqua Azul ── */}
      {showWorlds && (activeSlug === "crystal-tundra" || activeSlug === "aqua-azul") && (
        <div
          style={{
            position: "absolute", inset: 0, zIndex: 0,
            background: activeSlug === "crystal-tundra" ? "#ffffff" : "#71D9E2",
            pointerEvents: "none",
            opacity: 0.92,
            transition: "opacity 0.5s ease, background 0.5s ease",
          }}
        />
      )}

      {/* ── Video backdrops — only when worlds visible; hidden in map-only ── */}
      {showWorlds &&
        Object.entries(worldVideos).map(([slug, video]) => {
          const active = slug === activeSlug;
          return (
            <div
              key={slug}
              style={{
                position: "absolute", inset: 0, zIndex: 0,
                overflow: "hidden",
                opacity: active ? 1 : 0,
                transition: "opacity 0.5s ease",
                pointerEvents: "none",
              }}
            >
              <iframe
                ref={(el) => { videoRefs.current[slug] = el; }}
                src={`https://player.vimeo.com/video/${video.vimeoId}?badge=0&autopause=0&byline=0&portrait=0&title=0&autoplay=1&loop=1&controls=0&muted=1`}
                allow="autoplay; fullscreen; picture-in-picture"
                style={{
                  position: "absolute",
                  top: "50%", left: "50%",
                  width: "177.78%", height: "100%",
                  minWidth: "100%", minHeight: "56.25vw",
                  transform: "translate(-50%, -50%)",
                  border: "none",
                }}
                title={video.title}
              />
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,20,50,0.45)" }} />
            </div>
          );
        })}

      {/* ── 3D Canvas (stars, clouds, ocean, globes) — only when worlds visible; map-only shows just the map image ── */}
      {showWorlds && (
        <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
          <Canvas
            camera={{ position: [0, 4, 12], fov: 45 }}
            dpr={[1, 2]}
            gl={{ alpha: true }}
            style={{ background: "transparent" }}
          >
            <Scene
              onSelect={setSelected}
              selected={selected}
              onHover={setHovered}
              onActivate={activateWorld}
              showWorlds={showWorlds}
            />
          </Canvas>
        </div>
      )}

      {/* Detail panel — only when worlds visible; not rendered in map-only */}
      {showWorlds && (
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg transition-all duration-500 ${
          selected ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        style={{ zIndex: 2 }}
      >
        {selected && (
          <div
            className="rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden"
            style={{
              background: "rgba(8, 4, 28, 0.92)",
              border: `2px solid ${selected.color}`,
              boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px ${selected.color}55`,
            }}
          >
            {/* Coloured top accent bar */}
            <div style={{ height: 4, background: `linear-gradient(90deg, ${selected.color}, ${selected.emissive})` }} />

            <div className="p-5">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 text-white/60 hover:text-white text-sm font-nunito w-7 h-7 flex items-center justify-center rounded-full transition-colors"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                ✕
              </button>
              <div className="flex items-start gap-3">
                {selected.slug === "aqua-azul" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src="/aqua-azul-icon-v2.png"
                    alt="Aqua Azul"
                    style={{ width: 56, height: 56, borderRadius: "0.75rem", objectFit: "cover", flexShrink: 0, boxShadow: `0 4px 16px ${selected.color}99` }}
                  />
                ) : selected.slug === "crystal-tundra" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src="/crystal-tundra-icon.png"
                    alt="The Crystal Tundra"
                    style={{ width: 56, height: 56, borderRadius: "0.75rem", objectFit: "cover", flexShrink: 0, boxShadow: `0 4px 16px ${selected.color}99` }}
                  />
                ) : (
                  <div
                    className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${selected.color}, ${selected.emissive})` }}
                  >
                    {selected.emoji}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-fredoka text-lg font-bold leading-tight" style={{ color: "#ffffff" }}>{selected.title}</h3>
                  <p className="text-xs font-nunito font-semibold mb-2" style={{ color: selected.color }}>{selected.subtitle}</p>
                  <p className="text-lg font-nunito leading-relaxed mb-2" style={{ color: "rgba(255,255,255,0.88)" }}>{selected.desc}</p>
                  <p className="text-xs font-nunito mb-3">
                    <span className="font-bold" style={{ color: "rgba(255,255,255,0.55)" }}>Themes: </span>
                    <span style={{ color: "rgba(255,255,255,0.75)" }}>{selected.themes}</span>
                  </p>
                  <Button
                    type="button"
                    onClick={() => activateWorld(selected)}
                    className="font-fredoka rounded-full w-full sm:w-auto"
                    style={{ background: `linear-gradient(90deg, ${selected.color}, ${selected.emissive})`, color: "#fff", border: "none", fontWeight: 700, letterSpacing: "0.02em" }}
                  >
                    Enter this world →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Bottom hint overlay — only when globes/worlds are visible; never in map-only mode */}
      {showWorlds === true ? (
        <div
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 transition-all duration-500 ${selected ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          style={{ zIndex: 2 }}
        >
          <p
            className="text-sm font-nunito text-center px-5 py-2 rounded-full shadow-sm"
            style={{ color: "rgba(255,255,255,0.75)", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            Click a world to begin · First time: intro video → Signal Clarity Scan
          </p>
        </div>
      ) : null}

      {/* Kid-friendly one-tap sound enabler (top-center) — hides after first tap */}
      {showWorlds && !soundEnabled ? (
        <div
          style={{
            position: "absolute",
            top: "1rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 3,
          }}
        >
          <button
            type="button"
            onClick={enableSound}
            className="font-fredoka"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 1.2rem",
              borderRadius: "999px",
              border: "2px solid rgba(255,255,255,0.35)",
              background: "linear-gradient(135deg, #7c22c5, #e8357a)",
              color: "#fff",
              fontSize: "1rem",
              cursor: "pointer",
              boxShadow: "0 6px 22px rgba(124,34,197,0.5)",
              animation: "agaSoundPulse 1.8s ease-in-out infinite",
            }}
          >
            🔊 Tap to turn on sound
          </button>
          <style>{`
            @keyframes agaSoundPulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.06); }
            }
          `}</style>
        </div>
      ) : null}

      {introWorldSlug ? (
        <CadetIntroOverlay
          worldSlug={introWorldSlug}
          onClose={() => setIntroWorldSlug(null)}
        />
      ) : null}
    </div>
  );
}
