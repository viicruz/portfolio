"use client";

//* Libraries imports
import { useEffect, useState } from "react";

type GpuTier = "low" | "medium" | "high" | "unknown";

type HardwareInfo = {
  supported: boolean;
  webgl: boolean;
  webgl2: boolean;
  renderer: string | null;
  vendor: string | null;
  maxTextureSize: number | null;
  maxCubeMapTextureSize: number | null;
  maxRenderbufferSize: number | null;
  maxVertexAttribs: number | null;
  maxVertexUniformVectors: number | null;
  maxFragmentUniformVectors: number | null;
  maxVaryingVectors: number | null;
  antialias: boolean | null;
  deviceMemory: number | null;
  hardwareConcurrency: number | null;
  reducedMotion: boolean;
  score: number;
  tier: GpuTier;
  recommendedForThreeHeavyScenes: boolean;
  reason: string[];
};

export type ComputeScoreProps = {
  webgl: boolean;
  webgl2: boolean;
  maxTextureSize: number | null;
  maxRenderbufferSize: number | null;
  maxVertexAttribs: number | null;
  deviceMemory: number | null;
  hardwareConcurrency: number | null;
  reducedMotion: boolean;
  renderer: string | null;
};

function getDebugRendererInfo(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
) {
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  if (!ext) {
    return {
      vendor: null,
      renderer: null,
    };
  }

  const vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) as string;
  const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string;

  return { vendor, renderer };
}

export function computeScore(params: ComputeScoreProps) {
  const reasons: string[] = [];

  if (!params.webgl) {
    return {
      score: 0,
      tier: "unknown" as GpuTier,
      recommendedForThreeHeavyScenes: false,
      reason: ["WebGL não suportado"],
    };
  }

  let score = 20;

  if (params.webgl2) {
    score += 20;
    reasons.push("Suporte a WebGL2");
  } else {
    reasons.push("Apenas WebGL1 disponível");
  }

  if (params.maxTextureSize) {
    if (params.maxTextureSize >= 16384) {
      score += 20;
      reasons.push("maxTextureSize muito alto");
    } else if (params.maxTextureSize >= 8192) {
      score += 14;
      reasons.push("maxTextureSize alto");
    } else if (params.maxTextureSize >= 4096) {
      score += 8;
      reasons.push("maxTextureSize moderado");
    } else {
      score += 2;
      reasons.push("maxTextureSize baixo");
    }
  }

  if (params.maxRenderbufferSize) {
    if (params.maxRenderbufferSize >= 8192) {
      score += 10;
      reasons.push("maxRenderbufferSize alto");
    } else if (params.maxRenderbufferSize >= 4096) {
      score += 6;
      reasons.push("maxRenderbufferSize moderado");
    }
  }

  if (params.maxVertexAttribs) {
    if (params.maxVertexAttribs >= 16) {
      score += 8;
      reasons.push("Bom número de vertex attribs");
    } else if (params.maxVertexAttribs >= 8) {
      score += 4;
      reasons.push("Número razoável de vertex attribs");
    }
  }

  if (typeof params.deviceMemory === "number") {
    if (params.deviceMemory >= 8) {
      score += 10;
      reasons.push("Boa memória de dispositivo");
    } else if (params.deviceMemory >= 4) {
      score += 6;
      reasons.push("Memória de dispositivo moderada");
    } else if (params.deviceMemory >= 2) {
      score += 2;
      reasons.push("Memória de dispositivo limitada");
    }
  }

  if (typeof params.hardwareConcurrency === "number") {
    if (params.hardwareConcurrency >= 8) {
      score += 8;
      reasons.push("Boa quantidade de núcleos lógicos");
    } else if (params.hardwareConcurrency >= 4) {
      score += 5;
      reasons.push("Quantidade moderada de núcleos lógicos");
    } else {
      score += 2;
      reasons.push("Poucos núcleos lógicos");
    }
  }

  const renderer = (params.renderer || "").toLowerCase();

  if (
    renderer.includes("nvidia") ||
    renderer.includes("radeon") ||
    renderer.includes("amd") ||
    renderer.includes("apple gpu") ||
    renderer.includes("iris") ||
    renderer.includes("adreno")
  ) {
    score += 10;
    reasons.push("Renderer sugere GPU capaz");
  }

  if (
    renderer.includes("swiftshader") ||
    renderer.includes("software") ||
    renderer.includes("llvmpipe")
  ) {
    score -= 25;
    reasons.push("Renderer sugere renderização por software");
  }

  if (params.reducedMotion) {
    score -= 5;
    reasons.push("Usuário prefere reduzir animações");
  }

  score = Math.max(0, Math.min(100, score));

  let tier: GpuTier = "low";
  if (score >= 75) tier = "high";
  else if (score >= 45) tier = "medium";

  return {
    score,
    tier,
    recommendedForThreeHeavyScenes: score >= 70,
    reason: reasons,
  };
}

