import {rng,shuffle,distance} from '../core/random.js';
export const TOTAL_FLOORS=4;
export const FLOOR_BIOMES=[
 {name:'Bosque de Arven',subtitle:'O despertar da companhia',ground:['#7d9c68','#819f71','#86a775'],path:'#b7a180',accent:'#e5c783',sky:[.61,.75,.72]},
 {name:'Floresta Esmeralda',subtitle:'Sob as copas ancestrais',ground:['#527b60','#60886a','#719376'],path:'#927d66',accent:'#94e6b8',sky:[.42,.63,.58]},
 {name:'Ermos de Cinza',subtitle:'Além das terras devastadas',ground:['#9b8772','#a9947e','#b3a08a'],path:'#6f6664',accent:'#ffbd75',sky:[.71,.61,.54]},
 {name:'Altos do Crepúsculo',subtitle:'O último juramento',ground:['#6a8390','#7c91a0','#8894a3'],path:'#a4a5a5',accent:'#dad0ff',sky:[.51,.62,.72]}
];
export const biomeForFloor=floor=>FLOOR_BIOMES[Math.max(0,Math.min(FLOOR_BIOMES.length-1,(floor||1)-1))];
// Mapa determinístico sem obstáculos sólidos: nenhum ponto essencial pode ficar inacessível.
export function makeWorld(seed,floor=1){
  const r=rng(seed),sites=[];let id=0;
  const add=(kind,x,z,name)=>sites.push({id:`site-${++id}`,kind,x:Math.round(x*10)/10,z:Math.round(z*10)/10,name,done:false,started:false,groupId:null});
  add('home',0,0,'Acampamento da companhia');
  const angles=shuffle([-.45,1.65],r);
  angles.forEach((a,i)=>{const radius=27+r.int(-4,5);add('banner',Math.sin(a)*radius,Math.cos(a)*radius,['Posto do Corvo','Bastião Quebrado','Fortim das Brasas'][i]);});
  add('boss',r.int(-5,5),-42,floor===TOTAL_FLOORS?'Citadela do Último Juramento':'Portal do Guardião');
  for(let i=0;i<3;i++){
    const a=(i+.35)*Math.PI*2/5,dist=12+r.int(2,18),p={x:Math.cos(a)*dist,z:Math.sin(a)*dist};
    if(sites.some(s=>distance(p,s)<8))continue;add('patrol',p.x,p.z,`Patrulha ${i+1}`);
  }
  const others=[['recruit','Prisioneiros libertáveis'],['recruit','Mercenários errantes'],['recruit','Refugiados armados'],['rest','Fogueira segura'],['rest','Tenda de curandeiros'],['cache','Baú esquecido'],['cache','Carroça de suprimentos'],['shrine','Santuário antigo'],['shrine','Altar das escolhas']];
  for(const [kind,name] of others){for(let k=0;k<100;k++){const x=r.int(-38,38),z=r.int(-36,36),p={x,z};if(distance(p,{x:0,z:0})<6||sites.some(s=>distance(p,s)<7.5))continue;add(kind,x,z,name);break;}}
  const foliage=[];for(let i=0;i<260;i++){
    const x=r.int(-49,49)+r.next(),z=r.int(-49,49)+r.next();
    if(sites.some(s=>distance({x,z},s)<4.7)||Math.abs(x)<2&&Math.abs(z)<2)continue;
    foliage.push({x,z,type:r.int(0,9)<6?'pine':r.int(0,1)?'rock':'bush',scale:.6+r.next()*.95,seed:r.int(0,99999)});
  }
  const patches=[];for(let i=0;i<180;i++)patches.push({x:r.int(-49,49),z:r.int(-49,49),s:.5+r.next()*2.2,t:r.int(0,2)});
  const details=[];for(let i=0;i<490;i++){const x=r.int(-50,50)+r.next(),z=r.int(-50,50)+r.next();if(sites.some(q=>distance(q,{x,z})<3.5))continue;details.push({x,z,type:r.int(0,14),size:.5+r.next(),seed:r.int(0,9999)});}
  return {seed,floor,biome:biomeForFloor(floor),sites,foliage,patches,details,size:104};
}
export const nearestSite=(world,x,z,filter=s=>!s.done)=>world.sites.filter(filter).sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z))[0];
