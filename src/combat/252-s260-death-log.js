// ---- 260. Death log: every fall is written down with what did it (window.SQDEATHS) ----
// Nov 20: "the game should log when a player dies, along with what exactly killed them". The moment you fall (dead turns on, the
// same 100 ms watch 063's graves use, and before 001's reset when you get up quickly), one record goes to `deaths/<push id>`:
//   u, n    your uid and first name (as bug reports)       t   server time
//   w, x, y where (island / room id) and your position     lv  total level      dk  1 at night      v  the game version
//   by      what got you: the message of the last hit in the 10 s before (227's SQGHOSTHIT.hits), else the last message
//   m, md, ms  the monster nearest you at that hit: its kind (rk or type), how far (px) and how long since it was last drawn on
//           screen (ms, -1 = never: one you couldn't see)       h   how many hits in those 10 s
// Only developers read them (Dev Suite > Admin > Deaths); 209's cleanup drops records older than 90 days. Rules: `deaths`.
(()=>{let logged=false;const LAST={by:'',m:''};
 function where(){const R=SCENE&&SCENE.room;return String(R&&R.region||(SCENE&&(SCENE.house?'house':SCENE.id))||'hollow').slice(0,24)}
 function totalLv(){try{let s=0;for(let i=0;i<SKN.length;i++)s+=lvOf(i);return s}catch(e){return 0}}
 function cause(){const now=performance.now(),G=window.SQGHOSTHIT,hits=G&&G.hits?G.hits.filter(h=>now-h.at<10000):[];
  const last=hits[hits.length-1],o={by:'',h:hits.length};
  if(last){o.by=last.msg||'';const m=last.m&&last.m[0];if(m){o.m=String(m.rk||m.type||'?').slice(0,24);o.md=m.d|0;o.ms=m.seen|0}}
  if(!o.by&&typeof msg==='string'&&msgT>0)o.by=msg;o.by=String(o.by||'unknown').replace(/\s+/g,' ').slice(0,60);return o}
 function record(){if(logged)return;logged=true;try{if(typeof NEWG!=='undefined'&&NEWG)return;const c=cause();LAST.by=c.by;LAST.m=c.m||'';
   const MP=window.SQMP,F=window.SQFB;if(!MP||!MP.user||!F)return;const d=F.db;let dk=0;try{dk=dark()>.3?1:0}catch(e){/*quiet*/}
   const r=Object.assign({u:MP.user.uid,n:String(MP.user.displayName||'').split(' ')[0].slice(0,12),t:d.serverTimestamp(),w:where(),x:Math.round(P.x)||0,y:Math.round(P.y)||0,lv:totalLv(),dk,v:String(window.SQVER||'').slice(0,20)},c);
   d.push(d.ref(F.D,'deaths'),r).catch(e=>{self.SQERR&&SQERR(e,'252-1')})}catch(e){self.SQERR&&SQERR(e,'252-2')}}
 setInterval(()=>{if(!dead){logged=false;return}record()},100);
 {const _rs=reset;reset=function(){if(dead)try{record()}catch(e){self.SQERR&&SQERR(e,'252-3')}return _rs.apply(this,arguments)}}
 window.SQDEATHS={record,cause,get last(){return LAST}}})();
