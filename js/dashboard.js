const S=JSON.parse(localStorage.getItem('hms_session')||'null');
const role=document.body.dataset.role;
if(!S||S.role!==role)location.replace('index.html');
const get=k=>JSON.parse(localStorage.getItem('hms_d_'+k)||'[]');
const set=(k,v)=>localStorage.setItem('hms_d_'+k,JSON.stringify(v));
const Dt=['date'],Nm=['number'];
const dl=r=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([Object.entries(r).map(e=>e.join(': ')).join('\n')]));a.download='record.txt';a.click()};
const pr=r=>{const w=open('');w.document.write('<h2>Hospital Record</h2>'+Object.entries(r).map(e=>`<p><b>${e[0]}:</b> ${e[1]}</p>`).join(''));w.print()};
const own=f=>r=>r[f]===S.name;
const ST=['Booked','Completed','Cancelled'];
const M={
clinics:{t:'Clinics & Branches',f:[['name','Clinic name'],['location','Location']]},
staff:{t:'Staff Accounts',f:[['name','Name'],['email','Email','email'],['role','Role',['doctor','accountant','admin','patient']],['password','Password','password'],['status','Status',['Active','Inactive']]],
 hook:r=>{const u=users();u.push({name:r.name,email:r.email.toLowerCase(),phone:'',password:r.password,role:r.role,active:r.status==='Active'});saveUsers(u);r.password='••••';},
 a:[['Activate / Deactivate',(r,i)=>{r.status=r.status==='Active'?'Inactive':'Active';const u=users();u.forEach(x=>{if(x.email===r.email.toLowerCase())x.active=r.status==='Active'});saveUsers(u);return r}]]},
gateway:{t:'Payment Gateway',f:[['gateway','Gateway',['bKash','Nagad','Stripe','SSLCommerz']],['key','API key'],['mode','Mode',['Sandbox','Live']]]},
logs:{t:'Security Logs',ro:1,f:[['time','Time'],['user','User'],['action','Action']]},
appt:{t:'Appointments',k:'appt',f:[['patient','Patient'],['doctor','Doctor'],['date','Date','date'],['time','Time','time'],['status','Status',ST]],
 a:[['Complete',(r)=>{r.status='Completed';return r}],['Cancel',(r)=>{r.status='Cancelled';return r}]]},
hist:{t:'Medical History',f:[['patient','Patient'],['condition','Condition'],['date','Date','date'],['notes','Notes']]},
labs:{t:'Lab & Diagnostic Reports',f:[['patient','Patient'],['test','Test'],['result','Result'],['date','Date','date']]},
presc:{t:'Prescriptions',f:[['patient','Patient'],['medicine','Medicine'],['dosage','Dosage'],['notes','Notes']],a:[['Print',pr]]},
follow:{t:'Follow-ups',f:[['patient','Patient'],['date','Next visit','date'],['note','Note']]},
ledger:{t:'Income & Expense Ledger',f:[['type','Type',['Income','Expense']],['desc','Description'],['amount','Amount (৳)','number'],['date','Date','date']]},
salary:{t:'Salary Sheet',f:[['staff','Staff name'],['position','Position',['Doctor','Nurse','Other']],['amount','Amount (৳)','number'],['month','Month','month'],['status','Status',['Pending','Paid']]],a:[['Mark paid',r=>{r.status='Paid';return r}]]},
invoices:{t:'Invoices',f:[['patient','Patient name'],['service','Service'],['amount','Amount (৳)','number'],['status','Status',['Due','Paid']]],a:[['Mark paid',r=>{r.status='Paid';return r}]]},
pappt:{t:'My Appointments',k:'appt',mine:'patient',f:[['doctor','Doctor'],['date','Date','date'],['time','Time','time'],['status','Status',ST]],
 pre:r=>{r.patient=S.name;r.status='Booked'},fields:['doctor','date','time'],a:[['Cancel',r=>{r.status='Cancelled';return r}]]},
ppresc:{t:'My Prescriptions',k:'presc',mine:'patient',ro:1,f:[['medicine','Medicine'],['dosage','Dosage'],['notes','Notes']],a:[['Download',dl]]},
plabs:{t:'My Lab Reports',k:'labs',mine:'patient',ro:1,f:[['test','Test'],['result','Result'],['date','Date']],a:[['Download',dl]]},
phist:{t:'My Medical History',k:'hist',mine:'patient',ro:1,f:[['condition','Condition'],['date','Date'],['notes','Notes']],a:[['Download',dl]]},
pbill:{t:'Payments & Invoices',k:'invoices',mine:'patient',ro:1,f:[['service','Service'],['amount','Amount (৳)'],['status','Status']],a:[['Download',dl]]}
};
const CFG={
admin:{n:'Super Admin',m:['clinics','staff','gateway','logs']},
doctor:{n:'Doctor',m:['appt','hist','labs','presc','follow']},
accountant:{n:'Accountant',m:['ledger','salary','invoices','reports']},
patient:{n:'Patient',m:['pappt','ppresc','plabs','phist','pbill','profile']}}[role];
const TT={reports:'Financial Reports',profile:'My Profile'};
const title=id=>TT[id]||M[id].t;
$('#nav').innerHTML=`<h3>🏥 HMS</h3><small>${CFG.n}: ${S.name}</small><a data-id="home">🏠 Dashboard</a>`+CFG.m.map(id=>`<a data-id="${id}">${title(id)}</a>`).join('')+`<a id="out">🚪 Log out</a>`;
$('#nav').onclick=e=>{const id=e.target.dataset.id;if(e.target.id==='out'){localStorage.removeItem('hms_session');location.href='index.html'}else if(id)show(id)};
function show(id){document.querySelectorAll('.side a').forEach(a=>a.classList.toggle('on',a.dataset.id===id));
 $('#main').innerHTML=id==='home'?home():id==='reports'?reports():id==='profile'?profile():table(id)}
