import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import './style.css';

const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.8, 7);
camera.lookAt(0, 1, 0);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const sun = new THREE.DirectionalLight(0xfffbe6, 2.5);
sun.position.set(8, 15, 8);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
sun.shadow.camera.left = -20; sun.shadow.camera.right = 20;
sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -20;
sun.shadow.camera.far = 60;
scene.add(sun);
scene.add(new THREE.DirectionalLight(0xaaccff, 0.4).position.set(-5, 5, -5));

function makeBlock(x, y, z, color, w = 1, h = 1, d = 1) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color }));
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
  scene.add(m); return m;
}

const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 40), new THREE.MeshLambertMaterial({ color: 0x5aaa3c }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

makeBlock(0, -0.2, -6, 0x8B6914, 80, 0.7, 2);
makeBlock(0, 0.3, -6, 0x5aaa3c, 80, 0.3, 2);

function makeTree(x, z) {
  makeBlock(x, 1.2, z, 0x8B5E3C, 0.5, 2.4, 0.5);
  makeBlock(x, 2.8, z, 0x2d7a2d, 2, 1.8, 1.8);
  makeBlock(x, 3.8, z, 0x256325, 1.4, 1.2, 1.4);
}
makeTree(-8, -5); makeTree(-5.5, -5.5); makeTree(6, -5); makeTree(9, -5.5);

function makeCloud(x, y, z) {
  makeBlock(x, y, z, 0xdde8ee, 2.5, 0.7, 0.7);
  makeBlock(x + 0.8, y + 0.35, z, 0xe8f0f4, 1.8, 0.7, 0.7);
  makeBlock(x - 0.6, y + 0.25, z, 0xe8f0f4, 1.4, 0.7, 0.7);
}
makeCloud(-6, 5.5, -4); makeCloud(4, 6.2, -4); makeCloud(10, 5.0, -4);

function makeTNT() {
  const canvasTex = document.createElement('canvas');
  canvasTex.width = 128; canvasTex.height = 128;
  const ctx = canvasTex.getContext('2d');
  ctx.fillStyle = '#cc2200'; ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#cc2200' : '#991a00';
    ctx.fillRect(i * 16, 0, 16, 128);
  }
  ctx.fillStyle = '#dddddd'; ctx.fillRect(0, 46, 128, 36);
  ctx.fillStyle = '#111'; ctx.font = 'bold 26px monospace'; ctx.fillText('TNT', 28, 74);
  const mat = new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(canvasTex) });
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), mat);
  box.castShadow = true; return box;
}

function makeLevier() {
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.35), new THREE.MeshLambertMaterial({ color: 0x999999 }));
  base.castShadow = true; group.add(base);
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.75, 0.13), new THREE.MeshLambertMaterial({ color: 0x8B6014 }));
  handle.position.set(0, 0.4, 0); handle.rotation.z = -0.5;
  handle.name = 'handle'; handle.castShadow = true; group.add(handle);
  return group;
}

function createExplosion(pos) {
  const group = new THREE.Group(); group.position.copy(pos);
  const cols = [0xff5500, 0xff8800, 0xffcc00, 0x666666, 0x333333, 0xff3300];
  for (let i = 0; i < 80; i++) {
    const s = Math.random() * 0.5 + 0.08;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(s, s, s),
      new THREE.MeshLambertMaterial({ color: cols[Math.floor(Math.random() * cols.length)], transparent: true, opacity: 1 })
    );
    mesh.position.set((Math.random() - 0.5) * 3, Math.random() * 2, (Math.random() - 0.5) * 1.5);
    mesh.userData.vel = new THREE.Vector3((Math.random() - 0.5) * 0.2, Math.random() * 0.15 + 0.07, (Math.random() - 0.5) * 0.08);
    mesh.castShadow = true; group.add(mesh);
  }
  scene.add(group); return group;
}

