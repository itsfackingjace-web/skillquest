// The HERE map lists players online, like the WORLD map; someone on your island is marked (here).
// Nov 22 (Jace: "on the HERE map, other players' locations don't even show up. also, house icons are too big"): the other player gets
// a blue dot with their name on the HERE map, and a house is 6 map pixels across (113 used to double its outline to 12).
module.exports={name:'HERE map lists players online, shows where they are, and small house icons',players:2,async run([A,B],t){
 const pos=await A.evaluate(()=>({x:P.x,y:P.y}));await B.evaluate(p=>{P.x=p.x+40;P.y=p.y+16*6},pos);
 let txt='';for(let i=0;i<30;i++){txt=await A.evaluate(()=>{MAPVIEW='local';const d=document.createElement('div');d.innerHTML=mapHTML();const q=d.querySelector('.sqonl');return q?q.textContent:''});if(/\(2\)/.test(txt))break;await A.waitForTimeout(400)}
 t(/Players online \(2\)/.test(txt),'list shows 2: '+txt);t(/\(here\)/.test(txt),'other player marked here: '+txt);
 const world=await A.evaluate(()=>{MAPVIEW='world';const d=document.createElement('div');d.innerHTML=mapHTML();MAPVIEW='local';return d.querySelectorAll('.sqonl').length});t.eq(world,0,'not added twice on the WORLD map');
 const r=await A.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const hx=Math.floor(P.x/16)-20,hy=Math.floor(P.y/16)+15;HOUSES.push({x:hx,y:hy,id:'chk24',_foreign:1,_owner:'x'});
  MAPVIEW='local';pnOpen=true;ptab=5;pn.style.display='block';rPn();await W(800);const c=document.getElementById('mpc'),x=c.getContext('2d');
  const px=(a,b)=>Array.from(x.getImageData(a,b,1,1).data.slice(0,3)).join(',');const peer=[...SQMP.players.values()][0];
  const tx=Math.floor(peer.ax/16),ty=Math.floor(peer.ay/16),cx=hx+1,cy=hy;
  const L=document.querySelector('#pn .sqmpn');const out={dot:px(tx,ty),name:L?L.textContent:'',peer:peer.n,legend:/Players<\/span>/.test(pbd.innerHTML),
   house:[px(cx+2,cy-3),px(cx+4,cy),px(cx-5,cy)]};HOUSES.splice(HOUSES.findIndex(h=>h.id==='chk24'),1);closePanel();return out});
 t.eq(r.dot,'96,192,255','the other player has a blue dot on the HERE map');t(r.name.includes(r.peer),'their name is over the dot: "'+r.name+'" (want '+r.peer+')');
 t(r.legend,'the legend names the player dots');
 t.eq(r.house.map(v=>v==='32,24,16'),[true,false,false],'a house icon is 6 map pixels across [outline corner, 2 past it on each side]')}};
