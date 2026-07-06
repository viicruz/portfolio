"use client";

import React from "react";
import { CircleHelp, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

const CONTROLS_HINT_STORAGE_KEY = "portfolio:controls-hint-dismissed:v1";

function HintRow({
  label,
  keys,
}: {
  label: string;
  keys: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/10 px-3 py-2">
      <span className="text-[0.7rem] text-white/80">{label}</span>
      <div className="flex items-center gap-1.5">{keys}</div>
    </div>
  );
}

export function ControlsHint() {
  const t = useTranslations("controls");
  const [mounted, setMounted] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(true);

  React.useEffect(() => {
    setMounted(true);

    try {
      setDismissed(localStorage.getItem(CONTROLS_HINT_STORAGE_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const dismiss = React.useCallback(() => {
    setDismissed(true);

    try {
      localStorage.setItem(CONTROLS_HINT_STORAGE_KEY, "1");
    } catch {
      // localStorage can be unavailable in some environments
    }
  }, []);

  const reopen = React.useCallback(() => {
    setDismissed(false);

    try {
      localStorage.removeItem(CONTROLS_HINT_STORAGE_KEY);
    } catch {
      // localStorage can be unavailable in some environments
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-20 max-w-sm sm:max-w-md">
      {dismissed ? (
        <Button
          type="button"
          variant="outline"
          size="xs"
          className={cn(
            "pointer-events-auto rounded-full border-black/70 bg-black/75 px-3 text-white shadow-lg backdrop-blur-sm",
            "hover:bg-black/85 hover:text-white",
          )}
          onClick={reopen}
        >
          <CircleHelp className="size-3.5" />
          {t("open")}
        </Button>
      ) : (
        <div className="pointer-events-auto rounded-2xl border border-black/70 bg-black/75 p-3 text-white shadow-lg backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-pixel text-[0.62rem] tracking-[0.18em] text-amber-200">
                {t("title")}
              </p>
              <p className="mt-2 max-w-xs text-sm leading-5 text-white/90">
                {t("subtitle")}
              </p>
            </div>

            <button
              type="button"
              className="rounded-md p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label={t("close")}
              onClick={dismiss}
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-3 grid gap-2">
            <HintRow
              label={t("move")}
              keys={
                <KbdGroup>
                  <Kbd>WASD</Kbd>
                  <span className="text-white/45">/</span>
                  <Kbd>Arrows</Kbd>
                </KbdGroup>
              }
            />
            <HintRow
              label={t("interact")}
              keys={
                <KbdGroup>
                  <Kbd>Space</Kbd>
                </KbdGroup>
              }
            />
            <HintRow
              label={t("sprint")}
              keys={
                <KbdGroup>
                  <Kbd>Shift</Kbd>
                </KbdGroup>
              }
            />
            <HintRow
              label={t("menu")}
              keys={
                <KbdGroup>
                  <Kbd>X</Kbd>
                </KbdGroup>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}