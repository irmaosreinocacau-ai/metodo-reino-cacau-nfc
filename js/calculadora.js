// Calculadora: custo por placa segue as faixas do fornecedor
(function(){
  var q=document.getElementById('qtd'), p=document.getElementById('preco');
  if(!q||!p) return;
  var brl=function(v,dec){return 'R$ '+v.toLocaleString('pt-BR',{minimumFractionDigits:dec||0,maximumFractionDigits:dec||0});};
  var cur=null,raf=0,L=document.getElementById('lucro');
  function tween(to){if(cur===null||matchMedia('(prefers-reduced-motion: reduce)').matches){cur=to;L.textContent=brl(to);return;}var from=cur,st=null;cancelAnimationFrame(raf);(function f(ts){if(!st)st=ts;var k=Math.min(1,(ts-st)/350);cur=Math.round(from+(to-from)*(1-Math.pow(1-k,3)));L.textContent=brl(cur);if(k<1)raf=requestAnimationFrame(f);})(performance.now());}
  function unit(n){return n>=150?16:n>=100?16.5:n>=50?17:19;}
  function upd(){
    var n=+q.value, pr=+p.value, u=unit(n), fat=n*pr, custo=n*u;
    document.getElementById('qtd-out').textContent=n;
    document.getElementById('preco-out').textContent=brl(pr);
    document.getElementById('unit').textContent=brl(u,2);
    document.getElementById('fat').textContent=brl(fat);
    document.getElementById('custo').textContent=brl(custo);
    tween(fat-custo);
  }
  q.addEventListener('input',upd); p.addEventListener('input',upd); upd();
})();
