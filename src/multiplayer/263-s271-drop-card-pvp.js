// ---- 271. Drop Card against other players (window.SQPVD) ----
// Nov 21 (Jace: "do player vs player matches first"). Runs through 130's duel flow with kind 'card', exactly like player chess:
// PLAY DROP CARD on the player menu (both stand next to each other), stakes, accept twice, then both get 262's table.
// - Each side's duel record (duels/<a_b>/<uid>.m) carries "<deck>|<pet>#<moves>": the deck that's active in their binder and their
//   moves, space separated (p<hand>[.<target>] play, l<hand> plant, c<grove> chop, a<uid>.<target> attack, e end turn).
// - Both players build the same match from one seed (the request's code + the pair id); the player whose id comes first in the
//   pair goes first. On the second player's screen the match is mirrored (261's mirror) so you're always side 0, at the bottom;
//   the other side's moves are flipped (flipMv: their hero is h0 for them, h1 for you) and applied only on their turn.
// - A deck that breaks the deck rules (20-60 cards, 2 of a card, 1 of a boss, 4+ trees) makes the match a draw: stakes go back.
// - 2 minutes a turn: your turn ends by itself after that; if the other player doesn't move for 2.5 minutes, you win. Going
//   offline for 20 s, leaving (LEAVE twice) or giving up loses, as in chess. The winner takes both stakes, nothing else.
(()=>{const A=()=>window.SQDUELAPI,E=window.SQDCE,B=window.SQBINDER,MT=()=>window.SQDCM;if(!E||!B||!MT())return;
 const TURN=120,WAIT=150;
 // Nov 21: the rules version travels with the deck. A match ended at once when the other game was older (a game from before 263
 // takes the request as a duel and never sends a deck) or played other rules (30 HP, 6 trees): now it stops before the stakes are
 // taken and says why. Bump RV when a rule changes.
 const RV='r4';// r3: pet cards only their owner's game knows, 60 of a tree, END TURN fingerprints; r4: the match's code in the head
 // Nov 21 (Jace vs Bear: "the games kept ending after the first turn", after one full match): the record lives at duels/<pair>/<uid>
 // for every match between the same two players, and S.mv (your moves) was only cleared when the next match began, so while setting
 // up the next match each game sent its deck plus the last match's moves. The other game replayed those on your first turn, saw the
 // games disagree and stopped the match as a draw. Now a match's end clears the moves, and the head carries the match's code (the
 // request's D.s, the same on both screens): a record from another match is ignored.
 const S={mv:[],th:0,on:false,first:true,their:null,bad:'',t0:0,cur:-1,ended:false};
 const code=()=>{try{const D=A().D;return String(D&&D.s||'').replace(/[^\w-]/g,'').slice(0,24)}catch(e){return''}};
 const deckStr=d=>Object.keys(d.c).filter(k=>d.c[k]>0).map(k=>k+'*'+(d.c[k]|0)).join(',')+'|'+(d.pet||'')+'|'+RV+'|'+code();
 function parseHead(h){const[a,p,v,cd]=String(h||'').split('|'),c={};for(const x of(a||'').split(',')){const[k,n]=x.split('*');if(k&&/^[\w:-]+$/.test(k))c[k]=Math.max(0,Math.min(60,n|0))}return{c,pet:p&&/^pc_[\w:-]+$/.test(p)?p:null,v:v||'',code:cd||''}}
 function badDeck(d){if(!d)return'no deck';for(const k in d.c)if(!B.info(k)||!E.card((window.SQDROPCARD.ITEM[k]||{}).key||k))return'unknown card';
  // Nov 21: no pet check. Some pet cards exist only in their owner's game (254 adds them from your own save), so "unknown pet" turned
  // every such deck away as "not allowed"; a Companion's power comes from its key alone (261's COMP), so both games agree anyway.
  const p=B.problems({n:'x',c:d.c,pet:d.pet}).filter(t=>!/^Optional|^You only have/.test(t));return p[0]||''}
 const hash=t=>{let h=7;for(const ch of String(t))h=(h*31+ch.charCodeAt(0))|0;return h||1};
 // a fingerprint of the match, sides in the same (unmirrored) order on both screens: sent with every END TURN and checked by the other game
 const sig=s=>{const o=s.flip?[1,0]:[0,1];return(hash(o.map(i=>{const P=s.p[i];return[P.hp,P.hand.length,P.deck.length,P.grove.length,P.board.map(m=>m.uid+':'+m.hp+':'+m.atk).join(',')].join('/')}).join('|')+'|'+s.turn)>>>0).toString(36)};
 const enc=mv=>mv.t==='play'?'p'+(mv.h|0)+(mv.tg?'.'+mv.tg:''):mv.t==='plant'?'l'+(mv.h|0):mv.t==='chop'?'c'+(mv.g|0):mv.t==='atk'?'a'+mv.a+'.'+mv.tg:'e'+(mv.sig||'');
 function dec(x){const c=x[0],r=x.slice(1),[a,b]=r.split('.');if(c==='p')return b?{t:'play',h:+a,tg:b}:{t:'play',h:+a};if(c==='l')return{t:'plant',h:+a};if(c==='c')return{t:'chop',g:+a};if(c==='a')return{t:'atk',a,tg:b};if(c==='e')return r?{t:'end',sig:r}:{t:'end'};return null}
 const myDeck=()=>{const d=MT().deckOf();return d?{c:Object.assign({},d.c),pet:d.pet||null}:null};
 let mine=null;// the deck you bring, fixed when the match is set up
 function foeCh(u){try{const r=window.SQMP&&SQMP.players&&SQMP.players.get(u);return r&&r.ch||null}catch(e){self.SQERR&&SQERR(e,'263-1');return null}}
 function myName(){try{return A().nameOf(A().me())||'You'}catch(e){return'You'}}
 function feed(){const M=MT().m;if(!S.on||!M||!M.pvp||!S.their)return;const L=S.their.mv;
  while(S.th<L.length){const mv=dec(L[S.th]);if(!mv){S.th=L.length;return}const r=MT().foeMove(E.flipMv(mv));if(r==='not their turn'||r==='over')return;S.th++;
   // a move the rules refuse, or a different fingerprint after END TURN: the two games aren't playing the same match any more
   if(r||(mv.sig&&mv.sig!==sig(M.s))){console.warn('drop card: out of step',L[S.th-1],r);const D=A().D;D.why='the two games got out of step';A().draw3();return}}}
 window.SQPVD={
  problem(){const d=MT().deckOf();if(!d)return'You need a Drop Card deck first (Card Binder > Decks).';const p=B.problems(d).filter(t=>!/^Optional/.test(t));return p.length?'Your Drop Card deck isn\'t ready: '+p[0]+' (Card Binder > Decks)':''},
  str(){if(!mine)mine=myDeck();return deckStr(mine)+'#'+S.mv.join(' ')},
  theirs(m){m=String(m||'');const i=m.indexOf('#');if(i<0)return;const head=m.slice(0,i),mv=m.slice(i+1).split(' ').filter(Boolean);
   if(!S.their||S.their.head!==head){const d=parseHead(head);if(d.v===RV&&d.code!==code())return;// a record left over from another match
    S.their={head,d,mv};S.bad=d.v!==RV?'old':badDeck(d)}else S.their.mv=mv;if(S.pend&&!S.on){S.pend=0;window.SQPVD.begin();return}feed()},
  blocker(){const D=A().D,n=D?A().nameOf(D.foe):'They';if(D&&D.their&&D.st!=='idle'&&D.their.m===''&&performance.now()-(D.openAt||0)>4000)return n+'\'s game is out of date. You both need to close and reopen the game to play Drop Card.';
   if(!S.bad)return'';return S.bad==='old'?n+' is on a different version of the game. You both need to close and reopen the game to play Drop Card.':n+'\'s deck isn\'t allowed ('+S.bad+').'},
  begin(){const D=A().D;if(!D)return;S.mv=[];S.th=0;S.ended=false;if(!mine)mine=myDeck();
   if(!S.their){S.on=false;S.pend=performance.now();return}// their deck is on its way: theirs() starts the match, tick() gives up after 15 s
   S.pend=0;
   if(S.bad){D.why=S.bad==='old'?A().nameOf(D.foe)+' is on a different version of the game':A().nameOf(D.foe)+'\'s deck isn\'t allowed ('+S.bad+')';A().draw3();return}
   const first=D.tid.split('_')[0]===A().me(),fn=A().nameOf(D.foe),mn=myName();S.first=first;
   const decks=[[],[]],pets=[null,null],mi=first?0:1;
   const flat=d=>{const o=[];for(const k in d.c)for(let n=0;n<d.c[k];n++)o.push(k);return o};
   decks[mi]=flat(mine);pets[mi]=mine.pet;decks[1-mi]=flat(S.their.d);pets[1-mi]=S.their.d.pet;
   const names=first?[mn,fn]:[fn,mn];
   S.on=true;S.cur=-1;S.t0=performance.now();
   MT().startPvp({seed:hash(D.s+'|'+D.tid),decks,pets,names,first,pvp:{name:fn,ch:foeCh(D.foe),
    send(mv){if(mv.t==='end')mv=Object.assign({},mv,{sig:sig(MT().m.s)});S.mv.push(enc(mv));if(S.mv.join(' ').length>3600){D.why='the match ran too long';A().draw3();return}A().push()},
    leave(){A().lose('resign')},
    done(res){if(S.ended)return;S.ended=true;if(res==='w')A().win('end');else A().lose('end')},
    turnLeft(){const M=MT().m,left=Math.max(0,Math.ceil(TURN-(performance.now()-S.t0)/1000));return M&&M.s.cur===0?Math.floor(left/60)+':'+String(left%60).padStart(2,'0'):''}}});
   feed()},
  tick(){if(S.pend&&!S.on&&performance.now()-S.pend>15000){S.pend=0;const D=A().D;D.why=A().nameOf(D.foe)+'\'s game didn\'t send a deck';A().draw3();return}const M=MT().m;if(!S.on||!M||!M.pvp)return;if(M.s.over)return;
   if(M.s.cur!==S.cur){S.cur=M.s.cur;S.t0=performance.now()}
   const t=(performance.now()-S.t0)/1000;
   if(M.s.cur===0&&t>TURN&&!M.busy){MT().act({t:'end'});return}
   if(M.s.cur===1&&t>WAIT){A().win('time');return}
   const lv=MT().el.querySelector('.dcm-lvn');if(lv){const left=Math.max(0,Math.ceil((M.s.cur===0?TURN:WAIT)-t));lv.textContent=(M.s.cur===0?'Your turn: ':A().nameOf(A().D.foe)+': ')+Math.floor(left/60)+':'+String(left%60).padStart(2,'0')+' left'}},
  over(res,why){S.on=false;mine=null;const M=MT().m;if(!M||!M.pvp)return;const n=M.pvp.name;
   const t=res==='w'?(why==='end'?'You beat '+n+'!':why==='resign'?n+' gave up. You win!':why==='time'?n+' ran out of time. You win!':why==='gone'?n+' went offline. You win!':n+' left. You win!')+' You take the stakes.':
    res==='l'?(why==='end'?n+' wins this one.':why==='resign'?'You gave up.':why==='time'?'You ran out of time.':'You left the match.')+' '+n+' takes the stakes.':'A draw'+(why?' ('+why+')':'')+'. The stakes go back.';
   MT().endPvp(t)},
  cancel(){S.on=false;S.pend=0;mine=null;S.their=null;S.bad='';S.mv=[];S.th=0;const M=MT().m;if(M&&M.pvp&&!M.s.over)MT().close()},
  get state(){return S}};
 try{if(!SQACH.A.some(a=>a.id==='dc_pvp'))SQACH.A.push({g:'Drop Card',id:'dc_pvp',n:'Card duelist',d:'Win a Drop Card match against another player.',val:()=>(SQACH.counters&&SQACH.counters.dcpvpw)|0,goal:1,gold:500})}catch(e){self.SQERR&&SQERR(e,'263-2')}})();
