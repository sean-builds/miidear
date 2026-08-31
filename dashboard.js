// ============================================================================
// Miidear — dashboard.js  (MII12 — Website Control Center)
// A business-oriented editor: Dashboard home, Consultations, and a Website
// Editor (Hero, Portfolio, Reviews, Contact & Business) + Media Library.
// Real Supabase Auth guards the page. Everything saves to Supabase.
// Requires: config.js + supabase-client.js + main.js before this file.
// ============================================================================
(function () {
  'use strict';
  var DB = window.MiidearDB;

  // ---- Auth guard --------------------------------------------------------
  if (!DB || !DB.getSession) { window.location.replace('admin.html'); return; }
  DB.getSession().then(function (res) {
    if (!res || !res.data || !res.data.session) { window.location.replace('admin.html'); return; }
    var email = res.data.session.user && res.data.session.user.email;
    var g = document.getElementById('dashGreeting'); if (g && email) g.textContent = email;
    boot();
  });

  // ---- Toast + helpers ---------------------------------------------------
  var toastTimer;
  window.MiidearToast = function (text, kind) {
    var el = document.getElementById('toast'); if (!el) return;
    el.textContent = text; el.className = 'toast show' + (kind ? ' ' + kind : '');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.className = 'toast'; }, 2800);
  };
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function byId(id){ return document.getElementById(id); }
  function status(el,t,k){ if(!el)return; el.textContent=t; el.className='cms-status'+(k?(' '+k):''); }
  function fmtDate(d){ if(!d) return '—'; var t=new Date(d); return isNaN(t)?String(d):t.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); }
  function fmtDateTime(d){ if(!d) return '—'; var t=new Date(d); return isNaN(t)?String(d):t.toLocaleString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); }
  function couple(b,g){ return (b||'')+(g?' & '+g:''); }
  function isValidUrl(u){ if(!u) return true; if(/^(mailto:|tel:)/.test(u)) return true; try{ new URL(u); return true; }catch(e){ return /^[\w./#?=-]+$/.test(u); } }

  var dirty=false;
  var heroOriginal={};
  var contactOriginal={};
  function markDirty(){ dirty=true; }
  function clearDirty(){ dirty=false; }
  window.addEventListener('beforeunload', function(e){ if(dirty){ e.preventDefault(); e.returnValue=''; return ''; } });

  // ======================================================================
  function boot(){
    wireShell();
    loadHome();
    loadConsultations();
    loadHero();
    loadProjects();
    loadReviews();
    loadContact();
    loadPageText();
    loadImages();
    // media + changes load lazily on first open
    wireProjectButton();
    wireReviewButton();
    wireMediaLibrary();
    wireWebsiteEditor();
  }

  // ---- Shell / tabs ------------------------------------------------------
  var mediaLoaded=false;
  function wireShell(){
    var links=document.querySelectorAll('.dash-link');
    Array.prototype.forEach.call(links,function(lk){
      lk.addEventListener('click',function(){
        var name=lk.getAttribute('data-tab');
        Array.prototype.forEach.call(links,function(l){ l.classList.toggle('is-active', l===lk); });
        Array.prototype.forEach.call(document.querySelectorAll('.dash-panel'),function(p){ p.classList.toggle('is-active', p.id==='panel-'+name); });
        byId('dashSide').classList.remove('is-open');
        if(name==='media' && !mediaLoaded){ mediaLoaded=true; loadMedia(); }
        if(name==='changes'){ loadChanges(); }
        if(name==='editor' && window.__miidearFitFrame){ setTimeout(window.__miidearFitFrame, 50); }
        if(name==='editor'){ var bp=byId('betaPortfolioPanel'); if(bp && !bp.hidden) loadBetaProjects(); }
        window.scrollTo({top:0,behavior:'smooth'});
      });
    });
    byId('signOut').addEventListener('click', function(){ DB.signOut().then(function(){ window.location.replace('admin.html'); }); });
    var mt=byId('dashMobileToggle'); if(mt) mt.addEventListener('click', function(){ byId('dashSide').classList.toggle('is-open'); });
    byId('detailClose').addEventListener('click', function(){ closeModal('detailModal'); });
    byId('editClose').addEventListener('click', function(){ closeModal('editModal'); });
    document.querySelectorAll('.modal').forEach(function(m){ m.addEventListener('click', function(e){ if(e.target===m) m.classList.remove('is-open'); }); });
  }
  function openModal(id){ byId(id).classList.add('is-open'); }
  function closeModal(id){ byId(id).classList.remove('is-open'); }

  // ======================================================================
  //  HOME OVERVIEW
  // ======================================================================
  var cacheInquiries=null, cacheReviews=null, cacheProjects=null;
  function loadHome(){
    Promise.all([DB.listInquiries(), DB.selectAll('reviews','sort_order',true), DB.selectAll('projects','sort_order',true)])
      .then(function(r){
        var inq=(r[0]&&r[0].data)||[]; var rev=(r[1]&&r[1].data)||[]; var prj=(r[2]&&r[2].data)||[];
        cacheInquiries=inq; cacheReviews=rev; cacheProjects=prj;
        var c={Pending:0,Confirmed:0,Completed:0,Cancelled:0};
        inq.forEach(function(x){ var s=x.status||'Pending'; if(c[s]==null)c[s]=0; c[s]++; });
        var cards=[
          ['Pending', c.Pending, 'Pending'],
          ['Confirmed', c.Confirmed, 'Confirmed'],
          ['Completed', c.Completed, 'Completed'],
          ['Cancelled', c.Cancelled, 'Cancelled'],
          ['Reviews', rev.length, ''],
          ['Portfolio Projects', prj.length, '']
        ];
        byId('overviewGrid').innerHTML=cards.map(function(s){
          var clickable = s[2] ? ' ov-card--link" data-filter="'+s[2]+'"' : '"';
          return '<div class="ov-card'+clickable+'><div class="ov-num">'+s[1]+'</div><div class="ov-label">'+s[0]+'</div></div>';
        }).join('');
        Array.prototype.forEach.call(byId('overviewGrid').querySelectorAll('[data-filter]'),function(card){
          card.addEventListener('click', function(){ gotoConsultations(card.getAttribute('data-filter')); });
        });
        // recent bookings (newest 5)
        var rb=inq.slice(0,5);
        byId('recentBookings').innerHTML = rb.length ? rb.map(function(x){
          return '<div class="mini-row"><div><strong>'+esc(x.full_name||'—')+'</strong><div class="muted" style="font-size:0.8rem">'+esc(x.consultation_type||'')+' · '+fmtDate(x.created_at)+'</div></div>'+
            '<span class="pill pill--'+(x.status||'Pending').toLowerCase()+'">'+esc(x.status||'Pending')+'</span></div>';
        }).join('') : '<p class="muted">No bookings yet.</p>';
        // recent activity = newest bookings as activity lines
        byId('recentActivity').innerHTML = rb.length ? rb.map(function(x){
          return '<div class="mini-row"><span>New consultation request from <strong>'+esc(x.full_name||'someone')+'</strong></span><span class="muted" style="font-size:0.78rem">'+fmtDateTime(x.created_at)+'</span></div>';
        }).join('') : '<p class="muted">No recent activity.</p>';
      });
  }

  // ======================================================================
  //  CONSULTATIONS
  // ======================================================================
  var allInq=[], inqFilter='', inqSearch='';
  // Navigate to Consultations and apply a status filter (from overview cards).
  function gotoConsultations(stat){
    var link=document.querySelector('.dash-link[data-tab="consultations"]');
    if(link) link.click();
    inqFilter=stat||'';
    Array.prototype.forEach.call(byId('statusSeg').querySelectorAll('.seg-btn'),function(x){
      x.classList.toggle('is-active', x.getAttribute('data-status')===inqFilter);
    });
    renderConsults();
  }
  function loadConsultations(){
    byId('consultLoading').style.display='block'; byId('consultEmpty').style.display='none'; byId('consultCards').innerHTML='';
    DB.listInquiries().then(function(res){
      byId('consultLoading').style.display='none';
      if(res.error){ byId('consultEmpty').style.display='block'; byId('consultEmpty').textContent='Could not load: '+res.error.message; return; }
      allInq=res.data||[]; renderConsults();
    });
  }
  function renderConsults(){
    var rows=allInq.filter(function(x){
      if(inqFilter && (x.status||'Pending')!==inqFilter) return false;
      if(!inqSearch) return true;
      return [x.full_name,x.email,x.phone,x.inquiry_id,x.consultation_type,x.notes].filter(Boolean).join(' ').toLowerCase().indexOf(inqSearch)!==-1;
    });
    var host=byId('consultCards');
    if(!rows.length){ host.innerHTML=''; byId('consultEmpty').style.display='block'; byId('consultEmpty').textContent='No requests match this view.'; return; }
    byId('consultEmpty').style.display='none';
    host.innerHTML=rows.map(function(x){
      var st=x.status||'Pending';
      return '<article class="consult-card" data-id="'+esc(x.id)+'">'+
        '<div class="consult-card__top"><div><div class="consult-name">'+esc(x.full_name||'—')+'</div>'+
          '<div class="muted" style="font-size:0.82rem">'+esc(x.consultation_type||'')+' · '+fmtDate(x.created_at)+'</div></div>'+
          '<span class="pill pill--'+st.toLowerCase()+'">'+esc(st)+'</span></div>'+
        '<div class="consult-meta">'+
          metaRow('Email', x.email)+ metaRow('Phone', x.phone)+
          metaRow('Wedding', fmtDate(x.wedding_date))+ metaRow('Preferred', x.preferred_time)+
        '</div>'+
        '<div class="consult-actions">'+
          '<button class="btn-xs" data-view="'+esc(x.id)+'">View</button>'+
          '<button class="btn-xs go" data-set="Confirmed" data-id="'+esc(x.id)+'">Confirm</button>'+
          '<button class="btn-xs" data-set="Completed" data-id="'+esc(x.id)+'">Complete</button>'+
          '<button class="btn-xs" data-set="Reschedule Requested" data-id="'+esc(x.id)+'">Reschedule</button>'+
          '<button class="btn-xs danger" data-set="Cancelled" data-id="'+esc(x.id)+'">Cancel</button>'+
        '</div></article>';
    }).join('');
    Array.prototype.forEach.call(host.querySelectorAll('[data-view]'),function(b){ b.addEventListener('click',function(){ openConsult(rows.filter(function(y){return String(y.id)===b.getAttribute('data-view');})[0]); }); });
    Array.prototype.forEach.call(host.querySelectorAll('[data-set]'),function(b){ b.addEventListener('click',function(){ setStatus(b.getAttribute('data-id'), b.getAttribute('data-set')); }); });
  }
  function metaRow(k,v){ return '<div class="cm"><span class="cm-k">'+k+'</span><span class="cm-v">'+esc(v||'—')+'</span></div>'; }
  function setStatus(id, st){
    DB.updateRow('inquiries', id, { status: st }).then(function(res){
      if(res.error){ window.MiidearToast('Could not update: '+res.error.message,'error'); return; }
      var row=allInq.filter(function(x){return String(x.id)===String(id);})[0]; if(row) row.status=st;
      renderConsults(); loadHome(); window.MiidearToast('Marked '+st+'.','success');
    });
  }
  function openConsult(x){
    if(!x) return;
    var st=x.status||'Pending';
    byId('detailContent').innerHTML='<span class="eyebrow">Consultation</span>'+
      '<div class="script" style="font-size:2.2rem;margin-bottom:0.2rem">'+esc(x.full_name||'Request')+'</div>'+
      '<p class="muted" style="margin-bottom:var(--s-3)">'+esc(x.inquiry_id||'')+' · <span class="pill pill--'+st.toLowerCase()+'">'+esc(st)+'</span></p>'+
      '<div class="detail-list">'+
        drow('Email',x.email, x.email?'mailto:'+x.email:null)+
        drow('Phone',x.phone, x.phone?'tel:'+String(x.phone).replace(/\s+/g,''):null)+
        drow('Wedding Date',fmtDate(x.wedding_date))+
        drow('Consultation Type',x.consultation_type)+
        drow('Preferred Time',x.preferred_time)+
        drow('Submitted',fmtDateTime(x.created_at))+
      '</div>'+
      '<h4 class="detail-sub">Notes</h4><p style="white-space:pre-wrap">'+(x.notes?esc(x.notes):'<span class="muted">—</span>')+'</p>'+
      '<div class="seg" style="margin-top:var(--s-3)">'+
        ['Pending','Confirmed','Completed','Cancelled'].map(function(s){ return '<button class="seg-btn'+(s===st?' is-active':'')+'" data-dset="'+s+'">'+s+'</button>'; }).join('')+
      '</div>'+
      '<div class="cms-actions" style="margin-top:var(--s-3)"><button class="btn-xs go" id="sendEmail">Send Confirmation Email</button><span class="cms-status" id="sendEmailStatus"></span></div>';
    openModal('detailModal');
    Array.prototype.forEach.call(byId('detailContent').querySelectorAll('[data-dset]'),function(b){
      b.addEventListener('click', function(){ setStatus(x.id, b.getAttribute('data-dset')); closeModal('detailModal'); });
    });
    var se=byId('sendEmail');
    if(se) se.addEventListener('click', function(){
      var st=byId('sendEmailStatus');
      if(!window.MiidearEmail){ status(st,'Email system unavailable.','error'); return; }
      var link=window.prompt('Optional: meeting link to include in the confirmation email (leave blank to send without one).', x.meeting_link||'');
      if(link===null) return; // cancelled
      se.disabled=true; status(st,'Sending…');
      window.MiidearEmail.sendApproved(x, link||'').then(function(r){
        se.disabled=false;
        var res=r&&r.client;
        if(res&&res.ok){ status(st,'Confirmation email sent.','success'); window.MiidearToast('Confirmation email sent.','success'); logChange('Consultations','email:'+(x.inquiry_id||x.id),'','Confirmation email sent'); }
        else { status(st,'Email failed: '+((res&&res.error&&res.error.message)||'unknown'),'error'); window.MiidearToast('Email failed to send.','error'); }
      });
    });
  }
  function drow(label,val,href){ var v=(val==null||val==='')?'—':esc(val); if(href&&val) v='<a href="'+esc(href)+'">'+v+'</a>'; return '<div class="info-row"><span class="k">'+label+'</span><span class="v">'+v+'</span></div>'; }

  byId('searchInput').addEventListener('input', function(){ inqSearch=this.value.trim().toLowerCase(); renderConsults(); });
  Array.prototype.forEach.call(byId('statusSeg').querySelectorAll('.seg-btn'),function(b){
    b.addEventListener('click', function(){
      inqFilter=b.getAttribute('data-status');
      Array.prototype.forEach.call(byId('statusSeg').querySelectorAll('.seg-btn'),function(x){ x.classList.toggle('is-active',x===b); });
      renderConsults();
    });
  });
  byId('refreshBtn').addEventListener('click', function(){ loadConsultations(); window.MiidearToast('Refreshed.'); });

  // ======================================================================
  //  HERO
  // ======================================================================
  var HERO_KEYS=[['home','hero_headline','heroHeadline','hpHeadline'],['home','hero_subheadline','heroSub','hpSub'],
    ['home','hero_btn1','heroBtn1','hpBtn1'],['home','hero_btn1_url','heroBtn1url',null],
    ['home','hero_btn2','heroBtn2','hpBtn2'],['home','hero_btn2_url','heroBtn2url',null]];
  function loadHero(){
    DB.selectAll('site_content').then(function(res){
      var map={}; (res.data||[]).forEach(function(r){ map[r.page+':'+r.key]=r.value; });
      heroOriginal=map;
      HERO_KEYS.forEach(function(k){ var el=byId(k[2]); if(el && map[k[0]+':'+k[1]]!=null && map[k[0]+':'+k[1]]!=='') { el.value=map[k[0]+':'+k[1]]; if(k[3]) byId(k[3]).textContent=el.value; } });
    });
    DB.selectAll('hero_media').then(function(res){
      (res.data||[]).forEach(function(r){
        if(r.key==='poster' && r.value) byId('heroPreview').poster=r.value;
        if(r.key==='video' && r.value && /^https?:/.test(r.value)) byId('heroPreview').src=r.value;
      });
    });
    // live-preview binding
    [['heroHeadline','hpHeadline'],['heroSub','hpSub'],['heroBtn1','hpBtn1'],['heroBtn2','hpBtn2']].forEach(function(p){
      byId(p[0]).addEventListener('input', function(){ byId(p[1]).textContent=this.value||' '; markDirty(); });
    });
    ['heroBtn1url','heroBtn2url'].forEach(function(id){ byId(id).addEventListener('input', markDirty); });

    var chosen=null;
    byId('videoInput').addEventListener('change', function(){
      chosen=this.files&&this.files[0]; if(!chosen) return;
      byId('heroPreview').src=URL.createObjectURL(chosen); byId('heroPreview').play().catch(function(){});
      uploadHeroVideo(chosen);
    });
    byId('videoDelete').addEventListener('click', function(){
      if(!confirm('Delete the current hero video? The site falls back to the default until you upload a new one.')) return;
      DB.upsertByKey('hero_media',[{key:'video',value:''}]).then(function(r){
        if(r.error) status(byId('videoStatus'),'Could not delete: '+r.error.message,'error');
        else { logChange('Hero','hero_media:video','(video)','(removed)'); status(byId('videoStatus'),'Hero video removed.','success'); window.MiidearToast('Hero video deleted.','success'); }
      });
    });
    byId('heroSave').addEventListener('click', function(){
      var rows=HERO_KEYS.map(function(k){ return {page:k[0],key:k[1],value:byId(k[2]).value}; });
      status(byId('heroStatus'),'Saving…');
      DB.upsertByKey('site_content', rows, 'page,key').then(function(res){
        if(res.error) status(byId('heroStatus'),'Could not save: '+res.error.message,'error');
        else {
          HERO_KEYS.forEach(function(k){ var nv=byId(k[2]).value; logChange('Hero','site_content:'+k[0]+'|'+k[1], heroOriginal[k[0]+':'+k[1]]||'', nv); heroOriginal[k[0]+':'+k[1]]=nv; });
          status(byId('heroStatus'),'Saved.','success'); clearDirty(); window.MiidearToast('Hero saved.','success');
        }
      });
    });
  }
  function uploadHeroVideo(file){
    var ext=(file.name.split('.').pop()||'mp4').toLowerCase();
    var path='hero/video-'+Date.now()+'.'+ext;
    var prog=byId('videoProgress'), bar=byId('videoProgressBar');
    prog.style.display='block'; bar.style.width='40%';
    status(byId('videoStatus'),'Uploading '+(Math.round(file.size/1048576*10)/10)+' MB…');
    DB.uploadMedia(path, file).then(function(res){
      bar.style.width='100%';
      setTimeout(function(){ prog.style.display='none'; bar.style.width='0'; }, 600);
      if(res.error){ status(byId('videoStatus'),'Upload failed: '+res.error.message,'error'); return; }
      DB.upsertByKey('hero_media',[{key:'video',value:res.data.publicUrl}]).then(function(r2){
        if(r2.error) status(byId('videoStatus'),'Uploaded, but could not set active: '+r2.error.message,'error');
        else { logChange('Hero','hero_media:video','', res.data.publicUrl); status(byId('videoStatus'),'New hero video is live.','success'); window.MiidearToast('Hero video updated.','success'); }
      });
    });
  }

  // ======================================================================
  //  PORTFOLIO
  // ======================================================================
  function loadProjects(){
    var host=byId('projectsGrid'); host.innerHTML='<p class="muted">Loading…</p>';
    DB.selectAll('projects','sort_order',true).then(function(res){
      if(res.error){ host.innerHTML='<p class="muted">Could not load projects: '+esc(res.error.message)+'</p>'; return; }
      var rows=res.data||[]; cacheProjects=rows;
      if(!rows.length){ host.innerHTML='<p class="muted">No projects yet. Use “+ Add Project” to create your first showcase.</p>'; return; }
      host.innerHTML=rows.map(function(p){
        var cover=p.banner_url?'<img src="'+esc(p.banner_url)+'" alt="">':'<div class="ph"></div>';
        return '<article class="project-card"><div class="project-card__cover">'+cover+'</div>'+
          '<div class="project-card__body"><div class="project-card__couple">'+esc(couple(p.bride_name,p.groom_name)||p.title||'Untitled')+'</div>'+
          '<div class="muted" style="font-size:0.85rem">'+esc(p.description||p.title||'')+'</div></div>'+
          '<div class="project-card__actions"><button class="btn-xs" data-edit="'+esc(p.id)+'">Edit</button>'+
          '<button class="btn-xs danger" data-del="'+esc(p.id)+'">Delete</button></div></article>';
      }).join('');
      bindProjectActions(rows);
    });
  }
  function bindProjectActions(rows){
    var host=byId('projectsGrid');
    Array.prototype.forEach.call(host.querySelectorAll('[data-edit]'),function(b){ b.addEventListener('click',function(){ openProject(rows.filter(function(x){return String(x.id)===b.getAttribute('data-edit');})[0]); }); });
    Array.prototype.forEach.call(host.querySelectorAll('[data-del]'),function(b){ b.addEventListener('click',function(){
      if(!confirm('Delete this project and its gallery? This cannot be undone.')) return;
      var proj=rows.filter(function(x){return String(x.id)===b.getAttribute('data-del');})[0];
      DB.deleteRow('projects', b.getAttribute('data-del')).then(function(res){
        if(res.error) window.MiidearToast('Could not delete: '+res.error.message,'error');
        else { logChange('Portfolio','project:'+(proj?couple(proj.bride_name,proj.groom_name)||proj.title:''), 'Existing project','(deleted)'); window.MiidearToast('Project deleted.','success'); loadProjects(); loadHome(); }
      });
    }); });
  }
  function wireProjectButton(){ byId('addProject').addEventListener('click', function(){ openProject(null); }); }

  // MII30 — Beta Portfolio: render the same projects as a card grid inside the
  // Website Editor tab, with an "Add Project" card always last. Reuses the
  // Legacy editor (openProject) and the existing delete path — no new editor.
  function loadBetaProjects(){
    var host=byId('betaProjectsGrid'); if(!host) return;
    host.innerHTML='<p class="muted">Loading…</p>';
    DB.selectAll('projects','sort_order',true).then(function(res){
      if(res.error){ host.innerHTML='<p class="muted">Could not load projects: '+esc(res.error.message)+'</p>'; return; }
      var rows=res.data||[];
      // MII30b: mirror the LEGACY project-card markup EXACTLY (same cover logic,
      // same couple() helper, same body structure) for parity — only difference
      // is the data-bp-* action hooks so Beta has its own listeners.
      var cards=rows.map(function(p){
        var cover=p.banner_url?'<img src="'+esc(p.banner_url)+'" alt="">':'<div class="ph"></div>';
        return '<article class="project-card"><div class="project-card__cover">'+cover+'</div>'+
          '<div class="project-card__body"><div class="project-card__couple">'+esc(couple(p.bride_name,p.groom_name)||p.title||'Untitled')+'</div>'+
          '<div class="muted" style="font-size:0.85rem">'+esc(p.description||p.title||'')+'</div></div>'+
          '<div class="project-card__actions"><button class="btn-xs" data-bp-edit="'+esc(p.id)+'">Edit</button>'+
          '<button class="btn-xs danger" data-bp-del="'+esc(p.id)+'">Delete</button></div></article>';
      });
      // Add Project tile — always last (Miidear logo + label).
      cards.push('<article class="project-card project-card--add" id="bpAddCard" tabindex="0" role="button" aria-label="Add Project">'+
        '<div class="project-card__cover bp-add__logo"><img src="miidear-logo.png" alt="Miidear"></div>'+
        '<div class="project-card__body"><div class="project-card__couple bp-add__label">+ Add Project</div></div></article>');
      host.innerHTML=cards.join('');
      bindBetaProjectActions(rows);
    });
  }
  function bindBetaProjectActions(rows){
    var host=byId('betaProjectsGrid'); if(!host) return;
    var addCard=byId('bpAddCard');
    if(addCard){ addCard.addEventListener('click', function(){ openProject(null); });
      addCard.addEventListener('keydown', function(k){ if(k.key==='Enter'||k.key===' '){ k.preventDefault(); openProject(null); } }); }
    Array.prototype.forEach.call(host.querySelectorAll('[data-bp-edit]'),function(b){
      b.addEventListener('click',function(){ openProject(rows.filter(function(x){return String(x.id)===b.getAttribute('data-bp-edit');})[0]); });
    });
    Array.prototype.forEach.call(host.querySelectorAll('[data-bp-del]'),function(b){
      b.addEventListener('click',function(){
        if(!confirm('Delete this project? This cannot be undone.')) return;
        var proj=rows.filter(function(x){return String(x.id)===b.getAttribute('data-bp-del');})[0];
        DB.deleteRow('projects', b.getAttribute('data-bp-del')).then(function(res){
          if(res.error) window.MiidearToast('Could not delete: '+res.error.message,'error');
          else { logChange('Portfolio','project:'+(proj?couple(proj.bride_name,proj.groom_name)||proj.title:''), 'Existing project','(deleted)'); window.MiidearToast('Project deleted.','success'); refreshAllProjectViews(); }
        });
      });
    });
  }
  // MII30 — single refresh point used after add/edit/delete so Legacy grid,
  // Beta grid, the homepage overview, and the live preview iframe all update
  // immediately with no page reload.
  // MII30/31 — single refresh point after add/edit/delete. Reloading the preview
  // iframe re-runs content.js applyProjects(), which re-renders BOTH Selection
  // of Our Work and the Portfolio rails from the projects table — so those
  // sections always reflect the change regardless of which page is previewed.
  function refreshAllProjectViews(){
    if(typeof loadProjects==='function') loadProjects();   // legacy grid
    if(typeof loadHome==='function') loadHome();           // home overview
    var bp=byId('betaPortfolioPanel'); if(bp && !bp.hidden) loadBetaProjects(); // beta grid (if visible)
    var fr=byId('editorFrame'); if(fr){ try{ fr.contentWindow.location.reload(); }catch(e){ fr.src=fr.src; } } // Selection + rails
  }
  var editingProject=null, galleryRows=[];
  function openProject(p){
    editingProject = p ? p.id : null; galleryRows=[];
    byId('editContent').innerHTML='<span class="eyebrow">Project</span>'+
      '<div class="script" style="font-size:2rem;margin-bottom:var(--s-3)">'+(p?'Edit Project':'New Project')+'</div>'+
      fieldRow('Name(s)','ep_names',p&&p.bride_name)+
      fieldRow('Subtitle / Title','ep_title',p&&p.title)+
      areaRow('Description','ep_desc',p&&p.description)+
      '<div class="field"><label><input type="checkbox" id="ep_featured"'+(p&&p.featured?' checked':'')+'> Show on homepage (Featured)</label></div>'+
      '<div class="media-card"><div class="media-label">Cover Image</div>'+
        '<img id="ep_coverPrev" class="media-preview" alt="" '+(p&&p.banner_url?('src="'+esc(p.banner_url)+'"'):'')+'>'+
        '<div class="media-controls"><label class="btn-xs go" for="ep_cover">Choose Cover</label><input id="ep_cover" type="file" accept="image/*" hidden></div></div>'+
      '<div class="media-label" style="margin-top:var(--s-3)">Gallery Images</div>'+
      '<div class="media-controls"><label class="btn-xs go" for="ep_gallery">+ Add Photos</label><input id="ep_gallery" type="file" accept="image/*" multiple hidden></div>'+
      '<p class="muted" style="font-size:0.78rem">Drag photos to reorder. Click × to remove.</p>'+
      '<div id="ep_galleryGrid" class="gallery-edit"></div>'+
      '<div class="cms-actions"><button class="btn" id="ep_save">Save Project</button><span class="cms-status" id="ep_status"></span></div>';
    openModal('editModal');

    var coverFile=null;
    byId('ep_cover').addEventListener('change', function(){ coverFile=this.files&&this.files[0]; if(coverFile) byId('ep_coverPrev').src=URL.createObjectURL(coverFile); });

    // load existing gallery
    if(p){ DB.selectAll('project_images','sort_order',true).then(function(res){
      galleryRows=((res.data||[]).filter(function(im){ return String(im.project_id)===String(p.id); })).map(function(im){ return {id:im.id, url:im.url, file:null}; });
      renderGallery();
    }); }

    byId('ep_gallery').addEventListener('change', function(){
      Array.prototype.forEach.call(this.files, function(f){ galleryRows.push({id:null, url:URL.createObjectURL(f), file:f}); });
      renderGallery();
    });

    byId('ep_save').addEventListener('click', function(){ saveProject(coverFile); });
  }
  function renderGallery(){
    var grid=byId('ep_galleryGrid'); if(!grid) return;
    grid.innerHTML=galleryRows.map(function(g,i){
      return '<div class="gallery-item" draggable="true" data-i="'+i+'"><img src="'+esc(g.url)+'" alt=""><button class="gallery-x" data-rm="'+i+'">×</button></div>';
    }).join('');
    Array.prototype.forEach.call(grid.querySelectorAll('[data-rm]'),function(b){ b.addEventListener('click',function(){ galleryRows.splice(parseInt(b.getAttribute('data-rm'),10),1); renderGallery(); }); });
    // drag reorder
    var dragI=null;
    Array.prototype.forEach.call(grid.querySelectorAll('.gallery-item'),function(it){
      it.addEventListener('dragstart',function(){ dragI=parseInt(it.getAttribute('data-i'),10); it.classList.add('dragging'); });
      it.addEventListener('dragend',function(){ it.classList.remove('dragging'); });
      it.addEventListener('dragover',function(e){ e.preventDefault(); });
      it.addEventListener('drop',function(e){ e.preventDefault(); var to=parseInt(it.getAttribute('data-i'),10); if(dragI==null||dragI===to)return; var m=galleryRows.splice(dragI,1)[0]; galleryRows.splice(to,0,m); renderGallery(); });
    });
  }
  function saveProject(coverFile){
    var st=byId('ep_status'); status(st,'Saving…');
    var row={ bride_name:byId('ep_names').value.trim(), groom_name:'',
      title:byId('ep_title').value.trim(), description:byId('ep_desc').value.trim(),
      category:(editingProject&&editingProject.category)||null, featured:byId('ep_featured')?byId('ep_featured').checked:false };
    function uploadCover(){
      if(!coverFile) return Promise.resolve(null);
      var ext=(coverFile.name.split('.').pop()||'jpg').toLowerCase();
      return DB.uploadMedia('projects/cover-'+Date.now()+'.'+ext, coverFile).then(function(up){ return up.error?null:up.data.publicUrl; });
    }
    uploadCover().then(function(coverUrl){
      if(coverUrl) row.banner_url=coverUrl;
      var op = editingProject ? DB.updateRow('projects', editingProject, row) : DB.insertRow('projects', row);
      return op.then(function(res){
        if(res.error){ status(st,'Could not save: '+res.error.message,'error'); return null; }
        var pid = editingProject || (res.data && res.data[0] && res.data[0].id);
        return saveGallery(pid).then(function(){ return pid; });
      });
    }).then(function(pid){
      if(pid){ logChange('Portfolio','project:'+(couple(row.bride_name,row.groom_name)||row.title), editingProject?'(edited)':'', (editingProject?'Updated project · ':'Added project · ')+(couple(row.bride_name,row.groom_name)||row.title)); status(st,'Saved.','success'); window.MiidearToast('Project saved.','success'); closeModal('editModal'); refreshAllProjectViews(); }
    });
  }
  function saveGallery(pid){
    if(!pid) return Promise.resolve();
    // Upload any new files, then persist order for all rows.
    var uploads = galleryRows.map(function(g){
      if(g.file){ var ext=(g.file.name.split('.').pop()||'jpg').toLowerCase(); return DB.uploadMedia('projects/'+pid+'/'+Date.now()+'-'+Math.random().toString(36).slice(2,6)+'.'+ext, g.file).then(function(up){ if(!up.error) g.url=up.data.publicUrl; g.file=null; }); }
      return Promise.resolve();
    });
    return Promise.all(uploads).then(function(){
      // Simple + reliable: insert rows that are new (id null) with sort_order.
      var inserts = galleryRows.map(function(g,i){
        if(g.id) return DB.updateRow('project_images', g.id, { sort_order:i });
        return DB.insertRow('project_images', { project_id:pid, url:g.url, sort_order:i });
      });
      return Promise.all(inserts);
    });
  }

  // ======================================================================
  //  REVIEWS
  // ======================================================================
  function loadReviews(){
    var host=byId('reviewsGrid'); host.innerHTML='<p class="muted">Loading…</p>';
    DB.selectAll('reviews','sort_order',true).then(function(res){
      if(res.error){ host.innerHTML='<p class="muted">Could not load reviews: '+esc(res.error.message)+'</p>'; return; }
      var rows=res.data||[]; cacheReviews=rows;
      if(!rows.length){ host.innerHTML='<p class="muted">No reviews yet. Use “+ Add Review”.</p>'; return; }
      host.innerHTML=rows.map(function(r){
        var n=Math.max(1,Math.min(5,parseInt(r.rating,10)||5)); var stars='';
        for(var i=0;i<5;i++) stars+=(i<n?'★':'☆');
        return '<article class="rv-card"><div class="rv-stars">'+stars+'</div>'+
          '<blockquote class="rv-text">'+esc(r.review_text||'')+'</blockquote>'+
          '<div class="rv-couple">'+esc(couple(r.bride_name,r.groom_name))+'</div>'+
          '<div class="rv-actions"><button class="btn-xs" data-edit="'+esc(r.id)+'">Edit</button>'+
          '<button class="btn-xs danger" data-del="'+esc(r.id)+'">Delete</button></div></article>';
      }).join('');
      Array.prototype.forEach.call(host.querySelectorAll('[data-edit]'),function(b){ b.addEventListener('click',function(){ openReview(rows.filter(function(x){return String(x.id)===b.getAttribute('data-edit');})[0]); }); });
      Array.prototype.forEach.call(host.querySelectorAll('[data-del]'),function(b){ b.addEventListener('click',function(){
        if(!confirm('Delete this review? This cannot be undone.')) return;
        var rv=rows.filter(function(x){return String(x.id)===b.getAttribute('data-del');})[0];
        DB.deleteRow('reviews', b.getAttribute('data-del')).then(function(res){
          if(res.error) window.MiidearToast('Could not delete: '+res.error.message,'error');
          else { logChange('Reviews','review:'+(rv?couple(rv.bride_name,rv.groom_name):''), 'Existing review','(deleted)'); window.MiidearToast('Review deleted.','success'); loadReviews(); loadHome(); }
        });
      }); });
    });
  }
  function wireReviewButton(){ byId('addReview').addEventListener('click', function(){ openReview(null); }); }
  var editingReview=null;
  function openReview(r){
    editingReview = r ? r.id : null;
    var rating = r ? (parseInt(r.rating,10)||5) : 5;
    byId('editContent').innerHTML='<span class="eyebrow">Review</span>'+
      '<div class="script" style="font-size:2rem;margin-bottom:var(--s-3)">'+(r?'Edit Review':'New Review')+'</div>'+
      fieldRow('Name(s)','er_names',r&&r.bride_name)+
      areaRow('Review Text','er_text',r&&r.review_text)+
      '<div class="field"><label>Star Rating</label><div class="star-picker" id="er_stars">'+
        [1,2,3,4,5].map(function(i){ return '<button type="button" data-star="'+i+'" class="'+(i<=rating?'on':'')+'">★</button>'; }).join('')+'</div></div>'+
      '<div class="cms-actions"><button class="btn" id="er_save">Save Review</button><span class="cms-status" id="er_status"></span></div>';
    openModal('editModal');
    var chosen=rating;
    Array.prototype.forEach.call(byId('er_stars').querySelectorAll('button'),function(btn){
      btn.addEventListener('click',function(){ chosen=parseInt(btn.getAttribute('data-star'),10);
        Array.prototype.forEach.call(byId('er_stars').querySelectorAll('button'),function(b2){ b2.classList.toggle('on', parseInt(b2.getAttribute('data-star'),10)<=chosen); }); });
    });
    byId('er_save').addEventListener('click', function(){
      var st=byId('er_status'); status(st,'Saving…');
      var row={ bride_name:byId('er_names').value.trim(), groom_name:'', review_text:byId('er_text').value.trim(), rating:chosen };
      var op=editingReview?DB.updateRow('reviews',editingReview,row):DB.insertRow('reviews',row);
      op.then(function(res){ if(res.error){ status(st,'Could not save: '+res.error.message,'error'); return; }
        logChange('Reviews','review:'+couple(row.bride_name,row.groom_name), editingReview?'(edited)':'', (editingReview?'Updated review · ':'Added review · ')+couple(row.bride_name,row.groom_name)+' ('+row.rating+'★)');
        status(st,'Saved.','success'); window.MiidearToast('Review saved.','success'); closeModal('editModal'); loadReviews(); loadHome(); });
    });
  }

  // ======================================================================
  //  CONTACT & BUSINESS
  // ======================================================================
  var LINK_FIELDS=[['business','Business Name','content','contact','business_name'],
    ['phone','Phone (display text)','link'],['email','Email — destination URL (button text stays “Link →”)','link'],['whatsapp','WhatsApp — destination URL (button text stays “Link →”)','link'],
    ['line','Line — destination URL (button text stays “Link →”)','link'],['telegram','Telegram — destination URL (button text stays “Link →”)','link'],
    ['address','Address','content','contact','location_address'],
    ['map_embed','Google Map Embed URL (optional — overrides address)','content','contact','map_embed'],
    ['maps','Google Maps — destination URL (button text stays “Open in Google Maps →”)','link'],
    ['facebook','Facebook — destination URL (button text stays “Link →”)','link'],['tiktok','TikTok — destination URL (button text stays “Link →”)','link'],['instagram','Instagram — destination URL (button text stays “Link →”)','link'],['website','Website — destination URL','link']];
  var LINK_DEFAULTS={ phone:'(+66) 098 987 7965', line:'https://line.me/ti/p/UR6MWdgAZb', telegram:'https://t.me/bonmiidear',
    whatsapp:'https://wa.me/0989877965', email:'mailto:Miidear.invitations@gmail.com',
    instagram:'https://www.instagram.com/miidear_invitations?igsh=aGtmY3E4b29lNnRo',
    tiktok:'https://www.tiktok.com/@miidearinvitation?_r=1&_t=ZS-96qjve7B1c4',
    facebook:'https://www.facebook.com/share/1EVNuU3yTZ/', maps:'https://maps.app.goo.gl/SPq1mtCdLT4c7FFL6', website:'' };
  function loadContact(){
    Promise.all([DB.selectAll('site_links'), DB.selectAll('site_content')]).then(function(r){
      var links={}; (r[0].data||[]).forEach(function(x){ links[x.key]=x.value; });
      var content={}; (r[1].data||[]).forEach(function(x){ content[x.page+':'+x.key]=x.value; });
      contactOriginal={};
      LINK_FIELDS.forEach(function(f){
        if(f[2]==='content') contactOriginal['content:'+f[3]+':'+f[4]]=content[f[3]+':'+f[4]]||'';
        else contactOriginal['link:'+f[0]]=(links[f[0]]!=null?links[f[0]]:'');
      });
      byId('contactEditor').innerHTML='<p class="dash-sub" style="margin-bottom:var(--s-3)">Edit the destination URLs below. The visible button text on the site stays fixed (“Link →” / “Open in Google Maps →”); only where each button points changes.</p>'+LINK_FIELDS.map(function(f){
        var val;
        if(f[2]==='content') val=content[f[3]+':'+f[4]]||'';
        else val=(links[f[0]]!=null?links[f[0]]:(LINK_DEFAULTS[f[0]]||''));
        var itype=(f[2]==='link' && f[0]!=='phone')?'url':'text';
        return '<div class="field"><label for="cf_'+f[0]+'">'+f[1]+'</label><input id="cf_'+f[0]+'" type="'+itype+'" value="'+esc(val)+'"></div>';
      }).join('');
      Array.prototype.forEach.call(byId('contactEditor').querySelectorAll('input'),function(i){ i.addEventListener('input',markDirty); });
    });
    byId('contactSave').addEventListener('click', saveContact);
  }
  function saveContact(){
    var st=byId('contactStatus');
    // URL validation
    var bad=[];
    LINK_FIELDS.forEach(function(f){ if(f[2]==='link' && ['maps','facebook','tiktok','instagram','website','whatsapp','line','telegram'].indexOf(f[0])!==-1){ var v=byId('cf_'+f[0]).value.trim(); if(v && !isValidUrl(v)) bad.push(f[1]); } });
    if(bad.length){ status(st,'Please check these links look valid: '+bad.join(', '),'error'); return; }
    status(st,'Saving…');
    var linkRows=[], contentRows=[];
    LINK_FIELDS.forEach(function(f){ var v=byId('cf_'+f[0]).value.trim();
      if(f[2]==='content') contentRows.push({page:f[3],key:f[4],value:v});
      else linkRows.push({key:f[0],value:v});
    });
    Promise.all([DB.upsertByKey('site_links',linkRows), DB.upsertByKey('site_content',contentRows,'page,key')]).then(function(r){
      if(r[0].error||r[1].error) status(st,'Could not save: '+((r[0].error||r[1].error).message),'error');
      else {
        linkRows.forEach(function(row){ logChange('Contact & Business','site_links:'+row.key, contactOriginal['link:'+row.key]||'', row.value); contactOriginal['link:'+row.key]=row.value; });
        contentRows.forEach(function(row){ logChange('Contact & Business','site_content:'+row.page+'|'+row.key, contactOriginal['content:'+row.page+':'+row.key]||'', row.value); contactOriginal['content:'+row.page+':'+row.key]=row.value; });
        status(st,'Saved.','success'); clearDirty(); window.MiidearToast('Contact & business saved.','success');
      }
    });
  }

  // ======================================================================
  //  MEDIA LIBRARY
  // ======================================================================
  var allMedia=[], mediaKind='', mediaQuery='';
  function wireMediaLibrary(){
    byId('mediaUpload').addEventListener('change', function(){
      var files=Array.prototype.slice.call(this.files||[]); if(!files.length) return;
      uploadMediaFiles(files);
    });
    byId('mediaSearch').addEventListener('input', function(){ mediaQuery=this.value.trim().toLowerCase(); renderMedia(); });
    Array.prototype.forEach.call(byId('mediaFilter').querySelectorAll('.seg-btn'),function(b){
      b.addEventListener('click', function(){ mediaKind=b.getAttribute('data-kind');
        Array.prototype.forEach.call(byId('mediaFilter').querySelectorAll('.seg-btn'),function(x){ x.classList.toggle('is-active',x===b); }); renderMedia(); });
    });
  }
  function loadMedia(){
    byId('mediaLoading').style.display='block'; byId('mediaEmpty').style.display='none'; byId('mediaGrid').innerHTML='';
    // List a few known folders + root.
    Promise.all([DB.listMedia(''), DB.listMedia('hero'), DB.listMedia('projects')]).then(function(res){
      var files=[];
      res.forEach(function(r){ if(r&&r.data) files=files.concat(r.data); });
      // de-dupe by path
      var seen={}; allMedia=files.filter(function(f){ if(seen[f.path])return false; seen[f.path]=1; return true; });
      byId('mediaLoading').style.display='none';
      renderMedia();
    });
  }
  function kindOf(name){ return /\.(mp4|webm|mov|m4v)$/i.test(name)?'video':'image'; }
  function renderMedia(){
    var rows=allMedia.filter(function(f){
      if(mediaKind && kindOf(f.name)!==mediaKind) return false;
      if(mediaQuery && f.name.toLowerCase().indexOf(mediaQuery)===-1) return false;
      return true;
    });
    var grid=byId('mediaGrid');
    if(!rows.length){ grid.innerHTML=''; byId('mediaEmpty').style.display='block'; return; }
    byId('mediaEmpty').style.display='none';
    grid.innerHTML=rows.map(function(f){
      var thumb = kindOf(f.name)==='video' ? '<video src="'+esc(f.url)+'" muted></video>' : '<img src="'+esc(f.url)+'" alt="" loading="lazy">';
      return '<div class="media-tile">'+thumb+'<div class="media-tile__bar"><span class="media-tile__name" title="'+esc(f.name)+'">'+esc(f.name)+'</span>'+
        '<button class="media-tile__del" data-del="'+esc(f.path)+'" aria-label="Delete">×</button></div></div>';
    }).join('');
    Array.prototype.forEach.call(grid.querySelectorAll('[data-del]'),function(b){ b.addEventListener('click',function(){
      if(!confirm('Delete this file permanently? Anything using it on the website will lose it.')) return;
      DB.removeMedia([b.getAttribute('data-del')]).then(function(res){
        if(res.error) window.MiidearToast('Could not delete: '+res.error.message,'error');
        else { window.MiidearToast('File deleted.','success'); allMedia=allMedia.filter(function(f){return f.path!==b.getAttribute('data-del');}); renderMedia(); }
      });
    }); });
  }
  function uploadMediaFiles(files){
    var prog=byId('mediaProgress'), bar=byId('mediaProgressBar'); prog.style.display='block';
    var done=0;
    function next(i){
      if(i>=files.length){ bar.style.width='100%'; setTimeout(function(){ prog.style.display='none'; bar.style.width='0'; },500); window.MiidearToast('Upload complete.','success'); loadMedia(); return; }
      var f=files[i]; var ext=(f.name.split('.').pop()||'bin').toLowerCase();
      var safe=f.name.replace(/[^\w.-]/g,'_');
      bar.style.width=Math.round((i/files.length)*100)+'%';
      DB.uploadMedia('library/'+Date.now()+'-'+safe, f).then(function(){ done++; next(i+1); });
    }
    next(0);
  }

  // ---- small builders ----------------------------------------------------
  function fieldRow(label,id,val){ return '<div class="field"><label for="'+id+'">'+label+'</label><input id="'+id+'" type="text" value="'+esc(val||'')+'"></div>'; }
  function areaRow(label,id,val){ return '<div class="field"><label for="'+id+'">'+label+'</label><textarea id="'+id+'" rows="3">'+esc(val||'')+'</textarea></div>'; }

  // ======================================================================
  //  WEBSITE EDITOR (BETA)
  // ======================================================================
  function wireWebsiteEditor(){
    var frame=byId('editorFrame'); if(!frame) return;
    var bar=byId('editorPagebar');
    var fileInput=byId('editorFileInput');
    var pendingMedia=null; // {kind:'image'|'video'|'project-image', key/id}

    // Render the iframe at a REAL desktop viewport (1280x800) and scale the whole
    // rectangle uniformly to fit the stage width. Both dimensions scale by the
    // same factor, so viewport-relative CSS (the hero's 100svh) produces exactly
    // the proportions a real 1280x800 browser would — a faithful miniature.
    // M18/02 — Option 1: NO scaling. The iframe fills the stage width (width/
    // height:100% via CSS) and the real page renders at that width, matching the
    // live site. fitFrame is retained as a harmless hook for resize/load/tab-open
    // (sizing itself is now entirely CSS; nothing to compute).
    function fitFrame(){ /* sizing handled by CSS; intentionally empty */ }
    fitFrame();
    window.__miidearFitFrame=fitFrame;
    window.addEventListener('resize', fitFrame);
    frame.addEventListener('load', fitFrame);


    Array.prototype.forEach.call(bar.querySelectorAll('.seg-btn'),function(b){
      b.addEventListener('click', function(){
        // Mii37 (Option C): the Reviews button is a scroll action, not a page.
        var scrollTo=b.getAttribute('data-scroll');
        if(scrollTo){
          // Stay on Home; load it first if the preview is on another page, then
          // smooth-scroll the preview to the testimonials section.
          Array.prototype.forEach.call(bar.querySelectorAll('.seg-btn'),function(x){ x.classList.toggle('is-active',x===b); });
          scrollPreviewTo(scrollTo);
          return;
        }
        Array.prototype.forEach.call(bar.querySelectorAll('.seg-btn'),function(x){ x.classList.toggle('is-active',x===b); });
        var page=b.getAttribute('data-page');
        frame.src=page+'?edit=1';
        toggleBetaPortfolio(page);
      });
    });
    // Mii37 — smooth-scroll the (same-origin) preview iframe to a homepage anchor.
    function scrollPreviewTo(id){
      function doScroll(){
        try{
          var doc=frame.contentWindow.document;
          var el=doc.getElementById(id);
          if(el){ el.scrollIntoView({behavior:'smooth', block:'start'}); }
        }catch(e){}
      }
      var onHome = /index\.html|\/$/.test(frame.src) || frame.src.indexOf('index.html')>-1;
      if(!onHome){ frame.src='index.html?edit=1'; frame.addEventListener('load', function once(){ frame.removeEventListener('load',once); setTimeout(doScroll,200); }); }
      else { doScroll(); }
    }
    // MII30b: the Manage Projects panel belongs to the Portfolio workspace —
    // show it only when the Portfolio page is selected.
    function toggleBetaPortfolio(page){
      var panel=byId('betaPortfolioPanel'); if(panel){ var show=(page==='portfolio.html'); panel.hidden=!show; if(show) loadBetaProjects(); }
      // Mii40 — discoverability: when previewing the Contact page in the editor,
      // surface a shortcut to the EXISTING Contact & Business editor (no duplicate
      // editor — it just jumps to that tab, which already manages links/URLs).
      var cs=byId('editorEditContact'); if(cs) cs.hidden=(page!=='contact.html');
    }
    window.__miidearToggleBetaPortfolio=toggleBetaPortfolio;
    byId('editorReload').addEventListener('click', function(){ frame.src=frame.src; });
    var ecBtn=byId('editorEditContact');
    if(ecBtn) ecBtn.addEventListener('click', function(){ var cl=document.querySelector('.dash-link[data-tab="contact"]'); if(cl) cl.click(); });
    toggleBetaPortfolio('index.html');

    function refreshFrame(){ try{ frame.contentWindow.postMessage({__miidear:true,type:'refresh'},'*'); }catch(e){} }
    function estatus(t,k){ status(byId('editorStatus'),t,k); }

    // Messages from the iframed page (content.js edit bridge).
    // Mii37 — after the shared review modal closes, reload the preview once so
    // the testimonials section reflects an add/edit. Non-invasive: does not touch
    // openReview/saveReview; just observes the modal's open class.
    function watchReviewModalClose(){
      var modal=byId('editModal'); if(!modal||modal.__rvWatch) return; modal.__rvWatch=true;
      var mo=new MutationObserver(function(){
        if(!modal.classList.contains('is-open')){
          mo.disconnect(); modal.__rvWatch=false;
          var fr=byId('editorFrame'); if(fr){ try{ fr.contentWindow.location.reload(); }catch(err){ fr.src=fr.src; } }
        }
      });
      mo.observe(modal,{attributes:true, attributeFilter:['class']});
    }
    window.addEventListener('message', function(e){
      var d=e.data||{}; if(!d.__miidear) return;

      // Mii37 — review controls inside the testimonials preview. Reuse the
      // EXISTING review CRUD: openReview (add/edit modal) and DB.deleteRow.
      if(d.type==='review-add' || d.type==='review-edit'){
        // After the shared editor modal closes, reload the preview so the
        // testimonials section reflects the change (openReview already refreshes
        // the Reviews tab + home overview; we add only the preview reload).
        watchReviewModalClose();
        if(d.type==='review-add'){ openReview(null); return; }
        DB.selectAll('reviews','sort_order',true).then(function(res){
          var row=((res&&res.data)||[]).filter(function(x){return String(x.id)===String(d.id);})[0];
          if(row) openReview(row);
        });
        return;
      }
      if(d.type==='review-del'){
        if(!confirm('Delete this review? This cannot be undone.')) return;
        DB.deleteRow('reviews', d.id).then(function(res){
          if(res.error){ window.MiidearToast('Could not delete: '+res.error.message,'error'); return; }
          logChange('Reviews','review:'+d.id,'Existing review','(deleted)');
          window.MiidearToast('Review deleted.','success');
          loadReviews(); loadHome();
          var fr=byId('editorFrame'); if(fr){ try{ fr.contentWindow.location.reload(); }catch(err){ fr.src=fr.src; } }
        });
        return;
      }

      if(d.type==='save-project-field'){
        // Single source of truth is the projects table. Allowlist the columns
        // the Website Editor may write, so a malformed message can't touch others.
        var ALLOWED={title:1, bride_name:1, groom_name:1, description:1};
        if(!ALLOWED[d.field]){ estatus('That field is not editable here.','error'); return; }
        var patch={}; patch[d.field]=d.value;
        estatus('Saving…');
        DB.updateRow('projects', d.id, patch).then(function(res){
          if(res.error){ estatus('Save failed: '+res.error.message,'error'); window.MiidearToast('Save failed.','error'); return; }
          logChange('Website Editor','projects:'+d.id+'|'+d.field,'(previous)',d.value);
          estatus('Saved.','success'); window.MiidearToast('Saved.','success');
        });
        return;
      }
      if(d.type==='edit-project-image'){
        pendingMedia={kind:'project-image', id:d.id}; fileInput.accept='image/*'; fileInput.click();
        return;
      }

      if(d.type==='save-content'){
        var pk=String(d.key).split(':'); // "page:key"
        estatus('Saving…');
        DB.upsertByKey('site_content',[{page:pk[0],key:pk[1],value:d.value}],'page,key').then(function(res){
          if(res.error){ estatus('Save failed: '+res.error.message,'error'); window.MiidearToast('Save failed.','error'); return; }
          logChange('Website Editor','site_content:'+pk[0]+'|'+pk[1],'(previous)',d.value);
          estatus('Saved.','success'); window.MiidearToast('Saved.','success');
        });
      }
      else if(d.type==='edit-link'){
        // Mii40 — inline link editing. For anchors (the "Link →" / "Open in
        // Google Maps →" buttons) edit ONLY the destination URL; the visible
        // text stays fixed. For non-anchor links (e.g. the phone number, whose
        // displayed value IS the text) edit that display value. Reuses site_links.
        var val;
        if(d.isAnchor){ val=window.prompt('Destination URL (the button text stays the same):', d.href||''); }
        else { val=window.prompt('Value:', d.text||''); }
        if(val===null) return; val=val.trim();
        estatus('Saving…');
        DB.upsertByKey('site_links',[{key:d.key,value:val}]).then(function(res){
          if(res.error){ estatus('Save failed: '+res.error.message,'error'); return; }
          logChange('Website Editor','site_links:'+d.key,(d.isAnchor?(d.href||''):(d.text||''))||'(previous)',val);
          estatus('Saved.','success'); window.MiidearToast(d.isAnchor?'Link destination saved.':'Saved.','success'); refreshFrame();
        });
      }
      else if(d.type==='edit-image'){
        pendingMedia={kind:'image', key:d.key}; fileInput.accept='image/*'; fileInput.click();
      }
      else if(d.type==='edit-video'){
        pendingMedia={kind:'video', key:d.key}; fileInput.accept='video/*'; fileInput.click();
      }
    });

    fileInput.addEventListener('change', function(){
      var f=this.files&&this.files[0]; this.value=''; if(!f||!pendingMedia) return;
      var pm=pendingMedia; pendingMedia=null;
      var ext=(f.name.split('.').pop()||'bin').toLowerCase();
      estatus('Uploading '+(Math.round(f.size/1048576*10)/10)+' MB…');
      // MII22 — Selection-of-Our-Work card image replaces the project's banner.
      if(pm.kind==='project-image'){
        DB.uploadMedia('projects/cover-'+pm.id+'-'+Date.now()+'.'+ext, f).then(function(res){
          if(res.error){ estatus('Upload failed: '+res.error.message,'error'); window.MiidearToast('Upload failed.','error'); return; }
          DB.updateRow('projects', pm.id, { banner_url:res.data.publicUrl }).then(function(r2){
            if(r2.error){ estatus('Saved file, not set active: '+r2.error.message,'error'); return; }
            logChange('Website Editor','projects:'+pm.id+'|banner_url','(previous)',res.data.publicUrl);
            estatus('Image updated.','success'); window.MiidearToast('Collection image updated.','success'); refreshFrame();
          });
        });
        return;
      }
      DB.uploadMedia((pm.kind==='video'?'hero/':'site/')+pm.key+'-'+Date.now()+'.'+ext, f).then(function(res){
        if(res.error){ estatus('Upload failed: '+res.error.message,'error'); window.MiidearToast('Upload failed.','error'); return; }
        var url=res.data.publicUrl;
        var save;
        if(pm.key==='hero_video') save=DB.upsertByKey('hero_media',[{key:'video',value:url}]);
        else save=DB.upsertByKey('site_images',[{key:pm.key,value:url}]);
        save.then(function(r2){
          if(r2.error){ estatus('Saved file, not set active: '+r2.error.message,'error'); return; }
          logChange('Website Editor',(pm.key==='hero_video'?'hero_media:video':'site_images:'+pm.key),'(previous)',url);
          estatus(pm.kind==='video'?'Video updated.':'Image updated.','success');
          window.MiidearToast('Media updated.','success'); refreshFrame();
        });
      });
    });
  }

  // Record one change. Fire-and-forget; never blocks the user's save.
  function logChange(section, field, prev, next){
    if(prev===next) return Promise.resolve();
    return DB.insertRow('change_log', { section:section, field:field, previous_value:(prev==null?'':String(prev)), new_value:(next==null?'':String(next)) });
  }
  function loadChanges(){
    byId('changesLoading').style.display='block'; byId('changesEmpty').style.display='none'; byId('changesBody').innerHTML='';
    DB.listChangeLog().then(function(res){
      byId('changesLoading').style.display='none';
      if(res.error){ byId('changesEmpty').style.display='block'; byId('changesEmpty').textContent='Could not load history: '+res.error.message; return; }
      var rows=res.data||[];
      if(!rows.length){ byId('changesEmpty').style.display='block'; return; }
      byId('changesBody').innerHTML=rows.map(function(c){
        return '<tr><td>'+fmtDateTime(c.changed_at)+'</td><td>'+esc(c.section||'')+'</td><td>'+esc(c.field||'')+'</td>'+
          '<td class="muted">'+esc(trunc(c.previous_value))+'</td><td>'+esc(trunc(c.new_value))+'</td>'+
          '<td style="text-align:right"><button class="btn-xs" data-revert="'+esc(c.id)+'">Revert</button></td></tr>';
      }).join('');
      Array.prototype.forEach.call(byId('changesBody').querySelectorAll('[data-revert]'),function(b){
        b.addEventListener('click', function(){ revertChange(rows.filter(function(x){return String(x.id)===b.getAttribute('data-revert');})[0]); });
      });
    });
  }
  function trunc(s){ s=s==null?'':String(s); return s.length>60?s.slice(0,60)+'…':s; }
  // Map a change_log field back to where it lives, to restore it.
  function revertChange(c){
    if(!c) return;
    if(!confirm('Restore the previous value for "'+(c.field||'')+'"? This will update the website.')) return;
    var prev=c.previous_value||'';
    var op;
    // field is stored as "table:identifier" so we know how to restore it.
    var f=String(c.field||'');
    if(f.indexOf('site_content:')===0){ var pk=f.slice('site_content:'.length).split('|'); op=DB.upsertByKey('site_content',[{page:pk[0],key:pk[1],value:prev}],'page,key'); }
    else if(f.indexOf('site_links:')===0){ op=DB.upsertByKey('site_links',[{key:f.slice('site_links:'.length),value:prev}]); }
    else if(f.indexOf('site_images:')===0){ op=DB.upsertByKey('site_images',[{key:f.slice('site_images:'.length),value:prev}]); }
    else if(f.indexOf('hero_media:')===0){ op=DB.upsertByKey('hero_media',[{key:f.slice('hero_media:'.length),value:prev}]); }
    else { window.MiidearToast('This change can’t be auto-reverted.','error'); return; }
    op.then(function(res){
      if(res.error){ window.MiidearToast('Revert failed: '+res.error.message,'error'); return; }
      logChange(c.section||'Revert', c.field, c.new_value, prev); // document the revert
      window.MiidearToast('Reverted.','success'); loadChanges();
      loadHero(); loadContact(); loadPageText(); loadImages();
    });
  }

  // ======================================================================
  //  APPROVE / RESCHEDULE  (status + EmailJS)
  // ======================================================================
  // Extend setStatus: when Confirmed, prompt for a meeting link + send email.
  var _setStatus = setStatus;
  setStatus = function(id, st){
    var row=allInq.filter(function(x){return String(x.id)===String(id);})[0];
    if(st==='Confirmed'){
      var link=window.prompt('Optional: paste a meeting link to include in the confirmation email (e.g. Google Meet). Leave blank to confirm without one.','');
      DB.updateRow('inquiries', id, { status:'Confirmed', meeting_link: link||'' }).then(function(res){
        if(res.error){ window.MiidearToast('Could not update: '+res.error.message,'error'); return; }
        if(row){ row.status='Confirmed'; row.meeting_link=link||''; }
        renderConsults(); loadHome();
        if(window.MiidearEmail && row){ try{ window.MiidearEmail.sendApproved(row, link||''); }catch(e){} }
        window.MiidearToast('Confirmed'+(link?' & email sent.':'.'),'success');
      });
      return;
    }
    if(st==='Reschedule Requested'){
      DB.updateRow('inquiries', id, { status:'Reschedule Requested' }).then(function(res){
        if(res.error){ window.MiidearToast('Could not update: '+res.error.message,'error'); return; }
        if(row) row.status='Reschedule Requested';
        renderConsults(); loadHome();
        if(window.MiidearEmail && row){ try{ window.MiidearEmail.sendReschedule(row); }catch(e){} }
        window.MiidearToast('Reschedule requested & email sent.','success');
      });
      return;
    }
    _setStatus(id, st);
  };

  // Hero poster (fallback image) upload/delete.
  (function wirePoster(){
    var input=byId('posterInput'); if(!input) return;
    DB.selectAll('hero_media').then(function(res){ (res.data||[]).forEach(function(r){ if(r.key==='poster'&&r.value) byId('posterPreview').src=r.value; }); });
    input.addEventListener('change', function(){
      var f=this.files&&this.files[0]; if(!f) return;
      byId('posterPreview').src=URL.createObjectURL(f);
      var ext=(f.name.split('.').pop()||'jpg').toLowerCase();
      status(byId('posterStatus'),'Uploading…');
      DB.uploadMedia('hero/poster-'+Date.now()+'.'+ext, f).then(function(res){
        if(res.error){ status(byId('posterStatus'),'Upload failed: '+res.error.message,'error'); return; }
        DB.upsertByKey('hero_media',[{key:'poster',value:res.data.publicUrl}]).then(function(r2){
          if(r2.error) status(byId('posterStatus'),'Saved file, not set active: '+r2.error.message,'error');
          else { status(byId('posterStatus'),'Fallback image updated.','success'); window.MiidearToast('Hero image updated.','success'); }
        });
      });
    });
    byId('posterDelete').addEventListener('click', function(){
      if(!confirm('Delete the hero fallback image? The site falls back to the default until you upload a new one.')) return;
      DB.upsertByKey('hero_media',[{key:'poster',value:''}]).then(function(r){
        if(r.error) status(byId('posterStatus'),'Could not delete: '+r.error.message,'error');
        else { status(byId('posterStatus'),'Image removed.','success'); window.MiidearToast('Hero image deleted.','success'); }
      });
    });
  })();

  // ======================================================================
  //  PAGE TEXT  (editable headings/paragraphs across the site)
  // ======================================================================
  var PAGE_TEXT=[
    ['home','atelier_title','Home · Atelier Title'],['home','atelier_text','Home · Atelier Text'],
    ['home','selection_title','Home · Our Work Title'],['home','selection_text','Home · Our Work Text'],
    ['home','philosophy_title','Home · Philosophy Title'],
    ['home','couples_title','Home · Reviews Title'],['home','couples_text','Home · Reviews Text'],
    ['home','journey_title','Home · Begin Journey Title'],['home','journey_text','Home · Begin Journey Text'],
    ['home','footer_slogan','Footer · Slogan'],['home','footer_copyright','Footer · Copyright'],
    ['contact','heading','Contact · Heading'],['contact','intro','Contact · Intro'],
    ['contact','atelier_title','Contact · Visit Title'],['contact','atelier_text','Contact · Visit Text'],
    ['booking','heading','Booking · Heading'],['booking','intro','Booking · Intro'],['booking','success','Booking · Success Message'],
    ['experience','heading','Experience · Heading'],['experience','intro','Experience · Intro'],
    ['experience','step_1_title','Experience · Step 1 Title'],['experience','step_1_desc','Experience · Step 1 Text'],
    ['experience','step_2_title','Experience · Step 2 Title'],['experience','step_2_desc','Experience · Step 2 Text'],
    ['experience','step_3_title','Experience · Step 3 Title'],['experience','step_3_desc','Experience · Step 3 Text'],
    ['experience','step_4_title','Experience · Step 4 Title'],['experience','step_4_desc','Experience · Step 4 Text'],
    ['experience','step_5_title','Experience · Step 5 Title'],['experience','step_5_desc','Experience · Step 5 Text'],
    ['experience','cta_title','Experience · CTA Title'],['experience','cta_text','Experience · CTA Text']
  ];
  var pageTextOriginal={};
  function loadPageText(){
    DB.selectAll('site_content').then(function(res){
      var map={}; (res.data||[]).forEach(function(r){ map[r.page+':'+r.key]=r.value; });
      pageTextOriginal=map;
      byId('pageTextEditor').innerHTML=PAGE_TEXT.map(function(f){
        var id='pt_'+f[0]+'_'+f[1]; var val=map[f[0]+':'+f[1]]||'';
        return '<div class="field"><label for="'+id+'">'+f[2]+'</label><textarea id="'+id+'" rows="2">'+esc(val)+'</textarea></div>';
      }).join('');
      Array.prototype.forEach.call(byId('pageTextEditor').querySelectorAll('textarea'),function(t){ t.addEventListener('input',markDirty); });
    });
    byId('pageTextSave').addEventListener('click', function(){
      var st=byId('pageTextStatus'); status(st,'Saving…');
      var rows=PAGE_TEXT.map(function(f){ return {page:f[0],key:f[1],value:byId('pt_'+f[0]+'_'+f[1]).value}; });
      DB.upsertByKey('site_content', rows, 'page,key').then(function(res){
        if(res.error){ status(st,'Could not save: '+res.error.message,'error'); return; }
        // log each changed field
        PAGE_TEXT.forEach(function(f){ var k=f[0]+':'+f[1]; var nv=byId('pt_'+f[0]+'_'+f[1]).value; logChange('Page Text','site_content:'+f[0]+'|'+f[1], pageTextOriginal[k]||'', nv); });
        status(st,'Saved.','success'); clearDirty(); window.MiidearToast('Page text saved.','success'); loadPageText();
      });
    });
  }

  // ======================================================================
  //  IMAGES  (fixed editable image slots)
  // ======================================================================
  var IMAGE_SLOTS=[
    ['hero_poster','Hero Fallback Image'],
    ['home_atelier','Homepage · Atelier Image'],
    ['home_philosophy','Homepage · Philosophy Image'],
    ['exp_step_1','Experience · Step 1'],['exp_step_2','Experience · Step 2'],
    ['exp_step_3','Experience · Step 3'],['exp_step_4','Experience · Step 4'],['exp_step_5','Experience · Step 5']
  ];
  function loadImages(){
    var host=byId('imagesGrid'); if(!host) return;
    DB.selectAll('site_images').then(function(res){
      var map={}; (res.data||[]).forEach(function(r){ map[r.key]=r.value; });
      // hero poster also lives in hero_media; reflect that if present
      host.innerHTML=IMAGE_SLOTS.map(function(s){
        var url=map[s[0]]||'';
        var prev=url?('<img src="'+esc(url)+'" alt="">'):'<div class="img-slot__empty">No image</div>';
        return '<div class="img-slot"><div class="img-slot__label">'+s[1]+'</div>'+
          '<div class="img-slot__preview">'+prev+'</div>'+
          '<div class="media-controls"><label class="btn-xs go" for="imgin_'+s[0]+'">Upload / Replace</label>'+
          '<input id="imgin_'+s[0]+'" type="file" accept="image/*" hidden data-slot="'+s[0]+'">'+
          '<button class="btn-xs danger" data-imgdel="'+s[0]+'">Delete</button></div>'+
          '<span class="cms-status" id="imgst_'+s[0]+'"></span></div>';
      }).join('');
      Array.prototype.forEach.call(host.querySelectorAll('input[type="file"]'),function(inp){
        inp.addEventListener('change', function(){ uploadImageSlot(inp.getAttribute('data-slot'), inp.files&&inp.files[0], map[inp.getAttribute('data-slot')]||''); });
      });
      Array.prototype.forEach.call(host.querySelectorAll('[data-imgdel]'),function(b){
        b.addEventListener('click', function(){ var slot=b.getAttribute('data-imgdel'); if(!confirm('Delete this image? The site falls back to its default.')) return; deleteImageSlot(slot, map[slot]||''); });
      });
    });
  }
  function uploadImageSlot(slot, file, prev){
    if(!file) return; var st=byId('imgst_'+slot); status(st,'Uploading…');
    var ext=(file.name.split('.').pop()||'jpg').toLowerCase();
    DB.uploadMedia('site/'+slot+'-'+Date.now()+'.'+ext, file).then(function(res){
      if(res.error){ status(st,'Upload failed: '+res.error.message,'error'); return; }
      DB.upsertByKey('site_images',[{key:slot,value:res.data.publicUrl}]).then(function(r2){
        if(r2.error){ status(st,'Saved file, not set active: '+r2.error.message,'error'); return; }
        // keep hero poster mirror in sync
        if(slot==='hero_poster') DB.upsertByKey('hero_media',[{key:'poster',value:res.data.publicUrl}]);
        logChange('Images','site_images:'+slot, prev, res.data.publicUrl);
        status(st,'Updated.','success'); window.MiidearToast('Image updated.','success'); loadImages();
      });
    });
  }
  function deleteImageSlot(slot, prev){
    DB.upsertByKey('site_images',[{key:slot,value:''}]).then(function(r){
      if(r.error){ window.MiidearToast('Could not delete: '+r.error.message,'error'); return; }
      if(slot==='hero_poster') DB.upsertByKey('hero_media',[{key:'poster',value:''}]);
      logChange('Images','site_images:'+slot, prev, '');
      window.MiidearToast('Image removed.','success'); loadImages();
    });
  }

  byId('changesRefresh').addEventListener('click', function(){ loadChanges(); });

})();
