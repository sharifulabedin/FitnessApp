/**
 * Procedural Skeletal Animation Engine for Mixamo Rigged FBX/GLB Models.
 * Uses an exact bind-pose hierarchy & world-direction vector solver (`aimBone`)
 * with foot/hand ground-pinning (`pinBoneWorld`) so limbs never invert, twist,
 * or float across all 20-Minute Full-Body Hypertrophy Circuit exercises and
 * Pre-Workout Dynamic Mobility drills.
 */

import * as THREE from 'three';

export type AnyPoseType =
  | 'warmup'
  | 'pushup'
  | 'splitsquat'
  | 'pikepushup'
  | 'pullup'
  | 'cobra'
  | 'armcircles'
  | 'legswings'
  | 'torsotwists'
  | string;

interface BindBoneSpec {
  parent: string | null;
  pos: [number, number, number];
  quat: [number, number, number, number];
}

/**
 * Exact native bind-pose bone hierarchy extracted from lowpoly_male.fbx.
 * Scale factor in Exercise3DViewer: 1.6 / 422.0264 = 0.00379123 m/unit (1m ≈ 263.77 units).
 */
export const MIXAMO_BIND_POSE: Record<string, BindBoneSpec> = {
  mixamorigHips: { parent: null, pos: [0, 245.7992, -1.945], quat: [0, 0, 0, 1] },
  mixamorigSpine: { parent: 'mixamorigHips', pos: [0, 20.5203, -1.4501], quat: [-0.035268, 0, 0, 0.999378] },
  mixamorigSpine1: { parent: 'mixamorigSpine', pos: [0, 24.0001, 0], quat: [0, 0, 0, 1] },
  mixamorigSpine2: { parent: 'mixamorigSpine1', pos: [0, 27.4286, 0], quat: [0, 0, 0, 1] },
  mixamorigNeck: { parent: 'mixamorigSpine2', pos: [0, 30.8573, 0], quat: [0.035268, 0, 0, 0.999378] },
  mixamorigHead: { parent: 'mixamorigNeck', pos: [0, 21.8008, 4.6742], quat: [0, 0, 0, 1] },
  mixamorigHeadTop_End: { parent: 'mixamorigHead', pos: [0, 50.3301, 10.791], quat: [0, 0, 0, 1] },
  mixamorigLeftShoulder: {
    parent: 'mixamorigSpine2',
    pos: [13.832, 25.2509, -0.3241],
    quat: [-0.579753, -0.399346, 0.593519, -0.390057],
  },
  mixamorigLeftArm: {
    parent: 'mixamorigLeftShoulder',
    pos: [0, 29.6721, 0],
    quat: [0.269104, 0.071545, -0.02005, 0.960241],
  },
  mixamorigLeftForeArm: {
    parent: 'mixamorigLeftArm',
    pos: [0, 58.4463, 0],
    quat: [-0.020343, -0.002079, 0.101655, 0.994609],
  },
  mixamorigLeftHand: { parent: 'mixamorigLeftForeArm', pos: [0, 65.779, 0], quat: [0, 0, 0, 1] },
  mixamorigRightShoulder: {
    parent: 'mixamorigSpine2',
    pos: [-13.832, 25.2611, -0.4676],
    quat: [0.576516, -0.401602, 0.596378, 0.388174],
  },
  mixamorigRightArm: {
    parent: 'mixamorigRightShoulder',
    pos: [0, 29.6721, 0],
    quat: [0.268886, -0.054895, 0.015352, 0.961484],
  },
  mixamorigRightForeArm: {
    parent: 'mixamorigRightArm',
    pos: [0, 58.4265, 0],
    quat: [-0.016291, 0.001532, -0.093595, 0.995476],
  },
  mixamorigRightHand: { parent: 'mixamorigRightForeArm', pos: [0, 65.7139, 0], quat: [0, 0, 0, 1] },
  mixamorigLeftUpLeg: {
    parent: 'mixamorigHips',
    pos: [22.0286, -11.3871, 0.5949],
    quat: [-0.002852, -0.035605, 0.996172, -0.079785],
  },
  mixamorigLeftLeg: {
    parent: 'mixamorigLeftUpLeg',
    pos: [0, 108.9719, 0],
    quat: [0.000976, 0.000031, 0.031647, 0.999499],
  },
  mixamorigLeftFoot: {
    parent: 'mixamorigLeftLeg',
    pos: [0, 107.0401, 0],
    quat: [0.47485, -0.016286, 0.008789, 0.879872],
  },
  mixamorigLeftToeBase: {
    parent: 'mixamorigLeftFoot',
    pos: [0, 38.0199, 0],
    quat: [0.305799, -0.034005, 0.01093, 0.951426],
  },
  mixamorigLeftToe_End: { parent: 'mixamorigLeftToeBase', pos: [0, 15.6222, 0], quat: [0, 0, 0, 1] },
  mixamorigRightUpLeg: {
    parent: 'mixamorigHips',
    pos: [-22.0286, -11.3871, 0.6716],
    quat: [0.002884, -0.036016, 0.996157, 0.07978],
  },
  mixamorigRightLeg: {
    parent: 'mixamorigRightUpLeg',
    pos: [0, 108.9782, 0],
    quat: [0.0012, -0.000038, -0.031649, 0.999498],
  },
  mixamorigRightFoot: {
    parent: 'mixamorigRightLeg',
    pos: [0, 107.0428, 0],
    quat: [0.473995, 0.016415, -0.008839, 0.88033],
  },
  mixamorigRightToeBase: {
    parent: 'mixamorigRightFoot',
    pos: [0, 37.9047, 0],
    quat: [0.307018, 0.033272, -0.010741, 0.951061],
  },
  mixamorigRightToe_End: { parent: 'mixamorigRightToeBase', pos: [0, 15.7842, 0], quat: [0, 0, 0, 1] },
};

