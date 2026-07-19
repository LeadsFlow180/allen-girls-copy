/* =====================================================================
   SCREEN HOP 3D - "Inside the Program"  (Allen Girls Adventures / Futuria)
   Three.js neon maze. Orbit-follow camera. Robotic cyberbugs. Question
   stations that reward zappers. Real 3D girl models, height-accurate.
   Single ES module, no build step.
   ===================================================================== */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const byId = (id) => document.getElementById(id);
const show = (el) => el.classList.remove('hidden');
const hide = (el) => el.classList.add('hidden');
const NEON = { cyan:0x36e8ff, purple:0x7a5cff, pink:0xff4fb4, gold:0xffd23f, red:0xff3b5c, green:0x39d99a };
const rand = (a,b) => a + Math.random()*(b-a);

/* ── AGA platform bridge ──────────────────────────────────────────────
   Tells the Allen Girls Adventures site when a question is answered and
   how many gems (coins) were earned, so real store points + parent/
   teacher reports work. Safe no-op when played outside the site. */
let AGA_COINS_EARNED = 0;
function agaPost(msg){
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(Object.assign({ source: "aga-game" }, msg), window.location.origin);
    }
  } catch (e) { /* not embedded — ignore */ }
}
function agaReportAttempt(q, correct, firstTry){
  if (!q) return;
  agaPost({
    type: "attempt",
    skillId: q.sk || q.lessonId || q.mod || "unknown",
    lessonName: q.lessonName || null,
    subject: q.subject || null,
    correct: !!correct,
    firstTry: !!firstTry,
  });
}
function agaReportCoin(){
  AGA_COINS_EARNED += 1;
  agaPost({ type: "coins", total: AGA_COINS_EARNED });
}

/* height-accurate sisters (Natalia tallest -> Maya shortest) */
const CHARS = {
  natalia: { name:'Natalia', glb:'assets/Natalia.glb', h:2.55, color:NEON.purple, speed:6.6 },
  alana:   { name:'Alana',   glb:'assets/Alana.glb',   h:2.25, color:NEON.pink,   speed:6.9 },
  maya:    { name:'Maya',    glb:'assets/Maya.glb',    h:2.00, color:NEON.gold,   speed:7.3 }
};

const CELL = 2.6;

/* difficulty scales with the chosen grade: younger = fewer, slower bugs */
const DIFF = {
  3: { bugMul:0.65, speed:0.80, label:'Grade 3 · gentle' },
  4: { bugMul:0.85, speed:0.95, label:'Grade 4 · steady' },
  5: { bugMul:1.00, speed:1.10, label:'Grade 5 · brisk'  },
  6: { bugMul:1.20, speed:1.25, label:'Grade 6 · fierce' }
};
function diff(){ return DIFF[S && S.grade ? S.grade : 3] || DIFF[3]; }
/* board configs: grid size, wall density, station + bug counts, bonus bits */
/* ---------------------------------------------------------------------------
   FUTURIA CORENET — 8 sectors.
   Each board has its own LAYOUT (maze architecture) and PROP set, so sectors
   feel structurally different, not just recoloured.
     grid     — regular chip blocks in rows (motherboard)
     pillars  — sparse fat pillars, open floor (power supply)
     radial   — concentric rings around a core (CPU)
     fins     — long parallel corridors (cooling vents)
     towers   — tall thin slabs, wide lanes (GPU)
     tunnels  — long straight runs (RAM data tunnel)
     dense    — tight lattice, many walls (SSD security grid)
     chaos    — irregular scatter (glitch core)
--------------------------------------------------------------------------- */
const BOARDS = [
  { name:'Motherboard Maze', layout:'grid', prop:'chips', system:'City Power & Lighting', key:'Power Fragment',
    topic:'motherboard', fact:'The motherboard is the "heart" of the computer — every part plugs into it.',
    radio:'Natalia: "The city map runs through this board. Fix it and the lights come back on."',
    cols:13, rows:13, density:0.13, checks:4, bugs:3, bits:12, accent:NEON.cyan,  accent2:NEON.green,
    palette:[0x39ff5e,0x36e8ff,0x2ec77a,0x7a5cff] },

  { name:'Power Supply Junction', layout:'pillars', prop:'caps', system:'Grid Surge Control', key:'Surge Fragment',
    topic:'power', fact:'The power supply turns wall electricity into power the parts can safely use.',
    radio:'Alana: "Careful — the current in here is unstable. Nothing turns on without this part."',
    cols:13, rows:13, density:0.15, checks:4, bugs:4, bits:13, accent:NEON.gold,  accent2:NEON.red,
    palette:[0xffd23f,0xff8a3a,0xff4f6c,0x36e8ff] },

  { name:'CPU Core', layout:'radial', prop:'core', system:'Central Decision Systems', key:'Logic Fragment',
    topic:'cpu', fact:'The CPU is the "brain" — it does the thinking and math at very high speed.',
    radio:'S.P.A.R.K.: "This is the brain of Futuria. Every decision the city makes passes through here."',
    cols:15, rows:15, density:0.16, checks:4, bugs:4, bits:14, accent:NEON.gold,  accent2:NEON.pink,
    palette:[0xffd23f,0xff8a3a,0x36e8ff,0xff4fb4] },

  { name:'Cooling Vents', layout:'fins', prop:'fans', system:'Overheat Protection', key:'Coolant Fragment',
    topic:'cooling', fact:'Cooling fans move hot air out so the processor does not overheat.',
    radio:'Maya: "It is COOKING in there. Keep moving and do not let them corner you!"',
    cols:15, rows:15, density:0.17, checks:4, bugs:5, bits:14, accent:NEON.cyan,  accent2:NEON.green,
    palette:[0x36e8ff,0x39d99a,0x7a5cff,0x39ff5e] },

  { name:'Graphics Card', layout:'towers', prop:'vram', system:'Holograms & Sky Signs', key:'Vision Fragment',
    topic:'gpu', fact:'The graphics card (GPU) draws every image, video, and 3D scene you see.',
    radio:'Alana: "Every hologram in Futuria is drawn from this board. That is why the signs went strange."',
    cols:15, rows:15, density:0.16, checks:4, bugs:5, bits:15, accent:NEON.green, accent2:NEON.pink,
    palette:[0x39ff5e,0xff4fb4,0x36e8ff,0xffd23f] },

  { name:'Data Tunnel (RAM)', layout:'tunnels', prop:'sticks', system:'Transport & Communication', key:'Signal Fragment',
    topic:'ram', fact:'RAM is fast short-term memory — switch off the power and it forgets everything.',
    radio:'Natalia: "The transit system forgets its routes here. That is why the vehicles went the wrong way."',
    cols:15, rows:15, density:0.17, checks:4, bugs:5, bits:16, accent:NEON.cyan,  accent2:NEON.purple,
    palette:[0x36e8ff,0x7a5cff,0x39d99a,0xffd23f] },

  { name:'Security Grid (SSD)', layout:'dense', prop:'locks', system:'Doors, Shields & Safety', key:'Access Fragment',
    topic:'ssd', fact:'An SSD stores data on chips with no moving parts, so it loads much faster than a hard drive.',
    radio:'S.P.A.R.K.: "Every locked door and shield in the city is stored on this drive. Unlock it carefully."',
    cols:17, rows:15, density:0.18, checks:4, bugs:6, bits:18, accent:NEON.pink,  accent2:NEON.purple,
    palette:[0xff4fb4,0x7a5cff,0x36e8ff,0x39ff5e] },

  { name:'Glitch Core', layout:'chaos', prop:'shards', system:"The Glitcher's Corruption Chamber", key:'Master Key Core',
    topic:'motherboard', fact:'This is where the corruption began. Assemble the Master Recovery Key and shut it down.',
    radio:'S.P.A.R.K.: "She is here. Charge your zappers — you cannot out-run her, you have to out-think her."',
    boss:true,
    cols:23, rows:23, density:0.16, checks:8, bugs:8, bits:22, accent:NEON.red,   accent2:NEON.purple,
    palette:[0xff3b5c,0xb44dff,0xff4fb4,0x7a5cff] }
];

/* ---------- renderer / scene ---------- */
const canvas = byId('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.45;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080d24);
scene.fog = new THREE.FogExp2(0x0a1030, 0.007);

const camera = new THREE.PerspectiveCamera(52, innerWidth/innerHeight, 0.1, 2500);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight), 0.55, 0.6, 0.82);
composer.addPass(bloom);

function resize(){
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w,h); composer.setSize(w,h);
  camera.aspect = w/h; camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

/* lights */
scene.add(new THREE.HemisphereLight(0x8fb4ff, 0x1a2244, 1.05));
const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(6,12,8); scene.add(key);
const rimC = new THREE.PointLight(NEON.cyan, 30, 40); scene.add(rimC);
const rimP = new THREE.PointLight(NEON.pink, 30, 40); scene.add(rimP);

/* draco loader */
const draco = new DRACOLoader();
draco.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/');
const gltfLoader = new GLTFLoader(); gltfLoader.setDRACOLoader(draco);
const glbCache = {};
function loadGLB(path){
  return new Promise((res,rej)=>{
    if (glbCache[path]) { res(glbCache[path].clone(true)); return; }
    gltfLoader.load(path, g=>{ glbCache[path]=g.scene; res(g.scene.clone(true)); }, undefined, rej);
  });
}

/* ---------- audio (procedural) ---------- */
let actx=null, musicTimer=null, musicOn=true, beat=0;
function ensureAudio(){ if(!actx) actx=new (window.AudioContext||window.webkitAudioContext)(); if(actx.state==='suspended') actx.resume(); }
function tone(f,at,d,type,g){ const o=actx.createOscillator(),ga=actx.createGain(); o.type=type||'sine'; o.frequency.setValueAtTime(f,at); ga.gain.setValueAtTime(g||0.08,at); ga.gain.exponentialRampToValueAtTime(0.0008,at+d); o.connect(ga).connect(actx.destination); o.start(at); o.stop(at+d); }
function noise(at,d,g){ const n=Math.floor(actx.sampleRate*d),b=actx.createBuffer(1,n,actx.sampleRate),dt=b.getChannelData(0); for(let i=0;i<n;i++)dt[i]=Math.random()*2-1; const s=actx.createBufferSource(),ga=actx.createGain(),f=actx.createBiquadFilter(); s.buffer=b; f.type='highpass'; f.frequency.value=3000; ga.gain.setValueAtTime(g||0.03,at); ga.gain.exponentialRampToValueAtTime(0.0008,at+d); s.connect(f).connect(ga).connect(actx.destination); s.start(at); }
// arcade soundtrack (merged from the Neon Grid Chase tracks) + Alistair intro narration
const music = new Audio('assets/neon-grid-chase-loop.mp3'); music.loop=true; music.volume=0.45; music.preload='auto';
const narration = new Audio('assets/alistair-intro.mp3'); narration.volume=1.0; narration.preload='auto';
[music,narration].forEach(a=>{ a.setAttribute('playsinline',''); });

/* Higgsfield serves .mp3 as application/octet-stream, which strict browsers
   (Safari especially) refuse to play. Re-fetch each file and hand the element a
   blob tagged audio/mpeg instead. Starts at load so the src is swapped before
   the first tap, keeping play() synchronous inside the user gesture. */
function rehostAudio(el, url){
  fetch(url).then(r=>{ if(!r.ok) throw new Error('http '+r.status); return r.arrayBuffer(); })
    .then(buf=>{ const blob=new Blob([buf],{type:'audio/mpeg'}); const wasPlaying=!el.paused;
      el.src=URL.createObjectURL(blob); el.load(); if(wasPlaying) el.play().catch(()=>{}); })
    .catch(()=>{ /* keep the original src as a fallback */ });
}
const SECTOR_VO=[];   // one Roman voice line per sector, loaded at startup
const GLITCHER_VO={};  // The Glitcher's own lines
['enter','hit1','hit2','defeat','taunt1','taunt2','taunt3','yield','guardian','hover1','hover2','hover3'].forEach(k=>{
  const a=new Audio('assets/vo-glitcher-'+k+'.mp3');
  a.preload='auto'; a.volume=1.0; a.setAttribute('playsinline','');
  GLITCHER_VO[k]=a; rehostAudio(a,'assets/vo-glitcher-'+k+'.mp3');
});
function playGlitcher(k, subtitle){
  if(subtitle){ const el=byId('comms'); if(el){ el.innerHTML='<b style="color:#ff6cc4">THE GLITCHER:</b> '+subtitle;
    el.classList.add('show'); clearTimeout(commsTimer); commsTimer=setTimeout(()=>el.classList.remove('show'), 6000); } }
  if(!musicOn) return;
  const a=GLITCHER_VO[k]; if(!a) return;
  try{ if(a.readyState>0) a.currentTime=0; }catch(e){}
  music.volume=0.14;
  const p2=a.play(); if(p2&&p2.catch) p2.catch(()=>{ music.volume=0.45; });
  a.onended=()=>{ music.volume=0.45; };
}
/* BOSS BATTLE banner — fixes "everything went dark and I didn't know what was happening" */
function showBossBanner(){
  const el=byId('bossBanner'); if(!el){ toast('BOSS BATTLE! Get close to The Glitcher and answer questions!'); return; }
  el.classList.remove('hidden'); el.classList.add('show');
  setTimeout(()=>{ el.classList.remove('show'); setTimeout(()=>el.classList.add('hidden'),600); }, 5200);
}
/* While she hovers over the Glitch Core she trash-talks on a loose timer */
const HOVER_TAUNTS=[
  ['hover1','Look up, little player. This is MY core — I see every move you make.'],
  ['hover2','Eight checkpoints? My cyberbugs will find you long before you finish.'],
  ['hover3','Keep running. Every answer you solve only makes me angrier.'],
  ['taunt1','My cyberbugs are hungry, players. Do not keep them waiting.'],
  ['taunt3','I see you through every camera in this city.']
];
let hoverTauntNext=0, hoverTauntIdx=0;
function scheduleHoverTaunt(){
  const now=performance.now();
  if(!hoverTauntNext) { hoverTauntNext=now+9000; return; }   // first line ~9s after arrival
  if(now<hoverTauntNext) return;
  hoverTauntNext=now+15000+Math.random()*9000;
  const t=HOVER_TAUNTS[hoverTauntIdx++ % HOVER_TAUNTS.length];
  playGlitcher(t[0], t[1]);
}
for(let i=0;i<8;i++){
  const a=new Audio('assets/vo-sector-'+(i+1)+'.mp3');
  a.preload='auto'; a.volume=1.0; a.setAttribute('playsinline','');
  SECTOR_VO[i]=a; rehostAudio(a,'assets/vo-sector-'+(i+1)+'.mp3');
}
const INTRO_VO=[];   // Roman sector-intro line for sectors 1-7 (boss board uses the Glitcher's own entry taunt)
for(let i=0;i<7;i++){
  const a=new Audio('assets/vo-sector-intro-'+(i+1)+'.mp3');
  a.preload='auto'; a.volume=1.0; a.setAttribute('playsinline','');
  INTRO_VO[i]=a; rehostAudio(a,'assets/vo-sector-intro-'+(i+1)+'.mp3');
}
function playIntroVO(i){
  if(!musicOn) return;
  const a=INTRO_VO[i]; if(!a) return;
  // if the previous sector's completion VO is still talking, wait for it
  const busy=SECTOR_VO.find(v=>v && !v.paused && !v.ended);
  if(busy){ busy.addEventListener('ended', ()=>playIntroVO(i), {once:true}); return; }
  try{ if(a.readyState>0) a.currentTime=0; }catch(e){}
  music.volume=0.16;
  const p=a.play(); if(p&&p.catch) p.catch(()=>{ music.volume=0.45; });
  a.onended=()=>{ music.volume=0.45; };
}
rehostAudio(narration,'assets/alistair-intro.mp3');
rehostAudio(music,'assets/neon-grid-chase-loop.mp3');
narration.addEventListener('play', ()=>{ music.volume=0.18; });      // duck music under Alistair
narration.addEventListener('ended', ()=>{ music.volume=0.45; });

/* Some browsers (especially iOS Safari) block audio until a real tap, and can
   silently refuse even when play() resolves. Track it and offer a visible retry. */
let audioBlocked=false;
function markAudioBlocked(){
  audioBlocked=true;
  const btn=byId('soundFix'); if(btn){ btn.style.borderColor='#ffd23f'; btn.style.color='#ffd23f'; }
  const note=byId('storyNote'); if(note) note.textContent='Sound needs a tap — press “Play narration” above.';
}
function markAudioOk(){
  audioBlocked=false;
  const btn=byId('soundFix'); if(btn){ btn.style.borderColor=''; btn.style.color=''; }
}
function safePlay(el){
  try{
    const p=el.play();
    if(p && p.then) p.then(markAudioOk).catch(()=>markAudioBlocked());
  }catch(e){ markAudioBlocked(); }
}
function startMusic(){ if(!musicOn) return; safePlay(music); }
function stopMusic(){ music.pause(); }
function playNarration(){
  if(!musicOn) return;
  try{ if(narration.readyState>0) narration.currentTime=0; }catch(e){}
  safePlay(narration);
  // verify it really started; if not, surface the retry button
  setTimeout(()=>{ if(musicOn && narration.paused && narration.currentTime===0) markAudioBlocked(); }, 1400);
}
// prime the audio on the very first tap anywhere (classic iOS unlock)
function primeAudio(){
  document.removeEventListener('pointerdown', primeAudio, true);
  const v=music.volume; music.volume=0;
  try{ const p=music.play(); if(p&&p.then) p.then(()=>{ music.pause(); music.currentTime=0; music.volume=v; }).catch(()=>{ music.volume=v; }); }
  catch(e){ music.volume=v; }
}
document.addEventListener('pointerdown', primeAudio, true);
function sfx(k){ if(!actx||!musicOn) return; const t=actx.currentTime+0.01;
  if(k==='correct'){ tone(660,t,0.12,'sine',0.12); tone(990,t+0.09,0.14,'sine',0.12);}
  else if(k==='wrong'){ tone(170,t,0.22,'sawtooth',0.1);}
  else if(k==='hit'){ noise(t,0.16,0.14); tone(110,t,0.16,'sawtooth',0.08);}
  else if(k==='zap'){ tone(880,t,0.1,'square',0.12); tone(440,t+0.06,0.22,'sawtooth',0.1); noise(t,0.2,0.06);}
  else if(k==='bit'){ tone(720,t,0.07,'sine',0.09);}
  else if(k==='portal'){ tone(392,t,0.5,'sine',0.12); tone(587,t,0.5,'sine',0.08);}
}
byId('musicBtn').addEventListener('click', function(){ musicOn=!musicOn; this.classList.toggle('on',musicOn); this.innerHTML=musicOn?'&#9834; SOUND':'&#9834; MUTED'; if(musicOn){ music.play().catch(()=>{}); } else { music.pause(); narration.pause(); } });

