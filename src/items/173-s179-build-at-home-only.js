// ---- 179. Building only at home ----
// Walls, fences, gates, chests, beds, stations, benches and furniture can only be placed inside your own house or castle
// and in its backyard/courtyard (013's home scenes: SCENE.id==='home', which yards are too). Houses and castles themselves,
// and seeds (farm plots), still go outside. What a save still has built outside (Hollow's STR, the islands' RB from 065,
// window.SQRB) is packed into the bag once on load, chests with everything inside, and saved; the message says
// what came back. 061's buildSync and 065's rbForeign no longer show other players' old outdoor builds, so builds of
// players who don't come back disappear for everyone too (build/<uid>.s/.r stay in the database but nothing reads them).
(()=>{const FREE=k=>k==='house'||k==='castle'||(typeof isSeed==='function'&&isSeed(k))||(typeof SEED2CROP!=='undefined'&&!!SEED2CROP[k]);
 const atHome=()=>!!(SCENE&&SCENE.id==='home'&&SCENE.house);
 const MSG='You can only build inside your own house or castle, or in its backyard. Walk in through your door first.';
 {const _sb=startBuild;startBuild=function(k){if(!FREE(k)&&!atHome()&&(inv[k]|0)>0){say(MSG);msgT=6;try{sfx('swish')}catch(e){}try{closePanel()}catch(e){}return}return _sb.apply(this,arguments)}}
 // a build mode started at home that somehow carries outside stops there
 {const _pb=placeBuild;placeBuild=function(){if(BUILD&&!FREE(BUILD.k)&&!atHome()){endBuild(MSG);return}return _pb.apply(this,arguments)}}
 // descriptions that still said "or outside"
 for(const k of BK)if(typeof IDESC[k]==='string')IDESC[k]=IDESC[k].replace('Place it in your house or outside,','Place it in your house, castle or backyard,');
 // ---- packing what is still built outside ----
 function back(s,got){inv[s.t]=(inv[s.t]|0)+1;got[s.t]=(got[s.t]|0)+1;let any=false;if(s.items)for(const k in s.items){const n=s.items[k]|0;if(n>0){inv[k]=(inv[k]|0)+n;any=true}}return any}
 function packAll(){const got={};let inside=false,n=0;
  for(const[i,s]of[...STR]){if(!s||s._foreign||FREE(s.t))continue;STR.delete(i);if(BEDSP===i)BEDSP=-1;if(back(s,got))inside=true;n++}
  const R=window.SQRB;if(R)for(const id in R){const m=R[id];for(const[key,s]of[...m]){if(!s||FREE(s.t))continue;m.delete(key);if(back(s,got))inside=true;n++}}
  if(n){try{rbSolidSync()}catch(e){}
   const nm=k=>String(INAME[k]||k).toLowerCase(),pl=k=>(typeof SN!=='undefined'&&SN[k])?SN[k].toLowerCase():nm(k).replace(/(ch|sh|s|x)$/,'$1e')+'s';
   const list=Object.entries(got).map(([k,c])=>c+' '+(c>1?pl(k):nm(k))).join(', ');
   const m='Building outside isn\'t allowed any more, so what you had built outside was packed into your bag: '+list+(inside?' (with everything that was inside)':'')+'. Place them in your house, castle or backyard.';
   setTimeout(()=>{try{say(m);msgT=10;try{mpLog('game',m)}catch(e){}saveLocal(true);saveCloud(true)}catch(e){}},3000)}
  return n}
 {const _ap=applySave;applySave=function(S){const out=_ap.apply(this,arguments);try{packAll()}catch(e){console.warn(e)}return out}}
 window.SQHOMEBUILD={packAll,atHome,FREE}})();
