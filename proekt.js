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
const PARTS = [
  { id:'beam', name:'Балка', desc:'прямоуг. сечение',
    icon:'<path d="M4 26 L34 26 M4 26 L4 22 L34 22 L34 26 M8 22 L8 12 M30 22 L30 12 M4 12 L34 12 L34 8 L4 8 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/>',
    fields:[
      {id:'L', label:'Длина пролёта', unit:'мм', def:1000, min:50, max:6000, step:10},
      {id:'b', label:'Ширина сечения', unit:'мм', def:50, min:5, max:400, step:1},
      {id:'h', label:'Высота сечения', unit:'мм', def:80, min:5, max:400, step:1},
      {id:'F', label:'Нагрузка в центре', unit:'Н', def:500, min:0, max:200000, step:10},
      {id:'n', label:'Требуемый запас прочности', unit:'×', def:1.5, min:1, max:5, step:.1},
    ],
    optFields:['b','h'], loadField:'F', loadFieldKg:true,
    volume:p=>(p.L*p.b*p.h)*1e-9,
    dims:p=>[['Длина пролёта',p.L+' мм'],['Сечение',p.b+' × '+p.h+' мм'],['Нагрузка',p.F+' Н (в центре пролёта)']],
    checks:(p,m)=>{
      const I = p.b*Math.pow(p.h,3)/12;
      const W = p.b*Math.pow(p.h,2)/6;
      const M = p.F*p.L/4;
      const sigma = W>0 ? M/W : 0;
      const allow = m.yield/p.n;
      const Emod = m.E*1000;
      const defl = (Emod>0&&I>0) ? (p.F*Math.pow(p.L,3))/(48*Emod*I) : 0;
      const deflAllow = p.L/250;
      const out=[];
      out.push({label:'Изгибающее напряжение', status: sigma<=allow?'pass':(sigma<=m.yield?'warn':'fail'),
        detail:`σ = ${sigma.toFixed(1)} МПа, допустимо ${allow.toFixed(1)} МПа (предел текучести ${m.yield} МПа / запас ${p.n})`});
      out.push({label:'Прогиб посередине пролёта', status: defl<=deflAllow?'pass':'warn',
        detail:`f = ${defl.toFixed(2)} мм, ориентир L/250 = ${deflAllow.toFixed(2)} мм`});
      out.push({label:'Пропорции сечения', status: (p.h/p.b)<=6?'pass':'warn',
        detail:`h/b = ${(p.h/p.b).toFixed(1)} — выше 6 возможна боковая потеря устойчивости`});
      return out;
    },
    safety:(p,m)=>{
      const W=p.b*Math.pow(p.h,2)/6;
      const M=p.F*p.L/4;
      const sigma=W>0?M/W:0;
      return sigma>0 ? m.yield/sigma : Infinity;
    },
    virtualTest:(p,m,kg)=>{
      const F=+(kg*9.80665).toFixed(3);
      const I=p.b*Math.pow(p.h,3)/12;
      const W=p.b*Math.pow(p.h,2)/6;
      const M=F*p.L/4;
      const sigma=W>0?M/W:0;
      const Emod=m.E*1000;
      const deformation=(Emod>0&&I>0)?(F*Math.pow(p.L,3))/(48*Emod*I):0;
      const ratio=m.yield>0?sigma/m.yield:0;
      return {F, deformation, unit:'мм', sigma, ratio, critical: sigma>=m.yield,
        note:'Прогиб посередине пролёта при возрастающей нагрузке'};
    },
    mesh:(p,vis)=>{
      const g=new THREE.Group();
      const scale = 1.5/Math.max(p.L,p.b,p.h,1);
      const geo=new THREE.BoxGeometry(p.L*scale,p.h*scale,p.b*scale);
      const mesh=new THREE.Mesh(geo, vis.mat);
      g.add(mesh);
      g.add(wireOverlay(geo));
      return g;
    }
  },
  { id:'shaft', name:'Вал', desc:'цилиндр',
    icon:'<rect x="6" y="14" width="26" height="10" rx="1" stroke="currentColor" stroke-width="1.6" fill="none"/><ellipse cx="6" cy="19" rx="2.3" ry="5.2" stroke="currentColor" stroke-width="1.4" fill="none"/>',
    fields:[
      {id:'D', label:'Диаметр', unit:'мм', def:40, min:2, max:400, step:1},
      {id:'L', label:'Длина', unit:'мм', def:300, min:10, max:4000, step:5},
      {id:'T', label:'Крутящий момент', unit:'Н·м', def:50, min:0, max:5000, step:1},
      {id:'n', label:'Требуемый запас прочности', unit:'×', def:2, min:1, max:5, step:.1},
    ],
    optFields:['D'], loadField:'T',
    volume:p=>(Math.PI/4*p.D*p.D*p.L)*1e-9,
    dims:p=>[['Диаметр',p.D+' мм'],['Длина',p.L+' мм'],['Крутящий момент',p.T+' Н·м']],
    checks:(p,m)=>{
      const Wp = Math.PI*Math.pow(p.D,3)/16;
      const tau = Wp>0 ? (p.T*1000)/Wp : 0;
      const allowShear = 0.55*m.yield/p.n;
      const slender = p.L/p.D;
      const out=[];
      out.push({label:'Касательное напряжение при кручении', status: tau<=allowShear?'pass':(tau<=0.55*m.yield?'warn':'fail'),
        detail:`τ = ${tau.toFixed(1)} МПа, допустимо ${allowShear.toFixed(1)} МПа`});
      out.push({label:'Гибкость вала (L/D)', status: slender<=15?'pass':(slender<=25?'warn':'fail'),
        detail:`L/D = ${slender.toFixed(1)} — выше 15 растёт риск вибраций и прогиба`});
      return out;
    },
    safety:(p,m)=>{
      const Wp=Math.PI*Math.pow(p.D,3)/16;
      const tau=Wp>0?(p.T*1000)/Wp:0;
      return tau>0 ? (0.55*m.yield)/tau : Infinity;
    },
    mesh:(p,vis)=>{
      const scale=1.5/Math.max(p.D,p.L,1);
      const geo=new THREE.CylinderGeometry(p.D/2*scale,p.D/2*scale,p.L*scale,28);
      const mesh=new THREE.Mesh(geo, vis.mat);
      mesh.rotation.z=Math.PI/2;
      const g=new THREE.Group(); g.add(mesh); g.add(wireOverlay(geo,mesh.rotation));
      return g;
    }
  },
  { id:'tube', name:'Труба', desc:'полый цилиндр',
    icon:'<ellipse cx="8" cy="19" rx="3" ry="7" stroke="currentColor" stroke-width="1.5" fill="none"/><ellipse cx="8" cy="19" rx="1.3" ry="3" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M8 12 L28 12 M8 26 L28 26" stroke="currentColor" stroke-width="1.5"/><ellipse cx="28" cy="19" rx="3" ry="7" stroke="currentColor" stroke-width="1.5" fill="none"/>',
    fields:[
      {id:'D', label:'Наружный диаметр', unit:'мм', def:50, min:6, max:400, step:1},
      {id:'t', label:'Толщина стенки', unit:'мм', def:4, min:.5, max:40, step:.5},
      {id:'L', label:'Длина', unit:'мм', def:500, min:10, max:4000, step:5},
    ],
    optFields:['D','t'],
    volume:p=>{const din=Math.max(p.D-2*p.t,0.1); return (Math.PI/4*(p.D*p.D-din*din)*p.L)*1e-9;},
    dims:p=>{const din=Math.max(p.D-2*p.t,0.1); return [['Наружный диаметр',p.D+' мм'],['Внутренний диаметр',din.toFixed(1)+' мм'],['Толщина стенки',p.t+' мм'],['Длина',p.L+' мм']];},
    checks:(p,m)=>{
      const ratio=p.t/p.D;
      const out=[];
      out.push({label:'Толщина стенки', status: p.t*2<p.D?'pass':'fail', detail: p.t*2<p.D? 'Корректное соотношение — стенка тоньше диаметра' : 'Толщина стенки не может быть больше половины диаметра'});
      out.push({label:'Тонкостенность', status: ratio>=0.03?'pass':'warn', detail:`t/D = ${ratio.toFixed(3)} — ниже 0.03 растёт риск потери устойчивости при осевом сжатии`});
      return out;
    },
    mesh:(p,vis)=>{
      const scale=1.5/Math.max(p.D,p.L,1);
      const geo=new THREE.CylinderGeometry(p.D/2*scale,p.D/2*scale,p.L*scale,28,1,true);
      const mat2=vis.mat.clone(); mat2.side=THREE.DoubleSide;
      const mesh=new THREE.Mesh(geo, mat2);
      mesh.rotation.z=Math.PI/2;
      const g=new THREE.Group(); g.add(mesh); g.add(wireOverlay(geo,mesh.rotation));
      return g;
    }
  },
  { id:'plate', name:'Пластина', desc:'лист',
    icon:'<path d="M6 10 L28 10 L28 24 L6 24 Z" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M6 10 L10 6 L32 6 L28 10 M28 10 L32 6 L32 20 L28 24" stroke="currentColor" stroke-width="1.2" fill="none" opacity=".55"/>',
    fields:[
      {id:'L', label:'Длина', unit:'мм', def:300, min:10, max:3000, step:5},
      {id:'W', label:'Ширина', unit:'мм', def:200, min:10, max:3000, step:5},
      {id:'t', label:'Толщина', unit:'мм', def:5, min:.5, max:100, step:.5},
    ],
    volume:p=>(p.L*p.W*p.t)*1e-9,
    dims:p=>[['Длина',p.L+' мм'],['Ширина',p.W+' мм'],['Толщина',p.t+' мм']],
    checks:(p,m)=>{
      const ratio=Math.max(p.L,p.W)/p.t;
      return [{label:'Соотношение сторона / толщина', status: ratio<=100?'pass':'warn',
        detail:`${ratio.toFixed(0)}:1 — выше 100 лист может «повести» при обработке и сварке`}];
    },
    mesh:(p,vis)=>{
      const scale=1.5/Math.max(p.L,p.W,p.t*4,1);
      const geo=new THREE.BoxGeometry(p.L*scale,p.t*scale*3,p.W*scale);
      const mesh=new THREE.Mesh(geo, vis.mat);
      const g=new THREE.Group(); g.add(mesh); g.add(wireOverlay(geo));
      return g;
    }
  },
  { id:'bracket', name:'Кронштейн', desc:'Г-образный профиль',
    icon:'<path d="M8 8 L14 8 L14 22 L28 22 L28 28 L8 28 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/>',
    fields:[
      {id:'a', label:'Высота полки', unit:'мм', def:80, min:10, max:400, step:1},
      {id:'b', label:'Ширина полки', unit:'мм', def:60, min:10, max:400, step:1},
      {id:'t', label:'Толщина', unit:'мм', def:5, min:1, max:40, step:.5},
      {id:'Lp', label:'Длина профиля', unit:'мм', def:150, min:10, max:3000, step:5},
    ],
    optFields:['a','b','t'],
    volume:p=>{const area=(p.a+p.b-p.t)*p.t; return (area*p.Lp)*1e-9;},
    dims:p=>[['Полка А',p.a+' мм'],['Полка Б',p.b+' мм'],['Толщина',p.t+' мм'],['Длина профиля',p.Lp+' мм']],
    checks:(p,m)=>{
      const ratio=Math.min(p.a,p.b)/p.t;
      return [{label:'Толщина относительно полки', status: ratio>=4?'pass':'warn',
        detail:`меньшая полка / толщина = ${ratio.toFixed(1)} — ниже 4 узел может быть недостаточно жёстким`}];
    },
    mesh:(p,vis)=>{
      const scale=1.4/Math.max(p.a,p.b,p.Lp,1);
      const g=new THREE.Group();
      const geo1=new THREE.BoxGeometry(p.Lp*scale,p.a*scale,p.t*scale);
      const m1=new THREE.Mesh(geo1,vis.mat); m1.position.set(0, p.a*scale/2 - p.t*scale/2, 0);
      const geo2=new THREE.BoxGeometry(p.Lp*scale,p.t*scale,p.b*scale);
      const m2=new THREE.Mesh(geo2,vis.mat); m2.position.set(0, -p.t*scale/2, p.b*scale/2 - p.t*scale/2);
      g.add(m1,m2); g.add(wireOverlay(geo1,null,m1.position)); g.add(wireOverlay(geo2,null,m2.position));
      return g;
    }
  },
  { id:'gear', name:'Зубчатое колесо', desc:'диск с отверстием',
    icon:'<circle cx="19" cy="17" r="9" stroke="currentColor" stroke-width="1.6" fill="none"/><circle cx="19" cy="17" r="3.4" stroke="currentColor" stroke-width="1.4" fill="none"/><path d="M19 6 V8.4 M19 25.6 V28 M8 17 H10.4 M27.6 17 H30 M11.5 9.5 L13.2 11.2 M24.8 22.8 L26.5 24.5 M26.5 9.5 L24.8 11.2 M13.2 22.8 L11.5 24.5" stroke="currentColor" stroke-width="1.4"/>',
    fields:[
      {id:'D', label:'Делительный диаметр', unit:'мм', def:100, min:10, max:800, step:1},
      {id:'b', label:'Ширина венца', unit:'мм', def:20, min:2, max:200, step:1},
      {id:'d0', label:'Диаметр отверстия', unit:'мм', def:25, min:2, max:400, step:1},
    ],
    volume:p=>{const d0=Math.min(p.d0,p.D*0.9); return (Math.PI/4*(p.D*p.D-d0*d0)*p.b)*1e-9;},
    dims:p=>[['Делительный диаметр',p.D+' мм'],['Ширина венца',p.b+' мм'],['Диаметр отверстия',p.d0+' мм']],
    checks:(p,m)=>{
      const ratio=p.d0/p.D;
      return [{label:'Отверстие относительно диаметра', status:(ratio>=0.15&&ratio<=0.45)?'pass':'warn',
        detail:`d0/D = ${ratio.toFixed(2)} — обычно рекомендуют 0.15–0.45 для ступицы`}];
    },
    mesh:(p,vis)=>{
      const scale=1.5/Math.max(p.D,p.b*3,1);
      const g=new THREE.Group();
      const geo=new THREE.CylinderGeometry(p.D/2*scale,p.D/2*scale,p.b*scale,32);
      const mesh=new THREE.Mesh(geo,vis.mat); mesh.rotation.x=Math.PI/2;
      g.add(mesh);
      const teeth=16;
      for(let i=0;i<teeth;i++){
        const a=(i/teeth)*Math.PI*2;
        const tg=new THREE.BoxGeometry(p.D*scale*0.06,p.b*scale,p.D*scale*0.05);
        const tm=new THREE.Mesh(tg,vis.mat);
        const r=p.D/2*scale+p.D*scale*0.02;
        tm.position.set(Math.cos(a)*r, 0, Math.sin(a)*r);
        tm.rotation.y=-a;
        g.add(tm);
      }
      const hg=new THREE.CylinderGeometry(Math.min(p.d0,p.D*0.9)/2*scale,Math.min(p.d0,p.D*0.9)/2*scale,p.b*scale+2,20);
      const hm=new THREE.Mesh(hg,new THREE.MeshStandardMaterial({color:0x060B14,metalness:0,roughness:1}));
      hm.rotation.x=Math.PI/2; g.add(hm);
      g.add(wireOverlay(geo,new THREE.Euler(Math.PI/2,0,0)));
      return g;
    }
  },
  { id:'spring', name:'Пружина', desc:'винтовая, сжатие',
    icon:'<path d="M8 8 Q14 8 14 12 Q14 16 8 16 Q14 16 14 20 Q14 24 8 24 Q14 24 14 28" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M14 8 Q20 8 20 12 Q20 16 14 16" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/>',
    fields:[
      {id:'d', label:'Диаметр проволоки', unit:'мм', def:4, min:.5, max:30, step:.1},
      {id:'D', label:'Средний диаметр пружины', unit:'мм', def:30, min:3, max:300, step:1},
      {id:'n', label:'Число рабочих витков', unit:'шт', def:8, min:2, max:60, step:1},
    ],
    optFields:['d'],
    volume:p=>{const wl=p.n*Math.PI*p.D; const area=Math.PI/4*p.d*p.d; return (wl*area)*1e-9;},
    dims:p=>{const wl=p.n*Math.PI*p.D; return [['Диаметр проволоки',p.d+' мм'],['Средний диаметр',p.D+' мм'],['Витков',p.n],['Длина проволоки (оценка)',wl.toFixed(0)+' мм']];},
    checks:(p,m)=>{
      const C=p.D/p.d;
      return [{label:'Индекс пружины (D/d)', status:(C>=4&&C<=12)?'pass':'warn',
        detail:`C = ${C.toFixed(1)} — рекомендуемый диапазон 4–12, иначе сложнее навивать и хуже работает пружина`}];
    },
    mesh:(p,vis)=>{
      const scale=1.5/Math.max(p.D+p.d,p.n*p.d*2,1);
      const pts=[];
      const turns=p.n, R=p.D/2*scale, pitch=p.d*2.1*scale;
      const steps=turns*24;
      for(let i=0;i<=steps;i++){
        const t=i/steps*turns*Math.PI*2;
        pts.push(new THREE.Vector3(Math.cos(t)*R, (i/steps)*turns*pitch - (turns*pitch/2), Math.sin(t)*R));
      }
      const curve=new THREE.CatmullRomCurve3(pts);
      const geo=new THREE.TubeGeometry(curve, steps, Math.max(p.d/2*scale,0.01), 8, false);
      const mesh=new THREE.Mesh(geo, vis.mat);
      const g=new THREE.Group(); g.add(mesh);
      return g;
    }
  },
  { id:'bolt', name:'Крепёж (болт)', desc:'резьба + головка',
    icon:'<path d="M12 8 L26 8 L26 12 L12 12 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/><rect x="16" y="12" width="6" height="16" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M16 15 H22 M16 18 H22 M16 21 H22 M16 24 H22" stroke="currentColor" stroke-width="1.1"/>',
    fields:[
      {id:'D', label:'Диаметр резьбы', unit:'мм', def:8, min:2, max:60, step:.5},
      {id:'L', label:'Длина', unit:'мм', def:40, min:5, max:400, step:1},
    ],
    volume:p=>{const shank=Math.PI/4*p.D*p.D*p.L; const headD=p.D*1.6, headH=p.D*0.7; const head=Math.PI/4*headD*headD*headH; return (shank+head)*1e-9;},
    dims:p=>[['Диаметр резьбы',p.D+' мм'],['Длина',p.L+' мм'],['Диаметр головки (оценка)',(p.D*1.6).toFixed(1)+' мм']],
    checks:(p,m)=>{
      const ratio=p.L/p.D;
      return [{label:'Длина относительно диаметра', status: ratio<=10?'pass':'warn',
        detail:`L/D = ${ratio.toFixed(1)} — выше 10 крепёж считается длинным, проверьте вылет и прогиб`}];
    },
    mesh:(p,vis)=>{
      const scale=1.5/Math.max(p.D*1.6,p.L,1);
      const g=new THREE.Group();
      const shankGeo=new THREE.CylinderGeometry(p.D/2*scale,p.D/2*scale,p.L*scale,20);
      const shank=new THREE.Mesh(shankGeo,vis.mat); shank.position.y=-p.D*0.35*scale;
      const headGeo=new THREE.CylinderGeometry(p.D*0.8*scale,p.D*0.8*scale,p.D*0.7*scale,6);
      const head=new THREE.Mesh(headGeo,vis.mat); head.position.y=p.L*scale/2;
      g.add(shank,head);
      g.add(wireOverlay(shankGeo,null,shank.position));
      return g;
    }
  },
  { id:'column', name:'Стойка (колонна)', desc:'осевое сжатие',
    icon:'<rect x="15" y="4" width="8" height="24" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M8 30 H30" stroke="currentColor" stroke-width="1.8"/><path d="M8 30 L12 26 M30 30 L26 26" stroke="currentColor" stroke-width="1.2" opacity=".6"/>',
    fields:[
      {id:'D', label:'Диаметр', unit:'мм', def:30, min:4, max:300, step:1},
      {id:'L', label:'Длина (высота)', unit:'мм', def:600, min:20, max:5000, step:5},
      {id:'F', label:'Осевая сжимающая нагрузка', unit:'Н', def:2000, min:0, max:500000, step:10},
      {id:'n', label:'Требуемый запас прочности', unit:'×', def:2, min:1, max:5, step:.1},
    ],
    optFields:['D'], loadField:'F', loadFieldKg:true,
    volume:p=>(Math.PI/4*p.D*p.D*p.L)*1e-9,
    dims:p=>[['Диаметр',p.D+' мм'],['Длина',p.L+' мм'],['Нагрузка',p.F+' Н (осевая, сжатие)']],
    checks:(p,m)=>{
      const A=Math.PI/4*p.D*p.D;
      const sigma = A>0 ? p.F/A : 0;
      const allow = m.yield/p.n;
      const I=Math.PI*Math.pow(p.D,4)/64;
      const E_MPa=m.E*1000;
      const Pcr = (E_MPa*I>0 && p.L>0) ? (Math.pow(Math.PI,2)*E_MPa*I)/Math.pow(p.L,2) : 0;
      const marginBuckling = p.F>0 ? Pcr/p.F : Infinity;
      const slender=p.L/p.D;
      const out=[];
      out.push({label:'Напряжение сжатия', status: sigma<=allow?'pass':(sigma<=m.yield?'warn':'fail'),
        detail:`σ = ${sigma.toFixed(1)} МПа, допустимо ${allow.toFixed(1)} МПа (предел текучести ${m.yield} МПа / запас ${p.n})`});
      out.push({label:'Устойчивость (формула Эйлера)', status: marginBuckling>=p.n?'pass':(marginBuckling>=1?'warn':'fail'),
        detail:`Fcr ≈ ${Pcr.toFixed(0)} Н, запас по устойчивости ${isFinite(marginBuckling)?marginBuckling.toFixed(1)+'×':'∞'} (нужно ≥ ${p.n})`});
      out.push({label:'Гибкость стойки (L/D)', status: slender<=30?'pass':(slender<=50?'warn':'fail'),
        detail:`L/D = ${slender.toFixed(1)} — выше 30 растёт риск потери устойчивости`});
      return out;
    },
    safety:(p,m)=>{
      const A=Math.PI/4*p.D*p.D;
      const sigma=A>0?p.F/A:0;
      const I=Math.PI*Math.pow(p.D,4)/64;
      const E_MPa=m.E*1000;
      const Pcr=(E_MPa*I>0&&p.L>0)?(Math.pow(Math.PI,2)*E_MPa*I)/Math.pow(p.L,2):0;
      const sYield=sigma>0?m.yield/sigma:Infinity;
      const sBuckle=p.F>0?Pcr/p.F:Infinity;
      return Math.min(sYield,sBuckle);
    },
    virtualTest:(p,m,kg)=>{
      const F=+(kg*9.80665).toFixed(3);
      const A=Math.PI/4*p.D*p.D;
      const sigma=A>0?F/A:0;
      const I=Math.PI*Math.pow(p.D,4)/64;
      const E_MPa=m.E*1000;
      const Pcr=(E_MPa*I>0&&p.L>0)?(Math.pow(Math.PI,2)*E_MPa*I)/Math.pow(p.L,2):0;
      const deformation=(A>0&&E_MPa>0)?(F*p.L)/(A*E_MPa):0;
      const ratio=Math.max(sigma/Math.max(m.yield,1e-6), Pcr>0?F/Pcr:0);
      return {F, deformation, unit:'мм', sigma, ratio, critical: ratio>=1,
        note:'Осевое укорочение стойки при возрастающей сжимающей нагрузке'};
    },
    mesh:(p,vis)=>{
      const scale=1.5/Math.max(p.D*2,p.L,1);
      const geo=new THREE.CylinderGeometry(p.D/2*scale,p.D/2*scale,p.L*scale,24);
      const mesh=new THREE.Mesh(geo, vis.mat);
      const g=new THREE.Group(); g.add(mesh); g.add(wireOverlay(geo));
      return g;
    }
  },
  { id:'disc', name:'Диск / маховик', desc:'вращающийся диск',
    icon:'<circle cx="19" cy="17" r="10" stroke="currentColor" stroke-width="1.6" fill="none"/><circle cx="19" cy="17" r="3" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M19 7 V4 M19 30 V27" stroke="currentColor" stroke-width="1.2" opacity=".6"/>',
    fields:[
      {id:'D', label:'Диаметр', unit:'мм', def:200, min:20, max:1000, step:5},
      {id:'t', label:'Толщина', unit:'мм', def:15, min:2, max:150, step:1},
      {id:'d0', label:'Диаметр отверстия (ступица)', unit:'мм', def:30, min:0, max:400, step:1},
      {id:'rpm', label:'Частота вращения', unit:'об/мин', def:3000, min:0, max:30000, step:50},
      {id:'n', label:'Требуемый запас прочности', unit:'×', def:2, min:1, max:5, step:.1},
    ],
    optFields:['t'],
    volume:p=>{const d0=Math.min(p.d0,p.D*0.9); return (Math.PI/4*(p.D*p.D-d0*d0)*p.t)*1e-9;},
    dims:p=>[['Диаметр',p.D+' мм'],['Толщина',p.t+' мм'],['Отверстие',p.d0+' мм'],['Обороты',p.rpm+' об/мин']],
    checks:(p,m)=>{
      const omega=p.rpm*2*Math.PI/60;
      const R=p.D/2000;
      const nu=0.3;
      const sigmaPa=m.density*omega*omega*(3+nu)/8*R*R;
      const sigma=sigmaPa/1e6;
      const allow=m.yield/p.n;
      return [{label:'Напряжение от вращения (обод диска)', status: sigma<=allow?'pass':(sigma<=m.yield?'warn':'fail'),
        detail:`σ ≈ ${sigma.toFixed(1)} МПа (упрощённая формула тонкого вращающегося диска), допустимо ${allow.toFixed(1)} МПа`}];
    },
    safety:(p,m)=>{
      const omega=p.rpm*2*Math.PI/60;
      const R=p.D/2000;
      const nu=0.3;
      const sigmaPa=m.density*omega*omega*(3+nu)/8*R*R;
      const sigma=sigmaPa/1e6;
      return sigma>0 ? m.yield/sigma : Infinity;
    },
    mesh:(p,vis)=>{
      const scale=1.5/Math.max(p.D,p.t*4,1);
      const g=new THREE.Group();
      const geo=new THREE.CylinderGeometry(p.D/2*scale,p.D/2*scale,p.t*scale,32);
      const mesh=new THREE.Mesh(geo, vis.mat); mesh.rotation.x=Math.PI/2;
      g.add(mesh);
      const d0=Math.min(p.d0,p.D*0.9);
      if(d0>0){
        const hg=new THREE.CylinderGeometry(d0/2*scale,d0/2*scale,p.t*scale+2,20);
        const hm=new THREE.Mesh(hg,new THREE.MeshStandardMaterial({color:0x060B14,metalness:0,roughness:1}));
        hm.rotation.x=Math.PI/2; g.add(hm);
      }
      g.add(wireOverlay(geo,new THREE.Euler(Math.PI/2,0,0)));
      return g;
    }
  },
];

