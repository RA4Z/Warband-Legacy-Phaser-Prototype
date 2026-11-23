// PRNG simples reproduzível. Todo sorteio relevante passa pelo estado da expedição.
export function rng(seed=1){let s=(seed>>>0)||1;return {next(){s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296;},int(a,b){return a+Math.floor(this.next()*(b-a+1));},pick(a){return a[this.int(0,a.length-1)];},get state(){return s>>>0;},set state(v){s=v>>>0||1;}};}
export function shuffle(array,r){const a=[...array];for(let i=a.length-1;i>0;i--){const j=r.int(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;}
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export const clamp=(a,b,c)=>Math.max(b,Math.min(c,a));
export const round=(a)=>Math.round(a*10)/10;
