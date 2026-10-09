/* ---------- theme toggle ---------- */
(function(){
  const saved=localStorage.getItem('Hansler-theme') || localStorage.getItem('mastaler-theme');
  if(saved==='light') document.documentElement.setAttribute('data-theme','light');
})();
function toggleTheme(){
  const isLight=document.documentElement.getAttribute('data-theme')==='light';
  if(isLight){ document.documentElement.removeAttribute('data-theme'); localStorage.setItem('Hansler-theme','dark'); }
  else{ document.documentElement.setAttribute('data-theme','light'); localStorage.setItem('Hansler-theme','light'); }
}
document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);

const MATERIALS = [
  {id:'st3',    name:'Сталь Ст3',            cat:'metal',     density:7850, price:90,   yield:245, E:200, color:0x9FB3C8, metalness:.85, roughness:.42, tex:'brushed'},
  {id:'st45',   name:'Сталь 45',             cat:'metal',     density:7850, price:110,  yield:355, E:205, color:0x93A6BA, metalness:.85, roughness:.4,  tex:'brushed'},
  {id:'ss304',  name:'Нержавейка AISI 304',  cat:'metal',     density:8000, price:250,  yield:215, E:193, color:0xC7D3DA, metalness:.9,  roughness:.28, tex:'polished'},
  {id:'ss316',  name:'Нержавейка AISI 316',  cat:'metal',     density:8000, price:320,  yield:240, E:193, color:0xCAD5DB, metalness:.9,  roughness:.25, tex:'polished'},
  {id:'al2024', name:'Алюминий Д16Т',        cat:'metal',     density:2780, price:350,  yield:345, E:73,  color:0xD7DCE0, metalness:.75, roughness:.35, tex:'brushed'},
  {id:'al6061', name:'Алюминий 6061-Т6',     cat:'metal',     density:2700, price:320,  yield:276, E:69,  color:0xDDE1E4, metalness:.7,  roughness:.38, tex:'brushed'},
  {id:'ti64',   name:'Титан',            cat:'metal',     density:4430, price:2500, yield:880, E:114, color:0x8E9CA8, metalness:.7,  roughness:.4,  tex:'brushed'},
  {id:'brass',  name:'Латунь',           cat:'metal',     density:8500, price:600,  yield:200, E:100, color:0xC9A24A, metalness:.85, roughness:.3,  tex:'polished'},
  {id:'copper', name:'Медь',              cat:'metal',     density:8960, price:700,  yield:70,  E:110, color:0xB5713F, metalness:.9,  roughness:.28, tex:'polished'},
  {id:'castiron',name:'Чугун',          cat:'metal',     density:7200, price:70,   yield:150, E:110, color:0x4C4F52, metalness:.5,  roughness:.75, tex:'rough'},
  {id:'bronze', name:'Бронза',          cat:'metal',     density:8800, price:800,  yield:150, E:100, color:0xA97C4F, metalness:.85, roughness:.32, tex:'polished'},
  {id:'abs',    name:'АБС-пластик',          cat:'plastic',   density:1050, price:150,  yield:40,  E:2.3, color:0x2E3A46, metalness:.05, roughness:.55, tex:'matte'},
  {id:'pla',    name:'PLA (3D-печать)',      cat:'plastic',   density:1250, price:200,  yield:50,  E:3.5, color:0xE8E4DC, metalness:.05, roughness:.5,  tex:'matte'},
  {id:'pmma',   name:'Оргстекло ПММА',       cat:'plastic',   density:1180, price:250,  yield:70,  E:3,   color:0xBFE0E8, metalness:.05, roughness:.12, tex:'glossy'},
  {id:'pa6',    name:'Полиамид РА6 (нейлон)',cat:'plastic',   density:1140, price:280,  yield:80,  E:2.8, color:0xEDE7D9, metalness:.05, roughness:.45, tex:'matte'},
  {id:'pom',    name:'Полиацеталь (POM)',    cat:'plastic',   density:1410, price:320,  yield:65,  E:2.9, color:0xE7EAE0, metalness:.05, roughness:.35, tex:'matte'},
  {id:'cfrp',   name:'Карбон', cat:'composite', density:1600, price:4000, yield:600, E:70,  color:0x14171B, metalness:.3,  roughness:.35, tex:'carbon'},
  {id:'gfrp',   name:'Стеклопластик (GFRP)', cat:'composite', density:1900, price:1200, yield:300, E:25,  color:0xC9D6C4, metalness:.15, roughness:.4,  tex:'carbon'},
  {id:'pine',   name:'Дерево — сосна',       cat:'wood',      density:500,  price:40,   yield:40,  E:10,  color:0xC79A5B, metalness:0,   roughness:.7,  tex:'wood'},
  {id:'oak',    name:'Дерево — дуб',         cat:'wood',      density:700,  price:90,   yield:60,  E:12,  color:0x8A5C34, metalness:0,   roughness:.65, tex:'wood'},
];
const CATS = {metal:'Металлы', plastic:'Пластики', composite:'Композиты', wood:'Дерево'};