export const MIXAMO_CORE_BONES = [
  'mixamorigHips',
  'mixamorigSpine',
  'mixamorigSpine1',
  'mixamorigSpine2',
  'mixamorigNeck',
  'mixamorigHead',
  'mixamorigLeftShoulder',
  'mixamorigLeftArm',
  'mixamorigLeftForeArm',
  'mixamorigLeftHand',
  'mixamorigRightShoulder',
  'mixamorigRightArm',
  'mixamorigRightForeArm',
  'mixamorigRightHand',
  'mixamorigLeftUpLeg',
  'mixamorigLeftLeg',
  'mixamorigLeftFoot',
  'mixamorigLeftToeBase',
  'mixamorigRightUpLeg',
  'mixamorigRightLeg',
  'mixamorigRightFoot',
  'mixamorigRightToeBase',
] as const;

const TRACKED_BONES = MIXAMO_CORE_BONES;

interface VirtualRig {
  root: THREE.Group;
  bones: Record<string, THREE.Bone>;
  reset: () => void;
  setHipsEuler: (rxDeg: number, ryDeg: number, rzDeg: number) => void;
  aimBone: (boneName: string, targetWorldDir: [number, number, number], twistRad?: number) => void;
  pinBoneToFBXPoint: (boneName: string, targetFBX: [number, number, number]) => void;
  pinMidpointToFBXPoint: (boneA: string, boneB: string, targetFBX: [number, number, number]) => void;
}

function createVirtualRig(): VirtualRig {
  const root = new THREE.Group();
  const bones: Record<string, THREE.Bone> = {};

  for (const [name, spec] of Object.entries(MIXAMO_BIND_POSE)) {
    const bone = new THREE.Bone();
    bone.name = name;
    bone.position.set(...spec.pos);
    bone.quaternion.set(...spec.quat);
    bones[name] = bone;
  }

  for (const [name, spec] of Object.entries(MIXAMO_BIND_POSE)) {
    const bone = bones[name];
    if (spec.parent && bones[spec.parent]) {
      bones[spec.parent].add(bone);
    } else {
      root.add(bone);
    }
  }

  root.updateMatrixWorld(true);

  const reset = () => {
    for (const [name, spec] of Object.entries(MIXAMO_BIND_POSE)) {
      const bone = bones[name];
      bone.position.set(...spec.pos);
      bone.quaternion.set(...spec.quat);
    }
    root.updateMatrixWorld(true);
  };

  const setHipsEuler = (rxDeg: number, ryDeg: number, rzDeg: number) => {
    const hips = bones.mixamorigHips;
    const e = new THREE.Euler(
      (rxDeg * Math.PI) / 180,
      (ryDeg * Math.PI) / 180,
      (rzDeg * Math.PI) / 180,
      'YXZ'
    );
    hips.quaternion.setFromEuler(e);
    root.updateMatrixWorld(true);
  };

  const aimBone = (boneName: string, targetWorldDir: [number, number, number], twistRad = 0) => {
    const bone = bones[boneName];
    if (!bone || !bone.parent) return;
    bone.parent.updateMatrixWorld(true);
    bone.updateMatrixWorld(true);

    const curWorldQ = new THREE.Quaternion();
    bone.getWorldQuaternion(curWorldQ);
    const curY = new THREE.Vector3(0, 1, 0).applyQuaternion(curWorldQ).normalize();
    const targetDir = new THREE.Vector3(...targetWorldDir).normalize();

    const deltaWorldQ = new THREE.Quaternion().setFromUnitVectors(curY, targetDir);
    if (twistRad !== 0) {
      const twistQ = new THREE.Quaternion().setFromAxisAngle(targetDir, twistRad);
      deltaWorldQ.premultiply(twistQ);
    }
    const newWorldQ = deltaWorldQ.multiply(curWorldQ);

    const parentWorldQ = new THREE.Quaternion();
    bone.parent.getWorldQuaternion(parentWorldQ);
    bone.quaternion.copy(parentWorldQ).invert().multiply(newWorldQ);
    bone.updateMatrixWorld(true);
  };

  const pinBoneToFBXPoint = (boneName: string, targetFBX: [number, number, number]) => {
    const bone = bones[boneName];
    const hips = bones.mixamorigHips;
    if (!bone || !hips) return;
    root.updateMatrixWorld(true);
    const w = new THREE.Vector3();
    bone.getWorldPosition(w);
    hips.position.x += targetFBX[0] - w.x;
    hips.position.y += targetFBX[1] - w.y;
    hips.position.z += targetFBX[2] - w.z;
    root.updateMatrixWorld(true);
  };

  const pinMidpointToFBXPoint = (boneA: string, boneB: string, targetFBX: [number, number, number]) => {
    const a = bones[boneA];
    const b = bones[boneB];
    const hips = bones.mixamorigHips;
    if (!a || !b || !hips) return;
    root.updateMatrixWorld(true);
    const wa = new THREE.Vector3();
    const wb = new THREE.Vector3();
    a.getWorldPosition(wa);
    b.getWorldPosition(wb);
    const mid = wa.add(wb).multiplyScalar(0.5);
    hips.position.x += targetFBX[0] - mid.x;
    hips.position.y += targetFBX[1] - mid.y;
    hips.position.z += targetFBX[2] - mid.z;
    root.updateMatrixWorld(true);
  };

  return {
    root,
    bones,
    reset,
    setHipsEuler,
    aimBone,
    pinBoneToFBXPoint,
    pinMidpointToFBXPoint,
  };
}

