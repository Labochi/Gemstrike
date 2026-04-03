const DIRT_DAILY=30,FREE_SLOTS=3,VIP_SLOTS=5;

// coinVal  = round(nrg × 0.36), min 1
// t        = round(nrg^1.5 × 1.5) seconds, rounded to a clean value
// Profit   = (0.36 − energyPack_cost_per_nrg) / energyPack_cost_per_nrg
//   ranges ~4 % (75-nrg pack) → ~16 % (2000-nrg pack)
const MINERALS=[
  {n:'Dirt',      i:'🟫',c:'#8B5E3C',res:'Dust',         resI:'💨',t:5,    era:0,nrg:0,  coinVal:1,  free:true},
  {n:'Gravel',    i:'🪨',c:'#9E9E9E',res:'Stone',         resI:'🪨',t:15,   era:0,nrg:5,  coinVal:2},
  {n:'Sand',      i:'🟡',c:'#C8A84B',res:'Sand',          resI:'🟡',t:35,   era:0,nrg:8,  coinVal:3},
  {n:'Limestone', i:'⬜',c:'#c8c8c8',res:'Limestone',     resI:'⬜',t:60,   era:0,nrg:12, coinVal:4},
  {n:'Coal',      i:'🖤',c:'#aaaaaa',res:'Coal',          resI:'🖤',t:90,   era:0,nrg:15, coinVal:5},
  {n:'Iron',      i:'🔩',c:'#B87333',res:'Iron Ore',      resI:'🔩',t:135,  era:1,nrg:20, coinVal:7},
  {n:'Copper',    i:'🟠',c:'#DA8A67',res:'Copper',        resI:'🟠',t:180,  era:1,nrg:25, coinVal:9},
  {n:'Silver',    i:'⚪',c:'#C0C0C0',res:'Silver',        resI:'⚪',t:240,  era:1,nrg:30, coinVal:11},
  {n:'Gold',      i:'💛',c:'#FFD700',res:'Gold',          resI:'💛',t:360,  era:1,nrg:40, coinVal:14},
  {n:'Quartz',    i:'🔮',c:'#b0d8ff',res:'Quartz',        resI:'🔮',t:540,  era:1,nrg:50, coinVal:18},
  {n:'Amethyst',  i:'💜',c:'#9B59B6',res:'Amethyst',      resI:'💜',t:720,  era:2,nrg:60, coinVal:22},
  {n:'Sapphire',  i:'🔷',c:'#2980B9',res:'Sapphire',      resI:'🔷',t:960,  era:2,nrg:75, coinVal:27},
  {n:'Ruby',      i:'🔴',c:'#E74C3C',res:'Ruby',          resI:'🔴',t:1260, era:2,nrg:90, coinVal:32},
  {n:'Emerald',   i:'💚',c:'#27AE60',res:'Emerald',       resI:'💚',t:1500, era:2,nrg:100,coinVal:36},
  {n:'Diamond',   i:'💎',c:'#76D7EA',res:'Diamond',       resI:'💎',t:1980, era:2,nrg:120,coinVal:43},
  {n:'Black Opal',i:'🌑',c:'#7700cc',res:'Black Opal',    resI:'🌑',t:2700, era:3,nrg:150,coinVal:54},
  {n:'Alexandrite',i:'🟣',c:'#8E44AD',res:'Alexandrite',  resI:'🟣',t:3600, era:3,nrg:180,coinVal:65},
  {n:'Red Beryl', i:'❤️',c:'#C0392B',res:'Red Beryl',     resI:'❤️',t:4800, era:3,nrg:220,coinVal:79},
  {n:'Painite',   i:'✨',c:'#9B59B6',res:'Painite',       resI:'✨',t:7200, era:3,nrg:280,coinVal:101},
  {n:'Cosmic Gem',i:'🌌',c:'#00eaff',res:'Cosmic Essence',resI:'🌌',t:10800,era:3,nrg:350,coinVal:126},
];

const ERAS=[
  {n:'🪨 Stone Era', c:'#9E9E9E',req:{cosmic:0,mnrl:0},  desc:'Minerals 1–5'},
  {n:'🔥 Iron Era',  c:'#B87333',req:{cosmic:5,mnrl:50}, desc:'Minerals 1–10'},
  {n:'💎 Crystal Era',c:'#76D7EA',req:{cosmic:20,mnrl:200},desc:'Minerals 1–15'},
  {n:'🌌 Cosmic Era', c:'#00eaff',req:{cosmic:100,mnrl:1000},desc:'All 20 minerals'},
];

