const Store={get(k,d){try{const v=localStorage.getItem('lf_'+k);return v===null?d:JSON.parse(v)}catch(e){return d}},
set(k,v){try{localStorage.setItem('lf_'+k,JSON.stringify(v))}catch(e){}}};
