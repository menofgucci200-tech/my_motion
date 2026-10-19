/* =========================================================
   Stéphane Say — Portfolio « Le conte d'Anansi »
   Script commun à toutes les pages : chaque bloc ne s'active
   que si ses éléments sont présents sur la page.
   ========================================================= */
const PAL  = ['#ff5c8a','#f4b400','#1fc8b9','#6c4cf5','#ff8a3d','#7fd3ff'];
const GOLD = ['#f4b400','#ffe08a','#ff8a3d','#fff3dc','#ffd23f'];
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const store = {
  get(k){ try { return localStorage.getItem(k); } catch(_) { return null; } },
  set(k,v){ try { localStorage.setItem(k,v); } catch(_) {} },
  sget(k){ try { return sessionStorage.getItem(k); } catch(_) { return null; } },
  sset(k,v){ try { sessionStorage.setItem(k,v); } catch(_) {} },
};
/* mouvement réduit : pas d'intro ni d'épinglage, les entrées se jouent quasi instantanément */
if (PG.reduce){ document.documentElement.classList.add('rm'); gsap.globalTimeline.timeScale(20); }
PG.initLenis();

const spiderSVG = () => $('#spiderTpl').content.firstElementChild.cloneNode(true);
const wiggle = svg => { if (PG.reduce) return; svg.querySelectorAll('.legs path').forEach((p,i)=>gsap.to(p,{rotate:i%2?8:-8,transformOrigin:i<4?'100% 0%':'0% 0%',duration:.25+(i%3)*.05,repeat:-1,yoyo:true,ease:'sine.inOut'})); };
const put = (el, key, sw) => { el.innerHTML = PG.adinkra(key, null, sw); return el.querySelector('svg'); };
const nameChars = $('#name') ? PG.elastic($('#name'), PAL) : [];

/* =========================================================
   Entrée de page : intro complète sur l'accueil, simple ailleurs
   ========================================================= */
if ($('#night')){
  document.body.classList.add('locked');
  $('#bigweb').innerHTML = PG.adinkra('ananse',null,1.2);
  const isp = spiderSVG(); $('#ispider').appendChild(isp); wiggle(isp);
  const intro = gsap.timeline({onComplete:()=>{ $('#night').remove(); PG.unlock(); store.sset('ss-intro','1'); }});
  intro.add(PG.drawSVG($('#bigweb svg'),{duration:1.6,stagger:.03}))
    .fromTo('#ispider',{y:-140},{y:()=>innerHeight*.36,duration:1.2,ease:'bounce.out'},.4)
    .fromTo('#ithread',{height:0},{height:()=>innerHeight*.36+20,duration:1.2,ease:'bounce.out'},.4)
    .from('#once',{y:30,opacity:0,duration:.7,ease:'back.out(2)'},1.2)
    .to('#ispider',{rotate:12,duration:.15,yoyo:true,repeat:5},1.8)
    .to('#ispider',{y:-200,duration:.5,ease:'back.in(1.6)'},'+=.3')
    .to('#ithread',{height:0,duration:.5,ease:'back.in(1.6)'},'<')
    .to('#bigweb',{scale:3,opacity:0,duration:.7,ease:'power3.in'},'<')
    .to('#night',{clipPath:'circle(0% at 96% 20%)',duration:.8,ease:'power3.inOut'},'-=.2')
    .from(nameChars,{yPercent:120,rotate:()=>PG.rand(-40,40),opacity:0,stagger:.05,duration:1.1,ease:'elastic.out(1,.5)'},'-=.4')
    .from('.dispo, .once-upon, .tagline, .hero-row > *',{y:40,opacity:0,stagger:.08,duration:.7,ease:'back.out(2)'},'-=1')
    .from('#mascot',{y:-400,duration:1,ease:'bounce.out'},'-=1')
    .from('.scroll-ball',{scale:0,rotate:-180,duration:1,ease:'elastic.out(1,.5)'},'-=.8');
  gsap.set('#night',{clipPath:'circle(150% at 96% 20%)'});
  $('#skipIntro').addEventListener('click',()=>intro.progress(1));
  if (PG.reduce) intro.progress(1);
  else if (store.sget('ss-intro')) intro.timeScale(3.2);
  addEventListener('keydown',e=>{ if (e.key === 'Escape' && intro.isActive()) intro.progress(1); });
} else {
  /* pages de chapitre : rideau doré qui se lève + Anansi qui descend */
  PG.unlock();
  if (!PG.reduce){
    const curtain = document.createElement('div'); curtain.className = 'curtain'; document.body.appendChild(curtain);
    gsap.timeline({onComplete:()=>curtain.remove()})
      .to(curtain,{yPercent:-100,duration:.8,ease:'power4.inOut'})
      .from('.page-head > *:not(h1)',{y:40,opacity:0,stagger:.08,duration:.7,ease:'back.out(2)'},'-=.3')
      .from('#mascot',{y:-400,duration:1,ease:'bounce.out'},'-=.8');
  }
}