const FORGE_RECIPES=[
  {n:'Dust Brick',  i:'🧱',tier:'Common',  tc:'#9E9E9E',mats:{Dust:30},reward:3},
  {n:'Stone Tool',  i:'🔨',tier:'Common',  tc:'#9E9E9E',mats:{Stone:20,Coal:10},reward:8},
  {n:'Iron Blade',  i:'🗡️',tier:'Rare',   tc:'#378ADD',mats:{'Iron Ore':15,Coal:20},reward:20},
  {n:'Gold Ring',   i:'💍',tier:'Epic',    tc:'#7F77DD',mats:{Gold:10,Silver:15},reward:60},
  {n:'Crystal Lens',i:'🔭',tier:'Legendary',tc:'#BA7517',mats:{Diamond:5,Sapphire:8},reward:150},
  {n:'Cosmic Shard',i:'⚡',tier:'Cosmic',  tc:'#00eaff',mats:{Painite:3,'Cosmic Essence':1},reward:500},
];

const QUESTS=[
  {n:'First Strike',desc:'Start mining 5 times',  goal:5,  key:'starts',reward:5},
  {n:'Dust Keeper', desc:'Collect 50 Dust',        goal:50, key:'r_Dust',reward:10},
  {n:'Rock Solid',  desc:'Collect 20 Stone',       goal:20, key:'r_Stone',reward:15},
  {n:'Forgemaster', desc:'Forge any item 3 times', goal:3,  key:'forges',reward:25},
  {n:'Coal Baron',  desc:'Collect 15 Coal',        goal:15, key:'r_Coal',reward:30},
];

const MKT=[
  {n:'Stone ×50',    i:'🪨',qty:50, price:15,seller:'RockStar99',res:'Stone'},
  {n:'Coal ×30',     i:'🖤',qty:30, price:25,seller:'CoalKing',  res:'Coal'},
  {n:'Iron Ore ×20', i:'🔩',qty:20, price:60,seller:'IronForge', res:'Iron Ore'},
  {n:'Stone Tool NFT',i:'🔨',qty:1, price:80,seller:'CraftMstr', nft:true,gs:'pickaxe',gn:'Stone Tool'},
  {n:'Gold Ring NFT', i:'💍',qty:1, price:250,seller:'GemLord',  nft:true,gs:'accessory',gn:'Gold Ring'},
];

const GEAR_SLOTS=[
  {slot:'pickaxe',  icon:'⛏️',name:'Pickaxe',   effect:'Reduces cooldown'},
  {slot:'shirt',    icon:'👕',name:'Shirt',     effect:'Boosts yield'},
  {slot:'helmet',   icon:'⛑️',name:'Helmet',   effect:'XP bonus'},
  {slot:'gloves',   icon:'🧤',name:'Gloves',   effect:'Forge speed'},
  {slot:'boots',    icon:'👢',name:'Boots',     effect:'Market fee −'},
  {slot:'accessory',icon:'💍',name:'Accessory',effect:'Special effect'},
];

// Energy packs — cost/nrg decreases with size, giving more sell-profit on larger buys
// Profit % = (0.36 − coins/nrg) / (coins/nrg)
const SHOP_NRG=[
  {label:'75 Energy',   nrg:75,   coins:26,  icon:'⚡',      profit:'~4%'},
  {label:'150 Energy',  nrg:150,  coins:51,  icon:'⚡⚡',    profit:'~6%'},
  {label:'300 Energy',  nrg:300,  coins:100, icon:'⚡⚡⚡',  profit:'~8%'},
  {label:'500 Energy',  nrg:500,  coins:163, icon:'⚡⚡⚡⚡', profit:'~10%'},
  {label:'750 Energy',  nrg:750,  coins:241, icon:'⚡×5',    profit:'~12%'},
  {label:'1000 Energy', nrg:1000, coins:317, icon:'⚡×6',    profit:'~14%'},
  {label:'1500 Energy', nrg:1500, coins:469, icon:'⚡×7',    profit:'~15%'},
  {label:'2000 Energy', nrg:2000, coins:620, icon:'⚡×8',    profit:'~16%'},
];

let G={
  mnrl:0,coins:100,nrg:100,era:0,selIdx:0,
  res:{},slots:[],queue:[],ready:[],
  gear:{pickaxe:null,shirt:null,helmet:null,gloves:null,boots:null,accessory:null},
  quests:{},questClaimed:[],
  starts:0,forges:0,dirtMines:0,dirtReset:0,
  passPremium:false,_id:0,
};
