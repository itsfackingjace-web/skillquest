// ---- 157. Pet items for pets added after 104 ----
// 104 turns every pet in LUX.PETS into an item (pet_<kind>, the PET slot reads EQ['pet_'+kind]) when it loads, but some pets
// are added to LUX.PETS by later sections (116's mushroom pets Mushling/Glowcap). Those had no item:
// the PET slot showed empty and a spare one in the bag wasn't saved (INVK). This gives them the same item 104 would have.
// Runs before the boot load (114), so saves with these pets load into a working slot.
(()=>{const PL=()=>(window.LUX&&LUX.PETS)||[];let n=0;
 for(const p of PL()){const k='pet_'+p.k;if(EQ[k])continue;n++;
  EQ[k]={slot:'pet',n:p.n,ic:'pet:'+p.k,v:p.rare?250:Math.floor((p.v|0)/4),pet:p.k};EQK.push(k);if(!INVK.includes(k))INVK.push(k);if(!EXTRA_BAG.includes(k))EXTRA_BAG.push(k);
  INAME[k]=p.n+' (pet)';SN[k]=p.n+' pets';SHORT[k]=p.n.toLowerCase()+' pet';SELLP[k]=EQ[k].v;if(!(k in inv))inv[k]=0;
  const src=window.SQNPET&&SQNPET[p.k]&&SQNPET[p.k].src;
  IDESC[k]=(p.rare?'A rare pet'+(src?' ('+src+')':'')+'. ':'A pet. ')+'Put it in your PET slot (Equip) and it follows you everywhere; other players see it too. You can sell it, trade it at the World Market, or release it.'}
 window.SQLATEPETS=n})();
