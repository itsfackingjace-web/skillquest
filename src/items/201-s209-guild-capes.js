// ---- 209. Guild capes (and every cape's shape) ----
// Every guild member can wear the guild's cape (START > Guild > Members, saved as `gcw`). The leader designs it in Settings:
// main colour, second colour, pattern, trim, emblem and emblem colour, stored as guilds/<g>/info/cp {c,s,p,t,e,x} (rules: numbers
// 0-31). It travels to other players inside the character (gearCH: gcp = main+1, gcs, gpt, gtr, gce, gex; 061's cleanCh keeps
// small numbers) and replaces a Marlo cape while worn.
// All capes (Marlo's too) are painted here, not by 085: as their own layer that covers the body's width on the back (wizard robes
// flare out at the bottom, so the old tapered cape left robe sticking out on both sides), behind the body on the front and side,
// and repainted on top of Dev Suite worn looks on the back (111a's cP wrapper calls window.SQCAPETOP after drawWorn), so a worn
// robe no longer covers the cape.
(()=>{const GS=()=>window.SQGUILD&&SQGUILD.state,A=()=>window.SQGUILD&&SQGUILD.api;
 const PAL=['#d83a30','#e8862a','#e8c830','#48a848','#30a0a0','#3870d8','#8048c8','#d058a0','#e8e8e8','#404048',   // = the guild colours (197's COLS)
  '#7a1c24','#283878','#1e5a30','#7a5030','#909098','#e8b830','#101014','#f4d8a8'];
 const MARLO=['#c83040','#3858c8','#3a8a3a','#7848c0','#303038','#e8b830'];   // 085's CAPES colours, by ch.cape-1
 const EM=[{n:'None',p:[]},{n:'Circle',p:['.XX.','XXXX','XXXX','.XX.']},{n:'Sword',p:['.XX.','XXXX','.XX.','.XX.']},{n:'Chevron',p:['X..X','XXXX','.XX.','....']},
  {n:'Stripes',p:['XXXX','....','XXXX','....']},{n:'Crown',p:['X..X','XXXX','XXXX','....']},{n:'Diamond',p:['.XX.','XXXX','XXXX','.XX.'].map((r,i)=>i===1||i===2?'XXXX':'.XX.')},
  {n:'Bars',p:['X..X','X..X','X..X','X..X']},{n:'Checks',p:['X.X.','.X.X','X.X.','.X.X']},{n:'Moon',p:['.XXX','XX..','XX..','.XXX']},{n:'Arrow',p:['.XX.','XXXX','X..X','....'].reverse()}];
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
 // the body's left/right edge on each row (from the bare kit), so the back of the cape covers what's there
 function edges(base){const w=base.width,h=base.height,d=base.getContext('2d').getImageData(0,0,w,h).data,E=[];for(let y=0;y<h;y++){let a=w,b=-1;for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>0){if(x<a)a=x;if(x>b)b=x}E.push([a,b])}return E}
 const LC=new Map();
 function layer(ch,dir,base){const S=spec(ch);if(!S)return null;const E=edges(base),key=JSON.stringify(S)+'|'+dir+'|'+E.slice(20,31).join(';');let c=LC.get(key);if(c)return c;
  c=document.createElement('canvas');c.width=16;c.height=32;const x=c.getContext('2d'),px=(a,b,col)=>{x.fillStyle=col;x.fillRect(a,b,1,1)},K='#181018';
  const col=(X,y,a,b)=>{const half=X<(a+b+1)/2;if(S.p===1)return half?S.c:S.s;if(S.p===2)return Math.abs(X-7.5)<1.6?S.s:S.c;if(S.p===3)return((y-21)>>1)%2?S.s:S.c;if(S.p===4)return(half?0:1)^(y>25?1:0)?S.s:S.c;return S.c};
  const T=S.t?S.s:null;
  if(dir===1){let a0=6,b0=9;for(let y=21;y<=29;y++){const w=Math.min(6,2+((y-21)>>1));let a=7-w,b=8+w;
     if(y>=22){const[ea,eb]=E[y];if(eb>=0){a=Math.max(1,Math.min(a,ea));b=Math.min(14,Math.max(b,eb))}}a=Math.max(a,a0-1);b=Math.min(b,b0+1);a0=a;b0=b;
     px(a-1,y,K);px(b+1,y,K);for(let X=a;X<=b;X++){const edge=X===a||X===b;const cc=col(X,y,a,b);px(X,y,edge?(T||shade(cc,.7)):(X===7||X===8)&&y===22?shade(cc,1.2):cc)}}
   for(let X=Math.max(0,a0-1);X<=Math.min(15,b0+1);X++)px(X,30,K);if(T)for(let X=a0;X<=b0;X++)px(X,29,T);
   const pat=(EM[S.e]||EM[0]).p;pat.forEach((row,j)=>{for(let i=0;i<4;i++)if(row[i]==='X')px(6+i,24+j,S.x)})}
  if(LC.size>400)LC.clear();LC.set(key,c);return c}
 {const _kb=kitBuild;kitBuild=function(ch,dir,st){if(!spec(ch))return _kb.apply(this,arguments);if(dir!==1)return _kb.call(this,strip(ch),dir,st);const base=_kb.call(this,strip(ch),dir,st),L=layer(ch,dir,base);if(!L)return base;
   const c=document.createElement('canvas');c.width=16;c.height=32;const x=c.getContext('2d');
   x.drawImage(base,0,0);x.drawImage(L,0,0);return c}}
// front and side: the 16 px kit has no room beside the body, so the cape is its own 24 px wide picture drawn behind the
 // character by 111a's cP wrapper (window.SQCAPEUNDER, before the character): from the front it hangs 2-4 px out on both
 // sides from the shoulders to the feet, from the side it trails 3-5 px out behind the back. Drawn facing right, mirrored for left.
 // It is measured against what is really drawn (game kit + Dev Suite worn looks, via 111a's SQCHDRAW, at half-pixel detail
 // in the 48x56 box, anchor 24,44), tapers from the shoulders and ends at the ankles, so wide robes don't turn it into a slab.
 const WC=new Map(),SIL=new Map();let SC=null;
 function sil(ch,dir,st){const key=JSON.stringify(ch)+'|'+dir+'|'+st;let E=SIL.get(key);if(E)return E;
  if(!SC){SC=document.createElement('canvas');SC.width=96;SC.height=112;SC.hd2=true}
  const x=SC.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,96,112);x.setTransform(2,0,0,2,0,0);x.imageSmoothingEnabled=false;
  try{if(window.SQCHDRAW)SQCHDRAW(x,ch,dir,st,24,44,false);else x.drawImage(kitSprite(ch,dir,st|0,false),16,19)}finally{x.setTransform(1,0,0,1,0,0)}
  const d=x.getImageData(0,0,96,112).data;E=[];for(let y=0;y<112;y++){let a=96,b=-1;for(let X=0;X<96;X++)if(d[(y*96+X)*4+3]>60){if(X<a)a=X;if(X>b)b=X}E.push([a,b])}
  if(SIL.size>300)SIL.clear();SIL.set(key,E);return E}
 const TOP=80,HEM=98; // shoulders and ankles, in half pixels of the 48x56 box
 function wide(ch,dir,st){const S=spec(ch);if(!S||dir===1)return null;const bare=strip(ch),E=sil(bare,dir,st|0),KE=edges(kitSprite(bare,dir,st|0,false)),key=JSON.stringify(S)+'|'+dir+'|'+(st|0)+'|'+E.slice(TOP,HEM+1).join(';')+'|'+KE.slice(21,28).join(';');let c=WC.get(key);if(c)return c;
  c=document.createElement('canvas');c.width=96;c.height=112;const x=c.getContext('2d'),px=(a,b,col)=>{if(a>=0&&a<96){x.fillStyle=col;x.fillRect(a,b,1,1)}},K='#181018',T=S.t?S.s:null,Dk=shade(S.c,.62),In=shade(S.c,.8),Lt=shade(S.c,1.15);
  // the cape's width comes from the game's own body (shoulders/torso), not from robes or hoods over it: those just cover it
  let ka=99,kb=-1;for(let y=21;y<=27;y++){const[ea,eb]=KE[y]||[99,-1];if(eb>=0){ka=Math.min(ka,ea);kb=Math.max(kb,eb)}}if(kb<0){WC.set(key,c);return c}
  const a=(ka+16)*2,b=(kb+16)*2+1,sway=(st|0)?1:0;
  for(let y=TOP;y<=HEM;y++){const[ea,eb]=E[y]||[99,-1],t=(y-TOP)/(HEM-TOP),last=y===HEM;
   if(dir===0){// two edges peeking out beside you, 1 px at the shoulders to 2 px at the hem, the lining a shade darker
    const f=Math.round(2+2*t)-(last?1:0);for(const sd of[-1,1]){const edge=sd<0?a:b,outer=edge+sd*f;
     if(eb>=0&&(sd<0?ea<=outer+1:eb>=outer-1))continue; // a robe covers this side here
     for(let X=edge-sd*4;X!==outer+sd;X+=sd){const o=Math.abs(X-outer);px(X,y,last?K:o===0?K:o===1?(T||Dk):In)}}
    if(last)for(let X=a+2;X<=b-2;X++)px(X,y,K)}
   else{// from the side it trails out behind your back, wider toward the hem and swinging a little while you walk
    const f=Math.round(2+4*t+(t>.4?sway:0))-(last?1:0),outer=a-f;if(eb>=0&&ea<=outer+1)continue;
    for(let X=outer;X<=a+5;X++){const o=X-outer;px(X,y,last||o===0?K:o===1?(T||Dk):o===2?Lt:(S.p===1&&X>a?S.s:S.c))}}}
  if(WC.size>400)WC.clear();WC.set(key,c);return c}
 window.SQCAPEUNDER=function(C,ch,dir,st,ox,oy,fl){if(dir===1||!C)return;let L=null;try{L=wide(ch,dir,st)}catch(e){}if(!L)return;const sm=C.imageSmoothingEnabled;C.imageSmoothingEnabled=false;
  const X=Math.round(ox)-24,Y=Math.round(oy)-44;if(fl&&dir===2){C.save();C.translate(X*2+48,0);C.scale(-1,1);C.drawImage(L,X,Y,48,56);C.restore()}else C.drawImage(L,X,Y,48,56);C.imageSmoothingEnabled=sm};
 // on top of Dev Suite worn looks, from behind (called by 111a's cP wrapper after drawWorn)
 window.SQCAPETOP=function(C,ch,dir,st,ox,oy,fl){if(dir!==1||!spec(ch))return;try{const base=kitBuild(strip(ch),1,st),L=layer(ch,1,base);if(!L)return;const sm=C.imageSmoothingEnabled;C.imageSmoothingEnabled=false;C.drawImage(L,Math.round(ox)-8,Math.round(oy)-25);C.imageSmoothingEnabled=sm}catch(e){}};
 // saving the choice to wear it
 {const _sn=snap;snap=function(){const s=_sn.apply(this,arguments);if(WEAR)s.gcw=1;return s}}
 {const _ap=applySave;applySave=function(S){const out=_ap.apply(this,arguments);WEAR=!!(S&&S.gcw);try{KITC.clear()}catch(e){}return out}}
 {const _ng=newGame;newGame=function(){WEAR=false;return _ng.apply(this,arguments)}}
 try{KNOWN49.add('gcw')}catch(e){}
 // pictures for the guild screen: the cape on your character, back and front
 function pic(d,dir){try{const ch=toCh(Object.assign({},gearCH()),d),s=kitSprite(ch,dir,0,false),L=wide(ch,dir,0),c=document.createElement('canvas');c.width=24*3;c.height=32*3;const x=c.getContext('2d');x.imageSmoothingEnabled=false;if(L)x.drawImage(L,-12*3,-19*3,48*3,56*3);x.drawImage(s,4*3,0,48,96);return c.toDataURL()}catch(e){return''}}
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
