// Nov 25 (Jace): "it's got that real trademark facebook look"; first #FFECA6 / #69411B / #35611D, then (with 2GirlsOne50Cal, "too
// vibrant") a scroll tan with a gradient, brown borders and dark-brown text. 289 draws the canvas HUD with the theme and swaps the old
// slate/blue/white palette in every game stylesheet and inline style (also ones added later), keeping its own rules last.
module.exports={name:'HUD colours: scroll-tan boxes with a gradient, brown borders and dark-brown text on the HUD, menus and screens',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(500);try{if(pnOpen)closePanel()}catch(e){}const o={};
  const px=(x,y)=>{const d=g.getImageData(Math.round(x),Math.round(y),1,1).data;return'#'+[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join('')};
  // the status box: green edge, cream inside
  g.save();g.setTransform(1,0,0,1,0,0);g3box(10,10,60,40,2,'#f8f8e0');o.box=[px(11,30),px(40,18),px(40,42)];g.restore();
  const cs=el=>{const s=getComputedStyle(el);return[/linear-gradient/.test(s.backgroundImage)?'gradient':s.backgroundColor,s.color,s.borderTopColor]};
  openSM();await W(100);o.menu=cs(document.getElementById('sm'));closeSM&&closeSM();
  showScreen('bag');await W(200);o.panel=cs(document.querySelector('#pn .pc'));closePanel();
  // a stylesheet added later and an inline colour are swapped too
  const st=document.createElement('style');st.textContent='#sqthx{color:#404040;border:3px solid #485870;background:#fff}';document.head.appendChild(st);
  const d=document.createElement('div');d.id='sqthx';d.innerHTML='<span style="color:#404040">x</span>';document.body.appendChild(d);await W(50);
  o.late=cs(d);o.inl=getComputedStyle(d.firstChild).color;o.last=document.head.lastElementChild&&document.head.lastElementChild.id;d.remove();st.remove();
  return o});
 const lum=h=>{const n=parseInt(h.slice(1),16);return(n>>16)+(n>>8&255)+(n&255)};
 t(r.box[0]==='#7a5a3a'&&lum(r.box[1])>lum(r.box[2])&&lum(r.box[2])>lum('#c0a070'),'the HUD boxes: a brown edge, tan inside, lighter at the top ('+r.box+')');
 const X='rgb(58, 36, 18)',B='rgb(122, 90, 58)';
 t.eq(r.menu,['gradient',X,B],'the START menu: a tan gradient, dark-brown text, brown border');t.eq(r.panel,['gradient',X,B],'a screen (the bag): the same');
 t.eq(r.late,['rgb(232, 214, 184)',X,B],'a stylesheet added later is swapped too (white boxes become light tan)');t.eq(r.inl,X,'and inline colours');
 t.eq(r.last,'sqtheme','the theme\'s own rules stay last')}};
