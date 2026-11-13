// ---- 158. Seeds from harvests grow with Farming ----
// 016's harvest asks SQSEEDS(level) how many seeds a harvest gives (it used to roll one seed at 45% + 0.5% per level,
// unchanged here). Now also: a chance of a second seed, +5% every 10 levels (45% at 90), and three new perks, each a third
// choice in the Farming tree: Seed Pouch (20, +15% seed chance), Twin Seeds (40, each seed 25% chance to be two),
// Heirloom Seeds (70, at least one seed every harvest). 038's Seed Saver (60) still adds its own extra seed. The tree's
// level list shows the seed numbers.
(()=>{const has=id=>{try{return typeof P_==='function'&&P_(11,id)}catch(e){return false}};
 const seedP=L=>Math.min(.95,.45+L*.005+(has('fm_pouch')?.15:0)),twoP=L=>Math.min(.45,.05*Math.floor(L/10));
 window.SQSEEDS=function(L){let n=Math.random()<seedP(L)?1:0;if(!n&&has('fm_heir'))n=1;if(n&&Math.random()<twoP(L))n++;
  if(n&&has('fm_twin')){let x=0;for(let i=0;i<n;i++)if(Math.random()<.25)x++;n+=x}return n};
 window.SQSEEDS.p=seedP;window.SQSEEDS.two=twoP;
 const T=TREES[11];
 T.choices[20].push({id:'fm_pouch',n:'Seed Pouch',d:'Harvests give a seed 15% more often.'});
 T.choices[40].push({id:'fm_twin',n:'Twin Seeds',d:'Every seed you get from a harvest has a 25% chance to be two.'});
 T.choices[70].push({id:'fm_heir',n:'Heirloom Seeds',d:'Every harvest gives you at least one seed.'});
 const _st=T.step;T.step=function(l){const a=_st.apply(this,arguments);if(l===1)a.push('Seed chance 45% when you harvest');else a.push('+0.5% seed chance');if(l%10===0)a.push('+5% chance of a second seed');return a}})();
