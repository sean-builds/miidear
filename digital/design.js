/* Shared Fabric document renderer and editable templates. P01–P14, P23–P38. */
(function(){
  'use strict';
  const C=Mii,A=MiiArt,F=fabric;
  F.FabricObject.customProperties=['id','name','binding','assetKey','monogramOptions','role','originalSource'];
  F.FabricObject.ownDefaults.cornerColor='#ffffff';F.FabricObject.ownDefaults.cornerStrokeColor='#527a99';F.FabricObject.ownDefaults.borderColor='#527a99';F.FabricObject.ownDefaults.cornerStyle='circle';F.FabricObject.ownDefaults.transparentCorners=false;F.FabricObject.ownDefaults.cornerSize=9;
  let fontPromise;
  function fonts(){if(!fontPromise)fontPromise=Promise.all(['400 20px "Cormorant Garamond"','400 20px "Pinyon Script"','400 20px "Italiana"','400 20px "Jost"'].map(f=>document.fonts.load(f)));return fontPromise;}
  const fontLoads=new Map();
  function ensureFont(name){if(!C.fonts.some(([f])=>f===name))return Promise.resolve();if(fontLoads.has(name))return fontLoads.get(name);const promise=(async()=>{if(!['Cormorant Garamond','Pinyon Script','Italiana','Jost','Great Vibes'].includes(name)){await new Promise((resolve,reject)=>{const link=document.createElement('link');link.rel='stylesheet';link.href='https://fonts.googleapis.com/css2?family='+encodeURIComponent(name)+'&display=swap';link.onload=resolve;link.onerror=()=>reject(Error('This font could not load.'));document.head.append(link);});}await document.fonts.load('400 30px "'+name+'"');})();fontLoads.set(name,promise);return promise;}
  function identify(object,name,extra={}){object.set({id:C.uid(),name,...extra});return object;}
  function text(value,x,y,size=28,extra={}){return identify(new F.Textbox(value,{left:x,top:y,width:560,fontFamily:'Cormorant Garamond',fontSize:size,fill:C.colors.ink,textAlign:'center',lineHeight:1.2,originX:'center',...extra}),extra.name||value.slice(0,30),{binding:extra.binding||'',role:extra.role||'ink'});}
  async function svgObject(source,name,options={}){const result=await F.loadSVGFromString(source);const group=F.util.groupSVGElements(result.objects.filter(Boolean),result.options);return identify(group,name,options);}
  async function artwork(key,options={}){const entry=A.library.find(e=>e.key===key);if(!entry)throw Error('This artwork is unavailable.');let o;if(entry.image){o=await F.FabricImage.fromURL(C.asset(entry.image),{crossOrigin:'anonymous'});}else{o=await svgObject(entry.svg(),entry.name);}identify(o,entry.name,{assetKey:key,...options});return o;}
  function place(object,x,y,width,extra={}){object.set({left:x,top:y,originX:'center',originY:'center',...extra});object.scaleToWidth(width);return object;}
  function bindCanvas(canvas,doc){canvas.getObjects().forEach(function walk(o){if(o.binding){o.set('text',C.bind(doc,o.binding,o.text));o.initDimensions?.();}if(o.getObjects)o.getObjects().forEach(walk);});canvas.requestRenderAll();}
  function prepareJSON(json,doc){const data=C.clone(json);C.visit(data.objects,o=>{if(o.assetKey){const entry=A.library.find(e=>e.key===o.assetKey);if(entry?.image)o.src=C.asset(entry.image);}if(o.binding)o.text=C.bind(doc,o.binding,o.text);});return data;}
  function serialize(canvas){const data=canvas.toObject();C.visit(data.objects,o=>{if(o.assetKey&&A.library.find(e=>e.key===o.assetKey)?.image)delete o.src;});return data;}
  async function renderPage(canvas,page,doc){await fonts();const families=new Set();C.visit(page.canvas.objects,o=>{if(o.fontFamily)families.add(o.fontFamily);});await Promise.all([...families].map(ensureFont));await canvas.loadFromJSON(prepareJSON(page.canvas,doc));canvas.setDimensions({width:page.width,height:page.height});canvas.backgroundColor=page.background||doc.colors.paper;bindCanvas(canvas,doc);canvas.requestRenderAll();}
  const themes=[{key:'conservatory',name:'The Conservatory',description:'Watercolour roses & engraved blue',paper:'#faf7f0',ink:'#294760',gold:'#a18a54'},{key:'toile',name:'Blue Reverie',description:'Botanical toile & porcelain ink',paper:'#f4f6f5',ink:'#365874',gold:'#8c9fad'},{key:'nocturne',name:'Midnight in Bloom',description:'Night-blue silk & warm gold',paper:'#182e42',ink:'#f1e7d1',gold:'#c7ae77'},{key:'rose',name:'The Rose Letter',description:'Blush petals & romantic calligraphy',paper:'#f6eeea',ink:'#714d52',gold:'#a78d77'},{key:'modern',name:'A Modern Promise',description:'Sculptural type & considered space',paper:'#eee9df',ink:'#354438',gold:'#8e947a'},{key:'emerald',name:'Emerald Garden',description:'Deep green & an heirloom crest',paper:'#203b34',ink:'#f2ecdd',gold:'#c7b17d'}];
  function frame(width,height,color,inset=35){return identify(new F.Rect({left:inset,top:inset,width:width-inset*2,height:height-inset*2,fill:'transparent',stroke:color,strokeWidth:.8,rx:Math.min(width/2,145),ry:145}),'Engraved border',{role:'gold'});}
  async function template(key='conservatory'){
    const theme=themes.find(t=>t.key===key)||themes[0],doc=C.blank(theme.name);doc.theme=theme.key;doc.colors={...doc.colors,paper:theme.paper,ink:theme.ink,gold:theme.gold};doc.pages=[];
    const mono=await A.monogram({color:theme.ink,frame:theme.key==='emerald'?'crest':'wreath'});
    for(let index=0;index<3;index++){
      const canvas=new F.StaticCanvas(null,{width:C.WIDTH,height:C.HEIGHT,backgroundColor:theme.paper,renderOnAddRemove:false});const ink=theme.ink,gold=theme.gold;
      const addText=(value,x,y,size,extra={})=>{const o=text(value,x,y,size,{fill:ink,...extra});canvas.add(o);return o;};
      if(index===0){
        if(theme.key==='conservatory'||theme.key==='rose'){
          canvas.add(place(await artwork('watercolor'),15,620,300,{angle:-5,opacity:theme.key==='rose'?.9:.95}));
          canvas.add(place(await artwork('watercolor'),690,480,245,{angle:180,flipX:true,opacity:.8}));
        }else if(theme.key==='toile'){canvas.add(place(await artwork('toile'),350,500,700,{opacity:.62}));}
        else {canvas.add(frame(700,1000,gold,35));canvas.add(frame(700,1000,gold,44));canvas.add(place(await artwork('branch'),82,775,160,{opacity:.4,angle:-22}));canvas.add(place(await artwork('branch'),618,775,160,{opacity:.4,angle:22,flipX:true}));}
        if(theme.key==='modern'){
          addText('The wedding of',350,113,25,{fontFamily:'Jost',charSpacing:65});
          addText('Paope',350,215,98,{binding:'first',fontFamily:'Italiana'});addText('&',350,349,37,{fontStyle:'italic',fill:gold});addText('Kawin',350,399,98,{binding:'second',fontFamily:'Italiana'});
          canvas.add(place(await svgObject(mono,'Your monogram',{monogramOptions:{first:'P',second:'K',color:ink,frame:'wreath'}}),350,670,185));
        }else{
          canvas.add(place(await svgObject(mono,'Your monogram',{monogramOptions:{first:'P',second:'K',color:ink,frame:'wreath'}}),350,191,210));
          addText(doc.settings.hosts,350,329,23,{binding:'hosts'});
          addText('Paope',350,392,82,{binding:'first',fontFamily:theme.key==='toile'?'Italiana':'Pinyon Script'});addText('&',350,487,30,{fill:gold,fontStyle:'italic'});addText('Kawin',350,526,82,{binding:'second',fontFamily:theme.key==='toile'?'Italiana':'Pinyon Script'});
        }
        addText('invite you to celebrate their wedding',350,theme.key==='modern'?795:657,23);
        addText('Saturday, 20 February 2027',350,theme.key==='modern'?850:714,28,{binding:'date'});
        addText('The Glasshouse',350,theme.key==='modern'?905:763,24,{binding:'venue',charSpacing:20});
        if(theme.key!=='modern')canvas.add(place(await artwork('flourish'),350,834,120));
        addText('A celebration of love, in full bloom.',350,927,19,{fontStyle:'italic',opacity:.8});
      }
      if(index===1){
        canvas.add(place(await svgObject(A.conservatory(ink),'Engraved garden conservatory',{assetKey:'conservatory'}),350,220,605,{opacity:.88}));
        addText('A day, made for us.',350,478,62,{fontFamily:theme.key==='modern'?'Italiana':'Pinyon Script'});
        addText(doc.settings.story,350,585,28,{binding:'story',width:480,lineHeight:1.45});
        addText('The ceremony',350,731,20,{fontFamily:'Jost',charSpacing:100});addText('17:00',350,772,42,{binding:'time'});addText('The Glasshouse',350,837,27,{binding:'venue'});
        canvas.add(place(await artwork('flourish'),350,928,160));
      }
      if(index===2){
        if(theme.key==='conservatory'||theme.key==='rose')canvas.add(place(await artwork('watercolor'),25,590,310,{angle:5}));
        else{canvas.add(place(await artwork('branch'),140,550,320,{opacity:.38}));canvas.add(place(await artwork('branch'),560,550,320,{opacity:.38,flipX:true}));}
        canvas.add(place(await svgObject(mono,'Your monogram',{monogramOptions:{first:'P',second:'K',color:ink}}),350,235,200));
        addText('Some things are',350,426,35,{fontFamily:'Italiana'});addText('better together.',350,481,64,{fontFamily:'Pinyon Script'});
        addText('Good food. Familiar faces.\nA dance floor full of our favourite people.',350,615,26,{width:455,lineHeight:1.5});
        addText('We saved a place for you.',350,797,37,{fontStyle:'italic'});canvas.add(place(await artwork('ribbon'),350,895,140));
      }
      canvas.renderAll();doc.pages.push({id:C.uid(),name:['The invitation','The celebration','A place for you'][index],width:C.WIDTH,height:C.HEIGHT,background:theme.paper,canvas:serialize(canvas)});await canvas.dispose();
    }
    return doc;
  }
  window.MiiDesign={fonts,ensureFont,identify,text,svgObject,artwork,place,bindCanvas,prepareJSON,serialize,renderPage,themes,template};
})();
