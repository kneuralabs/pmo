// ════════════════════════════════════════════════════════════════════
// COMPANY CONFIG — change this object to rebrand for any organisation
// ════════════════════════════════════════════════════════════════════
const DEFAULT_CONFIG = {
  company:'Kneuralabs', tagline:'AI Governance Platform',
  footer:'v3.0 · AI Governance Platform\n© 2025 Kneuralabs LLC',
  accent:'#1C5CAA', steel:'#0D2E5A',
  currency:'$', dateFmt:'en-US',
  projectTypes:['AI Risk Assessment','Governance Framework Setup','AI Standards Readiness','IT Modernisation','Data Platform','Cybersecurity','Cloud Migration','Digital Transformation']
};

let CFG = JSON.parse(localStorage.getItem('nx-config')||'null') || {...DEFAULT_CONFIG};
// Migrate legacy all-caps brand → sentence case
if(CFG.company==='KNEURALABS'){CFG.company='Kneuralabs';localStorage.setItem('nx-config',JSON.stringify(CFG));}

// ════════════════════════════════════════════════════════════════════
// DATA STORES
// ════════════════════════════════════════════════════════════════════
let projects    = JSON.parse(localStorage.getItem('nx-projects')||'[]');
let risks       = JSON.parse(localStorage.getItem('nx-risks')||'[]');
let decisions   = JSON.parse(localStorage.getItem('nx-decisions')||'[]');
let changeReqs  = JSON.parse(localStorage.getItem('nx-crs')||'[]');
let subtasks    = JSON.parse(localStorage.getItem('nx-subtasks')||'[]');
let improvements= JSON.parse(localStorage.getItem('nx-cip')||'[]');
let editIdx=-1, currentPanel='governance';
let pdProject=null, editSubIdx=-1, editCipIdx=-1;
const CIP_STAGES=['Identify','Plan','Do','Check','Act'];

const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS=['#e8440a','#c9a84c','#2d9e5a','#3b6ef5','#7c3aed','#0891b2','#db2777'];
const AVT_COLORS=['#e8440a','#3b6ef5','#2d9e5a','#7c3aed','#c9a84c'];
const TITLES={dashboard:'Dashboard',governance:'Dashboard',projects:'Projects',gantt:'Gantt / Timeline',milestones:'Milestones',risks:'Risk Register',budget:'Budget Tracker',resources:'Resources',improvement:'Continuous Improvement',datasync:'Data Sync — DATA.xlsx'};
const ADD_LABELS={dashboard:'Add Project',governance:'Log Decision',projects:'Add Project',gantt:'Add Project',milestones:'Add Milestone',risks:'Add Risk',budget:'Update Budget',resources:'Add Resource',improvement:'New Initiative',datasync:'Add Row'};
let editRiskIdx=-1, editDecIdx=-1, editCRIdx=-1, editResIdx=-1;
let customMilestones=JSON.parse(localStorage.getItem('nx-milestones')||'[]');
let resources=JSON.parse(localStorage.getItem('nx-resources')||'[]');
let calEvents=JSON.parse(localStorage.getItem('nx-calevents')||'null');
const DEFAULT_CAL=[
  {title:'Steering Committee Review',sub:'Monthly portfolio status update',days:3},
  {title:'Risk & Compliance Audit',sub:'Q2 governance audit — all projects',days:12},
  {title:'Stage Gate: ERP Phase 3',sub:'Legacy ERP Migration',days:18},
  {title:'CCB Meeting',sub:'Review pending change requests',days:21},
  {title:'AI Ethics Board Quarterly',sub:'Model risk governance review',days:34},
];
if(!calEvents) calEvents=[...DEFAULT_CAL];

// ════════════════════════════════════════════════════════════════════
// SEED DATA
// ════════════════════════════════════════════════════════════════════
function seedData(){
  if(projects.length) return;
  const y=new Date().getFullYear();
  projects=[
    {id:1,name:'AI Ethics Framework',type:'AI Governance',pm:'Sarah Chen',status:'On Track',start:`${y}-01-15`,end:`${y}-09-30`,budget:480000,spent:210000,progress:52,desc:'Enterprise-wide AI governance policies and model risk controls'},
    {id:2,name:'Legacy ERP Migration',type:'IT Modernization',pm:'James Okafor',status:'At Risk',start:`${y}-03-01`,end:`${y}-12-15`,budget:1200000,spent:680000,progress:38,desc:'Migrate legacy SAP to cloud-native ERP'},
    {id:3,name:'Data Lake Modernization',type:'Data Platform',pm:'Priya Nair',status:'On Track',start:`${y}-02-01`,end:`${y}-10-31`,budget:650000,spent:280000,progress:61,desc:'Unified data platform on AWS'},
    {id:4,name:'Zero Trust Security',type:'Cybersecurity',pm:'Marcus Velez',status:'Planning',start:`${y}-05-01`,end:`${y+1}-01-31`,budget:920000,spent:45000,progress:8,desc:'Zero-trust architecture across enterprise'},
    {id:5,name:'Model Risk Management',type:'AI Governance',pm:'Sarah Chen',status:'On Track',start:`${y}-04-01`,end:`${y}-11-30`,budget:310000,spent:95000,progress:29,desc:'AI model validation and monitoring framework'},
  ];
  risks=[
    {id:1,title:'Cloud cost overrun',project:'Legacy ERP Migration',cat:'Budget',sev:'High',prob:'High',owner:'James Okafor',mit:'Weekly cost reviews + auto-alerts',status:'Open'},
    {id:2,title:'Vendor lock-in risk',project:'Data Lake Modernization',cat:'Vendor',sev:'Medium',prob:'Medium',owner:'Priya Nair',mit:'Multi-cloud abstraction layer',status:'Mitigated'},
    {id:3,title:'Regulatory non-compliance',project:'AI Ethics Framework',cat:'Compliance',sev:'Critical',prob:'Low',owner:'Sarah Chen',mit:'Legal review bi-weekly',status:'Open'},
    {id:4,title:'Key talent attrition',project:'Zero Trust Security',cat:'Resource',sev:'High',prob:'Medium',owner:'Marcus Velez',mit:'Retention bonuses & cross-training',status:'Open'},
  ];
  const y2=y; const now=new Date();
  decisions=[
    {id:1,title:'Approved additional QA sprint for ERP',project:'Legacy ERP Migration',type:'Approved',maker:'Steering Committee',date:`${y2}-04-10`,impact:'High',rationale:'Critical defects found in UAT phase requiring dedicated quality gate'},
    {id:2,title:'Deferred Zero Trust Phase 2',project:'Zero Trust Security',type:'Deferred',maker:'CTO',date:`${y2}-04-22`,impact:'Medium',rationale:'Resource constraints; Phase 1 must stabilize first'},
    {id:3,title:'Approved model documentation standard',project:'AI Ethics Framework',type:'Approved',maker:'AI Governance Board',date:`${y2}-05-01`,impact:'High',rationale:'Regulatory alignment requirement for Q3 audit'},
    {id:4,title:'Vendor selection — AWS vs Azure for Data Lake',project:'Data Lake Modernization',type:'Pending',maker:'Architecture Review Board',date:`${y2}-05-15`,impact:'Critical',rationale:'Pending final cost analysis report from Finance'},
  ];
  changeReqs=[
    {id:1,title:'Add Tableau integration module',project:'Data Lake Modernization',type:'Scope',impact:'Medium',by:'Priya Nair',date:`${y2}-05-20`,desc:'Business intelligence team requires Tableau connector',status:'Pending'},
    {id:2,title:'Extend ERP go-live by 6 weeks',project:'Legacy ERP Migration',type:'Schedule',impact:'High',by:'James Okafor',date:`${y2}-04-28`,desc:'UAT defect backlog too large for current timeline',status:'Approved'},
    {id:3,title:'Additional security architect resource',project:'Zero Trust Security',type:'Resource',impact:'Medium',by:'Marcus Velez',date:`${y2}-05-10`,desc:'Require senior security architect for network segmentation design',status:'Pending'},
  ];
  subtasks=[
    {id:1,pid:1,name:'Stakeholder discovery',owner:'Sarah Chen',start:`${y}-01-15`,end:`${y}-02-28`,prog:100,cost:35000,status:'Done'},
    {id:2,pid:1,name:'Policy drafting',owner:'Sarah Chen',start:`${y}-03-01`,end:`${y}-06-30`,prog:60,cost:90000,status:'In Progress'},
    {id:3,pid:1,name:'Model risk controls rollout',owner:'A. Banks',start:`${y}-07-01`,end:`${y}-09-30`,prog:0,cost:85000,status:'Not Started'},
    {id:4,pid:2,name:'Data migration & ETL',owner:'James Okafor',start:`${y}-03-01`,end:`${y}-07-31`,prog:55,cost:320000,status:'In Progress'},
    {id:5,pid:2,name:'UAT & cutover',owner:'QA Team',start:`${y}-08-01`,end:`${y}-12-15`,prog:10,cost:180000,status:'Blocked'},
  ];
  improvements=[
    {id:1,title:'Automate weekly status reporting',project:'Portfolio-wide',cat:'Automation',stage:'Do',owner:'PMO',impact:'High',effort:'Medium',status:'Active',desc:'Auto-generate exec status from project data, cut 4 hrs/wk'},
    {id:2,title:'Standardize risk scoring rubric',project:'Portfolio-wide',cat:'Risk',stage:'Plan',owner:'Sarah Chen',impact:'High',effort:'Low',status:'Active',desc:'Consistent 5x5 severity/probability scoring across all projects'},
    {id:3,title:'Reduce ERP UAT defect leakage',project:'Legacy ERP Migration',cat:'Quality',stage:'Check',owner:'QA Team',impact:'High',effort:'High',status:'Active',desc:'Shift-left testing to cut defects found in UAT by 40%'},
    {id:4,title:'Vendor onboarding checklist',project:'Data Lake Modernization',cat:'Process',stage:'Act',owner:'Priya Nair',impact:'Medium',effort:'Low',status:'Done',desc:'Reusable checklist reduces vendor setup from 3 wks to 1'},
    {id:5,title:'Cloud cost guardrails',project:'Legacy ERP Migration',cat:'Cost',stage:'Identify',owner:'James Okafor',impact:'High',effort:'Medium',status:'Active',desc:'Budget alerts + tagging policy to prevent overruns'},
  ];
  save();
}

function save(){
  localStorage.setItem('nx-projects',JSON.stringify(projects));
  localStorage.setItem('nx-risks',JSON.stringify(risks));
  localStorage.setItem('nx-decisions',JSON.stringify(decisions));
  localStorage.setItem('nx-crs',JSON.stringify(changeReqs));
  localStorage.setItem('nx-milestones',JSON.stringify(customMilestones));
  localStorage.setItem('nx-resources',JSON.stringify(resources));
  localStorage.setItem('nx-calevents',JSON.stringify(calEvents));
  localStorage.setItem('nx-subtasks',JSON.stringify(subtasks));
  localStorage.setItem('nx-cip',JSON.stringify(improvements));
  const cipBadge=document.getElementById('cip-count');
  if(cipBadge){const openCip=improvements.filter(i=>i.stage!=='Act'||i.status!=='Done').length;cipBadge.textContent=openCip||'';}
  document.getElementById('proj-count').textContent=projects.length;
  const openRisks=risks.filter(r=>r.status==='Open').length;
  document.getElementById('risk-count').textContent=openRisks;
  const alerts=changeReqs.filter(c=>c.status==='Pending').length+decisions.filter(d=>d.type==='Pending').length;
  document.getElementById('gov-alert-count').textContent=alerts||'';
  const dot=document.getElementById('status-dot');
  if(dot){
    const offTrack=projects.filter(p=>p.status==='At Risk'||p.status==='Off Track').length;
    const gh=ghConnected();
    const ok=alerts===0&&offTrack===0&&openRisks===0&&gh;
    dot.classList.toggle('warn',!ok);
    dot.title=ok?'All clear':`Needs attention: ${alerts} alerts · ${offTrack} off-track · ${openRisks} open risks${gh?'':' · GitHub not connected'}`;
    updateSysMenu(ok);
  }
}

