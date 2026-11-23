import test from 'node:test';
import assert from 'node:assert/strict';
import {rng} from '../src/core/random.js';
import {makeWorld,TOTAL_FLOORS,biomeForFloor} from '../src/game/world.js';
import {freshMeta,saveMeta,loadMeta,SAVE_KEY} from '../src/game/persistence.js';
import {generateSoldier,statsFor,awardXp,resolveDowned,canPromote,promote} from '../src/game/units.js';
import {Game} from '../src/game/simulation.js';
const storage=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};};
test('geração procedural produz 100 mundos consistentes, objetivos e pontos essenciais',()=>{
 for(let seed=1;seed<=100;seed++){
  const w=makeWorld(seed*7331);assert.equal(w.sites.filter(s=>s.kind==='banner').length,2);
  assert.equal(w.sites.filter(s=>s.kind==='boss').length,1);
  assert.ok(w.sites.filter(s=>s.kind==='recruit').length>=2);
  assert.ok(w.sites.filter(s=>s.kind==='rest').length>=2);
  assert.ok(w.sites.filter(s=>s.kind==='shrine').length>=1);
  assert.ok(w.sites.every(s=>Math.abs(s.x)<=51&&Math.abs(s.z)<=51));
 }
});
test('soldado individual ganha XP e pode ser promovido sem duplicar custos',()=>{
 const r=rng(12345),s=generateSoldier(r,'s-1');const original=statsFor(s);awardXp(s,120);assert.ok(s.level>=3);
 assert.equal(canPromote(s),'veteran');const result=promote(s,100);assert.ok(result.ok);assert.equal(s.grade,'veteran');assert.ok(statsFor(s).hp>original.hp);
 assert.equal(promote(s,100).ok,false);
});
test('baixas resolvidas uma vez e mortalidade próxima dos parâmetros previstos',()=>{
 const r=rng(777);let deaths=0,wounds=0;for(let i=0;i<2500;i++){
  const s=generateSoldier(r,'s'+i);s.traitId='swift';s.condition='downed';s.hp=0;
  const result=resolveDowned(s,r,{infirmary:0});if(result==='dead')deaths++;if(result==='wounded')wounds++;
  assert.equal(resolveDowned(s,r,{infirmary:0}),null);
 }
 assert.ok(deaths>750&&deaths<1000,`baixas: ${deaths}`);assert.equal(wounds+deaths,2500);
});
test('salvamento tem versão, preserva progresso e não quebra com payload inválido',()=>{
 const s=storage(),data=freshMeta();data.legacy=77;saveMeta(data,s);assert.equal(loadMeta(s).legacy,77);
 s.setItem(SAVE_KEY,'{"version":-1}');assert.equal(loadMeta(s).legacy,3);
});
test('expedição completa: quartel, recrutamento, combate, 4 andares, recompensas e veteranos',()=>{
 const store=storage();globalThis.localStorage=store;
 const g=new Game();assert.equal(g.meta.roster.length,6);g.startRun();assert.ok(g.run);
 const run=g.run;assert.equal(run.soldiers.length,5);
 const site=run.world.sites.find(s=>s.kind==='recruit');run.commander.x=site.x;run.commander.z=site.z;
 g.useInteract();assert.equal(run.pending.type,'recruit');const cost=run.pending.cards[0].cost;g.chooseModal(0);assert.equal(run.coins,16-cost);assert.equal(run.soldiers.length,7);
 const shrine=run.world.sites.find(s=>s.kind==='shrine');run.commander.x=shrine.x;run.commander.z=shrine.z;g.useInteract();assert.equal(run.pending.type,'perk');g.chooseModal(0);assert.equal(run.perks.length,1);
 for(let floor=1;floor<=TOTAL_FLOORS;floor++){
  assert.equal(run.floor,floor);
  assert.equal(run.world.floor,floor);
  for(const flag of run.world.sites.filter(s=>s.kind==='banner')){
   run.commander.x=flag.x;run.commander.z=flag.z;g.spawnGroup(flag);
   for(const e of run.enemies.filter(e=>e.groupId===flag.id))e.hp=0;
   g.tick(1/30);if(run.pending?.type==='perk')g.chooseModal(0);
  }
  assert.equal(run.banners,2);
  const boss=run.world.sites.find(s=>s.kind==='boss');run.commander.x=boss.x;run.commander.z=boss.z;g.spawnGroup(boss);
  assert.ok(run.enemies.some(e=>e.boss));for(const e of run.enemies.filter(e=>e.groupId===boss.id))e.hp=0;
  g.tick(1/30);
  if(floor<TOTAL_FLOORS){assert.equal(run.pending?.type,'floor');assert.equal(run.pending.cards.length,3);g.chooseModal(floor%3);assert.equal(run.floor,floor+1);assert.equal(run.banners,0);assert.equal(run.commander.x,0);assert.equal(run.pending,null);}
 }
 assert.equal(run.finished,true);assert.equal(run.finalResult.type,'victory');assert.equal(run.finalResult.floors,TOTAL_FLOORS);
 assert.ok(g.meta.legacy>3);assert.equal(g.meta.wins,1);
 g.keepRecruit(run.finalResult.returnables[0].id);assert.equal(g.meta.roster.length,7);
 g.returnBarracks();assert.equal(g.run,null);assert.equal(g.meta.activeRun,null);
 const g2=new Game();assert.equal(g2.meta.wins,1);assert.equal(g2.meta.roster.length,7);
});
test('habilidades de comando consomem recarga e são diferentes entre comandantes',()=>{
 globalThis.localStorage=storage();const g=new Game();g.startRun();g.activateAbility(1);assert.ok(g.run.commander.buff>0);assert.ok(g.run.commander.ability1>0);
 const cd=g.run.commander.ability1;g.activateAbility(1);assert.equal(g.run.commander.ability1,cd);
});
test('IA de batalha causa dano sem intervenção do jogador',()=>{
 globalThis.localStorage=storage();const g=new Game();g.startRun();const site=g.run.world.sites.find(s=>s.kind==='patrol');
 g.run.commander.x=site.x;g.run.commander.z=site.z;
 for(let i=0;i<g.run.soldiers.length;i++){g.run.soldiers[i].x=site.x+(i%3-1);g.run.soldiers[i].z=site.z+3+Math.floor(i/3);}
 g.spawnGroup(site);const initial=g.run.enemies.reduce((a,e)=>a+e.hp,0);
 for(let i=0;i<30*8;i++){g.tick(1/30);if(g.run.pending||g.run.finished)break;}
 const remaining=g.run.enemies.reduce((a,e)=>a+Math.max(0,e.hp),0);
 assert.ok(remaining<initial,`dano: ${initial} -> ${remaining}`);
});
test('ferido recém-chegado da expedição não se recupera instantaneamente',()=>{
 globalThis.localStorage=storage();const g=new Game();g.startRun();const s=g.run.soldiers[0];s.condition='downed';s.hp=0;g.r.next=()=>0;
 g.finish('retreat');const returned=g.meta.roster.find(a=>a.id===s.id);assert.equal(returned.condition,'wounded');assert.equal(returned.recoveryRunsRemaining,1);
});

