// Nov 24 (Jace: "people not being able to scroll on the wiki"): the wiki overhaul's page column (.wc) had no min-height:0, so on a phone held
// upright (sections in a row on top, the column in a flex column) it grew to the whole page's height and nothing could scroll (075).
module.exports={name:'the wiki scrolls on a phone held upright, by touch and by wheel',context:{viewport:{width:390,height:844},isMobile:true,hasTouch:true},async run(p,t){
 await p.waitForTimeout(600);
 const geo=()=>p.evaluate(()=>{const b=document.getElementById('wkb'),w=document.querySelector('#sqwk .ww').getBoundingClientRect(),r=b.getBoundingClientRect();
  return{fits:r.bottom<=w.bottom+1,scrolls:b.scrollHeight>b.clientHeight+50,top:b.scrollTop,cx:Math.round(r.left+r.width/2),cy:Math.round(r.top+Math.min(r.height,400)/2+40)}});
 for(const tab of['start','items']){
  await p.evaluate(tb=>{try{if(window.pnOpen)closePanel()}catch(e){}SQWK.close();SQWK.open(tb);document.getElementById('wkb').scrollTop=0},tab);await p.waitForTimeout(250);
  const g=await geo();t(g.fits,tab+': the page fits inside the wiki window');t(g.scrolls,tab+': the page is taller than its window, so it can scroll');
  // a finger swipe up
  const cdp=await p.context().newCDPSession(p),tp=y=>[{x:g.cx,y}];await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp(g.cy+150)});
  for(let i=1;i<=10;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:tp(g.cy+150-i*25)});await p.waitForTimeout(16)}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(300);await cdp.detach();
  const g2=await geo();t(g2.top>100,tab+': a swipe scrolls it (scrolled '+g2.top+')');
  await p.evaluate(()=>{document.getElementById('wkb').scrollTop=0});await p.mouse.move(g.cx,g.cy);await p.mouse.wheel(0,400);await p.waitForTimeout(300);
  const g3=await geo();t(g3.top>100,tab+': the mouse wheel scrolls it (scrolled '+g3.top+')')}
 await p.evaluate(()=>SQWK.close())}};
