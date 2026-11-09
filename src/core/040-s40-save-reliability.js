// ---------------------------------------------------------------- 40. Save reliability
// What was wrong: (1) the "did anything change?" key only covered a few fields, so perk choices (and houses, farm,
// chests...) never triggered an account save on their own; (2) a device's local save carried no record of which account
// save it was based on, so on the next load the account save always looked like "another device" and was adopted,
// even when it was older, wiping recent progress; (3) closing the page only asked for an account save that first does
// a round-trip read, which usually never finishes before the page dies; a save already in flight also blocked it.
// Now: saves keep the account-save id they're based on, the newest save wins, perk/quest changes save right away, and
// hiding or closing the page writes both saves immediately.
saveLocal=function(force){if(dead)return;const s=snap(),k=keyOf(s);if(k===lastLocal&&!force)return;lastLocal=k;s.savedAt=Date.now();LOCAL_AT=s.savedAt;if(lastWid!==null)s.wid=lastWid;
 try{localStorage.setItem(LS,JSON.stringify(s))}catch(e){}};
// a save asked for while another is still talking to the account runs as soon as that one finishes
let CLOUD_PEND=null;
const _sc40=saveCloud;saveCloud=async function(force){if(cloudBusy){CLOUD_PEND=CLOUD_PEND===true||!!force;return}await _sc40(force);
 for(let n=0;n<8&&CLOUD_PEND!==null&&cloud&&!cloudBusy;n++){const f=CLOUD_PEND;CLOUD_PEND=null;await _sc40(f)}};// keep going until nothing new is waiting
function saveNow(){saveLocal(true);saveCloud(true)}
// page closing/hiding: write straight to the account (no read first) once this session has synced with it
function cloudFlush(){if(!cloud||dead)return;if(lastWid===null){saveCloud(true);return}
 try{const s=snap(),k=keyOf(s);if(k===lastCloud)return;s.savedAt=Math.max(Date.now(),LOCAL_AT);s.wid=myDev+'-'+Date.now().toString(36);s.dev=myDev;
  const pr=cloud.set(s);lastWid=s.wid;lastCloud=k;syncMark(s);if(pr&&pr.catch)pr.catch(()=>{})}catch(e){}}
function saveHide(){if(dead)return;saveLocal(true);cloudFlush();try{localStorage.setItem(LS,JSON.stringify(Object.assign(JSON.parse(localStorage.getItem(LS)||'{}'),{wid:lastWid})))}catch(e){}}
