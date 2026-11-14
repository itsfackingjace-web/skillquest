// ---- 98. The wiki catches up: every dungeon, boss, monster, pet and place, with pictures ----
// The wiki's tables live in this block, so the later sections (Thornbrook, Emberwatch, the pets...) couldn't add to
// them. They're shared now, and the wiki draws pictures for the newer bosses and for every pet.
{window.WK_DUN=WK_DUN;window.WK_RARE=WK_RARE;window.WK_SKILL=WK_SKILL;window.WK_RGN=WK_RGN;window.WK_MOBS=WK_MOBS;window.WK_MK=WK_MK;window.WK_BOSSMK=WK_BOSSMK;
 Object.assign(WK_BOSSMK,{'The Thornheart':()=>({hp:180,mhp:180,kx:0,ky:0,type:'thorn',big:1,roots:[],t:0}),'The Emberlord':()=>({hp:320,mhp:320,kx:0,ky:0,type:'emberl',big:1,pools:[],balls:[],t:0})});
 // pets: drawn the same way they're drawn in the game, then cropped
 const PPIC={};function wkPetPic(k){if(PPIC[k]!=null)return PPIC[k];try{const S=4,B=36,px=B*S,X=3000,Y=3000;g.save();g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,px,px);g.setTransform(S,0,0,S,-(X-B/2)*S,-(Y-B*.6)*S);GC=g;
   const s={x:X,y:Y,mv:0,t:0,fl:false};if(k==='imp'&&window.SQIMPDRAW)SQIMPDRAW(X,Y);else if(window.SQDRAWNPET&&(window.SQNPET&&SQNPET[k]||['cat','dog','fox'].includes(k)))SQDRAWNPET(k,s,.4);else if(window.LUX&&LUX.drawPeerPet)LUX.drawPeerPet({pet:k,uid:'wkpic_'+k,x:X,y:Y,d:0,fl:0,sl:0,loc:''},.4);
   g.restore();const o=document.createElement('canvas');o.width=o.height=px;const ox=o.getContext('2d');ox.drawImage(cv,0,0,px,px,0,0,px,px);const d=ox.getImageData(0,0,px,px).data;let x0=px,y0=px,x1=-1,y1=-1;
   for(let y=0;y<px;y++)for(let x=0;x<px;x++)if(d[(y*px+x)*4+3]>40){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}if(x1<0)return PPIC[k]='';
   const sz=Math.max(x1-x0,y1-y0)+8,c2=document.createElement('canvas');c2.width=c2.height=sz;c2.getContext('2d').drawImage(o,x0-Math.round((sz-(x1-x0))/2),y0-Math.round((sz-(y1-y0))/2),sz,sz,0,0,sz,sz);return PPIC[k]=c2.toDataURL()}catch(e){try{g.restore()}catch(_){}return PPIC[k]=''}}
 window.SQPETPIC=wkPetPic;
 const petKey=name=>{const n=name.replace(/ \(pet\)$/,'').toLowerCase();if(n==='pet wolf')return'pwolf';if(n==='imp')return'imp';const N=window.SQNPET||{};for(const k in N)if((N[k].n||'').toLowerCase()===n)return k;return null};
 const _wc=wkCards;wkCards=function(tab,srch){if(tab==='pets'){const out=[];const card=(t,ic,tx)=>out.push({t,h:'<div class="c">'+(ic?'<img alt="" src="'+ic+'" class="mob">':'')+'<div class="tx">'+tx+'</div></div>'}),head=t=>out.push({t:'',h:'<h3>'+wkE(t)+'</h3>',head:1});
   const isPet=r=>/\(pet\)$|^Pet wolf$/.test(r[0]);
   head('Rare pets');for(const r of WK_RARE.filter(isPet)){const k=r[5]||petKey(r[0]);card(r[0]+' '+r[2]+' pet',k?wkPetPic(k):'','<b>'+wkE(r[0])+'</b> <span class="tag">'+wkE(r[2])+'</span><br>'+wkE(r[3])+'<br><small>'+(r[4]||('5% from the '+wkE(r[2])+' (8% if you\'re in the top three).'))+'</small>')}
   head('Rare items');for(const r of WK_RARE.filter(r=>!isPet(r)))card(r[0]+' '+r[2],r[1]?wkIcon(r[1]):'','<b>'+wkE(r[0])+'</b> <span class="tag">'+wkE(r[2])+'</span><br>'+wkE(r[3])+'<br><small>'+(r[4]||('5% from the '+wkE(r[2])+' (8% if you\'re in the top three).'))+'</small>');
   head('Pets from Marlo\'s Emporium');const P=window.LUX&&LUX.PETS||[];for(const p of P)if(!p.rare)card(p.n+' pet',wkPetPic(p.k),'<b>'+wkE(p.n)+'</b> <span class="tag">'+p.v.toLocaleString('en-US')+' gold</span><br><small>Follows you everywhere. Other players see it too. It\'s an item: put it in your PET slot from your Bag or the equipment screen.</small>');
   return out}
  const out=_wc(tab,srch);
  if(window.SQIBWIKI)try{SQIBWIKI(tab,out,(t,ic,tx)=>out.push({t,h:'<div class="c">'+(ic?'<img alt="" src="'+ic+'" class="mob">':'')+'<div class="tx">'+tx+'</div></div>'}),t=>out.push({t:'',h:'<h3>'+wkE(t)+'</h3>',head:1}),(k,mk)=>wkPic(k,mk,100))}catch(e){console.warn(e)}
  if(tab==='bosses'){// boss-less dungeons (the Ironcrest mines) don't belong in the boss list
   for(let i=out.length-1;i>=0;i--)if(/^None /.test(out[i].t||''))out.splice(i,1)}
  if(tab==='world'){const add=(t,h)=>out.push({t:t+' '+h.replace(/<[^>]+>/g,' '),h:'<div class="c"><div class="tx">'+h+'</div></div>'});
   out.push({t:'',h:'<h3>Island towns and places</h3>',head:1});
   add('Thornbrook','<b>Thornbrook</b> <span class="tag">Briarwood Isle</span><br><small>Ranger Wren, Hazel the trader and Old Moss. Ranger Lodge and the Sleepy Fern inn (rest to heal). Thornroot Hollow lies south-west.</small>');
   add('Emberwatch','<b>Emberwatch</b> <span class="tag">Ashfall Coast</span><br><small>A forge camp: Warden Kesh, Forgemaster Brann (shop) and Old Pell. The Forge and the Warden\'s Hall. Cinderdeep lies north-east.</small>');
   add('Dustwater','<b>Dustwater (ghost town)</b> <span class="tag">No Man\'s Land</span><br><small>The Last Chance Saloon and an abandoned sheriff\'s office. No Man\'s Land has no law: PvP is always on there, and bandits, Cacticus and giant scorpions roam the desert.</small>');
   add('World Market','<b>World Market</b> <span class="tag">Hollow Village</span><br><small>Trade with every player. Talk to the Market clerk (or hit the stalls) to put up offers to buy or sell anything; they match automatically, even while you\'re away.</small>')}
  return out};
 const _gd=WK2.guides;WK2.guides=()=>{const out=_gd();const G=(t,h)=>out.push({t:t+' '+h.replace(/<[^>]+>/g,' '),h:'<div class="c"><div class="tx"><b>'+wkE(t)+'</b>'+h+'</div></div>'});
  G('The World Market','<p>The World Market stands just outside Hollow Village. Talk to the Market clerk to trade with every player:</p><p>• <b>Sell</b>: pick something from your bag, how many, and the price each. The market holds your items until someone buys them.<br>• <b>Buy</b>: search for an item, set how many and the most you\'ll pay each. The market holds your gold.<br>• Offers match automatically with other players\' offers, even while you\'re offline. A trade happens at the price of the offer that was there first, so if you offer more than the cheapest seller asks, you get the difference back.<br>• What you get waits in your <b>collection box</b>: collect it at the market. Cancel an offer any time to get back what hasn\'t traded. Up to 8 offers at once. You need to be signed in.</p>');
  G('No Man\'s Land','<p>A lawless desert south of Briarwood and west of the Shattered Expanse. Unlock it with the <b>Lawless Waters</b> voyage from Sera, the Navigator in Tidewatch (after Into Briarwood), or sail off Briarwood\'s south edge / the Shattered Expanse\'s west edge once it\'s charted.</p><p><b>PvP is always on there</b>, for everyone, and you can\'t turn it off until you leave. Bandits keep their distance and shoot (a "!" over their head means they\'re aiming: roll!), Cacticus pretend to be cacti until you walk past, and giant scorpions sting hard.</p>');
  G('Boulders and the Stone Sledgehammer','<p>Big boulders sit on every island and in caves. Only the Stone Sledgehammer (a rare drop from the Stone Giant) can break them: 35-50 stone each. Ore boulders glint with iron, gold, mithril or adamant and give a big pile of ore (Mining 15 / 30 / 45 / 60). Holding the hammer also turns your ultimate into a Ground Slam.</p>');
  G('Foraging','<p>Pick berries from bushes, mushrooms from the patches that grow beside trees (Foraging 5), nuts from hazel bushes (Foraging 10) and fruit from cacti. Roast mushrooms and nuts at a campfire. Berry bushes can drop a squirrel pet (1 in 1,000) that forages for you.</p>');
  G('Pets that work for you','<p>The squirrel (from berry bushes, 1 in 1,000) brings you berries, nuts, mushrooms, cactus fruit, coins and sometimes a healing potion. Ore golems (1 in 2,000 from mining iron, gold, mithril or adamant ore) dig up their own ore for you every couple of minutes. Each kind of tree has its own treeling (1 in 5,000).</p>');
  return out}}
// ---- go ----
mpRBtn();
if(MP_OK)mpLoad().catch(e=>{console.warn('[online] could not load',e);btn.style.display='none'});else btn.remove(),ov.remove();
window.SQMP=MP;
// The chat box sends through window.mpSend: hand it the block's mpSend with every wrapper above (062/070/072), so
// sections after the block (111b's /suite, 136's emotes and /p) wrap the full chain instead of the bare original.
window.mpSend=mpSend;
}
