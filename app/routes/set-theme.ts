import { data, redirect } from "react-router";
import type { Route } from "./+types/set-theme";

import { isTheme } from "~/utils/themeProvider";
import { getThemeSession } from "~/utils/theme.server";

export const action = async ({ request }: Route.ActionArgs) => {
  const themeSession = await getThemeSession(request);
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
  const theme = form.get("theme");

  if (!isTheme(theme)) {
    return data({
      success: false,
      message: `theme value of ${theme} is not a valid theme`,
    });
  }

  themeSession.setTheme(theme);
  return data(
    { success: true },
    { headers: { "Set-Cookie": await themeSession.commit() } }
  );
};

export const loader = async () => redirect("/", { status: 404 });
