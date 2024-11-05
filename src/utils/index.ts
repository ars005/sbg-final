export const isOverlapping = (
  newPosition: { x: number; z: number },
  existingPositions: Array<{ x: number; z: number }>,
  minDistance: number
): boolean => {
  return existingPositions.some((pos) => {
    const dx = pos.x - newPosition.x;
    const dz = pos.z - newPosition.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    return distance < minDistance; // Check if distance is less than the minimum distance
  });
};
