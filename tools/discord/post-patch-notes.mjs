// Posts new patch notes to Discord (#updates) through a webhook. Run by .github/workflows/discord-patch-notes.yml after a push to main.
//   node tools/discord/post-patch-notes.mjs <old notes file|-> <new notes file> [--dry] [--test]
// Compares the top entry of the new file with the same version day in the old one and posts only bullets that are new
// (a new day posts the whole entry). Needs DISCORD_WEBHOOK_URL in the environment (a GitHub secret; never commit it).
import fs from 'fs';
const [,,oldF,newF,...flags]=process.argv,DRY=flags.includes('--dry'),TEST=flags.includes('--test');
const read=f=>{if(!f||f==='-'||!fs.existsSync(f))return[];const s=fs.readFileSync(f,'utf8');const a=s.indexOf('['),b=s.lastIndexOf('];');
 return(new Function('return '+s.slice(a,b+1)))()};
const day=v=>String(v).split('-')[0];
const NEW=read(newF),OLD=read(oldF),top=NEW[0];
if(!top){console.log('no patch notes');process.exit(0)}
const prev=OLD.find(e=>day(e.v)===day(top.v));
const fresh=prev?top.n.filter(b=>!prev.n.includes(b)):top.n.slice();
if(!TEST&&(!fresh.length||(prev&&prev.v===top.v&&!fresh.length))){console.log('nothing new to post ('+top.v+')');process.exit(0)}
// Discord: plain text, at most 2000 characters a message; no pings (allowed_mentions empty)
const clean=s=>String(s).replace(/@/g,'@​').replace(/\s+/g,' ').trim();
const head=TEST?'**Test message from the SkillQuest update feed.** The real ones look like this:\n':'';
const title='## SkillQuest update '+top.v+(prev?' (more from today)':'')+'\n**'+clean(top.t)+'**\n';
const items=(TEST?top.n.slice(0,3):fresh).map(b=>'• '+clean(b));
const msgs=[];let cur=head+title;
for(const it of items){const line=it.length>1900?it.slice(0,1897)+'...':it;if((cur+'\n'+line).length>1950){msgs.push(cur);cur=line}else cur+=(cur.endsWith('\n')?'':'\n')+line}
cur+='\n\nPlay at <https://skillquestmmo.com>';msgs.push(cur);
if(DRY){for(const m of msgs)console.log('----\n'+m);process.exit(0)}
const URL_=process.env.DISCORD_WEBHOOK_URL;if(!URL_){console.error('DISCORD_WEBHOOK_URL is not set');process.exit(1)}
for(const content of msgs){
 for(let tries=0;tries<4;tries++){const r=await fetch(URL_+'?wait=true',{method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({content,username:'SkillQuest Updates',allowed_mentions:{parse:[]}})});
  if(r.status===429){const j=await r.json().catch(()=>({}));await new Promise(s=>setTimeout(s,1000*(+j.retry_after||2)));continue}
  if(!r.ok){console.error('Discord said',r.status,await r.text());process.exit(1)}break}}
console.log('posted',msgs.length,'message(s) for',top.v);
