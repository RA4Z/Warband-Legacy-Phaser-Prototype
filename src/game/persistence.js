import {rng} from '../core/random.js';
import {VERSION} from './data.js';
import {makeInitialRoster} from './units.js';
export const SAVE_KEY='warband-legacy-save-v2';
export function freshMeta(){const r=rng(31415926),roster=makeInitialRoster(r);return {version:VERSION,created:Date.now(),legacy:3,upgrades:{infirmary:0,quarters:0,academy:0,command:0},roster,selectedIds:roster.slice(0,5).map(s=>s.id),memorial:[],runNumber:0,wins:0,losses:0,commander:'iron',settings:{sound:true,quality:'medium'},activeRun:null,history:[],nextId:100,tutorialShown:false};}
export function loadMeta(storage=globalThis.localStorage){try{const raw=storage.getItem(SAVE_KEY);if(!raw)return freshMeta();const data=JSON.parse(raw);if(data?.version!==VERSION||!Array.isArray(data.roster)||!data.upgrades||!Array.isArray(data.selectedIds)||!Array.isArray(data.memorial))throw Error('incompatible');return data;}catch(e){console.warn('Save inválido; início seguro sem sobrescrever até novo save',e);return freshMeta();}}
export function saveMeta(meta,storage=globalThis.localStorage){try{storage.setItem(SAVE_KEY,JSON.stringify(meta));return true;}catch(e){console.warn('Não foi possível salvar',e);return false;}}
export function clearSave(storage=globalThis.localStorage){storage.removeItem(SAVE_KEY);}
