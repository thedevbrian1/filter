import { useFetcher } from "react-router";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export enum Theme {
  DARK = "dark",
  LIGHT = "light",
  SYSTEM = "system",
}
const themes: Array<Theme> = Object.values(Theme);

type ThemeContextType = [Theme | null, Dispatch<SetStateAction<Theme | null>>];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const prefersDarkMQ = "(prefers-color-scheme: dark)";
const getPreferredTheme = () =>
  window.matchMedia(prefersDarkMQ).matches ? Theme.DARK : Theme.LIGHT;

export function ThemeProvider({
  children,
  specifiedTheme,
}: {
  children: ReactNode;
  specifiedTheme: Theme | null;
}) {
  const [theme, setTheme] = useState<Theme | null>(() => {
    // On the server, if we don't have a specified theme then we should
    // return null and the clientThemeCode will set the theme for us
    // before hydration. Then (during hydration), this code will get the same
    // value that clientThemeCode got so hydration is happy.
    if (specifiedTheme) {
      if (themes.includes(specifiedTheme)) {
        return specifiedTheme;
      } else {
        // return null;
        return Theme.SYSTEM;
      }
    }

    // there's no way for us to know what the theme should be in this context
    // the client will have to figure it out before hydration.
    if (typeof document === "undefined") {
      return null;
    }

    return getPreferredTheme();
    // return Theme.SYSTEM;
  });

  const persistTheme = useFetcher();
  // TODO: remove this when persistTheme is memoized properly
  const persistThemeRef = useRef(persistTheme);
  useEffect(() => {
    persistThemeRef.current = persistTheme;
  }, [persistTheme]);

  const mountRun = useRef(false);

  useEffect(() => {
    if (!mountRun.current) {
      mountRun.current = true;
      return;
    }
    if (!theme) {
      return;
    }

    persistThemeRef.current.submit(
      { theme },
      { action: "action/set-theme", method: "post" }
    );
  }, [theme]);

  // useEffect(() => {
  //   if (!theme) return;
  //   const mediaQuery = window.matchMedia(prefersDarkMQ);
  //   const handleChange = () => {
  //     setTheme(mediaQuery.matches ? Theme.DARK : Theme.LIGHT);
  //   };
  //   mediaQuery.addEventListener("change", handleChange);
  //   return () => mediaQuery.removeEventListener("change", handleChange);
  // }, [theme]);

  // TODO: The theme does not update dynamically when you switch from the device while it is set to 'system'

  useEffect(() => {
    if (!theme) return;
    const effectiveTheme = theme === Theme.SYSTEM ? getPreferredTheme() : theme;
    document.documentElement.classList.toggle(
      "dark",
      effectiveTheme === Theme.DARK
    );

    // Add a listener for system changes when theme is SYSTEM
    if (theme === Theme.SYSTEM) {
      const mediaQuery = window.matchMedia(prefersDarkMQ);
      const handleChange = () => {
        // No setTheme here; just trigger DOM update directly
        document.documentElement.classList.toggle("dark", mediaQuery.matches);
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={[theme, setTheme]}>
      {children}
    </ThemeContext.Provider>
  );
}

const clientThemeCode = `
// hi there dear reader 👋
// this is how I make certain we avoid a flash of the wrong theme. If you select
// a theme, then I'll know what you want in the future and you'll not see this
// script anymore.
;(() => {
  const theme = window.matchMedia('${prefersDarkMQ}').matches
    ? '${Theme.DARK}'
    : '${Theme.LIGHT}';

  const cl = document.documentElement.classList;
  if (
    cl.contains('${Theme.LIGHT}') || cl.contains('${Theme.DARK}')
  ) {
    // The theme is already applied...
    // this script shouldn't exist if the theme is already applied!
    console.warn("See theme-provider.tsx>clientThemeCode>cl.contains");
    // Hi there, could you let me know you're seeing this console.warn? Thanks!
  } else {
    cl.add(theme);
  }

  const meta = document.querySelector('meta[name=color-scheme]');
  if (meta) {
    meta.content = theme === '${Theme.DARK}' ? 'dark light' : 'light dark';
  } else {
    console.warn("See theme-provider.tsx>clientThemeCode>meta");
    // Hey, could you let me know you're seeing this console.warn? Thanks!
  }
})();
`
  // Remove double slash comments & replace excess white space with a single space.
  .replace(/((?<=[^:])\/\/.*|\s)+/g, " ")
  .trim();

const themeStylesCode = `
  /* default light, but app-preference is "dark" */
  html.dark {
    light-mode {
      display: none;
    }
  }

  /* default light, and no app-preference */
  html:not(.dark) {
    dark-mode {
      display: none;
    }
  }

  @media (prefers-color-scheme: dark) {
    /* prefers dark, but app-preference is "light" */
    html.light {
      dark-mode {
        display: none;
      }
    }

    /* prefers dark, and app-preference is "dark" */
    html.dark,
    /* prefers dark and no app-preference */
    html:not(.light) {
      light-mode {
        display: none;
      }
    }
  }
`;

export function ThemeHead({ ssrTheme }: { ssrTheme: boolean }) {
  const [theme] = useTheme();

  return (
    <>
      {/*
        On the server, "theme" might be `null`, so clientThemeCode ensures that
        this is correct before hydration.
      */}
      <meta
        name="color-scheme"
        content={theme === "light" ? "light dark" : "dark light"}
      />
      {/*
        If we know what the theme is from the server then we don't need
        to do fancy tricks prior to hydration to make things match.
      */}
      {ssrTheme ? null : (
        <>
          <script
            // NOTE: we cannot use type="module" because that automatically makes
            // the script "defer". That doesn't work for us because we need
            // this script to run synchronously before the rest of the document
            // is finished loading.
            dangerouslySetInnerHTML={{ __html: clientThemeCode }}
          />
          <style dangerouslySetInnerHTML={{ __html: themeStylesCode }} />
        </>
      )}
    </>
  );
}

const clientDarkAndLightModeElsCode = `;(() => {
  const theme = window.matchMedia(${JSON.stringify(prefersDarkMQ)}).matches
    ? 'dark'
    : 'light';
  const darkEls = document.querySelectorAll("dark-mode");
  const lightEls = document.querySelectorAll("light-mode");
  for (const darkEl of darkEls) {
    if (theme === "dark") {
      for (const child of darkEl.childNodes) {
        darkEl.parentElement?.append(child);
      }
    }
    darkEl.remove();
  }
  for (const lightEl of lightEls) {
    if (theme === "light") {
      for (const child of lightEl.childNodes) {
        lightEl.parentElement?.append(child);
      }
    }
    lightEl.remove();
  }
})();`;

export function ThemeBody({ ssrTheme }: { ssrTheme: boolean }) {
  return ssrTheme ? null : (
    <script
      dangerouslySetInnerHTML={{ __html: clientDarkAndLightModeElsCode }}
    />
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

/**
 * This allows you to render something that depends on the theme without
 * worrying about whether it'll SSR properly when we don't actually know
 * the user's preferred theme.
 */
export function Themed({
  dark,
  light,
  initialOnly = false,
}: {
  dark: ReactNode | string;
  light: ReactNode | string;
  initialOnly?: boolean;
}) {
  const [theme] = useTheme();
  const [initialTheme] = useState(theme);
  const themeToReference = initialOnly ? initialTheme : theme;
  const serverRenderWithUnknownTheme =
    !theme && typeof document === "undefined";

  if (serverRenderWithUnknownTheme) {
    // stick them both in and our little script will update the DOM to match
    // what we'll render in the client during hydration.
    return (
      <>
        {createElement("dark-mode", null, dark)}
        {createElement("light-mode", null, light)}
      </>
    );
  }

  return <>{themeToReference === "light" ? light : dark}</>;
}

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && themes.includes(value as Theme);
}
