import { expect, test, describe } from "bun:test";
import {
  parseForestMap,
  type TreePlacement,
} from "@/components/forest/forest-layout";

describe("parseForestMap", () => {
  describe("Given a map with trees on the diagonal", () => {
    test("Then return the tree placements for each tree", () => {
      const map = `
      #..
      .#.
      ..#
    `.trim();
      const expectedResult: TreePlacement[] = [
        {
          position: [0, 0, 0],
        },
        {
          position: [1, 0, 1],
        },
        {
          position: [2, 0, 2],
        },
      ];
      const result = parseForestMap(
        map,
        { treeChar: "#", origin: { x: 0, z: 0 }, step: { x: 1, z: 1 } },
        0,
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
