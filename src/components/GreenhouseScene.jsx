import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import usePhytoStore from "../store/usePhytoStore";
import useTimeStore from "../store/useTimeStore";

const PLANT_ROWS = 3;
const PLANT_COLS = 4;
const PLANT_COUNT = PLANT_ROWS * PLANT_COLS;

export default function GreenhouseScene() {
  const mountRef = useRef(null);
  const dataRef = useRef({
    current: usePhytoStore.getState().current,
    actuators: usePhytoStore.getState().actuators,
    alerts: usePhytoStore.getState().alerts,
  });

  useEffect(() => {
    const unsub = usePhytoStore.subscribe((state) => {
      dataRef.current = {
        current: state.current,
        actuators: state.actuators,
        alerts: state.alerts,
      };
    });
    return unsub;
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let initTimeout;
    const tryInit = () => {
      const W = mount.clientWidth;
      const H = mount.clientHeight;
      if (W === 0 || H === 0) {
        initTimeout = setTimeout(tryInit, 50);
        return;
      }
      init(mount, W, H, dataRef);
    };
    tryInit();
    return () => {
      clearTimeout(initTimeout);
      if (mount._threeCleanup) mount._threeCleanup();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100%",
        cursor: "grab",
        display: "block",
      }}
    />
  );
}

// Sky colors for different times of day
function getSkyColor(hour) {
  if (hour < 5) return { bg: 0x020408, fog: 0x020408, hemi: 0x0a0e1a }; // deep night
  if (hour < 6) return { bg: 0x0d0a1a, fog: 0x0d0a1a, hemi: 0x1a1030 }; // pre-dawn
  if (hour < 7) return { bg: 0x2d1b4e, fog: 0x2d1b4e, hemi: 0x3d2b5e }; // dawn purple
  if (hour < 8) return { bg: 0x8b3a1a, fog: 0x6b2a0a, hemi: 0xd4632a }; // sunrise orange
  if (hour < 10) return { bg: 0x1a3a6b, fog: 0x0d2a5e, hemi: 0x2a5aab }; // morning blue
  if (hour < 16) return { bg: 0x0d2a4a, fog: 0x071828, hemi: 0x1a4a8a }; // midday deep blue
  if (hour < 17) return { bg: 0x1a3a6b, fog: 0x0d2a5e, hemi: 0x2a5aab }; // afternoon
  if (hour < 18) return { bg: 0x8b3a1a, fog: 0x6b2a0a, hemi: 0xd4632a }; // sunset
  if (hour < 19) return { bg: 0x2d1b4e, fog: 0x2d1b4e, hemi: 0x3d2b5e }; // dusk
  if (hour < 20) return { bg: 0x0d0a1a, fog: 0x0d0a1a, hemi: 0x1a1030 }; // twilight
  return { bg: 0x020408, fog: 0x020408, hemi: 0x0a0e1a }; // night
}

function lerpColor(a, b, t) {
  const ca = new THREE.Color(a);
  const cb = new THREE.Color(b);
  return ca.lerp(cb, t);
}

