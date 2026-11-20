// ---- 202. Talking to villagers who are asleep ----
// At night village folk sleep in their beds (n.scene = <house>+'#bed', drawn by 020/041/044/046 but not in NPCS' scene),
// so 005's nearNpc() never finds them and a quest that sends you to them ("talk to Corin") seemed broken: the arrow led to
// a house with a sleeping person who couldn't be talked to. Standing next to the bed now shows TALK, and talking wakes
// them for that conversation: for the length of the outermost talk() the sleeper is put in the room's scene at the bed,
// so the game's own talk/quest/shop code runs as by day. 046's twfolk panel keeps its TALKN from the first render.
(()=>{const near=()=>{if(!SCENE||typeof FOLK==='undefined')return null;let best=null,bd=40;for(const n of FOLK){if(!n||!n.bed||n.scene!==SCENE.id+'#bed')continue;
  const d=Math.hypot(n.bed[0]*16+8-P.x,n.bed[1]*16+10-P.y);if(d<bd){bd=d;best=n}}return best};
 const awake=()=>{try{return typeof nearNpc==='function'&&!!nearNpc()}catch(e){return false}};
 {const _t=talk;talk=function(){const n=!pnOpen&&!menuOpen&&!dead&&!awake()?near():null;if(!n)return _t.apply(this,arguments);
   const s=n.scene,x=n.x,y=n.y,dir=n.dir;n.scene=SCENE.id;n.x=n.bed[0]*16+8;n.y=n.bed[1]*16+10;
   try{_t.apply(this,arguments)}finally{n.scene=s;n.x=x;n.y=y;n.dir=dir}
   if(!pnOpen&&msg&&msg.indexOf(n.name)===0)msg='(yawn) '+msg}}
 {const _pu=window.SQPADUSE;window.SQPADUSE=()=>!!near()||!!(_pu&&_pu())}
 let mine=false;{SQUPD.after('194',(dt)=>{try{const n=!pnOpen&&!menuOpen&&!dead&&!awake()?near():null;
   if(n&&(tk.style.display==='none'||mine)){tk.style.display='flex';const lab='TALK'+(isPC?'<small>T</small>':(typeof GPON!=='undefined'&&GPON?'<small>✕</small>':''));if(tk.innerHTML!==lab)tk.innerHTML=lab;mine=true}
   else if(!n&&mine){mine=false;if(!pnOpen)tk.style.display='none'}}catch(e){self.SQERR&&SQERR(e,'194-1')}})}
 window.SQSLEEPTALK={near}})();
