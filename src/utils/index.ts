import { Human } from "@/types";
import {
  Box3,
  Camera,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Scene,
  SphereGeometry,
  Vector3,
} from "three";

export const isOverlapping = (
  newPosition: { x: number; z: number },
  existingPositions: Array<{ x: number; z: number }>,
  minDistance: number
): boolean => {
  return existingPositions.some((pos) => {
    const dx = pos.x - newPosition.x;
    const dz = pos.z - newPosition.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    return distance < minDistance;
  });
};

export const createProjectile = (
  scene: Scene,
  position: Vector3,
  direction: Vector3
) => {
  const projectile = new Mesh(
    new SphereGeometry(0.5),
    new MeshStandardMaterial({ color: 0xff0000 })
  );
  projectile.position.copy(position);
  projectile.userData.velocity = direction.multiplyScalar(10);
  scene.add(projectile);
  return projectile;
};

export const handleMovement = (
  character: Human,
  characterBox: Box3,
  camera: Camera,
  keys: Record<string, boolean>,
  moveSpeed: number,
  obstacles: Object3D[] // Pass obstacles for collision detection
) => {
  const direction = new Vector3();

  // Calculate intended movement direction based on key inputs
  if (keys["ArrowUp"]) direction.x -= moveSpeed;
  if (keys["ArrowDown"]) direction.x += moveSpeed;
  if (keys["ArrowLeft"]) direction.z += moveSpeed;
  if (keys["ArrowRight"]) direction.z -= moveSpeed;

  // Apply character's rotation to movement direction
  const intendedMovement = direction
    .clone()
    .applyQuaternion(character.quaternion);

  // Check for collisions along the intended movement direction
  let canMoveX = true;
  let canMoveZ = true;

  obstacles.forEach((obstacle) => {
    const obstacleBox = new Box3().setFromObject(obstacle);

    if (characterBox.intersectsBox(obstacleBox)) {
      const characterPosition = character.position;
      const obstaclePosition = obstacle.position;

      // Calculate the collision direction
      const collisionDirection = new Vector3()
        .subVectors(characterPosition, obstaclePosition)
        .normalize();

      // Determine which axis the collision is primarily along and prevent movement in that direction
      if (Math.abs(collisionDirection.x) > Math.abs(collisionDirection.z)) {
        canMoveX = false;
      } else {
        canMoveZ = false;
      }
    }
  });

  // Apply only allowed movement based on collision checks
  if (!canMoveX) intendedMovement.x = 0;
  if (!canMoveZ) intendedMovement.z = 0;

  // Move character and camera only in allowed directions
  character.position.add(intendedMovement);
  characterBox.setFromObject(character); // Update character's bounding box
  camera.position.add(intendedMovement); // Sync camera position with character
};

// export const handleMovement = (
//   character: Human,
//   characterBox: Box3,
//   camera: any,
//   keys: Record<string, boolean>,
//   moveSpeed: number
// ) => {
//   const direction = new Vector3();
//   if (keys["ArrowUp"]) direction.x -= moveSpeed;
//   if (keys["ArrowDown"]) direction.x += moveSpeed;
//   if (keys["ArrowLeft"]) direction.z += moveSpeed;
//   if (keys["ArrowRight"]) direction.z -= moveSpeed;

//   character.position.add(direction.applyQuaternion(character.quaternion));
//   characterBox.setFromObject(character);
//   camera.position.add(direction.applyQuaternion(character.quaternion));
// };
