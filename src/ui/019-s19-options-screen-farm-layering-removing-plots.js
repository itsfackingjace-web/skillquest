// ---------------------------------------------------------------- 19. Options screen, farm layering, removing plots
// START menu gets an Options screen. Music and sound effects switch on and off separately.
// Fields are drawn as part of the ground (so people, trees and fences stand in front of them),
// and you can fill a plot back in with the hoe.
// --- options ---
let SFXV=1,MUSV=1;try{const v=JSON.parse(localStorage.getItem('sq_vol')||'null');if(v){SFXV=+v.s;MUSV=+v.m}}catch(e){}
if(!(SFXV>=0&&SFXV<=1))SFXV=1;if(!(MUSV>=0&&MUSV<=1))MUSV=1;
function saveVol(){try{localStorage.setItem('sq_vol',JSON.stringify({s:SFXV,m:MUSV}))}catch(e){}}
mb.style.display='none';
SMI.splice(SMI.findIndex(x=>x.id==='exit'),0,{id:'options',l:()=>'Options'});
const _ss19=showScreen;showScreen=function(id){if(id!=='options')return _ss19(id);pnOpen=true;ptab=8;jx=jy=0;pn.style.display='block';rPn();sfx('talk')};
const VOLS=[0,.25,.5,.75,1];
function volRow(id,label,on,v){return'<div class="gr"><div class="gi"><b>'+label+'</b><br><small>'+(on?'Volume '+Math.round(v*100)+'%':'Off')+'</small></div>'
 +'<button class="gc vo" data-v="'+id+'" data-d="-1"'+(on?'':' style="opacity:.45"')+'>−</button><button class="gc vo" data-v="'+id+'" data-d="1"'+(on?'':' style="opacity:.45"')+'>+</button><button class="gc vo" data-v="'+id+'" data-d="t" style="min-width:58px">'+(on?'ON':'OFF')+'</button></div>'}
function optionsHTML(){return'<div class="tl">OPTIONS</div>'+volRow('m','Music',MUSIC,MUSV)+volRow('s','Sound effects',!MUTE,SFXV)
 +(isPC?'<button class="sb opt" data-o="help">Controls help: '+(helpOn?'ON':'OFF')+'</button>':'')
 +'<div class="tl" style="margin-top:22px;font-size:12px;font-weight:400;opacity:.7">Your game saves by itself, on this device and to your account.</div>'
 +'<button class="ng" id="ngb">'+(ngArm?'Tap again to erase all progress':'Start a new game')+'</button>'}
const _r19=rPn;rPn=function(){if(ptab===8){panelChrome('');pbd.innerHTML=optionsHTML();return}_r19()};
function volAct(id,d){const step=x=>{const k=VOLS.indexOf(x);return VOLS[Math.max(0,Math.min(VOLS.length-1,(k<0?4:k)+d))]};
 if(id==='m'){if(d==='t'){MUSIC=!MUSIC;try{localStorage.setItem('sq_music',MUSIC?'1':'0')}catch(_){}}else{MUSV=step(MUSV);if(MUSV>0&&!MUSIC){MUSIC=true;try{localStorage.setItem('sq_music','1')}catch(_){}}}}
 else{if(d==='t'){MUTE=!MUTE;mb.textContent=MUTE?'🔇':'🔊'}else{SFXV=step(SFXV);if(SFXV>0)MUTE=false}if(!MUTE)sfx('talk')}
 saveVol();saveLocal(true);rPn()}
const _oc19=pbd.onclick;pbd.onclick=e=>{const b=e.target.closest('.vo');if(b){volAct(b.dataset.v,b.dataset.d==='t'?'t':+b.dataset.d);return}_oc19(e)};
// sound-effect volume: scale every effect by SFXV (music has its own gain node)
const _tone19=tone;tone=function(f,d,type,v,slide,delay){if(SFXV<=0)return;return _tone19(f,d,type,(v||.06)*SFXV,slide,delay)};
const _noise19=noise;noise=function(d,v,fq,delay){if(SFXV<=0)return;return _noise19(d,(v||.1)*SFXV,fq,delay)};
// music ignores the sound-effects switch and follows only the music switch and volume
setInterval(()=>{try{if(MG)MG.gain.value=MUSIC?.5*MUSV:0}catch(e){}},60);
// --- farm plots are part of the ground layer ---
const _gh19=GROUNDHOOK;GROUNDHOOK=function(x0,y0,x1,y1,tm){if(!SCENE&&FARM.size)for(const[i,p]of FARM){const x=i%N,y=(i/N)|0;if(x<x0-1||x>x1+1||y<y0-1||y>y1+1)continue;drawPlot(i,p,tm)}if(_gh19)_gh19(x0,y0,x1,y1,tm)};
// --- removing plots: with the hoe, press HIT twice on a plot to fill it back in ---
let fillArm=null;
const _atk19=attack;attack=function(){if(dead||menuOpen||pnOpen||BUILD||SCENE||swing>0||FISH||facingNpc())return _atk19();
 const[fx,fy]=front(13),i=Math.floor(fy/T)*N+Math.floor(fx/T),p=FARM.get(i);
 if(!p||ripe(p)||(p.c&&!wet(p)&&TL.can)||en.some(n=>!n.dead&&Math.hypot(n.x-fx,n.y-fy)<18))return _atk19();
 if(!TL.hoe)return _atk19();
 if(fillArm&&fillArm.i===i&&fillArm.c===p.c&&CLK-fillArm.t<2.5){fillArm=null;swing=.25;
  if(p.c){const sd=CROPS[p.c].seed;inv[sd]=(inv[sd]|0)+1;say('Dug up the '+CROPS[p.c].n.toLowerCase()+' (got the seed back) and filled in the plot.')}else say('Filled in the plot.');
  FARM.delete(i);sfx('chop');saveLocal(true);return}
 swing=.25;sfx('swish');fillArm={i,t:CLK,c:p.c};
 if(p.c){const C=CROPS[p.c],left=Math.max(0,C.max*C.st-p.g);say(C.n+' is growing'+(wet(p)?', about '+Math.ceil(left/60)+' min left':'')+'. Press HIT again to dig it up.')}
 else say('Ready for seeds (plant from your Bag). Press HIT again to fill it in.')};