// System status — true when the GitHub data connection is verified
function ghConnected(){return localStorage.getItem('gh-verified')==='1';}

// ════════════════════════════════════════════════════════════════════
// CONFIG / SETTINGS
// ════════════════════════════════════════════════════════════════════
function applyConfig(){
  const c=CFG;
  document.title=c.company+' — AI Governance Platform';
  document.getElementById('doc-title').textContent=c.company+' — AI Governance Platform';
  // Logo text
  const half=Math.ceil(c.company.length/2);
  document.getElementById('logo-h1').innerHTML=c.company.slice(0,half)+'<span>'+c.company.slice(half)+'</span>';
  document.getElementById('logo-sub').textContent=c.tagline;
  document.getElementById('ld-logo-text').innerHTML=c.company.slice(0,half)+'<span>'+c.company.slice(half)+'</span>';
  document.getElementById('ld-sub-text').textContent=c.tagline;
  document.getElementById('sidebar-footer').innerHTML=c.footer.replace(/\n/g,'<br>');
  // Colors
  document.documentElement.style.setProperty('--accent',c.accent);
  document.documentElement.style.setProperty('--accent-h',shadeColor(c.accent,-20));
  document.documentElement.style.setProperty('--steel',c.steel);
  // Currency
  document.querySelectorAll('.cur-sym').forEach(el=>el.textContent=c.currency);
  // Project types
  populateTypeSelects();
}

function shadeColor(col,pct){
  let R=parseInt(col.slice(1,3),16),G=parseInt(col.slice(3,5),16),B=parseInt(col.slice(5,7),16);
  R=Math.max(0,Math.min(255,R+pct)); G=Math.max(0,Math.min(255,G+pct)); B=Math.max(0,Math.min(255,B+pct));
  return '#'+[R,G,B].map(v=>v.toString(16).padStart(2,'0')).join('');
}

function populateTypeSelects(){
  const opts=CFG.projectTypes.map(t=>`<option>${t}</option>`).join('');
  ['f-type'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML=opts;});
}

function openSettings(){
  const c=CFG;
  document.getElementById('s-company').value=c.company;
  document.getElementById('s-tagline').value=c.tagline;
  document.getElementById('s-footer').value=c.footer;
  document.getElementById('s-accent').value=c.accent;
  document.getElementById('s-accent-val').textContent=c.accent;
  document.getElementById('s-steel').value=c.steel;
  document.getElementById('s-steel-val').textContent=c.steel;
  document.getElementById('s-currency').value=c.currency;
  document.getElementById('s-datefmt').value=c.dateFmt;
  document.getElementById('s-types').value=c.projectTypes.join(', ');
  ['s-accent','s-steel'].forEach(id=>{
    document.getElementById(id).addEventListener('input',function(){
      document.getElementById(id+'-val').textContent=this.value;
    },{once:false});
  });
  document.getElementById('modal-settings').classList.add('open');
}

function saveSettings(){
  CFG={
    company:document.getElementById('s-company').value.trim()||'NEXUS',
    tagline:document.getElementById('s-tagline').value.trim()||'Project Governance Suite',
    footer:document.getElementById('s-footer').value.trim()||'© 2025',
    accent:document.getElementById('s-accent').value,
    steel:document.getElementById('s-steel').value,
    currency:document.getElementById('s-currency').value.trim()||'$',
    dateFmt:document.getElementById('s-datefmt').value,
    projectTypes:document.getElementById('s-types').value.split(',').map(s=>s.trim()).filter(Boolean)
  };
  localStorage.setItem('nx-config',JSON.stringify(CFG));
  applyConfig();
  closeModal('modal-settings');
  toast('Settings saved — branding updated');
}

// ════════════════════════════════════════════════════════════════════
// NAV
// ════════════════════════════════════════════════════════════════════
function nav(id,el){
  // Pause countdown display when leaving datasync (timer keeps running in bg)
  if(currentPanel==='datasync'&&id!=='datasync'){
    clearInterval(window._asCountdownTimer);
    const nxt=document.getElementById('as-next');if(nxt)nxt.textContent='';
  }
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('panel-'+id).classList.add('active');
  if(el) el.classList.add('active');
  currentPanel=id;
  document.getElementById('page-title').textContent=TITLES[id]||id;
  document.getElementById('add-label').textContent=ADD_LABELS[id]||'Add';
  closeSidebar();
  renderPanel(id);
}

function renderPanel(id){
  const fn={governance:renderGovernance,projects:renderProjects,gantt:renderGantt,milestones:renderMilestones,risks:renderRisks,budget:renderBudget,resources:renderResources,improvement:renderImprovement,datasync:renderDataSync};
  if(fn[id]) fn[id]();
  renderLifecycle();
  if(!window.matchMedia('(prefers-reduced-motion:reduce)').matches) requestAnimationFrame(countUp);
}

// ════════════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════════════
function renderDashboard(){
  const on=projects.filter(p=>p.status==='On Track').length;
  const at=projects.filter(p=>p.status==='At Risk'||p.status==='Off Track').length;
  document.getElementById('s-total').textContent=projects.length;
  document.getElementById('s-ontrack').textContent=on;
  document.getElementById('s-atrisk').textContent=at;
  document.getElementById('s-risks').textContent=risks.filter(r=>r.status==='Open').length;
  // Make stat cards clickable
  const statActions=[['s-total','projects'],['s-ontrack','projects'],['s-atrisk','projects'],['s-risks','risks']];
  statActions.forEach(([id,panel])=>{
    const card=document.getElementById(id)?.closest('.stat-card');
    if(card){card.style.cursor='pointer';card.onclick=()=>nav(panel,document.querySelector(`[onclick*="${panel}"]`));}
  });
  document.getElementById('dashboard-tbody').innerHTML=projects.slice(0,5).map(p=>`
    <tr><td><strong>${p.name}</strong><br><small style="color:var(--mist)">${p.type}</small></td>
    <td>${badgeHTML(p.status)}</td>
    <td><div class="prog-wrap"><div class="prog-fill" style="width:${p.progress}%"></div></div> <small style="color:var(--mist);font-size:.62rem">${p.progress}%</small></td>
    <td style="white-space:nowrap">${fmt(p.end)}</td><td>${p.pm}</td></tr>`).join('')||noData(5);
  document.getElementById('dash-risks-tbody').innerHTML=risks.filter(r=>r.status==='Open').slice(0,4).map(r=>`
    <tr><td><strong>${r.title}</strong></td><td>${r.project}</td><td>${sevBadge(r.sev)}</td><td>${r.owner}</td></tr>`).join('')||noData(4);
}

// ════════════════════════════════════════════════════════════════════
// GOVERNANCE BOARD
// ════════════════════════════════════════════════════════════════════
function govHealthScore(){
  if(!projects.length) return 0;
  let score=0;
  projects.forEach(p=>{
    if(p.status==='On Track') score+=100;
    else if(p.status==='Planning') score+=70;
    else if(p.status==='At Risk') score+=40;
    else if(p.status==='Completed') score+=100;
    else score+=10; // Off Track
  });
  const base=score/projects.length;
  const riskPenalty=risks.filter(r=>r.status==='Open'&&(r.sev==='Critical'||r.sev==='High')).length*4;
  return Math.max(0,Math.min(100,Math.round(base-riskPenalty)));
}

function renderGovernance(){
  const score=govHealthScore();
  const pendingCRs=changeReqs.filter(c=>c.status==='Pending').length;
  const openDec=decisions.filter(d=>d.type==='Pending').length;
  const gatesPassed=projects.filter(p=>p.progress>=25).length;

  // Stats
  document.getElementById('gov-stats').className='stats-grid stagger';
  document.getElementById('gov-stats').innerHTML=`
    <div class="stat-card ${score>=75?'green':score>=50?'gold':''}"><div class="stat-label">Health Score</div><div class="stat-val">${score}%</div><div class="stat-sub">Portfolio governance</div></div>
    <div class="stat-card blue"><div class="stat-label">Gates Passed</div><div class="stat-val">${gatesPassed}/${projects.length}</div><div class="stat-sub">Phase gate reviews</div></div>
    <div class="stat-card gold"><div class="stat-label">Pending Decisions</div><div class="stat-val">${openDec}</div><div class="stat-sub">Awaiting resolution</div></div>
    <div class="stat-card purple"><div class="stat-label">Change Requests</div><div class="stat-val">${pendingCRs}</div><div class="stat-sub">Pending CCB review</div></div>`;

  // Health ring
  const r=60,cx=70,cy=70,circ=2*Math.PI*r;
  const col=score>=75?'#22c55e':score>=50?'#f59e0b':'#ef4444';
  document.getElementById('gov-health').innerHTML=`
    <div class="health-ring">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#eee" stroke-width="14" style="transform:rotate(-90deg);transform-origin:70px 70px"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${col}" stroke-width="14"
          stroke-dasharray="${circ*score/100} ${circ*(1-score/100)}" stroke-linecap="round"
          style="transform:rotate(-90deg);transform-origin:70px 70px;transition:stroke-dasharray 1.2s cubic-bezier(.16,1,.3,1)"/>
        <text x="70" y="65" text-anchor="middle" font-family="Inter" font-weight="800" font-size="22" fill="${col}">${score}</text>
        <text x="70" y="82" text-anchor="middle" font-family="Inter" font-size="9" fill="#8b9ab1">HEALTH SCORE</text>
      </svg>
    </div>
    <div style="flex:1;min-width:100px">
      ${[['On Track',projects.filter(p=>p.status==='On Track').length,'#22c55e'],
         ['At Risk',projects.filter(p=>p.status==='At Risk').length,'#f59e0b'],
         ['Off Track',projects.filter(p=>p.status==='Off Track').length,'#ef4444'],
         ['Planning',projects.filter(p=>p.status==='Planning').length,'#3b6ef5'],
         ['Completed',projects.filter(p=>p.status==='Completed').length,'#94a3b8']
        ].map(([l,n,c])=>`<div class="legend-item"><div class="legend-dot" style="background:${c}"></div>${l}: <strong style="margin-left:auto;padding-left:8px">${n}</strong></div>`).join('')}
    </div>`;

  // Stage Gates
  const gates=['Initiation','Planning','Execution','Monitoring','Closure'];
  document.getElementById('gov-gates').innerHTML=`<div class="table-wrap" style="border:none;box-shadow:none"><table style="min-width:280px"><thead><tr><th>Project</th><th>Gate</th><th>Status</th></tr></thead><tbody>
    ${projects.map(p=>{
      const gate=p.progress<10?'Initiation':p.progress<30?'Planning':p.progress<60?'Execution':p.progress<90?'Monitoring':'Closure';
      const gStatus=p.status==='On Track'||p.status==='Completed'?'pass':p.status==='At Risk'?'review':p.status==='Off Track'?'block':'pending';
      const gLabel={pass:'Passed',review:'Review',block:'Blocked',pending:'Pending'}[gStatus];
      const gClass={pass:'badge-on',review:'badge-risk',block:'badge-off',pending:'badge-plan'}[gStatus];
      return `<tr><td style="font-size:.72rem;font-weight:500">${p.name}</td><td style="font-size:.7rem">${gate}</td><td><span class="badge ${gClass}">${gLabel}</span></td></tr>`;
    }).join('')||'<tr><td colspan="3" style="text-align:center;color:var(--mist);padding:16px">No projects</td></tr>'}
  </tbody></table></div>`;

  // Policy Compliance
  const pillars=['Security','Privacy','Finance','HR','Audit'];
  const pillarMap={Security:'🔒',Privacy:'🛡️',Finance:'💰',HR:'👥',Audit:'📋'};
  document.getElementById('gov-policies').innerHTML=projects.length?
    `<div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">
      ${pillars.map(p=>`<span style="font-size:.6rem;color:var(--mist);flex:1;text-align:center;min-width:32px">${p}</span>`).join('')}
     </div>`+
    projects.map(p=>{
      const seed=p.id+p.name.length;
      const checks=pillars.map((_,i)=>{
        const s=(seed*(i+1)*7)%100;
        if(p.status==='Off Track') return s>70?'fail':'warn';
        if(p.status==='At Risk') return s>80?'warn':'ok';
        if(p.status==='Planning') return s>60?'na':'ok';
        return s>90?'warn':'ok';
      });
      return `<div class="policy-row">
        <div class="policy-name">${p.name}</div>
        <div class="policy-checks">${checks.map(c=>`<div class="chk chk-${c}" title="${{ok:'Compliant',warn:'Review needed',fail:'Non-compliant',na:'N/A'}[c]}">${{ok:'✓',warn:'!',fail:'✗',na:'–'}[c]}</div>`).join('')}</div>
      </div>`;
    }).join(''):
    '<p style="color:var(--mist);font-size:.75rem">No projects yet</p>';

  // Decision Log
  document.getElementById('gov-decisions').innerHTML=decisions.length?
    decisions.slice(0,5).map((d,i)=>`
      <div class="decision-item">
        <div class="dec-type dec-${d.type.toLowerCase()}">${d.type}</div>
        <div class="dec-body">
          <div class="dec-title">${d.title}</div>
          <div class="dec-meta">${d.project} · ${d.maker} · ${fmt(d.date)}</div>
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0">
          <button class="btn btn-outline btn-sm" onclick="editDecision(${i})">Edit</button>
          <button class="btn btn-sm" style="background:#fee2e2;color:#991b1b;border:none" onclick="deleteDecision(${i})">Del</button>
        </div>
      </div>`).join('')+
    `<button class="btn btn-outline btn-sm" style="margin-top:12px;width:100%;justify-content:center" onclick="openDecisionModal()">+ Log Decision</button>`:
    `<p style="color:var(--mist);font-size:.75rem;margin-bottom:12px">No decisions logged yet</p>
     <button class="btn btn-outline btn-sm" onclick="openDecisionModal()">+ Log Decision</button>`;

  // Change Requests
  document.getElementById('gov-cr-sub').textContent=`${pendingCRs} pending CCB review`;
  document.getElementById('gov-crs').innerHTML=changeReqs.length?
    changeReqs.map((c,i)=>`
      <div class="cr-row">
        <div class="cr-id">CR-${String(c.id).padStart(3,'0')}</div>
        <div class="cr-title">${c.title}<div style="font-size:.62rem;color:var(--mist)">${c.project} · ${c.type}</div></div>
        <div><span class="cr-impact cr-${c.impact[0].toLowerCase()}">${c.impact}</span></div>
        <span class="badge ${c.status==='Pending'?'badge-risk':c.status==='Approved'?'badge-on':'badge-off'}">${c.status}</span>
        <div style="display:flex;gap:3px;flex-shrink:0;flex-wrap:wrap">
          ${c.status==='Pending'?`<button class="btn btn-sm" style="background:#dcfce7;color:#166534;border:none" onclick="setCRStatus(${i},'Approved')">✓</button><button class="btn btn-sm" style="background:#fee2e2;color:#991b1b;border:none" onclick="setCRStatus(${i},'Rejected')">✗</button>`:''}
          <button class="btn btn-outline btn-sm" onclick="editCR(${i})">Edit</button>
          <button class="btn btn-sm" style="background:#fee2e2;color:#991b1b;border:none" onclick="deleteCR(${i})">Del</button>
        </div>
      </div>`).join('')+
    `<button class="btn btn-outline btn-sm" style="margin-top:12px;width:100%;justify-content:center" onclick="openCRModal()">+ Submit CR</button>`:
    `<p style="color:var(--mist);font-size:.75rem;margin-bottom:12px">No change requests</p>
     <button class="btn btn-outline btn-sm" onclick="openCRModal()">+ Submit CR</button>`;

  // Governance Calendar
  const now=new Date();
  document.getElementById('gov-cal').innerHTML=calEvents.map((e,i)=>{
    const d=new Date(now.getTime()+e.days*86400000);
    return `<div class="gov-cal-item">
      <div class="cal-date-box"><div class="cal-day">${d.getDate()}</div><div class="cal-mon">${MONTHS[d.getMonth()]}</div></div>
      <div class="cal-body"><div class="cal-title">${e.title}</div><div class="cal-sub">${e.sub}</div></div>
      <div style="display:flex;gap:3px;flex-shrink:0">
        <button class="btn btn-outline btn-sm" onclick="openCalModal(${i})">Edit</button>
        <button class="btn btn-sm" style="background:#fee2e2;color:#991b1b;border:none" onclick="deleteCalEvent(${i})">Del</button>
      </div>
    </div>`;
  }).join('')+`<button class="btn btn-outline btn-sm" style="margin-top:10px;width:100%;justify-content:center" onclick="openCalModal()">+ Add Event</button>`;
}