/* ---------- input ---------- */
const keys={};
addEventListener('keydown',e=>{ keys[e.key.toLowerCase()]=true; if(e.key.toLowerCase()==='z'){ e.preventDefault(); fireZapper(); } if(e.key.toLowerCase()==='e'){ e.preventDefault(); tryStation(true); } });
addEventListener('keyup',e=>{ keys[e.key.toLowerCase()]=false; });
function keyVec(){ // returns screen-space intent {x: right, y: forward}
  let x=(keys['arrowright']||keys['d']?1:0)-(keys['arrowleft']||keys['a']?1:0);
  let y=(keys['arrowup']||keys['w']?1:0)-(keys['arrowdown']||keys['s']?1:0);
  return {x,y};
}
// touch stick
let stickVec={x:0,y:0}, stickId=null;
const stickEl=byId('stick'), nub=byId('nub');
function stickStart(e){ stickId=e.pointerId; stickMove(e); }
function stickMove(e){ if(stickId!==e.pointerId) return; const r=stickEl.getBoundingClientRect(); let dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2); const max=r.width/2; const len=Math.hypot(dx,dy); if(len>max){ dx*=max/len; dy*=max/len; } nub.style.transform=`translate(${dx}px,${dy}px)`; stickVec.x=dx/max; stickVec.y=-dy/max; }
function stickEnd(e){ if(stickId!==e.pointerId) return; stickId=null; stickVec.x=0; stickVec.y=0; nub.style.transform='translate(0,0)'; }
stickEl.addEventListener('pointerdown',stickStart); stickEl.addEventListener('pointermove',stickMove);
stickEl.addEventListener('pointerup',stickEnd); stickEl.addEventListener('pointercancel',stickEnd); stickEl.addEventListener('pointerleave',stickEnd);
byId('zapBtn').addEventListener('pointerdown',e=>{ e.preventDefault(); fireZapper(); });
byId('useBtn').addEventListener('pointerdown',e=>{ e.preventDefault(); tryStation(true); });

/* camera drag to rotate (on the canvas only) */
let cam = { theta: Math.PI, phi: 0.9, R: 15, target: new THREE.Vector3() };
let dragId=null, lastX=0, lastY=0;
canvas.addEventListener('pointerdown',e=>{ dragId=e.pointerId; lastX=e.clientX; lastY=e.clientY; });
canvas.addEventListener('pointermove',e=>{ if(dragId!==e.pointerId) return; const dx=e.clientX-lastX, dy=e.clientY-lastY; lastX=e.clientX; lastY=e.clientY; cam.theta -= dx*0.006; cam.phi = THREE.MathUtils.clamp(cam.phi - dy*0.004, 0.42, 1.15); });
addEventListener('pointerup',e=>{ if(dragId===e.pointerId) dragId=null; });
canvas.addEventListener('wheel',e=>{ e.preventDefault(); cam.R=THREE.MathUtils.clamp(cam.R + Math.sign(e.deltaY)*1.4, 10, 28); }, {passive:false});
// pinch zoom
let pinch=null;
canvas.addEventListener('touchstart',e=>{ if(e.touches.length===2){ pinch=Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);} },{passive:true});
canvas.addEventListener('touchmove',e=>{ if(e.touches.length===2 && pinch){ const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY); cam.R=THREE.MathUtils.clamp(cam.R - (d-pinch)*0.03, 10, 28); pinch=d; } },{passive:true});
canvas.addEventListener('touchend',()=>{ pinch=null; });

/* ---------- game state ---------- */
let S=null;
function fresh(chosen, grade){
  return { chosen, grade, board:0, score:0, lives:3, zaps:0, solved:0, zapped:0, keys:0, gems:0, streak:0, hazards:[], vaporizing:false, dissolve:null, boardFirst:0, boardAsked:0, grades:{}, boss:null, briefed:false, mastery:{}, keyPiece:null,
    player:null, playerObj:null, walls:[], bugs:[], stations:[], bits:[], portal:null,
    checksLeft:0, running:false, paused:false, iframes:0, dashT:0,
    bounds:{minX:0,maxX:0,minZ:0,maxZ:0}, group:new THREE.Group() };
}

/* ---------- world building ---------- */
const worldGroup = new THREE.Group(); scene.add(worldGroup);
let floor, grid1, grid2;
/* ---------- immersive environment: inside the computer ---------- */
function skyTexture(){
  const c=document.createElement('canvas'); c.width=2048; c.height=1024;
  const x=c.getContext('2d');
  // vertical gradient: deep indigo up top, bright cyan/violet at the horizon
  const g=x.createLinearGradient(0,0,0,1024);
  g.addColorStop(0.00,'#140b3a');
  g.addColorStop(0.30,'#1b1160');
  g.addColorStop(0.52,'#2a1f8c');
  g.addColorStop(0.66,'#1d4fa8');
  g.addColorStop(0.76,'#1f86c9');
  g.addColorStop(0.84,'#124a86');
  g.addColorStop(1.00,'#0a1236');
  x.fillStyle=g; x.fillRect(0,0,2048,1024);
  // soft nebula blooms
  const blobs=[['#7a5cff',0.30],['#36e8ff',0.26],['#ff4fb4',0.20],['#39ff5e',0.16]];
  blobs.forEach((b,i)=>{
    for(let k=0;k<4;k++){
      const cx=Math.random()*2048, cy=120+Math.random()*620, r=180+Math.random()*300;
      const rg=x.createRadialGradient(cx,cy,0,cx,cy,r);
      rg.addColorStop(0,b[0]); rg.addColorStop(1,'rgba(0,0,0,0)');
      x.globalAlpha=b[1]*0.5; x.fillStyle=rg; x.beginPath(); x.arc(cx,cy,r,0,6.3); x.fill();
    }
  });
  x.globalAlpha=1;
  // bright horizon band
  const hg=x.createLinearGradient(0,700,0,830);
  hg.addColorStop(0,'rgba(54,232,255,0)'); hg.addColorStop(0.5,'rgba(120,240,255,0.55)'); hg.addColorStop(1,'rgba(54,232,255,0)');
  x.fillStyle=hg; x.fillRect(0,700,2048,130);
  // giant circuit traces across the sky
  x.lineWidth=3; x.lineCap='round';
  for(let i=0;i<90;i++){
    x.strokeStyle=`rgba(${140+Math.random()*80|0},${200+Math.random()*55|0},255,${0.10+Math.random()*0.22})`;
    let px=Math.random()*2048, py=Math.random()*760;
    x.beginPath(); x.moveTo(px,py);
    for(let s=0;s<5;s++){ if(Math.random()<0.5) px+=(Math.random()*220-110); else py+=(Math.random()*150-75); x.lineTo(px,py); }
    x.stroke();
    x.fillStyle='rgba(180,240,255,0.55)'; x.beginPath(); x.arc(px,py,4,0,6.3); x.fill();
  }
  // data stars
  for(let i=0;i<700;i++){
    const s=Math.random()<0.12?2.6:1.4;
    x.fillStyle=`rgba(200,240,255,${Math.random()*0.7+0.25})`;
    x.fillRect(Math.random()*2048, Math.random()*760, s, s);
  }
  const t=new THREE.CanvasTexture(c); if('colorSpace' in t) t.colorSpace=THREE.SRGBColorSpace;
  return t;
}
const CODE_GLYPHS=['01','10','</>','if(x)','{ }','run()','++','::','www','404','&&','101'];
function glyphTexture(txt,color){
  const c=document.createElement('canvas'); c.width=256; c.height=96;
  const x=c.getContext('2d');
  x.font='700 56px "Chakra Petch", monospace'; x.textAlign='center'; x.textBaseline='middle';
  x.shadowColor=color; x.shadowBlur=18; x.fillStyle=color;
  x.fillText(txt,128,48);
  const t=new THREE.CanvasTexture(c); if('colorSpace' in t) t.colorSpace=THREE.SRGBColorSpace;
  return t;
}
let envGroup=null, glyphs=[];
function baseWorld(){
  // Sky dome must be LARGER than anything else so it is always the backdrop.
  const skyTex=skyTexture();
  skyTex.mapping=THREE.EquirectangularReflectionMapping;
  scene.background=skyTex;                       // guaranteed full-frame backdrop
  const sky=new THREE.Mesh(new THREE.SphereGeometry(900,48,28),
    new THREE.MeshBasicMaterial({ map:skyTexture(), side:THREE.BackSide, fog:false, depthWrite:false }));
  sky.name='sky'; scene.add(sky);
  // Wide reflective ground so the lower half of the screen is a lit surface
  floor = new THREE.Mesh(new THREE.PlaneGeometry(900,900),
    new THREE.MeshStandardMaterial({ color:0x101a3c, metalness:0.9, roughness:0.28,
      emissive:0x0a1740, emissiveIntensity:0.55 }));
  floor.rotation.x=-Math.PI/2; floor.position.y=-0.06; floor.name='ground'; scene.add(floor);
  // Tron-style neon grid stretching to the horizon
  const gA=new THREE.GridHelper(900, 180, 0x36e8ff, 0x1b3f7a);
  gA.material.transparent=true; gA.material.opacity=0.34; gA.position.y=-0.04; gA.name='gridfar'; scene.add(gA);
  const gB=new THREE.GridHelper(900, 30, 0x7a5cff, 0x7a5cff);
  gB.material.transparent=true; gB.material.opacity=0.20; gB.position.y=-0.02; gB.name='gridfar2'; scene.add(gB);
  // data motes
  const N=280, pos=new Float32Array(N*3);
  for(let i=0;i<N;i++){ pos[i*3]=rand(-60,60); pos[i*3+1]=rand(1,20); pos[i*3+2]=rand(-60,60); }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const motes=new THREE.Points(g, new THREE.PointsMaterial({ color:NEON.cyan, size:0.09, transparent:true, opacity:0.6 }));
  motes.name='motes'; scene.add(motes);
}
function buildEnvironment(cfg){
  if(envGroup){ scene.remove(envGroup); }
  envGroup=new THREE.Group(); glyphs=[];
  const pal=cfg.palette;
  // ring of distant glowing data towers (the computer city skyline)
  const R0=Math.max(cfg.cols,cfg.rows)*CELL*0.72 + 14;
  for(let i=0;i<26;i++){
    const a=i/26*Math.PI*2 + rand(-0.06,0.06);
    const r=R0+rand(0,22);
    const h=rand(5,18), w=rand(1.6,3.4);
    const col=pal[i%pal.length];
    const tower=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),
      new THREE.MeshStandardMaterial({ color:0x070b18, emissive:col, emissiveIntensity:0.5, metalness:0.6, roughness:0.5 }));
    tower.position.set(Math.cos(a)*r, h/2, Math.sin(a)*r);
    envGroup.add(tower);
    const edges=new THREE.LineSegments(new THREE.EdgesGeometry(tower.geometry), new THREE.LineBasicMaterial({ color:col, transparent:true, opacity:0.8 }));
    edges.position.copy(tower.position); envGroup.add(edges);
  }
  // floating live-code glyphs drifting upward
  for(let i=0;i<26;i++){
    const txt=CODE_GLYPHS[Math.floor(Math.random()*CODE_GLYPHS.length)];
    const colCss=['#36e8ff','#7a5cff','#39ff5e','#ffd23f','#ff4fb4'][i%5];
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({ map:glyphTexture(txt,colCss), transparent:true, opacity:0.85, depthWrite:false }));
    sp.scale.set(2.2,0.85,1);
    sp.position.set(rand(-R0,R0), rand(2,16), rand(-R0,R0));
    envGroup.add(sp);
    glyphs.push({ sp, vy:rand(0.25,0.7), top:18+rand(0,6) });
  }
  scene.add(envGroup);
}
/* circuit texture for maze walls, cached per color */
const _circuitCache={};
function circuitTexture(hex){
  if(_circuitCache[hex]) return _circuitCache[hex];
  const css='#'+hex.toString(16).padStart(6,'0');
  const c=document.createElement('canvas'); c.width=c.height=128;
  const x=c.getContext('2d');
  x.fillStyle='#070b16'; x.fillRect(0,0,128,128);
  x.strokeStyle=css; x.globalAlpha=0.85; x.lineWidth=3; x.lineCap='round';
  for(let i=0;i<9;i++){
    let px=8+Math.random()*112, py=8+Math.random()*112;
    x.beginPath(); x.moveTo(px,py);
    for(let s=0;s<3;s++){ if(Math.random()<0.5) px=Math.max(6,Math.min(122,px+(Math.random()*56-28))); else py=Math.max(6,Math.min(122,py+(Math.random()*56-28))); x.lineTo(px,py); }
    x.stroke();
    x.fillStyle=css; x.beginPath(); x.arc(px,py,3.4,0,6.3); x.fill();
  }
  // chip pads
  x.globalAlpha=0.55; x.fillStyle=css;
  for(let i=0;i<5;i++){ x.fillRect(6+Math.random()*104, 6+Math.random()*104, 9, 9); }
  x.globalAlpha=1;
  const t=new THREE.CanvasTexture(c);
  if('colorSpace' in t) t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=t.wrapT=THREE.RepeatWrapping;
  _circuitCache[hex]=t;
  return t;
}
baseWorld();

function clearBoard(){
  spinners=[];
  worldGroup.clear();
  if (grid1){ scene.remove(grid1); scene.remove(grid2); grid1=grid2=null; }
}

function cellToWorld(cfg, c, r){ return { x:(c - (cfg.cols-1)/2)*CELL, z:(r - (cfg.rows-1)/2)*CELL }; }

