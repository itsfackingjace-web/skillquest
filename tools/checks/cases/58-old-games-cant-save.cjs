// Nov 21 (Jace's and Kevin's Drop Cards vanished after switching devices): a tab left open since before Drop Cards ran old code;
// PLAY HERE INSTEAD loaded the account save into it, the old code dropped every card it didn't know and saved over the account.
// The database now refuses saves from games older than the Void tree card, and PLAY HERE INSTEAD reloads the page.
const path=require('path');const{RulesDB}=require('../rulesdb.cjs');
module.exports={name:'games from before the Void tree card can\'t overwrite your account',async run(p,t){
 const s=await p.evaluate(async()=>{await new Promise(r=>setTimeout(r,500));const s=snap();s.savedAt=Date.now();return s});
 const DB=new RulesDB(path.join(__dirname,'..','..','..','database.rules.json'));
 const put=S=>DB.update('a',{'saves/a':{json:JSON.stringify(S),savedAt:Date.now()}});
 t(put(s).ok,'today\'s save was refused: '+put(s).why);
 const old=JSON.parse(JSON.stringify(s));for(const k of Object.keys(old.inv))if(/^dc_|^pc_/.test(k))delete old.inv[k];
 t(!put(old).ok,'a save from a game without Drop Cards was accepted')}};
