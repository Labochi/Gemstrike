function showToast(msg,color){
  var t=document.getElementById('toast');if(!t)return;
  t.textContent=msg;t.style.color=color||'var(--mnrl)';
  t.classList.add('show');clearTimeout(t._t);
  t._t=setTimeout(function(){t.classList.remove('show');},2500);
}

function spawnFloat(txt,color,x,y){
  var d=document.createElement('div');
  d.className='float-pop';d.textContent=txt;
  d.style.cssText='left:'+x+'px;top:'+y+'px;color:'+(color||'#4fffb0');
  document.body.appendChild(d);
  setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},1000);
}

var currentTab='mine';

function switchTab(tab){
  currentTab=tab;
  document.querySelectorAll('.nav-btn').forEach(function(b){
    b.classList.toggle('active',b.dataset.tab===tab);
  });
  var ms=document.getElementById('mine-scene');
  var sc=document.getElementById('scroll-content');
  if(tab==='mine'){ms.style.display='flex';sc.style.display='none';}
  else{ms.style.display='none';sc.style.display='block';renderScroll();}
  updateHUD();
}

function updateHUD(){
  var me=document.getElementById('h-mnrl');if(me)me.textContent=G.mnrl.toFixed(3);
  var ce=document.getElementById('h-coin');if(ce)ce.textContent=fmtN(G.coins);
  var ne=document.getElementById('h-nrg');if(ne)ne.textContent=Math.floor(G.nrg);
  var re=document.getElementById('rb-era');if(re)re.textContent='ERA '+G.era;
  var rq=document.getElementById('rb-q');if(rq)rq.textContent=claimableCount();
}

function updateMineView(){
  tickSlots();
  var av=availMins();if(!av.length)return;
  G.selIdx=Math.min(G.selIdx,av.length-1);
  var m=curMin();var mIdx=MINERALS.indexOf(m);
  var now=Date.now();
  var isDirt=!!m.free;var dirtLeft=DIRT_DAILY-G.dirtMines;
  var hasNrg=isDirt||(G.nrg>=m.nrg);
  var CIRC=2*Math.PI*62;
  var myActive=G.slots.filter(function(s){return s.mIdx===mIdx;}).sort(function(a,b){return a.endTime-b.endTime;});
  var earliest=myActive[0];
  var rem=earliest?Math.max(0,earliest.endTime-now):0;
  var frac=earliest?Math.max(0,1-rem/(m.t*1000)):0;
  var myQueued=G.queue.filter(function(q){return q.mIdx===mIdx;}).length;

  var sb=document.getElementById('stone-btn');
  if(sb){sb.textContent=m.i;sb.style.borderColor=m.c;sb.style.background='radial-gradient(circle at 38% 38%, '+m.c+'44, '+m.c+'11)';sb.style.boxShadow=canQueue()&&hasNrg&&(!isDirt||dirtLeft>0)?'0 0 16px '+m.c+'44':'none';sb.style.opacity=!canQueue()||(!hasNrg&&!isDirt)||(isDirt&&dirtLeft<=0)?'0.6':'1';}
  var ring=document.getElementById('s-ring');
  if(ring){ring.style.stroke=m.c;ring.style.strokeDashoffset=CIRC*(1-frac);}
  var nmTxt=document.getElementById('min-name-txt');
  if(nmTxt){nmTxt.textContent=m.n.toUpperCase();nmTxt.style.color=m.c;}
  var tmrTxt=document.getElementById('min-timer-txt');
  if(tmrTxt){tmrTxt.textContent=myActive.length?fmtT(rem):'──';tmrTxt.style.color=myActive.length?m.c:'rgba(255,255,255,0.25)';}
  var subTxt=document.getElementById('min-sub-txt');
  if(subTxt)subTxt.textContent=(isDirt?'Free mine':'⚡'+m.nrg+' energy')+' · '+m.resI+' '+m.res;
  var slotTxt=document.getElementById('min-slot-txt');
  if(slotTxt){var parts=[];if(myActive.length)parts.push(myActive.length+' running');if(myQueued)parts.push(myQueued+' queued');slotTxt.textContent=parts.join(' · ');slotTxt.style.color=myQueued?'var(--coin)':'var(--mnrl)';}
  var df=document.getElementById('dirt-info');
  if(df)df.textContent=isDirt?(dirtLeft+'/'+DIRT_DAILY+' free · resets '+dirtResetsIn()):'';
  var btn=document.getElementById('mine-btn');
  if(btn){
    if(isDirt&&dirtLeft<=0){btn.className='lim';btn.textContent='🔒 DAILY LIMIT';}
    else if(!hasNrg&&!isDirt){btn.className='nrg';btn.textContent='⚡ NEED ENERGY';}
    else if(!canQueue()){btn.className='full';btn.textContent='⛔ ALL SLOTS FULL';}
    else if(!slotsAvail()){btn.className='queue';btn.textContent='📋 ADD TO QUEUE';}
    else{btn.className='go';btn.textContent='⛏️ START MINING';}
  }

  var sb2=document.getElementById('slot-bar');
  if(sb2){
    var max=maxSlots();var html='';
    for(var i=0;i<max;i++){
      var s=G.slots[i];var q=!s?G.queue[i-G.slots.length]:null;
      if(s){var sm=MINERALS[s.mIdx];html+='<div class="slot-pip used" title="'+(sm?sm.n:'?')+'">'+(sm?sm.i:'?')+'</div>';}
      else if(q){var qm=MINERALS[q.mIdx];html+='<div class="slot-pip queued-pip" title="Queued: '+(qm?qm.n:'?')+'">'+(qm?qm.i:'?')+'</div>';}
      else html+='<div class="slot-pip empty">○</div>';
    }
    if(!G.passPremium)for(var j=0;j<VIP_SLOTS-FREE_SLOTS;j++)html+='<div class="slot-pip locked" title="VIP only">🔒</div>';
    sb2.innerHTML=html;
  }

  var lc=document.getElementById('left-col');
  if(lc){
    lc.innerHTML='';
    G.ready.forEach(function(r){
      var bub=document.createElement('div');
      bub.className='bubble rdy';
      bub.style.cursor='pointer';
      bub.innerHTML='<span class="bi">'+r.resI+'</span><div class="bn" style="color:#4fffb0">'+r.n+'</div><div class="bt" style="color:#4fffb0">COLLECT</div>';
      var capturedId=r.id;
      bub.addEventListener('pointerdown',function(e){e.stopPropagation();collectItem(capturedId);});
      lc.appendChild(bub);
    });
    G.slots.forEach(function(s){
      var sm=MINERALS[s.mIdx];if(!sm)return;
      var sr=Math.max(0,s.endTime-now);
      var bub=document.createElement('div');
      bub.className='bubble';
      bub.style.borderColor=sm.c+'44';
      bub.innerHTML='<span class="bi">'+sm.i+'</span><div class="bn">'+sm.n+'</div><div class="bt" style="color:'+sm.c+'">'+fmtT(sr)+'</div>';
      lc.appendChild(bub);
    });
    G.queue.forEach(function(q){
      var qm=MINERALS[q.mIdx];if(!qm)return;
      var bub=document.createElement('div');
      bub.className='bubble';
      bub.style.borderColor='rgba(247,201,72,0.35)';
      bub.innerHTML='<span class="bi">'+qm.i+'</span><div class="bn">'+qm.n+'</div><div class="bt" style="color:var(--coin)">NEXT</div>';
      lc.appendChild(bub);
    });
    if(lc.children.length===0){
      lc.innerHTML='<div style="font-size:8px;color:var(--dim);padding:4px;text-align:center">No active<br>mining</div>';
    }
  }

  var dots=document.getElementById('min-dots');
  if(dots){
    var show=Math.min(av.length,7);var start=Math.max(0,Math.min(G.selIdx-3,av.length-show));
    var dhtml='';
    for(var di=0;di<show;di++){var ai=start+di;var ac=ai===G.selIdx;dhtml+='<div class="dot'+(ac?' cur':'')+'" style="'+(ac?'background:'+m.c:'')+'" ></div>';}
    dots.innerHTML=dhtml;
  }
}

