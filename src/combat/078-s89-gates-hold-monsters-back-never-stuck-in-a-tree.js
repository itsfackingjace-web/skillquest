// ---------------------------------------------------------------- 89. Gates hold monsters back; never stuck in a tree
// A gate opens only for players walking through it: monsters (and anything else that isn't a player stepping through)
// find it shut, on Hollow and on every island. And if a tree or rock ever grows back right where you're standing
// (another player's chopped tree returning, for instance), you're gently moved to the nearest open spot.
const gateAt=(px,py)=>{const x=Math.floor(px/16),y=Math.floor(py/16),R=rbR();
 if(R){const s=rbMap(R.region).get(rbK(x,y));if(s)return s.t==='door';const f=rbForeignAt(R.region,x,y);return!!(f&&f.t==='door')}
 if(SCENE)return false;if(x<0||y<0||x>=N||y>=N)return false;const s=STR.get(y*N+x);return!!(s&&s.t==='door')};
const playerProbe=(px,py)=>Math.abs(px-P.x)<=8&&py-P.y>=-6&&py-P.y<=9;   // the corners of your own step
{const _s=solid;solid=function(px,py){if(gateAt(px,py))return!playerProbe(px,py)||dead;return _s(px,py)}}
{const okAt=(x,y)=>!(solid(x-5,y-3)||solid(x+5,y-3)||solid(x-5,y+6)||solid(x+5,y+6));let chk=0;
 const _u=upd;upd=function(dt){_u(dt);if(dead||menuOpen||pnOpen||TRAVEL49||(chk-=dt)>0)return;chk=.25;const R=SCENE&&SCENE.room;if(SCENE&&!(R&&R.region))return;
  if(SAILING||RSAIL.on)return;if(okAt(P.x,P.y))return;
  // only rescue from things that grow back (trees, rocks, ores, bushes)
  const tx=Math.floor(P.x/16),ty=Math.floor((P.y+2)/16);let grown=false;for(let b=-1;b<=1&&!grown;b++)for(let a=-1;a<=1;a++){const o=R?rgObjAt(R,tx+a,ty+b):obj[(ty+b)*N+tx+a];if(o){grown=true;break}}if(!grown)return;
  for(let r=4;r<=48;r+=2)for(let k=0;k<16;k++){const an=k/16*6.283,x=P.x+Math.cos(an)*r,y=P.y+Math.sin(an)*r;if(okAt(x,y)){P.x=x;P.y=y;say('You squeeze out from under the branches.');return}}}}
// ---- the Stone Sledgehammer: the Stone Giant's second rare drop (5% for everyone who fought, 8% for the top three) ----
{const _wl=wbLoot;wbLoot=function(b){const me=MP.user&&MP.user.uid,ok=b&&b.type==='giant'&&WB.dmg>=1&&!WB.claimed[b.slot];let top=false;
  if(ok){const rank=Object.entries(Object.assign({},WB.all,{[me]:WB.dmg})).sort((a,c)=>c[1]-a[1]).findIndex(e=>e[0]===me)+1;top=rank>0&&rank<=3}
  _wl(b);if(ok&&(Math.random()<(top?.08:.05)||window.SQSLEDGEDROP)){inv.eq_sledge=(inv.eq_sledge|0)+1;setTimeout(()=>{say('A STONE SLEDGEHAMMER! Wield it: your ultimate becomes a Ground Slam, and it breaks boulders.');msgT=6;try{sfx('level')}catch(e){}},900);try{saveLocal(true);saveCloud(true)}catch(e){}}}}
// ---- Hollow Island is twice as big: other players' houses and builds published before the change are scaled up ----
{const sc=i=>{const x=i%110,y=(i/110)|0;return(y*HSC)*N+x*HSC};
 const _hs=housesSync;housesSync=function(){try{for(const o in HS.data){const L=HS.data[o];if(Array.isArray(L))for(const e of L)if(e&&!e.s2&&!e._t2&&isFinite(e.x)&&isFinite(e.y)){e.x*=HSC;e.y*=HSC;e._t2=1}}}catch(e){}return _hs()};
 const _bs=buildSync;buildSync=function(){try{for(const o in BLDS.data){const r=BLDS.data[o];if(!r||r.h===2||r._t2||!r.s)continue;r._t2=1;for(const e of(Array.isArray(r.s)?r.s:Object.values(r.s)))if(e&&e[0]!=null)e[0]=sc(e[0]|0)}}catch(e){}return _bs()};
 // old public plots (farm/hollow) move once to farm/hollow2, by whoever gets there first
 let tried=false;window.sfMigrateHollow=function(old,cur){if(tried||!old||typeof old!=='object'||!Object.keys(old).length||!MP.on||!FB.db.runTransaction)return;tried=true;
  const d=FB.db;d.runTransaction(d.ref(FB.D,'farm/_meta/hollow2'),c=>c?undefined:{c:'moved',t:Date.now()}).then(r=>{if(!r||!r.committed)return;
   for(const k in old){const m=/^(\d+)_(\d+)$/.exec(k);if(!m)continue;const x=+m[1]*HSC,y=+m[2]*HSC,i=y*N+x,nk=x+'_'+y;
    if(x>0&&y>0&&x<N-1&&y<N-1&&tile[i]!==0&&tile[i]!==3&&!PROT.has(i)&&!BS.has(i)&&!(cur&&cur[nk])){const r0=old[k];if(r0&&typeof r0==='object')d.set(d.ref(FB.D,'farm/hollow2/'+nk),sfClean(r0)).catch(()=>{})}
    d.remove(d.ref(FB.D,'farm/hollow/'+k)).catch(()=>{})}}).catch(e=>console.warn(e))}}
