/* ============================================================
   Hansler — features.js
   Общие утилиты для новых возможностей: QR-коды, экологичность,
   рейтинг конструкции, автоматический чертёж, сохранение проектов.
   Не зависит от конкретной страницы — используется из proekt.js.
   ============================================================ */

/* ------------------------------------------------------------
   QR-КОД (собственная реализация ISO/IEC 18004, byte-mode,
   уровень коррекции L, версии 1–5, без внешних библиотек)
   ------------------------------------------------------------ */
const QR = (function(){
  const GF_EXP=new Array(512), GF_LOG=new Array(256);
  (function initGF(){
    let x=1;
    for(let i=0;i<255;i++){ GF_EXP[i]=x; GF_LOG[x]=i; x<<=1; if(x&0x100) x^=0x11D; }
    for(let i=255;i<512;i++) GF_EXP[i]=GF_EXP[i-255];
  })();
  function gfMul(a,b){ if(a===0||b===0) return 0; return GF_EXP[GF_LOG[a]+GF_LOG[b]]; }
  function rsGenPoly(degree){
    let poly=[1];
    for(let i=0;i<degree;i++){
      const factor=[1,GF_EXP[i]];
      const res=new Array(poly.length+factor.length-1).fill(0);
      for(let a=0;a<poly.length;a++) for(let b=0;b<factor.length;b++) res[a+b]^=gfMul(poly[a],factor[b]);
      poly=res;
    }
    return poly;
  }
  function rsEncode(dataCw,ecLen){
    const gen=rsGenPoly(ecLen);
    const buf=dataCw.concat(new Array(ecLen).fill(0));
    for(let i=0;i<dataCw.length;i++){
      const factor=buf[i];
      if(factor===0) continue;
      for(let j=0;j<gen.length;j++) buf[i+j]^=gfMul(gen[j],factor);
    }
    return buf.slice(dataCw.length);
  }
  const VERSIONS={
    1:{size:21,dataCw:19,ecCw:7, align:[]},
    2:{size:25,dataCw:34,ecCw:10,align:[6,18]},
    3:{size:29,dataCw:55,ecCw:15,align:[6,22]},
    4:{size:33,dataCw:80,ecCw:20,align:[6,26]},
    5:{size:37,dataCw:108,ecCw:26,align:[6,30]},
  };
  function chooseVersion(byteLen){
    for(const v of [1,2,3,4,5]){ if(byteLen<=VERSIONS[v].dataCw-2) return v; }
    return null;
  }
  function buildBitStream(bytes,version){
    const bits=[];
    const push=(val,len)=>{ for(let i=len-1;i>=0;i--) bits.push((val>>i)&1); };
    push(0b0100,4); push(bytes.length,8);
    for(const b of bytes) push(b,8);
    const capacityBits=VERSIONS[version].dataCw*8;
    for(let i=0;i<4 && bits.length<capacityBits;i++) bits.push(0);
    while(bits.length%8!==0) bits.push(0);
    const padBytes=[0xEC,0x11]; let pi=0;
    while(bits.length<capacityBits){ push(padBytes[pi%2],8); pi++; }
    return bits;
  }
  function bitsToBytes(bits){
    const out=[];
    for(let i=0;i<bits.length;i+=8){ let v=0; for(let j=0;j<8;j++) v=(v<<1)|(bits[i+j]||0); out.push(v); }
    return out;
  }
  function makeMatrix(version){
    const size=VERSIONS[version].size;
    const mat=Array.from({length:size},()=>new Array(size).fill(null));
    const reserved=Array.from({length:size},()=>new Array(size).fill(false));
    function setr(r,c,val){ if(r<0||c<0||r>=size||c>=size) return; mat[r][c]=val; reserved[r][c]=true; }
    function finder(r0,c0){
      for(let r=-1;r<=7;r++) for(let c=-1;c<=7;c++){
        const rr=r0+r, cc=c0+c;
        if(rr<0||cc<0||rr>=size||cc>=size) continue;
        let val=0;
        if(r>=0&&r<=6&&c>=0&&c<=6){
          const onBorder=r===0||r===6||c===0||c===6;
          const inner=r>=2&&r<=4&&c>=2&&c<=4;
          val=(onBorder||inner)?1:0;
        }
        setr(rr,cc,val);
      }
    }
    finder(0,0); finder(0,size-7); finder(size-7,0);
    for(let i=8;i<size-8;i++){
      if(!reserved[6][i]) setr(6,i,i%2===0?1:0);
      if(!reserved[i][6]) setr(i,6,i%2===0?1:0);
    }
    const align=VERSIONS[version].align;
    const positions=[];
    for(const r of align) for(const c of align) positions.push([r,c]);
    for(const [r0,c0] of positions){
      if((r0<=8&&c0<=8)||(r0<=8&&c0>=size-9)||(r0>=size-9&&c0<=8)) continue;
      for(let r=-2;r<=2;r++) for(let c=-2;c<=2;c++){
        const onBorder=r===-2||r===2||c===-2||c===2;
        const center=r===0&&c===0;
        setr(r0+r,c0+c,(onBorder||center)?1:0);
      }
    }
    for(let i=0;i<=8;i++){ if(i!==6) setr(8,i,0); }
    for(let i=0;i<=7;i++){ if(i!==6) setr(i,8,0); }
    for(let i=0;i<7;i++) setr(size-1-i,8,0);
    for(let i=0;i<8;i++) setr(8,size-1-i,0);
    setr(8,8,0);
    setr(4*version+9,8,1);
    return {mat,reserved,size};
  }
  function placeData(mat,reserved,size,bits){
    let bitIndex=0, col=size-1, dir=-1;
    while(col>0){
      if(col===6) col--;
      for(let i=0;i<size;i++){
        const r=dir===-1?(size-1-i):i;
        for(const c of [col,col-1]){
          if(!reserved[r][c]){
            mat[r][c]=bitIndex<bits.length?bits[bitIndex]:0;
            bitIndex++;
          }
        }
      }
      dir=-dir; col-=2;
    }
  }
  function applyMask(mat,reserved,size,maskFn){
    for(let r=0;r<size;r++) for(let c=0;c<size;c++){
      if(!reserved[r][c]) mat[r][c]=mat[r][c]^(maskFn(r,c)?1:0);
    }
  }
  function setFormatInfo(mat,size,ecBits,maskBits){
    const data5=(ecBits<<3)|maskBits;
    let d=data5<<10; let msbPos=14; const g=0b10100110111;
    while(msbPos>=10){ if(d&(1<<msbPos)) d^=(g<<(msbPos-10)); msbPos--; }
    const full=((data5<<10)|d)^0b101010000010010;
    const bitsArr=[]; for(let i=14;i>=0;i--) bitsArr.push((full>>i)&1);
    const posA=[[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[7,8],[8,8],[8,7],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0]];
    for(let i=0;i<15;i++){ const [r,c]=posA[i]; mat[r][c]=bitsArr[i]; }
    const posB=[[8,size-1],[8,size-2],[8,size-3],[8,size-4],[8,size-5],[8,size-6],[8,size-7],[8,size-8],
                [size-7,8],[size-6,8],[size-5,8],[size-4,8],[size-3,8],[size-2,8],[size-1,8]];
    for(let i=0;i<15;i++){ const [r,c]=posB[i]; mat[r][c]=bitsArr[i]; }
  }
  function utf8Bytes(str){
    if(window.TextEncoder) return Array.from(new TextEncoder().encode(str));
    const out=[]; const esc=unescape(encodeURIComponent(str));
    for(let i=0;i<esc.length;i++) out.push(esc.charCodeAt(i));
    return out;
  }
  /* encode(text) -> {matrix, size} boolean matrix, or null if text too long */
  function encode(text){
    const bytes=utf8Bytes(text);
    const version=chooseVersion(bytes.length);
    if(!version) return null;
    const bits=buildBitStream(bytes,version);
    const dataBytes=bitsToBytes(bits);
    const ec=rsEncode(dataBytes,VERSIONS[version].ecCw);
    const allBytes=dataBytes.concat(ec);
    const allBits=[]; for(const b of allBytes) for(let i=7;i>=0;i--) allBits.push((b>>i)&1);
    const {mat,reserved,size}=makeMatrix(version);
    placeData(mat,reserved,size,allBits);
    applyMask(mat,reserved,size,(r,c)=>((r+c)%2===0));
    setFormatInfo(mat,size,0b01,0b000);
    const boolMat=mat.map(row=>row.map(v=>!!v));
    return {matrix:boolMat,size,version};
  }
  /* builds a standalone SVG string, quiet zone included */
  function toSVG(text,opts){
    opts=opts||{};
    const res=encode(text);
    if(!res) return null;
    const px=opts.moduleSize||6, quiet=4;
    const total=res.size+quiet*2;
    const dim=total*px;
    let svg=`<svg viewBox="0 0 ${dim} ${dim}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">`;
    svg+=`<rect width="${dim}" height="${dim}" fill="${opts.bg||'#fff'}"/>`;
    for(let r=0;r<res.size;r++) for(let c=0;c<res.size;c++){
      if(res.matrix[r][c]) svg+=`<rect x="${(c+quiet)*px}" y="${(r+quiet)*px}" width="${px}" height="${px}" fill="${opts.fg||'#000'}"/>`;
    }
    svg+='</svg>';
    return svg;
  }
  return {encode, toSVG};
})();

