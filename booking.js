/* Local consultation drafts. No network submission or shared availability. */
(function(){
  'use strict';
  var KEY='miidear_appointments',HOURS=['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];
  function loadAll(){try{var data=JSON.parse(localStorage.getItem(KEY));return Array.isArray(data)?data:[];}catch(e){return [];}}
  function saveAll(data){localStorage.setItem(KEY,JSON.stringify(data));}
  window.MiidearStore={key:KEY,workingHours:HOURS,loadAll:loadAll,saveAll:saveAll};
  var form=document.getElementById('bookingForm');if(!form)return;
  var msg=document.getElementById('formMsg'),date=document.getElementById('prefDate'),time=document.getElementById('prefTime'),hint=document.getElementById('slotHint'),confirmation=document.getElementById('confirmation'),saved=null;
  function bangkokToday(){var parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()),v={};parts.forEach(function(p){v[p.type]=p.value;});return v.year+'-'+v.month+'-'+v.day;}
  function addDays(str,n){var d=new Date(str+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
  function limits(){var today=bangkokToday();date.min=addDays(today,1);date.max=addDays(today,120);document.getElementById('weddingDate').min=today;}
  function openDay(str){var d=new Date(str+'T12:00:00Z').getUTCDay();return d>=2&&d<=6;}
  function refresh(){limits();var valid=date.value&&date.value>=date.min&&date.value<=date.max&&openDay(date.value);time.disabled=!valid;if(!valid)time.value='';hint.textContent=!date.value?'Choose a date to see consultation times.':!openDay(date.value)?'The atelier is open Tuesday to Saturday. Please choose another date.':date.value<date.min||date.value>date.max?'Please choose a date within the next 120 days, starting tomorrow.':'All times are Bangkok time (UTC+7). This is a preference, not confirmed availability.';}
  refresh();date.addEventListener('change',refresh);
  function clearErrors(){form.querySelectorAll('.field-error').forEach(function(e){e.remove();});form.querySelectorAll('[aria-invalid]').forEach(function(e){e.removeAttribute('aria-invalid');e.removeAttribute('aria-describedby');});msg.textContent='';}
  function fail(errors){var summary=document.createElement('span');summary.textContent='Please check the following: ';msg.appendChild(summary);errors.forEach(function(error,i){var field=form.elements.namedItem(error[0]),note=document.createElement('p');note.className='field-error';note.id=field.id+'-error';note.textContent=error[1];field.setAttribute('aria-invalid','true');field.setAttribute('aria-describedby',note.id);field.after(note);if(i)msg.appendChild(document.createTextNode(' '));var link=document.createElement('a');link.href='#'+field.id;link.textContent=error[1];link.addEventListener('click',function(e){e.preventDefault();field.focus();});msg.appendChild(link);});msg.className='form-msg error';msg.tabIndex=-1;msg.focus();}
  form.addEventListener('input',function(e){var field=e.target;if(field.hasAttribute('aria-invalid')){field.removeAttribute('aria-invalid');field.removeAttribute('aria-describedby');var note=document.getElementById(field.id+'-error');if(note)note.remove();}});
  form.addEventListener('submit',function(e){
    e.preventDefault();clearErrors();limits();var data={};new FormData(form).forEach(function(v,k){data[k]=String(v).trim();});var errors=[];
    if(!data.fullName)errors.push(['fullName','Enter your name.']);
    if(!data.email||!form.email.validity.valid)errors.push(['email','Enter a valid email address.']);
    if(!data.phone)errors.push(['phone','Enter your phone number.']);
    if(!data.prefDate||data.prefDate<date.min||data.prefDate>date.max||!openDay(data.prefDate))errors.push(['prefDate','Choose a Tuesday–Saturday date between tomorrow and 120 days from today.']);
    if(HOURS.indexOf(data.prefTime)<0)errors.push(['prefTime','Choose a preferred time.']);
    if(data.weddingDate&&data.weddingDate<bangkokToday())errors.push(['weddingDate','Choose a wedding date today or later.']);
    if(data.guests&&(!Number.isInteger(Number(data.guests))||Number(data.guests)<1))errors.push(['guests','Enter a whole guest count of at least 1.']);
    if(!['In Person','Online'].includes(data.consultationType))errors.push(['consultationType','Choose an in-person or online consultation.']);
    if(errors.length){fail(errors);return;}
    data.id='draft_'+Date.now()+'_'+Math.random().toString(36).slice(2,7);data.status='draft';data.createdAt=new Date().toISOString();
    var all=loadAll();all.push(data);
    try{saveAll(all);}catch(err){msg.className='form-msg error';msg.textContent='This browser could not save your draft. Your entries are still here. Allow site storage and try again.';msg.tabIndex=-1;msg.focus();return;}
    saved=data;form.hidden=true;confirmation.style.display='block';var when=new Date(data.prefDate+'T12:00:00Z').toLocaleDateString('en-GB',{timeZone:'Asia/Bangkok',weekday:'long',day:'numeric',month:'long',year:'numeric'});document.getElementById('confirmDetail').textContent=data.consultationType+' consultation preference · '+when+' at '+data.prefTime+' Bangkok time (UTC+7)';confirmation.focus();
  });
  document.getElementById('anotherBtn').addEventListener('click',function(){form.reset();clearErrors();form.hidden=false;confirmation.style.display='none';refresh();form.fullName.focus();});
  document.getElementById('downloadDraft').addEventListener('click',function(){if(!saved)return;var labels={fullName:'Name',email:'Email',phone:'Phone',brideName:'Partner',groomName:'Other partner',weddingDate:'Wedding date',venue:'Venue',guests:'Guest count',consultationType:'Consultation type',prefDate:'Preferred date',prefTime:'Preferred time (Bangkok, UTC+7)',notes:'Notes'};var text='Miidear consultation draft\nNot sent. No appointment has been reserved.\n\n'+Object.keys(labels).map(function(k){return labels[k]+': '+(saved[k]||'Not specified');}).join('\n');var url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='miidear-consultation-draft.txt';link.click();setTimeout(function(){URL.revokeObjectURL(url);},1000);});
})();
