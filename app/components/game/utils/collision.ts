import { Hitbox } from "../types";

/**
 * AABB (Axis-Aligned Bounding Box) collision detection
 * Returns true if two hitboxes are overlapping
 */
export function checkCollision(a: Hitbox, b: Hitbox): boolean {
  // Generous padding so collisions feel fair — shrinks hitboxes inward
  const padding = 12;

  const aLeft = a.x + padding;
  const aRight = a.x + a.width - padding;
  const aTop = a.y + padding;
  const aBottom = a.y + a.height - padding;

  const bLeft = b.x + padding;
  const bRight = b.x + b.width - padding;
  const bTop = b.y + padding;
  const bBottom = b.y + b.height - padding;

  return aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop;
}