/* ------------------------------------------------------------
   ЭКОЛОГИЧНОСТЬ (учебные ориентировочные коэффициенты CO2-экв,
   кг CO2 на 1 кг материала — для сравнения порядка величины)
   ------------------------------------------------------------ */
const ECO_FACTORS={
  st3:1.8, st45:1.9, ss304:5.5, ss316:6.0, al2024:9.5, al6061:8.5,
  ti64:35, brass:4.0, copper:3.5, castiron:1.6, bronze:4.5,
  abs:3.5, pla:1.8, pmma:3.8, pa6:6.5, pom:4.0,
  cfrp:22, gfrp:5.0, pine:0.5, oak:0.6,
};
/* материалы, для которых уместен расчёт 3D-печати */
const PRINTABLE_IDS=new Set(['abs','pla','pa6','pom']);
const FILAMENT_D_MM=1.75;
const PRINT_RATE_MM3_S=12; /* ориентировочная объёмная скорость печати FDM */
const PRINTER_POWER_KW=0.15;
const ELECTRICITY_RUB_KWH=5.5;

function printEstimate(mass_kg, density_kg_m3){
  const massG=mass_kg*1000;
  const volumeMm3=mass_kg*1e9/density_kg_m3; /* м3->мм3 через плотность */
  const rMm=FILAMENT_D_MM/2;
  const lengthMm=volumeMm3/(Math.PI*rMm*rMm);
  const lengthM=lengthMm/1000;
  const timeH=volumeMm3/PRINT_RATE_MM3_S/3600 + 0.3;
  const elecCost=timeH*PRINTER_POWER_KW*ELECTRICITY_RUB_KWH;
  return {massG, lengthM, timeH, elecCost};
}

