'use strict';

// Read-only Google Sheets source. Do not put passwords, API keys or write credentials here.
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwC4M_tZxvU3iFkjJQhNFixELWUCEjAdwR4EnAdvdDd6x_7hIhbbz5EO6-2EmNGkt3CW4rxWHViM9g/pub?gid=0&single=true&output=csv';
const DEFAULT_DEPT_LOGO = 'assets/default-department.svg';
const INLINE_DEPT_LOGO = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><rect width="160" height="160" rx="28" fill="#eef1f7"/><circle cx="80" cy="62" r="28" fill="#59627a"/><path d="M42 121c8-24 23-36 38-36s30 12 38 36" fill="#59627a"/><path d="M48 111h64v7H48z" fill="#fff" opacity=".8"/><text x="80" y="145" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="#59627a">DEPARTMENT</text></svg>`);
const FALLBACK_CSV_URL = 'assets/jobs-fallback.csv';
let jobs = [];
let cat = 'All';

const $ = s => document.querySelector(s);
const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const yes = x => ['yes','true','1','y'].includes(String(x ?? '').trim().toLowerCase());

function normalizeHeader(v){
  return String(v ?? '').replace(/^\uFEFF/,'').trim().toLowerCase().replace(/[^a-z0-9]+/g,' ');
}
function getField(o, names, fallback=''){
  const map = new Map(Object.keys(o).map(k => [normalizeHeader(k), o[k]]));
  for(const name of names){ const v = map.get(normalizeHeader(name)); if(v != null && String(v).trim() !== '') return String(v).trim(); }
  return fallback;
}
function safeHttpUrl(value){
  const raw = String(value ?? '').trim();
  if(!raw) return '';
  try{
    const u = new URL(raw, location.href);
    return (u.protocol === 'https:' || u.protocol === 'http:') ? u.href : '';
  }catch{return '';}
}
function driveImageUrl(value){
  const raw = String(value ?? '').trim();
  if(!raw) return '';
  const patterns = [
    /drive\.google\.com\/file\/d\/([^/]+)/i,
    /drive\.google\.com\/open\?id=([^&]+)/i,
    /drive\.google\.com\/uc\?(?:[^#]*&)?id=([^&]+)/i,
    /docs\.google\.com\/uc\?(?:[^#]*&)?id=([^&]+)/i
  ];
  for(const re of patterns){ const m = raw.match(re); if(m) return `https://drive.google.com/uc?export=view&id=${encodeURIComponent(m[1])}`; }
  return '';
}
function logoUrl(value){
  const raw = String(value ?? '').trim();
  return driveImageUrl(raw) || safeHttpUrl(raw) || (raw && !/[/:?#]/.test(raw) ? `assets/logos/${encodeURIComponent(raw)}` : '') || DEFAULT_DEPT_LOGO;
}

function norm(r,i){
  return {
    id: getField(r,['Job ID','ID'],`row-${i+1}`),
    title: getField(r,['Job Title','Title']),
    department: getField(r,['Department','Recruitment Department','Organization','Organisation']),
    category: getField(r,['Category','Job Category'],'Other'),
    description: getField(r,['Short Description','Description']),
    fullDetails: getField(r,['Full Details','Job Details','Details']),
    postName: getField(r,['Post Name','Post','Post(s)']),
    vacancies: getField(r,['Vacancies','Vacancy','No. of Vacancies'],'-'),
    qualification: getField(r,['Qualification','Educational Qualification'],'-'),
    ageLimit: getField(r,['Age Limit','Age'],'-'),
    salary: getField(r,['Salary','Pay Scale','Stipend'],'-'),
    fee: getField(r,['Application Fee','Fee'],'-'),
    selection: getField(r,['Selection Process','Selection'],'-'),
    location: getField(r,['Job Location','Location'],'-'),
    startDate: getField(r,['Start Date','Application Start Date'],'-'),
    lastDate: getField(r,['Last Date','Last Date to Apply','Closing Date'],'-'),
    howToApply: getField(r,['How to Apply','Application Process'],'-'),
    applyLink: getField(r,['Apply Link','Apply Online','Application Link']),
    notificationLink: getField(r,['Notification Link','Notification','PDF Link']),
    officialWebsite: getField(r,['Official Website','Website','Official Site']),
    departmentLogo: getField(r,['Department Logo','Recruitment Logo','Company Logo','Organization Logo','Logo URL','Logo']),
    status: getField(r,['Status'],'Open'),
    featured: getField(r,['Featured'],'No'),
    sponsored: getField(r,['Sponsored'],'No')
  };
}

function parseCSV(text){
  const rows=[]; let row=[], val='', quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"'){
      if(quoted && text[i+1]==='"'){val+='"';i++;}
      else quoted=!quoted;
    }else if(c===',' && !quoted){row.push(val.trim());val='';}
    else if((c==='\n'||c==='\r')&&!quoted){
      if(c==='\r'&&text[i+1]==='\n')i++;
      row.push(val.trim()); val='';
      if(row.some(Boolean)) rows.push(row);
      row=[];
    }else val+=c;
  }
  if(val!==''||row.length){row.push(val.trim());if(row.some(Boolean))rows.push(row);}
  if(rows.length<2)return [];
  const headers=rows[0].map(x=>String(x).replace(/^\uFEFF/,'').trim());
  return rows.slice(1).map((r,i)=>{const o={};headers.forEach((h,n)=>o[h]=r[n]??'');return norm(o,i);}).filter(j=>j.title);
}

