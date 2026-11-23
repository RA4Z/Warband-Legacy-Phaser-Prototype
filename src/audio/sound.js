// Warband Legacy – efeitos originais sintetizados, sem trilhas ou samples licenciados.
// AudioContext só é criado após interação do jogador; nunca toca automaticamente.
export class Sound {
 constructor(){this.ctx=null;this.enabled=true;this.last={};}
 getContext(){if(!this.ctx)this.ctx=new (window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume();return this.ctx;}
 play(type='tap'){
  if(!this.enabled)return;
  try{
   const ctx=this.getContext(),now=ctx.currentTime;
   if(now-(this.last[type]??-1)<(type==='hit'?.09:.045))return;
   this.last[type]=now;
   const note=(from,to,duration,vol,shape='sine')=>{
    const o=ctx.createOscillator(),g=ctx.createGain();o.type=shape;
    o.frequency.setValueAtTime(from,now);o.frequency.exponentialRampToValueAtTime(Math.max(25,to),now+duration);
    g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(vol,now+.007);g.gain.exponentialRampToValueAtTime(.0001,now+duration);
    o.connect(g);g.connect(ctx.destination);o.start(now);o.stop(now+duration+.015);
   };
   const noise=(duration,vol,filterFreq)=>{
    const count=Math.max(100,Math.floor(ctx.sampleRate*duration)),buffer=ctx.createBuffer(1,count,ctx.sampleRate),data=buffer.getChannelData(0);
    for(let i=0;i<count;i++)data[i]=(Math.random()*2-1)*(1-i/count);
    const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();src.buffer=buffer;filter.type='highpass';filter.frequency.value=filterFreq;gain.gain.value=vol;src.connect(filter);filter.connect(gain);gain.connect(ctx.destination);src.start(now);src.stop(now+duration);
   };
   if(type==='slash'){note(290,78,.14,.045,'triangle');noise(.12,.055,700);}
   else if(type==='dash'){note(260,680,.19,.025,'sine');noise(.16,.04,1300);}
   else if(type==='hit'){note(145,62,.10,.042,'triangle');noise(.095,.022,900);}
   else if(type==='victory'){note(420,630,.25,.04,'sine');}
   else if(type==='skill'){note(300,90,.24,.045,'sawtooth');noise(.18,.017,400);}
   else {note(470,330,.055,.014,'sine');}
  }catch(error){/* Áudio opcional: nunca deve interromper o jogo. */}
 }
}