/**
 * Snapshot or restore a live Three.js Object3D skeleton to its native bind pose
 * so switching exercises never leaves stale bone transforms.
 */
export function snapshotAndResetModelBindPose(model: THREE.Object3D): void {
  model.traverse((child) => {
    if ((child as THREE.Bone).isBone || child.name?.startsWith('mixamorig')) {
      if (!child.userData.bindPos) {
        child.userData.bindPos = child.position.clone();
        child.userData.bindQuat = child.quaternion.clone();
      } else {
        child.position.copy(child.userData.bindPos);
        child.quaternion.copy(child.userData.bindQuat);
      }
    }
  });
  model.updateMatrixWorld(true);
}

/**
 * Build a complete AnimationClip from a list of keyframe pose callbacks.
 * Emits tracks for all 22 core bones so every bone is deterministically driven.
 */
function buildClipFromPoses(
  clipName: string,
  times: number[],
  poseBuilders: Array<(rig: VirtualRig) => void>
): THREE.AnimationClip {
  const rig = createVirtualRig();
  const posValues: number[] = [];
  const quatMap: Record<string, number[]> = {};
  for (const bName of TRACKED_BONES) {
    quatMap[bName] = [];
  }

  for (let i = 0; i < times.length; i++) {
    rig.reset();
    poseBuilders[i](rig);

    const hipsPos = rig.bones.mixamorigHips.position;
    posValues.push(hipsPos.x, hipsPos.y, hipsPos.z);

    for (const bName of TRACKED_BONES) {
      const q = rig.bones[bName].quaternion;
      quatMap[bName].push(q.x, q.y, q.z, q.w);
    }
  }

  const tracks: THREE.KeyframeTrack[] = [
    new THREE.VectorKeyframeTrack('mixamorigHips.position', times, posValues),
  ];

  for (const bName of TRACKED_BONES) {
    tracks.push(new THREE.QuaternionKeyframeTrack(`${bName}.quaternion`, times, quatMap[bName]));
  }

  const duration = times[times.length - 1];
  return new THREE.AnimationClip(clipName, duration, tracks);
}

/**
 * Pose helper: Push-Up at depth d ∈ [0 (top plank lockout), 1 (bottom hold 1 inch above floor)]
 */
function posePushUpAtDepth(rig: VirtualRig, d: number): void {
  // Pitch hips forward (+76° at top lockout -> +86° at bottom chest dip)
  const pitchDeg = 76 + d * 10;
  rig.setHipsEuler(pitchDeg, 0, 0);

  const spineY = 0.24 - d * 0.14;
  const spineZ = 0.97;
  rig.aimBone('mixamorigSpine', [0, spineY, spineZ]);
  rig.aimBone('mixamorigSpine1', [0, spineY, spineZ]);
  rig.aimBone('mixamorigSpine2', [0, spineY, spineZ]);
  rig.aimBone('mixamorigNeck', [0, spineY + 0.15, 0.92]);
  rig.aimBone('mixamorigHead', [0, spineY + 0.22, 0.88]);

  // Legs braced straight back toward toes on floor
  const legY = -0.22 + d * 0.14;
  rig.aimBone('mixamorigLeftUpLeg', [0.04, legY, -0.97]);
  rig.aimBone('mixamorigRightUpLeg', [-0.04, legY, -0.97]);
  rig.aimBone('mixamorigLeftLeg', [0.04, legY, -0.97]);
  rig.aimBone('mixamorigRightLeg', [-0.04, legY, -0.97]);
  rig.aimBone('mixamorigLeftFoot', [0.04, -0.95, -0.25]);
  rig.aimBone('mixamorigRightFoot', [-0.04, -0.95, -0.25]);

  // 45° arrow-tucked elbows:
  // Top (d=0): upper arms point down to floor [±0.28, -0.94, -0.12]
  // Bottom (d=1): upper arms angle back & out above torso [±0.62, 0.32, -0.72]
  const armX = 0.28 + d * 0.34;
  const armY = -0.94 + d * 1.26;
  const armZ = -0.12 - d * 0.60;
  rig.aimBone('mixamorigLeftArm', [armX, armY, armZ]);
  rig.aimBone('mixamorigRightArm', [-armX, armY, armZ]);

  // Forearms stay vertical/angled down to hands planted on floor pads
  const foreX = -0.08 - d * 0.08;
  const foreY = -0.98 + d * 0.04;
  const foreZ = 0.14 + d * 0.24;
  rig.aimBone('mixamorigLeftForeArm', [foreX, foreY, foreZ]);
  rig.aimBone('mixamorigRightForeArm', [-foreX, foreY, foreZ]);

  // Hands flat on floor pads pointing forward
  rig.aimBone('mixamorigLeftHand', [0, -0.15, 0.98]);
  rig.aimBone('mixamorigRightHand', [0, -0.15, 0.98]);

  // Pin hands midpoint to floor pads at y = 10 FBX units (0.038m), z = +135 (+0.51m)
  rig.pinMidpointToFBXPoint('mixamorigLeftHand', 'mixamorigRightHand', [0, 10, 135]);
}