function detailUrl(j){return `job.html?job=${encodeURIComponent(j.id)}`;}
function card(j){
  return `<article class="job-card">
    <div class="card-top"><span class="category-tag">${esc(j.category)}</span>${yes(j.sponsored)?'<span class="sponsor-tag">SPONSORED</span>':`<span class="status-tag">${esc(j.status)}</span>`}</div>
    <div class="job-head"><img class="dept-logo" src="${esc(logoUrl(j.departmentLogo))}" alt="${esc(j.department||'Recruitment')} logo" loading="lazy" onerror="this.onerror=null;this.src=INLINE_DEPT_LOGO">
      <div><h3><a href="${detailUrl(j)}">${esc(j.title)}</a></h3><p>${esc(j.department||'Department not specified')}</p></div>
    </div>
    <div class="job-meta"><span><b>QUALIFICATION</b>${esc(j.qualification)}</span><span><b>VACANCIES</b>${esc(j.vacancies)}</span><span><b>LAST DATE</b>${esc(j.lastDate)}</span><span><b>LOCATION</b>${esc(j.location)}</span></div>
    <a class="card-action" href="${detailUrl(j)}">View job details <span>→</span></a>
  </article>`;
}
function render(){
  const q=$('#search')?.value.toLowerCase().trim()||'';
  const filtered=jobs.filter(j=>(cat==='All'||j.category.toLowerCase()===cat.toLowerCase())&&Object.values(j).join(' ').toLowerCase().includes(q));
  if($('#jobsGrid'))$('#jobsGrid').innerHTML=filtered.map(card).join('');
  if($('#featuredGrid')){const top=filtered.filter(j=>yes(j.featured));$('#featuredGrid').innerHTML=(top.length?top:filtered.slice(0,3)).map(card).join('');}
  if($('#empty'))$('#empty').classList.toggle('hidden',filtered.length!==0);
  if($('#count'))$('#count').textContent=String(jobs.length);
}

async function fetchSheet(){
  const candidates=[
    SHEET_CSV_URL + '&cache=' + Date.now(),
    SHEET_CSV_URL,
    SHEET_CSV_URL.replace('&single=true','')
  ];
  let lastError=null;
  for(const url of candidates){
    try{
      const r=await fetch(url,{cache:'no-store',redirect:'follow'});
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      const text=await r.text();
      const data=parseCSV(text);
      if(data.length) return data;
      throw new Error('CSV loaded but no job rows were found');
    }catch(e){lastError=e;}
  }
  // GitHub Pages/browser environments can occasionally block Google's redirect/CORS response.
  // Use the latest uploaded CSV snapshot so the site remains usable, while live data is attempted first.
  try{
    const r=await fetch(FALLBACK_CSV_URL,{cache:'no-store'});
    if(r.ok){
      const text=await r.text();
      const data=parseCSV(text);
      if(data.length) return data;
    }
  }catch(e){}
  throw lastError||new Error('Google Sheet unavailable');
}

async function load(){
  const updated=$('#updated');
  try{
    jobs=await fetchSheet();
    if(updated)updated.textContent=`Live from Google Sheets • ${jobs.length} jobs`;
    $('#sheetError')?.classList.add('hidden');
  }catch(e){
    jobs=[];
    if(updated)updated.textContent='Google Sheet could not be loaded';
    const err=$('#sheetError');
    if(err){err.classList.remove('hidden');err.textContent='Google Sheet data is not available. Check that this exact sheet is published to the web as CSV, then hard-refresh the website (Ctrl+F5).';}
  }
  render();
}

