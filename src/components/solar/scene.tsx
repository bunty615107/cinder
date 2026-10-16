import { Line, OrbitControls, Stars, Trail } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import {
  BODY_BY_ID,
  BODIES,
  INNER_CAMERA,
  MOONS,
  OVERVIEW_CAMERA,
  PLANETS,
  framingDistance,
  type Body,
  type BodyId,
  type MoonDef,
} from "@/lib/solar-data";
import {
  createTextureAtlas,
  disposeTextureAtlas,
  type TextureAtlas,
} from "@/lib/planet-textures";
import { getSimDays, stepSim, useSim } from "@/lib/sim-store";
import { labelPositions } from "@/lib/label-state";

const _world = new THREE.Vector3();
const _desired = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _moved = new THREE.Vector3();
const _prev = new THREE.Vector3();

type BodyMap = Map<string, THREE.Object3D>;

function SimulationTicker() {
  useFrame((_, delta) => {
    stepSim(Math.min(delta, 0.1));
  });
  return null;
}

function orbitPoints(radius: number, segments = 160): [number, number, number][] {
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push([Math.cos(a) * radius, 0, Math.sin(a) * radius]);
  }
  return pts;
}

function OrbitRing({ radius, color }: { radius: number; color: string }) {
  const points = useMemo(() => orbitPoints(radius), [radius]);
  return (
    <Line
      points={points}
      color={color}
      transparent
      opacity={0.28}
      lineWidth={1}
      raycast={() => {}}
    />
  );
}

function Atmosphere({ color, scale }: { color: string; scale: number }) {
  return (
    <mesh scale={scale}>
      <sphereGeometry args={[1, 32, 24]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.16}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function PlanetMoon({ def, planetRadius }: { def: MoonDef; planetRadius: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const group = ref.current;
    if (!group) return;
    const angle = (getSimDays() / def.period) * Math.PI * 2 + def.phase;
    const r = planetRadius * def.distanceScale;
    group.position.set(Math.cos(angle) * r, Math.sin(angle) * r * def.tilt, Math.sin(angle) * r);
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[Math.max(0.03, planetRadius * def.radiusScale), 12, 10]} />
        <meshStandardMaterial color={def.color} roughness={0.95} metalness={0} />
      </mesh>
    </group>
  );
}

function PlanetMoons({ body }: { body: Body }) {
  const moons = MOONS[body.id];
  if (!moons?.length) return null;
  return (
    <>
      {moons.map((moon) => (
        <PlanetMoon key={moon.name} def={moon} planetRadius={body.radius} />
      ))}
    </>
  );
}

function cometPoints(): [number, number, number][] {
  const e = 0.67;
  const a = 28;
  const pts: [number, number, number][] = [];
  const n = 220;
  for (let i = 0; i <= n; i++) {
    const E = (i / n) * Math.PI * 2;
    const x = a * (Math.cos(E) - e);
    const z = a * Math.sqrt(1 - e * e) * Math.sin(E);
    const y = Math.sin(E) * 2.4;
    pts.push([x, y, z]);
  }
  return pts;
}

function Comet() {
  const ref = useRef<THREE.Group>(null);
  const trails = useSim((s) => s.trails);
  const points = useMemo(() => cometPoints(), []);

  useFrame(() => {
    const group = ref.current;
    if (!group) return;
    const t = getSimDays();
    const period = 27_759;
    const M = ((t / period) * Math.PI * 2) % (Math.PI * 2);
    const e = 0.67;
    const E = M + e * Math.sin(M);
    const a = 28;
    group.position.set(
      a * (Math.cos(E) - e),
      Math.sin(E) * 2.4,
      a * Math.sqrt(1 - e * e) * Math.sin(E),
    );
  });

  return (
    <group rotation={[0.22, 0.4, 0.08]}>
      {trails ? (
        <Line points={points} color="#9aa7b8" transparent opacity={0.22} lineWidth={1} raycast={() => {}} />
      ) : null}
      <group ref={ref}>
        {trails ? (
          <Trail width={0.28} length={7} decay={1.1} color="#d7e3f2" attenuation={(w) => w * w} stride={0.12}>
            <mesh>
              <sphereGeometry args={[0.07, 8, 8]} />
              <meshBasicMaterial color="#f4f7fb" />
            </mesh>
          </Trail>
        ) : (
          <mesh>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshBasicMaterial color="#f4f7fb" />
          </mesh>
        )}
      </group>
    </group>
  );
}

function PlanetBody({
  body,
  atlas,
  registry,
}: {
  body: Body;
  atlas: TextureAtlas;
  registry: MutableRefObject<BodyMap>;
}) {
  const orbitRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const trails = useSim((s) => s.trails);
  const select = useSim((s) => s.select);
  const setHovered = useSim((s) => s.setHovered);

  const inclination = (body.inclination * Math.PI) / 180;
  const tilt = (body.tilt * Math.PI) / 180;
  const map = atlas.bodies[body.id];

  useEffect(() => {
    const obj = orbitRef.current;
    if (obj) registry.current.set(body.id, obj);
    return () => {
      registry.current.delete(body.id);
    };
  }, [body.id, registry]);

  useFrame(() => {
    const orbit = orbitRef.current;
    const spin = spinRef.current;
    if (!orbit) return;
    const t = getSimDays();
    const angle = (t / body.period) * Math.PI * 2 + body.phase;
    orbit.position.set(Math.cos(angle) * body.distance, 0, Math.sin(angle) * body.distance);
    if (spin) {
      const sign = Math.sign(body.rotationHours) || 1;
      spin.rotation.y = (t / Math.abs(body.rotationHours)) * Math.PI * 2 * 0.14 * sign;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y = (t / 18) * Math.PI * 2 * 0.14;
    }
  });

  const onSelect = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    select(body.id);
  };

  const trailWidth = Math.max(0.08, body.radius * 0.22);

  return (
    <group rotation={[inclination, 0, 0]}>
      {trails ? <OrbitRing radius={body.distance} color={body.color} /> : null}
      <group ref={orbitRef}>
        <group>
          {trails ? (
            <Trail
              width={trailWidth}
              length={5}
              decay={1.4}
              color={body.color}
              attenuation={(w) => w * w}
              stride={0.08}
            >
              <mesh visible={false}>
                <sphereGeometry args={[0.05, 6, 6]} />
                <meshBasicMaterial />
              </mesh>
            </Trail>
          ) : null}
          <group ref={spinRef} rotation={[0, 0, tilt * 0.15]}>
            <mesh
              onClick={onSelect}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = "pointer";
                setHovered(body.id);
              }}
              onPointerOut={() => {
                document.body.style.cursor = "auto";
                setHovered(null);
              }}
            >
              <sphereGeometry args={[body.radius, 48, 32]} />
              <meshStandardMaterial
                map={map}
                roughness={body.kind === "terrestrial" ? 0.82 : 0.48}
                metalness={0.04}
                emissive={body.kind === "gas-giant" ? body.color : "#000000"}
                emissiveIntensity={body.kind === "gas-giant" ? 0.04 : 0}
              />
            </mesh>
            {body.atmosphere ? <Atmosphere color={body.atmosphere} scale={body.radius * 1.08} /> : null}
            {body.id === "earth" ? (
              <mesh ref={cloudRef} scale={body.radius * 1.025}>
                <sphereGeometry args={[1, 32, 24]} />
                <meshStandardMaterial
                  map={atlas.clouds}
                  transparent
                  opacity={0.55}
                  depthWrite={false}
                  roughness={1}
                />
              </mesh>
            ) : null}
            {body.id === "saturn" ? (
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                onClick={onSelect}
              >
                <ringGeometry args={[body.radius * 1.28, body.radius * 2.22, 96]} />
                <meshStandardMaterial
                  map={atlas.rings}
                  transparent
                  side={THREE.DoubleSide}
                  depthWrite={false}
                  roughness={0.7}
                  metalness={0.08}
                />
              </mesh>
            ) : null}
          </group>
          <PlanetMoons body={body} />
        </group>
      </group>
    </group>
  );
}

