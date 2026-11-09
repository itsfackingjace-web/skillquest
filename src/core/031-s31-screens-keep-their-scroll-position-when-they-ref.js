// ---------------------------------------------------------------- 31. Screens keep their scroll position when they refresh
// Buying, crafting or selecting something redraws the screen; it now stays where you were (some browsers,
// Safari especially, otherwise jump back to the top). A different screen still opens at the top.
let RKEY=null;
const scrKey=()=>[ptab,ptab===2?shop:'',typeof TALKN!=='undefined'&&TALKN?TALKN.id||TALKN.kind:'',typeof STATION!=='undefined'&&STATION?STATION.t+STATION.i:'',typeof BENCH!=='undefined'&&BENCH?'bench':''].join('|');
const _r31=rPn;rPn=function(){const key=scrKey(),same=key===RKEY&&pn.style.display!=='none',st=pn.scrollTop;_r31();const k2=scrKey();RKEY=k2;
 if(same&&k2===key&&st>0){const fix=()=>{if(RKEY===key&&pn.style.display!=='none'&&Math.abs(pn.scrollTop-st)>2)pn.scrollTop=st};fix();requestAnimationFrame(fix);setTimeout(fix,60)}};
const _cp31=closePanel;closePanel=function(){RKEY=null;_cp31()};
const _cso31=closeScreenOnly;closeScreenOnly=function(){RKEY=null;_cso31()};
// a pressed button that disappears in the redraw shouldn't drag the page anywhere
pbd.addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(b&&!b.closest('input'))e.preventDefault()},{passive:false});
