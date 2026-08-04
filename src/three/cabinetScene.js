import * as THREE from "three";
import { createPlantMesh } from "./createPlant";

const SHELF_SIZE = 3;
const WOOD = 0x8d5a38;
const WOOD_DARK = 0x5a3822;
const WOOD_LIGHT = 0xa8744a;

function woodMaterial(color = WOOD) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.9,
    metalness: 0.04,
  });
}

function disposeObject(object) {
  object.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) child.material.forEach((mat) => mat.dispose());
      else child.material.dispose();
    }
  });
}

export function createCabinetScene(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a1f1c);
  scene.fog = new THREE.Fog(0x0a1f1c, 8, 16);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 40);
  camera.position.set(0, 0.05, 6.2);

  const hemi = new THREE.HemisphereLight(0xdff5ea, 0x3d2618, 0.85);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xfff1dd, 1.15);
  key.position.set(2.2, 5.5, 5.5);
  key.target.position.set(0, 0.8, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0008;
  key.shadow.normalBias = 0.035;
  key.shadow.radius = 3;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 18;
  key.shadow.camera.left = -5;
  key.shadow.camera.right = 5;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -5;
  scene.add(key);
  scene.add(key.target);

  const fill = new THREE.DirectionalLight(0x9ab7af, 0.55);
  fill.position.set(-3.5, 3, 2.5);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xc5e8d8, 0.25);
  rim.position.set(0, 2, -4);
  scene.add(rim);

  const root = new THREE.Group();
  scene.add(root);

  const cabinet = new THREE.Group();
  root.add(cabinet);

  const plantsRoot = new THREE.Group();
  cabinet.add(plantsRoot);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let plantMeshes = [];
  let shelfCount = 2;
  let pointerDown = null;
  let frameId = 0;
  let disposed = false;

  function buildCabinetShell(shelves) {
    while (cabinet.children.length) {
      const child = cabinet.children[0];
      cabinet.remove(child);
      if (child !== plantsRoot) disposeObject(child);
    }
    cabinet.add(plantsRoot);

    const width = 3.6;
    const depth = 1.15;
    const shelfGap = 1.35;
    const shelfThickness = 0.1;
    const topThickness = 0.14;
    const bottomTop = 0.16;
    // Roof sits just above the top row — same clearance as between shelves
    const topClearance = 1.2;
    const height = bottomTop + (shelves - 1) * shelfGap + topClearance;

    const outer = woodMaterial(WOOD);
    const inner = woodMaterial(WOOD_DARK);
    const plank = woodMaterial(WOOD_LIGHT);

    const back = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.12), inner);
    back.position.set(0, height / 2, -depth / 2);
    back.receiveShadow = true;
    cabinet.add(back);

    const left = new THREE.Mesh(new THREE.BoxGeometry(0.12, height, depth), outer);
    left.position.set(-width / 2, height / 2, 0);
    left.castShadow = true;
    left.receiveShadow = true;
    cabinet.add(left);

    const right = new THREE.Mesh(new THREE.BoxGeometry(0.12, height, depth), outer);
    right.position.set(width / 2, height / 2, 0);
    right.castShadow = true;
    right.receiveShadow = true;
    cabinet.add(right);

    // Lid sits on top of the side walls (not straddling the rim)
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.2, topThickness, depth + 0.2),
      outer,
    );
    top.position.set(0, height + topThickness / 2, 0);
    top.castShadow = true;
    top.receiveShadow = true;
    cabinet.add(top);

    const bottom = new THREE.Mesh(new THREE.BoxGeometry(width, 0.16, depth), outer);
    bottom.position.set(0, 0.08, 0);
    bottom.receiveShadow = true;
    cabinet.add(bottom);

    // Elevated shelf boards (bottom row sits on the cabinet floor)
    for (let i = 1; i < shelves; i += 1) {
      const surfaceY = bottomTop + i * shelfGap;
      const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(width - 0.2, shelfThickness, depth - 0.14),
        plank,
      );
      shelf.position.set(0, surfaceY - shelfThickness / 2, 0.04);
      shelf.castShadow = true;
      shelf.receiveShadow = true;
      cabinet.add(shelf);
    }

    const totalHeight = height + topThickness;
    cabinet.position.y = -totalHeight * 0.5;
    const fitDistance = Math.max(5.6, totalHeight * 1.55 + shelves * 0.15);
    camera.position.set(0, 0.05, fitDistance);
    camera.lookAt(0, 0.05, 0);
  }

  function clearPlants() {
    while (plantsRoot.children.length) {
      const child = plantsRoot.children[0];
      plantsRoot.remove(child);
      disposeObject(child);
    }
    plantMeshes = [];
  }

  function setPlants(plants) {
    clearPlants();
    const list = plants?.length ? plants : [];
    shelfCount = Math.max(1, Math.ceil(list.length / SHELF_SIZE));
    buildCabinetShell(shelfCount);

    const shelfGap = 1.35;
    const bottomTop = 0.16;
    const slotWidth = 1.05;

    list.forEach((plant, index) => {
      const shelfIndex = Math.floor(index / SHELF_SIZE);
      const rowFromBottom = shelfCount - 1 - shelfIndex;
      const slot = index % SHELF_SIZE;
      const mesh = createPlantMesh(plant);
      // Pot bottom sits flush on the shelf surface
      const y = bottomTop + rowFromBottom * shelfGap;
      const x = (slot - 1) * slotWidth;
      mesh.position.set(x, y, 0.08);
      mesh.scale.setScalar(0.82);
      plantsRoot.add(mesh);
      plantMeshes.push(mesh);
    });
  }

  function resize() {
    const width = canvas.clientWidth || canvas.parentElement?.clientWidth || 640;
    const height = canvas.clientHeight || 420;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  }

  function getPlantIntersection(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(plantMeshes, true);
    if (!hits.length) return null;
    let object = hits[0].object;
    while (object && !object.userData?.plantId && object.parent) object = object.parent;
    return object?.userData?.plantId != null ? object.userData : null;
  }

  function onPointerDown(event) {
    pointerDown = { x: event.clientX, y: event.clientY };
  }

  function onPointerUp(event) {
    if (!pointerDown) return;
    const dx = event.clientX - pointerDown.x;
    const dy = event.clientY - pointerDown.y;
    pointerDown = null;
    if (Math.hypot(dx, dy) > 8) return;
    const hit = getPlantIntersection(event.clientX, event.clientY);
    if (hit && typeof api.onPlantSelect === "function") {
      api.onPlantSelect(hit.plantId, hit.plantName);
    }
  }

  function onPointerMove(event) {
    const hit = getPlantIntersection(event.clientX, event.clientY);
    canvas.style.cursor = hit ? "pointer" : "grab";
  }

  const clock = new THREE.Clock();

  function tick() {
    if (disposed) return;
    frameId = requestAnimationFrame(tick);
    const t = clock.getElapsedTime();

    plantMeshes.forEach((mesh) => {
      const foliage = mesh.userData.foliage;
      if (!foliage) return;
      const sway = mesh.userData.sway || 0.02;
      const phase = mesh.userData.phase || 0;
      foliage.rotation.z = Math.sin(t * 1.1 + phase * Math.PI * 2) * sway;
      foliage.rotation.x = Math.cos(t * 0.85 + phase * Math.PI * 2) * sway * 0.45;
    });

    renderer.render(scene, camera);
  }

  const resizeObserver = new ResizeObserver(() => resize());
  resizeObserver.observe(canvas.parentElement || canvas);

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointermove", onPointerMove);

  resize();
  buildCabinetShell(2);
  tick();

  const api = {
    onPlantSelect: null,
    setPlants,
    resize,
    dispose() {
      disposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointermove", onPointerMove);
      clearPlants();
      disposeObject(cabinet);
      renderer.dispose();
    },
  };

  return api;
}