/* =========================================================
   Navigation : menu mobile + afficher/masquer Anansi
   ========================================================= */
const html = document.documentElement, burger = $('#burger'), menu = $('#menu');
function setMenu(open){
  html.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', open); burger.textContent = open ? 'Fermer' : 'Menu';
  menu.setAttribute('aria-hidden', !open);
  gsap.to(menu,{clipPath:open?'circle(150% at 50% 34px)':'circle(0% at 50% 34px)',duration:.7,ease:'power3.inOut'});
  if (open) gsap.from('#menu a',{y:60,opacity:0,stagger:.06,duration:.6,ease:'back.out(2)',delay:.2});
  PG.lenis && (open ? PG.lenis.stop() : PG.lenis.start());
}
burger.addEventListener('click',()=>setMenu(!html.classList.contains('menu-open')));
$$('#menu a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
/* lien actif */
const here = (location.pathname.split('/').pop() || 'index.html');
$$('.nav a, #menu a').forEach(a=>{ if (a.getAttribute('href') === here) a.setAttribute('aria-current','page'); });

const toggle = $('#toggleAnansi');
function setAnansi(on){ html.classList.toggle('no-anansi', !on); toggle.setAttribute('aria-pressed', on); $('#menuAnansi').textContent = on ? '🕷️ Masquer Anansi' : '🕷️ Afficher Anansi'; store.set('ss-anansi', on ? '1' : '0'); }
setAnansi(store.get('ss-anansi') !== '0');
toggle.addEventListener('click',()=>setAnansi(html.classList.contains('no-anansi')));
$('#menuAnansi').addEventListener('click',()=>setAnansi(html.classList.contains('no-anansi')));

/* =========================================================
   Mascotte : suit le scroll, regarde la souris, commente
   ========================================================= */
const mascot = $('#mascot'), mbody = $('#mbody'), bubble = $('#say');
const msp = spiderSVG(); mbody.appendChild(msp); wiggle(msp);
const pupils = msp.querySelectorAll('.pupil');
addEventListener('mousemove',e=>{
  const r = msp.getBoundingClientRect(), cx = r.left+r.width/2, cy = r.top+r.height*.38;
  const a = Math.atan2(e.clientY-cy, e.clientX-cx);
  pupils.forEach(p=>gsap.to(p,{x:Math.cos(a)*3,y:Math.sin(a)*3,duration:.3}));
});
ScrollTrigger.create({start:0,end:'max',onUpdate:s=>{
  if (!PG.reduce){
    const v = gsap.utils.clamp(-30,30,s.getVelocity()/80);
    gsap.to(mbody,{rotate:-v,duration:.4,overwrite:'auto'}); gsap.to(mbody,{rotate:0,duration:1.6,ease:'elastic.out(1,.3)',delay:.4});
  }
  mascot.style.setProperty('--h', (18 + Math.sin(s.progress*Math.PI*6)*6 + s.progress*30) + 'vh');
}});
if (!PG.reduce) gsap.to(mbody,{y:-8,duration:1.2,repeat:-1,yoyo:true,ease:'sine.inOut'});
let lastSay = bubble.textContent, hideCall = null, currentSection = '';
function say(t, force){
  if (t === lastSay && !force) return; lastSay = t;
  hideCall && hideCall.kill();
  gsap.timeline().to(bubble,{scale:0,duration:.15,transformOrigin:'100% 0%'}).call(()=>bubble.textContent = t).to(bubble,{scale:1,duration:.5,ease:'back.out(2.5)'});
  /* la bulle se range toute seule pour ne pas cacher le contenu */
  hideCall = gsap.delayedCall(4.5,()=>gsap.to(bubble,{scale:0,duration:.3,ease:'back.in(2)',transformOrigin:'100% 0%'}));
}
mbody.addEventListener('click',()=>{ say(lastSay,true); gsap.fromTo(mbody,{scale:1.3},{scale:1,duration:.8,ease:'elastic.out(1,.3)'}); const r = mbody.getBoundingClientRect(); PG.burst(r.left+r.width/2,r.top+r.height/2,50,GOLD,'circle'); });

/* =========================================================
   Hero de l'accueil
   ========================================================= */
if ($('#blobs')){
  PG.blobs($('#blobs'),[[26,'#f4b400',72,22],[20,'#1fc8b9',88,60],[16,'#ff5c8a',60,72],[14,'#6c4cf5',90,30],[12,'#7fd3ff',66,42]],$('.hero'));
  $('#cw1').innerHTML = PG.adinkra('ananse',null,1.4);
  gsap.to('#cw1',{rotate:30,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('#blobs',{yPercent:30,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('.scroll-ball',{rotate:360,ease:'none',scrollTrigger:{start:0,end:'max',scrub:true}});
}
/* en-tête des pages de chapitre : toile qui tourne + symbole dessiné */
if ($('.page-head')){
  const w = $('.page-web'); if (w){ w.innerHTML = PG.adinkra('ananse',null,1.2); if (!PG.reduce) gsap.to(w,{rotate:360,duration:90,repeat:-1,ease:'none'}); }
  const g = $('.page-glyph'); if (g){ const svg = put(g, g.dataset.adk, 6); PG.drawSVG(svg,{duration:1.6,delay:.5}); }
}

/* =========================================================
   Le héros
   ========================================================= */
if ($('#board')){
  $('#tape').innerHTML = PG.wax(5,'#f4b400','#2b2d6e','#ff5c8a');
  const phw = $('.portrait-ph .ph-web');
  if (phw){ phw.innerHTML = PG.adinkra('ananse',null,1.4); if (!PG.reduce) gsap.to(phw,{rotate:360,duration:80,repeat:-1,ease:'none'}); }
  const stickers = $$('.sticker');
  gsap.from('.polaroid',{y:120,rotate:-25,opacity:0,duration:1.2,ease:'elastic.out(1,.6)',scrollTrigger:{trigger:'#board',start:'top 75%'}});
  gsap.from(stickers,{scale:0,rotate:()=>PG.rand(-120,120),stagger:.1,duration:1,ease:'elastic.out(1,.45)',delay:.3,scrollTrigger:{trigger:'#board',start:'top 75%'}});
  stickers.forEach((s,i)=>{
    gsap.to(s,{rotate:(i%2?1:-1)*PG.rand(8,22),y:PG.rand(-40,40),ease:'none',scrollTrigger:{trigger:'#board',start:'top bottom',end:'bottom top',scrub:1}});
    s.addEventListener('mouseenter',()=>gsap.fromTo(s,{rotate:'-=12'},{rotate:'+=12',duration:.9,ease:'elastic.out(1.4,.25)'}));
  });
}
if ($('.forces')){
  gsap.from('.force',{y:80,rotate:()=>PG.rand(-6,6),opacity:0,stagger:.08,duration:.9,ease:'back.out(1.8)',scrollTrigger:{trigger:'.forces',start:'top 85%'}});
  gsap.from('.force .ic',{scale:0,rotate:-90,stagger:.08,duration:.8,delay:.3,ease:'elastic.out(1,.5)',scrollTrigger:{trigger:'.forces',start:'top 85%'}});
}

/* =========================================================
   Le voyage (Anansi marche sur un fil)
   ========================================================= */
if ($('#vtrack')){
  const vtrack = $('#vtrack'), vpath = $('#vpath'), vdone = $('#vdone'), walker = $('#walker');
  const wsp = spiderSVG(); walker.appendChild(wsp); wiggle(wsp);
  let VL = 1;
  const buildThread = ()=>{
    const cards = $$('.vcard'); let d = '';
    const pts = cards.map(c=>({x:c.offsetLeft + c.offsetWidth/2, y:c.offsetTop - 3}));
    pts.unshift({x:pts[0].x - innerWidth*.25, y:pts[0].y - 60});
    pts.forEach((p,i)=>{ if (!i) d = `M${p.x} ${p.y}`; else { const q = pts[i-1]; d += ` Q${(q.x+p.x)/2} ${Math.max(q.y,p.y)+70} ${p.x} ${p.y}`; } });
    vpath.setAttribute('d', d); vdone.setAttribute('d', d);
    VL = vdone.getTotalLength(); vdone.style.strokeDasharray = VL;
  };
  const walk = p=>{
    vdone.style.strokeDashoffset = VL*(1-p);
    const pt = vdone.getPointAtLength(p*VL), ahead = vdone.getPointAtLength(Math.min(VL, p*VL+2));
    gsap.set(walker,{x:pt.x,y:pt.y,rotate:Math.atan2(ahead.y-pt.y, ahead.x-pt.x)*57.3*.4});
  };
  const vmm = gsap.matchMedia();
  vmm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)',()=>{
    buildThread(); walk(0);
    const dist = ()=>vtrack.scrollWidth - innerWidth;
    const h = gsap.to(vtrack,{x:()=>-dist(),ease:'none',scrollTrigger:{trigger:'#voyage',start:'top top',end:()=>'+='+dist(),pin:true,scrub:1,invalidateOnRefresh:true,
      onUpdate:s=>walk(s.progress),onRefresh:s=>{ buildThread(); walk(s.progress); }}});
    gsap.utils.toArray('.vcard').forEach(c=>gsap.from(c,{y:120,rotate:PG.rand(-10,10),opacity:0,ease:'back.out(1.6)',scrollTrigger:{trigger:c,containerAnimation:h,start:'left 92%',end:'left 60%',scrub:true}}));
  });
  vmm.add('(max-width: 900px), (prefers-reduced-motion: reduce)',()=>{
    gsap.fromTo('#vline',{scaleY:0},{scaleY:1,ease:'none',scrollTrigger:{trigger:'#vtrack',start:'top 70%',end:'bottom 70%',scrub:true}});
    $$('.vcard').forEach(c=>gsap.from(c,{x:60,opacity:0,duration:.8,ease:'back.out(1.6)',scrollTrigger:{trigger:c,start:'top 85%'}}));
  });
}
/* journal du voyage : chaque entrée glisse depuis son côté, son symbole se dessine */
$$('.journal article').forEach((a,i)=>{
  gsap.from(a,{x:i%2?120:-120,rotate:i%2?4:-4,opacity:0,duration:1,ease:'back.out(1.4)',scrollTrigger:{trigger:a,start:'top 85%'}});
});

/* =========================================================
   Les poids de l'or + compétences
   ========================================================= */
if ($('#pit')){
  const tech = ['Flutter','Laravel','PHP','MySQL','Next.js','TypeScript','Livewire','Dart','API REST','Tailwind','Git','PHPUnit','Figma','Claude Code','Sanctum 🔐'];
  const weights = tech.map((t,i)=>({label:t,cls:'gw'+(i%3===1?' alt':''),radius:12,density:.003,bounce:.35}));
  ['ananse','eban','aya','akoma','nyansapo','sankofa','dwennimmen'].forEach((k,i)=>weights.push({html:PG.adinkra(k,'#5b3700',8),round:true,cls:'gw'+(i%2?' alt':'')}));
  if (PG.reduce){
    weights.forEach(w=>{ const el = document.createElement('div'); el.className = 'pill'+(w.round?' round':'')+' '+w.cls; el.innerHTML = w.html || w.label; $('#pit').appendChild(el); });
    $('#shake').hidden = true;
  } else PG.physics({pit:$('#pit'),items:weights,shakeBtn:$('#shake'),gravity:1.3});
}
/* symboles adinkra des icônes : dessinés quand ils entrent à l'écran */
$$('[data-adk]:not(.page-glyph)').forEach(i=>{
  const svg = put(i, i.dataset.adk, i.dataset.sw ? +i.dataset.sw : 9);
  ScrollTrigger.create({trigger:i,start:'top 90%',once:true,onEnter:()=>PG.drawSVG(svg,{duration:1.1})});
});
if ($('.skills')){
  gsap.from('.skill',{y:70,opacity:0,stagger:.08,duration:.8,ease:'back.out(1.8)',scrollTrigger:{trigger:'.skills',start:'top 85%'}});
  $$('.skill').forEach(s=>gsap.from(s.querySelectorAll('.tags span'),{scale:0,stagger:.04,duration:.5,ease:'back.out(3)',scrollTrigger:{trigger:s,start:'top 85%'}}));
}

/* =========================================================
   Les pouvoirs (machine à sous)
   ========================================================= */
if ($('#reel')){
  const powers = [
    {v:'code.',bg:'#f4b400',fg:'#2b2d6e',t:'Des applications web et mobiles avec Laravel, Flutter et Next.js : du back-office à l\'interface.'},
    {v:'conçois.',bg:'#1fc8b9',fg:'#2b2d6e',t:'Je pars du besoin réel : questionnaire de découverte, parcours, maquette, puis seulement le code.'},
    {v:'sécurise.',bg:'#2b2d6e',fg:'#fff3dc',t:'J\'audite mes API : contrôles d\'accès, isolation des données, failles de type IDOR.'},
    {v:'entreprends.',bg:'#ff5c8a',fg:'#fff',t:'PressLink : identifier un problème, concevoir le produit, le transformer en offre commerciale.'},
    {v:'raconte.',bg:'#6c4cf5',fg:'#fff',t:'Théâtre, slam, formations : comme Anansi, je gagne par la parole. Expliquer clairement, c\'est aussi mon métier.'},
  ];
  $('#slotList').innerHTML = powers.map(p=>`<li><b>Je ${p.v}</b><br>${p.t}</li>`).join('');
  if (!PG.reduce) PG.slot({section:$('#pouvoirs'),reel:$('#reel'),desc:$('#slotDesc'),dots:$('#slotDots'),items:powers.map(p=>({bg:p.bg,fg:p.fg,text:p.t}))});
}

/* =========================================================
   La toile interactive des projets
   ========================================================= */
if ($('#webwrap')){
  const wrap = $('#webwrap'), wpath = $('#webpath');
  const SP = 12, RINGS = [.16,.32,.5,.68,.86];
  let verts = [], W = 0;
  const buildWeb = ()=>{
    W = wrap.clientWidth; verts = [];
    RINGS.forEach((r,ri)=>{ for (let k=0;k<SP;k++){ const a = k/SP*Math.PI*2 - Math.PI/2, rr = r*(1 + ((k*7+ri*3)%5-2)*.025);
      const x = W/2 + Math.cos(a)*rr*W/2, y = W/2 + Math.sin(a)*rr*W/2; verts.push({rx:x,ry:y,x,y,vx:0,vy:0}); } });
  };
  const V = (ri,k)=>verts[ri*SP + ((k%SP)+SP)%SP];
  const drawWeb = ()=>{
    let d = '';
    for (let k=0;k<SP;k++){ d += `M${W/2} ${W/2}`; RINGS.forEach((_,ri)=>{ const v = V(ri,k); d += ` L${v.x.toFixed(1)} ${v.y.toFixed(1)}`; }); }
    RINGS.forEach((_,ri)=>{ for (let k=0;k<=SP;k++){ const v = V(ri,k), p = V(ri,k-1);
      d += k ? ` Q${((p.x+v.x)/2 + (W/2-(p.x+v.x)/2)*.06).toFixed(1)} ${((p.y+v.y)/2 + (W/2-(p.y+v.y)/2)*.06).toFixed(1)} ${v.x.toFixed(1)} ${v.y.toFixed(1)}` : ` M${v.x.toFixed(1)} ${v.y.toFixed(1)}`; } });
    wpath.setAttribute('d', d);
  };
  const mouse = {x:-9999,y:-9999};
  wrap.addEventListener('mousemove',e=>{ const r = wrap.getBoundingClientRect(); mouse.x = e.clientX-r.left; mouse.y = e.clientY-r.top; });
  wrap.addEventListener('mouseleave',()=>{ mouse.x = mouse.y = -9999; });
  const projects = [{n:'PressLink',c:'#f4b400',ri:3,k:1},{n:'Bo Séjour',c:'#1fc8b9',ri:2,k:6},{n:'REJCC',c:'#ff5c8a',ri:3,k:9}];
  const nodes = projects.map((p,i)=>{
    const el = document.createElement('button'); el.className = 'node'; el.style.background = p.c; el.textContent = p.n;
    el.setAttribute('aria-pressed', i === 0); el.setAttribute('aria-controls', ['p-presslink','p-bosejour','p-rejcc'][i]);
    wrap.appendChild(el); return el;
  });
  const placeNodes = ()=>nodes.forEach((el,i)=>{ const v = V(projects[i].ri, projects[i].k); el.style.left = v.x+'px'; el.style.top = v.y+'px'; });
  buildWeb(); drawWeb(); placeNodes();
  addEventListener('resize',()=>{ buildWeb(); drawWeb(); placeNodes(); });
  const hub = spiderSVG(); hub.style.width = '100%'; $('#webhub').appendChild(hub); wiggle(hub);
  let webOn = false;
  ScrollTrigger.create({trigger:'#toile',start:'top bottom',end:'bottom top',onToggle:s=>webOn = s.isActive});
  if (!PG.reduce) gsap.ticker.add(()=>{
    if (!webOn) return;
    for (const v of verts){
      const dx = v.x - mouse.x, dy = v.y - mouse.y, d = Math.hypot(dx,dy), R = W*.18;
      let fx = (v.rx - v.x)*.08, fy = (v.ry - v.y)*.08;
      if (d < R && d > 0){ const f = (1 - d/R)*6; fx += dx/d*f; fy += dy/d*f; }
      v.vx = (v.vx + fx)*.82; v.vy = (v.vy + fy)*.82; v.x += v.vx; v.y += v.vy;
    }
    drawWeb(); placeNodes();
  });
  const pcards = $$('#pstage .pcard');
  let curP = 0;
  const showProject = i=>{
    if (i === curP) return;
    const out = pcards[curP], inn = pcards[i]; curP = i;
    nodes.forEach((n,k)=>n.setAttribute('aria-pressed', k === i));
    gsap.timeline()
      .to(out,{rotate:-8,x:-60,opacity:0,duration:.3,ease:'power2.in',onComplete:()=>out.classList.remove('on')})
      .call(()=>inn.classList.add('on'))
      .fromTo(inn,{rotate:10,x:80,scale:.85,opacity:0},{rotate:0,x:0,scale:1,opacity:1,duration:.8,ease:'elastic.out(1,.6)'});
    const v = V(projects[i].ri, projects[i].k);
    verts.forEach(w=>{ const d = Math.hypot(w.rx-v.rx,w.ry-v.ry); w.vx += (w.rx-v.rx)/(d+1)*20; w.vy += (w.ry-v.ry)/(d+1)*20; });
    gsap.fromTo(nodes[i],{scale:1.4},{scale:1,duration:.8,ease:'elastic.out(1,.3)'});
  };
  nodes.forEach((n,i)=>n.addEventListener('click',()=>showProject(i)));
  gsap.from(nodes,{scale:0,stagger:.15,duration:.9,ease:'elastic.out(1,.5)',scrollTrigger:{trigger:'#webwrap',start:'top 75%'}});
  ScrollTrigger.create({trigger:'#webwrap',start:'top 75%',once:true,onEnter:()=>{ wpath.style.strokeDasharray = 6000; gsap.fromTo(wpath,{strokeDashoffset:6000},{strokeDashoffset:0,duration:2.2,ease:'power2.inOut',onComplete:()=>wpath.style.strokeDasharray='none'}); }});
  gsap.from('#pstage',{x:120,rotate:6,opacity:0,duration:1,ease:'back.out(1.6)',scrollTrigger:{trigger:'#pstage',start:'top 80%'}});

  /* scènes animées */
  const cal = $('#cal'); for (let i=0;i<12;i++) cal.appendChild(document.createElement('i'));
  const door = $('.door');
  for (let i=0;i<8;i++){ const b = document.createElement('span'); b.className = 'suds'; const s = PG.rand(8,20); b.style.cssText = `width:${s}px;height:${s}px;left:${PG.rand(10,85)}%`; door.appendChild(b);
    if (!PG.reduce) gsap.fromTo(b,{y:20,opacity:0},{y:-200,opacity:1,duration:PG.rand(1.8,3.2),repeat:-1,delay:i*.35,ease:'sine.in'}); }
  const qr = $('#qr'); for (let i=0;i<64;i++){ const c = document.createElement('i'); if (Math.random() < .42) c.className = 'o'; qr.appendChild(c); }
  if (!PG.reduce){
    gsap.to('#cal i',{background:()=>gsap.utils.random(['#1fc8b9','#ff5c8a','#f4b400']),duration:.3,stagger:{each:.18,repeat:-1,yoyo:true,from:'random'},repeatDelay:1});
    gsap.to('.sun',{y:-90,duration:3,ease:'sine.inOut',repeat:-1,yoyo:true});
    gsap.to('.paid',{y:-10,rotate:-6,duration:1,repeat:-1,yoyo:true,ease:'sine.inOut'});
    gsap.to('.ticket',{rotate:-6,scale:1.08,duration:.8,repeat:-1,yoyo:true,ease:'sine.inOut'});
    gsap.to('.machine',{x:3,duration:.08,repeat:-1,yoyo:true,ease:'none'});
    gsap.to('#mcard',{rotateY:180,duration:1.2,ease:'back.inOut(1.6)',repeat:-1,yoyo:true,repeatDelay:1.6});
  }
}
/* études de cas en pleine page (page Projets) */
$$('.project-full').forEach(p=>{
  gsap.fromTo(p.querySelector('.pf-head'),{clipPath:'circle(0% at 90% 10%)'},{clipPath:'circle(150% at 90% 10%)',duration:1.2,ease:'power3.inOut',scrollTrigger:{trigger:p,start:'top 75%'}});
  gsap.from(p.querySelectorAll('.pf-head > *'),{y:50,opacity:0,stagger:.08,duration:.8,delay:.4,ease:'back.out(2)',scrollTrigger:{trigger:p,start:'top 75%'}});
  gsap.from(p.querySelectorAll('.case-block'),{y:60,opacity:0,stagger:.07,duration:.8,ease:'back.out(1.8)',scrollTrigger:{trigger:p.querySelector('.case-body'),start:'top 85%'}});
});

/* =========================================================
   Le bouclier
   ========================================================= */
if ($('#codecard')){
  const ebanSVG = put($('#eban'),'eban',7);
  ScrollTrigger.create({trigger:'#bouclier',start:'top 65%',once:true,onEnter:()=>PG.drawSVG(ebanSVG,{duration:1.4})});
  gsap.from('#method span, #method em',{scale:0,rotate:()=>PG.rand(-20,20),stagger:.12,duration:.7,ease:'back.out(3)',scrollTrigger:{trigger:'#method',start:'top 85%'}});
  gsap.from('.shield-list li',{x:-40,opacity:0,stagger:.1,duration:.6,ease:'back.out(2)',scrollTrigger:{trigger:'.shield-list',start:'top 85%'}});
  const note = $('#codeNote'), bad = $('#lineBad'), good = $('#lineGood');
  const audit = gsap.timeline({paused:true});
  audit.set('.sweep',{opacity:1,top:0})
    .to('.sweep',{top:'calc(100% - 40px)',duration:1.3,ease:'power1.inOut'})
    .to('.sweep',{top:'calc(38% - 6px)',duration:.6,ease:'power2.out'})
    .call(()=>{ bad.classList.add('bad'); note.textContent = 'Faille IDOR : n\'importe quel client peut lire la commande d\'un autre en changeant l\'identifiant.'; if (currentSection === 'bouclier') say('Une faille ! On peut lire la commande d\'un autre…', true); })
    .to('#lineBad .flag',{opacity:1,duration:.1,repeat:5,yoyo:true})
    .to('#lineBad .flag',{opacity:1,duration:.1})
    .to('.sweep',{opacity:0,duration:.3},'+=.8')
    .to(bad,{opacity:0,x:-20,duration:.3})
    .call(()=>{ bad.hidden = true; good.hidden = false; good.classList.add('good'); note.textContent = 'Corrigé : la commande est cherchée dans le pressing de l\'utilisateur, sinon erreur 404.'; if (currentSection === 'bouclier') say('Ouf, corrigé ! Il est fort, hein ?', true); })
    .from(good,{opacity:0,x:20,duration:.35})
    .to('#lineGood .flag',{opacity:1,duration:.3});
  ScrollTrigger.create({trigger:'#codecard',start:'top 70%',once:true,onEnter:()=>PG.reduce ? audit.progress(1) : audit.play()});
  gsap.from('#codecard',{y:80,rotate:4,opacity:0,duration:1,ease:'back.out(1.6)',scrollTrigger:{trigger:'#codecard',start:'top 85%'}});
}
/* grille d'audit : chaque point se coche l'un après l'autre */
if ($('.audit-grid')){
  const items = $$('.audit-grid li');
  ScrollTrigger.create({trigger:'.audit-grid',start:'top 75%',once:true,onEnter:()=>{
    items.forEach((li,i)=>gsap.delayedCall(i*.18,()=>{ li.classList.add('ok'); gsap.fromTo(li.querySelector('i'),{scale:0,rotate:-90},{scale:1,rotate:0,duration:.6,ease:'elastic.out(1,.4)'}); }));
  }});
  gsap.from(items,{y:30,opacity:0,stagger:.05,duration:.5,ease:'back.out(2)',scrollTrigger:{trigger:'.audit-grid',start:'top 85%'}});
}

/* =========================================================
   Blocs génériques : chaînes, fiches, étapes, quêtes, flips…
   ========================================================= */
$$('[data-reveal]').forEach(c=>gsap.from(c.children,{y:60,rotate:()=>PG.rand(-5,5),opacity:0,stagger:.08,duration:.9,ease:'back.out(1.8)',scrollTrigger:{trigger:c,start:'top 85%'}}));
$$('.chain').forEach(c=>gsap.from(c.children,{scale:0,rotate:()=>PG.rand(-25,25),stagger:.09,duration:.6,ease:'back.out(3)',scrollTrigger:{trigger:c,start:'top 88%'}}));
if ($('.steps')){
  gsap.fromTo('.steps-line i',{scaleX:0},{scaleX:1,ease:'none',scrollTrigger:{trigger:'.steps',start:'top 75%',end:'bottom 60%',scrub:true}});
  gsap.from('.step',{y:80,scale:.8,opacity:0,stagger:.12,duration:.8,ease:'back.out(2)',scrollTrigger:{trigger:'.steps',start:'top 80%'}});
}
if ($('.flip')){
  PG.flips('.flip');
  $$('.flip').forEach(f=>f.addEventListener('keydown',e=>{ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); f.classList.toggle('on'); } }));
}
if ($('.engage')) gsap.from('.engage li',{y:30,opacity:0,stagger:.08,duration:.6,ease:'back.out(2)',scrollTrigger:{trigger:'.engage',start:'top 85%'}});
if ($('.quests')){
  gsap.from('.quest',{y:120,rotate:()=>PG.rand(-8,8),opacity:0,stagger:.12,duration:1,ease:'elastic.out(1,.7)',scrollTrigger:{trigger:'.quests',start:'top 85%'}});
  if (!PG.reduce) $$('.quest .bar i').forEach((b,i)=>gsap.fromTo(b,{left:'-40%'},{left:'110%',duration:1.8,repeat:-1,ease:'power1.inOut',delay:i*.3}));
}
/* carte du CV : s'incline sous la souris */
$$('.tilt').forEach(c=>{
  c.addEventListener('mousemove',e=>{ const r = c.getBoundingClientRect(); gsap.to(c,{rotateY:((e.clientX-r.left)/r.width-.5)*10,rotateX:-((e.clientY-r.top)/r.height-.5)*10,transformPerspective:1000,duration:.5}); });
  c.addEventListener('mouseleave',()=>gsap.to(c,{rotateX:0,rotateY:0,duration:.9,ease:'elastic.out(1,.4)'}));
});
/* liens « Lire le chapitre complet » */
$$('.more').forEach(m=>gsap.from(m,{x:-30,opacity:0,duration:.6,ease:'back.out(2)',scrollTrigger:{trigger:m,start:'top 92%'}}));

