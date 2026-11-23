// ---- 278. "Cook everything" on the cooking stove ----
// Nov 22 (Jace: "add a cook everything button to the stove"). The stove had one "Cook all <food>" button per raw food (022), so a
// bag of five kinds of fish took five presses. "Cook everything" cooks every raw food the player can cook, one at a time through
// 109's timed 'cook' job: each step cooks one of the first kind left (COOKS order) through stationAct('ck_<raw>'), so burning, 039's
// perks, quests and the stove's chests (033 lends them while the button is handled, 109 again for every step) work as for "Cook all".
// Kinds the Cooking level doesn't allow yet are left alone; one unlocked by a level-up along the way is cooked too.
// Shown when two or more kinds can be cooked (with one kind it would be the same as that kind's "Cook all"). Meals aren't included.
(()=>{
 // one entry per raw food: the first COOKS entry for it, the one 022's "ck_" uses
 const kinds=()=>{const cl=lvOf(4),seen=new Set(),out=[];for(const c of COOKS){if(seen.has(c.raw))continue;seen.add(c.raw);if(cl>=c.lv&&(inv[c.raw]|0)>0)out.push(c)}return out};
 const left=()=>kinds().reduce((a,c)=>a+(inv[c.raw]|0),0);
 {const _sh=stationHTML;stationHTML=function(o){const h=_sh.apply(this,arguments);try{if(!o||o.t!=='stove'||typeof h!=='string')return h;const K=kinds();if(K.length<2)return h;
   const b=row22('ckall','Cook everything ('+left()+')','All your raw food, one after another: '+K.map(c=>esc(iname(c.raw))).join(', '),true),at=h.indexOf('data-a="ck_');
   if(at<0)return h;const i=h.lastIndexOf('<button',at);return i<0?h:h.slice(0,i)+b+h.slice(i)}catch(e){self.SQERR&&SQERR(e,'270-1');return h}}}
 function step(){const c=kinds()[0];if(!c)return;stationAct('ck_'+c.raw);
  // keep the job going while there's food left (a level-up can unlock another kind), and keep "N left" right
  try{const D=window.SQDO;if(D&&D.every){const r=left();D.n=r+1;D.tot=(D.done|0)+1+r}}catch(e){self.SQERR&&SQERR(e,'270-2')}}
 {const _sa=stationAct;stationAct=function(a){if(a!=='ckall')return _sa.apply(this,arguments);const o=STATION;if(!o||o.t!=='stove')return;
   const n=left();if(n<1){say('Nothing to cook.');try{sfx('swish')}catch(e){self.SQERR&&SQERR(e,'270-3')}return}
   if(typeof sqDo==='function'&&sqDo('cook',n,step)){try{SQDO.tot=n;SQDO.every=1}catch(e){self.SQERR&&SQERR(e,'270-4')}return}step()}}
 window.SQCOOKALL={kinds,left}})();
