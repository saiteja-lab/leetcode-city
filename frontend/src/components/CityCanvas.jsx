import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { selectCity } from "../store/store";

function shadeColor(hex, factor) {
  return new THREE.Color(hex).multiplyScalar(factor);
}

function registerMaterial(material, materialStore) {
  if (Array.isArray(material)) {
    material.forEach((entry) => materialStore.push(entry));
    return;
  }

  materialStore.push(material);
}

function createBoxMaterials(baseHex, glowHex, opacity = 1) {
  const shared = {
    emissive: shadeColor(glowHex, 0.18),
    emissiveIntensity: 0.08,
    metalness: 0.38,
    roughness: 0.56,
    flatShading: true,
    transparent: opacity < 1,
    opacity,
    fog: false,
  };

  return [
    new THREE.MeshStandardMaterial({ color: shadeColor(baseHex, 0.55), ...shared }),
    new THREE.MeshStandardMaterial({ color: shadeColor(baseHex, 0.76), ...shared }),
    new THREE.MeshStandardMaterial({ color: shadeColor(baseHex, 1.0), ...shared }),
    new THREE.MeshStandardMaterial({ color: shadeColor(baseHex, 0.3), ...shared }),
    new THREE.MeshStandardMaterial({ color: shadeColor(baseHex, 0.82), ...shared }),
    new THREE.MeshStandardMaterial({ color: shadeColor(baseHex, 0.46), ...shared }),
  ];
}

function createSolidMaterial(baseHex, glowHex, opacity = 1) {
  return new THREE.MeshStandardMaterial({
    color: baseHex,
    emissive: shadeColor(glowHex, 0.24),
    emissiveIntensity: 0.1,
    metalness: 0.32,
    roughness: 0.48,
    flatShading: true,
    transparent: opacity < 1,
    opacity,
    fog: false,
  });
}

function createGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");

  const gradient = context.createRadialGradient(64, 64, 4, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.18, "rgba(255,220,180,0.95)");
  gradient.addColorStop(0.4, "rgba(255,120,80,0.35)");
  gradient.addColorStop(1, "rgba(255,120,80,0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createSkyTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const context = canvas.getContext("2d");

  const skyGradient = context.createLinearGradient(0, 0, 0, 1024);
  skyGradient.addColorStop(0, "#18050a");
  skyGradient.addColorStop(0.14, "#3c1020");
  skyGradient.addColorStop(0.34, "#7f1b2f");
  skyGradient.addColorStop(0.58, "#f15f3b");
  skyGradient.addColorStop(0.76, "#ffb05d");
  skyGradient.addColorStop(1, "#271747");
  context.fillStyle = skyGradient;
  context.fillRect(0, 0, 1024, 1024);

  const upperVignette = context.createRadialGradient(512, 160, 40, 512, 160, 680);
  upperVignette.addColorStop(0, "rgba(0,0,0,0)");
  upperVignette.addColorStop(0.52, "rgba(28,6,14,0.12)");
  upperVignette.addColorStop(1, "rgba(12,3,12,0.54)");
  context.fillStyle = upperVignette;
  context.fillRect(0, 0, 1024, 1024);

  const horizonGlow = context.createLinearGradient(0, 520, 0, 1024);
  horizonGlow.addColorStop(0, "rgba(255,142,86,0)");
  horizonGlow.addColorStop(0.22, "rgba(255,102,62,0.18)");
  horizonGlow.addColorStop(0.48, "rgba(255,195,94,0.34)");
  horizonGlow.addColorStop(0.76, "rgba(90,160,255,0.2)");
  horizonGlow.addColorStop(1, "rgba(9,8,18,0)");
  context.fillStyle = horizonGlow;
  context.fillRect(0, 500, 1024, 450);

  const coolBurst = context.createRadialGradient(270, 780, 24, 270, 780, 420);
  coolBurst.addColorStop(0, "rgba(123,206,255,0.38)");
  coolBurst.addColorStop(0.3, "rgba(57,132,255,0.22)");
  coolBurst.addColorStop(0.68, "rgba(31,58,128,0.12)");
  coolBurst.addColorStop(1, "rgba(7,10,18,0)");
  context.fillStyle = coolBurst;
  context.fillRect(0, 500, 760, 524);

  const warmBurst = context.createRadialGradient(780, 730, 26, 780, 730, 350);
  warmBurst.addColorStop(0, "rgba(255,216,104,0.32)");
  warmBurst.addColorStop(0.34, "rgba(255,121,72,0.28)");
  warmBurst.addColorStop(0.72, "rgba(115,28,70,0.14)");
  warmBurst.addColorStop(1, "rgba(10,8,14,0)");
  context.fillStyle = warmBurst;
  context.fillRect(420, 460, 520, 420);

  const sunGlow = context.createRadialGradient(760, 318, 18, 760, 318, 214);
  sunGlow.addColorStop(0, "rgba(255,251,221,0.98)");
  sunGlow.addColorStop(0.16, "rgba(255,224,149,0.88)");
  sunGlow.addColorStop(0.42, "rgba(255,143,79,0.44)");
  sunGlow.addColorStop(1, "rgba(36,14,18,0)");
  context.fillStyle = sunGlow;
  context.fillRect(520, 90, 420, 420);

  const hazeGlow = context.createRadialGradient(250, 820, 10, 250, 820, 390);
  hazeGlow.addColorStop(0, "rgba(88,96,140,0.18)");
  hazeGlow.addColorStop(0.55, "rgba(33,42,76,0.09)");
  hazeGlow.addColorStop(1, "rgba(14,14,28,0)");
  context.fillStyle = hazeGlow;
  context.fillRect(0, 500, 760, 524);

  const paintCloud = (x, y, width, height, opacity) => {
    const gradient = context.createRadialGradient(x, y, 10, x, y, width);
    gradient.addColorStop(0, `rgba(255, 206, 170, ${opacity})`);
    gradient.addColorStop(0.38, `rgba(112, 96, 128, ${opacity * 0.34})`);
    gradient.addColorStop(1, "rgba(10, 10, 18, 0)");
    context.fillStyle = gradient;
    context.beginPath();
    context.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
    context.fill();
  };

  [
    [180, 220, 220, 78, 0.1],
    [340, 300, 270, 90, 0.08],
    [640, 240, 250, 82, 0.12],
    [840, 340, 210, 70, 0.08],
    [520, 420, 320, 98, 0.06],
    [260, 660, 380, 92, 0.05],
    [760, 740, 340, 82, 0.05],
  ].forEach(([x, y, width, height, opacity]) => paintCloud(x, y, width, height, opacity));

  context.fillStyle = "rgba(24, 12, 30, 0.9)";
  context.fillRect(0, 880, 1024, 144);

  context.fillStyle = "rgba(255, 184, 81, 0.22)";
  context.fillRect(0, 850, 1024, 16);

  context.fillStyle = "rgba(94, 172, 255, 0.18)";
  context.fillRect(0, 874, 1024, 10);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

const GLOW_TEXTURE = typeof document !== "undefined" ? createGlowTexture() : null;
const SKY_TEXTURE = typeof document !== "undefined" ? createSkyTexture() : null;

function addBox(group, size, position, material, interactiveMeshes, materialStore, interactive = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.userData.group = group;
  group.add(mesh);
  registerMaterial(material, materialStore);

  if (interactive) {
    interactiveMeshes.push(mesh);
  }

  return mesh;
}

function addCone(group, radius, height, position, material, interactiveMeshes, materialStore) {
  const mesh = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 12), material);
  mesh.position.set(...position);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.userData.group = group;
  group.add(mesh);
  registerMaterial(material, materialStore);
  interactiveMeshes.push(mesh);
  return mesh;
}

