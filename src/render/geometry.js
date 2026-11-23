// Pequeno sistema de malhas triangulares 3D originais, sem texturas ou arquivos externos.
const cube=[];function quad(a,b,c,d,n){for(const v of [a,b,c,a,c,d])cube.push(...v,...n);}
quad([-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5],[0,0,1]);
quad([.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5],[0,0,-1]);
quad([.5,-.5,.5],[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5],[1,0,0]);
quad([-.5,-.5,-.5],[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5],[-1,0,0]);
quad([-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5],[-.5,.5,-.5],[0,1,0]);
quad([-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5],[0,-1,0]);
function cylinder(sides,topRadius=.5,bottomRadius=.5){const result=[];for(let i=0;i<sides;i++){
 const a=i*Math.PI*2/sides,b=(i+1)*Math.PI*2/sides,ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b);let n=[Math.cos((a+b)/2),0,Math.sin((a+b)/2)];
 const v1=[ca*bottomRadius,-.5,sa*bottomRadius],v2=[cb*bottomRadius,-.5,sb*bottomRadius],v3=[cb*topRadius,.5,sb*topRadius],v4=[ca*topRadius,.5,sa*topRadius];
 for(const v of [v1,v2,v3,v1,v3,v4])result.push(...v,...n);
 if(topRadius>0)for(const v of [[0,.5,0],v4,v3])result.push(...v,0,1,0);
 for(const v of [[0,-.5,0],v2,v1])result.push(...v,0,-1,0);
 }return result;}
function sphere(){const result=[];const lat=3,lon=6;for(let i=0;i<lat;i++){
 const y1=Math.cos(i/lat*Math.PI)*.5,y2=Math.cos((i+1)/lat*Math.PI)*.5;
 const r1=Math.sin(i/lat*Math.PI)*.5,r2=Math.sin((i+1)/lat*Math.PI)*.5;
 for(let j=0;j<lon;j++){
 const a=j/lon*Math.PI*2,b=(j+1)/lon*Math.PI*2;
 const p1=[r1*Math.cos(a),y1,r1*Math.sin(a)],p2=[r2*Math.cos(a),y2,r2*Math.sin(a)],p3=[r2*Math.cos(b),y2,r2*Math.sin(b)],p4=[r1*Math.cos(b),y1,r1*Math.sin(b)];
 for(const v of [p1,p2,p3,p1,p3,p4]){const d=Math.hypot(...v)||1;result.push(...v,v[0]/d,v[1]/d,v[2]/d);}
 }
 }return result;}
