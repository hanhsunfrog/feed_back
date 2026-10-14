
// ===== CẤU HÌNH =====
// Sau khi deploy Apps Script thành Web App, dán URL /exec vào đây.
const API_URL = "https://script.google.com/macros/s/AKfycbyQG_3NEETKYXwB0GgxLeRGNywHp0FLfviA-NlYMvdHELr7UgRDrTMqWrl6M6HYI1Fcwg/exec";

// Khóa quản trị: KHÔNG lưu trong code.
// Khi bấm Quản trị, web sẽ hỏi khóa. Khóa này phải trùng Script Property ADMIN_KEY.
const store={get:k=>{try{return sessionStorage.getItem(k)}catch(_){return null}},set:(k,v)=>{try{sessionStorage.setItem(k,v)}catch(_){}},del:k=>{try{sessionStorage.removeItem(k)}catch(_){}}};
let ADMIN_KEY = store.get("d10_admin_key") || "";

const screens = {
  role: document.getElementById('roleScreen'),
  form: document.getElementById('formScreen'),
  success: document.getElementById('successScreen'),
  admin: document.getElementById('adminScreen')
};
const roleNames = {teacher:'Giáo viên', student:'Học sinh', parent:'Phụ huynh'};
const roleDescriptions = {
  teacher:'Chia sẻ để tài liệu hoàn thiện hơn và hỗ trợ giảng dạy tốt hơn.',
  student:'Chia sẻ để tài liệu phù hợp hơn với việc học của em.',
  parent:'Chia sẻ ý kiến để tài liệu phù hợp hơn với con.'
};
const roleGuides = {
  teacher: {
    badgeColor: '#1f73c9',
    icon: '💡',
    title: 'Nội dung góp ý nên thu thập',
    note: 'Phù hợp với góp ý mang tính chuyên môn, có thể kèm ảnh minh họa.',
    items: [
      'Kiến thức / nội dung chưa chính xác hoặc chưa rõ',
      'Bài tập, ví dụ, đáp án, hướng dẫn giải cần điều chỉnh',
      'Mức độ khó – dễ chưa phù hợp',
      'Nội dung chưa phù hợp với tiến độ dạy hoặc trình độ học sinh',
      'Bố cục, trình bày, lỗi chính tả',
      'Đề xuất bổ sung dạng bài, phần ôn tập hoặc ví dụ minh họa'
    ]
  },
  student: {
    badgeColor: '#ff3b77',
    icon: '🎯',
    title: 'Những góp ý học sinh có thể gửi',
    note: 'Ngắn gọn – dễ nói – đúng nhu cầu học sinh.',
    items: [
      'Phần nào khó hiểu hoặc khó học',
      'Bài tập quá khó / quá dễ',
      'Không hiểu yêu cầu bài hoặc cách làm',
      'Trình bày khó nhìn, nhiều chữ, dễ rối',
      'Muốn thêm ví dụ, lời giải, bài tương tự',
      'Góp ý khác liên quan đến việc học'
    ]
  },
  parent: {
    badgeColor: '#ff9800',
    icon: '📘',
    title: 'Những góp ý phụ huynh có thể gửi',
    note: 'Phù hợp với góc nhìn của phụ huynh khi theo dõi con học.',
    items: [
      'Nội dung tài liệu có phù hợp với con hay không',
      'Khối lượng bài tập nhiều / ít, vừa sức hay chưa',
      'Hình thức trình bày có dễ theo dõi không',
      'Tài liệu có hỗ trợ con tự học ở nhà không',
      'Hướng dẫn / đáp án có rõ ràng, dễ dùng không',
      'Góp ý khác từ góc nhìn phụ huynh'
    ]
  }
};
let currentRole = null;

function show(name){
  Object.values(screens).forEach(s=>s.classList.remove('active'));
  screens[name].classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}

document.querySelectorAll('.role-card').forEach(btn=>{
  btn.addEventListener('click',()=>openForm(btn.dataset.role));
});

function setHelper(role){
  const guide = roleGuides[role];
  document.getElementById('helperIcon').textContent = guide.icon;
  document.getElementById('helperTitle').textContent = guide.title;
  document.getElementById('helperNote').textContent = guide.note;
  const helperList = document.getElementById('helperList');
  helperList.innerHTML = guide.items.map(item=>`<li>${item}</li>`).join('');
  document.getElementById('roleBadge').style.backgroundColor = guide.badgeColor + '20';
  document.getElementById('roleBadge').style.color = guide.badgeColor;
}

