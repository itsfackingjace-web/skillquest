// Nov 22 (Jace): a guild boss can also be summoned for twice the materials without spending a perk rank. The Void Treant then takes
// 20,000 void logs (100,000 before Nov 24) and the Giant Turtle 10,000 raw fish; the database rules take either way, and nothing in between.
module.exports={name:'guild bosses: summon for twice the materials and keep the rank',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const G=SQGUILD,A=G.api,GB=SQGBOSS;
  const until=async(f,ms)=>{const e=Date.now()+ms;while(Date.now()<e){if(f())return true;await W(200)}return false};
  GLD=6e6;A.create('Boss Guild','BOS',1);if(!await until(()=>G.id&&A.ready&&G.state,8000))return{err:'guild was not founded'};const gid=G.id;
  const bank=()=>Object.assign({},G.state.bank&&G.state.bank.i||{});const rank=k=>(G.state.prog&&G.state.prog[k])|0;
  await A.bankUpdate({voidlog:120000,shrimp:6000,trout:6000},{w:'d',k:'voidlog',d:'check'});await until(()=>(bank().voidlog|0)===120000,5000);
  const out={start:[bank().voidlog|0,rank('wood')]};
  // no wood rank: the usual summon is refused, the double one goes through
  GB.summon('treant');await W(1500);out.single={open:GB.open('treant'),vl:bank().voidlog|0};
  out.html=/keep your rank: 20,000 void logs/.test(GB.html());
  // the rules refuse a summon that takes half and keeps the rank
  {let refused=false;try{await A.bankUpdate({voidlog:-10000},{w:'boss',k:'voidlog',d:'check'},{['guilds/'+gid+'/boss']:{w:GB.WEEK(),t:A.TS(),by:A.me()}})}catch(e){refused=true}
   await W(500);out.cheat=refused&&!GB.open('treant')&&(bank().voidlog|0)===120000}
  GB.summon('treant',true);await until(()=>GB.open('treant'),5000);await W(500);out.dbl={open:GB.open('treant'),vl:bank().voidlog|0,wood:rank('wood')};
  // the Giant Turtle: 10,000 raw fish
  GB.summon('turtle',true);await until(()=>GB.open('turtle'),5000);await W(500);const b=bank();out.turt={open:GB.open('turtle'),fish:(b.shrimp|0)+(b.trout|0)};
  return out});
 if(r.err){t(false,r.err);return}
 t.eq(r.start,[120000,0],'bank void logs and wood rank to start');
 t.eq(r.single,{open:false,vl:120000},'the usual summon with no wood rank');
 t(r.html,'the Bosses tab has no "keep your rank" button');
 t.eq(r.dbl,{open:true,vl:100000,wood:0},'after the double summon [awake, void logs left, wood rank]');
 t.eq(r.turt,{open:true,fish:2000},'Giant Turtle for 10,000 raw fish [awake, raw fish left]');
 t(r.cheat,'the database took a summon for 10,000 void logs without a rank')}};
