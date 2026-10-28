import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  createExerciseSkeletalClip,
  snapshotAndResetModelBindPose,
  MIXAMO_CORE_BONES,
} from './skeletalAnimator.ts';
import type { AnyPoseType } from './skeletalAnimator.ts';

test('createExerciseSkeletalClip generates valid 3-1-1 AnimationClip for pushup', () => {
  const clip = createExerciseSkeletalClip('pushup');
  assert.equal(clip.name, 'PushUp_311');
  assert.equal(clip.duration, 5.0);
  // 22 core bone quaternion tracks + 1 Hips position track = 23 tracks
  assert.equal(clip.tracks.length, MIXAMO_CORE_BONES.length + 1);

  const trackNames = clip.tracks.map((t) => t.name);
  assert.ok(trackNames.includes('mixamorigHips.quaternion'));
  assert.ok(trackNames.includes('mixamorigHips.position'));
  assert.ok(trackNames.includes('mixamorigLeftArm.quaternion'));
  assert.ok(trackNames.includes('mixamorigRightArm.quaternion'));
  assert.ok(trackNames.includes('mixamorigLeftUpLeg.quaternion'));
  assert.ok(trackNames.includes('mixamorigRightUpLeg.quaternion'));
});

test('createExerciseSkeletalClip generates valid AnimationClip for all 9 exercises including warmup', () => {
  const poses: AnyPoseType[] = [
    'warmup',
    'pushup',
    'splitsquat',
    'pikepushup',
    'pullup',
    'cobra',
    'armcircles',
    'legswings',
    'torsotwists',
  ];

  for (const pose of poses) {
    const clip = createExerciseSkeletalClip(pose);
    assert.ok(clip.duration > 0, `Clip for ${pose} should have positive duration`);
    assert.equal(
      clip.tracks.length,
      MIXAMO_CORE_BONES.length + 1,
      `Clip for ${pose} should emit tracks for all ${MIXAMO_CORE_BONES.length} core bones + Hips position`
    );

    // Verify keyframe data integrity and normalized quaternions
    for (const track of clip.tracks) {
      assert.ok(track.times.length > 0);
      assert.ok(track.values.length > 0);
      for (let i = 1; i < track.times.length; i++) {
        assert.ok(track.times[i] >= track.times[i - 1]);
      }
      if (track.name.endsWith('.quaternion')) {
        for (let k = 0; k < track.values.length; k += 4) {
          const lenSq =
            track.values[k] ** 2 +
            track.values[k + 1] ** 2 +
            track.values[k + 2] ** 2 +
            track.values[k + 3] ** 2;
          assert.ok(Math.abs(lenSq - 1) < 1e-4, `Quaternion in ${track.name} should be unit length`);
        }
      }
    }
  }
});

test('snapshotAndResetModelBindPose snapshots initial bind pose and restores mutated bones', () => {
  const root = new THREE.Group();
  const hips = new THREE.Bone();
  hips.name = 'mixamorigHips';
  hips.position.set(0, 232.95, 0);
  hips.quaternion.set(0, 0, 0, 1);
  root.add(hips);

  // First call snapshots bind pose
  snapshotAndResetModelBindPose(root);

  // Mutate bone position and rotation
  hips.position.set(10, 50, -30);
  hips.quaternion.setFromEuler(new THREE.Euler(1.2, 0.5, -0.8));

  // Second call restores original bind pose
  snapshotAndResetModelBindPose(root);
  assert.ok(Math.abs(hips.position.x - 0) < 1e-5);
  assert.ok(Math.abs(hips.position.y - 232.95) < 1e-4);
  assert.ok(Math.abs(hips.quaternion.w - 1) < 1e-5);
});

test('createExerciseSkeletalClip handles default neutral pose safely', () => {
  const clip = createExerciseSkeletalClip('unknown' as unknown as AnyPoseType);
  assert.equal(clip.name, 'AthleticIdle');
  assert.equal(clip.duration, 3.0);
  assert.equal(clip.tracks.length, MIXAMO_CORE_BONES.length + 1);
});