/* machining complexity multiplier */
const MACHINING = {beam:1.15, shaft:1.2, tube:1.25, plate:1.15, bracket:1.3, gear:1.6, spring:1.5, bolt:1.1, column:1.2, disc:1.35};

/* ориентировочное время изготовления (учебная оценка, часы) */
const MANUF_BASE = {beam:0.6, shaft:0.4, tube:0.5, plate:0.5, bracket:0.8, gear:1.4, spring:1.0, bolt:0.2, column:0.5, disc:1.1};
function estimateManufTime(part, mass){
  const base=MANUF_BASE[part.id]!=null?MANUF_BASE[part.id]:0.6;
  const factor=MACHINING[part.id]||1.2;
  return base + mass*0.35*factor;
}

/* ============================================================
   MASS OPTIMIZER
   Перебирает варианты размеров (только поля из part.optFields) в их
   допустимых диапазонах, отбрасывает варианты, где хотя бы одна
   инженерная проверка "fail", и находит вариант с минимальной массой.
   ============================================================ */
function optBuildGrid(field, steps){
  const vals=[];
  const range=field.max-field.min;
  if(range<=0) return [field.min];
  const n=Math.max(1, Math.min(steps, Math.floor(range/Math.max(field.step,1e-6))||steps));
  for(let i=0;i<=n;i++){
    let v=field.min + (range*i/n);
    v=Math.round(v/field.step)*field.step;
    v=Math.min(field.max, Math.max(field.min, v));
    vals.push(+v.toFixed(4));
  }
  return Array.from(new Set(vals));
}
function optCartesian(fieldsWithValues){
  let combos=[{}];
  fieldsWithValues.forEach(fv=>{
    const next=[];
    combos.forEach(c=>{ fv.values.forEach(v=>{ next.push(Object.assign({},c,{[fv.id]:v})); }); });
    combos=next;
  });
  return combos;
}
function optimizePart(part, mat, baseParams, targetKg){
  const optIds = part.optFields||[];
  if(optIds.length===0) return {best:null, combosTried:0};
  const params = Object.assign({}, baseParams);
  if(targetKg!=null && part.loadField){
    params[part.loadField] = +(targetKg*9.80665).toFixed(2);
  }
  const stepsCount = optIds.length>=3 ? 9 : (optIds.length===2 ? 14 : 26);
  const fieldsWithValues = optIds.map(id=>({id, values:optBuildGrid(part.fields.find(f=>f.id===id), stepsCount)}));
  let combos = optCartesian(fieldsWithValues);
  if(combos.length>4000) combos = combos.slice(0,4000);
  let best=null;
  combos.forEach(combo=>{
    const p=Object.assign({}, params, combo);
    let vol;
    try{ vol=part.volume(p); }catch(e){ return; }
    if(!isFinite(vol) || vol<=0) return;
    const mass=vol*mat.density;
    let checks;
    try{ checks=part.checks(p,mat); }catch(e){ return; }
    if(checks.some(c=>c.status==='fail')) return;
    if(!best || mass<best.mass) best={params:p, mass, volume:vol, checks};
  });
  return {best, combosTried:combos.length, usedParams:params};
}