/* ============================================================
   STATE
   ============================================================ */
const state = { signedIn:false };
/* ============================================================
   TOASTS
   ============================================================ */
function toast(msg){
  const stack=document.getElementById('toast-stack');
  const el=document.createElement('div');
  el.className='toast';
  el.innerHTML='<svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>'+msg+'</span>';
  stack.appendChild(el);
  setTimeout(()=>el.remove(),3000);
}
/* ============================================================
   GOOGLE SIGN-IN (демо)
   Для реальной авторизации: подключите
   https://accounts.google.com/gsi/client и вызовите
   google.accounts.id.initialize({ client_id: 'ВАШ_CLIENT_ID', callback: onGoogleCredential })
   ============================================================ */
function renderAuthSlot(){
  const slot=document.getElementById('nav-auth-slot');
  if(state.signedIn){
    slot.innerHTML = `<div class="g-btn signed-in"><div class="g-avatar">${state.userInitial||'A'}</div><span>${state.userName||'Аккаунт'}</span></div>`;
    slot.querySelector('.g-btn').addEventListener('click', ()=>{
      state.signedIn=false; renderAuthSlot(); toast('Вы вышли из аккаунта');
    });
  } else {
    slot.innerHTML = `<button class="g-btn" id="google-signin-btn">
      <svg viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.9 19 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 6 29.6 4 24 4c-7.6 0-14.1 4.3-17.4 10.7z"/><path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4c-2 1.5-4.7 2.4-7.6 2.4-5.3 0-9.7-3.1-11.3-7.6l-6.6 5.1C9.8 39.6 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.5l6.6 5.4C41.5 35.8 44 30.4 44 24c0-1.2-.1-2.4-.4-3.5z"/></svg>
      <span>Войти через Google</span>
    </button>`;
    document.getElementById('google-signin-btn').addEventListener('click', simulateGoogleSignIn);
  }
}
function simulateGoogleSignIn(){
  const btn=document.getElementById('google-signin-btn');
  btn.querySelector('span').textContent='Вход…';
  setTimeout(()=>{
    state.signedIn=true; state.userName='Демо-аккаунт'; state.userInitial='Д';
    renderAuthSlot();
    toast('Демо-режим: вход выполнен без реального Google OAuth');
  },700);
}
renderAuthSlot();
/* ============================================================
   THREE.JS HELPERS
   ============================================================ */
function makeSwatchCanvas(kind, baseHex){
  const c=document.createElement('canvas'); c.width=256; c.height=256;
  const ctx=c.getContext('2d');
  const base='#'+baseHex.toString(16).padStart(6,'0');
  ctx.fillStyle=base; ctx.fillRect(0,0,256,256);
  if(kind==='wood'){
    for(let i=0;i<26;i++){
      ctx.strokeStyle='rgba(0,0,0,'+(0.05+Math.random()*0.08)+')';
      ctx.lineWidth=1+Math.random()*2;
      ctx.beginPath();
      let y=Math.random()*256;
      ctx.moveTo(0,y);
      for(let x=0;x<=256;x+=32){ y+=(Math.random()-0.5)*18; ctx.lineTo(x,y); }
      ctx.stroke();
    }
  } else if(kind==='carbon'){
    const sq=8;
    for(let y=0;y<256;y+=sq){
      for(let x=0;x<256;x+=sq){
        const alt=((x/sq)+(y/sq))%2===0;
        ctx.fillStyle= alt ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.015)';
        ctx.fillRect(x,y,sq,sq);
      }
    }
  } else if(kind==='brushed'){
    for(let y=0;y<256;y+=2){
      ctx.strokeStyle='rgba(255,255,255,'+(Math.random()*0.06)+')';
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(256,y+Math.random()*2); ctx.stroke();
    }
  } else if(kind==='rough'){
    for(let i=0;i<3200;i++){
      ctx.fillStyle='rgba('+(Math.random()>0.5?'255,255,255,':'0,0,0,')+(Math.random()*0.12)+')';
      ctx.fillRect(Math.random()*256,Math.random()*256,1.6,1.6);
    }
  } else if(kind==='matte'){
    for(let i=0;i<600;i++){
      ctx.fillStyle='rgba(255,255,255,'+(Math.random()*0.03)+')';
      ctx.fillRect(Math.random()*256,Math.random()*256,3,3);
    }
  }
  return c;
}
function makeCanvasTexture(kind, baseHex){
  const tex=new THREE.CanvasTexture(makeSwatchCanvas(kind, baseHex));
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  return tex;
}

