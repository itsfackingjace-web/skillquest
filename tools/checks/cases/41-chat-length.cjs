// Nov 20: chat lines are up to 160 characters (were 80): public chat, private messages, party chat (sent as PMs with "[Party] ")
// and guild chat, in the game and in the database rules.
const path=require('path');const{RulesDB}=require('../rulesdb.cjs');
module.exports={name:'chat lines can be 160 characters long',async run(p,t){
 const D=new RulesDB(path.join(__dirname,'..','..','..','database.rules.json'));const TS={'.sv':'timestamp'},s=n=>'x'.repeat(n);
 D.data={guilds:{g1abcd:{info:{n:'Owls',tag:'OWL',col:1,lead:'a'},m:{a:{r:'lead'}}}}};
 t(D.update('a',{'chat/c1':{u:'a',n:'A',m:s(160),t:TS}}).ok,'160 characters in public chat were refused');
 t(!D.update('a',{'chat/c2':{u:'a',n:'A',m:s(161),t:TS}}).ok,'161 characters in public chat were accepted');
 t(D.update('a',{'pm/b/p1':{f:'a',n:'A',m:'[Party] '+s(152),t:TS}}).ok,'a full-length party line was refused');
 const g=D.update('a',{'gchat/g1abcd/x1':{u:'a',n:'A',m:s(160),t:TS}});t(g.ok,'160 characters in guild chat were refused: '+g.why);
 const r=await p.evaluate(async()=>{await new Promise(r=>setTimeout(r,400));const i=document.getElementById('mpi');return{max:i&&i.maxLength}});
 t.eq(r.max,160,'the chat box\'s length limit')}};
