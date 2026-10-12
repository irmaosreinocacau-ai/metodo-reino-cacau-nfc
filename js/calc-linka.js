// Calculadora da LP LINKA: custo por placa segue a tabela do fornecedor (12x12 e 10x10)
(function(){
  var q=document.getElementById('qtd'), p=document.getElementById('preco');
  if(!q||!p) return;
  var tam=12;
  var brl=function(v,d){return 'R$ '+v.toLocaleString('pt-BR',{minimumFractionDigits:d||0,maximumFractionDigits:d||0});};
  function unit(n){var u=n>=150?16:n>=100?16.5:n>=50?17:19;return tam===10?u-2:u;}
  function upd(){
    var n=+q.value, pr=+p.value, u=unit(n), fat=n*pr, custo=n*u;
    document.getElementById('qtd-out').textContent=n;
    document.getElementById('preco-out').textContent=brl(pr);
    document.getElementById('unit').textContent=brl(u,2);
    document.getElementById('fat').textContent=brl(fat);
    document.getElementById('custo').textContent=brl(custo);
    document.getElementById('lucro').textContent=brl(fat-custo);
  }
  document.querySelectorAll('.calc .seg button').forEach(function(b){b.addEventListener('click',function(){
    tam=+b.dataset.tam;document.querySelectorAll('.calc .seg button').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});upd();});});
  q.addEventListener('input',upd); p.addEventListener('input',upd); upd();
})();
