import {rng,clamp,distance} from '../core/random.js';
import {CLASSES,COMMANDERS,ENEMIES,PERKS,UPGRADE_DATA,GRADE_COST} from './data.js';
import {generateSoldier,statsFor,awardXp,resolveDowned,healSoldier,maxRoster,canPromote,promote} from './units.js';
import {makeWorld,nearestSite,TOTAL_FLOORS,biomeForFloor} from './world.js';
import {freshMeta,loadMeta,saveMeta,clearSave} from './persistence.js';

const FIXED=1/30;
const alive=u=>u&&u.hp>0&&u.state!=='dead'&&u.condition!=='dead'&&u.condition!=='downed'&&u.condition!=='wounded';
const pick3=(items,r)=>{let a=[...items],result=[];for(let i=0;i<3&&a.length;i++)result.push(a.splice(r.int(0,a.length-1),1)[0]);return result;};
export class Game {
 constructor(){this.meta=loadMeta();this.run=this.meta.activeRun||null;this.listeners=new Set();this.input={x:0,z:0};this.frameAccumulator=0;this.saveAccumulator=0;this.lastNote='';this.now=0;this.r=this.run?rng(this.run.rngState):null;this.sfx=null;
  // Migração sem apagar quartel ou veteranos dos saves feitos com a v0.2.
  if(this.run&&!this.run.floor&&!this.run.finished){const run=this.run;run.floor=1;run.maxFloors=TOTAL_FLOORS;run.floorsCleared=0;run.banners=0;run.world=makeWorld(run.seed,1);run.groupStats={};run.enemies=[];run.projectiles=[];run.fx=[];run.pending=null;run.spawnCooldown=3;run.commander.x=0;run.commander.z=0;run.commander.dodge=0;run.commander.invuln=0;run.soldiers.forEach((unit,i)=>{unit.x=(i%5-2)*1.4;unit.z=2+Math.floor(i/5)*1.5;});this.persist();}
  if(this.run&&!this.run.finished){this.run.commander.dodge??=0;this.run.commander.invuln??=0;}}
 onChange(cb){this.listeners.add(cb);return ()=>this.listeners.delete(cb);}
 notify(event='update',data={}){for(const fn of this.listeners)fn(event,data);}
 persist(){if(this.run)this.run.rngState=this.r.state;this.meta.activeRun=this.run;saveMeta(this.meta);}
 msg(text){this.lastNote=text;this.notify('toast',{text});}
 selectSoldier(id){const s=this.meta.roster.find(s=>s.id===id);if(!s)return;const ids=this.meta.selectedIds; if(ids.includes(id)){if(ids.length>1)this.meta.selectedIds=ids.filter(x=>x!==id);}else if(ids.length<5&&s.condition==='healthy')ids.push(id);else{this.msg(s.condition!=='healthy'?'Soldado ferido: trate-o primeiro.':'Máximo de 5 soldados iniciais.');return;}this.persist();this.notify('barracks');}
 changeCommander(id){if(!COMMANDERS[id])return;this.meta.commander=id;this.persist();this.notify('barracks');}
 buyUpgrade(id){const d=UPGRADE_DATA[id],lvl=this.meta.upgrades[id];if(!d||lvl>=d.max||this.meta.legacy<d.cost[lvl]){this.msg('Insígnias insuficientes ou melhoria no máximo.');return;}this.meta.legacy-=d.cost[lvl];this.meta.upgrades[id]++;this.persist();this.notify('barracks');}
 upgradeSoldier(id){const s=this.meta.roster.find(s=>s.id===id);if(!s)return;const next=canPromote(s);if(!next){this.msg('É preciso ganhar níveis antes de promover.');return;}const result=promote(s,this.meta.legacy);if(!result.ok){this.msg(`Promoção exige ${GRADE_COST[next]} insígnias.`);return;}this.meta.legacy-=result.cost;this.msg(`${s.name} foi promovido!`);this.persist();this.notify('barracks');}
 recoverSoldier(id){const s=this.meta.roster.find(s=>s.id===id);if(!s||s.condition!=='wounded')return;if(this.meta.legacy<2){this.msg('A recuperação custa 2 insígnias.');return;}this.meta.legacy-=2;healSoldier(s);this.persist();this.notify('barracks');this.msg(`${s.name} recebeu alta.`);}
 startRun(){if(this.run){this.msg('Você já tem uma expedição ativa.');return;}const chosen=this.meta.selectedIds.map(id=>this.meta.roster.find(s=>s.id===id)).filter(s=>s?.condition==='healthy').slice(0,5);if(!chosen.length){this.msg('Selecione ao menos um soldado saudável.');return;}
  const number=++this.meta.runNumber,seed=(((Date.now()>>>0)^(number*1664525))>>>0)||42;this.r=rng(seed);
  const world=makeWorld(seed,1),soldiers=chosen.map((s,i)=>({...structuredClone(s),x:(i%3-1)*1.7,z:1.8+Math.floor(i/3)*1.7,team:'ally',attackClock:.1*i,flash:0,anim:0,phase:i*.8,face:0,state:'active',isCore:true}));
  const maxHP=Math.round(360*(1+this.meta.upgrades.command*.08));
  this.run={id:`run-${number}`,number,seed,rngState:this.r.state,world,elapsed:0,floor:1,maxFloors:TOTAL_FLOORS,floorsCleared:0,banners:0,spawnCooldown:0,commanderId:this.meta.commander,commander:{id:'commander',name:COMMANDERS[this.meta.commander].name,team:'ally',x:0,z:0,hp:maxHP,maxHp:maxHP,attack:22,defense:14,range:2.1,cooldown:1.04,speed:7.8,attackClock:0,ability1:0,ability2:0,dodge:0,invuln:0,buff:0,shield:0,flash:0,anim:0,phase:0,face:0,condition:'healthy',state:'active',level:3,grade:'elite',classId:'swordsman'},soldiers,enemies:[],projectiles:[],fx:[],groupStats:{},order:'follow',formation:'balanced',focusId:null,perks:[],coins:16,supplies:2,revives:0,kills:0,encounters:0,wounded:0,dead:0,earnedLegacy:0,pending:null,finished:false,lastEnemyCount:0,log:[],runRecruits:[],victory:false};
  this.meta.activeRun=this.run;this.persist();this.notify('runStarted');this.msg('Andar 1: Bosque de Arven. Capture os dois estandartes para abrir o portal!');}
 get nearest(){return this.run?nearestSite(this.run.world,this.run.commander.x,this.run.commander.z,s=>!s.done):null;}
 get nearby(){if(!this.run)return null;return this.run.world.sites.filter(s=>!s.done&&!s.started||s.kind==='home').filter(s=>distance(s,this.run.commander)<4.1).sort((a,b)=>distance(a,this.run.commander)-distance(b,this.run.commander))[0]||null;}
 setOrder(order){if(!this.run)return;if(!['follow','defend','retreat','focus'].includes(order))return;this.run.order=order;this.run.defendAt=order==='defend'?{x:this.run.commander.x,z:this.run.commander.z}:null;this.msg({follow:'Tropas seguindo o comandante.',defend:'Tropas defendendo esta posição.',retreat:'Reagrupando: combatentes retornam.',focus:'Tropas concentradas no alvo mais próximo.'}[order]);this.persist();}
 changeFormation(){if(!this.run)return;this.run.formation=this.run.formation==='balanced'?'defensive':'balanced';this.msg(this.run.formation==='defensive'?'Formação defensiva.':'Formação equilibrada.');this.persist();}
 activateAbility(which){const run=this.run;if(!run||run.pending||run.finished)return;const c=run.commander;if(c.hp<=0)return;const key=which===1?'ability1':'ability2';if(c[key]>0)return;c[key]=which===1?19:13;c.anim=.48;
  if(run.commanderId==='iron'){
   if(which===1){c.buff=7;for(const s of run.soldiers){if(!alive(s)||distance(s,c)>15)continue;s.buff=7;}this.msg('Brado: +35% de dano por 7 segundos!');}
   else{for(const e of run.enemies){if(alive(e)&&distance(c,e)<8)this.hurt(e,48,c);}run.fx.push({type:'burst',x:c.x,z:c.z,t:0,ttl:.6,range:8,color:'#ffd18d'});this.msg('Golpe heroico!');}
  }else{
   if(which===1){c.shield=8;for(const s of run.soldiers){if(alive(s)&&distance(s,c)<16)s.shield=8;}this.msg('Proteção: dano reduzido por 8 segundos.');}
   else{const target=run.enemies.filter(alive).sort((a,b)=>distance(a,c)-distance(b,c))[0];if(!target||distance(target,c)>22){c[key]=0;this.msg('Nenhum inimigo próximo para a saraivada.');return;}for(const e of run.enemies){if(alive(e)&&distance(e,target)<5)this.hurt(e,50,c);}run.fx.push({type:'burst',x:target.x,z:target.z,t:0,ttl:.6,range:5,color:'#87d3cf'});this.msg('Saraivada arcana!');}
  }this.notify('ability');this.persist();}
 pickFloorRewards(){const r=this.r;const perks=pick3(PERKS.filter(p=>this.run.perks.filter(x=>x===p.id).length<2),r);return [
   {id:'field-hospital',icon:'✚',name:'Trégua dos Veteranos',desc:'Recupere 40% da vida do comandante e das tropas; +2 suprimentos.'},
   {id:'war-chest',icon:'◈',name:'Espólio do Guardião',desc:'+40 moedas e +3 suprimentos para o próximo andar.'},
   {id:'war-blessing',icon:'✦',name:'Bênção da Companhia',desc:`Ganhe ${perks[0]?.name||'Investida Coordenada'} pelo restante da expedição.`,perk:perks[0]?.id||'charge'}
  ];}
 advanceFloor(choice){const run=this.run;if(!run?.pending||run.pending.type!=='floor'||run.floor>=TOTAL_FLOORS)return false;
  if(choice.id==='field-hospital'){run.commander.hp=Math.min(run.commander.maxHp,run.commander.hp+Math.round(run.commander.maxHp*.40));for(const s of run.soldiers){if(s.condition==='healthy')s.hp=Math.min(this.getStats(s).hp,s.hp+Math.round(this.getStats(s).hp*.40));}run.supplies+=2;}
  else if(choice.id==='war-chest'){run.coins+=40;run.supplies+=3;}
  else if(choice.id==='war-blessing'){run.perks.push(choice.perk);}
  run.floor++;run.banners=0;run.world=makeWorld((run.seed^(run.floor*2654435761))>>>0,run.floor);run.enemies=[];run.projectiles=[];run.fx=[];run.groupStats={};run.spawnCooldown=3;run.commander.x=0;run.commander.z=0;run.commander.face=0;run.commander.invuln=2;
  run.soldiers.forEach((s,i)=>{if(s.condition==='healthy'){s.x=(i%5-2)*1.5;s.z=2+Math.floor(i/5)*1.5;s.walk=false;}});
  run.pending=null;this.frameAccumulator=0;this.persist();this.notify('floorAdvanced');this.msg(`ANDAR ${run.floor}/${TOTAL_FLOORS} — ${biomeForFloor(run.floor).name}. Inimigos mais perigosos!`);return true;
 }
 basicAttack(){const r=this.run;if(!r||r.finished||r.pending)return false;const c=r.commander;if(!alive(c)||(c.attackClock||0)>0)return false;
  c.attackClock=.55;c.anim=.48;let facing=c.face||0;const near=r.enemies.filter(alive).filter(e=>distance(e,c)<4.2).sort((a,b)=>distance(a,c)-distance(b,c));
  if(near.length){const t=near[0];facing=Math.atan2(t.x-c.x,t.z-c.z);c.face=facing;}
  let hits=0;for(const e of near){const angle=Math.atan2(e.x-c.x,e.z-c.z);if(Math.cos(angle-facing)<.28)continue;this.hurt(e,this.getAttack(c)*(hits===0?1.22:.77),c);hits++;if(hits===3)break;}
  const x=c.x+Math.sin(facing)*1.6,z=c.z+Math.cos(facing)*1.6;r.fx.push({type:'slash',x,z,t:0,ttl:.30,range:1.8,face:facing,color:hits?'#ffe8a3':'#a4e8d8'});this.notify('attack');return true;
 }
 dodge(){const r=this.run;if(!r||r.pending||r.finished)return false;const c=r.commander;if(!alive(c)||(c.dodge||0)>0)return false;const sx=this.input.x,sz=this.input.z;let vx=(sx+sz)*Math.SQRT1_2,vz=(sz-sx)*Math.SQRT1_2;let n=Math.hypot(vx,vz);if(n<.1){vx=Math.sin(c.face);vz=Math.cos(c.face);n=1;}c.x=clamp(c.x+vx/n*4.7,-49,49);c.z=clamp(c.z+vz/n*4.7,-49,49);c.dodge=4.5;c.invuln=.45;c.anim=.15;r.fx.push({type:'dash',x:c.x,z:c.z,t:0,ttl:.32,range:2.4,color:'#b4f2d3'});this.notify('dodge');return true;}
 useInteract(){const run=this.run;if(!run||run.pending)return;const site=this.nearby;if(!site){this.msg('Aproxime-se de um marcador para interagir.');return;}
  if(site.kind==='home'){if(run.banners===0){this.msg('Conquiste um estandarte para liberar a retirada.');return;}this.finish('retreat');return;}
  if(site.kind==='boss'){this.msg(run.banners<2?`Faltam ${2-run.banners} estandartes.`:'O portal está aberto. Derrote o Guardião do Andar!' );return;}
  if(site.kind==='banner'||site.kind==='patrol'){this.msg('Derrote os inimigos da região para conquistar este posto.');return;}
  if(site.kind==='cache'){site.done=true;run.coins+=12;run.supplies+=2+(run.perks.includes('supplies')?1:0);this.msg('+12 moedas e suprimentos encontrados!');this.notify('loot');}
  if(site.kind==='rest'){if(run.supplies<1){this.msg('É necessário 1 suprimento para descansar.');return;}run.supplies--;run.commander.hp=Math.min(run.commander.maxHp,run.commander.hp+95);for(const s of run.soldiers){if(s.condition==='healthy')s.hp=Math.min(statsFor(s,run.perks).hp,s.hp+Math.round(statsFor(s).hp*.55));else if(s.condition==='wounded'){healSoldier(s);}}site.done=true;this.msg('A companhia descansou e os feridos receberam tratamento.');}
  if(site.kind==='recruit'){run.pending={type:'recruit',siteId:site.id,cards:this.pickRecruits(),paid:false};this.notify('modal');return;}
  if(site.kind==='shrine'){run.pending={type:'perk',siteId:site.id,cards:pick3(PERKS.filter(p=>run.perks.filter(x=>x===p.id).length<2),this.r)};this.notify('modal');return;}
  this.persist();this.notify('state');
 }
 pickRecruits(){const classes=Object.keys(CLASSES);return [0,1,2].map((i)=>({classId:classes[this.r.int(0,classes.length-1)],count:i===2?1:2,cost:i===2?5:9}));}
 chooseModal(index){const run=this.run;if(!run?.pending)return;const modal=run.pending,card=modal.cards[index];if(!card)return;
  if(modal.type==='floor'){this.advanceFloor(card);return;}
  if(modal.type==='perk'){run.perks.push(card.id);const site=run.world.sites.find(s=>s.id===modal.siteId);if(site)site.done=true;this.msg(`${card.name} foi adicionada à expedição!`);}
  else if(modal.type==='recruit'){if(run.coins<card.cost){this.msg('Moedas de campo insuficientes.');return;}const active=run.soldiers.filter(s=>s.condition==='healthy').length;if(active+card.count>40){this.msg('Limite de 40 soldados ativos.');return;}run.coins-=card.cost;
    for(let i=0;i<card.count;i++){const id=`soldier-${this.meta.nextId++}`,s=generateSoldier(this.r,id,run.id);s.classId=card.classId;s.hp=statsFor(s).hp;Object.assign(s,{x:run.commander.x+this.r.next()*3-1.5,z:run.commander.z+this.r.next()*3-1.5,team:'ally',attackClock:0,flash:0,anim:0,phase:this.r.next()*6,face:0,state:'active',isCore:false});run.soldiers.push(s);run.runRecruits.push(s.id);}
    const site=run.world.sites.find(s=>s.id===modal.siteId);if(site)site.done=true;this.msg(`${card.count} ${CLASSES[card.classId].name}(s) se juntaram à companhia!`);
  }
  run.pending=null;this.persist();this.notify('modalClosed');}
 getStats(s){return statsFor(s,this.run?.perks||[],this.meta.upgrades.academy);}
 getAttack(u){if(u.team==='enemy')return u.attack;const base=u.id==='commander'?u.attack:this.getStats(u).attack;let mul=1;if(u.buff>0)mul*=1.35;if(this.run?.perks.includes('fury')&&u.hp<(u.maxHp||this.getStats(u).hp)*.4)mul*=1.2;return base*mul;}
 hurt(target,raw,source){if(!alive(target)||target.invuln>0)return;const armor=target.team==='enemy'?target.defense:target.id==='commander'?target.defense:this.getStats(target).defense;const buff=target.shield>0?.7:1;const damage=Math.max(1,Math.round(raw*(.91+this.r.next()*.18)*100/(100+armor)*buff));target.hp=Math.max(0,target.hp-damage);target.flash=.13;if(this.sfx&&this.now-(this._lastHit||-1)>.27){this.sfx.play('hit');this._lastHit=this.now;}this.run.fx.push({type:'number',x:target.x,z:target.z,t:0,ttl:.6,amount:damage,color:target.team==='ally'?'#ffac9d':'#fff1c4'});this.run.fx.push({type:'sparks',x:target.x,z:target.z,t:0,ttl:.28,range:.72,color:target.team==='enemy'?'#ffd58e':'#e88d7a'});if(target.hp<=0){if(target.id==='commander'){target.state='dead';this.finish('defeat');return;}if(target.team==='ally'){target.condition='downed';target.state='downed';target.anim=1;}else{target.state='dead';target.anim=1;this.run.kills++;if(source?.id&&source.id!=='commander'&&source.team==='ally'){const owner=this.run.soldiers.find(s=>s.id===source.id);if(owner)owner.kills++;}}}}
 launchProjectile(source,target,amount,healing=false){const r=this.run;if(!r)return;r.projectiles.push({x:source.x,z:source.z,y:healing?1.3:1.6,targetId:target.id,sourceId:source.id,amount,healing,speed:healing?15:21,ttl:2.4,color:healing?'#91efd3':source.classId==='mystic'?'#caa4ff':source.team==='enemy'?'#e7a19a':'#f7d89d'});}
 resolveGroup(groupId){const run=this.run;const group=run.groupStats[groupId];if(!group||group.completed)return;group.completed=true;const site=run.world.sites.find(s=>s.id===groupId);if(!site)return;site.done=true;run.encounters++;
  if(site.kind==='banner'){run.banners++;run.earnedLegacy+=2;this.msg(`Estandarte conquistado! ${run.banners}/2 — andar ${run.floor}. +2 insígnias.`);}
  else if(site.kind==='boss'){run.earnedLegacy+=7;run.floorsCleared=run.floor;if(run.floor>=TOTAL_FLOORS){this.finish('victory');return;}run.pending={type:'floor',cards:this.pickFloorRewards()};run.enemies=[];run.projectiles=[];run.fx=[];this.persist();this.notify('modal');this.msg(`Andar ${run.floor} superado! Escolha uma recompensa para prosseguir.`);return;}
  else this.msg(`Patrulha derrotada! ${run.encounters} vitórias de encontro.`);
  const reward=Math.round((site.kind==='banner'?15:9)*(run.perks.includes('loot')?1.2:1));run.coins+=reward;
  for(const s of run.soldiers){if(s.condition==='healthy'&&distance(s,site)<27){s.battles++;awardXp(s,10+(run.perks.includes('xp')?3:0)+this.meta.upgrades.academy*1);}}
  for(const s of run.soldiers){const result=resolveDowned(s,this.r,this.meta.upgrades);if(result){run[result]++;if(result==='dead')this.msg(`${s.name} tombou em batalha. Seu legado será lembrado.`);else this.msg(`${s.name} sobreviveu, mas está ferido.`);}}
  if(run.encounters%2===0&&site.kind!=='boss'&&!run.pending){run.pending={type:'perk',siteId:null,cards:pick3(PERKS.filter(p=>run.perks.filter(x=>x===p.id).length<2),this.r)};this.notify('modal');}
  this.persist();this.notify('encounter');}
 spawnGroup(site){if(site.started||site.done)return;const run=this.run;if(site.kind==='boss'&&run.banners<2)return;site.started=true;site.groupId=site.id;run.groupStats[site.id]={completed:false};const count=(site.kind==='boss'?9:site.kind==='banner'?4+run.floor:3+Math.floor(run.floor/2));
  let types=['raider','raider','marksman','brute','shaman'];if(site.kind==='boss')types=['brute','raider','marksman','shaman','brute','marksman','raider','shaman','warlord'];
  for(let i=0;i<count;i++){const type=site.kind==='boss'?types[i]:types[this.r.int(0,types.length-1)];const offset=(i/count)*Math.PI*2,rad=1.4+(i%3)*.8;const e=ENEMIES[type];const foe=importedEnemy(this.r,`enemy-${this.meta.nextId++}`,type,site.x+Math.cos(offset)*rad,site.z+Math.sin(offset)*rad,site.id);const scale=1+(run.floor-1)*.21;foe.hp=Math.round(foe.hp*scale);foe.maxHp=foe.hp;foe.attack=Math.round(foe.attack*(1+(run.floor-1)*.16));foe.level=run.floor;run.enemies.push(foe);}
  this.notify('encounterStarted');this.msg(site.kind==='boss'?'O Lorde da Cinza surgiu!':'Inimigos à frente!');}
 update(delta){const r=this.run;if(!r||r.finished||r.pending)return;this.frameAccumulator=Math.min(this.frameAccumulator+Math.min(delta,.12),.27);while(this.frameAccumulator>=FIXED){this.tick(FIXED);this.frameAccumulator-=FIXED;if(!this.run||this.run.finished)break;}
  this.saveAccumulator+=delta;if(this.saveAccumulator>4){this.saveAccumulator=0;this.persist();}}
 tick(dt){const run=this.run;if(!run)return;const rr=this.r;run.elapsed+=dt;this.now=run.elapsed;const commander=run.commander;
  commander.ability1=Math.max(0,commander.ability1-dt);commander.ability2=Math.max(0,commander.ability2-dt);commander.dodge=Math.max(0,(commander.dodge||0)-dt);commander.invuln=Math.max(0,(commander.invuln||0)-dt);
  for(const a of [commander,...run.soldiers,...run.enemies]){a.attackClock=Math.max(0,(a.attackClock||0)-dt);a.flash=Math.max(0,(a.flash||0)-dt);a.anim=Math.max(0,(a.anim||0)-dt);a.buff=Math.max(0,(a.buff||0)-dt);a.shield=Math.max(0,(a.shield||0)-dt);a.phase=(a.phase||0)+dt*(a.walk?9.4:3.8);}
  const sx=this.input.x,sz=this.input.z;const mx=(sx+sz)*Math.SQRT1_2,mz=(sz-sx)*Math.SQRT1_2,n=Math.hypot(mx,mz);if(n>.02){const vx=mx/n,vz=mz/n;commander.x=clamp(commander.x+vx*commander.speed*dt,-49,49);commander.z=clamp(commander.z+vz*commander.speed*dt,-49,49);commander.face=Math.atan2(vx,vz);commander.walk=true;}else commander.walk=false;
  run.spawnCooldown=Math.max(0,(run.spawnCooldown||0)-dt);if(run.spawnCooldown===0&&!run.enemies.some(e=>alive(e)&&distance(e,commander)<18)&&run.enemies.filter(alive).length<24){const ready=run.world.sites.filter(site=>!site.done&&!site.started&&['banner','patrol','boss'].includes(site.kind)&&distance(commander,site)<10.5).sort((a,b)=>distance(commander,a)-distance(commander,b))[0];if(ready){this.spawnGroup(ready);run.spawnCooldown=4;}}
  for(let i=0;i<run.soldiers.length;i++){const s=run.soldiers[i];if(!alive(s))continue;const st=this.getStats(s),targets=run.enemies.filter(e=>alive(e)&&distance(s,e)<(run.order==='retreat'?8:15));const target=targets.sort((a,b)=>{if(run.order==='focus'&&run.focusId){if(a.id===run.focusId)return -1;if(b.id===run.focusId)return 1;}return distance(a,s)-distance(b,s);})[0];const anchor=run.order==='defend'&&run.defendAt?run.defendAt:commander;
   const slot=formationSlot(run.soldiers,s,run.formation,commander.face);let desired={x:anchor.x+slot.x,z:anchor.z+slot.z};let d=distance(s,desired),attackTarget=null;
   if(run.order!=='retreat'&&target&&(run.order!=='defend'||distance(target,anchor)<13)){attackTarget=target;const reach=st.range;const td=distance(s,target);if(td>Math.min(reach*.86,reach-0.3))desired={x:target.x+(s.x-target.x)/(td||1)*Math.max(.8,reach*.72),z:target.z+(s.z-target.z)/(td||1)*Math.max(.8,reach*.72)};else desired={x:s.x,z:s.z};}
   // Reagrupamento elástico: soldados alcançam o comandante veloz sem teleporte.
   const gap=distance(s,desired);
   const catchup=gap>8?2.35:gap>4?1.72:gap>2?1.2:1;const step=moveUnit(s,desired.x,desired.z,st.speed*catchup,dt,commander,run.enemies);s.walk=step;
   if(s.classId==='healer'&&s.attackClock<=0){const nearby=[run.commander,...run.soldiers].filter(u=>alive(u)&&distance(u,s)<st.range);const wounded=nearby.filter(u=>u.hp<(u.id==='commander'?u.maxHp:this.getStats(u).hp)*.84).sort((a,b)=>a.hp/(a.id==='commander'?a.maxHp:this.getStats(a).hp)-b.hp/(b.id==='commander'?b.maxHp:this.getStats(b).hp))[0];if(wounded){s.attackClock=st.cooldown;s.anim=.48;this.launchProjectile(s,wounded,Math.round(18*(run.perks.includes('healing')?1.15:1)),true);}}
   if(attackTarget&&distance(s,attackTarget)<st.range+.25&&s.attackClock<=0){s.attackClock=st.cooldown;s.anim=.48;if(st.range>3){this.launchProjectile(s,attackTarget,this.getAttack(s));}else{this.hurt(attackTarget,this.getAttack(s),s);} }
  }
  for(const e of run.enemies){if(!alive(e))continue;const target=[...run.soldiers,commander].filter(alive).filter(u=>distance(e,u)<22).sort((a,b)=>{const priority=u=>u.id==='commander'?1.6:u.classId==='guardian'?.65:u.classId==='spearman'?.85:['archer','mystic','healer'].includes(u.classId)?1.25:1;return distance(a,e)*priority(a)-distance(b,e)*priority(b);})[0];if(!target){e.walk=false;continue;}const d=distance(e,target);if(d>e.range*.83){e.walk=moveUnit(e,target.x,target.z,e.speed,dt,commander,run.soldiers);}else e.walk=false;
   if(distance(e,target)<e.range+.2&&e.attackClock<=0){e.attackClock=e.cooldown;e.anim=.48;if(e.range>3)this.launchProjectile(e,target,e.attack);else this.hurt(target,e.boss&&e.hp<e.maxHp*.4?e.attack*1.4:e.attack,e);}
   if(e.boss){if(e.hp<e.maxHp*.45&&!e.phaseTwo){e.phaseTwo=true;this.msg('O Lorde da Cinza entrou em fúria!');}e.special=(e.special??5.5)-dt;if(e.special<=0){e.special=7;if(distance(commander,e)<12){e.telegraph=1.25;this.msg('Alerta: golpe devastador! Afaste-se do Lorde!');}}if(e.telegraph>0){e.telegraph-=dt;if(e.telegraph<=0){for(const ally of [commander,...run.soldiers])if(alive(ally)&&distance(e,ally)<6)this.hurt(ally,30,e);run.fx.push({type:'burst',x:e.x,z:e.z,t:0,ttl:.65,range:6,color:'#e58469'});}}}
  }
  // Os ataques básicos do comandante são manuais; soldados e inimigos continuam automáticos.
  for(let i=run.projectiles.length-1;i>=0;i--){const p=run.projectiles[i],target=[commander,...run.soldiers,...run.enemies].find(u=>u.id===p.targetId);p.ttl-=dt;if(!target||p.ttl<=0){run.projectiles.splice(i,1);continue;}let d=distance(p,target);const step=p.speed*dt;if(d<=step){if(p.healing){if(alive(target)){const max=target.id==='commander'?target.maxHp:this.getStats(target).hp;target.hp=Math.min(max,target.hp+p.amount);run.fx.push({type:'heal',x:target.x,z:target.z,t:0,ttl:.55,range:1.4,color:'#90edd6'});}}else this.hurt(target,p.amount,[commander,...run.soldiers,...run.enemies].find(u=>u.id===p.sourceId));run.projectiles.splice(i,1);}else{p.x+=(target.x-p.x)/d*step;p.z+=(target.z-p.z)/d*step;}}
  run.fx=run.fx.filter(f=>(f.t+=dt)<f.ttl);run.enemies=run.enemies.filter(e=>e.state!=='dead'||e.anim>0);
  for(const site of run.world.sites){if(!site.started||site.done||!site.groupId)continue;const group=run.groupStats[site.id];if(group&&!group.completed&&run.enemies.every(e=>e.groupId!==site.id||e.hp<=0))this.resolveGroup(site.id);}
  if(commander.hp<=0&&!run.finished)this.finish('defeat');
 }
 finish(result){const run=this.run;if(!run||run.finished)return;run.finished=true;run.victory=result==='victory';if(result==='defeat')this.meta.losses++;if(result==='victory')this.meta.wins++;
  for(const s of run.soldiers){if(s.condition==='downed'){const rr=resolveDowned(s,this.r,this.meta.upgrades);if(rr)run[rr]++;}}
  const priorWounded=new Set(this.meta.roster.filter(s=>s.condition==='wounded').map(s=>s.id));const coreIds=new Set(this.meta.roster.map(s=>s.id));const survivors=[];for(const s of run.soldiers){if(s.condition==='dead'){this.meta.memorial.unshift({id:s.id,name:s.name,classId:s.classId,grade:s.grade,level:s.level,battles:s.battles,kills:s.kills,run:run.number});continue;}const clean=stripRuntime(s);if(coreIds.has(s.id)){const index=this.meta.roster.findIndex(m=>m.id===s.id);this.meta.roster[index]=clean;}else survivors.push(clean);}
  this.meta.roster=this.meta.roster.filter(s=>!this.meta.memorial.some(d=>d.id===s.id));
  for(const s of this.meta.roster)if(priorWounded.has(s.id)&&s.condition==='wounded'&&s.recoveryRunsRemaining>0){s.recoveryRunsRemaining--;if(s.recoveryRunsRemaining===0)healSoldier(s);}
  const legacy=run.earnedLegacy+(result==='victory'?10:result==='retreat'?3:1)+Math.floor(run.encounters/2);this.meta.legacy+=legacy;run.finalResult={type:result,legacy,returnables:survivors,chosenIds:[],kills:run.kills,elapsed:run.elapsed,banners:run.banners,floors:run.floorsCleared||1,dead:run.dead,wounded:run.wounded};
  this.meta.history.unshift({run:run.number,type:result,kills:run.kills,legacy,elapsed:Math.round(run.elapsed)});this.meta.history=this.meta.history.slice(0,20);this.persist();this.notify('finished');}
 keepRecruit(id){const r=this.run;if(!r?.finished)return;const record=r.finalResult;const s=record.returnables.find(s=>s.id===id);if(!s||record.chosenIds.includes(id))return;if(record.chosenIds.length>=2){this.msg('Só é possível guardar 2 novos recrutas por expedição.');return;}if(this.meta.roster.length>=maxRoster(this.meta.upgrades)){this.msg('Alojamentos lotados.');return;}record.chosenIds.push(id);s.isPersistentVeteran=true;this.meta.roster.push(s);this.persist();this.notify('finished');}
 returnBarracks(){if(!this.run?.finished)return;this.run=null;this.meta.activeRun=null;
  if(!this.meta.roster.some(s=>s.condition==='healthy')){const available=maxRoster(this.meta.upgrades)-this.meta.roster.length;if(available>0){const r=rng((this.meta.runNumber*101+87271)>>>0);for(let i=0;i<Math.min(2,available);i++){const soldier=generateSoldier(r,`soldier-${this.meta.nextId++}`,'voluntarios');if(i===0)soldier.classId='swordsman';soldier.hp=statsFor(soldier).hp;this.meta.roster.push(soldier);}this.msg('Novos voluntários chegaram para reerguer a companhia.');}else if(this.meta.roster.length){healSoldier(this.meta.roster[0]);this.msg('Uma recuperação emergencial salvou a companhia.');}}
  this.meta.selectedIds=this.meta.selectedIds.filter(id=>this.meta.roster.some(s=>s.id===id&&s.condition==='healthy'));if(!this.meta.selectedIds.length)this.meta.selectedIds=this.meta.roster.filter(s=>s.condition==='healthy').slice(0,5).map(s=>s.id);this.persist();this.notify('barracks');}
 reset(){clearSave();this.meta=freshMeta();this.run=null;this.r=null;this.persist();this.notify('reset');}
}
function stripRuntime(s){const t=structuredClone(s);for(const k of ['x','z','team','attackClock','flash','anim','phase','face','state','isCore','buff','shield','walk'])delete t[k];return t;}
function importedEnemy(r,id,type,x,z,groupId){const d=ENEMIES[type];return {id,type,name:d.name,classId:d.classId,team:'enemy',x,z,hp:d.hp,maxHp:d.hp,attack:d.attack,defense:d.defense,range:d.range,cooldown:d.cooldown,speed:d.speed,attackClock:r.next()*.5,flash:0,anim:0,phase:r.next()*6,face:0,state:'active',groupId,boss:!!d.boss,grade:d.boss?'legendary':'recruit',level:1};}
function moveUnit(s,x,z,speed,dt,leader,others){const dx=x-s.x,dz=z-s.z,dist=Math.hypot(dx,dz);if(dist<.25)return false;let vx=dx/dist,vz=dz/dist;for(const other of others){if(other===s||!alive(other))continue;const d=distance(s,other);if(d<1.1&&d>.001){vx+=(s.x-other.x)/d*.30;vz+=(s.z-other.z)/d*.30;}}
 const mag=Math.hypot(vx,vz)||1;const step=Math.min(dist,speed*dt);s.x=clamp(s.x+vx/mag*step,-49,49);s.z=clamp(s.z+vz/mag*step,-49,49);s.face=Math.atan2(vx,vz);return true;}
function formationSlot(roster,soldier,style,face){
 const support=u=>['archer','mystic','healer'].includes(u.classId);
 const back=support(soldier);const peers=roster.filter(u=>alive(u)&&support(u)===back);
 const i=Math.max(0,peers.findIndex(u=>u.id===soldier.id));const row=Math.floor(i/6),rowSize=Math.min(6,peers.length-row*6),col=i%6-(rowSize-1)/2;
 const spacing=style==='defensive'?1.2:1.7;
 const x=col*spacing,z=back?(-2.8-row*1.4):(2.5-row*1.3);
 const cos=Math.cos(face),sin=Math.sin(face);return {x:x*cos+z*sin,z:-x*sin+z*cos};
}