function openInv(){renderInv();document.getElementById('inv-panel').classList.add('open');document.getElementById('inv-overlay').classList.add('show');}
function closeInv(){document.getElementById('inv-panel').classList.remove('open');document.getElementById('inv-overlay').classList.remove('show');}
var GRID_W=16,GRID_H=16,CELL=36;
var empState={placing:null,movingIdx:null};
var empTab='map';

function bldSize(n){var eb=EMPIRE_BUILDINGS[n];if(!eb)return 2;return(eb.zone==='Crystal Quarter'||eb.zone==='Cosmic Citadel')?3:2;}
function canPlaceAt(n,gx,gy,skipIdx){
  var s=bldSize(n);
  if(gx<0||gy<0||gx+s>GRID_W||gy+s>GRID_H)return false;
  return!(G.empireLayout||[]).some(function(b,i){
    if(i===skipIdx)return false;
    var bs=bldSize(b.n);
    return!(gx>=b.x+bs||gx+s<=b.x||gy>=b.y+bs||gy+s<=b.y);
  });
}
function openEmpire(){empState.placing=null;empState.movingIdx=null;renderEmpire();document.getElementById('empire-panel').classList.add('open');document.getElementById('empire-overlay').classList.add('show');}
function closeEmpire(){empState.placing=null;empState.movingIdx=null;document.getElementById('empire-panel').classList.remove('open');document.getElementById('empire-overlay').classList.remove('show');}

function renderEmpireMap(unplaced){
  var activeName=empState.placing||(empState.movingIdx!==null?(G.empireLayout[empState.movingIdx]||{}).n:null);
  var placingMode=activeName!==null;
  var html='';
  if(placingMode){
    var aeb=EMPIRE_BUILDINGS[activeName]||{};
    html+='<div style="background:rgba(247,201,72,0.08);border:1px solid rgba(247,201,72,0.4);border-radius:8px;padding:7px 10px;font-size:10px;color:var(--coin);margin-bottom:8px;display:flex;align-items:center;gap:8px">'
      +'<span style="font-size:16px">'+(aeb.i||'🏠')+'</span><span>Tap grid to place <strong>'+activeName+'</strong></span>'
      +'<button id="emp-cancel-btn" style="margin-left:auto;font-size:9px;padding:3px 8px;border:1px solid rgba(233,69,96,0.5);border-radius:6px;background:rgba(233,69,96,0.1);color:#e94560;cursor:pointer;font-weight:700">✕ CANCEL</button>'
      +'</div>';
  }
  // Grid
  html+='<div style="overflow:auto;border:1px solid var(--border);border-radius:10px;margin-bottom:10px">'
    +'<div id="emp-grid" style="position:relative;width:'+(GRID_W*CELL)+'px;height:'+(GRID_H*CELL)+'px;background-color:#08101f;'
    +'background-image:linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px);'
    +'background-size:'+CELL+'px '+CELL+'px;cursor:'+(placingMode?'crosshair':'default')+'">';
  (G.empireLayout||[]).forEach(function(b,idx){
    var eb=EMPIRE_BUILDINGS[b.n];if(!eb)return;
    var recipe=FORGE_RECIPES.find(function(r){return r.building===b.n;});
    var tc=(recipe?recipe.tc:'#9E9E9E');var s=bldSize(b.n);
    var isMoving=empState.movingIdx===idx;
    html+='<div class="emp-bld-placed'+(isMoving?' moving':'')+'" data-idx="'+idx+'" '
      +'style="position:absolute;left:'+(b.x*CELL)+'px;top:'+(b.y*CELL)+'px;width:'+(s*CELL-2)+'px;height:'+(s*CELL-2)+'px;'
      +'background:'+tc+'18;border:2px solid '+tc+';border-radius:6px;'
      +'display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;box-sizing:border-box">'
      +'<span style="font-size:'+(s===3?24:18)+'px;line-height:1">'+eb.i+'</span>'
      +'<span style="font-size:6px;color:rgba(255,255,255,0.65);text-align:center;padding:0 2px;line-height:1.2;max-width:100%">'+b.n+'</span>'
      +'</div>';
  });
  html+='</div></div>';
  // Stash
  if(unplaced.length){
    html+='<div style="font-family:Orbitron,monospace;font-size:8px;color:var(--dim);letter-spacing:2px;margin-bottom:6px">STASH — TAP TO PLACE</div>'
      +'<div style="display:flex;gap:7px;overflow-x:auto;padding-bottom:6px">';
    unplaced.forEach(function(bn){
      var eb=EMPIRE_BUILDINGS[bn];if(!eb)return;
      var recipe=FORGE_RECIPES.find(function(r){return r.building===bn;});
      var tc=recipe?recipe.tc:'#9E9E9E';
      html+='<div class="emp-stash-item'+(empState.placing===bn?' active':'')+'" data-bn="'+bn+'" '
        +'style="border-color:'+(empState.placing===bn?'#a855f7':tc+'55')+'">'+
        '<div style="font-size:20px">'+eb.i+'</div>'
        +'<div style="font-size:6px;color:rgba(255,255,255,0.8);margin-top:2px;line-height:1.3">'+bn+'</div>'
        +'</div>';
    });
    html+='</div>';
  } else if(!(G.empire||[]).length){
    html+='<div style="text-align:center;padding:10px;font-size:10px;color:var(--dim)">Construct buildings in the BUILD tab first, then place them here!</div>';
  } else {
    html+='<div style="text-align:center;padding:8px;font-size:10px;color:var(--mnrl)">✓ All buildings placed on map!</div>';
  }
  return html;
}

