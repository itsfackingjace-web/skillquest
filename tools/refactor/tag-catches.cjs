// Gives every silent `catch(x){}` in src/*.js to the error reporter (core/000b): catch(e){} -> catch(e){self.SQERR&&SQERR(e,'<file>-<n>')}.
// <file> = the file's number prefix (e.g. 061, 111a2, 093b), <n> = the next number not used in that file yet, so existing tags never change.
// Idempotent: run it again after adding code. Leave a catch silent on purpose by writing catch(e){/*quiet*/}.
//   node tools/refactor/tag-catches.cjs [--dry]
const fs=require('fs'),path=require('path');const SRC=path.join(__dirname,'..','..','src');const dry=process.argv.includes('--dry');
const files=fs.readFileSync(path.join(SRC,'manifest.txt'),'utf8').split('\n').map(s=>s.trim()).filter(s=>s&&!s.startsWith('#')&&s.endsWith('.js'));
let total=0;
for(const f of files){if(/000b-error-reporter/.test(f))continue;const p=path.join(SRC,f);let s=fs.readFileSync(p,'utf8');
 const id=(path.basename(f).match(/^(\d+[a-z0-9]*?)-/)||[,path.basename(f,'.js').slice(0,8)])[1];
 const used=new Set([...s.matchAll(new RegExp("SQERR\\(\\w+,'"+id+"-(\\d+)'\\)","g"))].map(m=>+m[1]));let n=1,c=0;
 s=s.replace(/catch\((\w+)\)\{\}/g,(m,v)=>{while(used.has(n))n++;used.add(n);c++;return'catch('+v+'){self.SQERR&&SQERR('+v+",'"+id+'-'+n+"')}"});
 if(c){total+=c;if(!dry)fs.writeFileSync(p,s)}}
console.log((dry?'would tag ':'tagged ')+total+' catches');
