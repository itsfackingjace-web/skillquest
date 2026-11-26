// ---- Section 292: report lost progress and vanished pets (Nov 26, Kevin's adamant golem, Joe's revert) ----
// Report only: changes nothing in the game. Kevin's equipped golem disappeared on Nov 25 and no replay lost it: his backups show it
// equipped on one device, then a save from another device without it; Joe lost an hour moving from phone to PC. Both look like progress
// that never reached the account before another device took over (290 now saves behind screens, the likely cause). Two reports, once
// a session each, to `bugs` as "[auto] ...":
// - "Another device took over before this one saved": when this game stops because the account opened elsewhere (SQSTRICT.lost) and
//   its pets differ from what the last account save (006/040's `lastCloud`) held, or its gold, XP or item count do and that save is over
//   30 s old (saves go out every 15 s): what was lost, and how long ago that save was.
// - "Pet vanished": a load (signed in) replaced your save with one that doesn't have the pet in your PET slot: the loaded save's device
//   and time. (While playing, 104 always moves a pet that leaves the slot into the bag, and selling, trading and releasing work only from
//   the bag, so the slot itself can't lose one.)
// The last 12 messages go with each report.
(()=>{const C=()=>window.LUX&&LUX.COS,LOG=[],sent={};let lc=null,at=0,sum=null,wasLost=false;
 const _s=say;say=function(t){try{LOG.push(String(t==null?'':typeof t==='string'?t:JSON.stringify(t)).slice(0,80));if(LOG.length>12)LOG.shift()}catch(e){/*quiet*/}return _s.apply(this,arguments)};
 const has=k=>{const c=C();return!!k&&(!!(c&&c.pet===k)||(inv['pet_'+k]|0)>0)};
 const pets=()=>{const c=C(),o=Object.keys(inv).filter(q=>/^pet_/.test(q)&&inv[q]>0).map(q=>q.slice(4));if(c&&c.pet&&!o.includes(c.pet))o.push(c.pet);return o.sort()};
 function summary(){let it=0,xp=0;for(const k in inv)it+=Math.max(0,+inv[k]||0);for(const v of XPS)xp+=+v||0;return{gold:Math.round(+GLD||0),xp:Math.round(xp),items:Math.round(it),pets:pets()}}
 function report(kind,extra){if(sent[kind])return;sent[kind]=1;window.SQPETWATCH.n++;window.SQPETWATCH.last=kind;
  try{const MP=window.SQMP,F=window.SQFB;if(!MP||!MP.user||!F)return;const d=F.db;
   const what=('[auto] '+kind+' '+JSON.stringify(Object.assign({ver:window.SQVER,scene:(typeof SCENE!=='undefined'&&SCENE&&SCENE.id)||'',screen:!!pnOpen,said:LOG.slice()},extra||{}))).slice(0,1500);
   d.push(d.ref(F.D,'bugs'),{what,u:MP.user.uid,n:String(MP.user.displayName||'').split(' ')[0].slice(0,12),t:d.serverTimestamp()}).catch(()=>{})}catch(e){self.SQERR&&SQERR(e,'292-1')}}
 setInterval(()=>{try{if(typeof lastCloud==='undefined')return;
  if(lastCloud!==lc){lc=lastCloud;if(lc){at=Date.now();sum=summary()}}// the account just got this game's save
  const lost=!!(window.SQSTRICT&&SQSTRICT.lost);
  if(lost&&!wasLost&&sum){const now=summary(),diff={};for(const k of['gold','xp','items'])if(now[k]!==sum[k])diff[k]=now[k]-sum[k];
   const gone=sum.pets.filter(p=>!now.pets.includes(p)),got=now.pets.filter(p=>!sum.pets.includes(p));if(gone.length)diff.petsGone=gone;if(got.length)diff.petsNew=got;
   if(Object.keys(diff).length&&(gone.length||got.length||Date.now()-at>30000))report('Another device took over before this one saved',{lost:diff,savedAgo:Math.round((Date.now()-at)/1000)})}
  wasLost=lost}catch(e){self.SQERR&&SQERR(e,'292-2')}},1000);
 SQLOAD.wrap('292 pet watch',next=>function(S){const c0=C(),k=c0&&c0.pet||null,MP=window.SQMP,on=!!(MP&&MP.user&&MP.on);
  try{return next.apply(this,arguments)}finally{try{if(k&&on&&!has(k))report('Pet vanished: '+k,{save:{at:S&&S.savedAt||0,dev:S&&S.dev||'',pet:S&&S.cos&&S.cos.pet||null}})}catch(e){self.SQERR&&SQERR(e,'292-3')}}});
 window.SQPETWATCH={n:0,last:'',get log(){return LOG.slice()}};
})();
