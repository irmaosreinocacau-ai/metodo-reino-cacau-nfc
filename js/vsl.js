// VSL: botão de play com som; depois mostra os controles nativos
(function(){
  var v=document.getElementById('vsl'),b=document.getElementById('vsl-play');
  if(!v||!b) return;
  b.addEventListener('click',function(){v.controls=true;b.remove();var p=v.play();if(p&&p.catch)p.catch(function(){});
    try{if(window.fbq)fbq('trackCustom','VSLPlay');}catch(e){}});
  v.addEventListener('play',function(){v.controls=true;if(b.parentNode)b.remove();});
})();
