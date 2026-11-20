// SQ Bot: gives linked Discord members roles from the game (run by .github/workflows/discord-roles.yml every 30 minutes).
//   DISCORD_BOT_TOKEN=... node tools/discord/sync-roles.mjs [--dry]
// Needs no database password: it reads only public data (the leaderboard `lb` and single link codes `dlink/<code>`, see
// src/multiplayer/249-s257-discord-link.js). How it works, with nothing stored anywhere but Discord itself:
//  1. #link: every message with an 8-letter code is a link request. The first post of a code counts, the code must have been
//     made in the game at most a day before it was posted, and a member's latest working code wins. The bot answers each
//     request once (a reply), so it knows which ones it has answered.
//  2. Roles (created by the bot when first needed, and the only roles it ever adds or removes):
//     "Total Level 100+" ... "Total Level 1750+", "Total Level Maxed" (one at a time), "Guild: <name> [TAG]", "Game Patron",
//     "Game Moderator", "Game Developer". Guild roles nobody has any more are deleted.
//  3. Each guild with linked members gets a private text channel under a "Guilds" category that only its role can see.
//  The bot's own role must be above these roles (Server Settings > Roles) or Discord refuses to hand them out.
const API='https://discord.com/api/v10',DB='https://skillquest-913e2-default-rtdb.firebaseio.com';
export const TIERS=[1750,1500,1250,1000,750,500,250,100];
export const FIXED={pa:{n:'Game Patron',c:0xf96854},mo:{n:'Game Moderator',c:0x3ba55c},dv:{n:'Game Developer',c:0xe04040}};
const TIERC={1750:0xf8c848,1500:0xe8a838,1250:0xc87ef0,1000:0x9b59b6,750:0x3498db,500:0x1abc9c,250:0x95a5a6,100:0x7f8c8d};
const CODE=/\b[A-HJ-NP-Z2-9]{8}\b/;
export const isManaged=n=>/^Total Level (\d+\+|Maxed)$/.test(n)||/^Guild: /.test(n)||Object.values(FIXED).some(f=>f.n===n);
export const guildRole=row=>('Guild: '+String(row.gn||'').slice(0,40)+' ['+String(row.gt||'').slice(0,4)+']').slice(0,100);
export function wanted(row,now=Date.now()){const out=[];if(!row)return out;const tot=+row.tot||0,max=Array.isArray(row.x)?row.x.length*99:0;
 if(max&&tot>=max)out.push({n:'Total Level Maxed',c:0xffd700});else{const t=TIERS.find(v=>tot>=v);if(t)out.push({n:'Total Level '+t+'+',c:TIERC[t]})}
 if(row.gid&&row.gn&&row.gt)out.push({n:guildRole(row),c:0x5865f2,guild:1});
 if(row.pa===1&&+row.pu>now)out.push(FIXED.pa);if(row.mo===1)out.push(FIXED.mo);if(row.dv===1)out.push(FIXED.dv);return out}