/* =========================================================
   Contact
   ========================================================= */
if ($('#cweb')){
  $('#cweb').innerHTML = PG.adinkra('ananse',null,.8);
  if (!PG.reduce) gsap.to('#cweb',{rotate:360,duration:120,repeat:-1,ease:'none'});
  const stars = $('#stars');
  for (let i=0;i<40;i++){ const s = document.createElement('i'); s.style.left = Math.random()*100+'%'; s.style.top = Math.random()*100+'%'; stars.appendChild(s);
    if (!PG.reduce) gsap.to(s,{opacity:.2,scale:.5,duration:PG.rand(.6,1.8),repeat:-1,yoyo:true,delay:Math.random()*2}); }
  PG.copy($('#copyBtn'),'menofgucci200@gmail.com',$('#toast'),GOLD,'circle');
  $('#mailBtn').addEventListener('mouseenter',e=>PG.burst(e.clientX,e.clientY,40,GOLD,'circle'));
  ScrollTrigger.create({trigger:'.contact',start:'top 40%',once:true,onEnter:()=>{ if (PG.reduce) return; PG.burst(innerWidth*.2,innerHeight*.8,90,GOLD,'circle'); PG.burst(innerWidth*.8,innerHeight*.8,90,GOLD,'circle'); }});
}
/* pied de page : navigation entre chapitres */
if ($('.pager')) gsap.from('.pager a',{y:50,opacity:0,stagger:.1,duration:.8,ease:'back.out(2)',scrollTrigger:{trigger:'.pager',start:'top 90%'}});

/* =========================================================
   Pour finir : curseur, titres, bulles d'Anansi (après les épinglages)
   ========================================================= */
PG.cursor(PAL);
$$('[data-say]').forEach(s=>{
  const pinT = ScrollTrigger.getAll().find(t=>t.pin === s);
  ScrollTrigger.create({trigger:s,start:'top 55%',end:()=>`bottom+=${pinT ? pinT.end-pinT.start : 0} 55%`,refreshPriority:-1,onToggle:t=>{
    if (!t.isActive) return;
    currentSection = s.id;
    mascot.classList.toggle('on-dark', s.classList.contains('dark'));
    say(s.dataset.say);
  }});
});
if (!PG.reduce) PG.revealTitles();
PG.finish();
/* ancre dans l'URL (ex. projets.html#presslink) : on y va une fois les épinglages calculés */
if (location.hash && $(location.hash)){
  requestAnimationFrame(()=>{ const t = $(location.hash); PG.lenis ? PG.lenis.scrollTo(t,{immediate:true,offset:-20}) : t.scrollIntoView(); });
}