// ════════════════════════════════════════════════════════════════════
// PROJECTS
// ════════════════════════════════════════════════════════════════════
function renderProjects(){
  const filter=document.getElementById('filter-status').value;
  const search=(document.getElementById('search-proj').value||'').toLowerCase();
  const list=projects.filter(p=>{
    if(filter&&p.status!==filter) return false;
    if(search&&!p.name.toLowerCase().includes(search)&&!p.pm.toLowerCase().includes(search)) return false;
    return true;
  });
  document.getElementById('projects-tbody').innerHTML=list.map(p=>{const gi=projects.indexOf(p);return `
    <tr class="proj-row" onclick="openProjectDetail(${gi})" title="Open project workspace">
      <td><strong>${p.name}</strong><br><small style="color:var(--mist);font-size:.63rem">${p.desc||''}</small></td>
      <td style="font-size:.7rem">${p.type}</td>
      <td>${badgeHTML(p.status)}</td>
      <td><div class="prog-wrap" style="width:70px"><div class="prog-fill" style="width:${p.progress}%"></div></div> <small class="num" style="font-size:.6rem;color:var(--mist)">${p.progress}%</small></td>
      <td class="num" style="font-size:.73rem;white-space:nowrap">${CFG.currency}${(p.budget/1000).toFixed(0)}k</td>
      <td style="white-space:nowrap;font-size:.7rem">${fmt(p.start)}</td>
      <td style="white-space:nowrap;font-size:.7rem">${fmt(p.end)}</td>
      <td style="font-size:.7rem">${p.pm}</td>
      <td style="white-space:nowrap" onclick="event.stopPropagation()">
        <button class="btn btn-primary btn-sm" onclick="openProjectDetail(${gi})">Open</button>
        <button class="btn btn-outline btn-sm" style="margin-left:4px" onclick="editProject(${gi})">Edit</button>
        <button class="btn btn-sm" style="background:#fee2e2;color:#991b1b;border:none;margin-left:4px" onclick="deleteProject(${gi})">Del</button>
      </td>
    </tr>`;}).join('')||noData(9);
}

// ════════════════════════════════════════════════════════════════════
// GANTT
// ════════════════════════════════════════════════════════════════════
function renderGantt(){
  const now=new Date();
  const baseYear=now.getFullYear(), startMonth=now.getMonth();
  const months=[];
  for(let i=0;i<12;i++){const d=new Date(baseYear,startMonth+i,1);months.push({label:MONTHS[d.getMonth()]+'\''+String(d.getFullYear()).slice(2)});}
  const rangeStart=new Date(baseYear,startMonth,1);
  const rangeEnd=new Date(baseYear,startMonth+12,0);
  const totalDays=(rangeEnd-rangeStart)/86400000;
  const todayPct=Math.max(0,Math.min(100,((now-rangeStart)/86400000/totalDays)*100));
  document.getElementById('gantt-range').textContent=`${MONTHS[startMonth]} ${baseYear} — ${MONTHS[(startMonth+11)%12]} ${baseYear+(startMonth+11>=12?1:0)}`;
  document.getElementById('gantt-months').innerHTML=months.map(m=>`<div class="gantt-month">${m.label}</div>`).join('');
  document.getElementById('gantt-body').innerHTML=projects.map((p,i)=>{
    const ps=new Date(p.start),pe=new Date(p.end);
    const bs=Math.max(0,((ps-rangeStart)/86400000/totalDays)*100);
    const be=Math.min(100,((pe-rangeStart)/86400000/totalDays)*100);
    const bw=Math.max(1,be-bs);
    const cls=['','gold','green','blue','purple','',''][i%7];
    return `<div class="gantt-row">
      <div class="gantt-row-label">${p.name}<small>${p.pm}</small></div>
      <div class="gantt-timeline">
        <div class="today-line" style="left:${todayPct}%"></div>
        ${bs<100&&be>0?`<div class="gantt-bar ${cls}" style="left:${bs}%;width:${bw}%;animation:fadeUp .4s ${.05*i+.1}s var(--ease) both">
          <span class="gantt-bar-label">${p.progress}% · ${p.name}</span></div>`:''}
      </div>
    </div>`;
  }).join('')||'<div style="padding:24px;text-align:center;color:var(--mist)">Add projects to see timeline</div>';
}

