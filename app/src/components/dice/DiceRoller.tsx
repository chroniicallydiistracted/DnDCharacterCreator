/**
 * DiceRoller - Physics-based 3D dice rolling component
 * 
 * Uses Three.js for rendering and Rapier3D for physics simulation.
 * Features cryptographically secure randomness for fair dice.
 */

import { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import RAPIER from '@dimforge/rapier3d-compat';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DiceRollResult {
  values: number[];
  sum: number;
  modifier: number;
  total: number;
  breakdown: string[];
}

export interface DiceRollerRef {
  roll: (expression: string) => Promise<DiceRollResult>;
  clear: () => void;
  isReady: boolean;
}

interface DiceRollerProps {
  width?: number;
  height?: number;
  onRollStart?: () => void;
  onRollComplete?: (result: DiceRollResult) => void;
  onReadyChange?: (ready: boolean) => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

// Physics (240 Hz simulation in centimeter scale)
const PHYSICS_STEP = 1 / 240;
const MAX_SUBSTEPS = 8;
const GRAVITY = { x: 0, y: -981, z: 0 }; // cm/s², real gravity

// Materials
const FELT_FRICTION = 1.0;
const FELT_RESTITUTION = 0.15;
const DICE_FRICTION = 0.45;
const DICE_RESTITUTION = 0.32;
const WOOD_FRICTION = 0.55;
const WOOD_RESTITUTION = 0.35;

// Settling detection
const SETTLE_LINEAR_THRESHOLD = 0.5;
const SETTLE_ANGULAR_THRESHOLD = 0.3;
const SETTLE_FRAMES_REQUIRED = 60;
const MAX_ROLL_TIME_MS = 15000;

// Tray dimensions (centimeter scale)
const TRAY_SIZE = 100;
const TRAY_FLOOR_THICKNESS = 2;
const TRAY_WALL_HEIGHT = 32;
const TRAY_WALL_THICKNESS = 4;
const TRAY_CONTAINMENT_HEIGHT = 90; // Invisible upper bounds to prevent escapes

// Spawn configuration - centered over the tray
const SPAWN_CONFIG = {
  baseY: 70,              // Height above tray
  spread: 14,             // Distance between dice
  maxPerRow: 5,           // Max dice per row
  heightVariation: 20,
  positionJitter: 4,
};

const THROW_CONFIG = {
  horizontalMin: 220,
  horizontalMax: 380,
  verticalMin: 20,
  verticalMax: 90,
  torqueMin: 18000,
  torqueMax: 50000,
};

// ─── Dice Definitions ────────────────────────────────────────────────────────

interface DieDefinition {
  geometry: () => THREE.BufferGeometry;
  mass: number;
  edgeRound: number;
  color: number;
  faceCount: number;
  faceLayoutValues: number[];
}

interface FaceLayoutEntry {
  normal: THREE.Vector3;
  value: number;
}

function createD4Geometry(): THREE.BufferGeometry {
  const geo = new THREE.TetrahedronGeometry(5.5, 0);
  geo.computeVertexNormals();
  return geo;
}

function createD6Geometry(): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(5, 5, 5, 2, 2, 2);
  // Bevel corners slightly by modifying vertices
  geo.computeVertexNormals();
  return geo;
}

function createD8Geometry(): THREE.BufferGeometry {
  const geo = new THREE.OctahedronGeometry(5, 0);
  geo.computeVertexNormals();
  return geo;
}

function createD10Geometry(): THREE.BufferGeometry {
  const vertices: number[] = [0, 0, 1, 0, 0, -1];
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI * 2) / 10;
    const zOffset = 0.105 * (i % 2 ? 1 : -1);
    vertices.push(-Math.cos(angle), -Math.sin(angle), zOffset);
  }

  const indices = [
    0, 2, 3, 0, 3, 4, 0, 4, 5, 0, 5, 6, 0, 6, 7,
    0, 7, 8, 0, 8, 9, 0, 9, 10, 0, 10, 11, 0, 11, 2,
    1, 3, 2, 1, 4, 3, 1, 5, 4, 1, 6, 5, 1, 7, 6,
    1, 8, 7, 1, 9, 8, 1, 10, 9, 1, 11, 10, 1, 2, 11,
  ];

  const geo = new THREE.PolyhedronGeometry(vertices, indices, 4.8, 0);
  geo.computeVertexNormals();
  return geo;
}

function createD12Geometry(): THREE.BufferGeometry {
  const geo = new THREE.DodecahedronGeometry(5, 0);
  geo.computeVertexNormals();
  return geo;
}

function createD20Geometry(): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(5.5, 0);
  geo.computeVertexNormals();
  return geo;
}

function round(value: number, precision = 5): number {
  return Math.round(value * 10 ** precision) / 10 ** precision;
}

function extractFaceNormals(geometry: THREE.BufferGeometry, expectedFaces?: number): THREE.Vector3[] {
  const nonIndexed = geometry.clone().toNonIndexed();
  const positions = nonIndexed.attributes.position.array as ArrayLike<number>;
  const normalsMap = new Map<string, THREE.Vector3>();

  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const cb = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const centroid = new THREE.Vector3();

  for (let i = 0; i < positions.length; i += 9) {
    a.set(positions[i], positions[i + 1], positions[i + 2]);
    b.set(positions[i + 3], positions[i + 4], positions[i + 5]);
    c.set(positions[i + 6], positions[i + 7], positions[i + 8]);

    ab.subVectors(a, b);
    cb.subVectors(c, b);
    normal.copy(cb).cross(ab).normalize();

    centroid.copy(a).add(b).add(c).multiplyScalar(1 / 3);
    if (normal.dot(centroid) < 0) normal.negate();

    const key = `${round(normal.x)},${round(normal.y)},${round(normal.z)}`;
    if (!normalsMap.has(key)) {
      normalsMap.set(key, normal.clone());
    }
  }

  const normals = Array.from(normalsMap.values());
  if (expectedFaces && normals.length !== expectedFaces) {
    // Keep running with extracted normals; geometry subdivision can alter uniqueness.
    console.warn(`Dice face count mismatch: expected ${expectedFaces}, got ${normals.length}`);
  }

  nonIndexed.dispose();
  return normals;
}

