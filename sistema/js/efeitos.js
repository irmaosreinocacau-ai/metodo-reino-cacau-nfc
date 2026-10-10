// Efeitos da página do sistema LINKA
(function(){
  var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduce||!("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("js");
  var groups=[".hero .eyebrow,.hero h1,.hero .lead,.hero-cta,.ticks,.phone",".shift h2",".compare>div",".sec-head",".f-text",".f-media",".model",".margin",".bonus>div",".proofs figure",".us img,.us .wrap>div",".offer h2,.card-offer",".faq details"];
  groups.forEach(function(sel){document.querySelectorAll(sel).forEach(function(el,i){el.classList.add("rv");el.style.setProperty("--d",(Math.min(i,6)*0.08)+"s");});});
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var t=e.target;t.classList.add("in");io.unobserve(t);
    t.querySelectorAll&&t.querySelectorAll("[data-count]").forEach(count);});},{threshold:.15,rootMargin:"0px 0px -6% 0px"});
  document.querySelectorAll(".rv,.track,.steps").forEach(function(el){io.observe(el);});
  function count(el){var to=+el.dataset.count,t0=null;function f(t){t0=t0||t;var k=Math.min(1,(t-t0)/1100);el.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f);}el.textContent="0";requestAnimationFrame(f);}
  var ph=document.querySelector(".phone-frame"),hero=document.querySelector(".hero");
  if(ph&&matchMedia("(hover:hover) and (min-width:861px)").matches){
    hero.addEventListener("pointermove",function(e){var r=hero.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;ph.style.transform="perspective(900px) rotateY("+(x*10)+"deg) rotateX("+(-y*8)+"deg)";});
    hero.addEventListener("pointerleave",function(){ph.style.transform="";});
  }
})();
(function(){
  /* fundo: fios finos ondulando (azul-marinho, alguns dourados), no topo e nos brancos de baixo */
  var still=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  function silk(c,hero){
    if(!c.getContext) return;
    var x=c.getContext("2d"),dpr,W,H,run=false,raf,T=Math.random()*20,N=18,ST=14;
    function size(){W=c.clientWidth;H=c.clientHeight;dpr=W<700?1.5:Math.min(window.devicePixelRatio||1,2);N=W<700?13:18;ST=W<700?20:14;c.width=W*dpr;c.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0);}
    function band(cy,amp,t,alpha,phase){
      for(var i=0;i<N;i++){var k=i/(N-1);x.beginPath();
        for(var px=-20;px<=W+20;px+=ST){var u=px/W;
          var y=cy+Math.sin(u*5.2+t*.9+phase+k*1.3)*amp*(.55+.45*Math.sin(t*.4+k*2))+Math.sin(u*2.1-t*.6+k*.8)*amp*.6+(k-.5)*amp*1.1;
          px<=-20?x.moveTo(px,y):x.lineTo(px,y);}
        var mid=1-Math.abs(k-.5)*2,g=(i%4==1);
        x.strokeStyle=g?"rgba(212,167,44,"+(alpha*1.9*mid+.05).toFixed(3)+")":"rgba(15,23,42,"+(alpha*mid+.015).toFixed(3)+")";
        x.lineWidth=g?1.2:1;x.stroke();}}
    function draw(){x.clearRect(0,0,W,H);var m=W<700;
      if(hero){band(H*(m?.30:.34),m?60:90,T,.10,0);band(H*(m?.78:.80),m?50:70,T*1.1,.08,2.4);}
      else{band(H*(m?.22:.28),m?50:75,T,.08,1.2);band(H*(m?.80:.82),m?45:60,T*1.1,.07,3.6);}
      if(!still){T+=.010;if(run)raf=requestAnimationFrame(draw);}}
    size();draw();
    addEventListener("resize",function(){size();draw();});
    if("IntersectionObserver" in window)new IntersectionObserver(function(e){var v=e[0].isIntersecting;
      if(v&&!run){run=true;if(!still)raf=requestAnimationFrame(draw);}else if(!v&&run){run=false;cancelAnimationFrame(raf);}},{rootMargin:"100px 0px"}).observe(c);
  }
  document.querySelectorAll(".net-bg").forEach(function(c){silk(c,!c.classList.contains("silk-sec"));});
})();

// Pixel: avisa a Meta quando a pessoa clica para ir ao checkout
(function(){
  document.querySelectorAll('.js-checkout').forEach(function(a){
    a.addEventListener('click',function(){
      try{ if(window.fbq) fbq('track','InitiateCheckout',{value:97,currency:'BRL',content_name:'LINKA'}); }catch(e){}
    });
  });
})();