// ════════════════════════════════════════════════════════════════════
// MILESTONES
// ════════════════════════════════════════════════════════════════════
function renderMilestones(){
  const now=new Date();
  const content=document.getElementById('milestone-content');
  // Build per-project milestone columns
  const projectBlocks=projects.map(p=>{
    const start=new Date(p.start),end=new Date(p.end),dur=(end-start)/86400000;
    const autoMs=[
      {name:'Project Kickoff',date:start,done:true,auto:true},
      {name:'Phase 1 Complete',date:new Date(start.getTime()+dur*.25*86400000),done:now>new Date(start.getTime()+dur*.25*86400000),auto:true},
      {name:'Mid-Point Review',date:new Date(start.getTime()+dur*.5*86400000),done:p.progress>=50,auto:true},
      {name:'Phase 2 Complete',date:new Date(start.getTime()+dur*.75*86400000),done:p.progress>=75,auto:true},
      {name:'Project Closure',date:end,done:p.status==='Completed',auto:true},
    ];
    const custom=customMilestones.filter(m=>m.project===p.name).map((m,ci)=>{
      const realIdx=customMilestones.indexOf(m);
      return {...m,auto:false,realIdx};
    });
    const ms=[...autoMs,...custom].sort((a,b)=>new Date(a.date)-new Date(b.date));
    return `<div>
      <div style="font-family:'Inter',sans-serif;font-weight:700;font-size:.85rem;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between">
        ${p.name}
        <button class="btn btn-outline btn-sm" onclick="openMilestoneModal();document.getElementById('ml-project').value='${p.name.replace(/'/g,"\\'")}'" style="font-size:.6rem;padding:3px 7px">+ Add</button>
      </div>
      ${ms.map((m,mi)=>`
        <div style="display:flex;align-items:flex-start;gap:10px;padding:6px 0;${mi<ms.length-1?'border-left:2px solid var(--border);margin-left:5px;padding-left:16px':'padding-left:18px'}">
          <div style="width:12px;height:12px;border-radius:50%;flex-shrink:0;margin-left:${mi<ms.length-1?'-17px':'-1px'};margin-top:3px;background:${m.done?'#22c55e':now>new Date(m.date)?'var(--accent)':'var(--border)'};border:2px solid var(--card);cursor:${m.auto?'default':'pointer'};transition:background .3s" ${!m.auto?`onclick="toggleMilestoneDone(${m.realIdx})" title="Toggle done"`:''} ></div>
          <div style="flex:1;min-width:0">
            <div style="font-size:.76rem;font-weight:500">${m.name}${m.auto?'':` <span style="font-size:.58rem;color:var(--mist)">(custom)</span>`}</div>
            <div style="font-size:.62rem;color:var(--mist)">${new Date(m.date).toLocaleDateString(CFG.dateFmt,{month:'short',day:'numeric',year:'numeric'})}</div>
          </div>
          ${!m.auto?`<div style="display:flex;gap:3px;flex-shrink:0"><button class="btn btn-outline btn-sm" style="font-size:.58rem;padding:2px 5px" onclick="openMilestoneModal(${m.realIdx})">Edit</button><button class="btn btn-sm" style="background:#fee2e2;color:#991b1b;border:none;font-size:.58rem;padding:2px 5px" onclick="deleteMilestone(${m.realIdx})">Del</button></div>`:''}
        </div>`).join('')}
    </div>`;
  }).join('');
  if(!projects.length){content.innerHTML='<p style="color:var(--mist);font-size:.78rem">No projects yet. Add a project first.</p>';return;}
  // Standalone custom milestones (no matching project)
  const orphans=customMilestones.filter(m=>!projects.find(p=>p.name===m.project));
  const orphanBlock=orphans.length?`<div>
    <div style="font-family:'Inter',sans-serif;font-weight:700;font-size:.85rem;margin-bottom:14px">Other Milestones</div>
    ${orphans.map((m,i)=>{const ri=customMilestones.indexOf(m);return`<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)"><div style="width:10px;height:10px;border-radius:50%;background:${m.done?'#22c55e':'var(--border)'}"></div><div style="flex:1;font-size:.75rem">${m.name}<div style="font-size:.6rem;color:var(--mist)">${m.project}·${new Date(m.date).toLocaleDateString(CFG.dateFmt,{month:'short',day:'numeric'})}</div></div><button class="btn btn-outline btn-sm" onclick="openMilestoneModal(${ri})">Edit</button><button class="btn btn-sm" style="background:#fee2e2;color:#991b1b;border:none" onclick="deleteMilestone(${ri})">Del</button></div>`;}).join('')}
  </div>`:'';
  content.innerHTML=projectBlocks+(orphanBlock||'');
}

// ════════════════════════════════════════════════════════════════════
// RISKS
// ════════════════════════════════════════════════════════════════════
function renderRisks(){
  document.getElementById('risks-tbody').innerHTML=risks.map((r,i)=>`
    <tr>
      <td><strong>${r.title}</strong></td>
      <td style="font-size:.7rem">${r.project}</td>
      <td style="font-size:.7rem">${r.cat}</td>
      <td>${sevBadge(r.sev)}</td>
      <td>${probBadge(r.prob)}</td>
      <td style="font-size:.7rem">${r.owner}</td>
      <td style="font-size:.66rem;max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${r.mit}">${r.mit}</td>
      <td><span class="badge ${r.status==='Open'?'badge-risk':'badge-done'}">${r.status}</span></td>
      <td style="white-space:nowrap">
        <button class="btn btn-sm" style="background:${r.status==='Open'?'#dcfce7':'#fee2e2'};color:${r.status==='Open'?'#166534':'#991b1b'};border:none;border-radius:6px" onclick="toggleRisk(${i})">${r.status==='Open'?'Mitigate':'Reopen'}</button>
        <button class="btn btn-outline btn-sm" style="margin-left:3px" onclick="editRisk(${i})">Edit</button>
        <button class="btn btn-sm" style="background:#fee2e2;color:#991b1b;border:none;margin-left:3px" onclick="deleteRisk(${i})">Del</button>
      </td>
    </tr>`).join('')||noData(9);
}

// ════════════════════════════════════════════════════════════════════
// BUDGET
// ════════════════════════════════════════════════════════════════════
function renderBudget(){
  const total=projects.reduce((s,p)=>s+p.budget,0);
  const spent=projects.reduce((s,p)=>s+p.spent,0);
  const rem=total-spent;
  const r=70,cx=90,cy=90,circ=2*Math.PI*r;
  const spentPct=total>0?(spent/total):0;
  const cur=CFG.currency;
  document.getElementById('donut-area').innerHTML=`
    <svg class="donut" width="180" height="180" viewBox="0 0 180 180">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#eee" stroke-width="18"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--accent)" stroke-width="18"
        stroke-dasharray="${circ*spentPct} ${circ*(1-spentPct)}" stroke-linecap="round"/>
    </svg>
    <div>
      <div class="num" style="font-weight:700;font-size:1.6rem">${cur}${(total/1e6).toFixed(2)}M</div>
      <div style="font-size:.63rem;color:var(--mist);margin-bottom:12px">Total Portfolio</div>
      <div class="donut-legend">
        <div class="legend-item"><div class="legend-dot" style="background:var(--accent)"></div>Spent: ${cur}${(spent/1000).toFixed(0)}k (${Math.round(spentPct*100)}%)</div>
        <div class="legend-item"><div class="legend-dot" style="background:#eee;border:1px solid #ddd"></div>Remaining: ${cur}${(rem/1000).toFixed(0)}k</div>
      </div>
    </div>`;
  document.getElementById('budget-rows').innerHTML=projects.map((p,pi)=>{
    const pct=p.budget>0?Math.min(100,Math.round((p.spent/p.budget)*100)):0;
    const over=p.spent>p.budget;
    return `<div class="budget-row">
      <div class="budget-name">${p.name}<br><small style="color:var(--mist);font-size:.6rem">${p.type}</small></div>
      <div><div class="util-label"><span>${cur}${(p.spent/1000).toFixed(0)}k / ${cur}${(p.budget/1000).toFixed(0)}k</span><span style="color:${over?'#ef4444':'var(--mist)'}">${pct}%</span></div>
      <div class="util-bar"><div class="util-fill" style="width:${pct}%;background:${over?'#ef4444':pct>80?'#f59e0b':'#22c55e'}"></div></div></div>
      <div style="font-size:.7rem;color:var(--mist);white-space:nowrap">${cur}${(p.budget/1000).toFixed(0)}k</div>
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <div style="font-size:.7rem;color:${over?'#ef4444':'var(--ink)'};white-space:nowrap;font-weight:${over?600:400}">${cur}${((p.budget-p.spent)/1000).toFixed(0)}k left</div>
        <button class="btn btn-outline btn-sm" style="font-size:.58rem;padding:2px 7px" onclick="openBudgetModal(${pi})">Edit</button>
      </div>
    </div>`;
  }).join('')||'<p style="color:var(--mist);font-size:.76rem;padding:12px">No projects yet</p>';
}

// ════════════════════════════════════════════════════════════════════
// RESOURCES
// ════════════════════════════════════════════════════════════════════
function renderResources(){
  // Merge: explicit resources + auto-derived PMs
  const pms={};
  projects.forEach(p=>{if(!pms[p.pm])pms[p.pm]={name:p.pm,count:0,types:new Set(),projects:[]};pms[p.pm].count++;pms[p.pm].types.add(p.type);pms[p.pm].projects.push(p);});
  // Build display list: explicit resources take priority, then project-derived PMs not already listed
  const explicitNames=new Set(resources.map(r=>r.name));
  const derivedPMs=Object.values(pms).filter(pm=>!explicitNames.has(pm.name));
  const allCards=[
    ...resources.map((r,i)=>({type:'explicit',r,i})),
    ...derivedPMs.map((pm,i)=>({type:'derived',pm,i}))
  ];
  const grid=document.getElementById('resource-grid');
  if(!allCards.length){
    grid.innerHTML='<p style="color:var(--mist);font-size:.78rem;grid-column:1/-1">No resources. Add a resource or assign PMs to projects.</p>';return;
  }
  grid.innerHTML=allCards.map(({type,r,pm,i},ci)=>{
    if(type==='explicit'){
      const initials=r.name.split(' ').map(n=>n[0]).join('');
      const util=Math.min(100,r.util);
      const proj=projects.filter(p=>p.name===r.project||p.pm===r.name);
      return `<div class="resource-card">
        <div class="rc-head">
          <div class="avatar" style="background:${AVT_COLORS[ci%AVT_COLORS.length]}">${initials}</div>
          <div style="flex:1;min-width:0"><div class="rc-name">${r.name}</div><div class="rc-role">${r.role}</div>${r.dept?`<div style="font-size:.58rem;color:var(--mist)">${r.dept}</div>`:''}</div>
          <div style="display:flex;gap:4px;flex-shrink:0">
            <button class="btn btn-outline btn-sm" style="font-size:.6rem;padding:3px 7px" onclick="openResourceModal(${i})">Edit</button>
            <button class="btn btn-sm" style="background:#fee2e2;color:#991b1b;border:none;font-size:.6rem;padding:3px 7px" onclick="deleteResource(${i})">Del</button>
          </div>
        </div>
        ${r.email?`<div style="font-size:.62rem;color:var(--mist);margin-bottom:6px">✉ ${r.email}</div>`:''}
        ${proj.map(p=>`<div style="font-size:.66rem;padding:4px 0;border-bottom:1px solid var(--border)">${p.name} <span style="color:var(--mist)">${p.progress}%</span></div>`).join('')}
        <div class="util-bar-wrap">
          <div class="util-label"><span>Utilization</span><span>${util}%</span></div>
          <div class="util-bar"><div class="util-fill" style="width:${util}%;background:${util>85?'#ef4444':util>65?'#f59e0b':'#22c55e'}"></div></div>
        </div>
      </div>`;
    } else {
      const initials=pm.name.split(' ').map(n=>n[0]).join('');
      const util=Math.min(100,pm.count*20+Math.floor((pm.name.length*13)%20));
      return `<div class="resource-card">
        <div class="rc-head">
          <div class="avatar" style="background:${AVT_COLORS[ci%AVT_COLORS.length]}">${initials}</div>
          <div style="flex:1;min-width:0"><div class="rc-name">${pm.name}</div><div class="rc-role">${[...pm.types][0]||'Project Manager'}</div></div>
          <button class="btn btn-outline btn-sm" style="font-size:.6rem;padding:3px 7px;flex-shrink:0" onclick="openResourceModal();document.getElementById('res-name').value='${pm.name.replace(/'/g,"\\'")}'" title="Save as explicit resource">Save</button>
        </div>
        <div style="font-size:.7rem;color:var(--mist);margin-bottom:8px">${pm.count} project${pm.count!==1?'s':''} (auto-derived)</div>
        ${pm.projects.map(p=>`<div style="font-size:.66rem;padding:4px 0;border-bottom:1px solid var(--border)">${p.name} <span style="color:var(--mist)">${p.progress}%</span></div>`).join('')}
        <div class="util-bar-wrap">
          <div class="util-label"><span>Utilization</span><span>${util}%</span></div>
          <div class="util-bar"><div class="util-fill" style="width:${util}%;background:${util>85?'#ef4444':util>65?'#f59e0b':'#22c55e'}"></div></div>
        </div>
      </div>`;
    }
  }).join('');
}

// ════════════════════════════════════════════════════════════════════
// PROJECT DETAIL WORKSPACE — own timeline, risks, budget, resources
// ════════════════════════════════════════════════════════════════════
function openProjectDetail(i){
  pdProject=projects[i];if(!pdProject)return;
  document.getElementById('pd-title').textContent=pdProject.name;
  document.getElementById('pd-badges').innerHTML=badgeHTML(pdProject.status)+` <span class="badge badge-info">${pdProject.type}</span>`;
  document.getElementById('pd-meta').innerHTML=`<span>PM <b>${pdProject.pm}</b></span><span>Start <b>${fmt(pdProject.start)}</b></span><span>End <b>${fmt(pdProject.end)}</b></span><span>Progress <b>${pdProject.progress}%</b></span><span>Budget <b>${CFG.currency}${(pdProject.budget/1000).toFixed(0)}k</b></span>`;
  // reset to first tab
  document.querySelectorAll('#modal-pd .tab').forEach((t,ti)=>t.classList.toggle('active',ti===0));
  document.querySelectorAll('#modal-pd .tab-pane').forEach((p,pi)=>p.classList.toggle('active',pi===0));
  renderPdTimeline();renderPdRisks();renderPdBudget();renderPdResources();
  document.getElementById('modal-pd').classList.add('open');
  renderLifecycle();
}
function pdTab(name,el){
  document.querySelectorAll('#modal-pd .tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('#modal-pd .tab-pane').forEach(p=>p.classList.remove('active'));
  document.getElementById('pd-'+name).classList.add('active');
}
function pdSubs(){return subtasks.filter(s=>s.pid===pdProject.id);}
function renderPdTimeline(){
  const ps=new Date(pdProject.start),pe=new Date(pdProject.end),span=Math.max(1,(pe-ps)/86400000);
  const subs=pdSubs();
  const rows=subs.map(s=>{
    const ss=new Date(s.start),se=new Date(s.end);
    const left=Math.max(0,Math.min(100,((ss-ps)/86400000/span)*100));
    const w=Math.max(3,Math.min(100-left,((se-ss)/86400000/span)*100));
    const col=s.status==='Done'?'var(--green)':s.status==='Blocked'?'var(--red)':s.status==='In Progress'?'var(--accent)':'var(--silver)';
    const si=subtasks.indexOf(s);
    return `<div class="st-row">
      <div class="st-name">${s.name}<small>${s.owner||'—'} · ${s.status}</small></div>
      <div class="st-track"><div class="st-bar" style="left:${left}%;width:${w}%;background:${col}">${s.prog}%</div></div>
      <div style="display:flex;gap:4px;white-space:nowrap"><span class="num" style="font-size:.62rem;color:var(--mist);align-self:center">${CFG.currency}${((s.cost||0)/1000).toFixed(0)}k</span>
        <button class="btn btn-outline btn-sm" onclick="openSubtask(${si})">Edit</button>
        <button class="btn btn-sm" style="background:#fee2e2;color:#991b1b;border:none" onclick="deleteSubtask(${si})">×</button></div>
    </div>`;
  }).join('')||'<p style="color:var(--mist);font-size:.74rem;padding:8px 0">No sub-tasks yet. Add the first one below.</p>';
  const done=subs.filter(s=>s.status==='Done').length;
  document.getElementById('pd-timeline').innerHTML=`
    <div class="kpi-row">
      <div class="kpi"><div class="l">Sub-tasks</div><div class="v">${subs.length}</div></div>
      <div class="kpi"><div class="l">Completed</div><div class="v">${done}</div></div>
      <div class="kpi"><div class="l">Avg Progress</div><div class="v">${subs.length?Math.round(subs.reduce((a,s)=>a+(+s.prog||0),0)/subs.length):0}%</div></div>
    </div>
    ${rows}
    <button class="btn btn-primary btn-sm" style="margin-top:14px" onclick="openSubtask()">+ Add Sub-task</button>`;
}
function renderPdRisks(){
  const rs=risks.map((r,i)=>({r,i})).filter(o=>o.r.project===pdProject.name);
  document.getElementById('pd-risks').innerHTML=`
    <div class="table-wrap" style="box-shadow:none"><table style="min-width:0"><thead><tr><th>Risk</th><th>Category</th><th>Severity</th><th>Probability</th><th>Owner</th><th>Status</th><th></th></tr></thead><tbody>
    ${rs.map(({r,i})=>`<tr><td><strong>${r.title}</strong><br><small style="color:var(--mist);font-size:.6rem">${r.mit||''}</small></td><td style="font-size:.7rem">${r.cat}</td><td>${sevBadge(r.sev)}</td><td>${probBadge(r.prob)}</td><td style="font-size:.7rem">${r.owner}</td><td><span class="badge ${r.status==='Open'?'badge-risk':'badge-done'}">${r.status}</span></td>
      <td style="white-space:nowrap"><button class="btn btn-sm" style="background:${r.status==='Open'?'#dcfce7':'#fee2e2'};color:${r.status==='Open'?'#166534':'#991b1b'};border:none" onclick="toggleRisk(${i});renderPdRisks()">${r.status==='Open'?'Mitigate':'Reopen'}</button>
      <button class="btn btn-outline btn-sm" style="margin-left:3px" onclick="closeModal('modal-pd');editRisk(${i})">Edit</button></td></tr>`).join('')||'<tr><td colspan="7" style="text-align:center;color:var(--mist);padding:18px">No risks logged for this project</td></tr>'}
    </tbody></table></div>
    <button class="btn btn-primary btn-sm" style="margin-top:14px" onclick="pdAddRisk()">+ Add Risk to this Project</button>`;
}
function pdAddRisk(){
  const name=pdProject.name;closeModal('modal-pd');
  editRiskIdx=-1;
  document.getElementById('r-project').innerHTML=projects.map(p=>`<option>${p.name}</option>`).join('');
  ['r-title','r-owner','r-mit'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('r-sev').value='Medium';document.getElementById('r-prob').value='Medium';document.getElementById('r-cat').value='Technical';
  document.querySelector('#modal-risk h2').textContent='Add Risk';
  document.getElementById('r-project').value=name;
  document.getElementById('modal-risk').classList.add('open');
}
function renderPdBudget(){
  const planned=pdSubs().reduce((a,s)=>a+(+s.cost||0),0);
  const spent=pdProject.spent||0,total=pdProject.budget||0,rem=total-spent;
  const pct=total>0?Math.min(100,Math.round(spent/total*100)):0;
  const over=spent>total;
  document.getElementById('pd-budget').innerHTML=`
    <div class="kpi-row">
      <div class="kpi"><div class="l">Total Budget</div><div class="v">${CFG.currency}${(total/1000).toFixed(0)}k</div></div>
      <div class="kpi"><div class="l">Spent</div><div class="v" style="color:${over?'var(--red)':'inherit'}">${CFG.currency}${(spent/1000).toFixed(0)}k</div></div>
      <div class="kpi"><div class="l">Remaining</div><div class="v" style="color:${rem<0?'var(--red)':'var(--green)'}">${CFG.currency}${(rem/1000).toFixed(0)}k</div></div>
      <div class="kpi"><div class="l">Planned (sub-tasks)</div><div class="v">${CFG.currency}${(planned/1000).toFixed(0)}k</div></div>
    </div>
    <div class="util-label"><span>Budget consumed</span><span class="num" style="color:${over?'var(--red)':'var(--mist)'}">${pct}%</span></div>
    <div class="util-bar" style="height:10px"><div class="util-fill" style="width:${pct}%;background:${over?'var(--red)':pct>80?'#f59e0b':'var(--green)'}"></div></div>
    <p style="font-size:.66rem;color:var(--mist);margin-top:10px">Planned cost is the sum of this project's sub-task budgets. ${planned>total?'<b style="color:var(--red)">Planned exceeds approved budget.</b>':''}</p>
    <button class="btn btn-primary btn-sm" style="margin-top:14px" onclick="closeModal('modal-pd');openBudgetModal(${projects.indexOf(pdProject)})">Update Budget</button>`;
}
function renderPdResources(){
  const team=resources.filter(r=>r.project===pdProject.name||r.name===pdProject.pm);
  const names=new Set(team.map(t=>t.name));
  if(!names.has(pdProject.pm)) team.unshift({name:pdProject.pm,role:'Project Manager',util:null,derived:true});
  document.getElementById('pd-resources').innerHTML=`
    <div class="resource-grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">
    ${team.map((r,ci)=>{const init=r.name.split(' ').map(n=>n[0]).join('');const util=r.util==null?Math.min(100,(pdProject.progress||0)):r.util;
      return `<div class="resource-card"><div class="rc-head"><div class="avatar" style="background:${AVT_COLORS[ci%AVT_COLORS.length]}">${init}</div><div style="flex:1;min-width:0"><div class="rc-name">${r.name}</div><div class="rc-role">${r.role||'Contributor'}${r.derived?' · auto':''}</div></div></div>
      <div class="util-bar-wrap"><div class="util-label"><span>Utilization</span><span class="num">${util}%</span></div><div class="util-bar"><div class="util-fill" style="width:${util}%;background:${util>85?'var(--red)':util>65?'#f59e0b':'var(--green)'}"></div></div></div></div>`;}).join('')||'<p style="color:var(--mist);font-size:.74rem">No resources assigned.</p>'}
    </div>
    <button class="btn btn-primary btn-sm" style="margin-top:14px" onclick="pdAddResource()">+ Assign Resource</button>`;
}
function pdAddResource(){const name=pdProject.name;closeModal('modal-pd');openResourceModal();setTimeout(()=>{document.getElementById('res-project').value=name;},10);}
function openSubtask(i){
  editSubIdx=i==null?-1:i;const s=i==null?{}:subtasks[i];
  document.getElementById('sub-h').textContent=i==null?'Add Sub-task':'Edit Sub-task';
  document.getElementById('sub-name').value=s.name||'';
  document.getElementById('sub-owner').value=s.owner||pdProject.pm||'';
  document.getElementById('sub-status').value=s.status||'Not Started';
  document.getElementById('sub-start').value=s.start||pdProject.start;
  document.getElementById('sub-end').value=s.end||pdProject.end;
  document.getElementById('sub-prog').value=s.prog!=null?s.prog:0;
  document.getElementById('sub-cost').value=s.cost!=null?s.cost:'';
  document.getElementById('modal-subtask').classList.add('open');
}
function saveSubtask(){
  const name=document.getElementById('sub-name').value.trim();
  if(!name){toast('Sub-task name required');return;}
  const obj={id:editSubIdx>=0?subtasks[editSubIdx].id:Date.now(),pid:pdProject.id,name,
    owner:document.getElementById('sub-owner').value,status:document.getElementById('sub-status').value,
    start:document.getElementById('sub-start').value,end:document.getElementById('sub-end').value,
    prog:+document.getElementById('sub-prog').value||0,cost:+document.getElementById('sub-cost').value||0};
  if(editSubIdx>=0)subtasks[editSubIdx]=obj;else subtasks.push(obj);
  save();closeModal('modal-subtask');renderPdTimeline();renderPdBudget();toast(editSubIdx>=0?'Sub-task updated':'Sub-task added');
}
function deleteSubtask(i){if(!confirm(`Delete "${subtasks[i].name}"?`))return;subtasks.splice(i,1);save();renderPdTimeline();renderPdBudget();toast('Sub-task deleted');}

// ════════════════════════════════════════════════════════════════════
// CONTINUOUS IMPROVEMENT PROGRAM (PDCA / Kaizen)
// ════════════════════════════════════════════════════════════════════
function renderImprovement(){
  const total=improvements.length;
  const done=improvements.filter(i=>i.status==='Done').length;
  const active=total-done;
  const highImpact=improvements.filter(i=>i.impact==='High'&&i.status!=='Done').length;
  document.getElementById('cip-stats').innerHTML=`
    <div class="stat-card"><div class="stat-label">Initiatives</div><div class="stat-val">${total}</div><div class="stat-sub">Total tracked</div></div>
    <div class="stat-card blue"><div class="stat-label">In Progress</div><div class="stat-val">${active}</div><div class="stat-sub">Across PDCA cycle</div></div>
    <div class="stat-card gold"><div class="stat-label">High Impact Open</div><div class="stat-val">${highImpact}</div><div class="stat-sub">Priority focus</div></div>
    <div class="stat-card green"><div class="stat-label">Realized</div><div class="stat-val">${done}</div><div class="stat-sub">Improvements shipped</div></div>`;
  document.getElementById('cip-board').innerHTML=CIP_STAGES.map(stage=>{
    const cards=improvements.map((it,i)=>({it,i})).filter(o=>o.it.stage===stage);
    return `<div class="cip-col" data-stage="${stage}" ondragover="cipOver(event)" ondragleave="cipLeave(event)" ondrop="cipDrop(event,'${stage}')">
      <h4>${stage}<span>${cards.length}</span></h4>
      ${cards.map(({it,i})=>{const ic={High:'pill-hi',Medium:'pill-md',Low:'pill-lo'}[it.impact];
        return `<div class="cip-card" draggable="true" ondragstart="cipDrag(event,${i})" ondragend="cipEnd(event)" onclick="openCip(${i})">
          <div class="cip-t">${it.title}</div>
          <div class="cip-m"><span class="pill ${ic}">${it.impact} impact</span><span>${it.cat}</span></div>
          <div class="cip-m"><span>${it.project}</span>·<span>${it.owner||'—'}</span></div>
        </div>`;}).join('')}
    </div>`;
  }).join('');
}
let cipDragIdx=-1;
function cipDrag(e,i){cipDragIdx=i;e.target.classList.add('dragging');e.dataTransfer.effectAllowed='move';}
function cipEnd(e){e.target.classList.remove('dragging');}
function cipOver(e){e.preventDefault();e.currentTarget.classList.add('drop');}
function cipLeave(e){e.currentTarget.classList.remove('drop');}
function cipDrop(e,stage){e.preventDefault();e.currentTarget.classList.remove('drop');
  if(cipDragIdx<0)return;improvements[cipDragIdx].stage=stage;
  if(stage==='Act')improvements[cipDragIdx].status='Done';else improvements[cipDragIdx].status='Active';
  cipDragIdx=-1;save();renderImprovement();toast('Initiative moved to '+stage);}
function openCip(i){
  editCipIdx=i==null?-1:i;const it=i==null?{}:improvements[i];
  document.getElementById('cip-h').textContent=i==null?'New Improvement Initiative':'Edit Initiative';
  document.getElementById('cip-project').innerHTML=['Portfolio-wide',...projects.map(p=>p.name)].map(n=>`<option>${n}</option>`).join('');
  document.getElementById('cip-title').value=it.title||'';
  document.getElementById('cip-project').value=it.project||'Portfolio-wide';
  document.getElementById('cip-cat').value=it.cat||'Process';
  document.getElementById('cip-stage').value=it.stage||'Identify';
  document.getElementById('cip-owner').value=it.owner||'';
  document.getElementById('cip-impact').value=it.impact||'Medium';
  document.getElementById('cip-effort').value=it.effort||'Medium';
  document.getElementById('cip-desc').value=it.desc||'';
  document.getElementById('modal-cip').classList.add('open');
}
function saveCip(){
  const title=document.getElementById('cip-title').value.trim();
  if(!title){toast('Title required');return;}
  const stage=document.getElementById('cip-stage').value;
  const obj={id:editCipIdx>=0?improvements[editCipIdx].id:Date.now(),title,
    project:document.getElementById('cip-project').value,cat:document.getElementById('cip-cat').value,
    stage,owner:document.getElementById('cip-owner').value,impact:document.getElementById('cip-impact').value,
    effort:document.getElementById('cip-effort').value,desc:document.getElementById('cip-desc').value,
    status:stage==='Act'?'Done':'Active'};
  if(editCipIdx>=0)improvements[editCipIdx]=obj;else improvements.push(obj);
  save();closeModal('modal-cip');renderImprovement();toast(editCipIdx>=0?'Initiative updated':'Initiative added');
}
function deleteCip(){if(editCipIdx<0||!confirm('Delete this initiative?'))return;improvements.splice(editCipIdx,1);editCipIdx=-1;save();closeModal('modal-cip');renderImprovement();toast('Initiative deleted');}

// Flip-card reveal for stat values
function countUp(){
  document.querySelectorAll('.panel.active .stat-val').forEach((el,i)=>{
    el.classList.remove('flip');void el.offsetWidth; // restart animation
    el.style.animationDelay=(i*0.08)+'s';
    el.classList.add('flip');
  });
}

// ════════════════════════════════════════════════════════════════════
// MODALS
// ════════════════════════════════════════════════════════════════════
function openAddModal(){
  if(currentPanel==='risks'){
    editRiskIdx=-1;
    document.getElementById('r-project').innerHTML=projects.map(p=>`<option>${p.name}</option>`).join('')||'<option>No projects</option>';
    document.querySelector('#modal-risk h2').textContent='Add Risk';
    ['r-title','r-owner','r-mit'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('r-sev').value='Medium';document.getElementById('r-prob').value='Medium';document.getElementById('r-cat').value='Technical';
    document.getElementById('modal-risk').classList.add('open');
  } else if(currentPanel==='governance'){
    openDecisionModal();
  } else if(currentPanel==='milestones'){
    openMilestoneModal();
  } else if(currentPanel==='resources'){
    openResourceModal();
  } else if(currentPanel==='budget'){
    openBudgetModal();
  } else if(currentPanel==='improvement'){
    openCip();
  } else if(currentPanel==='datasync'){
    openDataRowModal();
  } else {
    editIdx=-1;
    document.getElementById('modal-title').textContent='Add New Project';
    ['f-name','f-pm','f-budget','f-progress','f-desc'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('f-status').value='Planning';
    const now=new Date(),end=new Date();end.setMonth(end.getMonth()+6);
    document.getElementById('f-start').value=now.toISOString().slice(0,10);
    document.getElementById('f-end').value=end.toISOString().slice(0,10);
    document.getElementById('modal-project').classList.add('open');
  }
}

function openMilestoneModal(i){
  editResIdx=i===undefined?-1:i;
  const m=i!==undefined?customMilestones[i]:{};
  document.getElementById('ml-project').innerHTML=projects.map(p=>`<option>${p.name}</option>`).join('')||'<option>No projects</option>';
  document.getElementById('ml-name').value=m.name||'';
  document.getElementById('ml-date').value=m.date||new Date().toISOString().slice(0,10);
  document.getElementById('ml-project').value=m.project||'';
  document.getElementById('ml-done').value=m.done?'true':'false';
  document.querySelector('#modal-milestone h2').textContent=i!==undefined?'Edit Milestone':'Add Milestone';
  document.getElementById('modal-milestone').classList.add('open');
}
function saveMilestone(){
  const name=document.getElementById('ml-name').value.trim();
  if(!name){toast('Milestone name required');return;}
  const obj={id:editResIdx>=0?customMilestones[editResIdx].id:Date.now(),name,project:document.getElementById('ml-project').value,date:document.getElementById('ml-date').value,done:document.getElementById('ml-done').value==='true'};
  if(editResIdx>=0) customMilestones[editResIdx]=obj; else customMilestones.push(obj);
  save();closeModal('modal-milestone');renderPanel('milestones');toast(editResIdx>=0?'Milestone updated':'Milestone added');
}
function deleteMilestone(i){if(!confirm(`Delete "${customMilestones[i].name}"?`))return;customMilestones.splice(i,1);save();renderPanel('milestones');toast('Milestone deleted');}
function toggleMilestoneDone(i){customMilestones[i].done=!customMilestones[i].done;save();renderPanel('milestones');}

function openResourceModal(i){
  const r=i!==undefined?resources[i]:{};
  editResIdx=i===undefined?-1:i;
  document.getElementById('res-name').value=r.name||'';
  document.getElementById('res-role').value=r.role||'Project Manager';
  document.getElementById('res-dept').value=r.dept||'';
  document.getElementById('res-email').value=r.email||'';
  document.getElementById('res-util').value=r.util||50;
  document.getElementById('res-project').innerHTML=(['(None)',...projects.map(p=>p.name)]).map(n=>`<option>${n}</option>`).join('');
  document.getElementById('res-project').value=r.project||'(None)';
  document.querySelector('#modal-resource h2').textContent=i!==undefined?'Edit Resource':'Add Resource';
  document.getElementById('modal-resource').classList.add('open');
}
function saveResource(){
  const name=document.getElementById('res-name').value.trim();
  if(!name){toast('Resource name required');return;}
  const obj={id:editResIdx>=0?resources[editResIdx].id:Date.now(),name,role:document.getElementById('res-role').value,dept:document.getElementById('res-dept').value,email:document.getElementById('res-email').value,util:+document.getElementById('res-util').value||50,project:document.getElementById('res-project').value};
  if(editResIdx>=0) resources[editResIdx]=obj; else resources.push(obj);
  save();closeModal('modal-resource');renderPanel('resources');toast(editResIdx>=0?'Resource updated':'Resource added');
}
function deleteResource(i){if(!confirm(`Remove "${resources[i].name}"?`))return;resources.splice(i,1);save();renderPanel('resources');toast('Resource removed');}

function openBudgetModal(i){
  const p=i!==undefined?projects[i]:{};
  editIdx=i===undefined?-1:i;
  document.getElementById('bud-project').innerHTML=projects.map((pr,pi)=>`<option value="${pi}">${pr.name}</option>`).join('');
  if(i!==undefined) document.getElementById('bud-project').value=i;
  document.getElementById('bud-budget').value=p.budget||0;
  document.getElementById('bud-spent').value=p.spent||0;
  document.getElementById('modal-budget').classList.add('open');
}
function saveBudget(){
  const idx=+document.getElementById('bud-project').value;
  if(isNaN(idx)||!projects[idx]){toast('Select a project');return;}
  projects[idx].budget=+document.getElementById('bud-budget').value||0;
  projects[idx].spent=+document.getElementById('bud-spent').value||0;
  save();closeModal('modal-budget');renderPanel('budget');toast('Budget updated');
}

function editRisk(i){
  editRiskIdx=i;const r=risks[i];
  document.getElementById('r-project').innerHTML=projects.map(p=>`<option>${p.name}</option>`).join('')||'<option>No projects</option>';
  document.getElementById('r-title').value=r.title;
  document.getElementById('r-project').value=r.project;
  document.getElementById('r-cat').value=r.cat;
  document.getElementById('r-sev').value=r.sev;
  document.getElementById('r-prob').value=r.prob;
  document.getElementById('r-owner').value=r.owner;
  document.getElementById('r-mit').value=r.mit;
  document.querySelector('#modal-risk h2').textContent='Edit Risk';
  document.getElementById('modal-risk').classList.add('open');
}
function deleteRisk(i){if(!confirm(`Delete risk "${risks[i].title}"?`))return;risks.splice(i,1);save();renderPanel('risks');toast('Risk deleted');}

function editDecision(i){
  editDecIdx=i;const d=decisions[i];
  document.getElementById('d-project').innerHTML=projects.map(p=>`<option>${p.name}</option>`).join('')||'<option>General</option>';
  document.getElementById('d-title').value=d.title;
  document.getElementById('d-project').value=d.project;
  document.getElementById('d-type').value=d.type;
  document.getElementById('d-maker').value=d.maker;
  document.getElementById('d-date').value=d.date;
  document.getElementById('d-impact').value=d.impact;
  document.getElementById('d-rationale').value=d.rationale||'';
  document.querySelector('#modal-decision h2').textContent='Edit Decision';
  document.getElementById('modal-decision').classList.add('open');
}
function deleteDecision(i){if(!confirm('Delete this decision?'))return;decisions.splice(i,1);save();renderPanel('governance');toast('Decision deleted');}

function editCR(i){
  editCRIdx=i;const c=changeReqs[i];
  document.getElementById('cr-project').innerHTML=projects.map(p=>`<option>${p.name}</option>`).join('')||'<option>General</option>';
  document.getElementById('cr-title').value=c.title;
  document.getElementById('cr-project').value=c.project;
  document.getElementById('cr-type').value=c.type;
  document.getElementById('cr-impact').value=c.impact;
  document.getElementById('cr-by').value=c.by;
  document.getElementById('cr-date').value=c.date;
  document.getElementById('cr-desc').value=c.desc||'';
  document.querySelector('#modal-cr h2').textContent='Edit Change Request';
  document.getElementById('modal-cr').classList.add('open');
}
function deleteCR(i){if(!confirm('Delete this change request?'))return;changeReqs.splice(i,1);save();renderPanel('governance');toast('CR deleted');}
function setCRStatus(i,s){changeReqs[i].status=s;save();renderPanel('governance');toast('CR status updated to '+s);}

function openCalModal(i){
  const e=i!==undefined?calEvents[i]:{};
  editResIdx=i===undefined?-1:i;
  document.getElementById('cal-title').value=e.title||'';
  document.getElementById('cal-sub').value=e.sub||'';
  document.getElementById('cal-days').value=e.days||7;
  document.querySelector('#modal-cal h2').textContent=i!==undefined?'Edit Calendar Event':'Add Calendar Event';
  document.getElementById('modal-cal').classList.add('open');
}
function saveCalEvent(){
  const title=document.getElementById('cal-title').value.trim();
  if(!title){toast('Event title required');return;}
  const obj={title,sub:document.getElementById('cal-sub').value,days:+document.getElementById('cal-days').value||7};
  if(editResIdx>=0) calEvents[editResIdx]=obj; else calEvents.push(obj);
  save();closeModal('modal-cal');renderPanel('governance');toast('Calendar updated');
}
function deleteCalEvent(i){calEvents.splice(i,1);save();renderPanel('governance');toast('Event removed');}

function inlineEdit(el, onSave){
  const orig=el.textContent;
  el.contentEditable=true;el.style.outline='2px solid var(--accent)';el.style.borderRadius='3px';el.focus();
  const finish=()=>{el.contentEditable=false;el.style.outline='';el.style.borderRadius='';const v=el.textContent.trim();if(v&&v!==orig)onSave(v);else el.textContent=orig;};
  el.onblur=finish;el.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();finish();}if(e.key==='Escape'){el.textContent=orig;el.contentEditable=false;el.style.outline='';}};
}
function openDecisionModal(){
  editDecIdx=-1;
  document.getElementById('d-project').innerHTML=projects.map(p=>`<option>${p.name}</option>`).join('')||'<option>General</option>';
  document.getElementById('d-date').value=new Date().toISOString().slice(0,10);
  ['d-title','d-maker','d-rationale'].forEach(id=>document.getElementById(id).value='');
  document.querySelector('#modal-decision h2').textContent='Log Decision';
  document.getElementById('modal-decision').classList.add('open');
}

function openCRModal(){
  editCRIdx=-1;
  document.getElementById('cr-project').innerHTML=projects.map(p=>`<option>${p.name}</option>`).join('')||'<option>General</option>';
  document.getElementById('cr-date').value=new Date().toISOString().slice(0,10);
  ['cr-title','cr-by','cr-desc'].forEach(id=>document.getElementById(id).value='');
  document.querySelector('#modal-cr h2').textContent='Submit Change Request';
  document.getElementById('modal-cr').classList.add('open');
}

function closeModal(id){document.getElementById(id).classList.remove('open');renderLifecycle();}

function editProject(i){
  editIdx=i;const p=projects[i];
  document.getElementById('modal-title').textContent='Edit Project';
  document.getElementById('f-name').value=p.name;
  document.getElementById('f-pm').value=p.pm;
  document.getElementById('f-type').value=p.type;
  document.getElementById('f-status').value=p.status;
  document.getElementById('f-start').value=p.start;
  document.getElementById('f-end').value=p.end;
  document.getElementById('f-budget').value=p.budget;
  document.getElementById('f-progress').value=p.progress;
  document.getElementById('f-desc').value=p.desc||'';
  document.getElementById('modal-project').classList.add('open');
}

function saveProject(){
  const name=document.getElementById('f-name').value.trim();
  if(!name){toast('Project name is required');return;}
  const obj={
    id:editIdx>=0?projects[editIdx].id:Date.now(),name,
    type:document.getElementById('f-type').value,
    pm:document.getElementById('f-pm').value||'Unassigned',
    status:document.getElementById('f-status').value,
    start:document.getElementById('f-start').value,
    end:document.getElementById('f-end').value,
    budget:+(document.getElementById('f-budget').value)||0,
    spent:editIdx>=0?projects[editIdx].spent:0,
    progress:+(document.getElementById('f-progress').value)||0,
    desc:document.getElementById('f-desc').value,
  };
  if(editIdx>=0) projects[editIdx]=obj; else projects.push(obj);
  save();closeModal('modal-project');renderPanel(currentPanel);toast(editIdx>=0?'Project updated':'Project added');
}

function deleteProject(i){if(!confirm(`Delete "${projects[i].name}"?`))return;projects.splice(i,1);save();renderPanel(currentPanel);toast('Project deleted');}

function saveRisk(){
  const title=document.getElementById('r-title').value.trim();
  if(!title){toast('Risk title required');return;}
  const obj={id:editRiskIdx>=0?risks[editRiskIdx].id:Date.now(),title,project:document.getElementById('r-project').value,cat:document.getElementById('r-cat').value,sev:document.getElementById('r-sev').value,prob:document.getElementById('r-prob').value,owner:document.getElementById('r-owner').value,mit:document.getElementById('r-mit').value,status:editRiskIdx>=0?risks[editRiskIdx].status:'Open'};
  if(editRiskIdx>=0) risks[editRiskIdx]=obj; else risks.push(obj);
  editRiskIdx=-1;
  save();closeModal('modal-risk');renderPanel(currentPanel);toast(editRiskIdx>=0?'Risk updated':'Risk logged');
}

function saveDecision(){
  const title=document.getElementById('d-title').value.trim();
  if(!title){toast('Decision title required');return;}
  const obj={id:editDecIdx>=0?decisions[editDecIdx].id:Date.now(),title,project:document.getElementById('d-project').value,type:document.getElementById('d-type').value,maker:document.getElementById('d-maker').value,date:document.getElementById('d-date').value,impact:document.getElementById('d-impact').value,rationale:document.getElementById('d-rationale').value};
  if(editDecIdx>=0) decisions[editDecIdx]=obj; else decisions.unshift(obj);
  editDecIdx=-1;
  save();closeModal('modal-decision');renderPanel(currentPanel);toast(editDecIdx>=0?'Decision updated':'Decision logged');
}

function saveCR(){
  const title=document.getElementById('cr-title').value.trim();
  if(!title){toast('CR title required');return;}
  const obj={id:editCRIdx>=0?changeReqs[editCRIdx].id:Date.now(),title,project:document.getElementById('cr-project').value,type:document.getElementById('cr-type').value,impact:document.getElementById('cr-impact').value,by:document.getElementById('cr-by').value,date:document.getElementById('cr-date').value,desc:document.getElementById('cr-desc').value,status:editCRIdx>=0?changeReqs[editCRIdx].status:'Pending'};
  if(editCRIdx>=0) changeReqs[editCRIdx]=obj; else changeReqs.unshift(obj);
  editCRIdx=-1;
  save();closeModal('modal-cr');renderPanel(currentPanel);toast(editCRIdx>=0?'CR updated':'Change request submitted');
}

function toggleRisk(i){risks[i].status=risks[i].status==='Open'?'Mitigated':'Open';save();renderPanel('risks');toast('Risk status updated');}

// ════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════
function badgeHTML(s){const m={'On Track':'badge-on','At Risk':'badge-risk','Off Track':'badge-off','Planning':'badge-plan','Completed':'badge-done'};return`<span class="badge ${m[s]||'badge-plan'}">${s}</span>`;}
function sevBadge(s){const m={Critical:'badge-off',High:'badge-off',Medium:'badge-risk',Low:'badge-done'};return`<span class="badge ${m[s]||'badge-plan'}">${s}</span>`;}
function probBadge(s){const m={High:'badge-risk',Medium:'badge-plan',Low:'badge-done'};return`<span class="badge ${m[s]||'badge-plan'}">${s}</span>`;}
function fmt(d){if(!d)return'—';try{const dt=new Date(d+'T00:00:00');return dt.toLocaleDateString(CFG.dateFmt,{month:'short',day:'numeric',year:'numeric'});}catch{return d;}}
function noData(cols){return`<tr><td colspan="${cols}" style="text-align:center;color:var(--mist);padding:24px">No data</td></tr>`;}

function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600);}

function exportData(){
  const data={projects,risks,decisions,changeReqs,subtasks,improvements,config:CFG,exported:new Date().toISOString()};
  const a=document.createElement('a');
  a.href='data:application/json,'+encodeURIComponent(JSON.stringify(data,null,2));
  a.download='governance-export.json';a.click();toast('Data exported');
}

function toggleSidebar(){document.getElementById('sidebar').classList.toggle('open');document.getElementById('overlay').classList.toggle('show');}
function closeSidebar(){document.getElementById('sidebar').classList.remove('open');document.getElementById('overlay').classList.remove('show');}

// ── SYSTEM MENU (status dot popover: status + GitHub data connection + settings) ──
function toggleSysMenu(e){
  if(e){e.stopPropagation();}
  const m=document.getElementById('sys-menu');
  if(m.classList.toggle('open')){save();document.addEventListener('click',_sysMenuOutside);}
  else{document.removeEventListener('click',_sysMenuOutside);}
}
function closeSysMenu(){
  document.getElementById('sys-menu').classList.remove('open');
  document.removeEventListener('click',_sysMenuOutside);
}
function _sysMenuOutside(ev){
  if(ev.target.closest('#sys-menu')||ev.target.closest('#status-dot'))return;
  closeSysMenu();
}
function updateSysMenu(ok){
  const m=document.getElementById('sys-menu');if(!m)return;
  m.classList.toggle('warn',!ok);
  const st=document.getElementById('sys-status-text');if(st)st.textContent=ok?'All clear':'Needs attention';
  const gh=document.getElementById('sys-gh-text');if(gh)gh.textContent='GitHub data: '+(ghConnected()?'Connected':'Not connected');
}
function openDataSync(){closeSysMenu();nav('datasync',null);}

// ── PROJECT LIFECYCLE (sidebar step flow: start → end) ──
const LIFECYCLE=[
  {name:'Initiation',sub:'Charter & scope'},
  {name:'Planning',sub:'Schedule & budget'},
  {name:'Execution',sub:'Build & deliver'},
  {name:'Monitoring & Control',sub:'Track & adjust'},
  {name:'Closure',sub:'Handover & review'}
];
function _phaseFromProgress(p){return p>=95?4:p>=70?3:p>=30?2:p>=10?1:0;}
function renderLifecycle(){
  const el=document.getElementById('lifecycle-steps');if(!el)return;
  const pd=document.getElementById('modal-pd');
  const usePd=pd&&pd.classList.contains('open')&&pdProject;
  let prog,label;
  if(usePd){prog=+pdProject.progress||0;label=pdProject.name;}
  else if(projects.length){prog=Math.round(projects.reduce((s,p)=>s+(+p.progress||0),0)/projects.length);label='Portfolio average';}
  else{prog=0;label='No projects yet';}
  const active=prog>=100?4:_phaseFromProgress(prog);
  const done=prog>=100;
  el.innerHTML=LIFECYCLE.map((s,i)=>{
    const cls=(done||i<active)?'done':i===active?'current':'upcoming';
    const mark=(done||i<active)?'✓':(i+1);
    return `<div class="lc-step ${cls}"><span class="lc-marker">${mark}</span><div class="lc-body"><div class="lc-name">${s.name}</div><div class="lc-sub">${s.sub}</div></div></div>`;
  }).join('')+`<div class="lc-foot">${label} · ${prog}%</div>`;
}

document.querySelectorAll('.modal-bg').forEach(m=>{m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open');});});

// ════════════════════════════════════════════════════════════════════
// THEME (time-based auto + manual toggle)
// ════════════════════════════════════════════════════════════════════
function initTheme(){
  const saved=localStorage.getItem('nx-theme');
  if(saved){applyTheme(saved);return;}
  const h=new Date().getHours();
  applyTheme((h<6||h>=18)?'dark':'light');
}
function applyTheme(t){
  document.documentElement.setAttribute('data-theme',t);
  const ic=document.getElementById('theme-icon');
  if(ic) ic.textContent=t==='dark'?'○':'●';
  localStorage.setItem('nx-theme',t);
}
function toggleTheme(){
  const cur=document.documentElement.getAttribute('data-theme')||'light';
  applyTheme(cur==='dark'?'light':'dark');
}

// ════════════════════════════════════════════════════════════════════
// DATA SYNC — GitHub DATA.xlsx read / append / delete
// ════════════════════════════════════════════════════════════════════
const GH_REPO='kneuralabs/pmo', GH_FILE='DATA.xlsx';
const AS_INTERVAL_MS=120000; // 2 minutes
let ghSha=null,ghData=[],ghHeaders=[],editDataIdx=-1;
let asTimer=null,asNext=0;

function _ghToken(){
  const raw=localStorage.getItem('gh-token');
  return raw?atob(raw):null;
}

function renderDataSync(){
  const verified=localStorage.getItem('gh-verified')==='1';
  if(verified){
    _showConnectedState();
    if(ghSha===null) ghLoadData(); // auto-load on return if not yet fetched
    else _renderDataTable();
  }else{
    _showConnectForm();
  }
  _updateSaveNowBtn();
  _updateAsUI();
}

function _showConnectForm(msg){
  document.getElementById('gh-connect-form').style.display='';
  document.getElementById('gh-connected-bar').style.display='none';
  document.getElementById('gh-token').value='';
  document.getElementById('gh-token').focus();
  if(msg) document.getElementById('gh-status').textContent=msg;
}

function _showConnectedState(){
  document.getElementById('gh-connect-form').style.display='none';
  document.getElementById('gh-connected-bar').style.display='';
  const fl=document.getElementById('gh-file-label');
  if(fl) fl.textContent=`${GH_REPO} / ${GH_FILE}`;
}

// Called by Connect button — validate then load; only persist on success
async function ghConnect(){
  const input=document.getElementById('gh-token');
  const v=input.value.trim();
  if(!v){toast('Enter your GitHub Personal Access Token');input.focus();return;}
  const btn=document.getElementById('gh-connect-btn');
  btn.disabled=true;btn.textContent='Verifying…';
  document.getElementById('gh-status').textContent='Verifying token and fetching file…';
  // Store temporarily for _ghToken() to use during load
  window._ghTokenTemp=v;
  const ok=await _fetchFile(v);
  window._ghTokenTemp=null;
  if(ok){
    localStorage.setItem('gh-token',btoa(v));
    localStorage.setItem('gh-verified','1');
    _showConnectedState();
    toast('Connected — token saved');
  }else{
    // Failed: wipe any stale token
    localStorage.removeItem('gh-token');
    localStorage.removeItem('gh-verified');
    btn.disabled=false;btn.textContent='Connect';
  }
}

function ghDisconnect(){
  localStorage.removeItem('gh-token');
  localStorage.removeItem('gh-verified');
  ghSha=null;ghData=[];ghHeaders=[];
  if(asTimer){clearInterval(asTimer);clearInterval(window._asCountdownTimer);asTimer=null;}
  _showConnectForm();
  document.getElementById('datasync-content').innerHTML=
    '<p style="color:var(--mist);font-size:.78rem">Connect with a GitHub Personal Access Token to load and manage DATA.xlsx.</p>';
  document.getElementById('gh-status').textContent='';
  toast('Disconnected');
}

function _ghToken(){
  if(window._ghTokenTemp) return window._ghTokenTemp;
  const raw=localStorage.getItem('gh-token');
  return raw?atob(raw):null;
}

// Core file fetch — returns true on success, false on any failure
async function _fetchFile(token){
  try{
    const res=await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${GH_FILE}`,{
      headers:{Authorization:`token ${token}`,Accept:'application/vnd.github.v3+json'}
    });
    if(!res.ok){
      const err=await res.json().catch(()=>({message:res.statusText}));
      const msg=res.status+': '+(err.message||res.statusText);
      document.getElementById('gh-status').textContent='Connection failed — '+msg;
      toast('Connection failed: '+msg);
      return false;
    }
    const json=await res.json();
    ghSha=json.sha;
    const b64=json.content.replace(/[\r\n]/g,'');
    const bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
    const wb=XLSX.read(bin,{type:'array',cellDates:true});
    const sheetName=wb.SheetNames[0];
    const ws=wb.Sheets[sheetName];
    const raw2d=XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
    if(raw2d.length>0&&raw2d[0].some(v=>v!=='')){
      ghHeaders=raw2d[0].map(String);
      ghData=XLSX.utils.sheet_to_json(ws,{defval:''});
    }else{
      ghHeaders=[];ghData=[];
    }
    document.getElementById('gh-status').textContent=
      `"${sheetName}" — ${ghData.length} row${ghData.length!==1?'s':''}, ${ghHeaders.length} column${ghHeaders.length!==1?'s':''}`;
    _updateSaveNowBtn();
    _renderDataTable();
    return true;
  }catch(e){
    document.getElementById('gh-status').textContent='Error: '+e.message;
    toast('Error: '+e.message);
    return false;
  }
}

