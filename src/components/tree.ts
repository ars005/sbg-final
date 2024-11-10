// obstacles/tree.ts
import {
  Group,
  Mesh,
  MeshBasicMaterial,
  CylinderGeometry,
  SphereGeometry,
  TextureLoader,
  MeshStandardMaterial,
  Scene,
} from "three";
import { treePositions } from "./constants";

export const createTree = (scene: Scene) => {
  const textureLoader = new TextureLoader();
  const barkTexture = textureLoader.load("/images/textures/bark.png");
  const leavesTexture = textureLoader.load("/images/textures/leaves.png");

  const trunkGeometry = new CylinderGeometry(1, 1, 1);
  const trunkMaterial = new MeshBasicMaterial({ map: barkTexture });

  const leavesGeometry = new SphereGeometry(1, 24, 24);
  const leavesMaterial = new MeshStandardMaterial({
    map: leavesTexture,
    normalMap: leavesTexture,
    roughness: 1,
  });

  treePositions.forEach(({ x, z }) => {
    const tree = new Group();

    const trunkHeight = Math.random() * 9 + 9;
    const trunk = new Mesh(trunkGeometry, trunkMaterial);
    trunk.scale.y = trunkHeight;
    trunk.position.y = trunkHeight / 2;

    const leavesSize = Math.random() * 1.5 + 3;
    const leaves = new Mesh(leavesGeometry, leavesMaterial);
    leaves.scale.set(leavesSize, leavesSize, leavesSize);
    leaves.position.y = trunkHeight;

    tree.add(trunk);
    tree.add(leaves);
    tree.scale.setScalar(2);

    tree.position.set(x, 0, z);
    scene.add(tree);
  });
};
