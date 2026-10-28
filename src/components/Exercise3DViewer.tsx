import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Upload,
  Eye,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Info,
  Play,
  Pause,
} from 'lucide-react';
import { ExerciseItem, MobilityExerciseItem } from '../utils/fitnessLogic';
import {
  saveCustomModelToDB,
  loadCustomModelFromDB,
  clearCustomModelFromDB,
} from '../utils/modelStorage';
import {
  createExerciseSkeletalClip,
  snapshotAndResetModelBindPose,
  AnyPoseType,
} from '../utils/skeletalAnimator';

interface Props {
  poseType: ExerciseItem['poseType'] | MobilityExerciseItem['poseType'];
  exerciseName?: string;
  depthFactor?: number; // 0 (top/start) to 1 (bottom of eccentric)
  targetMuscles?: string;
  className?: string;
  heightClass?: string;
  showControls?: boolean;
}

// Memory-friendly reusable vectors for render loop
const _vec3 = new THREE.Vector3();

// Biomechanical glowing muscle activations and joint articulation halos for lowpoly skeletal model
function applySkeletalMuscleHighlights(
  model: THREE.Object3D,
  poseType: AnyPoseType,
  visible: boolean
) {
  // 1. Remove previous highlight markers
  const toRemove: THREE.Object3D[] = [];
  model.traverse((child) => {
    if (child.userData?.isSkeletalHighlight) {
      toRemove.push(child);
    }
  });
  toRemove.forEach((child) => {
    if (child.parent) child.parent.remove(child);
    if (child instanceof THREE.Mesh) {
      child.geometry?.dispose();
      if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
      else child.material?.dispose();
    }
  });

  if (!visible) return;

  // 2. Identify target bones for current poseType
  let boneTargets: string[] = [];
  switch (poseType) {
    case 'warmup':
      boneTargets = [
        'mixamorigSpine1',
        'mixamorigSpine2',
        'mixamorigLeftShoulder',
        'mixamorigRightShoulder',
        'mixamorigLeftUpLeg',
        'mixamorigRightUpLeg',
      ];
      break;
    case 'pushup':
      boneTargets = [
        'mixamorigLeftArm',
        'mixamorigRightArm',
        'mixamorigLeftForeArm',
        'mixamorigRightForeArm',
        'mixamorigSpine1',
        'mixamorigSpine2',
      ];
      break;
    case 'splitsquat':
      boneTargets = [
        'mixamorigLeftUpLeg',
        'mixamorigRightUpLeg',
        'mixamorigLeftLeg',
        'mixamorigRightLeg',
        'mixamorigHips',
      ];
      break;
    case 'pikepushup':
      boneTargets = [
        'mixamorigLeftShoulder',
        'mixamorigRightShoulder',
        'mixamorigLeftArm',
        'mixamorigRightArm',
        'mixamorigHead',
      ];
      break;
    case 'pullup':
      boneTargets = [
        'mixamorigSpine1',
        'mixamorigSpine2',
        'mixamorigLeftArm',
        'mixamorigRightArm',
        'mixamorigLeftForeArm',
        'mixamorigRightForeArm',
      ];
      break;
    case 'cobra':
      boneTargets = [
        'mixamorigSpine',
        'mixamorigSpine1',
        'mixamorigSpine2',
        'mixamorigNeck',
      ];
      break;
    case 'armcircles':
      boneTargets = [
        'mixamorigLeftShoulder',
        'mixamorigRightShoulder',
        'mixamorigLeftArm',
        'mixamorigRightArm',
      ];
      break;
    case 'legswings':
      boneTargets = [
        'mixamorigRightUpLeg',
        'mixamorigRightLeg',
        'mixamorigHips',
      ];
      break;
    case 'torsotwists':
      boneTargets = [
        'mixamorigSpine1',
        'mixamorigSpine2',
        'mixamorigLeftArm',
        'mixamorigRightArm',
      ];
      break;
    default:
      boneTargets = ['mixamorigSpine1'];
  }

  // 3. Attach glowing spherical halos & pulsation markers
  const glowMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0xf43f5e,
    emissiveIntensity: 1.8,
    roughness: 0.3,
    metalness: 0.2,
    transparent: true,
    opacity: 0.85,
  });

  const jointMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 1.5,
    roughness: 0.2,
    metalness: 0.8,
    transparent: true,
    opacity: 0.9,
  });

  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xf43f5e,
    wireframe: true,
    transparent: true,
    opacity: 0.45,
  });

  boneTargets.forEach((boneName) => {
    const bone = model.getObjectByName(boneName);
    if (bone) {
      const isJoint = boneName.includes('Shoulder') || boneName.includes('Leg') || boneName.includes('ForeArm');
      const markerGeo = new THREE.SphereGeometry(isJoint ? 7 : 11, 16, 16);
      const markerMesh = new THREE.Mesh(markerGeo, isJoint ? jointMat : glowMat);
      markerMesh.userData = { isSkeletalHighlight: true };
      bone.add(markerMesh);

      // Subtle wireframe orbital halo
      const ringGeo = new THREE.TorusGeometry(isJoint ? 10 : 15, 1.2, 8, 24);
      const ringMesh = new THREE.Mesh(ringGeo, haloMat);
      ringMesh.userData = { isSkeletalHighlight: true };
      bone.add(ringMesh);
    }
  });
}