function Sun({
  atlas,
  registry,
}: {
  atlas: TextureAtlas;
  registry: MutableRefObject<BodyMap>;
}) {
  const root = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const select = useSim((s) => s.select);
  const setHovered = useSim((s) => s.setHovered);
  const sun = BODY_BY_ID.sun;

  useEffect(() => {
    const obj = root.current;
    if (obj) registry.current.set("sun", obj);
    return () => {
      registry.current.delete("sun");
    };
  }, [registry]);

  useFrame(() => {
    if (!spin.current) return;
    spin.current.rotation.y = (getSimDays() / 25.4) * Math.PI * 2 * 0.05;
  });

  return (
    <group ref={root}>
      <group ref={spin}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            select("sun");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
            setHovered("sun");
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
            setHovered(null);
          }}
        >
          <sphereGeometry args={[sun.radius, 64, 48]} />
          <meshBasicMaterial map={atlas.bodies.sun} toneMapped={false} />
        </mesh>
      </group>
      <mesh scale={sun.radius * 1.16}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshBasicMaterial
          color="#ffb070"
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh scale={sun.radius * 1.52}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshBasicMaterial
          color="#ff8a3d"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <pointLight color="#fff1d6" intensity={95} distance={180} decay={2} />
    </group>
  );
}

function AsteroidBelt() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 420;

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + hashSeed(i) * 0.4;
      const r = 20.4 + hashSeed(i + 17) * 3.1;
      dummy.position.set(
        Math.cos(a) * r,
        (hashSeed(i + 3) - 0.5) * 0.45,
        Math.sin(a) * r,
      );
      dummy.rotation.set(hashSeed(i + 9) * 6, hashSeed(i + 11) * 6, hashSeed(i + 13) * 6);
      dummy.scale.setScalar(0.035 + hashSeed(i + 21) * 0.07);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [count]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.rotation.y = getSimDays() * 0.00022;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#6e6860" roughness={0.95} metalness={0.04} />
    </instancedMesh>
  );
}

