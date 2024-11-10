"use client";
import { createHouse } from "@/components/house";
import { createHuman } from "@/components/human";
import { initGame } from "@/components/init";
import { createTree } from "@/components/tree";
import { Human } from "@/types";
import { createProjectile, handleMovement } from "@/utils";
import {
  useMutation,
  useMyPresence,
  useOthers,
  useSelf,
  useStorage,
} from "@liveblocks/react/suspense";
import { useEffect, useRef } from "react";
import { Box3, Group, Mesh, Scene, Vector2, Vector3 } from "three";

export default function Game() {
  const { name, avatar, email } = useSelf((me) => me.info);
  const mountRef = useRef<HTMLCanvasElement | null>(null);
  const positionRef = useRef({ x: 0, y: 0, z: 0 });

  const [myPresence, updateMyPresence] = useMyPresence();
  const others = useOthers();
  const enemies = useRef<Human[]>([]);
  const sceneRef = useRef<Scene | null>(null);
  const characterRef = useRef<Human | null>(null);

  const players = useStorage((root) => root.player);

  const addPlayers = useMutation(({ storage }, who) => {
    storage.get("player").push(who);
  }, []);

  const del = useMutation(({ storage }) => {
    storage.get("player").clear();
  }, []);

  useEffect(() => {
    del();
    const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
    const { scene, camera, renderer, controls } = initGame(canvas);
    sceneRef.current = scene;

    createTree(scene);
    createHouse(scene);

    const character = createHuman() as Human;
    characterRef.current = character;
    character.userData.bullets = 50;
    character.userData.health = 100;
    character.userData.id = email;
    scene.add(character);
    camera.position.z = 5;
    camera.lookAt(character.position);

    let projectiles: Human[] = [];
    const moveSpeed = 0.3;
    const aimRadius = 100;
    let aimDirection = new Vector2(0, -1);
    const aimDot = document.querySelector("#aimDot") as HTMLDivElement;

    const keys: Record<string, boolean> = {};
    window.addEventListener("keydown", (event) => {
      keys[event.key] = true;
      if (event.code === "Space") shoot();
    });
    window.addEventListener("keyup", (event) => {
      keys[event.key] = false;
    });

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
      const direction = new Vector3(
        aimDirection.x,
        0,
        -aimDirection.y
      ).normalize();
      const projectile = createProjectile(scene, character.position, direction);
      projectiles.push(projectile);
    };

    const characterBox = new Box3().setFromObject(character);

    const obstacles = scene.children.filter(
      (child) =>
        (child instanceof Mesh || child instanceof Group) &&
        child.name !== "character" &&
        child.name !== "land"
    );

    const animate = () => {
      requestAnimationFrame(animate);
      handleMovement(
        character,
        characterBox,
        camera,
        keys,
        moveSpeed,
        obstacles
      );
      controls.update();
      controls.target.copy(character.position);

      projectiles.forEach((projectile, index) => {
        projectile.position.add(projectile.userData.velocity || new Vector3());
        if (projectile.position.length() > 200) {
          scene.remove(projectile);
          projectiles.splice(index, 1);
        }

        enemies.current.forEach((enemy, enemyIndex) => {
          const enemyBox = new Box3().setFromObject(enemy);
          const projectileBox = new Box3().setFromObject(projectile);

          if (projectileBox.intersectsBox(enemyBox)) {
            enemy.userData.hit = true;

            scene.remove(enemy);
            scene.remove(projectile);
            enemies.current.splice(enemyIndex, 1);
            projectiles.splice(index, 1);
            addPlayers(enemy.userData.id);
            console.log("dead");
          }
        });
      });

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
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    others.map((other) => {
      if (
        !enemies.current.find((enemy) => enemy.userData.id === other.info.email)
      ) {
        if (!players.find((player) => player === other.info.email)) {
          const enemy = createHuman() as Human;
          enemy.userData.hit = false;
          enemy.userData.id = other.info.email;
          scene.add(enemy);
          enemies.current.push(enemy);
        }
      }
    });

    enemies.current.forEach((enemy, index) => {
      if (!others.find((other) => other.info.email === enemy.userData.id)) {
        scene.remove(enemy);
        enemies.current.splice(index, 1);
      }
    });

    others
      .filter((other) => other.presence.position !== null)
      .forEach((person) => {
        const enemy = enemies.current.find(
          (enemy) => enemy.userData.id === person.info.email
        );
        if (enemy && person.presence.position) {
          enemy.position.copy(person.presence.position);
        }
      });
  }, [others, enemies]);

  useEffect(() => {
    players.map((player) => {
      if (player === characterRef.current?.userData.id)
        sceneRef.current?.remove(characterRef.current!);
    });
  }, [players]);

  return (
    <div className="relative overflow-hidden">
      <canvas ref={mountRef} id="canvas" className="w-full h-full" />
      <div id="aimDot" className="absolute w-1 h-1 rounded-full bg-red" />
    </div>
  );
}
