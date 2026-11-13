// ---- 161. The new soundtrack ----
// 014's music was two thin voices (square lead, triangle bass) looping 32 notes. This replaces it with a small tracker:
// songs are written as a melody (8th-note tokens, "X/Y" = two 16ths, "-" hold, "." rest, "|" bar line for reading) over
// one chord per bar ("C,G" = half a bar each), and the arrangement is generated from the chords in the song's style:
// bass line, arpeggios / stabs / pads, drums (synth kick, snare, hats, toms from one noise buffer) and the lead with a
// GBA-style echo, vibrato on long notes, and a little room reverb. All songs are original.
// 014's scheduler keeps running (it owns MG, the music volume / fade bus) but plays nothing: its PARSED tracks are emptied.
// The outermost wantSong picks the song: boss nearby (world/island/custom bosses, big monsters in dungeons; outdoor
// 'big' monsters like No Man's Land's giant scorpions don't count) > sailing > island themes (per region) > the towns' and dungeons'
// own songs (unchanged names: day night indoor cave port frost tide desert icecave sandcave seacave) > Hollow day/night.
(()=>{
 // ---------- songs ----------
 const S={
 day:{n:'Hollow Isle',bpm:116,m:8,lead:'p25',bass:'drive',arp:'up16',drums:'beat',echo:1,parts:{
  A:['D G D A Bm G E A','A4 - D5 - F#5 - E5 D5 | B4 - - - G5 - F#5 E5 | F#5 - D5 - A4 - D5 E5 | E5 - - - C#5 D5 E5 A4 | B4 - D5 - F#5 - B5 A5 | G5 - - - F#5 G5 A5 G5 | F#5 - E5 - G#4 - B4 E5 | E5 - - - - - . .'],
  A2:['D G D A Bm Em A D','A4 - D5 - F#5 - E5 D5 | B4 - - - G5 - F#5 E5 | F#5 - A5 - D6 - C#6 B5 | A5 - - - E5 F#5 G5 E5 | F#5 - D5 - B4 - D5 F#5 | E5 - G5 - B5 - A5 G5 | F#5 - D5 - E5 - C#5 E5 | D5 - - - - - . .'],
  B:['G A F#m Bm Em A D A','G5 - B5 - A5 G5 F#5 G5 | A5 - - - E5 - . A4 | A5 - F#5 - C#5 - F#5 A5 | B5 - - - F#5 - D5 B4 | G5 - E5 - B4 - E5 G5 | A5 - G5 - F#5 - E5 - | F#5 - D5 - A4 - D5 F#5 | A5 - - - - - A4 B4']},
  order:'A A2 B A2'},
 night:{n:'Moon over Hollow',bpm:84,m:6,lead:'tri',bass:'waltz',arp:'roll8',pad:1,drums:'shaker',echo:1,parts:{
  A:['Am F C G Am F E E','E5 - - - A5 - | C6 - B5 - A5 - | G5 - - - E5 - | D5 - - - . . | E5 - - - A5 - | C6 - D6 - E6 - | B5 - A5 - G#5 - | B5 - - - . .'],
  A2:['Am F C G Am F E Am','E5 - - - A5 - | C6 - B5 - A5 - | G5 - - - E5 - | D5 - - - . . | E5 - - - A5 - | C6 - D6 - E6 - | D6 - C6 - B5 - | A5 - - - . .'],
  B:['Dm G C Am Dm G E E','F5 - - - A5 - | D6 - - - B5 - | C6 - - - G5 - | A5 - - - E5 - | F5 - A5 - D6 - | D6 - C6 - B5 - | B5 - - - G#5 - | E5 - - - . .']},
  order:'A A2 B A2'},
 indoor:{n:'Hearth and Home',bpm:96,m:8,lead:'p50s',bass:'walk',arp:'stab',drums:'soft',swing:1,parts:{
  A:['F Dm Gm C F Dm Gm,C F','C5 - F5 - A5 - G5 F5 | A5 - - - D5 - . . | D5 - G5 - Bb5 - A5 G5 | E5 - - - C5 - . . | C5 - F5 - A5 - C6 A5 | D6 - - - A5 - F5 D5 | G5 - A5 - Bb5 - E5 - | F5 - - - . . . .'],
  B:['Bb F Bb C Am Dm G7 C','D6 - - - C6 Bb5 A5 Bb5 | C6 - - - A5 - F5 - | D6 - - - C6 Bb5 A5 G5 | A5 - - - G5 - . . | E5 - G5 - C6 - B5 A5 | A5 - - - F5 - D5 - | G5 - - - A5 - B5 - | C6 - - - . . . .']},
  order:'A B A'},
 cave:{n:'Slime-Lit Hollows',bpm:76,m:8,lead:'p25',bass:'pulse8',pad:1,drums:'tom',echo:2,parts:{
  A:['Dm Dm Bb A Dm Dm Gm A','. . . . A4 - - - | D5 - - - C5 - A4 - | Bb4 - - - - - F4 - | E4 - - - - - - - | . . . . A4 - - - | D5 - - - E5 - F5 - | G5 - - - F5 - E5 - | C#5 - - - - - - -'],
  B:['Gm Gm Dm Dm Bb C A A','D5 - - - Bb4 - G4 - | A4 - - - G4 - F4 - | F4 - - - E4 - D4 - | A4 - - - - - - - | F5 - - - E5 - D5 - | E5 - - - D5 - C5 - | C#5 - - - E5 - A5 - | G5 - - - F5 - E5 -']},
  order:'A B'},
 port:{n:'Saltmere Shanty',bpm:168,m:6,lead:'p25',bass:'shanty',arp:'stab',drums:'jig',echo:1,parts:{
  A:['G G C D G Em Am,D G','D5 - B4 G4 - B4 | D5 - - G5 - - | E5 - C5 E5 - G5 | F#5 - - D5 - - | D5 - B4 G4 - B4 | E5 - G5 B5 - G5 | A5 - G5 F#5 E5 F#5 | G5 - - - . .'],
  B:['C G D G C G Am,D G','E5 - - E5 F#5 G5 | D5 - - B4 - - | A4 - B4 C5 - A4 | B4 - - G4 - - | E5 - - E5 F#5 G5 | D5 - - B5 - - | A5 - G5 F#5 - E5 | G5 - - - . .']},
  order:'A A B A'},
 frost:{n:'Frosthollow',bpm:92,m:8,lead:'bell',bass:'root5',arp:'sparkle',pad:1,drums:'soft',echo:2,parts:{
  A:['Em Cmaj7 G D Em C Am B','B5 - - - E5 - G5 - | F#5 - E5 - B4 - - - | D5 - - - G5 - B5 - | A5 - - - F#5 - - - | B5 - - - E6 - D6 - | C6 - B5 - G5 - - - | A5 - C6 - B5 - A5 - | F#5 - - - D#5 - - -'],
  B:['C D Bm Em C D B B','G5 - - - E5 - C5 - | D5 - F#5 - A5 - - - | B5 - - - F#5 - D5 - | E5 - - - - - - - | C6 - - - B5 - G5 - | A5 - - - D6 - - - | D#6 - - - B5 - F#5 - | D#5 - - - B4 - - -']},
  order:'A B'},
 tide:{n:'Tidewatch',bpm:108,m:6,lead:'tri',bass:'waltz',arp:'roll8',drums:'shaker',echo:1,parts:{
  A:['C Am F G C Am Dm,G C','E5 - - D5 C5 - | A4 - - C5 E5 - | F5 - E5 - D5 - | D5 - - - G4 - | E5 - - D5 C5 - | A5 - - G5 E5 - | F5 - E5 D5 - B4 | C5 - - - . .'],
  B:['F C Dm Am F C G G','A5 - - G5 F5 - | G5 - - E5 C5 - | F5 - - E5 D5 - | E5 - - - C5 - | A5 - - B5 C6 - | G5 - - E5 C5 - | D5 - E5 - F5 - | G5 - - - . .']},
  order:'A B A'},
 desert:{n:'Dusthaven',bpm:104,m:8,lead:'p25',bass:'root5',arp:'none',drums:'desert',echo:1,parts:{
  A:['A Bb A Gm A Bb Gm A','A4 - Bb4 - C#5 - D5 E5 | F5 - E5 - D5 - Bb4 - | C#5 - - - E5 - A5 - | G5 - F5 - E5 - D5 - | E5 - F5 - G5 - A5 - | Bb5 - A5 - G5 - F5 - | G5 - F5 - E5 - D5 - | C#5 - - - A4 - - -'],
  B:['Dm Dm Gm Gm Bb A Gm A','D5 - F5 - A5 - - - | G5/A5 G5 F5 - E5 - D5 - | Bb4 - D5 - G5 - - - | F5/G5 F5 E5 - D5 - C#5 - | D5 - - - F5 - Bb5 - | A5 - - - C#5 - E5 - | G5 - F5 - E5 - D5 - | E5 - - - . . . .']},
  order:'A B A'},
 icecave:{n:'Frostfang Den',bpm:72,m:8,lead:'bell',bass:'pedal',arp:'sparkle',pad:1,drums:'none',echo:2,parts:{
  A:['Bm Bm G G Em F# Bm F#','F#5 - - - - - B5 - | A5 - - - F#5 - - - | G5 - - - D5 - - - | B4 - - - - - - - | E5 - - - G5 - B5 - | A#5 - - - F#5 - - - | D5 - C#5 - B4 - - - | C#5 - - - - - - -'],
  B:['G A F#m Bm G Em F# F#','D6 - - - B5 - G5 - | C#6 - - - A5 - E5 - | F#5 - - - C#5 - A4 - | B4 - - - D5 - F#5 - | G5 - - - B5 - D6 - | C#6 - B5 - G5 - E5 - | F#5 - - - - - - - | A#4 - - - C#5 - - -']},
  order:'A B'},
 sandcave:{n:'Scorpion Hollow',bpm:100,m:8,lead:'p25',bass:'root5',arp:'none',pad:1,drums:'desert',echo:1,parts:{
  A:['Em F Em Dm Em F G F','E5 - F5 - G5 - E5 - | F5 - - - A5 - G5 F5 | E5 - B4 - C5 - D5 - | D5 - - - - - . . | B5 - A5 - G5 - F5 - | A5 - G5 - F5 - E5 - | D5 - E5 - F5 - G5 - | F5 - - - E5 - - -'],
  B:['Am Am F F Dm Dm F E','A4 - C5 - E5 - - - | D5 - C5 - B4 - A4 - | A4 - C5 - F5 - - - | E5 - D5 - C5 - B4 - | D5 - F5 - A5 - - - | G5 - F5 - E5 - D5 - | C5 - D5 - E5 - F5 - | E5 - - - - - . .']},
  order:'A B'},
 seacave:{n:'Drowned Grotto',bpm:132,m:6,lead:'tri',bass:'roll',pad:1,drums:'none',echo:2,parts:{
  A:['Em C Am B Em C D B','B4 - - E5 - G5 | G5 - - F#5 - E5 | E5 - - C5 - E5 | D#5 - - - - - | B4 - - E5 - G5 | C6 - - B5 - A5 | A5 - G5 F#5 - D5 | D#5 - - B4 - -'],
  B:['C D Bm Em Am D B B','E5 - - G5 - C6 | D6 - - A5 - F#5 | F#5 - - B5 - D6 | B5 - - - G5 - | A5 - - C6 - E6 | D6 - - C6 - A5 | B5 - A5 F#5 - D#5 | B4 - - - . .']},
  order:'A B'},
 sail:{n:'Open Water',bpm:128,m:8,lead:'p25',bass:'drive',arp:'up16',drums:'march',echo:1,parts:{
  A:['C Em F G C Em F,G C','G4 - C5 - E5 - G5 - | G5 - - - B5 - G5 - | A5 - - - F5 - C5 - | D5 - - - - - G4 - | G4 - C5 - E5 - G5 - | B5 - - - C6 - B5 - | A5 - F5 - B5 - G5 - | C6 - - - - - . .'],
  B:['Am Em F C Am Em Dm G','E6 - - - D6 - C6 - | B5 - - - G5 - E5 - | F5 - A5 - C6 - A5 - | G5 - - - E5 - C5 - | E6 - - - D6 - C6 - | B5 - - - G5 - B5 - | A5 - - - F5 - D5 - | G5 - - - - - . .']},
  order:'A B A'},
 briar:{n:'Briarwood',bpm:100,m:8,lead:'flute',bass:'root5',arp:'roll8',drums:'soft',echo:1,parts:{
  A:['Em A Em D Em A C D','B4 - E5 - F#5 - G5 A5 | A5 - - - E5 - C#5 - | B4 - - - G5 - F#5 E5 | F#5 - - - D5 - . . | B4 - E5 - F#5 - G5 A5 | B5 - - - A5 - C#6 - | B5 - A5 - G5 - E5 - | F#5 - - - - - . .'],
  B:['C D Bm Em C D B B','G5 - - - E5 - C5 - | A5 - - - F#5 - D5 - | F#5 - - - D5 - B4 - | E5 - - - G5 - B5 - | C6 - - - B5 - G5 - | A5 - - - F#5 - D6 - | D#6 - - - B5 - F#5 - | D#5 - - - - - . .']},
  order:'A B A'},
 ash:{n:'Ashfall Coast',bpm:140,m:8,lead:'p25',bass:'drive',arp:'up16',drums:'beat',echo:1,parts:{
  A:['Cm Cm Ab Bb Cm Cm Ab G','C5 - - Eb5 - - G5 - | F5 - Eb5 - D5 - Eb5 - | C5 - - Eb5 - - Ab5 - | G5 - - - F5 - D5 - | C5 - - Eb5 - - G5 - | C6 - Bb5 - G5 - Eb5 - | F5 - Eb5 - D5 - C5 - | B4 - - - D5 - G5 -'],
  B:['Ab Bb Gm Cm Ab Bb G G','Eb6 - - - C6 - Ab5 - | D6 - - - Bb5 - F5 - | D6 - - - Bb5 - G5 - | C6 - - - G5 - Eb5 - | Eb6 - - - C6 - Ab5 - | F6 - - - D6 - Bb5 - | B5 - - - D6 - F6 - | D6 - - - B5 - G5 -']},
  order:'A B A'},
 iron:{n:'Ironcrest Highlands',bpm:110,m:8,lead:'p50s',bass:'root5',arp:'stab',drums:'march',echo:1,parts:{
  A:['D C G D D C G A','A4 - D5 - E5 - F#5 - | G5 - E5 - C5 - E5 - | D5 - B4 - G4 - B4 - | A4 - - - D5 - - - | A5 - - - F#5 - D5 - | G5 - - - E5 - C6 - | B5 - A5 - G5 - E5 - | E5 - - - - - . .'],
  B:['G D C D G D C A','B5 - - - A5 - G5 - | F#5 - - - D5 - A4 - | C5 - E5 - G5 - C6 - | A5 - - - - - . . | B5 - - - D6 - B5 - | A5 - - - F#5 - D5 - | E5 - G5 - C6 - B5 - | A5 - - - C#5 - E5 -']},
  order:'A B A'},
 shatter:{n:'The Shattered Expanse',bpm:80,m:8,lead:'bell',bass:'pedal',arp:'sparkle',pad:1,drums:'none',echo:2,parts:{
  A:['F#m G F#m G Em F#m D C#','C#5 - - - - - F#5 - | G5 - - - D5 - - - | A5 - - - C#6 - - - | B5 - - - G5 - - - | G5 - E5 - B4 - E5 - | F#5 - - - A5 - C#6 - | D6 - C#6 - A5 - F#5 - | F5 - - - - - - -']},
  order:'A'},
 nomans:{n:'No Man\'s Land',bpm:120,m:8,lead:'p12',bass:'drive',arp:'none',drums:'beat',echo:1,parts:{
  A:['Am Am F E Am Am Dm E','A4 - - A4 C5 - E5 - | D5 - C5 - B4 - A4 - | F5 - - F5 E5 - C5 - | B4 - - - G#4 - - - | A4 - - A4 C5 - E5 - | A5 - G5 - F5 - E5 - | D5 - F5 - A5 - F5 - | E5 - - - - - . .']},
  order:'A'},
 boss:{n:'Clash',bpm:156,m:8,lead:'p25',bass:'drive',arp:'up16',drums:'boss',echo:1,parts:{
  A:['Em C D B Em C Am B','E5 - E5 - G5 - E5 - | C6 - B5 - G5 - E5 - | D5 - F#5 - A5 - D6 - | D#6 - - - B5 - - - | E6 - D6 - B5 - G5 - | C6 - B5 - G5 - E5 - | A5 - C6 - E6 - C6 - | B5 - - - D#5 - F#5 -'],
  B:['C D Em Em C D B B','G5 - - - - - E5 - | A5 - - - - - F#5 - | B5 - - - E6 - - - | B5 - G5 - E5 - B4 - | C6 - - - - - G5 - | D6 - - - - - A5 - | B5 - A5 - F#5 - D#5 - | B4 - - - - - - -']},
  order:'A B'}};
 // loudness evened out between songs (measured from renders)
 const VOL={day:1.33,night:0.85,indoor:1.12,cave:1.17,port:1.12,frost:0.88,tide:0.85,desert:1.17,icecave:0.88,sandcave:1.04,seacave:0.8,sail:1.35,briar:0.82,ash:1.33,iron:1.12,shatter:0.85,nomans:1.35,boss:1.17};
 const REGION_SONG={briarwood:'briar',ashfall:'ash',ironcrest:'iron',shattered:'shatter',nomans:'nomans'};
 // ---------- notation ----------
 const PC={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
 const midi=s=>{const m=/^([A-G])(#|b)?(\d)$/.exec(s);if(!m)return 0;return 12*(+m[3]+1)+PC[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)};
 const QUAL={'':[0,4,7],m:[0,3,7],'7':[0,4,7,10],m7:[0,3,7,10],maj7:[0,4,7,11],sus4:[0,5,7],dim:[0,3,6],aug:[0,4,8]};
 const chord=s=>{const m=/^([A-G])(#|b)?(.*)$/.exec(s);const r=(PC[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)+12)%12;return{r,iv:QUAL[m[3]]||QUAL['']}};
 const near=(pc,lo)=>{let n=lo+((pc-lo)%12+12)%12;return n};// lowest note with that pitch class at or above lo
 // a song becomes a list of notes per channel, in 16th steps
 function build(def){const bar=def.m*2,ev={lead:[],bass:[],arp:[],pad:[],drum:[]};let at=0;
  for(const pn of def.order.split(' ')){const [chs,mel]=def.parts[pn];const bars=chs.split(' ');
   // melody
   let st=at,last=null;for(const tk of mel.replace(/\|/g,' ').trim().split(/\s+/)){
    if(tk==='-'){if(last)last.d+=2;st+=2;continue}if(tk==='.'){last=null;st+=2;continue}
    const ps=tk.split('/');if(ps.length===2){ev.lead.push({s:st,d:1,m:midi(ps[0])});last={s:st+1,d:1,m:midi(ps[1])};ev.lead.push(last);st+=2;continue}
    last={s:st,d:2,m:midi(tk)};ev.lead.push(last);st+=2}
   // accompaniment per bar (a bar can hold two chords: "C,G")
   bars.forEach((b,bi)=>{const halves=b.split(','),hw=bar/halves.length;halves.forEach((c,hi)=>{const C=chord(c),s0=at+bi*bar+hi*hw;accomp(def,C,s0,hw,bar,ev)})});
   if(def.drums&&def.drums!=='none')for(let bi=0;bi<bars.length;bi++)drums(def,at+bi*bar,bar,ev,bi===bars.length-1);
   at+=bars.length*bar}
  const idx=[];for(let i=0;i<at;i++)idx.push([]);for(const ch in ev)for(const n of ev[ch])if(n.s<at)idx[n.s].push([ch,n]);
  return{ev,idx,len:at,bar}}
 function accomp(def,C,s0,w,bar,ev){const R=near(C.r,40),tones=C.iv.map(i=>R+i),five=R+7,oct=R+12;
  const B=(s,d,m)=>ev.bass.push({s:s0+s,d,m});
  switch(def.bass){
   case'drive':for(let i=0;i<w;i+=2)B(i,2,(i/2)%2?oct:R);break;
   case'pulse8':for(let i=0;i<w;i+=2)B(i,1,R);break;
   case'walk':{const t=[R,R+C.iv[1],five,R+(C.iv[1]===3?10:9)];for(let i=0,j=0;i<w;i+=4,j++)B(i,4,t[j%4]);break}
   case'root5':for(let i=0;i<w;i+=4)B(i,3,(i/4)%2?five:R);break;
   case'waltz':B(0,4,R);if(w>=6)B(w-2,2,five);break;
   case'shanty':for(let i=0;i<w;i+=6){B(i,4,R);B(i+4,2,five-12>=36?five-12:five)}break;
   case'pedal':B(0,w,R);break;
   case'roll':{const t=[R,five,oct,five];for(let i=0,j=0;i<w;i+=2,j++)B(i,2,t[j%4]);break}}
  const A=near(C.r,57),at=C.iv.map(i=>A+i);
  const P=(s,d,m,v)=>ev.arp.push({s:s0+s,d,m,v:v||1});
  switch(def.arp){
   case'up16':{const t=[at[0],at[1],at[2],at[0]+12];for(let i=0;i<w;i++)P(i,1,t[i%4]);break}
   case'roll8':{const t=[at[0],at[1],at[2],at[0]+12,at[2],at[1]];for(let i=0,j=0;i<w;i+=2,j++)P(i,2,t[j%6]);break}
   case'stab':{const beats=def.m===6?[2,4,8,10]:[2,6,10,14];for(const b of beats)if(b<w)for(const m of at.slice(0,3))P(b,1,m,.6);break}
   case'sparkle':{const pos=[0,3,6,10,13],t=[at[2]+12,at[0]+24,at[1]+12,at[2]+12,at[0]+12];for(let k=0;k<pos.length;k++)if(pos[k]<w)P(pos[k],1,t[k]);break}}
  if(def.pad)for(const m of at.slice(0,3))ev.pad.push({s:s0,d:w,m:m-12})}
 const DR={// 16 steps (4/4) or 12 (3/4, 6/8); k kick, s snare, h hat, t tom
  beat:{k:'x.......x.x.....',s:'....x.......x...',h:'x.x.x.x.x.x.x.x.'},
  boss:{k:'x...x...x...x.x.',s:'....x.......x..x',h:'xxxxxxxxxxxxxxxx'},
  soft:{k:'x.......x.......',h:'..x...x...x...x.'},
  march:{k:'x.......x.......',s:'....x..x....x.xx',h:'x...x...x...x...'},
  tom:{t:'x.....x...x.....'},
  desert:{k:'x.....x.x.......',t:'....x.....x..x..',h:'x.x.x.x.x.x.x.x.'},
  jig:{k:'x.....x.....',s:'......x.....',h:'x.xx.xx.xx.x'},
  shaker:{k:'x...........',h:'....x.x.x.x.'}};
 function drums(def,s0,bar,ev,fill){const p=DR[def.drums];if(!p)return;for(const k in p){const pat=p[k];for(let i=0;i<bar;i++)if(pat[i%pat.length]==='x')ev.drum.push({s:s0+i,k})}
  if(fill&&bar===16&&def.drums!=='tom')for(const i of[12,13,14,15])ev.drum.push({s:s0+i,k:'t',f:1})}
 const SONGS2={};for(const k in S)SONGS2[k]=build(S[k]);
 // ---------- sound ----------
 let ctx=null,BUS=null,LEADB=null,NOISE=null,WAVES={};
 function setup(){if(typeof ACX==='undefined'||!ACX||typeof MG==='undefined'||!MG)return false;if(ctx===ACX&&BUS)return true;init(ACX,MG);return true}
 function init(c,dest){ctx=c;
  const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=9500;lp.connect(dest);
  BUS=ctx.createGain();BUS.gain.value=.65;BUS.connect(lp);
  // room reverb from a decaying noise burst
  const len=Math.floor(ctx.sampleRate*1.6),ir=ctx.createBuffer(2,len,ctx.sampleRate);for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3)}
  const cv=ctx.createConvolver();cv.buffer=ir;const wet=ctx.createGain();wet.gain.value=.16;BUS.connect(cv);cv.connect(wet);wet.connect(lp);
  // the lead's echo (GBA style)
  LEADB=ctx.createGain();LEADB.connect(BUS);const dl=ctx.createDelay(1);const fb=ctx.createGain();const ew=ctx.createGain();LEADB.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(ew);ew.connect(BUS);
  LEADB._dl=dl;LEADB._fb=fb;LEADB._ew=ew;
  NOISE=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);{const d=NOISE.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
  const pulse=duty=>{const n=40,re=new Float32Array(n),im=new Float32Array(n);for(let i=1;i<n;i++)re[i]=2*Math.sin(Math.PI*i*duty)/(Math.PI*i)*Math.pow(.97,i);return ctx.createPeriodicWave(re,im)};
  WAVES={p12:pulse(.125),p25:pulse(.25),p50:pulse(.5)}}
 const hz=m=>440*Math.pow(2,(m-69)/12);
 function osc(type,f,t){const o=ctx.createOscillator();if(WAVES[type])o.setPeriodicWave(WAVES[type]);else o.type=type;o.frequency.setValueAtTime(f,t);return o}
 function env(g,t,d,v,a,rel){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setTargetAtTime(v*.72,t+a,.12);const e=t+Math.max(a+.02,d-rel);g.gain.setValueAtTime(v*.72,e);g.gain.linearRampToValueAtTime(0,e+rel)}
 function lead(def,n,t,d){const f=hz(n.m),g=ctx.createGain();let o;
  if(def.lead==='bell'){o=osc('sine',f,t);const o2=osc('sine',f*3.01,t),g2=ctx.createGain();g2.gain.setValueAtTime(.25,t);g2.gain.exponentialRampToValueAtTime(.001,t+.6);o2.connect(g2);g2.connect(g);o2.start(t);o2.stop(t+d+.9);
   g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.16,t+.005);g.gain.exponentialRampToValueAtTime(.02,t+Math.max(.5,d+.4));g.gain.linearRampToValueAtTime(0,t+d+.85);o.connect(g);g.connect(LEADB);o.start(t);o.stop(t+d+.9);return}
  const type=def.lead==='tri'||def.lead==='flute'?'triangle':def.lead==='p50s'?'p50':def.lead;o=osc(type,f,t);
  const v=type==='triangle'?.2:type==='p12'?.09:type==='p50'?.07:.08;env(g,t,d,v,.012,.05);
  if(d>.28){const l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=5.6;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(f*(def.lead==='flute'?.008:.0045),t+Math.min(.35,d*.6));l.connect(lg);lg.connect(o.frequency);l.start(t);l.stop(t+d+.05)}
  o.connect(g);g.connect(LEADB);o.start(t);o.stop(t+d+.05)}
 function bass(n,t,d,dense){const o=osc('triangle',hz(n.m),t),g=ctx.createGain();env(g,t,d,dense?.095:.13,.006,.03);o.connect(g);g.connect(BUS);o.start(t);o.stop(t+d+.04)}
 function arp(n,t,d){const o=osc('p12',hz(n.m),t),g=ctx.createGain();const v=.022*(n.v||1);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.004);g.gain.exponentialRampToValueAtTime(v*.2,t+Math.max(.06,d*.9));g.gain.linearRampToValueAtTime(0,t+d);o.connect(g);g.connect(BUS);o.start(t);o.stop(t+d+.02)}
 function pad(n,t,d){const o=osc('triangle',hz(n.m),t),o2=osc('triangle',hz(n.m)*1.004,t),g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.035,t+Math.min(.6,d*.4));g.gain.setValueAtTime(.035,t+d*.8);g.gain.linearRampToValueAtTime(0,t+d+.15);o.connect(g);o2.connect(g);g.connect(BUS);o.start(t);o2.start(t);o.stop(t+d+.2);o2.stop(t+d+.2)}
 function noise(t,dur,v,ftype,freq){const s=ctx.createBufferSource();s.buffer=NOISE;s.playbackRate.value=.8+Math.random()*.4;const f=ctx.createBiquadFilter();f.type=ftype;f.frequency.value=freq;const g=ctx.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(BUS);s.start(t,Math.random()*.5);s.stop(t+dur+.02)}
 function drum(n,t){if(n.k==='k'){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);g.gain.setValueAtTime(.26,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);o.connect(g);g.connect(BUS);o.start(t);o.stop(t+.25)}
  else if(n.k==='s'){noise(t,.14,.13,'bandpass',1900);const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(140,t+.06);g.gain.setValueAtTime(.08,t);g.gain.exponentialRampToValueAtTime(.001,t+.08);o.connect(g);g.connect(BUS);o.start(t);o.stop(t+.1)}
  else if(n.k==='h')noise(t,.04,.06,'highpass',7000);
  else if(n.k==='t'){const o=ctx.createOscillator(),g=ctx.createGain(),f0=n.f?170:120;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f0*.55,t+.18);g.gain.setValueAtTime(n.f?.16:.22,t);g.gain.exponentialRampToValueAtTime(.001,t+.25);o.connect(g);g.connect(BUS);o.start(t);o.stop(t+.28)}}
 function playStep(def,song,s,base,sp){for(const [ch,n] of song.idx[s]){const t=base+(def.swing&&(n.s%4)===2?sp*.5:0),d=n.d*sp;
   if(ch==='lead')lead(def,n,t,d*.97);else if(ch==='bass')bass(n,t,d*.92,def.bass==='drive'||def.bass==='roll');else if(ch==='arp')arp(n,t,d*.9);else if(ch==='pad')pad(n,t,d);else drum(n,t)}}
 function echoFor(def,now){const spb=60/def.bpm/4,ed=def.echo===2?spb*3:spb*2;LEADB._dl.delayTime.setValueAtTime(ed,now);LEADB._fb.gain.setValueAtTime(def.echo===2?.38:.22,now);LEADB._ew.gain.setValueAtTime(def.echo?(def.echo===2?.4:.28):0,now)}
 // render a song to an AudioBuffer (previews / tests): loops it until secs
 async function render(name,secs){const sv=[ctx,BUS,LEADB,NOISE,WAVES],sr=44100,oc=new OfflineAudioContext(2,Math.ceil(sr*secs),sr),out=oc.createGain();out.gain.value=.5;out.connect(oc.destination);
  try{init(oc,out);BUS.gain.value=.65*(VOL[name]||1);const def=S[name],song=SONGS2[name],sp=60/def.bpm/4;echoFor(def,0);for(let st=0;st*sp<secs-.5;st++)playStep(def,song,st%song.len,.05+st*sp,sp)}
  finally{[ctx,BUS,LEADB,NOISE,WAVES]=sv}
  return oc.startRendering()}
 // ---------- which song ----------
 const BOSSR=220;let bossUntil=0;
 const bossNear=()=>{try{if(SCENE&&/^ib_/.test(SCENE.id||''))return true;const dun=!!(SCENE&&SCENE.room&&SCENE.room.dun);for(const m of en)if(m&&!m.dead&&!m._rp&&(m.boss||m._wb||m.cb||m.type==='boss'||m.type==='ib'||(m.big&&dun))&&Math.hypot(m.x-P.x,m.y-P.y)<BOSSR)return true}catch(e){}return false};
 {const _w=wantSong;wantSong=function(){const w=_w.apply(this,arguments);try{
   const now=performance.now();if(!dead&&bossNear())bossUntil=now+6000;if(now<bossUntil)return'boss';
   if(typeof SAILING!=='undefined'&&SAILING)return'sail';
   if(w==='day'){const R=SCENE&&SCENE.room;const rg=R&&R.region;if(rg&&REGION_SONG[rg])return REGION_SONG[rg]}}catch(e){}return w}}
 // ---------- the old player stays quiet ----------
 const hush=()=>{try{for(const k in PARSED){const p=PARSED[k];if(p&&p.lead&&p.lead.ev.length){p.lead.ev=[];p.bass.ev=[]}}}catch(e){}};hush();
 // ---------- scheduler ----------
 let cur=null,t0=0,step=0,def=null,song=null;
 function tick(){try{hush();if(typeof MUSIC!=='undefined'&&!MUSIC){cur=null;return}if(!setup()||ctx.state!=='running')return;
  let want=wantSong();if(!SONGS2[want])want=/cave/.test(want)?'cave':'day';
  const now=ctx.currentTime;
  if(want!==cur){cur=want;def=S[want];song=SONGS2[want];step=0;t0=now+.12;
   echoFor(def,now);BUS.gain.setTargetAtTime(.65*(VOL[want]||1),now,.05)}
  const sp=60/def.bpm/4;
  if(t0+step*sp<now-.25){t0=now+.05-step*sp}// fell behind (tab was hidden): continue from here, don't burst
  while(t0+step*sp<now+.4){const s=step%song.len,base=t0+step*sp;
   playStep(def,song,s,base,sp);
   step++}}catch(e){if(!tick._e){tick._e=1;console.warn('music',e)}}}
 setInterval(tick,100);
 window.SQMUSIC={S,SONGS:SONGS2,build,render,get cur(){return cur},REGION_SONG,tick};
})();
