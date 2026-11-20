// ---- 203. Game feel: hit sparks, death puffs, screen shake; monsters stuck in walls ----
// - Every frame (end of the outermost upd) monsters near you are compared with the last frame: lost health = a few sparks
//   at the monster (and a tiny shake when you're close), gone with no health left (or through killEnemy, `_kp`) = a puff of
//   smoke in the monster's colours (`COL`) and a short shake. Getting hurt already shakes (015's shakeScreen, now behind the option).
//   Particles go through 028's `part()` / PARTS (drawn by drawParts, cleared by 049's rgClear).
// - Shake moves the canvas element with a CSS transform (slightly scaled so no edge shows); HUD buttons stay put.
//   Options > "Screen shake: ON/OFF" (localStorage `sq_shake`).
// - Monsters pushed into a wall (043's bat knockback isn't collision-checked; dungeon monsters placed on ore) are moved to
//   the nearest free spot after 0.75 s inside something. Bosses, `big`, burrowed (`under`), other players' (`_rp`) are left alone.
(()=>{let SH=0,SHA=0,on=true;try{on=localStorage.getItem('sq_shake')!=='0'}catch(e){self.SQERR&&SQERR(e,'195-1')}
 const shake=(a,t)=>{if(!on)return;SHA=Math.max(SHA*(SH>0?1:0),a);SH=Math.max(SH,t)};
 const COL={slime:['#58a8f0','#3878c8'],wolf:['#a0a0a8','#686870'],skel:['#e8e0c8','#b0a888'],bat:['#7a5aa0','#4a3468'],scorp:['#c87838','#8a4a20'],
  crab:['#e06848','#a83828'],bandit:['#c8a070','#6a4a30'],beetle:['#5a4a3a','#e8783a'],guard:['#4a9a98','#2a6a68'],golem:['#9a8a78','#6a5a48']};
 const colOf=n=>COL[n.type]||COL[String(n.type||'').split(':')[0]]||['#d8d0c8','#9a9088'];
 const puff=(n)=>{if(typeof part!=='function')return;const c=colOf(n),x=n.x,y=n.y-4,big=n.big?2:1;
  for(let i=0;i<10*big;i++){const a=Math.random()*6.283,s=20+Math.random()*40;part(x+Math.cos(a)*3,y+Math.sin(a)*3,Math.cos(a)*s,Math.sin(a)*s-20,.45+Math.random()*.25,i%3?'#f0ece4':'#c8c0b8',-40,i%2?3:2)}
  for(let i=0;i<6*big;i++){const a=Math.random()*6.283,s=30+Math.random()*50;part(x,y,Math.cos(a)*s,Math.sin(a)*s-40,.5+Math.random()*.3,c[i%2],260,i%2?1:2)}};
 const spark=(n)=>{if(typeof part!=='function')return;const a0=Math.atan2(n.y-P.y,n.x-P.x);
  for(let i=0;i<5;i++){const a=a0+(Math.random()-.5)*1.6,s=50+Math.random()*50;part(n.x-Math.cos(a0)*4,n.y-6,Math.cos(a)*s,Math.sin(a)*s-10,.18+Math.random()*.12,i%2?'#ffffff':'#ffe070',0,i%2?1:2)}};
 {const _k=killEnemy;killEnemy=function(n){if(n&&!n.dead)n._kp=1;return _k.apply(this,arguments)}}
 const LAST=new Map();let ut=0;
 {const _ss=shakeScreen;shakeScreen=function(){if(!on)return;return _ss.apply(this,arguments)}}// 015's shake when you're hurt follows the option too
 {SQUPD.after('195',(dt)=>{try{
   if(!menuOpen&&!pnOpen){
    const seen=new Set();for(const n of en){if(!n||n._rp)continue;const d=Math.hypot(n.x-P.x,n.y-P.y);if(d>300)continue;seen.add(n);const was=LAST.get(n);
     if(was!=null&&!n.dead&&n.hp<was){spark(n);if(d<60)shake(1.5,.09)}
     if(n.dead&&!n._puffed&&(n.hp<=0||n._kp)){n._puffed=1;puff(n);if(d<80)shake(n.big?4:2,n.big?.3:.14)}
     LAST.set(n,n.dead?null:n.hp)}
    for(const[n,h]of LAST)if(!seen.has(n)){if(!n._puffed&&(n.hp<=0||n._kp)&&Math.hypot(n.x-P.x,n.y-P.y)<300){n._puffed=1;puff(n)}LAST.delete(n)}
    // monsters inside walls
    if((ut-=dt)<=0){ut=.25;for(const n of en){if(!n||n.dead||n._rp||n.big||n.boss||n.type==='boss'||n.under||n.cb||/ghost|wisp/.test(n.type||''))continue;
      let s=false;try{s=solid(n.x,n.y)}catch(e){self.SQERR&&SQERR(e,'195-2')}if(!s){n._stk=0;continue}n._stk=(n._stk||0)+.25;if(n._stk<.75)continue;n._stk=0;
      const tx=Math.floor(n.x/16),ty=Math.floor(n.y/16);out:for(let r=1;r<=5;r++)for(let b=-r;b<=r;b++)for(let a=-r;a<=r;a++){if(Math.max(Math.abs(a),Math.abs(b))!==r)continue;
       const x=(tx+a)*16+8,y=(ty+b)*16+8;let bad=true;try{bad=solid(x,y)||solid(x-5,y)||solid(x+5,y)||solid(x,y-4)||solid(x,y+5)}catch(e){self.SQERR&&SQERR(e,'195-3')}if(!bad){n.x=x;n.y=y;n.kx=0;n.ky=0;break out}}}}}
   // shake
   if(SH>0){SH-=dt;const a=SH>0?SHA*Math.min(1,SH*8):0;cv.style.transform=a>0?'translate('+((Math.random()*2-1)*a).toFixed(1)+'px,'+((Math.random()*2-1)*a).toFixed(1)+'px) scale(1.012)':'';if(SH<=0)SHA=0}
  }catch(e){console.warn('game feel',e)}})}
 // Options: screen shake on/off
 SQOPTS.wrap('195',_o=>function(){const h=_o(),add='<button class="sb sqshk">Screen shake: '+(on?'ON':'OFF')+'</button>';
  let k=h.indexOf('<div class="tl" style="margin-top:16px">CONTROLLER</div>');if(k<0)k=h.indexOf('<div class="tl" style="margin-top:22px');return k<0?h+add:h.slice(0,k)+add+h.slice(k)});
 pbd.addEventListener('click',e=>{if(!e.target.closest('.sqshk'))return;e.stopPropagation();on=!on;try{localStorage.setItem('sq_shake',on?'1':'0')}catch(err){self.SQERR&&SQERR(err,'195-4')}if(!on){SH=0;cv.style.transform=''}else shake(3,.2);try{sfx('talk')}catch(err){self.SQERR&&SQERR(err,'195-5')}try{rPn()}catch(err){self.SQERR&&SQERR(err,'195-6')}},true);
 window.SQFEEL={shake,puff,spark,get on(){return on}}})();
