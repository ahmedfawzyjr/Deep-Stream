"use client";

import React, { useRef, useEffect, useCallback, useState } from 'react';
// Static type-only import so TypeScript resolves THREE.* annotations at compile time.
// The actual runtime module is loaded lazily via `await import('three')` inside initEngine.
import type * as THREE from 'three';
import type { SeatInfo } from './SeatPickerPanel';

/* ─────────────────────────────────────────────────────────────
   StadiViewStadium — Full React port of the StadiView procedural
   3D football stadium (Three.js r162 + GSAP 3). 
   Based on StadiView by thebuggeddev (PolyForm Noncommercial 1.0.0)
   Integrated into DeepKick by Antigravity for Deep Stream project.
───────────────────────────────────────────────────────────── */

interface StadiViewStadiumProps {
  /** Live match minute (0–90), drives scoreboard clock */
  minute?: number;
  /** Home team score */
  scoreHome?: number;
  /** Away team score */
  scoreAway?: number;
  /** Callback when a seat is selected */
  onSeatSelect?: (info: SeatInfo, previewUrl: string, minimapCanvas: HTMLCanvasElement | null) => void;
  /** Ref to the minimap canvas element (in SeatPickerPanel) */
  minimapCanvasRef?: React.RefObject<HTMLCanvasElement>;
  /** Match title for LED boards */
  matchTitle?: string;
  homeTeamCode?: string;
  awayTeamCode?: string;
}

