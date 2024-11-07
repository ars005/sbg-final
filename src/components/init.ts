import {
  AmbientLight,
  CubeTextureLoader,
  Mesh,
  MeshBasicMaterial,
  MirroredRepeatWrapping,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  TextureLoader,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { degToRad } from "three/src/math/MathUtils.js";

export function initGame(canvas: HTMLCanvasElement) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );

  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.position.set(50, 10, 100);
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, renderer.domElement);

  controls.enableDamping = true;
  controls.dampingFactor = 0.25;

  controls.minDistance = 50;
  controls.maxDistance = 100;
  controls.minPolarAngle = degToRad(45);
  controls.maxPolarAngle = degToRad(84);

  const planeGeometry = new PlaneGeometry(5000, 5000);
  const lader = new TextureLoader();
  const landTexture = lader.load("/images/textures/land.png");
  landTexture.repeat.set(20, 20);
  landTexture.wrapS = MirroredRepeatWrapping;
  landTexture.wrapT = MirroredRepeatWrapping;
  const planeMaterial = new MeshBasicMaterial({ map: landTexture });
  const land = new Mesh(planeGeometry, planeMaterial);
  land.rotation.x = -Math.PI / 2;

  scene.add(land);

  const cubeTextureLoader = new CubeTextureLoader();
  cubeTextureLoader.setPath("/images/");
  const bg = cubeTextureLoader.load([
    "posx.jpg",
    "negx.jpg",
    "posy.jpg",
    "negy.jpg",
    "posz.jpg",
    "negz.jpg",
  ]);

  scene.background = bg;

  const light = new AmbientLight(0xffffff, 0.5);
  scene.add(light);

  return { scene, camera, renderer, controls };
}