const styleEl = document.createElement('style');
styleEl.textContent = `
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
  @keyframes shake { 0%,100%{transform:translate(0,0)} 20%{transform:translate(-10px,4px)} 40%{transform:translate(10px,-4px)} 60%{transform:translate(-8px,3px)} 80%{transform:translate(8px,-3px)} }
  #ui { position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; font-family:'Courier New',monospace; z-index:10 }
  #dialog { position:absolute; bottom:55px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,.88); border:3px solid #666; border-radius:5px; color:#fff; padding:18px 30px; font-size:20px; max-width:640px; text-align:center; display:none; pointer-events:auto; cursor:pointer; white-space:pre-line }
  #click-hint { position:absolute; bottom:18px; left:50%; transform:translateX(-50%); color:#aaa; font-size:13px; display:none; animation:blink 1s infinite }
  #title { position:absolute; top:22px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,.68); color:#ffcc00; padding:9px 22px; font-size:17px; border-radius:4px; display:none }
  #start-screen { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,.6); display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:50; cursor:pointer; pointer-events:auto }
  #start-screen h1 { color:#ffcc00; font-family:'Courier New'; font-size:36px; margin-bottom:20px }
  #start-screen p { color:#fff; font-family:'Courier New'; font-size:18px; animation:blink 1.2s infinite }
`;
document.head.appendChild(styleEl);

const ui = document.createElement('div'); ui.id = 'ui'; document.body.appendChild(ui);
const dialog = document.createElement('div'); dialog.id = 'dialog';
const clickHint = document.createElement('div'); clickHint.id = 'click-hint'; clickHint.textContent = '[ Cliquer pour continuer ]';
const titleEl = document.createElement('div'); titleEl.id = 'title';
ui.appendChild(dialog); ui.appendChild(clickHint); ui.appendChild(titleEl);

const startScreen = document.createElement('div'); startScreen.id = 'start-screen';
startScreen.innerHTML = '<h1>🐱 Portfolio Hasinjo</h1><p>[ Cliquer pour commencer ]</p>';
document.body.appendChild(startScreen);

function showDialog(txt, withClick = false) {
  dialog.textContent = txt; dialog.style.display = 'block';
  clickHint.style.display = withClick ? 'block' : 'none';
  dialog.style.pointerEvents = withClick ? 'auto' : 'none';
}
function hideDialog() { dialog.style.display = 'none'; clickHint.style.display = 'none'; }
function showTitle(txt, dur = 2500) {
  titleEl.textContent = txt; titleEl.style.display = 'block';
  if (dur > 0) setTimeout(() => titleEl.style.display = 'none', dur);
}

let phase = 'idle';
let waitClickCb = null;
function onClickContinue(cb) { waitClickCb = cb; }
dialog.addEventListener('click', () => {
  if (waitClickCb) { const cb = waitClickCb; waitClickCb = null; cb(); }
});

const loader = new GLTFLoader();
const clock = new THREE.Clock();

let steve = null, steveGLTF = null, steveMixer = null, currentAction = null;
let catObj = null, catNodes = {};
let leverObj = null, tntObj = null, explosionGroup = null;

let leftArmBone = null;
const baseArmRot = new THREE.Quaternion();
const upArmRot = new THREE.Quaternion();
upArmRot.setFromEuler(new THREE.Euler(-Math.PI * 0.25, 0, Math.PI * 2));
let waveActive = false, waveT = 0;

let steveWalkT = 0, steveWalkOn = false, steveRunOn = false;
let catAnimT = 0, catState = 'sitting';
let tntFallV = 0, explodeT = 0;

let stevePivot = null;
// ── CORRECTION : offset fixe calculé une seule fois après rendu ──
let steveOffsetY = 0;
let catOffsetY   = 0;
let offsetsReady = false;

function switchAction(newAction, fade = 0.3) {
  if (currentAction) currentAction.fadeOut(fade);
  newAction.reset().fadeIn(fade).play();
  currentAction = newAction;
}