function buildBoard(){
  const cfg = BOARDS[S.board];
  clearBoard();
  applyTheme(cfg);
  S.walls=[]; S.bugs=[]; S.stations=[]; S.bits=[]; S.keyPiece=null; S.hazards=[]; S.vaporizing=false; S.boardFirst=0; S.boardAsked=0; S.streak=0;
  S.py=0; S.vy=0; S.launch=null; S.battle=null; S.battleCool=0;
  S.solved += 0;

  // ---- floor: board-colored PCB pad + bright grid + circuit traces ----
  const span = Math.max(cfg.cols,cfg.rows)*CELL + CELL;
  const boardW=cfg.cols*CELL, boardH=cfg.rows*CELL;
  const pcb=pcbTexture(cfg); pcb.repeat.set(cfg.cols/3.2, cfg.rows/3.2);
  const pad=new THREE.Mesh(new THREE.PlaneGeometry(boardW,boardH),
    new THREE.MeshStandardMaterial({ map:pcb, color:0xdfeaff, emissive:cfg.accent, emissiveMap:pcb,
      emissiveIntensity:0.5, metalness:0.35, roughness:0.55 }));
  pad.rotation.x=-Math.PI/2; pad.position.y=0.01; worldGroup.add(pad);
  // glowing rim around the board edge so it reads as a platform
  const rim=new THREE.Mesh(new THREE.RingGeometry(Math.max(boardW,boardH)*0.5, Math.max(boardW,boardH)*0.5+0.9, 4, 1),
    new THREE.MeshBasicMaterial({ color:cfg.accent, transparent:true, opacity:0.5, side:THREE.DoubleSide }));
  rim.rotation.x=-Math.PI/2; rim.rotation.z=Math.PI/4; rim.position.y=0.03; worldGroup.add(rim);
  grid1=new THREE.GridHelper(span, Math.max(cfg.cols,cfg.rows), cfg.accent, 0x2a5580);
  grid1.material.transparent=true; grid1.material.opacity=0.35; grid1.position.y=0.05; scene.add(grid1);
  grid2=new THREE.GridHelper(span, 8, cfg.accent2, cfg.accent2);
  grid2.material.transparent=true; grid2.material.opacity=0.25; grid2.position.y=0.06; scene.add(grid2);
  const traceMat=new THREE.LineBasicMaterial({ color:cfg.accent2 });
  for(let i=0;i<16;i++){
    let cx=rand(-boardW/2,boardW/2), cz=rand(-boardH/2,boardH/2);
    const pts=[new THREE.Vector3(cx,0.03,cz)];
    for(let s=0;s<3;s++){ if(Math.random()<0.5) cx+=rand(-CELL*2,CELL*2); else cz+=rand(-CELL*2,CELL*2); pts.push(new THREE.Vector3(cx,0.03,cz)); }
    worldGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), traceMat));
    const node=new THREE.Mesh(new THREE.CircleGeometry(0.13,12), new THREE.MeshBasicMaterial({ color:cfg.accent }));
    node.rotation.x=-Math.PI/2; node.position.set(cx,0.04,cz); worldGroup.add(node);
  }

  // occupancy grid: 0 open, 1 wall — architecture varies by board layout
  const cols=cfg.cols, rows=cfg.rows;
  const occ=Array.from({length:rows},()=>new Array(cols).fill(0));
  for(let c=0;c<cols;c++){ occ[0][c]=1; occ[rows-1][c]=1; }
  for(let r=0;r<rows;r++){ occ[r][0]=1; occ[r][cols-1]=1; }
  const start={c:1,r:1}, exit={c:cols-2,r:rows-2};
  const keepClear=(c,r)=> Math.abs(c-start.c)+Math.abs(r-start.r)<=2 || Math.abs(c-exit.c)+Math.abs(r-exit.r)<=2;
  const midC=(cols-1)/2, midR=(rows-1)/2;
  for(let r=2;r<rows-2;r++) for(let c=2;c<cols-2;c++){
    if(keepClear(c,r)) continue;
    let wall=false;
    switch(cfg.layout){
      case 'grid':     // motherboard: neat chip blocks on a regular pitch
        wall = (c%3!==0) && (r%3!==0) && (Math.random()<0.55); break;
      case 'pillars':  // power supply: sparse fat pillars, lots of open floor
        wall = (c%4===2 && r%4===2); break;
      case 'radial': { // CPU: concentric rings around the core with gaps
        const d=Math.round(Math.max(Math.abs(c-midC),Math.abs(r-midR)));
        wall = (d%3===0) && !(c%5===0) && !(r%5===0); break; }
      case 'fins':     // cooling: long parallel corridors like heatsink fins
        wall = (r%2===0) && (c>2 && c<cols-3) && !(c%7===0); break;
      case 'towers':   // GPU: tall thin slabs with wide lanes between
        wall = (c%3===1) && (r%2===1); break;
      case 'tunnels':  // RAM: long straight runs with occasional cross-cuts
        wall = (c%4===1) ? (r%6!==0) : false; break;
      case 'dense':    // SSD security grid: tight lattice
        wall = (c%2===0 && r%2===0) || (Math.random()<0.10); break;
      case 'chaos':    // glitch core: irregular broken scatter
        wall = (Math.random()<0.16) && !((c+r)%5===0); break;
      default:
        wall = Math.random()<cfg.density;
    }
    if(wall) occ[r][c]=1;
  }
  // guarantee a clear lane along the start row/column so nobody is boxed in
  for(let c=1;c<cols-1;c++) if(Math.random()<0.55) occ[1][c]=0;
  for(let r=1;r<rows-1;r++) if(Math.random()<0.55) occ[r][1]=0;

  // ---- UPPER DECK area (sectors 2+): clear the cells under the deck + pads ----
  let deckSpots=[];
  if(S.board>=1){
    // boss board gets TWO decks (checkpoints 4 and 8 live up top); other boards get one
    const spots = cfg.boss ? [[0.30,0.30],[0.70,0.70]] : [[0.62,0.38]];
    spots.forEach(([fx,fz])=>{
      const dc=Math.round(cols*fx), dr=Math.round(rows*fz);
      deckSpots.push({c0:dc-1, c1:dc+1, r0:dr-1, r1:dr+1, cc:dc, cr:dr});
      for(let r=dr-2;r<=dr+2;r++) for(let c=dc-2;c<=dc+2;c++)
        if(r>0&&r<rows-1&&c>0&&c<cols-1) occ[r][c]=0;
    });
  }

  // ---- REACHABILITY GUARANTEE: every open cell must connect to the start ----
  // (this was the "only 3 checkpoints" bug AND the "trapped with the bugs" bug:
  //  random layouts could seal off pockets. Now we flood-fill from the start and
  //  carve a corridor to any sealed pocket until the whole board is one space.)
  function reach(){
    const seen=Array.from({length:rows},()=>new Array(cols).fill(false));
    const q=[[start.r,start.c]]; seen[start.r][start.c]=true;
    while(q.length){ const [r,c]=q.pop();
      [[r+1,c],[r-1,c],[r,c+1],[r,c-1]].forEach(([nr,nc])=>{
        if(nr>0&&nr<rows-1&&nc>0&&nc<cols-1&&!occ[nr][nc]&&!seen[nr][nc]){ seen[nr][nc]=true; q.push([nr,nc]); } }); }
    return seen;
  }
  let seen=reach();
  for(let guard=0; guard<40; guard++){
    let sealed=null;
    outer: for(let r=1;r<rows-1;r++) for(let c=1;c<cols-1;c++)
      if(!occ[r][c] && !seen[r][c]){ sealed={r,c}; break outer; }
    if(!sealed) break;
    // carve a straight L path from the sealed cell back to the start
    let {r,c}=sealed;
    while(c!==start.c){ c+= c>start.c?-1:1; occ[r][c]=0; }
    while(r!==start.r){ r+= r>start.r?-1:1; occ[r][c]=0; }
    seen=reach();
  }
  S.reach=seen;

  // wall proportions differ per architecture so sectors read differently
  const WD = { grid:[0.90,2.2], pillars:[0.72,3.4], radial:[0.94,1.8], fins:[0.98,1.5],
               towers:[0.55,4.6], tunnels:[0.92,2.6], dense:[0.86,1.9], chaos:[0.80,2.9] };
  const wd = WD[cfg.layout] || [0.9,2.2];
  S.wallH = wd[1];
  const pal = cfg.palette;
  const wallGeo=new THREE.BoxGeometry(CELL*wd[0], wd[1], CELL*wd[0]);
  const edgeGeo=new THREE.EdgesGeometry(wallGeo);
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    if(!occ[r][c]) continue;
    const {x,z}=cellToWorld(cfg,c,r);
    const col = pal[(c*3+r)%pal.length];
    const ct=circuitTexture(col);
    const m=new THREE.Mesh(wallGeo, new THREE.MeshStandardMaterial({ map:ct, color:0xbfd4ff, emissive:col, emissiveMap:ct, emissiveIntensity:0.85, metalness:0.4, roughness:0.5 }));
    m.position.set(x,wd[1]/2,z); worldGroup.add(m);
    const e=new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color:col })); e.position.copy(m.position); worldGroup.add(e);
    S.walls.push({ minX:x-CELL*0.46, maxX:x+CELL*0.46, minZ:z-CELL*0.46, maxZ:z+CELL*0.46 });
  }
  buildProps(cfg, occ, cols, rows);
  // bounds (inside border)
  const a=cellToWorld(cfg,1,1), b=cellToWorld(cfg,cols-2,rows-2);
  S.bounds={ minX:a.x-CELL*0.3, maxX:b.x+CELL*0.3, minZ:a.z-CELL*0.3, maxZ:b.z+CELL*0.3 };

  // open cells list (for placing things) — REACHABLE cells only
  const open=[];
  const underDeck=(c,r)=> deckSpots.some(ds=> c>=ds.c0-1 && c<=ds.c1+1 && r>=ds.r0-1 && r<=ds.r1+1);
  for(let r=1;r<rows-1;r++) for(let c=1;c<cols-1;c++) if(!occ[r][c] && seen[r][c] && !underDeck(c,r) && !(c===start.c&&r===start.r) && !(c===exit.c&&r===exit.r)) open.push({c,r});
  const pick=()=>{ const i=Math.floor(Math.random()*open.length); return open.splice(i,1)[0]; };

  // 4 CHECKPOINTS — one per quadrant so kids sweep the whole board
  S.checksLeft=cfg.checks;
  const quads=[
    open.filter(o=>o.c< cols/2 && o.r< rows/2),
    open.filter(o=>o.c>=cols/2 && o.r< rows/2),
    open.filter(o=>o.c< cols/2 && o.r>=rows/2),
    open.filter(o=>o.c>=cols/2 && o.r>=rows/2)
  ];
  S.deck=null; S.decks=[]; S.pads=[];
  deckSpots.forEach(dcell=>{
    const dcw=cellToWorld(cfg,dcell.cc,dcell.cr);
    const deckH = (WD[cfg.layout]||[0.9,2.2])[1] + 1.1;   // always above this board's walls
    const dw=CELL*3.1;
    const deck={ x:dcw.x, z:dcw.z, minX:dcw.x-dw/2, maxX:dcw.x+dw/2, minZ:dcw.z-dw/2, maxZ:dcw.z+dw/2, h:deckH };
    S.decks.push(deck);
    const plat=new THREE.Mesh(new THREE.BoxGeometry(dw,0.3,dw),
      new THREE.MeshStandardMaterial({ map:pcbTexture(cfg), color:0xcfe0ff, emissive:cfg.accent2, emissiveIntensity:0.45, metalness:0.4, roughness:0.5 }));
    plat.position.set(dcw.x, deckH-0.15, dcw.z); worldGroup.add(plat);
    const edge=new THREE.LineSegments(new THREE.EdgesGeometry(plat.geometry), new THREE.LineBasicMaterial({ color:cfg.accent2 }));
    edge.position.copy(plat.position); worldGroup.add(edge);
    // holo support columns (visual only)
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{
      const col=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,deckH,8),
        new THREE.MeshBasicMaterial({ color:cfg.accent2, transparent:true, opacity:0.28 }));
      col.position.set(dcw.x+sx*dw*0.42, deckH/2, dcw.z+sz*dw*0.42); worldGroup.add(col); });
    // TWO LAUNCH PADS on opposite sides of each deck — step on to be flung up top
    [[-2,0],[2,0]].forEach(([oc,or2])=>{
      const pc=dcell.cc+oc, pr=dcell.cr+or2;
      if(pc<1||pc>cols-2||pr<1||pr>rows-2) return;
      const pw=cellToWorld(cfg,pc,pr);
      const g=new THREE.Group();
      const disc=new THREE.Mesh(new THREE.CylinderGeometry(0.82,0.95,0.16,24),
        new THREE.MeshStandardMaterial({ color:0x06202a, emissive:NEON.cyan, emissiveIntensity:1.6, metalness:0.5, roughness:0.4 }));
      disc.position.y=0.08; g.add(disc);
      const ring=new THREE.Mesh(new THREE.TorusGeometry(0.86,0.05,10,32),
        new THREE.MeshBasicMaterial({ color:NEON.cyan, transparent:true, opacity:0.8 }));
      ring.rotation.x=Math.PI/2; ring.position.y=0.2; g.add(ring);
      const arrow=new THREE.Mesh(new THREE.ConeGeometry(0.3,0.6,4),
        new THREE.MeshBasicMaterial({ color:NEON.cyan, transparent:true, opacity:0.85 }));
      arrow.position.y=0.9; g.add(arrow);
      g.position.set(pw.x,0,pw.z); worldGroup.add(g);
      S.pads.push({ x:pw.x, z:pw.z, tx:dcw.x, tz:dcw.z, h:deckH, ring, arrow, cool:0 });
    });
  });
  S.deck = S.decks[0] || null;   // legacy alias
  for(let i=0;i<cfg.checks;i++){
    // every 4th CHECKPOINT lives ON an UPPER DECK when the board has one (CP4 → deck 1, CP8 → deck 2)
    const dk = (i%4===3) ? S.decks[Math.floor(i/4)] : null;
    if(dk){
      S.stations.push(makeStation(dk.x, dk.z, i+1, dk.h));
      continue;
    }
    let cell=null;
    const q=quads[i%4];
    if(q.length){ cell=q.splice(Math.floor(Math.random()*q.length),1)[0]; const gi=open.indexOf(cell); if(gi>=0) open.splice(gi,1); }
    else cell=pick();
    if(!cell) break;
    const w=cellToWorld(cfg,cell.c,cell.r);
    S.stations.push(makeStation(w.x,w.z,i+1));
  }
  // bonus bits
  for(let i=0;i<cfg.bits;i++){ const cell=pick(); if(!cell) break; const w=cellToWorld(cfg,cell.c,cell.r); S.bits.push(makeBit(w.x,w.z)); }
  // bugs (away from start)
  let placed=0, guard=0;
  const bugTarget = Math.max(2, Math.round(cfg.bugs * diff().bugMul));
  while(placed<bugTarget && guard++<200){ const cell=pick(); if(!cell) break; if(Math.abs(cell.c-start.c)+Math.abs(cell.r-start.r)<4) continue; const w=cellToWorld(cfg,cell.c,cell.r); S.bugs.push(makeBug(w.x,w.z)); placed++; }

  // exit portal
  const ex=cellToWorld(cfg,exit.c,exit.r);
  S.portal=makePortal(ex.x,ex.z);
  buildHazards(cfg, occ, cols, rows);   // after stations+portal so hazards keep their distance

  // final sector: The Glitcher
  S.boss=null;
  if(cfg.boss){ const mid=cellToWorld(cfg, Math.floor(cols/2), Math.floor(rows/2)); S.boss=makeBoss(mid.x, mid.z);
    S.cinema=true;                              // hold the player while she makes her entrance
    hoverTauntNext=0; hoverTauntIdx=0;
    setTimeout(()=>{ if(S) S.cinema=false; }, 4200);   // wall-clock failsafe unlock
    setTimeout(()=>{ if(S&&S.running) playGlitcher('enter','So. You made it to my core. I have been locked in this machine for years. Alone. Forgotten.'); }, 400); }

  // place player at start
  const sw=cellToWorld(cfg,start.c,start.r);
  S.playerObj.position.set(sw.x, 0, sw.z);
  S.playerVel=new THREE.Vector3();
  cam.target.set(sw.x, 0.8, sw.z);

  updateHud(); updateObjective();
  if(S.board===0 && !S.briefed){
    S.briefed=true; S.paused=true; show(byId('howto'));
  } else {
    const L=window.TEACH_BANK.lessonFor(S.grade,S.board);
    const rv=window.TEACH_BANK.isReview(S.grade,S.board);
    toast(`SECTOR ${S.board+1}/8 · ${cfg.name} — ${rv?'REVIEW: mixed practice':'LESSON '+L.id+': '+L.name}`);
    if(S.board<7) playIntroVO(S.board);
    setTimeout(()=>{ if(S&&S.running) toast(cfg.radio); }, 3400);
    setTimeout(()=>{ if(S&&S.running) toast('Did you know? '+cfg.fact); }, 7200);
    // from sector 2 on, she starts taunting from inside the network
    if(S.board>=1 && S.board<7){
      const TAUNTS=[['taunt1','My cyberbugs are hungry, players. Do not keep them waiting.'],
                    ['taunt2','Fix all the sectors you like. I will simply break another one behind you.'],
                    ['taunt3','I see you through every camera in this city.']];
      const pick=TAUNTS[S.board % TAUNTS.length];
      setTimeout(()=>{ if(S&&S.running && !S.paused) playGlitcher(pick[0], pick[1]); }, 16000+Math.random()*10000);
    }
  }
}

function applyTheme(cfg){
  scene.fog.color.setHex(0x070a20);
  scene.fog.density=0.007;
  rimC.color.setHex(cfg.accent); rimP.color.setHex(cfg.accent2);
  buildEnvironment(cfg);
}

/* ---------- factories ---------- */
/* full PCB surface for the board floor — this is what fills the space between walls */
const _pcbCache={};
function pcbTexture(cfg){
  const key=cfg.name; if(_pcbCache[key]) return _pcbCache[key];
  const SZ=512, c=document.createElement('canvas'); c.width=c.height=SZ;
  const x=c.getContext('2d');
  const pal=cfg.palette.map(h=>'#'+h.toString(16).padStart(6,'0'));
  const base=(col)=>{ x.fillStyle=col; x.fillRect(0,0,SZ,SZ); };
  const traces=(n,alpha)=>{ x.lineCap='round';
    for(let i=0;i<n;i++){ x.strokeStyle=pal[i%pal.length]; x.globalAlpha=(alpha||0.55)+Math.random()*0.35; x.lineWidth=2+Math.random()*4;
      let px=Math.random()*SZ, py=Math.random()*SZ; x.beginPath(); x.moveTo(px,py);
      for(let st=0;st<4;st++){ if(Math.random()<0.5) px+=(Math.random()*150-75); else py+=(Math.random()*150-75); x.lineTo(px,py); }
      x.stroke(); x.fillStyle=pal[(i+1)%pal.length]; x.beginPath(); x.arc(px,py,5,0,6.3); x.fill(); }
    x.globalAlpha=1; };
  const vias=(n)=>{ for(let i=0;i<n;i++){ const px=Math.random()*SZ, py=Math.random()*SZ, r=3+Math.random()*5;
      x.fillStyle='#d9e8ff'; x.globalAlpha=0.55; x.beginPath(); x.arc(px,py,r,0,6.3); x.fill();
      x.fillStyle='#0d1a28'; x.globalAlpha=0.9; x.beginPath(); x.arc(px,py,r*0.42,0,6.3); x.fill(); } x.globalAlpha=1; };
  const chip=(px,py,w,h,col)=>{ x.fillStyle='#0b1a2a'; x.fillRect(px,py,w,h);
      x.strokeStyle=col; x.lineWidth=2; x.strokeRect(px,py,w,h); x.fillStyle=col;
      const pn=Math.max(4,(w/9)|0);
      for(let p=0;p<pn;p++){ x.fillRect(px+5+p*(w-10)/pn, py-4, 4, 4); x.fillRect(px+5+p*(w-10)/pn, py+h, 4, 4); } };

  switch(cfg.topic){
    case 'power': { // PSU: dark steel, honeycomb vent grille, big fan circle, warning stripes
      base('#241a2c');
      x.fillStyle='rgba(255,138,58,0.10)'; x.fillRect(0,0,SZ,SZ);
      for(let r=0;r<12;r++) for(let cc=0;cc<12;cc++){ const px=22+cc*40+(r%2?20:0), py=22+r*40;
        x.strokeStyle='rgba(255,210,63,0.55)'; x.lineWidth=3;
        x.beginPath(); for(let k2=0;k2<6;k2++){ const a=k2/6*6.283; const vx=px+Math.cos(a)*14, vy=py+Math.sin(a)*14; k2?x.lineTo(vx,vy):x.moveTo(vx,vy); } x.closePath(); x.stroke(); }
      x.strokeStyle='#ff4f6c'; x.lineWidth=6; x.globalAlpha=0.8;
      x.beginPath(); x.arc(SZ/2,SZ/2,120,0,6.3); x.stroke();
      for(let b=0;b<7;b++){ const a=b/7*6.283; x.beginPath(); x.moveTo(SZ/2,SZ/2);
        x.quadraticCurveTo(SZ/2+Math.cos(a+0.5)*70, SZ/2+Math.sin(a+0.5)*70, SZ/2+Math.cos(a)*115, SZ/2+Math.sin(a)*115); x.stroke(); }
      x.globalAlpha=1; vias(24); break; }
    case 'cpu': { // CPU die: gold contact-pad grid + shimmering silicon blocks
      base('#1c2410');
      for(let r=0;r<16;r++) for(let cc=0;cc<16;cc++){ x.fillStyle= (r+cc)%2? 'rgba(255,210,63,0.75)':'rgba(255,168,40,0.55)';
        x.fillRect(8+cc*31, 8+r*31, 20, 20); }
      x.fillStyle='rgba(20,30,60,0.85)'; x.fillRect(150,150,212,212);
      x.strokeStyle=pal[0]; x.lineWidth=4; x.strokeRect(150,150,212,212);
      for(let i=0;i<14;i++){ x.strokeStyle=pal[i%pal.length]; x.globalAlpha=0.7; x.lineWidth=2;
        x.beginPath(); x.moveTo(160+Math.random()*190,160+Math.random()*190); x.lineTo(160+Math.random()*190,160+Math.random()*190); x.stroke(); }
      x.globalAlpha=1; break; }
    case 'cooling': { // heatsink fins + fan-blade swirls
      base('#0f2430');
      for(let i=0;i<13;i++){ x.fillStyle= i%2? 'rgba(120,200,230,0.35)':'rgba(60,120,160,0.35)'; x.fillRect(0,i*40,SZ,22); }
      for(let f=0;f<3;f++){ const px=90+f*170, py=140+ (f%2)*220;
        x.strokeStyle=pal[f%pal.length]; x.lineWidth=7; x.globalAlpha=0.8;
        x.beginPath(); x.arc(px,py,64,0,6.3); x.stroke();
        for(let b=0;b<5;b++){ const a=b/5*6.283; x.beginPath(); x.moveTo(px,py);
          x.quadraticCurveTo(px+Math.cos(a+0.6)*40,py+Math.sin(a+0.6)*40, px+Math.cos(a)*58,py+Math.sin(a)*58); x.stroke(); } }
      x.globalAlpha=1; vias(20); break; }
    case 'gpu': { // graphics card: dark shroud, twin red fans, VRAM row
      base('#1c1016');
      x.fillStyle='rgba(255,79,108,0.10)'; x.fillRect(0,0,SZ,SZ);
      [[150,200],[362,200]].forEach(([px,py],fi)=>{
        x.strokeStyle='#ff4f6c'; x.lineWidth=8; x.globalAlpha=0.9;
        x.beginPath(); x.arc(px,py,92,0,6.3); x.stroke();
        for(let b=0;b<9;b++){ const a=b/9*6.283+fi; x.beginPath(); x.moveTo(px,py);
          x.quadraticCurveTo(px+Math.cos(a+0.5)*55,py+Math.sin(a+0.5)*55, px+Math.cos(a)*84,py+Math.sin(a)*84); x.stroke(); }
        x.globalAlpha=1; x.fillStyle='#39ff5e'; x.beginPath(); x.arc(px,py,14,0,6.3); x.fill(); });
      for(let i=0;i<6;i++) chip(30+i*78, 400, 56, 40, pal[i%pal.length]);
      for(let p=0;p<40;p++){ x.fillStyle='#ffd23f'; x.fillRect(12+p*12, 480, 6, 20); }
      break; }
    case 'ram': { // RAM sticks: long modules with gold edge pins
      base('#12281a');
      for(let m=0;m<4;m++){ const py=30+m*120;
        x.fillStyle='rgba(20,50,90,0.9)'; x.fillRect(16,py,480,74);
        x.strokeStyle=pal[m%pal.length]; x.lineWidth=3; x.strokeRect(16,py,480,74);
        for(let cchip=0;cchip<8;cchip++){ x.fillStyle='#0b1a2a'; x.fillRect(28+cchip*58,py+10,44,36);
          x.strokeStyle=pal[(cchip+m)%pal.length]; x.lineWidth=2; x.strokeRect(28+cchip*58,py+10,44,36); }
        for(let p=0;p<52;p++){ x.fillStyle= p%2?'#ffd23f':'#c89020'; x.fillRect(20+p*9, py+78, 6, 14); } }
      break; }
    case 'ssd': { // SSD: NAND chip grid, controller, big lock motif
      base('#241226');
      for(let r=0;r<4;r++) for(let cc=0;cc<4;cc++) chip(24+cc*124, 24+r*124, 92, 84, pal[(r+cc)%pal.length]);
      x.strokeStyle='#ff4fb4'; x.lineWidth=6; x.globalAlpha=0.8;
      x.strokeRect(190,190,132,132);
      x.beginPath(); x.arc(256,206,34,3.34,6.08); x.stroke();
      x.globalAlpha=1; vias(20); break; }
    default: { // motherboard / glitch core: full PCB
      base(cfg.topic==='motherboard' && cfg.boss ? '#2a1030' : '#132a3d');
      for(let i=0;i<26;i++){ x.fillStyle=`rgba(30,70,100,${0.25+Math.random()*0.3})`;
        x.fillRect(Math.random()*SZ, Math.random()*SZ, 40+Math.random()*110, 30+Math.random()*90); }
      traces(70); vias(70);
      for(let i=0;i<10;i++) chip(Math.random()*(SZ-90), Math.random()*(SZ-70), 50+Math.random()*40, 34+Math.random()*30, pal[i%pal.length]);
      if(cfg.boss){ // corrupted static tears
        for(let i=0;i<26;i++){ x.fillStyle=`rgba(${Math.random()<0.5?255:180},40,${Math.random()<0.5?92:255},0.35)`;
          x.fillRect(Math.random()*SZ, Math.random()*SZ, 30+Math.random()*140, 3+Math.random()*7); } }
    }
  }
  const t=new THREE.CanvasTexture(c);
  if('colorSpace' in t) t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=t.wrapT=THREE.RepeatWrapping;
  _pcbCache[key]=t; return t;
}

