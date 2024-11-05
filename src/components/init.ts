import {
  AmbientLight,
  BoxGeometry,
  Color,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  TextureLoader,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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

  controls.minPolarAngle = Math.PI / 4;
  controls.maxPolarAngle = (2 * Math.PI) / 4;

  const planeGeometry = new PlaneGeometry(500, 500);
  const textureLoader = new TextureLoader();
  const landTexture = textureLoader.load("/images/textures/land.png");
  const planeMaterial = new MeshBasicMaterial({ map: landTexture });
  const land = new Mesh(planeGeometry, planeMaterial);
  land.rotation.x = -Math.PI / 2;
  scene.add(land);

  scene.background = new Color("blue");

  const light = new AmbientLight();
  scene.add(light);

  return { scene, camera, renderer, controls };
}
