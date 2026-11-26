// ---- Section 291: buffs survive a refresh or logout (Nov 26, Aztu's report) ----
// Potion, meal and guild-shrine buffs live in 085's LUX.BUFF as end times on performance.now(), which restarts with
// every page load, so a refresh or a logout wiped them. The save now keeps the seconds left of each buff (`bf`,
// written every time, even empty) and a load starts them again with that time left: the clock pauses while you're away.
// A new character starts with none.
(()=>{const B=()=>window.LUX&&LUX.BUFF,MAX=3600;
 SQSAVE.after('291:bf',s=>{const b=B(),o={};if(b){const now=performance.now();for(const k in b){const r=(+b[k]||0)-now;if(r>=1000)o[k]=Math.min(MAX,Math.round(r/1000))}}s.bf=o});
 SQLOAD.after('291',S=>{const b=B();if(!b)return;for(const k in b)b[k]=0;
  const o=S&&S.bf;if(!o||typeof o!=='object')return;const now=performance.now();
  for(const k in o){const v=+o[k];if(/^[a-z]{2,10}$/.test(k)&&v>0)b[k]=now+Math.min(MAX,v)*1000}});
 SQNEWGAME.after('291',()=>{const b=B();if(b)for(const k in b)b[k]=0});
})();
