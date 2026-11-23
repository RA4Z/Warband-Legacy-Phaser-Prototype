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
function sphere(){const result=[];const lat=5,lon=8;for(let i=0;i<lat;i++){
 const y1=Math.cos(i/lat*Math.PI)*.5,y2=Math.cos((i+1)/lat*Math.PI)*.5;
 const r1=Math.sin(i/lat*Math.PI)*.5,r2=Math.sin((i+1)/lat*Math.PI)*.5;
 for(let j=0;j<lon;j++){
 const a=j/lon*Math.PI*2,b=(j+1)/lon*Math.PI*2;
 const p1=[r1*Math.cos(a),y1,r1*Math.sin(a)],p2=[r2*Math.cos(a),y2,r2*Math.sin(a)],p3=[r2*Math.cos(b),y2,r2*Math.sin(b)],p4=[r1*Math.cos(b),y1,r1*Math.sin(b)];
 for(const v of [p1,p2,p3,p1,p3,p4]){const d=Math.hypot(...v)||1;result.push(...v,v[0]/d,v[1]/d,v[2]/d);}
 }
 }return result;}
const SHAPES={box:cube,cylinder:cylinder(7),cone:cylinder(7,0,.5),pyramid:cylinder(4,0,.5),sphere:sphere(),disc:cylinder(18,.5,.5),pole:cylinder(5)};
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
export function addActor(out,u,time=0){
 const x=u.x,z=u.z,face=u.face||0, isEnemy=u.team==='enemy',commander=u.id==='commander', boss=u.boss;
 const grade=u.grade||'recruit';const gold=grade==='legendary',elite=['elite','legendary'].includes(grade);
 const scale=boss?1.5:commander?1.22:1;const flash=u.flash>0;
 const bodyColor=flash?'#ffffff':isEnemy?'#873e49':commander?'#384956':u.classId==='healer'?'#d4c899':u.classId==='mystic'?'#6f6097':u.classId==='guardian'?'#718c9e':u.classId==='archer'?'#517b64':'#697f82';
 const accent=flash?'#ffffff':isEnemy?'#d77d6c':commander?'#e2b86d':gold?'#e7c879':elite?'#d2b682':'#7bd0c4';
 const skin=flash?'#ffffff':isEnemy?'#cda68d':'#ddb99b', metal=elite?'#e2cfab':'#b5b6ad';
 const walk=u.walk?Math.sin(u.phase||0)*.24:0,attack=u.anim>0?Math.sin((1-u.anim/.5)*Math.PI)*.75:0;
 const standing=u.condition!=='downed'&&u.state!=='downed'&&u.state!=='dead';
 function p(shape,dx,dy,dz,sx,sy,sz,col,extra={}){
  const ly=standing?dy*scale:dy*.27*scale;
  const lx=standing?dx*scale:dx*scale+.32;
  const lz=standing?dz*scale:dz*scale;
  const xx=lx*Math.cos(face)+lz*Math.sin(face),zz=-lx*Math.sin(face)+lz*Math.cos(face);
  addMesh(out,shape,x+xx,ly,z+zz,sx*scale,sy*scale,sz*scale,col,{yaw:face+(extra.yaw||0),rx:extra.rx||0,rz:extra.rz||0});
 }
 const ground=commander?'#d6bf6a':isEnemy?'#c75b62':'#5dc9ba';
 addMesh(out,'disc',x,.015,z,.85,.025,.85,ground);
 if(!standing){p('box',0,.13,0,.65,.18,.6,bodyColor);p('sphere',.3,.2,.1,.34,.32,.32,skin);return;}
 // Pés, pernas e tronco. A silhueta é composta por partes animáveis, não caixas únicas.
 p('box',-.22,.40,0,.27,.80,.33,'#344b55',{rz:walk*.9});p('box',.22,.40,0,.27,.80,.33,'#344b55',{rz:-walk*.9});
 p('box',-.22,.08,-.12,.33,.19,.51,'#303c44');p('box',.22,.08,-.12,.33,.19,.51,'#303c44');
 p('box',0,1.10,0,.83,.94,.54,bodyColor);p('box',0,1.20,-.31,.65,.62,.12,accent);
 p('box',0,1.54,0,.2,.2,.22,skin);p('sphere',0,1.88,0,.56,.58,.52,skin);
 p('box',0,1.99,-.285,.09,.06,.045,'#473c3f');
 p('box',-.15,1.92,-.31,.052,.052,.045,'#262c38');p('box',.15,1.92,-.31,.052,.052,.045,'#262c38');
 if(elite||commander||u.classId==='guardian'){
  p('cylinder',0,2.20,0,.57,.34,.57,metal);p('box',0,2.28,-.3,.17,.32,.17,accent);
 }else p('sphere',0,2.16,.03,.52,.20,.48,isEnemy?'#60414c':'#5d5b4d');
 if(gold){p('cone',0,2.55,0,.2,.60,.2,accent);p('box',0,1.18,-.39,.48,.44,.08,metal);}
 if(u.classId==='healer'||u.classId==='mystic'){p('cone',0,.65,0,.95,.82,.85,bodyColor);}
 if(commander){p('box',0,1.10,.40,.84,1.15,.11,'#b84c4f');p('box',0,1.40,.47,.72,.12,.08,accent);}
 const armSwing=attack*1.65;
 p('box',-.58,1.12,0,.30,.84,.33,skin,{rz:-walk*.43-.12});p('box',.58,1.12,0,.30,.84,.33,skin,{rz:walk*.43+armSwing});
 p('box',-.59,1.48,0,.43,.35,.43,metal);p('box',.59,1.48,0,.43,.35,.43,metal);
 const classId=u.classId;
 if(['swordsman','guardian'].includes(classId)||commander){
  p('box',.63,.70,-.34,.13,.84,.14,metal,{rz:-.2-attack});p('box',.63,1.07,-.34,.29,.14,.14,accent);
  p('box',-.75,1.12,-.30,classId==='guardian'?.78:.57,classId==='guardian'?1.05:.7,.17,metal);p('box',-.75,1.16,-.4,.36,.16,.06,accent);
 }else if(classId==='spearman'){
  p('cylinder',.67,1.35,-.5,.12,2.6,.12,'#b68e62',{rz:attack*.35});p('cone',.67,2.78,-.5,.25,.55,.25,metal);
 }else if(classId==='archer'){
  p('box',-.49,1.25,.36,.35,.66,.17,'#72543d');p('box',.72,1.24,-.40,.12,1.02,.12,'#b48962');p('box',.72,1.7,-.42,.13,.17,.13,accent);p('box',.72,.8,-.42,.13,.17,.13,accent);
 }else{
  const staffColor=classId==='healer'?'#8ddcc1':'#bd9bed';p('cylinder',.68,1.12,-.48,.115,2.1,.115,'#896f5d');p('sphere',.68,2.21,-.48,.35,.35,.35,staffColor);
 }
 if(u.buff>0)p('cone',0,2.73,0,.20,.34,.2,'#ffd478');
 if(u.shield>0)p('disc',0,.055,0,1.75,.02,1.75,'#73d8e0');
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
