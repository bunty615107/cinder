import { createFileRoute } from "@tanstack/react-router";
import { Cinder } from "@/components/cinder";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <Cinder />;
}
