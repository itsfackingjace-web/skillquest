import json,sys;a=json.load(open(sys.argv[1]));b=json.load(open(sys.argv[2]))
bad=0
for n in a:
  for part in ['now','save']:
    d=[k for k in set(a[n][part])|set(b[n][part]) if a[n][part].get(k)!=b[n][part].get(k)]
    if d:bad=1;print(n,part,'differs in',d)
  o=[k for k in a[n] if k not in('now','save') and a[n][k]!=b[n][k]]
  if o:bad=1;print(n,'other',o)
print('IDENTICAL' if not bad else 'DIFFERENT')