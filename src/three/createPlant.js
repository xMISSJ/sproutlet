import * as THREE from "three";
import { normalizePlantForm } from "../data/plantForms";

const LEAF = [
  0x3f7a4d,
  0x2f6b45,
  0x5c9a68,
  0x678a73,
  0x4a7c59,
  0x75d2bc,
];

const POT = [0x8d5a38, 0x6a4128, 0xb07a52, 0x5c4030];

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pick(list, hash, offset = 0) {
  return list[(hash + offset) % list.length];
}

function makeLeafMaterial(color) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.72,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });
}

function addPot(group, hash) {
  const potMat = new THREE.MeshStandardMaterial({
    color: pick(POT, hash),
    roughness: 0.88,
    metalness: 0.05,
  });
  const soilMat = new THREE.MeshStandardMaterial({
    color: 0x2a1c12,
    roughness: 1,
  });

  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.28, 16), potMat);
  pot.position.y = 0.14;
  pot.castShadow = true;
  pot.receiveShadow = true;
  group.add(pot);

  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 16), potMat);
  rim.position.y = 0.28;
  rim.castShadow = true;
  group.add(rim);

  const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 16), soilMat);
  soil.position.y = 0.27;
  group.add(soil);
}

function addMonstera(group, hash) {
  const leafMat = makeLeafMaterial(pick(LEAF, hash));
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x35553a, roughness: 0.8 });

  for (let i = 0; i < 5; i += 1) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.45, 6), stemMat);
    const angle = (i / 5) * Math.PI * 2;
    stem.position.set(Math.cos(angle) * 0.05, 0.48, Math.sin(angle) * 0.05);
    stem.rotation.z = Math.cos(angle) * 0.25;
    stem.rotation.x = Math.sin(angle) * 0.2;
    group.add(stem);

    const leaf = new THREE.Mesh(new THREE.CircleGeometry(0.22, 10), leafMat);
    leaf.position.set(Math.cos(angle) * 0.18, 0.62 + (i % 2) * 0.08, Math.sin(angle) * 0.18);
    leaf.rotation.set(-0.9, angle, 0.2);
    leaf.castShadow = true;
    group.add(leaf);
  }
}

function addSnake(group, hash) {
  const leafMat = makeLeafMaterial(pick(LEAF, hash, 1));
  for (let i = 0; i < 6; i += 1) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.02), leafMat);
    const angle = (i / 6) * Math.PI * 2;
    blade.position.set(Math.cos(angle) * 0.08, 0.64, Math.sin(angle) * 0.08);
    blade.rotation.y = angle;
    blade.rotation.z = Math.cos(angle) * 0.08;
    blade.castShadow = true;
    group.add(blade);
  }
}

function addTrailing(group, hash) {
  const leafMat = makeLeafMaterial(pick(LEAF, hash, 2));
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x3d6b45, roughness: 0.85 });

  for (let i = 0; i < 4; i += 1) {
    const vine = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.7, 5), stemMat);
    const angle = (i / 4) * Math.PI * 2;
    vine.position.set(Math.cos(angle) * 0.1, 0.35, Math.sin(angle) * 0.1);
    vine.rotation.z = 0.85 * Math.cos(angle);
    vine.rotation.x = 0.85 * Math.sin(angle);
    group.add(vine);

    for (let j = 0; j < 3; j += 1) {
      const leaf = new THREE.Mesh(new THREE.CircleGeometry(0.09, 8), leafMat);
      leaf.position.set(
        Math.cos(angle) * (0.16 + j * 0.08),
        0.55 - j * 0.14,
        Math.sin(angle) * (0.16 + j * 0.08),
      );
      leaf.rotation.set(-0.4, angle, 0.4);
      leaf.castShadow = true;
      group.add(leaf);
    }
  }
}

function addBush(group, hash) {
  const leafMat = makeLeafMaterial(pick(LEAF, hash, 3));
  for (let i = 0; i < 7; i += 1) {
    const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14, 0), leafMat);
    const angle = (i / 7) * Math.PI * 2;
    puff.position.set(Math.cos(angle) * 0.12, 0.48 + (i % 3) * 0.08, Math.sin(angle) * 0.12);
    puff.castShadow = true;
    group.add(puff);
  }
  const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 0), leafMat);
  crown.position.y = 0.72;
  crown.castShadow = true;
  group.add(crown);
}

function addCactus(group, hash) {
  const mat = new THREE.MeshStandardMaterial({
    color: pick([0x4f7a4f, 0x678a73, 0x556e69], hash),
    roughness: 0.85,
  });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.55, 10), mat);
  body.position.y = 0.55;
  body.castShadow = true;
  group.add(body);

  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.24, 8), mat);
  arm.position.set(0.16, 0.52, 0);
  arm.rotation.z = -Math.PI / 2.4;
  arm.castShadow = true;
  group.add(arm);
}

function addZz(group, hash) {
  const leafMat = makeLeafMaterial(pick(LEAF, hash, 4));
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x2f4a34, roughness: 0.75 });

  for (let i = 0; i < 5; i += 1) {
    const angle = (i / 5) * Math.PI * 2;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.03, 0.55, 6), stemMat);
    stem.position.set(Math.cos(angle) * 0.06, 0.52, Math.sin(angle) * 0.06);
    stem.rotation.z = Math.cos(angle) * 0.15;
    group.add(stem);

    for (let j = 0; j < 3; j += 1) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), leafMat);
      leaf.scale.set(1, 1.5, 0.55);
      leaf.position.set(
        Math.cos(angle) * 0.1,
        0.45 + j * 0.14,
        Math.sin(angle) * 0.1,
      );
      leaf.castShadow = true;
      group.add(leaf);
    }
  }
}

const STYLE_BY_FORM = {
  "broad-leaf": addMonstera,
  "upright-blades": addSnake,
  trailing: addTrailing,
  bushy: addBush,
  cactus: addCactus,
  "upright-stems": addZz,
};

/**
 * Build a small stylized plant mesh for the cabinet.
 * @param {{ id: string, name: string, plantId?: string|number, model_style?: string }} plant
 */
export function createPlantMesh(plant) {
  const group = new THREE.Group();
  const foliage = new THREE.Group();
  const hash = hashString(String(plant.id ?? plant.name ?? "plant"));
  const formId = normalizePlantForm(plant.model_style);
  const buildFoliage = STYLE_BY_FORM[formId] ?? addMonstera;

  addPot(group, hash);
  buildFoliage(foliage, hash);
  group.add(foliage);
  group.userData.foliage = foliage;
  group.userData.plantId = plant.plantId;
  group.userData.plantName = plant.name;
  group.userData.modelStyle = formId;
  group.userData.sway = 0.012 + (hash % 7) * 0.0015;
  group.userData.phase = (hash % 100) / 100;
  return group;
}
