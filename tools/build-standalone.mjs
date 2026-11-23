// Offline bundle builder (not a general-purpose bundler): files ordered by known dependencies.
import {readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const files=[
 'src/core/random.js','src/game/data.js','src/game/units.js','src/game/world.js','src/game/persistence.js','src/game/simulation.js',
 'src/render/geometry.js','src/render/renderer.js','src/audio/sound.js','src/ui/interface.js','src/main.js'
];
let js='"use strict";\n';
for(const file of files){let contents=await readFile(resolve(root,file),'utf8');contents=contents.replace(/^import\s+[^;]+;\s*$/gm,'').replace(/^export\s+(?=(?:const|let|class|function))/gm,'');js+=`\n// ${file}\n${contents}\n`;}
const css=await readFile(resolve(root,'src/ui/styles.css'),'utf8');
const html=await readFile(resolve(root,'index.html'),'utf8');
const output=html.replace('<link rel="stylesheet" href="./src/ui/styles.css" />',`<style>${css}</style>`).replace('<script type="module" src="./src/main.js"></script>',`<script>${js.replaceAll('</script>','<\\/script>')}</script>`);
const outfile=resolve(root,'Warband_Legacy_JOGAR.html');await writeFile(outfile,output);console.log('Standalone HTML:',outfile,output.length,'chars');