// Reload (called from Reload button or auto-load on return)
async function ghLoadData(){
  const token=_ghToken();
  if(!token){
    // Verified flag set but token gone — force re-connect
    localStorage.removeItem('gh-verified');
    _showConnectForm('Session expired — please reconnect.');
    return;
  }
  document.getElementById('gh-status').textContent='Reloading…';
  const ok=await _fetchFile(token);
  if(!ok){
    // Token no longer works → clear and force re-entry
    localStorage.removeItem('gh-token');
    localStorage.removeItem('gh-verified');
    _showConnectForm('Token is no longer valid — please reconnect.');
  }
}

function _renderDataTable(){
  const c=document.getElementById('datasync-content');
  // No headers yet → show column setup UI
  if(!ghHeaders.length){
    c.innerHTML=`<div class="risk-card">
      <div class="risk-title" style="margin-bottom:8px">Set Up Columns</div>
      <p style="font-size:.76rem;color:var(--mist);margin-bottom:12px">DATA.xlsx has no column headers. Define them to start adding rows.</p>
      <label>Column names (comma-separated)</label>
      <input id="gh-col-setup" placeholder="Project, Status, Owner, Due Date, Notes" style="margin-bottom:12px">
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary" onclick="ghSetupColumns()">Create Columns</button>
        <button class="btn btn-outline" onclick="ghSaveData()">Save Empty Sheet</button>
      </div>
    </div>`;
    return;
  }
  // Escape cell values for safe innerHTML insertion
  const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const thCells=ghHeaders.map(h=>`<th>${esc(h)}</th>`).join('');
  const bodyRows=ghData.map((r,i)=>`<tr>
    ${ghHeaders.map(h=>`<td style="font-size:.73rem">${esc(r[h])}</td>`).join('')}
    <td style="white-space:nowrap">
      <button class="btn btn-outline btn-sm" onclick="openDataRowModal(${i})">Edit</button>
      <button class="btn btn-sm" style="background:#fee2e2;color:#991b1b;border:none;margin-left:3px" onclick="deleteDataRow(${i})">Del</button>
    </td></tr>`).join('');
  c.innerHTML=`<div class="section-header" style="margin-bottom:12px">
    <span class="section-title">${ghData.length} row${ghData.length!==1?'s':''} · ${ghHeaders.length} columns</span>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-outline btn-sm" onclick="openDataRowModal()">+ Add Row</button>
      <button class="btn btn-primary btn-sm" onclick="ghSaveData()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        Save to GitHub
      </button>
    </div>
  </div>
  <div class="table-wrap">
    <table><thead><tr>${thCells}<th style="width:90px"></th></tr></thead>
    <tbody>${bodyRows||'<tr><td colspan="'+(ghHeaders.length+1)+'" style="text-align:center;color:var(--mist);padding:20px">No rows yet — click + Add Row</td></tr>'}</tbody>
    </table>
  </div>`;
}