/* ============================================================
   STATE
   ============================================================ */
/* ============================================================
   STATE
   ============================================================ */
const state = {
  step:1,
  partId:null,
  matId:null,
  params:{},
  matTab:'metal',
  specList:[],
  signedIn:false,
};

function getPart(){ return PARTS.find(p=>p.id===state.partId); }
function getMat(){ return MATERIALS.find(m=>m.id===state.matId); }
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

function materialFor(m){
  const opts={color:m.color, metalness:m.metalness, roughness:m.roughness};
  if(m.tex && m.tex!=='glossy'){
    opts.map=makeCanvasTexture(m.tex, m.color);
  }
  return new THREE.MeshStandardMaterial(opts);
}

function wireOverlay(geo, rotation, position){
  const edges=new THREE.EdgesGeometry(geo);
  const mat=new THREE.LineBasicMaterial({color:0x5EEAD4, transparent:true, opacity:.35});
  const lines=new THREE.LineSegments(edges,mat);
  if(rotation) lines.rotation.copy(rotation instanceof THREE.Euler ? rotation : new THREE.Euler().setFromVector3? rotation: rotation);
  if(position) lines.position.copy(position);
  return lines;
}

/* ---------- side live preview ---------- */
let sideScene, sideCamera, sideRenderer, sideGroup;
function initSidePreview(){
  const canvas=document.getElementById('side-canvas');
  sideScene=new THREE.Scene();
  sideCamera=new THREE.PerspectiveCamera(40,1,0.1,50);
  sideCamera.position.set(1.8,1.3,2.4);
  sideCamera.lookAt(0,0,0);
  sideRenderer=new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  resizeSidePreview();
  sideScene.add(new THREE.HemisphereLight(0xbfe9ff,0x0a1220,0.9));
  const dl=new THREE.DirectionalLight(0xffffff,1.1); dl.position.set(3,4,2); sideScene.add(dl);
  const dl2=new THREE.DirectionalLight(0x5EEAD4,0.35); dl2.position.set(-2,-1,-2); sideScene.add(dl2);
  sideGroup=new THREE.Group();
  sideScene.add(sideGroup);
}
function resizeSidePreview(){
  const wrap=document.querySelector('.side-canvas-wrap');
  if(!wrap) return;
  const w=wrap.clientWidth, h=wrap.clientHeight;
  sideRenderer.setSize(w,h,true);
  sideRenderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  sideCamera.aspect=w/h; sideCamera.updateProjectionMatrix();
}
function updateSidePreview(){
  if(!sideGroup) return;
  while(sideGroup.children.length) sideGroup.remove(sideGroup.children[0]);
  sideGroup.scale.set(1,1,1);
  sideGroup.rotation.z=0;
  sideGroup.userData.shake=0;
  const part=getPart(), mat=getMat();
  if(!part){ return; }
  const visMat = mat ? materialFor(mat) : new THREE.MeshStandardMaterial({color:0x3AA893, metalness:.3, roughness:.6});
  try{
    const mesh=part.mesh(state.params, {mat:visMat});
    sideGroup.add(mesh);
  }catch(e){ /* incomplete params, ignore */ }
}


/* shared render loop */
function animate(){
  requestAnimationFrame(animate);
  if(sideGroup){
    sideGroup.rotation.y += 0.006;
    const shakeAt=sideGroup.userData.shake;
    if(shakeAt && performance.now()-shakeAt<700){
      sideGroup.rotation.z=Math.sin(performance.now()*0.06)*0.018;
    } else if(sideGroup.rotation.z!==0){
      sideGroup.rotation.z=0;
    }
    sideRenderer.render(sideScene, sideCamera);
  }
}
/* ============================================================
   WIZARD RENDER
   ============================================================ */
const STEP_LABELS=['Тип детали','Материал','Параметры','Результат','Спецификация'];
function renderWizard(){
  const el=document.getElementById('wizard');
  el.innerHTML='';
  STEP_LABELS.forEach((label,i)=>{
    const n=i+1;
    const div=document.createElement('div');
    let cls='wiz-step';
    if(n===state.step) cls+=' active';
    else if(n<state.step) cls+=' done clickable';
    div.className=cls;
    div.innerHTML=`<span class="n">${n<state.step?'✓':n}</span>${label}`;
    if(n<state.step) div.addEventListener('click',()=>goStep(n));
    el.appendChild(div);
  });
  document.getElementById('wizard-hint').textContent=`Шаг ${state.step} из 5`;
}

function goStep(n){
  if(n===2 && !state.partId) return;
  if(n===3 && (!state.partId||!state.matId)) return;
  if(n===4 && (!state.partId||!state.matId)) return;
  state.step=n;
  renderWizard();
  renderMain();
  document.getElementById('app').scrollIntoView({behavior:'smooth', block:'start'});
}

/* ============================================================
   MAIN PANEL RENDER
   ============================================================ */
function renderMain(){
  const el=document.getElementById('app-main');
  if(state.step===1) return renderStepPart(el);
  if(state.step===2) return renderStepMaterial(el);
  if(state.step===3) return renderStepParams(el);
  if(state.step===4) return renderStepResults(el);
  if(state.step===5) return renderStepSpec(el);
}