/* ------------------------------------------------------------
   РЕЙТИНГ КОНСТРУКЦИИ
   ------------------------------------------------------------ */
function ratePart(r, requiredN){
  const checksPassed=r.checks.filter(c=>c.status==='pass').length;
  const checksTotal=r.checks.length||1;
  const checksScore=40*(checksPassed/checksTotal);
  const n=requiredN||1.5;
  const sf=r.safetyFactor;
  const safetyScore = (sf==null||!isFinite(sf)) ? 20 : 30*Math.min(1, sf/(2*n));
  const specific = r.mat.yield/r.mat.price;
  const REF_MAX=3.2; /* ориентировочный максимум yield/price среди базы материалов */
  const costScore=20*Math.min(1, specific/REF_MAX);
  const massScore=10;
  const score=Math.round(Math.max(0,Math.min(100, checksScore+safetyScore+costScore+massScore)));
  let grade='D';
  if(score>=85) grade='S'; else if(score>=70) grade='A'; else if(score>=55) grade='B'; else if(score>=40) grade='C';
  return {score, grade, checksScore, safetyScore, costScore, massScore};
}

/* ------------------------------------------------------------
   АВТОМАТИЧЕСКИЙ ЧЕРТЁЖ (упрощённая 2D-схема с размерами)
   ------------------------------------------------------------ */