function ghSetupColumns(){
  const raw=document.getElementById('gh-col-setup').value;
  const cols=raw.split(',').map(s=>s.trim()).filter(Boolean);
  if(!cols.length){toast('Enter at least one column name');return;}
  ghHeaders=cols;
  ghData=[];
  _renderDataTable();
  toast('Columns set — add rows then Save to GitHub');
}

function openDataRowModal(i){
  if(ghSha===null&&!ghHeaders.length){toast('Load DATA.xlsx first');return;}
  editDataIdx=i===undefined?-1:i;
  const row=i!==undefined?ghData[i]:{};
  document.getElementById('data-modal-h').textContent=i!==undefined?'Edit Row':'Add Row';
  // Use numeric field IDs to avoid CSS.escape issues with special-char headers
  document.getElementById('data-form-fields').innerHTML=ghHeaders.length
    ?ghHeaders.map((h,idx)=>`<div><label>${String(h).replace(/</g,'&lt;')}</label><input id="df-${idx}" value="${String(row[h]??'').replace(/"/g,'&quot;').replace(/</g,'&lt;')}"></div>`).join('')
    :'<p style="color:var(--mist);font-size:.78rem">Set up columns first.</p>';
  document.getElementById('modal-data').classList.add('open');
}

function saveDataRow(){
  if(!ghHeaders.length){toast('Set up columns first');return;}
  const row={};
  ghHeaders.forEach((h,idx)=>{const el=document.getElementById('df-'+idx);if(el)row[h]=el.value;});
  if(editDataIdx>=0) ghData[editDataIdx]=row; else ghData.push(row);
  closeModal('modal-data');
  _renderDataTable();
  toast(editDataIdx>=0?'Row updated — save to GitHub to persist':'Row added — save to GitHub to persist');
}

