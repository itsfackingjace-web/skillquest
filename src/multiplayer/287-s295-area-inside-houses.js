// ---- Section 295: players inside buildings show on their own island's map (Nov 26, Jerica's report) ----
// "Friend is showing they are somewhere they are not on the map": 061's presence sends `ar` (your area) and `ax/ay` (your outdoor spot:
// the door of the building you're in), and `ar` came from curRegion(), which is 'hollow' inside any house, shop or cave room (those
// rooms have no region). Someone in a house on Briarwood showed on Hollow's maps, at Briarwood's door coordinates. SQOUTREGION() walks
// back through the scenes you came from (067 keeps the island scene as SCENE.prev, 145's yards keep it too) to the outdoor region.
// curRegion() itself is unchanged: monsters, weather and quests read it.
(()=>{window.SQOUTREGION=()=>{let S=typeof SCENE!=='undefined'?SCENE:null;
  for(let i=0;S&&i<6;i++){const R=S.room;if(R&&R.region)return R.region;S=S.prev||null}return'hollow'}})();
