import {Game} from './game/simulation.js';
import {Renderer} from './render/renderer.js';
import {Interface} from './ui/interface.js';
import {Sound} from './audio/sound.js';
const errorToUser=(err)=>{console.error(err);document.querySelector('#ui').innerHTML=`<div style="position:absolute;inset:0;background:#0c2426;padding:3rem;display:grid;place-items:center;color:#f5e0ba"><div><h1>Não foi possível iniciar Warband Legacy</h1><p>${String(err.message||err)}</p><p>É necessário um navegador atualizado com suporte a WebGL2.</p></div></div>`;};
try{
 const game=new Game(),renderer=new Renderer(document.querySelector('#scene'),document.querySelector('#overlay')),ui=new Interface(game,renderer),sound=new Sound();ui.sound=sound;game.sfx=sound;sound.enabled=game.meta.settings.sound;
 renderer.canvas.addEventListener('wheel',e=>{e.preventDefault();renderer.zoom=Math.max(17,Math.min(35,renderer.zoom+Math.sign(e.deltaY)*1.8));},{passive:false});
 game.onChange((event)=>{if(event==='finished'){sound.play(game.run?.victory?'victory':'hit');}if(event==='encounterStarted')sound.play('hit');if(event==='runStarted')renderer.setWorld(game.run.world);});
 let last=performance.now();function loop(now){const dt=Math.min(.1,(now-last)/1000);last=now;game.input=ui.getInput();if(!ui.isPaused()&&ui.screen==='play'){game.update(dt);}renderer.render(game.run,game.run?.elapsed||now/1000);ui.update(now);requestAnimationFrame(loop);}requestAnimationFrame(loop);
 // Objetos públicos apenas para inspeção manual em desenvolvimento.
 if(new URLSearchParams(location.search).has('debug'))window.__warband={game,renderer,ui};
}catch(error){errorToUser(error);}