function renderEmpireBuild(){
  var ZONES=['Settlement','Industrial District','Crystal Quarter','Cosmic Citadel'];
  var ZONE_C=['#9E9E9E','#B87333','#76D7EA','#00eaff'];
  var ZONE_I=['🏘️','⚙️','💎','🌌'];
  var html='';
  ZONES.forEach(function(zone,zi){
    var entries=Object.entries(EMPIRE_BUILDINGS).filter(function(e){return e[1].zone===zone;});
    var zBuilt=entries.filter(function(e){return(G.empire||[]).includes(e[0]);}).length;
    html+='<div class="empire-zone"><div class="empire-zone-lbl" style="color:'+ZONE_C[zi]+'">'+ZONE_I[zi]+' '+zone.toUpperCase()+' · '+zBuilt+'/'+entries.length+'</div>';
    entries.forEach(function(entry){
      var bn=entry[0];var eb=entry[1];
      var recipe=FORGE_RECIPES.find(function(r){return r.building===bn;});
      var isBuilt=(G.empire||[]).includes(bn);
      var hasCrafted=recipe&&(G.crafted[recipe.n]||0)>0;
      var hasRaw=Object.entries(eb.buildCost).every(function(e){return(G.res[e[0]]||0)>=e[1];});
      var canBuild=!isBuilt&&hasCrafted&&hasRaw;
      var craftedTag=recipe?'<div class="forge-mat '+(hasCrafted?'ok':'no')+'">'+recipe.n+' ×'+(G.crafted[recipe.n]||0)+'</div>':'';
      var rawTags=Object.entries(eb.buildCost).map(function(e){var have=G.res[e[0]]||0;return'<div class="forge-mat '+(have>=e[1]?'ok':'no')+'">'+e[0]+' '+have+'/'+e[1]+'</div>';}).join('');
      html+='<div class="empire-bld'+(isBuilt?' built':canBuild?' ready':'')+'">'
        +'<div style="display:flex;align-items:center;gap:8px">'
        +'<div style="font-size:22px">'+eb.i+'</div>'
        +'<div style="flex:1"><div style="font-size:12px;font-weight:700;color:#fff">'+bn+'</div>'
        +'<div style="font-size:9px;color:var(--mnrl);margin-top:1px">'+eb.benefit+'</div></div>'
        +(isBuilt?'<span style="font-size:9px;padding:2px 8px;background:rgba(79,255,176,0.12);color:#4fffb0;border-radius:8px;border:1px solid rgba(79,255,176,0.3)">✓ BUILT</span>':'')
        +'</div>'
        +(!isBuilt?'<div style="margin-top:6px"><div style="font-size:8px;color:var(--dim);margin-bottom:3px;font-family:Orbitron,monospace;letter-spacing:1px">REQUIRES:</div>'
        +'<div class="forge-mats">'+craftedTag+rawTags+'</div>'
        +'<button class="build-btn '+(canBuild?'can':'cant')+'" data-action="build-empire" data-building="'+bn+'">'+(canBuild?'🏗️ BUILD':'🔒 Missing Materials')+'</button></div>':'')
        +'</div>';
    });
    html+='</div>';
  });
  return html;
}

