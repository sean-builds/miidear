import * as THREE from 'three';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js';
import { OrbitControls } from './vendor/OrbitControls.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const $ = (id) => document.getElementById(id);
const viewport = $('viewport');
const canvas = $('canvas');
const range = $('progress');
const loading = $('loading');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const journey = document.querySelector('.journey');
const stage = document.querySelector('.stage');
let renderer, scene, camera, orbit, root, mixer, action;
let opening = reducedMotion.matches ? 1 : 0;
let playing = false, inspecting = false, backView = false;
let playStart = 0, playFrom = 0, frame = 0, lastStep = -1;
let studyView = 'full';
let detailTarget = null;
const clamp = (v) => Math.max(0, Math.min(1, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

function scrollProgress() {
  const top = journey.getBoundingClientRect().top + scrollY - document.querySelector('.masthead').offsetHeight;
  return clamp((scrollY - top) / Math.max(1, journey.offsetHeight - stage.offsetHeight));
}

function stopPlaying() {
  playing = false;
  $('play').textContent = 'Play';
  $('play').setAttribute('aria-pressed', 'false');
}

function moveTo(value, animate = false) {
  stopPlaying();
  if (reducedMotion.matches) { opening = value; requestRender(); return; }
  const top = journey.getBoundingClientRect().top + scrollY - document.querySelector('.masthead').offsetHeight;
  scrollTo({ top: top + value * (journey.offsetHeight - stage.offsetHeight),
    behavior: animate ? 'smooth' : 'instant' });
  opening = value;
  requestRender();
}

function fitCamera() {
  if (!camera || !root || inspecting) return;
  if (studyView !== 'full' && detailTarget) {
    const bounds = new THREE.Box3().setFromObject(detailTarget);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const height = Math.max(size.y, size.x / camera.aspect) * 1.24;
    const distance = height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.position.set(center.x + distance * .16, center.y + distance * .10, center.z + (backView ? -1 : 1) * distance);
    orbit.target.copy(center);
    camera.lookAt(center);
    orbit.update();
    return;
  }
  const spread = smooth(0, .62, opening);
  const lift = smooth(.62, 1, opening);
  const height = Math.max(2.16 + 1.85 * lift, (2.2 + 2.05 * spread) / camera.aspect);
  const distance = height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  const target = new THREE.Vector3(0, .90 * lift, 0);
  // A gentle three-quarter view reveals the folds at presentation scale.
  camera.position.set((backView ? -1 : 1) * distance * .10 * spread,
    target.y + distance * .085 * spread, (backView ? -1 : 1) * distance);
  orbit.target.copy(target);
  camera.lookAt(target);
  orbit.update();
}

function resize() {
  if (!renderer) return;
  const { width, height } = viewport.getBoundingClientRect();
  if (width < 1 || height < 1) return;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  fitCamera();
  requestRender();
}

function updateLabels() {
  if (studyView !== 'full') {
    $('stepNumber').textContent = studyView === 'print' ? 'DETAIL / 01' : 'DETAIL / 02';
    $('stepText').textContent = studyView === 'print' ? 'Cotton paper. Stamped gold.' : 'The cut-paper monogram crest.';
    return;
  }
  range.value = String(Math.round(opening * 100));
  range.setAttribute('aria-valuetext', `${Math.round(opening * 100)} percent open`);
  const step = opening < .08 ? 0 : opening < .65 ? 1 : 2;
  if (step !== lastStep) {
    $('stepNumber').textContent = `0${step + 1} / 03`;
    $('stepText').textContent = ['The invitation, closed.', 'The landscape unfolds.', 'The printed card is revealed.'][step];
    lastStep = step;
  }
}

function render(now) {
  frame = 0;
  if (!renderer || !root) return;
  if (playing) {
    opening = clamp(playFrom + (now - playStart) / 6500);
    if (!reducedMotion.matches) {
      const top = journey.getBoundingClientRect().top + scrollY - document.querySelector('.masthead').offsetHeight;
      scrollTo({ top: top + opening * (journey.offsetHeight - stage.offsetHeight), behavior: 'instant' });
    }
    if (opening >= 1) stopPlaying();
  }
  // Animation is embedded in the GLB, so downloads and this viewer use the same rig.
  action.paused = false;
  action.enabled = true;
  mixer.setTime((studyView === 'full' ? opening : studyView === 'print' ? 1 : 0) * action.getClip().duration);
  root.updateMatrixWorld(true);
  fitCamera();
  // Keep the actual photograph the user selected as the closed presentation.
  // Switch to articulated geometry only when it opens or is inspected.
  const photoClosed = studyView === 'full' && opening < .001 && !inspecting && !backView;
  viewport.classList.toggle('photo-closed', photoClosed);
  if (photoClosed) {
    const h = viewport.clientHeight * 1.8 / 2.16;
    const w = h * 4096 / 3688;
    const available = viewport.clientWidth * 2 / 2.2;
    $('fallback').style.width = `${Math.min(w, available)}px`;
  }
  renderer.render(scene, camera);
  updateLabels();
  if (playing) requestRender();
}

function requestRender() {
  if (!frame) frame = requestAnimationFrame(render);
}

function showFailure(error) {
  console.error('Invitation preview failed:', error);
  loading.hidden = false;
  loading.textContent = 'The 3D preview could not load. The photograph and model download are still available.';
  canvas.classList.remove('ready');
  viewport.classList.remove('loaded');
    document.querySelectorAll('.controls button, .study-views button, #inspect, #progress').forEach(el => { el.disabled = true; });
  stopPlaying();
}

async function init() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = .85;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    scene.environment = pmrem.fromScene(room, .04).texture;
    scene.environmentIntensity = .8;
    room.dispose();
    pmrem.dispose();
    camera = new THREE.PerspectiveCamera(28, 1, .05, 100);
    orbit = new OrbitControls(camera, canvas);
    orbit.enabled = false;
    orbit.enablePan = true;
    orbit.enableDamping = false;
    orbit.minDistance = .35;
    orbit.maxDistance = 20;
    orbit.addEventListener('change', requestRender);
    scene.add(new THREE.HemisphereLight(0xfffcf5, 0xc3c0b6, .75));
    const key = new THREE.DirectionalLight(0xfffaf2, 1.25);
    key.position.set(-3, 5, 9);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: .1, far: 20 });
    key.shadow.bias = -.00015;
    key.shadow.normalBias = .001;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xfffaf2, 1.25);
    fill.position.set(0, 4, -9);
    scene.add(fill);
    // Keep shadows between paper layers; a nearby wall made the opening gates
    // throw oversized, hard silhouettes across the presentation background.
    const mobileEdition = matchMedia('(max-width: 700px), (pointer: coarse)').matches;
    const gltf = await new GLTFLoader().loadAsync(mobileEdition ? './invitation-mobile.glb?v=11' : './invitation.glb?v=11', event => {
      if (event.total) loading.textContent = `Preparing your invitation… ${Math.round(event.loaded / event.total * 100)}%`;
    });
    root = gltf.scene;
    root.scale.setScalar(10);
    root.traverse(obj => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const mat of mats) if (mat.map) {
          mat.toneMapped = false;
          mat.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
        }
      }
    });
    // A separate, masked reflection adds glints without relighting the photo.
    // Additive blending leaves the original print visible even in dark reflections.
    const foilLoader = new THREE.TextureLoader();
    const foilMasks = await Promise.all(['insert','crest'].map(name =>
      foilLoader.loadAsync(`./textures/${name}-foil-mask.png`)));
    const foilMaterials = foilMasks.map((mask, index) => {
      mask.flipY = false;
      mask.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return new THREE.MeshPhysicalMaterial({
        name: 'Subtle angle-dependent foil reflection',
        color: 0xd8c39a, metalness: 1, roughness: index === 1 ? .42 : .32,
        alphaMap: mask, transparent: true, opacity: index === 1 ? .09 : .18,
        blending: THREE.AdditiveBlending, depthWrite: false,
        polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
        envMapIntensity: index === 1 ? .65 : .85, toneMapped: false,
      });
    });
    const foilSurfaces = [];
    root.traverse(obj => {
      if (!obj.isMesh || Array.isArray(obj.material)) return;
      const name = obj.material.name;
      const index = name === 'Photographed cotton paper and original foil' ? 0
        : name === 'Original photographed monogram crest' ? 1 : -1;
      if (index >= 0) foilSurfaces.push([obj, index]);
    });
    for (const [surface, index] of foilSurfaces) {
      const reflection = new THREE.Mesh(surface.geometry, foilMaterials[index]);
      reflection.name = 'foil-reflection';
      reflection.renderOrder = 1;
      surface.add(reflection);
    }
    scene.add(root);
    mixer = new THREE.AnimationMixer(root);
    if (!gltf.animations.length) throw new Error('Missing invitation animation');
    action = mixer.clipAction(gltf.animations[0]);
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.play();
    loading.hidden = true;
    canvas.classList.add('ready');
    viewport.classList.add('loaded');
    document.querySelectorAll('.controls button, .study-views button, #inspect, #progress').forEach(el => { el.disabled = false; });
    if (reducedMotion.matches) $('play').hidden = true;
    opening = reducedMotion.matches ? 1 : scrollProgress();
    new ResizeObserver(resize).observe(viewport);
    resize();
  } catch (error) { showFailure(error); }
}