function buildFaceLayout(normals: THREE.Vector3[], valueMap: number[]): FaceLayoutEntry[] {
  return normals.map((normal, idx) => ({
    normal: normal.clone().normalize(),
    value: valueMap[idx] ?? idx + 1,
  }));
}

// Face layouts follow canonical opposite-face conventions used in standard dice sets.
const DICE_DEFS: Record<number, DieDefinition> = {
  4: {
    geometry: createD4Geometry,
    mass: 2.5,
    edgeRound: 0.2,
    color: 0x4a90d9,
    faceCount: 4,
    faceLayoutValues: [4, 3, 2, 1],
  },
  6: {
    geometry: createD6Geometry,
    mass: 5.0,
    edgeRound: 0.25,
    color: 0xe74c3c,
    faceCount: 6,
    faceLayoutValues: [1, 6, 2, 5, 3, 4],
  },
  8: {
    geometry: createD8Geometry,
    mass: 4.0,
    edgeRound: 0.22,
    color: 0x2ecc71,
    faceCount: 8,
    faceLayoutValues: [1, 4, 3, 6, 7, 2, 5, 8],
  },
  10: {
    geometry: createD10Geometry,
    mass: 4.5,
    edgeRound: 0.2,
    color: 0x9b59b6,
    faceCount: 10,
    faceLayoutValues: [0, 9, 2, 7, 4, 5, 6, 3, 8, 1],
  },
  12: {
    geometry: createD12Geometry,
    mass: 5.5,
    edgeRound: 0.2,
    color: 0xf39c12,
    faceCount: 12,
    faceLayoutValues: [1, 6, 4, 9, 2, 11, 12, 7, 5, 10, 3, 8],
  },
  20: {
    geometry: createD20Geometry,
    mass: 6.0,
    edgeRound: 0.18,
    color: 0x1abc9c,
    faceCount: 20,
    faceLayoutValues: [20, 8, 14, 2, 17, 5, 11, 9, 15, 3, 18, 6, 12, 10, 16, 4, 19, 7, 13, 1],
  },
};

const FACE_LAYOUTS: Record<number, FaceLayoutEntry[]> = (() => {
  const layouts: Partial<Record<number, FaceLayoutEntry[]>> = {};

  // d6 uses explicit world-axis standard layout.
  layouts[6] = [
    { normal: new THREE.Vector3(0, 1, 0), value: 1 },
    { normal: new THREE.Vector3(0, -1, 0), value: 6 },
    { normal: new THREE.Vector3(0, 0, 1), value: 2 },
    { normal: new THREE.Vector3(0, 0, -1), value: 5 },
    { normal: new THREE.Vector3(1, 0, 0), value: 3 },
    { normal: new THREE.Vector3(-1, 0, 0), value: 4 },
  ];

  // Polyhedral dice use extracted face normals with canonical value ordering.
  for (const side of [4, 8, 10, 12, 20] as const) {
    const def = DICE_DEFS[side];
    const geo = def.geometry();
    const normals = extractFaceNormals(geo, def.faceCount);
    normals.sort((a, b) => (b.y - a.y) || (b.x - a.x) || (b.z - a.z));
    layouts[side] = buildFaceLayout(normals, def.faceLayoutValues);
    geo.dispose();
  }

  return layouts as Record<number, FaceLayoutEntry[]>;
})();

// ─── Face Label Utilities ────────────────────────────────────────────────────

/** Label size per die type (relative to face size) */
const LABEL_SIZES: Record<number, number> = {
  4: 3.2,
  6: 3.2,
  8: 2.6,
  10: 2.0,
  12: 2.2,
  20: 1.8,
};

const LABEL_OFFSET = 0.08;

/** Compute face centroid positions and normals from geometry */
function computeFaceCentroids(geometry: THREE.BufferGeometry): { center: THREE.Vector3; normal: THREE.Vector3 }[] {
  const nonIndexed = geometry.clone().toNonIndexed();
  const positions = nonIndexed.attributes.position.array as ArrayLike<number>;
  const faceGroups = new Map<string, { vertices: THREE.Vector3[]; normal: THREE.Vector3 }>();

  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const cb = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const centroid = new THREE.Vector3();

  for (let i = 0; i < positions.length; i += 9) {
    a.set(positions[i], positions[i + 1], positions[i + 2]);
    b.set(positions[i + 3], positions[i + 4], positions[i + 5]);
    c.set(positions[i + 6], positions[i + 7], positions[i + 8]);

    ab.subVectors(a, b);
    cb.subVectors(c, b);
    normal.copy(cb).cross(ab).normalize();

    centroid.copy(a).add(b).add(c).multiplyScalar(1 / 3);
    if (normal.dot(centroid) < 0) normal.negate();

    const key = `${round(normal.x)},${round(normal.y)},${round(normal.z)}`;
    if (!faceGroups.has(key)) {
      faceGroups.set(key, { vertices: [], normal: normal.clone() });
    }
    faceGroups.get(key)!.vertices.push(a.clone(), b.clone(), c.clone());
  }

  const result: { center: THREE.Vector3; normal: THREE.Vector3 }[] = [];
  for (const [, group] of faceGroups) {
    const avg = new THREE.Vector3();
    for (const v of group.vertices) avg.add(v);
    avg.divideScalar(group.vertices.length);
    result.push({ center: avg, normal: group.normal.clone().normalize() });
  }

  nonIndexed.dispose();
  return result;
}

