import {CLASSES,ENEMIES,FIRST_NAMES,LAST_NAMES,TRAITS,GRADE_NAME,GRADE_MIN,GRADE_COST,GRADES} from './data.js';
import {clamp} from '../core/random.js';
export function generateSoldier(r,id,runId='fundacao'){
  const classId=r.pick(Object.keys(CLASSES));const traitId=r.pick(Object.keys(TRAITS));
  const soldier={id, name:`${r.pick(FIRST_NAMES)} ${r.pick(LAST_NAMES)}`,classId,traitId,level:1,xp:0,grade:'recruit',condition:'healthy',hp:0,appearanceSeed:r.int(1,999999),battles:0,kills:0,recruitmentRunId:runId,isPersistentVeteran:runId==='fundacao',recoveryRunsRemaining:0};
  soldier.hp=statsFor(soldier).hp;return soldier;
}
export function statsFor(soldier,perks=[],academy=0){
  const base=CLASSES[soldier.classId];if(!base)return {hp:1,attack:1,defense:1,speed:1,range:1,cooldown:1};
  const gradeIndex=GRADES.indexOf(soldier.grade),trait=TRAITS[soldier.traitId]||{};
  const levelScale=1+(soldier.level-1)*0.075,gradeScale=1+gradeIndex*.095;
  const mult=id=>1+perks.filter(p=>p===id).length*(id==='health'?.10:id==='march'?.08:id==='shield'?.15:id==='arrows'?.12:id==='spears'?.15:id==='magic'?.15:id==='charge'?.10:0);
  return {
    hp:Math.round(base.hp*levelScale*gradeScale*(trait.hp||1)*mult('health')),
    attack:base.attack*levelScale*gradeScale*(trait.attack||1)*(soldier.classId==='archer'?mult('arrows'):soldier.classId==='mystic'?mult('magic'):1)*mult('charge'),
    defense:base.defense*(1+(soldier.level-1)*.055)*(1+gradeIndex*.12)*(soldier.classId==='guardian'?mult('shield'):1),
    speed:base.speed*(trait.speed||1)*mult('march'),
    range:base.range*(soldier.classId==='spearman'?mult('spears'):1),
    cooldown:base.cooldown
  };
}
export function awardXp(s,xp){if(s.condition==='dead')return false;const old=s.level;s.xp+=xp;while(s.level<10&&s.xp>=s.level*16){s.xp-=s.level*16;s.level++;}if(s.level===10)s.xp=Math.min(s.xp,160);const gained=s.level>old;if(gained)s.hp=Math.min(statsFor(s).hp,s.hp+(s.level-old)*14);return gained;}
export const xpToNext=s=>s.level>=10?0:s.level*16;
export function canPromote(s){const next=GRADES[GRADES.indexOf(s.grade)+1];return next&&s.level>=GRADE_MIN[next]?next:null;}
export function promote(s,legacy){const next=canPromote(s);if(!next||legacy<GRADE_COST[next]||s.condition==='dead')return {ok:false};const maxBefore=statsFor(s).hp;s.grade=next;s.hp=Math.min(statsFor(s).hp,s.hp+statsFor(s).hp-maxBefore);return {ok:true,cost:GRADE_COST[next],next};}
export function createEnemy(r,id,type,x,z,groupId){const def=ENEMIES[type];return {id,type,name:def.name,classId:def.classId,team:'enemy',x,z,hp:def.hp,maxHp:def.hp,attack:def.attack,defense:def.defense,range:def.range,cooldown:def.cooldown,speed:def.speed,attackClock:0,flash:0,anim:0,phase:r.next()*6.28,face:0,state:'active',groupId,boss:!!def.boss,kills:0,level:1,grade:def.boss?'legendary':'recruit'};}
export function maxRoster(upgrades){return 12+((upgrades?.quarters)||0)*4;}
export function resolveDowned(s,r,upgrades){if(s.condition!=='downed')return null;const surviveChance=clamp(.65+(upgrades.infirmary||0)*.04+(s.traitId==='careful'?.10:0),.3,.94);const survived=r.next()<surviveChance;s.condition=survived?'wounded':'dead';s.recoveryRunsRemaining=survived?r.int(1,2):0;s.hp=survived?Math.max(1,Math.floor(statsFor(s).hp*.22)):0;return survived?'wounded':'dead';}
export function healSoldier(s){s.condition='healthy';s.recoveryRunsRemaining=0;s.hp=statsFor(s).hp;}
export function makeInitialRoster(r){const seq=['guardian','swordsman','archer','spearman','healer','mystic'];return seq.map((classId,i)=>({...generateSoldier(r,`wl-${i+1}`),classId,hp:CLASSES[classId].hp}));}
export function gradeText(s){return GRADE_NAME[s.grade]||s.grade;}
