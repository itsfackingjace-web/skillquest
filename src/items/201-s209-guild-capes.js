// ---- 209. Guild capes ----
// Every guild member can wear the guild's cape (START > Guild > Members): the guild colour, the emblem the leader picks in
// Settings (info.em, 0-5; rules), and a gold trim from guild level 3. It replaces a Marlo cape while worn (saved as `gcw`).
// It travels to other players inside the character (gearCH: gcp = colour index + 1, gce = emblem, gtr = trim; 061's cleanCh
// keeps small numbers), and the outermost kitBuild paints it the way 085 paints Marlo's capes, with the emblem on the back.
(()=>{const GS=()=>window.SQGUILD&&SQGUILD.state,A=()=>window.SQGUILD&&SQGUILD.api;
 const EM=[{n:'None',p:[]},{n:'Circle',p:['.XX.','XXXX','XXXX','.XX.']},{n:'Cross',p:['.XX.','XXXX','.XX.','.XX.']},{n:'Chevron',p:['X..X','XXXX','.XX.','....']},
  {n:'Stripes',p:['XXXX','....','XXXX','....']},{n:'Crown',p:['X..X','XXXX','XXXX','....']}];
 let WEAR=false;
 const inGuild=()=>{const G=GS();return!!(G&&G.id&&G.info)};
 const info=()=>{const G=GS();return G&&G.info||{}};
 const lvl=()=>{const G=GS();try{return SQGUILD.glv(G.prog&&G.prog.qd)}catch(e){return 1}};
 // the cape in the character (yours, and others' through their presence)
 {const _gc=gearCH;gearCH=function(){const c=_gc.apply(this,arguments);if(WEAR&&inGuild()){const I=info();c.gcp=((I.col|0)%10)+1;c.gce=Math.max(0,Math.min(EM.length-1,I.em|0));if(lvl()>=3)c.gtr=1;delete c.cape}return c}}
 const shade=(hex,f)=>'#'+[1,3,5].map(i=>Math.max(0,Math.min(255,Math.round(parseInt(hex.slice(i,i+2),16)*f))).toString(16).padStart(2,'0')).join('');
 const lum=h=>{const v=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));return .3*v[0]+.59*v[1]+.11*v[2]};
 {const _kb=kitBuild;kitBuild=function(ch,dir,st){if(!ch||!(ch.gcp>0))return _kb.apply(this,arguments);const ch2=Object.assign({},ch);delete ch2.cape;delete ch2.gcp;delete ch2.gce;delete ch2.gtr;
   const base=_kb.call(this,ch2,dir,st);let C='#888888';try{C=SQGUILD.COLS[(ch.gcp-1)%10]}catch(e){}const Dk=shade(C,.7),Lt=shade(C,1.2),K='#181018',T=ch.gtr?'#e8c048':Dk,E=lum(C)>150?'#283048':'#f4f0e4',pat=(EM[ch.gce|0]||EM[0]).p;
   const c=document.createElement('canvas');c.width=16;c.height=32;const x=c.getContext('2d'),px=(a,b,col)=>{x.fillStyle=col;x.fillRect(a,b,1,1)};
   if(dir===1){x.drawImage(base,0,0);for(let y=21;y<=29;y++){const w=Math.min(6,2+((y-21)>>1)),a=7-w,b=8+w;px(a-1,y,K);px(b+1,y,K);for(let X=a;X<=b;X++)px(X,y,X===a||X===b?T:(X===7||X===8)&&y===22?Lt:C)}
    for(let X=1;X<=14;X++)px(X,30,K);if(ch.gtr)for(let X=2;X<=13;X++)px(X,29,T);
    pat.forEach((row,j)=>{for(let i=0;i<4;i++)if(row[i]==='X')px(6+i,24+j,E)})}
   else if(dir===0){for(let y=22;y<=30;y++)for(const X of[0,1,14,15])if(y>23||X===1||X===14)px(X,y,X===0||X===15?K:(ch.gtr&&y===30?T:Dk));x.drawImage(base,0,0);px(3,22,ch.gtr?T:Lt);px(12,22,ch.gtr?T:Lt)}
   else{for(let y=21;y<=30;y++){const w=y<24?1:y<27?2:3;for(let k=0;k<w;k++)px(11+k,y,k===w-1?T:C);px(11+w,y,K)}x.drawImage(base,0,0)}
   return c}}
 // saving the choice to wear it
 {const _sn=snap;snap=function(){const s=_sn.apply(this,arguments);if(WEAR)s.gcw=1;return s}}
 {const _ap=applySave;applySave=function(S){const out=_ap.apply(this,arguments);WEAR=!!(S&&S.gcw);try{KITC.clear()}catch(e){}return out}}
 {const _ng=newGame;newGame=function(){WEAR=false;return _ng.apply(this,arguments)}}
 try{KNOWN49.add('gcw')}catch(e){}
 // a picture of the cape from behind, for the guild screen
 function preview(em){try{const ch=Object.assign({},gearCH());const I=info();ch.gcp=((I.col|0)%10)+1;ch.gce=em==null?(I.em|0):em;if(lvl()>=3)ch.gtr=1;else delete ch.gtr;delete ch.cape;
   const s=kitSprite(ch,1,0,false),c=document.createElement('canvas');c.width=s.width*3;c.height=s.height*3;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(s,0,0,c.width,c.height);return c.toDataURL()}catch(e){return''}}
 const img=(u,w)=>u?'<img alt="" src="'+u+'" style="width:'+w+'px;image-rendering:pixelated;flex:none">':'';
 function card(){if(!inGuild())return'';return'<div class="qc"><div style="display:flex;gap:12px;align-items:center">'+img(preview(),48)+'<div style="flex:1"><b>Guild cape</b><p style="font-size:13px">In your guild\'s colour'+((info().em|0)?' with its emblem':'')+(lvl()>=3?' and a gold trim':', gold trim from guild level 3')+'. Everyone sees it. It replaces your Marlo cape while you wear it.</p>'+
   '<button class="qb" data-g="gcp:wear">'+(WEAR?'Take it off':'Wear the guild cape')+'</button></div></div></div>'}
 function setCard(){const cur=info().em|0;return'<div class="qc"><b>Cape emblem</b><p style="font-size:13px">Shown on the back of every member\'s guild cape (in the guild colour above).</p><div style="display:flex;gap:8px;flex-wrap:wrap">'+
   EM.map((e,i)=>'<button data-g="gcp:em:'+i+'" style="display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px 6px;border:3px solid '+(i===cur?'#f8a020':'#485870')+';background:#f8f8f8;cursor:pointer;font:700 11px '+PF+'">'+img(preview(i),32)+e.n+'</button>').join('')+'</div></div>'}
 function act(x,y){const a=A();if(x==='wear'){WEAR=!WEAR;try{KITC.clear()}catch(e){}try{saveLocal(true)}catch(e){}a&&a.tell(WEAR?'You put on the guild cape.':'You took off the guild cape.');return}
  if(x==='em'){if(!a||a.role()!=='l')return;const v=Math.max(0,Math.min(EM.length-1,+y|0));a.DB().set(a.ref('guilds/'+SQGUILD.id+'/info/em'),v).then(()=>{try{KITC.clear()}catch(e){}a.tell('The guild cape now has the '+EM[v].n.toLowerCase()+' emblem.')}).catch(a.fail)}}
 window.SQGCAPE={card,setCard,act,EM,get wear(){return WEAR},set wear(v){WEAR=!!v;try{KITC.clear()}catch(e){}}};
})();