function addCylinder(
  group,
  radiusTop,
  radiusBottom,
  height,
  position,
  material,
  interactiveMeshes,
  materialStore,
) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 12),
    material,
  );
  mesh.position.set(...position);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.userData.group = group;
  group.add(mesh);
  registerMaterial(material, materialStore);
  interactiveMeshes.push(mesh);
  return mesh;
}

function addWindowGrid(
  group,
  {
    seedKey,
    floorIndex,
    width,
    depth,
    floorHeight,
    centerY,
    glowHex,
    windowMeshes,
    materialStore,
  },
) {
  const random = createSeededRandom(`${seedKey}:${floorIndex}:${Math.round(width * 10)}:${Math.round(depth * 10)}`);
  const windowMaterial = new THREE.MeshBasicMaterial({
    color: shadeColor(glowHex, 1.18),
    transparent: true,
    opacity: 0.82,
    fog: false,
  });
  registerMaterial(windowMaterial, materialStore);

  const frontCols = Math.max(1, Math.floor((width - 0.8) / 0.65));
  const sideCols = Math.max(1, Math.floor((depth - 0.8) / 0.72));
  const windowHeight = Math.max(0.26, floorHeight * 0.42);
  const frontSpacing = width / (frontCols + 1);
  const sideSpacing = depth / (sideCols + 1);

  for (let index = 0; index < frontCols; index += 1) {
    const isLit = random() > 0.3;
    if (!isLit) {
      continue;
    }

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, windowHeight, 0.04),
      windowMaterial,
    );
    mesh.position.set(
      -width / 2 + frontSpacing * (index + 1),
      centerY,
      depth / 2 + 0.03,
    );
    mesh.userData.phase = index * 0.73 + centerY * 0.31 + width;
    group.add(mesh);
    windowMeshes.push(mesh);

    const backMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, windowHeight, 0.04),
      windowMaterial,
    );
    backMesh.position.set(
      -width / 2 + frontSpacing * (index + 1),
      centerY,
      -depth / 2 - 0.03,
    );
    backMesh.userData.phase = index * 0.77 + centerY * 0.29 + width + 11;
    group.add(backMesh);
    windowMeshes.push(backMesh);
  }

  for (let index = 0; index < sideCols; index += 1) {
    const isLit = random() > 0.42;
    if (!isLit) {
      continue;
    }

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, windowHeight, 0.18),
      windowMaterial,
    );
    mesh.position.set(
      width / 2 + 0.03,
      centerY,
      -depth / 2 + sideSpacing * (index + 1),
    );
    mesh.userData.phase = index * 0.89 + centerY * 0.27 + depth + 3;
    group.add(mesh);
    windowMeshes.push(mesh);

    const leftMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, windowHeight, 0.18),
      windowMaterial,
    );
    leftMesh.position.set(
      -width / 2 - 0.03,
      centerY,
      -depth / 2 + sideSpacing * (index + 1),
    );
    leftMesh.userData.phase = index * 0.93 + centerY * 0.25 + depth + 17;
    group.add(leftMesh);
    windowMeshes.push(leftMesh);
  }
}

function addSteppedTower(
  group,
  {
    width,
    depth,
    floors,
    floorHeight,
    setbackEvery,
    setbackStep,
    startY,
    seedKey,
    baseHex,
    accentHex,
    glowHex,
    interactiveMeshes,
    materialStore,
    windowMeshes,
  },
) {
  let currentY = startY;

  for (let floorIndex = 0; floorIndex < floors; floorIndex += 1) {
    const setbackLevel = Math.floor(floorIndex / setbackEvery);
    const currentWidth = Math.max(width - setbackLevel * setbackStep, width * 0.42);
    const currentDepth = Math.max(depth - setbackLevel * setbackStep * 0.82, depth * 0.42);
    const bodyMaterials =
      floorIndex % 2 === 0
        ? createBoxMaterials(baseHex, glowHex)
        : createBoxMaterials(accentHex, glowHex);

    addBox(
      group,
      [currentWidth, floorHeight, currentDepth],
      [0, currentY + floorHeight / 2, 0],
      bodyMaterials,
      interactiveMeshes,
      materialStore,
    );

    addWindowGrid(group, {
      seedKey,
      floorIndex,
      width: currentWidth,
      depth: currentDepth,
      floorHeight,
      centerY: currentY + floorHeight / 2,
      glowHex,
      windowMeshes,
      materialStore,
    });

    if (floorIndex < floors - 1) {
      const ledgeMaterials = createBoxMaterials(accentHex, glowHex, 0.92);
      addBox(
        group,
        [currentWidth + 0.12, 0.08, currentDepth + 0.12],
        [0, currentY + floorHeight - 0.04, 0],
        ledgeMaterials,
        interactiveMeshes,
        materialStore,
        false,
      );
    }

    currentY += floorHeight;
  }

  return currentY;
}

