/* Original native-scroll choreography informed by the audited Codrops studies. */
(function(){
  'use strict';
  let cleanup=()=>{};
  window.MiiAtelier={mount(doc){
    cleanup();if(doc.theme!=='grand')return;
    const hero=document.querySelector('.grand-hero'),main=document.getElementById('invitation'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const stage=document.createElement('div');stage.className='atelier-stage';
    while(hero.firstChild)stage.append(hero.firstChild);hero.append(stage);hero.classList.add('atelier-film');
    const story=document.createElement('section');story.className='atelier-story';story.setAttribute('aria-label','Our next chapter');
    story.innerHTML='<div class="atelier-story-stage"><div class="atelier-story-art" aria-hidden="true"></div><div class="atelier-story-foreground" aria-hidden="true"></div><div class="atelier-story-copy"><p class="atelier-small">A new chapter</p><h2>Some days<br><em>change everything.</em></h2><p class="atelier-story-text"></p></div><div class="atelier-story-paper" aria-hidden="true"></div></div>';
    story.querySelector('.atelier-story-text').textContent=doc.settings.story;document.getElementById('dayDetails').before(story);
    const headings=[...main.querySelectorAll('.invitation-section h2')];
    // Split by words, never by glyph: preserve the joining strokes of calligraphy.
    const originals=headings.map(h=>h.innerHTML);
    headings.forEach(h=>{const walker=document.createTreeWalker(h,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);let index=0;nodes.forEach(n=>{if(!n.textContent.trim())return;const fragment=document.createDocumentFragment();for(const word of n.textContent.split(/(\s+)/)){if(!word)continue;if(!word.trim()){fragment.append(document.createTextNode(word));continue;}const span=document.createElement('span');span.className='atelier-word';span.textContent=word;span.style.setProperty('--word-delay',index++*70+'ms');fragment.append(span);}n.replaceWith(fragment);});});
    const observed=[...document.querySelectorAll('.atelier-story,.invitation-section')];
    const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('atelier-entered');}),{threshold:.08});observed.forEach(el=>observer.observe(el));
    let frame=0;
    function still(){return reduced.matches||document.body.classList.contains('ceremony-still')||document.body.classList.contains('instant-invitation')||document.body.classList.contains('ceremony-keyboard');}
    const clamp=n=>Math.max(0,Math.min(1,n));
    function update(){frame=0;const quiet=still();if(document.body.classList.contains('atelier-static')!==quiet)document.body.classList.toggle('atelier-static',quiet);const vh=innerHeight;
      const h=hero.getBoundingClientRect(),hp=quiet?0:clamp(-h.top/(h.height-vh));
      hero.style.setProperty('--journey',hp);
      const hs=hero.querySelector('.grand-hero-scene');hs.style.clipPath=quiet?'none':'inset('+((1-hp)*5)+'% '+((1-hp)*16)+'% 0 round '+((1-hp)*42)+'% '+((1-hp)*42)+'% 0 0)';
      hs.style.transform=quiet?'none':'scale('+(1.08-hp*.08)+')';
      hero.querySelector('.grand-hero-copy').style.transform=quiet?'none':'translate3d(0,'+(-hp*65)+'px,0)';
      const r=story.getBoundingClientRect(),p=quiet?.45:clamp((vh-r.top)/(r.height+vh));
      story.style.setProperty('--story-progress',p);story.querySelector('.atelier-story-art').style.transform=quiet?'none':'scale('+(1.14-p*.14)+')';
      story.querySelector('.atelier-story-foreground').style.transform=quiet?'none':'translate3d(0,'+((.5-p)*100)+'px,0)';
      story.querySelector('.atelier-story-paper').style.transform=quiet?'translateY(100%)':'translateY('+(100-clamp((p-.47)/.3)*100)+'%)';
      for(const section of document.querySelectorAll('.invitation-section')){const sr=section.getBoundingClientRect();if(sr.bottom>0&&sr.top<vh)section.style.setProperty('--chapter-shift',quiet?'0px':((sr.top-vh/2)*.045)+'px');}
    }
    function schedule(){if(!frame)frame=requestAnimationFrame(update);}
    const mutations=new MutationObserver(schedule);mutations.observe(document.body,{attributes:true,attributeFilter:['class']});
    window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);reduced.addEventListener('change',schedule);schedule();
    cleanup=()=>{observer.disconnect();mutations.disconnect();cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);reduced.removeEventListener('change',schedule);story.remove();headings.forEach((h,i)=>h.innerHTML=originals[i]);document.body.classList.remove('atelier-static');};
  }};
})();