function renderEmpire(){
  var placedNames=(G.empireLayout||[]).map(function(b){return b.n;});
  var unplaced=(G.empire||[]).filter(function(n){return!placedNames.includes(n);});
  var header='<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">'
    +'<span style="font-size:22px">🏰</span><div style="flex:1">'
    +'<div style="font-family:Orbitron,monospace;font-size:12px;font-weight:900;color:#a855f7">YOUR EMPIRE</div>'
    +'<div style="font-size:9px;color:var(--dim)">'+(G.empireLayout||[]).length+' placed · '+unplaced.length+' in stash</div>'
    +'</div><button id="emp-close-btn" style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px solid var(--border);color:#fff;font-size:14px;cursor:pointer;flex-shrink:0">✕</button></div>';
  var tabs='<div style="display:flex;gap:6px;margin-bottom:10px">'
    +'<button class="emp-tab-btn'+(empTab==='map'?' active':'')+'" data-etab="map">🗺️ MAP</button>'
    +'<button class="emp-tab-btn'+(empTab==='build'?' active':'')+'" data-etab="build">🏗️ BUILD ('+(G.empire||[]).length+')</button>'
    +'</div>';
  var body=document.getElementById('empire-body');
  body.innerHTML=header+tabs+(empTab==='map'?renderEmpireMap(unplaced):renderEmpireBuild());
  // Header listeners
  document.getElementById('emp-close-btn').addEventListener('click',closeEmpire);
  body.querySelectorAll('[data-etab]').forEach(function(btn){
    btn.addEventListener('click',function(){empTab=this.dataset.etab;renderEmpire();});
  });
  if(empTab==='map'){
    // Cancel button
    var cb=document.getElementById('emp-cancel-btn');
    if(cb){cb.addEventListener('click',function(){empState.placing=null;empState.movingIdx=null;renderEmpire();});}
    // Stash items
    body.querySelectorAll('.emp-stash-item').forEach(function(el){
      el.addEventListener('click',function(){
        var bn=this.dataset.bn;
        empState.placing=(empState.placing===bn?null:bn);empState.movingIdx=null;
        renderEmpire();
      });
    });
    // Placed buildings (pick up to move)
    body.querySelectorAll('.emp-bld-placed').forEach(function(el){
      el.addEventListener('click',function(e){
        e.stopPropagation();
        if(empState.placing)return;
        var idx=parseInt(this.dataset.idx);
        empState.movingIdx=(empState.movingIdx===idx?null:idx);empState.placing=null;
        renderEmpire();
      });
    });
    // Grid tap to place/move
    var grid=document.getElementById('emp-grid');
    if(grid){
      function doPlace(cx,cy){
        var activeName=empState.placing||(empState.movingIdx!==null?(G.empireLayout[empState.movingIdx]||{}).n:null);
        if(!activeName)return;
        var rect=grid.getBoundingClientRect();
        var gx=Math.floor((cx-rect.left)/CELL);var gy=Math.floor((cy-rect.top)/CELL);
        if(!canPlaceAt(activeName,gx,gy,empState.movingIdx)){showToast('❌ Cannot place here','#e94560');return;}
        if(empState.movingIdx!==null){
          G.empireLayout[empState.movingIdx]={n:activeName,x:gx,y:gy};empState.movingIdx=null;
        } else {
          if(!G.empireLayout)G.empireLayout=[];
          G.empireLayout.push({n:activeName,x:gx,y:gy});empState.placing=null;
        }
        saveGame();renderEmpire();
      }
      grid.addEventListener('click',function(e){doPlace(e.clientX,e.clientY);});
      grid.addEventListener('touchend',function(e){
        var activeName=empState.placing||(empState.movingIdx!==null?(G.empireLayout[empState.movingIdx]||{}).n:null);
        if(!activeName)return;
        e.preventDefault();var t=e.changedTouches[0];doPlace(t.clientX,t.clientY);
      });
    }
  } else {
    // Build tab listeners
    body.querySelectorAll('[data-action="build-empire"]').forEach(function(el){
      el.addEventListener('click',handleEmpireAction);
      el.addEventListener('touchend',function(e){e.preventDefault();handleEmpireAction.call(this,e);});
    });
  }
}
function handleEmpireAction(e){
  var bn=this.dataset.building;var eb=EMPIRE_BUILDINGS[bn];
  var recipe=FORGE_RECIPES.find(function(r){return r.building===bn;});
  if(!recipe||!eb)return;
  if((G.empire||[]).includes(bn)){showToast('⚠️ Already built!','#f7c948');return;}
  if(!(G.crafted[recipe.n]||0)){showToast('❌ Forge '+recipe.n+' first','#e94560');return;}
  var rawOk=Object.entries(eb.buildCost).every(function(e){return(G.res[e[0]]||0)>=e[1];});
  if(!rawOk){showToast('❌ Not enough raw materials','#e94560');return;}
  G.crafted[recipe.n]=Math.max(0,(G.crafted[recipe.n]||0)-1);
  Object.entries(eb.buildCost).forEach(function(e){G.res[e[0]]=Math.max(0,(G.res[e[0]]||0)-e[1]);});
  if(!G.empire)G.empire=[];
  G.empire.push(bn);
  showToast('🏰 '+bn+' built! Place it on the MAP!','#a855f7');
  empTab='map';saveGame();renderEmpire();updateHUD();
}

function renderInv(){
  var avRes=Object.entries(G.res).filter(function(e){return e[1]>0;});
  var resHtml=avRes.length?'<div class="sec-lbl">RESOURCES</div><div class="inv-grid">'+avRes.map(function(e){var k=e[0],v=e[1];var m=MINERALS.find(function(x){return x.res===k;});return'<div class="inv-item"><span style="font-size:14px">'+(m?m.resI:'📦')+'</span><div><div class="inv-item-name">'+k+'</div><div class="inv-item-val">'+fmtN(v)+'</div></div></div>';}).join('')+'</div>':'<div style="font-size:11px;color:var(--dim);margin-bottom:8px">No resources yet.</div>';
  var gearHtml='<div class="sec-lbl">GEAR</div><div class="inv-grid">'+GEAR_SLOTS.map(function(gs){var eq=G.gear[gs.slot];return'<div class="inv-item"><span style="font-size:14px">'+gs.icon+'</span><div><div class="inv-item-name">'+gs.name+'</div><div style="font-size:8px;color:'+(eq?'var(--mnrl)':'rgba(255,255,255,0.2)')+'">'+( eq||'Empty')+'</div></div></div>';}).join('')+'</div>';
  var statsHtml='<div class="sec-lbl" style="margin-top:4px">STATS</div><div class="inv-grid"><div class="inv-item"><span style="font-size:14px">⛏️</span><div><div class="inv-item-name">Mines</div><div class="inv-item-val">'+G.starts+'</div></div></div><div class="inv-item"><span style="font-size:14px">⚒️</span><div><div class="inv-item-name">Forged</div><div class="inv-item-val">'+(G.forges||0)+'</div></div></div><div class="inv-item"><span style="font-size:14px">💰</span><div><div class="inv-item-name">$MNRL</div><div class="inv-item-val">'+G.mnrl.toFixed(2)+'</div></div></div><div class="inv-item"><span style="font-size:14px">🪙</span><div><div class="inv-item-name">Coins</div><div class="inv-item-val">'+fmtN(G.coins)+'</div></div></div></div>';
  document.getElementById('inv-body').innerHTML=resHtml+gearHtml+statsHtml;
}

