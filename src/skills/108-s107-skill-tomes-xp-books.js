// ---- 107. Skill tomes (XP books) ----
// /give <skill> <xp> [count] (owner only) makes "Fishing tome (1,000 XP)" and so on: a real item that can be traded,
// sold at the World Market, dropped in graves... Reading it (Bag → READ) gives that much XP in that skill.
// Item key: xpb_<skill index>_<xp>. Any such key is registered the moment the game meets it.
function sqBookReg(k){if(typeof k!=='string'||k.slice(0,4)!=='xpb_'||INAME[k])return;const m=/^xpb_(\d{1,2})_(\d{1,8})$/.exec(k);if(!m)return;const i=+m[1],xp=+m[2];if(!(i<SKN.length)||!(xp>0))return;
 INAME[k]=SKN[i]+' tome ('+xp.toLocaleString('en-US')+' XP)';SN[k]=SKN[i]+' tomes ('+xp.toLocaleString('en-US')+' XP)';SHORT[k]=SKN[i].toLowerCase()+' tome';
 IDESC[k]='An old book of '+SKN[i].toLowerCase()+' secrets. Read it (Bag → READ) to gain '+xp.toLocaleString('en-US')+' '+SKN[i]+' XP. It can be traded or sold at the World Market.';
 SELLP[k]=Math.max(1,Math.round(xp/20));if(!INVK.includes(k))INVK.push(k);if(typeof EXTRA_BAG!=='undefined'&&!EXTRA_BAG.includes(k))EXTRA_BAG.push(k)}
{const _ap=applySave;applySave=function(S){try{if(S&&S.inv)for(const k in S.inv)sqBookReg(k)}catch(e){}return _ap(S)};
 // icon: a book in the skill's colour
 const _ic=iconURL;iconURL=function(k,col){if(typeof k==='string'&&k.slice(0,4)==='xpb_'){sqBookReg(k);const m=/^xpb_(\d+)_/.exec(k),i=m?+m[1]:0,key='ixb'+i;if(ICONC[key])return ICONC[key];
   const c=document.createElement('canvas');c.width=c.height=14;const x=c.getContext('2d'),r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a,b,w,h)},cl=(typeof SKC!=='undefined'&&SKC[i])||'#a06030';
   r(2,2,10,11,'#302018');r(3,2,8,10,cl);r(3,2,1,10,'rgba(0,0,0,.35)');r(10,3,1,9,'#f0e8d0');r(4,12,8,1,'#f0e8d0');r(5,4,4,1,'rgba(255,255,255,.55)');r(5,6,3,1,'rgba(255,255,255,.4)');r(6,8,2,2,'#f8d048');return ICONC[key]=c.toDataURL()}
  return _ic(k,col)};
 // Bag: READ
 const _bg=bagGridHTML;bagGridHTML=function(){const h=_bg(),k=invSel;if(!k||k.slice(0,4)!=='xpb_'||(inv[k]|0)<1)return h;return h.replace('<div class="bd">','<div class="bd"><button class="use xpread" data-k="'+k+'" style="background:#5878b8;color:#fff">READ</button>')};
 pbd.addEventListener('click',ev=>{const b=ev.target.closest('.xpread');if(!b)return;ev.stopPropagation();const k=b.dataset.k,m=/^xpb_(\d+)_(\d+)$/.exec(k);if(!m||(inv[k]|0)<1)return;
  inv[k]--;const i=+m[1],xp=+m[2];addXp(i,xp);say('You read the '+SKN[i].toLowerCase()+' tome: +'+xp.toLocaleString('en-US')+' '+SKN[i]+' XP!');msgT=4;try{sfx('quest')}catch(e){}saveLocal(true);try{saveCloud(true)}catch(e){}rPn()},true)}
