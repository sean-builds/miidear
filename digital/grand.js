/* The Grand Conservatory: original ornament, editable suites and a theatrical entry. */
(function(){
  'use strict';
  const C=Mii,A=MiiArt,D=MiiDesign,F=fabric;
  const palette={paper:'#f8f1e3',ink:'#183b46',gold:'#bb9754',sage:'#708a7a',blush:'#d1b3a5',blue:'#b8ced3'};
  function cartouche(color='#bb9754'){
    const scroll='<path d="M-93-93C-149-121-164-44-117-49C-82-54-123-91-130-68M-117-49Q-145-9-110 21M-110 21C-159 8-148 69-119 55C-96 43-130 32-132 48M-117 67Q-109 108-69 123M-69 123C-118 144-66 175-56 143Q-53 131-68 132"/>';
    const top='<path d="M0-162C-18-184-19-197 0-210C19-197 18-184 0-162ZM0-167V-145M-5-173C-52-210-85-173-59-155C-33-139-29-177-53-172M5-173C52-210 85-173 59-155C33-139 29-177 53-172M-69-147Q-47-135-28-143M69-147Q47-135 28-143"/>';
    return A.svg('<g transform="translate(200 216)" fill="none" stroke="'+color+'" stroke-linecap="round" stroke-linejoin="round"><path d="M0-149C47-150 67-124 92-110C126-92 122-27 112 17C103 64 115 98 73 126Q36 150 0 166Q-36 150-73 126C-115 98-103 64-112 17C-122-27-126-92-92-110C-67-124-47-150 0-149Z" stroke-width="1.8"/><path d="M0-140C47-141 61-115 85-101C117-83 112-29 103 17C93 66 105 92 67 117Q33 140 0 157Q-33 140-67 117C-105 92-93 66-103 17C-112-29-117-83-85-101C-61-115-47-141 0-140Z" opacity=".6" stroke-width=".7"/><g stroke-width="1.5">'+scroll+'<g transform="scale(-1 1)">'+scroll+'</g>'+top+'<g transform="translate(0 4) scale(1 -1)">'+top+'</g></g><g fill="'+color+'" stroke="none"><path d="M-131-98q-18-7-18-26q20 1 18 26M-143-18q-23-4-24-24q22-1 24 24M-137 78q-25 7-30-13q24-10 30 13M131-98q18-7 18-26q-20 1-18 26M143-18q23-4 24-24q-22-1-24 24M137 78q25 7 30-13q-24-10-30 13" opacity=".65"/><circle cy="-147" r="3"/><circle cy="166" r="3"/></g></g>',400,440);
  }
  function border(color='#bb9754'){
    let out='<g fill="none" stroke="'+color+'" stroke-linecap="round"><path d="M350 29C430 31 460 73 620 73Q628 125 660 141V857Q626 873 619 925C462 925 428 970 350 971C272 970 238 925 81 925Q74 873 40 857V141Q73 125 80 73C240 73 270 31 350 29Z" stroke-width="1.2"/><path d="M350 39C430 41 460 83 610 83Q618 133 650 151V847Q616 863 609 915C462 915 428 960 350 961C272 960 238 915 91 915Q84 863 50 847V151Q83 133 90 83C240 83 270 41 350 39Z" stroke-width=".5"/>';
    const motif='<path d="M0 0C-31-36-68-20-55-1C-41 20-15-8-36-12M0 0C31-36 68-20 55-1C41 20 15-8 36-12M0 0Q-14-27 0-48Q14-27 0 0M-5-4Q-30-46-48-33M5-4Q30-46 48-33M-60 2Q-84 12-105-1M60 2Q84 12 105-1"/>';
    out+='<g transform="translate(350 90)">'+motif+'</g><g transform="translate(350 910) rotate(180)">'+motif+'</g>';
    for(const [x,y,r] of [[66,151,0],[634,151,90],[634,849,180],[66,849,270]])out+='<g transform="translate('+x+' '+y+') rotate('+r+')"><path d="M0 0Q15 34 44 19C71 3 39-27 29-8Q23 4 37 5M-1 5Q-5 43 19 58M4 5Q40 4 49-18"/><path d="M3 7Q-14 24-12 44Q8 39 3 7" fill="'+color+'" opacity=".3"/></g>';
    return A.svg(out+'</g>',700,1000);
  }
  function gate(){
    let bars='';for(let i=0;i<6;i++){const x=27+i*45;bars+='<path d="M'+x+' 133V738" stroke-width="1"/><path d="M'+x+' 140l-6 14 6-4 6 4Z" fill="currentColor"/>';}
    return A.svg('<g fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 780V154C13 70 117 18 299 18V780Z"/><path d="M24 766V155C24 79 121 31 286 31V766Z" opacity=".6"/><path d="M13 175H299M13 188H299M13 654H299M13 666H299M13 741H299M13 751H299"/>'+bars+'<path d="M28 115Q110 43 285 43M46 128Q109 76 285 63M155 201C63 230 55 340 153 346C237 352 249 237 158 245C94 251 111 316 153 309C184 304 180 270 158 276M155 346C72 394 62 498 158 505C246 511 249 407 164 413C109 418 116 482 156 474C186 468 180 443 161 448M155 506C77 540 70 631 156 637C235 644 243 551 164 552C122 553 117 606 154 608M25 680Q155 762 286 680M25 721Q155 640 286 721"/><g stroke-width=".8" opacity=".65"><path d="M21 204L284 640M21 640L284 204M21 334L218 654M88 190L285 510M21 510L218 190M88 654L285 334"/></g></g>',312,800);
  }
  A.library.unshift({key:'grand-frame',name:'The grand floral arch',category:'Watercolor',image:'assets/grand-floral-frame.webp',width:1024,height:1536},{key:'grand-scene',name:'The candlelit conservatory',category:'Scenes',image:'assets/grand-conservatory-scene.webp',width:1672,height:941},{key:'grand-cartouche',name:'Heirloom gold cartouche',category:'Frames',svg:()=>cartouche()},{key:'grand-border',name:'Palace invitation border',category:'Frames',svg:()=>border()});
  D.themes.unshift({key:'grand',name:'The Grand Conservatory',description:'Palace gardens, sculpted florals & heirloom gold',paper:palette.paper,ink:palette.ink,gold:palette.gold});
  const previousTemplate=D.template;
  async function template(){
    const doc=C.blank('The Grand Conservatory');doc.theme='grand';doc.colors={...palette};
    const c=new F.StaticCanvas(null,{width:700,height:2700,backgroundColor:palette.paper,renderOnAddRemove:false});
    const text=(value,x,y,size,extra={})=>{const o=D.text(value,x,y,size,{fill:palette.ink,width:390,...extra});c.add(o);return o;};
    async function canopy(top){const o=await D.artwork('grand-frame');o.set({width:1024,height:1250,cropX:0,cropY:0,name:'Flowing floral canopy'});o.scaleToWidth(700);o.set({left:350,top:top+o.getScaledHeight()/2,originX:'center',originY:'center'});c.add(o);}
    const options={first:'P',second:'K',font:'Pinyon Script',frame:'regal',color:palette.ink,frameColor:palette.gold,spacing:-15},mono=await A.monogram(options);
    await canopy(0);
    c.add(D.place(await D.svgObject(mono,'Your heirloom monogram',{monogramOptions:options}),350,185,165));
    text('Together with our families',350,300,21,{binding:'hosts',width:360});
    text('Paope',350,364,88,{binding:'first',fontFamily:'Pinyon Script',width:420});
    text('&',350,463,27,{fill:palette.gold,fontStyle:'italic'});
    text('Kawin',350,508,88,{binding:'second',fontFamily:'Pinyon Script',width:420});
    text('request the pleasure of your company\nat the celebration of their marriage',350,650,21,{width:350,lineHeight:1.4});
    text('Saturday, 20 February 2027',350,745,26,{binding:'date',width:400});text('The Glasshouse',350,798,23,{binding:'venue',width:350});
    const scene=await D.artwork('grand-scene');scene.scaleToHeight(1000);scene.set({left:350,top:1350,originX:'center',originY:'center'});c.add(scene);
    c.add(D.identify(new F.Rect({left:0,top:850,width:700,height:1000,fill:'#071d2b',opacity:.32}),'Evening atmosphere'));
    function fade(name,left,top,width,height,from,to,vertical=true){const gradient=new F.Gradient({type:'linear',coords:{x1:0,y1:0,x2:vertical?0:width,y2:vertical?height:0},colorStops:[{offset:0,color:palette.paper,opacity:from},{offset:1,color:palette.paper,opacity:to}]});c.add(D.identify(new F.Rect({left,top,width,height,fill:gradient,strokeWidth:0}),name));}
    fade('Paper into the evening',0,850,700,200,1,0);fade('Evening into the garden',0,1670,700,180,0,1);
    fade('Soft evening edge, left',0,850,90,1000,1,0,false);fade('Soft evening edge, right',610,850,90,1000,0,1,false);
    const shadow=new F.Shadow({color:'rgba(0,0,0,.65)',blur:9,offsetY:2});
    text('Where forever begins.',350,1100,65,{fontFamily:'Pinyon Script',fill:'#fffaf1',width:530,shadow});
    text(doc.settings.story,350,1270,31,{binding:'story',fill:'#fffaf1',width:430,lineHeight:1.5,shadow});
    c.add(D.identify(new F.Rect({left:123,top:1480,width:454,height:214,fill:'#fffaf1',opacity:.96,rx:2}),'The ceremony details'));
    c.add(D.identify(new F.Rect({left:132,top:1489,width:436,height:196,fill:'transparent',stroke:palette.gold,strokeWidth:.7}),'Ceremony gold rule'));
    text('The ceremony',350,1508,23,{fontStyle:'italic'});text('17:00',350,1547,44,{binding:'time'});text('The Glasshouse',350,1616,25,{binding:'venue'});
    await canopy(1830);fade('The garden settles into the paper',0,2560,700,140,0,1);
    c.add(D.place(await D.svgObject(mono,'Your heirloom monogram',{monogramOptions:options}),350,2000,155));
    text('The best part of our day',350,2175,35,{fontFamily:'Italiana',width:390});text('will be you.',350,2237,80,{fontFamily:'Pinyon Script',width:390});
    text('A table full of stories.\nA garden full of music.\nEveryone we love, together.',350,2380,23,{width:320,lineHeight:1.65});
    text('We saved a place for you.',350,2550,24,{fontStyle:'italic',width:280});
    c.renderAll();doc.pages=[{id:C.uid(),name:'Your flowing invitation',width:700,height:2700,background:palette.paper,canvas:D.serialize(c)}];await c.dispose();return C.validate(doc);
  }
  D.template=(key='grand')=>key==='grand'?template():previousTemplate(key);
  function cover(){return '<div class="grand-backdrop" aria-hidden="true"></div><div class="grand-cover-heading"><span>A wedding invitation</span><span id="arrivalDate"></span></div><div class="grand-gates"><div class="gate-leaf gate-left" aria-hidden="true">'+gate()+'</div><div class="gate-leaf gate-right" aria-hidden="true">'+gate()+'</div><div class="gate-letter"><div id="arrivalMonogram" class="arrival-monogram"></div><h1 id="arrivalNames"></h1><p>request the pleasure of your company</p></div><button class="wax-seal" id="openInvitation" aria-label="Open your wedding invitation"><span id="sealInitials"></span><small>OPEN</small></button><button class="open-letter" id="openLetter">Open our celebration <span>↓</span></button><img class="gate-florals" src="'+C.asset('assets/grand-floral-frame.webp')+'" alt="" aria-hidden="true"></div><p class="grand-cover-foot">Some days are meant to be unforgettable.</p>';}
  function hero(doc){const s=doc.settings,names=s.names.split(/\s*(?:&| and )\s*/i);return '<section class="grand-hero" aria-label="'+C.escape(s.names)+' wedding"><div class="grand-hero-scene" aria-hidden="true"></div><div class="grand-hero-copy"><p>'+C.escape(s.hosts)+'</p><h1><span>'+C.escape(names[0])+'</span>'+(names[1]?'<em>&</em><span>'+C.escape(names.slice(1).join(' & '))+'</span>':'')+'</h1><p>invite you to celebrate their wedding</p><div class="grand-hero-details"><span>'+C.escape(C.weddingDate(doc))+'</span><i></i><span>'+C.escape(s.venue)+'</span></div></div><a class="grand-scroll" href="#pages">Our invitation <span>↓</span></a></section>';}
  window.MiiGrand={palette,cartouche,border,gate,template,cover,hero};
})();
