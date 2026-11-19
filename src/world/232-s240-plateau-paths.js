// Trails onto plateaus (JynxedEwok, Nov 14: "can't path in these two areas on Ironcrest"). 101 makes every edge of a rock plateau
// stop you (bits 1 N, 2 S, 4 W, 8 E in R._pe), but only the south side is drawn as a cliff. Where a trail (tile 14) or flagstones
// (tile 11: Shattered's roads, Ironcrest's watchtowers/observatory cut into the mountains) meet a plateau on its north, east or west
// side the rock and the path look level, and the invisible edge stopped players walking from one onto the other.
// Those three sides are open toward paths now; the south cliff face still stops you (its stairways are unchanged).
(()=>{const PATH=t=>t===14||t===11;
 function edgesOpen(R){const Pl=R.plat;if(!Pl||!R.tiles)return null;const W=R.w,H=R.h,T=R.tiles,E=new Uint8Array(W*H),sd=new Set((R.platSt||[]).map(q=>q[0]));
  for(let i=0;i<W*H;i++){if(!Pl[i])continue;if(sd.has(i)){E[i]=0;continue}let m=0;
   if(!Pl[i-W]&&!PATH(T[i-W]))m|=1;if(!Pl[i+W])m|=2;if(!Pl[i-1]&&!PATH(T[i-1]))m|=4;if(!Pl[i+1]&&!PATH(T[i+1]))m|=8;E[i]=m}return E}
 window.SQPLATOPEN=edgesOpen;
 // the room object isn't the one rgFinish returns, so the mask is put in place the first time solid() looks at a room with plateaus
 const _so=solid;solid=function(px,py){const R=SCENE&&SCENE.room;if(R&&R.plat&&R._peo!==R.plat){try{R._pe=edgesOpen(R);R._peo=R.plat}catch(e){R._peo=R.plat}}return _so(px,py)};
})();
