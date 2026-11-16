// ---- 220. One place for every cape: START > Style ----
// Capes used to be worn from three screens (Marlo's capes on Style, the guild cape on the guild screen, the fire cape in
// Options > PATRON). 085's Style screen now lists them all in its Cape box through `window.SQCAPEX`:
//   opts()     extra choices [{id:'guild'|'fire', l: label}] the player can wear right now
//   wearing()  which extra one is on ('' = none, or a Marlo cape / nothing)
//   pick(id)   wear that one and take the others off ('' = take both extras off; 085 clears its own COS.cape)
//   preview()  your character from the back and the front with what you're wearing (drawn through cP, like 201's pic)
// Wearing is still saved where it always was (201's `gcw`, 210's `fcw`, 085's cos.cape), so nothing in saves changes.
// The guild screen and Options > PATRON now only point here.
(()=>{const G=()=>window.SQGCAPE,PA=()=>window.SQPATRON;
 const me=()=>{const m=window.SQMP;return m&&m.user?m.user.uid:''};
 const inGuild=()=>{const s=window.SQGUILD&&SQGUILD.state;return!!(s&&s.id&&s.info)};
 const fireOK=()=>{const p=PA();return!!(p&&me()&&p.cape(me()))};
 const sw=c=>'<span style="color:'+c+'">&#9632;</span> ';
 function opts(){const L=[];if(inGuild()&&G()){let c='#3870d8';try{const d=G().design();c=G().PAL[d.c]||c}catch(e){}L.push({id:'guild',l:sw(c)+'Guild cape'})}
  if(fireOK())L.push({id:'fire',l:(PA().flameURL?'<img alt="" src="'+PA().flameURL+'" style="width:9px;height:11px;image-rendering:pixelated;vertical-align:-1px;margin-right:4px">':sw('#e8581a'))+'Fire cape'});return L}
 function wearing(){const p=PA(),g=G();if(p&&p.wearing&&fireOK())return'fire';if(g&&g.wear&&inGuild())return'guild';return''}
 function pick(id){const p=PA(),g=G();if(p)p.wearing=id==='fire';if(g)g.wear=id==='guild';try{KITC.clear()}catch(e){}
  if(id)try{say(id==='fire'?'You put on your fire cape.':'You put on the guild cape.')}catch(e){}}
 // the character, at 3x, from the back and the front (the part of 201's 48x56 box around the kit)
 function pic(dir){try{const ch=gearCH(),c=document.createElement('canvas');c.width=72;c.height=78;c.hd2=true;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
   x.setTransform(3,0,0,3,0,-18);const sv=GC;GC=x;try{cP(ch,dir,0,12,25,false)}finally{GC=sv;x.setTransform(1,0,0,1,0,0)}return c.toDataURL()}catch(e){return''}}
 function preview(){const a=pic(1),b=pic(0);if(!a&&!b)return'';const im=u=>u?'<img alt="" src="'+u+'" style="width:60px;image-rendering:pixelated">':'';
  return'<div style="display:flex;gap:10px;justify-content:center;margin:4px 0 6px">'+im(a)+im(b)+'</div>'}
 window.SQCAPEX={opts,wearing,pick,preview};
 // the Style screen redraws itself on a pick, but the guild design or patron record can arrive later: refresh while open
 let last='';setInterval(()=>{try{if(!pnOpen||ptab!==31)return;const k=opts().map(o=>o.id).join()+'|'+wearing();if(k!==last){const was=last;last=k;if(was)rPn()}}catch(e){}},1000)})();
