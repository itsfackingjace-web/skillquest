// ---------------------------------------------------------------- 17. Longer days
// Older saves counted 2-minute days; keep their day number and start them in the morning.
SQSAVE.after('017:dl',s=>{s.dl=DAYLEN;});
const _ap17=applySave;applySave=function(S){_ap17(S);if(!S.dl)time=Math.floor((+S.time||0)/120)*DAYLEN+5};