/* per-sector props: non-colliding decoration that makes each board recognisable */
let spinners=[];
function buildProps(cfg, occ, cols, rows){
  const pal=cfg.palette;
  const open=[];
  for(let r=1;r<rows-1;r++) for(let c=1;c<cols-1;c++) if(!occ[r][c]) open.push({c,r});
  const take=(n)=>{ const out=[]; for(let i=0;i<n && open.length;i++){ out.push(open.splice((Math.random()*open.length)|0,1)[0]); } return out; };
  const put=(mesh,cell,y)=>{ const w=cellToWorld(cfg,cell.c,cell.r); mesh.position.set(w.x,y||0,w.z); worldGroup.add(mesh); return mesh; };
  const mat=(col,int)=>new THREE.MeshStandardMaterial({ color:0x0a0f20, emissive:col, emissiveIntensity:int||1.2, metalness:0.6, roughness:0.4 });

  switch(cfg.prop){
    case 'chips':
      take(10).forEach((cell,i)=>{ const col=pal[i%pal.length];
        put(new THREE.Mesh(new THREE.BoxGeometry(1.5,0.22,1.5), mat(col,0.9)),cell,0.11);
        put(new THREE.Mesh(new THREE.BoxGeometry(1.9,0.05,0.12), new THREE.MeshBasicMaterial({color:col})),cell,0.03); });
      break;
    case 'caps':
      take(12).forEach((cell,i)=>{ const col=pal[i%pal.length];
        put(new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.34,1.5,14), mat(col,0.8)),cell,0.75);
        const top=new THREE.Mesh(new THREE.CircleGeometry(0.34,14), new THREE.MeshBasicMaterial({color:col}));
        top.rotation.x=-Math.PI/2; put(top,cell,1.52); });
      break;
    case 'core': {
      const mid={c:(cols/2)|0, r:(rows/2)|0};
      put(new THREE.Mesh(new THREE.BoxGeometry(3.2,0.4,3.2), mat(pal[0],1.6)),mid,0.2);
      for(let i=0;i<3;i++){ const ring=new THREE.Mesh(new THREE.TorusGeometry(2.2+i*0.7,0.06,10,48),
        new THREE.MeshBasicMaterial({color:pal[(i+1)%pal.length],transparent:true,opacity:0.55}));
        ring.rotation.x=Math.PI/2; put(ring,mid,0.5+i*0.35); }
      break; }
    case 'fans':
      take(8).forEach((cell,i)=>{ const col=pal[i%pal.length];
        const hub=new THREE.Group();
        const ring=new THREE.Mesh(new THREE.TorusGeometry(0.75,0.08,10,32), mat(col,1.4)); ring.rotation.x=Math.PI/2; hub.add(ring);
        for(let b=0;b<5;b++){ const blade=new THREE.Mesh(new THREE.BoxGeometry(0.62,0.04,0.2), mat(col,1.0));
          const a=b/5*Math.PI*2; blade.position.set(Math.cos(a)*0.38,0,Math.sin(a)*0.38); blade.rotation.y=-a; hub.add(blade); }
        put(hub,cell,2.3); spinners.push({o:hub,sp:2.6}); });
      break;
    case 'vram':
      take(12).forEach((cell,i)=>{ const col=pal[i%pal.length];
        put(new THREE.Mesh(new THREE.BoxGeometry(0.3,1.1,1.7), mat(col,1.1)),cell,0.55); });
      break;
    case 'sticks':
      take(12).forEach((cell,i)=>{ const col=pal[i%pal.length];
        put(new THREE.Mesh(new THREE.BoxGeometry(0.22,1.8,2.0), mat(col,1.0)),cell,0.9);
        put(new THREE.Mesh(new THREE.BoxGeometry(0.26,0.12,1.4), new THREE.MeshBasicMaterial({color:col})),cell,1.6); });
      break;
    case 'locks':
      take(10).forEach((cell,i)=>{ const col=pal[i%pal.length];
        const oct=new THREE.Mesh(new THREE.OctahedronGeometry(0.5,0), mat(col,1.5)); put(oct,cell,1.5); spinners.push({o:oct,sp:1.1}); });
      break;
    case 'shards':
      take(14).forEach((cell,i)=>{ const col=pal[i%pal.length];
        const sh=new THREE.Mesh(new THREE.TetrahedronGeometry(0.55,0), mat(col,1.6));
        sh.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3);
        put(sh,cell,1.2+Math.random()*1.6); spinners.push({o:sh,sp:0.8}); });
      break;
  }
}

function numTexture(n, colorCss){
  const c=document.createElement('canvas'); c.width=c.height=128;
  const x=c.getContext('2d');
  x.clearRect(0,0,128,128);
  x.font='900 92px Orbitron, sans-serif'; x.textAlign='center'; x.textBaseline='middle';
  x.shadowColor=colorCss; x.shadowBlur=26; x.fillStyle='#ffffff';
  x.fillText(String(n),64,70);
  const t=new THREE.CanvasTexture(c); if('colorSpace' in t) t.colorSpace=THREE.SRGBColorSpace;
  return t;
}
const PER_STATION = 3;   // questions per checkpoint on normal boards
// The boss board has 8 checkpoints, so each asks fewer questions (8x2=16 + the 6-question duel)
function stationQuota(){ return (S && BOARDS[S.board] && BOARDS[S.board].boss) ? 2 : PER_STATION; }
function makeStation(x,z,num,y){
  const g=new THREE.Group();
  const col=NEON.gold;
  const post=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.26,2.0,12),
    new THREE.MeshStandardMaterial({ color:0x0a1230, emissive:col, emissiveIntensity:0.7, metalness:0.6, roughness:0.4 }));
  post.position.y=1.0; g.add(post);
  const panel=new THREE.Mesh(new THREE.BoxGeometry(1.1,0.75,0.12),
    new THREE.MeshStandardMaterial({ color:0x061024, emissive:col, emissiveIntensity:1.5 }));
  panel.position.y=1.9; g.add(panel);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(0.8,0.06,12,40),
    new THREE.MeshStandardMaterial({ color:0x000000, emissive:col, emissiveIntensity:2.2 }));
  ring.position.y=0.05; ring.rotation.x=Math.PI/2; g.add(ring);
  const numSpr=new THREE.Sprite(new THREE.SpriteMaterial({ map:numTexture(num,'#ffd23f'), transparent:true, depthWrite:false }));
  numSpr.scale.set(1.3,1.3,1); numSpr.position.y=3.0; g.add(numSpr);
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,9,8,1,true),
    new THREE.MeshBasicMaterial({ color:col, transparent:true, opacity:0.28, side:THREE.DoubleSide }));
  beam.position.y=4.5; g.add(beam);
  // three progress pips showing how many of the 3 questions are done
  const pips=[];
  for(let i=0;i<stationQuota();i++){
    const p=new THREE.Mesh(new THREE.SphereGeometry(0.11,10,10),
      new THREE.MeshStandardMaterial({ color:0x101828, emissive:0x223050, emissiveIntensity:0.6 }));
    p.position.set((i-1)*0.32, 2.45, 0.1); g.add(p); pips.push(p);
  }
  g.position.set(x,(y||0),z); worldGroup.add(g);
  return { x, z, y:(y||0), group:g, post, panel, ring, numSpr, beam, pips, col, num,
           done:0, solved:false, inRange:false, _variant:0 };
}
function grayOutStation(st){
  const gray=0x39424f, dark=0x0c1018;
  st.post.material.emissive.setHex(gray); st.post.material.emissiveIntensity=0.25; st.post.material.color.setHex(dark);
  st.panel.material.emissive.setHex(gray); st.panel.material.emissiveIntensity=0.3; st.panel.material.color.setHex(dark);
  st.ring.material.emissive.setHex(gray); st.ring.material.emissiveIntensity=0.4;
  st.beam.material.opacity=0;
  st.numSpr.material.opacity=0.25;
  st.pips.forEach(p=>{ p.material.emissive.setHex(gray); p.material.emissiveIntensity=0.5; });
}
function updateStationPips(st){
  for(let i=0;i<st.pips.length;i++){
    const on = i < st.done;
    st.pips[i].material.emissive.setHex(on?NEON.green:0x223050);
    st.pips[i].material.emissiveIntensity = on?2.2:0.6;
  }
}
function makeBit(x,z){
  const g=new THREE.Group();
  // faceted diamond: an octahedron reads as a cut gem
  const gem=new THREE.Mesh(new THREE.OctahedronGeometry(0.30,0),
    new THREE.MeshStandardMaterial({ color:0x0d3a4a, emissive:0x59e8ff, emissiveIntensity:2.0,
      metalness:0.9, roughness:0.08, flatShading:true }));
  gem.scale.set(0.85,1.35,0.85); g.add(gem);
  const glow=new THREE.Mesh(new THREE.CircleGeometry(0.42,18),
    new THREE.MeshBasicMaterial({ color:0x59e8ff, transparent:true, opacity:0.30 }));
  glow.rotation.x=-Math.PI/2; glow.position.y=-0.55; g.add(glow);
  g.position.set(x,0.9,z); worldGroup.add(g);
  return { x,z,mesh:g,gem,got:false };
}
function swirlTexture(){
  const c=document.createElement('canvas'); c.width=c.height=256;
  const x=c.getContext('2d');
  x.translate(128,128);
  for(let arm=0;arm<5;arm++){
    x.beginPath();
    for(let a=0;a<Math.PI*2.2;a+=0.05){
      const r=8+a*16;
      const ang=a+arm*(Math.PI*2/5);
      const px=Math.cos(ang)*r, py=Math.sin(ang)*r;
      if(a===0) x.moveTo(px,py); else x.lineTo(px,py);
    }
    x.strokeStyle='rgba(140,240,255,0.85)'; x.lineWidth=7; x.lineCap='round'; x.stroke();
  }
  const t=new THREE.CanvasTexture(c); if('colorSpace' in t) t.colorSpace=THREE.SRGBColorSpace;
  return t;
}
let _swirlTex=null;
function makePortal(x,z){
  const g=new THREE.Group();
  if(!_swirlTex) _swirlTex=swirlTexture();
  // upright swirling vortex disc
  const disc=new THREE.Mesh(new THREE.CircleGeometry(1.5,48),
    new THREE.MeshBasicMaterial({ map:_swirlTex, transparent:true, opacity:0.25, side:THREE.DoubleSide, depthWrite:false }));
  disc.position.y=1.8; g.add(disc);
  const rings=[];
  for(let i=0;i<3;i++){
    const t=new THREE.Mesh(new THREE.TorusGeometry(1.7-i*0.25,0.09,14,60),
      new THREE.MeshStandardMaterial({ color:0x000000, emissive:0x2a3a5a, emissiveIntensity:1 }));
    t.position.y=1.8; g.add(t); rings.push(t);
  }
  // arch base pads
  const pad=new THREE.Mesh(new THREE.CylinderGeometry(1.9,2.1,0.12,32),
    new THREE.MeshStandardMaterial({ color:0x081226, emissive:0x2a3a5a, emissiveIntensity:0.7 }));
  pad.position.y=0.06; g.add(pad);
  // sky beam (visible across the board once active)
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.5,1.1,16,16,1,true),
    new THREE.MeshBasicMaterial({ color:0x36e8ff, transparent:true, opacity:0.0, side:THREE.DoubleSide, depthWrite:false }));
  beam.position.y=8; g.add(beam);
  g.position.set(x,0,z); worldGroup.add(g);
  return { x,z,group:g,rings,disc,beam,active:false };
}
const BUG_KEYS=['magenta','yellow','orange','purple','blue'];
const BUG_GLOW={ magenta:0xff4fb4, yellow:0xffe23a, orange:0xff8a3a, purple:0xb44dff, blue:0x3a7bff };
const _texLoader=new THREE.TextureLoader();
const bugTex={};
BUG_KEYS.forEach(k=>{ const t=_texLoader.load('assets/bug-'+k+'.png'); if('colorSpace' in t) t.colorSpace=THREE.SRGBColorSpace; bugTex[k]=t; });
function makeBug(x,z){
  const g=new THREE.Group();
  const key=BUG_KEYS[Math.floor(Math.random()*BUG_KEYS.length)];
  const mat=new THREE.SpriteMaterial({ map:bugTex[key], transparent:true, depthWrite:false });
  const sp=new THREE.Sprite(mat); sp.scale.set(1.9,1.75,1); sp.position.y=0.2; g.add(sp);
  const disc=new THREE.Mesh(new THREE.CircleGeometry(0.6,24),
    new THREE.MeshBasicMaterial({ color:BUG_GLOW[key], transparent:true, opacity:0.35 }));
  disc.rotation.x=-Math.PI/2; disc.position.y=0.03; g.add(disc);
  g.position.set(x,0.9,z); worldGroup.add(g);
  return { x, z, y:0.9, group:g, sprite:sp, mat, disc, key,
    state:'roam', stun:0, phase:rand(0,6), wanderA:rand(0,6.28), r:0.55 };
}

/* ---------- The Glitcher (final boss) ---------- */
function makeBoss(x,z){
  const g=new THREE.Group();
  const core=new THREE.Mesh(new THREE.IcosahedronGeometry(1.15,1),
    new THREE.MeshStandardMaterial({ color:0x14001e, emissive:0xb44dff, emissiveIntensity:1.5, metalness:0.8, roughness:0.25 }));
  g.add(core);
  const shell=new THREE.Mesh(new THREE.IcosahedronGeometry(1.5,0),
    new THREE.MeshBasicMaterial({ color:0xff3b5c, wireframe:true, transparent:true, opacity:0.55 }));
  g.add(shell);
  const eye=new THREE.Mesh(new THREE.SphereGeometry(0.3,18,18),
    new THREE.MeshStandardMaterial({ color:0xffffff, emissive:0xff2a4a, emissiveIntensity:2.6 }));
  eye.position.set(0,0.1,1.05); g.add(eye);
  const rings=[];
  for(let i=0;i<3;i++){
    const r=new THREE.Mesh(new THREE.TorusGeometry(1.7+i*0.28,0.06,12,48),
      new THREE.MeshStandardMaterial({ color:0x000000, emissive:i%2?0xff4fb4:0xb44dff, emissiveIntensity:2 }));
    r.rotation.x=Math.PI/2 + i*0.4; r.rotation.z=i*0.6; g.add(r); rings.push(r);
  }
  const light=new THREE.PointLight(0xb44dff, 60, 26); g.add(light);
  g.position.set(x,20,z); worldGroup.add(g);
  return { group:g, core, shell, eye, rings, hp:3, maxHp:3, seg:2, segMax:2, vulnerable:false, phase:0, r:1.4,
           mode:'arrive', hoverY:8.6, arriveAt:performance.now() };
}
/* ============ THE GLITCHER BATTLE — knowledge is the weapon ============
   Once the Master Key is assembled she is vulnerable. Get close and she pulls
   you into a QUESTION DUEL: each correct answer fires a mega-zap that breaks
   one shield SEGMENT (2 segments per shield, 3 shields = 6 correct answers).
   Wrong answers let her REPAIR a segment — and on Grades 5-6 she also spawns
   two cyberbugs into the arena. Z-zaps clear bugs but cannot touch her. */