test('não há softlock quando todos os soldados do quartel morrem',()=>{
 globalThis.localStorage=storage();const g=new Game();g.startRun();g.finish('defeat');g.meta.roster=[];g.returnBarracks();assert.ok(g.meta.roster.some(s=>s.condition==='healthy'));assert.ok(g.meta.selectedIds.length>0);
});

test('comandante rápido e tropa alcança a formação durante a marcha',()=>{
 globalThis.localStorage=storage();const g=new Game();g.startRun();
 const r=g.run;r.world.sites=[];r.enemies=[];
 assert.ok(r.commander.speed>=7.5);
 assert.ok(r.soldiers.every(s=>statsFor(s).speed>=5.5));
 g.input={x:0,z:1};
 for(let t=0;t<30;t++)g.tick(1/30);
 assert.ok(r.commander.x>5.2&&r.commander.z>5.2,`comandante: ${r.commander.x.toFixed(1)}, ${r.commander.z.toFixed(1)}`);
 // Sem teleporte e sem deixar o esquadrão abandonado para trás.
 for(let t=0;t<90;t++)g.tick(1/30);
 assert.ok(r.soldiers.every(s=>Math.hypot(s.x-r.commander.x,s.z-r.commander.z)<10),
   `distâncias: ${r.soldiers.map(s=>Math.hypot(s.x-r.commander.x,s.z-r.commander.z).toFixed(1))}`);
});

