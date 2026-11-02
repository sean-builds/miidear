/* Miidear Digital Atelier. Research applications: P01–P14, P39–P50. */
(function(root){
  'use strict';
  const VERSION=2, WIDTH=700, HEIGHT=1000;
  const clone=value=>JSON.parse(JSON.stringify(value));
  const uid=()=>crypto.randomUUID();
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const base=typeof document!=='undefined'?new URL('.',document.currentScript.src):null;
  const asset=path=>base?new URL(path,base).href:path;
  const route=name=>base?new URL('../'+name+'/',base).href:name;
  const colors={paper:'#faf7f0',ink:'#294760',gold:'#a18a54',sage:'#8b9d86',blush:'#d2b2ad',blue:'#b2c7d7'};
  const fonts=[['Cormorant Garamond','An elegant serif'],['Pinyon Script','Fine calligraphy'],['Italiana','Architectural romance'],['Jost','Clear & contemporary'],['Great Vibes','Flowing calligraphy'],['Ballet','Expressive swashes'],['Bodoni Moda','Fashion serif'],['Cinzel','Engraved capitals'],['Playfair Display','Editorial serif'],['Parisienne','Romantic script'],['EB Garamond','Literary classic'],['DM Sans','Modern simplicity']];
  function settings(){return {names:'Paope & Kawin',initials:['P','K'],hosts:'Together with our families',date:'2027-02-20',time:'17:00',timezone:'Asia/Bangkok',venue:'The Glasshouse',address:'Bangkok, Thailand',mapURL:'https://maps.google.com/?q=Bangkok',deadline:'2027-02-06T16:59:00.000Z',closedMessage:'Our RSVP date has passed. Please contact us if your plans have changed.',dressCode:'Garden formal',dressNote:'Soft shades, flowing silhouettes, and a little something floral.',dressColors:[{name:'Porcelain blue',hex:'#b2c7d7'},{name:'Sage',hex:'#8b9d86'},{name:'Champagne',hex:'#d7c6a6'},{name:'Blush',hex:'#d2b2ad'}],meals:['Thai celebration menu','Vegetarian garden menu','Halal celebration menu'],contact:'For any questions, please contact the couple.',story:'Some days change everything.\nThis is ours, and we would love you to be part of it.',events:[{time:'17:00',title:'The ceremony',detail:'A promise, a beginning, and everyone we love.'},{time:'18:30',title:'Dinner in the garden',detail:'Good food, heartfelt toasts, and a table set for you.'},{time:'20:00',title:'Under the stars',detail:'A little dancing. A lot of joy.'}],musicURL:''};}
  function blank(title='An unwritten love story'){return {version:VERSION,id:uid(),title,theme:'conservatory',colors:clone(colors),settings:settings(),pages:[{id:uid(),name:'Your invitation',width:WIDTH,height:HEIGHT,background:colors.paper,canvas:{version:'6.7.1',objects:[],background:colors.paper}}],revision:0};}
  function localTime(value,zone){const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(value)).map(p=>[p.type,p.value]));return p.year+'-'+p.month+'-'+p.day+'T'+p.hour+':'+p.minute;}
  function deadline(value,zone){if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))throw Error('Choose an RSVP date and time.');const target=Date.parse(value+':00Z');let time=target;for(let i=0;i<3;i++)time+=target-Date.parse(localTime(new Date(time).toISOString(),zone)+':00Z');const result=new Date(time).toISOString();if(localTime(result,zone)!==value)throw Error('That local time does not exist. Choose a different time.');return result;}
  function weddingDate(doc,options={}){return new Date(doc.settings.date+'T12:00:00Z').toLocaleDateString('en-GB',{timeZone:doc.settings.timezone,day:'numeric',month:'long',year:'numeric',...options});}
  function bind(doc,key,fallback){const s=doc.settings,names=s.names.split(/\s*(?:&| and )\s*/i);const map={names:s.names,first:names[0],second:names.slice(1).join(' & '),hosts:s.hosts,date:weddingDate(doc,{weekday:'long'}),venue:s.venue,address:s.address,time:s.time,story:s.story};return Object.prototype.hasOwnProperty.call(map,key)?String(map[key]||''):fallback;}
  function visit(objects,fn){(objects||[]).forEach(o=>{fn(o);if(o.objects)visit(o.objects,fn);});}
  function validate(doc){
    function inspect(v){if(!v||typeof v!=='object')return;for(const k of Object.keys(v)){if(['__proto__','prototype','constructor'].includes(k))throw Error('This project contains unsupported properties.');inspect(v[k]);}}
    if(JSON.stringify(doc).length>2200000)throw Error('This project is larger than 2.2 MB.');inspect(doc);
    if(!doc||doc.version!==VERSION||!doc.settings||!Array.isArray(doc.pages)||!doc.pages.length||doc.pages.length>20||!doc.colors)throw Error('Choose a supported Miidear invitation file with 1–20 pages.');
    if(!/^[a-f\d-]{36}$/i.test(doc.id||''))throw Error('This invitation needs a valid document ID.');
    if(typeof doc.title!=='string'||doc.title.length>140)throw Error('Give your invitation a name under 140 characters.');
    if(Object.values(doc.colors).some(v=>typeof v!=='string'||!/^#[a-f\d]{6}$/i.test(v)))throw Error('Choose valid design colors.');
    const s=doc.settings;
    for(const [key,max] of Object.entries({hosts:300,venue:200,address:300,story:2000,closedMessage:500,contact:500,dressCode:120,dressNote:500,mapURL:2000,musicURL:2000})){if(s[key]!=null&&(typeof s[key]!=='string'||s[key].length>max))throw Error('Please shorten the '+key+' field.');}
    if(s.initials&&(!Array.isArray(s.initials)||s.initials.length>2||s.initials.some(v=>typeof v!=='string'||v.length>2)))throw Error('Use up to two initials per name.');
    if(typeof s.names!=='string'||!s.names.trim()||s.names.length>160||!s.venue)throw Error('Add the couple’s names and venue.');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(s.date)||!/^\d{2}:\d{2}$/.test(s.time)||!Number.isFinite(Date.parse(s.deadline))||!/(Z|[+-]\d{2}:\d{2})$/i.test(s.deadline))throw Error('Set a valid wedding date, ceremony time and RSVP deadline.');
    try{new Intl.DateTimeFormat('en',{timeZone:s.timezone}).format(new Date());}catch(_){throw Error('Choose a valid wedding timezone.');}
    if(!Array.isArray(s.meals)||!s.meals.length||s.meals.length>12||s.meals.some(m=>typeof m!=='string'||!m.trim()||m.length>120)||new Set(s.meals).size!==s.meals.length)throw Error('Use 1–12 different meal choices.');
    if(!Array.isArray(s.dressColors)||s.dressColors.length>8||s.dressColors.some(c=>!/^#[a-f\d]{6}$/i.test(c.hex)||typeof c.name!=='string'))throw Error('Choose up to eight named dress colors.');
    if(!Array.isArray(s.events)||s.events.length>12)throw Error('Use up to twelve celebration events.');
    for(const p of doc.pages){if(!p.canvas||!Array.isArray(p.canvas.objects)||p.canvas.objects.length>180)throw Error('Use up to 180 objects on each page.');if(!Number.isFinite(p.width)||!Number.isFinite(p.height)||p.width<300||p.width>2400||p.height<300||p.height>4000)throw Error('Choose a supported page size.');let n=0;visit(p.canvas.objects,o=>{if(++n>2400)throw Error('This artwork contains too many paths.');if(!['Path','Group','Textbox','IText','Text','Rect','Circle','Ellipse','Line','Triangle','Polygon','Polyline','Image','ActiveSelection','path','group','textbox','i-text','text','rect','circle','ellipse','line','triangle','polygon','polyline','image'].includes(o.type))throw Error('This file contains an unsupported object.');if(o.type?.toLowerCase()==='image'&&o.src&&!safeImage(o.src))throw Error('Use an uploaded image or HTTPS image link.');if(o.text&&String(o.text).length>4000)throw Error('Keep each text object under 4,000 characters.');});}
    if(JSON.stringify(doc).length>2200000)throw Error('This project is larger than 2.2 MB. Resize uploaded images or use fewer pages.');return doc;
  }
  function safeImage(value){return typeof value==='string'&&(/^(data:image\/(png|jpeg|webp);base64,)/i.test(value)||/^https:\/\//i.test(value)||/^(\.\.\/digital\/|assets\/)/.test(value)||/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(value));}
  function safeURL(value){try{const u=new URL(value);return u.protocol==='https:'?u.href:'';}catch(_){return '';}}
  function csv(rows){return '\ufeff'+rows.map(row=>row.map(v=>'"'+String(v??'').replace(/^(?:\s*[=+\-@]|[\t\r])/ ,"'$&").replaceAll('"','""')+'"').join(',')).join('\r\n');}
  function download(name,contents,type='application/json'){const url=URL.createObjectURL(contents instanceof Blob?contents:new Blob([contents],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
  function guests(households){return households.flatMap(h=>h.response?.status==='accepted'?h.response.attendees.map(p=>({household:h.name,name:p.name,status:'accepted',meal:p.meal,dietary:p.dietary,note:h.response.note,updated:h.updatedAt||''})):[{household:h.name,name:'—',status:h.response?.status||'pending',meal:'',dietary:'',note:h.response?.note||'',updated:h.updatedAt||''}]);}
  function totals(households){const rows=guests(households);return {invited:households.reduce((n,h)=>n+h.capacity,0),attending:rows.filter(r=>r.status==='accepted').length,pending:households.filter(h=>!h.response).length,declined:households.filter(h=>h.response?.status==='declined').length,dietary:rows.filter(r=>r.status==='accepted'&&r.dietary).length};}
  function calendar(doc){const d=doc.settings.date.replaceAll('-',''),t=doc.settings.time.replace(':','')+'00',zone=doc.settings.timezone;const esc=v=>String(v).replaceAll('\\','\\\\').replaceAll('\n','\\n').replaceAll(',','\\,').replaceAll(';','\\;');return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Miidear//Wedding invitation//EN','BEGIN:VEVENT','UID:'+doc.id+'@miidear','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''),'DTSTART;TZID='+zone+':'+d+'T'+t,'SUMMARY:'+esc(doc.settings.names+' · Wedding'),'LOCATION:'+esc(doc.settings.venue+', '+doc.settings.address),'DESCRIPTION:'+esc(doc.settings.contact),'END:VEVENT','END:VCALENDAR'].join('\r\n');}
  function cutout(pixels,background=[255,255,255],tolerance=18,feather=24){const result=new Uint8ClampedArray(pixels);for(let i=0;i<result.length;i+=4){const distance=Math.sqrt((pixels[i]-background[0])**2+(pixels[i+1]-background[1])**2+(pixels[i+2]-background[2])**2);const a=clamp((distance-tolerance)/Math.max(1,feather),0,1),alpha=a*a*(3-2*a);result[i+3]=Math.round(pixels[i+3]*alpha);if(alpha>.01&&alpha<1)for(let c=0;c<3;c++)result[i+c]=clamp((pixels[i+c]-(1-alpha)*background[c])/alpha,0,255);}return result;}
  function sanitizeSVG(source){if(source.length>1200000)throw Error('Choose an SVG smaller than 1.2 MB.');const xml=new DOMParser().parseFromString(source,'image/svg+xml');if(xml.querySelector('parsererror')||xml.documentElement.tagName.toLowerCase()!=='svg')throw Error('This SVG could not be read.');const allowed=new Set(['svg','g','path','rect','circle','ellipse','line','polyline','polygon','defs','lineargradient','radialgradient','stop','clippath','title','desc']);for(const el of [xml.documentElement,...xml.documentElement.querySelectorAll('*')]){if(!allowed.has(el.tagName.toLowerCase()))throw Error('Use an SVG made of outlined paths and simple shapes.');for(const attr of [...el.attributes]){const value=attr.value;if(attr.name==='xmlns'&&value==='http://www.w3.org/2000/svg')continue;if(/^on/i.test(attr.name)||/href$/i.test(attr.name)||/javascript:|https?:|data:|@import|expression\(/i.test(value)||(/url\(/i.test(value)&&!/url\(\s*#[\w-]+\s*\)/.test(value)))throw Error('This SVG contains external or active content.');}}return new XMLSerializer().serializeToString(xml);}
  function db(){return new Promise((resolve,reject)=>{const req=indexedDB.open('miidear-digital-atelier',1);req.onupgradeneeded=()=>{const store=req.result.createObjectStore('projects',{keyPath:'id'});store.createIndex('updatedAt','updatedAt');};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(Error('Device storage is unavailable. Download your project to keep it.'));});}
  async function storeProject(doc){const connection=await db();return new Promise((resolve,reject)=>{const tx=connection.transaction('projects','readwrite');tx.objectStore('projects').put({id:doc.id,title:doc.title,updatedAt:new Date().toISOString(),document:clone(doc)});tx.oncomplete=()=>{connection.close();resolve();};tx.onerror=()=>{connection.close();reject(Error('Could not save on this device. Download your project as a backup.'));};});}
  async function listProjects(){const connection=await db();return new Promise((resolve,reject)=>{const tx=connection.transaction('projects','readonly'),r=tx.objectStore('projects').getAll();r.onsuccess=()=>{connection.close();resolve(r.result.sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)));};r.onerror=()=>reject(Error('Could not open saved projects.'));});}
  const api={VERSION,WIDTH,HEIGHT,clone,uid,clamp,escape,base,asset,route,colors,fonts,settings,blank,localTime,deadline,weddingDate,bind,visit,validate,safeImage,safeURL,csv,download,guests,totals,calendar,cutout,sanitizeSVG,storeProject,listProjects};root.Mii=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

/** Miidear Invitation Service · Google Apps Script V8.
 * Private Google Sheets are the source of truth. Never publish them to the web.
 * Configure Script Properties, run setup(), then deploy as web app (execute as
 * owner, access Anyone). doPost authorizes every privileged operation itself.
 */
var INV_HEADERS=['id','title','draft','published','revision','workbookId','coupleHash','updatedAt'];
var HOUSE_HEADERS=['id','name','capacity','tokenHash','response','updatedAt'];
var GUEST_HEADERS=['Guest','Household','Response','Meal preference','Dietary requirements','Note to the couple','Last reply'];

function setup() {
  var props=PropertiesService.getScriptProperties();
  if(!props.getProperty('ADMIN_EMAILS')||!props.getProperty('SUPABASE_URL')||!props.getProperty('SUPABASE_PUBLISHABLE_KEY')) throw new Error('Set ADMIN_EMAILS, SUPABASE_URL, and SUPABASE_PUBLISHABLE_KEY in Script Properties first.');
  var id=props.getProperty('MASTER_SHEET_ID');
  var book=id?SpreadsheetApp.openById(id):SpreadsheetApp.create('Miidear · Invitation Atelier');
  var sheet=book.getSheetByName('Invitations')||book.getSheets()[0];sheet.setName('Invitations');
  if(sheet.getLastRow()===0)sheet.appendRow(INV_HEADERS);
  if(sheet.getRange(1,1,1,INV_HEADERS.length).getValues()[0].join('|')!==INV_HEADERS.join('|'))throw new Error('Master sheet headers do not match. Choose an empty workbook.');
  styleTable_(sheet,INV_HEADERS.length);props.setProperty('MASTER_SHEET_ID',book.getId());
  console.log('Private invitation workbook: '+book.getUrl());
  return book.getUrl();
}

function doPost(e) {
  var lock;
  try {
    var text=e&&e.postData&&e.postData.contents||'';
    if(text.length>2300000)fail_('INVALID','This request is too large.');
    var p=JSON.parse(text);if(!p||typeof p.action!=='string')fail_('INVALID','Choose a valid invitation action.');
    var publicActions=['publicInvitation','rsvp','coupleDashboard'];
    if(publicActions.indexOf(p.action)===-1)authorizeAdmin_(p.accessToken);
    lock=LockService.getScriptLock();if(!lock.tryLock(12000))fail_('BUSY','Another reply is being saved. Please try again in a moment.');
    var data=dispatch_(p);SpreadsheetApp.flush();
    return json_({ok:true,data:data,serverTime:new Date().toISOString()});
  } catch(error) {
    if(!error.invitationCode)console.error(String(error));
    return json_({ok:false,code:error.invitationCode||'SERVICE',message:error.invitationCode?error.message:'The invitation service could not complete this request. Please try again.',serverTime:new Date().toISOString()});
  } finally {if(lock&&lock.hasLock())lock.releaseLock();}
}
function doGet(){return json_({ok:true,data:{service:'Miidear Invitation Atelier',version:2,build:'grand-2026-11-02'},serverTime:new Date().toISOString()});}
function json_(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
function fail_(code,message){var e=new Error(message);e.invitationCode=code;throw e;}
function props_(){return PropertiesService.getScriptProperties();}
function hash_(value){return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(value))).replace(/=+$/,'');}
function token_(){return Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,'');}
function id_(id){if(typeof id!=='string'||!/^[a-f0-9-]{36}$/i.test(id))fail_('INVALID','This invitation link is not valid.');return id;}
function string_(value,max,required){if(typeof value!=='string'||value.length>max||(required&&!value.trim()))fail_('INVALID','Please check the invitation details.');return value.trim();}
function authorizeAdmin_(token){
  if(typeof token!=='string'||token.length<20||token.length>6000)fail_('AUTH','Sign in to the Miidear dashboard to continue.');
  var cfg=props_(),url=cfg.getProperty('SUPABASE_URL'),key=cfg.getProperty('SUPABASE_PUBLISHABLE_KEY');
  if(!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url||''))fail_('SETUP','The invitation service needs its Supabase connection configured.');
  var response=UrlFetchApp.fetch(url+'/auth/v1/user',{headers:{apikey:key,Authorization:'Bearer '+token},muteHttpExceptions:true});
  if(response.getResponseCode()!==200)fail_('AUTH','Your session has ended. Sign in again.');
  var user=JSON.parse(response.getContentText());
  var allowed=(cfg.getProperty('ADMIN_EMAILS')||'').toLowerCase().split(',').map(function(x){return x.trim();}).filter(Boolean);
  if(!user.id||!user.email_confirmed_at||allowed.indexOf(String(user.email||'').toLowerCase())===-1)fail_('FORBIDDEN','This account does not have access to the invitation atelier.');
  return user;
}
function master_(){var id=props_().getProperty('MASTER_SHEET_ID');if(!id)fail_('SETUP','Run the invitation service setup first.');return SpreadsheetApp.openById(id).getSheetByName('Invitations');}
function all_(sheet){var n=sheet.getLastRow();if(n<2)return [];var values=sheet.getRange(2,1,n-1,sheet.getLastColumn()).getValues();return values.map(function(row,i){return {row:i+2,values:row};});}
function find_(id,required){id_(id);var row=all_(master_()).filter(function(r){return r.values[0]===id;})[0];if(!row&&required!==false)fail_('NOT_FOUND','This invitation is not available.');return row;}
function put_(sheet,row,values){sheet.getRange(row,1,1,values.length).setValues([values]);}
function sheetText_(s){s=String(s||'');return /^[\s]*[=+\-@]/.test(s)?"'"+s:s;}
function untext_(s){return String(s||'').replace(/^'(?=[\s]*[=+\-@])/,'');}
function styleTable_(sheet,width){sheet.setFrozenRows(1);sheet.getRange(1,1,1,width).setBackground('#354638').setFontColor('#ffffff').setFontFamily('Georgia').setFontSize(11).setFontWeight('bold');sheet.setRowHeight(1,38);sheet.setColumnWidths(1,width,170);}
function weddingBook_(row){return SpreadsheetApp.openById(row.values[5]);}
function createWeddingBook_(doc){
  var book=SpreadsheetApp.create('Miidear · '+doc.settings.names+' · Guest Book');
  var overview=book.getSheets()[0];overview.setName('Overview');
  var households=book.insertSheet('Households');households.appendRow(HOUSE_HEADERS);styleTable_(households,HOUSE_HEADERS.length);
  var guests=book.insertSheet('Guests');guests.appendRow(GUEST_HEADERS);styleTable_(guests,GUEST_HEADERS.length);guests.setColumnWidth(5,280);guests.setColumnWidth(6,300);
  overview.getRange('A1:F2').merge().setValue(doc.settings.names).setFontFamily('Georgia').setFontSize(28).setFontColor('#354638').setBackground('#edf1e7');
  overview.getRange('A4:B8').setValues([['Your celebration','Guest count'],['Attending','=COUNTIF(Guests!C2:C,"accepted")'],['Declined households','=COUNTIF(Guests!C2:C,"declined")'],['Awaiting reply','=COUNTIF(Guests!C2:C,"pending")'],['Dietary requirements','=COUNTIFS(Guests!C2:C,"accepted",Guests!E2:E,"?*")']]);
  overview.getRange('A4:B4').setBackground('#354638').setFontColor('#ffffff').setFontWeight('bold');overview.getRange('A5:B8').setBackground('#f5f6f0').setFontFamily('Georgia').setFontSize(14);overview.setColumnWidth(1,250);overview.setColumnWidth(2,130);overview.getRange('A11:F12').merge().setValue('A celebration, thoughtfully brought together. Guest records remain private to you and your wedding team.').setWrap(true).setFontColor('#697168').setFontFamily('Georgia');overview.setFrozenRows(2);
  return book;
}
function validDocument_(doc,publish){
  try{Mii.validate(doc);}catch(e){fail_('INVALID',e.message);}
  if(publish&&Date.parse(doc.settings.deadline)<=Date.now())fail_('INVALID','Choose an RSVP deadline in the future before publishing.');
  return doc;
}
// One spreadsheet cell is limited to 50,000 characters. Stage chunks first and
// only then commit a small revision pointer in the master row, under script lock.
function chunks_(row){var b=weddingBook_(row),s=b.getSheetByName('DesignChunks');if(!s){s=b.insertSheet('DesignChunks');s.appendRow(['key','part','json']);}return s;}
function writeDocument_(row,doc){var raw=JSON.stringify(doc),key=Utilities.getUuid(),rows=[];for(var offset=0;offset<raw.length;offset+=18000)rows.push([key,rows.length,JSON.stringify(raw.slice(offset,offset+18000))]);var s=chunks_(row);s.getRange(s.getLastRow()+1,1,rows.length,3).setValues(rows);SpreadsheetApp.flush();return JSON.stringify({storage:'chunks',encoding:'json-string',key:key,count:rows.length});}
function readDocument_(row,pointer){var p=JSON.parse(pointer);if(p.storage!=='chunks')return p;var rows=all_(chunks_(row)).filter(function(r){return r.values[0]===p.key;}).sort(function(a,b){return Number(a.values[1])-Number(b.values[1]);});if(rows.length!==p.count)fail_('SERVICE','This design could not be loaded. Please contact the atelier.');return JSON.parse(rows.map(function(r){return p.encoding==='json-string'?JSON.parse(String(r.values[2])):r.values[2];}).join(''));}
function getHouseholds_(row){var sheet=weddingBook_(row).getSheetByName('Households');return all_(sheet).map(function(r){var v=r.values;return {row:r.row,id:v[0],name:untext_(v[1]),capacity:Number(v[2]),tokenHash:v[3],response:v[4]?JSON.parse(v[4]):null,updatedAt:v[5]||''};});}
function publicHouseholds_(rows){return rows.map(function(h){return {id:h.id,name:h.name,capacity:h.capacity,response:h.response,updatedAt:h.updatedAt};});}
function tokenHousehold_(row,token){if(typeof token!=='string'||!/^[a-f0-9]{64}$/i.test(token))fail_('TOKEN','This personal invitation link is not valid. Please ask the couple for a new one.');var match=getHouseholds_(row).filter(function(h){return h.tokenHash===hash_(token);})[0];if(!match)fail_('TOKEN','This personal invitation link has expired. Please ask the couple for a new one.');return match;}
function published_(row){if(!row.values[3])fail_('NOT_FOUND','This invitation has not been published yet.');return readDocument_(row,row.values[3]);}
function syncGuests_(row){
  var sheet=weddingBook_(row).getSheetByName('Guests'),items=[];
  getHouseholds_(row).forEach(function(h){var r=h.response;if(r&&r.status==='accepted')r.attendees.forEach(function(p){items.push([sheetText_(p.name),sheetText_(h.name),'accepted',sheetText_(p.meal),sheetText_(p.dietary),sheetText_(r.note),h.updatedAt]);});else items.push(['',sheetText_(h.name),r?'declined':'pending','','',sheetText_(r&&r.note),h.updatedAt]);});
  if(sheet.getLastRow()>1)sheet.getRange(2,1,sheet.getLastRow()-1,7).clearContent();
  if(items.length){sheet.getRange(2,1,items.length,7).setValues(items).setFontFamily('Georgia').setFontSize(11).setWrap(true);sheet.getRange(2,1,items.length,7).setBackgrounds(items.map(function(_,i){return Array(7).fill(i%2?'#f1f4eb':'#ffffff');}));}
}
function trySync_(row){try{syncGuests_(row);}catch(error){console.error('Guest projection needs refresh: '+String(error));}}
function dispatch_(p){
  var row,doc,household,token,book,values,now=new Date().toISOString();
  if(p.action==='listInvitations')return all_(master_()).map(function(r){return {id:r.values[0],title:untext_(r.values[1]),published:!!r.values[3],updatedAt:r.values[7]};});
  if(p.action==='saveDraft'||p.action==='publish'){
    doc=validDocument_(p.document,p.action==='publish');row=find_(doc.id,false);
    if(row&&Number(row.values[4])!==Number(p.revision||0))fail_('CONFLICT','This invitation changed in another session. Download your design, then reopen the latest draft from My invitations.');
    if(!row){book=createWeddingBook_(doc);values=[doc.id,sheetText_(doc.title),'','',0,book.getId(),'',''];row={row:master_().getLastRow()+1,values:values};}
    values=row.values.slice();values[1]=sheetText_(doc.title);var clean=JSON.parse(JSON.stringify(doc));delete clean.revision;values[2]=writeDocument_(row,clean);if(p.action==='publish')values[3]=values[2];values[4]=Number(values[4])+1;values[7]=now;put_(master_(),row.row,values);
    return {id:doc.id,revision:values[4],published:!!values[3]};
  }
  row=find_(p.id);
  if(p.action==='getDraft')return {document:readDocument_(row,row.values[2]),revision:Number(row.values[4])};
  if(p.action==='publicInvitation'){
    doc=published_(row);household=p.token?tokenHousehold_(row,p.token):null;
    return {document:doc,household:household?{name:household.name,capacity:household.capacity,response:household.response}:null};
  }
  if(p.action==='addHousehold'){
    published_(row);var name=string_(p.name,120,true),capacity=Number(p.capacity);if(!Number.isInteger(capacity)||capacity<1||capacity>12)fail_('INVALID','Choose between 1 and 12 invited guests.');
    token=token_();book=weddingBook_(row);book.getSheetByName('Households').appendRow([Utilities.getUuid(),sheetText_(name),capacity,hash_(token),'','']);trySync_(row);return {name:name,capacity:capacity,token:token};
  }
  if(p.action==='rotateGuestToken'){
    household=getHouseholds_(row).filter(function(h){return h.id===p.householdId;})[0];if(!household)fail_('NOT_FOUND','This household is no longer on the guest list.');token=token_();weddingBook_(row).getSheetByName('Households').getRange(household.row,4).setValue(hash_(token));return {name:household.name,capacity:household.capacity,token:token};
  }
  if(p.action==='listGuests'){trySync_(row);return {households:publicHouseholds_(getHouseholds_(row))};}
  if(p.action==='rotateCoupleToken'){token=token_();master_().getRange(row.row,7).setValue(hash_(token));return {token:token};}
  if(p.action==='coupleDashboard'){
    if(typeof p.token!=='string'||!/^[a-f0-9]{64}$/i.test(p.token)||!row.values[6]||hash_(p.token)!==row.values[6])fail_('TOKEN','This private dashboard link has expired. Ask the atelier for a new one.');
    doc=published_(row);return {names:doc.settings.names,date:doc.settings.date,deadline:doc.settings.deadline,timezone:doc.settings.timezone,meals:doc.settings.meals,households:publicHouseholds_(getHouseholds_(row)),sheetURL:weddingBook_(row).getUrl(),updatedAt:now};
  }
  if(p.action==='rsvp'){
    doc=published_(row);household=tokenHousehold_(row,p.token);
    if(Date.now()>=Date.parse(doc.settings.deadline))fail_('CLOSED',doc.settings.closedMessage||'The RSVP date has passed. Please contact the couple.');
    if(p.status!=='accepted'&&p.status!=='declined')fail_('INVALID','Choose accept or decline.');
    var attendees=[];
    if(p.status==='accepted'){
      if(!Array.isArray(p.attendees)||p.attendees.length<1||p.attendees.length>household.capacity)fail_('CAPACITY','Please check the number of guests on your invitation.');
      attendees=p.attendees.map(function(a){var name=string_(a.name,120,true),meal=string_(a.meal,120,true),dietary=string_(a.dietary,500,false);if(doc.settings.meals.indexOf(meal)===-1)fail_('MEAL','Choose a meal from the couple’s menu.');return {name:name,meal:meal,dietary:dietary};});
    }
    var reply={status:p.status,attendees:attendees,note:string_(p.note,1000,false)};
    // A single canonical row update: resubmission replaces this household’s reply.
    put_(weddingBook_(row).getSheetByName('Households'),household.row,[household.id,sheetText_(household.name),household.capacity,household.tokenHash,JSON.stringify(reply),now]);
    trySync_(row);return {saved:true,status:p.status};
  }
  fail_('INVALID','This invitation action is not supported.');
}

function configureMiidear(){
  var p=PropertiesService.getScriptProperties();
  p.setProperty('ADMIN_EMAILS','sean.sppdd@gmail.com');
  p.setProperty('SUPABASE_URL','https://ahchspjlemqlevcqffjh.supabase.co');
  p.setProperty('SUPABASE_PUBLISHABLE_KEY','sb_publishable_G24C4i0RdPpaoBmbCo7VrQ_jqRjf1mN');
  p.setProperty('MASTER_SHEET_ID','1lfPeO4N57twQIXFkunnH3kNUAbcveLDWgV5wcGgXQuM');
  return setup();
}
