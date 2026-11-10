// src/stickman/three/GLBCharacter.tsx — External 3D GLB Character loader & procedural/clip animator.
// Loads a .glb model from the public/ directory using useGLTF from @react-three/drei + Remotion staticFile(),
// enables realistic shadow casting/receiving on all meshes, and drives either embedded glTF AnimationClips
// or procedural skeletal/node poses (compatible with the 2D/3D PoseLike rig and Mixamo/humanoid hierarchies).
import React, { Suspense, useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { staticFile } from 'remotion';
import { pose as toPose, type PoseLike } from '../poses';
import { useShotTime } from '../time';

const U = 1 / 140; // 2D rig units -> metres

export type GLBCharacterProps = {
  /** File path inside public/ (default: 'character.glb'). Loaded via useGLTF(staticFile(modelFile)). */
  modelFile?: string;
  /** Pose name or Pose object for procedural joint animation when no embedded clip is selected. */
  pose?: PoseLike;
  /** Optional name of an embedded glTF animation clip (or index) to play via THREE.AnimationMixer. */
  clipName?: string;
  /** Playback speed multiplier for embedded glTF animation clips (default 1). */
  timeScale?: number;
  /** Optional accent/visor emissive colour override (e.g. Teal '#38bdf8', Orange '#ff8c3b', or Red '#ff3333'). */
  accentColor?: string;
  /** Optional primary suit/body tint override. */
  suitColor?: string;
  /** Uniform scale multiplier (default 1). */
  scale?: number;
  /** World position [x, y, z]. */
  position?: [number, number, number];
  /** Y rotation in radians (0 = faces +x in stage space, matching camera choreography; internal model +Z is rotated). */
  rotationY?: number;
};

type RigNodes = {
  hips?: THREE.Object3D;
  torso?: THREE.Object3D;
  chestCore?: THREE.Object3D;
  head?: THREE.Object3D;
  visor?: THREE.Object3D;
  leftArm?: THREE.Object3D;
  leftForeArm?: THREE.Object3D;
  rightArm?: THREE.Object3D;
  rightForeArm?: THREE.Object3D;
  leftUpLeg?: THREE.Object3D;
  leftLeg?: THREE.Object3D;
  rightUpLeg?: THREE.Object3D;
  rightLeg?: THREE.Object3D;
};

function findNode(root: THREE.Object3D, names: string[]): THREE.Object3D | undefined {
  for (const name of names) {
    const found = root.getObjectByName(name);
    if (found) return found;
  }
  return undefined;
}

/**
 * Compute pitch (around local X) and roll (around local Z) from a 2D/3D limb direction vector.
 * In our stage space, the character faces +X, Y is up, and Z is lateral (right = +Z, left = -Z).
 * Inside the GLB humanoid hierarchy (which faces local +Z before the root +90deg Y turn):
 * - Forward swing (+X in stage space) maps to local +Z, which is pitch around local X (`rotX = -atan2(dx, -dy)`).
 */
function limbAngles(ax: number, ay: number, bx: number, by: number): { pitch: number; roll: number } {
  const dx = (bx - ax) * U;
  const dy = (-by - -ay) * U; // convert 2D y-down to 3D y-up
  // Default limb hangs straight down (dx = 0, dy < 0) -> angle = 0
  const pitch = -Math.atan2(dx, -dy);
  return { pitch, roll: 0 };
}

const GLBCharacterInner: React.FC<GLBCharacterProps> = ({
  modelFile = 'character.glb',
  pose = 'stand',
  clipName,
  timeScale = 1,
  accentColor,
  suitColor,
  scale = 1,
  position = [0, 0, 0],
  rotationY = 0,
}) => {
  const { t } = useShotTime();
  const gltfUrl = staticFile(modelFile);
  const gltf = useGLTF(gltfUrl);

  // Clone the scene and materials per instance so multiple characters on screen can have independent poses & colors
  const { clonedScene, nodes, accentMats, suitMats, disposables } = useMemo(() => {
    const tracked: { dispose: () => void }[] = [];
    const root = gltf.scene.clone(true);
    const accMats: THREE.MeshStandardMaterial[] = [];
    const sMats: THREE.MeshStandardMaterial[] = [];

    root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const orig = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
          if ((orig as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
            const m = (orig as THREE.MeshStandardMaterial).clone();
            tracked.push(m);
            mesh.material = m;
            const hasEmissive = m.emissive && m.emissive.r + m.emissive.g + m.emissive.b > 0.15;
            if (m.name === 'VisorTealGlow' || m.name === 'ChestAccentOrange' || hasEmissive) {
              accMats.push(m);
            } else if (m.name === 'ArmorSuitDark') {
              sMats.push(m);
            }
          }
        }
      }
    });

    const rigNodes: RigNodes = {
      hips: findNode(root, ['Hips', 'mixamorigHips', 'pelvis']),
      torso: findNode(root, ['Torso', 'Spine', 'mixamorigSpine']),
      chestCore: findNode(root, ['ChestCore', 'Spine2', 'mixamorigSpine2']),
      head: findNode(root, ['Head', 'mixamorigHead']),
      visor: findNode(root, ['Visor']),
      leftArm: findNode(root, ['LeftArm', 'mixamorigLeftArm', 'upper_arm.L']),
      leftForeArm: findNode(root, ['LeftForeArm', 'mixamorigLeftForeArm', 'forearm.L']),
      rightArm: findNode(root, ['RightArm', 'mixamorigRightArm', 'upper_arm.R']),
      rightForeArm: findNode(root, ['RightForeArm', 'mixamorigRightForeArm', 'forearm.R']),
      leftUpLeg: findNode(root, ['LeftUpLeg', 'mixamorigLeftUpLeg', 'thigh.L']),
      leftLeg: findNode(root, ['LeftLeg', 'mixamorigLeftLeg', 'shin.L']),
      rightUpLeg: findNode(root, ['RightUpLeg', 'mixamorigRightUpLeg', 'thigh.R']),
      rightLeg: findNode(root, ['RightLeg', 'mixamorigRightLeg', 'shin.R']),
    };

    return {
      clonedScene: root,
      nodes: rigNodes,
      accentMats: accMats,
      suitMats: sMats,
      disposables: tracked,
    };
  }, [gltf.scene]);

  useLayoutEffect(
    () => () => {
      disposables.forEach((d) => d.dispose());
    },
    [disposables],
  );

  // Update dynamic material overrides (e.g. Teal & Orange vs Warning Red)
  useLayoutEffect(() => {
    if (accentColor) {
      const col = new THREE.Color(accentColor);
      for (const m of accentMats) {
        m.color.copy(col);
        m.emissive.copy(col);
      }
    }
    if (suitColor) {
      const col = new THREE.Color(suitColor);
      for (const m of suitMats) {
        m.color.copy(col);
      }
    }
  }, [accentColor, suitColor, accentMats, suitMats]);

  // Apply either an embedded glTF animation clip OR procedural PoseLike joint rotations synchronously per frame
  useLayoutEffect(() => {
    if (gltf.animations && gltf.animations.length > 0 && clipName) {
      const clip =
        THREE.AnimationClip.findByName(gltf.animations, clipName) ?? gltf.animations[0];
      if (clip) {
        const mixer = new THREE.AnimationMixer(clonedScene);
        const action = mixer.clipAction(clip);
        action.play();
        mixer.setTime((t * timeScale) % Math.max(0.001, clip.duration));
        mixer.update(0);
        mixer.stopAllAction();
        mixer.uncacheRoot(clonedScene);
        return;
      }
    }

    // Procedural pose drive from PoseLike (works with our articulated GLB character and standard humanoid rigs)
    const p = toPose(pose);
    const hipY = Math.max(0.18, -p.hip[1] * U);
    const hipX = p.hip[0] * U;
    const shX = p.sh[0] * U;
    const shY = -p.sh[1] * U;

    // Trunk pitch (lean forward/backward, including horizontal push-ups or falls!)
    const trunkDx = shX - hipX;
    const trunkDy = shY - hipY;
    const trunkPitch = Math.atan2(trunkDx, Math.max(0.05, trunkDy));

    if (nodes.hips) {
      nodes.hips.position.set(0, hipY, hipX);
      nodes.hips.rotation.set(trunkPitch, 0, 0);
    }
    if (nodes.torso) {
      nodes.torso.rotation.set(trunkPitch * 0.25, 0, 0);
    }
    if (nodes.head) {
      const headDx = p.head[0] * U - shX;
      const headDy = -p.head[1] * U - shY;
      const headPitch = Math.atan2(headDx, Math.max(0.04, headDy)) - trunkPitch;
      nodes.head.rotation.set(THREE.MathUtils.clamp(headPitch, -0.7, 0.7), 0, 0);
    }

    // Right (near / F) and Left (far / B) arms relative to trunk pitch
    const rArm = limbAngles(p.sh[0], p.sh[1], p.eF[0], p.eF[1]);
    const rFore = limbAngles(p.eF[0], p.eF[1], p.hF[0], p.hF[1]);
    const lArm = limbAngles(p.sh[0], p.sh[1], p.eB[0], p.eB[1]);
    const lFore = limbAngles(p.eB[0], p.eB[1], p.hB[0], p.hB[1]);

    if (nodes.rightArm) {
      nodes.rightArm.rotation.set(rArm.pitch - trunkPitch, 0, -0.08);
    }
    if (nodes.rightForeArm) {
      nodes.rightForeArm.rotation.set(rFore.pitch - rArm.pitch, 0, 0);
    }
    if (nodes.leftArm) {
      nodes.leftArm.rotation.set(lArm.pitch - trunkPitch, 0, 0.08);
    }
    if (nodes.leftForeArm) {
      nodes.leftForeArm.rotation.set(lFore.pitch - lArm.pitch, 0, 0);
    }

    // Right (near / F) and Left (far / B) legs relative to trunk pitch
    const rThigh = limbAngles(p.hip[0], p.hip[1], p.kF[0], p.kF[1]);
    const rShin = limbAngles(p.kF[0], p.kF[1], p.fF[0], p.fF[1]);
    const lThigh = limbAngles(p.hip[0], p.hip[1], p.kB[0], p.kB[1]);
    const lShin = limbAngles(p.kB[0], p.kB[1], p.fB[0], p.fB[1]);

    if (nodes.rightUpLeg) {
      nodes.rightUpLeg.rotation.set(rThigh.pitch - trunkPitch, 0, 0);
    }
    if (nodes.rightLeg) {
      nodes.rightLeg.rotation.set(rShin.pitch - rThigh.pitch, 0, 0);
    }
    if (nodes.leftUpLeg) {
      nodes.leftUpLeg.rotation.set(lThigh.pitch - trunkPitch, 0, 0);
    }
    if (nodes.leftLeg) {
      nodes.leftLeg.rotation.set(lShin.pitch - lThigh.pitch, 0, 0);
    }
  });

  // Note: standard glTF characters face +Z, while stage choreography uses 0 rad = +X.
  // Adding Math.PI / 2 aligns the GLB character's forward direction with the stage's +X axis.
  return (
    <group position={position} rotation={[0, rotationY + Math.PI / 2, 0]} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
};

export const GLBCharacter: React.FC<GLBCharacterProps> = (props) => {
  return (
    <Suspense fallback={null}>
      <GLBCharacterInner {...props} />
    </Suspense>
  );
};

// Preload default character.glb from public/
useGLTF.preload(staticFile('character.glb'));