const SHAPES={box:cube,cylinder:cylinder(6),armor:cylinder(6,.53,.38),skirt:cylinder(6,.38,.57),cone:cylinder(6,0,.5),pyramid:cylinder(4,0,.5),sphere:sphere(),disc:cylinder(10,.5,.5),pole:cylinder(5)};
const parseColor=color=>{if(Array.isArray(color))return color;const n=parseInt(color.replace('#',''),16);return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255];};
const colorCache=new Map();const rgb=c=>{if(!colorCache.has(c))colorCache.set(c,parseColor(c));return colorCache.get(c);};
export function addMesh(out,shape,x,y,z,sx,sy,sz,color,opts={}){
 const mesh=SHAPES[shape]||SHAPES.box;const c=rgb(color), yaw=opts.yaw||0,rx=opts.rx||0,rz=opts.rz||0;
 const cy=Math.cos(yaw),ny=Math.sin(yaw),cx=Math.cos(rx),nx=Math.sin(rx),cz=Math.cos(rz),nz=Math.sin(rz);
 for(let i=0;i<mesh.length;i+=6){
  let px=mesh[i]*sx,py=mesh[i+1]*sy,pz=mesh[i+2]*sz;
  let v=py*cx-pz*nx,p=py*nx+pz*cx;py=v;pz=p;
  v=px*cz-py*nz;p=px*nz+py*cz;px=v;py=p;
  v=px*cy+pz*ny;p=-px*ny+pz*cy;px=v;pz=p;
  let vx=mesh[i+3],vy=mesh[i+4],vz=mesh[i+5];
  let vn=vy*cx-vz*nx,nn=vy*nx+vz*cx;vy=vn;vz=nn;
  vn=vx*cz-vy*nz;nn=vx*nz+vy*cz;vx=vn;vy=nn;
  vn=vx*cy+vz*ny;nn=-vx*ny+vz*cy;vx=vn;vz=nn;
  out.push(x+px,y+py,z+pz,vx,vy,vz,c[0],c[1],c[2]);
 }
}
// Personagens montados por partes 3D articuladas. Os mesmos modelos e animações
// são compartilhados por jogador, aliados e inimigos — sem spritesheets externos.
export function addActor(out,u,time=0){
 const x=u.x,z=u.z,face=u.face||0,commander=u.id==='commander',enemy=u.team==='enemy',boss=!!u.boss;
 const isDown=u.condition==='downed'||u.state==='downed'||u.state==='dead';
 const grade=u.grade||'recruit',elite=grade==='elite'||grade==='legendary';
 const legendary=grade==='legendary';
 const cls=commander?'commander':u.classId||'swordsman';
 const colors={
  commander:['#334b5f','#536d7c','#c8a363','#263949'],
  swordsman:['#426476','#7393a0','#d0a75f','#2d4452'],
  guardian:['#536877','#8899a9','#d8b974','#324652'],
  spearman:['#68735b','#93a17d','#d2b17a','#47503d'],
  archer:['#3a6b56','#6e9a71','#e6c17f','#294d3a'],
  mystic:['#63517f','#9784b4','#c6a5f2','#3e315a'],
  healer:['#a5a08a','#e3d5ae','#68c4b3','#736f67']
 };
 let [coat,trim,accent,dark]=colors[cls]||colors.swordsman;
 if(enemy){coat=boss?'#513840':'#753e48';trim=boss?'#9c5d55':'#a35b59';accent=boss?'#f3ad65':'#cb866b';dark='#3e2832';}
 if(u.flash>0){coat='#efefe9';trim='#ffffff';accent='#ffffff';}
 const skin=enemy?'#c39479':'#e2b995';
 const metal=elite||commander||boss?'#e1d2aa':'#b4c0bf';
 const shadow=commander?'#f0c879':enemy?'#cf6866':'#61c8ac';
 const moving=!!u.walk&&!isDown;
 const stride=moving?Math.sin((u.phase||0)*1.25):0;
 const step=Math.abs(stride);
 const breathing=Math.sin(time*2.7+(u.phase||0)*.32);
 const bob=moving?.048*Math.sin((u.phase||0)*2.5):.028*breathing;
 const attackDuration=.48;
 const hit=Math.max(0,Math.min(1,(u.anim||0)/attackDuration));
 const attack=hit>0?Math.sin((1-hit)*Math.PI):0;
 const leftLeg=moving?stride*.58:0,rightLeg=-leftLeg;
 const leftArm=moving?-stride*.36:.025*breathing;
 const rightArm=moving?stride*.36:-.025*breathing;
 const weaponSwing=attack*(cls==='spearman'?.95:1.48);
 const bodySway=moving?stride*.045:breathing*.016;
 const size=boss?1.55:commander?1.14:1;
 const c=Math.cos(face),s=Math.sin(face);
 // Transforma também a POSIÇÃO do componente em torno da articulação,
 // não apenas sua orientação: braços, botas e armas ficam presos ao esqueleto.
 function part(shape,dx,dy,dz,sx,sy,sz,color,opt={}){
  const px=opt.pivot?.[0]??0,py=opt.pivot?.[1]??0,pz=opt.pivot?.[2]??0;
  let lx=dx-px,ly=dy-py,lz=dz-pz;
  const rx=opt.rx||0,rz=opt.rz||0;
  const cx=Math.cos(rx),nx=Math.sin(rx),cz=Math.cos(rz),nz=Math.sin(rz);
  let a=ly*cx-lz*nx,b=ly*nx+lz*cx;ly=a;lz=b;
  a=lx*cz-ly*nz;b=lx*nz+ly*cz;lx=a;ly=b;
  lx+=px;ly+=py;lz+=pz;
  const worldX=x+size*(lx*c+lz*s),worldZ=z+size*(-lx*s+lz*c);
  addMesh(out,shape,worldX,size*(ly+bob),worldZ,size*sx,size*sy,size*sz,color,{yaw:face+(opt.yaw||0),rx,rz});
 }
 const rightPivot=[.56,1.65,0],leftPivot=[-.56,1.65,0];
 const legLeftPivot=[-.25,1.03,0],legRightPivot=[.25,1.03,0];
 const leftPose={pivot:leftPivot,rx:-leftArm*.8+attack*.13,rz:-.06};
 const rightPose={pivot:rightPivot,rx:-rightArm*.8-weaponSwing,rz:attack*.22+.09};
 const lLeg={pivot:legLeftPivot,rx:leftLeg},rLeg={pivot:legRightPivot,rx:rightLeg};
 addMesh(out,'disc',x,.015,z,size*.84,.019,size*.84,shadow);
 if(isDown){
  addMesh(out,'box',x,.18,z,.94*size,.20*size,.55*size,coat,{yaw:face});
  addMesh(out,'sphere',x+size*(.40*c+.1*s),.29*size,z+size*(-.40*s+.1*c),.40*size,.36*size,.40*size,skin);
  return;
 }
 // Pernas e botas seguem o quadril. Pequenos passos alternados no eixo frontal.
 for(const [sSide,pose] of [[-1,lLeg],[1,rLeg]]){
  part('cylinder',sSide*.25,.64,0,.26,.78,.28,dark,pose);
  part('sphere',sSide*.25,.24,.12,.30,.28,.44,dark,pose);
  part('box',sSide*.25,.22,.22,.32,.21,.54,coat,pose);
  part('box',sSide*.25,.74,.20,.23,.17,.09,trim,pose);
 }
 // Túnica com silhueta trapezoidal, peito, ombreiras, cinto e insígnia.
 part('skirt',0,.97,0,1.10,.53,.85,dark,{rz:bodySway});
 part('armor',0,1.38,0,1.30,.96,.86,coat,{rz:bodySway});
 part('box',0,1.45,.41,.81,.61,.105,trim,{rz:bodySway});
 part('box',0,1.09,.44,1.13,.16,.15,accent);
 part('box',0,1.09,.55,.22,.26,.13,metal);
 part('box',0,1.55,.50,.28,.29,.12,accent);
 part('box',0,1.56,.575,.11,.14,.08,dark);
 // Capa curta ao comandante, camada traseira solta na marcha.
 if(commander){
  part('box',0,1.17,-.46,1.05,1.10,.11,'#ac4f49',{rx:bodySway*1.7});
  part('box',0,1.66,-.48,1.09,.18,.14,accent);
 }
 // Cabeça, pescoço, olhos expressivos e cabelo/capacetes de cada classe.
 part('cylinder',0,1.85,0,.25,.23,.25,skin);
 part('sphere',0,2.21,.02,.57,.62,.54,skin,{rz:breathing*.017});
 if(enemy){
  part('box',0,2.23,.49,.43,.11,.07,'#442b30');
  part('box',-.16,2.23,.52,.07,.085,.06,'#ffb58c');
  part('box',.16,2.23,.52,.07,.085,.06,'#ffb58c');
 }else{
  for(const side of [-1,1]){
   part('sphere',side*.17,2.24,.49,.077,.09,.049,'#2f3838');
   part('box',side*.17,2.36,.47,.15,.04,.06,'#6d4b3a');
  }
 }
 if(cls==='archer'){
  part('cone',0,2.46,-.07,1.18,.52,1.11,'#2e564b');
  part('box',0,2.43,.36,.70,.14,.35,trim);
 }else if(cls==='mystic'){
  part('disc',0,2.59,0,1.22,.12,1.13,dark);
  part('cone',0,2.99,0,.94,.95,.94,coat);
  part('sphere',0,3.43,0,.18,.20,.18,accent);
 }else if(cls==='healer'){
  part('sphere',0,2.57,-.06,.59,.28,.53,'#e4d6b4');
  part('box',0,2.65,.39,.31,.27,.09,trim);
  part('box',0,2.67,.455,.09,.27,.04,accent);
 }else if(cls==='guardian'||commander||boss||elite){
  part('cylinder',0,2.55,0,.64,.39,.59,metal);
  part('box',0,2.42,.49,.23,.22,.16,accent);
  part('box',0,2.64,.12,.18,.31,.66,dark);
  if(commander||boss||legendary){
   part('box',0,2.85,0,.19,.48,.32,accent);
   part('cone',0,3.10,0,.29,.55,.30,accent);
  }
 }else{
  part('sphere',0,2.58,-.08,.58,.27,.52,dark);
  part('sphere',-.40,2.37,-.02,.23,.34,.28,dark);
 }
 // Braços articulados pelo ombro, com arma/escudo presos à mão.
 for(const [side,pose] of [[-1,leftPose],[1,rightPose]]){
  part('sphere',side*.58,1.68,0,.38,.35,.38,trim);
  part('cylinder',side*.63,1.28,.04,.32,.70,.32,coat,pose);
  part('sphere',side*.63,.91,.10,.24,.25,.25,skin,pose);
  part('box',side*.63,1.04,.23,.29,.19,.35,trim,pose);
 }
 if(cls==='guardian'||cls==='swordsman'||commander||boss){
  const large=cls==='guardian'||boss;
  part('box',-.72,1.18,.41,large?.88:.70,large?1.17:.87,.20,metal,leftPose);
  part('box',-.72,1.18,.53,large?.72:.55,large?1.00:.70,.13,trim,leftPose);
  part('sphere',-.72,1.18,.63,.31,.35,.13,accent,leftPose);
  part('box',.66,.92,.31,.15,.39,.16,'#795b45',rightPose);
  part('box',.66,.98,.31,.40,.12,.20,accent,rightPose);
  part('box',.66,1.61,.31,.20,1.16,.14,metal,rightPose);
  part('pyramid',.66,2.21,.31,.21,.35,.16,'#eff0de',rightPose);
  if(attack>.35){part('box',.92,1.52,.54,.09,.76,.08,'#f5e2aa',{...rightPose,rz:rightPose.rz-.35});}
 }else if(cls==='spearman'){
  part('cylinder',.68,1.43,.34,.12,2.35,.12,'#816348',rightPose);
  part('cone',.68,2.74,.34,.27,.65,.25,metal,rightPose);
  part('box',.68,1.09,.36,.21,.12,.17,accent,rightPose);
 }else if(cls==='archer'){
  part('box',-.22,1.38,-.47,.40,.93,.26,'#805b40');
  for(const sign of [-1,1])part('box',.70,1.25+sign*.48,.35,.15,.88,.15,'#9b7147',{...rightPose,rz:sign*.31});
  part('box',.70,1.25,.44,.045,1.60,.045,'#e2d2a7',rightPose);
  if(attack>.1)part('box',.70,1.19,.71,.055,.12,.68,accent,rightPose);
 }else{
  part('cylinder',.70,1.43,.32,.12,2.35,.12,'#88694e',rightPose);
  part('sphere',.70,2.71,.32,.30,.33,.30,accent,rightPose);
  if(cls==='healer'){
   part('box',.70,2.72,.66,.10,.35,.08,'#f4e9c3',rightPose);
   part('box',.70,2.72,.74,.29,.10,.07,'#f4e9c3',rightPose);
  }
 }
 if(boss){
  for(const sign of [-1,1]){
   part('cone',sign*.44,2.93,-.01,.39,.85,.39,'#d4b9a0',{rz:sign*.34});
   part('box',sign*.48,1.53,-.05,.32,.34,.83,accent);
  }
 }
 if(u.buff>0)part('sphere',0,3.36,0,.18,.22,.18,'#ffd478');
 if(u.shield>0)addMesh(out,'disc',x,.045,z,1.53*size,.019,1.53*size,'#79d6d7');
}
// LOD reduzido para unidades distantes: mantém classe, cor e movimento, sem
// pagar o custo de cada detalhe dos personagens próximos à câmera.
export function addActorLite(out,u,time=0){
 const enemy=u.team==='enemy',boss=!!u.boss,leader=u.id==='commander';
 const scale=boss?1.55:leader?1.14:1;
 const face=u.face||0,c=Math.cos(face),s=Math.sin(face);
 const hue=enemy?'#874c52':leader?'#486b80':({guardian:'#778e9c',swordsman:'#547d8b',archer:'#598b68',spearman:'#818c66',mystic:'#8b72a5',healer:'#d2c49f'}[u.classId]||'#687f87');
 const accent=enemy?'#d08d71':leader?'#e0bd78':'#b9d0c1',metal='#d1d4c6';
 const swing=u.walk?Math.sin(u.phase||0)*.18:0;
 const attack=u.anim>0?Math.sin((1-Math.min(1,u.anim/.48))*Math.PI):0;
 const bob=.02*Math.sin(time*2.7+(u.phase||0)*.3);
 const put=(shape,dx,dy,dz,sx,sy,sz,color,rx=0)=>addMesh(out,shape,
  u.x+(dx*c+dz*s)*scale,(dy+bob)*scale,u.z+(-dx*s+dz*c)*scale,
  sx*scale,sy*scale,sz*scale,color,{yaw:face,rx});
 addMesh(out,'disc',u.x,.019,u.z,.7*scale,.018,.7*scale,enemy?'#bf6660':'#6cbaaa');
 if(u.state==='downed'||u.state==='dead'||u.condition==='downed'){
  put('box',0,.17,0,.7,.20,.55,hue);return;
 }
 put('box',-.23,.52,swing,.27,.85,.32,'#47545d');
 put('box',.23,.52,-swing,.27,.85,.32,'#47545d');
 put('armor',0,1.34,0,1.16,1.04,.83,hue);
 put('box',0,1.32,.39,.65,.36,.10,accent);
 put('sphere',0,2.18,0,.54,.58,.52,enemy?'#c59a80':'#e0ba98');
 put('cylinder',0,2.53,0,.62,.31,.62,metal);
 put('cylinder',-.61,1.36,-swing,.31,.72,.30,hue);
 put('cylinder',.61,1.36,swing,.31,.72,.30,hue,-attack*.8);
 if(['guardian','swordsman'].includes(u.classId)||leader||boss){
  put('box',-.75,1.15,.35,.68,.86,.15,metal);
  put('box',.73,1.21,.28,.16,.84,.15,metal,-attack*.9);
 }else if(['archer','spearman'].includes(u.classId)){
  put('cylinder',.70,1.6,.3,.11,1.7,.11,'#a27f56',-attack*.7);
 }else put('sphere',.70,2.13,.3,.22,.25,.22,u.classId==='mystic'?'#cab3ff':'#a4dfcc');
}
export function addTree(out,x,z,scale=1,variant=0){addMesh(out,'cylinder',x,.52*scale,z,.31*scale,1.05*scale,.31*scale,'#80654c');
 if(variant){addMesh(out,'sphere',x,1.8*scale,z,1.55*scale,1.8*scale,1.55*scale,'#527b54');addMesh(out,'sphere',x-.45*scale,1.32*scale,z+.1*scale,1.05*scale,1.1*scale,1.05*scale,'#638d60');}
 else{addMesh(out,'cone',x,1.55*scale,z,1.8*scale,2.35*scale,1.8*scale,'#4e7864');addMesh(out,'cone',x,2.55*scale,z,1.5*scale,2*scale,1.5*scale,'#628e6e');}}