test('modelos procedurais possuem poses distintas e geometria válida',async()=>{
 const {addActor,addActorLite}=await import('../src/render/geometry.js');
 const {DEFAULT_CAMERA_ZOOM,CAMERA_ZOOM_LIMITS}=await import('../src/render/renderer.js');
 assert.ok(DEFAULT_CAMERA_ZOOM<17&&CAMERA_ZOOM_LIMITS.min<DEFAULT_CAMERA_ZOOM);
 const u={id:'commander',team:'ally',classId:'swordsman',grade:'elite',x:0,z:0,face:.3,phase:2,flash:0,anim:0,walk:false,condition:'healthy'};
 const idle=[],idleLater=[],walk=[],strike=[],far=[];
 addActor(idle,u,0);addActor(idleLater,u,1.1);
 addActor(walk,{...u,walk:true},1.1);
 addActor(strike,{...u,anim:.24},1.1);
 addActorLite(far,{...u,walk:true,anim:.24},1.1);
 assert.ok(idle.length>0&&far.length>0&&far.length<idle.length);
 assert.equal(idle.length,idleLater.length);
 assert.equal(idle.length,walk.length);
 assert.ok([idle,idleLater,walk,strike,far].every(a=>a.every(Number.isFinite)));
 assert.notDeepEqual(idle,idleLater,'animação de respiração em repouso');
 assert.notDeepEqual(idleLater,walk,'animação de pernas e braços na caminhada');
 assert.notDeepEqual(idleLater,strike,'animação da arma no golpe');
});

// Regressões v0.3 — interação direta do comandante, esquiva e progressão roguelite.
test('comandante ataca manualmente no arco frontal com recarga e feedback',()=>{
 globalThis.localStorage=storage();const g=new Game();g.startRun();const flag=g.run.world.sites.find(s=>s.kind==='banner');g.spawnGroup(flag);const e=g.run.enemies[0];g.run.commander.x=e.x;g.run.commander.z=e.z-2;
 const original=g.run.enemies.reduce((sum,e)=>sum+e.hp,0);assert.equal(g.basicAttack(),true);assert.ok(g.run.enemies.reduce((sum,e)=>sum+e.hp,0)<original);assert.equal(g.basicAttack(),false);assert.ok(g.run.fx.some(x=>x.type==='slash'));g.tick(.56);assert.equal(g.basicAttack(),true);
});
test('esquiva desloca, concede invulnerabilidade temporária e tem cooldown',()=>{
 globalThis.localStorage=storage();const g=new Game();g.startRun();const c=g.run.commander;g.input={x:0,z:1};const before=c.x;assert.equal(g.dodge(),true);assert.ok(c.x>before+3);assert.ok(c.invuln>0);const oldHp=c.hp;g.hurt(c,90,{id:'foe',team:'enemy'});assert.equal(c.hp,oldHp);assert.equal(g.dodge(),false);
});
test('todos os andares têm nomes distintos e geram cenários válidos',()=>{
 assert.equal(TOTAL_FLOORS,4);const names=[];for(let floor=1;floor<=TOTAL_FLOORS;floor++){const w=makeWorld(7331+floor,floor);names.push(biomeForFloor(floor).name);assert.equal(w.floor,floor);assert.ok(w.details.length>300);assert.ok(w.biome.ground.length===3);assert.equal(w.sites.filter(s=>s.kind==='banner').length,2);}assert.equal(new Set(names).size,TOTAL_FLOORS);
});