export const Exercise3DViewer: React.FC<Props> = ({
  poseType,
  exerciseName = 'Exercise Pose',
  depthFactor = 0.4,
  targetMuscles = '',
  className = 'w-full rounded-xl overflow-hidden',
  heightClass = 'h-64 sm:h-72',
  showControls = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameIdRef = useRef<number>(0);
  const timeoutIdRef = useRef<number>(0);

  // References to procedural rigged mannequin groups
  const mannequinRef = useRef<THREE.Group | null>(null);
  const propsGroupRef = useRef<THREE.Group | null>(null);
  const muscleMeshesRef = useRef<THREE.Mesh[]>([]);

  // Custom uploaded 3D model support (.glb / .gltf / .fbx)
  const customModelRef = useRef<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const currentClipRef = useRef<THREE.AnimationClip | null>(null);
  const activeActionRef = useRef<THREE.AnimationAction | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  const [activeCameraView, setActiveCameraView] = useState<'iso' | 'side' | 'front' | 'top'>('iso');
  const [customModelName, setCustomModelName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [showMuscleGlow, setShowMuscleGlow] = useState<boolean>(true);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [isPlayingAnim, setIsPlayingAnim] = useState<boolean>(true);
  const [hasAnimations, setHasAnimations] = useState<boolean>(false);
  const isPlayingAnimRef = useRef<boolean>(true);
  const poseTypeRef = useRef<AnyPoseType>(poseType);
  poseTypeRef.current = poseType;
  const showMuscleGlowRef = useRef<boolean>(showMuscleGlow);
  showMuscleGlowRef.current = showMuscleGlow;

  // Detect software WebGL safely
  const isSoftwareGl = useRef<boolean>(false);

  // 1. Initialize Scene & Renderer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check for software WebGL
    try {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (gl) {
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        isSoftwareGl.current = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      }
    } catch {
      isSoftwareGl.current = false;
    }

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x090d16); // Deep slate studio backdrop

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(2.8, 1.8, 3.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl.current,
      powerPreference: 'high-performance',
      alpha: false,
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl.current ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl.current;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = !isSoftwareGl.current;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Prevent dipping beneath floor
    controls.minDistance = 1.5;
    controls.maxDistance = 6.5;
    controls.target.set(0, 0.7, 0);
    controls.update();

    // Studio Environment Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Balanced 3-Point Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.2); // Warm key
    keyLight.position.set(3, 4.5, 2.5);
    keyLight.castShadow = !isSoftwareGl.current;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 10;
      keyLight.shadow.camera.left = -2;
      keyLight.shadow.camera.right = 2;
      keyLight.shadow.camera.top = 2;
      keyLight.shadow.camera.bottom = -2;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.9); // Cool cyan fill
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xf43f5e, 1.2); // Vibrant rim highlight
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    // Biomechanical Studio Floor Grid & Contact Shadow Plane
    const floorGroup = new THREE.Group();
    const gridHelper = new THREE.GridHelper(5, 20, 0x334155, 0x1e293b);
    gridHelper.position.y = 0;
    floorGroup.add(gridHelper);

    // Soft Radial Contact Shadow Floor
    const shadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 64);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.8,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.002;
    floorGroup.add(shadowPlane);

    scene.add(floorGroup);

    // Render loop
    const animate = () => {
      const delta = clockRef.current.getDelta();

      if (mixerRef.current && isPlayingAnimRef.current) {
        mixerRef.current.update(delta);
      }

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Resize Observer
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      clearTimeout(timeoutIdRef.current);
      resizeObserver.disconnect();

      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (rendererRef.current.domElement.parentElement) {
          rendererRef.current.domElement.parentElement.removeChild(rendererRef.current.domElement);
        }
      }
      shadowTex.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
    };
  }, []);

  // 2. Build or Re-pose Procedural Rigged Anatomical Mannequin & 3D Equipment Props
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean previous mannequin and props
    if (mannequinRef.current) {
      scene.remove(mannequinRef.current);
      mannequinRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      mannequinRef.current = null;
    }
    if (propsGroupRef.current) {
      scene.remove(propsGroupRef.current);
      propsGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      propsGroupRef.current = null;
    }

    muscleMeshesRef.current = [];

    // Clamped depth factor
    const d = Math.max(0, Math.min(1, depthFactor));

    // Material definitions (Athletic Titanium & Muscle Activation Emissive)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.35,
      metalness: 0.7,
    });
    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.2,
      metalness: 0.9,
    });
    const muscleMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.4,
      metalness: 0.3,
      emissive: showMuscleGlow ? 0xf43f5e : 0x000000,
      emissiveIntensity: showMuscleGlow ? 0.65 : 0,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.3,
      metalness: 0.8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
    });
    const propMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.4,
    });
    const woodPropMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.5,
      metalness: 0.2,
    });

    const mannequin = new THREE.Group();
    mannequin.name = 'RiggedMannequin';
    const props = new THREE.Group();
    props.name = 'ExerciseProps';

    // Helper functions to assemble rigged limb segments
    const makeJoint = (x: number, y: number, z: number, radius = 0.055) => {
      const geo = new THREE.SphereGeometry(radius, 16, 16);
      const mesh = new THREE.Mesh(geo, jointMat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mannequin.add(mesh);
      return mesh;
    };

    const makeBone = (
      start: [number, number, number],
      end: [number, number, number],
      radius = 0.045,
      isTargetMuscle = false
    ) => {
      const p1 = new THREE.Vector3(...start);
      const p2 = new THREE.Vector3(...end);
      const dist = p1.distanceTo(p2);
      if (dist < 0.001) return;

      const geo = new THREE.CylinderGeometry(radius * 0.9, radius, dist, 16);
      const mat = isTargetMuscle ? muscleMat : bodyMat;
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;

      // Position at midpoint
      mesh.position.copy(p1).add(p2).multiplyScalar(0.5);
      // Orient towards direction
      mesh.quaternion.setFromUnitVectors(_vec3.set(0, 1, 0), p2.clone().sub(p1).normalize());

      if (isTargetMuscle) {
        muscleMeshesRef.current.push(mesh);
      }
      mannequin.add(mesh);
      return mesh;
    };

    // Construct specific rigged pose & 3D equipment props aligned with lowpoly_male.fbx
    switch (poseType) {
      case 'warmup': {
        // Warm-Up: Runner's Lunge Twist & Scapular Push-Ups
        // Full-length floor mat + hand target pads aligned with lowpoly_male hands [±0.20, 0.03, 0.50]
        const matGeo = new THREE.BoxGeometry(0.75, 0.012, 1.85);
        const matMesh = new THREE.Mesh(matGeo, propMat);
        matMesh.position.set(0, 0.006, -0.15);
        props.add(matMesh);

        const padGeo = new THREE.CylinderGeometry(0.095, 0.095, 0.015, 24);
        const padLeft = new THREE.Mesh(padGeo, woodPropMat);
        padLeft.position.set(-0.20, 0.01, 0.50);
        const padRight = new THREE.Mesh(padGeo, woodPropMat);
        padRight.position.set(0.20, 0.01, 0.50);
        props.add(padLeft, padRight);

        // Procedural fallback pose (Runner's Lunge Twist)
        const hipY = 0.60 - d * 0.08;
        const hipZ = -0.05;
        makeJoint(0.10, 0.05, 0.40, 0.05);
        makeJoint(-0.14, 0.05, -0.80, 0.045);
        makeJoint(0.10, 0.44, 0.36, 0.055);
        makeBone([0.10, 0.05, 0.40], [0.10, 0.44, 0.36], 0.045, false);
        makeBone([0.10, 0.44, 0.36], [0.08, hipY, hipZ], 0.055, true);
        makeBone([-0.14, 0.05, -0.80], [-0.12, hipY, hipZ], 0.05, true);
        makeBone([0, hipY, hipZ], [0, hipY + 0.42, hipZ + 0.12], 0.07, true);
        makeBone([-0.20, hipY + 0.40, hipZ + 0.12], [-0.20, 0.04, 0.45], 0.045, false);
        makeBone([0.20, hipY + 0.40, hipZ + 0.12], [0.28, hipY + 0.78, hipZ + 0.15], 0.045, true);
        const headGeo = new THREE.SphereGeometry(0.11, 20, 20);
        const headMesh = new THREE.Mesh(headGeo, accentMat);
        headMesh.position.set(0, hipY + 0.58, hipZ + 0.16);
        mannequin.add(headMesh);
        break;
      }

      case 'pushup': {
        // Sharif Push-Up: Prone plank position, 45° tucked elbows
        // Height lowers with depthFactor (1 = bottom/chest near floor)
        const chestY = 0.55 - d * 0.32;
        const hipY = 0.62 - d * 0.22;
        const headY = chestY + 0.08;
        const feetZ = -0.70;
        const hipZ = 0.15;
        const chestZ = 0.48;
        const headZ = 0.70;

        // Feet planted on floor
        makeJoint(-0.12, 0.05, feetZ, 0.045);
        makeJoint(0.12, 0.05, feetZ, 0.045);

        // Hips
        makeJoint(-0.16, hipY, hipZ, 0.06);
        makeJoint(0.16, hipY, hipZ, 0.06);
        makeBone([-0.16, hipY, hipZ], [0.16, hipY, hipZ], 0.05, false);

        // Legs (Calves & Thighs)
        makeBone([-0.12, 0.05, feetZ], [-0.14, (hipY + 0.05) / 2, (feetZ + hipZ) / 2], 0.04, false);
        makeBone([0.12, 0.05, feetZ], [0.14, (hipY + 0.05) / 2, (feetZ + hipZ) / 2], 0.04, false);
        makeBone([-0.14, (hipY + 0.05) / 2, (feetZ + hipZ) / 2], [-0.16, hipY, hipZ], 0.05, false);
        makeBone([0.14, (hipY + 0.05) / 2, (feetZ + hipZ) / 2], [0.16, hipY, hipZ], 0.05, false);

        // Torso / Spine / Core (Target muscle braced)
        makeBone([-0.16, hipY, hipZ], [-0.22, chestY, chestZ], 0.06, true);
        makeBone([0.16, hipY, hipZ], [0.22, chestY, chestZ], 0.06, true);
        makeBone([0, hipY, hipZ], [0, chestY, chestZ], 0.07, true);

        // Chest plate (Target pectorals)
        const chestGeo = new THREE.BoxGeometry(0.44, 0.1, 0.32);
        const chestMesh = new THREE.Mesh(chestGeo, muscleMat);
        chestMesh.position.set(0, chestY, chestZ - 0.1);
        chestMesh.castShadow = true;
        muscleMeshesRef.current.push(chestMesh);
        mannequin.add(chestMesh);

        // Shoulders
        makeJoint(-0.22, chestY, chestZ, 0.065);
        makeJoint(0.22, chestY, chestZ, 0.065);

        // Hands planted on ground (aligned with lowpoly_male.fbx hands at [±0.22, 0.04, 0.51])
        const handX = 0.22;
        const handZ = 0.51;
        makeJoint(-handX, 0.04, handZ, 0.05);
        makeJoint(handX, 0.04, handZ, 0.05);

        // Elbows (45-degree flare backward, tracking depth)
        const elbowY = Math.max(0.12, chestY + 0.08 - d * 0.05);
        const elbowX = 0.28 + d * 0.06;
        const elbowZ = chestZ - 0.22;
        makeJoint(-elbowX, elbowY, elbowZ, 0.055);
        makeJoint(elbowX, elbowY, elbowZ, 0.055);

        // Upper arms & Forearms
        makeBone([-0.22, chestY, chestZ], [-elbowX, elbowY, elbowZ], 0.05, true);
        makeBone([0.22, chestY, chestZ], [elbowX, elbowY, elbowZ], 0.05, true);
        makeBone([-elbowX, elbowY, elbowZ], [-handX, 0.04, handZ], 0.045, false);
        makeBone([elbowX, elbowY, elbowZ], [handX, 0.04, handZ], 0.045, false);

        // Head & Neck
        const headGeo = new THREE.SphereGeometry(0.11, 20, 20);
        const headMesh = new THREE.Mesh(headGeo, accentMat);
        headMesh.position.set(0, headY, headZ);
        headMesh.castShadow = true;
        mannequin.add(headMesh);
        makeBone([0, chestY, chestZ], [0, headY, headZ], 0.045, false);

        // Push-up Hand Marker Pads aligned with lowpoly_male.fbx hands [±0.22, 0.008, 0.51]
        const padGeo = new THREE.CylinderGeometry(0.105, 0.105, 0.015, 24);
        const padLeft = new THREE.Mesh(padGeo, woodPropMat);
        padLeft.position.set(-handX, 0.008, handZ);
        const padRight = new THREE.Mesh(padGeo, woodPropMat);
        padRight.position.set(handX, 0.008, handZ);
        props.add(padLeft, padRight);
        break;
      }

      case 'splitsquat': {
        // Bulgarian Split Squat: Rear leg on elevated bench/bed, front knee bending deep
        // Aligned with lowpoly_male.fbx rear foot at [-0.13, 0.38, -0.60] and front foot at [0.08, 0.01, 0.38]
        const benchH = 0.36;
        const benchZ = -0.62;

        // Front leg foot planted forward
        const frontFootZ = 0.38;
        const frontFootX = 0.08;

        // Hip drops with depthFactor
        const hipY = 0.91 - d * 0.26;
        const hipZ = 0.08 - d * 0.15;

        // Front Knee tracks over toes
        const frontKneeY = 0.46 - d * 0.10;
        const frontKneeZ = frontFootZ - 0.02 + d * 0.05;

        // Rear Knee drops towards floor
        const rearKneeY = 0.52 - d * 0.26;
        const rearKneeZ = -0.32;
        const rearFootX = -0.13;

        // Elevating Bench / Bed Prop aligned beneath rear foot
        const benchGeo = new THREE.BoxGeometry(0.75, benchH, 0.42);
        const benchMesh = new THREE.Mesh(benchGeo, woodPropMat);
        benchMesh.position.set(0, benchH / 2, benchZ);
        benchMesh.castShadow = true;
        benchMesh.receiveShadow = true;
        props.add(benchMesh);

        // Front foot stance pad
        const stancePadGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.012, 24);
        const stancePad = new THREE.Mesh(stancePadGeo, propMat);
        stancePad.position.set(frontFootX, 0.006, frontFootZ);
        props.add(stancePad);

        // Front foot & Rear toe on bench
        makeJoint(frontFootX, 0.05, frontFootZ, 0.05);
        makeJoint(rearFootX, benchH + 0.04, benchZ + 0.04, 0.045);

        // Front Knee (Joint) & Shin
        makeJoint(frontFootX, frontKneeY, frontKneeZ, 0.06);
        makeBone([frontFootX, 0.05, frontFootZ], [frontFootX, frontKneeY, frontKneeZ], 0.048, false);

        // Front Thigh (Hypertrophy Quad & Glute target)
        makeJoint(frontFootX, hipY, hipZ, 0.065);
        makeBone([frontFootX, frontKneeY, frontKneeZ], [frontFootX, hipY, hipZ], 0.065, true);

        // Rear Knee & Leg
        makeJoint(rearFootX, rearKneeY, rearKneeZ, 0.055);
        makeBone([rearFootX, benchH + 0.04, benchZ + 0.04], [rearFootX, rearKneeY, rearKneeZ], 0.045, false);
        makeJoint(rearFootX, hipY, hipZ, 0.065);
        makeBone([rearFootX, rearKneeY, rearKneeZ], [rearFootX, hipY, hipZ], 0.055, false);

        // Pelvis & Upright Torso (Core engaged)
        makeBone([frontFootX, hipY, hipZ], [rearFootX, hipY, hipZ], 0.055, false);

        const chestY = hipY + 0.42;
        const chestZ = hipZ + 0.08;
        makeBone([0, hipY, hipZ], [0, chestY, chestZ], 0.075, true);

        // Shoulders
        makeJoint(-0.2, chestY, chestZ, 0.06);
        makeJoint(0.2, chestY, chestZ, 0.06);

        // Arms
        makeBone([-0.2, chestY, chestZ], [-0.24, hipY + 0.1, chestZ], 0.045, false);
        makeBone([0.2, chestY, chestZ], [0.24, hipY + 0.1, chestZ], 0.045, false);
        makeJoint(-0.24, hipY + 0.1, chestZ, 0.045);
        makeJoint(0.24, hipY + 0.1, chestZ, 0.045);

        // Head upright
        const headGeo = new THREE.SphereGeometry(0.11, 20, 20);
        const headMesh = new THREE.Mesh(headGeo, accentMat);
        headMesh.position.set(0, chestY + 0.22, chestZ);
        headMesh.castShadow = true;
        mannequin.add(headMesh);
        makeBone([0, chestY, chestZ], [0, chestY + 0.22, chestZ], 0.045, false);
        break;
      }

      case 'pikepushup': {
        // Bed Pike Push-Up: Feet elevated on bed/box, inverted V pike angle, crown descending
        // Aligned with lowpoly_male.fbx elevated toes at [±0.12, 0.49, -0.78] and hands at [±0.22, 0.04, 0.36]
        const boxH = 0.46;
        const boxZ = -0.78;

        // Feet elevated on box
        makeJoint(-0.12, boxH + 0.04, boxZ + 0.05, 0.05);
        makeJoint(0.12, boxH + 0.04, boxZ + 0.05, 0.05);

        // Inverted V Hips high in the air
        const hipY = 0.72 - d * 0.02;
        const hipZ = 0.05 + d * 0.12;
        makeJoint(-0.16, hipY, hipZ, 0.065);
        makeJoint(0.16, hipY, hipZ, 0.065);
        makeBone([-0.16, hipY, hipZ], [0.16, hipY, hipZ], 0.055, false);

        // Elevated legs
        makeBone([-0.12, boxH + 0.04, boxZ + 0.05], [-0.16, hipY, hipZ], 0.052, false);
        makeBone([0.12, boxH + 0.04, boxZ + 0.05], [0.16, hipY, hipZ], 0.052, false);

        // Inverted torso towards floor (Shoulder / Deltoid target)
        const chestY = 0.45 - d * 0.16;
        const chestZ = 0.28 + d * 0.12;
        makeBone([0, hipY, hipZ], [0, chestY, chestZ], 0.07, true);

        // Shoulders (Anterior Deltoids target)
        makeJoint(-0.22, chestY, chestZ, 0.065);
        makeJoint(0.22, chestY, chestZ, 0.065);
        makeBone([-0.22, chestY, chestZ], [0.22, chestY, chestZ], 0.06, true);

        // Hands planted on ground
        const handX = 0.22;
        const handZ = 0.36;
        makeJoint(-handX, 0.04, handZ, 0.05);
        makeJoint(handX, 0.04, handZ, 0.05);

        // Elbows tracking out and back
        const elbowY = chestY + 0.10;
        const elbowX = 0.30;
        const elbowZ = chestZ - 0.08;
        makeJoint(-elbowX, elbowY, elbowZ, 0.055);
        makeJoint(elbowX, elbowY, elbowZ, 0.055);

        // Upper arms & Forearms
        makeBone([-0.22, chestY, chestZ], [-elbowX, elbowY, elbowZ], 0.05, true);
        makeBone([0.22, chestY, chestZ], [elbowX, elbowY, elbowZ], 0.05, true);
        makeBone([-elbowX, elbowY, elbowZ], [-handX, 0.04, handZ], 0.045, false);
        makeBone([elbowX, elbowY, elbowZ], [handX, 0.04, handZ], 0.045, false);

        // Crown descending forward towards floor (Pike tripod)
        const headY = Math.max(0.12, chestY - 0.12);
        const headZ = chestZ + 0.12;
        const headGeo = new THREE.SphereGeometry(0.11, 20, 20);
        const headMesh = new THREE.Mesh(headGeo, accentMat);
        headMesh.position.set(0, headY, headZ);
        headMesh.castShadow = true;
        mannequin.add(headMesh);
        makeBone([0, chestY, chestZ], [0, headY, headZ], 0.045, false);

        // Elevation Platform Prop (Bed / Plyo Box) + Floor Hand Pads
        const platformGeo = new THREE.BoxGeometry(0.85, boxH, 0.55);
        const platformMesh = new THREE.Mesh(platformGeo, woodPropMat);
        platformMesh.position.set(0, boxH / 2, boxZ);
        platformMesh.castShadow = true;
        platformMesh.receiveShadow = true;
        props.add(platformMesh);

        const padGeo = new THREE.CylinderGeometry(0.095, 0.095, 0.015, 24);
        const padLeft = new THREE.Mesh(padGeo, propMat);
        padLeft.position.set(-handX, 0.008, handZ);
        const padRight = new THREE.Mesh(padGeo, propMat);
        padRight.position.set(handX, 0.008, handZ);
        props.add(padLeft, padRight);
        break;
      }

      case 'pullup': {
        // Ledge Pull-Up / Inverted Row: Hanging, pulling chest up to bar
        // Aligned with lowpoly_male.fbx hands gripping overhead bar at y = 1.60m, z = 0.01m
        const barH = 1.60;
        const barZ = 0.01;

        // Grip overhead on pull-up bar
        const gripX = 0.26;
        makeJoint(-gripX, barH, barZ, 0.055);
        makeJoint(gripX, barH, barZ, 0.055);

        // Pull-Up Bar Prop
        const barGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.4, 20);
        const barMesh = new THREE.Mesh(barGeo, woodPropMat);
        barMesh.rotation.z = Math.PI / 2;
        barMesh.position.set(0, barH, barZ);
        barMesh.castShadow = true;
        props.add(barMesh);

        // Support pillars
        const pillarGeo = new THREE.CylinderGeometry(0.03, 0.03, barH, 16);
        const leftPillar = new THREE.Mesh(pillarGeo, propMat);
        leftPillar.position.set(-0.65, barH / 2, barZ);
        const rightPillar = new THREE.Mesh(pillarGeo, propMat);
        rightPillar.position.set(0.65, barH / 2, barZ);
        props.add(leftPillar, rightPillar);

        // Body rises with depthFactor (1 = chin over bar / full contraction)
        const chestY = 0.95 + d * 0.36;
        const hipY = chestY - 0.36;
        const kneeY = hipY - 0.36;
        const footY = kneeY + 0.05;

        // Elbows drive down and back (Lats target)
        const elbowY = barH - 0.15 - (1 - d) * 0.25;
        const elbowX = 0.38;
        const elbowZ = -0.05;
        makeJoint(-elbowX, elbowY, elbowZ, 0.06);
        makeJoint(elbowX, elbowY, elbowZ, 0.06);

        // Forearms & Upper arms (Lats & Biceps target)
        makeBone([-gripX, barH, barZ], [-elbowX, elbowY, elbowZ], 0.045, false);
        makeBone([gripX, barH, barZ], [elbowX, elbowY, elbowZ], 0.045, false);

        // Shoulders
        makeJoint(-0.22, chestY, 0, 0.065);
        makeJoint(0.22, chestY, 0, 0.065);
        makeBone([-elbowX, elbowY, elbowZ], [-0.22, chestY, 0], 0.055, true);
        makeBone([elbowX, elbowY, elbowZ], [0.22, chestY, 0], 0.055, true);

        // Wide V-Taper Lats (Target muscle)
        const latGeo = new THREE.ConeGeometry(0.32, 0.45, 16);
        const latMesh = new THREE.Mesh(latGeo, muscleMat);
        latMesh.rotation.x = Math.PI;
        latMesh.position.set(0, chestY - 0.12, 0);
        latMesh.castShadow = true;
        muscleMeshesRef.current.push(latMesh);
        mannequin.add(latMesh);

        // Torso & Hips
        makeBone([0, chestY, 0], [0, hipY, 0], 0.07, false);
        makeJoint(-0.16, hipY, 0, 0.06);
        makeJoint(0.16, hipY, 0, 0.06);

        // Legs tucked behind
        makeBone([-0.16, hipY, 0], [-0.14, kneeY, 0.02], 0.05, false);
        makeBone([0.16, hipY, 0], [0.14, kneeY, 0.02], 0.05, false);
        makeBone([-0.14, kneeY, 0.02], [0, footY, -0.35], 0.045, false);
        makeBone([0.14, kneeY, 0.02], [0, footY, -0.35], 0.045, false);
        makeJoint(0, footY, -0.35, 0.05);

        // Head looking up towards ledge
        const headGeo = new THREE.SphereGeometry(0.11, 20, 20);
        const headMesh = new THREE.Mesh(headGeo, accentMat);
        headMesh.position.set(0, chestY + 0.22, 0.05);
        headMesh.castShadow = true;
        mannequin.add(headMesh);
        makeBone([0, chestY, 0], [0, chestY + 0.22, 0.05], 0.045, false);
        break;
      }

      case 'cobra': {
        // Morning Cobra: Prone on mat, palms planted under shoulders, spinal extension arching chest
        const archFactor = 0.35 + d * 0.65;
        const chestY = 0.22 + archFactor * 0.25;
        const chestZ = 0.25;
        const headY = chestY + 0.18;
        const headZ = chestZ + 0.06;

        // Yoga mat on floor aligned with lowpoly_male.fbx (toes at z=-1.09 to hands at z=+0.35)
        const matGeo = new THREE.BoxGeometry(0.75, 0.015, 1.85);
        const matMesh = new THREE.Mesh(matGeo, propMat);
        matMesh.position.set(0, 0.008, -0.32);
        props.add(matMesh);

        // Legs & Feet resting flat on mat
        makeJoint(-0.12, 0.04, -0.95, 0.045);
        makeJoint(0.12, 0.04, -0.95, 0.045);
        makeBone([-0.12, 0.04, -0.95], [-0.14, 0.05, -0.5], 0.045, false);
        makeBone([0.12, 0.04, -0.95], [0.14, 0.05, -0.5], 0.045, false);

        // Pelvis grounded to floor
        makeJoint(-0.16, 0.08, -0.08, 0.06);
        makeJoint(0.16, 0.08, -0.08, 0.06);
        makeBone([-0.14, 0.05, -0.5], [-0.16, 0.08, -0.08], 0.05, false);
        makeBone([0.14, 0.05, -0.5], [0.16, 0.08, -0.08], 0.05, false);

        // Extended Arched Spine
        makeBone([0, 0.08, -0.08], [0, chestY * 0.5, chestZ * 0.5], 0.065, true);
        makeBone([0, chestY * 0.5, chestZ * 0.5], [0, chestY, chestZ], 0.07, true);

        // Chest & Shoulders
        makeJoint(-0.20, chestY, chestZ, 0.065);
        makeJoint(0.20, chestY, chestZ, 0.065);
        makeBone([-0.20, chestY, chestZ], [0.20, chestY, chestZ], 0.06, false);

        // Hands planted on mat beneath shoulders
        const handX = 0.22;
        const handZ = 0.25;
        makeJoint(-handX, 0.04, handZ, 0.05);
        makeJoint(handX, 0.04, handZ, 0.05);

        // Arms supporting spinal extension
        makeBone([-0.20, chestY, chestZ], [-handX, 0.04, handZ], 0.05, false);
        makeBone([0.20, chestY, chestZ], [handX, 0.04, handZ], 0.05, false);

        // Head gently tilted back
        const headGeo = new THREE.SphereGeometry(0.11, 20, 20);
        const headMesh = new THREE.Mesh(headGeo, accentMat);
        headMesh.position.set(0, headY, headZ);
        headMesh.castShadow = true;
        mannequin.add(headMesh);
        makeBone([0, chestY, chestZ], [0, headY, headZ], 0.045, false);
        break;
      }

      case 'armcircles': {
        // Arm Circles & Shoulder Dislocates: Athletic standing T-pose with circular capsule guide rings
        const baseY = 0.05;
        const hipY = 0.90;
        const chestY = 1.31;
        const headY = 1.54;

        // Feet planted shoulder-width
        makeJoint(-0.16, baseY, 0, 0.045);
        makeJoint(0.16, baseY, 0, 0.045);
        makeBone([-0.16, baseY, 0], [-0.16, hipY * 0.5, 0], 0.045, false);
        makeBone([0.16, baseY, 0], [0.16, hipY * 0.5, 0], 0.045, false);
        makeJoint(-0.16, hipY * 0.5, 0, 0.05);
        makeJoint(0.16, hipY * 0.5, 0, 0.05);
        makeBone([-0.16, hipY * 0.5, 0], [-0.16, hipY, 0], 0.05, false);
        makeBone([0.16, hipY * 0.5, 0], [0.16, hipY, 0], 0.05, false);

        // Hips & Spine
        makeJoint(-0.16, hipY, 0, 0.06);
        makeJoint(0.16, hipY, 0, 0.06);
        makeBone([-0.16, hipY, 0], [0.16, hipY, 0], 0.055, false);
        makeBone([0, hipY, 0], [0, chestY, 0], 0.07, false);

        // Rotator Cuff Shoulders (Target Joints)
        makeJoint(-0.22, chestY, 0, 0.07);
        makeJoint(0.22, chestY, 0, 0.07);

        // Arms extended in dynamic circular abduction
        const circleAngle = d * Math.PI * 2;
        const radius = 0.14;
        const circleY = Math.sin(circleAngle) * radius;
        const circleZ = Math.cos(circleAngle) * radius;

        // Left Arm & Forearm
        makeBone([-0.22, chestY, 0], [-0.42, chestY + circleY * 0.6, circleZ * 0.6], 0.05, true);
        makeJoint(-0.42, chestY + circleY * 0.6, circleZ * 0.6, 0.055);
        makeBone([-0.42, chestY + circleY * 0.6, circleZ * 0.6], [-0.58, chestY + circleY, circleZ], 0.045, true);
        makeJoint(-0.58, chestY + circleY, circleZ, 0.05);

        // Right Arm & Forearm
        makeBone([0.22, chestY, 0], [0.42, chestY + circleY * 0.6, -circleZ * 0.6], 0.05, true);
        makeJoint(0.42, chestY + circleY * 0.6, -circleZ * 0.6, 0.055);
        makeBone([0.42, chestY + circleY * 0.6, -circleZ * 0.6], [0.58, chestY + circleY, -circleZ], 0.045, true);
        makeJoint(0.58, chestY + circleY, -circleZ, 0.05);

        // 3D Circular Capsule Glide Rings aligned with lowpoly_male.fbx hands at x = ±0.58, y = 1.31
        const ringGeo = new THREE.TorusGeometry(0.18, 0.01, 12, 32);
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.6,
          roughness: 0.3,
          metalness: 0.5,
        });
        const leftRing = new THREE.Mesh(ringGeo, ringMat);
        leftRing.rotation.y = Math.PI / 2;
        leftRing.position.set(-0.58, chestY, 0);
        const rightRing = new THREE.Mesh(ringGeo, ringMat);
        rightRing.rotation.y = Math.PI / 2;
        rightRing.position.set(0.58, chestY, 0);
        props.add(leftRing, rightRing);

        // Head & Neck
        const headGeo = new THREE.SphereGeometry(0.11, 20, 20);
        const headMesh = new THREE.Mesh(headGeo, accentMat);
        headMesh.position.set(0, headY, 0);
        headMesh.castShadow = true;
        mannequin.add(headMesh);
        makeBone([0, chestY, 0], [0, headY, 0], 0.045, false);
        break;
      }

      case 'legswings': {
        // Leg Swings: Supported single-leg stance, dynamic sagittal hip swing
        const baseY = 0.05;
        const hipY = 0.89;
        const chestY = 1.31;
        const headY = 1.54;

        // Support Pillar Prop aligned with lowpoly_male.fbx left support hand at [0.30, 1.28, 0.33]
        const barH = 1.30;
        const pillarGeo = new THREE.CylinderGeometry(0.025, 0.025, barH, 16);
        const pillar = new THREE.Mesh(pillarGeo, woodPropMat);
        pillar.position.set(0.32, barH / 2, 0.33);
        pillar.castShadow = true;
        props.add(pillar);

        // Support Arm reaching forward to bar
        makeBone([0.20, chestY, 0], [0.32, 1.25, 0.33], 0.045, false);
        makeJoint(0.32, 1.25, 0.33, 0.05);

        // Left Leg (Planted firmly at x = +0.09)
        makeJoint(0.09, baseY, 0, 0.045);
        makeBone([0.09, baseY, 0], [0.09, hipY * 0.5, 0], 0.045, false);
        makeJoint(0.09, hipY * 0.5, 0, 0.05);
        makeBone([0.09, hipY * 0.5, 0], [0.09, hipY, 0], 0.05, false);

        // Torso & Hips
        makeJoint(0.09, hipY, 0, 0.06);
        makeJoint(-0.09, hipY, 0, 0.065);
        makeBone([0.09, hipY, 0], [-0.09, hipY, 0], 0.055, false);
        makeBone([0, hipY, 0], [0, chestY, 0], 0.07, false);

        // Right Leg (Dynamic Sagittal Swing at x = -0.09)
        const swingAngle = (d - 0.5) * 1.5;
        const kneeZ = Math.sin(swingAngle) * 0.42;
        const kneeY = hipY - Math.cos(swingAngle) * 0.42;
        const footZ = Math.sin(swingAngle) * 0.84;
        const footY = hipY - Math.cos(swingAngle) * 0.84;

        makeJoint(-0.09, kneeY, kneeZ, 0.055);
        makeBone([-0.09, hipY, 0], [-0.09, kneeY, kneeZ], 0.055, true);
        makeJoint(-0.09, footY, footZ, 0.045);
        makeBone([-0.09, kneeY, kneeZ], [-0.09, footY, footZ], 0.045, false);

        // Dynamic Swing Arc Guide Ribbon aligned with right hip at x = -0.09
        const arcGeo = new THREE.TorusGeometry(0.80, 0.008, 8, 32, Math.PI / 1.7);
        const arcMat = new THREE.MeshStandardMaterial({
          color: 0xf43f5e,
          emissive: 0xf43f5e,
          emissiveIntensity: 0.5,
          roughness: 0.4,
        });
        const arcMesh = new THREE.Mesh(arcGeo, arcMat);
        arcMesh.rotation.y = Math.PI / 2;
        arcMesh.rotation.x = Math.PI / 1.4;
        arcMesh.position.set(-0.09, hipY, 0);
        props.add(arcMesh);

        // Free Right Arm for balance
        makeBone([-0.20, chestY, 0], [-0.34, 1.15, -0.2], 0.045, false);
        makeJoint(-0.34, 1.15, -0.2, 0.045);

        // Head & Neck
        const headGeo = new THREE.SphereGeometry(0.11, 20, 20);
        const headMesh = new THREE.Mesh(headGeo, accentMat);
        headMesh.position.set(0, headY, 0);
        headMesh.castShadow = true;
        mannequin.add(headMesh);
        makeBone([0, chestY, 0], [0, headY, 0], 0.045, false);
        break;
      }

      case 'torsotwists': {
        // Standing Torso Twists: Transverse thoracic rotation with counter-balance reach
        const baseY = 0.05;
        const hipY = 0.90;
        const chestY = 1.31;
        const headY = 1.54;

        // Feet planted shoulder-width
        makeJoint(-0.18, baseY, 0, 0.045);
        makeJoint(0.18, baseY, 0, 0.045);
        makeBone([-0.18, baseY, 0], [-0.18, hipY * 0.5, 0], 0.045, false);
        makeBone([0.18, baseY, 0], [0.18, hipY * 0.5, 0], 0.045, false);
        makeJoint(-0.18, hipY * 0.5, 0, 0.05);
        makeJoint(0.18, hipY * 0.5, 0, 0.05);
        makeBone([-0.18, hipY * 0.5, 0], [-0.16, hipY, 0], 0.05, false);
        makeBone([0.18, hipY * 0.5, 0], [0.16, hipY, 0], 0.05, false);

        // Pelvis facing forward
        makeJoint(-0.16, hipY, 0, 0.06);
        makeJoint(0.16, hipY, 0, 0.06);
        makeBone([-0.16, hipY, 0], [0.16, hipY, 0], 0.055, false);

        // Transverse thoracic rotation angle based on depthFactor
        const twistAngle = (d - 0.5) * 1.3;
        const cosT = Math.cos(twistAngle);
        const sinT = Math.sin(twistAngle);

        // Spine rotation (Target thoracic decompression)
        makeBone([0, hipY, 0], [0, chestY, 0], 0.07, true);

        // Shoulders rotated along transverse plane
        const leftShX = -0.22 * cosT;
        const leftShZ = -0.22 * sinT;
        const rightShX = 0.22 * cosT;
        const rightShZ = 0.22 * sinT;

        makeJoint(leftShX, chestY, leftShZ, 0.065);
        makeJoint(rightShX, chestY, rightShZ, 0.065);
        makeBone([leftShX, chestY, leftShZ], [rightShX, chestY, rightShZ], 0.06, true);

        // Arms in dynamic transverse reach
        const leftArmX = leftShX - 0.28 * cosT + 0.15 * sinT;
        const leftArmZ = leftShZ - 0.28 * sinT - 0.15 * cosT;
        makeBone([leftShX, chestY, leftShZ], [leftArmX, 1.22, leftArmZ], 0.045, false);
        makeJoint(leftArmX, 1.22, leftArmZ, 0.045);

        const rightArmX = rightShX + 0.28 * cosT - 0.15 * sinT;
        const rightArmZ = rightShZ + 0.28 * sinT + 0.15 * cosT;
        makeBone([rightShX, chestY, rightShZ], [rightArmX, 1.22, rightArmZ], 0.045, false);
        makeJoint(rightArmX, 1.22, rightArmZ, 0.045);

        // Transverse Plane Rotation Ring (Prop)
        const waistRingGeo = new THREE.TorusGeometry(0.38, 0.008, 8, 32);
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.5,
          roughness: 0.3,
        });
        const waistRing = new THREE.Mesh(waistRingGeo, ringMat);
        waistRing.rotation.x = Math.PI / 2;
        waistRing.position.set(0, 1.12, 0);
        props.add(waistRing);

        // Head tracking rotation
        const headX = 0.04 * sinT;
        const headZ = 0.04 * cosT;
        const headGeo = new THREE.SphereGeometry(0.11, 20, 20);
        const headMesh = new THREE.Mesh(headGeo, accentMat);
        headMesh.position.set(headX, headY, headZ);
        headMesh.castShadow = true;
        mannequin.add(headMesh);
        makeBone([0, chestY, 0], [headX, headY, headZ], 0.045, false);
        break;
      }

      default: {
        // Standing neutral athletic posture
        makeJoint(-0.15, 0.05, 0, 0.045);
        makeJoint(0.15, 0.05, 0, 0.045);
        makeBone([-0.15, 0.05, 0], [-0.15, 0.9, 0], 0.05, false);
        makeBone([0.15, 0.05, 0], [0.15, 0.9, 0], 0.05, false);
        makeBone([0, 0.9, 0], [0, 1.35, 0], 0.07, false);
        makeJoint(-0.24, 1.35, 0, 0.06);
        makeJoint(0.24, 1.35, 0, 0.06);
        makeBone([-0.24, 1.35, 0], [-0.24, 0.95, 0], 0.045, false);
        makeBone([0.24, 1.35, 0], [0.24, 0.95, 0], 0.045, false);
        const headGeo = new THREE.SphereGeometry(0.11, 20, 20);
        const headMesh = new THREE.Mesh(headGeo, accentMat);
        headMesh.position.set(0, 1.58, 0);
        headMesh.castShadow = true;
        mannequin.add(headMesh);
        makeBone([0, 1.35, 0], [0, 1.58, 0], 0.045, false);
        break;
      }
    }

    mannequin.visible = !customModelRef.current;
    props.visible = true;
    mannequinRef.current = mannequin;
    propsGroupRef.current = props;
    scene.add(mannequin);
    scene.add(props);
  }, [poseType, depthFactor, showMuscleGlow]);

  // 3. Camera Preset Smooth Views
  const setCameraView = (view: 'iso' | 'side' | 'front' | 'top') => {
    setActiveCameraView(view);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    switch (view) {
      case 'iso':
        camera.position.set(2.8, 1.8, 3.2);
        controls.target.set(0, 0.65, 0);
        break;
      case 'side':
        camera.position.set(3.8, 1.1, 0);
        controls.target.set(0, 0.65, 0);
        break;
      case 'front':
        camera.position.set(0, 1.1, 3.8);
        controls.target.set(0, 0.65, 0);
        break;
      case 'top':
        camera.position.set(0.1, 4.2, 0.1);
        controls.target.set(0, 0.2, 0);
        break;
    }
    controls.update();
  };

  // 4. Mount Custom 3D Model Buffer (.glb / .gltf / .fbx)
  const mountModelBuffer = useCallback((buffer: ArrayBuffer, fileName: string, persist = true) => {
    const scene = sceneRef.current;
    if (!scene) return;

    const lower = fileName.toLowerCase();
    const isGlb = lower.endsWith('.glb') || lower.endsWith('.gltf');
    const isFbx = lower.endsWith('.fbx');

    if (!isGlb && !isFbx) {
      setUploadError('Please select a 3D model file (.glb, .gltf, or .fbx)');
      return;
    }

    // Hide procedural mannequin while keeping 3D equipment props visible
    if (mannequinRef.current) mannequinRef.current.visible = false;
    if (propsGroupRef.current) propsGroupRef.current.visible = true;

    // Remove existing custom model
    if (customModelRef.current) {
      scene.remove(customModelRef.current);
      customModelRef.current = null;
    }
    if (mixerRef.current) {
      mixerRef.current.stopAllAction();
      mixerRef.current = null;
    }

    try {
      if (isGlb) {
        const loader = new GLTFLoader();
        loader.parse(
          buffer,
          '',
          (gltf) => {
            const model = gltf.scene;
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 1.6 / (maxDim || 1);
            model.scale.setScalar(scale);

            model.position.x = -center.x * scale;
            model.position.y = -box.min.y * scale;
            model.position.z = -center.z * scale;

            model.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });

            // Check for Mixamo rigged bones in GLB/GLTF
            let hasMixamoBones = false;
            model.traverse((child) => {
              if (child.name && child.name.toLowerCase().startsWith('mixamorig')) {
                hasMixamoBones = true;
              }
            });

            if (hasMixamoBones) {
              snapshotAndResetModelBindPose(model);
              const mixer = new THREE.AnimationMixer(model);
              mixerRef.current = mixer;
              const clip = createExerciseSkeletalClip(poseTypeRef.current);
              currentClipRef.current = clip;
              const action = mixer.clipAction(clip);
              action.setLoop(THREE.LoopRepeat, Infinity);
              action.play();
              mixer.update(0);
              activeActionRef.current = action;
              setHasAnimations(true);
              setIsPlayingAnim(true);
              isPlayingAnimRef.current = true;
              applySkeletalMuscleHighlights(model, poseTypeRef.current, showMuscleGlowRef.current);
            } else if (
              gltf.animations &&
              gltf.animations.length > 0 &&
              gltf.animations[0].duration > 0.1
            ) {
              const mixer = new THREE.AnimationMixer(model);
              gltf.animations.forEach((clip) => {
                mixer.clipAction(clip).play();
              });
              mixerRef.current = mixer;
              setHasAnimations(true);
              setIsPlayingAnim(true);
              isPlayingAnimRef.current = true;
            } else {
              setHasAnimations(false);
            }

            scene.add(model);
            customModelRef.current = model;
            setCustomModelName(fileName);
            if (persist) {
              saveCustomModelToDB(fileName, buffer).catch(() => {});
            }
          },
          (err) => {
            const msg = (err as unknown as Error)?.message || 'Invalid 3D model format';
            setUploadError('Failed to parse GLTF/GLB model: ' + msg);
          }
        );
      } else if (isFbx) {
        const loader = new FBXLoader();
        try {
          const object = loader.parse(buffer, '');
          const box = new THREE.Box3().setFromObject(object);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 1.6 / (maxDim || 1);
          object.scale.setScalar(scale);

          object.position.x = -center.x * scale;
          object.position.y = -box.min.y * scale;
          object.position.z = -center.z * scale;

          object.traverse((child) => {
            if (child instanceof THREE.Mesh || child instanceof THREE.SkinnedMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach((m) => {
                    if ('shininess' in m) (m as THREE.MeshPhongMaterial).shininess = 35;
                  });
                } else if ('shininess' in child.material) {
                  (child.material as THREE.MeshPhongMaterial).shininess = 35;
                }
              }
            }
          });

          // Check if FBX model has standard Mixamo rigged bones
          let hasMixamoBones = false;
          object.traverse((child) => {
            if (child.name && child.name.toLowerCase().startsWith('mixamorig')) {
              hasMixamoBones = true;
            }
          });

          if (hasMixamoBones) {
            snapshotAndResetModelBindPose(object);
            const mixer = new THREE.AnimationMixer(object);
            mixerRef.current = mixer;
            const clip = createExerciseSkeletalClip(poseTypeRef.current);
            currentClipRef.current = clip;
            const action = mixer.clipAction(clip);
            action.setLoop(THREE.LoopRepeat, Infinity);
            action.play();
            mixer.update(0);
            activeActionRef.current = action;

            setHasAnimations(true);
            setIsPlayingAnim(true);
            isPlayingAnimRef.current = true;

            applySkeletalMuscleHighlights(object, poseTypeRef.current, showMuscleGlowRef.current);
          } else if (
            object.animations &&
            object.animations.length > 0 &&
            object.animations[0].duration > 0.1
          ) {
            const mixer = new THREE.AnimationMixer(object);
            object.animations.forEach((clip) => {
              mixer.clipAction(clip).play();
            });
            mixerRef.current = mixer;
            setHasAnimations(true);
            setIsPlayingAnim(true);
            isPlayingAnimRef.current = true;
          } else {
            setHasAnimations(false);
          }

          scene.add(object);
          customModelRef.current = object;
          setCustomModelName(fileName);
          if (persist) {
            saveCustomModelToDB(fileName, buffer).catch(() => {});
          }
        } catch (fbxErr) {
          setUploadError('Failed to parse FBX model: ' + (fbxErr as Error).message);
        }
      }
    } catch (err) {
      setUploadError('Model loading failed: ' + (err as Error).message);
    }
  }, []);

  // Synchronize pose animation and muscle highlights whenever poseType or showMuscleGlow changes
  useEffect(() => {
    if (!customModelRef.current || !mixerRef.current) return;
    let hasMixamoBones = false;
    customModelRef.current.traverse((child) => {
      if (child.name && child.name.toLowerCase().startsWith('mixamorig')) {
        hasMixamoBones = true;
      }
    });

    if (hasMixamoBones) {
      const mixer = mixerRef.current;
      mixer.stopAllAction();
      snapshotAndResetModelBindPose(customModelRef.current);
      const clip = createExerciseSkeletalClip(poseType);
      currentClipRef.current = clip;
      const action = mixer.clipAction(clip);
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.reset();
      action.play();
      mixer.update(0);
      activeActionRef.current = action;
      setHasAnimations(true);
      setIsPlayingAnim(true);
      isPlayingAnimRef.current = true;
      applySkeletalMuscleHighlights(customModelRef.current, poseType, showMuscleGlow);
    }
  }, [poseType, showMuscleGlow]);

  // Synchronize with 3-1-1 cadence depth factor when paused or scrubbed
  useEffect(() => {
    if (!isPlayingAnim && activeActionRef.current && currentClipRef.current) {
      const duration = currentClipRef.current.duration;
      activeActionRef.current.time = Math.max(0, Math.min(1, depthFactor)) * duration;
      mixerRef.current?.update(0);
    }
  }, [depthFactor, isPlayingAnim]);

  // Check if custom model was previously saved to IndexedDB, or auto-load lowpoly_male.fbx!
  useEffect(() => {
    let isCancelled = false;
    loadCustomModelFromDB()
      .then((record) => {
        if (isCancelled) return;
        // If stored model was old base_model.glb, replace with user-requested lowpoly_male.fbx
        if (record && record.buffer && record.fileName !== 'base_model.glb') {
          mountModelBuffer(record.buffer, record.fileName, false);
        } else {
          // Auto-load lowpoly_male.fbx downloaded from user Google Drive
          fetch('/models/lowpoly_male.fbx')
            .then((res) => {
              if (res.ok) return res.arrayBuffer();
              return fetch('/models/base_model.glb').then((r) => (r.ok ? r.arrayBuffer() : null));
            })
            .then((buf) => {
              if (isCancelled || !buf) return;
              mountModelBuffer(buf, 'lowpoly_male.fbx', false);
            })
            .catch(() => {});
        }
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [mountModelBuffer]);

  // 5. Handle File Upload (Picker & Drag/Drop)
  const handleModelFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (buffer) {
        mountModelBuffer(buffer, file.name, true);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const buffer = ev.target?.result as ArrayBuffer;
      if (buffer) {
        mountModelBuffer(buffer, file.name, true);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Reset back to procedural mannequin
  const resetToProcedural = () => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (customModelRef.current) {
      scene.remove(customModelRef.current);
      customModelRef.current = null;
    }
    if (mixerRef.current) {
      mixerRef.current.stopAllAction();
      mixerRef.current = null;
    }
    if (mannequinRef.current) mannequinRef.current.visible = true;
    if (propsGroupRef.current) propsGroupRef.current.visible = true;
    setHasAnimations(false);
    setIsPlayingAnim(false);
    isPlayingAnimRef.current = false;
    setCustomModelName(null);
    clearCustomModelFromDB().catch(() => {});
  };

  const togglePlayAnimation = () => {
    const next = !isPlayingAnim;
    setIsPlayingAnim(next);
    isPlayingAnimRef.current = next;
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDraggingOver(false);
        }
      }}
      onDrop={handleDrop}
      className={`relative bg-slate-950 border border-slate-800 ${className}`}
      role="region"
      aria-label={`Interactive 3D model for ${exerciseName}`}
    >
      {/* Visual Drag & Drop Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-30 bg-slate-950/92 border-2 border-dashed border-cyan-400 rounded-xl flex flex-col items-center justify-center p-4 text-center pointer-events-none">
          <Upload className="w-10 h-10 text-cyan-400 animate-bounce mb-2" />
          <div className="text-sm font-bold text-white">Drop your .glb or .fbx model here</div>
          <div className="text-xs text-slate-400 mt-1">
            Browser will parse and apply your rigged 3D model instantly
          </div>
        </div>
      )}

      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className={`w-full ${heightClass} cursor-grab active:cursor-grabbing touch-none select-none`}
      />

      {/* Top Spec Badges */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-700/80 text-white text-[11px] font-medium shadow-sm pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>{customModelName ? `Custom: ${customModelName}` : 'Rigged 3D Mannequin'}</span>
        </div>

        {targetMuscles && (
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900/90 border border-rose-900/40 text-rose-300 text-[11px] font-medium pointer-events-auto">
            <span>Target:</span>
            <span className="font-semibold text-rose-200">{targetMuscles}</span>
          </div>
        )}
      </div>

      {/* Upload error banner if any */}
      {uploadError && (
        <div className="absolute top-11 left-2.5 right-2.5 px-3 py-1.5 rounded-md bg-rose-950/95 border border-rose-700 text-rose-200 text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{uploadError}</span>
          </span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-xs text-rose-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Ergonomic Collapsible Bottom Dock (Zero Viewport Occlusion) */}
      {showControls && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-[calc(100%-1.25rem)] max-w-lg bg-slate-900/95 border border-slate-700/80 rounded-lg p-1.5 shadow-xl flex items-center justify-between gap-1.5 text-xs text-slate-300">
          {/* Camera Angles */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider pl-1 hidden sm:inline">
              View:
            </span>
            {(['iso', 'side', 'front', 'top'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setCameraView(v)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  activeCameraView === v
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {v.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Muscle Activation Glow Toggle */}
          <button
            type="button"
            onClick={() => setShowMuscleGlow(!showMuscleGlow)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
              showMuscleGlow
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle Muscle Activation Highlight Glow"
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">Muscles</span>
          </button>

          {/* Animation Play/Pause toggle if model has animations */}
          {hasAnimations && (
            <button
              type="button"
              onClick={togglePlayAnimation}
              className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-cyan-300 hover:text-white flex items-center gap-1 transition-colors"
              title={isPlayingAnim ? 'Pause Rigged Motion' : 'Play Rigged Motion'}
            >
              {isPlayingAnim ? <Pause className="w-3 h-3 text-cyan-400" /> : <Play className="w-3 h-3 text-cyan-400" />}
              <span className="hidden sm:inline">{isPlayingAnim ? 'Pause' : 'Play'}</span>
            </button>
          )}

          {/* Upload Custom Model Button (.glb / .fbx) */}
          <div className="flex items-center gap-1">
            {customModelName ? (
              <button
                type="button"
                onClick={resetToProcedural}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                title="Reset to procedural rigged figure"
              >
                Reset
              </button>
            ) : (
              <label
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                title="Load your own .glb, .gltf, or .fbx 3D model"
              >
                <Upload className="w-3 h-3 text-cyan-400" />
                <span>Upload 3D</span>
                <input
                  type="file"
                  accept=".glb,.gltf,.fbx"
                  onChange={handleModelFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