function addGlowSprite(group, colorHex, position, size, glowSprites, materialStore) {
  if (!GLOW_TEXTURE) {
    return null;
  }

  const material = new THREE.SpriteMaterial({
    map: GLOW_TEXTURE,
    color: colorHex,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    fog: false,
  });
  registerMaterial(material, materialStore);

  const sprite = new THREE.Sprite(material);
  sprite.position.set(...position);
  sprite.scale.setScalar(size);
  group.add(sprite);
  return sprite;
}

function createSeededRandom(seedText) {
  let seed = Array.from(seedText || "glass").reduce((value, character) => {
    return (value * 31 + character.charCodeAt(0)) >>> 0;
  }, 11);

  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function addGlassHighlightSpots(group, width, depth, startY, towerTop, glassHighlights, materialStore) {
  const highlightConfigs = [
    {
      size: [Math.max(0.22, width * 0.16), Math.max(2.4, width * 0.86), 0.04],
      position: [width * 0.18, startY + (towerTop - startY) * 0.28, depth / 2 + 0.03],
      opacity: 0.16,
      phase: 0,
    },
    {
      size: [Math.max(0.16, width * 0.1), Math.max(1.8, width * 0.6), 0.04],
      position: [-width * 0.14, startY + (towerTop - startY) * 0.54, depth / 2 + 0.03],
      opacity: 0.12,
      phase: 1.7,
    },
    {
      size: [0.04, Math.max(1.7, depth * 0.56), Math.max(0.16, depth * 0.1)],
      position: [width / 2 + 0.03, startY + (towerTop - startY) * 0.42, -depth * 0.12],
      opacity: 0.1,
      phase: 3.1,
    },
  ];

  highlightConfigs.forEach(({ size, position, opacity, phase }) => {
    const material = new THREE.MeshStandardMaterial({
      color: 0xf5f8ff,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.08,
      transparent: true,
      opacity,
      metalness: 0.04,
      roughness: 0.22,
      fog: false,
    });
    registerMaterial(material, materialStore);

    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.position.set(...position);
    mesh.userData.baseOpacity = opacity;
    mesh.userData.phase = phase;
    group.add(mesh);
    glassHighlights.push(mesh);
  });
}

function addRandomGlassMirrors(
  group,
  {
    seedKey,
    width,
    depth,
    startY,
    towerTop,
    glassHighlights,
    materialStore,
  },
) {
  const random = createSeededRandom(seedKey);
  const towerHeight = Math.max(towerTop - startY, 4);
  const mirrorCount = Math.min(8, Math.max(3, Math.round(towerHeight / 8)));
  const frontDepth = 0.04;
  const sideWidth = 0.04;

  for (let index = 0; index < mirrorCount; index += 1) {
    const sideRoll = random();
    const isFrontOrBack = sideRoll < 0.58;
    const isPositiveSide = random() > 0.5;
    const panelHeight = Math.max(1.2, towerHeight * (0.08 + random() * 0.12));
    const centerY = startY + panelHeight / 2 + towerHeight * (0.08 + random() * 0.7);
    const opacity = 0.08 + random() * 0.08;
    const phase = random() * 6 + index * 0.7;

    const material = new THREE.MeshStandardMaterial({
      color: 0xf5fbff,
      emissive: new THREE.Color(0xe4f4ff),
      emissiveIntensity: 0.05,
      transparent: true,
      opacity,
      metalness: 0.08,
      roughness: 0.16,
      fog: false,
    });
    registerMaterial(material, materialStore);

    let geometry;
    let position;

    if (isFrontOrBack) {
      const panelWidth = Math.max(0.24, width * (0.08 + random() * 0.16));
      const maxX = Math.max(0.12, width / 2 - panelWidth / 2 - 0.12);
      const x = (random() * 2 - 1) * maxX;
      geometry = new THREE.BoxGeometry(panelWidth, panelHeight, frontDepth);
      position = [x, Math.min(centerY, towerTop - panelHeight / 2 - 0.1), isPositiveSide ? depth / 2 + 0.03 : -depth / 2 - 0.03];
    } else {
      const panelDepth = Math.max(0.24, depth * (0.08 + random() * 0.16));
      const maxZ = Math.max(0.12, depth / 2 - panelDepth / 2 - 0.12);
      const z = (random() * 2 - 1) * maxZ;
      geometry = new THREE.BoxGeometry(sideWidth, panelHeight, panelDepth);
      position = [isPositiveSide ? width / 2 + 0.03 : -width / 2 - 0.03, Math.min(centerY, towerTop - panelHeight / 2 - 0.1), z];
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.userData.baseOpacity = opacity;
    mesh.userData.phase = phase;
    group.add(mesh);
    glassHighlights.push(mesh);
  }
}

function createReflectionClone(group) {
  const originalUserData = new Map();

  group.traverse((object) => {
    originalUserData.set(object, object.userData);
    object.userData = {};
  });

  const reflection = group.clone(true);

  group.traverse((object) => {
    object.userData = originalUserData.get(object) || {};
  });

  reflection.userData = {
    isReflection: true,
    sourceGroup: group,
  };

  reflection.scale.y = -1;
  reflection.position.y = -0.03;

  reflection.traverse((object) => {
    object.castShadow = false;
    object.receiveShadow = false;

    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material = object.material.map((material) => {
          const clone = material.clone();
          clone.transparent = true;
          clone.opacity = 0.18;
          clone.emissiveIntensity = 0;
          clone.depthWrite = false;
          if ("color" in clone && clone.color) {
            clone.color.multiplyScalar(0.62);
          }
          return clone;
        });
      } else {
        const clone = object.material.clone();
        clone.transparent = true;
        clone.opacity = 0.18;
        clone.emissiveIntensity = 0;
        clone.depthWrite = false;
        if ("color" in clone && clone.color) {
          clone.color.multiplyScalar(0.62);
        }
        object.material = clone;
      }
    }

    if (object.isSprite && object.material) {
      object.material.opacity = 0.06;
    }
  });

  return reflection;
}