/** Module-level texture cache for numbered face labels */
const _numberTextureCache = new Map<string, THREE.CanvasTexture>();

/** Create a canvas texture with a die number rendered on it */
function createNumberTexture(text: string, textColor = '#ffffff', bgColor = 'rgba(0,0,0,0.3)'): THREE.CanvasTexture {
  const cacheKey = `${text}|${textColor}|${bgColor}`;
  const cached = _numberTextureCache.get(cacheKey);
  if (cached) return cached;

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, size, size);

  // Circular inset background
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = bgColor;
  ctx.fill();

  // Number text with serif font
  const fontSize = text.length > 1 ? 52 : 66;
  ctx.font = `bold ${fontSize}px 'Cinzel', Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textColor;
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 4;
  ctx.fillText(text, size / 2, size / 2 + 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  _numberTextureCache.set(cacheKey, texture);
  return texture;
}

/** Create a procedural felt texture for the tray floor */
function createFeltTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Base green felt color
  ctx.fillStyle = '#2d5a27';
  ctx.fillRect(0, 0, size, size);

  // Add fine noise for felt fiber texture
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 18;
    data[i]     = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);

  // Subtle cross-hatch for woven felt look
  ctx.globalAlpha = 0.04;
  ctx.strokeStyle = '#1a3a18';
  ctx.lineWidth = 1;
  for (let y = 0; y < size; y += 3) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y + (Math.random() - 0.5) * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

/** Create a procedural wood grain texture for tray walls */
function createWoodTexture(): THREE.CanvasTexture {
  const width = 512;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Base dark walnut
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(0, 0, width, height);

  // Wood grain lines
  for (let i = 0; i < 60; i++) {
    const y = Math.random() * height;
    const thickness = 0.5 + Math.random() * 2;
    const alpha = 0.06 + Math.random() * 0.12;
    ctx.strokeStyle = `rgba(30, 20, 10, ${alpha})`;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < width; x += 15) {
      ctx.lineTo(x, y + (Math.random() - 0.5) * 3);
    }
    ctx.stroke();
  }

  // Lighter grain highlights
  for (let i = 0; i < 20; i++) {
    const y = Math.random() * height;
    ctx.strokeStyle = `rgba(120, 90, 60, ${0.04 + Math.random() * 0.06})`;
    ctx.lineWidth = 0.5 + Math.random();
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < width; x += 20) {
      ctx.lineTo(x, y + (Math.random() - 0.5) * 2);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/** Add number labels to each face of a die mesh */
function addFaceLabels(
  dieMesh: THREE.Mesh,
  sides: number,
  faceLayout: FaceLayoutEntry[],
  isPercentileTens = false,
): void {
  const centroids = computeFaceCentroids(dieMesh.geometry);
  const labelSize = LABEL_SIZES[sides] ?? 2.0;

  for (const face of faceLayout) {
    // Find the centroid whose normal best matches this face layout normal
    let best = centroids[0];
    let bestDot = -Infinity;
    for (const c of centroids) {
      const dot = c.normal.dot(face.normal);
      if (dot > bestDot) {
        bestDot = dot;
        best = c;
      }
    }

    // Determine display text for this face
    let displayText: string;
    if (isPercentileTens) {
      const v = face.value * 10;
      displayText = v === 0 || v === 100 ? '00' : String(v);
    } else if (sides === 10) {
      displayText = String(face.value === 10 ? 0 : face.value);
    } else {
      displayText = String(face.value);
    }

    // Create textured label plane
    const texture = createNumberTexture(displayText);
    const planeMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const planeGeo = new THREE.PlaneGeometry(labelSize, labelSize);
    const labelMesh = new THREE.Mesh(planeGeo, planeMat);

    // Position at face centroid, offset slightly outward to prevent z-fighting
    const offset = best.normal.clone().multiplyScalar(LABEL_OFFSET);
    labelMesh.position.copy(best.center).add(offset);

    // Orient the plane to face outward along the face normal
    const target = best.center.clone().add(best.normal);
    labelMesh.lookAt(target);

    dieMesh.add(labelMesh);
  }
}

// ─── Random Utilities ────────────────────────────────────────────────────────

function secureRandom(): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] / (0xFFFFFFFF + 1);
}

function rand(min: number, max: number): number {
  return min + secureRandom() * (max - min);
}

// Uniform random quaternion using Shoemake's algorithm
function randomQuaternion(): { x: number; y: number; z: number; w: number } {
  const u1 = secureRandom();
  const u2 = secureRandom() * 2 * Math.PI;
  const u3 = secureRandom() * 2 * Math.PI;
  
  const sq1 = Math.sqrt(1 - u1);
  const sq2 = Math.sqrt(u1);
  
  return {
    x: sq1 * Math.sin(u2),
    y: sq1 * Math.cos(u2),
    z: sq2 * Math.sin(u3),
    w: sq2 * Math.cos(u3),
  };
}

// ─── Expression Parser ───────────────────────────────────────────────────────

interface ParsedDice {
  count: number;
  sides: number;
  sign: 1 | -1;
}

interface ParsedExpression {
  dice: ParsedDice[];
  modifier: number;
}

function parseExpression(expr: string): ParsedExpression {
  const dice: ParsedDice[] = [];
  let modifier = 0;
  
  const normalized = expr.toLowerCase().replace(/\s+/g, '');
  const tokens = normalized.match(/[+-]?[^+-]+/g) ?? [];

  for (const token of tokens) {
    const diceMatch = token.match(/^([+-]?)(\d*)d(\d+)$/i);
    if (diceMatch) {
      const sign = diceMatch[1] === '-' ? -1 : 1;
      const count = diceMatch[2] ? parseInt(diceMatch[2], 10) : 1;
      const sides = parseInt(diceMatch[3], 10);

      if (![4, 6, 8, 10, 12, 20, 100].includes(sides)) {
        throw new Error(`Invalid die: d${sides}`);
      }

      for (let i = 0; i < Math.abs(count); i++) {
        dice.push({ count: 1, sides, sign });
      }
      continue;
    }

    const n = Number(token);
    if (!Number.isFinite(n)) {
      throw new Error(`Invalid expression term: ${token}`);
    }
    modifier += n;
  }
  
  if (dice.length === 0) {
    throw new Error('No valid dice in expression');
  }
  
  return { dice, modifier };
}

// ─── Die Instance ────────────────────────────────────────────────────────────

interface DieInstance {
  mesh: THREE.Mesh;
  body: RAPIER.RigidBody;
  sides: number;
  sign: 1 | -1;
  isPercentileTens?: boolean;
  isPercentileOnes?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const DiceRoller = forwardRef<DiceRollerRef, DiceRollerProps>(function DiceRoller(
  { width = 400, height = 300, onRollStart, onRollComplete, onReadyChange },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const worldRef = useRef<RAPIER.World | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const diceRef = useRef<DieInstance[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);
  const destroyedRef = useRef<boolean>(false);
  
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<string>('Initializing…');
  const [isReady, setIsReady] = useState(false);

  // Initialize scene and physics
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Reset destroyed flag for new mount
    destroyedRef.current = false;
    
    // Local refs to avoid accessing stale refs during async init
    let localRenderer: THREE.WebGLRenderer | null = null;
    let localWorld: RAPIER.World | null = null;
    let localAnimationId: number | null = null;
    let isCleanedUp = false;
    
    const init = async () => {
      // Initialize Rapier WASM
      await RAPIER.init();
      
      // Check if already cleaned up during async init
      if (isCleanedUp || !containerRef.current) return;
      
      const container = containerRef.current;
      
      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a1a2e);
      sceneRef.current = scene;
      
      // Camera - positioned for larger tray
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
      camera.position.set(0, 120, 120);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;
      
      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap; // Use non-deprecated shadow map
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;
      localRenderer = renderer;
      
      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enablePan = false;
      controls.minDistance = 60;
      controls.maxDistance = 250;
      controls.maxPolarAngle = Math.PI / 2.1;
      controlsRef.current = controls;
      
      // Lighting - enhanced for larger scene
      const ambient = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambient);
      
      const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
      mainLight.position.set(60, 100, 60);
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.width = 2048;
      mainLight.shadow.mapSize.height = 2048;
      mainLight.shadow.camera.near = 10;
      mainLight.shadow.camera.far = 400;
      mainLight.shadow.camera.left = -100;
      mainLight.shadow.camera.right = 100;
      mainLight.shadow.camera.top = 100;
      mainLight.shadow.camera.bottom = -100;
      scene.add(mainLight);
      
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
      fillLight.position.set(-40, 60, -40);
      scene.add(fillLight);
      
      // Add rim lighting for better dice visibility
      const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
      rimLight.position.set(0, 20, -80);
      scene.add(rimLight);

      // Environment map for realistic dice reflections (warm golden tones)
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();
      const envScene = new THREE.Scene();
      envScene.background = new THREE.Color(0x1a1a2e);
      const envLight1 = new THREE.PointLight(0xffd700, 100, 200);
      envLight1.position.set(50, 80, 50);
      envScene.add(envLight1);
      const envLight2 = new THREE.PointLight(0xc49b52, 60, 200);
      envLight2.position.set(-40, 60, -40);
      envScene.add(envLight2);
      const envRT = pmremGenerator.fromScene(envScene, 0.04);
      scene.environment = envRT.texture;
      pmremGenerator.dispose();

      // Physics world - use object syntax for initialization
      const world = new RAPIER.World({ x: GRAVITY.x, y: GRAVITY.y, z: GRAVITY.z });
      world.timestep = PHYSICS_STEP;
      worldRef.current = world;
      localWorld = world;
      
      // Create dice tray
      createDiceTray(scene, world);
      
      // Initialize timing
      lastTimeRef.current = performance.now();
      accumulatorRef.current = 0;
      
      // Animation loop using performance.now() instead of deprecated Clock
      const animate = () => {
        // Check if destroyed before doing anything
        if (destroyedRef.current || isCleanedUp) return;
        
        localAnimationId = requestAnimationFrame(animate);
        animationRef.current = localAnimationId;
        
        // Calculate delta time
        const now = performance.now();
        const delta = Math.min((now - lastTimeRef.current) / 1000, 0.1);
        lastTimeRef.current = now;
        accumulatorRef.current += delta;
        
        // Fixed timestep physics updates
        let substeps = 0;
        while (accumulatorRef.current >= PHYSICS_STEP && substeps < MAX_SUBSTEPS) {
          if (destroyedRef.current || isCleanedUp) return;
          try {
            world.step();
          } catch {
            // World was destroyed, stop animating
            return;
          }
          accumulatorRef.current -= PHYSICS_STEP;
          substeps++;
        }
        
        if (substeps >= MAX_SUBSTEPS) {
          accumulatorRef.current = 0;
        }
        
        // Update mesh transforms (with safety checks)
        for (const d of diceRef.current) {
          if (destroyedRef.current || isCleanedUp) return;
          try {
            const t = d.body.translation();

            const trayLimit = TRAY_SIZE / 2 - 4;
            if (Math.abs(t.x) > trayLimit || Math.abs(t.z) > trayLimit || t.y < -10) {
              const clampedX = Math.max(-trayLimit, Math.min(trayLimit, t.x));
              const clampedZ = Math.max(-trayLimit, Math.min(trayLimit, t.z));
              d.body.setTranslation({ x: clampedX, y: Math.max(4, t.y), z: clampedZ }, true);
              d.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
              d.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
            }

            const r = d.body.rotation();
            const updatedT = d.body.translation();
            d.mesh.position.set(updatedT.x, updatedT.y, updatedT.z);
            d.mesh.quaternion.set(r.x, r.y, r.z, r.w);
          } catch {
            // Body was destroyed, skip
            continue;
          }
        }
        
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
      
      // Mark as ready after initialization
      setIsReady(true);
      setResult('Ready');
      onReadyChange?.(true);
    };
    
    init();
    
    return () => {
      isCleanedUp = true;
      destroyedRef.current = true;
      setIsReady(false);
      onReadyChange?.(false);
      
      // Cancel animation FIRST before destroying resources
      if (localAnimationId !== null) {
        cancelAnimationFrame(localAnimationId);
      }
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // Small delay to ensure animation loop has stopped
      setTimeout(() => {
        // Clean up dice from physics world
        if (localWorld) {
          for (const d of diceRef.current) {
            try {
              localWorld.removeRigidBody(d.body);
            } catch {
              // Already removed or world destroyed
            }
          }
          diceRef.current = [];
        }
        
        // Clean up renderer
        if (localRenderer && containerRef.current) {
          try {
            containerRef.current.removeChild(localRenderer.domElement);
          } catch {
            // Already removed
          }
          localRenderer.dispose();
        }
        
        // Clear refs
        sceneRef.current = null;
        cameraRef.current = null;
        rendererRef.current = null;
        worldRef.current = null;
        controlsRef.current = null;
      }, 0);
    };
  }, [onReadyChange]);

  // Resize handler — only updates camera and renderer; no scene teardown
  useEffect(() => {
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    if (camera && renderer) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
  }, [width, height]);

  // Create dice tray colliders
  function createDiceTray(scene: THREE.Scene, world: RAPIER.World) {
    const traySize = TRAY_SIZE;
    const wallHeight = TRAY_WALL_HEIGHT;
    const wallThickness = TRAY_WALL_THICKNESS;
    
    // Floor (felt) - procedural felt texture
    const floorGeo = new THREE.BoxGeometry(traySize, TRAY_FLOOR_THICKNESS, traySize, 4, 1, 4);
    const feltTexture = createFeltTexture();
    const floorMat = new THREE.MeshStandardMaterial({
      map: feltTexture,
      color: 0x2d5a27,
      roughness: 0.95,
      metalness: 0,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -TRAY_FLOOR_THICKNESS / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    
    const floorDesc = RAPIER.ColliderDesc.cuboid(traySize / 2, TRAY_FLOOR_THICKNESS / 2, traySize / 2)
      .setFriction(FELT_FRICTION)
      .setRestitution(FELT_RESTITUTION);
    world.createCollider(floorDesc);
    
    // Walls (wood) - procedural wood grain material
    const woodTexture = createWoodTexture();
    const wallMat = new THREE.MeshStandardMaterial({
      map: woodTexture,
      color: 0x5d4037,
      roughness: 0.55,
      metalness: 0.12,
    });
    
    const wallPositions = [
      { x: 0, z: traySize / 2 + wallThickness / 2, rx: 0, ry: 0 },
      { x: 0, z: -traySize / 2 - wallThickness / 2, rx: 0, ry: 0 },
      { x: traySize / 2 + wallThickness / 2, z: 0, rx: 0, ry: Math.PI / 2 },
      { x: -traySize / 2 - wallThickness / 2, z: 0, rx: 0, ry: Math.PI / 2 },
    ];
    
    const wallGeo = new THREE.BoxGeometry(traySize + wallThickness * 2, wallHeight, wallThickness);
    
    wallPositions.forEach(({ x, z, ry }) => {
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(x, wallHeight / 2, z);
      wall.rotation.y = ry;
      wall.receiveShadow = true;
      wall.castShadow = true;
      scene.add(wall);
    });
    
    // Wall colliders
    const wallHx = (traySize + wallThickness * 2) / 2;
    const wallHy = wallHeight / 2;
    const wallHz = wallThickness / 2;
    
    [
      { x: 0, z: traySize / 2 + wallThickness / 2, hx: wallHx, hz: wallHz },
      { x: 0, z: -traySize / 2 - wallThickness / 2, hx: wallHx, hz: wallHz },
      { x: traySize / 2 + wallThickness / 2, z: 0, hx: wallHz, hz: wallHx },
      { x: -traySize / 2 - wallThickness / 2, z: 0, hx: wallHz, hz: wallHx },
    ].forEach(({ x, z, hx, hz }) => {
      const desc = RAPIER.ColliderDesc.cuboid(hx, wallHy, hz)
        .setTranslation(x, wallHy, z)
        .setFriction(WOOD_FRICTION)
        .setRestitution(WOOD_RESTITUTION);
      world.createCollider(desc);
    });

    // Invisible tall containment walls to guarantee dice remain in-tray.
    const containmentHy = TRAY_CONTAINMENT_HEIGHT / 2;
    [
      { x: 0, z: traySize / 2 + wallThickness / 2, hx: wallHx, hz: wallHz },
      { x: 0, z: -traySize / 2 - wallThickness / 2, hx: wallHx, hz: wallHz },
      { x: traySize / 2 + wallThickness / 2, z: 0, hx: wallHz, hz: wallHx },
      { x: -traySize / 2 - wallThickness / 2, z: 0, hx: wallHz, hz: wallHx },
    ].forEach(({ x, z, hx, hz }) => {
      const guard = RAPIER.ColliderDesc.cuboid(hx, containmentHy, hz)
        .setTranslation(x, containmentHy, z)
        .setFriction(WOOD_FRICTION)
        .setRestitution(WOOD_RESTITUTION);
      world.createCollider(guard);
    });
  }

  // Spawn a single die
  function spawnDie(sides: number, isPercentileTens = false): DieInstance {
    const scene = sceneRef.current!;
    const world = worldRef.current!;
    
    const def = DICE_DEFS[sides === 100 ? 10 : sides];
    if (!def) throw new Error(`Unknown die: d${sides}`);
    
    const geometry = def.geometry();
    
    // High-quality material with subtle sheen
    const material = new THREE.MeshStandardMaterial({
      color: isPercentileTens ? 0x8e44ad : def.color,
      roughness: 0.15,
      metalness: 0.4,
      envMapIntensity: 0.5,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    
    // Physics body with tuned damping
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setLinearDamping(0.15)
      .setAngularDamping(0.15);
    const body = world.createRigidBody(bodyDesc);
    
    // Convex hull collider
    const positions = geometry.getAttribute('position');
    const vertices = new Float32Array(positions.array);

    const roundHullFactory = (RAPIER.ColliderDesc as unknown as {
      roundConvexHull?: (points: Float32Array, borderRadius: number) => RAPIER.ColliderDesc | null;
    }).roundConvexHull;

    const colliderDesc = (roundHullFactory
      ? roundHullFactory(vertices, def.edgeRound)
      : RAPIER.ColliderDesc.convexHull(vertices))
      ?.setMass(def.mass)
      .setFriction(DICE_FRICTION)
      .setRestitution(DICE_RESTITUTION);

    if (!colliderDesc) {
      throw new Error(`Failed to create collider for d${sides}`);
    }

    world.createCollider(colliderDesc, body);

    try {
      body.enableCcd(true);
    } catch {
      // Older API may not support enableCcd; safe to ignore.
    }

    // Add face number labels
    const effectiveSides = sides === 100 ? 10 : sides;
    const faceLayout = FACE_LAYOUTS[effectiveSides];
    if (faceLayout) {
      addFaceLabels(mesh, effectiveSides, faceLayout, isPercentileTens);
    }

    // Edge highlight for visual clarity between faces
    const edgesGeo = new THREE.EdgesGeometry(geometry, 15);
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.12,
    });
    mesh.add(new THREE.LineSegments(edgesGeo, edgesMat));

    return { mesh, body, sides, sign: 1 };
  }

  // Read die value from orientation
  function readDieValue(die: DieInstance): number {
    const sides = die.sides === 100 ? 10 : die.sides;
    const faceLayout = FACE_LAYOUTS[sides];
    if (!faceLayout) throw new Error(`No face layout for d${sides}`);

    const rotation = die.body.rotation();
    const quat = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
    const upWorld = new THREE.Vector3(0, 1, 0);

    if (die.sides === 4) {
      // D4: find the BOTTOM face (normal most opposed to world-up).
      // A tetrahedron's 3 upper faces all share nearly identical upward dot
      // products (~1/3 each), making the "most upward" selection unreliable.
      // The bottom face is always unambiguous (dot ≈ −1). Its value equals
      // the standard D4 apex-vertex reading.
      let bottomValue = faceLayout[0]?.value ?? 1;
      let worstDot = Infinity;
      for (const face of faceLayout) {
        const normal = face.normal.clone().applyQuaternion(quat);
        const dot = normal.dot(upWorld);
        if (dot < worstDot) {
          worstDot = dot;
          bottomValue = face.value;
        }
      }
      return bottomValue;
    }

    // All other dice: face whose normal points most upward is the top face
    let value = faceLayout[0]?.value ?? 1;
    let bestDot = -Infinity;

    for (const face of faceLayout) {
      const normal = face.normal.clone().applyQuaternion(quat);
      const dot = normal.dot(upWorld);
      if (dot > bestDot) {
        bestDot = dot;
        value = face.value;
      }
    }

    // For d10, 0 represents 10
    if (die.sides === 10 && value === 0) value = 10;
    if (die.sides === 100 && die.isPercentileTens) {
      value *= 10;
      if (value === 0) value = 100;
    }

    return value;
  }

  // Check if die is settled
  function isDieSettled(die: DieInstance): boolean {
    try {
      const linVel = die.body.linvel();
      const angVel = die.body.angvel();
      
      const linSpeed = Math.sqrt(linVel.x ** 2 + linVel.y ** 2 + linVel.z ** 2);
      const angSpeed = Math.sqrt(angVel.x ** 2 + angVel.y ** 2 + angVel.z ** 2);
      
      return linSpeed < SETTLE_LINEAR_THRESHOLD && angSpeed < SETTLE_ANGULAR_THRESHOLD;
    } catch {
      // Body was destroyed
      return true;
    }
  }

  // Clear all dice
  const clearDice = useCallback(() => {
    if (destroyedRef.current) return;
    
    const scene = sceneRef.current;
    const world = worldRef.current;
    
    if (!scene || !world) return;
    
    for (const d of diceRef.current) {
      try {
        // Dispose child meshes (face labels, edge highlights)
        d.mesh.traverse(child => {
          if (child === d.mesh) return;
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (child.material instanceof THREE.Material) {
              const mat = child.material as THREE.MeshBasicMaterial;
              mat.map?.dispose();
              mat.dispose();
            }
          } else if (child instanceof THREE.LineSegments) {
            child.geometry.dispose();
            (child.material as THREE.Material).dispose();
          }
        });
        scene.remove(d.mesh);
        d.mesh.geometry.dispose();
        (d.mesh.material as THREE.Material).dispose();
        world.removeRigidBody(d.body);
      } catch {
        // Already removed or world destroyed
      }
    }
    
    diceRef.current = [];
  }, []);

  // Execute roll
  const executeRoll = useCallback(async (expression: string): Promise<DiceRollResult> => {
    if (destroyedRef.current) {
      throw new Error('DiceRoller was unmounted');
    }
    if (!worldRef.current || !sceneRef.current) {
      throw new Error('DiceRoller not initialized');
    }
    
    setIsRolling(true);
    setResult('Rolling…');
    onRollStart?.();
    
    clearDice();

    let parsed: ParsedExpression;
    try {
      parsed = parseExpression(expression);
    } catch (error) {
      setIsRolling(false);
      setResult((error as Error).message);
      throw error;
    }

    const dice: DieInstance[] = [];
    const percentileIndices: { tens: number; ones: number }[] = [];

    const totalSlots = parsed.dice.reduce((sum, d) => sum + (d.sides === 100 ? 2 : 1), 0);
    const totalRows = Math.max(1, Math.ceil(totalSlots / SPAWN_CONFIG.maxPerRow));
    const depthOffset = ((totalRows - 1) * SPAWN_CONFIG.spread) / 2;

    let percentileCount = 0;
    
    for (let i = 0; i < parsed.dice.length; i++) {
      const { sides, sign } = parsed.dice[i];
      const diceIndex = i + percentileCount;
      const col = diceIndex % SPAWN_CONFIG.maxPerRow;
      const row = Math.floor(diceIndex / SPAWN_CONFIG.maxPerRow);
      
      // Center the row of dice
      const rowDiceCount = Math.min(Math.max(0, totalSlots - row * SPAWN_CONFIG.maxPerRow), SPAWN_CONFIG.maxPerRow);
      const rowOffset = (rowDiceCount - 1) * SPAWN_CONFIG.spread / 2;
      
      if (sides === 100) {
        // Percentile: spawn tens and ones dice
        const tensIdx = dice.length;
        
        const tensDie = spawnDie(10, true);
        tensDie.sign = sign;
        (tensDie as DieInstance).isPercentileTens = true;
        
        const tensX = (col * SPAWN_CONFIG.spread - rowOffset) + rand(-SPAWN_CONFIG.positionJitter, SPAWN_CONFIG.positionJitter);
        const tensZ = (row * SPAWN_CONFIG.spread - depthOffset) + rand(-SPAWN_CONFIG.positionJitter, SPAWN_CONFIG.positionJitter);
        const tensY = SPAWN_CONFIG.baseY + rand(0, SPAWN_CONFIG.heightVariation);
        
        tensDie.body.setTranslation({ x: tensX, y: tensY, z: tensZ }, true);
        
        const tensQuat = randomQuaternion();
        tensDie.body.setRotation(tensQuat, true);
        
        tensDie.body.applyImpulse({
          x: rand(THROW_CONFIG.horizontalMin, THROW_CONFIG.horizontalMax) * (secureRandom() < 0.5 ? 1 : -1),
          y: rand(THROW_CONFIG.verticalMin, THROW_CONFIG.verticalMax),
          z: rand(THROW_CONFIG.horizontalMin, THROW_CONFIG.horizontalMax) * (secureRandom() < 0.5 ? 1 : -1),
        }, true);
        
        tensDie.body.applyTorqueImpulse({
          x: rand(THROW_CONFIG.torqueMin, THROW_CONFIG.torqueMax),
          y: rand(THROW_CONFIG.torqueMin, THROW_CONFIG.torqueMax),
          z: rand(THROW_CONFIG.torqueMin, THROW_CONFIG.torqueMax),
        }, true);
        
        dice.push(tensDie);
        
        // Ones die
        const onesIdx = dice.length;
        const onesDie = spawnDie(10, false);
        onesDie.sign = sign;
        (onesDie as DieInstance).isPercentileOnes = true;
        
        const onesX = ((col + 1) * SPAWN_CONFIG.spread - rowOffset) + rand(-SPAWN_CONFIG.positionJitter, SPAWN_CONFIG.positionJitter);
        const onesZ = (row * SPAWN_CONFIG.spread - depthOffset) + rand(-SPAWN_CONFIG.positionJitter, SPAWN_CONFIG.positionJitter);
        const onesY = SPAWN_CONFIG.baseY + rand(0, SPAWN_CONFIG.heightVariation);
        
        onesDie.body.setTranslation({ x: onesX, y: onesY, z: onesZ }, true);
        
        const onesQuat = randomQuaternion();
        onesDie.body.setRotation(onesQuat, true);
        
        onesDie.body.applyImpulse({
          x: rand(THROW_CONFIG.horizontalMin, THROW_CONFIG.horizontalMax) * (secureRandom() < 0.5 ? 1 : -1),
          y: rand(THROW_CONFIG.verticalMin, THROW_CONFIG.verticalMax),
          z: rand(THROW_CONFIG.horizontalMin, THROW_CONFIG.horizontalMax) * (secureRandom() < 0.5 ? 1 : -1),
        }, true);
        
        onesDie.body.applyTorqueImpulse({
          x: rand(THROW_CONFIG.torqueMin, THROW_CONFIG.torqueMax),
          y: rand(THROW_CONFIG.torqueMin, THROW_CONFIG.torqueMax),
          z: rand(THROW_CONFIG.torqueMin, THROW_CONFIG.torqueMax),
        }, true);
        
        dice.push(onesDie);
        percentileIndices.push({ tens: tensIdx, ones: onesIdx });
        percentileCount++;
        continue;
      }
      
      // Standard die
      const die = spawnDie(sides);
      die.sign = sign;
      
      const x = (col * SPAWN_CONFIG.spread - rowOffset) + rand(-SPAWN_CONFIG.positionJitter, SPAWN_CONFIG.positionJitter);
      const z = (row * SPAWN_CONFIG.spread - depthOffset) + rand(-SPAWN_CONFIG.positionJitter, SPAWN_CONFIG.positionJitter);
      const y = SPAWN_CONFIG.baseY + rand(0, SPAWN_CONFIG.heightVariation);
      
      die.body.setTranslation({ x, y, z }, true);
      
      const quat = randomQuaternion();
      die.body.setRotation(quat, true);
      
      die.body.applyImpulse({
        x: rand(THROW_CONFIG.horizontalMin, THROW_CONFIG.horizontalMax) * (secureRandom() < 0.5 ? 1 : -1),
        y: rand(THROW_CONFIG.verticalMin, THROW_CONFIG.verticalMax),
        z: rand(THROW_CONFIG.horizontalMin, THROW_CONFIG.horizontalMax) * (secureRandom() < 0.5 ? 1 : -1),
      }, true);
      
      die.body.applyTorqueImpulse({
        x: rand(THROW_CONFIG.torqueMin, THROW_CONFIG.torqueMax),
        y: rand(THROW_CONFIG.torqueMin, THROW_CONFIG.torqueMax),
        z: rand(THROW_CONFIG.torqueMin, THROW_CONFIG.torqueMax),
      }, true);
      
      dice.push(die);
    }
    
    diceRef.current = dice;
    
    return new Promise((resolve, reject) => {
      let settleFrames = 0;
      const startedAt = performance.now();

      const finalizeRoll = () => {
        // Calculate results
        const rawValues: { value: number; signed: number; sign: 1 | -1; isPercentile?: boolean; sides?: number }[] = [];
        const breakdown: string[] = [];

        try {
          // Process percentile dice
          for (const p of percentileIndices) {
            if (destroyedRef.current) break;
            const tensValue = readDieValue(dice[p.tens]);
            const onesValue = readDieValue(dice[p.ones]);

            let percentileResult: number;
            if (tensValue === 100) {
              percentileResult = onesValue === 10 ? 100 : onesValue;
            } else {
              percentileResult = tensValue + (onesValue === 10 ? 0 : onesValue);
            }
            if (percentileResult === 0) percentileResult = 100;

            const sign = dice[p.tens]?.sign ?? 1;
            rawValues.push({ value: percentileResult, signed: percentileResult * sign, sign, isPercentile: true });
            breakdown.push(`${sign < 0 ? '-' : ''}d100:${percentileResult}`);
          }

          // Process standard dice
          for (let i = 0; i < dice.length; i++) {
            if (destroyedRef.current) break;
            const d = dice[i];
            if (d.isPercentileTens || d.isPercentileOnes) continue;

            const value = readDieValue(d);
            rawValues.push({ value, signed: value * d.sign, sign: d.sign, sides: d.sides });
            breakdown.push(`${d.sign < 0 ? '-' : ''}d${d.sides}:${value}`);
          }
        } catch (err) {
          reject(new Error('Failed to read dice values: ' + (err as Error).message));
          return;
        }

        const values = rawValues.map(r => r.value * r.sign);
        const sum = rawValues.reduce((acc, item) => acc + item.signed, 0);
        const total = sum + parsed.modifier;

        const result: DiceRollResult = {
          values,
          sum,
          modifier: parsed.modifier,
          total,
          breakdown,
        };

        const lines = [
          `Results: ${breakdown.join(', ')}`,
          `Sum: ${sum}`,
          parsed.modifier !== 0 ? `Modifier: ${parsed.modifier >= 0 ? '+' : ''}${parsed.modifier}` : '',
          `Total: ${total}`,
        ].filter(Boolean);

        setResult(lines.join('\n'));
        setIsRolling(false);
        onRollComplete?.(result);
        resolve(result);
      };
      
      const checkSettled = () => {
        // Check if component was destroyed
        if (destroyedRef.current) {
          setIsRolling(false);
          reject(new Error('DiceRoller was unmounted during roll'));
          return;
        }
        
        let allSettled = true;
        try {
          allSettled = dice.every(d => {
            if (destroyedRef.current) return true; // Bail out
            try {
              return d.body.isSleeping() || isDieSettled(d);
            } catch {
              return true; // Body destroyed, consider settled
            }
          });
        } catch {
          // World destroyed
          setIsRolling(false);
          reject(new Error('Physics world destroyed during roll'));
          return;
        }
        
        if (allSettled) {
          settleFrames++;
        } else {
          settleFrames = 0;
        }
        
        if (settleFrames >= SETTLE_FRAMES_REQUIRED) {
          // Check again before reading values
          if (destroyedRef.current) {
            setIsRolling(false);
            reject(new Error('DiceRoller was unmounted during roll'));
            return;
          }

          finalizeRoll();
          return;
        }

        if (performance.now() - startedAt > MAX_ROLL_TIME_MS) {
          // Fallback so UI never hangs if a die keeps micro-jittering.
          finalizeRoll();
          return;
        }
        
        requestAnimationFrame(checkSettled);
      };
      
      requestAnimationFrame(checkSettled);
    });
  }, [clearDice, onRollStart, onRollComplete]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    roll: executeRoll,
    clear: clearDice,
    get isReady() { return isReady; },
  }), [executeRoll, clearDice, isReady]);

  return (
    <div className="dice-roller-container">
      <div
        ref={containerRef}
        className="dice-roller-canvas"
        style={{ width, height, borderRadius: '8px', overflow: 'hidden' }}
      />
      <div
        className={`mt-2 px-3 py-2 bg-dark-ink/30 rounded font-mono text-[13px] whitespace-pre-line min-h-[60px] ${
          isRolling ? 'text-gold' : 'text-parchment'
        }`}
      >
        {result}
      </div>
    </div>
  );
});

export default DiceRoller;
