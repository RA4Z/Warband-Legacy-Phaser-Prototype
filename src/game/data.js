export const VERSION=2;
export const CLASSES={
  swordsman:{name:'Espadachim',icon:'⚔',hp:100,attack:15,defense:10,range:1.65,cooldown:1.1,speed:4.25,role:'front',color:'#e0c4a2'},
  guardian:{name:'Guardião',icon:'⬡',hp:165,attack:9,defense:24,range:1.55,cooldown:1.4,speed:3.65,role:'front',color:'#9daec7'},
  spearman:{name:'Lanceiro',icon:'↟',hp:110,attack:14,defense:11,range:2.65,cooldown:1.3,speed:4.1,role:'front',color:'#dec18a'},
  archer:{name:'Arqueiro',icon:'➶',hp:72,attack:19,defense:4,range:10.5,cooldown:1.7,speed:4.35,role:'back',color:'#98cb8d'},
  mystic:{name:'Místico',icon:'✦',hp:68,attack:24,defense:3,range:9,cooldown:2.2,speed:4.1,role:'back',color:'#c3a8e8'},
  healer:{name:'Curandeiro',icon:'✚',hp:85,attack:5,defense:6,range:8.5,cooldown:2.6,speed:4.2,role:'back',color:'#f0e4ac'},
};
export const TRAITS={sturdy:{name:'Resistente',desc:'+12% PV',hp:1.12},swift:{name:'Ágil',desc:'+10% velocidade',speed:1.1},precise:{name:'Preciso',desc:'+10% ataque',attack:1.1},careful:{name:'Prudente',desc:'-10 p.p. chance de morte',survive:0.1}};
export const GRADES=['recruit','veteran','elite','legendary'];
export const GRADE_NAME={recruit:'Recruta',veteran:'Veterano',elite:'Elite',legendary:'Lendário'};
export const GRADE_MIN={veteran:3,elite:6,legendary:9};
export const GRADE_COST={veteran:3,elite:7,legendary:13};
export const ENEMIES={
  raider:{name:'Saqueador',hp:75,attack:11,defense:5,range:1.5,cooldown:1.45,speed:3.75,color:'#a94e4d',classId:'swordsman'},
  brute:{name:'Brutamontes',hp:135,attack:13,defense:16,range:1.65,cooldown:1.85,speed:2.85,color:'#ad6a53',classId:'guardian'},
  marksman:{name:'Atirador',hp:58,attack:12,defense:3,range:9.2,cooldown:2.05,speed:3.6,color:'#9c576c',classId:'archer'},
  shaman:{name:'Xamã',hp:72,attack:18,defense:3,range:8,cooldown:2.35,speed:3.25,color:'#9d6ea5',classId:'mystic'},
  warlord:{name:'Lorde da Cinza',hp:560,attack:24,defense:20,range:2.15,cooldown:1.6,speed:3.5,color:'#e17b55',classId:'guardian',boss:true}
};
export const COMMANDERS={iron:{name:'Capitão de Ferro',subtitle:'Grito de guerra + Golpe heroico',color:'#dcb56e',a1:'Brado',a2:'Golpe'},valley:{name:'Estrategista do Vale',subtitle:'Proteção + Saraivada',color:'#74c7b9',a1:'Proteção',a2:'Saraivada'}};
export const PERKS=[
 {id:'shield',name:'Escudos Reforçados',icon:'⬡',desc:'+15% defesa dos Guardiões'},
 {id:'arrows',name:'Treino de Arco',icon:'➶',desc:'+12% ataque dos Arqueiros'},
 {id:'march',name:'Marcha Rápida',icon:'↟',desc:'+8% velocidade de todos'},
 {id:'healing',name:'Medicina de Campanha',icon:'✚',desc:'+15% cura dos Curandeiros'},
 {id:'health',name:'Disciplina',icon:'♥',desc:'+10% vida máxima dos soldados'},
 {id:'charge',name:'Investida Coordenada',icon:'⚔',desc:'+10% dano de todos'},
 {id:'spears',name:'Lanças Longas',icon:'⌁',desc:'+15% alcance dos Lanceiros'},
 {id:'magic',name:'Rituais Arcanos',icon:'✦',desc:'+15% ataque dos Místicos'},
 {id:'fury',name:'Última Resistência',icon:'♨',desc:'+20% dano com menos de 40% PV'},
 {id:'loot',name:'Bolsas de Saque',icon:'◈',desc:'+20% moedas de vitória'},
 {id:'supplies',name:'Intendência',icon:'▣',desc:'+1 suprimento por baú'},
 {id:'xp',name:'Veterania Acelerada',icon:'★',desc:'+20% experiência dos soldados'}
];
export const UPGRADE_DATA={
 infirmary:{name:'Enfermaria',icon:'✚',max:3,cost:[5,10,17],desc:l=>`Risco de morte: ${35-l*4}% (mais traços)`},
 quarters:{name:'Alojamentos',icon:'⌂',max:2,cost:[7,15],desc:l=>`Capacidade permanente: ${12+l*4}`},
 academy:{name:'Academia',icon:'★',max:3,cost:[5,9,15],desc:l=>`XP adicional: ${l*8}%`},
 command:{name:'Mesa de Comando',icon:'⚑',max:2,cost:[6,13],desc:l=>`Vida do comandante: +${l*8}%`}
};
export const FIRST_NAMES=['Aldren','Brina','Cael','Dora','Eron','Fara','Garen','Helia','Ivar','Jora','Kael','Lyra','Merek','Nara','Orin','Petra','Roder','Selia','Tarin','Vera','Yoren','Zara','Borin','Elric','Mira','Talia','Oren','Freya'];
export const LAST_NAMES=['Pedrafria','Valeverde','Ferroalto','de Arven','Carvalho','da Névoa','Corvoclaro','do Norte','Seta Ágil','do Prado','Luar','Mão Firme'];