function renderScroll(){
  var html='';
  if(currentTab==='miner'){
    html='<div class="sec-lbl">YOUR MINER</div><div style="text-align:center;margin-bottom:12px"><span style="font-size:58px;display:block;line-height:1">🧑‍⚒️</span><div style="font-family:Orbitron,monospace;font-size:11px;font-weight:700;margin-top:5px;color:#fff">Rookie Miner</div><div style="font-size:9px;color:var(--dim);margin-top:2px">'+ERAS[G.era].n+' · '+maxSlots()+' shared slots</div></div><div class="sec-lbl">GEAR SLOTS</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">'+GEAR_SLOTS.map(function(gs){var eq=G.gear[gs.slot];return'<div style="background:var(--card);border-radius:10px;padding:9px;border:1px solid '+(eq?'rgba(79,255,176,0.35)':'var(--border)')+'"><div style="display:flex;align-items:center;gap:6px;margin-bottom:3px"><span style="font-size:18px">'+gs.icon+'</span><div><div style="font-size:11px;font-weight:700;color:#fff">'+gs.name+'</div><div style="font-size:9px;color:var(--dim)">'+gs.effect+'</div></div></div>'+(eq?'<div style="font-size:9px;color:var(--mnrl);font-weight:700">✓ '+eq+'</div>':'<div style="font-size:9px;color:rgba(255,255,255,0.2);font-style:italic">Empty</div>')+'</div>';}).join('')+'</div>';
  } else if(currentTab==='forge'){
    var ERA_LABELS=['🪨 Stone Era','🔥 Iron Era','💎 Crystal Era','🌌 Cosmic Era'];
    var ERA_COLORS=['#9E9E9E','#B87333','#76D7EA','#00eaff'];
    var grouped=[[],[],[],[]];
    FORGE_RECIPES.forEach(function(r,i){grouped[r.era].push({r:r,i:i});});
    var empireBuilt=(G.empire||[]).length;
    html='<div style="background:linear-gradient(135deg,rgba(168,85,247,0.12),rgba(0,234,255,0.08));border:1px solid rgba(168,85,247,0.4);border-radius:12px;padding:12px 14px;margin-bottom:12px;display:flex;align-items:center;gap:12px;cursor:pointer" data-action="open-empire"><div style="font-size:26px">🏰</div><div style="flex:1"><div style="font-family:Orbitron,monospace;font-size:11px;font-weight:700;color:#a855f7">YOUR EMPIRE</div><div style="font-size:9px;color:var(--dim);margin-top:2px">'+empireBuilt+' / '+Object.keys(EMPIRE_BUILDINGS).length+' buildings · Tap to build &amp; manage</div></div><div style="font-size:11px;color:#a855f7;font-weight:700;font-family:Orbitron,monospace">VIEW →</div></div>'
      +'<div class="sec-lbl">⚒️ FORGE — CRAFT ITEMS</div><div style="padding:7px 10px;background:var(--card);border-radius:8px;border-left:2px solid rgba(79,255,176,0.4);font-size:10px;color:var(--dim);margin-bottom:10px;line-height:1.6">Combine minerals to craft items · Use crafted items to build your Empire</div>';
    grouped.forEach(function(group,eraIdx){
      if(!group.length)return;
      html+='<div class="sec-lbl" style="color:'+ERA_COLORS[eraIdx]+';margin-top:4px">'+ERA_LABELS[eraIdx]+'</div>';
      group.forEach(function(obj){
        var r=obj.r;var ri=obj.i;
        var canCraft=Object.entries(r.mats).every(function(e){return(G.res[e[0]]||0)>=e[1];});
        var timesBuilt=G.crafted[r.n]||0;
        var matsHtml=Object.entries(r.mats).map(function(e){
          var have=G.res[e[0]]||0;var ok=have>=e[1];
          return'<div class="forge-mat '+(ok?'ok':'no')+'">'+e[0]+' '+have+'/'+e[1]+'</div>';
        }).join('');
        html+='<div class="forge-card">'
          +'<div style="display:flex;align-items:center;gap:10px">'
          +'<div style="font-size:28px;flex-shrink:0">'+r.i+'</div>'
          +'<div style="flex:1">'
          +'<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">'
          +'<div style="font-size:13px;font-weight:700;color:#fff">'+r.n+'</div>'
          +'<span class="forge-tier" style="background:'+r.tc+'22;color:'+r.tc+';border:1px solid '+r.tc+'44">'+r.tier+'</span>'
          +(timesBuilt?'<span style="font-size:9px;color:var(--dim)">×'+timesBuilt+'</span>':'')
          +'</div>'
          +'<div style="font-size:9px;color:var(--dim)">🏛️ Builds: <span style="color:var(--coin)">'+r.building+'</span></div>'
          +'</div>'
          +'<div style="text-align:right;flex-shrink:0"><div style="font-size:9px;color:var(--mnrl);font-weight:700;font-family:Orbitron,monospace">+🪙'+r.reward+'</div></div>'
          +'</div>'
          +'<div class="forge-mats">'+matsHtml+'</div>'
          +'<button class="craft-btn '+(canCraft?'can':'cant')+'" data-action="craft" data-idx="'+ri+'">'+(canCraft?'⚒️ CRAFT':'🔒 Need Materials')+'</button>'
          +'</div>';
      });
    });
  } else if(currentTab==='shop'){
    var avRes=Object.entries(G.res).filter(function(e){return e[1]>0;});
    html='<div class="sec-lbl">🏪 DEVELOPER SHOP</div><div style="padding:7px 10px;background:var(--card);border-radius:8px;border-left:2px solid rgba(247,201,72,0.4);font-size:10px;color:var(--dim);margin-bottom:10px;line-height:1.6">Buy energy · Sell resources · Convert $MNRL → Coins</div><div class="sec-lbl">BUY ENERGY</div>'+SHOP_NRG.map(function(e,i){return'<div class="shop-item"><div style="font-size:20px;flex-shrink:0">'+e.icon+'</div><div style="flex:1"><div style="font-size:13px;font-weight:700;color:#fff">'+e.label+'</div><div style="font-size:10px;color:var(--dim)">Restores '+e.nrg+' energy</div>'+(i===6?'<div style="font-size:9px;color:#ff6b35;font-weight:700;margin-top:1px">🔥 Hot</div>':i===7?'<div style="font-size:9px;color:#ffd700;font-weight:700;margin-top:1px">⭐ Recommended</div>':'')+'</div><div style="text-align:right"><div style="font-family:Orbitron,monospace;font-size:10px;color:var(--coin);font-weight:700">🪙'+e.coins+'</div><button class="si-btn '+(G.coins>=e.coins?'buy':'dis')+'" data-action="buy-nrg" data-idx="'+i+'" style="margin-top:3px">'+(G.coins>=e.coins?'BUY':'No Coins')+'</button></div></div>';}).join('')+'<div class="sec-lbl" style="margin-top:4px">SELL RESOURCES</div>'+(avRes.length?avRes.map(function(e){var k=e[0],v=e[1];var m=MINERALS.find(function(x){return x.res===k;});var val=m?m.coinVal:1;return'<div class="shop-item"><div style="font-size:20px">'+(m?m.resI:'📦')+'</div><div style="flex:1"><div style="font-size:13px;font-weight:700;color:#fff">'+k+'</div><div style="font-size:10px;color:var(--dim)">Have: '+fmtN(v)+' · 🪙'+val+'/ea</div></div><div style="display:flex;gap:4px;flex-shrink:0"><button class="si-btn sell" data-action="sell-res" data-key="'+k+'" data-qty="1" data-val="'+val+'">×1</button><button class="si-btn sell" data-action="sell-res" data-key="'+k+'" data-qty="'+Math.floor(v)+'" data-val="'+val+'">All</button></div></div>';}).join(''):'<div style="font-size:11px;color:var(--dim);padding:8px">No resources yet.</div>')+'<div class="sec-lbl" style="margin-top:4px">CONVERT</div><div class="shop-item"><div style="font-size:20px">⚡</div><div style="flex:1"><div style="font-size:13px;font-weight:700;color:#fff">$MNRL → Coins</div><div style="font-size:10px;color:var(--dim)">1 $MNRL = 50 Coins</div></div><button class="si-btn buy" data-action="convert-mnrl" '+(G.mnrl>=1?'':'disabled style="opacity:0.3"')+'>Convert 1</button></div>';
  } else if(currentTab==='market'){
    html='<div class="sec-lbl">🛒 PLAYER MARKETPLACE · 5% TAX</div><div style="padding:7px 10px;background:var(--card);border-radius:8px;border-left:2px solid rgba(233,69,96,0.4);font-size:10px;color:var(--dim);margin-bottom:10px">Player-to-player only. 5% tax → community pool.</div>'+MKT.map(function(item,i){var total=(item.price*1.05).toFixed(1);var can=G.mnrl>=Number(total);return'<div class="mkt-item"><div style="font-size:22px;flex-shrink:0">'+item.i+'</div><div style="flex:1"><div style="font-size:12px;font-weight:700;color:#fff">'+item.n+(item.nft?' <span style="font-size:8px;padding:1px 5px;background:rgba(168,85,247,0.2);color:#a855f7;border:1px solid rgba(168,85,247,0.3);border-radius:6px">NFT</span>':'')+'</div><div style="font-size:9px;color:var(--dim)">by '+item.seller+' · +'+(item.price*0.05).toFixed(1)+' tax</div></div><div style="text-align:right;flex-shrink:0"><div style="font-family:Orbitron,monospace;font-size:10px;font-weight:700;color:var(--gold)">⚡'+item.price+'</div><button class="buy-btn" style="margin-top:3px;'+(can?'':'opacity:0.3;cursor:not-allowed')+'" data-action="buy-mkt" data-idx="'+i+'">'+(can?'BUY':'Low $MNRL')+'</button></div></div>';}).join('');
  } else if(currentTab==='quests'){
    html='<div class="sec-lbl">ACTIVE QUESTS</div>'+QUESTS.map(function(q,i){var prog=G.quests[i]||0;var pct=Math.min(100,prog/q.goal*100);var done=prog>=q.goal;var claimed=isQuestClaimed(i);return'<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px"><div style="font-size:13px;font-weight:700;color:#fff">'+q.n+'</div><div style="font-size:11px;color:var(--mnrl);font-weight:700">+'+q.reward+' $MNRL</div></div><div style="font-size:11px;color:var(--dim);margin-bottom:4px">'+q.desc+'</div><div class="qpb"><div class="qpbf" style="width:'+pct+'%"></div></div><div style="font-size:9px;color:var(--dim);text-align:right;margin-bottom:3px">'+fmtN(prog)+' / '+fmtN(q.goal)+'</div><button class="claim-btn '+(done&&!claimed?'rdy':'not')+'" data-action="claim-q" data-idx="'+i+'">'+(claimed?'✓ Claimed':done?'🎁 Claim Reward':'In progress...')+'</button></div>';}).join('');
  } else if(currentTab==='pass'){
    html='<div style="text-align:center;padding:6px 0 10px;border-bottom:1px solid var(--border);margin-bottom:10px"><div style="font-family:Orbitron,monospace;font-size:15px;font-weight:900;color:var(--gold)">⭐ MINER\'S PASS</div><div style="font-size:10px;color:var(--dim);margin-top:2px">Season 1 · Chapter 1 · 60 days</div></div><div style="background:var(--card);border-radius:10px;border:1px solid var(--border);overflow:hidden;margin-bottom:8px"><div style="padding:7px 10px;background:rgba(255,255,255,0.04);font-size:10px;font-weight:700;color:#fff">FREE TRACK</div><div style="padding:5px 10px;border-bottom:1px solid var(--border);font-size:10px;color:rgba(255,255,255,0.75)">✓ 3 shared mining slots</div><div style="padding:5px 10px;border-bottom:1px solid var(--border);font-size:10px;color:rgba(255,255,255,0.75)">✓ 30 free Dirt mines/day</div><div style="padding:5px 10px;font-size:10px;color:rgba(255,255,255,0.75)">✓ Basic quests & rewards</div></div><div style="background:var(--card);border-radius:10px;border:1px solid rgba(240,192,64,0.4);overflow:hidden;margin-bottom:10px"><div style="padding:7px 10px;background:rgba(240,192,64,0.1);font-size:10px;font-weight:700;color:var(--gold)">⭐ PREMIUM — VIP</div><div style="padding:5px 10px;border-bottom:1px solid var(--border);font-size:10px;color:rgba(255,255,255,0.75)">⭐ 5 shared mining slots</div><div style="padding:5px 10px;border-bottom:1px solid var(--border);font-size:10px;color:rgba(255,255,255,0.75)">⭐ Market tax: 1.5%</div><div style="padding:5px 10px;border-bottom:1px solid var(--border);font-size:10px;color:rgba(255,255,255,0.75)">⭐ 3 exclusive quests/season</div><div style="padding:5px 10px;font-size:10px;color:rgba(255,255,255,0.75)">⭐ Exclusive NFT cosmetic</div></div>'+(G.passPremium?'<div style="text-align:center;color:var(--gold);font-weight:700;padding:10px;background:rgba(240,192,64,0.08);border-radius:10px;border:1px solid rgba(240,192,64,0.3)">✓ VIP ACTIVE</div>':'<button data-action="upg-pass" style="width:100%;padding:12px;border:none;border-radius:10px;background:linear-gradient(135deg,var(--gold),#e09000);color:#1a0a00;font-size:13px;font-weight:700;cursor:pointer;font-family:Orbitron,monospace">UPGRADE TO VIP · $4.99</button>');
  } else if(currentTab==='prestige'){
    html='<div class="sec-lbl">PRESTIGE — UNLOCK NEW MINERALS</div><div style="padding:8px 10px;background:var(--card);border-radius:8px;border-left:2px solid rgba(168,85,247,0.5);font-size:10px;color:var(--dim);margin-bottom:10px;line-height:1.6">Unlock new minerals, unlock additional miners, and increase your chance to gather more resources!</div>'+ERAS.map(function(era,i){var isCurr=G.era===i;var isPast=i<G.era;var req=era.req;var hasC=getRes('Cosmic Essence')>=req.cosmic;var hasM=G.mnrl>=req.mnrl;var canDo=i===G.era+1&&hasC&&hasM;return'<div class="era-card" style="'+(isCurr?'border-color:'+era.c+'44':'')+';'+(isPast?'opacity:0.4':'')+'"><div style="display:flex;align-items:center;gap:10px;margin-bottom:'+(i>G.era?'8px':'0')+'"><span style="font-size:22px">'+era.n.split(' ')[0]+'</span><div style="flex:1"><div style="font-size:13px;font-weight:700;color:'+era.c+'">'+era.n+'</div><div style="font-size:10px;color:var(--dim);margin-top:1px">'+(req.cosmic>0?'Needs: '+req.cosmic+' Cosmic Essence · '+req.mnrl+' $MNRL':'Starting era')+'</div><div style="font-size:10px;color:var(--mnrl);margin-top:2px">Unlocks: '+era.desc+'</div></div>'+(isCurr?'<span style="font-size:8px;padding:2px 7px;background:'+era.c+'22;color:'+era.c+';border-radius:10px;border:1px solid '+era.c+'33">CURRENT</span>':'')+(isPast?'<span style="font-size:9px;color:var(--dim)">DONE</span>':'')+'</div>'+(i>G.era?'<button class="prestige-btn '+(canDo?'can':'cant')+'" data-action="prestige" data-idx="'+i+'">'+(canDo?'✨ PRESTIGE NOW':!hasC?'🔒 Need '+req.cosmic+' Cosmic Essence':'🔒 Need '+req.mnrl+' $MNRL')+'</button>':'')+'</div>';}).join('');
  }

  var sc=document.getElementById('scroll-content');
  sc.innerHTML=html;
  sc.querySelectorAll('[data-action]').forEach(function(el){
    el.addEventListener('click',handleScrollAction);
    el.addEventListener('touchend',function(e){e.preventDefault();handleScrollAction.call(this,e);});
  });
}

