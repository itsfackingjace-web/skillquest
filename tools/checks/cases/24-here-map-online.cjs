// The HERE map lists players online, like the WORLD map; someone on your island is marked (here).
module.exports={name:'HERE map lists players online',players:2,async run([A,B],t){
 const pos=await A.evaluate(()=>({x:P.x,y:P.y}));await B.evaluate(p=>{P.x=p.x+40;P.y=p.y},pos);
 let txt='';for(let i=0;i<30;i++){txt=await A.evaluate(()=>{MAPVIEW='local';const d=document.createElement('div');d.innerHTML=mapHTML();const q=d.querySelector('.sqonl');return q?q.textContent:''});if(/\(2\)/.test(txt))break;await A.waitForTimeout(400)}
 t(/Players online \(2\)/.test(txt),'list shows 2: '+txt);t(/\(here\)/.test(txt),'other player marked here: '+txt);
 const world=await A.evaluate(()=>{MAPVIEW='world';const d=document.createElement('div');d.innerHTML=mapHTML();MAPVIEW='local';return d.querySelectorAll('.sqonl').length});t.eq(world,0,'not added twice on the WORLD map')}};
