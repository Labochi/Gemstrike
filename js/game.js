function nid(){return ++G._id;}
function fmtT(ms){
  if(ms<=0)return'READY';const s=Math.ceil(ms/1000);
  if(s<60)return s+'s';
  if(s<3600)return Math.floor(s/60)+'m'+(s%60?' '+(s%60)+'s':'');
  if(s<86400)return Math.floor(s/3600)+'h'+(Math.floor((s%3600)/60)?' '+Math.floor((s%3600)/60)+'m':'');
  return Math.floor(s/86400)+'d '+Math.floor((s%86400)/3600)+'h';
}
function fmtN(n){n=Number(n)||0;if(n>=1e6)return(n/1e6).toFixed(1)+'M';if(n>=1e3)return(n/1e3).toFixed(1)+'K';return Math.floor(n)+'';}
function getRes(k){return G.res[k]||0;}
function addRes(k,v){G.res[k]=(G.res[k]||0)+v;}
function availMins(){return MINERALS.filter(function(m){return m.era<=G.era;});}
function curMin(){var av=availMins();return av[Math.min(G.selIdx,av.length-1)];}
function maxSlots(){return G.passPremium?VIP_SLOTS:FREE_SLOTS;}
function totalUsed(){return G.slots.length+G.queue.length;}
function slotsAvail(){return G.slots.length<maxSlots();}
function canQueue(){return totalUsed()<maxSlots();}
function isQuestClaimed(i){return G.questClaimed.indexOf(i)!==-1;}

function updateQP(key,val){
  QUESTS.forEach(function(q,i){
    if(isQuestClaimed(i))return;
    if(q.key===key)G.quests[i]=Math.min(q.goal,val);
  });
}

function claimableCount(){
  return QUESTS.filter(function(q,i){
    return !isQuestClaimed(i)&&(G.quests[i]||0)>=q.goal;
  }).length;
}


function tickSlots(){
  var now=Date.now();var changed=false;var still=[];
  G.slots.forEach(function(s){
    var m=MINERALS[s.mIdx];
    if(s.endTime<=now&&m){
      G.ready.push({mIdx:s.mIdx,id:s.id,res:m.res,resI:m.resI,color:m.c,n:m.n});
      changed=true;
    } else still.push(s);
  });
  G.slots=still;
  while(G.queue.length>0&&G.slots.length<maxSlots()){
    var next=G.queue.shift();var m=MINERALS[next.mIdx];
    if(m){G.slots.push({mIdx:next.mIdx,endTime:now+m.t*1000,id:next.id});changed=true;}
  }
  return changed;
}

function collectItem(id){
  var idx=-1;
  for(var i=0;i<G.ready.length;i++){if(G.ready[i].id===id){idx=i;break;}}
  if(idx===-1)return;
  var r=G.ready[idx];
  addRes(r.res,1);
  updateQP('r_'+r.res,getRes(r.res));
  G.ready.splice(idx,1);
  spawnFloat('+1 '+r.res,r.color,80,200);
  showToast(r.resI+' +1 '+r.res+' collected!');
  saveGame();
  updateMineView();
}

function handleMine(){
  var m=curMin();var mIdx=MINERALS.indexOf(m);
  var isDirt=!!m.free;var dirtLeft=DIRT_DAILY-G.dirtMines;
  var hasNrg=isDirt||(G.nrg>=m.nrg);
  if(isDirt&&dirtLeft<=0){showToast('🔒 Daily Dirt limit. Resets at 8am UTC','#e94560');return;}
  if(!hasNrg){switchTab('shop');showToast('⚡ Not enough energy!','#e94560');return;}
  if(!canQueue()){showToast('⛔ All '+maxSlots()+' slots full. Collect first!','#e94560');return;}
  if(isDirt)G.dirtMines++;else G.nrg-=m.nrg;
  var id=nid();
  if(slotsAvail()){
    G.slots.push({mIdx:mIdx,endTime:Date.now()+m.t*1000,id:id});G.starts++;
    updateQP('starts',G.starts);
    showToast('⛏️ Mining '+m.n+'… ('+G.slots.length+'/'+maxSlots()+' slots used)');
  } else {
    G.queue.push({mIdx:mIdx,id:id});
    showToast('📋 '+m.n+' queued ('+(G.slots.length+G.queue.length)+'/'+maxSlots()+' total)','var(--coin)');
  }
  saveGame();updateMineView();
}

function gameLoop(){
  tickSlots();
  if(currentTab==='mine')updateMineView();
  updateHUD();
  if(Math.random()<0.005)saveGame();
  requestAnimationFrame(gameLoop);
}

function startLoadingScreen(onDone){
  var bar=document.getElementById('ls-bar');
  var screen=document.getElementById('loading-screen');
  var progress=0;
  var iv=setInterval(function(){
    progress+=Math.random()*18+6;
    if(progress>=100){
      progress=100;
      clearInterval(iv);
      bar.style.width='100%';
      setTimeout(function(){
        screen.classList.add('fade-out');
        setTimeout(function(){screen.style.display='none';if(onDone)onDone();},600);
      },350);
    }
    bar.style.width=progress+'%';
  },80);
}

// ── DEV HELPER ─────────────────────────────────────────────────────────────
window.devFill=function(){
  G.coins=999999;G.mnrl=9999;G.nrg=9999;G.era=3;
  MINERALS.forEach(function(m){G.res[m.res]=500;});
  FORGE_RECIPES.forEach(function(r){G.crafted[r.n]=10;});
  saveGame();updateHUD();renderScroll();
  showToast('🛠️ Dev fill applied!','#a855f7');
};
