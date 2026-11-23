import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const port=Number(process.env.PORT||5173);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml; charset=utf-8','.png':'image/png'};
createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,`http://localhost:${port}`).pathname);
    const path=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end('Forbidden');return;}
    const file=await stat(path);if(!file.isFile())throw new Error('not file');
    const body=await readFile(path);
    res.writeHead(200,{'content-type':mime[extname(path)]||'application/octet-stream','cache-control':'no-cache'});res.end(body);
  }catch{res.writeHead(404);res.end('Not found');}
}).listen(port,'0.0.0.0',()=>console.log(`Warband Legacy: http://localhost:${port}`));