// ─── Chargement Steve ────────────────────────────────────────
loader.load('/models/scene.gltf', (gltf) => {
  steve = gltf.scene;
  steveGLTF = gltf;
  steveMixer = new THREE.AnimationMixer(steve);

  steve.traverse(n => {
    n.castShadow = true; n.receiveShadow = true;
    if (n.isBone && n.name === 'Left_Arm_03') {
      leftArmBone = n;
      baseArmRot.copy(n.quaternion);
    }
  });

  stevePivot = new THREE.Group();
  scene.add(stevePivot);
  stevePivot.add(steve);

  // ── NE PAS reset rotation/scale — garder les matrices internes du modèle ──
  // On repositionne seulement la position locale
  steve.position.set(0, 0, 0);

  stevePivot.position.set(14, 0, 0);
  stevePivot.visible = false;

  checkReady();
}, undefined, console.error);

// ─── Chargement Chat ─────────────────────────────────────────
loader.load('/models/cat.gltf', (gltf) => {
  catObj = gltf.scene;
  catObj.scale.set(2.2, 2.2, 2.2);
  catObj.traverse(n => {
    n.castShadow = true; n.receiveShadow = true;
    catNodes[n.name] = n;
  });

  
  catObj.rotation.y = Math.PI;
  catObj.position.set(0, 0, 0);
  scene.add(catObj);
  setCatSitting();

  leverObj = makeLevier();
  leverObj.position.set(2.5, 0.18, 0);
  leverObj.visible = false;
  scene.add(leverObj);

  tntObj = makeTNT();
  tntObj.position.set(3.2, 9, 0);
  tntObj.visible = false;
  scene.add(tntObj);

  checkReady();
}, undefined, console.error);

let loadedCount = 0;
function checkReady() {
  loadedCount++;
  if (loadedCount >= 2) {
    // ── Calculer les offsets Y après 2 frames de rendu (GPU a eu le temps) ──
    requestAnimationFrame(() => requestAnimationFrame(() => {
      // Steve
      if (stevePivot && steve) {
        stevePivot.rotation.y = 0; // pose neutre pour mesure propre
        const sBox = new THREE.Box3().setFromObject(stevePivot);
        steveOffsetY = sBox.min.y < 0 ? -sBox.min.y : 0;
        console.log('steveOffsetY:', steveOffsetY, '| height:', sBox.max.y - sBox.min.y);
      }
      initScene();
    }));
  }
}

// ─── Helpers sol ─────────────────────────────────────────────
// stevePivot.position.y doit toujours être steveOffsetY (+ bob éventuel)
// catObj.position.y doit toujours être catOffsetY (+ bob éventuel)

function setCatSitting() {
  if (catNodes['frontLegL']) catNodes['frontLegL'].rotation.x = 0.5;
  if (catNodes['frontLegR']) catNodes['frontLegR'].rotation.x = 0.5;
  if (catNodes['backLegL'])  catNodes['backLegL'].rotation.x  = 0.7;
  if (catNodes['backLegR'])  catNodes['backLegR'].rotation.x  = 0.7;
  if (catNodes['tail1'])     catNodes['tail1'].rotation.x     = -0.5;
  if (catNodes['tail2'])     catNodes['tail2'].rotation.x     = -0.2;
}

function resetCatLegs() {
  ['frontLegL', 'frontLegR', 'backLegL', 'backLegR'].forEach(n => {
    if (catNodes[n]) catNodes[n].rotation.x = 0;
  });
  if (catNodes['tail1']) catNodes['tail1'].rotation.x = 0;
}

