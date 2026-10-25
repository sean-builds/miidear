/* Contact details must be confirmed by the atelier before enabling links. */
window.MIIDEAR_CONTACT = { phone:'', telegram:'', whatsapp:'', line:'', email:'', instagram:'', tiktok:'', facebook:'' };
window.MIIDEAR_DATA = {
  featured: [{name:'Aurelia',theme:'sage',description:'Botanical tones & a personal monogram'},{name:'Maison Blanc',theme:'rose',description:'Soft paper & a romantic script'},{name:'Quiet Lines',theme:'ink',description:'Sculptural type & considered space'}],
  thai:[{name:'Golden Hour',theme:'gold'},{name:'Garden Ceremony',theme:'sage'},{name:'Warm Ivory',theme:'rose'}],
  chinese:[{name:'Rose & Gold',theme:'rose'},{name:'Golden Hour',theme:'gold'},{name:'Quiet Celebration',theme:'ink'}],
  modern:[{name:'Quiet Lines',theme:'ink'},{name:'Botanical Study',theme:'sage'},{name:'Maison Blanc',theme:'rose'}],
  western:[{name:'Aurelia',theme:'sage'},{name:'Maison Blanc',theme:'rose'},{name:'Golden Hour',theme:'gold'}]
};
Object.keys(window.MIIDEAR_DATA).forEach(function(key){window.MIIDEAR_DATA[key].forEach(function(c){c.images=[0,1,2].map(function(v){return {theme:c.theme,variation:v};});});});
(function(){
  'use strict';
  var y=document.getElementById('year');if(y)y.textContent=new Date().getFullYear();
  var header=document.getElementById('header');
  if(header){var onScroll=function(){header.classList.toggle('is-scrolled',window.scrollY>30);};window.addEventListener('scroll',onScroll,{passive:true});onScroll();}
  var toggle=document.getElementById('navToggle'),nav=document.getElementById('nav'),menuBackground=[];
  function setMenu(open,restore){
    nav.classList.toggle('is-open',open);toggle.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close menu':'Open menu');document.body.style.overflow=open?'hidden':'';
    if(open){menuBackground=Array.from(document.body.children).filter(function(el){return el!==header&&el.tagName!=='SCRIPT'&&!el.inert;});menuBackground.forEach(function(el){el.inert=true;});nav.querySelector('a').focus();}
    else{menuBackground.forEach(function(el){el.inert=false;});menuBackground=[];if(restore)toggle.focus();}
  }
  if(toggle&&nav){
    toggle.addEventListener('click',function(){setMenu(!nav.classList.contains('is-open'),true);});
    nav.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){setMenu(false,false);});});
    document.addEventListener('keydown',function(e){if(!nav.classList.contains('is-open'))return;if(e.key==='Escape'){e.preventDefault();setMenu(false,true);}if(e.key==='Tab'){var controls=[toggle].concat(Array.from(nav.querySelectorAll('a'))),first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
    window.addEventListener('resize',function(){if(window.innerWidth>820&&nav.classList.contains('is-open'))setMenu(false,false);});
    var current=location.pathname.split('/').pop()||'index.html';nav.querySelectorAll('a').forEach(function(a){if(a.getAttribute('href')===current){a.setAttribute('aria-current','page');a.classList.add('is-current');}});
  }
  document.querySelectorAll('.faq-item').forEach(function(item,i){
    var q=item.querySelector('.faq-q'),a=item.querySelector('.faq-a');if(!q||!a)return;q.id='faq-question-'+i;a.id='faq-answer-'+i;a.hidden=true;q.setAttribute('aria-controls',a.id);a.setAttribute('aria-labelledby',q.id);a.setAttribute('role','region');
    q.addEventListener('click',function(){var open=q.getAttribute('aria-expanded')==='true';document.querySelectorAll('.faq-item').forEach(function(o){o.classList.remove('is-open');o.querySelector('.faq-q').setAttribute('aria-expanded','false');o.querySelector('.faq-a').hidden=true;});q.setAttribute('aria-expanded',String(!open));a.hidden=open;item.classList.toggle('is-open',!open);});
  });
  function hrefFor(ch,v){if(!v)return '';if(ch==='phone')return 'tel:'+v.replace(/\s+/g,'');if(ch==='email')return 'mailto:'+v;if(ch==='whatsapp')return 'https://wa.me/'+v.replace(/\D/g,'');if(ch==='telegram')return /^https:\/\//.test(v)?v:'https://t.me/'+v.replace(/^@/,'');if(ch==='line')return /^https:\/\//.test(v)?v:'https://line.me/R/ti/p/'+encodeURIComponent(v);return /^https:\/\//.test(v)?v:'';}
  document.querySelectorAll('[data-contact]').forEach(function(el){var ch=el.dataset.contact,v=window.MIIDEAR_CONTACT[ch],href=hrefFor(ch,v);if(href){el.href=href;if(el.closest('.info-row'))el.textContent=v;}else{var row=el.closest('.info-row');if(row)row.hidden=true;else el.hidden=true;}});
  var empty=document.getElementById('contactEmpty');if(empty)empty.hidden=Object.keys(window.MIIDEAR_CONTACT).some(function(k){return !!window.MIIDEAR_CONTACT[k];});
  var social=document.getElementById('socialRow');if(social&&!social.querySelector('a:not([hidden])'))social.parentElement.hidden=true;
  function study(c,v){return window.MiidearStudy?window.MiidearStudy(c.theme,v):'<div class="ph ph--portrait"></div>';}
  var grid=document.getElementById('featuredGrid');if(grid)grid.innerHTML=window.MIIDEAR_DATA.featured.map(function(c,i){return '<article class="collection-card">'+study(c,i)+'<div class="collection-card__body"><h3 class="collection-card__name">'+c.name+'</h3><p class="collection-card__couple">'+c.description+'</p><button class="link-arrow" data-open-gallery="featured" data-index="'+i+'" aria-label="Explore '+c.name+' design study">Explore this study</button></div></article>';}).join('');
  document.querySelectorAll('.rail[data-gallery]').forEach(function(rail){
    var key=rail.dataset.gallery;rail.id='gallery-'+key;rail.setAttribute('aria-label',key+' design studies');rail.tabIndex=0;
    rail.innerHTML=(window.MIIDEAR_DATA[key]||[]).map(function(c,i){return '<article class="rail-card">'+study(c,i)+'<div class="rail-card__body"><h3 class="rail-card__couple">'+c.name+'</h3><p class="collection-card__couple">Illustrative design study</p><button class="link-arrow" data-open-gallery="'+key+'" data-index="'+i+'" aria-label="Explore '+c.name+' design study">Explore this study</button></div></article>';}).join('');
    var controls=document.createElement('div');controls.className='rail-controls';controls.innerHTML='<button type="button" aria-label="Previous '+key+' studies" aria-controls="'+rail.id+'">‹</button><button type="button" aria-label="Next '+key+' studies" aria-controls="'+rail.id+'">›</button>';rail.after(controls);var buttons=controls.querySelectorAll('button');
    function update(){buttons[0].disabled=rail.scrollLeft<=2;buttons[1].disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-2;}
    buttons.forEach(function(b,i){b.addEventListener('click',function(){rail.scrollBy({left:(i?1:-1)*rail.clientWidth*.8,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});});rail.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);update();
  });
  document.addEventListener('click',function(e){var b=e.target.closest('[data-open-gallery]');if(!b)return;var c=(window.MIIDEAR_DATA[b.dataset.openGallery]||[])[Number(b.dataset.index)];if(c&&window.MiidearLightbox)window.MiidearLightbox.open(c);});
  if('serviceWorker' in navigator&&!['localhost','127.0.0.1'].includes(location.hostname))window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){});});
})();
