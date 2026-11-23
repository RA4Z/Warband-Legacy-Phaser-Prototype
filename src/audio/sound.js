// Pequenos efeitos sintéticos originais: sem arquivos externos e sem autoplay.
export class Sound {
 constructor(){this.ctx=null;this.enabled=true;this.last=0;}
 play(type='tap'){if(!this.enabled)return;try{this.ctx||=new (window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume();const ctx=this.ctx,osc=ctx.createOscillator(),amp=ctx.createGain(),start=ctx.currentTime;osc.type=type==='skill'?'sawtooth':'sine';const freq=type==='skill'?270:type==='victory'?520:type==='hit'?130:370;osc.frequency.setValueAtTime(freq,start);osc.frequency.exponentialRampToValueAtTime(type==='skill'?110:freq*1.35,start+.09);amp.gain.setValueAtTime(.0001,start);amp.gain.exponentialRampToValueAtTime(type==='skill'?.065:.027,start+.015);amp.gain.exponentialRampToValueAtTime(.0001,start+.14);osc.connect(amp);amp.connect(ctx.destination);osc.start(start);osc.stop(start+.16);}catch{}}
}
