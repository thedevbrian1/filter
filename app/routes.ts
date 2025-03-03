import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("events", "routes/events/events.tsx", [
    index("routes/events/index.tsx"),
    route(":id", "routes/events/event.tsx"),
  ]),
  route("movies", "routes/movies/movies.tsx"),
  route("movies/:id", "routes/movies/movie.tsx"),
  route("images/:id", "routes/image.tsx"),
  route("action/set-theme", "routes/set-theme.ts"),
] satisfies RouteConfig;
