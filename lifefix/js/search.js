// Swap this function for an API call later; keep the return shape.
async function getProblemPlan(input){
  const t=input.toLowerCase();
  const scored=PROBLEMS.map(p=>{let s=0;p.keywords.forEach(k=>{if(t.includes(k))s+=k.includes(' ')?3:2});
    p.title.toLowerCase().split(/\W+/).forEach(w=>{if(w.length>3&&t.includes(w))s+=1});return{p,s}})
    .filter(x=>x.s>0).sort((a,b)=>b.s-a.s);
  const top=scored[0],next=scored[1];
  const confidence=!top?'none':(top.s>=3&&(!next||top.s>next.s))?'high':'low';
  return{confidence,problem:confidence==='high'?top.p:null,matches:scored.slice(0,4).map(x=>x.p)};
}
function searchProblems(q){q=q.toLowerCase().trim();if(!q)return PROBLEMS;
  return PROBLEMS.filter(p=>(p.title+' '+p.desc+' '+p.keywords.join(' ')).toLowerCase().includes(q))}