function home(){const c=CFG.m.filter(i=>M[i]).map(i=>`<div class="stat"><b>${rows(i).length}</b><span>${M[i].t}</span></div>`).join('');
 return `<h2>Welcome, ${S.name}</h2><div class="stats">${c}</div><div class="card">Select a section from the menu to get started.</div>`}
const key=id=>M[id].k||id;
function rows(id){const m=M[id];return get(key(id)).map((r,i)=>[r,i]).filter(([r])=>!m.mine||r[m.mine]===S.name)}
function table(id){const m=M[id];let h=`<h2>${m.t}</h2>`;
 if(!m.ro){const fs=m.fields?m.f.filter(f=>m.fields.includes(f[0])):m.f.filter(f=>f[0]!=='status'||!m.pre);
 h+=`<form class="card" id="f">${fs.map(([n,l,t])=>`<label>${l}${Array.isArray(t)?`<select name="${n}">${t.map(o=>`<option>${o}</option>`).join('')}</select>`:`<input name="${n}" type="${t||'text'}" required>`}</label>`).join('')}<label><button class="btn">Add</button></label></form>`}
 h+=`<div class="card"><table><tr>${m.f.map(f=>`<th>${f[1]}</th>`).join('')}${m.ro&&!m.a?'':'<th>Actions</th>'}</tr>`+
 (rows(id).map(([r,i])=>`<tr>${m.f.map(f=>`<td>${r[f[0]]??''}</td>`).join('')}${m.ro&&!m.a?'':`<td>${(m.a||[]).map((a,j)=>`<button class="sm" data-j="${j}" data-i="${i}">${a[0]}</button>`).join('')}${m.ro?'':`<button class="sm del" data-d="${i}">Delete</button>`}</td>`}</tr>`).join('')||`<tr><td colspan="9">No records yet.</td></tr>`)+`</table></div>`;
 $('#main').innerHTML=h;
 const f=$('#f');if(f)f.onsubmit=e=>{e.preventDefault();const r=Object.fromEntries(new FormData(f));if(m.pre)m.pre(r);if(m.hook)m.hook(r);const d=get(key(id));d.push(r);set(key(id),d);addLog(S.email,'Added to '+m.t);table(id)};
 $('#main').querySelectorAll('.sm').forEach(b=>b.onclick=()=>{const d=get(key(id));if(b.dataset.d!==undefined){d.splice(+b.dataset.d,1);addLog(S.email,'Deleted from '+m.t)}else{const i=+b.dataset.i,res=m.a[+b.dataset.j][1](d[i],i);if(res)d[i]=res}set(key(id),d);table(id)})}
function reports(){const l=get('ledger'),now=new Date().toISOString(),sum=(p,t)=>l.filter(r=>r.date&&r.date.startsWith(p)&&r.type===t).reduce((a,r)=>a+ +r.amount,0);
 const row=(n,p)=>`<tr><td>${n}</td><td>৳${sum(p,'Income')}</td><td>৳${sum(p,'Expense')}</td><td><b>৳${sum(p,'Income')-sum(p,'Expense')}</b></td></tr>`;
 return `<h2>Financial Audit Reports</h2><div class="card"><table><tr><th>Period</th><th>Income</th><th>Expense</th><th>Net</th></tr>${row('Today ('+now.slice(0,10)+')',now.slice(0,10))}${row('This month',now.slice(0,7))}${row('This year',now.slice(0,4))}</table></div><button class="sm" onclick="print()">Print report</button>`}
function profile(){const u=users().find(x=>x.email===S.email)||{};
 setTimeout(()=>{$('#f').onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target)),us=users();Object.assign(us.find(x=>x.email===S.email),d);saveUsers(us);S.name=d.name;localStorage.setItem('hms_session',JSON.stringify(S));$('#ok').textContent='Profile saved.'}});
 return `<h2>My Profile</h2><form class="card" id="f"><label>Full name<input name="name" value="${u.name||''}" required></label><label>Phone<input name="phone" value="${u.phone||''}"></label><label>Emergency contact name<input name="ecName" value="${u.ecName||''}"></label><label>Emergency contact phone<input name="ecPhone" value="${u.ecPhone||''}"></label><label><button class="btn">Save changes</button></label></form><p class="ok msg" id="ok"></p>`}
show('home');