export default function StadiViewStadium({
  minute = 42,
  scoreHome = 2,
  scoreAway = 1,
  onSeatSelect,
  minimapCanvasRef,
  matchTitle = 'ARGENTINA VS SPAIN',
  homeTeamCode = 'ARG',
  awayTeamCode = 'ESP',
}: StadiViewStadiumProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const backbarRef = useRef<HTMLDivElement>(null);
  const sbHintRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const tip1Ref = useRef<HTMLSpanElement>(null);
  const tip2Ref = useRef<HTMLSpanElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const loaderTextRef = useRef<HTMLDivElement>(null);
  const d3dBtnRef = useRef<HTMLButtonElement>(null);

  // Expose engine state to React for re-renders
  const [mode3D, setMode3D] = useState(true);

  // We use a ref for the entire engine to avoid React re-render issues with Three.js
  const engineRef = useRef<any>(null);
  const scoreRef = useRef({ home: scoreHome, away: scoreAway, minute });

  // Keep score in sync without tearing down the engine
  useEffect(() => {
    scoreRef.current = { home: scoreHome, away: scoreAway, minute };
    if (engineRef.current?.updateScore) {
      engineRef.current.updateScore(scoreHome, scoreAway, minute);
    }
  }, [scoreHome, scoreAway, minute]);

  const initEngine = useCallback(async () => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    // Dynamically import Three.js and GSAP (already in package.json)
    const THREE = await import('three');
    const { gsap } = await import('gsap');

    const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const TAU = Math.PI * 2;

    // ── Deterministic RNG ──────────────────────────────────────────
    const mulberry32 = (a: number) => {
      return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    const rng = mulberry32(20260717);

    // ── Renderer ───────────────────────────────────────────────────
    const W = wrap.clientWidth, H = wrap.clientHeight || 620;
    const renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, powerPreference: 'high-performance', logarithmicDepthBuffer: true,
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    (renderer as any).outputEncoding = 3001; // sRGBEncoding
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04060c);
    scene.fog = new THREE.FogExp2(0x05070d, 0.0016);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.3, 1400);

    // ── Lights ─────────────────────────────────────────────────────
    scene.add(new THREE.HemisphereLight(0x35507e, 0x05070d, 0.55));
    scene.add(new THREE.AmbientLight(0x27314a, 0.35));
    const floodTarget = new THREE.Object3D();
    floodTarget.position.set(0, 0, 0);
    scene.add(floodTarget);
    [[70,52,55],[-70,52,55],[70,52,-55],[-70,52,-55]].forEach(([px, py, pz]) => {
      const s = new THREE.SpotLight(0xdfeaff, 0.85, 0, Math.PI / 3.1, 0.55, 1.2);
      s.position.set(px, py, pz); s.target = floodTarget; scene.add(s);
    });
    const fieldGlow = new THREE.PointLight(0xbcd8ff, 0.35, 160, 2);
    fieldGlow.position.set(0, 22, 0); scene.add(fieldGlow);
    const sun = new THREE.DirectionalLight(0xdfe9ff, 0.3);
    sun.position.set(70, 90, 45); sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -75; sun.shadow.camera.right = 75;
    sun.shadow.camera.top = 60; sun.shadow.camera.bottom = -60;
    sun.shadow.camera.near = 30; sun.shadow.camera.far = 220;
    sun.shadow.bias = -0.0005; scene.add(sun);

    // ── Geometry Helpers ────────────────────────────────────────────
    const ringStrip = (rx1: number, rz1: number, y1: number, rx2: number, rz2: number, y2: number, seg: number, mat: THREE.Material, repU = 10) => {
      const pos: number[] = [], uv: number[] = [], idx: number[] = [];
      for (let i = 0; i <= seg; i++) {
        const a = (i / seg) * TAU, c = Math.cos(a), s = Math.sin(a);
        pos.push(rx1*c, y1, rz1*s, rx2*c, y2, rz2*s);
        uv.push((i/seg)*repU, 0, (i/seg)*repU, 1);
      }
      for (let i = 0; i < seg; i++) {
        const k = i * 2;
        idx.push(k, k+2, k+1, k+1, k+2, k+3);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx); g.computeVertexNormals();
      const m = new THREE.Mesh(g, mat); m.matrixAutoUpdate = false; return m;
    }

    const mergeBoxes = (parts: THREE.BufferGeometry[]) => {
      const pos: number[] = [], norm: number[] = [];
      for (const g of parts) {
        const gg = g.index ? g.toNonIndexed() : g;
        pos.push(...Array.from(gg.attributes.position.array));
        norm.push(...Array.from(gg.attributes.normal.array));
      }
      const out = new THREE.BufferGeometry();
      out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      out.setAttribute('normal', new THREE.Float32BufferAttribute(norm, 3));
      return out;
    }

    const canvasTexture = (w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, repX?: number, repY?: number): THREE.CanvasTexture => {
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      draw(cv.getContext('2d')!, w, h);
      const t = new THREE.CanvasTexture(cv);
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      if (repX || repY) {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(repX || 1, repY || 1);
      }
      return t;
    }

    // ── Materials ───────────────────────────────────────────────────
    const mkConcreteTex = (base: string, spot: string) => {
      const t = canvasTexture(256, 256, (x, w, h) => {
        x.fillStyle = base; x.fillRect(0, 0, w, h);
        x.globalAlpha = 0.15;
        for (let i = 0; i < 2200; i++) {
          x.fillStyle = Math.random() > 0.5 ? '#05080f' : spot;
          x.fillRect(Math.random()*w, Math.random()*h, 2, 2);
        }
        x.globalAlpha = 0.35; x.strokeStyle = 'rgba(5,8,15,.85)'; x.lineWidth = 2;
        for (let i = 1; i < 4; i++) {
          x.beginPath(); x.moveTo(0, i*64); x.lineTo(w, i*64); x.stroke();
          x.beginPath(); x.moveTo(i*64, 0); x.lineTo(i*64, h); x.stroke();
        }
        x.globalAlpha = 1;
      });
      t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
    };
    const cTex = mkConcreteTex('#1b2233', '#2e3b58');
    const cdTex = mkConcreteTex('#121826', '#232e46');
    const roofTex = (() => {
      const t = canvasTexture(256, 64, (x, w, h) => {
        x.fillStyle = '#0d1322'; x.fillRect(0, 0, w, h);
        x.globalAlpha = 0.55; x.strokeStyle = '#070b14'; x.lineWidth = 2;
        for (let i = 0; i < 8; i++) { x.beginPath(); x.moveTo(i*32, 0); x.lineTo(i*32, h); x.stroke(); }
        x.globalAlpha = 0.12;
        for (let i = 0; i < 450; i++) {
          x.fillStyle = Math.random() > 0.5 ? '#000' : '#26324e';
          x.fillRect(Math.random()*w, Math.random()*h, 2, 2);
        }
        x.globalAlpha = 1;
      });
      t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
    })();

    const MAT: Record<string, THREE.Material> = {
      concrete: new THREE.MeshLambertMaterial({ map: cTex, side: THREE.DoubleSide }),
      concreteDark: new THREE.MeshLambertMaterial({ map: cdTex, side: THREE.DoubleSide }),
      steel: new THREE.MeshLambertMaterial({ color: 0x28324c, side: THREE.DoubleSide }),
      steelDark: new THREE.MeshLambertMaterial({ color: 0x1a2236 }),
      rail: new THREE.MeshPhongMaterial({ color: 0x44557e, shininess: 70, specular: new THREE.Color(0x5a6a90), side: THREE.DoubleSide }),
      roofTop: new THREE.MeshLambertMaterial({ map: roofTex, side: THREE.DoubleSide }),
      facade: new THREE.MeshLambertMaterial({
        map: (() => {
          const t = canvasTexture(512, 128, (x, w, h) => {
            x.fillStyle = '#0c1220'; x.fillRect(0, 0, w, h);
            for (let r = 0; r < 3; r++) for (let k = 0; k < 20; k++) {
              const lit = Math.random() < 0.4;
              x.fillStyle = lit ? `rgba(${Math.random()<0.5?'255,196,120':'150,200,255'},${(0.18+Math.random()*0.5).toFixed(2)})` : '#101a2e';
              x.fillRect(k*25+5, r*40+10, 16, 22);
            }
          });
          t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(14, 3); return t;
        })(),
        side: THREE.DoubleSide,
      }),
    };

    // ── Ground ─────────────────────────────────────────────────────
    {
      const gt = canvasTexture(512, 512, (x) => {
        const g = x.createRadialGradient(256,256,40,256,256,256);
        g.addColorStop(0,'#0b101c'); g.addColorStop(0.55,'#080c15'); g.addColorStop(1,'#04060b');
        x.fillStyle = g; x.fillRect(0,0,512,512);
      });
      const ground = new THREE.Mesh(new THREE.CircleGeometry(600,64), new THREE.MeshBasicMaterial({ map: gt }));
      ground.rotation.x = -Math.PI/2; ground.position.y = -0.25; scene.add(ground);
      const rim = ringStrip(126,106,0.1,132,112,0.1,128,new THREE.MeshBasicMaterial({ color:0x1466c8, transparent:true, opacity:0.5, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide }));
      scene.add(rim);
    }

    // ── Stars ──────────────────────────────────────────────────────
    {
      const n = 500, p = new Float32Array(n*3);
      for (let i = 0; i < n; i++) {
        const a = rng()*TAU, e = rng()*Math.PI*0.42+0.06, r = 560;
        p[i*3] = r*Math.cos(e)*Math.cos(a); p[i*3+1] = r*Math.sin(e)+20; p[i*3+2] = r*Math.cos(e)*Math.sin(a);
      }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
      scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color:0x8fa8d8, size:1.4, sizeAttenuation:false, transparent:true, opacity:0.7 })));
    }

    // ── Sky Dome ───────────────────────────────────────────────────
    {
      const skyTex = canvasTexture(32, 256, (x, w, h) => {
        const g = x.createLinearGradient(0,0,0,h);
        g.addColorStop(0,'#020409'); g.addColorStop(0.5,'#060d1c');
        g.addColorStop(0.78,'#0c1a32'); g.addColorStop(0.92,'#1a2c4c'); g.addColorStop(1,'#31435e');
        x.fillStyle = g; x.fillRect(0,0,w,h);
      });
      const dome = new THREE.Mesh(new THREE.SphereGeometry(780,24,16,0,TAU,0,Math.PI/1.85), new THREE.MeshBasicMaterial({ map:skyTex, side:THREE.BackSide, fog:false }));
      dome.position.y = -30; scene.add(dome);
    }

    // ── Pitch ──────────────────────────────────────────────────────
    const FIELD = { L: 105, W: 68 };
    {
      const px = 10;
      const tex = canvasTexture(FIELD.L*px, FIELD.W*px, (x, w, h) => {
        const stripes = 14, sw = w/stripes;
        for (let i = 0; i < stripes; i++) {
          x.fillStyle = i%2 ? '#1d7a34' : '#1a6d2e';
          x.fillRect(i*sw, 0, sw+1, h);
        }
        x.globalAlpha = 0.05;
        for (let i = 0; i < 2600; i++) { x.fillStyle = Math.random()>0.5?'#0c3b18':'#2f9b47'; x.fillRect(Math.random()*w, Math.random()*h, 2, 2); }
        x.globalAlpha = 1;
        const vg = x.createRadialGradient(w/2,h/2,h*0.3,w/2,h/2,w*0.62);
        vg.addColorStop(0,'rgba(255,255,255,0.05)'); vg.addColorStop(1,'rgba(0,0,20,0.32)');
        x.fillStyle = vg; x.fillRect(0,0,w,h);
        x.strokeStyle = 'rgba(245,250,255,.9)'; x.lineWidth = 2.2;
        const M = 2*px;
        x.strokeRect(M,M,w-2*M,h-2*M);
        x.beginPath(); x.moveTo(w/2,M); x.lineTo(w/2,h-M); x.stroke();
        x.beginPath(); x.arc(w/2,h/2,9.15*px,0,TAU); x.stroke();
        x.beginPath(); x.arc(w/2,h/2,3,0,TAU); x.fillStyle='#f5faff'; x.fill();
        const drawBox = (side: number) => {
          const bx = side < 0 ? M : w-M;
          const d1=16.5*px, w1=40.3*px, d2=5.5*px, w2=18.3*px, s=side<0?1:-1;
          x.strokeRect(Math.min(bx,bx+s*d1),h/2-w1/2,d1,w1);
          x.strokeRect(Math.min(bx,bx+s*d2),h/2-w2/2,d2,w2);
          x.beginPath(); x.arc(bx+s*11*px,h/2,3,0,TAU); x.fill();
        };
        drawBox(-1); drawBox(1);
      });
      (tex as any).encoding = 3001;
      const pitch = new THREE.Mesh(new THREE.PlaneGeometry(FIELD.L, FIELD.W), new THREE.MeshStandardMaterial({ map:tex, roughness:0.82, metalness:0, emissive:new THREE.Color(0x1c5c2a), emissiveIntensity:0.24 }));
      pitch.rotation.x = -Math.PI/2; pitch.position.y = 0.06; pitch.receiveShadow = true; scene.add(pitch);
      const apron = new THREE.Mesh(new THREE.PlaneGeometry(FIELD.L+18, FIELD.W+18), new THREE.MeshLambertMaterial({ color:0x131a29 }));
      apron.rotation.x = -Math.PI/2; apron.receiveShadow = true; scene.add(apron);

      // Goals
      const gmat = new THREE.MeshBasicMaterial({ color:0xf2f6ff });
      [-1,1].forEach(s => {
        const gx = s*FIELD.L/2, grp = new THREE.Group();
        const post = (xp: number, zp: number) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,2.44,6), gmat); m.position.set(xp,1.22,zp); return m; };
        grp.add(post(gx,-3.66), post(gx,3.66));
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,7.32,6), gmat);
        bar.rotation.x = Math.PI/2; bar.position.set(gx,2.44,0); grp.add(bar); scene.add(grp);
      });

      // Dugouts
      [-1,1].forEach(s => {
        const d = new THREE.Mesh(new THREE.BoxGeometry(9,1.7,2.2), MAT.steelDark as THREE.MeshLambertMaterial);
        d.position.set(s*12, 0.85, FIELD.W/2+4.4); scene.add(d);
        const glass = new THREE.Mesh(new THREE.BoxGeometry(9,1.1,0.06), new THREE.MeshLambertMaterial({ color:0x77aaff, transparent:true, opacity:0.22 }));
        glass.position.set(s*12, 1.0, FIELD.W/2+3.32); scene.add(glass);
      });
    }

    // ── LED Perimeter Ad Boards (animated) ─────────────────────────
    const animatedTextures: { t: THREE.CanvasTexture; speed: number }[] = [];
    {
      const adTex = canvasTexture(2048, 64, (x, w, h) => {
        x.fillStyle = '#04101f'; x.fillRect(0, 0, w, h);
        x.font = '700 40px Outfit, system-ui'; x.textBaseline = 'middle';
        const words = ['DEEPKICK AI', matchTitle, 'EXPERIENCE EVERY SEAT', `${homeTeamCode} \u00d7 ${awayTeamCode}`];
        let cx = 30;
        for (let i = 0; i < 8; i++) {
          const t = words[i % words.length];
          x.fillStyle = i%2 ? '#2f9bff' : '#9fd3ff';
          x.fillText(t, cx, h/2+2);
          cx += x.measureText(t).width + 120;
        }
      }, 4, 1);
      (adTex as any).encoding = 3001;
      animatedTextures.push({ t: adTex, speed: 0.018 });
      const mat = new THREE.MeshBasicMaterial({ map: adTex, toneMapped: false });
      const mk = (wd: number, xp: number, zp: number, rotY: number) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(wd, 1.0), mat);
        m.position.set(xp, 0.55, zp); m.rotation.y = rotY; scene.add(m);
      };
      mk(FIELD.L+6, 0, FIELD.W/2+7.6, Math.PI);
      mk(FIELD.L+6, 0, -FIELD.W/2-7.6, 0);
      mk(FIELD.W+6, FIELD.L/2+7.6, 0, -Math.PI/2);
      mk(FIELD.W+6, -FIELD.L/2-7.6, 0, Math.PI/2);
    }

    // ── Players & Ball ─────────────────────────────────────────────
    const players: any[] = [];
    let ball: THREE.Mesh;
    const swayU = { value: 0 }, exciteU = { value: 1 };
    const score = { home: scoreRef.current.home, away: scoreRef.current.away, minute: scoreRef.current.minute };

    {
      const skinMats = ['#c98d63','#8d5a3b','#eac1a4','#a5714b'].map(c => new THREE.MeshLambertMaterial({ color: c }));
      const hairMats = ['#171310','#2b1c10','#4a3520','#0d0d0d'].map(c => new THREE.MeshLambertMaterial({ color: c }));
      const bootMat = new THREE.MeshLambertMaterial({ color: 0x101014 });
      const kits = [
        { shirt: new THREE.MeshLambertMaterial({ color: 0x9fd8ff, emissive: new THREE.Color(0x9fd8ff), emissiveIntensity: 0.12 }), shorts: new THREE.MeshLambertMaterial({ color: 0xf2f4f8 }), gk: new THREE.MeshLambertMaterial({ color: 0x2fbf71 }) },
        { shirt: new THREE.MeshLambertMaterial({ color: 0xd92626, emissive: new THREE.Color(0xd92626), emissiveIntensity: 0.12 }), shorts: new THREE.MeshLambertMaterial({ color: 0x232360 }), gk: new THREE.MeshLambertMaterial({ color: 0xe8c53a }) },
        { shirt: new THREE.MeshLambertMaterial({ color: 0xf2e341, emissive: new THREE.Color(0xf2e341), emissiveIntensity: 0.1 }), shorts: new THREE.MeshLambertMaterial({ color: 0x141414 }) },
      ];

      const mkPlayer = (kit: any, gk: boolean) => {
        const g = new THREE.Group();
        const skin = skinMats[(rng() * skinMats.length) | 0];
        const shirtM = gk && kit.gk ? kit.gk : kit.shirt;
        const legGeo = new THREE.CylinderGeometry(0.085, 0.06, 0.9, 6); legGeo.translate(0,-0.45,0);
        const bootGeo = new THREE.BoxGeometry(0.11,0.08,0.24);
        const legL = new THREE.Group(), legR = new THREE.Group();
        legL.position.set(-0.11,0.95,0); legR.position.set(0.11,0.95,0);
        const lm = new THREE.Mesh(legGeo, skin), rm = new THREE.Mesh(legGeo, skin);
        const bl = new THREE.Mesh(bootGeo, bootMat); bl.position.set(0,-0.9,0.05);
        const br = new THREE.Mesh(bootGeo, bootMat); br.position.set(0,-0.9,0.05);
        legL.add(lm, bl); legR.add(rm, br);
        const shorts = new THREE.Mesh(new THREE.CylinderGeometry(0.21,0.185,0.3,7), kit.shorts); shorts.position.y = 1.02;
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.235,0.18,0.6,7), shirtM); torso.position.y = 1.42;
        const armGeo = new THREE.CylinderGeometry(0.055,0.042,0.62,5); armGeo.translate(0,-0.31,0);
        const armL = new THREE.Group(), armR = new THREE.Group();
        armL.position.set(-0.27,1.62,0); armR.position.set(0.27,1.62,0);
        armL.add(new THREE.Mesh(armGeo, shirtM)); armR.add(new THREE.Mesh(armGeo, shirtM));
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.14,8,6), skin); head.position.y = 1.85;
        const hair = new THREE.Mesh(new THREE.SphereGeometry(0.146,8,4,0,TAU,0,Math.PI/2.1), hairMats[(rng()*hairMats.length)|0]); hair.position.y = 1.87;
        g.add(legL, legR, shorts, torso, armL, armR, head, hair);
        g.traverse(o => { if ((o as any).isMesh) (o as THREE.Mesh).castShadow = true; });
        scene.add(g);
        return { g, legL, legR, armL, armR };
      }

      for (let team = 0; team < 2; team++) {
        for (let i = 0; i < 11; i++) {
          const gk = i === 0;
          const col = gk ? 0 : 1+Math.floor((i-1)/3.4), rowIn = gk ? 1.5 : (i-1)%4;
          const side = team ? 1 : -1;
          const hx = gk ? side*49.5 : side*(8+col*11);
          const hz = THREE.MathUtils.clamp((rowIn-1.5)*14,-30,30);
          const p = mkPlayer(kits[team], gk);
          players.push(Object.assign(p, { home: new THREE.Vector3(hx,0,hz), team, gk, ph:rng()*TAU, sp:0.85+rng()*0.35, amp:0 }));
          p.g.position.set(hx, 0, hz);
        }
      }
      const rf = mkPlayer(kits[2], false);
      players.push(Object.assign(rf, { home: new THREE.Vector3(0,0,10), team:2, gk:false, ph:rng()*TAU, sp:1, amp:0 }));
      rf.g.position.set(0, 0, 10);

      ball = new THREE.Mesh(new THREE.SphereGeometry(0.16,10,8), new THREE.MeshStandardMaterial({ color:0xf5f8ff, roughness:0.4, emissive:new THREE.Color(0xdfe6ff), emissiveIntensity:0.14 }));
      ball.castShadow = true; ball.position.set(0,0.16,0); scene.add(ball);
    }

    // ── Match State Machine ────────────────────────────────────────
    const match = { phase:'hold', holder:5, receiver:6, t:0, dur:1.2, from:new THREE.Vector3(), to:new THREE.Vector3(), arc:0.6, shot:false, celebrate:0, scoredBy:0 };
    const teamOf = (i: number) => players[i].team;
    const startPass = (shot: boolean) => {
      const h = players[match.holder], team = h.team, dir = team ? -1 : 1;
      match.from.copy(ball.position);
      if (shot) {
        match.to.set(dir*53.4, 0, (rng()-0.5)*6.4); match.shot = true; match.arc = 0.8+rng()*1.5;
      } else {
        let best = -1, bestV = -1e9;
        for (let k = 0; k < 4; k++) {
          const cand = team*11+1+((rng()*10)|0);
          if (cand === match.holder) continue;
          const c = players[cand];
          const v = c.g.position.x*dir + rng()*22 - Math.abs(c.g.position.z)*0.1;
          if (v > bestV) { bestV = v; best = cand; }
        }
        if (best < 0) best = team*11+1+((rng()*10)|0);
        match.receiver = best;
        const r = players[best];
        match.to.set(THREE.MathUtils.clamp(r.g.position.x+dir*(3+rng()*5),-50,50), 0, THREE.MathUtils.clamp(r.g.position.z+(rng()-0.5)*4,-31,31));
        match.shot = false; match.arc = rng()<0.28 ? 2.2+rng()*1.6 : 0.3+rng()*0.5;
      }
      const dist = match.from.distanceTo(match.to);
      match.dur = THREE.MathUtils.clamp(dist/(match.shot?26:17), 0.35, 2.4);
      match.t = 0; match.phase = 'fly';
    };
    const onBallArrive = () => {
      if (match.shot) {
        const st = teamOf(match.holder);
        if (rng() < 0.6) {
          if (st === 0) score.home++; else score.away++;
          match.scoredBy = st; match.celebrate = 2.6; exciteU.value = 2.4;
          drawScoreboard(); cheers();
          ball.position.set(0,0.16,0); match.holder = (st?0:11)+5;
        } else { match.holder = st?0:11; ball.position.copy(players[match.holder].g.position); ball.position.y = 0.16; }
        match.phase = 'hold'; match.t = 0; match.dur = 1.4; return;
      }
      match.holder = match.receiver; match.phase = 'hold'; match.t = 0; match.dur = 0.5+rng()*1.3;
    }

    // ── Tier Definitions ───────────────────────────────────────────
    const TIERS: any[] = [
      { name:'Lower Tier', first:101, sections:32, rows:18, rx:63, rz:46, y:1.4, dr:0.85, dy:0.48, palette:'rainbow' },
      { name:'Club Tier', first:201, sections:24, rows:12, rx:82, rz:65, y:15.2, dr:0.8, dy:0.6, palette:'steel' },
      { name:'Upper Tier', first:301, sections:32, rows:16, rx:94, rz:77, y:27.6, dr:0.8, dy:0.7, palette:'night' },
    ];
    TIERS.forEach(t => { t.rxTop = t.rx+t.rows*t.dr; t.rzTop = t.rz+t.rows*t.dr; t.yTop = t.y+t.rows*t.dy; });
    const ROOF = { inRx:92, inRz:75, inY:44, outRx:120, outRz:100, outY:48 };

    // ── Bowl Concrete, Walls, Walkways, Rails ──────────────────────
    {
      const SEG = 160;
      TIERS.forEach(t => { t.yIn = t.y-(1.2/t.dr)*t.dy-0.03; t.yOut = t.yTop+(1.0/t.dr)*t.dy-0.03; });
      const stepTex = canvasTexture(64, 64, (x, w, h) => {
        const g = x.createLinearGradient(0,0,0,h);
        g.addColorStop(0,'#242e42'); g.addColorStop(0.8,'#1a2130'); g.addColorStop(0.85,'#0b101a'); g.addColorStop(1,'#151c2a');
        x.fillStyle = g; x.fillRect(0,0,w,h);
      });
      stepTex.wrapS = stepTex.wrapT = THREE.RepeatWrapping;
      const glassTex = canvasTexture(1024, 64, (x, w, h) => {
        x.fillStyle = '#070c17'; x.fillRect(0,0,w,h);
        for (let i = 0; i < 64; i++) {
          const lit = Math.random() < 0.6;
          x.fillStyle = lit ? `rgba(255,205,130,${(0.25+Math.random()*0.55).toFixed(2)})` : '#0d1526';
          x.fillRect(i*16+2, 8, 12, h-16);
        }
      }, 10, 1);
      const glassMat = new THREE.MeshBasicMaterial({ map:glassTex, side:THREE.DoubleSide });

      TIERS.forEach((t, i) => {
        const slabTex = stepTex.clone(); slabTex.needsUpdate = true; slabTex.repeat.set(110, t.rows);
        const slabMat = new THREE.MeshLambertMaterial({ map:slabTex, side:THREE.DoubleSide });
        scene.add(ringStrip(t.rx-1.2, t.rz-1.2, t.yIn, t.rxTop+1, t.rzTop+1, t.yOut, SEG, slabMat, 1));
        if (i === 0) scene.add(ringStrip(t.rx-1.2, t.rz-1.2, 0.05, t.rx-1.2, t.rz-1.2, t.yIn, SEG, MAT.concreteDark, 60));
        else scene.add(ringStrip(t.rx-1.2, t.rz-1.2, t.yIn-1.0, t.rx-1.2, t.rz-1.2, t.yIn, SEG, MAT.concreteDark, 60));
        scene.add(ringStrip(t.rx-1.15, t.rz-1.15, t.yIn-0.02, t.rx-1.15, t.rz-1.15, t.yIn+0.85, SEG, MAT.rail, 80));
        const wInX = i===0 ? t.rx-3.4 : TIERS[i-1].rxTop+1;
        const wInZ = i===0 ? t.rz-3.4 : TIERS[i-1].rzTop+1;
        scene.add(ringStrip(wInX, wInZ, t.yIn, t.rx-1.2, t.rz-1.2, t.yIn, SEG, MAT.concreteDark, 40));
        const wallH = i===2 ? 2.6 : 1.2;
        scene.add(ringStrip(t.rxTop+1, t.rzTop+1, t.yOut, t.rxTop+1, t.rzTop+1, t.yOut+wallH, SEG, MAT.concrete, 60));
        if (i < 2) {
          const nt = TIERS[i+1];
          scene.add(ringStrip(t.rxTop+1, t.rzTop+1, t.yOut+wallH, t.rxTop+1, t.rzTop+1, nt.yIn-1.0, SEG, glassMat, 10));
          scene.add(ringStrip(t.rxTop+1, t.rzTop+1, nt.yIn-1.0, nt.rx-1.2, nt.rz-1.2, nt.yIn-1.0, SEG, MAT.concreteDark, 40));
        }
      });
    }

    // ── LED Ribbon on Tier 1 Balcony ───────────────────────────────
    {
      const ribTex = canvasTexture(2048, 48, (x, w, h) => {
        const g = x.createLinearGradient(0,0,w,0);
        g.addColorStop(0,'#04203f'); g.addColorStop(0.5,'#062a52'); g.addColorStop(1,'#04203f');
        x.fillStyle = g; x.fillRect(0,0,w,h);
        x.font = '700 30px Outfit, system-ui'; x.textBaseline = 'middle';
        let cx = 40;
        const words = [matchTitle, 'AI FOOTBALL ANALYTICS', 'DEEPKICK LIVE', `KICK OFF 8.30 PM`];
        for (let i = 0; i < 8; i++) {
          const t = words[i%words.length];
          x.fillStyle = i%2 ? '#39c4ff' : '#dff0ff';
          x.fillText(t, cx, h/2+1); cx += x.measureText(t).width + 130;
        }
      }, 3, 1);
      (ribTex as any).encoding = 3001;
      animatedTextures.push({ t: ribTex, speed: -0.012 });
      const t1 = TIERS[1];
      scene.add(ringStrip(t1.rx-1.05, t1.rz-1.05, t1.yIn-0.92, t1.rx-1.05, t1.rz-1.05, t1.yIn-0.06, 160, new THREE.MeshBasicMaterial({ map:ribTex, toneMapped:false, side:THREE.DoubleSide }), 3));
    }

    // ── Glow Sprite ────────────────────────────────────────────────
    const glowSprite = (() => {
      const t = canvasTexture(128, 128, (x) => {
        const g = x.createRadialGradient(64,64,4,64,64,64);
        g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.25,'rgba(200,225,255,.55)'); g.addColorStop(1,'rgba(120,180,255,0)');
        x.fillStyle = g; x.fillRect(0,0,128,128);
      }); return t;
    })();

    // ── Roof, Trusses, Floodlights, Facade ────────────────────────
    {
      const SEG = 140;
      scene.add(ringStrip(ROOF.inRx, ROOF.inRz, ROOF.inY, ROOF.outRx, ROOF.outRz, ROOF.outY, SEG, MAT.roofTop, 50));
      scene.add(ringStrip(ROOF.inRx, ROOF.inRz, ROOF.inY-1.4, ROOF.inRx, ROOF.inRz, ROOF.inY, SEG, MAT.steel, 60));
      for (let i = 0; i < 44; i++) {
        const a = (i/44)*TAU, c = Math.cos(a), s = Math.sin(a);
        const p1 = new THREE.Vector3(ROOF.inRx*c, ROOF.inY-0.7, ROOF.inRz*s);
        const p2 = new THREE.Vector3(ROOF.outRx*c, ROOF.outY-0.7, ROOF.outRz*s);
        const len = p1.distanceTo(p2);
        const truss = new THREE.Mesh(new THREE.BoxGeometry(0.5,1.1,len), MAT.steel);
        truss.position.copy(p1).add(p2).multiplyScalar(0.5); truss.lookAt(p2); scene.add(truss);
      }
      const wall = new THREE.Mesh(new THREE.CylinderGeometry(ROOF.outRx-1, ROOF.outRx-1, ROOF.outY-2, 96, 1, true), MAT.facade);
      wall.scale.z = (ROOF.outRz-1)/(ROOF.outRx-1); wall.position.y = (ROOF.outY-2)/2; scene.add(wall);
      for (let i = 0; i < 48; i++) {
        const a = (i/48)*TAU;
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.7,ROOF.outY,8), MAT.steelDark);
        col.position.set((ROOF.outRx+0.6)*Math.cos(a), ROOF.outY/2, (ROOF.outRz+0.6)*Math.sin(a)); scene.add(col);
      }
      scene.add(ringStrip(ROOF.outRx+0.4, ROOF.outRz+0.4, ROOF.outY-0.4, ROOF.outRx+0.4, ROOF.outRz+0.4, ROOF.outY+0.4, SEG, new THREE.MeshBasicMaterial({ color:0x1f6fd8, toneMapped:false, side:THREE.DoubleSide }), 40));
      scene.add(ringStrip(ROOF.inRx+0.3, ROOF.inRz+0.3, ROOF.inY-1.1, ROOF.inRx+0.3, ROOF.inRz+0.3, ROOF.inY-0.4, SEG, new THREE.MeshBasicMaterial({ color:0xe8f2ff, toneMapped:false, side:THREE.DoubleSide }), 60));
      const smat = new THREE.SpriteMaterial({ map:glowSprite, color:0xcfe4ff, blending:THREE.AdditiveBlending, depthWrite:false, transparent:true, opacity:0.9 });
      for (let i = 0; i < 56; i++) {
        const a = (i/56)*TAU, sp = new THREE.Sprite(smat);
        sp.position.set((ROOF.inRx+0.3)*Math.cos(a), ROOF.inY-0.75, (ROOF.inRz+0.3)*Math.sin(a));
        sp.scale.setScalar(4.2+(i%3)*0.8); scene.add(sp);
      }
    }

    // ── Scoreboards ────────────────────────────────────────────────
    let drawScoreboard = () => {};
    {
      const cv2 = document.createElement('canvas'); cv2.width = 1024; cv2.height = 512;
      const ctx = cv2.getContext('2d')!;
      const sbTex = new THREE.CanvasTexture(cv2);
      (sbTex as any).encoding = 3001;
      sbTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const f = 'Outfit, system-ui';
      drawScoreboard = () => {
        const w = cv2.width, h = cv2.height, x = ctx;
        x.fillStyle = '#050b16'; x.fillRect(0,0,w,h);
        x.strokeStyle = 'rgba(57,196,255,.5)'; x.lineWidth = 8; x.strokeRect(8,8,w-16,h-16);
        x.textAlign = 'center'; x.fillStyle = '#dff0ff'; x.font = `800 130px ${f}`;
        x.fillText(`${homeTeamCode}  ${score.home} \u00b7 ${score.away}  ${awayTeamCode}`, w/2, 215);
        x.fillStyle = '#39c4ff'; x.font = `700 60px ${f}`;
        x.fillText(score.minute < 90 ? `LIVE \u00b7 ${score.minute}'` : 'FULL TIME', w/2, 335);
        x.fillStyle = '#5b6a85'; x.font = `600 44px ${f}`;
        x.fillText('INTERNATIONAL FRIENDLY', w/2, 425);
        sbTex.needsUpdate = true;
      };
      drawScoreboard();
      const mat = new THREE.MeshBasicMaterial({ map:sbTex, toneMapped:false });
      [-1,1].forEach(s => {
        const b = new THREE.Mesh(new THREE.PlaneGeometry(20,10), mat);
        b.position.set(s*90.2, 38, 0); b.rotation.y = s>0 ? -Math.PI/2 : Math.PI/2; scene.add(b);
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.8,11,21), MAT.steelDark);
        frame.position.set(s*90.8, 38, 0); scene.add(frame);
      });
    }

    // ── SEATS (InstancedMesh) ──────────────────────────────────────
    const SEAT_SPACING = 0.58, AISLE = 1.5;
    const RAINBOW = ['#5b21b6','#6d28d9','#7c3aed','#4f46e5','#4338ca','#2563eb','#0284c7','#0ea5e9','#0d9488','#10b981','#22c55e','#65a30d','#a3b60b','#eab308','#f59e0b','#f97316','#ea580c','#dc2626','#b91c1c','#be185d','#9d174d','#7e22ce','#6d28d9','#5b21b6','#4f46e5','#4338ca','#2563eb','#0284c7','#0ea5e9','#10b981','#22c55e','#eab308'];
    const sectionBaseColor = (tier: any, k: number) => {
      if (tier.palette === 'rainbow') return new THREE.Color(RAINBOW[k%RAINBOW.length]);
      if (tier.palette === 'steel') { const c = new THREE.Color(0x2e4a78); c.offsetHSL(((k%5)-2)*0.012, 0, ((k%3)-1)*0.03); return c; }
      const c = new THREE.Color(0x27306a); c.offsetHSL(((k%7)-3)*0.01, 0, ((k%4)-1.5)*0.02); return c;
    };
    const arcTable = (rx: number, rz: number) => {
      const N = 1200, s = new Float32Array(N+1), a = new Float32Array(N+1);
      let L = 0, px = rx, pz = 0;
      for (let i = 1; i <= N; i++) {
        const ang = (i/N)*TAU, x = rx*Math.cos(ang), z = rz*Math.sin(ang);
        L += Math.hypot(x-px, z-pz); px = x; pz = z; s[i] = L; a[i] = ang;
      }
      return { L, s, a, N };
    };
    const thetaAt = (tb: any, dist: number) => {
      let lo = 0, hi = tb.N;
      while (lo < hi) { const mid = (lo+hi)>>1; if (tb.s[mid] < dist) lo=mid+1; else hi=mid; }
      const i = Math.max(1,lo), f = (dist-tb.s[i-1])/Math.max(1e-6,tb.s[i]-tb.s[i-1]);
      return tb.a[i-1]+f*(tb.a[i]-tb.a[i-1]);
    }
    const seatGeo = (() => {
      const pan = new THREE.BoxGeometry(0.46,0.06,0.42); pan.translate(0,0.42,0.03);
      const back = new THREE.BoxGeometry(0.46,0.48,0.07); back.rotateX(-0.13); back.translate(0,0.66,-0.21);
      const ped = new THREE.BoxGeometry(0.34,0.4,0.28); ped.translate(0,0.2,0.02);
      return mergeBoxes([pan, back, ped]);
    })();
    const seatMat = new THREE.MeshPhongMaterial({ shininess:38, specular:new THREE.Color(0x2c333f) });

    const layout: any[] = [];
    let SEAT_COUNT = 0;
    TIERS.forEach((tier) => {
      const rows: any[] = [];
      for (let r = 0; r < tier.rows; r++) {
        const rx = tier.rx+r*tier.dr, rz = tier.rz+r*tier.dr, y = tier.y+r*tier.dy;
        const tb = arcTable(rx, rz);
        const secLen = tb.L/tier.sections, usable = secLen-AISLE;
        const n = Math.floor(usable/SEAT_SPACING);
        rows.push({ rx, rz, y, tb, secLen, n }); SEAT_COUNT += n*tier.sections;
      }
      layout.push(rows);
    });

    const seatMesh = new THREE.InstancedMesh(seatGeo, seatMat, SEAT_COUNT);
    seatMesh.frustumCulled = false;
    const pickGeo = new THREE.BoxGeometry(0.56,1.05,0.5); pickGeo.translate(0,0.52,0);
    const pickColAttr = new THREE.InstancedBufferAttribute(new Float32Array(SEAT_COUNT*3), 3);
    pickGeo.setAttribute('pickColor', pickColAttr);
    const pickMesh = new THREE.InstancedMesh(pickGeo, new THREE.ShaderMaterial({
      vertexShader: 'attribute vec3 pickColor; varying vec3 vP;\nvoid main(){ vP=pickColor; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position,1.0); }',
      fragmentShader: 'varying vec3 vP; void main(){ gl_FragColor=vec4(vP,1.0); }',
    }), SEAT_COUNT);
    pickMesh.frustumCulled = false;

    const meta = {
      pos: new Float32Array(SEAT_COUNT*3), yaw: new Float32Array(SEAT_COUNT),
      row: new Uint8Array(SEAT_COUNT), seatNum: new Uint16Array(SEAT_COUNT),
      secIdx: new Uint16Array(SEAT_COUNT), rowStart: new Uint32Array(SEAT_COUNT),
      rowCount: new Uint16Array(SEAT_COUNT), avail: new Uint8Array(SEAT_COUNT),
    };
    const baseColors = new Float32Array(SEAT_COUNT*3);
    const sections: any[] = [];

    {
      const dummy = new THREE.Object3D(), col = new THREE.Color(), jitter = new THREE.Color();
      let idx = 0;
      TIERS.forEach((tier, ti) => {
        const rows = layout[ti];
        for (let k = 0; k < tier.sections; k++) {
          const label = tier.first+k;
          const secRec = { label, tier:ti, start:idx, count:0, angle:0, a0:0, a1:0 };
          const base = sectionBaseColor(tier, k);
          for (let r = 0; r < tier.rows; r++) {
            const R = rows[r];
            const s0 = k*R.secLen+AISLE/2+(R.secLen-AISLE-R.n*SEAT_SPACING)/2;
            const rowStart = idx, rowCount = R.n;
            for (let q = 0; q < R.n; q++) {
              const th = thetaAt(R.tb, s0+(q+0.5)*SEAT_SPACING);
              const x = R.rx*Math.cos(th), z = R.rz*Math.sin(th);
              const yaw = Math.atan2(-x,-z);
              dummy.position.set(x,R.y,z); dummy.rotation.set(0,yaw,0); dummy.updateMatrix();
              seatMesh.setMatrixAt(idx, dummy.matrix); pickMesh.setMatrixAt(idx, dummy.matrix);
              const rr = rng();
              const unavailable = rr<0.45 && !(label===125 && r+1===12 && Math.abs(q+1-18)<=2);
              jitter.copy(base).offsetHSL((rng()-0.5)*0.02, (rng()-0.5)*0.08, (rng()-0.5)*0.16);
              if (unavailable) jitter.multiplyScalar(0.82);
              seatMesh.setColorAt(idx, jitter);
              baseColors[idx*3]=jitter.r; baseColors[idx*3+1]=jitter.g; baseColors[idx*3+2]=jitter.b;
              const id = idx+1;
              pickColAttr.setXYZ(idx, ((id>>16)&255)/255, ((id>>8)&255)/255, (id&255)/255);
              meta.pos[idx*3]=x; meta.pos[idx*3+1]=R.y; meta.pos[idx*3+2]=z;
              meta.yaw[idx]=yaw; meta.row[idx]=r+1; meta.seatNum[idx]=q+1;
              meta.secIdx[idx]=sections.length; meta.rowStart[idx]=rowStart; meta.rowCount[idx]=rowCount;
              meta.avail[idx]=unavailable?0:1; idx++;
            }
            secRec.count += R.n;
            if (r===0) {
              secRec.angle = thetaAt(R.tb, (k+0.5)*R.secLen);
              secRec.a0 = thetaAt(R.tb, k*R.secLen);
              secRec.a1 = k+1===tier.sections ? TAU : thetaAt(R.tb, (k+1)*R.secLen);
            }
          }
          sections.push(secRec);
        }
      });
      seatMesh.instanceMatrix.needsUpdate = true; pickMesh.instanceMatrix.needsUpdate = true;
      if (seatMesh.instanceColor) seatMesh.instanceColor.needsUpdate = true;
    }
    scene.add(seatMesh);

    // ── Seated Crowd ───────────────────────────────────────────────
    {
      const occ: number[] = [];
      for (let i = 0; i < SEAT_COUNT; i++) if (!meta.avail[i]) occ.push(i);
      const torsoGeo = (() => {
        const body = new THREE.BoxGeometry(0.42,0.52,0.26); body.translate(0,0.73,-0.05);
        const lap = new THREE.BoxGeometry(0.4,0.13,0.34); lap.translate(0,0.5,0.1);
        const arms = new THREE.BoxGeometry(0.54,0.28,0.2); arms.translate(0,0.6,-0.03);
        return mergeBoxes([body,lap,arms]);
      })();
      const headGeo = new THREE.SphereGeometry(0.135,7,5); headGeo.translate(0,1.1,-0.05);
      const torsoMat = new THREE.MeshLambertMaterial(), headMat = new THREE.MeshLambertMaterial();
      const swayify = (mat: THREE.MeshLambertMaterial, amp: string) => {
        mat.onBeforeCompile = (sh: any) => {
          sh.uniforms.uTime = swayU; sh.uniforms.uExcite = exciteU;
          sh.vertexShader = 'uniform float uTime; uniform float uExcite;\n' + sh.vertexShader.replace('#include <begin_vertex>', ['#include <begin_vertex>','float swPh = instanceMatrix[3].x*1.7 + instanceMatrix[3].z*2.3;','float swW = smoothstep(0.35,1.15,position.y)*uExcite;',`transformed.x += sin(uTime*1.7+swPh)*${amp}*swW;`,`transformed.z += cos(uTime*1.25+swPh)*${amp}*0.6*swW;`].join('\n'));
        };
      }
      swayify(torsoMat, '0.03'); swayify(headMat, '0.05');
      const torso = new THREE.InstancedMesh(torsoGeo, torsoMat, occ.length);
      const heads = new THREE.InstancedMesh(headGeo, headMat, occ.length);
      torso.frustumCulled = false; heads.frustumCulled = false;
      const dm = new THREE.Object3D(), cc = new THREE.Color();
      const cloth = ['#10182b','#141414','#e7e4da','#75809a','#a92322','#6fb1e4','#d9b02f','#274e13','#5b2a86'];
      const skinTones = ['#8d5a3b','#c98d63','#eac1a4','#6b4226','#a5714b','#e2ac86'];
      occ.forEach((si, k) => {
        dm.position.set(meta.pos[si*3], meta.pos[si*3+1], meta.pos[si*3+2]);
        dm.rotation.set(0, meta.yaw[si]+(rng()-0.5)*0.3, 0);
        const sc = 0.92+rng()*0.14; dm.scale.set(sc,sc,sc); dm.updateMatrix();
        torso.setMatrixAt(k, dm.matrix); heads.setMatrixAt(k, dm.matrix);
        const sec = sections[meta.secIdx[si]], tr = TIERS[sec.tier];
        if (rng()<0.35) cc.copy(sectionBaseColor(tr, sec.label-tr.first)).offsetHSL(0,(rng()-0.5)*0.1,(rng()-0.5)*0.15);
        else cc.set(cloth[(rng()*cloth.length)|0]).offsetHSL(0,0,(rng()-0.5)*0.1);
        torso.setColorAt(k, cc);
        cc.set(skinTones[(rng()*skinTones.length)|0]).offsetHSL(0,0,(rng()-0.5)*0.06);
        heads.setColorAt(k, cc);
      });
      torso.instanceMatrix.needsUpdate = true; heads.instanceMatrix.needsUpdate = true;
      if (torso.instanceColor) torso.instanceColor.needsUpdate = true;
      if (heads.instanceColor) heads.instanceColor.needsUpdate = true;
      scene.add(torso, heads);
      if (loaderTextRef.current) loaderTextRef.current.textContent = `Seating ${occ.length.toLocaleString()} fans…`;
    }

    // ── GPU Pick Scene ─────────────────────────────────────────────
    const pickScene = new THREE.Scene();
    pickScene.background = new THREE.Color(0x000000);
    pickScene.add(pickMesh);

    // ── Selection Glow ─────────────────────────────────────────────
    const selGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowSprite, color:0x39c4ff, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false }));
    selGlow.scale.setScalar(2.4); scene.add(selGlow);
    if (loaderTextRef.current) loaderTextRef.current.textContent = `Placing ${SEAT_COUNT.toLocaleString()} seats…`;

    // ── Seat Data Helpers ──────────────────────────────────────────
    const seatScore = (i: number) => {
      if (i < 0 || i >= SEAT_COUNT) return 50;
      const x = meta.pos[i*3], y = meta.pos[i*3+1], z = meta.pos[i*3+2];
      const d = Math.hypot(x,z);
      const dn = THREE.MathUtils.clamp((d-52)/70,0,1)*30;
      const mid = (Math.abs(x)/Math.hypot(x,z))*12;
      const hp = (Math.abs(y-12)/25)*10;
      return Math.round(THREE.MathUtils.clamp(99-dn-mid-hp,45,99));
    };
    const seatPrice = (i: number, sc: number) => {
      if (i < 0 || i >= SEAT_COUNT) return 50;
      const secIdx = meta.secIdx[i];
      const sec = sections[secIdx];
      if (!sec) return 50;
      const t = sec.tier;
      const f = [(s: number) => 60+s*1.16, (s: number) => 70+s*1.3, (s: number) => 24+s*0.75][t] || ((s: number) => 50+s);
      return Math.round(f(sc));
    };
    const seatInfoData = (i: number) => {
      if (i < 0 || i >= SEAT_COUNT) return null;
      const secIdx = meta.secIdx[i];
      const sec = sections[secIdx];
      if (!sec) return null;
      const sc = seatScore(i);
      const tierObj = TIERS[sec.tier];
      const tierName = tierObj ? tierObj.name : 'Lower Tier';
      return { i, sec, label:sec.label, tier:tierName, row:meta.row[i], seat:meta.seatNum[i], score:sc, price:seatPrice(i,sc), avail:!!meta.avail[i], pos:new THREE.Vector3(meta.pos[i*3],meta.pos[i*3+1],meta.pos[i*3+2]) };
    };

    let featuredIdx = -1;
    {
      const sec = sections.find((s: any) => s.label===125);
      if (sec) {
        for (let i = sec.start; i < sec.start+sec.count; i++) {
          if (meta.row[i]===12 && meta.seatNum[i]===18) { featuredIdx = i; break; }
        }
        if (featuredIdx < 0) featuredIdx = sec.start+Math.floor(sec.count/2);
      } else featuredIdx = Math.floor(SEAT_COUNT/2);
    }
    if (featuredIdx < 0 || featuredIdx >= SEAT_COUNT) featuredIdx = 0;

    // ── GPU Picking ────────────────────────────────────────────────
    const pickRT = new THREE.WebGLRenderTarget(1, 1);
    const pickBuf = new Uint8Array(4);
    const pickAt = (cx: number, cy: number) => {
      const rect = canvas.getBoundingClientRect();
      const nx = cx - rect.left, ny = cy - rect.top;
      const dpr = renderer.getPixelRatio();
      camera.setViewOffset(canvas.width, canvas.height, Math.floor(nx*dpr), Math.floor(ny*dpr), 1, 1);
      renderer.setRenderTarget(pickRT);
      renderer.clear();
      renderer.render(pickScene, camera);
      renderer.setRenderTarget(null); camera.clearViewOffset();
      renderer.readRenderTargetPixels(pickRT, 0, 0, 1, 1, pickBuf);
      const id = (pickBuf[0]<<16)|(pickBuf[1]<<8)|pickBuf[2];
      if (id === 0) return -1;
      const idx = id - 1;
      if (idx < 0 || idx >= SEAT_COUNT) return -1;
      return idx;
    }

    // ── Seat Color State ───────────────────────────────────────────
    const tmpC = new THREE.Color();
    const paintSeat = (i: number, r: number, g: number, b: number) => {
      if (i < 0 || i >= SEAT_COUNT) return;
      tmpC.setRGB(r,g,b); seatMesh.setColorAt(i,tmpC);
    };
    const restoreSeat = (i: number) => {
      if (i < 0 || i >= SEAT_COUNT) return;
      paintSeat(i, baseColors[i*3], baseColors[i*3+1], baseColors[i*3+2]);
    };
    const tintRange = (start: number, count: number, mul: number) => {
      const end = Math.min(SEAT_COUNT, start + count);
      for (let i = Math.max(0, start); i < end; i++) paintSeat(i, Math.min(1,baseColors[i*3]*mul), Math.min(1,baseColors[i*3+1]*mul), Math.min(1,baseColors[i*3+2]*mul));
    };
    let hoverIdx = -1, hoverSec = -1, selectedIdx = -1;
    const SEL = new THREE.Color(0x67e8f9), HOV = new THREE.Color(0xaef0ff);
    const applySelection = (i: number) => {
      if (selectedIdx >= 0 && selectedIdx < SEAT_COUNT) {
        const oldSecIdx = meta.secIdx[selectedIdx];
        const old = sections[oldSecIdx];
        if (old) tintRange(old.start, old.count, 1);
      }
      selectedIdx = i;
      if (i >= 0 && i < SEAT_COUNT) {
        selGlow.position.set(meta.pos[i*3], meta.pos[i*3+1]+0.95, meta.pos[i*3+2]);
        const rs = meta.rowStart[i], rc = meta.rowCount[i];
        for (let n = Math.max(rs,i-2); n <= Math.min(rs+rc-1,i+2); n++) {
          if (n >= 0 && n < SEAT_COUNT) tintRange(n,1,1.35);
        }
        seatMesh.setColorAt(i, SEL);
      }
      if (seatMesh.instanceColor) seatMesh.instanceColor.needsUpdate = true;
      drawOverviewBase();
    };
    const setHover = (i: number) => {
      if (i===hoverIdx) return;
      if (hoverIdx>=0 && hoverIdx<SEAT_COUNT && hoverIdx!==selectedIdx) restoreSeat(hoverIdx);
      const newSec = (i>=0 && i<SEAT_COUNT) ? meta.secIdx[i] : -1;
      if (newSec!==hoverSec) {
        if (hoverSec>=0 && sections[hoverSec]) {
          const s=sections[hoverSec]; tintRange(s.start,s.count,1);
          if (selectedIdx>=0 && selectedIdx<SEAT_COUNT && meta.secIdx[selectedIdx]===hoverSec) seatMesh.setColorAt(selectedIdx,SEL);
        }
        if (newSec>=0 && sections[newSec]) {
          const s=sections[newSec]; tintRange(s.start,s.count,1.18);
        }
        hoverSec = newSec;
      }
      hoverIdx = i;
      if (i>=0 && i<SEAT_COUNT && i!==selectedIdx) seatMesh.setColorAt(i, HOV);
      if (selectedIdx>=0 && selectedIdx<SEAT_COUNT) seatMesh.setColorAt(selectedIdx, SEL);
      if (seatMesh.instanceColor) seatMesh.instanceColor.needsUpdate = true;
    }

    // ── Camera & Controls ──────────────────────────────────────────
    let currentSeatInfo: any = null;
    const HOME = { theta:2.35, phi:1.04, radius:236 };
    const orbit = { theta:HOME.theta, phi:HOME.phi, radius:HOME.radius, thetaT:HOME.theta, phiT:HOME.phi, radiusT:HOME.radius, target:new THREE.Vector3(0,9,0) };
    let lastOrbit = { ...HOME };
    const seatView = { eye:new THREE.Vector3(), yawBase:0, pitchBase:0, yawOff:0, pitchOff:0 };
    let modeStr = 'orbit', is2D = false, userInteracted = false;

    const applyOrbit = () => {
      const sp = Math.sin(orbit.phi);
      camera.position.set(orbit.target.x+orbit.radius*sp*Math.cos(orbit.theta), orbit.target.y+orbit.radius*Math.cos(orbit.phi), orbit.target.z+orbit.radius*sp*Math.sin(orbit.theta));
      camera.lookAt(orbit.target);
    };
    const eyeFor = (i: number) => {
      const p = new THREE.Vector3(meta.pos[i*3], meta.pos[i*3+1], meta.pos[i*3+2]);
      return p.addScaledVector(new THREE.Vector3(-p.x,0,-p.z).normalize(), 0.12).add(new THREE.Vector3(0,1.18,0));
    };
    const lookFor = (i: number) => new THREE.Vector3(meta.pos[i*3]*0.06, 1.2, meta.pos[i*3+2]*0.06);

    // ── Toast / Tooltip ────────────────────────────────────────────
    let toastTimer: any;
    const toast = (msg: string, ms = 2600) => {
      if (toastRef.current) { toastRef.current.textContent = msg; toastRef.current.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toastRef.current?.classList.remove('show'), ms); }
    };
    const showTip = (x: number, y: number, info: any) => {
      if (!tipRef.current || !tip1Ref.current || !tip2Ref.current) return;
      const rect = wrapRef.current!.getBoundingClientRect();
      tip1Ref.current.textContent = `Section ${info.label} · Row ${info.row} · Seat ${info.seat}`;
      tip2Ref.current.textContent = info.avail ? `€${info.price} · ${info.score}% view` : 'Unavailable';
      tipRef.current.style.left = `${Math.min(x-rect.left, W-180)}px`;
      tipRef.current.style.top = `${y-rect.top+12}px`;
      tipRef.current.style.opacity = '1';
    };
    const hideTip = () => { if (tipRef.current) tipRef.current.style.opacity = '0'; };

    // ── Crowd Audio ────────────────────────────────────────────────
    let AC: AudioContext | null = null, crowdGain: GainNode | null = null;
    const ensureAudio = () => {
      if (AC) return;
      try { AC = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch(e) { return; }
      const buf = AC.createBuffer(1, AC.sampleRate*2, AC.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random()*2-1;
      const src = AC.createBufferSource(); src.buffer = buf; src.loop = true;
      const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 720; bp.Q.value = 0.5;
      crowdGain = AC.createGain(); crowdGain.gain.value = 0;
      const lfo = AC.createOscillator(); lfo.frequency.value = 0.11;
      const lg = AC.createGain(); lg.gain.value = 0.012;
      lfo.connect(lg); lg.connect(crowdGain.gain); lfo.start();
      src.connect(bp); bp.connect(crowdGain); crowdGain.connect(AC.destination); src.start();
    };
    const setCrowd = (level: number) => { if (!AC||!crowdGain) return; crowdGain.gain.cancelScheduledValues(AC.currentTime); crowdGain.gain.linearRampToValueAtTime(level, AC.currentTime+1.4); };
    const cheers = () => {
      if (!AC) return;
      const buf = AC.createBuffer(1, (AC.sampleRate*1.6)|0, AC.sampleRate);
      const d = buf.getChannelData(0); for (let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
      const s = AC.createBufferSource(); s.buffer = buf;
      const f = AC.createBiquadFilter(); f.type='bandpass'; f.frequency.value=1350; f.Q.value=0.7;
      const g = AC.createGain(); const t = AC.currentTime;
      g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.16,t+0.25); g.gain.exponentialRampToValueAtTime(0.0001,t+1.55);
      s.connect(f); f.connect(g); g.connect(AC.destination); s.start();
    };

    // ── POV Thumbnail Capture ──────────────────────────────────────
    const captureView = (i: number): string => {
      const eye = eyeFor(i), look = lookFor(i);
      const sp = camera.position.clone(), sq = camera.quaternion.clone(), sf = camera.fov;
      camera.position.copy(eye); camera.lookAt(look); camera.fov = 58; camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      const oc = document.createElement('canvas'); oc.width = 480; oc.height = 290;
      oc.getContext('2d')!.drawImage(renderer.domElement, 0, 0, oc.width, oc.height);
      const url = oc.toDataURL('image/jpeg', 0.74);
      camera.position.copy(sp); camera.quaternion.copy(sq); camera.fov = sf; camera.updateProjectionMatrix();
      return url;
    }

    // ── Flight Animations ──────────────────────────────────────────
    const enterSeatMode = (info: any) => {
      modeStr = 'seat';
      canvas.classList.add('seatmode');
      seatView.eye.copy(eyeFor(info.i));
      const d = lookFor(info.i).sub(seatView.eye);
      seatView.yawBase = Math.atan2(d.x, d.z);
      seatView.pitchBase = Math.asin(THREE.MathUtils.clamp(d.y/d.length(),-1,1));
      seatView.yawOff = 0; seatView.pitchOff = 0;
      camera.fov = 55; camera.updateProjectionMatrix();
      dockRef.current?.classList.add('hidden');
      backbarRef.current?.classList.add('show');
      sbHintRef.current?.classList.add('show');
      setTimeout(() => sbHintRef.current?.classList.remove('show'), 4200);
      setCrowd(0.075); cheers();

      // Capture preview and call onSeatSelect callback
      const previewUrl = captureView(info.i);
      if (onSeatSelect) {
        const seatData: SeatInfo = {
          section: info.label, tier: info.tier, row: info.row, seat: info.seat,
          score: info.score, price: info.price, avail: info.avail,
          previewUrl, benefits: (['Lower Tier','Club Tier','Upper Tier'].indexOf(info.tier) === 0) ? ['Padded seat','Great view','Food & drink voucher'] : ((['Lower Tier','Club Tier','Upper Tier'].indexOf(info.tier) === 1) ? ['Lounge access','Halftime table service','Padded club seat'] : ['Full pitch view','Budget friendly','Fast concourse access']),
        };
        onSeatSelect(seatData, previewUrl, minimapCanvasRef?.current || null);
      }
    };

    const flyToSeat = (i: number) => {
      const info = seatInfoData(i);
      currentSeatInfo = info;
      setHover(-1); hideTip(); applySelection(i);

      if (modeStr==='orbit') lastOrbit = { theta:orbit.theta, phi:orbit.phi, radius:orbit.radius };
      modeStr = 'fly';
      const eye = eyeFor(i), look = lookFor(i);
      const startLook = new THREE.Vector3();
      camera.getWorldDirection(startLook).multiplyScalar(40).add(camera.position);
      const p0 = camera.position.clone();
      const outward = new THREE.Vector3(eye.x,0,eye.z).normalize();
      const p1 = p0.clone().lerp(eye,0.3); p1.y = Math.max(p0.y,eye.y)+34;
      const p2 = eye.clone().addScaledVector(outward,-14); p2.y = eye.y+16;
      const curve = new THREE.CatmullRomCurve3([p0,p1,p2,eye], false, 'catmullrom', 0.35);
      const st = { t: 0 }, lp = new THREE.Vector3(), startFov = camera.fov;
      gsap.to(st, { t:1, duration:REDUCED?0.7:3.4, ease:'power3.inOut',
        onUpdate() {
          curve.getPoint(st.t, camera.position);
          lp.copy(startLook).lerp(look, THREE.MathUtils.smoothstep(st.t,0.12,0.85));
          camera.lookAt(lp);
          camera.fov = THREE.MathUtils.lerp(startFov, 55, THREE.MathUtils.smoothstep(st.t,0.3,1));
          camera.updateProjectionMatrix();
        },
        onComplete() { enterSeatMode(info); },
      });
      ensureAudio(); setCrowd(0.02);
    };

    const exitSeatMode = () => {
      if (modeStr!=='seat') return;
      modeStr = 'fly';
      canvas.classList.remove('seatmode');
      backbarRef.current?.classList.remove('show');
      sbHintRef.current?.classList.remove('show');
      dockRef.current?.classList.remove('hidden');
      orbit.theta = orbit.thetaT = lastOrbit.theta;
      orbit.phi = orbit.phiT = lastOrbit.phi;
      orbit.radius = orbit.radiusT = lastOrbit.radius;
      const sp2 = Math.sin(lastOrbit.phi);
      const dest = new THREE.Vector3(orbit.target.x+lastOrbit.radius*sp2*Math.cos(lastOrbit.theta), orbit.target.y+lastOrbit.radius*Math.cos(lastOrbit.phi), orbit.target.z+lastOrbit.radius*sp2*Math.sin(lastOrbit.theta));
      const p0 = camera.position.clone();
      const p1 = p0.clone().lerp(dest,0.45); p1.y = Math.max(p0.y,dest.y)+26;
      const curve = new THREE.CatmullRomCurve3([p0,p1,dest], false, 'catmullrom', 0.4);
      const startLook = new THREE.Vector3();
      camera.getWorldDirection(startLook).multiplyScalar(40).add(camera.position);
      const st = { t: 0 }, lp = new THREE.Vector3(), startFov = camera.fov;
      gsap.to(st, { t:1, duration:REDUCED?0.6:2.2, ease:'power3.inOut',
        onUpdate() {
          curve.getPoint(st.t, camera.position);
          lp.copy(startLook).lerp(orbit.target, THREE.MathUtils.smoothstep(st.t,0.1,0.8));
          camera.lookAt(lp);
          camera.fov = THREE.MathUtils.lerp(startFov, 50, THREE.MathUtils.smoothstep(st.t,0,0.7));
          camera.updateProjectionMatrix();
        },
        onComplete() { modeStr = 'orbit'; },
      });
      setCrowd(0.02);
    };

    // ── Minimap Drawing ────────────────────────────────────────────
    const ovBase = document.createElement('canvas');
    const RXmax = TIERS[2].rxTop+3, RZmax = TIERS[2].rzTop+3;

    const drawOverviewBase = () => {
      const cv3 = minimapCanvasRef?.current;
      if (!cv3) return;
      ovBase.width = cv3.width; ovBase.height = cv3.height;
      const x = ovBase.getContext('2d')!, W2 = cv3.width, H2 = cv3.height, cx = W2/2, cy = H2/2;
      const sc = Math.min((W2-24)/(2*RXmax), (H2-16)/(2*RZmax));
      x.clearRect(0,0,W2,H2);
      const selSec = selectedIdx>=0 ? meta.secIdx[selectedIdx] : -1;
      sections.forEach((s: any, si: number) => {
        const t = TIERS[s.tier];
        x.beginPath();
        for (let k = 0; k <= 8; k++) {
          const a = s.a0+((s.a1-s.a0)*k)/8;
          const px = cx+t.rx*sc*Math.cos(a), py = cy+t.rz*sc*Math.sin(a);
          k ? x.lineTo(px,py) : x.moveTo(px,py);
        }
        for (let k = 8; k >= 0; k--) {
          const a = s.a0+((s.a1-s.a0)*k)/8;
          x.lineTo(cx+t.rxTop*sc*Math.cos(a), cy+t.rzTop*sc*Math.sin(a));
        }
        x.closePath();
        if (si===selSec) x.fillStyle = 'rgba(57,196,255,.9)';
        else { const c = sectionBaseColor(t, s.label-t.first); x.fillStyle = `rgba(${(c.r*255)|0},${(c.g*255)|0},${(c.b*255)|0},${s.tier===0?0.85:0.55})`; }
        x.fill(); x.strokeStyle='rgba(4,7,13,.9)'; x.lineWidth=1; x.stroke();
      });
      const pw = FIELD.L*sc, ph2 = FIELD.W*sc;
      x.fillStyle = '#15602a'; x.fillRect(cx-pw/2, cy-ph2/2, pw, ph2);
      x.strokeStyle = 'rgba(240,250,255,.75)'; x.lineWidth = 1;
      x.strokeRect(cx-pw/2+2, cy-ph2/2+2, pw-4, ph2-4);
      x.beginPath(); x.moveTo(cx,cy-ph2/2+2); x.lineTo(cx,cy+ph2/2-2); x.stroke();
      x.beginPath(); x.arc(cx,cy,ph2*0.13,0,TAU); x.stroke();
    };

    const drawMinimap = () => {
      const cv3 = minimapCanvasRef?.current;
      if (!cv3) return;
      const x = cv3.getContext('2d')!, W2 = cv3.width, H2 = cv3.height, cx = W2/2, cy = H2/2;
      const sc = Math.min((W2-30)/(2*RXmax), (H2-24)/(2*RZmax));
      x.clearRect(0,0,W2,H2); x.drawImage(ovBase,0,0);
      if (selectedIdx>=0) {
        const px = cx+meta.pos[selectedIdx*3]*sc, py = cy+meta.pos[selectedIdx*3+2]*sc;
        x.beginPath(); x.arc(px,py,4,0,TAU); x.fillStyle='#eaffff'; x.fill();
        x.beginPath(); x.arc(px,py,8,0,TAU); x.strokeStyle='rgba(57,196,255,.9)'; x.lineWidth=2; x.stroke();
        const s = sections[meta.secIdx[selectedIdx]];
        x.font = `700 15px Outfit, system-ui`; x.fillStyle='#dff4ff'; x.textAlign='center';
        x.fillText(String(s.label), px, py-14);
      }
      // Camera indicator
      const camA = Math.atan2(camera.position.z/RZmax, camera.position.x/RXmax);
      const camD = Math.min(1.25, Math.hypot(camera.position.x/RXmax, camera.position.z/RZmax));
      const px2 = cx+Math.cos(camA)*camD*RXmax*sc, py2 = cy+Math.sin(camA)*camD*RZmax*sc;
      x.beginPath(); x.moveTo(px2,py2); x.lineTo(cx,cy); x.strokeStyle='rgba(57,196,255,.35)'; x.lineWidth=2; x.stroke();
      x.beginPath(); x.arc(px2,py2,9,0,TAU); x.fillStyle='#2f9bff'; x.fill();
      x.beginPath(); x.arc(px2,py2,9,0,TAU); x.strokeStyle='rgba(255,255,255,.85)'; x.lineWidth=2; x.stroke();
    };

    // ── Hover Picking ──────────────────────────────────────────────
    let pendingHover: { x: number; y: number } | null = null;
    let lastPick = 0;
    const updateHover = (now: number) => {
      if (modeStr!=='orbit' || !pendingHover || now-lastPick < 60) return;
      lastPick = now;
      const { x, y } = pendingHover; pendingHover = null;
      const idx = pickAt(x, y);
      setHover(idx);
      if (idx>=0) { showTip(x,y,seatInfoData(idx)); canvas.style.cursor='pointer'; }
      else { hideTip(); canvas.style.cursor=''; }
    };

    // ── Match Update ───────────────────────────────────────────────
    const V3 = new THREE.Vector3(), FWD = new THREE.Vector3();
    let lastMinDraw = -1;
    const updateMatch = (t: number, dt: number) => {
      swayU.value = t; exciteU.value += (1-exciteU.value)*Math.min(1,dt*0.55);
      match.celebrate = Math.max(0, match.celebrate-dt);
      // Sync external score/minute
      score.minute = scoreRef.current.minute;
      if (scoreRef.current.home !== score.home || scoreRef.current.away !== score.away) {
        score.home = scoreRef.current.home; score.away = scoreRef.current.away;
        drawScoreboard();
      }
      if ((t|0)%5===0 && (t|0)!==lastMinDraw) { lastMinDraw=(t|0); drawScoreboard(); }
      match.t += dt;
      const bp = ball.position;
      if (match.phase==='hold') {
        const h = players[match.holder];
        FWD.set(Math.sin(h.g.rotation.y),0,Math.cos(h.g.rotation.y));
        V3.copy(h.g.position).addScaledVector(FWD,0.42); V3.y = 0.16+Math.abs(Math.sin(t*6.5))*0.05;
        bp.lerp(V3, Math.min(1,dt*8));
        if (match.t>=match.dur) { const dir=h.team?-1:1; startPass(h.g.position.x*dir>22&&rng()<0.42); }
      } else {
        const k = Math.min(1,match.t/match.dur);
        bp.lerpVectors(match.from,match.to,k); bp.y=0.16+Math.sin(Math.PI*k)*match.arc;
        ball.rotation.x -= dt*13; if (k>=1) onBallArrive();
      }
      let presser=-1, nd=1e9;
      const holderTeam=teamOf(match.holder), defBase=(holderTeam===0?1:0)*11;
      for (let i=defBase;i<defBase+11;i++) { if (players[i].gk) continue; const d=players[i].g.position.distanceToSquared(bp); if (d<nd){nd=d;presser=i;} }
      for (let i=0;i<players.length;i++) {
        const p=players[i]; let tx,tz,run=0.85;
        if (p.team===2) { tx=THREE.MathUtils.clamp(bp.x*0.72,-46,46); tz=THREE.MathUtils.clamp(bp.z+9,-28,28); run=0.8; }
        else if (i===match.holder&&match.phase==='hold') { const dir=p.team?-1:1; tx=THREE.MathUtils.clamp(p.g.position.x+dir*3,-49,49); tz=p.g.position.z; run=0.72; }
        else if (match.phase==='fly'&&!match.shot&&i===match.receiver) { tx=match.to.x; tz=match.to.z; run=1.55; }
        else if (p.gk) { tx=p.home.x; tz=THREE.MathUtils.clamp(bp.z*0.32,-3.4,3.4); run=0.7; }
        else if (i===presser) { tx=bp.x; tz=bp.z; run=1.5; }
        else { tx=THREE.MathUtils.clamp(p.home.x+bp.x*0.3,-49,49)+Math.sin(t*p.sp*0.5+p.ph)*2.4; tz=THREE.MathUtils.clamp(p.home.z+bp.z*0.22,-31,31)+Math.cos(t*p.sp*0.42+p.ph)*2.0; }
        const dx=tx-p.g.position.x, dz=tz-p.g.position.z, dist=Math.hypot(dx,dz);
        const step=Math.min(dist,run*4.8*dt);
        if (dist>0.03) { p.g.position.x+=(dx/dist)*step; p.g.position.z+=(dz/dist)*step; const ty=Math.atan2(dx,dz); let dyaw=ty-p.g.rotation.y; dyaw=Math.atan2(Math.sin(dyaw),Math.cos(dyaw)); p.g.rotation.y+=dyaw*Math.min(1,dt*6); }
        const speed=step/Math.max(dt,1e-4); p.amp+=(THREE.MathUtils.clamp(speed/6,0.05,1)-p.amp)*Math.min(1,dt*5);
        const sw=Math.sin(t*10.5*p.sp+p.ph)*p.amp*0.72;
        p.legL.rotation.x=sw; p.legR.rotation.x=-sw;
        if (match.celebrate>0&&p.team===match.scoredBy) { p.armL.rotation.x=-2.7+Math.sin(t*9+p.ph)*0.2; p.armR.rotation.x=-2.7+Math.cos(t*9+p.ph)*0.2; p.g.position.y=Math.abs(Math.sin(t*7+p.ph))*0.16; }
        else { p.armL.rotation.x=-sw*0.8; p.armR.rotation.x=sw*0.8; p.g.position.y=Math.abs(Math.sin(t*10.5*p.sp+p.ph))*0.045*p.amp; }
      }
    }

    // ── Pointer Events ─────────────────────────────────────────────
    const pointers = new Map<number, { x: number; y: number }>();
    let dragStart: { x: number; y: number; t: number } | null = null, dragMoved = 0, pinchDist = 0;

    const onPointerDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x:e.clientX, y:e.clientY });
      dragStart = { x:e.clientX, y:e.clientY, t:performance.now() }; dragMoved = 0;
      if (pointers.size===2) { const p=Array.from(pointers.values()); pinchDist=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y); }
      userInteracted = true; canvas.classList.add('dragging');
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) { if (modeStr==='orbit') pendingHover={x:e.clientX,y:e.clientY}; return; }
      const prev = pointers.get(e.pointerId)!;
      const dx=e.clientX-prev.x, dy=e.clientY-prev.y;
      pointers.set(e.pointerId, { x:e.clientX, y:e.clientY }); dragMoved+=Math.abs(dx)+Math.abs(dy);
      if (pointers.size===2) { const p=Array.from(pointers.values()); const d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y); if (pinchDist>0&&modeStr==='orbit') orbit.radiusT=THREE.MathUtils.clamp(orbit.radiusT*(pinchDist/d),60,360); pinchDist=d; return; }
      if (modeStr==='orbit') { orbit.thetaT-=dx*0.0045; orbit.phiT=THREE.MathUtils.clamp(orbit.phiT-dy*0.003,0.14,1.46); hideTip(); }
      else if (modeStr==='seat') { seatView.yawOff=THREE.MathUtils.clamp(seatView.yawOff-dx*0.0032,-1.5,1.5); seatView.pitchOff=THREE.MathUtils.clamp(seatView.pitchOff+dy*0.0024,-0.55,0.55); }
    };
    const onPointerUp = (e: PointerEvent) => {
      canvas.classList.remove('dragging');
      if (!pointers.has(e.pointerId)) return;
      pointers.delete(e.pointerId); pinchDist=0;
      if (dragStart&&modeStr==='orbit'&&dragMoved<7&&performance.now()-dragStart.t<520) {
        const idx=pickAt(e.clientX, e.clientY);
        if (idx>=0) {
          if (meta.avail[idx]) flyToSeat(idx);
          else {
            const rs=meta.rowStart[idx], re=rs+meta.rowCount[idx]-1; let found=-1;
            for (let d=1;d<meta.rowCount[idx];d++) { if (idx-d>=rs&&meta.avail[idx-d]){found=idx-d;break;} if (idx+d<=re&&meta.avail[idx+d]){found=idx+d;break;} }
            if (found>=0) { toast('That seat is taken — showing nearest free one'); flyToSeat(found); }
            else toast('That row is sold out — try another one');
          }
        }
      }
      dragStart=null;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault(); userInteracted=true;
      if (modeStr==='orbit') orbit.radiusT=THREE.MathUtils.clamp(orbit.radiusT*(1+e.deltaY*0.0011),60,360);
      else if (modeStr==='seat') { camera.fov=THREE.MathUtils.clamp(camera.fov+e.deltaY*0.02,28,68); camera.updateProjectionMatrix(); }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key==='Escape'&&modeStr==='seat') exitSeatMode();
      if (modeStr==='orbit') { userInteracted=true; const d: Record<string,()=>void> = { ArrowLeft:()=>orbit.thetaT+=0.12, ArrowRight:()=>orbit.thetaT-=0.12, ArrowUp:()=>orbit.phiT=Math.max(0.14,orbit.phiT-0.08), ArrowDown:()=>orbit.phiT=Math.min(1.46,orbit.phiT+0.08) }; d[e.key]?.(); }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);

    // ── Resize ────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const nW = wrap.clientWidth, nH = wrap.clientHeight;
      camera.aspect = nW/nH; camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
    });
    ro.observe(wrap);

    // ── FPS Adaptation ────────────────────────────────────────────
    let fpsAcc=0, fpsN=0, fpsCheck=0;
    const adaptQuality = (dt: number, now: number) => {
      fpsAcc+=dt; fpsN++;
      if (now-fpsCheck<2500) return; fpsCheck=now;
      const fps=fpsN/Math.max(1e-4,fpsAcc); fpsAcc=0; fpsN=0;
      const pr=renderer.getPixelRatio();
      if (fps<40&&pr>0.75) renderer.setPixelRatio(Math.max(0.75,pr-0.25));
      else if (fps>75&&pr<Math.min(2,window.devicePixelRatio)) renderer.setPixelRatio(Math.min(2,window.devicePixelRatio,pr+0.25));
    };

    // ── Main Loop ─────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let firstFrame = true, animFrameId = 0;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const dt=Math.min(0.05,clock.getDelta()), t=clock.elapsedTime, now=performance.now();
      for (const a of animatedTextures) a.t.offset.x += a.speed*dt*10;
      updateMatch(t, dt);
      if (modeStr==='orbit') {
        if (!userInteracted&&!REDUCED) orbit.thetaT+=dt*0.016;
        const k=REDUCED?1:Math.min(1,dt*5.5);
        orbit.theta+=(orbit.thetaT-orbit.theta)*k; orbit.phi+=(orbit.phiT-orbit.phi)*k; orbit.radius+=(orbit.radiusT-orbit.radius)*k;
        applyOrbit(); updateHover(now);
      } else if (modeStr==='seat') {
        const swayY=REDUCED?0:Math.sin(t*0.9)*0.012+Math.sin(t*2.3)*0.005;
        const swayYaw=REDUCED?0:Math.sin(t*0.42)*0.006, swayPitch=REDUCED?0:Math.cos(t*0.57)*0.004;
        camera.position.set(seatView.eye.x, seatView.eye.y+swayY, seatView.eye.z);
        const yaw=seatView.yawBase+seatView.yawOff+swayYaw;
        const pitch=THREE.MathUtils.clamp(seatView.pitchBase+seatView.pitchOff+swayPitch,-1.2,1.2);
        V3.set(Math.sin(yaw)*Math.cos(pitch), Math.sin(pitch), Math.cos(yaw)*Math.cos(pitch)).add(camera.position);
        camera.lookAt(V3);
      }
      if (selectedIdx>=0&&modeStr!=='seat') { selGlow.material.opacity=0.28+0.16*Math.sin(t*2.6); const gs=2.3+0.35*Math.sin(t*2.6); selGlow.scale.set(gs,gs,1); }
      else selGlow.material.opacity=0;
      drawMinimap(); adaptQuality(dt,now);
      renderer.render(scene, camera);
      if (firstFrame) {
        firstFrame=false;
        setTimeout(() => {
          captureView(featuredIdx);
          loaderRef.current?.classList.add('hide');
          toast('Click any seat to see the match from it', 3800);
        }, 60);
      }
    }

    // ── Button Wiring (via exposed refs) ──────────────────────────
    const goHome = () => {
      if (modeStr==='seat') { exitSeatMode(); return; }
      if (modeStr!=='orbit') return;
      userInteracted=true;
      gsap.to(orbit, { thetaT:HOME.theta, phiT:HOME.phi, radiusT:HOME.radius, duration:REDUCED?0.1:1.2, ease:'power2.inOut' });
      is2D=false; if (d3dBtnRef.current) d3dBtnRef.current.textContent='3D';
    };

    // ── Boot ──────────────────────────────────────────────────────
    applySelection(featuredIdx);
    currentSeatInfo = seatInfoData(featuredIdx);
    drawOverviewBase(); applyOrbit(); animate();

    // ── Expose to React ──────────────────────────────────────────
    engineRef.current = {
      goHome,
      exitSeatMode,
      zoomBy: (f: number) => { if (modeStr==='orbit') { userInteracted=true; orbit.radiusT=THREE.MathUtils.clamp(orbit.radiusT*f,60,360); } },
      toggle2D3D: () => {
        if (modeStr!=='orbit') return;
        userInteracted=true; is2D=!is2D;
        if (d3dBtnRef.current) d3dBtnRef.current.textContent=is2D?'2D':'3D';
        setMode3D(!is2D);
        gsap.to(orbit, { phiT:is2D?0.15:HOME.phi, radiusT:is2D?300:HOME.radius, duration:REDUCED?0.1:1.1, ease:'power2.inOut' });
      },
      updateScore: (h: number, a: number, m: number) => { score.home=h; score.away=a; score.minute=m; drawScoreboard(); },
      dispose: () => {
        cancelAnimationFrame(animFrameId);
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointercancel', onPointerUp);
        canvas.removeEventListener('wheel', onWheel);
        window.removeEventListener('keydown', onKeyDown);
        ro.disconnect();
        renderer.dispose();
        AC?.close();
        gsap.killTweensOf(orbit); gsap.killTweensOf({});
      },
    };
  }, []);

  useEffect(() => {
    initEngine();
    return () => { engineRef.current?.dispose?.(); };
  }, [initEngine]);

  return (
    <div id="stadium-view">
      <div ref={wrapRef} className="stadium-canvas-wrap">
        {/* Loading Screen */}
        <div ref={loaderRef} className="sv-loader" aria-live="polite">
          <svg className="sv-loader-icon" viewBox="0 0 24 24" fill="none">
            <path d="M12 2 21 7l-9 5-9-5 9-5Z" fill="#2f9bff" />
            <path d="M3 12l9 5 9-5" stroke="#39c4ff" strokeWidth="1.6" />
            <path d="M3 17l9 5 9-5" stroke="#39c4ff" strokeWidth="1.6" opacity=".5" />
          </svg>
          <div ref={loaderTextRef} className="sv-loader-text">Building the stadium…</div>
        </div>

        {/* Three.js Canvas */}
        <canvas ref={canvasRef} aria-label="Interactive 3D stadium. Click any seat to preview its view." />

        {/* Vignette */}
        <div className="sv-vig" aria-hidden="true" />

        {/* Bottom Dock */}
        <div ref={dockRef} className="sv-dock" role="toolbar" aria-label="3D view controls">
          <button className="sv-dock-btn" onClick={() => engineRef.current?.goHome?.()} aria-label="Reset orbit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3.4"/><path d="M20.5 12c0 1.9-3.8 3.5-8.5 3.5S3.5 13.9 3.5 12 7.3 8.5 12 8.5s8.5 1.6 8.5 3.5Z" transform="rotate(-24 12 12)"/></svg>
          </button>
          <button ref={d3dBtnRef} className={`sv-dock-btn ${mode3D ? 'active' : ''}`} onClick={() => engineRef.current?.toggle2D3D?.()} aria-pressed={mode3D}>3D</button>
          <div className="sv-dock-sep" />
          <button className="sv-dock-btn" onClick={() => engineRef.current?.zoomBy?.(0.86)} aria-label="Zoom in">+</button>
          <button className="sv-dock-btn" onClick={() => engineRef.current?.zoomBy?.(1.16)} aria-label="Zoom out">−</button>
        </div>

        {/* Back Bar (seat mode) */}
        <div ref={backbarRef} className="sv-backbar" role="toolbar" aria-label="Seat view controls">
          <button className="sv-backbar-exit" onClick={() => engineRef.current?.exitSeatMode?.()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
            Back to stadium
          </button>
          <button className="sv-backbar-snd" aria-label="Toggle crowd sound">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>
          </button>
        </div>

        {/* Seat Hint */}
        <div ref={sbHintRef} className="sv-sb-hint">Drag to look around · scroll to zoom</div>

        {/* Toast */}
        <div ref={toastRef} className="sv-toast" role="status" />

        {/* Tooltip */}
        <div ref={tipRef} className="sv-tip" aria-hidden="true" style={{ opacity: 0, position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
          <div><span ref={tip1Ref} className="sv-tip-1" /></div>
          <div><span ref={tip2Ref} className="sv-tip-2" /></div>
        </div>
      </div>
    </div>
  );
}
