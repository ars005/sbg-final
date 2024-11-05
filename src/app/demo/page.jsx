// pages/game.js
"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const Game = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    const character = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    character.position.set(0, 0.5, 0);
    scene.add(character);

    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.z = 5;

    const enemies = [];
    const enemyMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    for (let i = 0; i < 3; i++) {
      const enemy = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        enemyMaterial.clone()
      );
      enemy.position.set(Math.random() * 20 - 10, 0.5, Math.random() * 20 - 10);
      enemy.userData.hit = false;
      scene.add(enemy);
      enemies.push(enemy);
    }

    let projectiles = [];
    let moveDirection = new THREE.Vector2();
    let aimDirection = new THREE.Vector2(0, -1);
    const moveSpeed = 0.1;
    const zoomFactor = 2;
    let isZoomed = false;
    const aimRadius = 10;

    const joystick = document.getElementById("joystick");
    const stick = document.getElementById("stick");
    const aimJoystick = document.getElementById("aimJoystick");
    const aimStick = document.getElementById("aimStick");
    const aimDot = document.getElementById("aimDot");

    function handleJoystick(touch, joystick, stick, vector) {
      const rect = joystick.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = touch.clientX - centerX;
      const dy = touch.clientY - centerY;
      const distance = Math.min(Math.sqrt(dx * dx + dy * dy), rect.width / 2);
      const angle = Math.atan2(dy, dx);

      vector.set(
        Math.cos(angle) * (distance / (rect.width / 2)),
        Math.sin(angle) * (distance / (rect.width / 2))
      );
      stick.style.transform = `translate(${dx}px, ${dy}px)`;
    }

    joystick.addEventListener("touchstart", (e) =>
      handleJoystick(e.touches[0], joystick, stick, moveDirection)
    );
    joystick.addEventListener("touchmove", (e) =>
      handleJoystick(e.touches[0], joystick, stick, moveDirection)
    );
    joystick.addEventListener("touchend", () => {
      moveDirection.set(0, 0);
      stick.style.transform = "translate(0, 0)";
    });

    aimJoystick.addEventListener("touchstart", (e) => {
      handleJoystick(e.touches[0], aimJoystick, aimStick, aimDirection);
    });
    aimJoystick.addEventListener("touchmove", (e) => {
      handleJoystick(e.touches[0], aimJoystick, aimStick, aimDirection);
    });
    aimJoystick.addEventListener("touchend", () => {
      aimStick.style.transform = "translate(0, 0)";
    });

    document.getElementById("shootButton").addEventListener("click", () => {
      // Create projectile and set its position and direction
      const projectile = new THREE.Mesh(
        new THREE.SphereGeometry(0.1),
        new THREE.MeshStandardMaterial({ color: 0xffff00 })
      );
      projectile.position.copy(character.position);
      const direction = new THREE.Vector3(
        aimDirection.x,
        0,
        -aimDirection.y
      ).normalize();
      projectile.userData.velocity = direction.multiplyScalar(0.5);
      projectiles.push(projectile);
      scene.add(projectile);
    });

    document.getElementById("zoomButton").addEventListener("click", () => {
      isZoomed = !isZoomed;
      camera.fov = isZoomed ? 75 / zoomFactor : 75;
      camera.updateProjectionMatrix();
    });

    function checkCollisions() {
      projectiles.forEach((projectile, index) => {
        enemies.forEach((enemy) => {
          if (
            !enemy.userData.hit &&
            projectile.position.distanceTo(enemy.position) < 0.5
          ) {
            enemy.material.color.set(0xff0000);
            enemy.userData.hit = true;
            scene.remove(projectile);
            projectiles.splice(index, 1);
          }
        });
      });
    }

    function updateAimDot() {
      const aimPosition = character.position
        .clone()
        .add(
          new THREE.Vector3(aimDirection.x, 0, -aimDirection.y)
            .normalize()
            .multiplyScalar(aimRadius)
        );
      const screenPosition = aimPosition.clone().project(camera);

      const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
      const y = -(screenPosition.y * 0.5 - 0.5) * window.innerHeight;

      aimDot.style.left = `${x}px`;
      aimDot.style.top = `${y}px`;
    }

    function animate() {
      requestAnimationFrame(animate);

      // Move character based on joystick input
      character.position.x += moveDirection.x * moveSpeed;
      character.position.z -= moveDirection.y * moveSpeed;

      updateAimDot();

      camera.position.set(
        character.position.x,
        character.position.y + 2,
        character.position.z + 5
      );
      camera.lookAt(character.position);

      // Update projectiles
      projectiles.forEach((projectile, index) => {
        projectile.position.add(projectile.userData.velocity);
        if (projectile.position.length() > 20) {
          scene.remove(projectile);
          projectiles.splice(index, 1);
        }
      });

      checkCollisions();
      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener("resize", () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });

    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div>
      <div ref={mountRef}></div>
      <div id="joystick">
        <div id="stick"></div>
      </div>
      <div id="aimJoystick">
        <div id="aimStick"></div>
      </div>
      <button id="shootButton">Shoot</button>
      <button id="zoomButton">Zoom</button>
      <div id="aimDot"></div>
      <style jsx>{`
        body {
          margin: 0;
          overflow: hidden;
        }

        canvas {
          display: block;
        }

        #joystick,
        #aimJoystick {
          position: absolute;
          bottom: 20px;
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          touch-action: none;
        }

        #joystick {
          left: 20px;
        }

        #aimJoystick {
          right: 20px;
        }

        #stick,
        #aimStick {
          position: absolute;
          width: 50px;
          height: 50px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 50%;
          left: 25px;
          top: 25px;
        }

        #shootButton {
          position: absolute;
          bottom: 160px;
          right: 50px;
          padding: 10px 15px;
          background-color: white;
          border: 1px solid #000;
          border-radius: 5px;
          cursor: pointer;
        }

        #zoomButton {
          position: absolute;
          bottom: 80px;
          right: 50px;
          padding: 10px 15px;
          background-color: white;
          border: 1px solid #000;
          border-radius: 5px;
          cursor: pointer;
        }

        #aimDot {
          position: absolute;
          width: 10px;
          height: 10px;
          background-color: red;
          border-radius: 50%;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default Game;
