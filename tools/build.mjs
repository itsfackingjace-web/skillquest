#!/usr/bin/env node
// Builds index.html from the files listed in src/manifest.txt (joined in that order, byte for byte).
//   node tools/build.mjs          build index.html
//   node tools/build.mjs --check  fail if index.html is not exactly what src/ builds (used by CI)
// No dependencies. Before writing, the game script is parsed so a syntax error is reported with the
// source file and line it came from, instead of a broken page.
import fs from 'fs';import path from 'path';import vm from 'vm';import {fileURLToPath} from 'url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files=fs.readFileSync(path.join(root,'src/manifest.txt'),'utf8').split('\n').map(s=>s.trim()).filter(s=>s&&!s.startsWith('#'));
let out='';const map=[];// [startLineInOutput, file]
for(const f of files){const p=path.join(root,'src',f);if(!fs.existsSync(p)){console.error('Missing file in manifest: src/'+f);process.exit(1)}
  map.push([out.split('\n').length,f]);out+=fs.readFileSync(p,'utf8')}
// syntax check the game script
const a=out.indexOf('<script>\n'),b=out.lastIndexOf('</script>');
if(a<0||b<0){console.error('Could not find the game <script> block');process.exit(1)}
const js=out.slice(a+9,b),jsLine0=out.slice(0,a+9).split('\n').length;
try{new vm.Script(js,{filename:'game.js'})}catch(e){
  const m=String(e.stack).match(/game\.js:(\d+)/);let where='';
  if(m){const ln=+m[1]+jsLine0-1;let hit=map[0];for(const r of map)if(r[0]<=ln)hit=r;where=` at src/${hit[1]}:${ln-hit[0]+1}`}
  console.error('Syntax error'+where+': '+e.message);process.exit(1)}
const target=path.join(root,'index.html');
if(process.argv.includes('--check')){
  const cur=fs.existsSync(target)?fs.readFileSync(target,'utf8'):'';
  if(cur!==out){console.error('index.html is out of date: edit files in src/, then run  node tools/build.mjs');process.exit(1)}
  console.log('index.html matches src/ ('+files.length+' files)');
}else{fs.writeFileSync(target,out);console.log('Built index.html from '+files.length+' files ('+(out.length/1024|0)+' KB)')}
