/* =========================================================
   Moteur d animation du portfolio (issu des propositions Playground)
   Dépend de : gsap, ScrollTrigger, (optionnel) Lenis, Matter.js
   ========================================================= */
(function(){
  const PG = window.PG = {};
  gsap.registerPlugin(ScrollTrigger);
  gsap.ticker.lagSmoothing(0);
  PG.reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  PG.hover = matchMedia('(hover: hover)').matches;
  PG.rand = gsap.utils.random;

  /* ---------- défilement fluide ---------- */
  PG.lenis = null;
  PG.initLenis = function(){
    if (window.Lenis && !PG.reduce){
      const l = new Lenis({lerp:.09});
      l.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t=>l.raf(t*1000));
      l.stop(); PG.lenis = l;
    }
    document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
      const id = a.getAttribute('href'); if (id.length < 2) return;
      const t = document.querySelector(id); if (!t) return;
      e.preventDefault();
      PG.lenis ? PG.lenis.scrollTo(t,{duration:1.4}) : t.scrollIntoView({behavior:'smooth'});
    }));
  };
  PG.unlock = function(){
    document.body.classList.remove('locked');
    PG.lenis && PG.lenis.start();
    ScrollTrigger.refresh();
  };
  /* à appeler en fin de script : les déclencheurs sont recalculés dans l'ordre de la page */
  PG.finish = function(){ ScrollTrigger.sort(); ScrollTrigger.refresh(); };

  /* ---------- texte découpé en lettres (conserve les balises internes) ---------- */
  PG.splitChars = function(el){
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n=>{
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(w=>{
        if (!w) return;
        if (/^\s+$/.test(w)) { frag.append(' '); return; }
        const word = document.createElement('span');
        word.style.cssText = 'display:inline-block;white-space:nowrap';
        [...w].forEach(c=>{ const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; word.append(s); });
        frag.append(word);
      });
      n.replaceWith(frag);
    });
    return el.querySelectorAll('.ch');
  };
  PG.revealTitles = function(sel){
    document.querySelectorAll(sel || '.split').forEach(h=>{
      const ch = PG.splitChars(h);
      gsap.from(ch,{yPercent:110,rotate:()=>PG.rand(-20,20),opacity:0,stagger:.022,duration:.9,ease:'back.out(2.2)',
        scrollTrigger:{trigger:h,start:'top 85%',refreshPriority:-1}});
    });
  };
  /* lettres élastiques au survol */
  PG.elastic = function(el, colors){
    const chars = PG.splitChars(el);
    chars.forEach((c,i)=>c.addEventListener('mouseenter',()=>{
      gsap.timeline().to(c,{scaleY:1.25,scaleX:.85,y:-30,color:colors[i % colors.length],duration:.18,ease:'power2.out'})
        .to(c,{scaleY:1,scaleX:1,y:0,duration:1,ease:'elastic.out(1.2,.3)'});
    }));
    return chars;
  };

  /* ---------- curseur coloré ---------- */
  PG.cursor = function(colors){
    const cur = document.createElement('div'); cur.className = 'pg-cursor'; document.body.appendChild(cur);
    const cx = gsap.quickTo(cur,'x',{duration:.3,ease:'power3'}), cy = gsap.quickTo(cur,'y',{duration:.3,ease:'power3'});
    let k = 0;
    addEventListener('mousemove',e=>{ cx(e.clientX); cy(e.clientY); cur.style.opacity = 1; });
    document.querySelectorAll('a,button,.flip,.node,[data-hot]').forEach(el=>{
      el.addEventListener('mouseenter',()=>gsap.to(cur,{scale:2.6,backgroundColor:colors[++k % colors.length],duration:.4,ease:'back.out(3)'}));
      el.addEventListener('mouseleave',()=>gsap.to(cur,{scale:1,duration:.3}));
    });
    return cur;
  };

  /* ---------- blobs « goo » ---------- */
  PG.blobs = function(container, defs, hero){
    const els = defs.map(([s,c,x,y])=>{
      const b = document.createElement('i');
      b.style.cssText = `position:absolute;border-radius:50%;width:${s}vw;height:${s}vw;background:${c};left:${x}%;top:${y}%;margin:-${s/2}vw`;
      container.appendChild(b); return b;
    });
    if (!PG.reduce) els.forEach(b=>{
      const drift = ()=>gsap.to(b,{x:PG.rand(-120,120),y:PG.rand(-100,100),scale:PG.rand(.75,1.2),duration:PG.rand(3,5),ease:'sine.inOut',onComplete:drift});
      drift();
    });
    if (hero){
      const m = document.createElement('i');
      m.style.cssText = 'position:absolute;border-radius:50%;width:9vw;height:9vw;left:0;top:0;margin:-4.5vw;opacity:0;background:'+defs[0][1];
      container.appendChild(m);
      const mx = gsap.quickTo(m,'x',{duration:.8,ease:'power3'}), my = gsap.quickTo(m,'y',{duration:.8,ease:'power3'});
      hero.addEventListener('mousemove',e=>{ const r = container.getBoundingClientRect(); mx(e.clientX-r.left); my(e.clientY-r.top); gsap.to(m,{opacity:1,duration:.3}); });
    }
    return els;
  };

  /* ---------- physique : objets à attraper, lancer, secouer ---------- */
  PG.physics = function({pit, items, shakeBtn, gravity}){
    if (!window.Matter) return;
    const {Engine, Bodies, Composite, Mouse, MouseConstraint, Body} = Matter;
    const engine = Engine.create({gravity:{y:gravity || 1.1}});
    let W = pit.clientWidth, H = pit.clientHeight;
    const T = 200;
    const ground = Bodies.rectangle(W/2, H+T/2, W*3, T, {isStatic:true});
    const left = Bodies.rectangle(-T/2, H/2, T, H*4, {isStatic:true});
    const right = Bodies.rectangle(W+T/2, H/2, T, H*4, {isStatic:true});
    Composite.add(engine.world,[ground,left,right]);
    const els = items.map(it=>{
      const el = document.createElement('div');
      el.className = 'pill' + (it.round ? ' round' : '') + (it.cls ? ' '+it.cls : '');
      el.innerHTML = it.html || it.label;
      if (it.bg) el.style.background = it.bg;
      if (it.color) el.style.color = it.color;
      el.__it = it; pit.appendChild(el); return el;
    });
    const bodies = []; let dropped = false;
    function drop(){
      if (dropped) return; dropped = true;
      els.forEach((el,i)=>{
        const w = el.offsetWidth, h = el.offsetHeight, it = el.__it;
        const x = PG.rand(w, Math.max(w+1, W-w)), y = -h - i*70;
        const b = it.round
          ? Bodies.circle(x,y,w/2,{restitution:.7,friction:.2,density:.002})
          : Bodies.rectangle(x,y,w,h,{chamfer:{radius:it.radius != null ? it.radius : h/2},restitution:it.bounce || .55,friction:.25,density:it.density || .0015,angle:PG.rand(-.6,.6)});
        b.w = w; b.h = h; b.el = el; bodies.push(b); Composite.add(engine.world,b);
        el.style.visibility = 'visible';
      });
    }
    function shake(){
      bodies.forEach(b=>Body.applyForce(b,b.position,{x:PG.rand(-.04,.04)*b.mass,y:-PG.rand(.06,.12)*b.mass}));
      gsap.fromTo(pit,{rotate:-1.5},{rotate:0,duration:.6,ease:'elastic.out(1,.3)'});
    }
    if (PG.hover){
      const mouse = Mouse.create(pit);
      ['mousewheel','DOMMouseScroll','wheel'].forEach(ev=>mouse.element.removeEventListener(ev, mouse.mousewheel));
      Composite.add(engine.world, MouseConstraint.create(engine,{mouse,constraint:{stiffness:.2,render:{visible:false}}}));
    } else pit.addEventListener('click', ()=>{ drop(); shake(); });
    shakeBtn && shakeBtn.addEventListener('click',()=>{ drop(); shake(); });
    ScrollTrigger.create({trigger:pit,start:'top 70%',once:true,onEnter:drop});
    let running = false;
    ScrollTrigger.create({trigger:pit,start:'top bottom',end:'bottom top',onToggle:s=>running = s.isActive});
    gsap.ticker.add((t,dt)=>{
      if (!running || !dropped) return;
      Engine.update(engine, Math.min(dt,32));
      for (const b of bodies) b.el.style.transform = `translate(${b.position.x-b.w/2}px,${b.position.y-b.h/2}px) rotate(${b.angle}rad)`;
    });
    addEventListener('resize',()=>{
      W = pit.clientWidth; H = pit.clientHeight;
      Body.setPosition(ground,{x:W/2,y:H+T/2}); Body.setPosition(right,{x:W+T/2,y:H/2});
    });
    return {shake, drop};
  };

  /* ---------- machine à sous « Je … » (section épinglée) ---------- */
  PG.slot = function({section, reel, desc, dots, items, onChange, length}){
    let cur = -1;
    const n = items.length;
    function set(k){
      if (k === cur) return; cur = k;
      gsap.to(reel,{yPercent:-100/n*k,duration:.9,ease:'elastic.out(1,.55)',overwrite:true});
      gsap.to(section,{backgroundColor:items[k].bg,color:items[k].fg,duration:.5});
      if (desc){ desc.innerHTML = items[k].text; gsap.fromTo(desc,{y:20,opacity:0},{y:0,opacity:1,duration:.5,delay:.15}); }
      dots && dots.querySelectorAll('i').forEach((d,i)=>d.classList.toggle('on',i===k));
      onChange && onChange(k);
    }
    set(0);
    ScrollTrigger.create({trigger:section,start:'top top',end:'+='+(length || 2600),pin:true,
      onUpdate:s=>set(Math.min(n-1,Math.floor(s.progress*n)))});
  };

  /* ---------- projets en défilement horizontal ---------- */
  PG.hScroll = function({section, track, cards}){
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)',()=>{
      const dist = ()=>track.scrollWidth - innerWidth;
      const h = gsap.to(track,{x:()=>-dist(),ease:'none',scrollTrigger:{trigger:section,start:'top top',end:()=>'+='+dist(),pin:true,scrub:1,invalidateOnRefresh:true}});
      cards.forEach(c=>{
        gsap.from(c,{rotate:8,yPercent:12,scale:.85,ease:'none',scrollTrigger:{trigger:c,containerAnimation:h,start:'left right',end:'left 40%',scrub:true}});
        gsap.from(c.querySelectorAll('h3, p, .tags span'),{y:50,opacity:0,stagger:.04,ease:'back.out(2)',scrollTrigger:{trigger:c,containerAnimation:h,start:'left 70%',end:'left 35%',scrub:true}});
      });
    });
    mm.add('(max-width: 900px)',()=>{
      cards.forEach(c=>gsap.from(c,{y:80,rotate:4,opacity:0,duration:1,ease:'back.out(1.6)',scrollTrigger:{trigger:c,start:'top 85%'}}));
    });
    if (PG.hover) cards.forEach(c=>{
      c.addEventListener('mousemove',e=>{ const r = c.getBoundingClientRect(); gsap.to(c,{rotateY:((e.clientX-r.left)/r.width-.5)*8,rotateX:-((e.clientY-r.top)/r.height-.5)*8,transformPerspective:1200,duration:.6}); });
      c.addEventListener('mouseleave',()=>gsap.to(c,{rotateX:0,rotateY:0,duration:.9,ease:'elastic.out(1,.4)'}));
    });
  };

  /* ---------- cartes qui se retournent ---------- */
  PG.flips = function(sel){
    const f = document.querySelectorAll(sel);
    gsap.from(f,{y:140,rotate:()=>PG.rand(-25,25),opacity:0,stagger:.1,duration:1.2,ease:'elastic.out(1,.6)',scrollTrigger:{trigger:f[0],start:'top 85%'}});
    f.forEach(x=>x.addEventListener('click',()=>x.classList.toggle('on')));
  };

  /* ---------- confettis ---------- */
  const cv = document.createElement('canvas');
  cv.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:98';
  document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(cv));
  if (document.body) document.body.appendChild(cv);
  const ctx = cv.getContext('2d'); let parts = [];
  function sizeCv(){ cv.width = innerWidth*devicePixelRatio; cv.height = innerHeight*devicePixelRatio; cv.style.width = innerWidth+'px'; cv.style.height = innerHeight+'px'; }
  sizeCv(); addEventListener('resize', sizeCv);
  PG.burst = function(x, y, n, colors, kind){
    for (let i=0;i<(n||120);i++){
      const a = Math.random()*Math.PI*2, v = 4+Math.random()*10;
      const strip = kind === 'strip';
      parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-6,r:Math.random()*6.28,vr:(Math.random()-.5)*.4,
        w:strip?18+Math.random()*10:6+Math.random()*8,h:strip?5:4+Math.random()*6,c:colors[i%colors.length],c2:colors[(i+2)%colors.length],strip,round:kind==='circle',life:1});
    }
  };
  gsap.ticker.add(()=>{
    if (!parts.length) return;
    const d = devicePixelRatio; ctx.clearRect(0,0,cv.width,cv.height);
    parts.forEach(p=>{
      p.vy += .32; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= .006;
      ctx.save(); ctx.translate(p.x*d,p.y*d); ctx.rotate(p.r); ctx.globalAlpha = Math.max(0,p.life);
      if (p.round){ ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(0,0,p.w*d/2,0,6.28); ctx.fill(); }
      else if (p.strip){ const w=p.w*d, h=p.h*d; for (let k=0;k<4;k++){ ctx.fillStyle = k%2 ? p.c2 : p.c; ctx.fillRect(-w/2+k*w/4,-h/2,w/4,h); } }
      else { ctx.fillStyle = p.c; ctx.fillRect(-p.w*d/2,-p.h*d/2,p.w*d,p.h*d); }
      ctx.restore();
    });
    parts = parts.filter(p=>p.life>0 && p.y < innerHeight+40);
    if (!parts.length) ctx.clearRect(0,0,cv.width,cv.height);
  });

  /* ---------- copier l'adresse + toast ---------- */
  PG.copy = function(btn, text, toast, colors, kind){
    btn.addEventListener('click',e=>{
      try { navigator.clipboard.writeText(text); } catch(_){}
      PG.burst(e.clientX,e.clientY,160,colors,kind);
      if (toast) gsap.timeline().fromTo(toast,{xPercent:-50,yPercent:250,autoAlpha:1},{yPercent:0,duration:.5,ease:'back.out(2)'}).to(toast,{yPercent:250,autoAlpha:0,duration:.4},'+=1.6');
    });
  };

  /* =========================================================
     Symboles adinkra (versions stylisées, à affiner)
     ========================================================= */
  const web = (()=>{ let d=''; const R=[14,28,42];
    for (let k=0;k<8;k++){ const a=k/8*Math.PI*2; d += `M50 50 L${(50+Math.cos(a)*46).toFixed(1)} ${(50+Math.sin(a)*46).toFixed(1)} `; }
    R.forEach(r=>{ for (let k=0;k<=8;k++){ const a=k/8*Math.PI*2; d += (k?'L':'M')+(50+Math.cos(a)*r).toFixed(1)+' '+(50+Math.sin(a)*r).toFixed(1)+' '; } });
    return `<path d="${d}"/>`; })();
  const HEART = 'M50 86 C24 68 12 54 12 36 C12 22 22 14 33 14 C42 14 48 20 50 28 C52 20 58 14 67 14 C78 14 88 22 88 36 C88 54 76 68 50 86Z';
  PG.ADINKRA = {
    sankofa:  {n:'Sankofa', m:'« Retourne chercher » : apprendre du passé pour avancer.', d:`<path d="${HEART}"/><path d="M50 30 C50 42 40 48 33 42 C27 37 31 28 38 31"/><path d="M50 30 C50 42 60 48 67 42 C73 37 69 28 62 31"/><path d="M42 64 L50 72 L58 64"/>`},
    nkyinkyim:{n:'Nkyinkyim', m:'Le chemin sinueux : initiative, dynamisme, polyvalence.', d:'<path d="M28 10 L72 26 L28 42 L72 58 L28 74 L72 90"/>'},
    ananse:   {n:'Ananse Ntontan', m:'La toile d\'araignée : sagesse et créativité.', d:web},
    eban:     {n:'Eban', m:'La clôture : sécurité et protection.', d:'<rect x="12" y="12" width="76" height="76" rx="6"/><rect x="34" y="34" width="32" height="32" rx="3"/><path d="M50 12 V34 M50 66 V88 M12 50 H34 M66 50 H88"/>'},
    nyansapo: {n:'Nyansapo', m:'Le nœud de sagesse : ingéniosité et intelligence.', d:'<circle cx="50" cy="30" r="18"/><circle cx="50" cy="70" r="18"/><circle cx="30" cy="50" r="18"/><circle cx="70" cy="50" r="18"/>'},
    aya:      {n:'Aya', m:'La fougère : endurance et débrouillardise.', d:'<path d="M50 8 V92 M50 24 L30 12 M50 24 L70 12 M50 42 L26 28 M50 42 L74 28 M50 60 L24 46 M50 60 L76 46 M50 78 L28 66 M50 78 L72 66"/>'},
    matemasie:{n:'Mate Masie', m:'« Ce que j\'entends, je le garde » : sagesse et savoir.', d:'<circle cx="32" cy="32" r="15"/><circle cx="68" cy="32" r="15"/><circle cx="32" cy="68" r="15"/><circle cx="68" cy="68" r="15"/><path d="M32 32 h.1 M68 32 h.1 M32 68 h.1 M68 68 h.1"/>'},
    akoma:    {n:'Akoma', m:'Le cœur : patience et bienveillance.', d:`<path d="${HEART}"/>`},
    dwennimmen:{n:'Dwennimmen', m:'Les cornes du bélier : humilité et force.', d:'<path d="M50 52 C50 28 18 22 16 44 C14 62 38 62 38 48 C38 40 28 40 28 46"/><path d="M50 52 C50 28 82 22 84 44 C86 62 62 62 62 48 C62 40 72 40 72 46"/><path d="M50 52 V90"/>'},
  };
  PG.ADINKRA_KEYS = Object.keys(PG.ADINKRA);
  PG.adinkra = function(key, color, sw){
    const s = PG.ADINKRA[key];
    return `<svg viewBox="0 0 100 100" class="adk" fill="none" stroke="${color || 'currentColor'}" stroke-width="${sw || 8}" stroke-linecap="round" stroke-linejoin="round">${s.d}</svg>`;
  };
  /* dessine progressivement les traits d'un symbole */
  PG.drawSVG = function(svg, opts){
    const paths = svg.querySelectorAll('path,circle,rect');
    paths.forEach(p=>{ const L = p.getTotalLength ? p.getTotalLength() : 300; p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    return gsap.to(paths,Object.assign({strokeDashoffset:0,duration:1.2,stagger:.12,ease:'power2.inOut'},opts||{}));
  };

  /* =========================================================
     Motifs wax et bandes kente (SVG générés)
     ========================================================= */
  PG.wax = function(k, a, b, c){
    const m = [
      `<rect width="100" height="100" fill="${a}"/><circle cx="50" cy="50" r="34" fill="${b}"/><circle cx="50" cy="50" r="16" fill="${c}"/>`,
      `<rect width="100" height="100" fill="${a}"/><path d="M0 100 A50 50 0 0 1 100 100Z" fill="${b}"/><path d="M0 0 A50 50 0 0 0 100 0Z" fill="${c}"/>`,
      `<rect width="100" height="100" fill="${a}"/><polygon points="0,100 50,0 100,100" fill="${b}"/><polygon points="25,100 50,50 75,100" fill="${c}"/>`,
      `<rect width="100" height="100" fill="${a}"/><path d="M0 0 H100 A100 100 0 0 1 0 100Z" fill="${b}"/><circle cx="72" cy="72" r="14" fill="${c}"/>`,
      `<rect width="100" height="100" fill="${a}"/><g fill="${b}"><rect y="0" width="100" height="14"/><rect y="28" width="100" height="14"/><rect y="56" width="100" height="14"/><rect y="84" width="100" height="14"/></g><circle cx="50" cy="50" r="20" fill="${c}"/>`,
      `<rect width="100" height="100" fill="${a}"/><g fill="${b}"><circle cx="25" cy="25" r="14"/><circle cx="75" cy="25" r="14"/><circle cx="25" cy="75" r="14"/><circle cx="75" cy="75" r="14"/></g><rect x="40" y="40" width="20" height="20" fill="${c}" transform="rotate(45 50 50)"/>`,
    ];
    return `<svg viewBox="0 0 100 100" preserveAspectRatio="none">${m[k % m.length]}</svg>`;
  };
  /* bande kente verticale : blocs empilés (rayures, damier, barres, zigzag) */
  PG.KENTE = ['#ffb703','#0f9d58','#e63946','#1b1b1b','#ff5fa2','#4cc9f0'];
  PG.kente = function(seed, rows, pal){
    pal = pal || PG.KENTE; rows = rows || 8;
    const R = i => pal[(seed*7 + i*3) % pal.length];
    let g = '';
    for (let r=0;r<rows;r++){
      const y = r*40, t = (seed + r) % 5, a = R(r), b = R(r+1), c = R(r+2);
      g += `<rect y="${y}" width="40" height="40" fill="${a}"/>`;
      if (t===0) g += `<rect y="${y+6}" width="40" height="6" fill="${b}"/><rect y="${y+17}" width="40" height="6" fill="${c}"/><rect y="${y+28}" width="40" height="6" fill="${b}"/>`;
      if (t===1) for (let i=0;i<4;i++) for (let j=0;j<4;j++) if ((i+j)%2) g += `<rect x="${i*10}" y="${y+j*10}" width="10" height="10" fill="${b}"/>`;
      if (t===2) g += `<rect x="4" y="${y}" width="6" height="40" fill="${b}"/><rect x="17" y="${y}" width="6" height="40" fill="${c}"/><rect x="30" y="${y}" width="6" height="40" fill="${b}"/>`;
      if (t===3) g += `<polygon points="0,${y+40} 10,${y+8} 20,${y+40} 30,${y+8} 40,${y+40}" fill="${b}"/>`;
      if (t===4) g += `<rect x="12" y="${y+12}" width="16" height="16" fill="${b}" transform="rotate(45 20 ${y+20})"/><rect y="${y}" width="40" height="4" fill="${c}"/>`;
    }
    return `<svg viewBox="0 0 40 ${rows*40}" preserveAspectRatio="none">${g}</svg>`;
  };
  /* bande kente horizontale (même motif, tourné) */
  PG.kenteH = function(seed, cols, pal){
    pal = pal || PG.KENTE; cols = cols || 12;
    const R = i => pal[(seed*5 + i*3) % pal.length];
    let g = '';
    for (let c=0;c<cols;c++){
      const x = c*40, t = (seed + c) % 5, a = R(c), b = R(c+1), d = R(c+2);
      g += `<rect x="${x}" width="40" height="40" fill="${a}"/>`;
      if (t===0) g += `<rect x="${x+6}" width="6" height="40" fill="${b}"/><rect x="${x+17}" width="6" height="40" fill="${d}"/><rect x="${x+28}" width="6" height="40" fill="${b}"/>`;
      if (t===1) for (let i=0;i<4;i++) for (let j=0;j<4;j++) if ((i+j)%2) g += `<rect x="${x+i*10}" y="${j*10}" width="10" height="10" fill="${b}"/>`;
      if (t===2) g += `<rect x="${x}" y="4" width="40" height="6" fill="${b}"/><rect x="${x}" y="17" width="40" height="6" fill="${d}"/><rect x="${x}" y="30" width="40" height="6" fill="${b}"/>`;
      if (t===3) g += `<polygon points="${x},40 ${x+10},8 ${x+20},40 ${x+30},8 ${x+40},40" fill="${b}"/>`;
      if (t===4) g += `<rect x="${x+12}" y="12" width="16" height="16" fill="${b}" transform="rotate(45 ${x+20} 20)"/>`;
    }
    return `<svg viewBox="0 0 ${cols*40} 40" preserveAspectRatio="none">${g}</svg>`;
  };
  PG.svgURL = s => 'url("data:image/svg+xml,' + encodeURIComponent(s.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ')) + '")';
})();
