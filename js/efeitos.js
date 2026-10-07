(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  // barra de progresso
  var bar=document.getElementById('progress');
  function prog(){var h=document.documentElement;var p=h.scrollTop/((h.scrollHeight-h.clientHeight)||1);bar.style.width=(p*100)+'%';}
  addEventListener('scroll',prog,{passive:true});prog();
  // revelar ao rolar (só o que está abaixo da primeira tela)
  var els=[].slice.call(document.querySelectorAll('.rv-t'));
  if(!reduce&&'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12});
    els.forEach(function(el){if(el.getBoundingClientRect().top>innerHeight){el.classList.add('rv');io.observe(el);}});
    setTimeout(function(){els.forEach(function(el){el.classList.add('in');});},6000);
  }
  // contadores
  var cs=[].slice.call(document.querySelectorAll('[data-count]'));
  function run(el){var t=+el.dataset.count,p=el.dataset.prefix||'',s=el.dataset.suffix||'',st=null;
    function f(ts){if(!st)st=ts;var k=Math.min(1,(ts-st)/1400);k=1-Math.pow(1-k,3);el.textContent=p+Math.round(t*k)+s;if(k<1)requestAnimationFrame(f);}requestAnimationFrame(f);}
  if(!reduce&&'IntersectionObserver' in window){var io2=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){run(e.target);io2.unobserve(e.target);}});},{threshold:.6});cs.forEach(function(c){io2.observe(c);});}
  // carrossel
  var m=document.getElementById('modules');
  document.querySelectorAll('.nav-btn').forEach(function(b){b.addEventListener('click',function(){var w=m.querySelector('figure').offsetWidth+18;m.scrollBy({left:b.classList.contains('next')?w:-w,behavior:reduce?'auto':'smooth'});});});
  // inclinação 3D nas placas
  if(!reduce&&matchMedia('(hover:hover)').matches){
    document.querySelectorAll('.tilt').forEach(function(el){
      el.addEventListener('mousemove',function(ev){var r=el.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width-.5,y=(ev.clientY-r.top)/r.height-.5;el.style.transform='perspective(700px) rotateY('+(x*18)+'deg) rotateX('+(-y*18)+'deg) scale(1.04)';});
      el.addEventListener('mouseleave',function(){el.style.transform='';});
    });
    var of=document.querySelector('.offer');
    if(of)of.addEventListener('mousemove',function(ev){var r=of.getBoundingClientRect();of.style.setProperty('--mx',(ev.clientX-r.left)+'px');of.style.setProperty('--my',(ev.clientY-r.top)+'px');});
  }
  // poeira dourada no topo
  var cv=document.getElementById('dust');
  // só no computador: no celular a animação contínua pesa e drena bateria
  if(cv&&cv.getContext&&!reduce&&matchMedia('(hover:hover) and (min-width:861px)').matches){
    var ctx=cv.getContext('2d'),P=[],W,H,dpr=Math.min(2,devicePixelRatio||1);
    function size(){W=cv.offsetWidth;H=cv.offsetHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
    size();addEventListener('resize',size);
    for(var i=0;i<70;i++)P.push({x:Math.random(),y:Math.random(),r:Math.random()*1.8+.4,v:Math.random()*.25+.05,a:Math.random()*.6+.2,t:Math.random()*6});
    (function loop(){ctx.clearRect(0,0,W,H);P.forEach(function(p){p.y-=p.v/H*2;p.t+=.02;if(p.y<-.02){p.y=1.02;p.x=Math.random();}
      var al=p.a*(.6+.4*Math.sin(p.t));ctx.beginPath();ctx.arc(p.x*W+Math.sin(p.t)*6,p.y*H,p.r,0,6.3);ctx.fillStyle='rgba(240,220,168,'+al+')';ctx.fill();});
      requestAnimationFrame(loop);})();
  }
  // calculadora: número animado
})();
