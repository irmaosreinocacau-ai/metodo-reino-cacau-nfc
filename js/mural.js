(function(){
      var rails=[].slice.call(document.querySelectorAll('.rail'));
      var still=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      rails.forEach(function(r){
        var orig=[].slice.call(r.children), setW=0, pos=0, hold=0, last=0, vis=false, dir=+r.dataset.dir||1, speed=26;
        function addSet(){orig.forEach(function(n){var c=n.cloneNode(true);c.setAttribute('aria-hidden','true');c.tabIndex=-1;r.appendChild(c);});}
        function measure(){setW=r.children[orig.length].offsetLeft-r.children[0].offsetLeft; while(r.scrollWidth<r.clientWidth+setW*2) addSet();}
        addSet(); measure(); pos=setW*0.5; r.scrollLeft=pos;
        function wrap(){ if(r.scrollLeft>=setW*1.5){pos=r.scrollLeft-setW;r.scrollLeft=pos;} else if(r.scrollLeft<setW*0.25){pos=r.scrollLeft+setW;r.scrollLeft=pos;} }
        function pause(){hold=Infinity;}
        function resume(){hold=performance.now()+2500;pos=r.scrollLeft;}
        function tick(t){
          var dt=last?Math.min(t-last,64):0; last=t;
          if(vis&&!still&&t>hold&&!document.hidden){
            if(Math.abs(r.scrollLeft-pos)>2) pos=r.scrollLeft;
            pos+=dir*speed*dt/1000;
            if(pos>=setW*1.5) pos-=setW; if(pos<=setW*0.25) pos+=setW;
            r.scrollLeft=pos;
          }
          requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        new IntersectionObserver(function(e){vis=e[0].isIntersecting;}).observe(r);
        r.addEventListener('touchstart',pause,{passive:true});
        r.addEventListener('touchend',resume,{passive:true});
        r.addEventListener('mouseenter',pause); r.addEventListener('mouseleave',resume);
        r.addEventListener('scroll',function(){if(hold!==Infinity||still) wrap();},{passive:true});
        var down=null, moved=false;
        r.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;down={x:e.clientX,s:r.scrollLeft};moved=false;r.classList.add('dragging');});
        window.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-down.x;if(Math.abs(dx)>4)moved=true;r.scrollLeft=down.s-dx;});
        window.addEventListener('pointerup',function(){if(!down)return;down=null;r.classList.remove('dragging');wrap();pos=r.scrollLeft;});
        r.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation();moved=false;}},true);
        window.addEventListener('resize',function(){measure();});
      });
      var lb=document.querySelector('.lb'), li=lb.querySelector('img'), lp=lb.querySelector('p');
      document.addEventListener('click',function(e){
        var b=e.target.closest&&e.target.closest('.mcard'); if(!b) return;
        var im=b.querySelector('img'); li.src=im.src; li.alt=im.alt; lp.textContent=b.dataset.cap; lb.classList.add('open'); rails.forEach(function(r){r.dispatchEvent(new Event('touchstart'));});
      });
      function close(){lb.classList.remove('open');rails.forEach(function(r){r.dispatchEvent(new Event('touchend'));});}
      lb.addEventListener('click',function(e){if(e.target!==li)close();});
      document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
    })();
