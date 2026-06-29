import { describe, expect, test } from "bun:test";
import {
  computeScore,
  type ComputeScoreProps,
} from "@/hooks/use-hardware-three-support";

describe("computeScore", () => {
  describe("Given high-end hardware", () => {
    test("When computing the score, then it should return a high tier", () => {
      const params: ComputeScoreProps = {
        webgl: true,
        webgl2: true,
        maxTextureSize: 8192,
        maxRenderbufferSize: 8192,
        maxVertexAttribs: 16,
        deviceMemory: 8,
        hardwareConcurrency: 8,
        reducedMotion: false,
        renderer: "Some Renderer",
      };
      const result = computeScore(params);
      expect(result.score).toBeGreaterThan(0);
      expect(result.tier).toBe("high");
    });
  });

  describe("Given mid-range hardware", () => {
    test("When computing the score, then it should return a mid tier", () => {
      const params: ComputeScoreProps = {
        webgl: true,
        webgl2: true,
        maxTextureSize: 4096,
        maxRenderbufferSize: 4096,
        maxVertexAttribs: 12,
        deviceMemory: 4,
        hardwareConcurrency: 4,
        reducedMotion: false,
        renderer: "Some Renderer",
      };
      const result = computeScore(params);
      expect(result.score).toBeGreaterThan(0);
      expect(result.tier).toBe("medium");
    });
  });

  describe("Given low-end hardware", () => {
    test("When computing the score, then it should return a low tier", () => {
      const params: ComputeScoreProps = {
        webgl: true,
        webgl2: false,
        maxTextureSize: 2048,
        maxRenderbufferSize: 2048,
        maxVertexAttribs: 8,
        deviceMemory: 2,
        hardwareConcurrency: 2,
        reducedMotion: true,
        renderer: "Some Renderer",
      };
      const result = computeScore(params);
      expect(result.score).toBeGreaterThan(0);
      expect(result.tier).toBe("low");
    });
  });
  
  describe("Given no WebGL support", () => {
    test("When computing the score, then it should return an unknown tier", () => {
      const params: ComputeScoreProps = {
        webgl: false,
        webgl2: false,
        maxTextureSize: null,
        maxRenderbufferSize: null,
        maxVertexAttribs: null,
        deviceMemory: null,
        hardwareConcurrency: null,
        reducedMotion: true,
        renderer: null,
      };
      const result = computeScore(params);
      expect(result.score).toBe(0);
      expect(result.tier).toBe("unknown");
    });
  });
});