export function useHardwareThreeSupport() {
  const [info, setInfo] = useState<HardwareInfo>({
    supported: false,
    webgl: false,
    webgl2: false,
    renderer: null,
    vendor: null,
    maxTextureSize: null,
    maxCubeMapTextureSize: null,
    maxRenderbufferSize: null,
    maxVertexAttribs: null,
    maxVertexUniformVectors: null,
    maxFragmentUniformVectors: null,
    maxVaryingVectors: null,
    antialias: null,
    deviceMemory: null,
    hardwareConcurrency: null,
    reducedMotion: false,
    score: 0,
    tier: "unknown",
    recommendedForThreeHeavyScenes: false,
    reason: [],
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const canvas = document.createElement("canvas");

    const gl2 = canvas.getContext("webgl2", {
      antialias: true,
      powerPreference: "high-performance",
    }) as WebGL2RenderingContext | null;

    const gl =
      gl2 ||
      (canvas.getContext("webgl", {
        antialias: true,
        powerPreference: "high-performance",
      }) as WebGLRenderingContext | null) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (!gl) {
      setInfo({
        supported: false,
        webgl: false,
        webgl2: false,
        renderer: null,
        vendor: null,
        maxTextureSize: null,
        maxCubeMapTextureSize: null,
        maxRenderbufferSize: null,
        maxVertexAttribs: null,
        maxVertexUniformVectors: null,
        maxFragmentUniformVectors: null,
        maxVaryingVectors: null,
        antialias: null,
        deviceMemory:
          (navigator as Navigator & { deviceMemory?: number }).deviceMemory ??
          null,
        hardwareConcurrency: navigator.hardwareConcurrency ?? null,
        reducedMotion,
        score: 0,
        tier: "unknown",
        recommendedForThreeHeavyScenes: false,
        reason: ["WebGL não disponível no navegador/dispositivo"],
      });
      return;
    }

    const { vendor, renderer } = getDebugRendererInfo(gl);

    const baseInfo = {
      supported: true,
      webgl: true,
      webgl2: !!gl2,
      renderer,
      vendor,
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE) as number,
      maxCubeMapTextureSize: gl.getParameter(
        gl.MAX_CUBE_MAP_TEXTURE_SIZE,
      ) as number,
      maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) as number,
      maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS) as number,
      maxVertexUniformVectors: gl.getParameter(
        gl.MAX_VERTEX_UNIFORM_VECTORS,
      ) as number,
      maxFragmentUniformVectors: gl.getParameter(
        gl.MAX_FRAGMENT_UNIFORM_VECTORS,
      ) as number,
      maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS) as number,
      antialias: gl.getContextAttributes()?.antialias ?? null,
      deviceMemory:
        (navigator as Navigator & { deviceMemory?: number }).deviceMemory ??
        null,
      hardwareConcurrency: navigator.hardwareConcurrency ?? null,
      reducedMotion,
    };

    const performance = computeScore({
      webgl: baseInfo.webgl,
      webgl2: baseInfo.webgl2,
      maxTextureSize: baseInfo.maxTextureSize,
      maxRenderbufferSize: baseInfo.maxRenderbufferSize,
      maxVertexAttribs: baseInfo.maxVertexAttribs,
      deviceMemory: baseInfo.deviceMemory,
      hardwareConcurrency: baseInfo.hardwareConcurrency,
      reducedMotion: baseInfo.reducedMotion,
      renderer: baseInfo.renderer,
    });

    setInfo({
      ...baseInfo,
      score: performance.score,
      tier: performance.tier,
      recommendedForThreeHeavyScenes:
        performance.recommendedForThreeHeavyScenes,
      reason: performance.reason,
    });
  }, []);

  return info;
}
