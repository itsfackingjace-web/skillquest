// Patreon -> SkillQuest Patron status: the decisions, kept free of Firebase so they can be tested on their own.
const crypto=require('crypto');
const DAY=864e5,MONTH=31*DAY,GRACE=3*DAY;
// When a member's perks run out (ms). Active patrons: their next charge date plus a few days' grace (renewals extend it
// through the webhook). Anyone else: one month after their last successful charge (so a cancel keeps the month they paid for).
function paidThrough(a,now){a=a||{};now=now||Date.now();
 if(a.patron_status==='active_patron'){const n=Date.parse(a.next_charge_date||'');return(isFinite(n)?n:now+MONTH)+GRACE}
 const l=Date.parse(a.last_charge_date||'');if(isFinite(l)&&String(a.last_charge_status||'').toLowerCase()==='paid')return l+MONTH;
 return 0}
// The membership in our campaign from an identity response (identity.memberships scope only returns memberships to the
// app's own creator, but check the campaign id when we know it).
function pickMember(identity,camp){const inc=(identity&&identity.included)||[];const ms=inc.filter(x=>x&&x.type==='member');
 if(camp){const m=ms.find(x=>{const c=x.relationships&&x.relationships.campaign&&x.relationships.campaign.data;return c&&String(c.id)===String(camp)});if(m)return m;return null}
 return ms[0]||null}
// The new patron/<uid> record {s,u,c} (the database rules' shape), or null to leave it alone.
// Active: never shortens what's there (a developer may have added months by hand). Not active: never extends it.
function merge(old,u,active,now){now=now||Date.now();old=old&&typeof old==='object'?old:null;
 if(!old&&!active&&!(u>now))return null;
 const ou=old&&typeof old.u==='number'?old.u:0;const nu=active?Math.max(ou,u):(old?Math.min(ou,u>0?u:now):u);
 return{s:old&&typeof old.s==='number'?old.s:now,u:Math.round(nu),c:!!((old&&old.c)||active||u>now)}}
// Patreon signs webhook bodies with HMAC-MD5 of the raw body (hex) in X-Patreon-Signature.
function verifySig(raw,sig,secret){if(!raw||!sig||!secret)return false;const h=crypto.createHmac('md5',secret).update(raw).digest('hex');
 const a=Buffer.from(h),b=Buffer.from(String(sig).toLowerCase());return a.length===b.length&&crypto.timingSafeEqual(a,b)}
// state = "<uid>.<nonce>" (the game writes plink/<uid> {n,t} just before sending the player to Patreon)
function parseState(s){const m=/^([A-Za-z0-9_-]{6,128})\.([A-Za-z0-9]{16,40})$/.exec(String(s||''));return m?{uid:m[1],n:m[2]}:null}
const PAGE=(title,body)=>'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+
 '</title><style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#20283a;color:#f8f8f0;font:16px/1.5 system-ui,sans-serif}'+
 'main{max-width:440px;margin:16px;padding:24px;background:#2c3650;border:4px solid #485870;border-radius:6px}h1{margin:0 0 8px;font-size:22px}a{display:inline-block;margin-top:12px;padding:10px 16px;background:#3a8a4a;color:#fff;text-decoration:none;border-radius:4px}</style></head>'+
 '<body><main><h1>'+title+'</h1><p>'+body+'</p><a href="https://skillquestmmo.com/">Back to SkillQuest</a></main></body></html>';
// Members from one page of GET /campaigns/{id}/members (creator token): [{pu, email, attrs}] + the next page's URL.
// Free followers (no patron_status) are left out.
function memberPage(j){const out=[];for(const d of(j&&j.data)||[]){if(!d||d.type!=='member')continue;const a=d.attributes||{};if(!a.patron_status)continue;
  const u=d.relationships&&d.relationships.user&&d.relationships.user.data;const pu=u&&String(u.id||'');if(!pu)continue;
  out.push({pu,email:typeof a.email==='string'?a.email.trim().toLowerCase():'',attrs:{patron_status:a.patron_status,next_charge_date:a.next_charge_date||null,last_charge_date:a.last_charge_date||null,last_charge_status:a.last_charge_status||null}})}
 return{list:out,next:(j&&j.links&&j.links.next)||null}}
// May a member found by email be linked to this player? Only if the player isn't already linked to another Patreon account
// that is an active member (a link made by mistake to an account with no membership is replaced).
function mayRelink(pu,oldPu,activeSet){return!oldPu||oldPu===pu||!activeSet.has(oldPu)}
module.exports={memberPage,mayRelink,paidThrough,pickMember,merge,verifySig,parseState,PAGE,DAY,MONTH,GRACE};