/**
 * Pose helper: Bulgarian Split Squat (Bed Edge) at depth d ∈ [0 (top standing), 1 (deep bottom lunge)]
 */
function poseSplitSquatAtDepth(rig: VirtualRig, d: number): void {
  // Slight athletic forward torso lean (6° at top -> 14° at bottom)
  const leanDeg = 6 + d * 8;
  rig.setHipsEuler(leanDeg, 0, 0);

  const spineZ = Math.sin((leanDeg * Math.PI) / 180);
  const spineY = Math.cos((leanDeg * Math.PI) / 180);
  rig.aimBone('mixamorigSpine', [0, spineY, spineZ]);
  rig.aimBone('mixamorigSpine1', [0, spineY, spineZ]);
  rig.aimBone('mixamorigSpine2', [0, spineY, spineZ]);
  rig.aimBone('mixamorigNeck', [0, 0.99, 0.08]);
  rig.aimBone('mixamorigHead', [0, 1.0, 0.05]);

  // Front leg (Left): steps forward; thigh flexes from [-0.88 Y, +0.46 Z] at top to horizontal [-0.12 Y, +0.99 Z] at bottom
  const fThighY = -0.88 + d * 0.76;
  const fThighZ = 0.46 + d * 0.53;
  rig.aimBone('mixamorigLeftUpLeg', [0.04, fThighY, fThighZ]);

  // Front shin (Left): vertical/slight forward knee track
  const fShinY = -0.98;
  const fShinZ = -0.05 - d * 0.12;
  rig.aimBone('mixamorigLeftLeg', [0.02, fShinY, fShinZ]);
  rig.aimBone('mixamorigLeftFoot', [0, -0.55, 0.83]);

  // Rear leg (Right): hooked on elevated bed edge behind (z ≈ -0.62m, y ≈ 0.40m)
  // Rear thigh angles down and back; rear knee drops near floor at d=1 while rear foot stays on bed
  const rThighY = -0.84 - d * 0.10;
  const rThighZ = -0.52 + d * 0.16;
  rig.aimBone('mixamorigRightUpLeg', [-0.04, rThighY, rThighZ]);

  const rShinY = 0.08 + d * 0.58;
  const rShinZ = -0.99 + d * 0.22;
  rig.aimBone('mixamorigRightLeg', [-0.02, rShinY, rShinZ]);
  rig.aimBone('mixamorigRightFoot', [0, -0.92, -0.38]);

  // Arms in athletic balance guard (hands rise slightly in front of chest as hips descend)
  const armY = -0.95 + d * 0.25;
  const armZ = 0.10 + d * 0.35;
  rig.aimBone('mixamorigLeftArm', [0.18, armY, armZ]);
  rig.aimBone('mixamorigRightArm', [-0.18, armY, armZ]);

  const foreY = -0.65 + d * 0.75;
  const foreZ = 0.75 + d * 0.20;
  rig.aimBone('mixamorigLeftForeArm', [0.05, foreY, foreZ]);
  rig.aimBone('mixamorigRightForeArm', [-0.05, foreY, foreZ]);

  // Pin front left foot flat on the studio floor at [22, 3, 95] (x=0.08m, y=0.01m, z=+0.36m)
  rig.pinBoneToFBXPoint('mixamorigLeftToeBase', [22, 3, 95]);
}

/**
 * Pose helper: Bed Pike Push-Up at depth d ∈ [0 (inverted V lockout), 1 (crown tripod touch)]
 */
function posePikePushUpAtDepth(rig: VirtualRig, d: number): void {
  // Hips hinged high in inverted V (+122° -> +130° forward pitch)
  const pitchDeg = 122 + d * 8;
  rig.setHipsEuler(pitchDeg, 0, 0);

  // Spine points steeply down and forward toward the floor
  const spineY = -0.78 - d * 0.06;
  const spineZ = 0.62 - d * 0.06;
  rig.aimBone('mixamorigSpine', [0, spineY, spineZ]);
  rig.aimBone('mixamorigSpine1', [0, spineY, spineZ]);
  rig.aimBone('mixamorigSpine2', [0, spineY, spineZ]);
  rig.aimBone('mixamorigNeck', [0, -0.72, 0.69]);
  rig.aimBone('mixamorigHead', [0, -0.72, 0.69]);

  // Legs extend back from high hips to the elevated bed edge (y ≈ 0.46m, z ≈ -0.75m)
  const legY = -0.14 + d * 0.16;
  rig.aimBone('mixamorigLeftUpLeg', [0.04, legY, -0.98]);
  rig.aimBone('mixamorigRightUpLeg', [-0.04, legY, -0.98]);
  rig.aimBone('mixamorigLeftLeg', [0.04, legY, -0.98]);
  rig.aimBone('mixamorigRightLeg', [-0.04, legY, -0.98]);
  rig.aimBone('mixamorigLeftFoot', [0.04, -0.92, -0.38]);
  rig.aimBone('mixamorigRightFoot', [-0.04, -0.92, -0.38]);

  // Arms: At d=0, pressing overhead [±0.22, -0.95, 0.22]; at d=1, elbows bend so crown dips forward
  const armX = 0.22 + d * 0.32;
  const armY = -0.95 + d * 0.72;
  const armZ = 0.22 - d * 0.95;
  rig.aimBone('mixamorigLeftArm', [armX, armY, armZ]);
  rig.aimBone('mixamorigRightArm', [-armX, armY, armZ]);

  const foreX = -0.06 - d * 0.08;
  const foreY = -0.98 + d * 0.05;
  const foreZ = 0.16 + d * 0.24;
  rig.aimBone('mixamorigLeftForeArm', [foreX, foreY, foreZ]);
  rig.aimBone('mixamorigRightForeArm', [-foreX, foreY, foreZ]);

  rig.aimBone('mixamorigLeftHand', [0, -0.15, 0.98]);
  rig.aimBone('mixamorigRightHand', [0, -0.15, 0.98]);

  // Pin hands midpoint to floor pads at [0, 10, 95] (y=0.038m, z=+0.36m)
  rig.pinMidpointToFBXPoint('mixamorigLeftHand', 'mixamorigRightHand', [0, 10, 95]);
}

