// obstacles/house.ts
import {
  Mesh,
  MeshBasicMaterial,
  BoxGeometry,
  CylinderGeometry,
  Group,
} from "three";

export const createHouse = (
  x: number,
  y: number,
  z: number,
  size: number
): Group => {
  const house = new Group();

  // Main building
  const buildingGeometry = new BoxGeometry(size, size * 0.6, size); // Adjust height based on size
  const buildingMaterial = new MeshBasicMaterial({ color: 0xffddc1 }); // Light color
  const building = new Mesh(buildingGeometry, buildingMaterial);

  // Roof
  const roofGeometry = new CylinderGeometry(0, size * 0.7, size * 0.6, 4); // Cone shape for the roof
  const roofMaterial = new MeshBasicMaterial({ color: 0xa52a2a }); // Brown color
  const roof = new Mesh(roofGeometry, roofMaterial);
  roof.position.y = size * 0.6; // Move roof up
  roof.rotation.y = Math.PI / 4; // Rotate roof for better alignment

  // Windows
  const windowGeometry = new BoxGeometry(size * 0.3, size * 0.2, 0.1);
  const windowMaterial = new MeshBasicMaterial({ color: 0x87ceeb }); // Light blue for windows
  const window1 = new Mesh(windowGeometry, windowMaterial);
  window1.position.set(-size * 0.8, size * 0.3, size * 0.5); // Adjust window position
  const window2 = new Mesh(windowGeometry, windowMaterial);
  window2.position.set(size * 0.8, size * 0.3, size * 0.5); // Adjust window position

  // Door
  const doorGeometry = new BoxGeometry(size * 0.4, size * 0.5, 0.1);
  const doorMaterial = new MeshBasicMaterial({ color: 0x8b4513 }); // Brown for the door
  const door = new Mesh(doorGeometry, doorMaterial);
  door.position.set(0, size * 0.25, size * 0.5); // Center door

  // Add all parts to the house group
  house.add(building);
  house.add(roof);
  house.add(window1);
  house.add(window2);
  house.add(door);
  house.position.set(x, y + 10, z);
  house.scale.setScalar(10);

  return house;
};