function openForm(role){
  currentRole=role;
  document.getElementById('roleBadge').textContent=roleNames[role];
  document.getElementById('formTitle').textContent='Góp ý từ '+roleNames[role];
  document.getElementById('formDesc').textContent=roleDescriptions[role];
  setHelper(role);
  document.getElementById('helperCard').classList.toggle('collapsed', window.matchMedia('(max-width:980px)').matches);

  const isTeacher=role==='teacher';
  document.getElementById('imageWrap').style.display=isTeacher?'block':'none';
  document.getElementById('suggestionWrap').style.display=isTeacher?'block':'none';
  document.getElementById('contactWrap').style.display=isTeacher?'none':'block';

  const name=document.getElementById('name');
  const nameWrap=document.getElementById('nameWrap');
  if(isTeacher){
    name.required=true; nameWrap.style.display='block';
    document.getElementById('nameLabel').textContent='Họ và tên *';
  }else{
    name.required=false; nameWrap.style.display='none';
  }
  show('form');
}

const helperTitle=document.getElementById('helperTitle');
const toggleHelper=()=>{ if(window.matchMedia('(max-width:980px)').matches) document.getElementById('helperCard').classList.toggle('collapsed'); };
helperTitle.addEventListener('click',toggleHelper);
helperTitle.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggleHelper(); } });

document.getElementById('backBtn').onclick=()=>show('role');
document.getElementById('anotherBtn').onclick=()=>{
  document.getElementById('feedbackForm').reset();
  show('role');
};

document.getElementById('adminBtn').onclick=async ()=>{
  if (!ADMIN_KEY) {
    ADMIN_KEY = prompt("Nhập khóa quản trị PĐT:");
    if (!ADMIN_KEY) return;
    store.set("d10_admin_key", ADMIN_KEY);
  }
  const ok = await renderAdmin();
  if (ok) show('admin');
};
document.getElementById('adminBackBtn').onclick=()=>show('role');

function ensureApi(){
  if(!API_URL || API_URL.includes("PASTE_APPS_SCRIPT")) {
    alert("Chưa cấu hình Apps Script Web App URL trong app.js.");
    return false;
  }
  return true;
}

function fileToBase64(file, maxWidth=1600, quality=0.82){
  return new Promise((resolve,reject)=>{
    if(!file) return resolve(null);
    const img=new Image();
    const reader=new FileReader();
    reader.onload=()=>{
      img.onload=()=>{
        let w=img.width,h=img.height;
        if(w>maxWidth){ h=Math.round(h*maxWidth/w); w=maxWidth; }
        const c=document.createElement('canvas');
        c.width=w;c.height=h;
        c.getContext('2d').drawImage(img,0,0,w,h);
        const data=c.toDataURL('image/jpeg',quality);
        resolve({name:(file.name||'anh-minh-hoa').replace(/\.[^.]+$/,'.jpg'), data});
      };
      img.onerror=()=>reject(new Error('Không đọc được ảnh (định dạng chưa hỗ trợ). Anh/chị chụp màn hình hoặc chọn ảnh JPG/PNG khác.'));
      img.src=reader.result;
    };
    reader.onerror=()=>reject(new Error('Không đọc được file ảnh.'));
    reader.readAsDataURL(file);
  });
}

document.getElementById('feedbackForm').addEventListener('submit', async e=>{
  e.preventDefault();
  if(!ensureApi()) return;

  const submitBtn=e.submitter||e.target.querySelector('button[type="submit"]');
  if(submitBtn.disabled) return;
  submitBtn.disabled=true;
  submitBtn.textContent='Đang gửi...';

  try{
    let image=null;
    if(currentRole==='teacher'){
      const f=document.getElementById('imageInput').files[0];
      image=await fileToBase64(f);
    }

    const payload={
      action:"submit",
      role:roleNames[currentRole],
      source: currentRole==='teacher'?'WEB_GV':'WEB_HS_PH',
      center:document.getElementById('center').value,
      name:currentRole==='teacher'?document.getElementById('name').value:'',
      contact:currentRole==='teacher'?'':document.getElementById('contact').value,
      subject:document.getElementById('subject').value,
      grade:document.getElementById('grade').value,
      location:document.getElementById('location').value,
      category:document.getElementById('category').value,
      content:document.getElementById('content').value,
      suggestion:currentRole==='teacher'?document.getElementById('suggestion').value:'',
      website:document.getElementById('website').value,
      image
    };

    const res=await fetch(API_URL,{
      method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify(payload)
    });
    const data=await readJson(res);
    if(!data.ok) throw new Error(data.error||'Không gửi được phản hồi');

    document.getElementById('feedbackCode').textContent=data.code;
    document.getElementById('feedbackForm').reset();
    show('success');
  }catch(err){
    console.error(err);
    alert("Gửi chưa thành công: "+err.message);
  }finally{
    submitBtn.disabled=false;
    submitBtn.textContent='Gửi góp ý';
  }
});

