// ================= EZRA JOB ALERTS =================
// Put your published Google Sheet CSV URL below.
// Sheet columns:
// Job Title | Department | Category | Qualification | Vacancies | Last Date | Apply Link | Status | Featured | Sponsored
const SHEET_CSV_URL = "";

const demo=[
{title:"TNPSC Group II & IIA",department:"Tamil Nadu Public Service Commission",category:"TNPSC",qualification:"Any Degree",vacancies:"Various",lastDate:"30 Sep 2026",link:"#",status:"New",featured:"Yes",sponsored:"No"},
{title:"Junior Assistant Recruitment",department:"State Government Department",category:"State",qualification:"12th / Degree",vacancies:"250+",lastDate:"05 Oct 2026",link:"#",status:"New",featured:"Yes",sponsored:"Yes"},
{title:"Railway Apprentice",department:"Indian Railways",category:"Railway",qualification:"10th + ITI",vacancies:"500+",lastDate:"12 Oct 2026",link:"#",status:"Open",featured:"Yes",sponsored:"No"},
{title:"Bank Clerk Recruitment",department:"Banking Sector",category:"Banking",qualification:"Any Degree",vacancies:"1000+",lastDate:"18 Oct 2026",link:"#",status:"Open",featured:"No",sponsored:"No"},
{title:"Defence Recruitment",department:"Defence Services",category:"Defence",qualification:"10th / 12th",vacancies:"Various",lastDate:"25 Oct 2026",link:"#",status:"New",featured:"No",sponsored:"No"},
{title:"Customer Support Executive",department:"Private Company",category:"Private",qualification:"Any Degree",vacancies:"50+",lastDate:"31 Oct 2026",link:"#",status:"Open",featured:"No",sponsored:"Yes"}];

let jobs=[...demo],cat="All";
const $=s=>document.querySelector(s);
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
function norm(r){return{title:r["Job Title"]||r.Title||"",department:r.Department||"",category:r.Category||"Other",qualification:r.Qualification||"-",vacancies:r.Vacancies||"-",lastDate:r["Last Date"]||"-",link:r["Apply Link"]||"#",status:r.Status||"Open",featured:r.Featured||"No",sponsored:r.Sponsored||"No"}}
function csv(t){let l=t.trim().split(/\r?\n/);if(l.length<2)return[];function p(s){let a=[],v="",q=0;for(let i=0;i<s.length;i++){let c=s[i];if(c=='"'){if(q&&s[i+1]=='"'){v+='"';i++}else q=!q}else if(c==','&&!q){a.push(v.trim());v=""}else v+=c}a.push(v.trim());return a}let h=p(l[0]);return l.slice(1).filter(x=>x.trim()).map(x=>{let v=p(x),o={};h.forEach((k,i)=>o[k]=v[i]||"");return norm(o)})}
function card(j){return `<article class="card"><div class="badges"><span class="badge">${esc(j.category)}</span>${j.sponsored.toLowerCase()=="yes"?'<span class="badge sponsor">SPONSORED</span>':'<span class="badge">'+esc(j.status)+'</span>'}</div><h3>${esc(j.title)}</h3><div class="dept">${esc(j.department)}</div><div class="meta"><div><b>QUALIFICATION</b>${esc(j.qualification)}</div><div><b>VACANCIES</b>${esc(j.vacancies)}</div><div><b>LAST DATE</b>${esc(j.lastDate)}</div><div><b>TYPE</b>${esc(j.category)}</div></div><a class="apply" href="${esc(j.link)}" target="_blank" rel="noopener">View / Apply →</a></article>`}
function render(){let q=$("#search").value.toLowerCase().trim();let f=jobs.filter(j=>(cat=="All"||j.category.toLowerCase()==cat.toLowerCase())&&Object.values(j).join(" ").toLowerCase().includes(q));$("#jobsGrid").innerHTML=f.map(card).join("");let top=f.filter(j=>j.featured.toLowerCase()=="yes");$("#featuredGrid").innerHTML=(top.length?top:f.slice(0,3)).map(card).join("");$("#empty").classList.toggle("hidden",!!f.length);$("#count").textContent=jobs.length+"+"}
async function load(){if(!SHEET_CSV_URL){$("#updated").textContent="Demo data • connect Google Sheets in script.js";render();return}try{let r=await fetch(SHEET_CSV_URL);if(!r.ok)throw Error();let d=csv(await r.text());if(d.length)jobs=d;$("#updated").textContent="Live from Google Sheets • "+new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});render()}catch(e){$("#updated").textContent="Sheet unavailable • demo data";render()}}
document.querySelectorAll(".pill").forEach(b=>b.onclick=()=>{document.querySelectorAll(".pill").forEach(x=>x.classList.remove("active"));b.classList.add("active");cat=b.dataset.cat;render()});
$("#search").oninput=render;$("#theme").onclick=()=>document.body.classList.toggle("dark");$("#menu").onclick=()=>document.querySelector("nav").classList.toggle("show");load();