function updateCatAnim(delta) {
  if (!catObj) return;
  catAnimT += delta;
  if (catState === 'walking' || catState === 'running') {
    const spd = catState === 'running' ? 10 : 7;
    const amp = catState === 'running' ? 0.55 : 0.45;
    if (catNodes['frontLegL']) catNodes['frontLegL'].rotation.x =  Math.sin(catAnimT * spd) * amp;
    if (catNodes['frontLegR']) catNodes['frontLegR'].rotation.x = -Math.sin(catAnimT * spd) * amp;
    if (catNodes['backLegL'])  catNodes['backLegL'].rotation.x  = -Math.sin(catAnimT * spd) * amp;
    if (catNodes['backLegR'])  catNodes['backLegR'].rotation.x  =  Math.sin(catAnimT * spd) * amp;
    if (catNodes['tail1'])     catNodes['tail1'].rotation.x = Math.sin(catAnimT * 4) * 0.25;
    // Bob : jamais en dessous de catOffsetY
    catObj.position.y = catOffsetY + Math.abs(Math.sin(catAnimT * spd)) * 0.04;
  } else {
    if (catNodes['tail1']) catNodes['tail1'].rotation.x = -0.5 + Math.sin(catAnimT * 1.5) * 0.08;
    if (catNodes['tail2']) catNodes['tail2'].rotation.x = -0.2 + Math.sin(catAnimT * 2) * 0.1;
    catObj.position.y = catOffsetY; // exactement au sol
  }
}

// ─── Steve walk ──────────────────────────────────────────────
function startSteveWalk(running = false) {
  steveWalkOn = !running;
  steveRunOn  =  running;
  steveWalkT  = 0;
  // ── CORRECTION : rotation.y pour le profil (pas rotation.x) ──
  stevePivot.rotation.y = 3 * Math.PI / 2 ; // profil gauche → marche D→G

  if (steveGLTF && steveMixer) {
    const clip = THREE.AnimationClip.findByName(steveGLTF.animations, 'Skeleton|Walking');
    if (clip) switchAction(steveMixer.clipAction(clip));
  }
}

function stopSteveWalk() {
  steveWalkOn = false;
  steveRunOn  = false;
  if (steveGLTF && steveMixer) {
    const clip = THREE.AnimationClip.findByName(steveGLTF.animations, 'Skeleton|Idle');
    if (clip) switchAction(steveMixer.clipAction(clip));
  }
}

function updateSteveWalk(delta) {
  if (!stevePivot || (!steveWalkOn && !steveRunOn)) return;
  steveWalkT += delta;
  // ── Bob léger : 1 bosse par pas, amplitude 3cm max ──
  const freq = steveRunOn ? 10 : 8;
  stevePivot.position.y = steveOffsetY + Math.abs(Math.sin(steveWalkT * freq * 0.5)) * 0.03;
}

// ─── CINÉMATIQUE ─────────────────────────────────────────────
function initScene() {
  startScreen.addEventListener('click', () => {
    startScreen.style.display = 'none';
    scene1();
  }, { once: true });
}

// ── Scène 1 : Chat assis face caméra ─────────────────────────
function scene1() {
  phase = 'scene1';
  catObj.position.set(0, catOffsetY, 0);
  catObj.rotation.y = Math.PI; // face caméra
  catState = 'sitting';
  setCatSitting();
  showDialog('\nCliquez pour commencer l\'aventure !', true);
  onClickContinue(() => { hideDialog(); scene2(); });
}

// ── Scène 2 : Chat marche vers la droite (+X) ────────────────
function scene2() {
  phase = 'cat_walking';
  catObj.position.set(-5, catOffsetY, 0);
  catObj.rotation.y = -Math.PI / 2; // face vers +X (droite)
  catState = 'walking';
  resetCatLegs();
 }

// ── Scène 3 : Steve arrive de la droite ──────────────────────
function scene3() {
  phase = 'steve_arrives';
  stevePivot.visible = true;
  stevePivot.position.set(13, steveOffsetY, 0);
  startSteveWalk(false); // rotation.y = PI*0.5 appliqué ici
 }

