// ---- 152. Bosses made in the Dev Suite (Dev Suite > Bosses) ----
// bosses.cb_<name> in the asset library = {n name, base (a monster key it moves like, from SQISLIFE.MOBS), hp, sz (size
// 1-3), dmg (damage per hit 1-6), spd (speed %), cd (seconds between attacks), rs (minutes before it comes back),
// atk: {ring, charge, slam, summon: 1}, sk (what it summons)}.
// Each one becomes a monster kind 'cb:<name>' (SQISLIFE.MOBS, so the island builder's monster zones and island dungeons
// can use it): its look is drawn in Dev Suite > Monsters (props m:cb:<name>; until then the base monster, scaled up),
// its drops are that monster's rules (Monsters tab). In an island dungeon it appears once, on the last floor.
// Attacks (the owner's game runs them; other players' copies are proxies): ring = a circle of fire bolts, charge = a
// marked dash, slam = a marked circle where you stand that bursts after a second, summon = up to 4 helpers.
// Once beaten it stays away for `rs` minutes on this device (localStorage sq_cbdead).
(()=>{const CB={},LSK='sq_cbdead';let DEAD={};try{DEAD=JSON.parse(localStorage.getItem(LSK)||'{}')||{}}catch(e){}
 const num=(v,lo,hi,d)=>{v=+v;return isFinite(v)?Math.max(lo,Math.min(hi,v)):d};
 const clean=(v,n)=>String(v==null?'':v).replace(/[<>&"]/g,'').slice(0,n);
 const MOBS=()=>window.SQISLIFE&&SQISLIFE.MOBS||{};
 // the monster key: letters only (island dungeons accept keys like 'cb:goblinking'), digits become letters
 const keyOf=id=>'cb:'+id.slice(3).replace(/_/g,'').replace(/[0-9]/g,d=>'abcdefghij'[d]);
 function read(lib){for(const k in CB){delete MOBS()[CB[k].key];delete CB[k]}const L=lib&&lib.bosses||{};
  for(const id in L){const b=L[id];if(!/^cb_[a-z0-9_]{1,24}$/.test(id)||!b||typeof b!=='object')continue;const key=keyOf(id);
   const base=typeof b.base==='string'&&MOBS()[b.base]&&!/^cb:/.test(b.base)?b.base:'wolf',A=b.atk&&typeof b.atk==='object'?b.atk:{};
   const B={id,key,n:clean(b.n,30)||'Boss',base,hp:num(b.hp,10,5000,80)|0,sz:num(b.sz,1,3,1.6),dmg:num(b.dmg,1,6,2)|0,spd:num(b.spd,30,300,100),cd:num(b.cd,1.5,20,4),rs:num(b.rs,1,240,15),
    atk:['ring','charge','slam','summon'].filter(a=>A[a]),sk:typeof b.sk==='string'&&MOBS()[b.sk]&&!/^cb:/.test(b.sk)?b.sk:base};
   CB[key]=B;MOBS()[key]={n:B.n+' (boss)',hp:B.hp,rg:null,boss:1}}try{window.SQPROPS&&SQPROPS.recat&&SQPROPS.recat()}catch(e){}}
 if(window.SQA)SQA.onApply(read);
 const deadKey=(B)=>B.key+'@'+(typeof curRegion==='function'?curRegion():'');
 const away=B=>(DEAD[deadKey(B)]||0)>Date.now();
 // ---- making one ----
 {const _mk=rgMake;rgMake=function(key,hp,x,y){const B=CB[key];if(!B)return _mk.apply(this,arguments);const n=_mk(B.base,hp,x,y);
   n.hp=n.mhp=Math.max(hp|0,B.hp);n.rk=key;delete n.rv;n.cb=key;n.big=1;n.night=0;n.cbt=B.cd*.6;if(away(B)){n.dead=1;n.dropped=1;n.hp=0}return n}}
 // in an island dungeon: one boss, on the last floor
 if(typeof buildFloor==='function'){const _bf=buildFloor;buildFloor=function(kind,f){const R=_bf.apply(this,arguments);try{const K=DKIND[kind];if(R&&R.mobs&&K&&/^cv_/.test(kind)){
   const bs=R.mobs.filter(m=>m&&m.cb);if(bs.length){R.mobs=R.mobs.filter(m=>!m.cb);if(f>=(K.floors||3)){const far=bs.sort((a,b)=>b.y-a.y||0)[bs.length-1];R.mobs.push(far)}}}}catch(e){console.warn(e)}return R}}
 // ---- fighting ----
 const SH=[],TG=[];// fire bolts, slam marks
 const canHurt=()=>!dead&&hurt<=0&&!(typeof ROLLT!=='undefined'&&ROLLT>0)&&!(window.SQDUEL&&SQDUEL.chess);
 const hit=(d,why)=>{if(!canHurt())return;P.hp-=d;hurt=1;try{sfx('hurt')}catch(e){}};
 function act(n,B,dt){const dx=P.x-n.x,dy=(P.y-2)-(n.y-4),dist=Math.hypot(dx,dy);
  // it walks at you itself (the base monster's own walking leaves big monsters alone)
  if(!n.cbc&&dist>12+5*B.sz&&dist<240){const v=38*B.spd/100*dt;try{stepTo(n,dx/dist*v,dy/dist*v)}catch(e){}}
  // contact
  if(dist<10+6*B.sz)hit(B.dmg);
  // a charge in progress
  if(n.cbc){const c=n.cbc;c.t-=dt;if(c.t>0&&c.ph===0){/* winding up */}else if(c.ph===0){c.ph=1;c.t=.45;try{sfx('roar')}catch(e){}}
   else if(c.t>0){try{stepTo(n,c.vx*260*dt,c.vy*260*dt)}catch(e){}if(dist<14+6*B.sz)hit(B.dmg+1)}else n.cbc=null;return}
  n.cbt-=dt;if(n.cbt>0||!B.atk.length||dist>190)return;n.cbt=B.cd*(.8+Math.random()*.4);const a=B.atk[Math.floor(Math.random()*B.atk.length)];
  if(a==='ring'){const k=10,o=Math.random()*6.28;for(let i=0;i<k;i++){const ang=o+i/k*6.283;SH.push({x:n.x,y:n.y-6*B.sz,vx:Math.cos(ang)*95,vy:Math.sin(ang)*95,t:2.4,d:B.dmg})}try{sfx('swish')}catch(e){}}
  else if(a==='charge'){const l=dist||1;n.cbc={vx:dx/l,vy:dy/l,t:.65,ph:0}}
  else if(a==='slam'){TG.push({x:P.x,y:P.y,r:26,t:1.05,d:B.dmg+1});try{sfx('talk')}catch(e){}}
  else if(a==='summon'){const have=en.filter(m=>!m.dead&&m._cbs===n).length;for(let i=0;i<Math.min(2,4-have);i++){let sx=n.x+(i?18:-18),sy=n.y+8;if(solid(sx,sy)){sx=n.x;sy=n.y}const m=rgMake(B.sk,Math.max(4,Math.round(B.hp/12)),sx,sy);m._cbs=n;delete m.night;if(n.zc)m.zc=n.zc;try{RG_OWN.add(m)}catch(e){}en.push(m)}}}
 {const _u=upd;upd=function(dt){let pos=null;const L=[];try{if(!menuOpen&&!pnOpen&&!dead)for(const n of en){if(!n||!n.cb||n.dead||n._rp)continue;const B=CB[n.cb];if(!B)continue;if(away(B)){n.dead=1;n.dropped=1;continue}L.push([n,B,n.x,n.y])}}catch(e){}
   const out=_u.apply(this,arguments);if(menuOpen||pnOpen)return out;
   try{for(const[n,B,x,y]of L){if(n.dead)continue;act(n,B,dt)}
    for(let i=SH.length-1;i>=0;i--){const s=SH[i];s.x+=s.vx*dt;s.y+=s.vy*dt;s.t-=dt;if(s.t<=0||solid(s.x,s.y)){SH.splice(i,1);continue}if(Math.hypot(s.x-P.x,s.y-(P.y-4))<8){hit(s.d);SH.splice(i,1)}}
    for(let i=TG.length-1;i>=0;i--){const q=TG[i];q.t-=dt;if(q.t<=0){if(Math.hypot(q.x-P.x,(q.y-P.y)*1.6)<q.r)hit(q.d);TG.splice(i,1)}}
    if(!L.length&&!en.some(n=>n&&n.cb&&!n.dead)){SH.length=0;TG.length=0}}catch(e){console.warn(e)}return out}}
 // beaten: remembered, announced
 {const _ed=enemyDrop;enemyDrop=function(n){const out=_ed.apply(this,arguments);try{const B=n&&n.cb&&CB[n.cb];if(B&&!n._rp){DEAD[deadKey(B)]=Date.now()+B.rs*60000;try{localStorage.setItem(LSK,JSON.stringify(DEAD))}catch(e){}
    addXp(0,Math.round(B.hp*2));setTimeout(()=>{try{say('You defeated '+B.n+'!');msgT=5;sfx('quest')}catch(e){}},300);for(const m of en)if(m._cbs===n&&!m.dead){m.dead=1;m.dropped=1}}}catch(e){}return out}}
 // ---- drawing: bigger, a health bar and name, the attacks ----
 {const _ps=pS;pS=function(n,tm){const B=n&&n.cb&&CB[n.cb];if(!B)return _ps.apply(this,arguments);const x=Math.round(n.x),y=Math.round(n.y);
   if(n.cbc&&n.cbc.ph===0){g.save();g.strokeStyle='rgba(255,70,40,'+(.5+.4*Math.sin(tm*30))+')';g.lineWidth=3;g.setLineDash([4,3]);g.beginPath();g.moveTo(x,y);g.lineTo(x+n.cbc.vx*120,y+n.cbc.vy*120);g.stroke();g.restore()}
   g.save();g.translate(x,y);g.scale(B.sz,B.sz);g.translate(-x,-y);try{_ps.apply(this,arguments)}finally{g.restore()}
   const w=Math.round(26+10*B.sz),top=Math.round(y-18*B.sz-14),f=Math.max(0,n.hp/(n.mhp||1));Rg(x-w/2-1,top,w+2,5,'#181018');Rg(x-w/2,top+1,w,3,'#3a1a1a');Rg(x-w/2,top+1,Math.round(w*f),3,'#e04040');
   g.save();g.font='700 6px "Pixelify Sans",monospace';g.textAlign='center';g.lineWidth=2;g.strokeStyle='rgba(0,0,0,.8)';g.strokeText(B.n,x,top-2);g.fillStyle='#ffd8c8';g.fillText(B.n,x,top-2);g.restore()}}
 {const _pP=pP;pP=function(tm){try{for(const q of TG){const p=1-q.t/1.05;g.fillStyle='rgba(255,60,30,'+(.15+.25*p)+')';g.strokeStyle='rgba(255,70,40,.85)';g.lineWidth=1.5;g.beginPath();g.ellipse(q.x,q.y,q.r,q.r/1.6,0,0,6.283);g.fill();g.stroke();
     g.beginPath();g.ellipse(q.x,q.y,q.r*p,q.r*p/1.6,0,0,6.283);g.stroke()}
    for(const s of SH){g.fillStyle='rgba(255,140,40,.35)';g.beginPath();g.arc(s.x,s.y,5,0,6.283);g.fill();Rg(Math.round(s.x)-2,Math.round(s.y)-2,4,4,'#181018');Rg(Math.round(s.x)-1,Math.round(s.y)-1,2,2,'#ffd060')}}catch(e){}return _pP.apply(this,arguments)}}
 window.SQBOSSES={CB,read,get dead(){return DEAD},clear(){DEAD={};try{localStorage.removeItem(LSK)}catch(e){}}};
 // ---- Dev Suite > Bosses ----
 if(!window.SQSUITE||!SQSUITE.addTab)return;const API=SQSUITE.api,{S,E,dset,toast,fail,arm}=API;const ST={sel:null,f:null};
 const sec=()=>S.draft.bosses||(S.draft.bosses={});const slug=n=>'cb_'+(String(n).toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'').slice(0,20)||'boss');
 const ATK=[['ring','Fire ring','a circle of bolts'],['charge','Charge','a marked dash at you'],['slam','Slam','a marked circle where you stand'],['summon','Summon','up to 4 helpers']];
 const mobOpts=(v)=>Object.entries(MOBS()).filter(([k])=>!/^cb:/.test(k)).sort((a,b)=>a[1].n.localeCompare(b[1].n)).map(([k,m])=>'<option value="'+k+'"'+(k===v?' selected':'')+'>'+E(m.n)+'</option>').join('');
 function render(){const L=sec(),ids=Object.keys(L).sort();let h='<div class="dv-spr'+(ST.sel?' dv-has':'')+'"><div class="dv-ls"><button class="dv-b dv-pri" data-cbx="new">+ New boss</button><div class="dv-grid" style="grid-template-columns:1fr">';
  for(const id of ids){const b=L[id],live=S.live&&S.live.bosses&&S.live.bosses[id];h+='<button class="dv-it'+(ST.sel===id?' dv-on':'')+'" data-cbs="'+E(id)+'" style="flex-direction:row;justify-content:flex-start;padding:8px 10px"><i class="dv-bd dv-'+(JSON.stringify(b)===JSON.stringify(live)?'live':'draft')+'">'+(JSON.stringify(b)===JSON.stringify(live)?'LIVE':'DRAFT')+'</i><span style="font-size:13px;text-align:left">👑 '+E(b.n||id)+'</span></button>'}
  if(!ids.length)h+='<p class="dv-mut">No bosses yet.</p>';h+='</div></div><div class="dv-ed">';
  const b=ST.sel&&L[ST.sel];
  if(!b)h+='<div class="dv-card"><b>Make your own bosses.</b><p class="dv-mut">Give it a name, pick a monster it moves like, how tough it is and its attacks. Then draw its look in Monsters (it shows up there as "<i>name</i> (boss)"), set its drops there, and put it on an island: a monster zone in the island builder (set "at once" to 1), or a dungeon entrance\'s monsters (it appears once, on the last floor).</p></div>';
  else{const A=b.atk||{};h+='<div class="dv-card"><div class="dv-row"><b style="font-size:16px">👑 '+E(b.n)+'</b><span class="dv-mut">monster key '+E(keyOf(ST.sel))+'</span></div>'+
   '<p><label class="dv-mut">Name<input type="text" data-cbf="n" maxlength="30" value="'+E(b.n)+'"></label></p>'+
   '<div class="dv-row" style="flex-wrap:wrap"><label class="dv-mut">Moves like<br><select data-cbf="base">'+mobOpts(b.base)+'</select></label>'+
   '<label class="dv-mut">Health<br><input type="number" data-cbf="hp" min="10" max="5000" value="'+(b.hp||80)+'" style="width:80px"></label>'+
   '<label class="dv-mut">Size ×<br><input type="number" data-cbf="sz" min="1" max="3" step="0.1" value="'+(b.sz||1.6)+'" style="width:70px"></label>'+
   '<label class="dv-mut">Damage per hit<br><input type="number" data-cbf="dmg" min="1" max="6" value="'+(b.dmg||2)+'" style="width:70px"></label>'+
   '<label class="dv-mut">Speed %<br><input type="number" data-cbf="spd" min="30" max="300" value="'+(b.spd||100)+'" style="width:70px"></label>'+
   '<label class="dv-mut">Seconds between attacks<br><input type="number" data-cbf="cd" min="1.5" max="20" step="0.5" value="'+(b.cd||4)+'" style="width:70px"></label>'+
   '<label class="dv-mut">Comes back after (minutes)<br><input type="number" data-cbf="rs" min="1" max="240" value="'+(b.rs||15)+'" style="width:70px"></label></div>'+
   '<p style="margin:8px 0 2px"><b>Attacks</b></p>'+ATK.map(([k,n,d])=>'<label class="dv-mut" style="display:block"><input type="checkbox" data-cba="'+k+'"'+(A[k]?' checked':'')+'> '+n+' <small>('+d+')</small></label>').join('')+
   '<label class="dv-mut">Summons<br><select data-cbf="sk">'+mobOpts(b.sk||b.base)+'</select></label>'+
   '<div class="dv-row" style="margin-top:10px"><button class="dv-b dv-pri" data-cbx="save">Save to draft</button><button class="dv-b" data-cbx="look">Draw its look (Monsters)</button><button class="dv-b '+(S.arm==='cbdel'?'dv-arm':'dv-bad')+'" data-cbx="del">'+(S.arm==='cbdel'?'Tap again to delete':'Delete boss')+'</button></div>'+
   '<p class="dv-mut">A new or renamed boss shows up in Monsters and the island builder once it is saved and "Show unpublished edits in my game" is on, or after you publish.</p></div>'}
  return h+'</div></div>'}
 function grab(){const b=Object.assign({},sec()[ST.sel]),r=document.getElementById('dvs');const v=f=>{const i=r.querySelector('[data-cbf="'+f+'"]');return i?i.value:''};
  b.n=clean(v('n'),30)||b.n;b.base=v('base')||b.base;b.hp=num(v('hp'),10,5000,80)|0;b.sz=num(v('sz'),1,3,1.6);b.dmg=num(v('dmg'),1,6,2)|0;b.spd=num(v('spd'),30,300,100)|0;b.cd=num(v('cd'),1.5,20,4);b.rs=num(v('rs'),1,240,15)|0;b.sk=v('sk')||b.base;
  b.atk={};for(const[k]of ATK){const c=r.querySelector('[data-cba="'+k+'"]');if(c&&c.checked)b.atk[k]=1}return b}
 async function save(b){sec()[ST.sel]=b;try{await dset('draft/bosses/'+ST.sel,b);toast('Saved to draft. Publish it from the Publish tab.')}catch(e){fail(e)}if(window.SQA&&SQA.previewing)SQA.preview(S.draft);API.draw()}
 document.addEventListener('click',e=>{if(S.tab!=='bosses')return;const t=e.target.closest('[data-cbx],[data-cbs]');if(!t||!document.getElementById('dvs').contains(t))return;
  if(t.dataset.cbs){ST.sel=t.dataset.cbs;API.draw();return}const a=t.dataset.cbx;
  if(a==='new'){let n='New Boss',id=slug(n),k=2;while(sec()[id])id=slug(n+' '+(k++));ST.sel=id;save({n:'Boss '+(Object.keys(sec()).length+1),base:'wolf',hp:80,sz:1.6,dmg:2,spd:100,cd:4,rs:15,atk:{ring:1,slam:1},sk:'wolf'});return}
  if(a==='save'){save(grab());return}
  if(a==='look'){const k='m:'+keyOf(ST.sel);if(window.SQA)SQA.preview(S.draft);S.tab='monsters';API.draw();setTimeout(()=>{const b=document.querySelector('#dvs [data-k="'+k+'"]');if(b)b.click();else toast('Save the boss and turn on "Show unpublished edits in my game" first.')},300);return}
  if(a==='del')return arm('cbdel',async()=>{const id=ST.sel;delete sec()[id];try{await dset('draft/bosses/'+id,null);toast('Boss deleted from your draft.')}catch(e2){fail(e2)}ST.sel=null;API.draw()})},true);
 SQSUITE.addTab('bosses','Bosses',{render,changes(L,D){const out=[],l=L&&L.bosses||{},d=D&&D.bosses||{};for(const id of new Set([...Object.keys(l),...Object.keys(d)]))if(JSON.stringify(l[id])!==JSON.stringify(d[id]))out.push({kind:'ext',html:'👑 Boss '+E((d[id]||l[id]).n||id)+': '+(d[id]?(l[id]?'changed':'new'):'removed')});return out}})})();
