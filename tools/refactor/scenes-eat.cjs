module.exports={
 hungry:async w=>{inv.cooked=3;inv.bread=2;P.hp=2;hunger=40;eat();await w(300)},
 full:async w=>{inv.cooked=3;P.hp=6;hunger=100;eat()},
 building:async w=>{inv.cooked=3;P.hp=2;inv.chest=1;startBuild('chest');eat()},
 fireRawFish:async w=>{XPS[4]=XT[30];inv.trout=4;inv.salmon=3;P.hp=6;fires.push({x:P.x+20,y:P.y,life:300});eat();await w(200)},
 fireOneFish:async w=>{XPS[4]=XT[30];inv.trout=2;P.hp=6;fires.push({x:P.x+20,y:P.y,life:300});eat();await w(3500)},
 potionsOnly:async w=>{for(const f of FOODS)inv[f.k]=0;inv.pot_heal=2;P.hp=2;eat()},
 twiceFast:async w=>{inv.cooked=3;inv.bread=3;P.hp=1;hunger=30;eat();await w(100);eat();await w(100)},
 fallen:async w=>{inv.cooked=3;P.hp=0;dead=true;eat();dead=false},
};