async function apiGet(params){
  const u=new URL(API_URL);
  Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));
  const res=await fetch(u.toString());
  return readJson(res);
}

async function readJson(res){
  const t=await res.text();
  try{ return JSON.parse(t); }
  catch(_){ throw new Error('Máy chủ không trả dữ liệu hợp lệ. Kiểm tra Apps Script đã Deploy với quyền "Anyone" và URL kết thúc bằng /exec.'); }
}

async function renderAdmin(){
  if(!ensureApi()) return false;
  try{
    const data=await apiGet({action:"list",key:ADMIN_KEY});
    if(!data.ok){
      if(data.error==='UNAUTHORIZED'){
        store.del("d10_admin_key");
        ADMIN_KEY="";
      }
      throw new Error(data.error||'Không tải được dữ liệu');
    }
    window.__feedbackItems=data.items||[];
    renderStats(window.__feedbackItems);
    renderTable();
    return true;
  }catch(err){
    alert("Không mở được quản trị: "+err.message);
    return false;
  }
}

function renderStats(items){
  const stats=document.getElementById('stats');
  const count=s=>items.filter(x=>x.status===s).length;
  stats.innerHTML=[
    ['Tổng phản hồi',items.length],
    ['Mới tiếp nhận',count('Mới tiếp nhận')],
    ['Đang xử lý',count('Đang xử lý')],
    ['Đã xử lý',count('Đã xử lý')]
  ].map(([l,n])=>`<div class="stat"><b>${n}</b><span>${l}</span></div>`).join('');
}

function renderTable(){
  const items=window.__feedbackItems||[];
  const q=(document.getElementById('searchInput').value||'').toLowerCase();
  const st=document.getElementById('statusFilter').value;
  const filtered=items.filter(x=>{
    const hay=Object.values(x).join(' ').toLowerCase();
    return (!q||hay.includes(q)) && (!st||x.status===st);
  });
  document.getElementById('feedbackTable').innerHTML=filtered.map(x=>`
    <tr>
      <td><b>${escapeHtml(x.code)}</b></td><td>${escapeHtml(x.createdAt)}</td><td>${escapeHtml(x.role)}</td><td>${escapeHtml(x.center)}</td>
      <td>${escapeHtml(x.subject)}</td><td>${escapeHtml(x.grade)}</td><td>${escapeHtml(x.location)}</td>
      <td>${escapeHtml(String(x.content||'').slice(0,90))}</td><td><span class="status">${escapeHtml(x.status)}</span></td>
    </tr>`).join('');
}

document.getElementById('searchInput').addEventListener('input',renderTable);
document.getElementById('statusFilter').addEventListener('change',renderTable);

document.getElementById('exportBtn').onclick=()=>{
  const items=window.__feedbackItems||[];
  if(!items.length){alert('Chưa có dữ liệu để xuất.');return}
  const headers=['Mã','Thời gian','Nguồn','Đối tượng','Cơ sở','Họ tên','Liên hệ','Môn','Khối','Trang/Bài','Nhóm góp ý','Nội dung','Đề xuất','Ảnh','Mức độ xử lý','Người phụ trách','Trạng thái','Kết quả xử lý'];
  const rows=items.map(x=>[
    x.code,x.createdAt,x.source,x.role,x.center,x.name,x.contact,x.subject,x.grade,x.location,
    x.category,x.content,x.suggestion,x.image,x.priority,x.assignee,x.status,x.result
  ]);
  const csv=[headers,...rows].map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download='gop-y-tai-lieu.csv';a.click();URL.revokeObjectURL(a.href);
};

function escapeHtml(s=''){
  return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
