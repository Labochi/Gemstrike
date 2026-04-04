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
  // ── Era 0 · Stone Era ──────────────────────────────────────────
  {n:'Dust Brick',        i:'🧱',tier:'Common',  tc:'#9E9E9E',era:0,mats:{Dust:30},                                             reward:5,   building:'Basic Hut'},
  {n:'Stone Wall',        i:'🏚️',tier:'Common',  tc:'#9E9E9E',era:0,mats:{Stone:25,Dust:15},                                    reward:10,  building:'Stone Fence'},
  {n:'Sand Glass',        i:'🪟',tier:'Common',  tc:'#9E9E9E',era:0,mats:{Sand:20,Coal:5},                                      reward:14,  building:'Window Pane'},
  {n:'Limestone Slab',    i:'⬜',tier:'Common',  tc:'#9E9E9E',era:0,mats:{Limestone:15,Stone:10},                               reward:18,  building:'Cobblestone Path'},
  {n:'Coal Furnace',      i:'🔥',tier:'Common',  tc:'#9E9E9E',era:0,mats:{Coal:20,Stone:30},                                    reward:25,  building:'Smelting Furnace'},
  // ── Era 1 · Iron Era ───────────────────────────────────────────
  {n:'Iron Ingot',        i:'🔩',tier:'Rare',    tc:'#378ADD',era:1,mats:{'Iron Ore':20,Coal:15},                               reward:40,  building:'Iron Gate'},
  {n:'Copper Pipe',       i:'🟠',tier:'Rare',    tc:'#378ADD',era:1,mats:{Copper:15,Coal:10},                                   reward:48,  building:'Water Well'},
  {n:'Stone Workshop',    i:'🔨',tier:'Rare',    tc:'#378ADD',era:1,mats:{Stone:40,Coal:20,Dust:30},                            reward:55,  building:'Craftsman Workshop'},
  {n:'Silver Bar',        i:'⚪',tier:'Rare',    tc:'#378ADD',era:1,mats:{Silver:10,Gold:5},                                    reward:70,  building:'Coin Mint'},
  {n:'Gold Vault Lock',   i:'💛',tier:'Rare',    tc:'#378ADD',era:1,mats:{Gold:15,'Iron Ore':20},                               reward:85,  building:'Treasury'},
  {n:'Quartz Clock',      i:'🔮',tier:'Rare',    tc:'#378ADD',era:1,mats:{Quartz:8,Silver:10},                                  reward:100, building:'Clocktower'},
  {n:'Iron Pickaxe',      i:'⛏️',tier:'Rare',    tc:'#378ADD',era:1,mats:{'Iron Ore':25,Coal:20,Stone:15},                     reward:75,  building:'Mine Shaft'},
  {n:'Bronze Alloy Plate',i:'🟧',tier:'Rare',    tc:'#378ADD',era:1,mats:{Copper:20,'Iron Ore':10,Coal:15},                    reward:90,  building:'Forge Upgrade'},
  // ── Era 2 · Crystal Era ────────────────────────────────────────
  {n:'Crystal Prism',     i:'🔷',tier:'Epic',    tc:'#7F77DD',era:2,mats:{Sapphire:5,Quartz:10},                               reward:150, building:'Observatory'},
  {n:'Forged Anvil',      i:'⚒️',tier:'Epic',    tc:'#7F77DD',era:2,mats:{'Iron Ore':30,Coal:25,Gold:5},                      reward:170, building:'Grand Blacksmith'},
  {n:'Amethyst Shrine',   i:'💜',tier:'Epic',    tc:'#7F77DD',era:2,mats:{Amethyst:10,Gold:8},                                 reward:200, building:'Magic Temple'},
  {n:'Ruby Hearth',       i:'🔴',tier:'Epic',    tc:'#7F77DD',era:2,mats:{Ruby:8,Coal:15,Gold:5},                              reward:230, building:'Grand Hall'},
  {n:'Emerald Garden Wall',i:'💚',tier:'Epic',   tc:'#7F77DD',era:2,mats:{Emerald:6,Sand:20,Limestone:10},                    reward:250, building:'Crystal Garden'},
  {n:'Diamond Drill Bit', i:'💎',tier:'Epic',    tc:'#7F77DD',era:2,mats:{Diamond:5,'Iron Ore':20,Quartz:8},                  reward:300, building:'Deep Mine Shaft'},
  {n:'Crystal Wand',      i:'🪄',tier:'Epic',    tc:'#7F77DD',era:2,mats:{Sapphire:8,Ruby:5,Amethyst:8},                      reward:350, building:'Mage Tower'},
  {n:'Gem Throne',        i:'👑',tier:'Epic',    tc:'#7F77DD',era:2,mats:{Diamond:8,Ruby:6,Emerald:6,Sapphire:6},             reward:500, building:'Royal Palace'},
  // ── Era 3 · Cosmic Era ─────────────────────────────────────────
  {n:'Opal Shield',       i:'🛡️',tier:'Legendary',tc:'#BA7517',era:3,mats:{'Black Opal':5,Diamond:3,'Iron Ore':10},           reward:650, building:'Fortress Wall'},
  {n:'Alexandrite Mirror',i:'🟣',tier:'Legendary',tc:'#BA7517',era:3,mats:{Alexandrite:5,Diamond:4,Gold:10},                  reward:750, building:'Astral Observatory'},
  {n:'Beryl Gauntlet',    i:'❤️',tier:'Legendary',tc:'#BA7517',era:3,mats:{'Red Beryl':4,Diamond:3,'Iron Ore':20},            reward:850, building:"Champion's Hall"},
  {n:'Crystal Dome',      i:'🏛️',tier:'Legendary',tc:'#BA7517',era:3,mats:{Diamond:10,Quartz:15,Sapphire:8},                 reward:950, building:'Grand Cathedral'},
  {n:'Painite Staff',     i:'🌟',tier:'Cosmic',  tc:'#00eaff',era:3,mats:{Painite:5,'Red Beryl':3,'Black Opal':4},           reward:1400, building:"Wizard's Spire"},
  {n:'Cosmic Engine',     i:'🌌',tier:'Cosmic',  tc:'#00eaff',era:3,mats:{'Cosmic Essence':3,Painite:2,Alexandrite:5},       reward:2200, building:'Space Port'},
  {n:'Nebula Beacon',     i:'🌠',tier:'Cosmic',  tc:'#00eaff',era:3,mats:{'Cosmic Essence':5,Alexandrite:4,'Black Opal':3},  reward:2800, building:'Astral Tower'},
  {n:'Star Forge Hammer', i:'⭐',tier:'Cosmic',  tc:'#00eaff',era:3,mats:{'Cosmic Essence':8,Painite:5,'Red Beryl':6},       reward:5000, building:'Legendary Forge'},
];

