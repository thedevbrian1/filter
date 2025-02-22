import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("action/set-theme", "routes/set-theme.ts"),
] satisfies RouteConfig;
