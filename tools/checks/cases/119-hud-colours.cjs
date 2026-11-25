// Nov 25 (Jace): "it's got that real trademark facebook look ... use #FFECA6 for Huds' background color, #69411B for Huds' text color,
// #35611D for Huds' border color". 289 draws the canvas HUD with the theme and swaps the old slate/blue/white palette in every game
// stylesheet and inline style (also ones added later), keeping its own rules last.
module.exports={name:'HUD colours: cream boxes, brown text, green borders on the HUD, menus and screens',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(500);try{if(pnOpen)closePanel()}catch(e){}const o={};
  const px=(x,y)=>{const d=g.getImageData(Math.round(x),Math.round(y),1,1).data;return'#'+[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join('')};
  // the status box: green edge, cream inside
  g.save();g.setTransform(1,0,0,1,0,0);g3box(10,10,60,30,2,'#f8f8e0');o.box=[px(11,25),px(40,25)];g.restore();
  const cs=el=>{const s=getComputedStyle(el);return[s.backgroundColor,s.color,s.borderTopColor]};
  openSM();await W(100);o.menu=cs(document.getElementById('sm'));closeSM&&closeSM();
  showScreen('bag');await W(200);o.panel=cs(document.querySelector('#pn .pc'));closePanel();
  // a stylesheet added later and an inline colour are swapped too
  const st=document.createElement('style');st.textContent='#sqthx{color:#404040;border:3px solid #485870;background:#fff}';document.head.appendChild(st);
  const d=document.createElement('div');d.id='sqthx';d.innerHTML='<span style="color:#404040">x</span>';document.body.appendChild(d);await W(50);
  o.late=cs(d);o.inl=getComputedStyle(d.firstChild).color;o.last=document.head.lastElementChild&&document.head.lastElementChild.id;d.remove();st.remove();
  return o});
 t.eq(r.box,['#35611d','#ffeca6'],'the HUD boxes: a green edge, cream inside');
 const C='rgb(255, 236, 166)',X='rgb(105, 65, 27)',B='rgb(53, 97, 29)';
 t.eq(r.menu,[C,X,B],'the START menu: cream, brown text, green border');t.eq(r.panel,[C,X,B],'a screen (the bag): cream, brown text, green border');
 t.eq(r.late,['rgb(255, 246, 214)',X,B],'a stylesheet added later is swapped too (white boxes become light cream)');t.eq(r.inl,X,'and inline colours');
 t.eq(r.last,'sqtheme','the theme\'s own rules stay last')}};