function handleScrollAction(e){
  var action=this.dataset.action;
  if(action==='buy-nrg'){
    var i=parseInt(this.dataset.idx);var en=SHOP_NRG[i];
    if(G.coins<en.coins){showToast('❌ Not enough Coins','#e94560');return;}
    G.coins-=en.coins;G.nrg+=en.nrg;
    showToast('⚡ +'+en.nrg+' energy!');saveGame();renderScroll();updateHUD();
  } else if(action==='sell-res'){
    var k=this.dataset.key;var qty=parseInt(this.dataset.qty);var val=parseInt(this.dataset.val);
    var have=getRes(k);if(have<qty)return;
    if(qty>1&&!confirm('Sell all '+qty+'× '+k+' for 🪙'+qty*val+' Coins?'))return;
    G.res[k]=Math.max(0,have-qty);G.coins+=qty*val;
    showToast('🪙 Sold '+qty+'× '+k+' → '+qty*val+' Coins','var(--coin)');
    saveGame();renderScroll();updateHUD();
  } else if(action==='open-empire'){
    openEmpire();
  } else if(action==='craft'){
    var ri=parseInt(this.dataset.idx);var r=FORGE_RECIPES[ri];
    var ok=Object.entries(r.mats).every(function(e){return(G.res[e[0]]||0)>=e[1];});
    if(!ok){showToast('❌ Not enough materials','#e94560');return;}
    Object.entries(r.mats).forEach(function(e){G.res[e[0]]=Math.max(0,(G.res[e[0]]||0)-e[1]);});
    if(!G.crafted)G.crafted={};
    G.crafted[r.n]=(G.crafted[r.n]||0)+1;
    G.coins+=r.reward;G.forges++;
    G.quests.forges=(G.quests.forges||0)+1;
    showToast('⚒️ Crafted '+r.n+'! +🪙'+r.reward+' Coins','var(--coin)');
    saveGame();renderScroll();updateHUD();
  } else if(action==='convert-mnrl'){
    if(G.mnrl<1){showToast('❌ Need at least 1 $MNRL','#e94560');return;}
    G.mnrl-=1;G.coins+=50;showToast('🪙 1 $MNRL → 50 Coins','var(--coin)');saveGame();renderScroll();updateHUD();
  } else if(action==='buy-mkt'){
    var i=parseInt(this.dataset.idx);var item=MKT[i];var total=item.price*1.05;
    if(G.mnrl<total){showToast('❌ Not enough $MNRL','#e94560');return;}
    G.mnrl-=total;if(item.res)addRes(item.res,item.qty);
    if(item.nft&&item.gs&&!G.gear[item.gs])G.gear[item.gs]=item.gn;
    showToast('✅ Bought '+item.n+'!');saveGame();renderScroll();updateHUD();
  } else if(action==='claim-q'){
    var i=parseInt(this.dataset.idx);var q=QUESTS[i];
    if((G.quests[i]||0)<q.goal||isQuestClaimed(i))return;
    G.questClaimed.push(i);G.mnrl+=q.reward;
    showToast('🎁 +'+q.reward+' $MNRL!');saveGame();renderScroll();updateHUD();
  } else if(action==='upg-pass'){
    G.passPremium=true;showToast('⭐ VIP! 5 slots unlocked!');saveGame();renderScroll();updateHUD();
  } else if(action==='prestige'){
    var i=parseInt(this.dataset.idx);var era=ERAS[i];
    if(getRes('Cosmic Essence')<era.req.cosmic||G.mnrl<era.req.mnrl)return;
    var cosmicLeft=Math.max(0,(G.res['Cosmic Essence']||0)-era.req.cosmic);
    G.era=i;G.res={};if(cosmicLeft>0)G.res['Cosmic Essence']=cosmicLeft;
    G.slots=[];G.queue=[];G.ready=[];G.selIdx=0;G.starts=0;G.forges=0;
    G.quests={};G.questClaimed=[];
    showToast('✨ Welcome to '+era.n+'!');saveGame();switchTab('mine');
  }
}

