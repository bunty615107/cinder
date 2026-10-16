import { Canvas } from "@react-three/fiber";
import { OVERVIEW_CAMERA } from "@/lib/solar-data";
import { useSim } from "@/lib/sim-store";
import { SolarScene } from "./scene";

export function SolarCanvas() {
  const setReady = useSim((s) => s.setReady);

  return (
    <Canvas
      className="absolute inset-0 touch-none"
      camera={{
        position: OVERVIEW_CAMERA.position,
        fov: OVERVIEW_CAMERA.fov,
        near: 0.12,
        far: 400,
      }}
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.setClearColor("#07080b");
        setReady(true);
      }}
    >
      <SolarScene />
    </Canvas>
  );
}
