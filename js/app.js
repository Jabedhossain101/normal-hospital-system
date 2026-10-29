const $=s=>document.querySelector(s);
const ROLES=['admin','doctor','patient','accountant'];
const getRole=()=>{const r=new URLSearchParams(location.search).get('role');if(!ROLES.includes(r))location.replace('index.html');return r};
const users=()=>JSON.parse(localStorage.getItem('hms_users')||'[]');
const saveUsers=u=>localStorage.setItem('hms_users',JSON.stringify(u));
const addLog=(user,action)=>{const l=JSON.parse(localStorage.getItem('hms_d_logs')||'[]');l.unshift({time:new Date().toLocaleString(),user,action});localStorage.setItem('hms_d_logs',JSON.stringify(l))};