function deleteDataRow(i){
  if(!confirm('Delete this row?'))return;
  ghData.splice(i,1);
  _renderDataTable();
  toast('Row deleted — save to GitHub to persist');
}

async function ghSaveData(silent=false){
  const token=_ghToken();
  if(!token){if(!silent)toast('No token — connect first');return;}
  if(ghSha===null){if(!silent)toast('Load DATA.xlsx first so we have the file SHA');return;}
  const saveBtn=document.getElementById('gh-save-now-btn');
  if(saveBtn){saveBtn.disabled=true;saveBtn.textContent='Saving…';}
  const statusEl=document.getElementById('gh-status');
  if(statusEl) statusEl.textContent='Saving to GitHub…';
  try{
    const ws=ghData.length
      ?XLSX.utils.json_to_sheet(ghData,{header:ghHeaders})
      :XLSX.utils.aoa_to_sheet([ghHeaders]);
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,'Data');
    const b64=XLSX.write(wb,{type:'base64',bookType:'xlsx'});
    const res=await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${GH_FILE}`,{
      method:'PUT',
      headers:{Authorization:`token ${token}`,'Content-Type':'application/json'},
      body:JSON.stringify({
        message:`PMO Data Sync — ${new Date().toISOString().slice(0,10)}: ${ghData.length} row(s)`,
        content:b64,sha:ghSha
      })
    });
    if(!res.ok){
      const err=await res.json().catch(()=>({message:res.statusText}));
      throw new Error(res.status+': '+(err.message||res.statusText));
    }
    const json=await res.json();
    ghSha=json.content.sha;
    const ts=new Date().toLocaleTimeString();
    if(statusEl) statusEl.textContent=`Saved — ${ghData.length} rows at ${ts}`;
    if(!silent) toast('DATA.xlsx saved to GitHub');
    // Reset autosave countdown
    if(asTimer) _resetAsCountdown();
  }catch(e){
    if(statusEl) statusEl.textContent='Save error: '+e.message;
    if(!silent) toast('Save failed: '+e.message);
  }finally{
    if(saveBtn){saveBtn.disabled=(ghSha===null);saveBtn.textContent='Save Now';}
  }
}

// ── AUTOSAVE HELPERS ──────────────────────────────────────────────
function toggleAutoSave(){
  if(asTimer){
    clearInterval(asTimer);
    clearInterval(window._asCountdownTimer);
    asTimer=null;
    _updateAsUI();
    toast('Autosave disabled');
  }else{
    ghSaveData(true);  // immediate save when enabling
    asTimer=setInterval(()=>ghSaveData(true),AS_INTERVAL_MS);
    _resetAsCountdown();
    _updateAsUI();
    toast('Autosave on — saves every 2 minutes');
  }
}

function _resetAsCountdown(){
  clearInterval(window._asCountdownTimer);
  asNext=Date.now()+AS_INTERVAL_MS;
  window._asCountdownTimer=setInterval(_tickCountdown,1000);
}

function _tickCountdown(){
  if(!asTimer){clearInterval(window._asCountdownTimer);return;}
  const sec=Math.max(0,Math.round((asNext-Date.now())/1000));
  const el=document.getElementById('as-next');
  if(el) el.textContent=`Next save in ${sec}s`;
}

function _updateAsUI(){
  const btn=document.getElementById('autosave-toggle');
  const nxt=document.getElementById('as-next');
  if(!btn) return;
  if(asTimer){
    btn.classList.add('on');
    btn.innerHTML='<span class="as-dot"></span>Autosave ON';
  }else{
    btn.classList.remove('on');
    btn.innerHTML='<span class="as-dot"></span>Autosave OFF';
    if(nxt) nxt.textContent='';
  }
}

function _updateSaveNowBtn(){
  const btn=document.getElementById('gh-save-now-btn');
  if(btn) btn.disabled=(ghSha===null);
}

// ════════════════════════════════════════════════════════════════════
// BOOT
// ════════════════════════════════════════════════════════════════════
window.addEventListener('load',()=>{
  initTheme();
  seedData();
  save();
  applyConfig();
  renderGovernance();
  renderLifecycle();
  setTimeout(()=>{
    document.getElementById('loader').classList.add('out');
    setTimeout(()=>{document.getElementById('loader').style.display='none';},500);
    document.getElementById('app').classList.add('show');
    if(!window.matchMedia('(prefers-reduced-motion:reduce)').matches) countUp();
  },1400);
});