function materialFor(m){
  const opts={color:m.color, metalness:m.metalness, roughness:m.roughness};
  if(m.tex && m.tex!=='glossy'){
    opts.map=makeCanvasTexture(m.tex, m.color);
  }
  return new THREE.MeshStandardMaterial(opts);
}

/* flat "photo" swatch used as <img> thumbnail for a material */
function matPhotoURL(m){
  const c=makeSwatchCanvas(m.tex||'matte', m.color);
  const ctx=c.getContext('2d');
  const g=ctx.createRadialGradient(90,80,10,128,128,190);
  g.addColorStop(0,'rgba(255,255,255,.25)');
  g.addColorStop(1,'rgba(0,0,0,.25)');
  ctx.fillStyle=g; ctx.fillRect(0,0,256,256);
  return c.toDataURL('image/png');
}

function wireOverlay(geo, rotation, position){
  const edges=new THREE.EdgesGeometry(geo);
  const mat=new THREE.LineBasicMaterial({color:0x5EEAD4, transparent:true, opacity:.35});
  const lines=new THREE.LineSegments(edges,mat);
  if(rotation) lines.rotation.copy(rotation instanceof THREE.Euler ? rotation : new THREE.Euler().setFromVector3? rotation: rotation);
  if(position) lines.position.copy(position);
  return lines;
}

/* ---------- HERO 3D ---------- */
let heroScene, heroCamera, heroRenderer, heroGroup;
function initHero(){
  const canvas=document.getElementById('hero-canvas');
  const size=Math.min(420, canvas.parentElement.clientWidth*0.7 || 380);
  heroScene=new THREE.Scene();
  heroCamera=new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  heroCamera.position.set(2.4,1.6,3.2);
  heroCamera.lookAt(0,0,0);
  heroRenderer=new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  heroRenderer.setSize(420,420);
  heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

  heroScene.add(new THREE.HemisphereLight(0xbfe9ff,0x0a1220,0.9));
  const dl=new THREE.DirectionalLight(0xffffff,1.1); dl.position.set(3,4,2); heroScene.add(dl);
  const dl2=new THREE.DirectionalLight(0x5EEAD4,0.4); dl2.position.set(-3,-2,-2); heroScene.add(dl2);

  heroGroup=new THREE.Group();
  const steelMat=new THREE.MeshStandardMaterial({color:0x9FB3C8, metalness:.8, roughness:.35, map:makeCanvasTexture('brushed',0x9FB3C8)});
  const orangeMat=new THREE.MeshStandardMaterial({color:0xFF7A45, metalness:.4, roughness:.4});

  const gearGeo=new THREE.CylinderGeometry(1,1,0.35,32);
  const gear=new THREE.Mesh(gearGeo, steelMat);
  gear.rotation.x=Math.PI/2;
  heroGroup.add(gear);
  heroGroup.add(wireOverlay(gearGeo,new THREE.Euler(Math.PI/2,0,0)));

  for(let i=0;i<20;i++){
    const a=(i/20)*Math.PI*2;
    const tg=new THREE.BoxGeometry(0.14,0.35,0.12);
    const tm=new THREE.Mesh(tg, steelMat);
    tm.position.set(Math.cos(a)*1.06, 0, Math.sin(a)*1.06);
    tm.rotation.y=-a;
    heroGroup.add(tm);
  }
  const hubGeo=new THREE.CylinderGeometry(0.32,0.32,0.4,24);
  const hub=new THREE.Mesh(hubGeo, orangeMat);
  hub.rotation.x=Math.PI/2;
  heroGroup.add(hub);
  heroGroup.add(wireOverlay(hubGeo,new THREE.Euler(Math.PI/2,0,0)));

  const shaftGeo=new THREE.CylinderGeometry(0.16,0.16,2.6,20);
  const shaft=new THREE.Mesh(shaftGeo, steelMat);
  shaft.rotation.z=Math.PI/2;
  shaft.position.x=0.1;
  heroGroup.add(shaft);

  heroGroup.rotation.x=0.55;
  heroScene.add(heroGroup);
}
let heroMouseX=0, heroMouseY=0;
window.addEventListener('mousemove', e=>{
  heroMouseX=(e.clientX/window.innerWidth-0.5);
  heroMouseY=(e.clientY/window.innerHeight-0.5);
});
/* ============================================================
   RENDER: MATERIAL STRIP (top section)
   ============================================================ */