/**
 * Pose helper: Post-Workout Cobra Stretch at arch factor a ∈ [0 (low prone rest), 1 (full spinal extension)]
 */
function poseCobraAtArch(rig: VirtualRig, a: number): void {
  // Pelvis stays grounded prone on yoga mat while upper spine arches upward
  const hipPitch = 82 - a * 18;
  rig.setHipsEuler(hipPitch, 0, 0);

  rig.aimBone('mixamorigSpine', [0, 0.28 + a * 0.32, 0.92]);
  rig.aimBone('mixamorigSpine1', [0, 0.42 + a * 0.38, 0.82]);
  rig.aimBone('mixamorigSpine2', [0, 0.55 + a * 0.36, 0.68]);
  rig.aimBone('mixamorigNeck', [0, 0.72 + a * 0.24, 0.55]);
  rig.aimBone('mixamorigHead', [0, 0.82 + a * 0.16, 0.45]);

  // Legs resting flat along the yoga mat behind
  rig.aimBone('mixamorigLeftUpLeg', [0.05, -0.01, -0.99]);
  rig.aimBone('mixamorigRightUpLeg', [-0.05, -0.01, -0.99]);
  rig.aimBone('mixamorigLeftLeg', [0.05, -0.01, -0.99]);
  rig.aimBone('mixamorigRightLeg', [-0.05, -0.01, -0.99]);
  rig.aimBone('mixamorigLeftFoot', [0.05, -0.35, -0.93]);
  rig.aimBone('mixamorigRightFoot', [-0.05, -0.35, -0.93]);

  // Arms support chest with elbows tucked and palms resting on mat at y ≈ 0.03m
  const armX = 0.28 - a * 0.04;
  const armY = -0.62 - a * 0.22;
  const armZ = -0.72 + a * 0.42;
  rig.aimBone('mixamorigLeftArm', [armX, armY, armZ]);
  rig.aimBone('mixamorigRightArm', [-armX, armY, armZ]);

  const foreY = -0.18 - a * 0.22;
  const foreZ = 0.98 - a * 0.08;
  rig.aimBone('mixamorigLeftForeArm', [-0.06, foreY, foreZ]);
  rig.aimBone('mixamorigRightForeArm', [0.06, foreY, foreZ]);
  rig.aimBone('mixamorigLeftHand', [0, -0.05, 0.99]);
  rig.aimBone('mixamorigRightHand', [0, -0.05, 0.99]);

  // Pin pelvis/hips to yoga mat at y = 24 FBX units (0.09m), z = -20 (-0.08m)
  rig.bones.mixamorigHips.position.set(0, 24, -20);
  rig.root.updateMatrixWorld(true);
}

/**
 * Pose helper: Warm-Up Runner's Lunge with Thoracic Twist (twist ∈ [0, 1])
 */
function poseWarmupLungeTwist(rig: VirtualRig, twist: number): void {
  const yawDeg = twist * 52;
  rig.setHipsEuler(12, 0, 0);

  // Thoracic spine twists toward the lead left leg (+Y yaw)
  const rad = (yawDeg * Math.PI) / 180;
  rig.aimBone('mixamorigSpine', [0, 0.98, 0.18], rad * 0.35);
  rig.aimBone('mixamorigSpine1', [0, 0.98, 0.18], rad * 0.70);
  rig.aimBone('mixamorigSpine2', [0, 0.98, 0.18], rad);
  rig.aimBone('mixamorigNeck', [0, 0.99, 0.12], rad * 1.1);
  rig.aimBone('mixamorigHead', [0, 1.0, 0.08], rad * 1.1);

  // Deep runner's lunge: front left leg flexed 90°, rear right leg extended straight back
  rig.aimBone('mixamorigLeftUpLeg', [0.05, -0.15, 0.98]);
  rig.aimBone('mixamorigLeftLeg', [0.02, -0.98, -0.12]);
  rig.aimBone('mixamorigLeftFoot', [0, -0.55, 0.83]);

  rig.aimBone('mixamorigRightUpLeg', [-0.05, -0.48, -0.87]);
  rig.aimBone('mixamorigRightLeg', [-0.04, -0.45, -0.89]);
  rig.aimBone('mixamorigRightFoot', [0, -0.95, -0.30]);

  // Arms open wide with the thoracic rotation
  const lArmX = 0.85 * Math.cos(rad) - 0.15 * Math.sin(rad);
  const lArmZ = -0.85 * Math.sin(rad) + 0.15 * Math.cos(rad);
  const rArmX = -0.85 * Math.cos(rad) - 0.25 * Math.sin(rad);
  const rArmZ = 0.85 * Math.sin(rad) + 0.25 * Math.cos(rad);

  rig.aimBone('mixamorigLeftArm', [lArmX, 0.12 + twist * 0.25, lArmZ]);
  rig.aimBone('mixamorigLeftForeArm', [lArmX, 0.18 + twist * 0.28, lArmZ]);
  rig.aimBone('mixamorigRightArm', [rArmX, -0.15, rArmZ]);
  rig.aimBone('mixamorigRightForeArm', [rArmX, -0.10, rArmZ]);

  // Pin front left foot to studio floor at [22, 3, 105]
  rig.pinBoneToFBXPoint('mixamorigLeftToeBase', [22, 3, 105]);
}

