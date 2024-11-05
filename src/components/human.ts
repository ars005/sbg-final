import {
  Group,
  Mesh,
  MeshStandardMaterial,
  CylinderGeometry,
  SphereGeometry,
  BoxGeometry,
  TextureLoader,
} from "three";

export function createHuman(): Group {
  const human = new Group();

  const textureLoader = new TextureLoader();
  const skinTexture = textureLoader.load("/images/textures/skin.png");
  const clothingTexture = textureLoader.load("/images/textures/cloth.png");

  const headGeometry = new SphereGeometry(1, 32, 32);
  const headMaterial = new MeshStandardMaterial({ map: skinTexture });
  const head = new Mesh(headGeometry, headMaterial);
  head.position.y = 5.5;

  const torsoGeometry = new BoxGeometry(1.2, 1.8, 0.8); // Adjusted shape
  const torsoMaterial = new MeshStandardMaterial({
    map: clothingTexture,
    color: "red",
  });
  const torso = new Mesh(torsoGeometry, torsoMaterial);
  torso.position.y = 3.5; // Center torso higher

  const armGeometry = new CylinderGeometry(0.2, 0.2, 1.5, 32);
  const armMaterial = new MeshStandardMaterial({
    map: skinTexture,
  });

  const leftArm = new Mesh(armGeometry, armMaterial);
  leftArm.rotation.z = Math.PI / 4;
  leftArm.position.set(-1.0, 3.5, 0);

  const rightArm = new Mesh(armGeometry, armMaterial);
  rightArm.rotation.z = -Math.PI / 4;
  rightArm.position.set(1.0, 3.5, 0);

  // Hands
  const handGeometry = new SphereGeometry(0.2, 16, 16);
  const handMaterial = new MeshStandardMaterial({ map: skinTexture });

  const leftHand = new Mesh(handGeometry, handMaterial);
  leftHand.position.set(-1.0, 3.5, 0); // Adjusted position for hand

  const rightHand = new Mesh(handGeometry, handMaterial);
  rightHand.position.set(1.0, 3.5, 0); // Adjusted position for hand

  // Legs
  const legGeometry = new CylinderGeometry(0.25, 0.25, 2.0, 32);
  const legMaterial = new MeshStandardMaterial({
    map: clothingTexture,
    color: "black",
  });

  const leftLeg = new Mesh(legGeometry, legMaterial);
  leftLeg.position.set(-0.3, 1, 0);

  const rightLeg = new Mesh(legGeometry, legMaterial);
  rightLeg.position.set(0.3, 1, 0);

  // Feet
  const footGeometry = new BoxGeometry(0.6, 0.2, 1);
  const footMaterial = new MeshStandardMaterial({ map: clothingTexture });

  const leftFoot = new Mesh(footGeometry, footMaterial);
  leftFoot.position.set(-0.3, 0.2, 0);

  const rightFoot = new Mesh(footGeometry, footMaterial);
  rightFoot.position.set(0.3, 0.2, 0);

  // Assemble the human
  human.add(head);
  human.add(torso);
  human.add(leftArm);
  human.add(rightArm);
  human.add(leftHand);
  human.add(rightHand);
  human.add(leftLeg);
  human.add(rightLeg);
  human.add(leftFoot);
  human.add(rightFoot);

  const gun = createGun();
  human.add(gun); // Attach gun to huma

  return human;
}

export function createGun(): Mesh {
  const gunGeometry = new BoxGeometry(0.5, 0.1, 1.2); // Basic gun shape
  const gunMaterial = new MeshStandardMaterial({ color: 0x333333 }); // Dark color for gun
  const gun = new Mesh(gunGeometry, gunMaterial);

  // Position the gun
  gun.rotation.x = Math.PI / 4; // Rotate to hold it
  gun.position.set(1.2, 3.5, 0); // Position it in the right hand

  return gun;
}
