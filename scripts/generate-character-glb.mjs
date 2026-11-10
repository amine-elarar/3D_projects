// scripts/generate-character-glb.mjs — Generates a default articulated 3D humanoid character (`public/character.glb`)
// in glTF 2.0 binary (.glb) format with PBR materials and named hierarchy nodes so `useGLTF('/character.glb')`
// works out of the box and can be replaced with any custom .glb model in `public/`.
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';

const OUT_PATH = '/home/amine-srut/Documents/3d-video-project/public/character.glb';

function bakeGeo(geo, tx = 0, ty = 0, tz = 0, sx = 1, sy = 1, sz = 1) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(tx, ty, tz),
    new THREE.Quaternion(),
    new THREE.Vector3(sx, sy, sz),
  );
  g.applyMatrix4(m);
  g.computeVertexNormals();
  return g;
}

function mergeGeos(geos) {
  let totalVerts = 0;
  for (const g of geos) totalVerts += g.attributes.position.count;
  const pos = new Float32Array(totalVerts * 3);
  const norm = new Float32Array(totalVerts * 3);
  let offset = 0;
  for (const g of geos) {
    const p = g.attributes.position.array;
    const n = g.attributes.normal.array;
    pos.set(p, offset);
    norm.set(n, offset);
    offset += p.length;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(norm, 3));
  return out;
}

// Materials: PBR Metallic-Roughness tailored for Teal & Orange cinematic lighting
const MATERIALS = [
  {
    name: 'ArmorSuitDark',
    pbrMetallicRoughness: {
      baseColorFactor: [0.14, 0.17, 0.21, 1.0],
      metallicFactor: 0.45,
      roughnessFactor: 0.38,
    },
  },
  {
    name: 'JointTitanium',
    pbrMetallicRoughness: {
      baseColorFactor: [0.28, 0.32, 0.36, 1.0],
      metallicFactor: 0.75,
      roughnessFactor: 0.28,
    },
  },
  {
    name: 'ChestAccentOrange',
    pbrMetallicRoughness: {
      baseColorFactor: [0.92, 0.42, 0.14, 1.0],
      metallicFactor: 0.25,
      roughnessFactor: 0.32,
    },
    emissiveFactor: [0.35, 0.12, 0.02],
  },
  {
    name: 'VisorTealGlow',
    pbrMetallicRoughness: {
      baseColorFactor: [0.15, 0.82, 0.95, 1.0],
      metallicFactor: 0.1,
      roughnessFactor: 0.15,
    },
    emissiveFactor: [0.18, 0.78, 0.92],
  },
];

