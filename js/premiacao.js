(function(){
        var g=document.querySelector('.premio-grid'); if(!g) return;
        var items=g.querySelectorAll('li'), dots=document.querySelectorAll('.premio-dots button');
        var mq=window.matchMedia('(max-width:760px)'), calm=window.matchMedia('(prefers-reduced-motion: reduce)');
        var i=0, timer=null, visible=false, pausedUntil=0;
        function go(n,smooth){i=(n+items.length)%items.length;var li=items[i];g.scrollTo({left:li.offsetLeft-(g.clientWidth-li.clientWidth)/2,behavior:smooth?'smooth':'auto'});}
        function mark(){var c=g.scrollLeft+g.clientWidth/2,best=0,d=1e9;items.forEach(function(li,k){var m=Math.abs(li.offsetLeft+li.clientWidth/2-c);if(m<d){d=m;best=k}});i=best;dots.forEach(function(b,k){b.setAttribute('aria-current',k===best?'true':'false')});}
        function tick(){if(!mq.matches||calm.matches||!visible||Date.now()<pausedUntil)return;go(i+1,true);}
        function start(){if(!timer)timer=setInterval(tick,2800);}
        g.addEventListener('scroll',function(){window.requestAnimationFrame(mark)},{passive:true});
        ['touchstart','pointerdown','wheel'].forEach(function(e){g.addEventListener(e,function(){pausedUntil=Date.now()+7000},{passive:true})});
        dots.forEach(function(b,k){b.addEventListener('click',function(){pausedUntil=Date.now()+7000;go(k,true)})});
        if('IntersectionObserver' in window){new IntersectionObserver(function(es){visible=es[0].isIntersecting},{threshold:.4}).observe(g);}else{visible=true}
        start();
      })();
