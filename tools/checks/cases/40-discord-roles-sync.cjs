// Nov 20: the SQ Bot's role sync (tools/discord/sync-roles.mjs) against a pretend Discord server and database: links from #link,
// the right roles, a private channel per guild, replies once, only touches its own roles, deletes empty guild roles.
const path=require('path'),{pathToFileURL}=require('url');
module.exports={name:'SQ Bot gives the right Discord roles and guild channels',async run(p,t){
 const{sync}=await import(pathToFileURL(path.join(__dirname,'..','..','discord','sync-roles.mjs')).href);
 const now=Date.now(),iso=ms=>new Date(ms).toISOString();
 const S={chans:[{id:'C',type:0,name:'link'}],roles:[{id:'r0',name:'@everyone'},{id:'rMod',name:'Moderator'},{id:'rOld',name:'Guild: Gone [GN]'}],nid:100,
  msgs:[{id:'m1',author:{id:'u1',username:'jace'},content:'here is my code abcd2345',timestamp:iso(now-6e5)},
        {id:'m2',author:{id:'u2',username:'copycat'},content:'ABCD2345',timestamp:iso(now-5e5)},
        {id:'m3',author:{id:'u3',username:'kev'},content:'ZZZZ9999',timestamp:iso(now-4e5)}],
  members:[{user:{id:'u1',username:'jace'},roles:['rMod','rOld']},{user:{id:'u2',username:'copycat'},roles:['rMod']},{user:{id:'u3',username:'kev'},roles:[]},{user:{id:'b',username:'bot',bot:true},roles:[]}],
  db:{lb:{G1:{n:'Jace',tot:1600,x:new Array(20).fill(0),gid:'g1',gn:'Night Owls',gt:'OWL',pa:1,pu:now+864e5,dv:1}},'dlink/ABCD2345':{u:'G1',t:now-7e5}},calls:[]};
 const res=(status,j)=>({status,ok:status<300,json:async()=>j,text:async()=>j==null?'':JSON.stringify(j),headers:{get:()=>null}});
 const F=async(url,o={})=>{const m=o.method||'GET',b=o.body?JSON.parse(o.body):null;
  if(url.startsWith('https://skillquest')){const k=url.split('.com/')[1].replace(/\.json$/,'');return res(200,S.db[k]===undefined?null:S.db[k])}
  const pth=url.replace('https://discord.com/api/v10','');S.calls.push(m+' '+pth);
  if(pth==='/users/@me')return res(200,{id:'b'});if(pth==='/users/@me/guilds')return res(200,[Object.assign({id:'G',name:'SkillQuest'},S.perm!=null?{permissions:S.perm}:{})]);
  if(pth==='/guilds/G'&&m==='GET')return res(200,{id:'G',owner_id:'own'});
  {const z=pth.match(/^\/guilds\/G\/members\/(\w+)$/);if(z&&m==='PATCH'){Object.assign(S.members.find(q=>q.user.id===z[1]),b);return res(200,{})}}
  if(pth==='/guilds/G/channels'&&m==='GET')return res(200,S.chans);
  if(pth==='/guilds/G/channels'&&m==='POST'){const c=Object.assign({id:'ch'+(S.nid++)},b);S.chans.push(c);return res(200,c)}
  let y=pth.match(/^\/channels\/(\w+)\/permissions\/(\w+)$/);if(y&&m==='PUT'){const c=S.chans.find(q=>q.id===y[1]);c.permission_overwrites=(c.permission_overwrites||[]).filter(o=>o.id!==y[2]).concat([Object.assign({id:y[2]},b)]);return res(204,null)}
  y=pth.match(/^\/channels\/(\w+)$/);if(y&&m==='PATCH'){Object.assign(S.chans.find(q=>q.id===y[1]),b);return res(200,{})}
  if(pth.startsWith('/channels/C/messages')&&m==='GET')return res(200,S.msgs.slice().reverse());
  if(pth==='/channels/C/messages'&&m==='POST'){S.msgs.push({id:'r'+(S.nid++),author:{id:'b',username:'bot',bot:true},content:b.content,message_reference:b.message_reference,timestamp:iso(now)});return res(200,{})}
  if(pth==='/guilds/G/roles'&&m==='GET')return res(200,S.roles);
  if(pth==='/guilds/G/roles'&&m==='POST'){const r={id:'n'+(S.nid++),name:b.name};S.roles.push(r);return res(200,r)}
  if(pth.startsWith('/guilds/G/members?'))return res(200,S.members);
  let x=pth.match(/^\/guilds\/G\/members\/(\w+)\/roles\/(\w+)$/);if(x){const mem=S.members.find(q=>q.user.id===x[1]);if(m==='PUT')mem.roles.push(x[2]);else mem.roles=mem.roles.filter(r=>r!==x[2]);return res(204,null)}
  x=pth.match(/^\/guilds\/G\/roles\/(\w+)$/);if(x&&m==='DELETE'){S.roles=S.roles.filter(r=>r.id!==x[1]);return res(204,null)}
  return res(404,{message:'unknown '+m+' '+pth})};
 const logs=[];await sync({token:'x',fetch:F,log:s=>logs.push(s),now});
 const names=u=>S.members.find(q=>q.user.id===u).roles.map(id=>(S.roles.find(r=>r.id===id)||{name:'?'+id}).name).sort();
 t.eq(names('u1'),['Game Developer','Game Patron','Guild: Night Owls [OWL]','Moderator','Total Level 1500+'],'roles of the linked player');
 t.eq(names('u2'),['Moderator'],'roles of someone who reposted another player\'s code');t.eq(names('u3'),[],'roles of a bad code');
 t(!S.roles.some(r=>r.name==='Guild: Gone [GN]'),'an empty guild role was kept');
 const replies=S.msgs.filter(m=>m.author.id==='b');t.eq(replies.length,3,'replies in #link');
 t(/Linked to \*\*Jace\*\*/.test(replies[0].content),'the reply to a working code: '+replies[0].content);
 const cat=S.chans.find(c=>c.type===4),gc=S.chans.find(c=>c.type===0&&/\[sq:g1\]/.test(c.topic||'')),owl=S.roles.find(r=>r.name==='Guild: Night Owls [OWL]');
 t(cat&&cat.name==='Guilds','no Guilds category');t(gc&&gc.name==='night-owls'&&gc.parent_id===cat.id,'no #night-owls channel in it');
 t(gc&&gc.permission_overwrites.some(o=>o.id==='G'&&o.deny==='1024')&&gc.permission_overwrites.some(o=>o.id===owl.id&&o.allow==='68608'),'the guild channel isn\'t private to the guild role');
 // Nov 21 (Jace: the bot never set nicknames): a linked member's nickname is their in-game name
 const nick=u=>S.members.find(q=>q.user.id===u).nick;t.eq([nick('u1'),nick('u2'),nick('u3')],['Jace',undefined,undefined],'nicknames (linked player, reposted code, bad code)');
 const n0=S.calls.length;await sync({token:'x',fetch:F,log:()=>{},now});
 t.eq(S.calls.slice(n0).filter(c=>!c.startsWith('GET')),[],'changes made by a second run with nothing new');
 // without Manage Nicknames: no renaming, and the log says what's missing
 S.members.find(q=>q.user.id==='u1').nick='Old';S.perm='268504080';const n1=S.calls.length,l2=[];await sync({token:'x',fetch:F,log:s=>l2.push(s),now});
 t(!S.calls.slice(n1).some(c=>/^PATCH \/guilds\/G\/members\//.test(c)),'renamed someone without Manage Nicknames');t(l2.some(s=>/Manage Nicknames/.test(s)),'no note about Manage Nicknames: '+l2.join(' | '));
 S.perm='402721808';await sync({token:'x',fetch:F,log:()=>{},now});t.eq(nick('u1'),'Jace','renamed once the bot has Manage Nicknames')}};