function addBuildingPodium(
  group,
  { towerWidth, towerDepth, baseWidth, baseDepth, baseHex, accentHex, glowHex, interactiveMeshes, materialStore },
) {
  const podiumHeight = Math.max(0.9, towerWidth * 0.18);
  const lowerWidth = Math.max(baseWidth, towerWidth * 1.36);
  const lowerDepth = Math.max(baseDepth, towerDepth * 1.34);
  const upperWidth = Math.max(baseWidth * 0.82, towerWidth * 1.16);
  const upperDepth = Math.max(baseDepth * 0.82, towerDepth * 1.14);

  addBox(
    group,
    [lowerWidth, podiumHeight, lowerDepth],
    [0, podiumHeight / 2, 0],
    createBoxMaterials(accentHex, glowHex),
    interactiveMeshes,
    materialStore,
  );

  addBox(
    group,
    [upperWidth, podiumHeight * 0.52, upperDepth],
    [0, podiumHeight + (podiumHeight * 0.52) / 2, 0],
    createBoxMaterials(baseHex, glowHex),
    interactiveMeshes,
    materialStore,
  );

  addBox(
    group,
    [upperWidth + 0.18, 0.08, upperDepth + 0.18],
    [0, podiumHeight + podiumHeight * 0.52 - 0.02, 0],
    createBoxMaterials(glowHex, glowHex, 0.88),
    interactiveMeshes,
    materialStore,
    false,
  );

  return podiumHeight + podiumHeight * 0.52;
}

function addBuildingSurroundings(
  group,
  { lotWidth, lotDepth, baseWidth, baseDepth, baseHex, accentHex, glowHex, interactiveMeshes, materialStore, glowSprites },
) {
  addBox(
    group,
    [lotWidth, 0.08, lotDepth],
    [0, 0.04, 0],
    createBoxMaterials(baseHex, glowHex, 0.96),
    interactiveMeshes,
    materialStore,
    false,
  );

  addBox(
    group,
    [baseWidth * 1.16, 0.06, baseDepth * 1.16],
    [0, 0.16, 0],
    createBoxMaterials(accentHex, glowHex, 0.92),
    interactiveMeshes,
    materialStore,
    false,
  );
}

function addSceneBox(parent, size, position, material, castShadow = false, receiveShadow = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  parent.add(mesh);
  return mesh;
}

function addSceneCylinder(parent, radiusTop, radiusBottom, height, position, material) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 18),
    material,
  );
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addSceneCone(parent, radius, height, position, material) {
  const mesh = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 18), material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addSceneSphere(parent, radius, position, material, castShadow = true, receiveShadow = true) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 18, 18), material);
  mesh.position.set(...position);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  parent.add(mesh);
  return mesh;
}

function getCitySiteDimensions(city) {
  const { footprint, baseFootprint, lotFootprint, floorCount, midHeight, spireHeight } = city.metrics;
  const floorHeight = Math.max(0.65, midHeight / floorCount);
  const bodyWidth = footprint;
  const bodyDepth = footprint * 0.82;
  const baseWidth = Math.max(baseFootprint, bodyWidth * 1.36);
  const baseDepth = Math.max(baseFootprint * 0.84, bodyDepth * 1.34);
  const lotWidth = Math.max(lotFootprint * 0.82, baseWidth * 1.18);
  const lotDepth = Math.max(lotFootprint * 0.78, baseDepth * 1.2);

  return {
    floorHeight,
    bodyWidth,
    bodyDepth,
    baseWidth,
    baseDepth,
    lotWidth,
    lotDepth,
    spireHeight,
  };
}

function getAxisCenters(sizes) {
  const totalSize = sizes.reduce((sum, size) => sum + size, 0);
  let cursor = -totalSize / 2;

  return sizes.map((size) => {
    const center = cursor + size / 2;
    cursor += size;
    return center;
  });
}

function getCellFillOrder(columns, rows) {
  const centerColumn = (columns - 1) / 2;
  const centerRow = (rows - 1) / 2;

  return Array.from({ length: columns * rows }, (_, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    const dx = col - centerColumn;
    const dz = row - centerRow;

    return {
      row,
      col,
      distance: Math.sqrt(dx * dx + dz * dz),
      ringBias: Math.abs(dz) + Math.abs(dx),
    };
  }).sort((left, right) => {
    if (left.distance !== right.distance) {
      return left.distance - right.distance;
    }

    if (left.ringBias !== right.ringBias) {
      return left.ringBias - right.ringBias;
    }

    if (left.row !== right.row) {
      return left.row - right.row;
    }

    return left.col - right.col;
  });
}

function getPackedPositionsForCities(cities, centerX, centerZ, slotColumns, mapCenterX = 0, mapCenterZ = 0) {
  const rows = [];

  for (let index = 0; index < cities.length; index += slotColumns) {
    const rowCities = cities.slice(index, index + slotColumns).map((city) => {
      const { lotWidth, lotDepth } = getCitySiteDimensions(city);
      return {
        city,
        lotWidth,
        lotDepth,
      };
    });
    rows.push(rowCities);
  }

  const rowDepths = rows.map((rowCities) => {
    return rowCities.reduce((largest, item) => Math.max(largest, item.lotDepth), 0);
  });
  const totalDepth = rowDepths.reduce((sum, value) => sum + value, 0);
  const fillFromPositiveX = centerX < mapCenterX;
  const fillFromPositiveZ = centerZ < mapCenterZ;
  let currentZ = fillFromPositiveZ ? centerZ + totalDepth / 2 : centerZ - totalDepth / 2;
  const placements = [];

  rows.forEach((rowCities, rowIndex) => {
    const rowDepth = rowDepths[rowIndex];
    const z = fillFromPositiveZ ? currentZ - rowDepth / 2 : currentZ + rowDepth / 2;
    const rowWidth = rowCities.reduce((sum, item) => sum + item.lotWidth, 0);
    let currentX = fillFromPositiveX ? centerX + rowWidth / 2 : centerX - rowWidth / 2;

    rowCities.forEach((item) => {
      const x = fillFromPositiveX
        ? currentX - item.lotWidth / 2
        : currentX + item.lotWidth / 2;

      placements.push({
        city: item.city,
        position: {
          x,
          z,
        },
      });

      currentX += fillFromPositiveX ? -item.lotWidth : item.lotWidth;
    });

    currentZ += fillFromPositiveZ ? -rowDepth : rowDepth;
  });

  return placements;
}

function getDistrictDimensions(layout) {
  const columnWidths =
    layout?.columnWidths ||
    Array.from({ length: layout?.columns || 1 }, () => layout?.cellWidth || 12);
  const rowDepths =
    layout?.rowDepths ||
    Array.from({ length: layout?.rows || 1 }, () => layout?.cellDepth || 12);

  return {
    districtWidth: Math.max(columnWidths.reduce((sum, width) => sum + width, 0) + 18, 46),
    districtDepth: Math.max(rowDepths.reduce((sum, depth) => sum + depth, 0) + 18, 46),
  };
}

