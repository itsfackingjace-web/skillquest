// ---- 161. The soundtrack ----
// Orchestral music in the spirit of the classic MMO soundtracks: real instrument samples (FluidR3_GM, CC BY 3.0, by Frank
// Wen; music/<instrument>.json holds one mp3 every 4 semitones, loaded when a song needs it) played by a small tracker.
// Songs are written as a melody (8th-note tokens, "X/Y" = two 16ths, "-" hold, "." rest, "|" bar line for reading) over
// one chord per bar ("C,G" = half a bar each); the arrangement comes from the chords in the song's style: bass line
// (bass instrument, bs style), harp/guitar/pizzicato/string figures (arp, arps), a held chord (pad), percussion (timpani,
// taiko, a soft snare and tambourine) and an optional second voice (harm) under the melody. Parts can switch the lead or
// second voice ({lead,harm}). A hall reverb, panning and a gentle compressor tie it together. All melodies are original.
// 014's scheduler keeps running (it owns MG, the music volume / fade bus) but plays nothing: its PARSED tracks are emptied.
// The outermost wantSong picks the song: boss nearby (world/island/custom bosses, big monsters in dungeons; outdoor 'big'
// monsters like No Man's Land's giant scorpions don't count) > sailing > island themes (per region) > the towns' and
// dungeons' own songs (unchanged names: day night indoor cave port frost tide desert icecave sandcave seacave) > Hollow.
(()=>{
 const S={
 day:{n:'Hollow Isle',bpm:108,m:8,lead:'flute',pad:'strings',arp:'harp',arps:'harp8',bass:'pizz',bs:'pizz',perc:'timp',parts:{
  A:['D G D A Bm G E A','A4 - D5 - F#5 - E5 D5 | B4 - - - G5 - F#5 E5 | F#5 - D5 - A4 - D5 E5 | E5 - - - C#5 D5 E5 A4 | B4 - D5 - F#5 - B5 A5 | G5 - - - F#5 G5 A5 G5 | F#5 - E5 - G#4 - B4 E5 | E5 - - - - - . .'],
  A2:['D G D A Bm Em A D','A4 - D5 - F#5 - E5 D5 | B4 - - - G5 - F#5 E5 | F#5 - A5 - D6 - C#6 B5 | A5 - - - E5 F#5 G5 E5 | F#5 - D5 - B4 - D5 F#5 | E5 - G5 - B5 - A5 G5 | F#5 - D5 - E5 - C#5 E5 | D5 - - - - - . .',{harm:'clarinet'}],
  B:['G A F#m Bm Em A D A','G5 - B5 - A5 G5 F#5 G5 | A5 - - - E5 - . A4 | A5 - F#5 - C#5 - F#5 A5 | B5 - - - F#5 - D5 B4 | G5 - E5 - B4 - E5 G5 | A5 - G5 - F#5 - E5 - | F#5 - D5 - A4 - D5 F#5 | A5 - - - - - A4 B4',{lead:'oboe',harm:'horn'}]},
  order:'A A2 B A2'},
 night:{n:'Moon over Hollow',bpm:80,m:6,lead:'flute',pad:'strings',arp:'harp',arps:'harp8',bass:'cello',bs:'waltz',perc:'none',parts:{
  A:['Am F C G Am F E E','E5 - - - A5 - | C6 - B5 - A5 - | G5 - - - E5 - | D5 - - - . . | E5 - - - A5 - | C6 - D6 - E6 - | B5 - A5 - G#5 - | B5 - - - . .'],
  A2:['Am F C G Am F E Am','E5 - - - A5 - | C6 - B5 - A5 - | G5 - - - E5 - | D5 - - - . . | E5 - - - A5 - | C6 - D6 - E6 - | D6 - C6 - B5 - | A5 - - - . .'],
  B:['Dm G C Am Dm G E E','F5 - - - A5 - | D6 - - - B5 - | C6 - - - G5 - | A5 - - - E5 - | F5 - A5 - D6 - | D6 - C6 - B5 - | B5 - - - G#5 - | E5 - - - . .',{lead:'clarinet'}]},
  order:'A A2 B A2'},
 indoor:{n:'Hearth and Home',bpm:92,m:8,lead:'clarinet',arp:'guitar',arps:'strum',bass:'pizz',bs:'walk',perc:'none',swing:1,parts:{
  A:['F Dm Gm C F Dm Gm,C F','C5 - F5 - A5 - G5 F5 | A5 - - - D5 - . . | D5 - G5 - Bb5 - A5 G5 | E5 - - - C5 - . . | C5 - F5 - A5 - C6 A5 | D6 - - - A5 - F5 D5 | G5 - A5 - Bb5 - E5 - | F5 - - - . . . .'],
  B:['Bb F Bb C Am Dm G7 C','D6 - - - C6 Bb5 A5 Bb5 | C6 - - - A5 - F5 - | D6 - - - C6 Bb5 A5 G5 | A5 - - - G5 - . . | E5 - G5 - C6 - B5 A5 | A5 - - - F5 - D5 - | G5 - - - A5 - B5 - | C6 - - - . . . .',{lead:'oboe'}]},
  order:'A B A'},
 cave:{n:'Slime-Lit Hollows',bpm:72,m:8,lead:'clarinet',pad:'choir',arp:'harp',arps:'sparkle',bass:'contrabass',bs:'held',perc:'timp',parts:{
  A:['Dm Dm Bb A Dm Dm Gm A','. . . . A4 - - - | D5 - - - C5 - A4 - | Bb4 - - - - - F4 - | E4 - - - - - - - | . . . . A4 - - - | D5 - - - E5 - F5 - | G5 - - - F5 - E5 - | C#5 - - - - - - -'],
  B:['Gm Gm Dm Dm Bb C A A','D5 - - - Bb4 - G4 - | A4 - - - G4 - F4 - | F4 - - - E4 - D4 - | A4 - - - - - - - | F5 - - - E5 - D5 - | E5 - - - D5 - C5 - | C#5 - - - E5 - A5 - | G5 - - - F5 - E5 -',{lead:'oboe'}]},
  order:'A B'},
 port:{n:'Saltmere Shanty',bpm:160,m:6,lead:'accordion',arp:'guitar',arps:'strum',bass:'pizz',bs:'shanty',perc:'tamb',parts:{
  A:['G G C D G Em Am,D G','D5 - B4 G4 - B4 | D5 - - G5 - - | E5 - C5 E5 - G5 | F#5 - - D5 - - | D5 - B4 G4 - B4 | E5 - G5 B5 - G5 | A5 - G5 F#5 E5 F#5 | G5 - - - . .'],
  B:['C G D G C G Am,D G','E5 - - E5 F#5 G5 | D5 - - B4 - - | A4 - B4 C5 - A4 | B4 - - G4 - - | E5 - - E5 F#5 G5 | D5 - - B5 - - | A5 - G5 F#5 - E5 | G5 - - - . .',{lead:'violin'}]},
  order:'A A B A'},
 frost:{n:'Frosthollow',bpm:84,m:8,lead:'celesta',pad:'strings',arp:'harp',arps:'harp8',bass:'cello',bs:'held',perc:'none',parts:{
  A:['Em Cmaj7 G D Em C Am B','B5 - - - E5 - G5 - | F#5 - E5 - B4 - - - | D5 - - - G5 - B5 - | A5 - - - F#5 - - - | B5 - - - E6 - D6 - | C6 - B5 - G5 - - - | A5 - C6 - B5 - A5 - | F#5 - - - D#5 - - -'],
  B:['C D Bm Em C D B B','G5 - - - E5 - C5 - | D5 - F#5 - A5 - - - | B5 - - - F#5 - D5 - | E5 - - - - - - - | C6 - - - B5 - G5 - | A5 - - - D6 - - - | D#6 - - - B5 - F#5 - | D#5 - - - B4 - - -',{lead:'flute',harm:'celesta'}]},
  order:'A B'},
 tide:{n:'Tidewatch',bpm:100,m:6,lead:'flute',arp:'guitar',arps:'harp8',bass:'cello',bs:'waltz',perc:'tamb',parts:{
  A:['C Am F G C Am Dm,G C','E5 - - D5 C5 - | A4 - - C5 E5 - | F5 - E5 - D5 - | D5 - - - G4 - | E5 - - D5 C5 - | A5 - - G5 E5 - | F5 - E5 D5 - B4 | C5 - - - . .'],
  B:['F C Dm Am F C G G','A5 - - G5 F5 - | G5 - - E5 C5 - | F5 - - E5 D5 - | E5 - - - C5 - | A5 - - B5 C6 - | G5 - - E5 C5 - | D5 - E5 - F5 - | G5 - - - . .',{lead:'oboe'}]},
  order:'A B A'},
 desert:{n:'Dusthaven',bpm:96,m:8,lead:'shanai',pad:'strings',arp:'sitar',arps:'stab',bass:'pizz',bs:'root5',perc:'taiko',parts:{
  A:['A Bb A Gm A Bb Gm A','A4 - Bb4 - C#5 - D5 E5 | F5 - E5 - D5 - Bb4 - | C#5 - - - E5 - A5 - | G5 - F5 - E5 - D5 - | E5 - F5 - G5 - A5 - | Bb5 - A5 - G5 - F5 - | G5 - F5 - E5 - D5 - | C#5 - - - A4 - - -'],
  B:['Dm Dm Gm Gm Bb A Gm A','D5 - F5 - A5 - - - | G5/A5 G5 F5 - E5 - D5 - | Bb4 - D5 - G5 - - - | F5/G5 F5 E5 - D5 - C#5 - | D5 - - - F5 - Bb5 - | A5 - - - C#5 - E5 - | G5 - F5 - E5 - D5 - | E5 - - - . . . .',{lead:'oboe',harm:'shanai'}]},
  order:'A B A'},
 icecave:{n:'Frostfang Den',bpm:66,m:8,lead:'celesta',pad:'choir',arp:'harp',arps:'sparkle',bass:'contrabass',bs:'pedal',perc:'none',parts:{
  A:['Bm Bm G G Em F# Bm F#','F#5 - - - - - B5 - | A5 - - - F#5 - - - | G5 - - - D5 - - - | B4 - - - - - - - | E5 - - - G5 - B5 - | A#5 - - - F#5 - - - | D5 - C#5 - B4 - - - | C#5 - - - - - - -'],
  B:['G A F#m Bm G Em F# F#','D6 - - - B5 - G5 - | C#6 - - - A5 - E5 - | F#5 - - - C#5 - A4 - | B4 - - - D5 - F#5 - | G5 - - - B5 - D6 - | C#6 - B5 - G5 - E5 - | F#5 - - - - - - - | A#4 - - - C#5 - - -',{lead:'flute'}]},
  order:'A B'},
 sandcave:{n:'Scorpion Hollow',bpm:92,m:8,lead:'oboe',pad:'strings',arp:'pizz',arps:'stab',bass:'pizz',bs:'root5',perc:'taiko',parts:{
  A:['Em F Em Dm Em F G F','E5 - F5 - G5 - E5 - | F5 - - - A5 - G5 F5 | E5 - B4 - C5 - D5 - | D5 - - - - - . . | B5 - A5 - G5 - F5 - | A5 - G5 - F5 - E5 - | D5 - E5 - F5 - G5 - | F5 - - - E5 - - -'],
  B:['Am Am F F Dm Dm F E','A4 - C5 - E5 - - - | D5 - C5 - B4 - A4 - | A4 - C5 - F5 - - - | E5 - D5 - C5 - B4 - | D5 - F5 - A5 - - - | G5 - F5 - E5 - D5 - | C5 - D5 - E5 - F5 - | E5 - - - - - . .',{lead:'shanai'}]},
  order:'A B'},
 seacave:{n:'Drowned Grotto',bpm:120,m:6,lead:'flute',pad:'choir',arp:'harp',arps:'harp8',bass:'cello',bs:'held',perc:'none',parts:{
  A:['Em C Am B Em C D B','B4 - - E5 - G5 | G5 - - F#5 - E5 | E5 - - C5 - E5 | D#5 - - - - - | B4 - - E5 - G5 | C6 - - B5 - A5 | A5 - G5 F#5 - D5 | D#5 - - B4 - -'],
  B:['C D Bm Em Am D B B','E5 - - G5 - C6 | D6 - - A5 - F#5 | F#5 - - B5 - D6 | B5 - - - G5 - | A5 - - C6 - E6 | D6 - - C6 - A5 | B5 - A5 F#5 - D#5 | B4 - - - . .',{lead:'oboe'}]},
  order:'A B'},
 sail:{n:'Open Water',bpm:120,m:8,lead:'horn',pad:'strings',arp:'strings',arps:'ost8',bass:'cello',bs:'root5',perc:'march',parts:{
  A:['C Em F G C Em F,G C','G4 - C5 - E5 - G5 - | G5 - - - B5 - G5 - | A5 - - - F5 - C5 - | D5 - - - - - G4 - | G4 - C5 - E5 - G5 - | B5 - - - C6 - B5 - | A5 - F5 - B5 - G5 - | C6 - - - - - . .'],
  B:['Am Em F C Am Em Dm G','E6 - - - D6 - C6 - | B5 - - - G5 - E5 - | F5 - A5 - C6 - A5 - | G5 - - - E5 - C5 - | E6 - - - D6 - C6 - | B5 - - - G5 - B5 - | A5 - - - F5 - D5 - | G5 - - - - - . .',{lead:'violin',harm:'horn'}]},
  order:'A B A'},
 briar:{n:'Briarwood',bpm:92,m:8,lead:'panflute',pad:'strings',arp:'harp',arps:'harp8',bass:'cello',bs:'root5',perc:'none',parts:{
  A:['Em A Em D Em A C D','B4 - E5 - F#5 - G5 A5 | A5 - - - E5 - C#5 - | B4 - - - G5 - F#5 E5 | F#5 - - - D5 - . . | B4 - E5 - F#5 - G5 A5 | B5 - - - A5 - C#6 - | B5 - A5 - G5 - E5 - | F#5 - - - - - . .'],
  B:['C D Bm Em C D B B','G5 - - - E5 - C5 - | A5 - - - F#5 - D5 - | F#5 - - - D5 - B4 - | E5 - - - G5 - B5 - | C6 - - - B5 - G5 - | A5 - - - F#5 - D6 - | D#6 - - - B5 - F#5 - | D#5 - - - - - . .',{lead:'flute',harm:'clarinet'}]},
  order:'A B A'},
 ash:{n:'Ashfall Coast',bpm:126,m:8,lead:'horn',pad:'strings',arp:'strings',arps:'ost8',bass:'contrabass',bs:'drive',perc:'timp8',parts:{
  A:['Cm Cm Ab Bb Cm Cm Ab G','C5 - - Eb5 - - G5 - | F5 - Eb5 - D5 - Eb5 - | C5 - - Eb5 - - Ab5 - | G5 - - - F5 - D5 - | C5 - - Eb5 - - G5 - | C6 - Bb5 - G5 - Eb5 - | F5 - Eb5 - D5 - C5 - | B4 - - - D5 - G5 -'],
  B:['Ab Bb Gm Cm Ab Bb G G','Eb6 - - - C6 - Ab5 - | D6 - - - Bb5 - F5 - | D6 - - - Bb5 - G5 - | C6 - - - G5 - Eb5 - | Eb6 - - - C6 - Ab5 - | F6 - - - D6 - Bb5 - | B5 - - - D6 - F6 - | D6 - - - B5 - G5 -',{lead:'violin',harm:'horn'}]},
  order:'A B A'},
 iron:{n:'Ironcrest Highlands',bpm:104,m:8,lead:'horn',pad:'strings',arp:'pizz',arps:'stab',bass:'cello',bs:'root5',perc:'march',parts:{
  A:['D C G D D C G A','A4 - D5 - E5 - F#5 - | G5 - E5 - C5 - E5 - | D5 - B4 - G4 - B4 - | A4 - - - D5 - - - | A5 - - - F#5 - D5 - | G5 - - - E5 - C6 - | B5 - A5 - G5 - E5 - | E5 - - - - - . .'],
  B:['G D C D G D C A','B5 - - - A5 - G5 - | F#5 - - - D5 - A4 - | C5 - E5 - G5 - C6 - | A5 - - - - - . . | B5 - - - D6 - B5 - | A5 - - - F#5 - D5 - | E5 - G5 - C6 - B5 - | A5 - - - C#5 - E5 -',{lead:'violin',harm:'horn'}]},
  order:'A B A'},
 shatter:{n:'The Shattered Expanse',bpm:72,m:8,lead:'celesta',pad:'choir',arp:'harp',arps:'sparkle',bass:'contrabass',bs:'pedal',perc:'none',parts:{
  A:['F#m G F#m G Em F#m D C#','C#5 - - - - - F#5 - | G5 - - - D5 - - - | A5 - - - C#6 - - - | B5 - - - G5 - - - | G5 - E5 - B4 - E5 - | F#5 - - - A5 - C#6 - | D6 - C#6 - A5 - F#5 - | F5 - - - - - - -']},
  order:'A'},
 nomans:{n:'No Man\'s Land',bpm:112,m:8,lead:'oboe',pad:'strings',arp:'strings',arps:'ost8',bass:'contrabass',bs:'drive',perc:'taiko',parts:{
  A:['Am Am F E Am Am Dm E','A4 - - A4 C5 - E5 - | D5 - C5 - B4 - A4 - | F5 - - F5 E5 - C5 - | B4 - - - G#4 - - - | A4 - - A4 C5 - E5 - | A5 - G5 - F5 - E5 - | D5 - F5 - A5 - F5 - | E5 - - - - - . .']},
  order:'A'},
 boss:{n:'Clash',bpm:144,m:8,lead:'violin',harm:'horn',pad:'brass',arp:'strings',arps:'ost8',bass:'cello',bs:'drive',perc:'boss',parts:{
  A:['Em C D B Em C Am B','E5 - E5 - G5 - E5 - | C6 - B5 - G5 - E5 - | D5 - F#5 - A5 - D6 - | D#6 - - - B5 - - - | E6 - D6 - B5 - G5 - | C6 - B5 - G5 - E5 - | A5 - C6 - E6 - C6 - | B5 - - - D#5 - F#5 -'],
  B:['C D Em Em C D B B','G5 - - - - - E5 - | A5 - - - - - F#5 - | B5 - - - E6 - - - | B5 - G5 - E5 - B4 - | C6 - - - - - G5 - | D6 - - - - - A5 - | B5 - A5 - F#5 - D#5 - | B4 - - - - - - -',{lead:'horn',harm:'violin'}]},
  order:'A B'}};
 // loudness evened out between songs (measured from renders)
 const VOL={day:1.4,night:1.47,indoor:1.4,cave:1.47,port:1.56,frost:1.75,tide:1.75,desert:1.87,icecave:1.87,sandcave:1.87,seacave:1.65,sail:1.65,briar:1.47,ash:1.65,iron:1.65,shatter:2.15,nomans:1.75,boss:1.65};
 const REGION_SONG={briarwood:'briar',ashfall:'ash',ironcrest:'iron',shattered:'shatter',nomans:'nomans'};
 // ---------- notation ----------
 const PC={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
 const midi=s=>{const m=/^([A-G])(#|b)?(\d)$/.exec(s);if(!m)return 0;return 12*(+m[3]+1)+PC[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)};
 const QUAL={'':[0,4,7],m:[0,3,7],'7':[0,4,7,10],m7:[0,3,7,10],maj7:[0,4,7,11],sus4:[0,5,7],dim:[0,3,6],aug:[0,4,8]};
 const chord=s=>{const m=/^([A-G])(#|b)?(.*)$/.exec(s);const r=(PC[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)+12)%12;return{r,iv:QUAL[m[3]]||QUAL['']}};
 const near=(pc,lo)=>lo+((pc-lo)%12+12)%12;// lowest note with that pitch class at or above lo
 // ---------- instruments (FluidR3_GM samples in music/<name>.json, one every 4 semitones) ----------
 // sus = held for the note's length, then released; otherwise the sample rings out (plucked/struck)
 const INST={strings:{lo:36,hi:88,sus:1,a:.09,r:.4},violin:{lo:55,hi:96,sus:1,a:.04,r:.25},cello:{lo:36,hi:72,sus:1,a:.05,r:.25},
  contrabass:{lo:28,hi:55,sus:1,a:.05,r:.3},pizz:{lo:28,hi:84},harp:{lo:36,hi:96},flute:{lo:60,hi:96,sus:1,a:.03,r:.2},
  oboe:{lo:58,hi:91,sus:1,a:.03,r:.18},clarinet:{lo:50,hi:91,sus:1,a:.03,r:.2},horn:{lo:40,hi:77,sus:1,a:.05,r:.3},
  brass:{lo:40,hi:80,sus:1,a:.06,r:.3},choir:{lo:48,hi:79,sus:1,a:.3,r:.6},celesta:{lo:60,hi:100},guitar:{lo:40,hi:84},
  accordion:{lo:48,hi:84,sus:1,a:.03,r:.15},panflute:{lo:60,hi:96,sus:1,a:.04,r:.2},shanai:{lo:60,hi:90,sus:1,a:.03,r:.18},
  sitar:{lo:48,hi:84},timpani:{lo:36,hi:57},taiko:{lo:36,hi:48}};
 const fit=(inst,m)=>{const I=INST[inst];if(!I)return m;while(m<I.lo)m+=12;while(m>I.hi)m-=12;return m};
 // ---------- a song becomes notes per channel, in 16th steps ----------
 function build(def){const bar=def.m*2,ev={lead:[],harm:[],bass:[],arp:[],pad:[],perc:[]},chAt=[];let at=0;
  for(const pn of def.order.split(' ')){const [chs,mel,opt]=def.parts[pn];const o=opt||{},bars=chs.split(' ');
   const lead=o.lead||def.lead,harm=o.harm||def.harm||null;
   bars.forEach((b,bi)=>{const halves=b.split(','),hw=bar/halves.length;halves.forEach((c,hi)=>{const C=chord(c),s0=at+bi*bar+hi*hw;for(let i=0;i<hw;i++)chAt[s0+i]=C;accomp(def,C,s0,hw,bar,ev,bi)})});
   let st=at,last=null;const notes=[];
   for(const tk of mel.replace(/\|/g,' ').trim().split(/\s+/)){
    if(tk==='-'){if(last)last.d+=2;st+=2;continue}if(tk==='.'){last=null;st+=2;continue}
    const ps=tk.split('/');if(ps.length===2){notes.push({s:st,d:1,m:midi(ps[0])});last={s:st+1,d:1,m:midi(ps[1])};notes.push(last);st+=2;continue}
    last={s:st,d:2,m:midi(tk)};notes.push(last);st+=2}
   for(const n of notes){ev.lead.push({s:n.s,d:n.d,m:fit(lead,n.m),i:lead});
    // second voice: the nearest chord tone at least a third below, on notes of a quarter or longer
    if(harm&&n.d>=4){const C=chAt[n.s];if(C){let best=null;for(let m=n.m-3;m>=n.m-9;m--)if(C.iv.some(v=>(C.r+v)%12===((m%12)+12)%12)){best=m;break}if(best)ev.harm.push({s:n.s,d:n.d,m:fit(harm,best),i:harm})}}}
   if(def.perc&&def.perc!=='none')for(let bi=0;bi<bars.length;bi++)perc(def,at+bi*bar,bar,ev,bi,bars.length,chAt[at+bi*bar]);
   at+=bars.length*bar}
  const idx=[];for(let i=0;i<at;i++)idx.push([]);for(const ch in ev)for(const n of ev[ch])if(n.s<at)idx[n.s].push([ch,n]);
  const insts=new Set(['timpani','taiko']);for(const ch in ev)for(const n of ev[ch])if(n.i)insts.add(n.i);
  return{ev,idx,len:at,bar,insts:[...insts].filter(k=>INST[k])}}
 function accomp(def,C,s0,w,bar,ev,bi){const bi_=def.bass,R=fit(bi_,near(C.r,36)),five=R+7>INST[bi_].hi?R-5:R+7,oct=R+12<=INST[bi_].hi?R+12:R;
  const B=(s,d,m)=>ev.bass.push({s:s0+s,d,m:fit(bi_,m),i:bi_});
  switch(def.bs){
   case'held':B(0,w,R);break;
   case'pedal':B(0,w,R);break;
   case'pizz':for(let i=0;i<w;i+=4)B(i,2,(i/4)%2?five:R);break;
   case'drive':for(let i=0;i<w;i+=2)B(i,2,(i/2)%2?oct:R);break;
   case'walk':{const t=[R,R+C.iv[1],five,R+(C.iv[1]===3?10:9)];for(let i=0,j=0;i<w;i+=4,j++)B(i,4,t[j%4]);break}
   case'root5':for(let i=0;i<w;i+=8)B(i,7,(i/8)%2?five:R);break;
   case'waltz':B(0,w,R);break;
   case'shanty':for(let i=0;i<w;i+=6){B(i,3,R);B(i+3,3,five)}break}
  const ai=def.arp,A=near(C.r,ai==='strings'||ai==='pizz'?55:60),at=C.iv.map(i=>A+i);
  const P=(s,d,m,v,o)=>ev.arp.push({s:s0+s,d,m:fit(ai,m),i:ai,v:v||1,o:o||0});
  switch(def.arps){
   case'harp8':{const t=[at[0],at[1],at[2],at[0]+12,at[2],at[1]];for(let i=0,j=0;i<w;i+=2,j++)P(i,2,t[j%6],j%3?.75:1);break}
   case'strum':{const beats=def.m===6?[0,6]:[0,4,8,12];for(const b of beats)if(b<w)at.slice(0,3).forEach((m,k)=>P(b,3,m-12,b?.6:.85,k));break}
   case'stab':{const beats=def.m===6?[2,4,8,10]:[2,6,10,14];for(const b of beats)if(b<w)for(const m of at.slice(0,3))P(b,1,m,.55);break}
   case'ost8':for(let i=0;i<w;i+=2)for(const m of at.slice(0,3))P(i,1,m,i%4?.45:.65);break;
   case'sparkle':{const pos=[0,6,10],t=[at[2]+12,at[0]+12,at[1]+12];for(let k=0;k<pos.length;k++)if(pos[k]<w)P(pos[k],4,t[k],.6);break}}
  if(def.pad){const p=near(C.r,52);for(const m of [p+C.iv[0],p+C.iv[1],p+C.iv[2]])ev.pad.push({s:s0,d:w,m:fit(def.pad,m),i:def.pad})}}
 function perc(def,s0,bar,ev,bi,nb,C){const r=C?C.r:0,T=near(r,41),T5=T+7>57?T-5:T+7;
  const X=(s,k,m,v)=>ev.perc.push({s:s0+s,k,m,v,i:k==='timp'?'timpani':k==='taiko'?'taiko':null});
  const last=bi===nb-1,four=bar===16;
  switch(def.perc){
   case'timp':if(bi%2===0)X(0,'timp',T,.7);if(last)for(let i=bar-4;i<bar;i++)X(i,'timp',T,.25+(i-bar+4)*.1);break;
   case'march':X(0,'timp',T,.7);if(four)X(8,'timp',T5,.5);X(four?12:9,'snare',0,.25);if(bi%4===3){for(let i=bar-4;i<bar;i++)X(i,'snare',0,.18+(i-bar+4)*.06)}break;
   case'timp8':for(let i=0;i<bar;i+=2)X(i,'timp',i%8?T5:T,i%4?.3:.55);break;
   case'taiko':for(const i of(four?[0,6,8,12]:[0,6]))X(i,'taiko',40,i?.45:.7);if(four)X(14,'taiko',43,.3);break;
   case'tamb':for(let i=0;i<bar;i+=2)X(i,'tamb',0,(def.m===6?i%6===0:i%4===2)?.5:.22);break;
   case'boss':for(let i=0;i<bar;i+=4)X(i,'timp',i%8?T5:T,.6);for(const i of[2,6,10,13,14])X(i,'taiko',40,.45);X(4,'snare',0,.3);X(12,'snare',0,.3);break}}
 const SONGS2={};for(const k in S)SONGS2[k]=build(S[k]);
 // ---------- samples ----------
 const BUF={},LOAD={};
 const decCtx=()=>(typeof ACX!=='undefined'&&ACX)||(decCtx.o||(decCtx.o=new OfflineAudioContext(1,1,44100)));
 function load(inst){if(LOAD[inst])return LOAD[inst];
  LOAD[inst]=fetch('music/'+inst+'.json').then(r=>{if(!r.ok)throw new Error('music '+inst+' '+r.status);return r.json()}).then(async j=>{const out={};
    await Promise.all(Object.keys(j.s).map(async k=>{const bin=atob(j.s[k]),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
     out[k]=await new Promise((res,rej)=>decCtx().decodeAudioData(u.buffer,res,rej))}));
    BUF[inst]={keys:Object.keys(out).map(Number).sort((a,b)=>a-b),b:out};return BUF[inst]}).catch(e=>{delete LOAD[inst];throw e});
  return LOAD[inst]}
 const ready=name=>SONGS2[name].insts.every(k=>BUF[k]);
 const loadSong=name=>Promise.all(SONGS2[name].insts.map(load));
 // ---------- sound ----------
 let ctx=null,BUS=null,PAN={},NOISE=null;
 function setup(){if(typeof ACX==='undefined'||!ACX||typeof MG==='undefined'||!MG)return false;if(ctx===ACX&&BUS)return true;init(ACX,MG);return true}
 function init(c,dest){ctx=c;
  BUS=ctx.createGain();BUS.gain.value=.8;const comp=ctx.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=3;comp.attack.value=.01;comp.release.value=.25;BUS.connect(comp);comp.connect(dest);
  // a concert-hall reverb from a decaying noise burst (stereo, slightly different per side)
  const len=Math.floor(ctx.sampleRate*2.6),ir=ctx.createBuffer(2,len,ctx.sampleRate);for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)*(i<ctx.sampleRate*.012?i/(ctx.sampleRate*.012):1)}
  const cv=ctx.createConvolver();cv.buffer=ir;const wet=ctx.createGain();wet.gain.value=.32;cv.connect(wet);wet.connect(comp);
  const mk=(p,send)=>{const g=ctx.createGain();let n=g;try{const sp=ctx.createStereoPanner();sp.pan.value=p;g.connect(sp);n=sp}catch(e){}n.connect(BUS);const s=ctx.createGain();s.gain.value=send;g.connect(s);s.connect(cv);return g};
  PAN={lead:mk(0,.9),harm:mk(-.3,1),pad:mk(.25,1.1),arp:mk(.35,.9),bass:mk(-.15,.5),perc:mk(0,.7)};
  NOISE=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);{const d=NOISE.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}}
 const LV={lead:.9,harm:.42,pad:.22,arp:.38,bass:.6,perc:.8};
 function sample(ch,n,t,d){const B=BUF[n.i];if(!B)return;const I=INST[n.i]||{};let k=B.keys[0];for(const x of B.keys)if(Math.abs(x-n.m)<Math.abs(k-n.m))k=x;
  const buf=B.b[k],src=ctx.createBufferSource();src.buffer=buf;src.playbackRate.value=Math.pow(2,(n.m-k)/12);
  const g=ctx.createGain(),v=LV[ch]*(n.v||1)*(ch==='lead'?1:.92+Math.random()*.16);const rate=src.playbackRate.value,len=buf.duration/rate;
  if(I.sus){const a=Math.min(I.a,d*.4),rel=I.r,hold=Math.max(a,d);
   if(hold+rel>len-.05){src.loop=true;src.loopStart=Math.min(1,buf.duration*.35);src.loopEnd=buf.duration-.12}
   g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setValueAtTime(v,t+hold);g.gain.linearRampToValueAtTime(0,t+hold+rel);src.connect(g);g.connect(PAN[ch]);src.start(t);src.stop(t+hold+rel+.02)}
  else{const end=Math.min(len,ch==='arp'?Math.max(d+.6,1.2):len);g.gain.setValueAtTime(v,t);g.gain.setValueAtTime(v,t+end-.08);g.gain.linearRampToValueAtTime(0,t+end);src.connect(g);g.connect(PAN[ch]);src.start(t);src.stop(t+end+.02)}}
 function noise(t,dur,v,ftype,freq,q){const s=ctx.createBufferSource();s.buffer=NOISE;s.playbackRate.value=.8+Math.random()*.4;const f=ctx.createBiquadFilter();f.type=ftype;f.frequency.value=freq;if(q)f.Q.value=q;const g=ctx.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(PAN.perc);s.start(t,Math.random()*.5);s.stop(t+dur+.02)}
 function hit(n,t){if(n.i)return sample('perc',n,t,1);
  if(n.k==='snare'){noise(t,.16,.32*n.v*2.5,'bandpass',2300,.8)}
  else if(n.k==='tamb'){noise(t,.09,.2*n.v,'highpass',7500);noise(t+.012,.07,.12*n.v,'bandpass',9500,3)}}
 function playStep(def,song,s,base,sp){for(const [ch,n] of song.idx[s]){const sw=def.swing&&(n.s%4)===2?sp*.5:0,hz=ch==='lead'?0:(Math.random()-.5)*.012;
   const t=Math.max(0,base+sw+hz+(n.o||0)*.018),d=n.d*sp;
   if(ch==='perc')hit(n,t);else sample(ch,n,t,ch==='lead'?d*.96:d)}}
 // render a song to an AudioBuffer (previews / tests): loops it until secs
 async function render(name,secs){await loadSong(name);const sv=[ctx,BUS,PAN,NOISE],sr=44100,oc=new OfflineAudioContext(2,Math.ceil(sr*secs),sr),out=oc.createGain();out.gain.value=.5;out.connect(oc.destination);
  try{init(oc,out);BUS.gain.value=.8*(VOL[name]||1);const def=S[name],song=SONGS2[name],sp=60/def.bpm/4;for(let st=0;st*sp<secs-.5;st++)playStep(def,song,st%song.len,.05+st*sp,sp)}
  finally{[ctx,BUS,PAN,NOISE]=sv}
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
 // A new song starts once its instruments have loaded; until then the current one keeps playing.
 let cur=null,t0=0,step=0,def=null,song=null,failAt=0;
 function tick(){try{hush();if(typeof MUSIC!=='undefined'&&!MUSIC){cur=null;return}if(!setup()||ctx.state!=='running')return;
  let want=wantSong();if(!SONGS2[want])want=/cave/.test(want)?'cave':'day';
  const now=ctx.currentTime;
  if(want!==cur){if(!ready(want)){if(performance.now()>failAt)loadSong(want).catch(e=>{failAt=performance.now()+30000;console.warn(e)})}
   else{cur=want;def=S[want];song=SONGS2[want];step=0;t0=now+.15;BUS.gain.setTargetAtTime(.8*(VOL[want]||1),now,.05)}}
  if(!cur)return;
  const sp=60/def.bpm/4;
  if(t0+step*sp<now-.25){t0=now+.05-step*sp}// fell behind (tab was hidden): continue from here, don't burst
  while(t0+step*sp<now+.4){playStep(def,song,step%song.len,t0+step*sp,sp);step++}}catch(e){if(!tick._e){tick._e=1;console.warn('music',e)}}}
 setInterval(tick,100);
 // credit for the instrument samples (CC BY 3.0 asks for it), at the bottom of Options
 {const _o=optionsHTML;optionsHTML=function(){return _o()+'<div style="margin:14px 0 4px;font-size:11px;opacity:.6;text-align:center">Music instruments: FluidR3_GM SoundFont by Frank Wen (CC BY 3.0)</div>'}}
 window.SQMUSIC={S,SONGS:SONGS2,INST,build,render,load,loadSong,get cur(){return cur},REGION_SONG,tick};
})();
