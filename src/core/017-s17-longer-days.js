// ---------------------------------------------------------------- 17. Longer days
// Older saves counted 2-minute days; keep their day number and start them in the morning.
const _sn17=snap;snap=function(){const s=_sn17();s.dl=DAYLEN;return s};
const _ap17=applySave;applySave=function(S){_ap17(S);if(!S.dl)time=Math.floor((+S.time||0)/120)*DAYLEN+5};