// ── Scène 4 : Face à face + salut ────────────────────────────
function scene4() {
  phase = 'greeting';
  stopSteveWalk(); // repasse en Idle → Steve debout

  // ── CORRECTION PRINCIPALE : pieds au sol via steveOffsetY ──
  stevePivot.position.set(1.2, steveOffsetY, 0);

  // ── Steve face caméra, légèrement tourné vers le chat (à gauche) ──
  // Math.PI = face caméra exactement
  // + 0.3 rad = légèrement tourné vers la gauche (vers le chat)
  stevePivot.rotation.y = -Math.PI * 2;

  // Chat face à Steve (légèrement vers la droite)
  catObj.position.set(-0.8, catOffsetY, 0);
  catObj.rotation.y = Math.PI;
  catState = 'sitting';
  setCatSitting();

  waveActive = true;
  waveT = 0;

  setTimeout(() => {
    showDialog('Bonjour ! Je m\'appelle Hasinjo !', true);
    onClickContinue(() => {
      hideDialog();
      waveActive = false;
      if (leftArmBone) leftArmBone.quaternion.copy(baseArmRot);
      scene5();
    });
  }, 1000);
}

// ── Scène 5 : Levier ─────────────────────────────────────────
function scene5() {
  phase = 'levier';
  leverObj.visible = true;
  stevePivot.rotation.y = Math.PI * 2; // face caméra
  stevePivot.position.y = steveOffsetY;
  
  setTimeout(() => {
    const handle = leverObj.getObjectByName('handle');
    if (handle) {
      let r = handle.rotation.z;
      const animLever = () => {
        r += 0.06; handle.rotation.z = r;
        if (r < 0.6) requestAnimationFrame(animLever);
        else {
          tntObj.visible = true;
          tntObj.position.set(3.5, 9, 0);
          tntFallV = 0;
          phase = 'tnt_falling';
          showTitle('💥 TNT !', 0);
        }
      };
      animLever();
    }
  }, 800);
}

// ── Scène 6 : Fuite ──────────────────────────────────────────
function scene6() {
  phase = 'running';
  steveWalkT = 0;

  // Chat fuit vers -X (gauche)
  catObj.rotation.y = Math.PI / 2; // face vers -X
  catState = 'running';
  resetCatLegs();

  // Steve fuit vers -X, profil gauche
  stevePivot.rotation.y = Math.PI * 3 / 2; // profil gauche
  steveRunOn = true;
  steveWalkOn = false;
  steveWalkT = 0;

  if (steveGLTF && steveMixer) {
    const clip = THREE.AnimationClip.findByName(steveGLTF.animations, 'Skeleton|Walking');
    if (clip) switchAction(steveMixer.clipAction(clip));
  }

  showTitle(' FUYEZ !!!', 0);
}

// ── Scène 7 : Explosion ───────────────────────────────────────
function scene7() {
  phase = 'exploding'; explodeT = 0;
  if (tntObj)   tntObj.visible   = false;
  if (leverObj) leverObj.visible = false;

  explosionGroup = createExplosion(new THREE.Vector3(3.5, 0.5, 0));

  // Shake écran
  renderer.domElement.style.animation = 'shake .4s';
  setTimeout(() => renderer.domElement.style.animation = '', 400);

  // Flash blanc qui couvre tout
  const flash = document.createElement('div');
  flash.style.cssText = `
    position:fixed;top:0;left:0;width:100%;height:100%;
    background:#fff;z-index:9999;pointer-events:none;
    opacity:1;transition:none;
  `;
  document.body.appendChild(flash);

  // Après 600ms → navigation directe vers le portfolio
  setTimeout(() => {
    window.location.href = '/portfolio.html';
  }, 60);
}