function renderMatStrip(){
  const el=document.getElementById('mat-strip');
  el.innerHTML='';
  MATERIALS.forEach(m=>{
    const div=document.createElement('div');
    div.className='mat-chip';
    const eco=typeof ECO_FACTORS!=='undefined' ? ECO_FACTORS[m.id] : null;
    div.innerHTML=`<img class="mat-photo" src="${matPhotoURL(m)}" alt="${m.name}"><b>${m.name}</b><span>${m.density} кг/м³ · ${m.price} ₽/кг${eco!=null?' · '+eco+' кг CO₂':''}</span>`;
    div.addEventListener('click',()=>{
      window.location.href='proekt.html';
    });
    el.appendChild(div);
  });
}

/* shared render loop */
function animate(){
  requestAnimationFrame(animate);
  if(heroGroup){
    heroGroup.rotation.y += 0.0032;
    heroCamera.position.x = 2.4 + heroMouseX*0.6;
    heroCamera.position.y = 1.6 - heroMouseY*0.4;
    heroCamera.lookAt(0,0,0);
    heroRenderer.render(heroScene, heroCamera);
  }
}

/* ============================================================
   SLIDE NAVIGATION
   Разделы главной страницы переключаются кликом по кнопкам —
   без прокрутки. Каждый раздел — «слайд» с id, соответствующим
   data-slide в .slide-nav и href="#..." в обычных ссылках.
   ============================================================ */
const SLIDE_IDS = ['hero', 'how', 'materials'];

function showSlide(id){
  if(SLIDE_IDS.indexOf(id)===-1) id='hero';
  document.querySelectorAll('.slide').forEach(s=>{
    const active = s.id===id;
    s.classList.toggle('active', active);
    if(active) s.classList.add('in');
  });
  document.querySelectorAll('.slide-dot[data-slide]').forEach(d=>{
    d.classList.toggle('active', d.dataset.slide===id);
  });
  document.querySelectorAll('a[data-slide-link]').forEach(a=>{
    a.classList.toggle('active', a.dataset.slideLink===id);
  });
  if(history.replaceState) history.replaceState(null,'','#'+id);
  window.scrollTo({top:0, behavior:'auto'});
}

function initSlideNav(){
  /* превращаем обычные href="#hero/#how/#materials" ссылки (в навбаре,
     hero-cta, quicknav, футере) в переключатели слайдов вместо прокрутки */
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    const id = a.getAttribute('href').slice(1);
    if(SLIDE_IDS.indexOf(id)!==-1){
      a.dataset.slideLink = id;
      a.addEventListener('click', e=>{ e.preventDefault(); showSlide(id); });
    }
  });
  document.querySelectorAll('.slide-dot[data-slide]').forEach(d=>{
    d.addEventListener('click', ()=> showSlide(d.dataset.slide));
  });
  const startHash = (location.hash||'').slice(1);
  showSlide(SLIDE_IDS.indexOf(startHash)!==-1 ? startHash : 'hero');
}

/* ============================================================
   INIT
   ============================================================ */
renderMatStrip();
initHero();
animate();
initSlideNav();
