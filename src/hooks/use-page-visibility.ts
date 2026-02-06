"use client";
//* Libraries imports
import React from "react";

type PageVisibilityCallbacks = {
  onVisibilityChange?: (isVisible: boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

/**
 * Hook that detects when the user minimizes, leaves, or loses focus on the page.
 *
 * This hook uses callbacks instead of state to avoid re-renders, making it ideal
 * for use with Three.js or other libraries that don't need React re-renders.
 *
 * This hook tracks:
 * - Page visibility (when the tab/window is hidden or shown)
 * - Window focus (when the window loses or gains focus)
 *
 * Example:
 *
 * ```tsx
 * usePageVisibility({
 *   onVisibilityChange: (isVisible) => {
 *     if (!isVisible) {
 *       // Pause Three.js animation loop
 *       renderer.setAnimationLoop(null);
 *     } else {
 *       // Resume Three.js animation loop
 *       renderer.setAnimationLoop(animate);
 *     }
 *   },
 *   onBlur: () => {
 *     console.log("Window lost focus");
 *   },
 *   onFocus: () => {
 *     console.log("Window gained focus");
 *   },
 * });
 * ```
 */
export function usePageVisibility(callbacks?: PageVisibilityCallbacks) {
  const callbacksRef = React.useRef(callbacks);

  React.useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      callbacksRef.current?.onVisibilityChange?.(isVisible);
    };

    const handleFocus = () => {
      callbacksRef.current?.onFocus?.();
    };

    const handleBlur = () => {
      callbacksRef.current?.onBlur?.();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);
}
