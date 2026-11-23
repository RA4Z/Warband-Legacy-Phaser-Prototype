// Simulação leve de bot para medir a possibilidade de concluir a campanha com combate automático.
import {Game} from '../src/game/simulation.js';
import {distance} from '../src/core/random.js';
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
const samples=Number(process.argv[2]||5);const results=[];
for(let trial=0;trial<samples;trial++){
 storage.clear();const g=new Game();const clock=Date.now;Date.now=()=>1763920000000+trial*8999;g.startRun();Date.now=clock;const r=g.run;let target=null,counter=0;
 for(let i=0;i<24000&&!r.finished;i++){
   if(r.pending){g.chooseModal(0);continue;}
   const flags=r.world.sites.filter(s=>s.kind==='banner'&&!s.done);
   const recruits=r.world.sites.filter(s=>s.kind==='recruit'&&!s.done);const rests=r.world.sites.filter(s=>s.kind==='rest'&&!s.done);const caches=r.world.sites.filter(s=>s.kind==='cache'&&!s.done);const needRest=r.commander.hp<r.commander.maxHp*.54;target=(recruits.length&&r.soldiers.length<11&&r.coins>=9?recruits[0]:needRest&&rests.length&&r.supplies>0?rests[0]:r.coins<9&&caches.length?caches[0]:flags.length?flags.sort((a,b)=>distance(a,r.commander)-distance(b,r.commander))[0]:r.world.sites.find(s=>s.kind==='boss'));
   if(!target)break;
   if(!['banner','patrol','boss'].includes(target.kind)&&distance(target,r.commander)<3.8)g.useInteract();
   const dx=target.x-r.commander.x,dz=target.z-r.commander.z,d=Math.hypot(dx,dz),vx=d>(['banner','patrol','boss'].includes(target.kind)?5:2.6)?dx/d:0,vz=d>(['banner','patrol','boss'].includes(target.kind)?5:2.6)?dz/d:0;
   g.input.x=(vx-vz)*Math.SQRT1_2;g.input.z=(vx+vz)*Math.SQRT1_2;
   if(r.enemies.some(e=>e.hp>0&&distance(e,r.commander)<11)){
     if(r.commander.ability1<=0)g.activateAbility(1);
     if(r.commander.ability2<=0)g.activateAbility(2);
   }
   g.tick(1/30);counter++;
 }
 results.push({trial:trial+1,type:r.finalResult?.type||'timeout',time:Math.round(r.elapsed),banners:r.banners,kills:r.kills,dead:r.dead,wounded:r.wounded,hp:Math.round(r.commander.hp)});
}
console.table(results.slice(0,Math.min(12,results.length)));
const wins=results.filter(x=>x.type==='victory'),losses=results.filter(x=>x.type==='defeat'),timeouts=results.filter(x=>x.type==='timeout');
console.log(`Vitórias: ${wins.length}/${samples} | Derrotas: ${losses.length} | Timeouts: ${timeouts.length}`);
console.log(`Média da duração: ${(results.reduce((a,b)=>a+b.time,0)/samples).toFixed(1)} segundos; baixas médias: ${(results.reduce((a,b)=>a+b.dead,0)/samples).toFixed(2)}`);