function renderStepPart(el){
  el.innerHTML=`
    <div class="panel-title">Какую деталь считаем?</div>
    <div class="panel-sub">Выберите тип — форма и набор параметров подстроятся автоматически.</div>
    <div class="part-grid" id="part-grid"></div>
  `;
  const grid=document.getElementById('part-grid');
  PARTS.forEach(p=>{
    const div=document.createElement('div');
    div.className='part-card'+(state.partId===p.id?' sel':'');
    div.tabIndex=0;
    div.innerHTML=`<svg viewBox="0 0 38 34" fill="none">${p.icon}</svg><b>${p.name}</b><span>${p.desc}</span>`;
    div.addEventListener('click',()=>{
      state.partId=p.id;
      if(!state.params || Object.keys(state.params).length===0 || state._paramsFor!==p.id){
        state.params={}; p.fields.forEach(f=>state.params[f.id]=f.def);
        state._paramsFor=p.id;
      }
      renderMain(); updateSideSummary(); updateSidePreview();
      setTimeout(()=>goStep(2),160);
    });
    grid.appendChild(div);
  });
  updateSideSummary();
}

function recommendMaterials(part, priority){
  const base=Object.assign({}, part.fields.reduce((o,f)=>{o[f.id]=f.def;return o;},{}), state.params);
  const rows=[];
  MATERIALS.forEach(m=>{
    let vol, checks;
    try{ vol=part.volume(base); checks=part.checks(base,m); }catch(e){ return; }
    if(!isFinite(vol)||vol<=0) return;
    const mass=vol*m.density;
    const factor=MACHINING[part.id]||1.2;
    const cost=mass*m.price*factor;
    const fails=checks.some(c=>c.status==='fail');
    const eco=(ECO_FACTORS[m.id]||0)*mass;
    rows.push({m, mass, cost, fails, eco});
  });
  const ok=rows.filter(r=>!r.fails);
  const pool=ok.length?ok:rows;
  const sortFn = priority==='cost' ? (a,b)=>a.cost-b.cost
    : priority==='mass' ? (a,b)=>a.mass-b.mass
    : priority==='eco' ? (a,b)=>a.eco-b.eco
    : (a,b)=>b.m.yield-a.m.yield;
  return pool.sort(sortFn).slice(0,3);
}
function renderStepMaterial(el){
  el.innerHTML=`
    <div class="panel-title">Из чего делаем?</div>
    <div class="panel-sub">Материал определяет плотность, прочность и цену.</div>
    <div class="rec-box" id="rec-box">
      <div class="rec-head">🎯 Автоматический подбор материала</div>
      <div class="rec-controls">
        <select id="rec-priority">
          <option value="cost">Самый дешёвый</option>
          <option value="mass">Самый лёгкий</option>
          <option value="strength">Самый прочный</option>
          <option value="eco">Самый экологичный</option>
        </select>
        <button class="btn btn-ghost btn-small" id="rec-run">Подобрать →</button>
      </div>
      <div id="rec-result"></div>
    </div>
    <div class="mat-tabs" id="mat-tabs"></div>
    <div class="material-grid" id="material-grid"></div>
    <div class="step-actions">
      <button class="btn btn-ghost btn-small" id="back1">← Назад</button>
      <div></div>
    </div>
  `;
  document.getElementById('rec-run').addEventListener('click',()=>{
    const priority=document.getElementById('rec-priority').value;
    const top=recommendMaterials(getPart(), priority);
    const resEl=document.getElementById('rec-result');
    if(!top.length){ resEl.innerHTML='<div class="opt-banner warn">Не удалось подобрать материал под текущие размеры.</div>'; return; }
    resEl.innerHTML='<div class="rec-list">'+top.map((r,i)=>`
      <div class="rec-chip" data-mid="${r.m.id}">
        <b>${i+1}. ${r.m.name}</b>
        <span>${fmt(r.mass,3)} кг · ${fmt(r.cost,0)} ₽ · ${fmt(r.eco,1)} кг CO₂${r.fails?' · ⚠ проверка не пройдена':''}</span>
      </div>`).join('')+'</div>';
    resEl.querySelectorAll('.rec-chip').forEach(chip=>{
      chip.addEventListener('click',()=>{
        state.matId=chip.dataset.mid;
        const mat=getMat(); state.matTab=mat.cat;
        renderStepMaterial(el); updateSideSummary(); updateSidePreview();
        setTimeout(()=>goStep(3),160);
      });
    });
  });
  const tabsEl=document.getElementById('mat-tabs');
  Object.keys(CATS).forEach(cat=>{
    const b=document.createElement('button');
    b.className='mat-tab'+(state.matTab===cat?' active':'');
    b.textContent=CATS[cat];
    b.addEventListener('click',()=>{state.matTab=cat; renderStepMaterial(el);});
    tabsEl.appendChild(b);
  });
  const grid=document.getElementById('material-grid');
  MATERIALS.filter(m=>m.cat===state.matTab).forEach(m=>{
    const div=document.createElement('div');
    div.className='material-card'+(state.matId===m.id?' sel':'');
    div.tabIndex=0;
    div.innerHTML=`<img class="mat-photo" src="${matPhotoURL(m)}" alt="${m.name}"><b>${m.name}</b>
      <div class="mstat-row"><span>Плотность</span><span>${m.density} кг/м³</span></div>
      <div class="mstat-row"><span>Цена</span><span>${m.price} ₽/кг</span></div>
      <div class="mstat-row"><span>Предел текучести</span><span>${m.yield} МПа</span></div>
      <div class="mstat-row"><span>CO₂-экв</span><span>${ECO_FACTORS[m.id]!=null?ECO_FACTORS[m.id]+' кг/кг':'—'}</span></div>
      ${PRINTABLE_IDS.has(m.id)?'<div class="mat-badge">🖨 подходит для 3D-печати</div>':''}`;
    div.addEventListener('click',()=>{
      state.matId=m.id;
      renderStepMaterial(el); updateSideSummary(); updateSidePreview();
      setTimeout(()=>goStep(3),160);
    });
    grid.appendChild(div);
  });
  document.getElementById('back1').addEventListener('click',()=>goStep(1));
}

function renderStepParams(el){
  const part=getPart();
  el.innerHTML=`
    <div class="panel-title">Параметры — ${part.name.toLowerCase()}</div>
    <div class="panel-sub">Задайте размеры и нагрузку. Значения пересчитываются сразу.</div>
    <div class="field-grid" id="field-grid"></div>
    <div class="step-actions">
      <button class="btn btn-ghost btn-small" id="back2">← Назад</button>
      <button class="btn btn-primary btn-small" id="next3">Рассчитать →</button>
    </div>
  `;
  const grid=document.getElementById('field-grid');
  part.fields.forEach(f=>{
    const wrap=document.createElement('div');
    wrap.className='field field-slider';
    wrap.innerHTML=`<label>${f.label} <span class="unit">${f.unit}</span></label>
      <div class="field-slider-row">
        <input type="range" min="${f.min}" max="${f.max}" step="${f.step}" value="${state.params[f.id]}" data-slider="${f.id}">
        <input type="number" min="${f.min}" max="${f.max}" step="${f.step}" value="${state.params[f.id]}" data-field="${f.id}">
      </div>`;
    grid.appendChild(wrap);
  });
  grid.querySelectorAll('input[data-field]').forEach(inp=>{
    inp.addEventListener('input',()=>{
      const v=parseFloat(inp.value);
      state.params[inp.dataset.field]=isNaN(v)?0:v;
      const sib=grid.querySelector(`input[data-slider="${inp.dataset.field}"]`);
      if(sib) sib.value=inp.value;
      updateSideSummary(); updateSidePreview();
    });
  });
  grid.querySelectorAll('input[data-slider]').forEach(inp=>{
    inp.addEventListener('input',()=>{
      const v=parseFloat(inp.value);
      state.params[inp.dataset.slider]=isNaN(v)?0:v;
      const sib=grid.querySelector(`input[data-field="${inp.dataset.slider}"]`);
      if(sib) sib.value=inp.value;
      updateSideSummary(); updateSidePreview();
    });
  });
  document.getElementById('back2').addEventListener('click',()=>goStep(2));
  document.getElementById('next3').addEventListener('click',()=>goStep(4));
  updateSideSummary(); updateSidePreview();
}
function computeAll(){
  const part=getPart(), mat=getMat();
  if(!part||!mat) return null;
  const p=state.params;
  const volume=part.volume(p);
  const mass=volume*mat.density;
  const qty=p.qty && p.qty>0 ? p.qty : 1;
  const baseCost=mass*mat.price;
  const factor=MACHINING[part.id]||1.2;
  const cost=baseCost*factor;
  const checks=part.checks(p,mat);
  let safetyFactor=null;
  if(typeof part.safety==='function'){
    try{ const s=part.safety(p,mat); safetyFactor=isFinite(s)?s:null; }catch(e){ safetyFactor=null; }
  }
  const manufTime=estimateManufTime(part,mass);
  return {part,mat,volume,mass,cost,factor,checks,safetyFactor,manufTime};
}

/* ============================================================
   SVG CHARTS (без внешних библиотек)
   ============================================================ */