const DRAWING_CONFIG={
  beam:{shape:'rect_side', L:'L', H:'h', extraIds:['b']},
  shaft:{shape:'round_side', L:'L', D:'D'},
  tube:{shape:'round_side', L:'L', D:'D', extraIds:['t']},
  plate:{shape:'rect_top', L:'L', H:'W', extraIds:['t']},
  bracket:{shape:'rect_side', L:'Lp', H:'a', extraIds:['b','t']},
  gear:{shape:'round_disc', D:'D', hole:'d0', extraIds:['b']},
  spring:{shape:'round_side', L:null, D:'D', extraIds:['d','n']},
  bolt:{shape:'round_side', L:'L', D:'D'},
  column:{shape:'round_side', L:'L', D:'D'},
  disc:{shape:'round_disc', D:'D', hole:'d0', extraIds:['t','rpm']},
};
function dimLineH(x1,x2,y,label){
  return `<line x1="${x1}" y1="${y-5}" x2="${x1}" y2="${y+5}" class="dwg-ext"/>
    <line x1="${x2}" y1="${y-5}" x2="${x2}" y2="${y+5}" class="dwg-ext"/>
    <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" class="dwg-dim" marker-start="url(#dwgArrow)" marker-end="url(#dwgArrow)"/>
    <text x="${(x1+x2)/2}" y="${y-7}" text-anchor="middle" class="dwg-label">${label}</text>`;
}
function dimLineV(y1,y2,x,label){
  return `<line x1="${x-5}" y1="${y1}" x2="${x+5}" y2="${y1}" class="dwg-ext"/>
    <line x1="${x-5}" y1="${y2}" x2="${x+5}" y2="${y2}" class="dwg-ext"/>
    <line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" class="dwg-dim" marker-start="url(#dwgArrow)" marker-end="url(#dwgArrow)"/>
    <text x="${x-9}" y="${(y1+y2)/2}" text-anchor="end" dominant-baseline="middle" class="dwg-label">${label}</text>`;
}
function buildDrawingSVG(part, params, fmtFn){
  const cfg=DRAWING_CONFIG[part.id];
  const W=460,H=280, cx=W/2, cy=H/2;
  const defs=`<defs><marker id="dwgArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,1 L7,4 L0,7 Z" class="dwg-arrow"/></marker></defs>`;
  let body='', extraTxt=[];
  if(!cfg){
    body=`<text x="${cx}" y="${cy}" text-anchor="middle" class="dwg-label">Схема недоступна для этого типа детали</text>`;
  } else if(cfg.shape==='round_disc'){
    const D=params[cfg.D]||1, hole=cfg.hole?(params[cfg.hole]||0):0;
    const R=Math.min(W,H)/2-46;
    const scale=R/(D/2);
    body+=`<circle cx="${cx}" cy="${cy}" r="${R}" class="dwg-shape"/>`;
    if(hole>0) body+=`<circle cx="${cx}" cy="${cy}" r="${(hole/2)*scale}" class="dwg-hole"/>`;
    body+=dimLineH(cx-R,cx+R,cy+R+22,'⌀'+fmtFn(D,1)+' мм');
    if(hole>0) extraTxt.push('Отверстие ⌀ '+fmtFn(hole,1)+' мм');
    (cfg.extraIds||[]).forEach(id=>{ if(id!==cfg.hole && params[id]!=null) extraTxt.push(idLabel(part,id)+': '+fmtFn(params[id],1)); });
  } else if(cfg.shape==='round_side'){
    let Lval = cfg.L ? (params[cfg.L]||1) : (params.n && params.d ? params.n*Math.PI*params.D*0 + params.n*params.d*2.1 : 100);
    const Dval=params[cfg.D]||1;
    const maxW=W-120, maxH=H-110;
    const scale=Math.min(maxW/Lval, maxH/Math.max(Dval,1));
    const rw=Lval*scale, rh=Dval*scale;
    const x0=cx-rw/2, y0=cy-rh/2;
    body+=`<rect x="${x0}" y="${y0}" width="${rw}" height="${rh}" class="dwg-shape"/>`;
    body+=dimLineH(x0,x0+rw,y0+rh+26,fmtFn(Lval,0)+' мм');
    body+=dimLineV(y0,y0+rh,x0-26,'⌀'+fmtFn(Dval,1));
    (cfg.extraIds||[]).forEach(id=>{ if(params[id]!=null) extraTxt.push(idLabel(part,id)+': '+fmtFn(params[id],1)); });
  } else { /* rect_side / rect_top */
    const Lval=params[cfg.L]||1, Hval=params[cfg.H]||1;
    const maxW=W-120, maxH=H-110;
    const scale=Math.min(maxW/Lval, maxH/Hval);
    const rw=Lval*scale, rh=Hval*scale;
    const x0=cx-rw/2, y0=cy-rh/2;
    body+=`<rect x="${x0}" y="${y0}" width="${rw}" height="${rh}" class="dwg-shape"/>`;
    body+=dimLineH(x0,x0+rw,y0+rh+26,fmtFn(Lval,0)+' мм');
    body+=dimLineV(y0,y0+rh,x0-26,fmtFn(Hval,1)+' мм');
    (cfg.extraIds||[]).forEach(id=>{ if(params[id]!=null) extraTxt.push(idLabel(part,id)+': '+fmtFn(params[id],1)); });
  }
  const extraLine = extraTxt.length ? `<text x="16" y="${H-12}" class="dwg-note">${extraTxt.join(' · ')}</text>` : '';
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" class="dwg-svg">${defs}${body}${extraLine}</svg>`;
}
function idLabel(part,id){
  const f=part.fields.find(x=>x.id===id);
  return f?f.label:id;
}