function setupUI(){
  document.querySelectorAll('.pill').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.pill').forEach(x=>x.classList.remove('active'));b.classList.add('active');cat=b.dataset.cat||'All';render();}));
  const search=$('#search'); search?.addEventListener('input',render);
  $('#searchBtn')?.addEventListener('click',()=>{document.querySelector('#jobs')?.scrollIntoView({behavior:'smooth'});render();});
  const theme=$('#theme'); theme?.addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('ezra-theme',document.body.classList.contains('dark')?'dark':'light');});
  if(localStorage.getItem('ezra-theme')==='dark')document.body.classList.add('dark');
  const menu=$('#menu'),nav=$('#mainNav'); menu?.addEventListener('click',()=>{const open=nav.classList.toggle('show');menu.setAttribute('aria-expanded',String(open));});
  nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('show');menu?.setAttribute('aria-expanded','false');}));
}
function info(label,value){return `<div class="info-item"><span>${esc(label)}</span><strong>${esc(value||'-')}</strong></div>`;}
function externalLink(label,value,primary=false){const u=safeHttpUrl(value);return u?`<a class="detail-link ${primary?'primary':''}" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${label} <span>↗</span></a>`:'';}

async function loadJobDetails(){
  const box=$('#detail'); if(!box)return;
  const id=new URLSearchParams(location.search).get('job')||'';
  try{jobs=await fetchSheet();}catch(e){
    box.innerHTML='<div class="not-found"><div class="not-found-icon">!</div><h1>Job data unavailable</h1><p>Please publish the Google Sheet to the web and refresh this page.</p><a class="card-action" href="index.html#jobs">Back to Job Alerts</a></div>';return;
  }
  const j=jobs.find(x=>x.id===id)||jobs.find(x=>x.title===id);
  if(!j){box.innerHTML='<div class="not-found"><div class="not-found-icon">?</div><h1>Job not found</h1><p>This job may have been removed or the link may be invalid.</p><a class="card-action" href="index.html#jobs">Back to Job Alerts</a></div>';return;}
  document.title=j.title+' | EZRA Job Alerts';
  const details=j.fullDetails?`<section class="detail-section"><div class="section-label">FULL DESCRIPTION</div><h2>About this opportunity</h2><div class="rich-text">${esc(j.fullDetails).replace(/\n/g,'<br>')}</div></section>`:'';
  const apply=externalLink('Apply Online',j.applyLink,true), notice=externalLink('Download Notification',j.notificationLink), official=externalLink('Official Website',j.officialWebsite);
  box.innerHTML=`<article class="detail-shell">
    <aside class="detail-side"><div class="logo-frame"><img src="${esc(logoUrl(j.departmentLogo))}" alt="${esc(j.department||'Recruitment')} logo" onerror="this.onerror=null;this.src=INLINE_DEPT_LOGO"></div>
      <span class="category-tag">${esc(j.category)}</span><span class="side-status">${esc(j.status)}</span><h1>${esc(j.title)}</h1><p>${esc(j.department||'Department not specified')}</p>
      <div class="side-mini"><span>LAST DATE</span><strong>${esc(j.lastDate)}</strong></div>
    </aside>
    <div class="detail-main"><div class="detail-intro"><span class="section-label">JOB DETAILS</span>${j.description?`<p>${esc(j.description)}</p>`:''}</div>
      <section class="detail-section"><div class="section-label">AT A GLANCE</div><h2>Job overview</h2><div class="info-grid">${info('Post Name',j.postName)}${info('Vacancy',j.vacancies)}${info('Qualification',j.qualification)}${info('Age Limit',j.ageLimit)}${info('Salary',j.salary)}${info('Application Fee',j.fee)}${info('Selection Process',j.selection)}${info('Job Location',j.location)}</div></section>
      ${details}<section class="detail-section"><div class="section-label">TIMELINE</div><h2>Important dates</h2><div class="timeline"><div><span>START DATE</span><strong>${esc(j.startDate)}</strong></div><div><span>LAST DATE</span><strong>${esc(j.lastDate)}</strong></div></div></section>
      <section class="detail-section"><div class="section-label">APPLICATION</div><h2>How to apply</h2><div class="rich-text">${esc(j.howToApply||'-').replace(/\n/g,'<br>')}</div></section>
      <section class="links-section"><div class="section-label">OFFICIAL LINKS</div><div class="link-grid">${apply}${notice}${official}</div></section>
    </div></article>`;
}

setupUI();
if($('#jobsGrid'))load();
if($('#detail'))loadJobDetails();