function chartTicks(min,max,count){
  const ticks=[];
  if(!isFinite(max)||max<=min) max=min+1;
  for(let i=0;i<=count;i++){
    const v=min+(max-min)*i/count;
    const d = v<1 ? 3 : (v<10 ? 2 : (v<100?1:0));
    ticks.push(+v.toFixed(d));
  }
  return Array.from(new Set(ticks));
}
function buildChartSVG(opts){
  const width=opts.width||520, height=opts.height||260;
  const padL=54,padR=16,padT=16,padB=38;
  const w=width-padL-padR, h=height-padT-padB;
  const x0=opts.xDomain[0], x1=opts.xDomain[1];
  const y0=opts.yDomain[0], y1=opts.yDomain[1];
  const X=v=> padL + (v-x0)/((x1-x0)||1)*w;
  const Y=v=> padT + h - (v-y0)/((y1-y0)||1)*h;
  let svg=`<svg viewBox="0 0 ${width} ${height}" class="hchart-svg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">`;
  svg+=`<rect x="${padL}" y="${padT}" width="${w}" height="${h}" class="grid-rect"/>`;
  (opts.yTicks||[]).forEach(t=>{
    const y=Y(t);
    svg+=`<line x1="${padL}" y1="${y.toFixed(1)}" x2="${padL+w}" y2="${y.toFixed(1)}" class="grid-line"/>`;
    svg+=`<text x="${padL-8}" y="${(y+3).toFixed(1)}" text-anchor="end" class="hchart-tick">${t}</text>`;
  });
  (opts.xTicks||[]).forEach((xv,i)=>{
    const x=X(xv);
    svg+=`<line x1="${x.toFixed(1)}" y1="${padT+h}" x2="${x.toFixed(1)}" y2="${padT+h+4}" class="hchart-axisline"/>`;
    const lbl=(opts.xTickLabels&&opts.xTickLabels[i]!=null)?opts.xTickLabels[i]:xv;
    svg+=`<text x="${x.toFixed(1)}" y="${padT+h+16}" text-anchor="middle" class="hchart-tick">${lbl}</text>`;
  });
  if(opts.criticalX!=null){
    const cx=X(opts.criticalX);
    svg+=`<line x1="${cx.toFixed(1)}" y1="${padT}" x2="${cx.toFixed(1)}" y2="${padT+h}" class="hchart-critical-line"/>`;
    if(opts.criticalLabel) svg+=`<text x="${(cx+5).toFixed(1)}" y="${padT+12}" class="hchart-critical-label">${opts.criticalLabel}</text>`;
  }
  (opts.series||[]).forEach(s=>{
    if(!s.points || !s.points.length) return;
    if(opts.mode!=='scatter' && s.points.length>1){
      const pts=s.points.map(p=>`${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ');
      svg+=`<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>`;
    }
    s.points.forEach(p=>{
      const cx=X(p.x).toFixed(1), cy=Y(p.y).toFixed(1);
      svg+=`<circle cx="${cx}" cy="${cy}" r="${opts.mode==='scatter'?6:3.6}" fill="${s.color}"/>`;
      if(p.label) svg+=`<text x="${cx}" y="${(+cy-11).toFixed(1)}" text-anchor="middle" class="hchart-point-label">${p.label}</text>`;
    });
  });
  if(opts.xTitle) svg+=`<text x="${padL+w/2}" y="${height-4}" text-anchor="middle" class="hchart-axis-title">${opts.xTitle}</text>`;
  if(opts.yTitle) svg+=`<text x="13" y="${padT+h/2}" text-anchor="middle" class="hchart-axis-title" transform="rotate(-90 13 ${padT+h/2})">${opts.yTitle}</text>`;
  svg+='</svg>';
  return svg;
}
function buildChartLegend(series){
  return `<div class="hchart-legend">${series.map(s=>`<span class="hchart-leg-item"><i style="background:${s.color}"></i>${s.label}</span>`).join('')}</div>`;
}

/* ============================================================
   3D-ЭСКИЗЫ (offscreen-рендер для миниатюр в спецификации и сравнении)
   ============================================================ */
let thumbRenderer=null, thumbScene=null, thumbCamera=null;
function ensureThumbRenderer(){
  if(thumbRenderer) return;
  const canvas=document.createElement('canvas');
  thumbRenderer=new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, preserveDrawingBuffer:true});
  thumbRenderer.setSize(240,170,false);
  thumbScene=new THREE.Scene();
  thumbCamera=new THREE.PerspectiveCamera(42,240/170,0.1,50);
  thumbCamera.position.set(1.7,1.25,2.3);
  thumbCamera.lookAt(0,0,0);
  thumbScene.add(new THREE.HemisphereLight(0xbfe9ff,0x0a1220,1.0));
  const dl=new THREE.DirectionalLight(0xffffff,1.2); dl.position.set(3,4,2); thumbScene.add(dl);
  const dl2=new THREE.DirectionalLight(0x5EEAD4,0.4); dl2.position.set(-2,-1,-2); thumbScene.add(dl2);
}
const thumbCache={};
function getPartThumb(partId, matId, params){
  const key=partId+'|'+matId+'|'+JSON.stringify(params);
  if(thumbCache[key]) return thumbCache[key];
  try{
    ensureThumbRenderer();
    const part=PARTS.find(p=>p.id===partId);
    const mat=MATERIALS.find(m=>m.id===matId);
    if(!part||!mat) return '';
    while(thumbScene.children.length>3) thumbScene.remove(thumbScene.children[3]);
    const mesh=part.mesh(params, {mat:materialFor(mat)});
    mesh.rotation.y=Math.PI/6;
    thumbScene.add(mesh);
    thumbRenderer.render(thumbScene, thumbCamera);
    const url=thumbRenderer.domElement.toDataURL('image/png');
    thumbScene.remove(mesh);
    thumbCache[key]=url;
    return url;
  }catch(e){ return ''; }
}

function renderOptimizerBlock(part){
  const dimLabels = part.optFields.map(id=>part.fields.find(f=>f.id===id).label.toLowerCase()).join(', ');
  const kgField = part.loadFieldKg ? `
    <div class="field opt-kg-field">
      <label>Нужно выдержать нагрузку <span class="unit">кг</span></label>
      <input type="number" min="0" step="0.1" id="opt-kg" value="${fmt((state.params[part.loadField]||0)/9.80665,2)}">
    </div>` : '';
  return `
    <div class="panel-title sm">Оптимизация конструкции</div>
    <div class="opt-box" id="opt-box">
      <p class="opt-desc">Система переберёт варианты размеров (${dimLabels}) в допустимом диапазоне и найдёт самый лёгкий вариант, который проходит все инженерные проверки.</p>
      ${kgField}
      <button class="btn btn-primary btn-small" id="runOpt">⚙ Найти оптимальный вариант</button>
      <div id="opt-progress" class="opt-progress" style="display:none;"></div>
      <div id="opt-result"></div>
    </div>
  `;
}

function runOptimizerUI(){
  const part=getPart(), mat=getMat();
  if(!part||!mat) return;
  const btn=document.getElementById('runOpt');
  const progressEl=document.getElementById('opt-progress');
  const resultEl=document.getElementById('opt-result');
  if(!btn||!progressEl||!resultEl) return;
  resultEl.innerHTML='';
  btn.disabled=true;

  let targetKg=null;
  if(part.loadFieldKg){
    const kgInput=document.getElementById('opt-kg');
    const v=parseFloat(kgInput.value);
    if(!isNaN(v) && v>=0) targetKg=v;
  }

  const baseParams=Object.assign({}, state.params);
  let baseMass=null;
  try{ baseMass=part.volume(baseParams)*mat.density; }catch(e){ baseMass=null; }

  const res=optimizePart(part, mat, baseParams, targetKg);
  progressEl.style.display='block';
  const total=res.combosTried||1;
  const dur=650;
  const t0=performance.now();

  function step(ts){
    const prog=Math.min(1,(ts-t0)/dur);
    const shown=Math.floor(total*prog);
    progressEl.textContent=`Перебираем варианты размеров… ${shown} / ${total}`;
    if(prog<1){ requestAnimationFrame(step); } else { finish(); }
  }
  requestAnimationFrame(step);

  function finish(){
    progressEl.textContent=`Перебрано вариантов: ${total}`;
    btn.disabled=false;
    if(!res.best){
      resultEl.innerHTML=`<div class="opt-banner warn">Не удалось найти вариант без нарушений проверок в текущих диапазонах размеров. Попробуйте увеличить допустимые размеры, снизить требуемый запас прочности или уменьшить нагрузку.</div>`;
      return;
    }
    const reduction = baseMass ? Math.max(0,(1-res.best.mass/baseMass)*100) : 0;
    let rowsHtml = part.optFields.map(id=>{
      const f=part.fields.find(ff=>ff.id===id);
      return `<tr><td>${f.label}</td><td>${fmt(baseParams[id],2)} ${f.unit}</td><td>${fmt(res.best.params[id],2)} ${f.unit}</td></tr>`;
    }).join('');
    if(targetKg!=null){
      const lf=part.fields.find(f=>f.id===part.loadField);
      rowsHtml += `<tr><td>${lf.label}</td><td>${fmt(baseParams[part.loadField]||0,1)} Н</td><td>${fmt(res.best.params[part.loadField],1)} Н</td></tr>`;
    }
    resultEl.innerHTML=`
      <div class="opt-banner ok">Оптимальный вариант найден. Масса снижена на ${reduction.toFixed(0)}% относительно исходной конструкции.</div>
      <table class="opt-compare">
        <thead><tr><th></th><th>Было</th><th>Стало</th></tr></thead>
        <tbody>
          <tr><td>Масса</td><td>${fmt(baseMass||0,3)} кг</td><td>${fmt(res.best.mass,3)} кг</td></tr>
          ${rowsHtml}
        </tbody>
      </table>
      <button class="btn btn-ghost btn-small" id="applyOpt">Применить оптимальные размеры →</button>
    `;
    const applyBtn=document.getElementById('applyOpt');
    if(applyBtn) applyBtn.addEventListener('click', ()=>{
      Object.assign(state.params, res.best.params);
      toast('Оптимальные размеры применены');
      renderMain();
    });
  }
}

/* ============================================================
   ОПТИМИЗАЦИЯ ПО СТОИМОСТИ (перебор материала + размеров)
   ============================================================ */
function findCheapestCombo(part, baseParams, targetKg){
  const candidates=[];
  MATERIALS.forEach(mat=>{
    const res=optimizePart(part, mat, baseParams, targetKg);
    if(res.best){
      const factor=MACHINING[part.id]||1.2;
      const cost=res.best.mass*mat.price*factor;
      candidates.push({mat, mass:res.best.mass, cost, params:res.best.params});
    }
  });
  candidates.sort((a,b)=>a.cost-b.cost);
  return candidates.slice(0,3);
}
function renderCostOptimizerBlock(){
  return `
    <div class="panel-title sm">Оптимизация по стоимости</div>
    <div class="opt-box" id="cost-opt-box">
      <p class="opt-desc">Перебирает не только размеры, но и материал — ищет не самую лёгкую, а самую дешёвую конструкцию, проходящую все проверки.</p>
      <button class="btn btn-primary btn-small" id="runCostOpt">💰 Найти самый дешёвый вариант</button>
      <div id="cost-opt-result"></div>
    </div>`;
}
function runCostOptimizerUI(){
  const part=getPart();
  if(!part || !part.optFields || !part.optFields.length) return;
  const btn=document.getElementById('runCostOpt');
  const resultEl=document.getElementById('cost-opt-result');
  btn.disabled=true; resultEl.innerHTML='Перебираем материалы и размеры…';
  let targetKg=null;
  if(part.loadFieldKg) targetKg=(state.params[part.loadField]||0)/9.80665;
  setTimeout(()=>{
    const top=findCheapestCombo(part, state.params, targetKg);
    btn.disabled=false;
    if(!top.length){ resultEl.innerHTML='<div class="opt-banner warn">Подходящих вариантов не найдено.</div>'; return; }
    resultEl.innerHTML='<table class="opt-compare"><thead><tr><th>Материал</th><th>Масса</th><th>Стоимость</th></tr></thead><tbody>'+
      top.map((c,i)=>`<tr><td>${i+1}. ${c.mat.name}</td><td>${fmt(c.mass,3)} кг</td><td>${fmt(c.cost,0)} ₽</td></tr>`).join('')+
      '</tbody></table><button class="btn btn-ghost btn-small" id="applyCostOpt">Применить самый дешёвый вариант →</button>';
    document.getElementById('applyCostOpt').addEventListener('click',()=>{
      state.matId=top[0].mat.id; Object.assign(state.params, top[0].params);
      toast('Материал и размеры обновлены'); renderMain();
    });
  }, 350);
}

/* ============================================================
   СЛАБОЕ МЕСТО КОНСТРУКЦИИ
   ============================================================ */
function renderWeakPointBlock(r){
  const bad=r.checks.filter(c=>c.status!=='pass');
  const weak = bad.length ? bad[0] : r.checks[0];
  if(!weak) return '';
  const sf=r.safetyFactor;
  const sfTxt = (sf!=null && isFinite(sf)) ? `Запас прочности по всей конструкции ≈ ${fmt(sf,2)}×. ` : '';
  return `<div class="weak-box ${bad.length?'warn':'ok'}">
    <div class="weak-head">🔍 ${bad.length?'Слабое место конструкции':'Все проверки в запасе — явного слабого места нет'}</div>
    <div class="weak-body"><b>${weak.label}</b><span>${weak.detail}</span></div>
    <p class="weak-note">${sfTxt}При дальнейшем росте нагрузки эта проверка, скорее всего, станет критической первой.</p>
  </div>`;
}

/* ============================================================
   РЕЙТИНГ КОНСТРУКЦИИ
   ============================================================ */
function renderRatingBadge(r){
  const nField=r.part.fields.find(f=>f.id==='n');
  const rating=ratePart(r, nField ? state.params.n : 1.5);
  return `<div class="rating-badge grade-${rating.grade}">
    <div class="rating-grade">${rating.grade}</div>
    <div class="rating-info"><b>${rating.score} / 100</b><span>инженерный рейтинг конструкции</span></div>
  </div>`;
}

/* ============================================================
   РАСХОД МАТЕРИАЛА И ВРЕМЯ 3D-ПЕЧАТИ
   ============================================================ */
function renderPrintBlock(r){
  if(!PRINTABLE_IDS.has(r.mat.id)) return '';
  const est=printEstimate(r.mass, r.mat.density);
  return `<div class="print-box">
    <div class="panel-title sm">📦 Расход при 3D-печати</div>
    <div class="res-grid">
      <div class="res-card"><span>Расход пластика</span><b>${fmt(est.massG,0)} <small>г</small></b></div>
      <div class="res-card"><span>Длина филамента</span><b>${fmt(est.lengthM,1)} <small>м</small></b></div>
      <div class="res-card"><span>Время печати</span><b>${fmt(est.timeH,1)} <small>ч</small></b></div>
      <div class="res-card"><span>Электричество</span><b>${fmt(est.elecCost,0)} <small>₽</small></b></div>
    </div>
    <p class="panel-note">Ориентировочно, филамент ⌀1.75 мм, принтер ~150 Вт — реальные значения зависят от настроек печати.</p>
  </div>`;
}

/* ============================================================
   ЧТО БУДЕТ, ЕСЛИ…?
   ============================================================ */
function renderWhatIfBlock(){
  return `<div class="whatif-box">
    <div class="panel-title sm">🤖 Что будет, если…?</div>
    <div class="whatif-btns">
      <button class="btn btn-ghost btn-small" data-wi="load2x">…нагрузку × 2?</button>
      <button class="btn btn-ghost btn-small" data-wi="dim110">…увеличить основной размер на 10%?</button>
      <button class="btn btn-ghost btn-small" data-wi="cheaper">…материал на 20% дешевле?</button>
    </div>
    <div id="whatif-result"></div>
  </div>`;
}
function runWhatIf(kind){
  const part=getPart(), mat=getMat();
  const before=computeAll();
  if(!before) return;
  const params=Object.assign({}, state.params);
  let note='';
  if(kind==='load2x' && part.loadField){ params[part.loadField]=(params[part.loadField]||0)*2; note='нагрузка увеличена в 2 раза'; }
  else if(kind==='dim110' && part.optFields && part.optFields.length){ const id=part.optFields[0]; params[id]=(params[id]||0)*1.1; note=idLabel(part,id)+' увеличен на 10%'; }
  else if(kind==='cheaper'){ note='цена материала снижена на 20% (гипотетически)'; }
  let checks, vol, mass, cost;
  try{ vol=part.volume(params); mass=vol*mat.density; checks=part.checks(params,mat); }catch(e){ return; }
  const factor=MACHINING[part.id]||1.2;
  const priceUsed = kind==='cheaper' ? mat.price*0.8 : mat.price;
  cost=mass*priceUsed*factor;
  const fails=checks.some(c=>c.status==='fail');
  const resEl=document.getElementById('whatif-result');
  resEl.innerHTML=`<div class="opt-banner ${fails?'warn':'ok'}">Если ${note}: масса ${fmt(mass,3)} кг (было ${fmt(before.mass,3)}), стоимость ${fmt(cost,0)} ₽ (было ${fmt(before.cost,0)}).${fails?' ⚠ Появляется непройденная проверка.':' Все проверки по-прежнему пройдены.'}</div>`;
}

/* ============================================================
   ЧЕРТЁЖ
   ============================================================ */
function renderDrawingBlock(r){
  return `<div class="dwg-box">
    <div class="panel-title sm">📐 Чертёж</div>
    <button class="btn btn-ghost btn-small" id="toggleDwg">Показать / скрыть эскиз</button>
    <div id="dwg-holder" style="display:none;"></div>
  </div>`;
}
function initDrawingBlock(r){
  const btn=document.getElementById('toggleDwg');
  const holder=document.getElementById('dwg-holder');
  if(!btn) return;
  let built=false;
  btn.addEventListener('click',()=>{
    const show=holder.style.display==='none';
    holder.style.display=show?'block':'none';
    if(show && !built){
      const svg=buildDrawingSVG(r.part, state.params, fmt);
      holder.innerHTML=svg+`<div><button class="btn btn-ghost btn-small" id="dlDwg">Скачать SVG ↓</button></div>`;
      built=true;
      document.getElementById('dlDwg').addEventListener('click',()=>{
        const blob=new Blob([svg],{type:'image/svg+xml'});
        const url=URL.createObjectURL(blob);
        const a=document.createElement('a'); a.href=url; a.download='chertezh-'+r.part.id+'.svg'; a.click();
        URL.revokeObjectURL(url);
      });
    }
  });
}

/* ============================================================
   РЕАЛЬНЫЙ ЭКСПЕРИМЕНТ vs РАСЧЁТ
   ============================================================ */
function renderRealExperimentBlock(r){
  if(r.safetyFactor==null || !isFinite(r.safetyFactor)) return '';
  const predictedStress=r.mat.yield/r.safetyFactor;
  return `<div class="realexp-box">
    <div class="panel-title sm">🧪 Реальный эксперимент vs расчёт</div>
    <p class="panel-sub">Расчётное напряжение в самом нагруженном сечении ≈ ${fmt(predictedStress,1)} МПа. Введите измеренное значение, чтобы оценить погрешность модели.</p>
    <div class="field"><label>Измеренное напряжение <span class="unit">МПа</span></label>
      <input type="number" step="0.1" id="realexp-input" placeholder="например, ${fmt(predictedStress*1.1,0)}"></div>
    <button class="btn btn-ghost btn-small" id="realexp-run">Сравнить</button>
    <div id="realexp-result"></div>
  </div>`;
}
function runRealExperiment(predictedStress){
  const input=document.getElementById('realexp-input');
  const v=parseFloat(input.value);
  const resEl=document.getElementById('realexp-result');
  if(isNaN(v)||v<=0){ resEl.innerHTML='<div class="opt-banner warn">Введите измеренное значение напряжения.</div>'; return; }
  const err=Math.abs(v-predictedStress)/predictedStress*100;
  let causes=[];
  if(err<10) causes=['Расхождение в пределах обычной погрешности — модель хорошо описывает деталь.'];
  else if(err<30) causes=['Упрощённые формулы сопромата не учитывают все концентраторы напряжений',
    'Реальные свойства материала партии могут отличаться от табличных','Погрешность измерительного оборудования'];
  else causes=['Неверно заданы свойства материала или геометрия','Существенное упрощение расчётной модели (не учтены отверстия, сварные швы, концентраторы)',
    'Ошибка в постановке эксперимента или единицах измерения','Реальная нагрузка отличается от расчётной'];
  resEl.innerHTML=`<div class="opt-banner ${err<10?'ok':'warn'}">Погрешность ≈ ${fmt(err,1)}%.</div>
    <div class="panel-note"><b>Возможные причины расхождения:</b><ul>${causes.map(c=>'<li>'+c+'</li>').join('')}</ul></div>`;
}

/* ============================================================
   КОМАНДНЫЙ РЕЖИМ И QR-КОД ПРОЕКТА
   ============================================================ */
function renderShareBlock(r){
  const shareStr=encodeShareParams(r.part.id, r.mat.id, state.params);
  const url=location.origin+location.pathname+'#share='+shareStr;
  return `<div class="share-box">
    <div class="panel-title sm">👥 Поделиться проектом · QR-код</div>
    <p class="panel-sub">Отправьте ссылку или QR-код коллеге — он откроет деталь в режиме просмотра и сможет оставить комментарий.</p>
    <div class="share-row">
      <div id="share-qr"></div>
      <div class="share-controls">
        <input type="text" id="share-url" readonly value="${url}">
        <button class="btn btn-ghost btn-small" id="copyShare">Скопировать ссылку</button>
      </div>
    </div>
  </div>`;
}
function initShareBlock(r){
  const holder=document.getElementById('share-qr');
  const urlInput=document.getElementById('share-url');
  if(!holder||!urlInput) return;
  const svg=QR.toSVG(urlInput.value,{moduleSize:4});
  holder.innerHTML=svg || '<span class="panel-note">Ссылка слишком длинная для QR-кода, воспользуйтесь копированием.</span>';
  document.getElementById('copyShare').addEventListener('click',()=>{
    navigator.clipboard.writeText(urlInput.value).then(()=>toast('Ссылка скопирована')).catch(()=>{ urlInput.select(); toast('Выделите и скопируйте ссылку'); });
  });
}
function checkIncomingShare(){
  const h=location.hash;
  if(!h.startsWith('#share=')) return;
  const shared=decodeShareParams(h.slice(7));
  if(!shared) return;
  const part=PARTS.find(p=>p.id===shared.partId), mat=MATERIALS.find(m=>m.id===shared.matId);
  if(!part||!mat) return;
  state.partId=part.id; state.matId=mat.id; state.params=Object.assign({}, shared.params);
  state.reviewMode=true;
  goStep(4);
  setTimeout(()=>{
    const el=document.getElementById('app-main');
    if(!el) return;
    const banner=document.createElement('div');
    banner.className='review-banner';
    banner.innerHTML=`<b>👥 Режим проверки</b> — вам прислали эту деталь на просмотр.
      <textarea id="review-comment" placeholder="Ваш комментарий по конструкции…"></textarea>
      <button class="btn btn-ghost btn-small" id="copyReview">Скопировать комментарий для отправки</button>`;
    el.prepend(banner);
    document.getElementById('copyReview').addEventListener('click',()=>{
      const txt=document.getElementById('review-comment').value.trim();
      if(!txt){ toast('Напишите комментарий'); return; }
      navigator.clipboard.writeText('Комментарий по детали «'+part.name+'»: '+txt).then(()=>toast('Комментарий скопирован — отправьте его автору проекта'));
    });
  },50);
}

/* ============================================================
   ВИРТУАЛЬНЫЙ ЭКСПЕРИМЕНТ
   Пошагово увеличиваем нагрузку 1..6 кг, показываем деформацию
   и визуально «подсвечиваем» критический режим на 3D-модели.
   ============================================================ */
function renderVirtualExperimentBlock(){
  const loads=[1,2,3,4,5,6];
  const btns=loads.map(kg=>`<button class="ve-load-btn" data-kg="${kg}">${kg} кг</button>`).join('');
  const realInputs=loads.map(kg=>`
    <div class="ve-real-field">
      <label>${kg} кг</label>
      <input type="number" step="0.01" placeholder="мм" data-kg="${kg}" class="ve-real-input">
    </div>`).join('');
  return `
    <div class="panel-title sm">🧪 Виртуальный эксперимент</div>
    <div class="ve-box" id="ve-box">
      <p class="opt-desc">Постепенно увеличивайте нагрузку и смотрите на 3D-модели справа, как меняется деформация и запас прочности — вплоть до критического режима. Затем впишите значения, измеренные в реальном эксперименте, чтобы сравнить их с расчётом.</p>
      <div class="ve-loads" id="ve-loads">${btns}</div>
      <div class="ve-readout" id="ve-readout">
        <div class="ve-readout-row"><span>Нагрузка</span><b id="ve-f">—</b></div>
        <div class="ve-readout-row"><span>Деформация (расчёт)</span><b id="ve-defl">—</b></div>
        <div class="ve-readout-row"><span>Напряжение / % от предела текучести</span><b id="ve-sigma">—</b></div>
      </div>
      <div class="ve-bar-wrap"><div class="ve-bar" id="ve-bar"></div></div>
      <div class="ve-status" id="ve-status">Нажмите на нагрузку, чтобы запустить эксперимент</div>
      <div class="panel-title sm ve-sub-title">Сравнение с реальным экспериментом</div>
      <p class="opt-desc">Впишите деформацию, измеренную на реальном образце для тех же нагрузок, мм (можно заполнить не все точки).</p>
      <div class="ve-real-inputs" id="ve-real-inputs">${realInputs}</div>
      <button class="btn btn-primary btn-small" id="veChartBtn">📈 Построить график «нагрузка → деформация»</button>
      <div id="ve-chart-wrap" class="ve-chart-wrap"></div>
    </div>
  `;
}
function initVirtualExperiment(part, mat, params){
  const box=document.getElementById('ve-box');
  if(!box) return;
  const veData={virtual:{}, real:{}};
  const loadBtns=Array.from(box.querySelectorAll('.ve-load-btn'));
  loadBtns.forEach(btn=>{
    btn.addEventListener('click',()=>{
      loadBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      applyVirtualLoad(part, mat, params, +btn.dataset.kg, veData);
    });
  });
  box.querySelectorAll('.ve-real-input').forEach(inp=>{
    inp.addEventListener('input',()=>{
      const kg=+inp.dataset.kg, v=parseFloat(inp.value);
      if(!isNaN(v)) veData.real[kg]=v; else delete veData.real[kg];
    });
  });
  const chartBtn=document.getElementById('veChartBtn');
  if(chartBtn) chartBtn.addEventListener('click',()=>renderVeChart(part, mat, params, veData));
}
function applyVirtualLoad(part, mat, params, kg, veData){
  let res;
  try{ res=part.virtualTest(params, mat, kg); }catch(e){ return; }
  veData.virtual[kg]=res.deformation;
  const fEl=document.getElementById('ve-f'), dEl=document.getElementById('ve-defl'), sEl=document.getElementById('ve-sigma');
  if(fEl) fEl.textContent=fmt(res.F,1)+' Н ('+kg+' кг)';
  if(dEl) dEl.textContent=fmt(res.deformation, res.deformation<1?4:2)+' '+res.unit;
  if(sEl) sEl.textContent=fmt(res.sigma,1)+' МПа ('+fmt(Math.min(res.ratio,9.99)*100,0)+'%)';
  const bar=document.getElementById('ve-bar');
  if(bar){
    const pct=Math.min(res.ratio,1.3)/1.3*100;
    bar.style.width=Math.min(100,pct).toFixed(1)+'%';
    bar.className='ve-bar'+(res.critical?' critical':(res.ratio>0.75?' warn':''));
  }
  const statusEl=document.getElementById('ve-status');
  if(statusEl){
    if(res.critical){ statusEl.textContent='⚠ Критический режим — напряжение достигло предела текучести материала'; statusEl.className='ve-status critical'; }
    else if(res.ratio>0.75){ statusEl.textContent='Приближение к критическому режиму — запас прочности быстро уменьшается'; statusEl.className='ve-status warn'; }
    else { statusEl.textContent='Конструкция работает в безопасном режиме'; statusEl.className='ve-status ok'; }
  }
  applyVeVisualFeedback(res.ratio, res.critical, part);
}
function applyVeVisualFeedback(ratio, critical, part){
  if(!sideGroup) return;
  const t=Math.min(Math.max(ratio,0),1);
  const col=new THREE.Color();
  if(t<0.5) col.lerpColors(new THREE.Color(0x7FD9A6), new THREE.Color(0xF2B84B), t/0.5);
  else col.lerpColors(new THREE.Color(0xF2B84B), new THREE.Color(0xFF6B5E), (t-0.5)/0.5);
  sideGroup.traverse(obj=>{
    if(obj.isMesh && obj.material && obj.material.emissive){
      obj.material.emissive.copy(col);
      obj.material.emissiveIntensity=0.15+t*0.6;
    }
  });
  const bend=Math.min(ratio,1.3)*0.4;
  if(part.id==='beam'){
    sideGroup.children.forEach(c=>{ if(c.isMesh) c.position.y=-bend*0.45; });
    sideGroup.scale.y=1-bend*0.1;
  } else if(part.id==='column'){
    sideGroup.scale.y=1-bend*0.05;
  }
  sideGroup.userData.shake = critical ? performance.now() : 0;
}
function renderVeChart(part, mat, params, veData){
  const wrap=document.getElementById('ve-chart-wrap');
  if(!wrap) return;
  const loads=[1,2,3,4,5,6];
  const virtualPts=[]; let criticalKg=null;
  loads.forEach(kg=>{
    let res; try{ res=part.virtualTest(params, mat, kg); }catch(e){ return; }
    virtualPts.push({x:kg,y:res.deformation});
    if(criticalKg===null && res.critical) criticalKg=kg;
  });
  const realPts=loads.filter(kg=>veData.real[kg]!=null).map(kg=>({x:kg,y:veData.real[kg]}));
  const allY=virtualPts.map(p=>p.y).concat(realPts.map(p=>p.y)).concat([0.001]);
  const yMax=Math.max(...allY)*1.2;
  const series=[{label:'Расчёт (виртуальный эксперимент)', color:'#5EEAD4', points:virtualPts}];
  if(realPts.length) series.push({label:'Реальный эксперимент', color:'#FF9A45', points:realPts});
  const svg=buildChartSVG({
    width:520,height:260, series, xDomain:[0.5,6.5], yDomain:[0,yMax],
    xTicks:loads, xTickLabels:loads.map(k=>k+' кг'),
    yTicks:chartTicks(0,yMax,5),
    xTitle:'Нагрузка, кг', yTitle:'Деформация, мм',
    criticalX:criticalKg, criticalLabel:criticalKg?'Критический режим':null
  });
  wrap.innerHTML=`${svg}${buildChartLegend(series)}${criticalKg?`<div class="ve-critical-note">⚠ По расчёту критический режим наступает примерно при нагрузке ${criticalKg} кг — сравните с тем, при какой нагрузке реальный образец начал разрушаться или необратимо деформироваться.</div>`:`<div class="ve-critical-note ok">В пределах 1–6 кг критический режим по расчёту не наступает.</div>`}`;
}

function renderStepResults(el){
  const r=computeAll();
  if(!r){ el.innerHTML='<div class="panel-sub">Заполните параметры на предыдущем шаге.</div>'; return; }
  const allPass=r.checks.every(c=>c.status==='pass');
  const anyFail=r.checks.some(c=>c.status==='fail');
  el.innerHTML=`
    <div class="panel-title">Результат расчёта</div>
    <div class="panel-sub">${r.part.name} · ${r.mat.name}</div>

    <div class="res-grid">
      <div class="res-card"><span>Масса детали</span><b>${fmt(r.mass,r.mass<1?3:2)} <small>кг</small></b></div>
      <div class="res-card"><span>Стоимость материала</span><b>${fmt(r.mass*r.mat.price,0)} <small>₽</small></b></div>
      <div class="res-card"><span>Итоговая стоимость</span><b>${fmt(r.cost,0)} <small>₽</small></b></div>
    </div>
    ${renderRatingBadge(r)}

    <table class="dims-table">${r.part.dims(state.params).map(d=>`<tr><td>${d[0]}</td><td>${d[1]}</td></tr>`).join('')}
      <tr><td>Коэффициент изготовления</td><td>×${r.factor}</td></tr>
    </table>

    <div class="panel-title sm">Инженерные проверки</div>
    <div class="checks" id="checks-list"></div>
    ${renderWeakPointBlock(r)}

    ${allPass?`<div class="stamp-wrap"><div class="stamp">ДОПУЩЕНО К ИЗГОТОВЛЕНИЮ<small>все проверки пройдены</small></div></div>`:''}
    ${anyFail?`<div class="stamp-wrap"><div class="stamp fail">ТРЕБУЕТСЯ ПЕРЕСЧЁТ<small>есть непройденная проверка</small></div></div>`:''}

    ${r.part.optFields && r.part.optFields.length ? renderOptimizerBlock(r.part) : ''}
    ${r.part.optFields && r.part.optFields.length ? renderCostOptimizerBlock() : ''}

    ${(r.part.loadFieldKg && typeof r.part.virtualTest==='function') ? renderVirtualExperimentBlock() : ''}
    ${renderRealExperimentBlock(r)}
    ${renderPrintBlock(r)}
    ${renderWhatIfBlock()}
    ${renderDrawingBlock(r)}
    ${renderShareBlock(r)}

    <div class="step-actions">
      <button class="btn btn-ghost btn-small" id="back3">← Изменить параметры</button>
      <button class="btn btn-primary btn-small" id="addSpec">Добавить в спецификацию →</button>
    </div>
  `;
  if(r.part.optFields && r.part.optFields.length){
    const runBtn=document.getElementById('runOpt');
    if(runBtn) runBtn.addEventListener('click', runOptimizerUI);
    const runCostBtn=document.getElementById('runCostOpt');
    if(runCostBtn) runCostBtn.addEventListener('click', runCostOptimizerUI);
  }
  if(r.part.loadFieldKg && typeof r.part.virtualTest==='function'){
    initVirtualExperiment(r.part, r.mat, state.params);
  }
  const realExpBtn=document.getElementById('realexp-run');
  if(realExpBtn){
    const predictedStress=r.mat.yield/r.safetyFactor;
    realExpBtn.addEventListener('click',()=>runRealExperiment(predictedStress));
  }
  document.querySelectorAll('#app-main [data-wi]').forEach(b=>b.addEventListener('click',()=>runWhatIf(b.dataset.wi)));
  initDrawingBlock(r);
  initShareBlock(r);
  const list=document.getElementById('checks-list');
  const icons={pass:'<path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
    warn:'<path d="M12 9v4M12 17h.01M10.3 3.9L2.8 17.1a1.5 1.5 0 001.3 2.3h15.8a1.5 1.5 0 001.3-2.3L13.7 3.9a1.5 1.5 0 00-2.6 0z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    fail:'<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'};
  r.checks.forEach(c=>{
    const div=document.createElement('div');
    div.className='check-item '+c.status;
    div.innerHTML=`<svg class="check-icon" viewBox="0 0 24 24" fill="none">${icons[c.status]}</svg>
      <div class="check-text"><b>${c.label}</b><span>${c.detail}</span></div>`;
    list.appendChild(div);
  });
  document.getElementById('back3').addEventListener('click',()=>goStep(3));
  document.getElementById('addSpec').addEventListener('click',()=>{
    const checksPassed=r.checks.filter(c=>c.status==='pass').length;
    state.specList.push({
      part:r.part.name, mat:r.mat.name, mass:r.mass, unitCost:r.cost, qty:1,
      dims:r.part.dims(state.params).map(d=>d[1]).join(', '),
      partId:r.part.id, matId:r.mat.id, params:Object.assign({},state.params),
      safetyFactor:r.safetyFactor, manufTime:r.manufTime, volume:r.volume,
      checksPassed, checksTotal:r.checks.length
    });
    toast('Добавлено в спецификацию');
    goStep(5);
  });
  updateSideSummary(); updateSidePreview();
}

function renderStepSpec(el){
  el.innerHTML=`
    <div class="panel-title">Спецификация проекта</div>
    <div class="panel-sub">Список деталей с массой и стоимостью. Можно менять количество, продолжать добавлять — или сравнить несколько вариантов между собой.</div>
    <div id="spec-table-wrap"></div>
    <div class="step-actions">
      <div class="step-actions-left">
        <button class="btn btn-ghost btn-small" id="newPart">+ Добавить ещё деталь</button>
        <button class="btn btn-ghost btn-small" id="compareToggle">⇄ Сравнить конструкции</button>
        <button class="btn btn-ghost btn-small" id="saveProjectBtn">💾 Сохранить версию проекта</button>
      </div>
      <button class="btn btn-primary btn-small" id="exportCsv">Скачать CSV ↓</button>
    </div>
    <div id="compare-panel"></div>
    <div class="panel-title sm">📂 Сохранённые проекты и версии</div>
    <div id="projects-list"></div>
  `;
  state.compareMode=false;
  state.compareSelected=new Set();
  renderSpecTable();
  renderProjectsList();
  document.getElementById('newPart').addEventListener('click',()=>{
    state.partId=null; state.matId=null; state.params={};
    goStep(1);
  });
  document.getElementById('exportCsv').addEventListener('click', exportSpecCsv);
  document.getElementById('compareToggle').addEventListener('click',()=>{
    if(state.specList.length<2){ toast('Добавьте минимум 2 детали, чтобы сравнить'); return; }
    state.compareMode=!state.compareMode;
    if(!state.compareMode){ state.compareSelected.clear(); document.getElementById('compare-panel').innerHTML=''; }
    renderSpecTable();
  });
  document.getElementById('saveProjectBtn').addEventListener('click',()=>{
    if(!state.specList.length){ toast('Спецификация пуста — нечего сохранять'); return; }
    const name=prompt('Название версии', 'Версия '+(loadSavedProjects().length+1));
    if(name===null) return;
    saveProjectSnapshot(state.specList, name);
    toast('Проект сохранён');
    renderProjectsList();
  });
}
function renderProjectsList(){
  const wrap=document.getElementById('projects-list');
  if(!wrap) return;
  const list=loadSavedProjects().slice().reverse();
  if(!list.length){ wrap.innerHTML='<div class="spec-empty">Пока нет сохранённых версий проекта.</div>'; return; }
  wrap.innerHTML=list.map(p=>`
    <div class="project-row" data-id="${p.id}">
      <div class="project-info"><b>${p.name}</b><span>${new Date(p.ts).toLocaleString('ru-RU')} · ${p.count} дет. · ${fmt(p.totalMass,2)} кг · ${fmt(p.totalCost,0)} ₽</span></div>
      <div class="project-actions">
        <button class="btn btn-ghost btn-small" data-act="open">Открыть</button>
        <button class="btn btn-ghost btn-small" data-act="del">Удалить</button>
      </div>
    </div>`).join('');
  wrap.querySelectorAll('.project-row').forEach(row=>{
    const id=row.dataset.id;
    row.querySelector('[data-act="open"]').addEventListener('click',()=>{
      const p=loadSavedProjects().find(x=>x.id===id);
      if(!p) return;
      state.specList=JSON.parse(JSON.stringify(p.specList));
      toast('Проект «'+p.name+'» загружен');
      renderStepSpec(document.getElementById('app-main'));
    });
    row.querySelector('[data-act="del"]').addEventListener('click',()=>{
      deleteSavedProject(id);
      renderProjectsList();
    });
  });
}

function renderSpecTable(){
  const wrap=document.getElementById('spec-table-wrap');
  if(!wrap) return;
  if(state.specList.length===0){
    wrap.innerHTML=`<div class="spec-empty"><svg viewBox="0 0 24 24" fill="none"><path d="M6 3h9l5 5v13H6z" stroke="currentColor" stroke-width="1.4"/><path d="M9 12h6M9 16h6" stroke="currentColor" stroke-width="1.4"/></svg>Спецификация пуста — рассчитайте деталь и добавьте её сюда.</div>`;
    return;
  }
  const cmp=!!state.compareMode;
  let totalMass=0, totalCost=0;
  const rows=state.specList.map((s,i)=>{
    const qty=s.qty||1;
    totalMass+=s.mass*qty; totalCost+=s.unitCost*qty;
    const checked=state.compareSelected&&state.compareSelected.has(i)?'checked':'';
    const thumb=s.partId ? `<img class="spec-thumb" src="${getPartThumb(s.partId,s.matId,s.params)}" alt="">` : '';
    return `<tr>
      ${cmp?`<td class="num"><input type="checkbox" class="cmp-check" data-idx="${i}" ${checked}></td>`:''}
      <td>${thumb}</td>
      <td>${s.part}<br><span class="spec-dims-sub">${s.dims}</span></td>
      <td>${s.mat}</td>
      <td class="num"><input type="number" min="1" value="${qty}" data-idx="${i}" class="qty-input"></td>
      <td class="num">${fmt(s.mass,2)} кг</td>
      <td class="num">${fmt(s.mass*qty,2)} кг</td>
      <td class="num">${fmt(s.unitCost*qty,0)} ₽</td>
      <td class="num"><button class="rm-btn" data-idx="${i}" aria-label="Удалить">✕</button></td>
    </tr>`;
  }).join('');
  wrap.innerHTML=`<table class="spec-table">
    <thead><tr>${cmp?'<th></th>':''}<th></th><th>Деталь</th><th>Материал</th><th>Кол-во</th><th>Масса ед.</th><th>Масса всего</th><th>Стоимость</th><th></th></tr></thead>
    <tbody>${rows}
      <tr class="spec-total-row"><td colspan="${cmp?6:5}">Итого</td><td class="num">${fmt(totalMass,2)} кг</td><td class="num">${fmt(totalCost,0)} ₽</td><td></td></tr>
    </tbody>
  </table>`;
  wrap.querySelectorAll('.qty-input').forEach(inp=>{
    inp.addEventListener('input',()=>{
      const idx=+inp.dataset.idx; const v=parseInt(inp.value)||1;
      state.specList[idx].qty=v; renderSpecTable();
    });
  });
  wrap.querySelectorAll('.rm-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const idx=+btn.dataset.idx;
      state.specList.splice(idx,1);
      if(state.compareSelected){ state.compareSelected.delete(idx); }
      renderSpecTable();
      toast('Деталь удалена из спецификации');
    });
  });
  if(cmp){
    wrap.querySelectorAll('.cmp-check').forEach(cb=>{
      cb.addEventListener('change',()=>{
        const idx=+cb.dataset.idx;
        if(cb.checked){
          if(state.compareSelected.size>=4){ cb.checked=false; toast('Можно сравнить не более 4 конструкций одновременно'); return; }
          state.compareSelected.add(idx);
        } else state.compareSelected.delete(idx);
        renderCompareBar();
      });
    });
    renderCompareBar();
  }
}

/* ---------- сравнение нескольких конструкций ---------- */
function renderCompareBar(){
  const panel=document.getElementById('compare-panel');
  if(!panel) return;
  const n=state.compareSelected.size;
  panel.innerHTML=`<div class="cmp-bar">
    <span>Выбрано для сравнения: ${n} из 4 (нужно минимум 2)</span>
    <button class="btn btn-primary btn-small" id="showCompare" ${n<2?'disabled':''}>Сравнить →</button>
  </div>`;
  const btn=document.getElementById('showCompare');
  if(btn) btn.addEventListener('click', renderComparison);
}
function renderComparison(){
  const panel=document.getElementById('compare-panel');
  if(!panel) return;
  const idxs=Array.from(state.compareSelected);
  const items=idxs.map(i=>state.specList[i]);
  const colors=['#5EEAD4','#FF9A45','#8B7CF6','#7FD9A6'];
  const cards=items.map((it,i)=>{
    const thumb=it.partId ? getPartThumb(it.partId,it.matId,it.params) : '';
    const safety=it.safetyFactor!=null ? fmt(it.safetyFactor,2)+'×' : '—';
    const checks=it.checksTotal!=null ? `${it.checksPassed}/${it.checksTotal} пройдено` : '—';
    const consum=it.volume!=null ? fmt(it.volume*1e6,0)+' см³' : '—';
    return `<div class="cmp-card" style="border-top-color:${colors[i]}">
      <img class="cmp-thumb" src="${thumb}" alt="">
      <b>${it.part}</b><span class="cmp-mat">${it.mat}</span>
      <div class="cmp-row"><span>Масса</span><b>${fmt(it.mass,2)} кг</b></div>
      <div class="cmp-row"><span>Стоимость</span><b>${fmt(it.unitCost,0)} ₽</b></div>
      <div class="cmp-row"><span>Прочность</span><b>${checks}</b></div>
      <div class="cmp-row"><span>Расход материала</span><b>${consum}</b></div>
      <div class="cmp-row"><span>Время изготовления</span><b>${it.manufTime!=null?fmt(it.manufTime,1)+' ч':'—'}</b></div>
      <div class="cmp-row"><span>Коэфф. запаса</span><b>${safety}</b></div>
    </div>`;
  }).join('');
  const metricRows=[
    ['Масса, кг', items.map(it=>fmt(it.mass,2))],
    ['Стоимость, ₽', items.map(it=>fmt(it.unitCost,0))],
    ['Прочность (проверок пройдено)', items.map(it=>it.checksTotal!=null?`${it.checksPassed}/${it.checksTotal}`:'—')],
    ['Расход материала, см³', items.map(it=>it.volume!=null?fmt(it.volume*1e6,0):'—')],
    ['Время изготовления, ч', items.map(it=>it.manufTime!=null?fmt(it.manufTime,1):'—')],
    ['Коэффициент запаса', items.map(it=>it.safetyFactor!=null?fmt(it.safetyFactor,2)+'×':'—')],
  ].map(row=>`<tr><td>${row[0]}</td>${row[1].map(v=>`<td class="num">${v}</td>`).join('')}</tr>`).join('');
  const headerCols=items.map((it,i)=>`<th style="color:${colors[i]}">${it.part}<br><small>${it.mat}</small></th>`).join('');

  let chartHtml='';
  const withSafety=items.filter(it=>it.safetyFactor!=null);
  if(withSafety.length>=2){
    const maxX=Math.max(...items.map(it=>it.mass))*1.25||1;
    const maxY=Math.max(...items.map(it=>it.safetyFactor||0))*1.25||1;
    const series=items.map((it,i)=>({label:it.part+' #'+(i+1), color:colors[i],
      points: it.safetyFactor!=null ? [{x:it.mass,y:it.safetyFactor,label:'#'+(i+1)}] : []}));
    const svg=buildChartSVG({
      width:520,height:260,series,mode:'scatter',
      xDomain:[0,maxX], yDomain:[0,maxY],
      xTicks:chartTicks(0,maxX,4), xTickLabels:chartTicks(0,maxX,4).map(v=>fmt(v,1)),
      yTicks:chartTicks(0,maxY,4),
      xTitle:'Масса, кг', yTitle:'Коэффициент запаса прочности'
    });
    chartHtml=`<div class="panel-title sm">Масса ↔ прочность</div><div class="hchart-wrap">${svg}${buildChartLegend(series.filter(s=>s.points.length))}</div>`;
  }
  panel.insertAdjacentHTML('beforeend', `
    <div class="cmp-cards">${cards}</div>
    <div class="panel-title sm">Таблица сравнения</div>
    <table class="cmp-table"><thead><tr><th></th>${headerCols}</tr></thead><tbody>${metricRows}</tbody></table>
    ${chartHtml}
  `);
}

function exportSpecCsv(){
  if(state.specList.length===0){ toast('Спецификация пуста'); return; }
  let csv='№;Деталь;Материал;Размеры;Кол-во;Масса ед. (кг);Масса всего (кг);Стоимость (₽)\n';
  state.specList.forEach((s,i)=>{
    const qty=s.qty||1;
    csv+=`${i+1};${s.part};${s.mat};"${s.dims}";${qty};${s.mass.toFixed(2)};${(s.mass*qty).toFixed(2)};${(s.unitCost*qty).toFixed(0)}\n`;
  });
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download='specifikatsiya.csv';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  toast('Файл спецификации скачан');
}

/* ---------- side summary + live numbers ---------- */
function fmt(n,d){ return Number(n).toLocaleString('ru-RU',{minimumFractionDigits:d,maximumFractionDigits:d}); }

function updateSideSummary(){
  const sum=document.getElementById('side-summary');
  const live=document.getElementById('side-live');
  const part=getPart(), mat=getMat();
  let rows='';
  rows+=`<div class="sum-row"><span>Деталь</span><span>${part?part.name:'—'}</span></div>`;
  rows+=`<div class="sum-row"><span>Материал</span><span>${mat?mat.name:'—'}</span></div>`;
  if(part){
    part.fields.slice(0,3).forEach(f=>{
      rows+=`<div class="sum-row"><span>${f.label}</span><span>${state.params[f.id]??f.def} ${f.unit}</span></div>`;
    });
  }
  sum.innerHTML=rows;
  const r=computeAll();
  if(r){
    live.innerHTML=`<span>Текущая стоимость</span><b>${fmt(r.cost,0)} ₽</b>`;
  } else {
    live.innerHTML=`<span>Текущая стоимость</span><b>—</b>`;
  }
}

/* ============================================================
   INIT
   ============================================================ */
renderWizard();
renderMain();
initSidePreview();
animate();
window.addEventListener('resize', resizeSidePreview);
checkIncomingShare();

/* reveal on scroll */
const revealEls=document.querySelectorAll('.reveal');
const io=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
},{threshold:.12});
revealEls.forEach(e=>io.observe(e));
