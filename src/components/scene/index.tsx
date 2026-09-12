"use client";

//* Libraries imports
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Suspense, useEffect, useEffectEvent, useState } from "react";
import { useProgress } from "@react-three/drei";
import { useTranslations } from "next-intl";
import { ReactTyped } from "react-typed";

//* Store imports
import { useDialogStore } from "@/store";
import { usePlayerProfileStore } from "@/store/player-profile";

//* Components imports
import { ControlsHint } from "@/components/controls-hint";
import FPSCounter from "@/components/fps/fps-counter";
import { GameMenu } from "@/components/game-menu";
import PlayIcon from "@/components/icons/play-icon";
import { LoadingScreen } from "@/components/loading-screen";
import { OpeningIntro } from "@/components/opening-intro";

//* Utils imports
import { cn } from "@/lib/utils";
import {
  preloadHomepageAssets,
  preloadOpeningAssets,
} from "@/utils/preload-assets";

type SceneProps = {
  children?: React.ReactNode;
  characters?: React.ReactNode;
};

type BootPhase = "hydrating" | "intro" | "loading" | "revealing" | "ready";

const REVEAL_HOLD_MS = 500;
const REVEAL_FADE_MS = 350;

function areAssetsReady(): boolean {
  const progressState = useProgress.getState();
  return !progressState.active && progressState.progress >= 100;
}

function DialogHud() {
  const t = useTranslations("dialogs");
  const isOnDialog = useDialogStore((state) => state.isOnDialog);
  const isLastDialogLine = useDialogStore((state) => state.isLastDialogLine);
  const npcId = useDialogStore((state) => state.npcId);
  const dialogId = useDialogStore((state) => state.dialogId);
  const dialogLine = useDialogStore((state) => state.dialogLine);
  const line = `${npcId}.${dialogId}.${dialogLine}`;

  return (
    <div className="absolute bottom-0 left-0 w-full z-10 flex justify-center pb-8">
      {isOnDialog ? (
        <div className="items-center justify-cente w-full max-w-5xl border py-1 px-2 rounded-2xl bg-black/50 pr-8 relative">
          <div className="bg-white h-28 rounded-xl px-2 font-pixel text-2xl flex items-center ">
            <ReactTyped
              //@ts-expect-error
              strings={[t(line)]}
              typeSpeed={5}
              showCursor={false}
            />
          </div>
          <div className="absolute right-2 bottom-6 animate-bounce">
            {!isLastDialogLine ? (
              <PlayIcon className="size-4 rotate-90" fill="white" />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function Scene(props: SceneProps) {
  const showPhysicsDebug = process.env.NODE_ENV === "development";

  const hydrated = usePlayerProfileStore((state) => state.hydrated);
  const hasCompletedOpening = usePlayerProfileStore(
    (state) => state.hasCompletedOpening,
  );
  const hydrate = usePlayerProfileStore((state) => state.hydrate);

  const [bootPhase, setBootPhase] = useState<BootPhase>("hydrating");
  const [revealFading, setRevealFading] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    preloadHomepageAssets();
    void preloadOpeningAssets();
  }, []);

  useEffect(() => {
    if (!hydrated || bootPhase !== "hydrating") {
      return;
    }

    if (hasCompletedOpening) {
      setBootPhase("loading");
      return;
    }

    let cancelled = false;

    void preloadOpeningAssets().then(() => {
      if (!cancelled) {
        setBootPhase("intro");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [hydrated, hasCompletedOpening, bootPhase]);

  const finishReveal = useEffectEvent(() => {
    setBootPhase("ready");
    setRevealFading(false);
  });

  useEffect(() => {
    if (bootPhase !== "revealing") {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const holdId = window.setTimeout(() => {
      if (prefersReducedMotion) {
        finishReveal();
        return;
      }

      setRevealFading(true);
    }, REVEAL_HOLD_MS);

    return () => {
      window.clearTimeout(holdId);
    };
  }, [bootPhase]);

  useEffect(() => {
    if (!revealFading) {
      return;
    }

    const fadeId = window.setTimeout(() => {
      finishReveal();
    }, REVEAL_FADE_MS);

    return () => {
      window.clearTimeout(fadeId);
    };
  }, [revealFading]);

  const handleIntroComplete = () => {
    if (areAssetsReady()) {
      setRevealFading(false);
      setBootPhase("revealing");
      return;
    }

    setBootPhase("loading");
  };

  const handleLoadingDismissed = () => {
    setRevealFading(false);
    setBootPhase("revealing");
  };

  const showHud = bootPhase === "ready";
  const showGate = bootPhase === "hydrating";
  const showRevealVeil = bootPhase === "revealing";
  const showCharacters = bootPhase === "revealing" || bootPhase === "ready";

  console.log("re-render", {
    showHud,
    showGate,
    showRevealVeil,
    showCharacters,
    bootPhase,
  });

  return (
    <div className="relative w-full h-svh">
      {showGate ? (
        <div
          aria-hidden
          className="absolute inset-0 z-50 bg-neutral-950 pointer-events-auto"
        />
      ) : null}

      {showRevealVeil ? (
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 z-50 bg-neutral-950 pointer-events-auto",
            "transition-opacity ease-out",
            revealFading ? "opacity-0" : "opacity-100",
          )}
          style={{ transitionDuration: `${REVEAL_FADE_MS}ms` }}
        />
      ) : null}

      {bootPhase === "intro" ? (
        <OpeningIntro onComplete={handleIntroComplete} />
      ) : null}

      {bootPhase === "loading" ? (
        <LoadingScreen onDismissed={handleLoadingDismissed} />
      ) : null}

      {showHud ? (
        <>
          <GameMenu />
          <ControlsHint />
        </>
      ) : null}

      <FPSCounter />
      <DialogHud />
      <Canvas camera={{ fov: 40 }} shadows>
        <Suspense fallback={null}>
          <Physics
            debug={showPhysicsDebug}
            timeStep={1 / 60}
            interpolate={true}
            updateLoop="independent"
          >
            {props.children}
            {showCharacters ? props.characters : null}
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}