// Build articulated humanoid parts (total height ≈ 1.78m, feet at y = 0, facing +z)
const PARTS = [
  {
    name: 'Hips',
    translation: [0, 0.92, 0],
    parent: null,
    mat: 1,
    geo: mergeGeos([
      bakeGeo(new THREE.BoxGeometry(0.28, 0.14, 0.2), 0, 0, 0),
      bakeGeo(new THREE.CylinderGeometry(0.09, 0.11, 0.1, 16), 0, 0.09, 0),
    ]),
  },
  {
    name: 'Torso',
    translation: [0, 0.12, 0],
    parent: 'Hips',
    mat: 0,
    geo: mergeGeos([
      // Upper chest + tapered waist + shoulder pads
      bakeGeo(new THREE.CylinderGeometry(0.2, 0.14, 0.44, 16), 0, 0.22, 0, 1.15, 1, 0.78),
      bakeGeo(new THREE.SphereGeometry(0.1, 16, 12), -0.22, 0.38, 0),
      bakeGeo(new THREE.SphereGeometry(0.1, 16, 12), 0.22, 0.38, 0),
      // Collar ring
      bakeGeo(new THREE.CylinderGeometry(0.085, 0.1, 0.07, 16), 0, 0.46, 0),
    ]),
  },
  {
    name: 'ChestCore',
    translation: [0, 0.26, 0.145],
    parent: 'Torso',
    mat: 2,
    geo: bakeGeo(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 20), 0, 0, 0),
  },
  {
    name: 'Head',
    translation: [0, 0.52, 0],
    parent: 'Torso',
    mat: 0,
    geo: mergeGeos([
      bakeGeo(new THREE.SphereGeometry(0.135, 24, 18), 0, 0.12, 0, 0.92, 1.12, 0.98),
      bakeGeo(new THREE.BoxGeometry(0.17, 0.1, 0.18), 0, 0.05, 0.01),
    ]),
  },
  {
    name: 'Visor',
    translation: [0, 0.12, 0.115],
    parent: 'Head',
    mat: 3,
    geo: bakeGeo(new THREE.BoxGeometry(0.16, 0.042, 0.04), 0, 0, 0),
  },
  // Left Arm
  {
    name: 'LeftArm',
    translation: [-0.24, 0.38, 0],
    parent: 'Torso',
    mat: 0,
    geo: mergeGeos([
      bakeGeo(new THREE.CylinderGeometry(0.055, 0.046, 0.28, 14), 0, -0.14, 0),
      bakeGeo(new THREE.SphereGeometry(0.052, 14, 10), 0, -0.28, 0),
    ]),
  },
  {
    name: 'LeftForeArm',
    translation: [0, -0.28, 0],
    parent: 'LeftArm',
    mat: 1,
    geo: mergeGeos([
      bakeGeo(new THREE.CylinderGeometry(0.045, 0.038, 0.26, 14), 0, -0.13, 0),
      bakeGeo(new THREE.BoxGeometry(0.06, 0.08, 0.04), 0, -0.28, 0),
    ]),
  },
  // Right Arm
  {
    name: 'RightArm',
    translation: [0.24, 0.38, 0],
    parent: 'Torso',
    mat: 0,
    geo: mergeGeos([
      bakeGeo(new THREE.CylinderGeometry(0.055, 0.046, 0.28, 14), 0, -0.14, 0),
      bakeGeo(new THREE.SphereGeometry(0.052, 14, 10), 0, -0.28, 0),
    ]),
  },
  {
    name: 'RightForeArm',
    translation: [0, -0.28, 0],
    parent: 'RightArm',
    mat: 1,
    geo: mergeGeos([
      bakeGeo(new THREE.CylinderGeometry(0.045, 0.038, 0.26, 14), 0, -0.13, 0),
      bakeGeo(new THREE.BoxGeometry(0.06, 0.08, 0.04), 0, -0.28, 0),
    ]),
  },
  // Left Leg
  {
    name: 'LeftUpLeg',
    translation: [-0.1, -0.04, 0],
    parent: 'Hips',
    mat: 0,
    geo: mergeGeos([
      bakeGeo(new THREE.SphereGeometry(0.068, 14, 10), 0, 0, 0),
      bakeGeo(new THREE.CylinderGeometry(0.072, 0.056, 0.42, 16), 0, -0.21, 0),
      bakeGeo(new THREE.SphereGeometry(0.058, 14, 10), 0, -0.42, 0),
    ]),
  },
  {
    name: 'LeftLeg',
    translation: [0, -0.42, 0],
    parent: 'LeftUpLeg',
    mat: 1,
    geo: mergeGeos([
      bakeGeo(new THREE.CylinderGeometry(0.055, 0.044, 0.42, 16), 0, -0.21, 0),
      bakeGeo(new THREE.BoxGeometry(0.1, 0.07, 0.22), 0, -0.43, 0.04),
    ]),
  },
  // Right Leg
  {
    name: 'RightUpLeg',
    translation: [0.1, -0.04, 0],
    parent: 'Hips',
    mat: 0,
    geo: mergeGeos([
      bakeGeo(new THREE.SphereGeometry(0.068, 14, 10), 0, 0, 0),
      bakeGeo(new THREE.CylinderGeometry(0.072, 0.056, 0.42, 16), 0, -0.21, 0),
      bakeGeo(new THREE.SphereGeometry(0.058, 14, 10), 0, -0.42, 0),
    ]),
  },
  {
    name: 'RightLeg',
    translation: [0, -0.42, 0],
    parent: 'RightUpLeg',
    mat: 1,
    geo: mergeGeos([
      bakeGeo(new THREE.CylinderGeometry(0.055, 0.044, 0.42, 16), 0, -0.21, 0),
      bakeGeo(new THREE.BoxGeometry(0.1, 0.07, 0.22), 0, -0.43, 0.04),
    ]),
  },
];