/**
 * Pose helper: Warm-Up Scapular Push-Up (protract ∈ [0 (retracted pinch), 1 (protracted push-up plus)])
 */
function poseWarmupScapularPlank(rig: VirtualRig, protract: number): void {
  // High plank with locked straight elbows; shoulders protract/retract
  const pitchDeg = 76 - protract * 4;
  rig.setHipsEuler(pitchDeg, 0, 0);

  const spineY = 0.22 + protract * 0.12;
  rig.aimBone('mixamorigSpine', [0, spineY, 0.97]);
  rig.aimBone('mixamorigSpine1', [0, spineY + protract * 0.08, 0.96]);
  rig.aimBone('mixamorigSpine2', [0, spineY + protract * 0.10, 0.95]);
  rig.aimBone('mixamorigNeck', [0, 0.35, 0.93]);
  rig.aimBone('mixamorigHead', [0, 0.42, 0.90]);

  // Clavicles protract downward toward floor at protract=1, retract upward at protract=0
  const shY = 0.25 - protract * 0.55;
  const shZ = -0.25 + protract * 0.50;
  rig.aimBone('mixamorigLeftShoulder', [0.90, shY, shZ]);
  rig.aimBone('mixamorigRightShoulder', [-0.90, shY, shZ]);

  // Straight locked arms pointing vertically to floor pads
  rig.aimBone('mixamorigLeftArm', [0.18, -0.97, 0.12]);
  rig.aimBone('mixamorigRightArm', [-0.18, -0.97, 0.12]);
  rig.aimBone('mixamorigLeftForeArm', [-0.04, -0.99, 0.12]);
  rig.aimBone('mixamorigRightForeArm', [0.04, -0.99, 0.12]);
  rig.aimBone('mixamorigLeftHand', [0, -0.15, 0.98]);
  rig.aimBone('mixamorigRightHand', [0, -0.15, 0.98]);

  // Legs braced straight back
  rig.aimBone('mixamorigLeftUpLeg', [0.04, -0.22, -0.97]);
  rig.aimBone('mixamorigRightUpLeg', [-0.04, -0.22, -0.97]);
  rig.aimBone('mixamorigLeftLeg', [0.04, -0.22, -0.97]);
  rig.aimBone('mixamorigRightLeg', [-0.04, -0.22, -0.97]);
  rig.aimBone('mixamorigLeftFoot', [0.04, -0.95, -0.25]);
  rig.aimBone('mixamorigRightFoot', [-0.04, -0.95, -0.25]);

  rig.pinMidpointToFBXPoint('mixamorigLeftHand', 'mixamorigRightHand', [0, 10, 135]);
}

/**
 * Generate a complete Three.js AnimationClip for any exercise or mobility drill.
 */
