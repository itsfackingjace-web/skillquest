// ---- 196. Controller in the Dev Suite ----
// While the Dev Suite is open, navRoot is #dvs (after the on-screen keyboard and request popups, which still win), so the D-pad
// moves between its buttons, fields and lists (+ the quest map boxes, event rows, simulator rows and the picture canvas) and ✕ picks.
// ○ = back (an open card's Back / closing the item), Options = close the suite, L1 / R1 = previous / next Dev Suite tab.
// Picture editors: ✕ on the canvas starts DRAW MODE: a pixel cursor moved by the D-pad / left stick, ✕ held paints (a real pointer
// stroke on #dvc, so every tool works), △ next tool, □ undo, L1 / R1 previous / next colour, ○ leaves draw mode.
(()=>{if(typeof navRoot!=='function'||!window.SQSUITE)return;
 const dvs=()=>document.getElementById('dvs');const open=()=>SQSUITE.state&&SQSUITE.state.open&&dvs()&&dvs().style.display!=='none';
 const EXTRA='.dv-qb,.dv-evr,[data-simrow],[data-simsort],#dvc';
 {const _nr=navRoot;navRoot=function(){const r=_nr.apply(this,arguments);if(!open())return r;if(r&&(r.id==='sqosk'||/^(trpop|ptpop|dlpop|updbar|sqlost|sqsess)$/.test(r.id)))return r;return dvs()}}
 {const _ni=navItems;navItems=function(root){const base=_ni.apply(this,arguments);if(!root||root.id!=='dvs')return base;
   const more=[...root.querySelectorAll(EXTRA)].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0});
   const all=[...new Set([...base,...more])].filter(e=>!e.disabled&&!(e.type==='hidden'));
   return all.sort((a,b)=>a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1)}}
 // ---- draw mode ----
 const D={on:false,x:48,y:56,down:false,rep:0,dir:'',prev:[]};
 const cur=document.createElement('div');cur.id='sqdvcur';cur.style.cssText='position:fixed;z-index:2147483646;pointer-events:none;display:none;box-sizing:border-box;border:2px solid #f8d048;box-shadow:0 0 0 1px #000,0 0 0 3px #f8d04866';document.body.appendChild(cur);
 const tip=document.createElement('div');tip.style.cssText='position:fixed;z-index:2147483646;pointer-events:none;display:none;left:50%;bottom:14px;transform:translateX(-50%);background:#181c24ee;color:#fff;border:1px solid #f8d048;border-radius:8px;padding:6px 12px;font:600 13px system-ui,sans-serif';
 tip.textContent='Draw mode · D-pad move · ✕ paint · △ tool · □ undo · L1/R1 colour · ○ done';document.body.appendChild(tip);
 const cv=()=>document.getElementById('dvc');const ed=()=>SQSUITE.state&&SQSUITE.state.ed;
 function cell(){const c=cv(),e=ed();if(!c||!e)return null;const r=c.getBoundingClientRect();return{r,z:r.width/e.w,e}}
 function place(){const q=cell();if(!q){stop();return}const{r,z,e}=q;D.x=Math.max(0,Math.min(e.w-1,D.x));D.y=Math.max(0,Math.min(e.h-1,D.y));
  // keep the cursor in view inside the scrolling canvas box
  const box=cv().parentElement;if(box){const br=box.getBoundingClientRect(),px=r.left+(D.x+.5)*z,py=r.top+(D.y+.5)*z;if(px<br.left+z*2)box.scrollLeft-=br.left+z*2-px;if(px>br.right-z*2)box.scrollLeft+=px-(br.right-z*2);if(py<br.top+z*2)box.scrollTop-=br.top+z*2-py;if(py>br.bottom-z*2)box.scrollTop+=py-(br.bottom-z*2)}
  const r2=cv().getBoundingClientRect();const s=Math.max(6,z);cur.style.left=(r2.left+D.x*z+z/2-s/2)+'px';cur.style.top=(r2.top+D.y*z+z/2-s/2)+'px';cur.style.width=cur.style.height=s+'px';cur.style.display='block'}
 const at=()=>{const q=cell();return q?{clientX:q.r.left+(D.x+.5)*q.z,clientY:q.r.top+(D.y+.5)*q.z}:null};
 const fire=(type,tgt)=>{const p=at();if(!p)return;(tgt||cv()).dispatchEvent(new PointerEvent(type,{...p,pointerId:77,pointerType:'pen',buttons:type==='pointerup'?0:1,bubbles:true,cancelable:true}))};
 function start(){const e=ed();if(!e||!cv())return;if(!D.on){D.x=e.w>>1;D.y=e.h>>1;const q=cell();if(q&&q.e.kind==='worn'){D.x=48;D.y=60}}D.on=true;tip.style.display='block';place()}
 function stop(){if(D.down){fire('pointerup');D.down=false}D.on=false;cur.style.display='none';tip.style.display='none'}
 {const _np=navPress;navPress=function(){if(open()&&GPF&&GPF.id==='dvc'&&GPON){start();return}return _np.apply(this,arguments)}}
 const clickSel=s=>{const b=dvs()&&dvs().querySelector(s);if(b){b.click();return true}return false};
 function cycle(sel,attr,cmp,step){const L=[...dvs().querySelectorAll(sel)];if(!L.length)return;let i=L.findIndex(cmp);i=(i+step+L.length)%L.length;L[i].click()}
 {const _pp=pollPad;pollPad=function(dt){if(!open()){if(D.on)stop();return _pp.apply(this,arguments)}
   let gp=null;try{gp=navigator.getGamepads()[GPI]}catch(e){}
   if(!gp||!GPON){if(D.on)stop();return _pp.apply(this,arguments)}
   const down=i=>!!(gp.buttons[i]&&(gp.buttons[i].pressed||gp.buttons[i].value>.5)),pr=i=>down(i)&&!GPPREV[i];
   if(D.on){if(!cv()||!ed()){stop();GPPREV=gp.buttons.map(b=>b.pressed||b.value>.5);return}
    const ax=gp.axes||[],dx=(down(PADB.RIGHT)?1:0)-(down(PADB.LEFT)?1:0)||(Math.abs(ax[0]||0)>.5?Math.sign(ax[0]):0),dy=(down(PADB.DOWN)?1:0)-(down(PADB.UP)?1:0)||(Math.abs(ax[1]||0)>.5?Math.sign(ax[1]):0);
    const dir=dx||dy?dx+','+dy:'';if(dir!==D.dir){D.dir=dir;D.rep=0}else if(dir)D.rep+=dt||.016;
    const tick=dir&&(D.rep===0||D.rep>.3&&((D.rep-.3)%.05)<(dt||.016));if(dir&&D.rep===0)D.rep=1e-6;
    if(tick){D.x+=dx;D.y+=dy;place();if(D.down)fire('pointermove')}
    if(pr(PADB.X)){D.down=true;fire('pointerdown')}else if(D.down&&!down(PADB.X)){fire('pointerup');D.down=false}
    if(pr(PADB.TRI))cycle('.dv-tools [data-tool]','tool',b=>b.classList.contains('dv-on'),1);
    if(pr(PADB.SQ))clickSel('[data-a="undo"]');
    if(pr(PADB.L1)||pr(PADB.R1))cycle('.dv-pal [data-col]','col',b=>b.classList.contains('dv-on'),pr(PADB.R1)?1:-1);
    if(pr(PADB.O)||pr(PADB.OPT)){stop();try{setFocus(cv())}catch(e){}}
    if(D.on)place();GPPREV=gp.buttons.map(b=>b.pressed||b.value>.5);return}
   // ○ = back inside the suite, L1/R1 = tabs
   if(pr(PADB.O)){GPPREV[PADB.O]=true;if(!clickSel('[data-a="back"]')){const S=SQSUITE.state;if(S.sel||S.ed){S.sel=null;S.ed=null;SQSUITE.api.draw()}else SQSUITE.close()}try{setFocus(null)}catch(e){}}
   if(pr(PADB.L1)||pr(PADB.R1)){const n=pr(PADB.R1)?1:-1;GPPREV[PADB.L1]=GPPREV[PADB.R1]=true;cycle('[data-tab]','tab',b=>b.dataset.tab===SQSUITE.state.tab,n);try{setFocus(null)}catch(e){}}
   return _pp.apply(this,arguments)}}
 window.SQDVPAD={D,start,stop}})();
