// obstacles/tree.ts
import {
  Group,
  Mesh,
  MeshBasicMaterial,
  CylinderGeometry,
  SphereGeometry,
  TextureLoader,
  MeshStandardMaterial,
} from "three";

export const createTree = (x: number, y: number, z: number): Group => {
  const tree = new Group();
  const textureLoader = new TextureLoader();

  const barkTexture = textureLoader.load("/images/textures/bark.png");
  const leavesTexture = textureLoader.load("/images/textures/leaves.png");

  // Randomize trunk height
  const trunkHeight = Math.random() * 9 + 9; // Random height between 3 and 6
  const trunkGeometry = new CylinderGeometry(1, 1, trunkHeight);
  const trunkMaterial = new MeshBasicMaterial({ map: barkTexture });
  const trunk = new Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = trunkHeight / 2; // Center the trunk based on its height

  // Create leaves
  const leavesGeometry = new SphereGeometry(Math.random() * 1.5 + 3, 24, 24); // Random size for the leaves
  const leavesMaterial = new MeshStandardMaterial({
    map: leavesTexture,
    normalMap: leavesTexture,
    roughness: 1,
  });
  const leaves = new Mesh(leavesGeometry, leavesMaterial);
  leaves.position.y = trunkHeight;

  tree.add(trunk);
  tree.add(leaves);
  tree.scale.setScalar(2);
  tree.position.set(x, y, z);

  return tree;
};
