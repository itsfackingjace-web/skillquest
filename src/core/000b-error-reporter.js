// ---- Error reporter (window.SQERR), runs before everything else ----
// Most sections guard risky calls with try/catch. Every catch that used to swallow its error silently now hands it here as
// SQERR(error, '<file>-<n>') (added by tools/refactor/tag-catches.cjs: rerun it after adding new `catch(e){}`; write
// `catch(e){/*quiet*/}` for a catch that is expected to fire). Uncaught errors from the game page come in as 'uncaught'/'promise'.
// Everything is counted locally (SQERR.log: site -> {m,n}). Code mistakes (TypeError, ReferenceError, RangeError) are also sent,
// once per site per session and at most 6 sites a session, as `errs/<site>` {m message + where, n count (+1 in a transaction), v
// game version, t}: no account, no player data. Dev Suite > Errors lists them. Rules: `errs` (publish them).
(function(){const LOG=new Map(),SENT=new Set(),Q=[];let sentN=0;
 const CODE=/^(TypeError|ReferenceError|RangeError)$/,BENIGN=/AudioContext|NotAllowedError|play\(\) request|QuotaExceeded|The operation is insecure|Failed to fetch|NetworkError|Load failed|ResizeObserver|Permission denied|The user aborted|AbortError/i;
 function where(e){try{const s=String(e&&e.stack||'').split('\n').find(l=>/:\d+:\d+/.test(l)&&!/000b|SQERR/.test(l));const m=s&&s.match(/:(\d+):(\d+)\)?\s*$/);return m?' @'+m[1]+':'+m[2]:''}catch(_){return''}}
 function send(site,msg){const F=self.SQFB,MP=self.SQMP;if(!F||!F.db||!MP||!MP.user){if(Q.length<10)Q.push([site,msg]);return}
  try{const d=F.db,r=d.ref(F.D,'errs/'+site);d.runTransaction(r,cur=>{const o=cur&&typeof cur==='object'?cur:{};return{m:msg,n:Math.min(1e9,(+o.n||0)+1),v:String(self.SQVER||'').slice(0,20),t:d.serverTimestamp()}}).catch(()=>{})}catch(_){/*quiet*/}}
 function SQERR(e,site){try{site=String(site||'x').replace(/[^A-Za-z0-9_-]/g,'_').slice(0,40);const name=e&&e.name||'Error',msg=(name+': '+String(e&&e.message||e)).slice(0,220);
   let L=LOG.get(site);if(!L){L={m:msg,n:0,w:where(e)};LOG.set(site,L)}L.n++;
   if(!CODE.test(name)||BENIGN.test(msg)||SENT.has(site)||sentN>=6)return;SENT.add(site);sentN++;send(site,(msg+L.w).slice(0,300))}catch(_){/*quiet*/}}
 SQERR.log=LOG;SQERR.flush=()=>{const q=Q.splice(0);for(const[s,m]of q)send(s,m)};
 SQERR.list=()=>[...LOG].map(([s,v])=>s+' ×'+v.n+' '+v.m+v.w);
 self.SQERR=SQERR;
 addEventListener('error',ev=>{if(ev.filename&&!ev.filename.startsWith(location.origin))return;SQERR(ev.error||{name:'Error',message:ev.message},'uncaught')});
 addEventListener('unhandledrejection',ev=>{const r=ev.reason;if(r&&CODE.test(r.name))SQERR(r,'promise')});
 setInterval(()=>{if(Q.length&&self.SQMP&&SQMP.user)SQERR.flush()},5000)})();