export function createExerciseSkeletalClip(poseType: AnyPoseType): THREE.AnimationClip {
  switch (poseType) {
    case 'warmup': {
      // 6.0s dual-phase loop:
      // 0.0s -> 2.5s: Deep Runner's Lunge with Thoracic Twist
      // 3.0s -> 5.5s: Prone Scapular Push-Up (Retraction <-> Protraction)
      const times = [0, 0.8, 1.8, 2.6, 3.3, 4.3, 5.2, 6.0];
      return buildClipFromPoses('Warmup_Lunge_Scapular', times, [
        (r) => poseWarmupLungeTwist(r, 0.1),
        (r) => poseWarmupLungeTwist(r, 1.0),
        (r) => poseWarmupLungeTwist(r, 0.2),
        (r) => poseWarmupScapularPlank(r, 0.0),
        (r) => poseWarmupScapularPlank(r, 1.0),
        (r) => poseWarmupScapularPlank(r, 0.0),
        (r) => poseWarmupScapularPlank(r, 1.0),
        (r) => poseWarmupLungeTwist(r, 0.1),
      ]);
    }

    case 'pushup': {
      // Strict 5.0s 3-1-1 hypertrophy tempo:
      // 0.0s -> 3.0s: Eccentric lowering
      // 3.0s -> 4.0s: 1s isometric pause 1 inch above floor
      // 4.0s -> 5.0s: Explosive concentric drive to lockout
      const times = [0, 1.5, 3.0, 4.0, 5.0];
      return buildClipFromPoses('PushUp_311', times, [
        (r) => posePushUpAtDepth(r, 0.0),
        (r) => posePushUpAtDepth(r, 0.5),
        (r) => posePushUpAtDepth(r, 1.0),
        (r) => posePushUpAtDepth(r, 1.0),
        (r) => posePushUpAtDepth(r, 0.0),
      ]);
    }

    case 'splitsquat': {
      // Strict 5.0s 3-1-1 Bulgarian Split Squat (Bed Edge)
      const times = [0, 1.5, 3.0, 4.0, 5.0];
      return buildClipFromPoses('SplitSquat_311', times, [
        (r) => poseSplitSquatAtDepth(r, 0.0),
        (r) => poseSplitSquatAtDepth(r, 0.5),
        (r) => poseSplitSquatAtDepth(r, 1.0),
        (r) => poseSplitSquatAtDepth(r, 1.0),
        (r) => poseSplitSquatAtDepth(r, 0.0),
      ]);
    }

    case 'pullup': {
      // 5.0s Ledge Pull-Up (Concentric pull -> Top pause -> Slow controlled eccentric negative)
      const times = [0, 1.2, 2.0, 3.5, 5.0];
      return buildClipFromPoses('PullUp_311', times, [
        (r) => posePullUpAtProgress(0.0, r),
        (r) => posePullUpAtProgress(1.0, r),
        (r) => posePullUpAtProgress(1.0, r),
        (r) => posePullUpAtProgress(0.5, r),
        (r) => posePullUpAtProgress(0.0, r),
      ]);
    }

    case 'pikepushup': {
      // Strict 5.0s 3-1-1 Bed Pike Push-Up
      const times = [0, 1.5, 3.0, 4.0, 5.0];
      return buildClipFromPoses('PikePushUp_311', times, [
        (r) => posePikePushUpAtDepth(r, 0.0),
        (r) => posePikePushUpAtDepth(r, 0.5),
        (r) => posePikePushUpAtDepth(r, 1.0),
        (r) => posePikePushUpAtDepth(r, 1.0),
        (r) => posePikePushUpAtDepth(r, 0.0),
      ]);
    }

    case 'cobra': {
      // 4.0s Post-Workout Cobra Stretch & Decompression breathing wave
      const times = [0, 1.0, 2.2, 3.0, 4.0];
      return buildClipFromPoses('Cobra_Breath', times, [
        (r) => poseCobraAtArch(r, 0.15),
        (r) => poseCobraAtArch(r, 0.65),
        (r) => poseCobraAtArch(r, 1.0),
        (r) => poseCobraAtArch(r, 0.85),
        (r) => poseCobraAtArch(r, 0.15),
      ]);
    }

    case 'armcircles': {
      // M1: Arm Circles & Shoulder Dislocates — horizontal T-pose 360° circumduction
      const times = [0, 0.6, 1.2, 1.8, 2.4];
      const poseAtAngle = (rig: VirtualRig, angleRad: number) => {
        const dy = Math.sin(angleRad) * 0.28;
        const dz = Math.cos(angleRad) * 0.28;
        rig.aimBone('mixamorigLeftShoulder', [0.98, 0.05 + dy * 0.25, dz * 0.25]);
        rig.aimBone('mixamorigRightShoulder', [-0.98, 0.05 + dy * 0.25, dz * 0.25]);
        rig.aimBone('mixamorigLeftArm', [0.92, dy, dz]);
        rig.aimBone('mixamorigRightArm', [-0.92, dy, dz]);
        rig.aimBone('mixamorigLeftForeArm', [0.92, dy, dz]);
        rig.aimBone('mixamorigRightForeArm', [-0.92, dy, dz]);
        rig.pinMidpointToFBXPoint('mixamorigLeftToeBase', 'mixamorigRightToeBase', [0, 2, 14]);
      };
      return buildClipFromPoses('ArmCircles_Loop', times, [
        (r) => poseAtAngle(r, 0),
        (r) => poseAtAngle(r, Math.PI * 0.5),
        (r) => poseAtAngle(r, Math.PI),
        (r) => poseAtAngle(r, Math.PI * 1.5),
        (r) => poseAtAngle(r, Math.PI * 2.0),
      ]);
    }

    case 'legswings': {
      // M2: Leg Swings (Front-to-Back) — Left hand on support post, Right leg swinging sagittally
      const times = [0, 0.5, 1.0, 1.5, 2.0];
      const poseAtSwing = (rig: VirtualRig, swingAngleRad: number) => {
        // Left arm reaches out to support post at x = +0.38m, z = +0.25m
        rig.aimBone('mixamorigLeftShoulder', [0.95, 0.05, 0.15]);
        rig.aimBone('mixamorigLeftArm', [0.75, -0.25, 0.60]);
        rig.aimBone('mixamorigLeftForeArm', [0.55, 0.10, 0.82]);

        // Right arm counter-balances
        rig.aimBone('mixamorigRightArm', [-0.35, -0.88, -0.25 * Math.sin(swingAngleRad)]);
        rig.aimBone('mixamorigRightForeArm', [-0.25, -0.75, 0.55]);

        // Right leg swings from -35° posterior to +50° anterior
        const sinA = Math.sin(swingAngleRad);
        const cosA = Math.cos(swingAngleRad);
        rig.aimBone('mixamorigRightUpLeg', [-0.05, -cosA, sinA]);
        // Slight natural knee bend at backswing
        const kneeBend = swingAngleRad < 0 ? 0.35 : 0.08;
        const shinAngle = swingAngleRad - kneeBend;
        rig.aimBone('mixamorigRightLeg', [-0.04, -Math.cos(shinAngle), Math.sin(shinAngle)]);
        rig.aimBone('mixamorigRightFoot', [0, -0.4, 0.9]);

        // Pin standing left foot firmly to studio floor at its natural x=68.8 (+0.26m)
        rig.pinBoneToFBXPoint('mixamorigLeftToeBase', [68.8, 2, 14]);
      };
      return buildClipFromPoses('LegSwings_Loop', times, [
        (r) => poseAtSwing(r, 0),
        (r) => poseAtSwing(r, 0.85),
        (r) => poseAtSwing(r, 0),
        (r) => poseAtSwing(r, -0.62),
        (r) => poseAtSwing(r, 0),
      ]);
    }

    case 'torsotwists': {
      // M3: Standing Torso Twists & Reach — Transverse thoracic rotation (-48° to +48°)
      const times = [0, 0.625, 1.25, 1.875, 2.5];
      const poseAtTwist = (rig: VirtualRig, yawRad: number) => {
        rig.setHipsEuler(0, ((yawRad * 180) / Math.PI) * 0.25, 0);
        rig.aimBone('mixamorigSpine', [0, 1, 0], yawRad * 0.45);
        rig.aimBone('mixamorigSpine1', [0, 1, 0], yawRad * 0.75);
        rig.aimBone('mixamorigSpine2', [0, 1, 0], yawRad * 1.0);
        rig.aimBone('mixamorigNeck', [0, 1, 0], yawRad * 1.15);
        rig.aimBone('mixamorigHead', [0, 1, 0], yawRad * 1.2);

        // Arms held in athletic 90° rotational reach
        const cosY = Math.cos(yawRad);
        const sinY = Math.sin(yawRad);
        rig.aimBone('mixamorigLeftArm', [0.65 * cosY + 0.25 * sinY, -0.55, -0.65 * sinY + 0.25 * cosY]);
        rig.aimBone('mixamorigRightArm', [-0.65 * cosY + 0.25 * sinY, -0.55, 0.65 * sinY + 0.25 * cosY]);
        rig.aimBone('mixamorigLeftForeArm', [-0.25 * cosY + 0.85 * sinY, 0.15, 0.25 * sinY + 0.85 * cosY]);
        rig.aimBone('mixamorigRightForeArm', [0.25 * cosY + 0.85 * sinY, 0.15, -0.25 * sinY + 0.85 * cosY]);

        rig.pinMidpointToFBXPoint('mixamorigLeftToeBase', 'mixamorigRightToeBase', [0, 2, 14]);
      };
      return buildClipFromPoses('TorsoTwists_Loop', times, [
        (r) => poseAtTwist(r, 0),
        (r) => poseAtTwist(r, 0.82),
        (r) => poseAtTwist(r, 0),
        (r) => poseAtTwist(r, -0.82),
        (r) => poseAtTwist(r, 0),
      ]);
    }

    default: {
      const times = [0, 1.5, 3.0];
      return buildClipFromPoses('AthleticIdle', times, [
        (r) => r.pinMidpointToFBXPoint('mixamorigLeftToeBase', 'mixamorigRightToeBase', [0, 2, 14]),
        (r) => {
          r.aimBone('mixamorigSpine1', [0, 0.99, 0.04]);
          r.pinMidpointToFBXPoint('mixamorigLeftToeBase', 'mixamorigRightToeBase', [0, 2, 14]);
        },
        (r) => r.pinMidpointToFBXPoint('mixamorigLeftToeBase', 'mixamorigRightToeBase', [0, 2, 14]),
      ]);
    }
  }
}