export function addSite(out,s,elapsed=0){const {x,z,kind}=s;const y=.08;
 const color=s.done?'#7f9375':kind==='banner'?'#d59b6e':kind==='boss'?'#ac6765':kind==='recruit'?'#6dd2af':kind==='shrine'?'#bc9ce7':'#e7ce8d';
 if(kind==='home'){
  addMesh(out,'disc',x,.018,z,5.3,.03,5.3,'#a1946c');
  addMesh(out,'cylinder',x,0.55,z-1.8,.9,1.1,.9,'#9c785a');addMesh(out,'cone',x,1.63,z-1.8,2.6,1.5,2.6,'#597c7b');
  addMesh(out,'box',x+2,.3,z+1.1,2.1,.6,1.7,'#8c6a48');addMesh(out,'cone',x+2,1.1,z+1.1,2.7,1.2,2.3,'#7b5a49');
  addMesh(out,'cylinder',x-2.5,1.2,z, .14,2.4,.14,'#957255');addMesh(out,'box',x-2.5,2,z,.93,.63,.11,'#69c4b9');
  addMesh(out,'cone',x-1,.24,z+2,.6,.55,.6,'#ffca77');return;
 }
 if(kind==='banner'||kind==='patrol'){
  addMesh(out,'disc',x,.02,z,3.5,.05,3.5,s.done?'#789575':'#8a7663');
  for(let i=0;i<3;i++){const a=i*2.1;addMesh(out,'cylinder',x+Math.cos(a)*2.6,.7,z+Math.sin(a)*2.6,.3,1.4,.3,'#71594e');}
  addMesh(out,'cylinder',x,1.5,z,.17,3,.17,'#91715b');addMesh(out,'box',x+.46,2.38,z,.91,1.14,.13,color);
  addMesh(out,'box',x,0.27,z,1.8,.54,1.6,'#8b6e55');return;
 }
 if(kind==='boss'){
  addMesh(out,'disc',x,.03,z,6.2,.06,6.2,'#7d6e68');
  addMesh(out,'box',x,1.35,z,5.8,2.7,5.4,'#797b7f');addMesh(out,'box',x,3.6,z,4.3,1.2,4.4,'#666e74');
  for(let dx of [-3.1,3.1])for(let dz of [-2.8,2.8]){
   addMesh(out,'box',x+dx,2.25,z+dz,1.35,4.5,1.35,'#737b80');addMesh(out,'pyramid',x+dx,4.8,z+dz,1.9,1.6,1.9,'#a65f57');}
  addMesh(out,'box',x,1.0,z-2.75,1.8,2.0,.16,'#3d3335');return;
 }
 if(kind==='shrine'){
  addMesh(out,'cylinder',x,.3,z,2.8,.6,2.8,'#8f819b');for(let i=0;i<4;i++){const a=i*Math.PI/2;addMesh(out,'cylinder',x+Math.cos(a)*1.4,1,z+Math.sin(a)*1.4,.5,2,.5,'#b4a5bf');}
  addMesh(out,'sphere',x,1.6,z,.65,.75,.65,color);return;
 }
 if(kind==='recruit'){
  addMesh(out,'cylinder',x,.48,z,2.5,.96,2.5,'#8e7f6a');addMesh(out,'cone',x,1.38,z,3.1,1.36,3.1,'#7b9c82');addMesh(out,'box',x,1.02,z-1.02,.92,.9,.3,'#594b43');return;
 }
 if(kind==='cache'){addMesh(out,'box',x,.4,z,1.45,.8,1,'#b17b4e');addMesh(out,'box',x,.71,z,1.5,.22,1.03,'#dec083');return;}
 if(kind==='rest'){addMesh(out,'disc',x,.035,z,2.7,.07,2.7,'#b19b76');addMesh(out,'cone',x,.37,z,.9,.75,.9,'#df9561');addMesh(out,'cone',x,.63,z,.54,.88,.54,'#ffd58e');for(let i=0;i<3;i++){const a=i*2*Math.PI/3;addMesh(out,'box',x+Math.cos(a)*1.1,.18,z+Math.sin(a)*1.1,1,.28,.3,'#88654b',{yaw:a});}return;}
}
