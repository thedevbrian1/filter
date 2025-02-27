import type { Route } from "./+types/image";
import { images } from "./home";

export default function ImageRoute({ params }: Route.ComponentProps) {
  let { id } = params;
  return (
    <main>
      <img
        src={images[Number(id)]}
        alt=""
        style={{ viewTransitionName: "image" }}
      />
    </main>
  );
}
