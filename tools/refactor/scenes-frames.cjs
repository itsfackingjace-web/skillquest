// Scenes for compare-frames.cjs. Each gets S: frame(n, every) steps n frames recording a line every `every`, key(k,on), rec(tag).
module.exports={
 walk(S){const seq=[['arrowright',90],['arrowdown',60],['arrowleft',120],['arrowup',90],['d',40]];
  for(const[k,n]of seq){S.key(k,1);S.frame(n,10);S.key(k,0)}S.key('shift',1);S.key('arrowright',1);S.frame(60,10);S.key('arrowright',0);S.key('shift',0);S.frame(30,10)},
 night_fight(S){time=Math.floor(time/DAYLEN)*DAYLEN+DAYLIGHT+40;P.hp=6;
  // open grass at least 35 tiles from the start (out of town)
  const ok=(x,y)=>{for(let b=-3;b<=3;b++)for(let a=-3;a<=3;a++){const i=(y+b)*N+x+a;if(tile[i]===0||obj[i]||solid((x+a)*16+8,(y+b)*16+8))return false}return true};
  const px=Math.floor(P.x/16),py=Math.floor(P.y/16);let spot=null;for(let d=35;d<90&&!spot;d++)for(const[x,y]of[[px+d,py],[px-d,py],[px,py+d],[px,py-d],[px+d,py+d],[px-d,py-d]])if(!spot&&ok(x,y))spot=[x,y];
  if(spot){P.x=spot[0]*16+8;P.y=spot[1]*16+8}S.frame(30,30);
  for(const[t,dx,dy,hp]of[['slime',40,0,6],['slime',-30,30,6],['skel',0,-60,10],['wolf',60,40,8]])en.push({x:P.x+dx,y:P.y+dy,hp,type:t,kx:0,ky:0,tcd:1});
  for(let r=0;r<40;r++){S.frame(15,15);const n=en.filter(m=>!m.dead).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y))[0];
   if(n){const dx=n.x-P.x,dy=n.y-P.y;face=Math.abs(dx)>Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)];S.key(Math.abs(dx)>Math.abs(dy)?(dx>0?'arrowright':'arrowleft'):(dy>0?'arrowdown':'arrowup'),1);S.frame(8,8);for(const k of['arrowright','arrowleft','arrowup','arrowdown'])S.key(k,0)}
   attack();S.rec('hit'+r)}},
 skills(S){inv.wood=20;inv.stone=10;inv.meat=6;inv.oaklog=6;XPS[5]=XT[30];
  // chop the nearest tree
  let best=null,bd=1e9;const px=Math.floor(P.x/16),py=Math.floor(P.y/16);for(let y=py-12;y<=py+12;y++)for(let x=px-12;x<=px+12;x++){const o=obj[y*N+x];if(o&&o.t==='tree'&&!solid(x*16+8,(y+1)*16+8)){const d=Math.abs(x-px)+Math.abs(y-py);if(d<bd){bd=d;best=[x,y]}}}
  if(best){P.x=best[0]*16+8;P.y=(best[1]+1)*16+8;face=[0,-1];for(let i=0;i<12;i++){attack();S.frame(20,10)}}
  P.y+=24;face=[0,1];S.frame(5,5);window.SQFIREDIRECT=1;fire();window.SQFIREDIRECT=0;S.frame(240,10);P.hp=3;eat();S.frame(300,15);eat();S.frame(120,15);
  fire();S.frame(30,10);const b=document.querySelector('[data-fmb="1"]');if(b)b.click();S.frame(260,20)},
 island(S){routeOpen=()=>true;routeGo('ashfall');S.frame(900,30);S.key('arrowup',1);S.frame(120,10);S.key('arrowup',0);S.frame(60,10)},
 fishing(S){inv.rod=1;TL.rod=Math.max(TL.rod||0,1);const px=Math.floor(P.x/16),py=Math.floor(P.y/16);let spot=null;
  for(let d=1;d<80&&!spot;d++)for(let y=py-d;y<=py+d&&!spot;y++)for(let x=px-d;x<=px+d;x++){if(!fishWaterAt(x,y+1)||fishWaterAt(x,y)||solid(x*16+8,y*16+8))continue;spot=[x,y];break}
  P.x=spot[0]*16+8;P.y=spot[1]*16+8;face=[0,1];S.frame(10,10);for(let r=0;r<4;r++){attack();S.frame(400,20)}openSM();S.frame(300,20);closeSM();S.frame(60,20)},
 dungeon(S){const k=Object.keys(DKIND)[0];P.hp=6;SQTEST.goDun(k,1);S.frame(30,10);
  for(let r=0;r<20;r++){S.key(r%2?'arrowup':'arrowright',1);S.frame(20,10);S.key('arrowup',0);S.key('arrowright',0);attack();S.frame(10,10)}},
 house(S){const ok=(x,y)=>{for(let b=-4;b<=4;b++)for(let a=-4;a<=4;a++){const i=(y+b)*N+x+a;if(tile[i]===0||obj[i]||solid((x+a)*16+8,(y+b)*16+8))return false}return true};
  const px=Math.floor(P.x/16),py=Math.floor(P.y/16);let spot=null;for(let d=35;d<90&&!spot;d++)for(const[x,y]of[[px+d,py],[px-d,py],[px,py+d],[px,py-d]])if(!spot&&ok(x,y))spot=[x,y];
  if(spot){P.x=spot[0]*16+8;P.y=spot[1]*16+8;face=[0,-1]}inv.house=1;startBuild('house');placeBuild();if(BUILD)endBuild();S.frame(20,10);const h=HOUSES.find(o=>!o._foreign);
  if(h){P.x=h.x*16+8;P.y=(h.y+1)*16+8;face=[0,-1];S.key('arrowup',1);S.frame(40,10);S.key('arrowup',0);S.frame(30,10);
   for(const k of['arrowleft','arrowup','arrowright','arrowdown']){S.key(k,1);S.frame(30,10);S.key(k,0)}S.key('arrowdown',1);S.frame(90,10);S.key('arrowdown',0);S.frame(30,10)}},
 panels(S){inv.wood=30;inv.stone=20;inv.iron=5;GLD=5000;for(const t of[0,1,2,3,4,5,6,7,8,31,35,38,39,41,43,44,45,46,47,48,49,50,51]){try{openPanel(t);rPn()}catch(e){}S.frame(3,3);S.rec('p'+t);try{closePanel()}catch(e){}S.frame(2,2)}
  try{openSM();S.frame(5,5);S.rec('sm');closeSM()}catch(e){}},
 misc(S){for(const id of['map','options','style','emotes','patron','bag','card','skills','quests','craft']){try{showScreen(id)}catch(e){}S.frame(4,4);S.rec('s:'+id);try{closePanel()}catch(e){}S.frame(2,2)}
  try{newGame()}catch(e){}S.frame(10,10);S.rec('ng');const h=JSON.stringify(snap());let x=2166136261;for(let i=0;i<h.length;i++){x^=h.charCodeAt(i);x=Math.imul(x,16777619)}S.rec('snap'+(x>>>0).toString(36));
  for(let i=0;i<3;i++){addXp(1,500);S.frame(5,5)}S.rec('xp')},
};