function hashSeed(n: number): number {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

function LabelProjector({ registry }: { registry: MutableRefObject<BodyMap> }) {
  const { camera, size } = useThree();

  useFrame(() => {
    for (const body of BODIES) {
      const obj = registry.current.get(body.id);
      const slot = labelPositions[body.id];
      if (!obj) {
        slot.visible = false;
        continue;
      }
      obj.getWorldPosition(_world);
      _world.y += body.radius * (body.id === "sun" ? 1.15 : 1.55) + 0.16;
      _world.project(camera);
      const onScreen =
        _world.z < 1 &&
        _world.x > -1.15 &&
        _world.x < 1.15 &&
        _world.y > -1.15 &&
        _world.y < 1.15;
      slot.x = (_world.x * 0.5 + 0.5) * size.width;
      slot.y = (-_world.y * 0.5 + 0.5) * size.height;
      slot.visible = onScreen;
    }
  });

  return null;
}

function CameraRig({ bodies }: { bodies: MutableRefObject<BodyMap> }) {
  const { camera } = useThree();
  const controlsRef = useRef<THREE.EventDispatcher & {
    target: THREE.Vector3;
    minDistance: number;
    enablePan: boolean;
    update: () => void;
  }>(null);
  const selectedId = useSim((s) => s.selectedId);
  const viewPreset = useSim((s) => s.viewPreset);
  const inited = useRef(false);
  const snap = useRef(1);
  const prevId = useRef<string | null | undefined>(undefined);
  const prevView = useRef(viewPreset);

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.1);
    const controls = controlsRef.current;
    if (!controls) return;

    if (prevId.current !== selectedId) {
      prevId.current = selectedId;
      inited.current = false;
      snap.current = 1;
    }
    if (prevView.current !== viewPreset) {
      prevView.current = viewPreset;
      if (!selectedId) snap.current = 1;
    }

    if (!selectedId) {
      _world.set(0, 0, 0);
      const k = 1 - Math.exp(-2.6 * d);
      controls.target.lerp(_world, k);
      controls.minDistance = viewPreset === "inner" ? 4 : 8;
      controls.enablePan = true;
      if (snap.current > 0.02) {
        const pos = viewPreset === "inner" ? INNER_CAMERA.position : OVERVIEW_CAMERA.position;
        _desired.set(...pos);
        camera.position.lerp(_desired, k);
        snap.current *= Math.exp(-1.8 * d);
      }
      controls.update();
      return;
    }

    const obj = bodies.current.get(selectedId);
    if (!obj) {
      controls.update();
      return;
    }

    obj.getWorldPosition(_world);
    const body = BODY_BY_ID[selectedId];
    controls.enablePan = false;
    controls.minDistance = Math.max(1.3, body.radius * 2.15);

    if (!inited.current) {
      _prev.copy(_world);
      inited.current = true;
    }

    _moved.copy(_world).sub(_prev);
    camera.position.add(_moved);
    controls.target.add(_moved);
    _prev.copy(_world);
    controls.target.lerp(_world, 0.35);

    if (snap.current > 0.015) {
      _dir.copy(camera.position).sub(controls.target);
      if (_dir.lengthSq() < 0.0001) _dir.set(0.62, 0.34, 0.72);
      _dir.normalize();
      _desired.copy(_world).addScaledVector(_dir, framingDistance(body));
      const k = 1 - Math.exp(-3.1 * d);
      camera.position.lerp(_desired, k);
      snap.current *= Math.exp(-2.15 * d);
    }

    controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef as never}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      maxDistance={150}
      minPolarAngle={0.14}
      maxPolarAngle={Math.PI - 0.14}
    />
  );
}

export function SolarScene() {
  const atlas = useMemo(() => createTextureAtlas(), []);
  const bodies = useRef<BodyMap>(new Map());

  useEffect(() => {
    return () => {
      disposeTextureAtlas(atlas);
      document.body.style.cursor = "auto";
    };
  }, [atlas]);

  return (
    <>
      <color attach="background" args={["#07080b"]} />
      <fog attach="fog" args={["#07080b", 110, 260]} />
      <ambientLight intensity={0.14} color="#c9d4e4" />
      <hemisphereLight args={["#9aa6b8", "#07080b", 0.18]} />
      <SimulationTicker />
      <Stars radius={180} depth={70} count={4500} factor={2.5} saturation={0} fade speed={0.25} />
      <Sun atlas={atlas} registry={bodies} />
      {PLANETS.map((planet) => (
        <PlanetBody key={planet.id} body={planet} atlas={atlas} registry={bodies} />
      ))}
      <AsteroidBelt />
      <Comet />
      <LabelProjector registry={bodies} />
      <CameraRig bodies={bodies} />
    </>
  );
}
