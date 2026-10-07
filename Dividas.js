'use strict';
const chave='gustavoCellDividas',el=id=>document.getElementById(id);let editando=null;
function ler(){try{const d=JSON.parse(localStorage.getItem(chave)||'[]');return Array.isArray(d)?d:[]}catch{return[]}}
function gravar(d){try{localStorage.setItem(chave,JSON.stringify(d));return true}catch{el('mensagem').textContent='Não foi possível salvar. Verifique o espaço e as permissões do navegador.';return false}}
function hoje(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function texto(tag,t,classe){const n=document.createElement(tag);n.textContent=t;if(classe)n.className=classe;return n}
function reset(){editando=null;el('form').reset();el('data').value=hoje();el('valorDivida').value='';el('titulo').textContent='Cadastrar dívida';el('salvar').textContent='+ Cadastrar dívida';el('cancelar').hidden=true;el('buscaProdutoDivida').value='';el('quantidadeProdutoDivida').value='1';renderProdutosDivida()}
function render(){
 const dados=ler(),q=el('busca').value.trim().toLocaleLowerCase('pt-BR'),f=el('filtro').value,p=dados.filter(d=>!d.paga).length;el('contador').textContent=`${p} ${p===1?'pendente':'pendentes'}`;
 const lista=el('lista');lista.replaceChildren();const visiveis=dados.filter(d=>(f==='todas'||(f==='pagas'?d.paga:!d.paga))&&`${d.nome} ${d.itens.join(' ')}`.toLocaleLowerCase('pt-BR').includes(q)).sort((a,b)=>b.data.localeCompare(a.data));
 if(!visiveis.length){lista.append(texto('p','Nenhuma dívida encontrada.','vazioDividas'));return}
 visiveis.forEach(d=>{const card=texto('article','','registroDivida'),cab=texto('div','','cabDivida'),info=document.createElement('div');info.append(texto('h4',d.nome),texto('p',`Compra em ${d.data.split('-').reverse().join('/')}`,'dataDivida'));cab.append(info,texto('span',d.paga?'Paga':'Pendente',`statusDivida${d.paga?' paga':''}`));card.append(cab);card.append(texto('p',d.valor===undefined?'Valor não informado':`Total da dívida: ${Number(d.valor).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}`,'valorDividaRegistro'));const ul=texto('ul','','itensDivida');d.itens.forEach(i=>ul.append(texto('li',i)));card.append(ul);const a=texto('div','','acoesDividas');for(const [acao,label,css] of [['pagar',d.paga?'Marcar como pendente':'✓ Marcar como paga','btnPrimario'],['editar','Editar','btnSecundario'],['excluir','Excluir','btnExcluirDivida']]){const b=texto('button',label,css);b.type='button';b.dataset.acao=acao;b.dataset.id=d.id;a.append(b)}card.append(a);lista.append(card)});
}
el('form').addEventListener('submit',e=>{e.preventDefault();const nome=el('nome').value.trim(),data=el('data').value,valorTexto=el('valorDivida').value,valor=Number(valorTexto),itens=el('itens').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);if(!nome||!data||!itens.length||valorTexto===''||!Number.isFinite(valor)||valor<0){el('mensagem').textContent='Preencha o nome, a data, os itens e um valor válido para a dívida.';return}const dados=ler();if(editando){const d=dados.find(x=>x.id===editando);if(!d){el('mensagem').textContent='Registro removido. Cancele a edição para cadastrar novamente.';return}Object.assign(d,{nome,data,itens,valor})}else dados.push({id:globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`,nome,data,itens,valor,paga:false});if(!gravar(dados))return;reset();render();el('mensagem').textContent='Dívida salva com sucesso!'});
el('lista').addEventListener('click',e=>{const b=e.target.closest('button[data-acao]');if(!b)return;const dados=ler(),d=dados.find(x=>x.id===b.dataset.id);if(!d)return;if(b.dataset.acao==='editar'){editando=d.id;el('nome').value=d.nome;el('valorDivida').value=d.valor??'';el('data').value=d.data;el('itens').value=d.itens.join('\n');el('titulo').textContent='Editar dívida';el('salvar').textContent='Salvar alterações';el('cancelar').hidden=false;el('mensagem').textContent='';el('nome').focus();return}if(b.dataset.acao==='excluir'){if(!confirm(`Excluir a dívida de ${d.nome}?`))return;if(!gravar(dados.filter(x=>x.id!==d.id)))return;if(editando===d.id)reset();el('mensagem').textContent='Dívida excluída.'}else{d.paga=!d.paga;if(!gravar(dados))return;el('mensagem').textContent=d.paga?'Dívida marcada como paga.':'Dívida marcada como pendente.'}render()});
el('cancelar').addEventListener('click',()=>{reset();el('mensagem').textContent=''});el('busca').addEventListener('input',render);el('filtro').addEventListener('change',render);window.addEventListener('storage',e=>{if(e.key===chave||e.key===null)render()});reset();render();

function produtosDivida(){try{const dados=JSON.parse(localStorage.getItem('produtos')||'[]');return Array.isArray(dados)?dados:[]}catch{return[]}}
function renderProdutosDivida(){
 const produtos=produtosDivida(),q=el('buscaProdutoDivida').value.trim().toLocaleLowerCase('pt-BR'),seletor=el('produtoDivida');
 seletor.replaceChildren();const inicial=texto('option','Selecione um produto');inicial.value='';seletor.append(inicial);let encontrados=0;
 produtos.forEach((produto,indice)=>{if(!String(produto.nome||'').toLocaleLowerCase('pt-BR').includes(q))return;const opcao=texto('option',produto.nome||'Produto');opcao.value=String(indice);opcao.dataset.nome=String(produto.nome||'Produto');opcao.dataset.produtoId=String(produto.id||'');seletor.append(opcao);encontrados++});
 el('avisoProdutosDivida').textContent=!produtos.length?'Nenhum produto cadastrado. Cadastre telas, baterias e outros itens na aba Produtos.':!encontrados?'Nenhum produto encontrado nessa pesquisa.':`${encontrados} ${encontrados===1?'produto disponível':'produtos disponíveis'}. Você também pode escrever outros itens abaixo.`;
 el('adicionarProdutoDivida').disabled=!encontrados;
}
function adicionarProdutoNaDivida(){
 const seletor=el('produtoDivida'),quantidade=Number(el('quantidadeProdutoDivida').value);
 if(seletor.value===''){el('avisoProdutosDivida').textContent='Selecione um produto para adicionar.';return}
 if(!Number.isInteger(quantidade)||quantidade<1){el('avisoProdutosDivida').textContent='Informe uma quantidade inteira maior que zero.';return}
 const selecionado=seletor.selectedOptions[0],produto=produtosDivida()[Number(seletor.value)];
 if(!produto||String(produto.nome||'Produto')!==selecionado.dataset.nome||String(produto.id||'')!==selecionado.dataset.produtoId){renderProdutosDivida();el('avisoProdutosDivida').textContent='A lista de produtos mudou. Selecione o item novamente.';return}
 const linha=`${produto.nome||'Produto'} — ${quantidade} ${quantidade===1?'unidade':'unidades'}`,atual=el('itens').value.trim();
 if((atual.length+(atual?1:0)+linha.length)>el('itens').maxLength){el('avisoProdutosDivida').textContent='A lista de itens atingiu o limite. Salve esta dívida antes de adicionar mais itens.';return}
 el('itens').value=atual?`${atual}\n${linha}`:linha;const preco=Number(produto.preco),valorAtual=Number(el('valorDivida').value||0);if(Number.isFinite(preco)&&preco>=0&&Number.isFinite(valorAtual)&&valorAtual>=0)el('valorDivida').value=(valorAtual+preco*quantidade).toFixed(2);el('avisoProdutosDivida').textContent=`${produto.nome||'Produto'} adicionado à lista de itens.`;el('quantidadeProdutoDivida').value='1';
}
el('buscaProdutoDivida').addEventListener('input',renderProdutosDivida);
el('adicionarProdutoDivida').addEventListener('click',adicionarProdutoNaDivida);
window.addEventListener('storage',e=>{if(e.key==='produtos'||e.key===null)renderProdutosDivida()});
