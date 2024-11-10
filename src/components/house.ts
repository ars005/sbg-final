// obstacles/house.ts
import {
  Mesh,
  MeshBasicMaterial,
  BoxGeometry,
  CylinderGeometry,
  Group,
  Scene,
} from "three";
import { houseDetails } from "./constants";

export const createHouse = (scene: Scene) => {
  const buildingMaterial = new MeshBasicMaterial({ color: 0xffddc1 }); // Light color

  const roofMaterial = new MeshBasicMaterial({ color: 0xa52a2a }); // Brown color

  const doorMaterial = new MeshBasicMaterial({ color: 0x8b4513 }); // Brown for the door

  houseDetails.forEach(({ position, size }) => {
    const buildingGeometry = new BoxGeometry(size, size * 0.6, size);
    const roofGeometry = new CylinderGeometry(0, size * 0.7, size * 0.6, 4);
    const doorGeometry = new BoxGeometry(size * 0.4, size * 0.5, 0.1);

    const house = new Group();

    const building = new Mesh(buildingGeometry, buildingMaterial);

    const roof = new Mesh(roofGeometry, roofMaterial);
    roof.position.y = size * 0.6;
    roof.rotation.y = Math.PI / 4;

    const door = new Mesh(doorGeometry, doorMaterial);
    door.position.set(0, size * 0.25 + 5, size * 0.5);

    house.add(building);
    house.add(roof);
    house.add(door);
    house.position.set(position.z, 5, position.z);
    house.scale.setScalar(size);
    scene.add(house);
  });
  return;
};
