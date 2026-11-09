// ---------------------------------------------------------------- 30. Touch ULT button; controllers on phones and tablets
// A ULT button appears for touch players with a wand. The Options screen shows live controller status (connected,
// waiting for a button press, or blocked by the page) with a button test, and phones get mappings that avoid
// buttons the system keeps for itself (on iPhone, Create takes screenshots).
const isMobileOS=(()=>{try{return/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}catch(e){return false}})();
const ubt=document.createElement('div');ubt.className='b';ubt.id='ub';ubt.innerHTML='ULT';ubt.style.cssText='width:52px;height:52px;right:178px;bottom:calc(env(safe-area-inset-bottom,0px) + 156px);font-size:12px;display:none';document.body.appendChild(ubt);
ubt.addEventListener('touchstart',e=>{e.preventDefault();if(!pnOpen&&!menuOpen&&!dead)castUlt()},{passive:false});ubt.addEventListener('click',()=>{if(!pnOpen&&!menuOpen&&!dead)castUlt()});
let lastUb='';
function ubUpdate(){const show=!isPC&&!GPON&&!!WAND&&!menuOpen&&!dead;const lab=!show?'':ULTCD>0?'ULT<small>'+Math.ceil(ULTCD)+'s</small>':MANA<ULT_COST?'ULT<small>mana</small>':'ULT';
 const k=show+'|'+lab;if(k===lastUb)return;lastUb=k;ubt.style.display=show?'flex':'none';ubt.innerHTML=lab;ubt.style.opacity=ULTCD>0||MANA<ULT_COST?'.55':'1';ubt.style.color=ULTCD>0||MANA<ULT_COST?'':'#8a50e0'}
// --- controller status and button test ---
let PADSTAT='waiting',PADNAME='',PADLAST='';
const PADBN=['✕','○','□','△','L1','R1','L2','R2','Create','Options','L3','R3','D-pad up','D-pad down','D-pad left','D-pad right','PS','Touchpad'];
function padCheck(){if(!navigator.getGamepads){PADSTAT='unsupported';return}let list;try{list=navigator.getGamepads()}catch(e){PADSTAT='blocked';return}
 const gp=[...list].find(x=>x&&x.connected);if(!gp){PADSTAT=GPON?'waiting':'waiting';PADNAME='';return}PADSTAT='connected';PADNAME=(gp.id||'Controller').replace(/\(.*\)/,'').trim().slice(0,40);
 const i=gp.buttons.findIndex(b=>b&&(b.pressed||b.value>.5));if(i>=0)PADLAST=PADBN[i]||('button '+i)}
function padStatusHTML(){padCheck();const s={connected:'<b style="color:#2f8a3a">Connected</b>'+(PADNAME?' · '+esc(PADNAME):''),waiting:'<b>Not detected yet.</b> Turn the controller on, pair it'+(isMobileOS?' in your phone\'s Bluetooth settings':'')+', then press any button on it.',
  blocked:'<b style="color:#d05030">Blocked here.</b> This page isn\'t allowed to read controllers while it\'s embedded. Open the game in its own tab and it will work there.',unsupported:'<b style="color:#d05030">Not supported</b> by this browser. Try Safari, Chrome or Edge.'}[PADSTAT];
 return'<div class="tl" style="margin-top:16px">CONTROLLER</div><div class="qc" style="font-size:13px;line-height:1.55" id="padst"><p>'+s+'</p>'+(PADSTAT==='connected'?'<p>Button test: <b id="padlast">'+(PADLAST||'press any button')+'</b></p>':'')+'</div>'
  +(PADSTAT==='blocked'||PADSTAT==='waiting'?'<button class="sb padtab">Open the game in its own tab</button>':'')}
const _opt30=optionsHTML;optionsHTML=function(){let h=_opt30();const k=h.indexOf('<div class="tl" style="margin-top:16px">CONTROLLER</div>');const st=padStatusHTML();
 if(k>=0)return h.slice(0,k)+st+h.slice(h.indexOf('<button class="sb gpo"',k));const j=h.indexOf('<div class="tl" style="margin-top:22px');return j<0?h+st:h.slice(0,j)+st+h.slice(j)};
const _oc30=pbd.onclick;pbd.onclick=e=>{if(e.target.closest('.padtab')){saveLocal(true);try{window.open(location.href,'_blank')}catch(_){}return}_oc30(e)};
// live refresh of the status box while Options is open
let padT=0;
const _u30=upd;upd=function(dt){_u30(dt);ubUpdate();
 if(pnOpen&&ptab===8&&(padT+=dt)>.25){padT=0;const old=PADSTAT,ol=PADLAST;padCheck();const el=document.getElementById('padlast');if(old!==PADSTAT)rPn();else if(el&&ol!==PADLAST)el.textContent=PADLAST}};

