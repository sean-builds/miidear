/* Ceremonial depth, native scrolling, and one-time chapter choreography. */
(function(){
  'use strict';
  let dispose=()=>{};
  window.MiiCeremony={mount(){
    dispose();
    if(!document.body.classList.contains('grand-invitation'))return;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)'),arrival=document.getElementById('arrival');
    const decor=document.createElement('div');decor.className='ceremony-atmosphere';decor.setAttribute('aria-hidden','true');
    decor.innerHTML='<div class="ceremony-light"></div><div class="ceremony-silk silk-left"></div><div class="ceremony-silk silk-right"></div>';
    arrival.append(decor);
    const original=arrival.querySelector('.gate-florals'),copies=[];
    if(original)for(const side of ['left','right']){const copy=original.cloneNode();copy.classList.add('ceremony-floral', 'floral-'+side);copy.alt='';original.after(copy);copies.push(copy);}
    document.body.classList.add('ceremony-ready');
    const motionControl=document.createElement('button');motionControl.type='button';motionControl.className='motion-control';motionControl.textContent='Motion on';motionControl.setAttribute('aria-label','Turn off decorative motion');motionControl.setAttribute('aria-pressed','true');arrival.after(motionControl);
    const ornaments=[];document.querySelectorAll('.invitation-section').forEach(section=>{const el=document.createElement('div');el.className='chapter-ornament';el.setAttribute('aria-hidden','true');el.innerHTML=MiiGrand.cartouche('#9b7b45');section.prepend(el);ornaments.push(el);});
    const targets=[...document.querySelectorAll('.chapter-ornament,.opening-note>*,.invitation-section>.section-number,.invitation-section>h2,.venue-name,.venue-address,.day-actions,.day-countdown,.timeline-event,.dress-code,.dress-section>.section-copy,.dress-color,.palette-footnote,.rsvp-inner,.invitation-footer>div,.invitation-footer>p')];
    targets.forEach((el,i)=>{el.classList.add('ceremony-reveal');el.style.setProperty('--reveal-delay',((el.classList.contains('dress-color')||el.classList.contains('timeline-event'))?i%4*85:0)+'ms');});
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('ceremony-seen');observer.unobserve(entry.target);}}),{threshold:.12,rootMargin:'0px 0px -25px 0px'});
    targets.forEach(el=>observer.observe(el));
    let frame=0,enabled=!reduced.matches;
    const scene=document.querySelector('.grand-hero-scene');
    function update(){frame=0;if(!enabled||document.body.classList.contains('instant-invitation'))return;const hero=document.querySelector('.grand-hero');if(hero&&scene){const r=hero.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)scene.style.transform='translate3d(0,'+Math.min(28,Math.max(0,-r.top*.045))+'px,0) scale(1.045)';}}
    function scroll(){if(!frame)frame=requestAnimationFrame(update);}
    function preference(){document.body.classList.toggle('ceremony-still',!enabled);motionControl.textContent=enabled?'Motion on':'Motion off';motionControl.setAttribute('aria-pressed',String(enabled));motionControl.setAttribute('aria-label',enabled?'Turn off decorative motion':'Turn on decorative motion');if(!enabled&&scene)scene.style.transform='none';scroll();}
    motionControl.onclick=()=>{enabled=!enabled;preference();};
    function changed(){enabled=!reduced.matches;preference();}
    function keyboard(e){if(e.key==='Tab'||e.key==='Enter'){document.body.classList.add('ceremony-keyboard');}}
    window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('keydown',keyboard);reduced.addEventListener('change',changed);preference();
    dispose=()=>{observer.disconnect();cancelAnimationFrame(frame);window.removeEventListener('scroll',scroll);window.removeEventListener('keydown',keyboard);reduced.removeEventListener('change',changed);ornaments.forEach(el=>el.remove());decor.remove();copies.forEach(el=>el.remove());motionControl.remove();document.body.classList.remove('ceremony-ready','ceremony-still','ceremony-keyboard');};
  }};
})();