export async function sync({token,fetch:F=globalThis.fetch,dry=false,log=console.log,now=Date.now(),guildId=null}){
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 async function api(method,path,body){for(let k=0;k<6;k++){const r=await F(API+path,{method,headers:{Authorization:'Bot '+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
   if(r.status===429){const j=await r.json().catch(()=>({}));await sleep(1000*(+j.retry_after||1)+100);continue}
   if(r.status===204)return null;const txt=await r.text();if(!r.ok)throw new Error(method+' '+path+': '+r.status+' '+txt.slice(0,200));
   const rem=r.headers&&r.headers.get&&r.headers.get('x-ratelimit-remaining');if(rem==='0'){const ra=+(r.headers.get('x-ratelimit-reset-after')||1);await sleep(ra*1000)}
   return txt?JSON.parse(txt):null}throw new Error('rate limited: '+path)}
 const dbGet=async p=>{const r=await F(DB+'/'+p+'.json');if(!r.ok)throw new Error('database '+p+': '+r.status);return r.json()};
 const act=async(what,fn)=>{log((dry?'[dry] ':'')+what);if(!dry)return fn()};
 const me=await api('GET','/users/@me');
 const gs=await api('GET','/users/@me/guilds');const G=guildId?gs.find(g=>g.id===guildId):gs.length===1?gs[0]:null;
 if(!G)throw new Error(gs.length?'The bot is in '+gs.length+' servers; set DISCORD_GUILD_ID.':'The bot isn\'t in any server yet: invite it first.');
 const chans=await api('GET','/guilds/'+G.id+'/channels');const ch=chans.find(c=>c.type===0&&c.name==='link');
 // 1. link requests
 const msgs=[];if(ch){let before=null;for(let k=0;k<50;k++){const b=await api('GET','/channels/'+ch.id+'/messages?limit=100'+(before?'&before='+before:''));msgs.push(...b);if(b.length<100)break;before=b[b.length-1].id}}
 else log('No #link channel: make a text channel called "link" so players can post their codes.');
 msgs.sort((a,b)=>Date.parse(a.timestamp)-Date.parse(b.timestamp));
 const answered=new Set(msgs.filter(m=>m.author&&m.author.id===me.id&&m.message_reference).map(m=>m.message_reference.message_id));
 const seen=new Set(),links=new Map();// discord user id -> uid
 const lb=(await dbGet('lb'))||{};
 for(const m of msgs){if(!m.author||m.author.bot)continue;const mt=String(m.content||'').toUpperCase().match(CODE);if(!mt)continue;const code=mt[0];
  let ok=false,uid=null;if(!seen.has(code)){seen.add(code);const v=await dbGet('dlink/'+code).catch(()=>null);const at=Date.parse(m.timestamp);
   if(v&&typeof v.u==='string'&&typeof v.t==='number'&&at-v.t>-5*60e3&&at-v.t<864e5){ok=true;uid=v.u}}
  if(ok)links.set(m.author.id,uid);
  if(!answered.has(m.id)){const row=ok&&lb[uid];const txt=ok?'✅ Linked to **'+String(row&&row.n||'your character').replace(/[*_`~|@]/g,'')+'**. Your roles appear within half an hour, and follow your game from now on.'
    :seen.has(code)&&!ok?'❌ That code didn\'t work (it\'s used, too old, or mistyped). Make a new one in the game: Options > Link Discord.':'❌ That code didn\'t work.';
   await act('reply to '+m.author.username+': '+(ok?'linked '+uid:'bad code'),()=>api('POST','/channels/'+ch.id+'/messages',{content:txt,message_reference:{message_id:m.id,fail_if_not_exists:false},allowed_mentions:{parse:[]}}))}}
 // 2. roles
 const roles=await api('GET','/guilds/'+G.id+'/roles');const byName=new Map(roles.map(r=>[r.name,r]));
 const ensure=async w=>{let r=byName.get(w.n);if(r)return r;await act('create role '+w.n,async()=>{r=await api('POST','/guilds/'+G.id+'/roles',{name:w.n,color:w.c||0,hoist:false,mentionable:false,permissions:'0'})});if(!r)r={id:'dry-'+w.n,name:w.n};byName.set(w.n,r);return r};
 const nameOf=id=>{for(const r of byName.values())if(r.id===id)return r.name;return id};
 const members=[];{let after='0';for(let k=0;k<100;k++){const b=await api('GET','/guilds/'+G.id+'/members?limit=1000&after='+after);members.push(...b);if(b.length<1000)break;after=b[b.length-1].user.id}}
 const used=new Map();let changes=0;
 for(const mem of members){if(!mem.user||mem.user.bot)continue;const uid=links.get(mem.user.id),want=uid?wanted(lb[uid],now):[];
  const wantIds=new Set();for(const w of want){const r=await ensure(w);wantIds.add(r.id);used.set(r.id,(used.get(r.id)||0)+1)}
  const have=new Set(mem.roles||[]);
  for(const id of wantIds)if(!have.has(id)){changes++;await act('give '+nameOf(id)+' to '+mem.user.username,()=>api('PUT','/guilds/'+G.id+'/members/'+mem.user.id+'/roles/'+id))}
  for(const id of have){const r=roles.find(x=>x.id===id);if(r&&isManaged(r.name)&&!wantIds.has(id)){changes++;await act('take '+r.name+' from '+mem.user.username,()=>api('DELETE','/guilds/'+G.id+'/members/'+mem.user.id+'/roles/'+id))}}}
 // 3. a private channel for each guild with linked members, under a "Guilds" category (needs Manage Channels). Found again by the
 //    [sq:<guild id>] mark in its topic, so renaming the guild renames the channel. Channels are never deleted (their history stays;
 //    when a guild's role goes, only admins can still see it).
 const VIEW=1024,SEND=2048,HIST=65536,MANCH=16,MEMBER=String(VIEW|SEND|HIST),BOT=String(VIEW|SEND|HIST|MANCH);
 const slug=n=>String(n).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,90)||'guild';
 const active=new Map();for(const[du,uid]of links){const row=lb[uid];if(row&&row.gid&&row.gn&&row.gt&&members.some(m=>m.user&&m.user.id===du))active.set(row.gid,row)}
 if(active.size){let cat=chans.find(c=>c.type===4&&/^guilds$/i.test(c.name));
  if(!cat)await act('create category Guilds',async()=>{cat=await api('POST','/guilds/'+G.id+'/channels',{name:'Guilds',type:4,permission_overwrites:[{id:G.id,type:0,deny:String(VIEW),allow:'0'},{id:me.id,type:1,allow:BOT,deny:'0'}]})});
  for(const[gid,row]of active){const role=byName.get(guildRole(row));if(!role)continue;const mark='[sq:'+gid+']',name=slug(row.gn);
   const topic='Guild chat for '+String(row.gn).slice(0,40)+' ['+String(row.gt).slice(0,4)+']. Only its members can see this channel. '+mark;
   let c=chans.find(x=>x.type===0&&String(x.topic||'').includes(mark));
   if(!c){await act('create channel #'+name,async()=>{c=await api('POST','/guilds/'+G.id+'/channels',{name,type:0,topic,parent_id:cat&&cat.id,permission_overwrites:[{id:G.id,type:0,deny:String(VIEW),allow:'0'},{id:role.id,type:0,allow:MEMBER,deny:'0'},{id:me.id,type:1,allow:BOT,deny:'0'}]})});continue}
   if(c.name!==name||c.topic!==topic)await act('rename #'+c.name+' to #'+name,()=>api('PATCH','/channels/'+c.id,{name,topic}));
   const ow=(c.permission_overwrites||[]).find(o=>o.id===role.id);if(!ow||ow.allow!==MEMBER)await act('let '+role.name+' into #'+name,()=>api('PUT','/channels/'+c.id+'/permissions/'+role.id,{type:0,allow:MEMBER,deny:'0'}))}}
 for(const r of byName.values())if(/^Guild: /.test(r.name)&&!used.get(r.id)&&!String(r.id).startsWith('dry-'))await act('delete empty role '+r.name,()=>api('DELETE','/guilds/'+G.id+'/roles/'+r.id));
 log('server '+G.name+': '+links.size+' linked, '+changes+' role changes');return{links,changes}}
if(import.meta.url===`file://${process.argv[1]}`){const token=process.env.DISCORD_BOT_TOKEN;if(!token){console.error('DISCORD_BOT_TOKEN is not set');process.exit(1)}
 sync({token,dry:process.argv.includes('--dry'),guildId:process.env.DISCORD_GUILD_ID||null}).catch(e=>{console.error(String(e&&e.message||e));process.exit(1)})}