function setupListeners(){
  document.querySelectorAll('.nav-btn').forEach(function(b){
    b.addEventListener('click',function(){switchTab(b.dataset.tab);});
  });
  document.getElementById('stone-btn').addEventListener('click',handleMine);
  document.getElementById('stone-btn').addEventListener('touchend',function(e){e.preventDefault();handleMine();});
  document.getElementById('mine-btn').addEventListener('click',handleMine);
  document.getElementById('mine-btn').addEventListener('touchend',function(e){e.preventDefault();handleMine();});
  document.getElementById('btn-prev').addEventListener('click',function(){var av=availMins();G.selIdx=(G.selIdx-1+av.length)%av.length;updateMineView();});
  document.getElementById('btn-next').addEventListener('click',function(){var av=availMins();G.selIdx=(G.selIdx+1)%av.length;updateMineView();});
  document.getElementById('rb-inv').addEventListener('click',openInv);
  document.getElementById('rb-prestige').addEventListener('click',function(){switchTab('prestige');});
  document.getElementById('inv-overlay').addEventListener('click',closeInv);
  document.getElementById('inv-close').addEventListener('click',closeInv);
  document.getElementById('empire-overlay').addEventListener('click',closeEmpire);
}

// TUTORIAL
var TUT_STEPS=[
  {icon:'💎',title:'WELCOME TO GEMSTRIKE',desc:'Mine rare gems, forge powerful gear, and build your mining empire! This quick guide will get you started.'},
  {icon:'⛏️',title:'START MINING',desc:'Tap the big stone in the center to begin mining! Use the ◀ ▶ arrows to switch between different minerals.'},
  {icon:'✅',title:'COLLECT RESOURCES',desc:'When a mine finishes, a glowing green bubble appears on the left side. Tap it to collect your resources!'},
  {icon:'⚡',title:'ENERGY SYSTEM',desc:'Mining costs Energy shown in the top bar. It regenerates over time. Dirt is always free — great for new miners!'},
  {icon:'🧭',title:'NAVIGATE THE GAME',desc:'Use the tabs at the bottom to visit the Shop, Market, Quests, and your Battle Pass for rewards and upgrades.'},
  {icon:'🚀',title:'YOU\'RE READY!',desc:'Start with Dirt to earn your first resources, then unlock better minerals as you grow. Good luck out there, miner!'},
];
var tutStep=0;

