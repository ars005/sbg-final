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

    const planeGeometry = new THREE.PlaneGeometry(500, 500);
    const textureLoader = new THREE.TextureLoader();
    const landTexture = textureLoader.load("/images/textures/land.png");
    const planeMaterial = new THREE.MeshBasicMaterial({ map: landTexture });
    const land = new THREE.Mesh(planeGeometry, planeMaterial);
    land.rotation.x = -Math.PI / 2;
    scene.add(land);

    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    const character = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    character.position.set(0, 0.5, 0);
    scene.add(character);

    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 2, 5);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25;
    controls.target.copy(character.position); // Keep the controls target at the character

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
    const moveSpeed = 0.1;
    const aimRadius = 10;

    let aimDirection = new THREE.Vector2(0, -1);
    const aimDot = document.getElementById("aimDot");

    // Handle keyboard input for movement
    const keys = {};
    window.addEventListener("keydown", (event) => {
      keys[event.key] = true;
    });
    window.addEventListener("keyup", (event) => {
      keys[event.key] = false;
    });

    function handleMovement() {
      const direction = new THREE.Vector3();

      if (keys["ArrowUp"] || keys["w"]) direction.z -= moveSpeed;
      if (keys["ArrowDown"] || keys["s"]) direction.z += moveSpeed;
      if (keys["ArrowLeft"] || keys["a"]) direction.x -= moveSpeed;
      if (keys["ArrowRight"] || keys["d"]) direction.x += moveSpeed;

      // Move the character in the direction it's facing
      character.position.add(direction.applyQuaternion(character.quaternion));
    }

    function updateAim(event) {
      const rect = mountRef.current.getBoundingClientRect();
      const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = (-(event.clientY - rect.top) / rect.height) * 2 + 1;

      aimDirection.set(mouseX, mouseY).normalize();
      updateAimDot();
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

    document.addEventListener("mousemove", updateAim);
    document.addEventListener("click", () => {
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

    function animate() {
      requestAnimationFrame(animate);

      handleMovement();

      // Update the controls (this will handle mouse movement)
      controls.update();

      // Keep the controls target at the character
      controls.target.copy(character.position);

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
      <div id="aimDot"></div>
      <style jsx>{`
        body {
          margin: 0;
          overflow: hidden;
        }

        canvas {
          display: block;
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