/* ------------------------------------------------------------
   СОХРАНЁННЫЕ ПРОЕКТЫ / ВЕРСИИ (localStorage)
   ------------------------------------------------------------ */
const PROJECTS_KEY='Hansler-projects';
function loadSavedProjects(){
  try{ return JSON.parse(localStorage.getItem(PROJECTS_KEY)||'[]'); }catch(e){ return []; }
}
function saveProjectSnapshot(specList, name){
  const list=loadSavedProjects();
  const totalMass=specList.reduce((s,i)=>s+i.mass*(i.qty||1),0);
  const totalCost=specList.reduce((s,i)=>s+i.unitCost*(i.qty||1),0);
  const entry={
    id: Date.now()+'-'+Math.random().toString(36).slice(2,7),
    name: name || ('Версия '+(list.length+1)),
    ts: Date.now(),
    specList: JSON.parse(JSON.stringify(specList)),
    totalMass, totalCost, count: specList.length,
  };
  list.push(entry);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(list));
  return entry;
}
function deleteSavedProject(id){
  const list=loadSavedProjects().filter(p=>p.id!==id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(list));
}

/* ------------------------------------------------------------
   ССЫЛКА ДЛЯ КОМАНДНОГО РЕЖИМА (компактная кодировка параметров)
   ------------------------------------------------------------ */
function encodeShareParams(partId, matId, params){
  const p=Object.keys(params).sort().map(k=>k+'~'+String(params[k]).replace('.','p')).join('_');
  return partId+'.'+matId+'.'+encodeURIComponent(p);
}
function decodeShareParams(str){
  try{
    const [partId, matId, enc]=str.split('.');
    const p={};
    decodeURIComponent(enc).split('_').forEach(pair=>{
      const [k,v]=pair.split('~'); if(k) p[k]=parseFloat(v.replace('p','.'));
    });
    return {partId, matId, params:p};
  }catch(e){ return null; }
}
