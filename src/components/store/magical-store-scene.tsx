"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";

type Props = {
  scrollProgress: number;
};

const ORB_COLORS = ["#c4b5fd", "#93c5fd", "#fcd34d", "#f9a8d4"];

function AmbientOrb({
  position,
  color,
  scale,
}: {
  position: [number, number, number];
  color: string;
  scale: number;
}) {
  return (
    <Float speed={0.8} rotationIntensity={0.15} floatIntensity={0.35}>
      <mesh position={position} scale={scale}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.22}
          transparent
          opacity={0.28}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>
    </Float>
  );
}

function OrbField({ scrollProgress }: { scrollProgress: number }) {
  const orbs = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        position: [
          (i - 4) * 2.2,
          -0.8 + (i % 3) * 0.25,
          -4.5 - (i % 4) * 0.4,
        ] as [number, number, number],
        color: ORB_COLORS[i % ORB_COLORS.length],
        scale: 0.7 + (i % 2) * 0.2,
      })),
    [],
  );

  return (
    <group position={[-scrollProgress * 3.5, 0, 0]}>
      {orbs.map((o, i) => (
        <AmbientOrb key={i} {...o} />
      ))}
    </group>
  );
}

function ParallaxRig({ scrollProgress }: { scrollProgress: number }) {
  useFrame((state) => {
    const targetX = scrollProgress * 2.4 - 1.2;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.04);
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      0.85 + Math.sin(state.clock.elapsedTime * 0.15) * 0.04,
      0.04,
    );
    state.camera.lookAt(targetX * 0.25, -0.15, 0);
  });
  return null;
}

function SceneContents({ scrollProgress }: { scrollProgress: number }) {
  return (
    <>
      <fog attach="fog" args={["#0a0f1e", 6, 18]} />
      <ambientLight intensity={0.28} />
      <directionalLight position={[3, 4, 2]} intensity={0.55} color="#e2e8f0" />
      <pointLight position={[-4, 1, 2]} intensity={0.35} color="#a78bfa" />
      <pointLight position={[5, 0, -2]} intensity={0.25} color="#fde68a" />

      <Stars
        radius={60}
        depth={30}
        count={1400}
        factor={2.2}
        saturation={0.15}
        fade
        speed={0.15}
      />
      <OrbField scrollProgress={scrollProgress} />
      <ParallaxRig scrollProgress={scrollProgress} />
    </>
  );
}

export default function MagicalStoreScene({ scrollProgress }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0.85, 7.5], fov: 48 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
    >
      <SceneContents scrollProgress={scrollProgress} />
    </Canvas>
  );
}