function addSupportPlatform(scene, layout) {
  const { districtWidth, districtDepth } = getDistrictDimensions(layout);
  const supportGroup = new THREE.Group();
  const platformWidth = districtWidth + 18;
  const platformDepth = districtDepth + 18;
  const lowerPlatformWidth = platformWidth + 12;
  const lowerPlatformDepth = platformDepth + 12;
  const foundationWidth = lowerPlatformWidth + 28;
  const foundationDepth = lowerPlatformDepth + 28;

  const upperDeckMaterial = new THREE.MeshStandardMaterial({
    color: 0x131726,
    emissive: new THREE.Color(0x0a1324),
    emissiveIntensity: 0.14,
    metalness: 0.28,
    roughness: 0.76,
  });
  const lowerDeckMaterial = new THREE.MeshStandardMaterial({
    color: 0x090c16,
    emissive: new THREE.Color(0x101832),
    emissiveIntensity: 0.1,
    metalness: 0.18,
    roughness: 0.88,
  });
  const foundationMaterial = new THREE.MeshStandardMaterial({
    color: 0x04050a,
    emissive: new THREE.Color(0x0c0f1e),
    emissiveIntensity: 0.06,
    metalness: 0.1,
    roughness: 0.94,
  });
  const reflectiveGroundMaterial = new THREE.MeshStandardMaterial({
    color: 0x05060b,
    emissive: new THREE.Color(0x08101c),
    emissiveIntensity: 0.08,
    metalness: 0.42,
    roughness: 0.38,
  });

  addSceneBox(
    supportGroup,
    [platformWidth, 0.24, platformDepth],
    [0, -0.12, 0],
    upperDeckMaterial,
    false,
    true,
  );
  addSceneBox(
    supportGroup,
    [lowerPlatformWidth, 1.7, lowerPlatformDepth],
    [0, -1.12, 0],
    lowerDeckMaterial,
    false,
    true,
  );
  addSceneBox(
    supportGroup,
    [foundationWidth, 2.8, foundationDepth],
    [0, -3.36, 0],
    foundationMaterial,
    false,
    true,
  );
  addSceneBox(
    supportGroup,
    [foundationWidth * 3.2, 0.04, foundationDepth * 3.2],
    [0, -4.78, 0],
    reflectiveGroundMaterial,
    false,
    true,
  );

  scene.add(supportGroup);
  return supportGroup;
}

function addNoirAtmosphere(scene) {
  const atmosphere = new THREE.Group();

  if (SKY_TEXTURE) {
    const skyDome = new THREE.Mesh(
      new THREE.SphereGeometry(360, 48, 48),
      new THREE.MeshBasicMaterial({
        map: SKY_TEXTURE,
        side: THREE.BackSide,
        fog: false,
      }),
    );
    skyDome.rotation.y = Math.PI * 0.18;
    atmosphere.add(skyDome);
  }

  const sunsetHorizon = new THREE.Mesh(
    new THREE.CircleGeometry(132, 96),
    new THREE.MeshBasicMaterial({
      color: 0xffb066,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    }),
  );
  sunsetHorizon.position.set(0, 26, -154);
  atmosphere.add(sunsetHorizon);

  const coolHaze = new THREE.Mesh(
    new THREE.RingGeometry(88, 182, 96),
    new THREE.MeshBasicMaterial({
      color: 0x6fbcff,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    }),
  );
  coolHaze.rotation.x = -Math.PI / 2;
  coolHaze.position.y = 0.5;
  atmosphere.add(coolHaze);

  const warmHaze = new THREE.Mesh(
    new THREE.RingGeometry(164, 244, 96),
    new THREE.MeshBasicMaterial({
      color: 0xff8a5b,
      transparent: true,
      opacity: 0.06,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    }),
  );
  warmHaze.rotation.x = -Math.PI / 2;
  warmHaze.position.y = 0.7;
  atmosphere.add(warmHaze);

  const cloudLayer = new THREE.Mesh(
    new THREE.CircleGeometry(148, 64),
    new THREE.MeshBasicMaterial({
      color: 0x231d2f,
      transparent: true,
      opacity: 0.06,
      depthWrite: false,
      fog: false,
    }),
  );
  cloudLayer.rotation.x = -Math.PI / 2;
  cloudLayer.position.set(0, 56, -46);
  atmosphere.add(cloudLayer);

  scene.add(atmosphere);
  return atmosphere;
}

function getCameraFitState(camera, layout) {
  const sceneWidth = layout?.sceneWidth || 48;
  const sceneDepth = layout?.sceneDepth || 48;
  const maxHeight = layout?.maxHeight || 30;
  const verticalFov = THREE.MathUtils.degToRad(camera.fov);
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
  const targetY = Math.max(12, maxHeight * 0.34);
  const fitHeight = maxHeight * 1.16;
  const fitWidth = sceneWidth * 1.08;
  const fitDepth = sceneDepth * 1.08;
  const distanceForHeight = (fitHeight / 2) / Math.tan(verticalFov / 2);
  const distanceForWidth = (fitWidth / 2) / Math.tan(horizontalFov / 2);
  const planarDistance = Math.max(distanceForHeight, distanceForWidth, fitDepth * 0.72);
  const cameraOffset = new THREE.Vector3(0.82, 0.58, 1).normalize().multiplyScalar(planarDistance);

  return {
    targetY,
    cameraPosition: {
      x: cameraOffset.x,
      y: targetY + cameraOffset.y,
      z: cameraOffset.z,
    },
    minDistance: Math.max(18, planarDistance * 0.35),
    maxDistance: Math.max(112, planarDistance * 2.15),
  };
}