// ─── Loop ────────────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.03);

  if (steveMixer) steveMixer.update(delta);

  if (waveActive && leftArmBone) {
    waveT += delta;
    const lift = Math.min(waveT / 0.45, 1);
    const wave = Math.sin(waveT * 7) * 0.42;
    const q  = new THREE.Quaternion(); q.slerpQuaternions(baseArmRot, upArmRot, lift);
    const qe = new THREE.Quaternion(); qe.setFromEuler(new THREE.Euler(0, 0, wave * lift));
    q.multiply(qe); leftArmBone.quaternion.copy(q);
  }

  updateSteveWalk(delta);
  updateCatAnim(delta);

  // Chat marche vers +X
  if (phase === 'cat_walking' && catObj) {
    catObj.position.x += delta * 2.2;
    if (catObj.position.x >= -0.8) {
      catObj.position.x = -0.8;
      catObj.position.y = catOffsetY;
      catState = 'sitting'; setCatSitting();
      catObj.rotation.y = Math.PI;
      scene3();
    }
  }

  // Steve arrive vers -X
  if (phase === 'steve_arrives' && stevePivot) {
    stevePivot.position.x -= delta * 2;
    if (stevePivot.position.x <= 1.2) {
      stevePivot.position.x = 1.2;
      stopSteveWalk();
      // ── Pieds au sol immédiatement après stopSteveWalk ──
      stevePivot.position.y = steveOffsetY;
      setTimeout(scene4, 300);
    }
  }

  // TNT tombe
  if (phase === 'tnt_falling' && tntObj) {
    tntFallV += delta * 12;
    tntObj.position.y -= tntFallV * delta;
    tntObj.rotation.z += delta * 1.5;
    if (tntObj.position.y <= 0.45) {
      tntObj.position.y = 0.45; tntObj.rotation.z = 0;
      phase = 'tnt_landed';
      setTimeout(scene6, 500);
    }
  }

  // Fuite
  if (phase === 'running') {
    if (catObj)     catObj.position.x     -= delta * 3.5;
    if (stevePivot) stevePivot.position.x -= delta * 3.0;
    if (catObj      && catObj.position.x     < -10) catObj.visible      = false;
    if (stevePivot  && stevePivot.position.x < -10) stevePivot.visible  = false;
    if ((!catObj || !catObj.visible) && (!stevePivot || !stevePivot.visible)) {
      phase = 'pre_explode';
      setTimeout(scene7, 200);
    }
  }

  // Explosion
  if (phase === 'exploding' && explosionGroup) {
    explodeT += delta;
    explosionGroup.children.forEach(p => {
      p.position.addScaledVector(p.userData.vel, 1);
      p.userData.vel.y -= delta * 5;
      p.material.opacity = Math.max(0, 1 - explodeT / 2.2);
      p.rotation.x += delta * 4; p.rotation.z += delta * 3;
    });
    if (explodeT > 2.2) { scene.remove(explosionGroup); explosionGroup = null; }
  }

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── 📱 RESPONSIVE + OPTIMISATION MOBILE ─────────────────────

// Détection mobile simple
function isMobile() {
  return window.innerWidth < 768;
}

// Appliquer réglages dynamiques
function applyResponsiveSettings() {

  if (isMobile()) {
    // 🎯 MOBILE OPTIMISATION

    // Réduire la qualité rendu → moins de lag
    renderer.setPixelRatio(1);

    // Camera plus proche → meilleur rendu sur petit écran
    camera.fov = 70;
    camera.position.set(0, 1.6, 9);

    // Réduire ombres lourdes
    renderer.shadowMap.enabled = false;

    // Optionnel : réduire intensité lumière (moins de calcul)
    sun.intensity = 2;

  } else {
    // 💻 DESKTOP (config normale)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.fov = 55;
    camera.position.set(0, 1.8, 7);

    renderer.shadowMap.enabled = true;
    sun.intensity = 2.5;
  }

  camera.updateProjectionMatrix();
}

// Appliquer au chargement
applyResponsiveSettings();

// Réappliquer au resize
window.addEventListener('resize', () => {
  applyResponsiveSettings();
});