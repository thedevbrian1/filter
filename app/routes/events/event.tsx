import type { Route } from "./+types/event";

export default function IEvent({ params }: Route.ComponentProps) {
  let { id } = params;
  return <div>{id}</div>;
}
