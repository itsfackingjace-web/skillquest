// ---- 245. Song zones (window.SQSONGZONES) ----
// The island builder (111c) can draw song zones like monster zones: `sz` = [{x,y,w,h,s (song key), n (place name)}] on custom islands
// (`islands.cu_<id>`, builder coordinates + ISL_PAD like 117's monster zones), edits of built-in islands (`islands.ed_<region>`, region
// tiles) and Hollow (`islands.ed_hollow`, Hollow tiles). While you stand outdoors inside one, the outermost wantSong plays its song
// (built-in or a library song, see 165) instead of the area's own; a boss nearby and sailing still win. The place name, if any, is
// said once when you walk in. Zones later in the list win where they overlap.
(()=>{let ISL={};const A=()=>window.SQA;
 if(window.SQA&&SQA.onApply)SQA.onApply(lib=>{ISL=lib&&lib.islands||{}});
 const arr=a=>Array.isArray(a)?a:[];
 // the zone you're standing in right now, or null
 function here(){try{if(typeof dead!=='undefined'&&dead)return null;let L=null,pad=0,tx,ty;
   if(!SCENE){if(typeof SAILING!=='undefined'&&SAILING)return null;L=ISL.ed_hollow;tx=Math.floor(P.x/16);ty=Math.floor(P.y/16)}
   else{const R=SCENE.room,rg=R&&R.region;if(!rg||SCENE.id==='home')return null;if(ISL[rg]&&/^cu_/.test(rg)){L=ISL[rg];pad=A()&&A().ISL_PAD|0}else L=ISL['ed_'+rg];tx=Math.floor(P.x/16)-pad;ty=Math.floor(P.y/16)-pad}
   if(!L)return null;const Z=arr(L.sz);for(let i=Z.length-1;i>=0;i--){const z=Z[i];if(z&&z.s&&tx>=(z.x|0)&&ty>=(z.y|0)&&tx<(z.x|0)+Math.max(1,z.w|0)&&ty<(z.y|0)+Math.max(1,z.h|0))return z}}catch(e){}return null}
 let last=null;
 {const _w=wantSong;wantSong=function(){const w=_w.apply(this,arguments);if(w==='boss'||w==='sail')return w;const z=here();
   if(z!==last){if(z&&z.n&&(!last||last.n!==z.n))try{say(String(z.n).slice(0,40))}catch(e){}last=z}
   return z&&window.SQMUSIC&&SQMUSIC.S[z.s]?z.s:w}}
 window.SQSONGZONES={here}})();
