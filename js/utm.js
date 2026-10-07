// Repassa UTMs e fbclid da URL da LP para o checkout da Hubla (rastreamento das campanhas)
(function(){
  try{
    var q=new URLSearchParams(location.search), keep=new URLSearchParams();
    q.forEach(function(v,k){ if(/^utm_|^fbclid$|^src$|^sck$/.test(k)) keep.set(k,v); });
    var s=keep.toString(); if(!s) return;
    document.querySelectorAll('.js-checkout').forEach(function(a){
      a.href += (a.href.indexOf('?')>-1?'&':'?') + s;
    });
  }catch(e){}
})();