function battleTough(){ return S.grade>=5; }
function openBattle(){
  const b=S.boss; if(!b || !b.vulnerable || S.paused) return;
  S.paused=true;
  S.battleVar=(S.battleVar||0)+1;
  const shieldNo = b.maxHp - b.hp + 1;              // 1..3
  // escalate: shield 1 pulls early lessons, shield 3 pulls APPLY transfer items
  const stageIdx = Math.min(3, shieldNo);           // 1,2,3 -> WE, YOU, APPLY
  const q = window.TEACH_BANK.item(S.grade, Math.min(S.board, 7), stageIdx, S.battleVar);
  S.battleQ=q;
  const badge=' <span class="stage-badge">GLITCHER DUEL</span>';
  byId('puzzleKicker').innerHTML='BOSS BATTLE · SHIELD '+shieldNo+'/3 · SEGMENT '+ (b.segMax-b.seg+1) +'/'+b.segMax+badge;
  byId('puzzleQ').textContent=q.q;
  byId('puzzleSub').textContent='Answer right to fire the MEGA-ZAP!';
  byId('puzzleHint').textContent='';
  const wrap=byId('puzzleAnswers'); wrap.innerHTML='';
  q.choices.forEach((ch,i)=>{ const btn=document.createElement('button'); btn.textContent=ch;
    btn.addEventListener('click',()=>battleAnswer(i,btn)); wrap.appendChild(btn); });
  show(byId('puzzleModal'));
}
function battleAnswer(idx,btn){
  const b=S.boss, q=S.battleQ; if(!b) return;
  if(idx===q.correct){
    btn.classList.add('right'); sfx('correct');
    recordMastery(q,true,true);
    setTimeout(()=>{ hide(byId('puzzleModal')); S.paused=false; S.battleCool=2.2; megaZap(); },420);
  } else {
    btn.classList.add('wrong'); sfx('wrong');
    recordMastery(q,false,false);
    byId('puzzleAnswers').querySelectorAll('button')[q.correct].classList.add('right');
    byId('puzzleHint').textContent='Hint: '+q.hint;
    const tough=battleTough();
    setTimeout(()=>{
      hide(byId('puzzleModal')); S.paused=false; S.battleCool=3.0;
      // she repairs a segment (never past full)
      if(b.seg<b.segMax){ b.seg++; toast('Wrong — the Glitcher REPAIRED a shield segment!'); }
      else if(b.hp<b.maxHp){ b.hp++; b.seg=1; toast('Wrong — the Glitcher rebuilt part of a broken shield!'); }
      else toast('Wrong — she laughs. Try again!');
      if(tough){
        for(let i=0;i<2;i++){
          const ang=Math.random()*6.28;
          const nx=THREE.MathUtils.clamp(b.group.position.x+Math.cos(ang)*4, S.bounds.minX, S.bounds.maxX);
          const nz=THREE.MathUtils.clamp(b.group.position.z+Math.sin(ang)*4, S.bounds.minZ, S.bounds.maxZ);
          S.bugs.push(makeBug(nx,nz));
        }
        toast('She spawned cyberbugs — Z-zap them, then get back in there!');
      }
      updateObjective();
    },1500);
  }
}
function megaZap(){
  const b=S.boss; if(!b) return;
  sfx('zap');
  // big visual: ring + bolt burst at her position
  burst(b.group.position.x, b.group.position.z, 0xffd23f, 46);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(0.7,0.09,10,40),
    new THREE.MeshBasicMaterial({ color:0xffd23f, transparent:true, opacity:0.95 }));
  ring.rotation.x=Math.PI/2; ring.position.set(b.group.position.x,0.35,b.group.position.z);
  scene.add(ring); zapRings.push({mesh:ring,t:0});
  b.seg--;
  if(b.seg>0){ toast('MEGA-ZAP! Shield segment destroyed — '+b.seg+' left on this shield.'); updateObjective(); return; }
  // shield down
  b.hp--; b.seg=b.segMax;
  if(b.hp<=0){ glitcherDefeated(); return; }
  b.shell.material.opacity=Math.max(0.12, 0.55 - (b.maxHp-b.hp)*0.18);
  playGlitcher(b.hp===2?'hit1':'hit2',
    b.hp===2 ? 'A lucky hit. You cannot patch what I have already rewritten!'
             : 'Stop it! Every door in this city, I opened. Futuria forgot me. You will not!');
  toast('SHIELD '+(b.maxHp-b.hp)+'/3 DOWN! '+b.hp+' to go — get close for the next duel!');
  updateObjective();
}
/* ---- the GUARDIAN ENDING: she is not trying to get out. She was never seen. ---- */
function glitcherDefeated(){
  const b=S.boss; if(!b) return;
  burst(b.group.position.x, b.group.position.z, 0xb44dff, 60);
  b.group.visible=false; S.boss=null; S.score+=500;
  playGlitcher('yield','Enough. I yield... You do not understand. I was born in this machine. There is no "out" for me. I only wanted someone to know I was here.');
  const seq=[
    [5200,'Natalia: "Wait — she was never trying to escape. Nexora made her by accident... and then hid her."'],
    [9200,'Maya: "Being invisible stinks. But breaking stuff is NOT how you make friends."'],
    [12800,'Alana: "So let\'s do what Nexora never did. We SEE you. And this system needs a protector."'],
    [16400,'S.P.A.R.K.: "Transferring CoreNet guardian protocols... it is yours now. Use them well."']
  ];
  seq.forEach(([t,line])=>{ setTimeout(()=>{ if(S&&S.running) commsSay(line); }, t); });
  setTimeout(()=>{ if(S&&S.running) playGlitcher('guardian','A name. A place. Very well — I accept. I will guard the CoreNet better than Nexora ever could. Now go, players. Your world is waiting... my friends.'); }, 20000);
  setTimeout(()=>{
    if(!S||!S.running) return;
    S.portal.active=true; S.portal.rings.forEach(r=>r.material.emissive.setHex(NEON.cyan));
    S.portal.disc.material.opacity=0.9; S.portal.beam.material.opacity=0.35;
    sfx('portal');
    toast('THE GLITCHER IS NOW THE GUARDIAN OF THE CORENET! The portal home is open — GO!');
    updateObjective();
  }, 29000);
}

/* ---------- escalating hazards: the machine fights back harder each sector ---------- */
function buildHazards(cfg, occ, cols, rows){
  S.hazards=[];
  const board=S.board;
  const open=[];
  const clearOf=(x,z)=>{ // never drop a hazard on top of a checkpoint, pad, or the portal
    for(const st of S.stations) if(Math.hypot(st.x-x,st.z-z)<CELL*2.2) return false;
    for(const pd of (S.pads||[])) if(Math.hypot(pd.x-x,pd.z-z)<CELL*2.0) return false;
    if(S.portal && Math.hypot(S.portal.x-x,S.portal.z-z)<CELL*2.2) return false;
    return true;
  };
  for(let r=2;r<rows-2;r++) for(let c=2;c<cols-2;c++){
    if(occ[r][c]) continue;
    const w=cellToWorld(cfg,c,r);
    if(clearOf(w.x,w.z)) open.push({c,r});
  }
  const grab=()=> open.length? open.splice((Math.random()*open.length)|0,1)[0] : null;

  // SECTOR 3+ : DATA SURGES — sweeping energy bars that damage on contact
  if(board>=2){
    const n=Math.min(5, 1+Math.floor(board/2));
    for(let i=0;i<n;i++){
      const cell=grab(); if(!cell) break;
      const w=cellToWorld(cfg,cell.c,cell.r);
      const horiz=Math.random()<0.5;
      const len=CELL*rand(3,5);
      const bar=new THREE.Mesh(new THREE.BoxGeometry(horiz?len:0.34, 0.5, horiz?0.34:len),
        new THREE.MeshStandardMaterial({ color:0x2a0010, emissive:0xff2a5c, emissiveIntensity:2.2 }));
      bar.position.set(w.x,0.7,w.z); worldGroup.add(bar);
      const glow=new THREE.Mesh(new THREE.BoxGeometry(horiz?len:0.9,0.02,horiz?0.9:len),
        new THREE.MeshBasicMaterial({ color:0xff2a5c, transparent:true, opacity:0.35 }));
      glow.position.set(w.x,0.06,w.z); worldGroup.add(glow);
      S.hazards.push({ type:'surge', mesh:bar, glow, x:w.x, z:w.z, horiz, len,
        span:CELL*rand(2,3.5), phase:rand(0,6.28), speed:rand(0.7,1.3)+board*0.05 });
    }
  }
  // SECTOR 5+ : FIREWALL GATES — pulse on and off; only dangerous while lit
  if(board>=4){
    const n=Math.min(6, board-2);
    for(let i=0;i<n;i++){
      const cell=grab(); if(!cell) break;
      const w=cellToWorld(cfg,cell.c,cell.r);
      const wall=new THREE.Mesh(new THREE.BoxGeometry(CELL*0.92,2.0,0.2),
        new THREE.MeshStandardMaterial({ color:0x301500, emissive:0xff8a1a, emissiveIntensity:2.0,
          transparent:true, opacity:0.55 }));
      wall.position.set(w.x,1.0,w.z); wall.rotation.y=Math.random()<0.5?0:Math.PI/2; worldGroup.add(wall);
      S.hazards.push({ type:'firewall', mesh:wall, x:w.x, z:w.z, phase:(i/n)*6.28, period:3.2, on:true });
    }
  }
}
function updateHazards(dt,t){
  if(!S.hazards || S.vaporizing) return;
  const p=S.playerObj; if(!p) return;
  S.hazards.forEach(h=>{
    if(h.type==='surge'){
      const off=Math.sin(t*h.speed + h.phase)*h.span;
      if(h.horiz){ h.mesh.position.z=h.z+off; h.glow.position.z=h.z+off; }
      else { h.mesh.position.x=h.x+off; h.glow.position.x=h.x+off; }
      const dx=Math.abs(p.position.x-h.mesh.position.x), dz=Math.abs(p.position.z-h.mesh.position.z);
      const hit = h.horiz ? (dx < h.len/2 && dz < 0.55) : (dz < h.len/2 && dx < 0.55);
      if(hit && (S.py||0)<0.7) damage();
    } else if(h.type==='firewall'){
      const lit = Math.sin(t*(6.28/h.period) + h.phase) > 0.25;   // real safe windows kids can time
      h.on=lit;
      h.mesh.material.opacity = lit?0.75:0.12;
      h.mesh.material.emissiveIntensity = lit?2.4:0.25;
      if(lit){
        const d=Math.hypot(p.position.x-h.x, p.position.z-h.z);
        if(d<1.15 && (S.py||0)<0.7) damage();
      }
    }
  });
}

/* ---------- vaporize + regenerate (replaces the mid-game reboot) ---------- */
function safeRespawnSpot(){
  // pick an open cell far from every bug so the sister gets a fair restart
  const cfg=BOARDS[S.board];
  let best=null, bestD=-1;
  for(let tries=0; tries<80; tries++){
    const c=1+Math.floor(Math.random()*(cfg.cols-2));
    const r=1+Math.floor(Math.random()*(cfg.rows-2));
    const w=cellToWorld(cfg,c,r);
    // must not be inside a wall
    let blocked=false;
    for(const wl of S.walls){ if(w.x>wl.minX-0.6&&w.x<wl.maxX+0.6&&w.z>wl.minZ-0.6&&w.z<wl.maxZ+0.6){ blocked=true; break; } }
    if(blocked) continue;
    let near=1e9;
    S.bugs.forEach(b=>{ near=Math.min(near, Math.hypot(b.group.position.x-w.x, b.group.position.z-w.z)); });
    if(S.boss) near=Math.min(near, Math.hypot(S.boss.group.position.x-w.x, S.boss.group.position.z-w.z));
    if(near>bestD){ bestD=near; best=w; }
    if(near>14) break;                      // good enough, stop early
  }
  return best || cellToWorld(cfg,1,1);
}
function vaporize(){
  const p=S.playerObj; if(!p || S.vaporizing) return;
  S.vaporizing=true; S.paused=false;
  const px=p.position.x, pz=p.position.z;
  // dissolve: particles up, body shrinks away
  burst(px,pz,S.player.color,52);
  burst(px,pz,0xffffff,26);
  const col=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.6,7,16,1,true),
    new THREE.MeshBasicMaterial({ color:S.player.color, transparent:true, opacity:0.7, side:THREE.DoubleSide, depthWrite:false }));
  col.position.set(px,3.5,pz); scene.add(col);
  setMood('hurt','💥',1400);
  comms('S.P.A.R.K.','Signal lost! Rebuilding her data — hold on…', true);
  sfx('hit');
  S.dissolve={ t:0, col };
  p.visible=false;
  S.vapAt=performance.now();
}
function regenerate(){
  S.py=0; S.vy=0; S.launch=null;
  const p=S.playerObj; if(!p) return;
  const spot=safeRespawnSpot();
  p.position.x=spot.x; p.position.z=spot.z;
  p.visible=true;
  S.iframes=2.4;                                   // safe window after coming back
  // shove any nearby bug away and stun it so the restart is genuinely fresh
  S.bugs.forEach(b=>{
    const d=Math.hypot(b.group.position.x-spot.x, b.group.position.z-spot.z);
    if(d<10){ b.state='stun'; b.stun=3.5; b.mat.color.setRGB(0.45,0.7,1.0); }
  });
  burst(spot.x,spot.z,0x8ff6ff,40);
  cam.target.set(spot.x,0.8,spot.z);
  S.vaporizing=false;
  setMood('happy','✨',1400);
  comms('S.P.A.R.K.','She is back online. Bugs pushed clear — go!', true);
  updateHud();
}
function updateVaporize(){
  if(!S.vaporizing || !S.vapAt) return;
  if(performance.now()-S.vapAt >= 1250){ S.vapAt=0; regenerate(); }
}
function updateDissolve(dt){
  if(!S.dissolve) return;
  S.dissolve.t+=dt;
  const c=S.dissolve.col;
  c.scale.setScalar(1+S.dissolve.t*2.5);
  c.material.opacity=Math.max(0, 0.7 - S.dissolve.t*0.9);
  if(S.dissolve.t>0.9){ scene.remove(c); S.dissolve=null; }
}

/* ---------- sister portrait + comms chatter ---------- */
const SIS={ natalia:'Natalia', alana:'Alana', maya:'Maya' };
let commsTimer=null, moodTimer=null, lastComms=0;
function setMood(mood, emoji, ms){
  const p=byId('portrait'); if(!p) return;
  p.classList.remove('happy','worried','hurt');
  if(mood) p.classList.add(mood);
  byId('portraitMood').textContent=emoji||'';
  clearTimeout(moodTimer);
  if(mood) moodTimer=setTimeout(()=>{ p.classList.remove('happy','worried','hurt'); byId('portraitMood').textContent=''; }, ms||2200);
}
/* the two sisters who are NOT playing, plus S.P.A.R.K., are on comms */
function otherSisters(){ return Object.keys(SIS).filter(k=>k!==S.chosen).map(k=>SIS[k]); }
function comms(who, line, force){
  const now=performance.now();
  if(!force && now-lastComms < 6000) return;    // don't spam
  lastComms=now;
  const el=byId('comms'); if(!el) return;
  el.innerHTML='<b>'+who+':</b> '+line;
  el.classList.add('show');
  clearTimeout(commsTimer);
  commsTimer=setTimeout(()=>el.classList.remove('show'), 3600);
}
function commsSay(line){ const i=line.indexOf(':'); if(i>0) comms(line.slice(0,i), line.slice(i+1).trim(), true); else comms('COMMS', line, true); }
const PRAISE=['Nice one!','That is it!','You got it!','Clean work!','Yes! Keep going!'];
const STREAK=['You are on fire!','Three in a row!','Nobody is stopping you!'];
const NEARBUG=['Bug on your tail!','Behind you — move!','Incoming, dodge!'];
const LOWLIFE=['Careful, you are hurt!','One more hit and we lose you!','Get some distance!'];
function commsPraise(streak){
  const who=otherSisters()[Math.floor(Math.random()*2)];
  if(streak>=3) comms(who, STREAK[Math.floor(Math.random()*STREAK.length)]);
  else comms(who, PRAISE[Math.floor(Math.random()*PRAISE.length)]);
  setMood('happy','😄');
}
function commsWarn(){
  const who=otherSisters()[Math.floor(Math.random()*2)];
  comms(who, NEARBUG[Math.floor(Math.random()*NEARBUG.length)]);
  setMood('worried','😟',1800);
}
function commsHurt(){
  comms('S.P.A.R.K.', LOWLIFE[Math.floor(Math.random()*LOWLIFE.length)], true);
  setMood('hurt','😣',1400);
}

/* ---------- sector-clear celebration ---------- */
function celebrateKey(x,z){
  const cfg=BOARDS[S.board];
  S.keyPiece = spawnKeyPiece(x, z, cfg);       // key rises out of the floor
  burst(x,z,NEON.gold,44);
  const el=byId('keyBanner');
  byId('keyBannerTitle').textContent=cfg.key.toUpperCase()+' FOUND!';
  byId('keyBannerSub').textContent=cfg.system+' is back online — follow the arrow to the portal.';
  byId('keyBannerCount').textContent='KEY '+(S.keys+1)+' OF '+BOARDS.length;
  el.classList.remove('hidden'); el.classList.add('show');
  setTimeout(()=>{ el.classList.remove('show'); setTimeout(()=>el.classList.add('hidden'),600); }, 4600);
  playSectorVO(S.board);
}
function playSectorVO(i){
  if(!musicOn) return;
  const a=SECTOR_VO[i]; if(!a) return;
  try{ if(a.readyState>0) a.currentTime=0; }catch(e){}
  music.volume=0.16;
  const p=a.play(); if(p&&p.catch) p.catch(()=>{ music.volume=0.45; });
  a.onended=()=>{ music.volume=0.45; };
}

/* ---------- KEY PIECE: rises out of the floor when a sector is cleared ---------- */
function spawnKeyPiece(x,z,cfg){
  const g=new THREE.Group();
  const col=NEON.gold;
  // the fragment itself — a glowing angular shard
  const shard=new THREE.Mesh(new THREE.OctahedronGeometry(0.55,0),
    new THREE.MeshStandardMaterial({ color:0x3a2a00, emissive:col, emissiveIntensity:2.4, metalness:0.85, roughness:0.15 }));
  shard.scale.set(0.7,1.5,0.7); g.add(shard);
  const halo=new THREE.Mesh(new THREE.TorusGeometry(0.85,0.05,12,40),
    new THREE.MeshBasicMaterial({ color:col, transparent:true, opacity:0.9 }));
  halo.rotation.x=Math.PI/2; g.add(halo);
  // light column shooting up from the floor
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.55,1.1,26,20,1,true),
    new THREE.MeshBasicMaterial({ color:col, transparent:true, opacity:0.30, side:THREE.DoubleSide, depthWrite:false }));
  beam.position.y=13; g.add(beam);
  // ground shockwave ring
  const wave=new THREE.Mesh(new THREE.RingGeometry(0.4,0.75,56),
    new THREE.MeshBasicMaterial({ color:col, transparent:true, opacity:0.95, side:THREE.DoubleSide }));
  wave.rotation.x=-Math.PI/2; wave.position.y=0.08; g.add(wave);
  const light=new THREE.PointLight(col, 90, 30); light.position.y=2; g.add(light);
  g.position.set(x,-2.2,z);              // starts BELOW the floor and rises
  worldGroup.add(g);
  return { group:g, shard, halo, beam, wave, light, t:0, x, z };
}
function updateKeyPiece(dt){
  const k=S.keyPiece; if(!k) return;
  k.t+=dt;
  const rise=Math.min(1, k.t/1.1);
  const ease=1-Math.pow(1-rise,3);
  k.group.position.y = -2.2 + ease*3.6;                 // emerge from the floor
  k.shard.rotation.y += dt*2.2;
  k.halo.rotation.z  += dt*1.4;
  k.halo.scale.setScalar(1 + Math.sin(k.t*3)*0.08);
  k.light.intensity = 60 + Math.sin(k.t*6)*30;
  // shockwave expands then fades
  const w=Math.min(1, k.t/1.4);
  k.wave.scale.setScalar(1 + w*14);
  k.wave.material.opacity = Math.max(0, 0.95 - w);
  k.beam.material.opacity = 0.20 + Math.sin(k.t*4)*0.10;
}

