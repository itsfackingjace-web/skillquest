// ---- 216. Chat filter: swear words, slurs and contact details are starred out before a message is sent ----
// `SQFILTER.clean(text)` → the text with matches replaced by *. Long words match anywhere in a word, even split up or
// disguised ("f.u.c.k", "f u c k", "fuuuck", "sh1t": leetspeak mapped, repeated letters squashed); short ones only as a
// whole word, so "class", "Dickens" or "cocktail" stay. Email addresses, phone numbers and web links (other than
// skillquestmmo.com) are starred too. Character names (061's #nmf form refuses a name that would be starred) and chest
// names (204 calls window.SQCHNAME) use it as before.
// Nov 22 (Jace: "it censors some stupid stuff like the word "as" and random numbers. Also, add a censor toggle for adults"):
// - Short words compared with repeats squashed matched shorter words: "ass" squashed is "as", so "as" was starred (also
//   "bobs", "pis"). A squashed match now needs at least as many letters as the word. "Hoe" is off the list (the game has one).
// - Digits are leetspeak only inside a word that has letters, so numbers ("45", "455", "7175") stay; and a long word made of
//   pieces of several words counts only when it starts at the start of a word and only a short ending (-s, -ing...) is left
//   over ("f u c k" and "fu cking" still count, "this hit" or "go diego" don't). Amounts like 1000000 aren't phone numbers.
// - Adults can turn the filter off (Options > "Chat filter", SQAGE band 'a' only; localStorage sq_chatfilter_off).
//   A message keeps its filtered text in `m` (what every game, old ones too, shows) and, from an adult only, what they typed
//   in `r` when it differs (contact details are always taken out of both; the database rules allow `r` only from adults).
//   `show(m, r)` is r for an adult viewer with the filter off, else m. Sending: 061 (public chat and PMs), 136 (party) and
//   197 (guild) call `pack(text)` = {m, r?}; receiving: 061, 197 call `show`. The send wrappers below no longer clean (that
//   lost what was typed); `pack` does it where the message is written.
(()=>{// stored lightly scrambled (each letter shifted by 1) so the list doesn't read as a block of slurs in the source
 const un=s=>s.split(',').map(w=>w.replace(/[a-z]/g,c=>String.fromCharCode((c.charCodeAt(0)-98+26)%26+97)));
 const ANY=un('gvdl,tiju,cjudi,dvou,bttipmf,cbtubse,tmvu,xipsf,gbhhpu,ojhhfs,ojhhb,sfubse,ejmep,qfojt,wbhjob,qpso,uxbu,xbol,npuifsgvdlfs,ejdlifbe,qvttz,tifnbmf,dvntmvu,kfsl pgg,hp ejf,ljmm zpvstfmg,ljmm vstfmg');
 const WORD=un('gbh,ejdl,dpdl,dvn,lzt,tfy,ujut,cppct,btt,sbqf,sbqjtu,obaj,ljlf,dijol,tqjd,usbooz,ezlf,uxbut,qjtt,qsjdl,ujuuz,ujuujft,dvdl,ovef,oveft,ipsoz');
 const LEET={'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','@':'a','$':'s','!':'i','|':'i','8':'b','9':'g'};
 const sq=s=>s.replace(/(.)\1+/g,'$1');
 const ANYN=ANY.map(w=>sq(w.replace(/[^a-z]/g,''))).filter(Boolean);
 // whole words: exact, or the same once repeats are squashed with at least as many letters ("asss" yes, "as" no)
 const WEX=new Set(WORD.map(w=>w.replace(/[^a-z]/g,''))),WSQ=new Map();for(const w of WEX){const k=sq(w);WSQ.set(k,Math.min(WSQ.get(k)||99,w.length))}
 const isWord=t=>!!t&&(WEX.has(t)||(WSQ.has(sq(t))&&t.length>=WSQ.get(sq(t))));
 const ENDS=new Set(['','s','es','ed','d','er','ers','ing','in','ings','y','ie','ies','z']);
 const SAFE=/^(?:https?:\/\/)?(?:www\.)?skillquestmmo\.com\b/i;
 function contacts(s){
  s=s.replace(/[\w.+-]+\s*(?:@|\(at\)|\[at\])\s*[\w-]+\s*(?:\.|\(dot\)|\[dot\])\s*[a-z]{2,}/gi,x=>'*'.repeat(x.length));
  s=s.replace(/(?:\+?\d[\s().-]*){7,}/g,x=>{const d=x.replace(/\D/g,'');return(/\d{7,}|\d[\s().-]+\d/.test(x)&&d.length>=7&&!/^\d{1,3}0{3,}$/.test(d))?'*'.repeat(x.length):x});// 1000000, 2500000: amounts, not phone numbers
  s=s.replace(/\b(?:https?:\/\/|www\.)\S+|\b[\w-]+\.(?:com|net|org|gg|io|me|tv|ly|co|xyz|app|link|gl)(?:\/\S*)?\b/gi,x=>SAFE.test(x)?x:'*'.repeat(x.length));
  return s}
 function clean(text){let s=String(text==null?'':text);if(!s)return s;const m=s.split('');
  // the words (split by spaces); digits and symbols are leetspeak only inside a word that has letters
  const wid=new Array(m.length).fill(-1),hasL=[];{const re=/\S+/g;let x,k=0;while((x=re.exec(s))){const L=/[a-z]/i.test(x[0]);hasL.push(L);for(let i=x.index;i<x.index+x[0].length;i++)wid[i]=k;k++}}
  // letters only, repeats squashed, each kept letter remembering where it came from
  const n=[],at=[];for(let i=0;i<m.length;i++){if(wid[i]<0||!hasL[wid[i]])continue;let c=m[i].toLowerCase();c=LEET[c]||c;if(!/[a-z]/.test(c))continue;if(n.length&&n[n.length-1]===c&&wid[at[at.length-1]]===wid[i])continue;n.push(c);at.push(i)}// repeats squashed inside a word only ("is shit" kept its s)
  const ns=n.join(''),first=new Map();for(let j=0;j<at.length;j++){const w=wid[at[j]];if(!first.has(w))first.set(w,j)}
  const lastOf=w=>{let j=-1;for(let q=0;q<at.length;q++)if(wid[at[q]]===w)j=q;return j};
  for(const w of ANYN){let k=ns.indexOf(w);while(k>=0){const e=k+w.length-1,w0=wid[at[k]],w1=wid[at[e]];let ok=w0===w1;
    if(!ok&&first.get(w0)===k){const rest=ns.slice(e+1,lastOf(w1)+1);ok=ENDS.has(rest)}// pieces of a split-up word, not the middle of two words
    if(ok){const a=at[k],b=e+1<at.length?at[e+1]-1:m.length-1;for(let i=a;i<=b;i++)if(/\S/.test(m[i]))m[i]='*'}k=ns.indexOf(w,k+1)}}
  // whole words (plurals too)
  s=m.join('');s=s.replace(/\S+/g,tok=>{const L=/[a-z]/i.test(tok);let t=tok.toLowerCase().replace(/^[^a-z0-9@$]+|[^a-z0-9@$]+$/g,'');if(L)t=t.split('').map(c=>LEET[c]||c).join('');t=t.replace(/[^a-z]/g,'');
   if(t&&(isWord(t)||(t.endsWith('s')&&isWord(t.slice(0,-1)))||(t.endsWith('es')&&isWord(t.slice(0,-2)))))return tok.replace(/[^\s]/g,'*');return tok});
  return contacts(s)}
 const bad=t=>clean(t)!==String(t);
 // ---- adults can turn it off ----
 let OFF=false;try{OFF=localStorage.getItem('sq_chatfilter_off')==='1'}catch(e){self.SQERR&&SQERR(e,'208-1')}
 const adult=()=>!!(window.SQAGE&&SQAGE.band==='a');
 const off=()=>OFF&&adult();
 // what to write: the filtered text, and what an adult typed when it differs
 function pack(text){const t=String(text==null?'':text),c=clean(t);if(!adult())return{m:c};const r=contacts(t);return r!==c?{m:c,r}:{m:c}}
 const show=(m,r)=>off()&&typeof r==='string'&&r?r:m;
 // messages already in the chat window follow the switch (the receivers keep what came in as m0 and r, already cut to length)
 function relog(){try{const M=window.SQMP;for(const e of(M&&M.log)||[])if(typeof e.m0==='string')e.m=show(e.m0,e.r)}catch(e){self.SQERR&&SQERR(e,'208-2')}}
 function setOff(v){OFF=!!v;try{localStorage.setItem('sq_chatfilter_off',OFF?'1':'0')}catch(e){self.SQERR&&SQERR(e,'208-3')}relog()}
 window.SQFILTER={clean,bad,contacts,pack,show,off,adult,setOff,get OFF(){return OFF}};
 SQOPTS.wrap('208',_o=>function(){const h=_o();if(!adult())return h;const add='<button class="sb sqcfb">Chat filter: '+(OFF?'OFF':'ON')+'</button>'+
   (OFF?'<div class="qc" style="font-size:13px;line-height:1.4;padding:6px 12px;margin:4px 0 8px">You see other adults\' messages as they typed them. Messages from younger players are always filtered, and emails, phone numbers and links are always hidden.</div>':'');
  let k=h.indexOf('<div class="tl" style="margin-top:16px">CONTROLLER</div>');if(k<0)k=h.indexOf('<div class="tl" style="margin-top:22px');return k<0?h+add:h.slice(0,k)+add+h.slice(k)});
 pbd.addEventListener('click',e=>{if(!e.target.closest('.sqcfb'))return;e.stopPropagation();if(!adult())return;setOff(!OFF);try{sfx('talk')}catch(err){self.SQERR&&SQERR(err,'208-4')}try{rPn()}catch(err){self.SQERR&&SQERR(err,'208-5')}},true);
 // character names: the name form refuses a name that would be starred
 addEventListener('submit',e=>{const f=e.target;if(!f||f.id!=='nmf')return;const i=document.getElementById('nmin');if(i&&bad(i.value)){e.preventDefault();e.stopImmediatePropagation();const st=document.getElementById('nmst');if(st)st.textContent='Please pick a different name.'}},true);
 // chest names
 if(window.SQCHNAME){const c=SQCHNAME;window.SQCHNAME=v=>clean(c(v))}})();
