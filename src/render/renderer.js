import {addMesh,addActor,addTree,addSite} from './geometry.js';
import {makeWorld} from '../game/world.js';
import {distance,clamp} from '../core/random.js';
import {statsFor} from '../game/units.js';
const vs=`#version 300 es
precision highp float;
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNormal; layout(location=2) in vec3 aColor;
uniform mat4 uVP;uniform vec3 uEye;
out vec3 vColor; out float vFog;
void main(){gl_Position=uVP*vec4(aPos,1.0);float lit=max(dot(normalize(aNormal),normalize(vec3(-0.45,0.85,0.5))),0.0);float soft=0.58+0.42*lit;vColor=aColor*soft;vFog=clamp((distance(aPos,uEye)-30.0)/105.0,0.0,0.55);}
`;
const fs=`#version 300 es
precision highp float;
in vec3 vColor;in float vFog;out vec4 frag;
void main(){vec3 c=mix(vColor,vec3(0.59,0.70,0.68),vFog);frag=vec4(pow(c,vec3(0.95)),1.0);}
`;
function compile(gl,type,text){const sh=gl.createShader(type);gl.shaderSource(sh,text);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh;}
function classHealth(u){return statsFor(u).hp;}
function norm(v){const n=Math.hypot(...v)||1;return v.map(x=>x/n);}
function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
function lookAt(eye,target){const z=norm(eye.map((e,i)=>e-target[i])),x=norm(cross([0,1,0],z)),y=cross(z,x);return [x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1];}
function ortho(l,r,b,t,n,f){return [2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1];}
function multiply(a,b){const out=new Array(16);for(let col=0;col<4;col++)for(let row=0;row<4;row++){out[col*4+row]=a[row]*b[col*4]+a[4+row]*b[col*4+1]+a[8+row]*b[col*4+2]+a[12+row]*b[col*4+3];}return out;}
export class Renderer {
 constructor(canvas,over){this.canvas=canvas;this.overlay=over;this.ctx=over.getContext('2d');this.gl=canvas.getContext('webgl2',{antialias:true,alpha:false,powerPreference:'high-performance'});if(!this.gl)throw Error('WebGL2 não está disponível neste navegador.');
  const gl=this.gl,program=gl.createProgram();gl.attachShader(program,compile(gl,gl.VERTEX_SHADER,vs));gl.attachShader(program,compile(gl,gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);this.program=program;this.uVP=gl.getUniformLocation(program,'uVP');this.uEye=gl.getUniformLocation(program,'uEye');this.vbo=gl.createBuffer();this.staticVbo=gl.createBuffer();this.staticCount=0;this.dynamicCapacity=0;this.world=null;this.camera={x:0,z:0};this.zoom=24;this.settings={quality:'medium'};this.vp=null;this.preview=makeWorld(2026);this.setWorld(this.preview);this.resize();window.addEventListener('resize',()=>this.resize());}
 prepareBuffer(buffer){const gl=this.gl;gl.bindBuffer(gl.ARRAY_BUFFER,buffer);const stride=9*4;for(const [index,offset] of [[0,0],[1,3],[2,6]]){gl.enableVertexAttribArray(index);gl.vertexAttribPointer(index,3,gl.FLOAT,false,stride,offset*4);}}
 setQuality(q){this.settings.quality=q;this.resize();}
 resize(){const quality=this.settings.quality;const dpr=Math.min(devicePixelRatio||1,quality==='low'?1:quality==='high'?2:1.35);const w=Math.max(1,Math.floor(this.canvas.clientWidth*dpr)),h=Math.max(1,Math.floor(this.canvas.clientHeight*dpr));if(w!==this.canvas.width||h!==this.canvas.height){this.canvas.width=w;this.canvas.height=h;}this.overlay.width=Math.round(this.overlay.clientWidth*dpr);this.overlay.height=Math.round(this.overlay.clientHeight*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);}
 setWorld(world){this.world=world;const out=[];
  addMesh(out,'box',0,-.33,0,106,.64,106,'#769b75');
  for(let i=-49;i<=49;i+=7)for(let j=-49;j<=49;j+=7){const index=Math.abs((i*43+j*97+world.seed)|0)%5;addMesh(out,'box',i,.001,j,6.93,.015,6.93,['#7aa378','#779f72','#7c9d76','#77a07c','#749c73'][index]);}
  for(const p of world.patches){addMesh(out,'disc',p.x,.013,p.z,p.s,.011,p.s,['#74916b','#88a77b','#7c9c6e'][p.t]);}
  for(const tree of world.foliage){const {x,z,scale,type,seed}=tree;
   if(type==='pine')addTree(out,x,z,scale,seed%3===0?1:0);
   else if(type==='rock')addMesh(out,'sphere',x,.27*scale,z,1.25*scale,.7*scale,1.1*scale,seed%3===0?'#8e9290':'#94998b');
   else{addMesh(out,'sphere',x,.27,z,1.3*scale,.73*scale,1.2*scale,'#4c8464');addMesh(out,'sphere',x+.35,.38,z-.23,.8*scale,.71*scale,.85*scale,'#61936b');}
  }
  const float=new Float32Array(out);const gl=this.gl;gl.bindBuffer(gl.ARRAY_BUFFER,this.staticVbo);gl.bufferData(gl.ARRAY_BUFFER,float,gl.STATIC_DRAW);this.staticCount=float.length/9;}
 project(x,y,z){if(!this.vp)return null;const m=this.vp,w=m[3]*x+m[7]*y+m[11]*z+m[15],px=(m[0]*x+m[4]*y+m[8]*z+m[12])/w,py=(m[1]*x+m[5]*y+m[9]*z+m[13])/w;return {x:(px*.5+.5)*this.canvas.clientWidth,y:(1-(py*.5+.5))*this.canvas.clientHeight,visible:w>0&&Math.abs(px)<1.2&&Math.abs(py)<1.2};}
 screenTarget(x,y,run){if(!run)return null;const targets=run.enemies.filter(e=>e.hp>0);const closest=targets.map(e=>({e,p:this.project(e.x,1.4,e.z)})).filter(a=>a.p?.visible).sort((a,b)=>Math.hypot(a.p.x-x,a.p.y-y)-Math.hypot(b.p.x-x,b.p.y-y))[0];return closest&&Math.hypot(closest.p.x-x,closest.p.y-y)<42?closest.e:null;}
 render(run,time=0){this.resize();const gl=this.gl,w=this.canvas.width,h=this.canvas.height;gl.viewport(0,0,w,h);gl.clearColor(.66,.79,.75,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
  if(run&&run.world!==this.world)this.setWorld(run.world);else if(!run&&this.world!==this.preview)this.setWorld(this.preview);
  const center=run?.commander||{x:0,z:0};let s=Math.min(1,(1/60)*Math.max(1,time?2:1));this.camera.x+=(center.x-this.camera.x)*s;this.camera.z+=(center.z-this.camera.z)*s;
  const eye=[this.camera.x+29,35,this.camera.z+29],target=[this.camera.x,0,this.camera.z];const aspect=w/h;this.vp=multiply(ortho(-this.zoom*aspect,this.zoom*aspect,-this.zoom,this.zoom,.1,170),lookAt(eye,target));gl.useProgram(this.program);gl.uniformMatrix4fv(this.uVP,false,new Float32Array(this.vp));gl.uniform3fv(this.uEye,new Float32Array(eye));this.prepareBuffer(this.staticVbo);gl.drawArrays(gl.TRIANGLES,0,this.staticCount);
  const arr=[];const world=run?.world||this.preview;
  for(const site of world.sites){if(site.done&&site.kind!=='home'&&site.kind!=='banner')continue;addSite(arr,site,time);if(!site.done&&site.kind!=='home'){
   const c=site.kind==='banner'?'#f3d598':site.kind==='boss'?'#ff9a8c':site.kind==='recruit'?'#7beac3':site.kind==='shrine'?'#d6b0f8':'#ffe0a6';
   const bob=.25+Math.sin(time*2+site.x)*.17;addMesh(arr,'sphere',site.x,3.1+bob,site.z,.37,.47,.37,c);
  }}
  if(run){for(const u of run.soldiers){if(distance(u,run.commander)<37&&(u.condition==='healthy'||u.condition==='downed'))addActor(arr,u,time);}
   for(const e of run.enemies){if(distance(e,run.commander)<39)addActor(arr,e,time);}
   addActor(arr,run.commander,time);
   for(const p of run.projectiles)addMesh(arr,'sphere',p.x,1.25+Math.sin(time*10)*.15,p.z,.27,.26,.27,p.color);
   for(const fx of run.fx){if(fx.type==='burst'){let k=.15+fx.t/fx.ttl*fx.range;addMesh(arr,'disc',fx.x,.047,fx.z,k,.035,k,fx.color);}else if(fx.type==='heal'){addMesh(arr,'sphere',fx.x,1.5+fx.t*2,fx.z,.2+fx.t*.25,.2+fx.t*.25,.2+fx.t*.25,fx.color);}}
   const boss=run.enemies.find(e=>e.boss&&e.hp>0);if(boss?.telegraph>0)addMesh(arr,'disc',boss.x,.04,boss.z,12,.033,12,'#cf785e');
  }
  const flat=new Float32Array(arr);gl.bindBuffer(gl.ARRAY_BUFFER,this.vbo);gl.bufferData(gl.ARRAY_BUFFER,flat,gl.DYNAMIC_DRAW);this.prepareBuffer(this.vbo);gl.drawArrays(gl.TRIANGLES,0,flat.length/9);
  this.renderOverlay(run,time);
 }
 renderOverlay(run,time){const ctx=this.ctx,w=this.overlay.clientWidth,h=this.overlay.clientHeight;ctx.clearRect(0,0,w,h);if(!run)return;
  const drawBar=(u,color='#76d2af')=>{const p=this.project(u.x,(u.boss?4.1:2.8),u.z);if(!p||!p.visible||p.x<-40||p.x>w+40||p.y<-10||p.y>h+30)return;const max=u.maxHp||u.hp;const hp=clamp(u.hp/max,0,1);ctx.fillStyle='#192b32dd';ctx.fillRect(p.x-19,p.y-3,38,5);ctx.fillStyle=color;ctx.fillRect(p.x-18,p.y-2,36*hp,3);};
  for(const u of run.soldiers){const maximum=classHealth(u);if(u.hp>0&&distance(u,run.commander)<23&&(u.hp<maximum*.9||u.flash>0))drawBar({...u,maxHp:maximum},'#74d4bf');}
  for(const e of run.enemies)if(e.hp>0&&distance(e,run.commander)<35)drawBar(e,e.boss?'#ffca82':'#d77569');
  for(const fx of run.fx){if(fx.type!=='number')continue;const p=this.project(fx.x,2.4+fx.t*1.35,fx.z);if(!p?.visible)continue;ctx.font='700 14px system-ui';ctx.textAlign='center';ctx.strokeStyle='#263039';ctx.lineWidth=3;ctx.strokeText(String(fx.amount),p.x,p.y);ctx.fillStyle=fx.color;ctx.fillText(String(fx.amount),p.x,p.y);}
  const site=run.world.sites.filter(s=>!s.done&&distance(run.commander,s)<15).sort((a,b)=>distance(run.commander,a)-distance(run.commander,b))[0];if(site){const p=this.project(site.x,4.1,site.z);if(p?.visible){ctx.textAlign='center';ctx.font='700 12px system-ui';ctx.fillStyle='#fcf3d8';ctx.strokeStyle='#1c3333';ctx.lineWidth=4;ctx.strokeText(site.name,p.x,p.y);ctx.fillText(site.name,p.x,p.y);}}
 }
}