/* ---------- puzzle modal ---------- */
let activeStation=null;
function tryStation(force){
  if(!S||!S.running||S.paused) return;
  // find nearest unsolved station in range
  let near=null, bd=1.7;
  S.stations.forEach(st=>{ if(st.solved) return; if(Math.abs((S.py||0)-(st.y||0))>1.4) return; const d=Math.hypot(S.playerObj.position.x-st.x, S.playerObj.position.z-st.z); if(d<bd){ bd=d; near=st; } });
  if(!near) return;
  openPuzzle(near);
}
function openPuzzle(st){
  S.paused=true; activeStation=st; st.inRange=true;
  const stageIdx = st.num-1;                       // checkpoint 1..4 -> stage I/WE/YOU/APPLY
  const it = window.TEACH_BANK.item(S.grade, S.board, stageIdx, st._variant||0);
  if(st.done>=stationQuota()) { S.paused=false; return; }
  st._q=it; st._tries=0; st._reteaching=false;
  // Checkpoint 1 of a NEW lesson teaches first
  if(stageIdx===0 && st.done===0 && !it.review){ showTeach(it, ()=>renderQuestion(st)); }
  else renderQuestion(st);
}
function showTeach(it, done){
  byId('teachKicker').textContent='S.P.A.R.K. · '+it.lessonId+' · '+it.lessonName.toUpperCase();
  byId('teachHead').textContent=it.teach.head;
  byId('teachBody').textContent=it.teach.body;
  byId('teachKey').textContent=it.teach.key||'';
  show(byId('teachCard'));
  byId('teachGo').onclick=()=>{ hide(byId('teachCard')); done(); };
}
function showReteach(st){
  const it=st._q;
  byId('teachKicker').textContent='S.P.A.R.K. · ANOTHER WAY TO SEE IT';
  byId('teachHead').textContent=it.reteach.head;
  byId('teachBody').textContent=it.reteach.body;
  byId('teachKey').textContent='';
  show(byId('teachCard'));
  byId('teachGo').onclick=()=>{
    hide(byId('teachCard'));
    // give a PARALLEL item on the same skill, not the same one
    const stageIdx=st.num-1;
    st._q=window.TEACH_BANK.item(S.grade, S.board, stageIdx, (st._variant||0)+1);
    st._reteaching=true; st._tries=0;
    renderQuestion(st);
  };
}
function renderQuestion(st){
  const q=st._q, cfg=BOARDS[S.board];
  const badge=' <span class="stage-badge">'+window.TEACH_BANK.stageLabel(q.stage)+'</span>';
  byId('puzzleKicker').innerHTML='CHECKPOINT '+st.num+'/'+cfg.checks+' · Q'+(st.done+1)+' of '+stationQuota()+' · '+q.lessonId+badge;
  byId('puzzleQ').textContent=q.q;
  byId('puzzleSub').textContent= st._reteaching ? 'Let\u2019s try one more like it' : (q.lessonName+' · Grade '+S.grade);
  // "WE" stage shows the hint up front — that is the guided step
  byId('puzzleHint').textContent = (q.stage==='WE') ? 'Hint: '+q.hint : '';
  const wrap=byId('puzzleAnswers'); wrap.innerHTML='';
  q.choices.forEach((ch,i)=>{ const b=document.createElement('button'); b.textContent=ch; b.addEventListener('click',()=>answer(st,i,b)); wrap.appendChild(b); });
  show(byId('puzzleModal'));
}
function recordMastery(q, correct, firstTry){
  const k=q.lessonId;
  const m=S.mastery[k] || (S.mastery[k]={ name:q.lessonName, sk:q.sk, asked:0, right:0, firstTry:0 });
  m.asked++; if(correct) m.right++; if(correct && firstTry) m.firstTry++;
  agaReportAttempt(q, correct, firstTry);
}
function answer(st,idx,btn){
  const q=st._q;
  if(idx===q.correct){
    btn.classList.add('right'); sfx('correct');
    const firstTry = st._tries===0 && !st._reteaching;
    recordMastery(q, true, firstTry);
    S.boardAsked++; if(firstTry){ S.boardFirst++; S.streak++; } else S.streak=0;
    commsPraise(S.streak);
    st.done++; S.solved++; S.score+= firstTry?120:70;
    S.zaps=Math.min(S.zaps+1, 6);
    updateStationPips(st);
    const finished = st.done >= stationQuota();
    if(finished){ st.solved=true; S.checksLeft=Math.max(0,S.checksLeft-1); }
    setTimeout(()=>{
      hide(byId('puzzleModal'));
      if(!finished){
        // next question at the SAME station
        st._variant=(st._variant||0)+1; st._tries=0; st._reteaching=false;
        const stageIdx=st.num-1;
        st._q=window.TEACH_BANK.item(S.grade, S.board, stageIdx, st._variant);
        renderQuestion(st);
        return;
      }
      S.paused=false; activeStation=null;
      grayOutStation(st);
      burst(st.x,st.z,NEON.green,26);
      if(S.checksLeft===0){
        if(S.boss){ S.boss.vulnerable=true; S.boss.mode='descend'; S.boss.descendAt=performance.now();
          S.boss.shell.material.opacity=0.42; showBossBanner(); }
        else {
          S.portal.active=true;
          S.portal.rings.forEach(r=>{ r.material.emissive.setHex(NEON.cyan); r.material.emissiveIntensity=2.2; });
          S.portal.disc.material.opacity=0.9;
          S.portal.beam.material.opacity=0.35;
          sfx('portal');
          celebrateKey(st.x, st.z);
        }
      }
      else toast('Checkpoint '+st.num+' complete! '+S.checksLeft+' station'+(S.checksLeft>1?'s':'')+' left');
      updateHud(); updateObjective();
    },420);
  } else {
    btn.classList.add('wrong'); sfx('wrong'); st._tries++; S.streak=0;
    if(st._tries===1 && !st._reteaching){
      recordMastery(q, false, false);
      setTimeout(()=>{ hide(byId('puzzleModal')); showReteach(st); }, 500);
    } else if(st._tries===1){
      byId('puzzleHint').textContent='Hint: '+q.hint;
    } else {
      byId('puzzleHint').textContent='Here it is — tap the highlighted answer so it sticks.';
      byId('puzzleAnswers').querySelectorAll('button')[q.correct].classList.add('right');
    }
  }
}

/* ---------- zapper ---------- */
const zapRings=[];
function fireZapper(){
  if(!S||!S.running||S.paused) return;
  if(S.zaps<=0){ toast('No zappers! Solve a station to earn one.'); return; }
  S.zaps--; sfx('zap'); updateHud();
  const p=S.playerObj.position;
  // stun bugs within radius
  const R=8;
  let hit=0;
  S.bugs.forEach(b=>{ if(Math.hypot(b.group.position.x-p.x, b.group.position.z-p.z)<R){ b.state='stun'; b.stun=5; hit++; } });
  S.zapped+=hit;
  // expanding ring VFX
  const ring=new THREE.Mesh(new THREE.RingGeometry(0.2,0.5,48),
    new THREE.MeshBasicMaterial({ color:NEON.gold, transparent:true, opacity:0.9, side:THREE.DoubleSide }));
  ring.rotation.x=-Math.PI/2; ring.position.set(p.x,0.1,p.z); scene.add(ring);
  zapRings.push({ mesh:ring, t:0 });
  toast(hit>0? `ZAP! Stunned ${hit} glitcher${hit>1?'s':''}.` : 'Zapper fired — no glitchers in range.');
}

/* ---------- particles ---------- */
const particles=[];
function burst(x,z,color,n){
  for(let i=0;i<n;i++){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1), new THREE.MeshBasicMaterial({ color })); m.position.set(x,1,z); scene.add(m); const a=Math.random()*6.28, sp=rand(2,7); particles.push({ mesh:m, vx:Math.cos(a)*sp, vy:rand(1,5), vz:Math.sin(a)*sp, life:rand(0.4,0.9), max:0.9 }); }
}

/* ---------- collision ---------- */
function resolve(px,pz,r){
  for(const w of S.walls){
    const cx=THREE.MathUtils.clamp(px,w.minX,w.maxX), cz=THREE.MathUtils.clamp(pz,w.minZ,w.maxZ);
    const dx=px-cx, dz=pz-cz, d=Math.hypot(dx,dz);
    if(d<r && d>0.0001){ const push=(r-d); px+=dx/d*push; pz+=dz/d*push; }
    else if(d===0){ px=w.maxX+r; }
  }
  return {x:px,z:pz};
}

/* ---------- player load ---------- */
async function spawnPlayer(){
  const c=CHARS[S.chosen];
  const root=await loadGLB(c.glb);
  root.traverse(o=>{ if(o.isMesh){ o.frustumCulled=false; } });
  // normalize to target height, feet at 0
  const box=new THREE.Box3().setFromObject(root); const size=new THREE.Vector3(); box.getSize(size);
  root.scale.setScalar(c.h/size.y);
  const box2=new THREE.Box3().setFromObject(root); const ctr=new THREE.Vector3(); box2.getCenter(ctr);
  const wrap=new THREE.Group(); wrap.add(root);
  root.position.x-=ctr.x; root.position.z-=ctr.z; root.position.y-=box2.min.y;
  // glowing platform under player
  const ringMat=new THREE.MeshStandardMaterial({ color:0x000000, emissive:c.color, emissiveIntensity:2 });
  const ring=new THREE.Mesh(new THREE.TorusGeometry(0.7,0.05,14,48), ringMat); ring.rotation.x=Math.PI/2; ring.position.y=0.04; wrap.add(ring);
  wrap.userData.ring=ring;
  wrap.userData.body=root;
  wrap.userData.baseY=root.position.y;
  wrap.userData.baseScale=c.h/size.y;
  // VISIBLE ZAPPER: a glowing core that orbits the sister, brighter with charges
  const zapCore=new THREE.Group();
  const orb=new THREE.Mesh(new THREE.IcosahedronGeometry(0.20,1),
    new THREE.MeshStandardMaterial({ color:0x3a2c00, emissive:NEON.gold, emissiveIntensity:0.35, metalness:0.7, roughness:0.2 }));
  zapCore.add(orb);
  const halo=new THREE.Mesh(new THREE.TorusGeometry(0.32,0.03,10,28),
    new THREE.MeshBasicMaterial({ color:NEON.gold, transparent:true, opacity:0.25 }));
  halo.rotation.x=Math.PI/2; zapCore.add(halo);
  const zapLight=new THREE.PointLight(NEON.gold, 0, 6); zapCore.add(zapLight);
  zapCore.position.set(0.75, c.h*0.55, 0);
  wrap.add(zapCore);
  wrap.userData.zapCore=zapCore; wrap.userData.zapOrb=orb; wrap.userData.zapHalo=halo; wrap.userData.zapLight=zapLight;
  scene.add(wrap);
  S.playerObj=wrap; S.player=c;
  const pi=byId('portraitImg'); if(pi){ pi.src='assets/'+S.chosen+'-face.png'; pi.alt=SIS[S.chosen]; }
}

/* ---------- minimap + objective arrow ---------- */
const mmCanvas = byId('minimap'), mmCtx = mmCanvas ? mmCanvas.getContext('2d') : null;
function currentTarget(){
  if(!S) return null;
  // priority: unsolved gate station -> exposed boss -> active portal
  let best=null, bd=1e9;
  S.stations.forEach(st=>{ if(st.solved) return; const d=Math.hypot(S.playerObj.position.x-st.x,S.playerObj.position.z-st.z); if(d<bd){bd=d;best={x:st.x,z:st.z,label:'CHECKPOINT '+st.num};} });
  if(best) return best;
  if(S.boss) return { x:S.boss.group.position.x, z:S.boss.group.position.z, label:'THE GLITCHER' };
  if(S.portal && S.portal.active) return { x:S.portal.x, z:S.portal.z, label:'ESCAPE PORTAL' };
  return null;
}
function drawMinimap(){
  if(!mmCtx || !S || !S.playerObj) return;
  const cfg=BOARDS[S.board];
  const W=mmCanvas.width, H=mmCanvas.height, pad=8;
  const bw=cfg.cols*CELL, bh=cfg.rows*CELL;
  const sc=Math.min((W-pad*2)/bw, (H-pad*2)/bh);
  const toMap=(x,z)=>({ mx:W/2 + x*sc, my:H/2 + z*sc });
  mmCtx.clearRect(0,0,W,H);
  mmCtx.fillStyle='rgba(4,8,20,0.55)'; mmCtx.fillRect(0,0,W,H);
  // walls
  mmCtx.fillStyle='rgba(120,170,220,0.30)';
  const ws=Math.max(2, CELL*sc*0.85);
  S.walls.forEach(w=>{ const c=toMap((w.minX+w.maxX)/2,(w.minZ+w.maxZ)/2); mmCtx.fillRect(c.mx-ws/2,c.my-ws/2,ws,ws); });
  // bits
  mmCtx.fillStyle='rgba(120,235,255,0.75)';
  S.bits.forEach(b=>{ if(b.got) return; const c=toMap(b.x,b.z); mmCtx.fillRect(c.mx-1,c.my-1,2,2); });
  // stations
  S.stations.forEach(st=>{ const c=toMap(st.x,st.z);
    mmCtx.fillStyle = st.solved ? 'rgba(90,140,110,0.7)' : (st.isGate?'#ffd23f':'#39d99a');
    mmCtx.beginPath(); mmCtx.arc(c.mx,c.my,3.2,0,6.3); mmCtx.fill(); });
  // portal
  if(S.portal){ const c=toMap(S.portal.x,S.portal.z);
    mmCtx.strokeStyle = S.portal.active ? '#36e8ff' : 'rgba(120,150,190,0.5)';
    mmCtx.lineWidth=2; mmCtx.beginPath(); mmCtx.arc(c.mx,c.my,4.5,0,6.3); mmCtx.stroke(); }
  // bugs
  mmCtx.fillStyle='#ff4f6c';
  S.bugs.forEach(b=>{ const c=toMap(b.group.position.x,b.group.position.z); mmCtx.beginPath(); mmCtx.arc(c.mx,c.my,2.4,0,6.3); mmCtx.fill(); });
  // boss
  if(S.boss){ const c=toMap(S.boss.group.position.x,S.boss.group.position.z);
    mmCtx.fillStyle='#b44dff'; mmCtx.beginPath(); mmCtx.arc(c.mx,c.my,5,0,6.3); mmCtx.fill(); }
  // player
  const pc=toMap(S.playerObj.position.x,S.playerObj.position.z);
  mmCtx.fillStyle='#ffffff'; mmCtx.beginPath(); mmCtx.arc(pc.mx,pc.my,3.4,0,6.3); mmCtx.fill();
  mmCtx.strokeStyle='#36e8ff'; mmCtx.lineWidth=1.5; mmCtx.stroke();
}
function updateGuide(){
  const g=byId('guide'); if(!g||!S||!S.playerObj) return;
  const tgt=currentTarget();
  if(!tgt){ g.style.opacity=0; return; }
  g.style.opacity=1;
  const dx=tgt.x-S.playerObj.position.x, dz=tgt.z-S.playerObj.position.z;
  const dist=Math.hypot(dx,dz);
  // convert world direction into screen-space angle using the current camera yaw
  const fx=-Math.sin(cam.theta), fz=-Math.cos(cam.theta);      // camera forward
  const rx=-fz, rz=fx;                                          // camera right
  const ang=Math.atan2(dx*rx+dz*rz, dx*fx+dz*fz);               // 0 = straight ahead (up on screen)
  byId('guideArrow').style.transform=`rotate(${ang*180/Math.PI - 90}deg)`;
  byId('guideLabel').textContent=`${tgt.label} · ${Math.round(dist)}m`;
}

/* ---------- HUD ---------- */
function heartSvg(f){ return '<svg class="heart" viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.3C.4 8.2 2 4.7 5.4 4.7c2 0 3.4 1.2 4.6 2.8 1.2-1.6 2.6-2.8 4.6-2.8 3.4 0 5 3.5 3.4 7C19.5 16.4 12 21 12 21z" fill="'+(f?'#ff5b7a':'rgba(255,120,150,.25)')+'" stroke="#ff9db2" stroke-width="1"/></svg>'; }
function zapSvg(){ return '<svg class="zap-i" viewBox="0 0 24 24"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="#ffd23f" stroke="#7a5a00" stroke-width="1"/></svg>'; }
function keySvg(f){ return '<svg class="zap-i" viewBox="0 0 24 24"><path d="M14 3a5 5 0 100 10 5 5 0 000-10zm-1.6 9.6L5 20v2h4v-2h2v-2h2l1.4-1.4z" fill="'+(f?'#7fe8ff':'rgba(120,180,220,.22)')+'" stroke="#36e8ff" stroke-width="1"/></svg>'; }
function updateHud(){
  byId('hudBoard').textContent=(S.board+1)+'/'+BOARDS.length;
  byId('hudScore').textContent=S.score;
  let h=''; for(let i=0;i<3;i++) h+=heartSvg(i<S.lives); byId('hudHearts').innerHTML=h;
  let z=''; for(let i=0;i<S.zaps;i++) z+=zapSvg(); byId('hudZaps').innerHTML=z||'<span style="color:#6f80a8;font-size:.8rem">0</span>';
  const zb=byId('zapBtn'), zc=byId('zapCount');
  if(zb){ zb.classList.toggle('charged', S.zaps>0); }
  if(zc){ zc.textContent=S.zaps; }
  const gm=byId('hudGems'); if(gm) gm.textContent=S.gems;
  const kw=byId('hudKeys');
  if(kw){ let k=''; for(let i=0;i<BOARDS.length;i++) k+=keySvg(i<S.keys); kw.innerHTML=k; }
}
function updateObjective(){
  const cfg=BOARDS[S.board];
  const done=cfg.checks-S.checksLeft;
  const o=byId('objective');
  if(S.checksLeft>0){
    const L=window.TEACH_BANK.lessonFor(S.grade,S.board);
    const qDone=S.stations.reduce((n,s2)=>n+s2.done,0), qTot=cfg.checks*stationQuota();
    o.innerHTML=`${window.TEACH_BANK.isReview(S.grade,S.board)?'Mixed review':L.name} — questions: <b>${qDone}/${qTot}</b> · stations left: <b>${S.checksLeft}</b>`;
  } else if(S.boss){
    o.innerHTML=`<b>GLITCHER DUEL</b> · get close and answer! shields: <b>${S.boss.hp}/3</b> · this shield: <b>${S.boss.seg}/${S.boss.segMax}</b>`;
  } else {
    o.innerHTML=`<b>${cfg.key} found!</b> Jump through the portal to repair ${cfg.system}`;
  }
}
let toastTimer=null;
function toast(msg){ const t=byId('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'),3000); }