function createBuildingGroup(city, position) {
  const group = new THREE.Group();
  const interactiveMeshes = [];
  const windowMeshes = [];
  const glassHighlights = [];
  const materialStore = [];
  const { floorHeight, bodyWidth, bodyDepth, baseWidth, baseDepth, spireHeight } =
    getCitySiteDimensions(city);
  const { floorCount } = city.metrics;
  const { base, accent, glow } = city.archetype.palette;

  group.position.set(position.x, 0, position.z);

  const podiumTop = addBuildingPodium(group, {
    towerWidth: bodyWidth,
    towerDepth: bodyDepth,
    baseWidth,
    baseDepth,
    baseHex: base,
    accentHex: accent,
    glowHex: glow,
    interactiveMeshes,
    materialStore,
  });

  let towerTop = podiumTop;

  switch (city.archetype.name) {
    case "Glass Tower":
      towerTop = addSteppedTower(group, {
        width: bodyWidth,
        depth: bodyDepth,
        floors: floorCount,
        floorHeight,
        setbackEvery: 6,
        setbackStep: 0.12,
        startY: podiumTop,
        seedKey: `${city.id}:${city.username}`,
        baseHex: base,
        accentHex: accent,
        glowHex: glow,
        interactiveMeshes,
        materialStore,
        windowMeshes,
      });
      addCone(
        group,
        bodyWidth * 0.1,
        spireHeight,
        [0, towerTop + spireHeight / 2, 0],
        createSolidMaterial(glow, glow),
        interactiveMeshes,
        materialStore,
      );
      addGlowSprite(group, glow, [0, towerTop + spireHeight, 0], bodyWidth * 1.4, glassHighlights, materialStore);
      break;
    case "Brutalist Block":
      towerTop = addSteppedTower(group, {
        width: bodyWidth * 1.05,
        depth: bodyDepth,
        floors: floorCount,
        floorHeight: floorHeight * 1.03,
        setbackEvery: 9,
        setbackStep: 0.08,
        startY: podiumTop,
        seedKey: `${city.id}:${city.username}`,
        baseHex: base,
        accentHex: accent,
        glowHex: glow,
        interactiveMeshes,
        materialStore,
        windowMeshes,
      });
      addBox(
        group,
        [bodyWidth * 0.26, spireHeight, bodyDepth * 0.28],
        [0, towerTop + spireHeight / 2, 0],
        createBoxMaterials(accent, glow),
        interactiveMeshes,
        materialStore,
      );
      addGlowSprite(group, glow, [0, towerTop + spireHeight, 0], bodyWidth * 1.18, glassHighlights, materialStore);
      break;
    case "Art Deco Spire":
      towerTop = addSteppedTower(group, {
        width: bodyWidth,
        depth: bodyDepth * 0.92,
        floors: floorCount,
        floorHeight,
        setbackEvery: 3,
        setbackStep: 0.22,
        startY: podiumTop,
        seedKey: `${city.id}:${city.username}`,
        baseHex: base,
        accentHex: accent,
        glowHex: glow,
        interactiveMeshes,
        materialStore,
        windowMeshes,
      });
      addCone(
        group,
        bodyWidth * 0.14,
        spireHeight * 1.15,
        [0, towerTop + (spireHeight * 1.15) / 2, 0],
        createSolidMaterial(glow, glow),
        interactiveMeshes,
        materialStore,
      );
      addGlowSprite(group, glow, [0, towerTop + spireHeight * 1.15, 0], bodyWidth * 1.55, glassHighlights, materialStore);
      break;
    case "Crystal Pyramid":
      towerTop = addSteppedTower(group, {
        width: bodyWidth,
        depth: bodyDepth,
        floors: floorCount,
        floorHeight,
        setbackEvery: 1,
        setbackStep: bodyWidth / (floorCount + 2),
        startY: podiumTop,
        seedKey: `${city.id}:${city.username}`,
        baseHex: base,
        accentHex: accent,
        glowHex: glow,
        interactiveMeshes,
        materialStore,
        windowMeshes,
      });
      addCone(
        group,
        bodyWidth * 0.08,
        spireHeight,
        [0, towerTop + spireHeight / 2, 0],
        createSolidMaterial(glow, glow),
        interactiveMeshes,
        materialStore,
      );
      addGlowSprite(group, glow, [0, towerTop + spireHeight, 0], bodyWidth * 1.3, glassHighlights, materialStore);
      break;
    case "Neon Pagoda":
      towerTop = addSteppedTower(group, {
        width: bodyWidth,
        depth: bodyDepth,
        floors: floorCount,
        floorHeight,
        setbackEvery: 2,
        setbackStep: 0.3,
        startY: podiumTop,
        seedKey: `${city.id}:${city.username}`,
        baseHex: base,
        accentHex: accent,
        glowHex: glow,
        interactiveMeshes,
        materialStore,
        windowMeshes,
      });
      addCone(
        group,
        bodyWidth * 0.12,
        spireHeight,
        [0, towerTop + spireHeight / 2, 0],
        createSolidMaterial(accent, glow),
        interactiveMeshes,
        materialStore,
      );
      addGlowSprite(group, glow, [0, towerTop + spireHeight, 0], bodyWidth * 1.25, glassHighlights, materialStore);
      break;
    case "Cyber Monolith":
      towerTop = addSteppedTower(group, {
        width: bodyWidth * 0.82,
        depth: bodyDepth * 0.72,
        floors: floorCount,
        floorHeight,
        setbackEvery: 8,
        setbackStep: 0.08,
        startY: podiumTop,
        seedKey: `${city.id}:${city.username}`,
        baseHex: base,
        accentHex: accent,
        glowHex: glow,
        interactiveMeshes,
        materialStore,
        windowMeshes,
      });
      addBox(
        group,
        [bodyWidth * 0.14, towerTop * 0.92, bodyDepth * 1.12],
        [-bodyWidth * 0.44, towerTop * 0.46, 0],
        createBoxMaterials(accent, glow),
        interactiveMeshes,
        materialStore,
      );
      addBox(
        group,
        [bodyWidth * 0.14, towerTop * 0.92, bodyDepth * 1.12],
        [bodyWidth * 0.44, towerTop * 0.46, 0],
        createBoxMaterials(accent, glow),
        interactiveMeshes,
        materialStore,
      );
      addCone(
        group,
        bodyWidth * 0.08,
        spireHeight * 1.18,
        [0, towerTop + (spireHeight * 1.18) / 2, 0],
        createSolidMaterial(glow, glow),
        interactiveMeshes,
        materialStore,
      );
      addGlowSprite(group, glow, [0, towerTop + spireHeight * 1.18, 0], bodyWidth * 1.5, glassHighlights, materialStore);
      break;
    case "Obsidian Fortress":
      towerTop = addSteppedTower(group, {
        width: bodyWidth * 1.04,
        depth: bodyDepth,
        floors: floorCount,
        floorHeight,
        setbackEvery: 5,
        setbackStep: 0.14,
        startY: podiumTop,
        seedKey: `${city.id}:${city.username}`,
        baseHex: base,
        accentHex: accent,
        glowHex: glow,
        interactiveMeshes,
        materialStore,
        windowMeshes,
      });
      addBox(
        group,
        [bodyWidth * 0.16, towerTop * 0.85, bodyDepth * 0.16],
        [-bodyWidth * 0.38, towerTop * 0.42, -bodyDepth * 0.38],
        createBoxMaterials(accent, glow),
        interactiveMeshes,
        materialStore,
      );
      addBox(
        group,
        [bodyWidth * 0.16, towerTop * 0.85, bodyDepth * 0.16],
        [bodyWidth * 0.38, towerTop * 0.42, bodyDepth * 0.38],
        createBoxMaterials(accent, glow),
        interactiveMeshes,
        materialStore,
      );
      addBox(
        group,
        [bodyWidth * 0.22, spireHeight, bodyDepth * 0.22],
        [0, towerTop + spireHeight / 2, 0],
        createBoxMaterials(glow, glow),
        interactiveMeshes,
        materialStore,
      );
      addGlowSprite(group, glow, [0, towerTop + spireHeight, 0], bodyWidth * 1.22, glassHighlights, materialStore);
      break;
    case "Copper Dome":
      towerTop = addSteppedTower(group, {
        width: bodyWidth,
        depth: bodyDepth,
        floors: floorCount,
        floorHeight,
        setbackEvery: 4,
        setbackStep: 0.16,
        startY: podiumTop,
        seedKey: `${city.id}:${city.username}`,
        baseHex: base,
        accentHex: accent,
        glowHex: glow,
        interactiveMeshes,
        materialStore,
        windowMeshes,
      });
      addCylinder(
        group,
        bodyWidth * 0.24,
        bodyWidth * 0.38,
        spireHeight * 0.7,
        [0, towerTop + (spireHeight * 0.7) / 2, 0],
        createSolidMaterial(accent, glow),
        interactiveMeshes,
        materialStore,
      );
      addGlowSprite(group, glow, [0, towerTop + spireHeight * 0.82, 0], bodyWidth * 1.25, glassHighlights, materialStore);
      break;
    default:
      towerTop = addSteppedTower(group, {
        width: bodyWidth,
        depth: bodyDepth,
        floors: floorCount,
        floorHeight,
        setbackEvery: 5,
        setbackStep: 0.16,
        startY: podiumTop,
        seedKey: `${city.id}:${city.username}`,
        baseHex: base,
        accentHex: accent,
        glowHex: glow,
        interactiveMeshes,
        materialStore,
        windowMeshes,
      });
      addCone(
        group,
        bodyWidth * 0.1,
        spireHeight,
        [0, towerTop + spireHeight / 2, 0],
        createSolidMaterial(glow, glow),
        interactiveMeshes,
        materialStore,
      );
      addGlowSprite(group, glow, [0, towerTop + spireHeight, 0], bodyWidth * 1.3, glassHighlights, materialStore);
  }

  group.userData = {
    city,
    interactiveMeshes,
    windowMeshes,
    glassHighlights,
    materials: materialStore,
    towerTop,
  };

  addRandomGlassMirrors(group, {
    seedKey: `${city.id}:${city.username}`,
    width: bodyWidth,
    depth: bodyDepth,
    startY: podiumTop,
    towerTop,
    glassHighlights,
    materialStore,
  });
  addGlassHighlightSpots(group, bodyWidth, bodyDepth, podiumTop, towerTop, glassHighlights, materialStore);

  return group;
}

