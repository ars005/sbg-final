"use client";
import { houseDetails, treePositions } from "@/components/constants";
import { initGame } from "@/components/init";
import { createHouse } from "@/components/house";
import { createTree } from "@/components/tree";
import { createHuman } from "@/components/human";
import { useEffect, useRef } from "react";
import {
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
  Vector2,
  Vector3,
} from "three";
import { isOverlapping } from "@/utils";

interface ExtendedObject3D extends Object3D {
  userData: {
    hit?: boolean;
    velocity?: Vector3;
  };
}

export default function Game() {
  const mountRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
    const { scene, camera, renderer, controls } = initGame(canvas);

    const minDistance = 10;
    const placedTreePositions = [];
    const placedHousePositions = [];

    treePositions.forEach((position) => {
      if (!isOverlapping(position, placedTreePositions, minDistance)) {
        const tree = createTree(position.x, 0, position.z);
        scene.add(tree);
        placedTreePositions.push(position); // Keep track of placed trees
      }
    });

    houseDetails.forEach(({ position, size }) => {
      if (!isOverlapping(position, placedHousePositions, minDistance)) {
        const house = createHouse(position.x, 0, position.z, size);
        scene.add(house);
        placedHousePositions.push(position); // Keep track of placed houses
      }
    });

    const character = createHuman() as ExtendedObject3D;
    scene.add(character);

    camera.position.z = 10;
    camera.lookAt(character.position);

    const enemies: ExtendedObject3D[] = [];
    const enemyMaterial = new MeshStandardMaterial({ color: 0x0000ff });
    for (let i = 0; i < 3; i++) {
      const enemy = new Mesh(
        new BoxGeometry(5, 5, 5),
        enemyMaterial.clone()
      ) as ExtendedObject3D;
      enemy.position.set(Math.random() * 20 - 50, 0.5, Math.random() * 20 - 50);
      enemy.userData.hit = false;
      scene.add(enemy);
      enemies.push(enemy);
    }

    let projectiles: ExtendedObject3D[] = [];
    const moveSpeed = 0.1;
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

    canvas.addEventListener("mousemove", updateAim);
    canvas.addEventListener("click", shoot);

    const checkCollisions = () => {
      projectiles.forEach((projectile, index) => {
        enemies.forEach((enemy) => {
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
    };

    animate();

    window.addEventListener("mousemove", updateAim);

    return () => {
      renderer.dispose();
      window.removeEventListener("mousemove", updateAim);
    };
  }, []);

  return (
    <div className="relative overflow-hidden">
      <canvas ref={mountRef} id="canvas"></canvas>
      <div
        id="aimDot"
        className="absolute w-2.5 h-2.5 bg-red-700 rounded-full pointer-events-none"
      ></div>
    </div>
  );
}
