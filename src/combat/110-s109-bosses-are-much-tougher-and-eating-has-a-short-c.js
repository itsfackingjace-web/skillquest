// ---- 109. Bosses are much tougher, and eating has a short cooldown ----
// Every boss (island bosses, world bosses, dungeon and floor bosses) has more HP and hits harder, and you can only eat
// once every 3 seconds, so standing still and eating through a boss's damage no longer works.
{const BT=new Set(['boss','bonelord','matri','tidekeeper','frostfang','thorn','emberl','ib']);try{for(const f of Object.values(window.WK_BOSSMK||{})){const t=f().type;if(t)BT.add(t)}}catch(e){}
 const isBoss=m=>m&&!m.dead&&(m.big||m.boss||BT.has(m.type)||m._wb);
 // dungeon/floor bosses (island and world bosses get their HP from their own tables): double HP the first time they appear
 const _u=upd;upd=function(dt){_u(dt);for(const m of en)if(!m._hard&&!m._rp&&!m._wb&&m.type!=='ib'&&isBoss(m)){m._hard=1;m.hp=Math.round((m.hp||1)*2);m.mhp=Math.round((m.mhp||m.hp/2)*2)}
  if(EATCD>0)EATCD-=dt};
 // bosses hit 60% harder
 const near=()=>{for(const m of en)if(isBoss(m)&&Math.hypot(m.x-P.x,m.y-P.y)<360)return true;const R=SCENE&&SCENE.room;return!!(R&&/^ib_/.test(SCENE.id||''))};
 const _h=hurtP;hurtP=function(d,msg){return _h(near()?Math.ceil(d*1.6*10)/10:d,msg)};
 // eating: once every 3 seconds (cooking at a fire isn't eating)
 var EATCD=0;window.SQEATCD=()=>EATCD;
 const _e=eat;eat=function(){if(dead||menuOpen||pnOpen||window.SQDO_STEP||SQDO)return _e();
  const cooking=nearFire(P.x,P.y,45)&&typeof COOKS!=='undefined'&&COOKS.some(c=>(inv[c.raw]|0)>0&&lvOf(4)>=c.lv&&!c.st);if(cooking)return _e();
  if(EATCD>0){say('Still chewing... ('+EATCD.toFixed(1)+'s)');return}const h0=P.hp,u0=hunger,i0=JSON.stringify(inv);_e();if(P.hp!==h0||hunger!==u0||JSON.stringify(inv)!==i0)EATCD=3}}