function buildSharedSkyline(scene, cities) {
  const rankedCities = [...cities].sort((left, right) => right.metrics.totalHeight - left.metrics.totalHeight);
  const columns = 4;
  const rows = 4;
  const groups = [];
  const interactiveMeshes = [];
  const lineThickness = 0.64;
  const cellPadding = 6;
  const cellScale = 2;
  const maxLotWidth = rankedCities.reduce((largest, city) => {
    const { lotWidth } = getCitySiteDimensions(city);
    return Math.max(largest, lotWidth);
  }, 18);
  const maxLotDepth = rankedCities.reduce((largest, city) => {
    const { lotDepth } = getCitySiteDimensions(city);
    return Math.max(largest, lotDepth);
  }, 18);
  const cellWidth = (maxLotWidth + cellPadding) * cellScale + lineThickness;
  const cellDepth = (maxLotDepth + cellPadding) * cellScale + lineThickness;
  const sceneWidth = cellWidth * columns;
  const sceneDepth = cellDepth * rows;
  const usableCellWidth = cellWidth - lineThickness - 6;
  const usableCellDepth = cellDepth - lineThickness - 6;
  const slotColumns = Math.max(
    1,
    Math.floor(usableCellWidth / maxLotWidth),
  );
  const slotRows = Math.max(
    1,
    Math.floor(usableCellDepth / maxLotDepth),
  );
  const cellCapacity = slotColumns * slotRows;
  const visibleCities = rankedCities.slice(0, columns * rows * cellCapacity);
  const maxHeight = rankedCities.reduce(
    (tallest, city) => Math.max(tallest, city.metrics.totalHeight),
    24,
  );

  const xCenters = Array.from({ length: columns }, (_, col) => {
    return -sceneWidth / 2 + cellWidth * col + cellWidth / 2;
  });
  const zCenters = Array.from({ length: rows }, (_, row) => {
    return -sceneDepth / 2 + cellDepth * row + cellDepth / 2;
  });
  const cellFillOrder = getCellFillOrder(columns, rows);

  let cityIndex = 0;

  for (const cell of cellFillOrder) {
    if (cityIndex >= visibleCities.length) {
      break;
    }

    const citiesForCell = visibleCities.slice(cityIndex, cityIndex + cellCapacity);
    const placements = getPackedPositionsForCities(
      citiesForCell,
      xCenters[cell.col],
      zCenters[cell.row],
      slotColumns,
      0,
      0,
    );

    for (const placement of placements) {
      const group = createBuildingGroup(placement.city, placement.position);
      scene.add(group);
      groups.push(group);
      interactiveMeshes.push(...group.userData.interactiveMeshes);
      cityIndex += 1;
    }
  }

  return {
    groups,
    interactiveMeshes,
    layout: {
      sceneWidth,
      sceneDepth,
      maxHeight,
      columns,
      rows,
      cellWidth,
      cellDepth,
      lineThickness,
      slotColumns,
      slotRows,
      xCenters,
      zCenters,
      columnWidths: Array.from({ length: columns }, () => cellWidth),
      rowDepths: Array.from({ length: rows }, () => cellDepth),
    },
  };
}

