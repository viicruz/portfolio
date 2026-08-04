"use client";

//* Libraries imports
import { useProgress } from "@react-three/drei";
import { useEffect, useEffectEvent, useRef, useState } from "react";

//* Components imports
import { Progress } from "@/components/ui/progress";

/** Opaque black hold after assets ready before handing off to Scene reveal. */
const HOLD_MS = 500;
const IDLE_FALLBACK_MS = 800;

type LoadingScreenProps = {
  onDismissed?: () => void;
};

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
}

export function LoadingScreen(props: LoadingScreenProps) {
  const progress = useProgress((state) => state.progress);
  const active = useProgress((state) => state.active);

  // Monotonic floor so the bar never jumps backwards when drei's LoadingManager
  // resets progress between asset batches (saveLastTotalLoaded quirk).
  const maxProgressRef = useRef(clampProgress(useProgress.getState().progress));
  const [progressFloor, setProgressFloor] = useState(0);
  const [settling, setSettling] = useState(false);
  const [hidden, setHidden] = useState(false);
  const hasSeenActivityRef = useRef(
    useProgress.getState().active || useProgress.getState().progress > 0,
  );
  const dismissStartedRef = useRef(false);

  const safeProgress = clampProgress(progress);
  maxProgressRef.current = Math.max(maxProgressRef.current, safeProgress);
  const displayProgress = Math.max(maxProgressRef.current, progressFloor);

  // Hand off while still fully opaque so Scene's reveal veil can take over
  // without a transparent frame flashing the world in between.
  const dismiss = useEffectEvent(() => {
    setHidden(true);
    props.onDismissed?.();
  });

  const beginSettle = useEffectEvent(() => {
    if (dismissStartedRef.current) {
      return;
    }

    dismissStartedRef.current = true;
    setSettling(true);

    // Fire-and-forget: do not clear these timers on effect re-run
    window.setTimeout(() => {
      dismiss();
    }, HOLD_MS);
  });

  useEffect(() => {
    if (active) {
      hasSeenActivityRef.current = true;
    }
  }, [active]);

  useEffect(() => {
    if (hidden || dismissStartedRef.current) {
      return;
    }

    const ready = !active && displayProgress >= 100;

    if (!ready) {
      return;
    }

    beginSettle();
  }, [displayProgress, active, hidden]);

  // Dismiss if loaders never report activity (assets already in cache)
  useEffect(() => {
    if (hidden || dismissStartedRef.current) {
      return;
    }

    const fallbackId = window.setTimeout(() => {
      if (dismissStartedRef.current || hasSeenActivityRef.current || active) {
        return;
      }

      maxProgressRef.current = 100;
      setProgressFloor(100);
      beginSettle();
    }, IDLE_FALLBACK_MS);

    return () => {
      window.clearTimeout(fallbackId);
    };
  }, [active, hidden]);

  if (hidden) {
    return null;
  }

  const roundedProgress = Math.min(100, Math.round(displayProgress));
  const overlayClassName =
    "absolute inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950 pointer-events-auto";

  if (settling) {
    return <div aria-hidden className={overlayClassName} />;
  }

  return (
    <div
      aria-busy={true}
      aria-live="polite"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={roundedProgress}
      className={overlayClassName}
      role="progressbar"
    >
      <div className="flex w-full max-w-xs flex-col items-center gap-4 px-6">
        <p className="font-pixel text-[0.7rem] tracking-[0.2em] text-amber-200">
          LOADING
        </p>
        <Progress
          className="h-3 border-2 border-white/20 bg-white/10 **:data-[slot=progress-indicator]:bg-amber-200"
          id="asset-loading-progress"
          value={roundedProgress}
        />
        <p className="font-pixel text-sm text-white tabular-nums">
          {roundedProgress}%
        </p>
      </div>
    </div>
  );
}