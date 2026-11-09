// ---- 105. Backups in Options: restore a save this device backed up ----
// The game backs up a save on this device whenever it replaces it (up to the last 4): when another device's progress
// is loaded, when you pick between two saves, or when you switch accounts. Options → Backups lists them; Restore puts
// that save back (and on your account), after backing up what you have now.
{let armed=null,ACC=null,ACC_LOAD=0;const ago=t=>{if(!t)return'a while ago';const m=Math.round((Date.now()-t)/60000);return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' days ago'};
 const list=()=>{try{return Object.keys(localStorage).filter(k=>k.startsWith('sq_bak_')).sort().reverse()}catch(e){return[]}};
 const _o=optionsHTML;optionsHTML=function(){const h=_o(),L=list();let b='<div class="tl" style="margin-top:16px">BACKUPS</div><div class="tl" style="margin-top:4px;font-size:15px">ON THIS DEVICE</div>';
  if(!L.length)b+='<div class="qc" style="font-size:13px;line-height:1.4;padding:8px 12px;margin:6px 0">No backups on this device. The game makes one whenever it replaces this device\'s save with another one.</div>';
  for(const k of L){let S=null;try{S=JSON.parse(localStorage.getItem(k))}catch(e){}if(!S)continue;const i=saveInfo(S),tag=k.split('_').pop(),when=+k.split('_')[2]||i.at;
   b+='<div class="qc" style="font-size:13px;line-height:1.45;padding:8px 12px;margin:6px 0"><b>'+esc(i.name)+'</b> · total level '+i.tl+' · quest '+i.q+' · '+i.gold+' gold<br><small style="opacity:.75">'+(tag==='account'?'Account save':'This device\'s save')+', backed up '+ago(when)+'</small><br>'+
    '<button class="sb sqrest" data-k="'+esc(k)+'" style="margin-top:6px">'+(armed===k?'Tap again to restore':'Restore this save')+'</button></div>'}
  // the account's backups (from any device)
  const signed=window.SQMP&&SQMP.user;if(signed){b+='<div class="tl" style="margin-top:12px;font-size:15px">ON YOUR ACCOUNT</div>';
   if(!ACC||Date.now()-ACC.t>30000){if(!ACC_LOAD){ACC_LOAD=1;sqCloudBakList().then(l=>{ACC={t:Date.now(),l:l||[]};ACC_LOAD=0;if(pnOpen&&ptab===8)rPn()}).catch(()=>{ACC={t:Date.now(),l:[],err:1};ACC_LOAD=0;if(pnOpen&&ptab===8)rPn()})}}
   if(!ACC)b+='<div class="qc" style="font-size:13px;padding:8px 12px;margin:6px 0">Loading...</div>';
   else if(!ACC.l.length)b+='<div class="qc" style="font-size:13px;line-height:1.4;padding:8px 12px;margin:6px 0">'+(ACC.err?'Couldn\'t load your account backups. Try again in a moment.':'No account backups yet. Your account gets one each day you play, and whenever a save is replaced on any device.')+'</div>';
   else ACC.l.forEach((e,j)=>{const i=saveInfo(e.S);b+='<div class="qc" style="font-size:13px;line-height:1.45;padding:8px 12px;margin:6px 0"><b>'+esc(i.name)+'</b> · total level '+i.tl+' · quest '+i.q+' · '+i.gold+' gold<br><small style="opacity:.75">'+(e.tag==='daily'?'Daily backup':e.tag==='account'?'Account save that was replaced':'A device\'s save that was replaced')+', '+ago(e.at)+'</small><br>'+
    '<button class="sb sqrest" data-c="'+j+'" style="margin-top:6px">'+(armed==='c'+j?'Tap again to restore':'Restore this save')+'</button></div>'})}
  else b+='<div class="qc" style="font-size:13px;line-height:1.4;padding:8px 12px;margin:6px 0">Sign in to see the backups on your account too (they work from any device).</div>';
  return h+b};
 pbd.addEventListener('click',async ev=>{const btn=ev.target.closest('.sqrest');if(!btn)return;ev.stopPropagation();const k=btn.dataset.k||('c'+btn.dataset.c);
  if(armed!==k){armed=k;rPn();setTimeout(()=>{if(armed===k){armed=null;try{rPn()}catch(e){}}},4000);return}armed=null;
  let S=null;if(btn.dataset.c!=null){const e=ACC&&ACC.l[+btn.dataset.c];S=e?JSON.parse(JSON.stringify(e.S)):null}else try{S=JSON.parse(localStorage.getItem(k))}catch(e){}if(!S||S.v!=1){say('That backup can\'t be read.');return}ACC=null;
  const cur=snap();cur.savedAt=LOCAL_AT;mpBackup('device',cur);applySave(JSON.parse(JSON.stringify(S)));hideCreator();
  try{if(cloud){const r=await cloud.get(),rs=r&&r.exists?r.data():null;if(rs)lastWid=wOf(rs)}}catch(e){}
  saveLocal(true);LOCAL_AT=Date.now();try{await saveCloud(true)}catch(e){}closePanel();say('Backup restored'+(cloud?' and saved to your account':'')+'. What you had before is backed up too.');sfx('quest')},true)}