function init(mount, W, H, dataRef) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.LinearToneMapping;
  renderer.toneMappingExposure = 2.8;
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d1f10);
  scene.fog = new THREE.FogExp2(0x0d1f10, 0.035);

  const camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 80);
  camera.position.set(9, 7, 11);
  camera.lookAt(0, 1.5, 0);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.5, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 5;
  controls.maxDistance = 22;
  controls.maxPolarAngle = Math.PI / 2.05;

  // Lighting — all dynamic, updated every frame
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xfff4d6, 2.0);
  sunLight.position.set(6, 12, 8);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(1024, 1024);
  sunLight.shadow.camera.left = -10;
  sunLight.shadow.camera.right = 10;
  sunLight.shadow.camera.top = 10;
  sunLight.shadow.camera.bottom = -10;
  scene.add(sunLight);

  const hemiLight = new THREE.HemisphereLight(0x4a9e5c, 0x1a2f1a, 1.0);
  scene.add(hemiLight);

  const lamp1Light = new THREE.PointLight(0xff55cc, 0, 5, 1.5);
  lamp1Light.position.set(-1.6, 2.9, 0);
  scene.add(lamp1Light);
  const lamp2Light = new THREE.PointLight(0xff55cc, 0, 5, 1.5);
  lamp2Light.position.set(1.6, 2.9, 0);
  scene.add(lamp2Light);

  const alertLight = new THREE.PointLight(0xff2200, 0, 8, 1.2);
  alertLight.position.set(0, 3, 0);
  scene.add(alertLight);

  // Materials
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x88ccaa,
    transparent: true,
    opacity: 0.18,
    roughness: 0.05,
    metalness: 0,
    transmission: 0.8,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const frameMat = new THREE.MeshLambertMaterial({ color: 0x3a4a3d });
  const floorMat = new THREE.MeshLambertMaterial({ color: 0x5a3820 });
  const soilMat = new THREE.MeshLambertMaterial({ color: 0x3a2010 });
  const bedMat = new THREE.MeshLambertMaterial({ color: 0x6a3c18 });

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshLambertMaterial({ color: 0x0a1409 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // GH Floor
  const ghFloor = new THREE.Mesh(
    new THREE.BoxGeometry(7.2, 0.12, 5.2),
    floorMat,
  );
  ghFloor.position.y = 0.06;
  ghFloor.receiveShadow = true;
  scene.add(ghFloor);

  function addWall(w, h, d, x, y, z) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const wall = new THREE.Mesh(geo, glassMat);
    wall.position.set(x, y, z);
    scene.add(wall);
    wall.add(
      new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({
          color: 0x4a7a5a,
          transparent: true,
          opacity: 0.7,
        }),
      ),
    );
  }
  addWall(7.2, 3, 0.07, 0, 1.5, -2.6);
  addWall(7.2, 3, 0.07, 0, 1.5, 2.6);
  addWall(0.07, 3, 5.2, -3.6, 1.5, 0);
  addWall(0.07, 3, 5.2, 3.6, 1.5, 0);

  [
    [-1.75, 0.32],
    [1.75, -0.32],
  ].forEach(([xOff, tilt]) => {
    const geo = new THREE.BoxGeometry(3.8, 0.07, 5.4);
    const panel = new THREE.Mesh(geo, glassMat);
    panel.rotation.z = tilt;
    panel.position.set(xOff, 3.35, 0);
    scene.add(panel);
    panel.add(
      new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({
          color: 0x4a7a5a,
          transparent: true,
          opacity: 0.5,
        }),
      ),
    );
  });

  const ridge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 5.4, 8),
    frameMat,
  );
  ridge.rotation.x = Math.PI / 2;
  ridge.position.set(0, 3.6, 0);
  scene.add(ridge);

  [
    [-3.6, -2.6],
    [-3.6, 2.6],
    [3.6, -2.6],
    [3.6, 2.6],
  ].forEach(([x, z]) => {
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 3.12, 8),
      frameMat,
    );
    col.position.set(x, 1.56, z);
    scene.add(col);
  });

  for (let row = 0; row < PLANT_ROWS; row++) {
    const z = (row - 1) * 1.55;
    const bed = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.14, 1.1), bedMat);
    bed.position.set(0, 0.19, z);
    scene.add(bed);
    const soil = new THREE.Mesh(
      new THREE.BoxGeometry(6.2, 0.08, 0.95),
      soilMat,
    );
    soil.position.set(0, 0.28, z);
    scene.add(soil);
  }

  // Plants
  const canopyMesh = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.2, 8, 6),
    new THREE.MeshLambertMaterial({ vertexColors: true }),
    PLANT_COUNT,
  );
  const stemMesh = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.028, 0.042, 1, 6),
    new THREE.MeshLambertMaterial({ color: 0x2a5015 }),
    PLANT_COUNT,
  );
  canopyMesh.castShadow = true;
  scene.add(canopyMesh);
  scene.add(stemMesh);

  const dummy = new THREE.Object3D();
  const plantColor = new THREE.Color();
  let lastSoil = -1;

  function updatePlants(soilMoisture) {
    if (Math.abs(soilMoisture - lastSoil) < 0.5) return;
    lastSoil = soilMoisture;
    const health = Math.max(0, Math.min(1, (soilMoisture - 10) / 75));
    for (let i = 0; i < PLANT_COUNT; i++) {
      const x = ((i % PLANT_COLS) - 1.5) * 1.48;
      const z = (Math.floor(i / PLANT_COLS) - 1) * 1.55;
      const stemH = 0.35 + health * 0.55;
      dummy.position.set(x, 0.32 + stemH / 2, z);
      dummy.scale.set(1, stemH, 1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      stemMesh.setMatrixAt(i, dummy.matrix);
      const scale = 0.7 + health * 0.6;
      dummy.position.set(x, 0.32 + stemH + 0.2 * scale, z);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      canopyMesh.setMatrixAt(i, dummy.matrix);
      plantColor.setHSL(
        health * 0.27,
        0.55 + health * 0.3,
        0.25 + health * 0.2,
      );
      canopyMesh.setColorAt(i, plantColor);
    }
    stemMesh.instanceMatrix.needsUpdate = true;
    canopyMesh.instanceMatrix.needsUpdate = true;
    if (canopyMesh.instanceColor) canopyMesh.instanceColor.needsUpdate = true;
  }
  updatePlants(72);

  // Grow lamps
  const lampGeo = new THREE.BoxGeometry(2, 0.07, 0.22);
  const lamp1Mat = new THREE.MeshStandardMaterial({
    color: 0x1a1a22,
    emissive: new THREE.Color(0),
    emissiveIntensity: 0,
  });
  const lamp2Mat = new THREE.MeshStandardMaterial({
    color: 0x1a1a22,
    emissive: new THREE.Color(0),
    emissiveIntensity: 0,
  });
  const lamp1Mesh = new THREE.Mesh(lampGeo, lamp1Mat);
  lamp1Mesh.position.set(-1.6, 2.85, 0);
  scene.add(lamp1Mesh);
  const lamp2Mesh = new THREE.Mesh(lampGeo, lamp2Mat);
  lamp2Mesh.position.set(1.6, 2.85, 0);
  scene.add(lamp2Mesh);
  [-1.6, 1.6].forEach((x) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.06), frameMat);
    b.position.set(x, 2.95, 0);
    scene.add(b);
  });

  // Fan
  const fanGroup = new THREE.Group();
  fanGroup.position.set(0, 2.2, -2.55);
  fanGroup.add(
    new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.05, 8, 20), frameMat),
  );
  const bladeGroup = new THREE.Group();
  const bladeMat = new THREE.MeshLambertMaterial({ color: 0x3a4a3d });
  for (let i = 0; i < 4; i++) {
    const pivot = new THREE.Group();
    pivot.rotation.z = (i / 4) * Math.PI * 2;
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.06, 0.14),
      bladeMat,
    );
    blade.position.x = 0.22;
    blade.rotation.z = 0.25;
    pivot.add(blade);
    bladeGroup.add(pivot);
  }
  fanGroup.add(bladeGroup);
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.06, 8),
    frameMat,
  );
  hub.rotation.x = Math.PI / 2;
  fanGroup.add(hub);
  scene.add(fanGroup);

  // Irrigation + drip
  const pipeMat = new THREE.MeshLambertMaterial({ color: 0x1a2820 });
  const pipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 6.8, 6),
    pipeMat,
  );
  pipe.rotation.z = Math.PI / 2;
  pipe.position.set(0, 0.38, -1.85);
  scene.add(pipe);

  // Drip particles — satu drop per tanaman, jatuh dari atas
  const dropGeo = new THREE.SphereGeometry(0.04, 6, 6);
  const dropMat = new THREE.MeshBasicMaterial({
    color: 0x7dd3fc,
    depthTest: false,
  });
  const drops = [];
  const DROPS_PER_PLANT = 2;

  for (let row = 0; row < PLANT_ROWS; row++) {
    for (let col = 0; col < PLANT_COLS; col++) {
      const px = (col - 1.5) * 1.48;
      const pz = (row - 1) * 1.55;
      const plantIndex = row * PLANT_COLS + col;
      for (let d = 0; d < DROPS_PER_PLANT; d++) {
        const drop = new THREE.Mesh(dropGeo, dropMat);
        drop.visible = false;
        scene.add(drop);
        drops.push({
          mesh: drop,
          x: px,
          z: pz,
          phase:
            (plantIndex * DROPS_PER_PLANT + d) /
            (PLANT_COUNT * DROPS_PER_PLANT),
        });
      }
    }
  }

  // Animation loop
  const clock = new THREE.Clock();
  let frameId,
    plantTick = 0;
  const lampColor = new THREE.Color();
  let lastHour = -1;

  function animate() {
    frameId = requestAnimationFrame(animate);
    if (mount.clientWidth === 0 || mount.clientHeight === 0) return;

    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();
    const { current, actuators, alerts } = dataRef.current;

    // ── Time-based sky ───────────────────────────────────────────────
    const hour = useTimeStore.getState().getHour();
    if (hour !== lastHour) {
      lastHour = hour;
      const sky = getSkyColor(hour);
      scene.background = new THREE.Color(sky.bg);
      scene.fog.color = new THREE.Color(sky.fog);
      hemiLight.groundColor = new THREE.Color(sky.hemi);
    }

    // ── Sun arc (visual position) ────────────────────────────────────
    const dayFraction = (hour - 6) / 12; // 0 at 6am, 1 at 6pm
    const sunAngle = dayFraction * Math.PI;
    const isDaytime = hour >= 6 && hour < 18;
    sunLight.position.set(
      Math.cos(sunAngle - Math.PI / 2) * 15,
      Math.max(0.5, Math.sin(sunAngle) * 14),
      8,
    );

    // ── Dynamic lighting intensity ────────────────────────────────────
    // Use hour directly for smooth day/night cycle independent of sensor data
    const dayArc = isDaytime ? Math.max(0, Math.sin(sunAngle)) : 0;
    const isGoldenHour = hour === 7 || hour === 17;
    const isNight = hour < 6 || hour >= 19;

    ambientLight.intensity = isNight ? 0.15 : 0.4 + dayArc * 1.8;
    sunLight.intensity = isDaytime
      ? isGoldenHour
        ? 1.2
        : 0.5 + dayArc * 2.5
      : 0;
    sunLight.color.set(isGoldenHour ? 0xff8c42 : 0xfff4d6);
    hemiLight.intensity = isNight ? 0.1 : 0.3 + dayArc * 0.8;
    hemiLight.color.set(isDaytime ? 0x6ab8f7 : 0x1a1a3a);

    // ── Fan spin ─────────────────────────────────────────────────────
    if (actuators.fan)
      bladeGroup.rotation.z +=
        delta * (4 + Math.max(0, current.temperature - 22) * 0.3);

    // ── Grow lamps ───────────────────────────────────────────────────
    const lampsOn = actuators.lights;
    lampColor.set(lampsOn ? 0xff44cc : 0x000000);
    lamp1Mat.emissive.copy(lampColor);
    lamp2Mat.emissive.copy(lampColor);
    lamp1Mat.emissiveIntensity = lampsOn ? 2.0 : 0;
    lamp2Mat.emissiveIntensity = lampsOn ? 2.0 : 0;
    lamp1Light.intensity = lampsOn ? 2.0 : 0;
    lamp2Light.intensity = lampsOn ? 2.0 : 0;

    // ── Drip animation ───────────────────────────────────────────────
    drops.forEach((d) => {
      if (actuators.irrigation) {
        if (elapsed < 2)
          console.log(
            "[Drip] setting visible, pos:",
            d.mesh.position.y,
            "visible:",
            d.mesh.visible,
          );
        d.mesh.visible = true;
        d.mesh.visible = true;
        const cycle = (elapsed * 1.2 + d.phase) % 1.0;
        // Drop falls from nozzle (y=0.17) to soil (y=-0.08), then resets
        d.mesh.position.set(d.x, 1.2 - cycle * 0.9, d.z);
        d.mesh.material.opacity =
          cycle < 0.75 ? 0.95 : 0.95 * (1 - (cycle - 0.75) / 0.25);
        d.mesh.scale.setScalar(0.6 + cycle * 0.5); // drops grow slightly as they fall
      } else {
        d.mesh.visible = false;
      }
    });

    // ── Alert pulse ──────────────────────────────────────────────────
    const hasCritical = alerts.some((a) => a.severity === "critical");
    alertLight.intensity = hasCritical
      ? ((Math.sin(elapsed * 5) + 1) / 2) * 1.5
      : 0;

    // ── Plant update ─────────────────────────────────────────────────
    plantTick++;
    if (plantTick >= 60) {
      plantTick = 0;
      updatePlants(current.soilMoisture);
    }

    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  const ro = new ResizeObserver(() => {
    const w = mount.clientWidth,
      h = mount.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  ro.observe(mount);

  mount._threeCleanup = () => {
    cancelAnimationFrame(frameId);
    ro.disconnect();
    controls.dispose();
    renderer.dispose();
    if (mount.contains(renderer.domElement))
      mount.removeChild(renderer.domElement);
  };
}
