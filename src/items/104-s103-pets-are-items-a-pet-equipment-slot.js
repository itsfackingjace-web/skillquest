// ---- 103. Pets are items: a PET equipment slot ----
// Every pet is now a real item. The one in your PET slot follows you; the rest wait in your bag, where you can equip,
// sell, trade (World Market) or release them. New pets (bought, dropped, given) go straight into the PET slot, and the
// pet they replace goes into your bag. Old saves: every pet you owned is put in your bag (your current one stays out).
{const C=()=>LUX.COS,PL=()=>LUX.PETS||[],PK=[];
 for(const p of PL()){const k='pet_'+p.k;PK.push(k);EQ[k]={slot:'pet',n:p.n,ic:'pet:'+p.k,v:p.rare?250:Math.floor(p.v/4),pet:p.k};EQK.push(k);INVK.push(k);EXTRA_BAG.push(k);
  INAME[k]=p.n+' (pet)';SN[k]=p.n+' pets';SHORT[k]=p.n.toLowerCase()+' pet';SELLP[k]=EQ[k].v;
  IDESC[k]=(p.rare?'A rare pet. ':'A pet from Marlo\'s Emporium. ')+'Put it in your PET slot (Equip) and it follows you everywhere; other players see it too.'+(['psquir','pgiron','pggold','pgmith','pgadam'].includes(p.k)?' It brings you things it finds.':'')+' You can sell it, trade it at the World Market, or release it.'}
 SLOTS.push(['pet','PET']);
 const _occ=occ;occ=function(s){if(s==='pet'){const c=C();return c&&c.pet&&EQ['pet_'+c.pet]?'pet_'+c.pet:null}return _occ(s)};
 let lastE=null,lastOwn=null,MIG=true;
 const _ss=setSlot;setSlot=function(s,k){if(s==='pet'){const c=C();c.pet=k?EQ[k].pet:null;lastE=c.pet;try{KITC.clear()}catch(e){}return}return _ss(s,k)};
 const _us=unequipSlot;unequipSlot=function(s){if(s!=='pet')return _us(s);const old=occ('pet');if(!old)return;inv[old]=(inv[old]|0)+1;setSlot('pet',null);say('Your '+EQ[old].n.toLowerCase()+' waits in your bag.');sfx('talk');saveLocal(true)};
 // keep pet items, the PET slot and the old owned-pets list in step, whichever way a pet arrives or leaves
 function sync(){const c=C();if(!c)return;const own=k=>(inv['pet_'+k]|0)>0||c.pet===k;
  if(!MIG){MIG=true;for(const k of c.pets)if(k!==c.pet&&!own(k))inv['pet_'+k]=1;lastE=c.pet;lastOwn=new Set(c.pets.filter(own));return}
  if(lastOwn==null){lastOwn=new Set(c.pets.filter(own));lastE=c.pet}
  for(const k of c.pets)if(!lastOwn.has(k)&&!own(k))inv['pet_'+k]=1;// a new pet that isn't anywhere yet
  if(c.pet!==lastE){// switched some other way (bought, dropped, Style screen): the old one goes to the bag, the new one comes out of it
   if(lastE&&lastOwn.has(lastE))inv['pet_'+lastE]=(inv['pet_'+lastE]|0)+1;if(c.pet&&(inv['pet_'+c.pet]|0)>0)inv['pet_'+c.pet]--;lastE=c.pet}
  c.pets=PL().map(p=>p.k).filter(own);lastOwn=new Set(c.pets)}
 window.SQPETSYNC=sync;
 const _ap=applySave;applySave=function(S){_ap(S);MIG=!!(S&&S.petItems);lastOwn=null;lastE=null;sync()};
 const _sn=snap;snap=function(){try{sync()}catch(e){}const s=_sn();s.petItems=1;return s};
 const _ng=newGame;newGame=function(){_ng();MIG=true;lastOwn=null;lastE=null};
 let st=0;const _u=upd;upd=function(dt){_u(dt);st+=dt;if(st>.4){st=0;try{sync()}catch(e){}}};
 const _eq=equipItem;equipItem=function(k){_eq(k);if(EQ[k]&&EQ[k].slot==='pet'){try{sync()}catch(e){}}};
 // icons: the pet itself
 const _ic=iconURL;iconURL=function(k,col){if(typeof k==='string'&&k.startsWith('pet:')){const key='ip'+k;if(ICONC[key])return ICONC[key];let u='';try{u=window.SQPETPIC?SQPETPIC(k.slice(4)):''}catch(e){}if(u)return ICONC[key]=u;k='pet'}
  if(k==='pet'){const key='ipaw';if(ICONC[key])return ICONC[key];const c=document.createElement('canvas');c.width=c.height=14;const x=c.getContext('2d'),r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a,b,w,h)};
   r(4,7,6,5,'#7a5a3a');r(5,8,4,3,'#a07850');for(const[a,b]of[[2,4],[5,2],[8,2],[11,4]]){r(a,b,2,3,'#7a5a3a');r(a,b+1,1,1,'#a07850')}return ICONC[key]=c.toDataURL()}
  return _ic(k,col)};
 // bag: release a pet you don't want (tap twice)
 let relArm=null;const _bg=bagGridHTML;bagGridHTML=function(){const h=_bg(),k=invSel;if(!k||!EQ[k]||EQ[k].slot!=='pet'||(inv[k]|0)<1)return h;
  return h.replace('<div class="bd">','<div class="bd"><button class="use petrel" data-k="'+k+'" style="background:#c85050">'+(relArm===k?'TAP AGAIN':'RELEASE')+'</button>')};
 pbd.addEventListener('click',ev=>{const b=ev.target.closest('.petrel');if(!b)return;ev.stopPropagation();const k=b.dataset.k;
  if(relArm!==k){relArm=k;setTimeout(()=>{if(relArm===k){relArm=null;try{rPn()}catch(e){}}},3500);rPn();return}
  relArm=null;if((inv[k]|0)>0){inv[k]--;sync();say('You let the '+EQ[k].n.toLowerCase()+' go. It wanders off happily.');sfx('talk');saveLocal(true)}rPn()},true);
}