/* ---------- damage ---------- */
function damage(){
  if(S.iframes>0 || S.vaporizing) return;
  S.lives--; S.iframes=1.5; updateHud(); S.streak=0;
  if(S.lives<=0){
    // no more mid-game reboot screen — she vaporizes and comes back rebuilt
    S.lives=3;
    S.gems=Math.max(0, S.gems - Math.floor(S.gems*0.25));   // small cost, keeps stakes
    updateHud();
    toast('Data destabilised! Rebuilding — you lost some gems, but your keys are safe.');
    vaporize();
  } else {
    commsHurt();
    burst(S.playerObj.position.x, S.playerObj.position.z, NEON.red, 18);
    toast('Hit by a glitcher! Lives: '+S.lives);
  }
  // shove nearby bugs away + short stun so a swarm can never chain-trap her
  const px=S.playerObj.position.x, pz=S.playerObj.position.z;
  S.bugs.forEach(b=>{
    const d=Math.hypot(b.group.position.x-px, b.group.position.z-pz);
    if(d<2.4){
      const k=(2.4-d)+1.4, dx=(b.group.position.x-px)/(d||1), dz=(b.group.position.z-pz)/(d||1);
      b.group.position.x=THREE.MathUtils.clamp(b.group.position.x+dx*k, S.bounds.minX, S.bounds.maxX);
      b.group.position.z=THREE.MathUtils.clamp(b.group.position.z+dz*k, S.bounds.minZ, S.bounds.maxZ);
      b.state='stun'; b.stun=Math.max(b.stun||0,1.3);
    }
  });
}

/* ---------- update ---------- */
const clock=new THREE.Clock();
const _pv=new THREE.Vector3();
let __frameCount=0;
function update(dt,t){ __frameCount++;
  if(!S||!S.running) return;
  S.iframes=Math.max(0,S.iframes-dt);

  // camera rig follows player
  if(S.playerObj){
    cam.target.lerp(new THREE.Vector3(S.playerObj.position.x,0.8+(S.py||0)*0.7,S.playerObj.position.z), Math.min(1,dt*6));
  }
  const sinP=Math.sin(cam.phi);
  camera.position.set(
    cam.target.x + cam.R*sinP*Math.sin(cam.theta),
    cam.target.y + cam.R*Math.cos(cam.phi),
    cam.target.z + cam.R*sinP*Math.cos(cam.theta)
  );
  camera.lookAt(cam.target);
  rimC.position.set(cam.target.x-6,4,cam.target.z-3);
  rimP.position.set(cam.target.x+6,4,cam.target.z+4);

  if(S.paused) return;

  // ---- player movement (camera-relative) ----
  const p=S.playerObj;
  const kv=keyVec(); const ix=kv.x+stickVec.x, iy=kv.y+stickVec.y;
  const fwd=new THREE.Vector2(-Math.sin(cam.theta), -Math.cos(cam.theta));   // into screen
  const right=new THREE.Vector2(-fwd.y, fwd.x);                              // cross(fwd,up)
  let mx=fwd.x*iy + right.x*ix, mz=fwd.y*iy + right.y*ix;
  const ml=(S.vaporizing||S.cinema)?0:Math.hypot(mx,mz);
  let moving=false;
  if(ml>0.02){
    moving=true;
    mx/=ml; mz/=ml;
    const sp=S.player.speed*dt;
    let nx=p.position.x+mx*sp, nz=p.position.z+mz*sp;
    const rr=(S.py>((S.wallH||2.2)-0.25))?{x:nx,z:nz}:resolve(nx,nz,0.55); nx=rr.x; nz=rr.z;
    nx=THREE.MathUtils.clamp(nx,S.bounds.minX,S.bounds.maxX);
    nz=THREE.MathUtils.clamp(nz,S.bounds.minZ,S.bounds.maxZ);
    p.position.x=nx; p.position.z=nz;
    p.rotation.y=Math.atan2(mx,mz);
  }

  // ---- vertical physics: launch pads + upper decks ----
  {
    const deckAt=(x,z)=> (S.decks||[]).find(d=> x>d.minX && x<d.maxX && z>d.minZ && z<d.maxZ) || null;
    const dkHere = deckAt(p.position.x, p.position.z);
    const support = (dkHere && S.py > dkHere.h-0.6) ? dkHere.h : 0;
    const grounded = S.py <= support + 0.02 && S.vy<=0;
    const pyBefore = S.py;
    // launch pad trigger (ground level only)
    if(grounded && S.py<0.1 && !S.vaporizing){
      for(const pd of S.pads){
        pd.cool=Math.max(0,pd.cool-dt);
        if(pd.cool<=0 && Math.hypot(p.position.x-pd.x,p.position.z-pd.z)<0.95){
          pd.cool=1.2;
          const h=(pd.h||3.2)+0.7;
          S.vy=Math.sqrt(2*22*h);
          const flight=(2*S.vy/22)*0.55;
          S.launch={ tx:pd.tx, tz:pd.tz, t:0, dur:Math.max(0.45,flight),
                     sx:p.position.x, sz:p.position.z };
          sfx('portal'); burst(pd.x,pd.z,NEON.cyan,16);
          toast('LAUNCH! Ride it up to the deck.');
        }
      }
    }
    if(!grounded || S.vy>0){
      S.vy -= 22*dt;
      S.py += S.vy*dt;
      if(S.launch){ // glide toward the deck centre while airborne
        S.launch.t+=dt;
        const k=Math.min(1, S.launch.t/S.launch.dur);
        p.position.x = S.launch.sx + (S.launch.tx-S.launch.sx)*k;
        p.position.z = S.launch.sz + (S.launch.tz-S.launch.sz)*k;
      }
      const dk2 = deckAt(p.position.x, p.position.z);
      const sup2 = (dk2 && S.py > dk2.h-0.6) ? dk2.h : 0;
      if(S.py<=sup2){ S.py=sup2; S.vy=0; S.launch=null; if(sup2>0) burst(p.position.x,p.position.z,NEON.cyan,8); }
      if(S.py<0){ S.py=0; S.vy=0; S.launch=null; }
    } else { S.py=support; }
    // LANDING GRACE: coming down off a deck grants a few seconds of protection
    // and shoves/stuns nearby bugs so they can't camp the landing.
    if(pyBefore>2 && S.py<0.7 && !S.launch){
      const nowMs=performance.now();
      if(!S.landGraceAt || nowMs-S.landGraceAt>4000){
        S.landGraceAt=nowMs;
        S.iframes=Math.max(S.iframes,3.0);
        S.bugs.forEach(b=>{
          const bd2=Math.hypot(b.group.position.x-p.position.x, b.group.position.z-p.position.z);
          if(bd2<6){ b.state='stun'; b.stun=Math.max(b.stun||0,2.5); }
        });
        toast('Landing shield! 3 seconds of protection.');
      }
    }
    p.position.y=S.py;
  }

  /* ---- run cycle ----
     The GLBs have no skeleton, so limbs can't swing. Instead the whole body
     runs: a two-step bounce, forward lean, side-to-side rock and a squash on
     each footfall. Reads as running at gameplay camera distance. */
  const body=p.userData.body;
  if(body){
    const STRIDE=13;                                  // steps per second-ish
    S.runPhase = (S.runPhase||0) + (moving? dt*STRIDE : 0);
    const decay = moving ? 1 : Math.max(0, (S.runBlend||0) - dt*5);
    S.runBlend = moving ? Math.min(1,(S.runBlend||0)+dt*6) : decay;
    const b=S.runBlend;
    const bounce=Math.abs(Math.sin(S.runPhase))*0.16*b;          // up on each step
    const rock=Math.sin(S.runPhase*0.5)*0.10*b;                  // hips sway L/R
    const lean=0.16*b;                                            // lean into the run
    const squash=1 - Math.abs(Math.cos(S.runPhase))*0.05*b;       // compress on landing
    const idle=moving?0:Math.sin(t*2)*0.012;                      // gentle breathing
    const bs=p.userData.baseScale||1;
    body.position.y = p.userData.baseY + bounce + idle;
    body.rotation.x = -lean;
    body.rotation.z = rock;
    body.scale.y = bs*squash;
    body.scale.x = body.scale.z = bs*(1 + (1-squash)*0.5);
  }
  // visible zapper core orbits the sister and brightens with charges
  const zc=p.userData.zapCore;
  if(zc){
    zc.position.x=Math.cos(t*1.6)*0.78; zc.position.z=Math.sin(t*1.6)*0.78;
    const lvl=Math.min(1,S.zaps/3);
    p.userData.zapOrb.material.emissiveIntensity = 0.35 + lvl*2.6 + (S.zaps>0?Math.sin(t*5)*0.35:0);
    p.userData.zapHalo.material.opacity = 0.15 + lvl*0.6;
    p.userData.zapHalo.rotation.z += dt*2;
    p.userData.zapLight.intensity = lvl*22;
  }
  // i-frame blink
  p.visible = S.vaporizing ? false : (S.iframes>0 ? (Math.floor(t*12)%2===0) : true);

  // ---- stations proximity (auto-open) ----
  S.stations.forEach(st=>{
    if(st.solved){ st.group.rotation.y+=dt*0.5; return; }
    st.ring.rotation.z+=dt*2; st.panel.rotation.y=Math.sin(t*2)*0.2;
    st.beam.material.opacity=0.2+Math.sin(t*3+st.num)*0.1;
    st.numSpr.position.y=3.0+Math.sin(t*2+st.num)*0.15;
    const d=Math.hypot(p.position.x-st.x, p.position.z-st.z);
    if(d<1.6 && Math.abs((S.py||0)-(st.y||0))<1.4 && !st.inRange && !S.paused){ openPuzzle(st); }   // checkpoints auto-open (same level only)
    if(d>2.2) st.inRange=false;
  });

  // ---- gems ----
  S.bits.forEach(bt=>{ if(bt.got) return;
    bt.gem.rotation.y+=dt*2.4; bt.mesh.position.y=0.9+Math.sin(t*3+bt.x)*0.14;
    if(Math.hypot(p.position.x-bt.x,p.position.z-bt.z)<0.9){
      bt.got=true; bt.mesh.visible=false;
      S.gems++; S.score+=25; sfx('bit'); agaReportCoin();
      burst(bt.x,bt.z,0x59e8ff,10);
      // BANKING: gems convert into real rewards at thresholds
      if(S.gems % 10 === 0 && S.zaps < 6){ S.zaps=Math.min(6,S.zaps+1); toast('💎 10 gems banked — bonus ZAPPER earned!'); }
      else if(S.gems % 25 === 0 && S.lives < 5){ S.lives++; toast('💎 25 gems banked — EXTRA LIFE!'); }
      updateHud();
    } });

  // ---- bugs ----
  S.bugs.forEach(b=>{
    b.phase+=dt;
    b.group.position.y=b.y+Math.sin(b.phase*2)*0.12;
    if(b.state==='stun'){ b.stun-=dt; b.mat.color.setRGB(0.45,0.7,1.0); b.mat.opacity=0.85; if(b.stun<=0){ b.state='roam'; b.mat.color.setRGB(1,1,1); b.mat.opacity=1; } return; }
    const d=Math.hypot(p.position.x-b.group.position.x, p.position.z-b.group.position.z);
    let dx=0,dz=0;
    const playerUp=(S.py||0)>0.7;   // she's on a deck — bugs can't reach her, so don't cluster below
    if(d<13 && !playerUp){ dx=(p.position.x-b.group.position.x)/d; dz=(p.position.z-b.group.position.z)/d; }
    else { b.wanderA+=rand(-1,1)*dt; dx=Math.cos(b.wanderA); dz=Math.sin(b.wanderA); }
    const bsp=((d<13&&!playerUp)?3.2:1.6)*diff().speed*dt;
    let nx=b.group.position.x+dx*bsp, nz=b.group.position.z+dz*bsp;
    // NO CAMPING under a deck: strong outward shove if a bug wanders beneath one
    const dkb=(S.decks||[]).find(k=> nx>k.minX-0.6 && nx<k.maxX+0.6 && nz>k.minZ-0.6 && nz<k.maxZ+0.6);
    if(dkb){
      const ox=nx-dkb.x, oz=nz-dkb.z, ol=Math.hypot(ox,oz)||1;
      nx += (ox/ol)*4.5*dt*3; nz += (oz/ol)*4.5*dt*3;
      b.wanderA=Math.atan2(oz,ox);   // keep walking away, not back in
    }
    const rr=resolve(nx,nz,b.r); nx=rr.x; nz=rr.z;
    nx=THREE.MathUtils.clamp(nx,S.bounds.minX,S.bounds.maxX); nz=THREE.MathUtils.clamp(nz,S.bounds.minZ,S.bounds.maxZ);
    b.group.position.x=nx; b.group.position.z=nz;
    if(d<4.2 && d>1.1 && b.state!=='stun' && S.iframes<=0 && (S.py||0)<0.7) commsWarn();
    if(d<1.1 && (S.py||0)<0.7) damage();
  });

  // ---- The Glitcher ----
  if(S.boss){
    const bo=S.boss; bo.phase+=dt;
    bo.core.rotation.y+=dt*0.8; bo.core.rotation.x+=dt*0.35;
    bo.shell.rotation.y-=dt*0.5;
    bo.rings.forEach((r,i)=>{ r.rotation.z+=dt*(i%2?0.9:-0.9); });
    bo.eye.material.emissiveIntensity = bo.vulnerable ? 3.4 : 2.0+Math.sin(bo.phase*6)*0.6;
    const bd=Math.hypot(p.position.x-bo.group.position.x, p.position.z-bo.group.position.z);
    if(bo.mode==='arrive'){
      // cinematic descent from the sky while her entry taunt plays (wall-clock: sandbox runs 2-4fps)
      const k=Math.min(1,(performance.now()-bo.arriveAt)/3600);
      bo.group.position.y = 20 - (20-bo.hoverY)*(k*k*(3-2*k));   // smoothstep
      if(k>=1){ bo.mode='hover'; S.cinema=false;
        toast('Solve all '+BOARDS[S.board].checks+' checkpoints to assemble the Master Key!'); }
    } else if(bo.mode==='hover'){
      // she floats above the maze, shadowing the player and talking trash — untouchable up there
      bo.group.position.y = bo.hoverY + Math.sin(bo.phase*1.2)*0.55;
      if(bd>0.001){
        const spd=3.0*dt;
        bo.group.position.x=THREE.MathUtils.clamp(bo.group.position.x+(p.position.x-bo.group.position.x)/bd*spd,S.bounds.minX,S.bounds.maxX);
        bo.group.position.z=THREE.MathUtils.clamp(bo.group.position.z+(p.position.z-bo.group.position.z)/bd*spd,S.bounds.minZ,S.bounds.maxZ);
      }
      scheduleHoverTaunt();
    } else if(bo.mode==='descend'){
      // Master Key assembled — she drops to the floor for the duel
      const k=Math.min(1,(performance.now()-bo.descendAt)/2200);
      bo.group.position.y = bo.hoverY - (bo.hoverY-1.7)*(k*k*(3-2*k));
      if(k>=1) bo.mode='duel';
    } else {
      // duel: ground level, hunts the player, close range starts the QUESTION DUEL
      bo.group.position.y=1.7+Math.sin(bo.phase*1.4)*0.22;
      if(bd>0.001){
        const spd=2.4*dt;
        let nx=bo.group.position.x+(p.position.x-bo.group.position.x)/bd*spd;
        let nz=bo.group.position.z+(p.position.z-bo.group.position.z)/bd*spd;
        bo.group.position.x=THREE.MathUtils.clamp(nx,S.bounds.minX,S.bounds.maxX);
        bo.group.position.z=THREE.MathUtils.clamp(nz,S.bounds.minZ,S.bounds.maxZ);
      }
      S.battleCool=Math.max(0,(S.battleCool||0)-dt);
      if(bo.vulnerable && bd<4.6 && S.battleCool<=0 && !S.paused && (S.py||0)<0.7) openBattle();
    }
  }

  // ---- portal ----
  const po=S.portal;
  po.rings.forEach((r,i)=>{ r.rotation.z+=dt*(i%2?1.4:-1.4); });
  po.disc.rotation.z-=dt*(po.active?2.6:0.5);
  po.disc.lookAt(camera.position.x,po.disc.getWorldPosition(_pv).y,camera.position.z);
  if(po.active){
    po.beam.material.opacity=0.25+Math.sin(t*4)*0.12;
    if(Math.hypot(p.position.x-po.x,p.position.z-po.z)<1.6){ nextBoard(); }
  }

  // ---- zap rings ----
  for(let i=zapRings.length-1;i>=0;i--){ const zr=zapRings[i]; zr.t+=dt; const s=1+zr.t*16; zr.mesh.scale.set(s,s,s); zr.mesh.material.opacity=Math.max(0,0.9-zr.t*1.2); if(zr.t>0.8){ scene.remove(zr.mesh); zapRings.splice(i,1); } }
  // ---- particles ----
  for(let i=particles.length-1;i>=0;i--){ const pt=particles[i]; pt.life-=dt; if(pt.life<=0){ scene.remove(pt.mesh); particles.splice(i,1); continue; } pt.vy-=9*dt; pt.mesh.position.x+=pt.vx*dt; pt.mesh.position.y+=pt.vy*dt; pt.mesh.position.z+=pt.vz*dt; pt.mesh.material.opacity=pt.life/pt.max; }

  const motes=scene.getObjectByName('motes'); if(motes){ motes.rotation.y+=dt*0.03; }
  glyphs.forEach(gl=>{ gl.sp.position.y+=gl.vy*dt; if(gl.sp.position.y>gl.top){ gl.sp.position.y=1.5; } });
  spinners.forEach(sp=>{ sp.o.rotation.y+=dt*sp.sp; });
  (S.pads||[]).forEach(pd=>{ pd.ring.rotation.z+=dt*2.2; pd.arrow.position.y=0.9+Math.sin(t*3)*0.18; pd.arrow.rotation.y+=dt*1.5; });
  updateKeyPiece(dt);
  updateHazards(dt,t);
  updateVaporize();
  updateDissolve(dt);
  drawMinimap(); updateGuide();
}

