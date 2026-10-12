(function(){
const $=s=>document.querySelector(s),page=document.body.dataset.page;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function theme(t){document.documentElement.dataset.theme=t;Store.set('theme',t)}
theme(Store.get('theme',matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'));
$('#hdr').innerHTML='<a class="logo" href="index.html">LifeFix</a><nav aria-label="Main"><a href="library.html">Library</a><a href="about.html">About</a></nav><button id="th" type="button">Dark / Light</button><button id="sf" type="button" class="safe">Safety First</button>'+
'<dialog id="dlg" aria-labelledby="dt"><h2 id="dt">Safety First</h2><p>If you are in immediate danger, stop using this guide and contact the appropriate local emergency service.</p><form method="dialog"><button class="btn">Close</button></form></dialog>';
$('#ftr').innerHTML='<p>LifeFix provides general practical guidance. For emergencies, legal matters, medical issues, electrical hazards, or other high-risk situations, contact the appropriate qualified professional or emergency service.</p>';
$('#th').onclick=()=>theme(document.documentElement.dataset.theme==='dark'?'light':'dark');
$('#sf').onclick=()=>$('#dlg').showModal();
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));

if(page==='home'){
 const opts=()=>'&c='+encodeURIComponent($('#country').value.trim())+'&u='+encodeURIComponent($('#urg').value);
 $('#chips').innerHTML=[['Lost phone','lost-phone'],['Electricity bill problem','electric-bill'],['Internet not working','internet-down'],['Lost document','lost-document'],['Moving house','moving-house'],['Job interview tomorrow','job-interview'],['Landlord problem','deposit-problem'],['Home repair','water-leak']].map(c=>`<button type="button" data-id="${c[1]}">${c[0]}</button>`).join('');
 $('#chips').onclick=e=>{const id=e.target.dataset.id;if(id)location.href='solve.html?id='+id+opts()};
 $('#f').onsubmit=e=>{e.preventDefault();const q=$('#q').value.trim();if(!q){$('#err').hidden=false;$('#q').focus();return}location.href='solve.html?q='+encodeURIComponent(q)+opts()};
}

if(page==='library'){
 const draw=()=>{const list=searchProblems($('#s').value);const cats=['HOME','PERSONAL','WORK','MONEY'];
  $('#lib').innerHTML=list.length?cats.map(c=>{const l=list.filter(p=>p.cat===c);return l.length?`<h2>${c.charAt(0)+c.slice(1).toLowerCase()}</h2><div class="grid">${l.map(p=>`<a class="card" href="solve.html?id=${p.id}"><strong>${esc(p.title)}</strong><br><span class="tag">${esc(p.time)}</span><p>${esc(p.desc)}</p></a>`).join('')}</div>`:''}).join(''):'<p class="card">No playbook matches that. Try a simpler word, or <a href="index.html">describe your problem</a>.</p>'};
 $('#s').oninput=draw;draw();
}

if(page==='solve'){
 const out=$('#out'),P=new URLSearchParams(location.search);
 const show=async()=>{try{
  let p=null,id=P.get('id'),q=P.get('q');
  if(id){p=PROBLEMS.find(x=>x.id===id);if(!p){out.innerHTML='<div class="card"><h1>Playbook not found</h1><a class="btn" href="library.html">Browse the library</a></div>';return}}
  else if(q){const r=await getProblemPlan(q);if(r.confidence==='high')p=r.problem;
   else{out.innerHTML=(r.confidence==='low'?'<h1>We\'re not completely sure which playbook fits.</h1><p class="sub">Choose the closest one:</p><div class="grid">'+r.matches.map(m=>`<a class="card" href="solve.html?id=${m.id}"><strong>${esc(m.title)}</strong><p>${esc(m.desc)}</p></a>`).join('')+'</div>':'<h1>We don\'t have a specific playbook for this yet.</h1><p class="sub">Use this general framework:</p>')+
    '<div class="card"><ol>'+GENERIC.map(g=>`<li>${g}</li>`).join('')+'</ol></div><a class="btn alt" href="library.html">Browse all playbooks</a> <a class="btn alt" href="index.html">Try different words</a>';return}}
  else{location.replace('index.html');return}
  render(p)}catch(e){out.innerHTML='<div class="card"><h1>Something went wrong</h1><p>Please go back and try again.</p><a class="btn" href="index.html">Start again</a></div>'}};
 function render(p){
  let rec=Store.get('recent',[]);if(!Array.isArray(rec))rec=[];Store.set('recent',[p.id].concat(rec.filter(x=>x!==p.id)).slice(0,5));
  let state=Store.get('prog_'+p.id,{});if(typeof state!=='object'||!state)state={};
  const total=p.steps.reduce((n,s)=>n+s.c.length,0),u=P.get('u'),c=P.get('c');
  const emg=u==='Emergency'?'<div class="warn" role="alert"><strong>Emergency selected.</strong> If anyone is in danger, contact your local emergency service first, then return here.</div>':'';
  const note=(u&&u!=='Emergency'?`<p class="tag">Urgency: ${esc(u)}. ${u==='Today'?'Aim to finish the first two steps today.':u==='This week'?'Spread the steps across the week.':'Work through at your own pace.'}</p>`:'')+(c?`<p class="tag">Country: ${esc(c)}. Offices, laws and numbers differ by country, so use official local sources.</p>`:'');
  let n=0;
  out.innerHTML=`<p class="tag">Problem identified</p><h1>${esc(p.title)}</h1><p class="sub">${esc(p.desc)}</p>${emg}${note}
  <div class="card"><strong>Status:</strong> Start with these actions<div class="bar" role="progressbar" aria-label="Progress" aria-valuemin="0" aria-valuemax="100" id="pb"><i></i></div><p id="pt" aria-live="polite"></p><p id="dn" hidden></p></div>
  <div class="acts" id="fw"><button id="pr" type="button">Print / Save Plan</button><button id="sh" type="button">Share</button></div>
  ${p.steps.map((s,i)=>`<section class="card step"><h2>Step ${i+1}: ${esc(s.t)}</h2><p class="why"><strong>Why:</strong> ${esc(s.why)}</p>${s.c.map(x=>{const k='k'+(n++);return `<label class="ck"><input type="checkbox" data-k="${k}"${state[k]?' checked':''}><span>${esc(x)}</span></label>`}).join('')}</section>`).join('')}
  <div class="stat"><div class="card"><h2>Time required</h2><p>${esc(p.time)}</p></div><div class="card"><h2>You may need</h2><ul>${p.items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></div></div>
  <h2>Warnings</h2>${p.warn.map(w=>`<div class="warn">${esc(w)}</div>`).join('')}
  <h2>When to get help</h2>${p.pro.map(w=>`<div class="warn">${esc(w)}</div>`).join('')}
  <div class="card"><h2>What should I do next?</h2><p>Work through the first unchecked box. Keep dates, names and reference numbers in a note. <a href="library.html">Browse other playbooks</a>.</p></div>`;
  const upd=()=>{const d=out.querySelectorAll('input:checked').length,pc=Math.round(d/total*100);
   $('#pb i').style.width=pc+'%';$('#pb').setAttribute('aria-valuenow',pc);$('#pt').textContent=`${pc}% — ${d} of ${total} completed`;
   $('#dn').hidden=d<total;$('#dn').textContent=d===total?'Nice work. You\'ve completed the main action plan. '+p.done:''};
  out.onchange=e=>{if(e.target.dataset.k){state[e.target.dataset.k]=e.target.checked;Store.set('prog_'+p.id,state);upd()}};upd();
  $('#pr').onclick=()=>print();
  $('#sh').onclick=async()=>{const url=location.origin+location.pathname+'?id='+p.id;
   try{if(navigator.share)await navigator.share({title:p.title+' — LifeFix',url});else{await navigator.clipboard.writeText(url);$('#sh').textContent='Link copied'}}catch(e){}};
  document.title=p.title+' — LifeFix';
 }
 show();
}
})();