// Pack binary buffer + glTF JSON into a .glb file
const bufferViews = [];
const accessors = [];
const meshes = [];
const nodes = [];
const binChunks = [];
let byteOffset = 0;

function addAttr(floatArr) {
  const buf = Buffer.from(floatArr.buffer, floatArr.byteOffset, floatArr.byteLength);
  const viewIdx = bufferViews.length;
  bufferViews.push({
    buffer: 0,
    byteOffset,
    byteLength: buf.byteLength,
    target: 34962, // ARRAY_BUFFER
  });
  binChunks.push(buf);
  byteOffset += buf.byteLength;

  const count = floatArr.length / 3;
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < count; i++) {
    for (let c = 0; c < 3; c++) {
      const v = floatArr[i * 3 + c];
      if (v < min[c]) min[c] = v;
      if (v > max[c]) max[c] = v;
    }
  }
  const accIdx = accessors.length;
  accessors.push({
    bufferView: viewIdx,
    byteOffset: 0,
    componentType: 5126, // FLOAT
    count,
    type: 'VEC3',
    min,
    max,
  });
  return accIdx;
}

const nameToIdx = new Map();
PARTS.forEach((p, idx) => nameToIdx.set(p.name, idx));

PARTS.forEach((p, idx) => {
  const posAcc = addAttr(p.geo.attributes.position.array);
  const normAcc = addAttr(p.geo.attributes.normal.array);
  meshes.push({
    name: `${p.name}Mesh`,
    primitives: [
      {
        attributes: { POSITION: posAcc, NORMAL: normAcc },
        material: p.mat,
      },
    ],
  });
  nodes.push({
    name: p.name,
    mesh: idx,
    translation: p.translation,
    children: [],
  });
});

const rootNodes = [];
PARTS.forEach((p, idx) => {
  if (p.parent === null) {
    rootNodes.push(idx);
  } else {
    const parentIdx = nameToIdx.get(p.parent);
    nodes[parentIdx].children.push(idx);
  }
});
nodes.forEach((n) => {
  if (n.children.length === 0) delete n.children;
});

const gltf = {
  asset: { version: '2.0', generator: 'Antigravity-GLB-Builder' },
  scene: 0,
  scenes: [{ name: 'CharacterScene', nodes: rootNodes }],
  nodes,
  meshes,
  materials: MATERIALS,
  accessors,
  bufferViews,
  buffers: [{ byteLength: byteOffset }],
};

const jsonStr = JSON.stringify(gltf);
const jsonPad = (4 - (Buffer.byteLength(jsonStr) % 4)) % 4;
const jsonBuf = Buffer.concat([Buffer.from(jsonStr), Buffer.alloc(jsonPad, 0x20)]);
const binRaw = Buffer.concat(binChunks);
const binPad = (4 - (binRaw.length % 4)) % 4;
const binBuf = Buffer.concat([binRaw, Buffer.alloc(binPad, 0x00)]);

const totalLen = 12 + 8 + jsonBuf.length + 8 + binBuf.length;
const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0); // 'glTF'
header.writeUInt32LE(2, 4); // version 2
header.writeUInt32LE(totalLen, 8);

const jsonChunkHeader = Buffer.alloc(8);
jsonChunkHeader.writeUInt32LE(jsonBuf.length, 0);
jsonChunkHeader.writeUInt32LE(0x4e4f534a, 4); // 'JSON'

const binChunkHeader = Buffer.alloc(8);
binChunkHeader.writeUInt32LE(binBuf.length, 0);
binChunkHeader.writeUInt32LE(0x004e4942, 4); // 'BIN\0'

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, Buffer.concat([header, jsonChunkHeader, jsonBuf, binChunkHeader, binBuf]));
console.log('Generated GLB:', OUT_PATH, `(${(totalLen / 1024).toFixed(1)} KB)`);