function nextBoard(){
  sfx('portal');
  const done=BOARDS[S.board];
  S.keys++; S.score+=200;
  updateHud();
  const last = S.board >= BOARDS.length-1;
  const nxt = last ? null : BOARDS[S.board+1];
  // Jurassic Journey-style gate transition
  S.paused=true;
  const total=done.checks*(done.boss?2:PER_STATION);
  const gr = S.boardFirst>=total ? ['GOLD','#ffd23f'] : S.boardFirst>=total-2 ? ['SILVER','#cfe0ff'] : ['BRONZE','#e0955a'];
  const prev=S.grades[S.board];
  const rank={BRONZE:1,SILVER:2,GOLD:3};
  if(!prev || rank[gr[0]]>rank[prev]) S.grades[S.board]=gr[0];
  saveProgress();
  byId('warpKicker').innerHTML = done.key.toUpperCase()+' RECOVERED · '+S.keys+'/'+BOARDS.length
    + ' &nbsp;·&nbsp; <span style="color:'+gr[1]+'">'+gr[0]+' — '+S.boardFirst+'/'+total+' first try</span>';
  byId('warpTitle').textContent = last ? 'MASTER KEY COMPLETE' : nxt.name.toUpperCase();
  byId('warpSub').textContent = last ? 'Opening the way home…' : (done.system+' is back online. Hopping deeper into the machine…');
  show(byId('warp'));
  setTimeout(()=>{
    hide(byId('warp'));
    S.paused=false;
    if(!last){ S.board++; buildBoard(); }
    else winGame();
  }, 2400);
}

/* ---------- save / resume ---------- */
const SAVE_KEY='screenhop3d.save.v1';
function saveProgress(){
  if(!S) return;
  try{ localStorage.setItem(SAVE_KEY, JSON.stringify({
    chosen:S.chosen, grade:S.grade, board:S.board, keys:S.keys, gems:S.gems,
    score:S.score, grades:S.grades, mastery:S.mastery, ts:Date.now()
  })); }catch(e){}
}
function loadProgress(){
  try{ const raw=localStorage.getItem(SAVE_KEY); return raw? JSON.parse(raw) : null; }catch(e){ return null; }
}
function clearProgress(){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} }

/* ---------- flow ---------- */
let rafStarted=false, lastT=0;
function loop(now){
  requestAnimationFrame(loop);
  if(!lastT){ lastT=now; }
  const dt=Math.min(0.04, (now-lastT)/1000); lastT=now;
  const t=now/1000;
  update(dt,t);
  composer.render();
}
function startLoop(){ if(!rafStarted){ rafStarted=true; requestAnimationFrame(loop); } }

let chosenGrade=3;
document.querySelectorAll('.grade-btn').forEach(b=>b.addEventListener('click',()=>{ document.querySelectorAll('.grade-btn').forEach(x=>x.classList.remove('on')); b.classList.add('on'); chosenGrade=parseInt(b.dataset.grade,10); }));

function gotoSelect(){ hide(byId('screen-story')); show(byId('screen-select')); }
(function initResume(){
  const sv=loadProgress();
  const btn=byId('resumeBtn');
  if(sv && btn && sv.board>0){
    btn.classList.remove('hidden');
    btn.textContent='Resume — Sector '+(sv.board+1)+'/8';
    btn.addEventListener('click',()=>{ resumeGame(sv); });
  }
})();
async function resumeGame(sv){
  ensureAudio();
  try{ narration.pause(); }catch(e){}
  hide(byId('screen-title')); show(byId('loader'));
  S=fresh(sv.chosen, sv.grade);
  S.board=sv.board; S.keys=sv.keys||0; S.gems=sv.gems||0; S.score=sv.score||0;
  S.grades=sv.grades||{}; S.mastery=sv.mastery||{}; S.briefed=true;
  try{ await spawnPlayer(); }catch(e){ byId('loaderTxt').textContent='Could not load model'; return; }
  buildBoard(); hide(byId('loader')); show(byId('screen-game')); resize();
  S.running=true; startLoop(); if(musicOn) startMusic();
  comms('S.P.A.R.K.','Welcome back. Resuming at sector '+(S.board+1)+'.',true);
}
byId('enterBtn').addEventListener('click',()=>{
  ensureAudio(); startMusic(); playNarration();
  hide(byId('screen-title')); show(byId('screen-story'));
  const note=byId('storyNote');
  if(note) note.textContent = musicOn ? 'Narrated by the game master · tap skip any time' : 'Sound is muted · tap skip any time';
});
byId('soundFix').addEventListener('click',()=>{
  musicOn=true;
  const mb=byId('musicBtn'); if(mb){ mb.classList.add('on'); mb.innerHTML='&#9834; SOUND'; }
  startMusic();
  try{ narration.currentTime=0; }catch(e){}
  safePlay(narration);
  const note=byId('storyNote'); if(note) note.textContent='Narrating… tap skip any time';
});
byId('storySkip').addEventListener('click',()=>{ try{ narration.pause(); narration.currentTime=0; }catch(e){} music.volume=0.45; gotoSelect(); });
narration.addEventListener('ended', ()=>{ if(!byId('screen-story').classList.contains('hidden')) gotoSelect(); });
document.querySelectorAll('.char-card').forEach(b=>b.addEventListener('click',()=>startGame(b.dataset.char, chosenGrade)));

async function startGame(chosen, grade){
  ensureAudio();
  try{ narration.pause(); narration.currentTime=0; }catch(e){}
  music.volume=0.45;
  hide(byId('screen-select'));
  show(byId('loader'));
  S=fresh(chosen, grade);
  try {
    await spawnPlayer();
  } catch(e){ byId('loaderTxt').textContent='Could not load model — check connection'; console.error(e); return; }
  buildBoard();
  hide(byId('loader'));
  show(byId('screen-game'));
  resize();
  S.running=true;
  startLoop();
  if(musicOn) startMusic();
}
function retrySector(){
  hide(byId('screen-over')); show(byId('screen-game'));
  S.lives=3; S.zaps=Math.max(S.zaps,1); S.running=true; S.paused=false;
  buildBoard(); updateHud();
  if(musicOn) startMusic();
  comms('S.P.A.R.K.','Rebooting this sector. Your keys are safe — try again.',true);
}
function gameOver(){ S.running=false; stopMusic(); SECTOR_VO.forEach(a=>{try{a.pause();}catch(e){}}); INTRO_VO.forEach(a=>{try{a.pause();}catch(e){}}); Object.values(GLITCHER_VO).forEach(a=>{try{a.pause();}catch(e){}}); hide(byId('howto')); hide(byId('teachCard')); hide(byId('puzzleModal')); byId('overScore').textContent=S.score; byId('overBoard').textContent=S.board+1; hide(byId('screen-game')); show(byId('screen-over')); }
function renderMastery(elId){
  const el=byId(elId); if(!el) return;
  const keys=Object.keys(S.mastery);
  if(!keys.length){ el.innerHTML='<div class="mastery-row"><span class="nm">No lessons completed yet.</span></div>'; return; }
  el.innerHTML=keys.sort().map(k=>{
    const m=S.mastery[k];
    const pct = m.asked? Math.round(m.right/m.asked*100) : 0;
    const band = pct>=90 ? ['#39d99a','Mastered'] : pct>=70 ? ['#7fd8ff','Proficient'] : pct>=50 ? ['#ffd23f','Developing'] : ['#ff6c84','Needs practice'];
    return `<div class="mastery-row"><span class="dot" style="background:${band[0]}"></span>
      <span class="nm">${k} · ${m.name}</span>
      <span class="sc">${m.right}/${m.asked} · ${band[1]}</span></div>`;
  }).join('');
}
function winGame(){ S.running=false; stopMusic(); clearProgress(); byId('winScore').textContent=S.score; byId('winSolved').textContent=S.solved; byId('winZaps').textContent=S.zapped; const wg=byId('winGems'); if(wg) wg.textContent=S.gems; renderMastery('winMastery'); hide(byId('screen-game')); show(byId('screen-win')); }

byId('howtoGo').addEventListener('click',()=>{
  hide(byId('howto'));
  if(S){ S.paused=false;
    const cfg=BOARDS[S.board];
    const L0=window.TEACH_BANK.lessonFor(S.grade,0);
    toast(`SECTOR 1/8 · ${cfg.name} — LESSON ${L0.id}: ${L0.name} · ${diff().label}`);
    playIntroVO(0);
    setTimeout(()=>{ if(S&&S.running) toast(cfg.radio); }, 3400);
    setTimeout(()=>{ if(S&&S.running) toast('Did you know? '+cfg.fact); }, 7200);
    // from sector 2 on, she starts taunting from inside the network
    if(S.board>=1 && S.board<7){
      const TAUNTS=[['taunt1','My cyberbugs are hungry, players. Do not keep them waiting.'],
                    ['taunt2','Fix all the sectors you like. I will simply break another one behind you.'],
                    ['taunt3','I see you through every camera in this city.']];
      const pick=TAUNTS[S.board % TAUNTS.length];
      setTimeout(()=>{ if(S&&S.running && !S.paused) playGlitcher(pick[0], pick[1]); }, 16000+Math.random()*10000);
    }
  }
});
byId('quitBtn').addEventListener('click',()=>{ if(!S) return; S.running=false; stopMusic(); hide(byId('screen-game')); show(byId('screen-select')); });
byId('winAgain').addEventListener('click',()=>{ hide(byId('screen-win')); show(byId('screen-select')); });
byId('overRetry').addEventListener('click',()=>{ retrySector(); });
byId('overSelect').addEventListener('click',()=>{ hide(byId('screen-over')); show(byId('screen-select')); });

// warm the model cache in the background so first play is instant
['assets/Natalia.glb','assets/Alana.glb','assets/Maya.glb'].forEach(p=>loadGLB(p).catch(()=>{}));

// lightweight probe for automated testing (harmless in production)
window.__pp = ()=> (S && S.playerObj) ? { x:+S.playerObj.position.x.toFixed(2), z:+S.playerObj.position.z.toFixed(2), paused:!!S.paused, running:!!S.running } : null;
// test-only helpers (harmless in production)
window.__jump = (n)=>{ if(!S) return null; S.board=Math.max(0,Math.min(BOARDS.length-1,n)); buildBoard(); return { board:S.board, name:BOARDS[S.board].name, boss: !!S.boss, bossHp: S.boss? S.boss.hp : null }; };
window.__bossState = ()=> S && S.boss ? { hp:S.boss.hp, vulnerable:S.boss.vulnerable } : (S? {hp:null, portalActive:S.portal&&S.portal.active} : null);
window.__v22 = ()=>{ if(!S) return null; return { board:S.board+1, cols:BOARDS[S.board].cols, checks:BOARDS[S.board].checks,
  stations:S.stations.length, decks:(S.decks||[]).length, pads:S.pads.length, quota:stationQuota(),
  cinema:!!S.cinema, boss: S.boss? {mode:S.boss.mode, y:+S.boss.group.position.y.toFixed(2), vuln:S.boss.vulnerable}:null,
  iframes:+S.iframes.toFixed(2), py:+(S.py||0).toFixed(2) }; };
window.__forceExpose = ()=>{ if(S&&S.boss){ S.boss.vulnerable=true; S.boss.mode='duel'; S.boss.group.position.y=1.7; S.checksLeft=0; return true;} return false; };
window.__zap = ()=>{ if(S){ S.zaps=3; } fireZapper(); return window.__bossState(); };
window.__tpToBoss = ()=>{ if(S&&S.boss&&S.playerObj){ S.playerObj.position.x=S.boss.group.position.x+1.5; S.playerObj.position.z=S.boss.group.position.z+1.5; return true;} return false; };
window.__frames = ()=> ({ frames:__frameCount, paused:S?S.paused:null, running:S?S.running:null, walls:S?S.walls.length:0 });
window.__diag = ()=>{ let mmOk=false, err=null; try{ drawMinimap(); mmOk=true; }catch(e){ err=String(e); } 
  let gErr=null; try{ updateGuide(); }catch(e){ gErr=String(e); }
  return { hasCtx: !!mmCtx, mmOk, err, gErr, tgt: currentTarget(), keysDown: Object.keys(keys).filter(k=>keys[k]) }; };
window.__audioSrc = ()=>({ narration:narration.src.slice(0,32), music:music.src.slice(0,32), nPaused:narration.paused, nTime:+narration.currentTime.toFixed(1) });
window.__runState = ()=> (S&&S.playerObj&&S.playerObj.userData.body) ? { phase:+(S.runPhase||0).toFixed(2), blend:+(S.runBlend||0).toFixed(2), bodyY:+S.playerObj.userData.body.position.y.toFixed(3), lean:+S.playerObj.userData.body.rotation.x.toFixed(3), scaleY:+S.playerObj.userData.body.scale.y.toFixed(3) } : null;
window.__checks = ()=> S? { left:S.checksLeft, total:S.stations.length, portal:S.portal?S.portal.active:null, keys:S.keys } : null;
window.__solveAll = ()=>{ if(!S) return null; S.stations.forEach(st=>{ if(!st.solved){ st.solved=true; S.checksLeft=Math.max(0,S.checksLeft-1);} });
  if(S.checksLeft===0){ if(S.boss){ S.boss.vulnerable=true; S.boss.mode='duel'; S.boss.group.position.y=1.7; } else { S.portal.active=true; S.portal.disc.material.opacity=0.9; S.portal.beam.material.opacity=0.35; } }
  updateObjective(); return window.__checks(); };
window.__tpToPortal = ()=>{ if(S&&S.playerObj&&S.portal){ S.playerObj.position.x=S.portal.x-1.0; S.playerObj.position.z=S.portal.z; return true;} return false; };
window.__stations = ()=> S? S.stations.map(s=>({num:s.num,solved:s.solved})) : null;
window.__openCP = (i)=>{ if(S&&S.stations[i]){ openPuzzle(S.stations[i]); return true;} return false; };
window.__curQ = ()=> activeStation? activeStation._q : null;
window.__mastery = ()=> S? S.mastery : null;
window.__sky = ()=>{ const s=scene.getObjectByName('sky'); return s? { visible:s.visible, r:s.geometry.parameters.radius, hasMap:!!s.material.map, fog:s.material.fog, camFar:camera.far } : 'MISSING'; };
window.__wallCount = ()=> S? S.walls.length : 0;
window.__keyState = ()=> S&&S.keyPiece? { y:+S.keyPiece.group.position.y.toFixed(2), t:+S.keyPiece.t.toFixed(2) } : null;
window.__voState = ()=> SECTOR_VO.map((a,i)=>a && !a.paused ? i+1 : null).filter(Boolean);
window.S_test_clear = ()=>{ if(!S) return; S.stations.forEach(st=>{ st.done=stationQuota(); st.solved=true; grayOutStation(st); }); S.checksLeft=0;
  S.portal.active=true; S.portal.disc.material.opacity=0.9; S.portal.beam.material.opacity=0.35;
  celebrateKey(S.stations[0].x, S.stations[0].z); updateObjective(); };
window.S_test_zap = (n)=>{ if(S){ S.zaps=n; updateHud(); } };
window.__zapOrb = ()=> S&&S.playerObj&&S.playerObj.userData.zapOrb ? +S.playerObj.userData.zapOrb.material.emissiveIntensity.toFixed(2) : null;
window.S_test_gems = ()=> S? { gems:S.gems, zaps:S.zaps, lives:S.lives, score:S.score } : null;
window.S_test_collect = (n)=>{ if(!S) return; for(let i=0;i<n;i++){ const bt=S.bits.find(b=>!b.got); if(!bt) break;
  bt.got=true; bt.mesh.visible=false; S.gems++; S.score+=25;
  if(S.gems%10===0 && S.zaps<6){ S.zaps=Math.min(6,S.zaps+1); toast('💎 10 gems banked — bonus ZAPPER earned!'); }
  else if(S.gems%25===0 && S.lives<5){ S.lives++; toast('💎 25 gems banked — EXTRA LIFE!'); } }
  updateHud(); };
window.__comms = { praise:(n)=>commsPraise(n), warn:()=>commsWarn(), hurt:()=>commsHurt() };
window.__glitcherVO = ()=> Object.entries(GLITCHER_VO).filter(([k,a])=>!a.paused).map(([k])=>k);
window.__st = ()=> S? { running:S.running, lives:S.lives, keys:S.keys, board:S.board, gems:S.gems, grades:S.grades, streak:S.streak } : null;
window.__setFirst = (n)=>{ if(S) S.boardFirst=n; };
window.__hurt = ()=>{ if(S){ S.lives=1; damage(); } };
window.__hz = ()=> S&&S.hazards? S.hazards.reduce((m,h)=>{ m[h.type]=(m[h.type]||0)+1; return m; },{}) : null;
window.__vap = ()=> S? { vaporizing:S.vaporizing, dissolving:!!S.dissolve, visible:S.playerObj?S.playerObj.visible:null } : null;
window.__killAll = ()=>{ if(S){ S.iframes=0; S.lives=1; damage(); } };
window.__nearestBug = ()=>{ if(!S||!S.playerObj) return null; let m=1e9;
  S.bugs.forEach(b=>{ m=Math.min(m, Math.hypot(b.group.position.x-S.playerObj.position.x, b.group.position.z-S.playerObj.position.z)); });
  return m===1e9?null:+m.toFixed(1); };
/* v20 test hooks */
window.__v20 = ()=> S? { board:S.board, stations:S.stations.length, stY:S.stations.map(s2=>s2.y),
  deck: S.deck? {h:+S.deck.h.toFixed(2)} : null, pads:S.pads?S.pads.length:0, py:+(S.py||0).toFixed(2),
  reach: !!S.reach, wallH:S.wallH, battleCool:+(S.battleCool||0).toFixed(2),
  boss: S.boss? {hp:S.boss.hp, seg:S.boss.seg, vuln:S.boss.vulnerable} : null } : null;
window.__jumpPad = ()=>{ if(!S||!S.pads.length) return false; const pd=S.pads[0];
  S.playerObj.position.x=pd.x; S.playerObj.position.z=pd.z; S.py=0; S.vy=0; pd.cool=0; return true; };
window.__nearBoss = ()=>{ if(!S||!S.boss) return false; S.battleCool=0; S.py=0;
  S.playerObj.position.x=S.boss.group.position.x+2; S.playerObj.position.z=S.boss.group.position.z+2; return true; };
window.__battleQ = ()=> S? S.battleQ||null : null;
window.__answerBattle = (ok)=>{ const q=S.battleQ; if(!q) return null;
  const btns=document.querySelectorAll('#puzzleAnswers button');
  btns[ ok? q.correct : (q.correct+1)%q.choices.length ].click(); return { hp:S.boss?S.boss.hp:0, seg:S.boss?S.boss.seg:0 }; };
window.__portal = ()=> S&&S.portal? { active:S.portal.active } : null;
