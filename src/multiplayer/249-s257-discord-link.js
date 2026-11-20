// ---- 257. Discord roles: link your Discord account (window.SQDLINK) ----
// The SQ Bot (tools/discord/sync-roles.mjs, run every 30 minutes by GitHub Actions) gives linked Discord members roles for their
// Total Level, their guild, Patron, and game Moderator / Developer. It needs no database password: it reads only public data.
// - Options > ONLINE > "Link Discord" makes a random 8-letter code and writes `dlink/<code>` = {u: your uid, t: server time}. Anyone
//   can read one code they already know, nobody can list them, and only you can write yours. Post the code in #link on the
//   SkillQuest Discord; the bot looks it up and links the Discord member who posted it first (codes work for a day).
// - The public leaderboard row (`lb/<uid>`, 068) now also carries what the roles need, and the rules only accept true values:
//   gid/gn/gt your guild's id, name and tag (you must be a member), pa:1 + pu (paid-through time) when you're a patron,
//   mo:1 a game moderator, dv:1 a developer. 068 calls window.SQLBX hooks while building the row.
(()=>{const AB='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',LS='sq_dlink';
 const me=()=>window.SQMP&&SQMP.user&&SQMP.user.uid;
 // ---- leaderboard fields ----
 (window.SQLBX=window.SQLBX||[]).push(row=>{const u=me();if(!u)return;
  try{const G=window.SQGUILD&&SQGUILD.state;if(G&&G.id&&G.ready&&G.info&&G.m&&G.m[u]){row.gid=G.id;row.gn=String(G.info.n||'');row.gt=String(G.info.tag||'')}}catch(e){self.SQERR&&SQERR(e,'249-1')}
  try{const P=window.SQPATRON;if(P&&P.active(u)){const r=P.rec(u);row.pa=1;row.pu=r.u}}catch(e){self.SQERR&&SQERR(e,'249-2')}
  try{if(window.SQMODS&&SQMODS.isMod)row.mo=1}catch(e){self.SQERR&&SQERR(e,'249-3')}
  try{if(window.SQDEV&&SQDEV())row.dv=1}catch(e){self.SQERR&&SQERR(e,'249-4')}});
 // ---- the link code ----
 let CODE=null,BUSY=false,ERR='';// CODE: {c, at}
 try{const s=JSON.parse(localStorage.getItem(LS)||'null');if(s&&typeof s.c==='string'&&Date.now()-s.at<864e5)CODE=s}catch(e){self.SQERR&&SQERR(e,'249-5')}
 const mk=()=>{const a=new Uint32Array(8);crypto.getRandomValues(a);return Array.from(a,v=>AB[v%AB.length]).join('')};
 async function make(){const F=window.SQFB,u=me();if(!F||!u){ERR='Sign in first: the code is tied to your account.';return null}
  BUSY=true;ERR='';try{const old=CODE&&CODE.c;if(old)try{await F.db.remove(F.db.ref(F.D,'dlink/'+old))}catch(e){/*quiet*/}
   const c=mk();await F.db.set(F.db.ref(F.D,'dlink/'+c),{u,t:F.db.serverTimestamp()});CODE={c,at:Date.now()};try{localStorage.setItem(LS,JSON.stringify(CODE))}catch(e){self.SQERR&&SQERR(e,'249-6')}return c}
  catch(e){ERR='Couldn\'t make a code ('+String(e&&e.message||e).slice(0,60)+'). Try again in a moment.';return null}finally{BUSY=false}}
 SQOPTS.wrap('249',_o=>function(){const h=_o();if(!me())return h;
  const box='<div class="sqdl"><button class="sb sqdl-btn">'+(BUSY?'Making a code...':CODE?'Link Discord: new code':'Link Discord (roles on our server)')+'</button>'
   +(CODE?'<div class="qc sqdl-code">Your code: <b>'+CODE.c+'</b><br><small>Post it in <b>#link</b> on the SkillQuest Discord. Within half an hour you get roles for your Total Level, guild and more. The code works for a day.</small></div>':'')
   +(ERR?'<div class="qc sqdl-code"><small>'+ERR+'</small></div>':'')+'</div>';
  const k=h.indexOf('data-a="switch">Switch Google account</button>');if(k<0)return h+box;const e=h.indexOf('</button>',k)+9;return h.slice(0,e)+box+h.slice(e)});
 pbd.addEventListener('click',async ev=>{if(!ev.target.closest('.sqdl-btn'))return;ev.stopPropagation();if(BUSY)return;const p=make();try{rPn()}catch(e){self.SQERR&&SQERR(e,'249-7')}
  const c=await p;try{sfx(c?'quest':'swish')}catch(e){self.SQERR&&SQERR(e,'249-8')}if(c){try{navigator.clipboard&&navigator.clipboard.writeText(c).catch(()=>{})}catch(e){/*quiet*/}say('Your Discord code is '+c+' (copied). Post it in #link on the SkillQuest Discord.');msgT=8}try{rPn()}catch(e){self.SQERR&&SQERR(e,'249-9')}},true);
 const st=document.createElement('style');st.textContent='.sqdl{margin-top:8px}.sqdl-code{font-size:14px;line-height:1.4;padding:8px 12px;margin:6px 0}.sqdl-code b{letter-spacing:2px;color:#3058c8}';document.head.appendChild(st);
 window.SQDLINK={make,get code(){return CODE&&CODE.c},AB}})();
