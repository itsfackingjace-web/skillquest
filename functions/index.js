// SkillQuest server functions: linking a player's Patreon membership to their game account.
//  patreonAuth  - Patreon sends the player here after they allow access (OAuth redirect). Checks the one-time link the game
//                 wrote (plink/<uid>), reads their membership, remembers which Patreon user is which player (pmap/puser,
//                 not readable by players) and writes patron/<uid> {s,u,c}. Tokens are used once and never stored.
//  patreonHook  - Patreon webhooks (members:create/update/delete, members:pledge:*): keeps patron/<uid> in step with
//                 renewals and cancellations. Signed with the webhook secret.
// Settings live in the database at cfg/patreon {cid, cs, ws, camp} (Dev Suite > Art Room > Patreon link; players can't read it).
const functions=require('firebase-functions/v1');const admin=require('firebase-admin');const L=require('./lib');
admin.initializeApp();const db=()=>admin.database();
const REDIRECT='https://us-central1-skillquest-913e2.cloudfunctions.net/patreonAuth';
const cfg=async()=>(await db().ref('cfg/patreon').get()).val()||{};
const page=(res,code,t,b)=>res.status(code).set('Content-Type','text/html; charset=utf-8').send(L.PAGE(t,b));
async function apply(uid,attrs,now){const active=attrs&&attrs.patron_status==='active_patron';const u=L.paidThrough(attrs,now);
 const r=db().ref('patron/'+uid);const old=(await r.get()).val();const nr=L.merge(old,u,active,now);if(nr)await r.set(nr);return{active,rec:nr}}
exports.patreonAuth=functions.region('us-central1').https.onRequest(async(req,res)=>{
 try{if(req.query.error)return page(res,200,'Not linked','Patreon didn\'t give access, so nothing was linked. You can try again from Options in the game.');
  const st=L.parseState(req.query.state),code=String(req.query.code||'');if(!st||!code)return page(res,400,'Link expired','Please start again from Options > Link Patreon in the game.');
  const pl=db().ref('plink/'+st.uid),p=(await pl.get()).val();await pl.remove();
  if(!p||p.n!==st.n||!(Date.now()-p.t<20*60e3))return page(res,400,'Link expired','Please start again from Options > Link Patreon in the game.');
  const C=await cfg();if(!C.cid||!C.cs)return page(res,503,'Not ready yet','Patreon linking isn\'t set up yet. Please try again later.');
  const tk=await fetch('https://www.patreon.com/api/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
   body:new URLSearchParams({code,grant_type:'authorization_code',client_id:C.cid,client_secret:C.cs,redirect_uri:REDIRECT}).toString()});
  if(!tk.ok){console.warn('token',tk.status,await tk.text());return page(res,502,'Couldn\'t reach Patreon','Please try again in a minute.')}
  const at=(await tk.json()).access_token;
  const q='include=memberships.campaign&'+encodeURIComponent('fields[member]')+'=patron_status,next_charge_date,last_charge_date,last_charge_status&'+encodeURIComponent('fields[user]')+'=vanity';
  const idr=await fetch('https://www.patreon.com/api/oauth2/v2/identity?'+q,{headers:{Authorization:'Bearer '+at}});
  if(!idr.ok){console.warn('identity',idr.status,await idr.text());return page(res,502,'Couldn\'t reach Patreon','Please try again in a minute.')}
  const id=await idr.json(),pu=id&&id.data&&String(id.data.id||'');if(!pu)return page(res,502,'Couldn\'t reach Patreon','Please try again in a minute.');
  // one Patreon account = one player: a relink moves it
  // a relink moves the Patreon account to this player; the player it was linked to before loses what it gave them
  // (a record started in the last 7 days is removed, cape included: a mix-up; an older one just ends now)
  const prev=(await db().ref('pmap/'+pu).get()).val();
  if(prev&&prev!==st.uid){await db().ref('puser/'+prev).remove();const pr=db().ref('patron/'+prev),po=(await pr.get()).val();
   if(po){const now=Date.now();if(typeof po.s==='number'&&now-po.s<7*864e5)await pr.remove();else if(po.u>now)await pr.update({u:now})}
   console.log('moved',JSON.stringify({from:prev,to:st.uid,had:!!po}))}
  await db().ref().update({['pmap/'+pu]:st.uid,['puser/'+st.uid]:pu});
  const m=L.pickMember(id,C.camp);let attrs=m&&m.attributes;
  // a join/renewal notice that arrived before this player linked (kept by patreonHook, signed by Patreon, 3 days at most)
  const pd=db().ref('ppend/'+pu),pend=(await pd.get()).val();
  if(pend&&pend.a&&Date.now()-pend.t<3*864e5&&(!attrs||attrs.patron_status!=='active_patron'))attrs=pend.a;if(pend)await pd.remove();
  console.log('link',JSON.stringify({members:((id.included||[]).filter(x=>x&&x.type==='member')).length,picked:!!m,status:m&&m.attributes&&m.attributes.patron_status||null,usedPending:!!(pend&&attrs===pend.a)}));
  const out=await apply(st.uid,attrs,Date.now());
  if(out.active)return page(res,200,'Linked! 🔥','Thank you for supporting SkillQuest! Your Patron perks are on: the flame next to your name, the fire cape (Options > PATRON) and the Art Room. Go back to the game; it updates by itself.');
  return page(res,200,'Linked','Your Patreon account is linked, but there\'s no active membership on it yet. Join on Patreon and your perks switch on by themselves within a few minutes.')}
 catch(e){console.error(e);return page(res,500,'Something went wrong','Please try again, or report it with the bug button in the game.')}});
exports.patreonHook=functions.region('us-central1').https.onRequest(async(req,res)=>{
 try{if(req.method!=='POST')return res.status(405).send('');const C=await cfg();
  if(!L.verifySig(req.rawBody,req.get('X-Patreon-Signature'),C.ws))return res.status(401).send('bad signature');
  const d=req.body&&req.body.data;if(!d||d.type!=='member')return res.status(200).send('ignored');
  const camp=d.relationships&&d.relationships.campaign&&d.relationships.campaign.data&&d.relationships.campaign.data.id;if(C.camp&&camp&&String(camp)!==String(C.camp))return res.status(200).send('other campaign');
  const pu=d.relationships&&d.relationships.user&&d.relationships.user.data&&String(d.relationships.user.data.id||'');if(!pu)return res.status(200).send('no user');
  const ev=String(req.get('X-Patreon-Event')||'');const attrs=Object.assign({},d.attributes||{});if(ev==='members:delete'||ev==='members:pledge:delete')attrs.patron_status=attrs.patron_status==='active_patron'?'former_patron':(attrs.patron_status||'former_patron');
  console.log('hook',ev,JSON.stringify({status:attrs.patron_status||null}));
  const keep={patron_status:attrs.patron_status||null,next_charge_date:attrs.next_charge_date||null,last_charge_date:attrs.last_charge_date||null,last_charge_status:attrs.last_charge_status||null};
  const uid=(await db().ref('pmap/'+pu).get()).val();if(!uid){await db().ref('ppend/'+pu).set({a:keep,t:Date.now()});return res.status(200).send('kept for linking')}
  await apply(uid,attrs,Date.now());return res.status(200).send('ok')}
 catch(e){console.error(e);return res.status(500).send('error')}});
