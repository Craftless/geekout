// Adapted from MUI useMediaQuery

import * as React from "react";

export interface UseMediaQueryOptions {
  /**
   * As `window.matchMedia()` is unavailable on the server,
   * it returns a default matches during the first mount.
   * @default false
   */
  defaultMatches?: boolean;
  /**
   * You can provide your own implementation of matchMedia.
   * This can be used for handling an iframe content window.
   */
  matchMedia?: typeof window.matchMedia;
  /**
   * To perform the server-side hydration, the hook needs to render twice.
   * A first time with `defaultMatches`, the value of the server, and a second time with the resolved value.
   * This double pass rendering cycle comes with a drawback: it's slower.
   * You can set this option to `true` if you use the returned value **only** client-side.
   * @default false
   */
  noSsr?: boolean;
  /**
   * You can provide your own implementation of `matchMedia`, it's used when rendering server-side.
   */
  ssrMatchMedia?: (query: string) => { matches: boolean };
}

// eslint-disable-next-line no-useless-concat -- Workaround for https://github.com/webpack/webpack/issues/14814
const maybeReactUseSyncExternalStore: undefined | any = (React as any)[
  "useSyncExternalStore" + ""
];

function useMediaQueryNew(
  query: string,
  defaultMatches: boolean,
  matchMedia: typeof window.matchMedia | null,
  ssrMatchMedia: ((query: string) => { matches: boolean }) | null,
  noSsr: boolean
): boolean {
  const getDefaultSnapshot = React.useCallback(
    () => defaultMatches,
    [defaultMatches]
  );
  const getServerSnapshot = React.useMemo(() => {
    if (noSsr && matchMedia) {
      return () => matchMedia!(query).matches;
    }

    if (ssrMatchMedia !== null) {
      const { matches } = ssrMatchMedia(query);
      return () => matches;
    }
    return getDefaultSnapshot;
  }, [getDefaultSnapshot, query, ssrMatchMedia, noSsr, matchMedia]);
  const [getSnapshot, subscribe] = React.useMemo(() => {
    if (matchMedia === null) {
      return [getDefaultSnapshot, () => () => {}];
    }

    const mediaQueryList = matchMedia(query);

    return [
      () => mediaQueryList.matches,
      (notify: () => void) => {
        // TODO: Use `addEventListener` once support for Safari < 14 is dropped
        mediaQueryList.addListener(notify);
        return () => {
          mediaQueryList.removeListener(notify);
        };
      },
    ];
  }, [getDefaultSnapshot, matchMedia, query]);
  const match = maybeReactUseSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return match;
}

export function useMediaQuery(
  queryInput: string,
  options: UseMediaQueryOptions = {}
): boolean {
  // Wait for jsdom to support the match media feature.
  // All the browsers MUI support have this built-in.
  // This defensive check is here for simplicity.
  // Most of the time, the match media logic isn't central to people tests.
  const supportMatchMedia =
    typeof window !== "undefined" && typeof window.matchMedia !== "undefined";
  const {
    defaultMatches = false,
    matchMedia = supportMatchMedia ? window.matchMedia : null,
    ssrMatchMedia = null,
    noSsr = false,
  } = options;

  let query = queryInput;
  query = query.replace(/^@media( ?)/m, "");

  const match = useMediaQueryNew(
    query,
    defaultMatches,
    matchMedia,
    ssrMatchMedia,
    noSsr
  );

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useDebugValue({ query, match });
  }

  return match;
}
