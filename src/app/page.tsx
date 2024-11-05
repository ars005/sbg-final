"use client";
import { houseDetails, treePositions } from "@/components/constants";
import { createHouse } from "@/components/house";
import { createHuman } from "@/components/human";
import { initGame } from "@/components/init";
import { createTree } from "@/components/tree";
import { isOverlapping } from "@/utils";
import { useMyPresence, useOthers } from "@liveblocks/react/suspense";
import { useEffect, useRef } from "react";
import {
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Scene,
  SphereGeometry,
  Vector2,
  Vector3,
} from "three";

// Define the ExtendedObject3D interface
interface ExtendedObject3D extends Object3D {
  userData: {
    hit?: boolean;
    velocity?: Vector3;
    id?: string;
  };
}

// Define the position interface for clarity

export default function Game() {
  const mountRef = useRef<HTMLCanvasElement | null>(null);
  const positionRef = useRef({ x: 0, y: 0, z: 0 });

  const [myPresence, updateMyPresence] = useMyPresence();
  const others = useOthers();
  const enemies = useRef<ExtendedObject3D[]>([]); // Store enemies as ExtendedObject3D
  const sceneRef = useRef<Scene | null>(null); // Ref for scene

  useEffect(() => {
    const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
    const { scene, camera, renderer, controls } = initGame(canvas);
    sceneRef.current = scene; // Store the scene in ref

    const minDistance = 10;
    const placedTreePositions: { x: number; z: number }[] = [];
    const placedHousePositions: { x: number; z: number }[] = [];

    treePositions.forEach((position) => {
      if (!isOverlapping(position, placedTreePositions, minDistance)) {
        const tree = createTree(position.x, 0, position.z);
        scene.add(tree);
        placedTreePositions.push(position);
      }
    });

    houseDetails.forEach(({ position, size }) => {
      if (!isOverlapping(position, placedHousePositions, minDistance)) {
        const house = createHouse(position.x, 0, position.z, size);
        scene.add(house);
        placedHousePositions.push(position);
      }
    });

    const character = createHuman() as ExtendedObject3D;

    scene.add(character);

    camera.position.z = 10;
    camera.lookAt(character.position);

    const enemyMaterial = new MeshStandardMaterial({ color: 0x0000ff });

    // Create enemies for existing characters in 'others' initially
    others.forEach((other) => {
      const enemy = new Mesh(
        new BoxGeometry(5, 5, 5),
        enemyMaterial.clone()
      ) as ExtendedObject3D;
      enemy.position.set(Math.random() * 20 - 50, 0.5, Math.random() * 20 - 50);
      enemy.userData.hit = false;
      enemy.userData.id = other.id; // Assuming other.id is unique for each player
      scene.add(enemy);
      enemies.current.push(enemy);
    });

    let projectiles: ExtendedObject3D[] = [];
    const moveSpeed = 0.3;
    const aimRadius = 200;

    let aimDirection = new Vector2(0, -1);
    const aimDot = document.querySelector("#aimDot") as HTMLDivElement;

    const keys: Record<string, boolean> = {};
    window.addEventListener("keydown", (event) => {
      keys[event.key] = true;
      if (event.code === "Space") {
        shoot();
      }
    });
    window.addEventListener("keyup", (event) => {
      keys[event.key] = false;
    });

    const handleMovement = () => {
      const direction = new Vector3();
      if (keys["ArrowUp"] || keys["w"]) direction.z -= moveSpeed;
      if (keys["ArrowDown"] || keys["s"]) direction.z += moveSpeed;
      if (keys["ArrowLeft"] || keys["a"]) direction.x -= moveSpeed;
      if (keys["ArrowRight"] || keys["d"]) direction.x += moveSpeed;

      character.position.add(direction.applyQuaternion(character.quaternion));
    };

    const updateAim = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = (-(e.clientY - rect.top) / rect.height) * 2 + 1;
      aimDirection.set(mouseX, mouseY).normalize();
      updateAimDot();
    };

    const updateAimDot = () => {
      const aimPosition = character.position
        .clone()
        .add(
          new Vector3(aimDirection.x, 0, -aimDirection.y)
            .normalize()
            .multiplyScalar(aimRadius)
        );
      const screenPosition = aimPosition.clone().project(camera);
      const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
      const y = -(screenPosition.y * 0.5 - 0.5) * window.innerHeight;
      aimDot.style.left = `${x}px`;
      aimDot.style.top = `${y}px`;
    };

    const shoot = () => {
      const projectile = new Mesh(
        new SphereGeometry(0.5),
        new MeshStandardMaterial({ color: 0xff0000 })
      ) as ExtendedObject3D;
      projectile.position.copy(character.position);

      const direction = new Vector3(
        aimDirection.x,
        0,
        -aimDirection.y
      ).normalize();
      projectile.userData.velocity = direction.multiplyScalar(10);
      projectiles.push(projectile);
      scene.add(projectile);
    };

    const checkCollisions = () => {
      projectiles.forEach((projectile, index) => {
        enemies.current.forEach((enemy) => {
          if (
            !enemy.userData.hit &&
            projectile.position.distanceTo(enemy.position) < 20 &&
            enemy instanceof Mesh
          ) {
            (enemy.material as MeshStandardMaterial).color.set(0xff0000);
            enemy.userData.hit = true;
            scene.remove(projectile);
            projectiles.splice(index, 1);
          }
        });
      });
    };

    const animate = () => {
      requestAnimationFrame(animate);
      handleMovement();
      controls.update();

      controls.target.copy(character.position);

      projectiles.forEach((projectile, index) => {
        projectile.position.add(projectile.userData.velocity || new Vector3());
        if (projectile.position.length() > 200) {
          scene.remove(projectile);
          projectiles.splice(index, 1);
        }
      });

      checkCollisions();
      renderer.render(scene, camera);
      const { x, y, z } = character.position;
      if (
        x !== positionRef.current.x ||
        y !== positionRef.current.y ||
        z !== positionRef.current.z
      ) {
        positionRef.current = { x, y, z };
        updateMyPresence({ position: { x, y, z } });
      }
    };

    animate();

    window.addEventListener("mousemove", updateAim);

    return () => {
      renderer.dispose();
      window.removeEventListener("mousemove", updateAim);
    };
  }, []); // Runs only on mount

  // New useEffect to handle new characters from others
  useEffect(() => {
    const enemyMaterial = new MeshStandardMaterial({ color: 0x0000ff });
    const scene = sceneRef.current; // Access the scene from the ref
    if (!scene) return; // If the scene is not initialized, return early

    // Create new enemies for new players
    others.forEach((other) => {
      // Check if the enemy already exists
      if (!enemies.current.find((enemy) => enemy.userData.id === other.id)) {
        const enemy = new Mesh(
          new BoxGeometry(5, 5, 5),
          enemyMaterial.clone()
        ) as ExtendedObject3D;
        enemy.position.set(
          Math.random() * 20 - 50,
          0.5,
          Math.random() * 20 - 50
        );
        enemy.userData.hit = false;
        enemy.userData.id = other.id; // Assuming other.id is unique for each player
        scene.add(enemy); // Add the enemy to the scene
        enemies.current.push(enemy);
      }
    });

    // Clean up removed players' enemies
    enemies.current.forEach((enemy, index) => {
      if (!others.find((other) => other.id === enemy.userData.id)) {
        scene.remove(enemy);
        enemies.current.splice(index, 1);
      }
    });
  }, [others]);

  const handlePointerLeave = () => {};
  const handlePointerMove = () => {};
  console.log(others);
  return (
    <div className="relative overflow-hidden">
      <canvas ref={mountRef} id="canvas" className="w-full h-full" />
      <div
        id="aimDot"
        className="absolute w-1 h-1 rounded-full bg-red-500 pointer-events-none"
      />
    </div>
  );
}
