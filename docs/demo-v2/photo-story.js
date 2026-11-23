(function () {
  var root = document.documentElement, loader = document.getElementById('loader'), pct = document.getElementById('pct');
  if (!root.classList.contains('has3d') || !window.THREE) { root.classList.remove('has3d'); return; }

  var section = document.getElementById('journey'), canvas = document.getElementById('city');
  var mobileInit = innerWidth < 760, SUF = mobileInit ? '-m' : '';

  // ---------- Real photo layers ----------
  var CREDITS = {
    nw: 'Photo: Mustafa Omar / Unsplash', problem: 'Photo: Click Smith / Unsplash', aerial: 'Photo: Joecalih / Unsplash',
    trails: 'Photo: Click Smith / Unsplash', dusk: 'Photo: Click Smith / Unsplash', kicc: 'Photo: Kenny Murgor / Unsplash'
  };
  var bgs = [].slice.call(section.querySelectorAll('.bg')), credit = document.getElementById('credit');
  var loaded = 0;
  bgs.forEach(function (el, i) {
    var src = 'img/' + el.dataset.src + SUF + '.webp', im = new Image();
    im.onload = function () { el.style.backgroundImage = 'url(' + src + ')'; loaded++; };
    setTimeout(function () { im.src = src; }, i === 0 ? 0 : 500 + i * 200);   // hero first, the rest after
  });
  var CH_BG = [0, 1, 2, 3, 4, 5, 5];
  // light touch only, so the real photos stay clear
  var FILTER = ['none', 'saturate(.75) brightness(.85)', 'brightness(.9)', 'none', 'brightness(1.05) contrast(1.05)', 'none', 'brightness(.92)'];

  var n = 0, iv = setInterval(function () {
    n = Math.min(100, n + (loaded ? 5 : 2)); pct.textContent = n + '%';
    if (n >= 100) { clearInterval(iv); setTimeout(function () { loader.classList.add('done'); }, 200); }
  }, 30);

  // ---------- three.js overlay ----------
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !mobileInit, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobileInit ? 1.25 : 1.5));
  renderer.setClearColor(0x000000, 0);
  var scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 14);

  function canvasTex(w, h, fn) { var c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); var t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t; }
  function dotTex(color) { return canvasTex(64, 64, function (g) { var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, color); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }); }
  function rr(g, x, y, w, h, r, fill) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); g.fillStyle = fill; g.fill(); }
  function add(o) { scene.add(o); return o; }
  function ease(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  function band(p, a, b, f) { return ease((p - a) / f) * (1 - ease((p - b) / f)); }
  function rand(a, b) { return a + Math.random() * (b - a); }
  // a sprite card: lines = [[text, weight, colour, size]]
  function card(lines, bg, border, w, h) {
    w = w || 560; h = h || 150;
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(w, h, function (g) {
      rr(g, 4, 4, w - 8, h - 8, 32, bg); if (border) { g.strokeStyle = border; g.lineWidth = 6; g.stroke(); }
      var total = lines.reduce(function (a, l) { return a + (l[3] || 40) * 1.25; }, 0), y = (h - total) / 2;
      lines.forEach(function (l) { var sz = l[3] || 40; y += sz * 1.12; g.fillStyle = l[2] || '#111'; g.font = (l[1] || 700) + ' ' + sz + 'px system-ui,Arial'; g.fillText(l[0], 32, y); });
    }), transparent: true, opacity: 0, depthWrite: false }));
    sp.userData.ar = w / h; add(sp); return sp;
  }
  function place(sp, x, y, z, width, a) { sp.position.set(x, y, z); sp.scale.set(width * (0.6 + 0.4 * a), width / sp.userData.ar * (0.6 + 0.4 * a), 1); sp.material.opacity = a; }

  // ---------- Hologram tower: "your business" (illustration) ----------
  var FLOORS = 12, FH = 0.46, TW = 1.5;
  var tower = new THREE.Group(); add(tower);
  var floorMats = [], edgeMat = new THREE.LineBasicMaterial({ color: 0x7cc4ff, transparent: true, opacity: 0 });
  for (var f = 0; f < FLOORS; f++) {
    var geo = new THREE.BoxGeometry(TW, FH * 0.86, TW);
    var m = new THREE.MeshBasicMaterial({ color: 0xffc56b, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    floorMats.push(m);
    var mesh = new THREE.Mesh(geo, m); mesh.position.y = f * FH + FH / 2; tower.add(mesh);
    var e = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat); e.position.y = mesh.position.y; tower.add(e);
  }
  var TOP = FLOORS * FH;
  var crown = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.05, 8, 64), new THREE.MeshBasicMaterial({ color: 0x25D366, transparent: true, opacity: 0 }));
  crown.rotation.x = Math.PI / 2; crown.position.y = TOP + 0.25; tower.add(crown);
  var label = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(512, 120, function (g, w, h) { rr(g, 4, 4, w - 8, h - 8, 50, 'rgba(4,33,15,.9)'); g.fillStyle = '#25D366'; g.font = '800 54px system-ui,Arial'; g.textAlign = 'center'; g.fillText('YOUR BUSINESS', w / 2, 80); }), transparent: true, opacity: 0, depthWrite: false }));
  label.scale.set(3.0, 0.7, 1); label.position.y = TOP + 1.0; tower.add(label);
  var baseGlow = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: dotTex('rgba(255,190,90,0.6)'), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  baseGlow.rotation.x = -Math.PI / 2; tower.add(baseGlow);

  // Website features: each one lights two floors and gets a tag beside them
  var FEAT = ['Mobile-friendly', 'Fast on Kenyan data', 'Shows on Google', 'Ready for AI search', 'WhatsApp chat button', 'Maps + contact form'];
  var featTags = FEAT.map(function (t) { return card([[t, 800, '#04210f', 40]], 'rgba(255,214,140,.96)', null, 520, 96); });

  // ---------- Customers ----------
  var N = mobileInit ? 140 : 220, cArr = new Float32Array(N * 3), cSeed = [];
  for (var i = 0; i < N; i++) cSeed.push({ y: rand(-4.5, 4.5), z: rand(-2, 2), s: rand(0.04, 0.1), ph: Math.random(), a: Math.random() * 6.28 });
  var cGeo = new THREE.BufferGeometry(); cGeo.setAttribute('position', new THREE.BufferAttribute(cArr, 3));
  var cMat = new THREE.PointsMaterial({ size: 0.22, map: dotTex('rgba(255,235,200,0.9)'), transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
  add(new THREE.Points(cGeo, cMat));

  // ---------- Problem: one visual per pain point ----------
  var P1 = card([['Search: "dentist near me"', 700, '#555', 30], ['No website found for you', 800, '#c0392b', 40]], '#ffffff', '#ff6b6b', 600, 150);
  var P2 = card([['3 missed calls', 900, '#ff8a8a', 46], ['Nobody replied', 600, '#ddd', 30]], 'rgba(42,18,22,.94)', '#ff6b6b', 520, 150);
  var P3 = card([['AI: "Try Other Clinic"', 800, '#ff8a8a', 38], ['Your competitor wins', 600, '#ddd', 30]], 'rgba(42,18,22,.94)', '#ff6b6b', 600, 150);
  var rings = [];
  for (var r = 0; r < 5; r++) rings.push({ m: add(new THREE.Mesh(new THREE.RingGeometry(0.3, 0.38, 48), new THREE.MeshBasicMaterial({ color: 0xff5a5a, transparent: true, opacity: 0, depthWrite: false }))), ph: r / 5, dx: rand(-1.6, 1.6), dy: rand(-1.2, 1.2) });

  // ---------- WhatsApp: one card per automation ----------
  var WA = [
    card([['Hi! Sorry we missed your call.', 700, '#111', 34], ['How can we help?', 500, '#444', 30]], '#ffffff', null, 600, 150),
    card([['✓ Reminder: Sat 10am', 800, '#111', 38], ['Reply YES to confirm', 500, '#355', 30]], '#dcf8c6', null, 560, 150),
    card([['★★★★★', 900, '#d48806', 40], ['Thanks! Review posted', 600, '#333', 30]], '#ffffff', null, 520, 150),
    card([['M-PESA', 900, '#2e7d32', 34], ['Pay KSh 2,500 (example)', 700, '#111', 34]], '#ffffff', null, 560, 150)
  ];

  // ---------- AI ----------
  var beam = add(new THREE.Mesh(new THREE.ConeGeometry(1.6, 16, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0x9fd4ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })));
  var aiTag = card([['AI TOP PICK', 900, '#25D366', 30], ['Your Business ★ 4.9', 900, '#111', 44]], '#ffffff', '#25D366', 600, 160);
  var aiPulse = add(new THREE.Mesh(new THREE.RingGeometry(1.0, 1.1, 64), new THREE.MeshBasicMaterial({ color: 0x9fd4ff, transparent: true, opacity: 0, depthWrite: false })));
  aiPulse.rotation.x = -Math.PI / 2;
  var aiQ = document.getElementById('aiQ'), aiA = document.getElementById('aiA'), Q = 'Who is the best dentist in Westlands?';

  // ---------- How it works ----------
  var HOW = [
    card([['1  We audit', 800, '#fff', 40], ['Free AI visibility check', 500, '#a9b1c1', 28]], 'rgba(18,24,52,.94)', '#7cc4ff'),
    card([['2  We build', 800, '#fff', 40], ['Website · WhatsApp · AI', 500, '#a9b1c1', 28]], 'rgba(18,24,52,.94)', '#7cc4ff'),
    card([['3  You grow', 800, '#25D366', 40], ['More customers', 500, '#a9b1c1', 28]], 'rgba(18,24,52,.94)', '#25D366')
  ];

  // ---------- Gold sparks ----------
  var SN = 80, sArr = new Float32Array(SN * 3), sSeed = [];
  for (var q = 0; q < SN; q++) sSeed.push([rand(-0.8, 0.8), rand(-0.8, 0.8), Math.random(), rand(0.15, 0.35)]);
  var sGeo = new THREE.BufferGeometry(); sGeo.setAttribute('position', new THREE.BufferAttribute(sArr, 3));
  var sMat = new THREE.PointsMaterial({ size: 0.28, map: dotTex('rgba(255,200,70,0.95)'), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  add(new THREE.Points(sGeo, sMat));

  // ---------- Step lists + leader line ----------
  var stepLists = {}; [].forEach.call(section.querySelectorAll('.steps'), function (ul) { stepLists[ul.dataset.ch] = [].slice.call(ul.children); });
  var lead = document.getElementById('lead'), leadPath = document.getElementById('leadPath'), leadDot = document.getElementById('leadDot');
  var tmpV = new THREE.Vector3();
  function setSteps(ch, k) { var list = stepLists[ch]; if (!list) return; list.forEach(function (li, j) { li.classList.toggle('on', j === k); li.classList.toggle('done', j < k); }); }
  function stepOf(lt, n) { return Math.max(0, Math.min(n - 1, Math.floor(((lt - 0.06) / 0.86) * n))); }
  function local(lt, n, k) { return Math.max(0, Math.min(1, ((lt - 0.06) / 0.86) * n - k)); } // 0..1 inside step k
  function drawLead(li, obj, a) {
    if (!li || !obj || a < 0.05 || camera.aspect < 0.9) { lead.style.opacity = 0; return; }
    var pin = lead.getBoundingClientRect(), b = li.getBoundingClientRect();
    tmpV.copy(obj.position).project(camera);
    var x2 = (tmpV.x + 1) / 2 * pin.width, y2 = (1 - tmpV.y) / 2 * pin.height;
    var sw = obj.scale ? obj.scale.x : 0; // aim at the card's left edge
    var px = (sw / 2) / (Math.tan(22.5 * Math.PI / 180) * (camera.position.z - obj.position.z) * camera.aspect) * pin.width / 2;
    x2 -= Math.min(px, pin.width * 0.2);
    var x1 = b.right - pin.left + 8, y1 = b.top - pin.top + b.height / 2;
    leadPath.setAttribute('d', 'M' + x1 + ',' + y1 + ' C' + (x1 + 80) + ',' + y1 + ' ' + (x2 - 80) + ',' + y2 + ' ' + x2 + ',' + y2);
    leadDot.setAttribute('cx', x2); leadDot.setAttribute('cy', y2); lead.style.opacity = a;
  }

  // ---------- Scroll + frame ----------
  var S = [0, 0.1, 0.27, 0.43, 0.6, 0.77, 0.91, 1.0];
  function chapterOf(p) { for (var i = 0; i < 7; i++) if (p < S[i + 1] || i === 6) return [i, Math.max(0, Math.min(1, (p - S[i]) / (S[i + 1] - S[i])))]; }
  var panels = section.querySelectorAll('.panel'), rail = section.querySelectorAll('.rail i');
  var target = 0, cur = 0, visible = true, lw = 0, lh = 0, lastCredit = '', lastQ = -1;
  function resize() { var w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  function read() { var r = section.getBoundingClientRect(), sp = section.offsetHeight - innerHeight; target = Math.max(0, Math.min(1, -r.top / sp)); visible = r.bottom > 0 && r.top < innerHeight; }
  addEventListener('scroll', read, { passive: true }); addEventListener('resize', read);

  function frame(time) {
    requestAnimationFrame(frame); if (!visible) return;
    if (canvas.clientWidth !== lw || canvas.clientHeight !== lh) { lw = canvas.clientWidth; lh = canvas.clientHeight; resize(); }
    cur += (target - cur) * 0.08;
    var p = cur, T = time * 0.001, mobile = camera.aspect < 0.9, ch = chapterOf(p), ci = ch[0], lt = ch[1];
    var halfW = Math.tan(22.5 * Math.PI / 180) * 13 * camera.aspect;
    var leadLi = null, leadObj = null, leadA = 0;

    // photos
    var nextCi = Math.min(6, ci + 1), mix = ease((lt - 0.85) / 0.15);
    bgs.forEach(function (el, i) {
      var o = 0;
      if (i === CH_BG[ci]) o += 1 - (CH_BG[nextCi] !== i ? mix : 0);
      if (i === CH_BG[nextCi] && CH_BG[nextCi] !== CH_BG[ci]) o += mix;
      el.style.opacity = o.toFixed(3);
      if (o > 0) { var z = 1.02 + 0.05 * lt, x = (i % 2 ? -1 : 1) * 0.8 * lt; el.style.transform = 'scale(' + z.toFixed(4) + ') translateX(' + x.toFixed(2) + '%)'; el.style.filter = FILTER[ci]; }
    });
    var c = CREDITS[bgs[CH_BG[ci]].dataset.src]; if (c !== lastCredit) { credit.textContent = c; lastCredit = c; }

    // tower placement
    var tx = mobile ? 0 : 3.6, ty = mobile ? -0.2 : -3.3, ts = mobile ? 0.58 : 1;
    tower.position.set(tx, ty, 0); tower.scale.set(ts, ts, ts); tower.rotation.y = T * 0.25;
    var rise = ease((p - 0.27) / 0.05);
    tower.scale.y = ts * Math.max(0.001, rise);
    edgeMat.opacity = 0.85 * rise;
    var topW = new THREE.Vector3(tx, ty + TOP * ts, 0);

    // ===== 01 Problem: bullet k ↔ visual k =====
    var inP = band(p, 0.105, 0.265, 0.02), kP = stepOf(lt, 3), lP = local(lt, 3, kP);
    if (ci === 1) setSteps(1, kP);
    var pX = mobile ? 0 : 3.2, pW = mobile ? 3.4 : 4.2;
    [P1, P2, P3].forEach(function (sp, j) {
      var a = ci === 1 ? (j < kP ? 0.35 : j === kP ? ease(lP / 0.25) : 0) : 0;
      var y = mobile ? 3.2 - j * 0.0 : 2.2 - j * 1.9;
      var x = mobile ? 0 : pX + (j === 1 ? 0.8 : 0);
      if (mobile && j !== kP) a = 0;
      place(sp, x, y, 1, pW * (j === kP ? 1 : 0.85), a * inP);
      if (ci === 1 && j === kP) { leadLi = stepLists[1][kP]; leadObj = sp; leadA = a * inP; }
    });
    rings.forEach(function (r) { var t = (T * 0.6 + r.ph) % 1, on = ci === 1 && kP === 1 ? inP : 0; r.m.scale.setScalar(1 + t * 3); r.m.material.opacity = on * (1 - t) * 0.9; r.m.position.set((mobile ? 0 : pX + 0.8) + r.dx, (mobile ? 3.2 : 0.3) + r.dy, 0.5); });

    // ===== 02 Websites: feature k lights floors and its tag =====
    var kW = stepOf(lt, 6), lW = local(lt, 6, kW);
    if (ci === 2) setSteps(2, kW);
    var litFloors = ci < 2 ? 0 : ci > 2 ? FLOORS : Math.min(FLOORS, (kW * 2) + Math.floor(ease(lW / 0.5) * 2));
    floorMats.forEach(function (m2, fl) { var on = fl < litFloors ? 1 : 0; m2.opacity = (0.08 + 0.5 * on) * rise; m2.color.setHex(fl >= FLOORS - 2 && on ? 0x25D366 : 0xffc56b); });
    featTags.forEach(function (sp, j) {
      var a = ci === 2 ? (j < kW ? 0.55 : j === kW ? ease(lW / 0.3) : 0) : 0;
      if (mobile && j !== kW) a = 0;
      var fy = ty + (j * 2 + 1) * FH * ts, side = mobile ? 0 : (j % 2 ? -1 : 1);
      var x = mobile ? 0 : tx + side * 2.6, y = mobile ? topW.y + 0.9 : fy;
      place(sp, x, y, 1.2, mobile ? 2.6 : 2.8, a * band(p, 0.27, 0.425, 0.015));
      if (ci === 2 && j === kW) { leadLi = stepLists[2][kW]; leadObj = sp; leadA = a; }
    });
    crown.material.opacity = ease((p - 0.4) / 0.03); label.material.opacity = crown.material.opacity * (mobile && ci === 2 ? 0 : 1);
    baseGlow.material.opacity = 0.2 + 0.7 * ease((p - 0.3) / 0.5); baseGlow.scale.setScalar(0.6 + 1.2 * ease((p - 0.35) / 0.5));

    // customers: drift, stream past (problem), pour into the tower (WhatsApp on)
    var pull = ease((p - 0.45) / 0.1);
    cMat.color.setHex(p < 0.27 ? 0xffffff : (pull > 0.5 ? 0x25D366 : 0xffe3b0));
    cMat.size = mobile ? 0.17 : 0.22;
    for (var i2 = 0; i2 < N; i2++) {
      var s = cSeed[i2], k = (T * s.s + s.ph) % 1, x, y, z = s.z;
      if (p < 0.1) { x = (s.ph - 0.5) * 22 + Math.sin(T * 0.3 + s.a) * 0.6; y = ((s.y + 4.5 + T * s.s * 6) % 9) - 4.5; }
      else { x = -12 + k * 24; y = s.y + Math.sin(k * 6 + s.a) * 0.3; }
      if (pull > 0) { var f2 = Math.min(1, pull * (0.4 + k)); var cx = tx + Math.cos(s.a + T) * 0.6 * (1 - f2), cy = ty + 0.3 + k * TOP * ts; x += (cx - x) * f2; y += (cy - y) * f2; z *= (1 - f2); }
      cArr[i2 * 3] = x; cArr[i2 * 3 + 1] = y; cArr[i2 * 3 + 2] = z;
    }
    cGeo.attributes.position.needsUpdate = true;
    cMat.opacity = 0.9 * (1 - 0.5 * ease((p - 0.88) / 0.08));

    // ===== 03 WhatsApp: automation k ↔ card k =====
    var kA = stepOf(lt, 4), lA = local(lt, 4, kA), inA = band(p, 0.435, 0.595, 0.02);
    if (ci === 3) setSteps(3, kA);
    var my = topW.y - 1.3; var waPos = mobile ? [[0, my], [0, my], [0, my], [0, my]] : [[tx - 3.2, 2.2], [tx + 2.6, 1.2], [tx - 3.0, -0.3], [tx + 2.6, -1.6]];
    WA.forEach(function (sp, j) {
      var a = ci === 3 ? (j < kA ? 0.5 : j === kA ? ease(lA / 0.25) : 0) : 0;
      if (mobile && j !== kA) a = 0;
      var bx = Math.max(-halfW + 1.6, Math.min(halfW - 1.6, waPos[j][0]));
      place(sp, topW.x + (bx - topW.x) * Math.max(a, 0.001), topW.y - 1 + (waPos[j][1] - topW.y + 1) * a + Math.sin(T + j) * 0.06, 1.5, mobile ? 3.2 : 3.4, a * inA);
      if (ci === 3 && j === kA) { leadLi = stepLists[3][kA]; leadObj = sp; leadA = a * inA; }
    });

    // ===== 04 AI: the question types out, beam searches, answer locks on =====
    var inI = band(p, 0.6, 0.77, 0.02);
    var typed = ci === 4 ? Math.floor(Q.length * ease(lt / 0.3)) : (ci > 4 ? Q.length : 0);
    if (typed !== lastQ) { aiQ.textContent = Q.slice(0, typed) + (typed < Q.length && ci === 4 ? '▍' : ''); lastQ = typed; }
    var answered = ci === 4 && lt > 0.42; aiA.classList.toggle('show', answered || ci > 4);
    var lock = ease((lt - 0.32) / 0.1), bx2 = tx + Math.sin(T * 1.6) * (mobile ? 2.5 : 5) * (1 - lock);
    beam.material.opacity = 0.22 * inI; beam.position.set(bx2, topW.y + 8, 0); beam.rotation.z = (bx2 - tx) * -0.04;
    var aiA2 = inI * ease((lt - 0.4) / 0.08);
    place(aiTag, topW.x + (mobile ? 0 : -0.2), topW.y + (mobile ? -1.6 : 1.9), 2, mobile ? 3.2 : 3.8, aiA2);
    var kI = ci === 4 ? Math.max(0, Math.min(3, Math.floor((lt - 0.5) / 0.4 * 4))) : 0;
    if (ci === 4) { var chips = stepLists[4]; chips.forEach(function (li, j) { li.classList.toggle('on', lt > 0.5 && j === kI); li.classList.toggle('done', lt > 0.5 && j < kI); }); }
    var pt = (T * 0.8) % 1; aiPulse.position.set(tx, ty + 0.05, 0); aiPulse.scale.setScalar((1 + pt * 2.5) * ts); aiPulse.material.opacity = (ci === 4 && lt > 0.5 ? inI : 0) * (1 - pt);
    if (ci === 4) { if (lt < 0.42) { leadLi = aiQ; leadObj = null; } else { leadLi = aiA; leadObj = aiTag; leadA = aiA2; } }

    // ===== 05 How it works: step k ↔ tile k =====
    var kH = stepOf(lt, 3), lH = local(lt, 3, kH), inH = band(p, 0.775, 0.905, 0.02);
    if (ci === 5) setSteps(5, kH);
    var hy = topW.y - 1.4; var hPos = mobile ? [[0, hy], [0, hy], [0, hy]] : [[tx - 3.2, 1.6], [tx + 2.8, 0.4], [tx - 3.0, -0.9]];
    HOW.forEach(function (sp, j) {
      var a = ci === 5 ? (j < kH ? 0.6 : j === kH ? ease(lH / 0.25) : 0) : 0;
      if (mobile && j !== kH) a = 0;
      place(sp, hPos[j][0], hPos[j][1], 1.5, mobile ? 3.0 : 3.2, a * inH);
      if (ci === 5 && j === kH) { leadLi = stepLists[5][kH]; leadObj = sp; leadA = a * inH; }
    });

    // ===== 06 sparks =====
    sMat.opacity = ease((p - 0.78) / 0.05);
    for (var qq = 0; qq < SN; qq++) { var sd = sSeed[qq], t2 = (T * sd[3] + sd[2]) % 1; sArr[qq * 3] = topW.x + sd[0] * (1 + t2 * 2); sArr[qq * 3 + 1] = topW.y + t2 * 5; sArr[qq * 3 + 2] = sd[1] * (1 + t2 * 2); }
    sGeo.attributes.position.needsUpdate = true;

    camera.position.x = Math.sin(p * 6.28) * 0.4; camera.position.y = Math.cos(p * 3.14) * 0.2; camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    drawLead(leadLi, leadObj, leadA);

    panels.forEach(function (el) { el.classList.toggle('show', p >= +el.dataset.from && p <= +el.dataset.to); });
    rail.forEach(function (d, j) { d.classList.toggle('on', j === ci); });
  }
  resize(); read(); requestAnimationFrame(frame);
})();
