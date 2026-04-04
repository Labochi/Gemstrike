function loadGame(){
  try{
    const d=JSON.parse(localStorage.getItem('gs_v10')||'{}');
    if(d.mnrl!==undefined){
      Object.assign(G,d);
      if(!Array.isArray(G.questClaimed))G.questClaimed=[];
      if(!G.res)G.res={};
      if(!G.slots)G.slots=[];
      if(!G.queue)G.queue=[];
      if(!G.ready)G.ready=[];
      if(!G.gear)G.gear={pickaxe:null,shirt:null,helmet:null,gloves:null,boots:null,accessory:null};
      if(!G.crafted)G.crafted={};
      if(!Array.isArray(G.empire))G.empire=[];
      if(!Array.isArray(G.empireLayout))G.empireLayout=[];
      const now=Date.now();
      const still=[];
      (G.slots||[]).forEach(function(s){
        const m=MINERALS[s.mIdx];
        if(s.endTime<=now&&m){G.ready.push({mIdx:s.mIdx,id:s.id,res:m.res,resI:m.resI,color:m.c,n:m.n});}
        else still.push(s);
      });
      G.slots=still;
      const rt=getNextReset();
      if((G.dirtReset||0)<rt-86400000){G.dirtMines=0;G.dirtReset=rt;}
    }
  }catch(e){console.log('Load error',e);}
}

function saveGame(){
  try{localStorage.setItem('gs_v10',JSON.stringify(G));}catch(e){}
}

function getNextReset(){
  const now=new Date();
  const r=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate(),8,0,0,0));
  if(now>=r)r.setUTCDate(r.getUTCDate()+1);
  return r.getTime();
}

function dirtResetsIn(){
  const ms=getNextReset()-Date.now();
  return Math.floor(ms/3600000)+'h '+Math.floor((ms%3600000)/60000)+'m';
}
