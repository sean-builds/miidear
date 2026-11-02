(function(){
  'use strict';
  const C=Mii;let clockOffset=0;
  const supplied=/\/digitalbuild\/?$/.test(location.pathname)?'':new URLSearchParams(location.hash.slice(1)).get('service');
  const valid=value=>/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(value||'');
  function endpoint(){let stored='';try{stored=localStorage.getItem('miidear-invitation-service')||'';}catch(_){}const configured=(window.MIIDEAR_CONFIG||{}).INVITATION_API_URL;return valid(supplied)?supplied:valid(configured)?configured:valid(stored)?stored:'';}
  function configure(value){const clean=value.trim();if(clean&&!valid(clean))throw Error('Use the Google service address ending in /exec.');localStorage.setItem('miidear-invitation-service',clean);}
  async function session(){const result=await window.MiidearDB?.getSession();return result?.data?.session||null;}
  async function call(action,payload={},admin=false){
    const url=endpoint();if(!url){const error=Error('Online replies are not connected yet. Your design is safe on this device.');error.code='NOT_CONNECTED';throw error;}
    let accessToken;if(admin){const s=await session();if(!s){const e=Error('Sign in before saving online or publishing.');e.code='AUTH';throw e;}accessToken=s.access_token;}
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),55000);
    try{const response=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},credentials:'omit',cache:'no-store',body:JSON.stringify({action,...payload,accessToken}),signal:controller.signal});if(!response.ok)throw Error('The invitation service is unavailable. Try again shortly.');let result;try{result=await response.json();}catch(_){throw Error('The invitation service needs its Google deployment checked. Your local design is safe.');}if(result.serverTime)clockOffset=Date.parse(result.serverTime)-Date.now();if(!result.ok){const error=Error(result.message||'This request could not be completed.');error.code=result.code;throw error;}return result.data;}catch(e){if(e.name==='AbortError')throw Error('The request took too long. Refresh to check whether it was saved before trying again.');throw e;}finally{clearTimeout(timer);}
  }
  function link(kind,id,token){const url=new URL(C.route(kind));url.searchParams.set('id',id);const hash=new URLSearchParams();if(endpoint())hash.set('service',endpoint());if(token)hash.set(kind==='digitaldashboard'?'access':'guest',token);url.hash=hash.toString();return url.href;}
  window.MiiService={endpoint,configure,session,call,link,now:()=>Date.now()+clockOffset};
})();
