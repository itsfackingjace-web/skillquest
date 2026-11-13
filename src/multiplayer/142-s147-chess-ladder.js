// ---- 147. Chess ladder: a rating for chess against other players ----
// Every player starts at 1000. A finished game against another player (section 139's player chess) moves your rating
// with the usual Elo formula: beating a higher-rated player gains more, losing to a lower-rated one costs more
// (K = 40 for your first 10 games, then 24). The opponent's rating is read from their leaderboard row (lb/<uid>.cr) when
// the game starts. Not rated: games of fewer than 10 plies (5 moves each), and more than 3 games against the same player
// on the same day (so two friends can't farm each other). Your rating goes on the leaderboard as cr (rating) and cg
// (rated games), shown in the "Chess" category (068). Saved as chr = {r,g,w,l,d,pk,f:{uid:[day,n]}}.
(()=>{const ST={r:1000,g:0,w:0,l:0,d:0,pk:1000,f:{}};let foeR=null,foeG=0,foeU='';
 const day=()=>{const d=new Date();return d.getFullYear()*1000+d.getMonth()*40+d.getDate()};
 const K=()=>ST.g<10?40:24;
 const fb=()=>window.SQFB,on=()=>!!(window.SQMP&&SQMP.on&&SQMP.user&&fb());
 window.SQCHR={row:()=>ST.g>0?{r:Math.round(ST.r),g:ST.g}:null,get state(){return ST},
  expect:(me,foe)=>1/(1+Math.pow(10,(foe-me)/400))};
 // the opponent's rating, read when the game starts
 if(window.SQPVC){const _b=SQPVC.begin;SQPVC.begin=function(){const out=_b.apply(this,arguments);try{foeU=(window.SQDUEL&&SQDUEL.foe)||'';foeR=null;foeG=0;
    if(foeU&&on()){const F=fb();F.db.get(F.db.ref(F.D,'lb/'+foeU)).then(s=>{const v=s.val()||{};foeG=Math.max(0,+v.cg|0);foeR=foeG>0&&isFinite(+v.cr)?Math.max(100,Math.min(3000,+v.cr)):1000}).catch(()=>{foeR=1000})}}catch(e){}return out}}
 window.SQDUELEND=(kind,res,foe,why)=>{if(kind!=='chess')return;let plies=0;try{plies=(window.SQPVCSTATE&&SQPVCSTATE.st&&SQPVCSTATE.st.ply)|0}catch(e){}
  let note='';
  if(plies<10)note='Too short to be rated (fewer than 5 moves each).';
  else{const d=day(),f=ST.f[foe];const n=f&&f[0]===d?f[1]:0;
   if(n>=3)note='Not rated: you\'ve already played 3 rated games against this player today.';
   else{ST.f[foe]=[d,n+1];for(const u in ST.f)if(ST.f[u][0]!==d)delete ST.f[u];
    const fr=foeR==null?1000:foeR,S=res==='w'?1:res==='d'?.5:0,ch=K()*(S-SQCHR.expect(ST.r,fr)),old=Math.round(ST.r);
    ST.r=Math.max(100,ST.r+ch);ST.g++;if(res==='w')ST.w++;else if(res==='l')ST.l++;else ST.d++;ST.pk=Math.max(ST.pk,Math.round(ST.r));
    const nw=Math.round(ST.r),dl=nw-old;note='Chess rating: '+nw+' ('+(dl>=0?'+':'')+dl+')'+(ST.g===1?'. You\'re on the Chess leaderboard!':'');
    try{if(window.SQLB)SQLB.pubAt=-1e9}catch(e){}}}
  try{saveLocal(true)}catch(e){}
  setTimeout(()=>{try{mpLog('game',note)}catch(e){}try{const t=document.getElementById('pvc_pvst');if(t)t.textContent+=' '+note}catch(e){}},50)};
 // the chess lobby (Orla's board) shows your rating
 if(typeof chessLobby==='function'){const _cl=chessLobby;chessLobby=function(){const h=_cl.apply(this,arguments);
   const card='<div class="qc" style="margin:8px 0;font-size:13px"><b>Chess ladder</b><p style="margin:4px 0 0">'+(ST.g?'Your rating: <b>'+Math.round(ST.r)+'</b> · '+ST.w+' won, '+ST.l+' lost, '+ST.d+' drawn · best '+ST.pk:'Play chess against another player (tap their name and choose CHESS) to get a rating. Everyone starts at 1000.')+'</p><p style="margin:4px 0 0;font-size:11px;opacity:.8">See the top players in Leaderboards > Chess.</p></div>';
   const i=h.indexOf('<button class="cg');return i<0?h+card:h.slice(0,i)+card+h.slice(i)}}
 // saves
 {const _sn=snap;snap=function(){const s=_sn.apply(this,arguments);try{if(ST.g)s.chr={r:Math.round(ST.r*10)/10,g:ST.g,w:ST.w,l:ST.l,d:ST.d,pk:ST.pk,f:ST.f}}catch(e){}return s}}
 {const _ap=applySave;applySave=function(S){const out=_ap.apply(this,arguments);try{const v=S&&S.chr;Object.assign(ST,{r:1000,g:0,w:0,l:0,d:0,pk:1000,f:{}});
   if(v&&typeof v==='object'){ST.r=Math.max(100,Math.min(3000,+v.r||1000));for(const k of['g','w','l','d'])ST[k]=Math.max(0,v[k]|0);ST.pk=Math.max(ST.r,+v.pk||0);
    if(v.f&&typeof v.f==='object')for(const u in v.f){const a=v.f[u];if(Array.isArray(a))ST.f[u]=[a[0]|0,a[1]|0]}}}catch(e){}return out}}
 {const _ng=newGame;newGame=function(){Object.assign(ST,{r:1000,g:0,w:0,l:0,d:0,pk:1000,f:{}});return _ng.apply(this,arguments)}}})();
