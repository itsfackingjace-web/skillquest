// ---------------------------------------------------------------- 79. Proper icons for every item
// The fine furniture and potions from Marlo's Emporium used a placeholder rock icon, and the shortbow, longbow and
// bone bow all shared one bow. Each now has its own 14x14 sprite (bag, chests, shops, equipment screen).
{const PAL={O:'#202838',G:'#e8b830',s:'#78b8f0',y:'#f8e070',g:'#58a848',d:'#3a7a30',W:'#9a6034',f:'#f4ecd8',k:'#202020',D:'#503018',S:'#a8a8b8',t:'#c8c8d4',r:'#f06020',b:'#6a4020',
  l:'#a8d8f8',w:'#5898e0',o:'#f08830',e:'#f8e048',a:'#e8d8a0',Y:'#c89020',R:'#e83848',P:'#c8c8d0',c:'#a07040',v:'#d8e8f8',H:'#ffffff',q:'#e8c040'};
 const ART={
  fpaint:['..............','OOOOOOOOOOOOOO','OGGGGGGGGGGGGO','OGssssssyyssGO','OGssssssyyssGO','OGssssssssssGO','OGsssggsssssGO','OGsgggggsgssGO','OGggggggggggGO','OGgdggggdgggGO','OGGGGGGGGGGGGO','OOOOOOOOOOOOOO','..............','..............'],
  fclock:['....OOOOOO....','...OWWWWWWO...','...OWffffWO...','...OWfkkfWO...','...OWfkffWO...','...OWffffWO...','...OWWWWWWO...','...OWDDDDWO...','...OWDqqDWO...','...OWDqqDWO...','...OWDDDDWO...','...OWWWWWWO...','..OOOOOOOOOO..','..............'],
  ffire:['..............','OOOOOOOOOOOOOO','OSSSSSSSSSSSSO','OtSStSSStSSStO','OSSOOOOOOOOSSO','OSOkkkkkkkkOSO','OSOkkkrrkkkOSO','OSOkkryyrkkOSO','OSOkryyyyrkOSO','OSOkrryyrrkOSO','OSObbbbbbbbOSO','OSSSSSSSSSSSSO','OOOOOOOOOOOOOO','..............'],
  faqua:['..............','..............','OOOOOOOOOOOOOO','OllllllllllllO','OwwwwwwwwwwwwO','OwwwooowwwwwwO','OwwoooowwweewO','OwwwooowweeewO','OwwwwwwwwwewwO','OwgwwwwwwwwgwO','OggwwwwwwwggwO','OaaaaaaaaaaaaO','ODDDDDDDDDDDDO','OOOOOOOOOOOOOO'],
  ftroph:['..............','...y..yy..y...','...yy.yy.yy...','...yyyyyyyy...','...yyRyyRyy...','...YYYYYYYY...','.....OOOO.....','......PP......','......PP......','.....PPPP.....','...OOOOOOOO...','...WWWWWWWW...','...WWqqqqWW...','...OOOOOOOO...'],
  fstatue:['......OO......','.....OyyO.....','.....OyyO.....','......OO......','....OyyyyO....','...OyyyyyyO...','...OyOyyOyO...','....OyyyyO....','....OyOOyO....','....OyOOyO....','...OOOOOOOO...','...PPPPPPPP...','...PPPPPPPP...','...OOOOOOOO...']};
 const potion=L=>['..............','.....OOOO.....','.....OccO.....','....OOOOOO....','.....OvvO.....','....OvvvvO....','...OvLLLLvO...','..OvLLLLLLvO..','..OLLHLLLLLO..','..OLHLLLLLLO..','..OLLLLLLLLO..','..OLLLLLLLLO..','...OLLLLLLO...','....OOOOOO....'].map(r=>r.replace(/L/g,L));
 Object.assign(PAL,{1:'#e83848',2:'#f08030',3:'#8898b0',4:'#48d070'});
 ART.pot_heal=potion('1');ART.pot_str=potion('2');ART.pot_iron=potion('3');ART.pot_swift=potion('4');
 const paint=rows=>{const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d');rows.forEach((r,y)=>{for(let i=0;i<14;i++){const ch=r[i];if(ch&&ch!=='.'&&PAL[ch]){x.fillStyle=PAL[ch];x.fillRect(i,y,1,1)}}});return c.toDataURL()};
 // bows: a curved limb with a string; the shortbow is small and light, the longbow tall and dark, the bone bow pale
 const bow=(h,amp,wood,tip,knots)=>{const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d'),y0=Math.round((14-h)/2),px=[];
  for(let i=0;i<=h;i++){const t=i/h,X=Math.round(4+amp*Math.sin(Math.PI*t)),Y=y0+i;px.push([X,Y])}
  x.fillStyle=PAL.O;for(const[X,Y]of px)x.fillRect(X-1,Y-1,4,3);x.fillStyle='#f4f0e0';x.fillRect(4,y0+1,1,h-1);
  for(const[X,Y]of px){x.fillStyle=wood;x.fillRect(X,Y,2,1)}x.fillStyle=tip;x.fillRect(px[0][0],px[0][1],1,1);x.fillRect(px[h][0],px[h][1],1,1);
  if(knots){x.fillStyle=knots;for(const i of[Math.round(h*.3),Math.round(h*.7)])x.fillRect(px[i][0],px[i][1],1,1)}
  const m=px[Math.round(h/2)];x.fillStyle='#d8b070';x.fillRect(m[0],m[1]-1,1,3);return c.toDataURL()};
 const MADE={};const icon=k=>{if(MADE[k])return MADE[k];if(ART[k])return MADE[k]=paint(ART[k]);
  if(k==='eq_bow1')return MADE[k]=bow(9,3,'#c08048','#f0d090');if(k==='eq_bow2')return MADE[k]=bow(12,4,'#8a5020','#d8b070');if(k==='eq_bow3')return MADE[k]=bow(12,5,'#ece4cc','#ffffff','#a89878');return null};
 const _ic=iconURL;iconURL=function(k,col){return icon(k)||_ic(k,col)};
 if(typeof eqIcon==='function'){const _ei=eqIcon;eqIcon=function(k){return icon(k)||_ei(k)}}}
