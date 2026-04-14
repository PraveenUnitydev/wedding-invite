/* ═══════════════════════════════════════════
   WEDDING INVITE · scene.js
   Three.js 3D scene — setup + animation loop
   Fix: camera.position.z is scroll-driven so
        there is no sudden zoom when page loads
        in a partially-scrolled state.
═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── RENDERER ── */
  const canvas  = document.getElementById('canvas-bg');
  const isMob   = window.innerWidth < 768;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMob,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMob ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x05030F, 1);

  /* ── SCENE ── */
  const scene = new THREE.Scene();
  scene.fog   = new THREE.FogExp2(0x05030F, 0.048);

  /* ── CAMERA ──
     Base z = 6. We will smoothly adjust z via scroll in the
     animation loop so there is NEVER a sudden position jump. */
  const camera = new THREE.PerspectiveCamera(
    58,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  camera.position.set(0, 0, 6);

  /* ── COLORS ── */
  const CG  = new THREE.Color(0xD4A843); // gold
  const CG2 = new THREE.Color(0xF0C96B); // gold light
  const CR  = new THREE.Color(0xC4506A); // rose
  const CM  = new THREE.Color(0xE8831A); // marigold
  const CC  = new THREE.Color(0xFDF8EE); // cream

  /* ════════════════════════════════
     STARFIELD
  ════════════════════════════════ */
  const starGroup = (function () {
    const N   = isMob ? 1600 : 2600;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);

    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      pos[i3]     = (Math.random() - .5) * 160;
      pos[i3 + 1] = (Math.random() - .5) * 160;
      pos[i3 + 2] = (Math.random() - .5) * 160;
      const r = Math.random();
      if (r < .5)       { col[i3]=.83; col[i3+1]=.66; col[i3+2]=.26; }
      else if (r < .75) { col[i3]=1;   col[i3+1]=.95; col[i3+2]=.87; }
      else              { col[i3]=.77; col[i3+1]=.31; col[i3+2]=.42; }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    const pts = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ size: .07, vertexColors: true, transparent: true, opacity: .8 })
    );
    scene.add(pts);
    return pts;
  }());

  /* ════════════════════════════════
     3D LOTUS
  ════════════════════════════════ */
  function build3DLotus(sc) {
    const grp = new THREE.Group();
    const PETALS = 10, LAYERS = 3;

    for (let L = 0; L < LAYERS; L++) {
      const ls = 1 - L * .18;
      const lz = L * .15;
      const lr = (L / LAYERS) * Math.PI / PETALS;

      for (let p = 0; p < PETALS; p++) {
        const angle = (p / PETALS) * Math.PI * 2 + lr;
        const pg    = new THREE.Group();

        /* petal face */
        const petalPts = [];
        for (let i = 0; i <= 24; i++) {
          const t = (i / 24) * Math.PI;
          petalPts.push(Math.cos(t) * .55 * ls, Math.sin(t) * .22 * ls, 0);
        }
        for (let i = 24; i >= 0; i--) {
          const t = (i / 24) * Math.PI;
          petalPts.push(Math.cos(t) * .55 * ls, -Math.sin(t) * .1 * ls, 0);
        }
        const idxArr = [];
        for (let i = 1; i < 24; i++) idxArr.push(0, i, i + 1);

        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(petalPts.flat()), 3));
        pGeo.setIndex(idxArr);
        pg.add(new THREE.Mesh(pGeo, new THREE.MeshBasicMaterial({
          color: L === 0 ? CG : (L === 1 ? CR : CG2),
          transparent: true,
          opacity: .07 + L * .035,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false,
        })));

        /* petal outline */
        const oPts = [];
        for (let i = 0; i <= 18; i++) {
          const t = (i / 18) * Math.PI;
          oPts.push(Math.cos(t) * .55 * ls, Math.sin(t) * .22 * ls, 0);
        }
        const oGeo = new THREE.BufferGeometry();
        oGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(oPts.flat()), 3));
        pg.add(new THREE.Line(oGeo, new THREE.LineBasicMaterial({
          color: L === 0 ? CG : CR,
          transparent: true,
          opacity: .3 - L * .06,
          blending: THREE.AdditiveBlending,
        })));

        pg.position.set(
          Math.cos(angle) * .42 * ls * sc,
          Math.sin(angle) * .42 * ls * sc,
          lz * sc
        );
        pg.rotation.z = angle;
        pg.rotation.x = Math.PI * .08;
        grp.add(pg);
      }
    }

    /* stamen */
    grp.add(new THREE.Mesh(
      new THREE.SphereGeometry(.13 * sc, 16, 16),
      new THREE.MeshBasicMaterial({ color: CG2, transparent: true, opacity: .55, blending: THREE.AdditiveBlending })
    ));
    for (let i = 1; i <= 5; i++) {
      grp.add(new THREE.Mesh(
        new THREE.SphereGeometry(.13 * sc + i * .18, 12, 12),
        new THREE.MeshBasicMaterial({
          color: CG, transparent: true, opacity: .01 / i,
          blending: THREE.AdditiveBlending, side: THREE.BackSide,
        })
      ));
    }

    grp.scale.setScalar(sc);
    return grp;
  }

  const lotus = build3DLotus(1.9);
  lotus.position.z = -.5;
  scene.add(lotus);

  /* ════════════════════════════════
     MANDALA RINGS
  ════════════════════════════════ */
  function mRing(r, seg, col, op) {
    const pts = [];
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      pts.push(Math.cos(a) * r, Math.sin(a) * r, 0);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    return new THREE.Line(g, new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending }));
  }

  function mSpokes(r, cnt, col, op) {
    const pts = [];
    for (let i = 0; i < cnt; i++) {
      const a = (i / cnt) * Math.PI * 2;
      pts.push(0, 0, 0, Math.cos(a) * r, Math.sin(a) * r, 0);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending }));
  }

  const mandala = new THREE.Group();
  mandala.add(
    mRing(2.9, 256, CG, .18), mRing(2.35, 256, CG, .12),
    mRing(1.85, 128, CG2, .10), mRing(1.35, 128, CR, .08),
    mRing(.88, 64, CG2, .14),
    mSpokes(2.9, 32, CG, .05), mSpokes(1.85, 16, CG2, .09)
  );

  /* arc decorations */
  for (let k = 0; k < 16; k++) {
    const a0 = (k / 16) * Math.PI * 2;
    const a1 = ((k + .5) / 16) * Math.PI * 2;
    const pts = [];
    for (let i = 0; i <= 14; i++) {
      const a = a0 + (a1 - a0) * (i / 14);
      pts.push(Math.cos(a) * 2.6, Math.sin(a) * 2.6, 0);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    mandala.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: CM, transparent: true, opacity: .07, blending: THREE.AdditiveBlending })));
  }

  mandala.rotation.x = .28;
  scene.add(mandala);

  const mandalaBack = new THREE.Group();
  mandalaBack.add(
    mRing(4.6, 256, CG, .055),
    mRing(3.9, 128, CR, .04),
    mSpokes(4.6, 24, CG, .03)
  );
  mandalaBack.rotation.x = .38;
  mandalaBack.position.z = -4.5;
  scene.add(mandalaBack);

  /* ════════════════════════════════
     ORBITING GEMS
  ════════════════════════════════ */
  const GCOLS = [CG, CR, CG2, CM, CC];

  function makeGem(sz, col) {
    const geo = new THREE.OctahedronGeometry(sz, 0);
    const grp = new THREE.Group();
    grp.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .5, blending: THREE.AdditiveBlending })));
    grp.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col, wireframe: true, transparent: true, opacity: .22, blending: THREE.AdditiveBlending })));
    return grp;
  }

  const orb1 = new THREE.Group();
  const orb2 = new THREE.Group();
  const orb3 = new THREE.Group();

  for (let i = 0; i < 8;  i++) { const g = makeGem(.07, GCOLS[i%5]);  const a=(i/8)*Math.PI*2;  g.position.set(Math.cos(a)*1.65, Math.sin(a)*1.65, 0);    orb1.add(g); }
  for (let i = 0; i < 12; i++) { const g = makeGem(.048, GCOLS[i%5]); const a=(i/12)*Math.PI*2; g.position.set(Math.cos(a)*2.2,  Math.sin(a)*2.2,  .08);  orb2.add(g); }
  for (let i = 0; i < 6;  i++) { const g = makeGem(.10, i%2===0?CG:CR); const a=(i/6)*Math.PI*2; g.position.set(Math.cos(a)*2.85, Math.sin(a)*2.85, -.1); orb3.add(g); }

  orb1.rotation.x = .3;
  orb2.rotation.set(.5, .2, 0);
  orb3.rotation.x = .15;

  const orbitGrp = new THREE.Group();
  orbitGrp.add(orb1, orb2, orb3);
  scene.add(orbitGrp);

  /* ════════════════════════════════
     TORUS KNOT
  ════════════════════════════════ */
  const tkMesh = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.05, .013, 200, 6, 3, 5),
    new THREE.MeshBasicMaterial({ color: CG, transparent: true, opacity: .065, blending: THREE.AdditiveBlending })
  );
  tkMesh.position.z = -2;
  scene.add(tkMesh);

  /* ════════════════════════════════
     TORUS RINGS
  ════════════════════════════════ */
  const torusDat = [
    [3.5, .007, CG,  .14, Math.PI * .5,  0],
    [2.95,.006, CR,  .10, Math.PI * .5,  Math.PI / 12],
    [4.0, .005, CG2, .08, Math.PI * .42, Math.PI / 8],
    [4.6, .004, CM,  .05, Math.PI * .38, -Math.PI / 10],
  ];

  const tori = torusDat.map(([r, t, c, op, rx, ry]) => {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(r, t, 4, 300),
      new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: op, blending: THREE.AdditiveBlending })
    );
    m.rotation.set(rx, ry, 0);
    scene.add(m);
    return m;
  });

  /* ════════════════════════════════
     PARTICLE FIELD
  ════════════════════════════════ */
  const PC  = isMob ? 450 : 800;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(PC * 3);
  const pVel = new Float32Array(PC * 3);
  const pCol = new Float32Array(PC * 3);

  for (let i = 0; i < PC; i++) {
    const i3  = i * 3;
    const rad = 2 + Math.random() * 7;
    const th  = Math.random() * Math.PI * 2;
    const ph  = (Math.random() - .5) * Math.PI;

    pPos[i3]     = rad * Math.cos(th) * Math.cos(ph);
    pPos[i3 + 1] = rad * Math.sin(ph);
    pPos[i3 + 2] = rad * Math.sin(th) * Math.cos(ph) - 2;

    pVel[i3]     = (Math.random() - .5) * .0012;
    pVel[i3 + 1] = Math.random() * .004 + .001;
    pVel[i3 + 2] = (Math.random() - .5) * .001;

    const c = Math.random();
    if      (c < .6)  { pCol[i3]=.83; pCol[i3+1]=.66; pCol[i3+2]=.26; }
    else if (c < .8)  { pCol[i3]=.91; pCol[i3+1]=.51; pCol[i3+2]=.1;  }
    else              { pCol[i3]=1;   pCol[i3+1]=.95; pCol[i3+2]=.87; }
  }

  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3));

  scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
    size: .065,
    vertexColors: true,
    transparent: true,
    opacity: .7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })));

  /* ════════════════════════════════
     GYROSCOPE / MOUSE TILT
  ════════════════════════════════ */
  let tiltX = 0, tiltY = 0;
  let smoothTX = 0, smoothTY = 0;
  let hasGyro  = false;

  function bindGyro() {
    window.addEventListener('deviceorientation', e => {
      if (e.gamma !== null) {
        hasGyro = true;
        tiltX = THREE.MathUtils.clamp(e.gamma / 28, -1, 1);
        tiltY = THREE.MathUtils.clamp((e.beta - 50) / 28, -1, 1);
      }
    }, { passive: true });
  }

  if (typeof DeviceOrientationEvent !== 'undefined') {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      document.addEventListener('touchstart', () => {
        DeviceOrientationEvent.requestPermission()
          .then(s => { if (s === 'granted') bindGyro(); })
          .catch(() => {});
      }, { once: true, passive: true });
    } else {
      bindGyro();
    }
  }

  document.addEventListener('mousemove', e => {
    if (!hasGyro) {
      tiltX = (e.clientX / window.innerWidth) * 2 - 1;
      tiltY = -((e.clientY / window.innerHeight) * 2 - 1);
    }
  }, { passive: true });

  /* ════════════════════════════════
     SCROLL-DRIVEN CAMERA Z
     ── This is the key fix for the
        "background zoom jerk" bug.
     Camera Z starts at 6 and eases
     to 5 as the page scrolls down.
     The transition is driven frame-
     by-frame so it is always smooth.
  ════════════════════════════════ */
  let targetCameraZ = 6;
  let currentCameraZ = 6;

  window.addEventListener('scroll', () => {
    const scrollFraction = Math.min(window.scrollY / window.innerHeight, 1);
    // Z range: 6 (top) → 5 (scrolled one full viewport down)
    targetCameraZ = 6 - scrollFraction * 1.0;
  }, { passive: true });

  /* ════════════════════════════════
     ANIMATION LOOP
  ════════════════════════════════ */
  let t = 0;

  function animate() {
    requestAnimationFrame(animate);
    t += .004;

    /* tilt parallax */
    smoothTX += (tiltX * .65 - smoothTX) * .05;
    smoothTY += (tiltY * .35 - smoothTY) * .05;
    camera.position.x = smoothTX * .85;
    camera.position.y = smoothTY * .5;

    /* smooth scroll-driven Z — no jump, ever */
    currentCameraZ += (targetCameraZ - currentCameraZ) * .06;
    camera.position.z = currentCameraZ;

    camera.lookAt(0, 0, 0);

    /* lotus */
    const br = 1 + Math.sin(t * 1.2) * .04;
    lotus.scale.setScalar(br);
    lotus.rotation.z = t * .065;
    lotus.rotation.y = Math.sin(t * .38) * .14;

    /* mandalas */
    mandala.rotation.z     = t * .09;
    mandalaBack.rotation.z = -t * .055;

    /* orbit rings */
    orb1.rotation.z = t * .17;
    orb2.rotation.z = -t * .11;
    orb2.rotation.y = t * .04;
    orb3.rotation.z = t * .065;
    orb3.rotation.x = .15 + Math.sin(t * .28) * .07;

    orb1.children.forEach((g, i) => { g.rotation.x = t * 1.1 + i; g.rotation.y = t * .9; });
    orb2.children.forEach((g, i) => { g.rotation.x = t * .85 + i * .45; g.rotation.z = t * 1.0; });
    orb3.children.forEach((g, i) => { g.rotation.y = t * 1.3 + i; });

    /* torus knot */
    tkMesh.rotation.x = t * .075;
    tkMesh.rotation.y = t * .048;

    /* tori */
    tori[0].rotation.z = t * .085;
    tori[1].rotation.z = -t * .065; tori[1].rotation.y = t * .03;
    tori[2].rotation.z = t * .038;  tori[2].rotation.x = Math.PI * .42 + Math.sin(t * .22) * .07;
    tori[3].rotation.z = -t * .028;

    /* particles drift upward */
    for (let i = 0; i < PC; i++) {
      const i3 = i * 3;
      pPos[i3]     += pVel[i3] + Math.sin(t + i * .07) * .0004;
      pPos[i3 + 1] += pVel[i3 + 1];
      pPos[i3 + 2] += pVel[i3 + 2];
      if (pPos[i3 + 1] > 6) pPos[i3 + 1] = -6;
    }
    pGeo.attributes.position.needsUpdate = true;

    /* stars slow drift */
    starGroup.rotation.y = t * .001;

    renderer.render(scene, camera);
  }

  animate();

  /* ── RESIZE ── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

}());