function CityCanvas({ onBuildingSelect, onHoverCityChange }) {
  const dispatch = useDispatch();
  const mountRef = useRef(null);
  const { currentCity, loading } = useSelector((state) => state.city);
  const { cities } = useSelector((state) => state.community);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) {
      return undefined;
    }

    const skylineCities = cities.length ? cities : currentCity ? [currentCity] : [];
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05060b);

    const camera = new THREE.PerspectiveCamera(
      58,
      mountNode.clientWidth / mountNode.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(44, 34, 58);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(mountNode.clientWidth, mountNode.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.shadowMap.enabled = false;
    renderer.sortObjects = false;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mountNode.innerHTML = "";
    mountNode.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.6;
    controls.minDistance = 20;
    controls.maxDistance = 112;
    controls.maxPolarAngle = Math.PI / 2.12;
    controls.target.set(0, 12, 0);

    const { groups, interactiveMeshes, layout } = buildSharedSkyline(scene, skylineCities);
    addSupportPlatform(scene, layout);
    addNoirAtmosphere(scene);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    scene.add(new THREE.HemisphereLight(0xffd6a5, 0x09111d, 0.44));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.12);
    keyLight.position.set(28, 34, 22);
    scene.add(keyLight);

    const cameraFitState = getCameraFitState(camera, layout);
    camera.position.set(
      cameraFitState.cameraPosition.x,
      cameraFitState.cameraPosition.y,
      cameraFitState.cameraPosition.z,
    );
    controls.minDistance = cameraFitState.minDistance;
    controls.maxDistance = cameraFitState.maxDistance;
    controls.target.set(0, cameraFitState.targetY, 0);
    controls.update();
    const clock = new THREE.Clock();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(2, 2);
    const hoveredGroupRef = { current: null };
    const interactionState = {
      isNavigating: false,
      pointerDown: false,
      dragMoved: false,
      startX: 0,
      startY: 0,
    };
    const clearHoveredState = () => {
      hoveredGroupRef.current = null;
      onHoverCityChange?.(null);
    };

    const handlePointerDown = (event) => {
      interactionState.pointerDown = true;
      interactionState.dragMoved = false;
      interactionState.startX = event.clientX;
      interactionState.startY = event.clientY;
    };

    const handlePointerMove = (event) => {
      if (interactionState.pointerDown) {
        const deltaX = event.clientX - interactionState.startX;
        const deltaY = event.clientY - interactionState.startY;
        if (Math.hypot(deltaX, deltaY) > 4) {
          interactionState.dragMoved = true;
        }
      }

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handlePointerUp = () => {
      interactionState.pointerDown = false;
    };

    const handlePointerLeave = () => {
      interactionState.pointerDown = false;
      pointer.x = 2;
      pointer.y = 2;
      clearHoveredState();
    };

    const handleControlsStart = () => {
      interactionState.isNavigating = true;
      pointer.x = 2;
      pointer.y = 2;
      clearHoveredState();
    };

    const handleControlsEnd = () => {
      interactionState.isNavigating = false;
    };

    const handleClick = (event) => {
      if (interactionState.isNavigating || interactionState.dragMoved) {
        interactionState.dragMoved = false;
        return;
      }

      interactionState.dragMoved = false;
      const rect = renderer.domElement.getBoundingClientRect();
      const clickPointer = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(clickPointer, camera);
      const intersections = raycaster.intersectObjects(interactiveMeshes, false);
      const selectedGroup = intersections[0]?.object?.userData?.group || null;
      const city = selectedGroup?.userData?.city || null;

      if (city) {
        dispatch(selectCity(city));
        onBuildingSelect?.(city);
      }
    };

    const handleResize = () => {
      if (!mountRef.current) {
        return;
      }
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    controls.addEventListener("start", handleControlsStart);
    controls.addEventListener("end", handleControlsEnd);
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);
    renderer.domElement.addEventListener("pointerleave", handlePointerLeave);
    renderer.domElement.addEventListener("click", handleClick);
    window.addEventListener("resize", handleResize);

    let animationFrameId = 0;

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      controls.update();

      const nextHoveredGroup = interactionState.isNavigating
        ? null
        : (() => {
            raycaster.setFromCamera(pointer, camera);
            const intersections = raycaster.intersectObjects(interactiveMeshes, false);
            return intersections[0]?.object?.userData?.group || null;
          })();

      if (hoveredGroupRef.current !== nextHoveredGroup) {
        hoveredGroupRef.current = nextHoveredGroup;
        const nextHoveredCity = nextHoveredGroup?.userData?.city || null;
        onHoverCityChange?.(nextHoveredCity);
      }

      groups.forEach((group) => {
        const isHovered = group === hoveredGroupRef.current;
        const isSelected = currentCity && group.userData.city.id === currentCity.id && !isHovered;
        const pulse = isHovered ? 1 + Math.sin(elapsed * 4.2) * 0.03 : isSelected ? 1.015 : 1;

        group.scale.setScalar(pulse);

        group.userData.materials.forEach((material, index) => {
          material.emissiveIntensity = isHovered ? 0.26 : isSelected ? 0.16 : 0.07 + index * 0.002;
        });

        group.userData.glassHighlights.forEach((highlight) => {
          const baseOpacity = highlight.userData.baseOpacity || 0.12;
          highlight.material.opacity = isHovered
            ? Math.min(baseOpacity + 0.1, 0.3)
            : isSelected
              ? Math.min(baseOpacity + 0.05, 0.24)
              : baseOpacity;

          if ("emissiveIntensity" in highlight.material) {
            highlight.material.emissiveIntensity = isHovered ? 0.18 : isSelected ? 0.12 : 0.08;
          }
        });
      });

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      controls.removeEventListener("start", handleControlsStart);
      controls.removeEventListener("end", handleControlsEnd);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);
      renderer.domElement.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      onHoverCityChange?.(null);
      renderer.dispose();
      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      if (mountNode.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, [cities, currentCity, dispatch, onBuildingSelect, onHoverCityChange]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#07090f]">
      <div ref={mountRef} className="h-full w-full" />

      {loading ? (
        <div className="pointer-events-none absolute bottom-6 left-6 rounded-3xl border border-white/10 bg-slate-950/78 px-4 py-3 text-xs text-slate-300 backdrop-blur">
          <p>Updating skyline...</p>
        </div>
      ) : null}
    </div>
  );
}

export default CityCanvas;
