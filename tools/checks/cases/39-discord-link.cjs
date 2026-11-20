// Nov 20: Discord roles (249 + tools/discord/sync-roles.mjs). The leaderboard row's guild / patron / mod / dev fields are only accepted
// when true, and link codes (dlink) can be written only for yourself and read only by someone who knows the code.
const path=require('path');const{RulesDB}=require('../rulesdb.cjs');
module.exports={name:'Discord link codes and role fields on the leaderboard',async run(p,t){
 const D=new RulesDB(path.join(__dirname,'..','..','..','database.rules.json'));
 const now=Date.now(),TS={'.sv':'timestamp'};
 D.data={guilds:{g1abcd:{info:{n:'Night Owls',tag:'OWL',col:1,lead:'a'},m:{a:{r:'lead'}}}},patron:{a:{s:1,u:now+864e5},c:{s:1,u:now-1000}},mods:{a:true},devs:{a:true}};
 const lb=(u,x)=>D.update(u,{['lb/'+u]:Object.assign({n:'P',t:TS},x)});
 t(lb('a',{gid:'g1abcd',gn:'Night Owls',gt:'OWL',pa:1,pu:now+864e5,mo:1,dv:1}).ok,'a real member, patron, mod and dev was refused');
 t(!lb('b',{gid:'g1abcd',gn:'Night Owls',gt:'OWL'}).ok,'a guild that isn\'t yours was accepted');
 t(!lb('a',{gid:'g1abcd',gn:'Fake Name',gt:'OWL'}).ok,'a wrong guild name was accepted');
 t(!lb('b',{pa:1,pu:now+864e5}).ok,'patron without a patron record was accepted');
 t(!lb('c',{pa:1,pu:now-1000}).ok,'an expired patron was accepted');
 t(!lb('b',{mo:1}).ok,'mod flag for a non-mod was accepted');t(!lb('b',{dv:1}).ok,'dev flag for a non-dev was accepted');
 t(lb('b',{}).ok,'a plain leaderboard row was refused');
 const dl=(u,c,v)=>D.update(u,{['dlink/'+c]:v});
 t(dl('a','ABCD2345',{u:'a',t:TS}).ok,'your own link code was refused');
 t(!dl('b','ABCD2345',{u:'b',t:TS}).ok,'someone else\'s code was overwritten');
 t(!dl('b','WXYZ6789',{u:'a',t:TS}).ok,'a code for another player was accepted');
 t(!dl('a','abc',{u:'a',t:TS}).ok,'a badly formed code was accepted');
 t(dl('a','ABCD2345',null).ok,'removing your own code was refused');
 // the game: Options > Link Discord makes a code and stores it
 const r=await p.evaluate(async()=>{await new Promise(r=>setTimeout(r,500));const c=await SQDLINK.make(),c2=await SQDLINK.make();const F=window.SQFB;const v=c&&(await F.db.get(F.db.ref(F.D,'dlink/'+c))).val();
  return{c,same:c===c2,u:v&&v.u===SQMP.user.uid,ok:/^[A-HJ-NP-Z2-9]{8}$/.test(c||'')}});
 t(r.ok,'the code '+r.c+' isn\'t 8 letters/digits from the code alphabet');t(r.u,'the code wasn\'t stored for this player');t(r.same,'pressing Link Discord again made a new code (the posted one stops working)')}};