function posePullUpAtProgress(p: number, rig: VirtualRig): void {
  // Slight thoracic extension at top of pull-up so chest meets bar
  rig.setHipsEuler(-p * 6, 0, 0);
  rig.aimBone('mixamorigSpine', [0, 0.99, -p * 0.12]);
  rig.aimBone('mixamorigSpine1', [0, 0.98, -p * 0.16]);
  rig.aimBone('mixamorigSpine2', [0, 0.98, -p * 0.18]);
  rig.aimBone('mixamorigNeck', [0, 0.99, 0.12]);
  rig.aimBone('mixamorigHead', [0, 0.99, 0.15]);

  // Shoulders depress from dead hang (p=0) to active lat engagement (p=1)
  const shY = 0.35 - p * 0.40;
  rig.aimBone('mixamorigLeftShoulder', [0.92, shY, 0]);
  rig.aimBone('mixamorigRightShoulder', [-0.92, shY, 0]);

  // Upper arms pull from overhead [±0.22, +0.97, 0.05] down to ribs [±0.68, -0.65, -0.32]
  const armX = 0.22 + p * 0.46;
  const armY = 0.97 - p * 1.62;
  const armZ = 0.05 - p * 0.37;
  rig.aimBone('mixamorigLeftArm', [armX, armY, armZ]);
  rig.aimBone('mixamorigRightArm', [-armX, armY, armZ]);

  // Forearms stay pointed up toward the overhead bar grip
  const foreX = -0.05 - p * 0.12;
  const foreY = 0.99 - p * 0.04;
  const foreZ = 0.05 + p * 0.22;
  rig.aimBone('mixamorigLeftForeArm', [foreX, foreY, foreZ]);
  rig.aimBone('mixamorigRightForeArm', [-foreX, foreY, foreZ]);

  // Legs vertical with 90° tucked knees and crossed ankles so feet stay cleanly above floor at dead hang
  rig.aimBone('mixamorigLeftUpLeg', [0.04, -0.98, 0.15]);
  rig.aimBone('mixamorigRightUpLeg', [-0.04, -0.98, 0.15]);
  rig.aimBone('mixamorigLeftLeg', [-0.06, -0.10, -0.99]);
  rig.aimBone('mixamorigRightLeg', [0.06, -0.10, -0.99]);
  rig.aimBone('mixamorigLeftFoot', [0, -0.92, -0.38]);
  rig.aimBone('mixamorigRightFoot', [0, -0.92, -0.38]);

  // Pin midpoint of both hands to the overhead bar at y = 422 FBX units (1.60m), z = 0
  rig.pinMidpointToFBXPoint('mixamorigLeftHand', 'mixamorigRightHand', [0, 422, 0]);
}
