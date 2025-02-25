import { createCookieSessionStorage } from "react-router";
import { isTheme } from "./themeProvider";
import type { Theme } from "./themeProvider";

// Make use to set the environment variable SESSION_SECRET before running the code
const sessionSecret = process.env.SESSION_SECRET ?? "DEFAULT_SECRET";

export const themeStorage = createCookieSessionStorage({
  cookie: {
    name: "my_remix_theme",
    secure: true,
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
  },
});

export async function getThemeSession(request: Request) {
  const session = await themeStorage.getSession(request.headers.get("Cookie"));
  return {
    getTheme: () => {
      const themeValue = session.get("theme");
      return isTheme(themeValue) ? themeValue : null;
    },
    setTheme: (theme: Theme) => session.set("theme", theme),
    commit: () => themeStorage.commitSession(session),
  };
}

export async function getUserChoice(request: Request) {
  const session = await themeStorage.getSession(request.headers.get("Cookie"));
  return session.get("user-choice");
}

export async function setUserChoice(request: Request, choice: string) {
  const session = await themeStorage.getSession(request.headers.get("Cookie"));
  session.set("user-choice", choice);
}

export async function deleteThemeSession(request: Request) {
  let session = await themeStorage.getSession(request.headers.get("Cookie"));
  session.unset("theme");
}