const EMPIRE_BUILDINGS={
  // Settlement
  'Basic Hut':          {zone:'Settlement',         i:'🏠',benefit:'+1 queued mining slot',         buildCost:{Stone:20,Dust:15}},
  'Stone Fence':        {zone:'Settlement',         i:'🧱',benefit:'−2% energy cost on all mines',  buildCost:{Stone:30,Dust:20}},
  'Window Pane':        {zone:'Settlement',         i:'🪟',benefit:'+5 free Dirt mines/day',        buildCost:{Sand:15,Limestone:5}},
  'Cobblestone Path':   {zone:'Settlement',         i:'🛤️',benefit:'+3% sell price bonus',          buildCost:{Limestone:20,Dust:10}},
  'Smelting Furnace':   {zone:'Settlement',         i:'🔥',benefit:'Coal cooldown −10%',            buildCost:{Coal:30,Stone:20}},
  // Industrial District
  'Iron Gate':          {zone:'Industrial District',i:'🚪',benefit:'Unlocks market improvements',   buildCost:{'Iron Ore':30,Stone:20}},
  'Water Well':         {zone:'Industrial District',i:'🪣',benefit:'+5% sell price for ores',       buildCost:{Copper:20,Stone:15}},
  'Craftsman Workshop': {zone:'Industrial District',i:'🔨',benefit:'+10% forge coin rewards',       buildCost:{Stone:50,Coal:25}},
  'Coin Mint':          {zone:'Industrial District',i:'🏦',benefit:'+5 bonus coins per conversion', buildCost:{Silver:15,Gold:8}},
  'Treasury':           {zone:'Industrial District',i:'💰',benefit:'Coin overflow protection',      buildCost:{Gold:20,'Iron Ore':25}},
  'Clocktower':         {zone:'Industrial District',i:'🕰️',benefit:'Cooldown timers shown in HUD', buildCost:{Quartz:10,Stone:30}},
  'Mine Shaft':         {zone:'Industrial District',i:'⛏️',benefit:'+1 active mining slot',         buildCost:{'Iron Ore':30,Coal:30}},
  'Forge Upgrade':      {zone:'Industrial District',i:'⚒️',benefit:'Unlocks Era 2 forge recipes',  buildCost:{Copper:25,'Iron Ore':20}},
  // Crystal Quarter
  'Observatory':        {zone:'Crystal Quarter',    i:'🔭',benefit:'Reveals rare mineral odds',     buildCost:{Sapphire:8,Quartz:15}},
  'Grand Blacksmith':   {zone:'Crystal Quarter',    i:'🗡️',benefit:'+15% forge coin rewards',       buildCost:{'Iron Ore':40,Coal:30}},
  'Magic Temple':       {zone:'Crystal Quarter',    i:'💜',benefit:'+5% $MNRL per mine',            buildCost:{Amethyst:15,Gold:10}},
  'Grand Hall':         {zone:'Crystal Quarter',    i:'🏰',benefit:'+2 mining queue slots',         buildCost:{Ruby:10,Gold:8}},
  'Crystal Garden':     {zone:'Crystal Quarter',    i:'🌿',benefit:'+10% sell price for gems',      buildCost:{Emerald:8,Sand:25}},
  'Deep Mine Shaft':    {zone:'Crystal Quarter',    i:'💎',benefit:'+1 active mining slot',         buildCost:{Diamond:6,'Iron Ore':25}},
  'Mage Tower':         {zone:'Crystal Quarter',    i:'🪄',benefit:'Unlocks Era 3 forge recipes',  buildCost:{Sapphire:10,Ruby:8}},
  'Royal Palace':       {zone:'Crystal Quarter',    i:'👑',benefit:'+20% all coin gains',           buildCost:{Diamond:10,Ruby:8,Emerald:8}},
  // Cosmic Citadel
  'Fortress Wall':      {zone:'Cosmic Citadel',     i:'🛡️',benefit:'Reduces market tax to 3%',     buildCost:{'Black Opal':6,Diamond:4}},
  'Astral Observatory': {zone:'Cosmic Citadel',     i:'🌌',benefit:'+10% $MNRL yield',             buildCost:{Alexandrite:6,Gold:12}},
  "Champion's Hall":    {zone:'Cosmic Citadel',     i:'🏆',benefit:'+3 active mining slots',       buildCost:{'Red Beryl':5,'Iron Ore':25}},
  'Grand Cathedral':    {zone:'Cosmic Citadel',     i:'⛪',benefit:'+25% all coin gains',          buildCost:{Diamond:12,Quartz:20}},
  "Wizard's Spire":     {zone:'Cosmic Citadel',     i:'🌟',benefit:'+15% $MNRL yield',             buildCost:{Painite:6,'Red Beryl':4}},
  'Space Port':         {zone:'Cosmic Citadel',     i:'🚀',benefit:'Unlocks Cosmic forge recipes', buildCost:{'Cosmic Essence':4,Painite:3}},
  'Astral Tower':       {zone:'Cosmic Citadel',     i:'🌠',benefit:'+5% energy efficiency',        buildCost:{'Cosmic Essence':6,Alexandrite:5}},
  'Legendary Forge':    {zone:'Cosmic Citadel',     i:'⭐',benefit:'Max forge rewards doubled',    buildCost:{'Cosmic Essence':10,Painite:6}},
};

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
  crafted:{},empire:[],empireLayout:[],passPremium:false,_id:0,
};
