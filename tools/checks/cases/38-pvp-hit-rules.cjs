// Nov 20: "The online server refused that" in a PvP fight. 154 turns hits into 1-3 hearts (an ultimate or a strong weapon is 3), but
// the database rules only took 1-2, so every 3-heart hit was refused (and never landed). The rules must accept what 154 can send.
const path=require('path');const{RulesDB}=require('../rulesdb.cjs');
module.exports={name:'PvP hits of 3 hearts are accepted by the database rules',async run(p,t){
 const most=await p.evaluate(()=>{TL.sword=8;XPS[0]=13034431;return Math.max(SQPVDMG('ul'),SQPVDMG('sw'),SQPVDMG('ar'),SQPVDMG('sp','fire'))});
 t.eq(most,3,'strongest PvP hit in hearts');
 const DB=new RulesDB(path.join(__dirname,'..','..','..','database.rules.json'));
 const hit=(d,k)=>DB.update('a',{['pvp/b/x'+d+k]:{f:'a',n:'Jace',d,k,el:'',t:{'.sv':'timestamp'}}});
 for(let d=0;d<=most;d++)t(hit(d,'ul').ok,'a hit of '+d+' hearts was refused: '+hit(d,'ul').why);
 t(!hit(4,'ul').ok,'a hit of 4 hearts was accepted');t(!DB.update('a',{'pvp/b/y':{f:'c',n:'X',d:1,k:'sw',el:'',t:{'.sv':'timestamp'}}}).ok,'a hit sent in someone else\'s name was accepted')}};