function renderTutStep(){
  var s=TUT_STEPS[tutStep];
  document.getElementById('tut-icon').textContent=s.icon;
  document.getElementById('tut-title').textContent=s.title;
  document.getElementById('tut-desc').textContent=s.desc;
  var dotsEl=document.getElementById('tut-dots');
  dotsEl.innerHTML='';
  TUT_STEPS.forEach(function(_,i){var d=document.createElement('div');d.className='tut-dot'+(i===tutStep?' active':'');dotsEl.appendChild(d);});
  var prev=document.getElementById('tut-prev');
  prev.style.visibility=tutStep===0?'hidden':'visible';
  document.getElementById('tut-next').textContent=tutStep===TUT_STEPS.length-1?'START MINING ⛏️':'NEXT →';
}

function closeTutorial(){
  document.getElementById('tutorial-overlay').classList.add('hidden');
  localStorage.setItem('gs_tut_done','1');
}

function setupTutorial(){
  document.getElementById('tut-prev').addEventListener('click',function(){if(tutStep>0){tutStep--;renderTutStep();}});
  document.getElementById('tut-next').addEventListener('click',function(){if(tutStep<TUT_STEPS.length-1){tutStep++;renderTutStep();}else closeTutorial();});
  document.getElementById('tut-skip').addEventListener('click',closeTutorial);
  if(!localStorage.getItem('gs_tut_done')){
    setTimeout(function(){document.getElementById('tutorial-overlay').classList.remove('hidden');renderTutStep();},200);
  }
}

// START
loadGame();
setupListeners();
switchTab('mine');
gameLoop();
startLoadingScreen(setupTutorial);