addEventListener('scroll', () => {
  if (root && !reducedMotion.matches && studyView === 'full') { opening = scrollProgress(); requestRender(); }
}, { passive: true });
for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
  addEventListener(event, (event) => {
    if (!event.target.closest?.('#play')) stopPlaying();
  }, { passive: true });
}
range.addEventListener('input', () => moveTo(Number(range.value) / 100));
$('closed').addEventListener('click', () => moveTo(0, true));
$('opened').addEventListener('click', () => moveTo(1, true));
$('play').addEventListener('click', () => {
  if (playing) { stopPlaying(); return; }
  if (opening > .99) moveTo(0);
  playing = true;
  playFrom = opening;
  playStart = performance.now();
  $('play').textContent = 'Pause';
  $('play').setAttribute('aria-pressed', 'true');
  requestRender();
});
$('inspect').addEventListener('click', () => {
  inspecting = !inspecting;
  orbit.enabled = inspecting;
  viewport.classList.toggle('inspecting', inspecting);
  $('inspect').textContent = inspecting ? 'Finish inspecting' : 'Inspect in 3D';
  $('inspect').setAttribute('aria-pressed', String(inspecting));
  $('hint').textContent = inspecting ? 'Drag to rotate · Pinch to zoom' : 'Scroll to unfold ↓';
  fitCamera();
  requestRender();
});
$('reverse').addEventListener('click', () => {
  backView = !backView;
  inspecting = false;
  orbit.enabled = false;
  viewport.classList.remove('inspecting');
  $('inspect').setAttribute('aria-pressed', 'false');
  $('inspect').textContent = 'Inspect in 3D';
  $('reverse').setAttribute('aria-pressed', String(backView));
  $('reverse').textContent = backView ? 'Front view' : 'Back view';
  fitCamera(); requestRender();
});
function setStudyView(view) {
  stopPlaying();
  studyView = view;
  if (view === 'full') opening = reducedMotion.matches ? 1 : 0;
  inspecting = false;
  orbit.enabled = false;
  backView = false;
  document.body.classList.toggle('detail-view', view !== 'full');
  viewport.classList.remove('inspecting');
  $('inspect').setAttribute('aria-pressed', 'false');
  $('inspect').textContent = 'Inspect in 3D';
  $('reverse').setAttribute('aria-pressed', 'false');
  $('reverse').textContent = 'Back view';
  detailTarget = view === 'print' ? root.getObjectByName('printed-insert') : view === 'crest' ? root.getObjectByName('crest') : null;
  root.traverse(obj => {
    if (!obj.isMesh) return;
    let member = false;
    for (let ancestor = obj; ancestor; ancestor = ancestor.parent) if (ancestor === detailTarget) member = true;
    obj.visible = view === 'full' || member;
  });
  for (const [id, value] of [['viewFull','full'],['viewPrint','print'],['viewCrest','crest']]) {
    $(id).setAttribute('aria-pressed', String(view === value));
  }
  $('hint').textContent = view === 'full' ? 'Scroll to unfold ↓' : 'Inspect the original photographed detail';
  scrollTo({ top: journey.getBoundingClientRect().top + scrollY - document.querySelector('.masthead').offsetHeight, behavior: 'instant' });
  lastStep = -1;
  requestRender();
}
$('viewFull').addEventListener('click', () => setStudyView('full'));
$('viewPrint').addEventListener('click', () => setStudyView('print'));
$('viewCrest').addEventListener('click', () => setStudyView('crest'));
function zoom(factor) {
  stopPlaying();
  inspecting = true;
  orbit.enabled = true;
  viewport.classList.add('inspecting');
  $('inspect').setAttribute('aria-pressed', 'true');
  $('inspect').textContent = 'Finish inspecting';
  const direction = camera.position.clone().sub(orbit.target);
  direction.setLength(THREE.MathUtils.clamp(direction.length() * factor, orbit.minDistance, orbit.maxDistance));
  camera.position.copy(orbit.target).add(direction);
  orbit.update();
  requestRender();
}
$('zoomIn').addEventListener('click', () => zoom(.72));
$('zoomOut').addEventListener('click', () => zoom(1 / .72));
reducedMotion.addEventListener('change', () => {
  stopPlaying();
  $('play').hidden = reducedMotion.matches;
  opening = reducedMotion.matches ? 1 : scrollProgress();
  resize();
});
canvas.addEventListener('webglcontextlost', event => {
  event.preventDefault();
  showFailure(new Error('WebGL context lost; reload to retry.'));
});
init();
