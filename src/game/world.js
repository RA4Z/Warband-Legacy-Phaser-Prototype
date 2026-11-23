import {rng,shuffle,distance} from '../core/random.js';
// Mapa determinístico sem obstáculos sólidos: nenhum ponto essencial pode ficar inacessível.
export function makeWorld(seed){
  const r=rng(seed),sites=[];let id=0;
  const add=(kind,x,z,name)=>sites.push({id:`site-${++id}`,kind,x:Math.round(x*10)/10,z:Math.round(z*10)/10,name,done:false,started:false,groupId:null});
  add('home',0,0,'Acampamento da companhia');
  const angles=shuffle([-.45,1.65,3.7],r);
  angles.forEach((a,i)=>{const radius=27+r.int(-4,5);add('banner',Math.sin(a)*radius,Math.cos(a)*radius,['Posto do Corvo','Bastião Quebrado','Fortim das Brasas'][i]);});
  add('boss',r.int(-5,5),-43,'Fortaleza do Lorde da Cinza');
  for(let i=0;i<5;i++){
    const a=(i+.35)*Math.PI*2/5,dist=12+r.int(2,18),p={x:Math.cos(a)*dist,z:Math.sin(a)*dist};
    if(sites.some(s=>distance(p,s)<8))continue;add('patrol',p.x,p.z,`Patrulha ${i+1}`);
  }
  const others=[['recruit','Prisioneiros libertáveis'],['recruit','Mercenários errantes'],['recruit','Refugiados armados'],['rest','Fogueira segura'],['rest','Tenda de curandeiros'],['cache','Baú esquecido'],['cache','Carroça de suprimentos'],['shrine','Santuário antigo'],['shrine','Altar das escolhas']];
  for(const [kind,name] of others){for(let k=0;k<100;k++){const x=r.int(-38,38),z=r.int(-36,36),p={x,z};if(distance(p,{x:0,z:0})<6||sites.some(s=>distance(p,s)<7.5))continue;add(kind,x,z,name);break;}}
  const foliage=[];for(let i=0;i<215;i++){
    const x=r.int(-49,49)+r.next(),z=r.int(-49,49)+r.next();
    if(sites.some(s=>distance({x,z},s)<4.7)||Math.abs(x)<2&&Math.abs(z)<2)continue;
    foliage.push({x,z,type:r.int(0,9)<6?'pine':r.int(0,1)?'rock':'bush',scale:.6+r.next()*.95,seed:r.int(0,99999)});
  }
  const patches=[];for(let i=0;i<115;i++)patches.push({x:r.int(-49,49),z:r.int(-49,49),s:1+r.next()*3,t:r.int(0,2)});
  return {seed,sites,foliage,patches,size:104};
}
export const nearestSite=(world,x,z,filter=s=>!s.done)=>world.sites.filter(filter).sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z))[0];
