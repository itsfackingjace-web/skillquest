// ---- 263. Wiki > Drop Card (Nov 20, Jace: "Make sure there's a Drop Card tab in the wiki as well") ----
// The guide's pages (254's SQBINDER.GP), then every card by group with its picture, stats and where it drops (each links to its
// item page), then the Companion power of every pet card. Search finds the cards by name like any item (they're in INAME).
(()=>{const W=window.SQWK,B=window.SQBINDER,D=window.SQDROPCARD;if(!W||!W.h||!B||!D)return;const H=W.h,E=H.E,WK2=H.WK2,TABS=H.tabs;
 const card=(t,h)=>'<div class="c"><div class="tx">'+(t?'<b>'+t+'</b><br>':'')+h+'</div></div>';
 const C=(t,h)=>({t:t+' '+h.replace(/<[^>]+>/g,' '),h:card(E(t),h)}),HD=t=>({t:'',h:'<h3>'+E(t)+'</h3>',head:1});
 if(!TABS.some(t=>t[0]==='dropcard')){const i=TABS.findIndex(t=>t[0]==='brew');TABS.splice(i<0?TABS.length:i+1,0,['dropcard','Drop Card'])}
 const ico=k=>{try{return H.icon(k)}catch(e){return''}};
 const short=n=>String(n||'').replace(/^(Drop|Pet) Card: /,'');
 const FROM={reg:'Beat that monster: 1%',tree:'Chop that tree: 1%',world:'Beat it (everyone who fought rolls): 1%',dungeon:'Beat it: 1%',island:'Beat it (everyone who fought rolls): 1%',
  guild:'Beat it (everyone who fought rolls): 1%',potion:'Brew that potion: 1%',forage:'Pick it: 1%'};
 const GROUPS=[['reg','Monster cards'],['tree','Tree cards (Mana)'],['world','World boss cards'],['dungeon','Dungeon boss cards'],['island','Island boss cards'],['guild','Guild boss cards'],['potion','Potion cards (spells)'],['forage','Forage cards (spells)']];
 const row=(k,n,d,from)=>'<div style="display:flex;gap:8px;align-items:center;margin:4px 0"><img alt="" src="'+ico(k)+'" style="width:28px;height:28px;image-rendering:pixelated;flex-shrink:0"><span><span class="lk" data-wkp="item:'+E(k)+'">'+E(short(n))+'</span> <small>'+E(d)+(from?' · '+E(from):'')+'</small></span></div>';
 WK2.dropcard=()=>{const out=[C('Drop Card','A card game played with cards you find all over SkillQuest. Every card goes into your <b>Card Binder</b> (the CARDS tab in your bag; cards stay with you when you fall), where you build up to 3 decks. Buy <b>Drop Card for Dummies</b> at the General Store in Hollow Village (1 gold) to read this guide in your bag. Play your deck against <b>Ace the Card Sharp</b> next to the chess table in Hollow Village (Easy, Normal or Hard; a win pays 50 / 150 / 400 gold, a tenth after the first win of the day). Play other players too: stand next to someone, tap their name and choose PLAY DROP CARD.')];
  for(const[t,h]of B.GP)out.push(C(t,h));
  const all=Object.values(D.CARDS),own=all.filter(c=>(inv[c.key]|0)>0).length;
  out.push(HD('Every card'));out.push(C('Your collection','You have found <b>'+own+'</b> of '+all.length+' cards (plus a Pet Card for every pet).'));
  for(const[g,t]of GROUPS){const L=all.filter(c=>c.g===g);if(L.length)out.push(C(t,L.map(c=>row(c.key,c.n,c.d,FROM[g])).join('')))}
  const pets=Object.keys(B.PET).sort((a,b)=>String(INAME[a]).localeCompare(String(INAME[b])));
  out.push(C('Pet cards (Companions)','Release a pet from your bag (tap RELEASE twice) and you always get its card. One per deck: it sits beside your hero all match.'+pets.map(k=>row(k,INAME[k],String(IDESC[k]||'').replace(/^Companion\. /,''),'')).join('')));
  return out};
 window.SQWKDROPCARD=true})();
