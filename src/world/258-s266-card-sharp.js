// ---- 266. The Card Sharp: Ace, at a card table next to Orla's chess table in Hollow Village (window.SQCARDSHARP) ----
// Nov 20 (Jace's pick): "The Card Sharp NPC in Hollow Village": sells Drop Card for Dummies (the General Store keeps it too; the first
// copy brings the Starter Deck), explains the game, opens your Card Binder, and will host matches against the game later.
// Hollow Village has no inn, so the table stands outside with the chess table (a games corner), at VX+8,VY+1; Ace stands behind it.
// Talking to him is the usual NPC talk (005/008: shop = n.kind, ptab 2); the panel is drawn by an SQRPN step.
(()=>{const B=window.SQBINDER;if(!B)return;const TX=VX+8,TY=VY+1,KIND='cardsharp';
 NPCS.push({kind:KIND,x:TX*16+8,y:(TY-1)*16+8,ch:{sk:1,hs:3,hc:2,sh:4,pn:2,ht:1,hcol:1,so:1}});
 BS.add(TY*N+TX);
 // the table: green felt, a deck and two cards face up
 SQNEWDRAW.wrap('258',_nd=>function(...a){_nd(...a);const tm=a[8],cx=TX*16+8,b=(TY+1)*16-2;
  shd(cx,b-1,16);Rg(cx-8,b-11,16,7,O);Rg(cx-7,b-10,14,5,'#2e6a40');Rg(cx-7,b-10,14,1,'#3e8a54');
  Rg(cx-5,b-10,3,4,'#f0e8d0');Rg(cx-5,b-10,3,1,'#c02828');Rg(cx-1,b-9,3,4,'#f0e8d0');Rg(cx,b-8,1,1,'#3175b4');Rg(cx+3,b-10,3,4,'#3a64b8');Rg(cx+4,b-9,1,2,'#f8d048');
  Rg(cx-6,b-4,2,4,O);Rg(cx+4,b-4,2,4,O);Rg(cx-5,b-4,1,3,'#7a4a20');Rg(cx+5,b-4,1,3,'#7a4a20');
  if(!dead&&Math.abs(P.x-cx)<15&&P.y+6>b&&P.y-16<b)pP(tm)});
 // ---- talking to Ace ----
 const LINES=['"Pull up a crate! Every monster, tree and boss out there drops a card, if you\'re lucky."','"Found a shiny yet? One card in fifty sparkles."','"Trees are your Mana. Plant them, chop them to pay, and they grow back."','"Bosses drop the best cards. Bring friends: everyone who fights gets a roll."'];
 let line=0;
 function html(){const has=(inv[B.GUIDE]|0)>0;
  return'<div class="tl">Ace the Card Sharp</div><div class="qc"><p>'+LINES[line%LINES.length]+'</p></div>'+
   '<button class="sb" data-dcs2="buy">Buy Drop Card for Dummies · 1 gold'+(has?' (you have one)':'')+'</button>'+
   '<button class="sb" data-dcs2="how">How do I play?</button>'+
   '<button class="sb" data-dcs2="bind">Open my Card Binder</button>'+
   '<button class="sb" data-dcs2="match" disabled style="opacity:.55">Play a match against Ace (coming soon)</button>'}
 SQRPN.wrap('258',_r=>function(){if(ptab==2&&shop===KIND){try{panelChrome('')}catch(e){self.SQERR&&SQERR(e,'258-1')}pbd.innerHTML=html();return}return _r.apply(this,arguments)});
 SQCLOSEPN.before('258',()=>{if(shop===KIND)line++});
 pbd.addEventListener('click',e=>{if(shop!==KIND||ptab!=2||!pnOpen)return;const b=e.target.closest('[data-dcs2]');if(!b)return;e.stopPropagation();e.preventDefault();if(b.disabled)return;const a=b.dataset.dcs2;
  if(a==='buy'){if(GLD<1){say('You need 1 gold.');sfx('swish');return}const g=GEN.find(x=>x.n==='Drop Card for Dummies');if(!g)return;GLD-=1;g.f();sfx('coin');try{saveLocal(true)}catch(err){self.SQERR&&SQERR(err,'258-2')}rPn();return}
  if(a==='how'){shop=null;B.open('guide');return}
  if(a==='bind'){shop=null;B.open('col')}},true);
 try{if(window.WK_ROLE)WK_ROLE[KIND]='Card Sharp: Drop Card for Dummies, help with Drop Card'}catch(e){self.SQERR&&SQERR(e,'258-3')}
 window.SQCARDSHARP={TX,TY,KIND,html}})();
