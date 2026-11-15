// ---- 216. Chat filter: swear words, slurs and contact details are starred out before a message is sent ----
// `SQFILTER.clean(text)` → the text with matches replaced by *. Long words match anywhere in a message, even split up or
// disguised ("f.u.c.k", "fuuuck", "sh1t": letters only, leetspeak mapped, repeated letters squashed); short ones only as a
// whole word, so "class", "Dickens" or "cocktail" stay. Email addresses, phone numbers and web links (other than
// skillquestmmo.com) are starred too. Used for chat (window.mpSend, guild and party chat), character names (061's #nmf
// form refuses a name that would be starred) and chest names (204 calls window.SQCHNAME).
(()=>{// stored lightly scrambled (each letter shifted by 1) so the list doesn't read as a block of slurs in the source
 const un=s=>s.split(',').map(w=>w.replace(/[a-z]/g,c=>String.fromCharCode((c.charCodeAt(0)-98+26)%26+97)));
 const ANY=un('gvdl,tiju,cjudi,dvou,bttipmf,cbtubse,tmvu,xipsf,gbhhpu,ojhhfs,ojhhb,sfubse,ejmep,qfojt,wbhjob,qpso,uxbu,xbol,npuifsgvdlfs,ejdlifbe,qvttz,tifnbmf,dvntmvu,kfsl pgg,hp ejf,ljmm zpvstfmg,ljmm vstfmg');
 const WORD=un('gbh,ejdl,dpdl,dvn,lzt,tfy,ujut,cppct,btt,sbqf,sbqjtu,obaj,ljlf,dijol,tqjd,usbooz,ezlf,ipf,uxbut,qjtt,qsjdl,ujuuz,ujuujft,dvdl,ovef,oveft,ipsoz');
 const LEET={'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','@':'a','$':'s','!':'i','|':'i','8':'b','9':'g'};
 const sq=s=>s.replace(/(.)\1+/g,'$1');
 const ANYN=ANY.map(w=>sq(w.replace(/[^a-z]/g,''))),WORDN=new Set(WORD.map(w=>sq(w.replace(/[^a-z]/g,''))));
 const SAFE=/^(?:https?:\/\/)?(?:www\.)?skillquestmmo\.com\b/i;
 function clean(text){let s=String(text==null?'':text);if(!s)return s;const m=s.split('');
  // letters only, leetspeak mapped, repeats squashed, each kept letter remembering where it came from
  const n=[],at=[];for(let i=0;i<m.length;i++){let c=m[i].toLowerCase();c=LEET[c]||c;if(!/[a-z]/.test(c))continue;if(n.length&&n[n.length-1]===c){continue}n.push(c);at.push(i)}
  const ns=n.join('');
  for(const w of ANYN){if(!w)continue;let k=ns.indexOf(w);while(k>=0){const a=at[k],b=k+w.length<at.length?at[k+w.length]-1:m.length-1;for(let i=a;i<=b;i++)if(/\S/.test(m[i]))m[i]='*';k=ns.indexOf(w,k+1)}}
  // whole words (plurals too)
  s=m.join('');s=s.replace(/\S+/g,tok=>{const t=sq(tok.toLowerCase().replace(/^[^a-z0-9@$]+|[^a-z0-9@$]+$/g,'').split('').map(c=>LEET[c]||c).join('').replace(/[^a-z]/g,''));if(t&&(WORDN.has(t)||(t.endsWith('s')&&WORDN.has(t.slice(0,-1)))||(t.endsWith('es')&&WORDN.has(t.slice(0,-2)))))return tok.replace(/[^\s]/g,'*');return tok});
  // contact details
  s=s.replace(/[\w.+-]+\s*(?:@|\(at\)|\[at\])\s*[\w-]+\s*(?:\.|\(dot\)|\[dot\])\s*[a-z]{2,}/gi,x=>'*'.repeat(x.length));
  s=s.replace(/(?:\+?\d[\s().-]*){7,}/g,x=>/\d{7,}|\d[\s().-]+\d/.test(x)&&x.replace(/\D/g,'').length>=7?'*'.repeat(x.length):x);
  s=s.replace(/\b(?:https?:\/\/|www\.)\S+|\b[\w-]+\.(?:com|net|org|gg|io|me|tv|ly|co|xyz|app|link|gl)(?:\/\S*)?\b/gi,x=>SAFE.test(x)?x:'*'.repeat(x.length));
  return s}
 const bad=t=>clean(t)!==String(t);
 window.SQFILTER={clean,bad};
 // chat: public, private, guild, party
 {const _s=window.mpSend;window.mpSend=function(t){return _s.call(this,clean(t))}}
 for(const k of['SQGUILDSAY','SQPARTYSAY'])if(typeof window[k]==='function'){const f=window[k];window[k]=function(t){return f.call(this,clean(t))}}
 // a hook installed later (guild code loads before this file, party code too, but just in case) is wrapped on first sight
 setTimeout(()=>{for(const k of['SQGUILDSAY','SQPARTYSAY'])if(typeof window[k]==='function'&&!window[k]._sqf){const f=window[k];const w=function(t){return f.call(this,clean(t))};w._sqf=1;window[k]=w}},2000);
 // character names: the name form refuses a name that would be starred
 addEventListener('submit',e=>{const f=e.target;if(!f||f.id!=='nmf')return;const i=document.getElementById('nmin');if(i&&bad(i.value)){e.preventDefault();e.stopImmediatePropagation();const st=document.getElementById('nmst');if(st)st.textContent='Please pick a different name.'}},true);
 // chest names
 if(window.SQCHNAME){const c=SQCHNAME;window.SQCHNAME=v=>clean(c(v))}})();
