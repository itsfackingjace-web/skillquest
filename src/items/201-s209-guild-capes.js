// ---- 209. Guild capes (and every cape's shape) ----
// Every guild member can wear the guild's cape (START > Guild > Members, saved as `gcw`). The leader designs it in Settings:
// main colour, second colour, pattern, trim, emblem and emblem colour, stored as guilds/<g>/info/cp {c,s,p,t,e,x} (rules: numbers
// 0-31). It travels to other players inside the character (gearCH: gcp = main+1, gcs, gpt, gtr, gce, gex; 061's cleanCh keeps
// small numbers) and replaces a Marlo cape while worn.
// All capes (Marlo's too) are painted here, not by 085, as cloth at half-pixel detail (see `cloth` below).
(()=>{const GS=()=>window.SQGUILD&&SQGUILD.state,A=()=>window.SQGUILD&&SQGUILD.api;
 const PAL=['#d83a30','#e8862a','#e8c830','#48a848','#30a0a0','#3870d8','#8048c8','#d058a0','#e8e8e8','#404048',   // = the guild colours (197's COLS)
  '#7a1c24','#283878','#1e5a30','#7a5030','#909098','#e8b830','#101014','#f4d8a8'];
 const MARLO=['#c83040','#3858c8','#3a8a3a','#7848c0','#303038','#e8b830'];   // 085's CAPES colours, by ch.cape-1
 const EM=[{n:'None',p:[]},{n:'Circle',p:['.XX.','XXXX','XXXX','.XX.']},{n:'Sword',p:['.XX.','XXXX','.XX.','.XX.']},{n:'Chevron',p:['X..X','XXXX','.XX.','....']},
  {n:'Stripes',p:['XXXX','....','XXXX','....']},{n:'Crown',p:['X..X','XXXX','XXXX','....']},{n:'Diamond',p:['.XX.','XXXX','XXXX','.XX.'].map((r,i)=>i===1||i===2?'XXXX':'.XX.')},
  {n:'Bars',p:['X..X','X..X','X..X','X..X']},{n:'Checks',p:['X.X.','.X.X','X.X.','.X.X']},{n:'Moon',p:['.XXX','XX..','XX..','.XXX']},{n:'Arrow',p:['.XX.','XXXX','X..X','....'].reverse()},
  // 8x8 emblems are drawn at half-pixel detail
  {n:'Tree',p:['..XXXX..','.XXXXXX.','XXXXXXXX','XXXXXXXX','.XXXXXX.','...XX...','...XX...','..XXXX..']},
  {n:'Fish',p:['........','..XXX..X','.X.XXXXX','XXXXXXX.','.XXXXXXX','..XXX..X','........','........']},
  {n:'Skull',p:['.XXXXXX.','XXXXXXXX','X..XX..X','X..XX..X','XXX..XXX','.XXXXXX.','..X..X..','..XXXX..']}];
 const PAT=['Plain','Halves','Centre stripe','Bands','Quarters'];
 let WEAR=false;
 const inGuild=()=>{const G=GS();return!!(G&&G.id&&G.info)};
 const info=()=>{const G=GS();return G&&G.info||{}};
 const clampI=(v,n)=>Math.max(0,Math.min(n-1,v|0));
 // the guild's design (old guilds: their colour and the emblem picked before designs existed)
 const design=()=>{const I=info(),d=I.cp&&typeof I.cp==='object'?I.cp:{};return{c:clampI(d.c!=null?d.c:(I.col|0),PAL.length),s:clampI(d.s!=null?d.s:15,PAL.length),p:clampI(d.p,PAT.length),t:d.t!=null?(d.t?1:0):0,e:clampI(d.e!=null?d.e:(I.em|0),EM.length),x:clampI(d.x!=null?d.x:8,PAL.length)}};
 const toCh=(c,d)=>{c.gcp=d.c+1;c.gcs=d.s;c.gpt=d.p;if(d.t)c.gtr=1;else delete c.gtr;c.gce=d.e;c.gex=d.x;delete c.cape;return c};
 {const _gc=gearCH;gearCH=function(){const c=_gc.apply(this,arguments);if(WEAR&&inGuild())toCh(c,design());return c}}
 const shade=(hex,f)=>'#'+[1,3,5].map(i=>Math.max(0,Math.min(255,Math.round(parseInt(hex.slice(i,i+2),16)*f))).toString(16).padStart(2,'0')).join('');
 // which cape a character wears: the guild's, a Marlo cape, or none
 function spec(ch){if(!ch)return null;if(ch.gcp>0)return{c:PAL[(ch.gcp-1)%PAL.length],s:PAL[(ch.gcs|0)%PAL.length],p:ch.gpt|0,t:!!ch.gtr,e:ch.gce|0,x:PAL[(ch.gex|0)%PAL.length]};
  const m=MARLO[(ch.cape|0)-1];return m?{c:m,s:m,p:0,t:false,e:0,x:m}:null}
 const strip=ch=>{const o=Object.assign({},ch);for(const k of['cape','gcp','gcs','gpt','gtr','gce','gex'])delete o[k];return o};
 // the body's left/right edge on each row (from the bare kit)
 function edges(base){const w=base.width,h=base.height,d=base.getContext('2d').getImageData(0,0,w,h).data,E=[];for(let y=0;y<h;y++){let a=w,b=-1;for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>0){if(x<a)a=x;if(x>b)b=x}E.push([a,b])}return E}
 // the kit itself never gets a cape any more: every view is painted here at half-pixel detail
 {const _kb=kitBuild;kitBuild=function(ch,dir,st){return spec(ch)?_kb.call(this,strip(ch),dir,st):_kb.apply(this,arguments)}}
 // What is really drawn (game kit + Dev Suite worn looks, via 111a's SQCHDRAW) in the 48x56 box (anchor 24,44) at 2x, and `cov`:
 // pixels where a worn look covers the kit (hoods, robes): the cape goes under those.
 const SIL=new Map();let SC=null;
 function sil(ch,dir,st){const key=JSON.stringify(ch)+'|'+dir+'|'+st;let E=SIL.get(key);if(E)return E;
  if(!SC){SC=document.createElement('canvas');SC.width=96;SC.height=112;SC.hd2=true}
  const x=SC.getContext('2d'),grab=f=>{x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,96,112);x.setTransform(2,0,0,2,0,0);x.imageSmoothingEnabled=false;try{f()}finally{x.setTransform(1,0,0,1,0,0)}return x.getImageData(0,0,96,112).data};
  // robes and armour are under the cape (it is worn over them), only head pieces (hoods) go over it
  const isHead=k=>{try{return EQ[k]&&EQ[k].slot==='helm'}catch(e){return false}},body=Object.assign({},ch);if(Array.isArray(ch.wr)){body.wr=ch.wr.filter(k=>!isHead(k));if(!body.wr.length)delete body.wr}
  const draw=c=>()=>{if(window.SQCHDRAW)SQCHDRAW(x,c,dir,st,24,44,false);else x.drawImage(kitSprite(c,dir,st|0,false),16,19)};
  const d=grab(draw(ch)),k=grab(draw(body));
  E=[];const cov=new Uint8Array(96*112);
  for(let y=0;y<112;y++){let a=96,b=-1;for(let X=0;X<96;X++){const i=y*96+X,j=i*4;if(k[j+3]>60){if(X<a)a=X;if(X>b)b=X}if(d[j+3]>60){if(k[j+3]<=60||Math.abs(d[j]-k[j])+Math.abs(d[j+1]-k[j+1])+Math.abs(d[j+2]-k[j+2])>24)cov[i]=1}}E.push([a,b])}
  E.cov=cov;if(SIL.size>300)SIL.clear();SIL.set(key,E);return E}
 // ---- the cape as cloth ----
 // Shapes are worked out in kit pixels (16x32, head rows 9-20, neck 21, torso 22-26, legs 27-30) and painted per half pixel:
 // back: it rolls over both shoulders from the collar, falls in folds that fan out and ends in a wavy hem at the ankles;
 // front: that same cape seen from inside behind you (darker lining) plus the part lying over each shoulder and a clasp;
 // side: it rounds over the shoulder, wraps the back of the body and hangs/billows behind you.
 // Walking (st 1/2) swings it side to side from the back and makes it billow out from the side; standing, it stirs a little.
 const K='#181018',CC=new Map(),clamp=(v,a,b)=>v<a?a:v>b?b:v;
 function cloth(ch,dir,st,tick){const S=spec(ch);if(!S)return null;const bare=strip(ch),E=sil(bare,dir,st|0),KE=edges(kitSprite(bare,dir,st|0,false));
  const key=JSON.stringify(S)+JSON.stringify(bare)+'|'+dir+'|'+(st|0)+'|'+tick;let R=CC.get(key);if(R)return R;
  // width: the torso as drawn with body armour/robes (not hoods), so the cape covers a robe's shoulders and flares over its skirt
  const span=(y0,y1)=>{let a=96,b=-1;for(let Y=y0;Y<=y1;Y++){const[ea,eb]=E[Y]||[96,-1];if(eb>=0){a=Math.min(a,ea);b=Math.max(b,eb)}}return b<0?null:[a/2-16,(b+1)/2-16]};
  let L0=99,R0=-1;for(let y=22;y<=26;y++){const[ea,eb]=KE[y]||[99,-1];if(eb>=0){L0=Math.min(L0,ea);R0=Math.max(R0,eb+1)}}if(R0<0){CC.set(key,null);return null}
  const tor=span(82,91),low=span(92,99);if(tor){L0=Math.max(L0-2.5,Math.min(L0,tor[0]));R0=Math.min(R0+2.5,Math.max(R0,tor[1]))}
  const lowHalf=low?Math.min(10,Math.max(low[1]-(L0+R0)/2,(L0+R0)/2-low[0])):0;
  const backAt=y=>{const Y=Math.round(2*(y+19));const e=E[Y];return e&&e[1]>=0?e[0]/2-16:99};
  const st1=st|0,walk=st1?1:0,ph=tick?.07:0,cov=E.cov,T=S.t?S.s:null;
  const fold=u=>Math.cos(2*Math.PI*(u+ph));
  // --- shape tests: kit-pixel point -> {u,dep,ov} or null (ov: drawn over the body rather than behind it) ---
  let shape,nF;
  if(dir!==2){const cx=(L0+R0)/2,hs=(R0-L0)/2+.4,sk=(st1===1?.9:st1===2?-.9:tick?.15:-.15);nF=2.5;
   shape=(x,y)=>{if(y<20.8)return null;const d=clamp((y-22)/8.6,0,1),c=cx+sk*Math.pow(d,1.5);
    const fl=Math.max(1,lowHalf+.4-hs),hw=y<22.7?2.8+(hs-2.8)*Math.sin(Math.PI/2*clamp((y-20.8)/1.9,0,1)):hs+(y-22.7)/7.9*(fl+walk*.3);
    if(Math.abs(x-c)>hw)return null;const u=(x-(c-hw))/(2*hw);if(y>30.55+.45*fold(u*nF))return null;
    return{u,dep:clamp((y-22)/6,0,1),top:y<22.9}}}
  else{const bx=L0,bill=walk?1.5:(tick?1:.9),lift=walk?.9:.15;nF=1.5;
   const xo=y=>y<21.9?bx+1.6-1.8*Math.sqrt(clamp((y-20.8)/1.1,0,1)):(d=>bx-.2-bill*3.6*Math.pow(d,.8)+(walk?.55*d*Math.sin(d*Math.PI*1.6+(st1===1?0:Math.PI)):.25*Math.sin(d*Math.PI)*(tick?1:-1)))(clamp((y-21.9)/8.7,0,1));
   const fe=y=>y<22.6?6.6+Math.sqrt(Math.max(0,6.76-(y-22.6)*(y-22.6))):9.2-.3*(y-22.6);
   shape=(x,y)=>{if(y<20.8)return null;const a=Math.min(xo(y),y>21.9?backAt(y)-.4:99),b=fe(y);if(x<a||x>b)return null;if(x>=4&&y<22.6&&(x-6.6)*(x-6.6)+(y-22.6)*(y-22.6)>6.76)return null;
    const u=(x-a)/Math.max(.5,b-a);if(y>30.6-lift*Math.pow(1-u,1.5)+.5*fold(u*nF))return null;
    return{u,dep:clamp((y-22)/6,0,1),top:y<22.4&&x>=4}}}
  // --- paint: mask, then outline (2 half pixels, like the kit's), trim, folds, roundness ---
  const M=new Array(96*112),kp=(X,Y)=>[(X+.5)/2-16,(Y+.5)/2-19];
  for(let Y=0;Y<112;Y++)for(let X=0;X<96;X++){const[x,y]=kp(X,Y);const r=shape(x,y);if(r)M[Y*96+X]=r}
  const In=(X,Y)=>X>=0&&X<96&&Y>=0&&Y<112&&!!M[Y*96+X];
  for(let it=0;it<2;it++)for(let Y=0;Y<112;Y++)for(let X=0;X<96;X++)if(M[Y*96+X]&&((!In(X-1,Y)&&!In(X+1,Y))||(!In(X,Y-1)&&!In(X,Y+1))))M[Y*96+X]=null;
  const near=(X,Y,n)=>{for(let k=1;k<=n;k++)if(!In(X-k,Y)||!In(X+k,Y)||!In(X,Y-k)||!In(X,Y+k))return true;return false};
  const lining=dir===0,mk=()=>{const c=document.createElement('canvas');c.width=96;c.height=112;return c};
  const base=(r,y)=>{if(lining)return shade(S.c,.78);const u=r.u;if(dir===1){if(S.p===1)return u<.5?S.c:S.s;if(S.p===2)return Math.abs(u-.5)<.11?S.s:S.c;if(S.p===4)return(u<.5)!==(y>25.5)?S.s:S.c}if(S.p===3)return Math.floor((y-21)/1.6)%2?S.s:S.c;return S.c};
  const body=mk(),bx=body.getContext('2d');
  for(let Y=0;Y<112;Y++)for(let X=0;X<96;X++){const r=M[Y*96+X];if(!r)continue;const[,y]=kp(X,Y);let col;
   if(near(X,Y,2)){col=K}
   else if(T&&!r.top&&(!In(X,Y+3)||!In(X,Y+4)))col=lining?shade(T,.8):T;
   else{const b=base(r,y),f=r.dep>.15?fold(r.u*nF):0,edge=dir===2?(r.u>.8||r.u<.1):Math.abs(r.u-.5)>.42;
    col=r.top&&near(X,Y,3)?shade(b,1.22):f<-.8?shade(b,.68):f>.6&&r.dep>.3?shade(b,1.16):edge?shade(b,.82):b}
   bx.fillStyle=col;bx.fillRect(X,Y,1,1)}
  // emblem on the back, swinging with the cape
  if(dir===1){const pat=(EM[S.e]||EM[0]).p;if(pat.length){let x0=99,x1=-1;for(let X=0;X<96;X++)if(M[86*96+X]){x0=Math.min(x0,X);x1=X}
    const ex=Math.round((x0+x1+1)/2)-4,ey=85,z=pat[0].length>4?1:2;bx.fillStyle=S.x;pat.forEach((row,j)=>{for(let i=0;i<row.length;i++)if(row[i]==='X'&&In(ex+i*z,ey+j*z))bx.fillRect(ex+i*z,ey+j*z,z,z)})}}
  // what goes behind the character and what over it (not over hoods/robes: those cover the cape)
  const under=mk(),over=mk(),uo=under.getContext('2d'),oo=over.getContext('2d');
  if(dir===0){uo.drawImage(body,0,0);
   // over each shoulder: the part of the cape that lies on it, and a clasp at the collar
   const cx=(L0+R0)/2,hs=(R0-L0)/2+.4,lip=(x,y)=>{if(y<21.1||y>24.4)return false;const ax=Math.abs(x-cx),out=hs+.2-(y<22.4?1.1*Math.pow(1-(y-21.1)/1.3,2):0),inn=hs-3.2+2.2*Math.pow((y-21.1)/3.3,2);return ax<=out&&ax>=inn};
   const LM=new Uint8Array(96*112);for(let Y=0;Y<112;Y++)for(let X=0;X<96;X++){const[x,y]=kp(X,Y);if(lip(x,y))LM[Y*96+X]=1}
   const li=(X,Y)=>X>=0&&X<96&&Y>=0&&Y<112&&LM[Y*96+X];
   for(let Y=0;Y<112;Y++)for(let X=0;X<96;X++){if(!LM[Y*96+X]||cov[Y*96+X])continue;let e=false;for(let k=1;k<=1;k++)if(!li(X-k,Y)||!li(X+k,Y)||!li(X,Y-k)||!li(X,Y+k))e=true;
    const[x,y]=kp(X,Y);oo.fillStyle=e?K:y<21.8?shade(S.c,1.2):Math.abs(x-cx)>hs-.7?shade(S.c,.8):(T&&y>23.6?T:S.c);oo.fillRect(X,Y,1,1)}
   const mx=Math.round(2*(cx+16))-2,my=2*(22+19);
   // a cord from each shoulder piece down to the clasp
   for(const sd of[-1,1]){const x0=Math.round(2*(cx+16+sd*(hs-2.9))),x1=mx+(sd<0?0:3);for(let i=0;i<=Math.abs(x1-x0);i++){const X=x0+(x1>x0?i:-i),Y=my+1+Math.round(2*i/Math.max(1,Math.abs(x1-x0)));if(!cov[Y*96+X]){oo.fillStyle=shade(T||S.c,.75);oo.fillRect(X,Y,1,1)}}}const cl=[[1,0,K],[2,0,K],[0,1,K],[1,1,S.x],[2,1,S.x],[3,1,K],[0,2,K],[1,2,shade(S.x,.7)],[2,2,shade(S.x,.7)],[3,2,K],[1,3,K],[2,3,K]];
   for(const[i,j,c]of cl)if(!cov[(my+j)*96+mx+i]){oo.fillStyle=c;oo.fillRect(mx+i,my+j,1,1)}}
  else{const d=bx.getImageData(0,0,96,112),o=oo.createImageData(96,112);for(let i=0;i<96*112;i++){if(cov[i])continue;for(let c=0;c<4;c++)o.data[i*4+c]=d.data[i*4+c]}oo.putImageData(o,0,0)}
  R={under:dir===0?under:null,over};if(CC.size>500)CC.clear();CC.set(key,R);return R}
 const tickNow=()=>window.SQCAPETICK!=null?SQCAPETICK:Math.floor(performance.now()/650)%2;
 const put=(C,L,dir,ox,oy,fl)=>{const sm=C.imageSmoothingEnabled;C.imageSmoothingEnabled=false;const X=Math.round(ox)-24,Y=Math.round(oy)-44;
  if(fl&&dir===2){C.save();C.translate(X*2+48,0);C.scale(-1,1);C.drawImage(L,X,Y,48,56);C.restore()}else C.drawImage(L,X,Y,48,56);C.imageSmoothingEnabled=sm};
 // 111a's cP wrapper: SQCAPEUNDER before the character, SQCAPETOP after it (and after worn looks)
 window.SQCAPEUNDER=function(C,ch,dir,st,ox,oy,fl){if(!C||dir!==0||!spec(ch))return;try{const R=cloth(ch,0,st,tickNow());if(R&&R.under)put(C,R.under,0,ox,oy,fl)}catch(e){}};
 window.SQCAPETOP=function(C,ch,dir,st,ox,oy,fl){if(!C||!spec(ch))return;try{const R=cloth(ch,dir|0,st,tickNow());if(R)put(C,R.over,dir|0,ox,oy,fl)}catch(e){}};
 // saving the choice to wear it
 {const _sn=snap;snap=function(){const s=_sn.apply(this,arguments);if(WEAR)s.gcw=1;return s}}
 {const _ap=applySave;applySave=function(S){const out=_ap.apply(this,arguments);WEAR=!!(S&&S.gcw);try{KITC.clear()}catch(e){}return out}}
 {const _ng=newGame;newGame=function(){WEAR=false;return _ng.apply(this,arguments)}}
 try{KNOWN49.add('gcw')}catch(e){}
 // pictures for the guild screen: the cape on your character, back and front
 function pic(d,dir){try{const ch=toCh(Object.assign({},gearCH()),d),c=document.createElement('canvas');c.width=72;c.height=96;c.hd2=true;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
  // the 24x32 part of the 48x56 box around the kit, at 3x
  x.setTransform(3,0,0,3,0,0);const sv=GC;GC=x;try{cP(ch,dir,0,12,25,false)}finally{GC=sv;x.setTransform(1,0,0,1,0,0)}return c.toDataURL()}catch(e){return''}}
 const img=(u,w)=>u?'<img alt="" src="'+u+'" style="width:'+w+'px;image-rendering:pixelated;flex:none">':'';
 function card(){if(!inGuild())return'';const d=design();return'<div class="qc"><div style="display:flex;gap:10px;align-items:center">'+img(pic(d,1),54)+img(pic(d,0),54)+'<div style="flex:1"><b>Guild cape</b><p style="font-size:13px">Designed by your guild\'s leader. Everyone sees it on you, and it takes the place of your Marlo cape while you wear it.</p>'+
   '<button class="qb" data-g="gcp:wear">'+(WEAR?'Take it off':'Wear the guild cape')+'</button></div></div></div>'}
 // the designer (leader only): changes are a draft until Save
 let DR=null;
 function setCard(){const d=DR||design(),sw=(f,v)=>'<div style="display:flex;gap:4px;flex-wrap:wrap;margin:2px 0 8px">'+PAL.map((c,i)=>'<button data-g="gcp:'+f+':'+i+'" aria-label="Colour '+(i+1)+'" style="width:26px;height:26px;background:'+c+';border:3px solid '+(i===v?'#f8a020':'#485870')+';cursor:pointer"></button>').join('')+'</div>',
   btns=(f,L,v)=>'<div style="display:flex;gap:6px;flex-wrap:wrap;margin:2px 0 8px">'+L.map((n,i)=>'<button data-g="gcp:'+f+':'+i+'" style="padding:5px 8px;border:3px solid '+(i===v?'#f8a020':'#485870')+';background:#f8f8f8;color:#404040;cursor:pointer;font:700 12px '+PF+'">'+n+'</button>').join('')+'</div>';
  return'<div class="qc"><b>Guild cape</b><p style="font-size:13px">Design the cape every member can wear. Nothing changes for them until you tap Save.</p>'+
   '<div style="display:flex;gap:10px;justify-content:center;margin:6px 0">'+img(pic(d,1),64)+img(pic(d,0),64)+img(pic(d,2),64)+'</div>'+
   '<small>Main colour</small>'+sw('c',d.c)+'<small>Second colour (pattern and trim)</small>'+sw('s',d.s)+'<small>Pattern</small>'+btns('p',PAT,d.p)+
   '<small>Trim</small>'+btns('t',['No trim','Trim'],d.t)+'<small>Emblem (on the back)</small>'+btns('e',EM.map(e=>e.n),d.e)+'<small>Emblem colour</small>'+sw('x',d.x)+
   '<button class="qb" data-g="gcp:save"'+(DR?'':' disabled style="opacity:.5"')+'>Save the cape</button>'+(DR?' <button class="qb" data-g="gcp:undo">Undo changes</button>':'')+'</div>'}
 function act(x,y){const a=A();if(!a)return;
  if(x==='wear'){WEAR=!WEAR;try{KITC.clear()}catch(e){}try{saveLocal(true)}catch(e){}a.tell(WEAR?'You put on the guild cape.':'You took off the guild cape.');return}
  if(a.role()!=='l')return;
  if('cspex'.includes(x)&&x.length===1||x==='t'){DR=Object.assign(DR||design(),{[x]:+y|0});a.redraw();return}
  if(x==='undo'){DR=null;a.redraw();return}
  if(x==='save'&&DR){const d=DR;a.DB().set(a.ref('guilds/'+SQGUILD.id+'/info/cp'),{c:d.c,s:d.s,p:d.p,t:d.t,e:d.e,x:d.x}).then(()=>{DR=null;try{KITC.clear()}catch(e){}a.tell('The guild cape is saved. Every member wearing it shows the new design.')}).catch(a.fail)}}
 window.SQGCAPE={card,setCard,act,EM,PAL,PAT,design,spec,get wear(){return WEAR},set wear(v){WEAR=!!v;try{KITC.clear()}catch(e){}}};
})();
