(function(){
  var CHECKOUT='https://pay.hub.la/6ctDNDmEOa7J4SYfQjUj';
  var PADRAO={
    carrinho:'Oi, {nome}! Tudo bem? Aqui é dos Irmãos Reino Cacau 👋\n\nVi que você começou a entrar no LINKA e não chegou a finalizar. Ficou alguma dúvida? Pode me perguntar por aqui que eu te ajudo.\n\nSe quiser terminar agora, o link é este: '+CHECKOUT,
    pendente:'Oi, {nome}! Aqui é dos Irmãos Reino Cacau 👋\n\nVi que você gerou o Pix do LINKA mas o pagamento ainda não caiu. O Pix expira rápido — se o seu já venceu, é só gerar outro por aqui:\n'+CHECKOUT+'\n\nQualquer dúvida me chama!',
    falhou:'Oi, {nome}! Aqui é dos Irmãos Reino Cacau 👋\n\nVi que o pagamento do LINKA não passou. Às vezes é limite do cartão ou o banco que bloqueia compra online. Quer tentar no Pix? É na hora:\n'+CHECKOUT+'\n\nSe precisar, te ajudo por aqui.'
  };
  var NOMES={carrinho:'Carrinho abandonado',pendente:'Pix gerado, não pagou',falhou:'Pagamento recusado / expirou'};
  var $=function(id){return document.getElementById(id)};
  var senha='', dados=[], filtro='mandar', timer=null;

  function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){return null}}
  function toast(t){var el=$('toast');el.textContent=t;el.classList.add('on');setTimeout(function(){el.classList.remove('on')},1800)}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function primeiroNome(n){n=String(n||'').trim().split(/\s+/)[0]||'';return n?n.charAt(0).toUpperCase()+n.slice(1).toLowerCase():''}
  function msg(kind){return ls('msg_'+kind)||PADRAO[kind]||PADRAO.carrinho}
  function fone(p){p=String(p||'');var d=p.replace(/^55/,'');if(d.length===11)return '('+d.slice(0,2)+') '+d.slice(2,7)+'-'+d.slice(7);if(d.length===10)return '('+d.slice(0,2)+') '+d.slice(2,6)+'-'+d.slice(6);return p}
  function atras(ts){var s=Math.max(0,(Date.now()-ts)/1000);if(s<60)return 'agora';if(s<3600)return Math.floor(s/60)+' min';if(s<86400)return Math.floor(s/3600)+' h';return Math.floor(s/86400)+' d'}
  function hora(ts){var d=new Date(ts);return d.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}
  function origem(u){
    u=u||{};var s=(u.source||'').toLowerCase(),m=(u.medium||'').toLowerCase(),c=u.content||'';
    if(s==='artista')return 'Stories do artista';
    if(s==='meta'||s==='facebook'||s==='fb'||m.indexOf('anuncio')>-1)return 'Anúncio'+(c?' · '+c.replace(/_/g,' '):'');
    if(s==='instagram'&&m==='bio')return 'Bio do Instagram';
    if(s==='instagram')return 'Instagram'+(m?' · '+m:'');
    if(s)return s+(m?' · '+m:'');
    return 'Direto / sem origem';
  }
  function api(method,body,qs){
    return fetch('/api/recuperacao'+(qs||''),{method:method,headers:{'x-senha':senha,'content-type':'application/json'},body:body?JSON.stringify(body):undefined,cache:'no-store'})
      .then(function(r){if(r.status===401){sair();throw new Error('senha')}return r.json()});
  }
  function sair(){ls('rec_senha',null);senha='';$('painel').hidden=true;$('login').hidden=false;clearInterval(timer)}

  function estado(l){if(l.pago)return 'pago';if(l.ignorado)return 'ignorado';if(l.mandei)return 'mandei';return 'mandar'}

  function render(){
    var cont={mandar:0,mandei:0,pago:0};
    dados.forEach(function(l){var e=estado(l);if(cont[e]!=null)cont[e]++});
    $('sPend').textContent=cont.mandar;$('sMand').textContent=cont.mandei;$('sPago').textContent=cont.pago;
    var itens=dados.filter(function(l){return filtro==='todos'||estado(l)===filtro});
    $('contagem').textContent=itens.length+(itens.length===1?' pessoa':' pessoas');
    if(!itens.length){$('lista').innerHTML='<div class="vazio">'+(dados.length?'Ninguém aqui neste filtro.':'Nenhum aviso da Hubla ainda. Assim que alguém abandonar o checkout, aparece aqui.')+'</div>';return}
    $('lista').innerHTML=itens.map(function(l){
      var e=estado(l), nome=l.name||'(sem nome)';
      var texto=msg(l.kind).replace(/\{nome\}/g,primeiroNome(l.name)||'tudo bem');
      var zap=l.phone?'https://wa.me/'+l.phone+'?text='+encodeURIComponent(texto):'';
      var tags='<span class="tag '+l.kind+'">'+esc(NOMES[l.kind]||l.kind)+'</span>';
      if(l.pago)tags+='<span class="tag pago">Comprou ✓</span>';
      else if(l.mandei)tags+='<span class="tag mandei">Mandei '+esc(atras(l.mandei.at))+' atrás</span>';
      if(l.count>1)tags+='<span class="tag">'+l.count+' tentativas</span>';
      var acoes='';
      if(!l.pago){
        acoes+=zap?'<a class="zap" href="'+zap+'" target="_blank" rel="noopener" data-id="'+esc(l.id)+'" data-acao="zap">WhatsApp</a>':'<span class="info">Sem telefone</span>';
        acoes+=l.mandei?'<button class="sec" data-id="'+esc(l.id)+'" data-acao="desfazer" type="button">Desfazer</button>':'<button class="sec" data-id="'+esc(l.id)+'" data-acao="mandei" type="button">Já mandei</button>';
        acoes+=l.ignorado?'<button class="sec" data-id="'+esc(l.id)+'" data-acao="voltar" type="button">Voltar</button>':'<button class="sec" data-id="'+esc(l.id)+'" data-acao="ignorar" type="button">Ignorar</button>';
      }
      return '<div class="card'+(l.pago?' pago':'')+'"><div class="top"><div class="nome">'+esc(nome)+'</div><div class="quando" title="'+esc(hora(l.last))+'">'+esc(atras(l.last))+'</div></div>'+
        '<div class="tags">'+tags+'</div>'+
        '<div class="info">'+(l.phone?esc(fone(l.phone)):'')+(l.email?(l.phone?' · ':'')+esc(l.email):'')+'</div>'+
        '<div class="info">Veio de: '+esc(origem(l.utm))+(l.method?' · '+esc(l.method):'')+' · '+esc(hora(l.last))+'</div>'+
        (acoes?'<div class="acoes">'+acoes+'</div>':'')+'</div>';
    }).join('');
  }

  function carregar(){
    return api('GET',null,'?dias='+$('dias').value).then(function(r){
      dados=r.lista||[];render();
      $('atualizado').textContent='atualizado '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})+' · atualiza sozinho';
    }).catch(function(e){if(e.message!=='senha'){$('atualizado').textContent='erro ao carregar, tentando de novo…'}});
  }

  function marcar(id,acao){
    var l=dados.filter(function(x){return x.id===id})[0];
    if(l){if(acao==='mandei')l.mandei={at:Date.now()};if(acao==='desfazer')l.mandei=null;if(acao==='ignorar')l.ignorado=true;if(acao==='voltar')l.ignorado=false;render()}
    return api('POST',{id:id,acao:acao,vezes:l&&l.mandei&&l.mandei.vezes||0}).catch(function(){toast('Não salvou, tente de novo')});
  }

  $('lista').addEventListener('click',function(ev){
    var t=ev.target.closest('[data-acao]');if(!t)return;
    var id=t.getAttribute('data-id'),a=t.getAttribute('data-acao');
    if(a==='zap'){setTimeout(function(){marcar(id,'mandei')},400);return}
    marcar(id,a);
    toast({mandei:'Marcado como mandado',desfazer:'Voltou para "para mandar"',ignorar:'Ignorado',voltar:'Voltou para a lista'}[a]||'');
  });
  [].forEach.call(document.querySelectorAll('.tab'),function(b){b.addEventListener('click',function(){
    filtro=b.getAttribute('data-f');[].forEach.call(document.querySelectorAll('.tab'),function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});render();
  })});
  $('dias').addEventListener('change',carregar);
  $('recarregar').addEventListener('click',function(){carregar().then(function(){toast('Atualizado')})});

  function preencherMsgs(){$('mCarrinho').value=msg('carrinho');$('mPendente').value=msg('pendente');$('mFalhou').value=msg('falhou')}
  [['mCarrinho','carrinho'],['mPendente','pendente'],['mFalhou','falhou']].forEach(function(p){
    $(p[0]).addEventListener('input',function(){ls('msg_'+p[1],this.value);render()});
  });
  $('padrao').addEventListener('click',function(){['carrinho','pendente','falhou'].forEach(function(k){ls('msg_'+k,null)});preencherMsgs();render();toast('Mensagens padrão de volta')});

  function entrar(s){
    senha=s;return api('GET',null,'?dias='+$('dias').value).then(function(r){
      ls('rec_senha',s);$('login').hidden=true;$('painel').hidden=false;preencherMsgs();
      dados=r.lista||[];render();$('atualizado').textContent='atualizado agora · atualiza sozinho';
      clearInterval(timer);timer=setInterval(carregar,30000);
    });
  }
  $('entrar').addEventListener('click',function(){
    var s=$('senha').value.trim();if(!s)return;$('loginErro').textContent='';
    entrar(s).catch(function(){$('loginErro').textContent='Senha errada.'});
  });
  $('senha').addEventListener('keydown',function(e){if(e.key==='Enter')$('entrar').click()});

  var salva=ls('rec_senha');
  if(salva){entrar(salva).catch(function(){$('login').hidden=false})}else{$('login').hidden=false}
})();
