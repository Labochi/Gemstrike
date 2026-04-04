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
