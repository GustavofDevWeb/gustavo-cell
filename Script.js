// ======================================================
// GUSTAVOCELL SHOP - LOJA + CARRINHO + GERENCIAMENTO
// ======================================================

function pegarProdutos(){
    try{
        const dados=localStorage.getItem("produtos");
        if(!dados)return [];
        const produtos=JSON.parse(dados);
        return Array.isArray(produtos)?produtos:[];
    }catch(erro){
        console.error("Erro ao carregar produtos:",erro);
        return [];
    }
}
function salvarProdutos(produtos){localStorage.setItem("produtos",JSON.stringify(produtos))}
function garantirIdsProdutos(){
    const produtos=pegarProdutos();
    let alterou=false;
    produtos.forEach(produto=>{
        if(!produto.id){produto.id=gerarId("produto");alterou=true}
    });
    if(alterou)salvarProdutos(produtos);
    return produtos;
}
function encontrarIndiceProdutoPorId(id){
    return pegarProdutos().findIndex(produto=>String(produto.id)===String(id));
}
function pegarCarrinho(){
    try{
        const dados=localStorage.getItem("carrinho");
        if(!dados)return [];
        const carrinho=JSON.parse(dados);
        return Array.isArray(carrinho)?carrinho:[];
    }catch(erro){console.error("Erro ao carregar carrinho:",erro);return []}
}
function salvarCarrinho(carrinho){localStorage.setItem("carrinho",JSON.stringify(carrinho))}
function pegarFiltros(){
    try{
        const dados=localStorage.getItem("filtrosLoja");
        if(!dados)return [];
        const filtros=JSON.parse(dados);
        return Array.isArray(filtros)?filtros:[];
    }catch(erro){console.error("Erro ao carregar filtros:",erro);return []}
}
function salvarFiltros(filtros){localStorage.setItem("filtrosLoja",JSON.stringify(filtros))}
function gerarId(prefixo="id"){
    return prefixo+"_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,8);
}
function formatarPreco(preco){
    return Number(preco||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
}
function garantirPrecosConserto(){
    const produtos=pegarProdutos();
    let alterou=false;
    produtos.forEach(produto=>{
        if(produto.precoConserto===undefined || produto.precoConserto===null || produto.precoConserto===""){
            produto.precoConserto=Number(produto.preco)||0;
            alterou=true;
        }
    });
    if(alterou)salvarProdutos(produtos);
    return produtos;
}
function precoDoCatalogo(produto){
    if(tipoCatalogoAtual==="conserto")return Number(produto.precoConserto ?? produto.preco)||0;
    return Number(produto.preco)||0;
}
function tipoDoItemCarrinho(item){return item?.tipo==="conserto"?"conserto":"venda";}


let catalogo,listaProdutos,botaoAdicionar,botaoRemover,botaoEditarSelecionados,searchInput;
let tipoVenda,tipoConserto,tipoSimples,tipoCatalogoAtual="venda";
let botaoCarrinho,carrinhoOverlay,carrinhoContainer,fecharCarrinho,listaCarrinho,totalCarrinho,contadorCarrinho,limparCarrinho,finalizarCompra;
let modalEditar,fecharModalEditar,cancelarEdicao,salvarEdicao,editarNome,editarPreco,editarPrecoConserto,editarQuantidade,editarImagem,previewImagemEditar;
let modalEditarSelecionados,fecharModalEditarSelecionados,cancelarEdicaoSelecionados,salvarEdicaoSelecionados,quantidadeEdicaoLote,listaEdicaoLote;
let produtoEditando=null;

let filtroPreco,ordenacaoProdutos,filtrosDinamicos,limparFiltros;
let buscaAdmin,filtroEstoqueAdmin,ordenacaoAdmin;

let nomeFiltro,opcoesFiltro,adicionarFiltro,listaFiltros;
let abrirGerenciadorFiltros,fecharGerenciadorFiltros,painelFiltrosLoja;
let camposFiltrosProduto,camposFiltrosEdicao;
let abrirImportadorPDF,arquivoImportarPDF,modalImportarPDF,fecharImportadorPDF,cancelarImportacaoPDF,confirmarImportacaoPDF,listaImportacaoPDF,statusImportacaoPDF;
let abrirCadastroMultiplos,modalCadastroMultiplos,fecharCadastroMultiplos,cancelarCadastroMultiplos,confirmarCadastroMultiplos,adicionarLinhaMultipla,listaCadastroMultiplos;
let itensImportacaoPDF=[];
let quantidadeLinhasMultiplas=0;
let abrirNecessitaAlgo,fecharNecessitaAlgo,cancelarNecessitaAlgo,enviarNecessitaAlgo,modalNecessitaAlgo,produtoSolicitado;
let listaSolicitacoes,contadorSolicitacoes,semSolicitacoes,gerarPDFSolicitacoes,todosAtendidosSolicitacoes;

function carregarElementos(){
    catalogo=document.getElementById("catalogo");
    listaProdutos=document.getElementById("listaProdutos");
    botaoAdicionar=document.getElementById("adicionarProduto");
    botaoRemover=document.getElementById("removerSelecionados");
    botaoEditarSelecionados=document.getElementById("editarSelecionados");
    searchInput=document.getElementById("searchInput");
    tipoVenda=document.getElementById("tipoVenda");
    tipoConserto=document.getElementById("tipoConserto");
    tipoSimples=document.getElementById("tipoSimples");

    botaoCarrinho=document.getElementById("botaoCarrinho");
    carrinhoOverlay=document.getElementById("carrinhoOverlay");
    carrinhoContainer=document.getElementById("carrinhoContainer");
    fecharCarrinho=document.getElementById("fecharCarrinho");
    listaCarrinho=document.getElementById("listaCarrinho");
    totalCarrinho=document.getElementById("totalCarrinho");
    contadorCarrinho=document.getElementById("contadorCarrinho");
    limparCarrinho=document.getElementById("limparCarrinho");
    finalizarCompra=document.getElementById("finalizarCompra");

    modalEditar=document.getElementById("modalEditar");
    modalEditarSelecionados=document.getElementById("modalEditarSelecionados");
    fecharModalEditarSelecionados=document.getElementById("fecharModalEditarSelecionados");
    cancelarEdicaoSelecionados=document.getElementById("cancelarEdicaoSelecionados");
    salvarEdicaoSelecionados=document.getElementById("salvarEdicaoSelecionados");
    listaEdicaoLote=document.getElementById("listaEdicaoLote");
    quantidadeEdicaoLote=document.getElementById("quantidadeEdicaoLote");
    fecharModalEditar=document.getElementById("fecharModalEditar");
    cancelarEdicao=document.getElementById("cancelarEdicao");
    salvarEdicao=document.getElementById("salvarEdicao");
    editarNome=document.getElementById("editarNome");
    editarPreco=document.getElementById("editarPreco");
    editarPrecoConserto=document.getElementById("editarPrecoConserto");
    editarQuantidade=document.getElementById("editarQuantidade");
    editarImagem=document.getElementById("editarImagem");
    previewImagemEditar=document.getElementById("previewImagemEditar");

    filtroPreco=document.getElementById("filtroPreco");
    ordenacaoProdutos=document.getElementById("ordenacaoProdutos");
    filtrosDinamicos=document.getElementById("filtrosDinamicos");
    limparFiltros=document.getElementById("limparFiltros");

    buscaAdmin=document.getElementById("buscaAdmin");
    filtroEstoqueAdmin=document.getElementById("filtroEstoqueAdmin");
    ordenacaoAdmin=document.getElementById("ordenacaoAdmin");

    nomeFiltro=document.getElementById("nomeFiltro");
    opcoesFiltro=document.getElementById("opcoesFiltro");
    adicionarFiltro=document.getElementById("adicionarFiltro");
    listaFiltros=document.getElementById("listaFiltros");
    abrirGerenciadorFiltros=document.getElementById("abrirGerenciadorFiltros");
    fecharGerenciadorFiltros=document.getElementById("fecharGerenciadorFiltros");
    painelFiltrosLoja=document.getElementById("painelFiltrosLoja");

    camposFiltrosProduto=document.getElementById("camposFiltrosProduto");
    camposFiltrosEdicao=document.getElementById("camposFiltrosEdicao");

    abrirImportadorPDF=document.getElementById("abrirImportadorPDF");
    arquivoImportarPDF=document.getElementById("arquivoImportarPDF");
    modalImportarPDF=document.getElementById("modalImportarPDF");
    fecharImportadorPDF=document.getElementById("fecharImportadorPDF");
    cancelarImportacaoPDF=document.getElementById("cancelarImportacaoPDF");
    confirmarImportacaoPDF=document.getElementById("confirmarImportacaoPDF");
    listaImportacaoPDF=document.getElementById("listaImportacaoPDF");
    statusImportacaoPDF=document.getElementById("statusImportacaoPDF");

    abrirCadastroMultiplos=document.getElementById("abrirCadastroMultiplos");
    modalCadastroMultiplos=document.getElementById("modalCadastroMultiplos");
    fecharCadastroMultiplos=document.getElementById("fecharCadastroMultiplos");
    cancelarCadastroMultiplos=document.getElementById("cancelarCadastroMultiplos");
    confirmarCadastroMultiplos=document.getElementById("confirmarCadastroMultiplos");
    adicionarLinhaMultipla=document.getElementById("adicionarLinhaMultipla");
    listaCadastroMultiplos=document.getElementById("listaCadastroMultiplos");

    abrirNecessitaAlgo=document.getElementById("abrirNecessitaAlgo");
    fecharNecessitaAlgo=document.getElementById("fecharNecessitaAlgo");
    cancelarNecessitaAlgo=document.getElementById("cancelarNecessitaAlgo");
    enviarNecessitaAlgo=document.getElementById("enviarNecessitaAlgo");
    modalNecessitaAlgo=document.getElementById("modalNecessitaAlgo");
    produtoSolicitado=document.getElementById("produtoSolicitado");

    listaSolicitacoes=document.getElementById("listaSolicitacoes");
    contadorSolicitacoes=document.getElementById("contadorSolicitacoes");
    semSolicitacoes=document.getElementById("semSolicitacoes");
    gerarPDFSolicitacoes=document.getElementById("gerarPDFSolicitacoes");
    todosAtendidosSolicitacoes=document.getElementById("todosAtendidosSolicitacoes");
}

function atualizarContadorCarrinho(){
    if(!contadorCarrinho)return;
    const quantidade=pegarCarrinho().reduce((total,item)=>total+Number(item.quantidade||0),0);
    contadorCarrinho.textContent=quantidade;
}

function valorNoFiltro(produto,filtroId){
    if(!produto)return "";

    const filtros=pegarFiltros();
    const filtro=filtros.find(f=>String(f.id)===String(filtroId));
    const nomeFiltro=String(filtro?.nome||"").trim().toLowerCase();

    // Para Tipo, o nome salvo no produto é a fonte de verdade.
    if(nomeFiltro==="tipo" && produto.tipo){
        const nomeTipo=String(produto.tipo).trim().toLowerCase();
        const op=(filtro.opcoes||[]).find(o=>String(o.nome||"").trim().toLowerCase()===nomeTipo);
        if(op)return String(op.id);
    }

    const valor=produto.filtros?.[filtroId];
    if(valor!==undefined && valor!==null && valor!=="")return String(valor);

    return "";
}

function produtoPassaFiltrosLoja(produto){
    const texto=(searchInput?.value||"").toLowerCase().trim();
    if(texto && !String(produto.nome||"").toLowerCase().includes(texto))return false;

    const preco=precoDoCatalogo(produto);
    if(filtroPreco){
        const valor=filtroPreco.value;
        if(valor==="ate50" && preco>50)return false;
        if(valor==="50a100" && (preco<50 || preco>100))return false;
        if(valor==="acima100" && preco<=100)return false;
    }

    for(const filtro of pegarFiltros()){
        const select=document.getElementById("filtroDinamico_"+filtro.id);
        if(!select || select.value==="todos")continue;

        const selecionado=String(select.value);
        const valor=valorNoFiltro(produto,filtro.id);
        if(valor===selecionado)continue;

        // Compatibilidade extra: se for Tipo, compara diretamente pelo nome da opção.
        if(String(filtro.nome||"").trim().toLowerCase()==="tipo" && produto.tipo){
            const op=(filtro.opcoes||[]).find(o=>String(o.id)===selecionado);
            if(op && String(op.nome||"").trim().toLowerCase()===String(produto.tipo).trim().toLowerCase())continue;
        }

        return false;
    }
    return true;
}

function ordenarProdutos(lista,valor){
    const copia=[...lista];
    if(valor==="menorPreco")copia.sort((a,b)=>precoDoCatalogo(a)-precoDoCatalogo(b));
    if(valor==="maiorPreco")copia.sort((a,b)=>precoDoCatalogo(b)-precoDoCatalogo(a));
    if(valor==="nomeAZ")copia.sort((a,b)=>String(a.nome||"").localeCompare(String(b.nome||""),"pt-BR"));
    if(valor==="nomeZA")copia.sort((a,b)=>String(b.nome||"").localeCompare(String(a.nome||""),"pt-BR"));
    return copia;
}

function ehItemSimples(produto){
    const texto=String(produto?.nome||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
    return /placa\s*(de\s*)?carga|conector\s*(de\s*)?carga|botao|botoes/.test(texto);
}

function obterProdutosFiltradosLoja(produtosBase=null){
    const base=Array.isArray(produtosBase)?produtosBase:pegarProdutos();
    let produtos=base.filter(produto=>{
        const simples=ehItemSimples(produto);
        if(tipoCatalogoAtual==="simples" ? !simples : simples)return false;
        // Só oculta quando o estoque estiver realmente zerado.
        // Produtos antigos sem o campo "quantidade" continuam aparecendo.
        if(produto.quantidade===undefined || produto.quantidade===null || produto.quantidade==="") return true;
        return Number(produto.quantidade)>0;
    }).filter(produtoPassaFiltrosLoja);
    return ordenarProdutos(produtos,ordenacaoProdutos?.value||"padrao");
}

function renderizarFiltrosLoja(){
    if(!filtrosDinamicos)return;
    filtrosDinamicos.innerHTML="";
    pegarFiltros().forEach(filtro=>{
        const grupo=document.createElement("div");
        grupo.className="filtroDinamico";
        const label=document.createElement("label");
        label.htmlFor="filtroDinamico_"+filtro.id;
        label.textContent=filtro.nome;
        const select=document.createElement("select");
        select.id="filtroDinamico_"+filtro.id;
        select.dataset.filtroId=filtro.id;

        const todos=document.createElement("option");
        todos.value="todos";todos.textContent="Todos";select.appendChild(todos);

        (filtro.opcoes||[]).forEach(opcao=>{
            const option=document.createElement("option");
            option.value=opcao.id;
            option.textContent=opcao.nome;
            select.appendChild(option);
        });
        select.addEventListener("change",aplicarFiltrosLoja);
        grupo.append(label,select);
        filtrosDinamicos.appendChild(grupo);
    });
}

function mostrarProdutosLoja(){
    if(!catalogo)return;
    const todosProdutos=pegarProdutos();
    // Usa a mesma lista de objetos para manter os índices corretos do carrinho.
    const produtos=obterProdutosFiltradosLoja(todosProdutos);
    catalogo.innerHTML="";
    // Itens simples usam visual em lista; Venda/Conserto continuam em cards.
    catalogo.classList.toggle("catalogoItensSimples", tipoCatalogoAtual==="simples");

    const quantidadeProdutos=document.getElementById("quantidadeProdutos");
    const semProdutos=document.getElementById("semProdutos");
    if(quantidadeProdutos)quantidadeProdutos.textContent=`${produtos.length} ${produtos.length===1?"produto":"produtos"}`;

    if(!produtos.length){
        if(semProdutos)semProdutos.style.display="block";
        return;
    }
    if(semProdutos)semProdutos.style.display="none";

    produtos.forEach(produto=>{
        const indice=todosProdutos.indexOf(produto);
        if(indice<0)return;
        const estoque=(produto.quantidade===undefined || produto.quantidade===null || produto.quantidade==="") ? null : Number(produto.quantidade);
        const card=document.createElement("div");
        card.className="productCard";
        const nomeSeguro=String(produto.nome||"Produto").replace(/"/g,"&quot;");
        const nomeNormalizado=String(produto.nome||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
        const ehBotao=/botao|botoes/.test(nomeNormalizado);
        // Não reutiliza uma única foto genérica para todas as subplacas.
        // Prioriza a imagem cadastrada do próprio produto; quando ela não existe,
        // usa um placeholder neutro em vez de mostrar uma placa de outro modelo.
        const placeholderSimples="data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="18" fill="#f3f6fa"/><text x="80" y="92" text-anchor="middle" font-size="48">${ehBotao?"🔘":"📦"}</text></svg>`);
        const imagemProduto=tipoCatalogoAtual==="simples" ? (produto.imagem||placeholderSimples) : (produto.imagem||"");
        card.innerHTML=`
            <img src="${imagemProduto}" alt="${nomeSeguro}" ${tipoCatalogoAtual==="simples" ? `onerror="this.onerror=null;this.src='${placeholderSimples}'"` : ""}>
            <h3>${produto.nome||"Produto"}</h3>
            <span class="tipoProdutoCard">${tipoCatalogoAtual==="conserto"?"🔧 Conserto":tipoCatalogoAtual==="simples"?"🔩 Item simples":"🛍️ Venda"}</span>
            <p>${formatarPreco(precoDoCatalogo(produto))}</p>
            <p>${estoque===null?"":"Estoque: "+estoque}</p>
            <button class="productButton" type="button" data-indice="${indice}" ${estoque!==null && estoque<=0?"disabled":""}>
                ${estoque!==null && estoque<=0?"Produto sem estoque":"🛒 Adicionar ao carrinho"}
            </button>`;
        catalogo.appendChild(card);
    });
}

function aplicarFiltrosLoja(){mostrarProdutosLoja()}

function configurarFiltrosLoja(){
    [filtroPreco,ordenacaoProdutos].forEach(el=>{if(el)el.addEventListener("change",aplicarFiltrosLoja)});
    if(searchInput)searchInput.addEventListener("input",aplicarFiltrosLoja);
    if(limparFiltros){
        limparFiltros.addEventListener("click",()=>{
            if(searchInput)searchInput.value="";
            if(filtroPreco)filtroPreco.value="todos";
            if(ordenacaoProdutos)ordenacaoProdutos.value="padrao";
            pegarFiltros().forEach(f=>{const s=document.getElementById("filtroDinamico_"+f.id);if(s)s.value="todos"});
            mostrarProdutosLoja();
        });
    }
}

function configurarTiposCatalogo(){
    const atualizar=tipo=>{
        tipoCatalogoAtual=tipo;
        const alvo=tipo==="venda"?tipoVenda:tipo==="conserto"?tipoConserto:tipoSimples;
        [tipoVenda,tipoConserto,tipoSimples].forEach(btn=>btn?.classList.toggle("ativo",btn===alvo));
        tipoVenda?.setAttribute("aria-selected",tipo==="venda"?"true":"false");
        tipoConserto?.setAttribute("aria-selected",tipo==="conserto"?"true":"false");
        tipoSimples?.setAttribute("aria-selected",tipo==="simples"?"true":"false");
        mostrarProdutosLoja();
    };
    tipoVenda?.addEventListener("click",()=>atualizar("venda"));
    tipoConserto?.addEventListener("click",()=>atualizar("conserto"));
    tipoSimples?.addEventListener("click",()=>atualizar("simples"));
}

function adicionarAoCarrinho(indice){
    const produtos=pegarProdutos(),produto=produtos[Number(indice)];
    if(!produto)return;
    const estoque=Number(produto.quantidade)||0;
    if(estoque<=0){mostrarAviso("Esse produto está sem estoque.");return}

    const carrinho=pegarCarrinho();
    const tipo=tipoCatalogoAtual==="simples"?"venda":tipoCatalogoAtual;
    const item=carrinho.find(i=>Number(i.indice)===Number(indice) && tipoDoItemCarrinho(i)===tipo);
    if(item)item.quantidade=Number(item.quantidade||0)+1;
    else carrinho.push({indice:Number(indice),quantidade:1,tipo});
    produto.quantidade=estoque-1;
    salvarProdutos(produtos);salvarCarrinho(carrinho);
    mostrarProdutosLoja();mostrarProdutosGerenciamento();mostrarCarrinho();atualizarContadorCarrinho();abrirCarrinho();
}

function configurarBotoesProdutos(){
    if(!catalogo)return;
    catalogo.addEventListener("click",event=>{
        const botao=event.target.closest(".productButton");
        if(!botao||botao.disabled)return;
        const indice=Number(botao.dataset.indice);
        if(!Number.isNaN(indice))adicionarAoCarrinho(indice);
    });
}

function abrirCarrinho(){
    if(!carrinhoContainer)return;
    carrinhoOverlay?.classList.add("aberto");
    carrinhoContainer.classList.add("aberto");
    carrinhoContainer.setAttribute("aria-hidden","false");
    mostrarCarrinho();
}
function fecharPainelCarrinho(){
    carrinhoOverlay?.classList.remove("aberto");
    if(carrinhoContainer){carrinhoContainer.classList.remove("aberto");carrinhoContainer.setAttribute("aria-hidden","true")}
}

function mostrarCarrinho(){
    if(!listaCarrinho)return;
    const carrinho=pegarCarrinho(),produtos=pegarProdutos();
    listaCarrinho.innerHTML="";
    let total=0;
    if(!carrinho.length){
        listaCarrinho.innerHTML=`<div class="carrinhoVazio"><div>🛒</div><h3>Seu carrinho está vazio</h3><p>Adicione produtos para começar.</p></div>`;
        if(totalCarrinho)totalCarrinho.textContent="R$ 0,00";
        atualizarContadorCarrinho();return;
    }
    carrinho.forEach(item=>{
        const indice=Number(item.indice),produto=produtos[indice];
        if(!produto)return;
        const quantidade=Number(item.quantidade)||0,tipo=tipoDoItemCarrinho(item),preco=tipo==="conserto"?Number(produto.precoConserto ?? produto.preco)||0:Number(produto.preco)||0,subtotal=preco*quantidade;
        total+=subtotal;
        const div=document.createElement("div");
        div.className="itemCarrinho";
        div.innerHTML=`
            <img src="${produto.imagem||""}" alt="${produto.nome||"Produto"}">
            <div class="itemCarrinhoInfo">
                <h3>${produto.nome||"Produto"}</h3><p>${tipo==="conserto"?"🔧 Conserto":"🛍️ Venda"} · ${formatarPreco(preco)}</p>
                <div class="controlesCarrinho">
                    <button class="btnQuantidade" type="button" data-diminuir="${indice}" data-tipo="${tipo}">−</button>
                    <span>${quantidade}</span>
                    <button class="btnQuantidade" type="button" data-aumentar="${indice}" data-tipo="${tipo}">+</button>
                    <button class="btnExcluirItem" type="button" data-excluir="${indice}" data-tipo="${tipo}">🗑</button>
                </div>
            </div>`;
        div.querySelector("[data-diminuir]")?.addEventListener("click",()=>diminuirItem(indice,tipo));
        div.querySelector("[data-aumentar]")?.addEventListener("click",()=>aumentarItem(indice,tipo));
        div.querySelector("[data-excluir]")?.addEventListener("click",()=>removerDoCarrinho(indice,tipo));
        listaCarrinho.appendChild(div);
    });
    if(totalCarrinho)totalCarrinho.textContent=formatarPreco(total);
    atualizarContadorCarrinho();
}

function aumentarItem(indice,tipo="venda"){
    const produtos=pegarProdutos(),carrinho=pegarCarrinho(),produto=produtos[indice];
    const item=carrinho.find(i=>Number(i.indice)===Number(indice) && tipoDoItemCarrinho(i)===tipo);
    if(!produto||!item)return;
    const estoque=Number(produto.quantidade)||0;
    if(estoque<=0){mostrarAviso("Não há mais unidades desse produto em estoque.");return}
    item.quantidade=Number(item.quantidade||0)+1;produto.quantidade=estoque-1;
    salvarProdutos(produtos);salvarCarrinho(carrinho);mostrarProdutosLoja();mostrarProdutosGerenciamento();mostrarCarrinho();atualizarContadorCarrinho();
    if(produto.quantidade<=0)mostrarAviso(`⚠️ Estoque esgotado!\n\n${produto.nome}\n\nO produto foi ocultado automaticamente da loja.`);
}
function diminuirItem(indice,tipo="venda"){
    const produtos=pegarProdutos(),carrinho=pegarCarrinho(),produto=produtos[indice];
    const posicao=carrinho.findIndex(i=>Number(i.indice)===Number(indice) && tipoDoItemCarrinho(i)===tipo);
    if(!produto||posicao===-1)return;
    const item=carrinho[posicao];
    item.quantidade=Number(item.quantidade||0)-1;produto.quantidade=Number(produto.quantidade||0)+1;
    if(item.quantidade<=0)carrinho.splice(posicao,1);
    salvarProdutos(produtos);salvarCarrinho(carrinho);mostrarProdutosLoja();mostrarProdutosGerenciamento();mostrarCarrinho();atualizarContadorCarrinho();
}
function removerDoCarrinho(indice,tipo="venda"){
    const produtos=pegarProdutos(),carrinho=pegarCarrinho();
    const posicao=carrinho.findIndex(i=>Number(i.indice)===Number(indice) && tipoDoItemCarrinho(i)===tipo);
    if(posicao===-1)return;
    const item=carrinho[posicao],produto=produtos[indice];
    if(produto)produto.quantidade=Number(produto.quantidade||0)+Number(item.quantidade||0);
    carrinho.splice(posicao,1);
    salvarProdutos(produtos);salvarCarrinho(carrinho);mostrarProdutosLoja();mostrarProdutosGerenciamento();mostrarCarrinho();atualizarContadorCarrinho();
}
function configurarLimparCarrinho(){
    if(!limparCarrinho)return;
    limparCarrinho.addEventListener("click",()=>{
        const carrinho=pegarCarrinho();if(!carrinho.length)return;
        if(!confirm("Deseja realmente limpar o carrinho?"))return;
        const produtos=pegarProdutos();
        carrinho.forEach(item=>{const produto=produtos[Number(item.indice)];if(produto)produto.quantidade=Number(produto.quantidade||0)+Number(item.quantidade||0)});
        salvarProdutos(produtos);salvarCarrinho([]);mostrarProdutosLoja();mostrarProdutosGerenciamento();mostrarCarrinho();atualizarContadorCarrinho();
    });
}


function gerarPdfAlertaEstoque(){
    const produtos=pegarProdutos();
    const semEstoque=produtos.filter(p=>Number(p.quantidade||0)<=0);
    if(!semEstoque.length){mostrarAviso("Não há itens no alerta de estoque.");return;}
    if(!window.jspdf || !window.jspdf.jsPDF){mostrarAviso("Não foi possível carregar o gerador de PDF.");return;}
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF();
    const largura=doc.internal.pageSize.getWidth();
    let y=18;
    doc.setFont("helvetica","bold"); doc.setFontSize(18); doc.text("Gustavo Cell",14,y); y+=8;
    doc.setFontSize(13); doc.text("Alerta de estoque",14,y); y+=7;
    doc.setFont("helvetica","normal"); doc.setFontSize(9);
    doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`,14,y); y+=10;
    doc.setDrawColor(220); doc.line(14,y,largura-14,y); y+=8;
    semEstoque.forEach((p,i)=>{
        if(y>275){doc.addPage();y=18;}
        doc.setFont("helvetica","bold");doc.setFontSize(10);
        const nome=String(p.nome||"Produto");
        const linhas=doc.splitTextToSize(`${i+1}. ${nome}`,130);
        doc.text(linhas,14,y);
        doc.setFont("helvetica","normal");doc.text("Estoque: 0",largura-48,y);
        y+=Math.max(8,linhas.length*5+3);
        doc.setDrawColor(235);doc.line(14,y-2,largura-14,y-2);
    });
    doc.save("alerta-estoque-gustavo-cell.pdf");
}
function atualizarAlertaEstoque(){
    const alerta=document.getElementById("alertaEstoque");
    if(!alerta)return;
    const estavaAberto=alerta.querySelector(".alertaEstoqueConteudo")?.classList.contains("aberto")||false;
    const produtos=pegarProdutos();
    const semEstoque=produtos.filter(p=>Number(p.quantidade||0)<=0);
    if(!semEstoque.length){alerta.classList.remove("visivel");alerta.innerHTML="";return;}
    const placeholder="data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 90 90"><rect width="90" height="90" rx="13" fill="#f1f3f6"/><text x="45" y="53" text-anchor="middle" font-family="Arial" font-size="30">📦</text></svg>`);
    const linhas=semEstoque.map(p=>{
        const img=p.imagem||placeholder;
        return `<div class="alertaEstoqueItem"><div class="alertaEstoqueImagem"><img src="${img}" alt="" onerror="this.src='${placeholder}'"></div><div class="alertaEstoqueInfo"><strong>${p.nome||"Produto"}</strong><small>Produto #${produtos.indexOf(p)+1}</small></div><div class="alertaEstoqueQtd"><span>Estoque</span><b>0</b></div><span class="alertaEstoqueStatus">Sem estoque</span></div>`;
    }).join("");
    alerta.innerHTML=`<div class="alertaEstoqueCabecalho ${estavaAberto?'aberto':''}" role="button" tabindex="0" aria-expanded="${estavaAberto}"><div><span class="alertaIcone">⚠️</span><div><strong>Alerta de estoque</strong><small>${semEstoque.length===1?"1 produto sem estoque":semEstoque.length+" produtos sem estoque"}</small></div></div><span class="alertaEstoqueToggle">⌄</span></div><div class="alertaEstoqueConteudo ${estavaAberto?'aberto':''}"><div class="alertaEstoqueConteudoInterno"><div class="alertaEstoqueLista">${linhas}</div><div class="alertaEstoqueAcoes"><button type="button" class="btnPdfEstoque">📄 Gerar PDF dos itens</button></div></div></div>`;
    alerta.classList.add("visivel");
    const cab=alerta.querySelector(".alertaEstoqueCabecalho"), conteudo=alerta.querySelector(".alertaEstoqueConteudo");
    const alternar=()=>{const aberto=!conteudo.classList.contains("aberto");conteudo.classList.toggle("aberto",aberto);cab.classList.toggle("aberto",aberto);cab.setAttribute("aria-expanded",String(aberto));};
    cab.addEventListener("click",alternar);
    cab.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();alternar();}});
    alerta.querySelector(".btnPdfEstoque").addEventListener("click",e=>{e.stopPropagation();gerarPdfAlertaEstoque();});
}
function detectarEstoqueZerado(produtosAntes,produtosDepois){
    const antes=produtosAntes||[];
    const depois=produtosDepois||[];
    const zerados=[];
    depois.forEach((p,i)=>{
        const anterior=antes[i];
        if(Number(p.quantidade||0)<=0 && (!anterior || Number(anterior.quantidade||0)>0)){
            zerados.push(p.nome||"Produto");
        }
    });
    if(zerados.length){
        setTimeout(()=>{
            mostrarAviso(`⚠️ Estoque esgotado!\n\n${zerados.join("\n")}\n\nO produto foi ocultado automaticamente da loja.`);
        },50);
    }
}

/* ADMIN */
function obterProdutosFiltradosAdmin(){
    let produtos=pegarProdutos();
    const texto=(buscaAdmin?.value||"").toLowerCase().trim();
    if(texto)produtos=produtos.filter(p=>String(p.nome||"").toLowerCase().includes(texto));
    const estoqueFiltro=filtroEstoqueAdmin?.value||"todos";
    produtos=produtos.filter(p=>{
        const estoque=Number(p.quantidade)||0;
        if(estoqueFiltro==="disponiveis"&&estoque<=0)return false;
        if(estoqueFiltro==="zerados"&&estoque>0)return false;
        return true;
    });
    return ordenarProdutos(produtos,ordenacaoAdmin?.value||"padrao");
}

function mostrarProdutosGerenciamento(){
    if(!listaProdutos)return;
    garantirIdsProdutos();
    const produtos=obterProdutosFiltradosAdmin();
    atualizarAlertaEstoque();
    listaProdutos.innerHTML="";
    const totalProdutos=document.getElementById("totalProdutos"),semProdutos=document.getElementById("semProdutos");
    if(totalProdutos)totalProdutos.textContent=`${pegarProdutos().length} ${pegarProdutos().length===1?"produto":"produtos"}`;
    if(semProdutos)semProdutos.style.display=produtos.length?"none":"block";
    if(!produtos.length){atualizarSelecionarTodos();return}

    const todos=pegarProdutos();
    produtos.forEach(produto=>{
        const indice=todos.findIndex(p => p === produto || (p.id && produto.id && String(p.id) === String(produto.id))),estoque=Number(produto.quantidade)||0;
        const imagemProduto=produto.imagem||"data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" rx="14" fill="#f1f3f6"/><text x="60" y="67" text-anchor="middle" font-family="Arial" font-size="38">📦</text></svg>`);
        const linha=document.createElement("div");
        linha.className="produtoLista";
        linha.innerHTML=`
            <div class="selecaoProduto"><input type="checkbox" class="selecionarProduto" value="${indice}"></div>
            <div class="produtoInfo"><img src="${imagemProduto}" alt="${produto.nome||"Produto"}" class="produtoListaImagem"><div class="produtoNome"><strong>${produto.nome||"Produto"}</strong><small>Produto #${indice >= 0 ? indice + 1 : 1}</small></div></div>
            <div class="produtoPreco"><span>Venda: ${formatarPreco(produto.preco)}</span><span>Conserto: ${formatarPreco(produto.precoConserto ?? produto.preco)}</span></div>
            <div class="produtoEstoque"><span class="estoqueNumero ${estoque<=0?"estoqueZero":""}">${estoque}</span></div>
            <div class="produtoAcoes"><button class="btnEditar" type="button" data-produto-id="${produto.id}" data-editar="${indice}">✏️ Editar</button><button class="btnExcluir" type="button" data-produto-id="${produto.id}" data-excluir-produto="${indice}">🗑</button></div>`;
        listaProdutos.appendChild(linha);
    });
    configurarSelecaoProdutos();atualizarSelecionarTodos();
}

function textoPDF(valor){
    return String(valor??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
}

function gerarPDFDaListaProdutos(){
    const produtos=obterProdutosFiltradosAdmin();
    if(!produtos.length){
        mostrarAviso("Não há produtos exibidos para gerar o PDF.");
        return;
    }

    const jspdf=window.jspdf;
    if(!jspdf?.jsPDF){
        mostrarAviso("O gerador de PDF ainda não foi carregado. Verifique sua conexão e tente novamente.");
        return;
    }

    const {jsPDF}=jspdf;
    const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
    const margem=14;
    const larguraPagina=210;
    const larguraUtil=larguraPagina-margem*2;
    let y=18;
    const data=new Date();

    doc.setFont("helvetica","bold");
    doc.setFontSize(20);
    doc.text("GustavoCell",margem,y);
    y+=8;
    doc.setFontSize(14);
    doc.text("Lista de produtos exibidos",margem,y);
    y+=6;
    doc.setFont("helvetica","normal");
    doc.setFontSize(9);
    doc.setTextColor(100,100,100);
    doc.text(`Gerado em ${data.toLocaleDateString("pt-BR")} as ${data.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})} - ${produtos.length} ${produtos.length===1?"item":"itens"}`,margem,y);
    doc.setTextColor(0,0,0);
    y+=10;

    const colX=[margem,margem+8,margem+112,margem+146];
    const colW=[8,104,34,36];
    const alturaCab=9, alturaLinha=9;

    function desenharCabecalho(){
        doc.setFillColor(25,25,25);
        doc.rect(margem,y,larguraUtil,alturaCab,"F");
        doc.setTextColor(255,255,255);
        doc.setFont("helvetica","bold");
        doc.setFontSize(9);
        doc.text("#",colX[0]+2,y+6);
        doc.text("Produto",colX[1]+2,y+6);
        doc.text("Preco",colX[2]+2,y+6);
        doc.text("Estoque",colX[3]+2,y+6);
        doc.setTextColor(0,0,0);
        doc.setFont("helvetica","normal");
        y+=alturaCab;
    }

    desenharCabecalho();

    produtos.forEach((produto,index)=>{
        if(y+alturaLinha>282){
            doc.addPage();
            y=18;
            doc.setFont("helvetica","bold");
            doc.setFontSize(12);
            doc.text("GustavoCell - Lista de produtos (continuação)",margem,y);
            y+=7;
            desenharCabecalho();
        }

        if(index%2===0){
            doc.setFillColor(245,245,245);
            doc.rect(margem,y,larguraUtil,alturaLinha,"F");
        }
        doc.setFontSize(8.5);
        doc.text(String(index+1),colX[0]+2,y+6);
        const nome=textoPDF(produto.nome||"Produto");
        const linhas=doc.splitTextToSize(nome,colW[1]-4);
        doc.text(linhas[0]||"Produto",colX[1]+2,y+6);
        doc.text(formatarPreco(produto.preco).replace("R$ ","R$ "),colX[2]+2,y+6);
        doc.text(String(Number(produto.quantidade)||0),colX[3]+2,y+6);
        doc.setDrawColor(220,220,220);
        doc.line(margem,y+alturaLinha,margem+larguraUtil,y+alturaLinha);
        y+=alturaLinha;
    });

    doc.setFontSize(8);
    doc.setTextColor(110,110,110);
    doc.text("Documento gerado pelo painel de produtos GustavoCell.",margem,290);
    doc.save(`GustavoCell-produtos-${data.toISOString().slice(0,10)}.pdf`);
    doc.setTextColor(0,0,0);
    mostrarNotificacaoProduto("PDF gerado com sucesso!",`${produtos.length} ${produtos.length===1?"item":"itens"}`,"📄");
}

function configurarGeracaoPDFProdutos(){
    const botaoSeta=document.getElementById("abrirOpcoesPDFProdutos");
    const menu=document.getElementById("menuPDFProdutos");
    const botaoPDF=document.getElementById("gerarPDFProdutos");
    if(!botaoSeta||!menu||!botaoPDF)return;

    botaoSeta.addEventListener("click",event=>{
        event.stopPropagation();
        const aberto=menu.classList.toggle("aberto");
        botaoSeta.classList.toggle("aberto",aberto);
        botaoSeta.setAttribute("aria-expanded",String(aberto));
        menu.setAttribute("aria-hidden",String(!aberto));
    });

    botaoPDF.addEventListener("click",()=>{
        gerarPDFDaListaProdutos();
        menu.classList.remove("aberto");
        botaoSeta.classList.remove("aberto");
        botaoSeta.setAttribute("aria-expanded","false");
        menu.setAttribute("aria-hidden","true");
    });

    document.addEventListener("click",event=>{
        if(!menu.contains(event.target)&&!botaoSeta.contains(event.target)){
            menu.classList.remove("aberto");
            botaoSeta.classList.remove("aberto");
            botaoSeta.setAttribute("aria-expanded","false");
            menu.setAttribute("aria-hidden","true");
        }
    });
}

function configurarFiltrosAdmin(){
    [buscaAdmin,filtroEstoqueAdmin,ordenacaoAdmin].forEach(el=>el?.addEventListener("input",mostrarProdutosGerenciamento));
    [filtroEstoqueAdmin,ordenacaoAdmin].forEach(el=>el?.addEventListener("change",mostrarProdutosGerenciamento));
}

function configurarSelecaoProdutos(){
    if(!listaProdutos)return;
    listaProdutos.querySelectorAll(".selecionarProduto").forEach(cb=>cb.addEventListener("change",()=>{atualizarContadorSelecionados();atualizarSelecionarTodos()}));
}
function atualizarContadorSelecionados(){
    const contador=document.getElementById("quantidadeSelecionados");
    const n=document.querySelectorAll(".selecionarProduto:checked").length;
    if(contador)contador.textContent=`${n} ${n===1?"selecionado":"selecionados"}`;
    const mostrar=n>1;
    if(botaoRemover){
        const estavaVisivel=botaoRemover.style.display!=="none" && botaoRemover.style.display!=="";
        botaoRemover.style.display=mostrar?"inline-flex":"none";
        if(mostrar && !estavaVisivel){
            botaoRemover.classList.remove("entrando");
            void botaoRemover.offsetWidth;
            botaoRemover.classList.add("entrando");
        }
    }
    if(botaoEditarSelecionados){
        const estavaVisivel=botaoEditarSelecionados.style.display!=="none" && botaoEditarSelecionados.style.display!=="";
        botaoEditarSelecionados.style.display=mostrar?"inline-flex":"none";
        if(mostrar && !estavaVisivel){
            botaoEditarSelecionados.classList.remove("entrando");
            void botaoEditarSelecionados.offsetWidth;
            botaoEditarSelecionados.classList.add("entrando");
        }
    }
}
function atualizarSelecionarTodos(){
    const selecionarTodos=document.getElementById("selecionarTodos");if(!selecionarTodos)return;
    const cbs=document.querySelectorAll(".selecionarProduto"),checked=document.querySelectorAll(".selecionarProduto:checked");
    selecionarTodos.checked=cbs.length>0&&checked.length===cbs.length;
    selecionarTodos.indeterminate=checked.length>0&&checked.length<cbs.length;
    atualizarContadorSelecionados();
}
function configurarSelecionarTodos(){
    const selecionarTodos=document.getElementById("selecionarTodos");if(!selecionarTodos)return;
    selecionarTodos.addEventListener("change",()=>{
        document.querySelectorAll(".selecionarProduto").forEach(cb=>cb.checked=selecionarTodos.checked);
        atualizarSelecionarTodos();
    });
}

/* FILTROS PERSONALIZADOS */
function renderizarListaFiltrosAdmin(){
    if(!listaFiltros)return;
    listaFiltros.innerHTML="";
    const filtros=pegarFiltros();
    if(!filtros.length){
        listaFiltros.innerHTML='<div class="filtroAdminItem"><div class="filtroAdminInfo"><strong>Nenhum filtro criado</strong><small>Crie filtros como Categoria, Marca, Tipo etc.</small></div></div>';
        return;
    }
    filtros.forEach(filtro=>{
        const item=document.createElement("div");item.className="filtroAdminItem";
        const info=document.createElement("div");info.className="filtroAdminInfo";
        info.innerHTML=`<strong>${filtro.nome}</strong><div class="opcoesFiltroAdmin">${(filtro.opcoes||[]).map(o=>`<span class="opcaoBadge">${o.nome}</span>`).join("")}</div>`;
        const btn=document.createElement("button");btn.className="btnExcluirFiltro";btn.type="button";btn.textContent="🗑 Excluir filtro";btn.dataset.excluirFiltro=filtro.id;
        item.append(info,btn);listaFiltros.appendChild(item);
    });
}
function renderizarCamposFiltrosProduto(container,produto=null){
    if(!container)return;
    container.innerHTML="";
    const filtros=pegarFiltros();
    filtros.forEach(filtro=>{
        const campo=document.createElement("div");campo.className="campo";
        const label=document.createElement("label");label.textContent=filtro.nome;
        const select=document.createElement("select");select.dataset.filtroCampo=filtro.id;
        const todos=document.createElement("option");todos.value="";todos.textContent="Selecione";select.appendChild(todos);
        (filtro.opcoes||[]).forEach(op=>{
            const option=document.createElement("option");option.value=op.id;option.textContent=op.nome;
            if(produto?.filtros?.[filtro.id]===op.id)option.selected=true;
            select.appendChild(option);
        });
        campo.append(label,select);container.appendChild(campo);
    });
}
function fecharPainelFiltros(){
    if(!painelFiltrosLoja)return;
    painelFiltrosLoja.classList.remove("aberto");
    painelFiltrosLoja.setAttribute("aria-hidden","true");
    abrirGerenciadorFiltros?.setAttribute("aria-expanded","false");
    document.body.classList.remove("filtrosPainelAberto");
}

function abrirPainelFiltros(){
    if(!painelFiltrosLoja)return;
    painelFiltrosLoja.classList.add("aberto");
    painelFiltrosLoja.setAttribute("aria-hidden","false");
    abrirGerenciadorFiltros?.setAttribute("aria-expanded","true");
    document.body.classList.add("filtrosPainelAberto");
    setTimeout(()=>nomeFiltro?.focus(),180);
}

function configurarPainelFiltros(){
    abrirGerenciadorFiltros?.addEventListener("click",abrirPainelFiltros);
    fecharGerenciadorFiltros?.addEventListener("click",fecharPainelFiltros);
    painelFiltrosLoja?.querySelector(".fundoPainelFiltros")?.addEventListener("click",fecharPainelFiltros);
    document.addEventListener("keydown",event=>{
        if(event.key==="Escape" && painelFiltrosLoja?.classList.contains("aberto"))fecharPainelFiltros();
    });
}

function configurarGerenciamentoFiltros(){
    renderizarListaFiltrosAdmin();
    renderizarCamposFiltrosProduto(camposFiltrosProduto);
    if(adicionarFiltro){
        adicionarFiltro.addEventListener("click",()=>{
            const nome=nomeFiltro?.value.trim()||"";
            const texto=opcoesFiltro?.value.trim()||"";
            const opcoes=texto.split(",").map(x=>x.trim()).filter(Boolean);
            if(!nome||!opcoes.length){mostrarAviso("Informe o nome do filtro e pelo menos uma opção.");return}
            const filtros=pegarFiltros();
            if(filtros.some(f=>f.nome.toLowerCase()===nome.toLowerCase())){mostrarAviso("Já existe um filtro com esse nome.");return}
            const filtro={id:gerarId("filtro"),nome,opcoes:opcoes.map(n=>({id:gerarId("opcao"),nome:n}))};
            filtros.push(filtro);salvarFiltros(filtros);
            if(nomeFiltro)nomeFiltro.value="";if(opcoesFiltro)opcoesFiltro.value="";
            renderizarListaFiltrosAdmin();renderizarCamposFiltrosProduto(camposFiltrosProduto);renderizarFiltrosLoja();
            mostrarAviso("Filtro criado com sucesso! 🚀");
        });
    }
    listaFiltros?.addEventListener("click",event=>{
        const btn=event.target.closest("[data-excluir-filtro]");if(!btn)return;
        const id=btn.dataset.excluirFiltro;
        if(!confirm("Deseja excluir este filtro? Os produtos continuarão cadastrados, mas perderão essa classificação."))return;
        salvarFiltros(pegarFiltros().filter(f=>f.id!==id));
        const produtos=pegarProdutos();produtos.forEach(p=>{if(p.filtros)delete p.filtros[id]});salvarProdutos(produtos);
        renderizarListaFiltrosAdmin();renderizarCamposFiltrosProduto(camposFiltrosProduto);renderizarFiltrosLoja();mostrarProdutosLoja();
    });
}

function coletarFiltrosDoContainer(container){
    const filtros={};
    container?.querySelectorAll("[data-filtro-campo]").forEach(select=>{
        if(select.value)filtros[select.dataset.filtroCampo]=select.value;
    });
    return filtros;
}


function mostrarNotificacaoProduto(titulo, nome, icone="✓") {
    const antiga=document.getElementById("notificacaoProduto");
    if(antiga)antiga.remove();

    const box=document.createElement("div");
    box.id="notificacaoProduto";
    box.className="notificacaoProduto";
    box.innerHTML=`
        <div class="notificacaoProdutoIcone">${icone}</div>
        <div class="notificacaoProdutoTexto">
            <strong>${titulo}</strong>
            <span>${String(nome||"")}</span>
        </div>
        <button type="button" aria-label="Fechar">×</button>
    `;
    document.body.appendChild(box);

    box.querySelector("button")?.addEventListener("click",()=>box.remove());
    requestAnimationFrame(()=>box.classList.add("visivel"));
    setTimeout(()=>{
        box.classList.remove("visivel");
        setTimeout(()=>box.remove(),250);
    },3000);
}


function mostrarAviso(mensagem){
    mostrarNotificacaoProduto("Aviso", mensagem, "⚠");
}

function configurarCadastro(){
    if(!botaoAdicionar)return;
    botaoAdicionar.addEventListener("click",()=>{
        const campoNome=document.getElementById("nomeProduto"),campoPreco=document.getElementById("precoProduto"),campoPrecoConserto=document.getElementById("precoConsertoProduto"),campoQuantidade=document.getElementById("quantidadeProduto"),campoImagem=document.getElementById("imagemProduto");
        if(!campoNome||!campoPreco||!campoPrecoConserto||!campoQuantidade||!campoImagem)return;
        const nome=campoNome.value.trim(),preco=campoPreco.value,precoConserto=campoPrecoConserto.value,quantidade=campoQuantidade.value,imagem=campoImagem.files[0];
        if(!nome||preco===""||precoConserto===""||quantidade===""){mostrarAviso("Informe nome, preço de venda, preço de conserto e estoque. A foto é opcional.");return}
        if(Number(preco)<0||Number(precoConserto)<0||Number(quantidade)<0){mostrarAviso("Os preços e a quantidade não podem ser negativos.");return}

        const salvarNovoProduto=(imagemData="")=>{
            const produtos=pegarProdutos();
            produtos.push({id:gerarId("produto"),nome,preco:Number(preco),precoConserto:Number(precoConserto),quantidade:Number(quantidade),imagem:imagemData,filtros:coletarFiltrosDoContainer(camposFiltrosProduto)});
            salvarProdutos(produtos);
            mostrarProdutosGerenciamento();mostrarProdutosLoja();
            campoNome.value="";campoPreco.value="";campoPrecoConserto.value="";campoQuantidade.value="";campoImagem.value="";
            renderizarCamposFiltrosProduto(camposFiltrosProduto);
            mostrarNotificacaoProduto("Produto cadastrado com sucesso!", nome, "✓");
        };

        if(!imagem){salvarNovoProduto("");return}
        const leitor=new FileReader();
        leitor.onload=()=>salvarNovoProduto(leitor.result);
        leitor.onerror=()=>mostrarAviso("Não foi possível carregar a imagem.");
        leitor.readAsDataURL(imagem);
    });
}


function abrirModalCadastroMultiplos(){
    if(!modalCadastroMultiplos)return;
    modalCadastroMultiplos.classList.add("aberto");
    modalCadastroMultiplos.setAttribute("aria-hidden","false");
    if(!listaCadastroMultiplos.children.length){
        quantidadeLinhasMultiplas=0;
        adicionarLinhaCadastroMultiplo(3);
    }
}

function fecharModalCadastroMultiplos(){
    if(!modalCadastroMultiplos)return;
    modalCadastroMultiplos.classList.remove("aberto");
    modalCadastroMultiplos.setAttribute("aria-hidden","true");
}

function criarCampoFiltroMultiplo(container,filtro){
    const campo=document.createElement("div");
    campo.className="campoMultiploFiltro";

    const label=document.createElement("label");
    label.textContent=filtro.nome||"Filtro";

    const select=document.createElement("select");
    select.dataset.filtroId=filtro.id;
    select.innerHTML='<option value="">Sem classificação</option>';
    (filtro.opcoes||[]).forEach(opcao=>{
        const option=document.createElement("option");
        option.value=opcao.id;
        option.textContent=opcao.nome;
        select.appendChild(option);
    });

    campo.append(label,select);
    container.appendChild(campo);
}

function adicionarLinhaCadastroMultiplo(quantidade=1){
    if(!listaCadastroMultiplos)return;
    const filtros=pegarFiltros();

    for(let i=0;i<quantidade;i++){
        quantidadeLinhasMultiplas++;
        const linha=document.createElement("div");
        linha.className="linhaCadastroMultiplo";
        linha.dataset.linha=quantidadeLinhasMultiplas;

        const cabecalho=document.createElement("div");
        cabecalho.className="cabecalhoLinhaMultipla";

        const numero=document.createElement("strong");
        numero.className="numeroLinhaMultipla";
        numero.textContent=`Produto ${quantidadeLinhasMultiplas}`;

        const remover=document.createElement("button");
        remover.type="button";
        remover.className="removerLinhaMultipla";
        remover.textContent="×";
        remover.title="Remover esta linha";
        remover.addEventListener("click",()=>{
            linha.remove();
            renumerarLinhasMultiplas();
        });

        cabecalho.append(numero,remover);

        const campos=document.createElement("div");
        campos.className="camposLinhaMultipla";

        const criarCampo=(labelTexto,classe,tipo,placeholder)=>{
            const campo=document.createElement("div");
            campo.className=`campoMultiplo ${classe||""}`;
            const label=document.createElement("label");
            label.textContent=labelTexto;
            const input=document.createElement("input");
            input.type=tipo;
            input.placeholder=placeholder;
            if(tipo==="number"){
                input.min="0";
                input.step=classe==="precoMultiplo"?"0.01":"1";
            }
            campo.append(label,input);
            return {campo,input};
        };

        const nome=criarCampo("Nome do produto","nomeMultiplo","text","Ex.: Capa Samsung A14");
        const preco=criarCampo("Preço de venda","precoMultiplo","number","0,00");
        const precoConserto=criarCampo("Preço de conserto","precoConsertoMultiplo","number","0,00");
        const estoque=criarCampo("Estoque","estoqueMultiplo","number","0");

        const campoImagem=document.createElement("div");
        campoImagem.className="campoMultiplo imagemMultiplo";
        const labelImagem=document.createElement("label");
        labelImagem.textContent="Imagem";
        const inputImagem=document.createElement("input");
        inputImagem.type="file";
        inputImagem.accept="image/*";
        campoImagem.append(labelImagem,inputImagem);

        campos.append(nome.campo,preco.campo,precoConserto.campo,estoque.campo,campoImagem);

        const filtrosBox=document.createElement("div");
        filtrosBox.className="filtrosLinhaMultipla";
        if(filtros.length){
            const titulo=document.createElement("div");
            titulo.className="tituloFiltrosMultiplo";
            titulo.textContent="Classificação";
            filtrosBox.appendChild(titulo);
            filtros.forEach(f=>criarCampoFiltroMultiplo(filtrosBox,f));
        }

        linha.append(cabecalho,campos);
        if(filtros.length)linha.appendChild(filtrosBox);
        listaCadastroMultiplos.appendChild(linha);
    }
}

function renumerarLinhasMultiplas(){
    if(!listaCadastroMultiplos)return;
    [...listaCadastroMultiplos.querySelectorAll(".linhaCadastroMultiplo")].forEach((linha,index)=>{
        const numero=linha.querySelector(".numeroLinhaMultipla");
        if(numero)numero.textContent=`Produto ${index+1}`;
    });
}

function lerImagemComoDataURL(arquivo){
    return new Promise((resolve,reject)=>{
        if(!arquivo){resolve("");return}
        const leitor=new FileReader();
        leitor.onload=()=>resolve(leitor.result||"");
        leitor.onerror=()=>reject(new Error("Não foi possível carregar uma das imagens."));
        leitor.readAsDataURL(arquivo);
    });
}

async function cadastrarProdutosMultiplos(){
    if(!listaCadastroMultiplos)return;

    const linhas=[...listaCadastroMultiplos.querySelectorAll(".linhaCadastroMultiplo")];
    const produtosParaCadastrar=[];
    const erros=[];

    for(let i=0;i<linhas.length;i++){
        const linha=linhas[i];
        const nome=linha.querySelector(".nomeMultiplo input")?.value.trim()||"";
        const precoTexto=linha.querySelector(".precoMultiplo input")?.value||"";
        const precoConsertoTexto=linha.querySelector(".precoConsertoMultiplo input")?.value||"";
        const estoqueTexto=linha.querySelector(".estoqueMultiplo input")?.value||"";
        const imagem=linha.querySelector(".imagemMultiplo input")?.files?.[0]||null;

        const linhaVazia=!nome && precoTexto==="" && precoConsertoTexto==="" && estoqueTexto==="" && !imagem;
        if(linhaVazia)continue;

        const preco=Number(precoTexto);
        const precoConserto=Number(precoConsertoTexto);
        const estoque=Number(estoqueTexto);

        if(!nome||precoTexto===""||precoConsertoTexto===""||estoqueTexto===""){
            erros.push(`Produto ${i+1}: informe nome, os dois preços e estoque.`);
            continue;
        }
        if(!Number.isFinite(preco)||!Number.isFinite(precoConserto)||!Number.isFinite(estoque)||preco<0||precoConserto<0||estoque<0){
            erros.push(`Produto ${i+1}: preços e estoque devem ser válidos e não negativos.`);
            continue;
        }

        const filtros={};
        linha.querySelectorAll(".campoMultiploFiltro select").forEach(select=>{
            if(select.value)filtros[select.dataset.filtroId]=select.value;
        });

        try{
            const imagemData=await lerImagemComoDataURL(imagem);
            produtosParaCadastrar.push({
                id:gerarId("produto"),
                nome,
                preco,
                precoConserto,
                quantidade:estoque,
                imagem:imagemData,
                filtros
            });
        }catch(erro){
            erros.push(`Produto ${i+1}: ${erro.message}`);
        }
    }

    if(erros.length){
        mostrarAviso(erros.join("\n"));
        return;
    }

    if(!produtosParaCadastrar.length){
        mostrarAviso("Preencha pelo menos um produto para cadastrar.");
        return;
    }

    const produtos=pegarProdutos();
    produtos.push(...produtosParaCadastrar);
    salvarProdutos(produtos);

    mostrarProdutosGerenciamento();
    mostrarProdutosLoja();
    renderizarCamposFiltrosProduto(camposFiltrosProduto);
    fecharModalCadastroMultiplos();

    const nomes=produtosParaCadastrar.map(p=>p.nome).join(", ");
    mostrarNotificacaoProduto(
        `${produtosParaCadastrar.length} ${produtosParaCadastrar.length===1?"produto cadastrado":"produtos cadastrados"} com sucesso!`,
        nomes,
        "✓"
    );

    listaCadastroMultiplos.innerHTML="";
    quantidadeLinhasMultiplas=0;
}

function configurarCadastroMultiplos(){
    if(!abrirCadastroMultiplos)return;

    abrirCadastroMultiplos.addEventListener("click",abrirModalCadastroMultiplos);
    fecharCadastroMultiplos?.addEventListener("click",fecharModalCadastroMultiplos);
    cancelarCadastroMultiplos?.addEventListener("click",fecharModalCadastroMultiplos);
    adicionarLinhaMultipla?.addEventListener("click",()=>adicionarLinhaCadastroMultiplo(1));
    confirmarCadastroMultiplos?.addEventListener("click",cadastrarProdutosMultiplos);

    modalCadastroMultiplos?.querySelector(".modalFundo")?.addEventListener("click",fecharModalCadastroMultiplos);
}

function normalizarTextoPDF(texto){
    return String(texto||"")
        .replace(/\u00a0/g," ")
        .replace(/[\t\r]+/g," ")
        .replace(/ +/g," ")
        .trim();
}

function converterNumeroPDF(valor){
    let texto=String(valor||"").replace(/R\$|RS|\$/gi,"").trim().replace(/ /g,"");
    if(texto.includes(","))texto=texto.replace(/\./g,"").replace(",", ".");
    return Number(texto);
}

function extrairItemDaLinhaPDF(linha){
    let texto=normalizarTextoPDF(linha);
    if(!texto||texto.length<2)return null;

    // Ignora linhas típicas de cabeçalho/rodapé de orçamento.
    if(/^(total|subtotal|valor total|data|cliente|cnpj|cpf|telefone|endereço|descrição|produto|quantidade|qtd|preço|valor|orçamento|pedido|página|page)\b/i.test(texto))return null;

    const precoRegex=/(?:R\$|RS|\$)?\s*\d{1,3}(?:[. ]\d{3})*(?:,\d{2}|\.\d{2})|(?:R\$|RS|\$)?\s*\d+(?:,\d{2}|\.\d{2})/gi;
    const precos=texto.match(precoRegex);
    if(!precos||!precos.length)return null;

    const ultimoPreco=precos[precos.length-1];
    const preco=converterNumeroPDF(ultimoPreco);
    if(!Number.isFinite(preco)||preco<0)return null;

    const indicePreco=texto.lastIndexOf(ultimoPreco);
    let nome=texto.slice(0,indicePreco).trim();
    let resto=texto.slice(indicePreco+ultimoPreco.length).trim();

    // Se o PDF colocou a quantidade depois do preço, aproveita.
    let quantidade=null;
    const qtdDepois=resto.match(/^(?:x|qtd(?:ade)?\.?|quantidade)\s*[:x-]?\s*(\d+)/i);
    if(qtdDepois)quantidade=Number(qtdDepois[1]);
    const qtdAntes=nome.match(/(?:\s|^)(?:x|qtd(?:ade)?\.?|quantidade)\s*[:x-]?\s*(\d+)\s*$/i);
    if(qtdAntes){quantidade=Number(qtdAntes[1]);nome=nome.slice(0,qtdAntes.index).trim()}
    if(!nome)nome=texto.replace(ultimoPreco,"").trim();
    if(nome.length<2)return null;

    // Remove separadores de tabela que podem vir da extração.
    nome=nome.replace(/[|;]+$/g,"").replace(/^[|;]+/g,"").trim();
    if(!nome)return null;

    return {nome,preco,quantidade:Number.isFinite(quantidade)&&quantidade>0?quantidade:1};
}

function extrairItensDoTextoPDF(texto){
    const linhas=String(texto||"").split(/\n+/).map(normalizarTextoPDF).filter(Boolean);
    const itens=[];
    const vistos=new Set();
    linhas.forEach(linha=>{
        const item=extrairItemDaLinhaPDF(linha);
        if(!item)return;
        const chave=(item.nome+"|"+item.preco+"|"+item.quantidade).toLowerCase();
        if(vistos.has(chave))return;
        vistos.add(chave);itens.push(item);
    });
    return itens;
}

function renderizarItensImportacaoPDF(){
    if(!listaImportacaoPDF)return;
    if(!itensImportacaoPDF.length){
        listaImportacaoPDF.innerHTML='<div class="importacaoVazia"><strong>Nenhum item foi identificado.</strong><span>O PDF precisa conter linhas com nome do produto e preço. Se quiser, me envie um PDF de exemplo para eu adaptar o importador ao formato dele.</span></div>';
        if(confirmarImportacaoPDF)confirmarImportacaoPDF.disabled=true;
        return;
    }
    if(confirmarImportacaoPDF)confirmarImportacaoPDF.disabled=false;
    listaImportacaoPDF.innerHTML=itensImportacaoPDF.map((item,index)=>`
        <div class="itemImportacaoPDF" data-importacao-index="${index}">
            <input type="checkbox" class="selecionarImportacaoPDF" checked>
            <input type="text" class="nomeImportacaoPDF" value="${String(item.nome).replace(/&/g,"&amp;").replace(/\"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}" aria-label="Nome do produto">
            <input type="number" class="precoImportacaoPDF campoImportacaoPreco" min="0" step="0.01" value="${Number(item.preco).toFixed(2)}" aria-label="Preço">
            <input type="number" class="quantidadeImportacaoPDF campoImportacaoQtd" min="0" step="1" value="${Number(item.quantidade)||1}" aria-label="Estoque">
        </div>`).join("");
}

function abrirModalImportacaoPDF(){
    modalImportarPDF?.classList.add("aberto");
    if(statusImportacaoPDF)statusImportacaoPDF.textContent=`${itensImportacaoPDF.length} item(ns) identificado(s). A foto é opcional e poderá ser colocada depois.`;
}
function fecharModalImportacaoPDF(){
    modalImportarPDF?.classList.remove("aberto");
    if(arquivoImportarPDF)arquivoImportarPDF.value="";
    itensImportacaoPDF=[];
    if(listaImportacaoPDF)listaImportacaoPDF.innerHTML="";
}

async function processarPDFImportado(arquivo){
    if(!arquivo)return;
    if(!window.pdfjsLib){mostrarAviso("Não foi possível carregar o leitor de PDF. Verifique sua conexão com a internet e tente novamente.");return}
    try{
        if(statusImportacaoPDF)statusImportacaoPDF.textContent="Lendo o PDF...";
        const dados=new Uint8Array(await arquivo.arrayBuffer());
        const pdf=await window.pdfjsLib.getDocument({data:dados,disableWorker:true}).promise;
        let textoCompleto="";
        for(let pagina=1;pagina<=pdf.numPages;pagina++){
            const page=await pdf.getPage(pagina);
            const content=await page.getTextContent();
            const linhasPorY=new Map();
            content.items.forEach(item=>{
                const texto=normalizarTextoPDF(item.str||"");
                if(!texto)return;
                const transform=item.transform||[];
                const x=Number(transform[4])||0;
                const y=Number(transform[5])||0;
                const chave=Math.round(y/2)*2;
                if(!linhasPorY.has(chave))linhasPorY.set(chave,[]);
                linhasPorY.get(chave).push({x,texto});
            });
            Array.from(linhasPorY.entries())
                .sort((a,b)=>b[0]-a[0])
                .forEach(([,itensLinha])=>{
                    itensLinha.sort((a,b)=>a.x-b.x);
                    textoCompleto+=itensLinha.map(item=>item.texto).join(" ")+"\n";
                });
        }
        itensImportacaoPDF=extrairItensDoTextoPDF(textoCompleto);
        renderizarItensImportacaoPDF();
        abrirModalImportacaoPDF();
        if(statusImportacaoPDF&&itensImportacaoPDF.length)statusImportacaoPDF.textContent=`${itensImportacaoPDF.length} item(ns) identificado(s). Confira nome, preço e estoque antes de adicionar. A foto é opcional.`;
    }catch(erro){
        console.error("Erro ao ler PDF:",erro);
        mostrarAviso("Não consegui ler esse PDF. Se ele for uma imagem/scan, me envie um exemplo para eu adaptar o sistema para OCR.");
        fecharModalImportacaoPDF();
    }
}

function confirmarItensImportacaoPDF(){
    const linhas=Array.from(listaImportacaoPDF?.querySelectorAll(".itemImportacaoPDF")||[]);
    const novos=[];
    linhas.forEach(linha=>{
        const checkbox=linha.querySelector(".selecionarImportacaoPDF");
        if(!checkbox?.checked)return;
        const nome=linha.querySelector(".nomeImportacaoPDF")?.value.trim()||"";
        const preco=Number(linha.querySelector(".precoImportacaoPDF")?.value);
        const quantidade=Number(linha.querySelector(".quantidadeImportacaoPDF")?.value);
        if(!nome||!Number.isFinite(preco)||preco<0||!Number.isFinite(quantidade)||quantidade<0)return;
        novos.push({id:gerarId("produto"),nome,preco,quantidade,imagem:"",filtros:{}});
    });
    if(!novos.length){mostrarAviso("Selecione pelo menos um item válido para importar.");return}
    const produtos=pegarProdutos();
    produtos.push(...novos);
    salvarProdutos(produtos);
    fecharModalImportacaoPDF();
    mostrarProdutosGerenciamento();mostrarProdutosLoja();
    mostrarAviso(`${novos.length} item(ns) adicionado(s) com sucesso! 🚀\n\nAs fotos ficaram vazias e podem ser adicionadas depois em Editar.`);
}

function configurarImportadorPDF(){
    abrirImportadorPDF?.addEventListener("click",()=>arquivoImportarPDF?.click());
    arquivoImportarPDF?.addEventListener("change",()=>{const arquivo=arquivoImportarPDF.files?.[0];if(arquivo)processarPDFImportado(arquivo)});
    fecharImportadorPDF?.addEventListener("click",fecharModalImportacaoPDF);
    cancelarImportacaoPDF?.addEventListener("click",fecharModalImportacaoPDF);
    modalImportarPDF?.querySelector(".modalFundo")?.addEventListener("click",fecharModalImportacaoPDF);
    confirmarImportacaoPDF?.addEventListener("click",confirmarItensImportacaoPDF);
    document.addEventListener("keydown",event=>{if(event.key==="Escape"&&modalImportarPDF?.classList.contains("aberto"))fecharModalImportacaoPDF()});
}


function removerProduto(indice){
    const produtos=pegarProdutos();if(!produtos[indice])return;
    if(!confirm(`Deseja remover o produto "${produtos[indice].nome}"?`))return;
    produtos.splice(indice,1);salvarProdutos(produtos);ajustarIndicesCarrinhoDepoisDeRemover([indice]);
    mostrarProdutosGerenciamento();mostrarProdutosLoja();mostrarCarrinho();atualizarContadorCarrinho();
    mostrarNotificacaoProduto("Produto removido com sucesso!", nome, "✓");
}
function removerProdutoPorId(id){
    const indice=encontrarIndiceProdutoPorId(id);
    if(indice>=0)removerProduto(indice);
}
function configurarRemocao(){
    if(!botaoRemover)return;
    botaoRemover.addEventListener("click",()=>{
        const selecionados=document.querySelectorAll(".selecionarProduto:checked");
        if(!selecionados.length){mostrarAviso("Selecione pelo menos um produto.");return}
        const indices=Array.from(selecionados).map(cb=>Number(cb.value)).sort((a,b)=>b-a);
        if(!confirm(`Deseja remover ${indices.length} produto(s) selecionado(s)?`))return;
        const produtos=pegarProdutos();indices.forEach(i=>produtos.splice(i,1));salvarProdutos(produtos);
        ajustarIndicesCarrinhoDepoisDeRemover(indices);mostrarProdutosGerenciamento();mostrarProdutosLoja();mostrarCarrinho();atualizarContadorCarrinho();
        const nomesRemovidos = indices.map(i => produtos[i]?.nome).filter(Boolean);
        mostrarNotificacaoProduto("Produto(s) removido(s) com sucesso!", nomesRemovidos.length === 1 ? nomesRemovidos[0] : `${nomesRemovidos.length} produtos removidos`, "✓");
    });
}
function ajustarIndicesCarrinhoDepoisDeRemover(indicesRemovidos){
    let carrinho=pegarCarrinho();
    const removidos=[...indicesRemovidos].sort((a,b)=>a-b);
    carrinho=carrinho.filter(item=>!removidos.includes(Number(item.indice)));
    carrinho=carrinho.map(item=>{
        const indiceAtual=Number(item.indice);
        const quantidadeAntes=removidos.filter(indice=>indice<indiceAtual).length;
        return {indice:indiceAtual-quantidadeAntes,quantidade:Number(item.quantidade)||0};
    });
    salvarCarrinho(carrinho);
}

function abrirModalEditar(indice){
    const produtos=pegarProdutos(),produto=produtos[indice];if(!produto)return;
    produtoEditando=indice;
    if(editarNome)editarNome.value=produto.nome||"";
    if(editarPreco)editarPreco.value=Number(produto.preco||0);
    if(editarPrecoConserto)editarPrecoConserto.value=Number(produto.precoConserto ?? produto.preco ?? 0);
    if(editarQuantidade)editarQuantidade.value=Number(produto.quantidade||0);
    if(editarImagem)editarImagem.value="";
    if(previewImagemEditar)previewImagemEditar.src=produto.imagem||"";
    renderizarCamposFiltrosProduto(camposFiltrosEdicao,produto);
    modalEditar?.classList.add("aberto");
}
function fecharModal(){modalEditar?.classList.remove("aberto");produtoEditando=null}
function salvarProdutoEditado(){
    if(produtoEditando===null)return;
    const produtos=pegarProdutos(),produto=produtos[produtoEditando];if(!produto){fecharModal();return}
    const nome=editarNome.value.trim(),preco=Number(editarPreco.value),precoConserto=Number(editarPrecoConserto.value),quantidade=Number(editarQuantidade.value);
    if(!nome){mostrarAviso("Digite o nome do produto.");return}
    if(Number.isNaN(preco)||preco<0||Number.isNaN(precoConserto)||precoConserto<0){mostrarAviso("Digite preços de venda e conserto válidos.");return}
    if(Number.isNaN(quantidade)||quantidade<0){mostrarAviso("Digite uma quantidade válida.");return}
    produto.nome=nome;produto.preco=preco;produto.precoConserto=precoConserto;produto.quantidade=quantidade;produto.filtros=coletarFiltrosDoContainer(camposFiltrosEdicao);
    const estoqueEsgotado=quantidade<=0;
    const nomeEstoqueEsgotado=produto.nome;
    const arquivo=editarImagem?.files[0];
    if(arquivo){
        const leitor=new FileReader();
        leitor.onload=()=>{produto.imagem=leitor.result;salvarProdutos(produtos);finalizarEdicaoProduto(nome);if(estoqueEsgotado)mostrarAviso(`⚠️ Estoque esgotado!\n\n${nomeEstoqueEsgotado}\n\nO produto foi ocultado automaticamente da loja.`)};
        leitor.onerror=()=>mostrarAviso("Não foi possível carregar a nova imagem.");
        leitor.readAsDataURL(arquivo);return;
    }
    salvarProdutos(produtos);finalizarEdicaoProduto(nome);
    if(estoqueEsgotado)mostrarAviso(`⚠️ Estoque esgotado!\n\n${nomeEstoqueEsgotado}\n\nO produto foi ocultado automaticamente da loja.`);
}
function finalizarEdicaoProduto(nomeProduto){fecharModal();mostrarProdutosGerenciamento();mostrarProdutosLoja();mostrarCarrinho();mostrarNotificacaoProduto("Produto atualizado com sucesso!", nomeProduto, "✓")}
function configurarPreviewImagem(){
    if(!editarImagem||!previewImagemEditar)return;
    editarImagem.addEventListener("change",()=>{
        const arquivo=editarImagem.files[0];if(!arquivo)return;
        const leitor=new FileReader();leitor.onload=()=>previewImagemEditar.src=leitor.result;leitor.readAsDataURL(arquivo);
    });
}
function configurarEventosListaProdutos(){
    if(!listaProdutos)return;
    listaProdutos.addEventListener("click",event=>{
        const editar=event.target.closest(".btnEditar");
        if(editar && listaProdutos.contains(editar)){
            event.preventDefault();
            event.stopPropagation();
            const id=editar.dataset.produtoId;
            if(id)abrirModalEditar(encontrarIndiceProdutoPorId(id));
            else abrirModalEditar(Number(editar.dataset.editar));
            return;
        }
        const excluir=event.target.closest(".btnExcluir");
        if(excluir && listaProdutos.contains(excluir)){
            event.preventDefault();
            event.stopPropagation();
            const id=excluir.dataset.produtoId;
            if(id)removerProdutoPorId(id);
            else removerProduto(Number(excluir.dataset.excluirProduto));
        }
    });
}
function abrirModalEditarSelecionados(){
    const selecionados=Array.from(document.querySelectorAll(".selecionarProduto:checked"));
    if(selecionados.length<2){mostrarAviso("Selecione pelo menos 2 produtos para editar em lote.");return}
    const produtos=pegarProdutos();
    if(quantidadeEdicaoLote)quantidadeEdicaoLote.textContent=`${selecionados.length} produtos selecionados`;
    if(listaEdicaoLote){
        listaEdicaoLote.innerHTML=selecionados.map((cb,pos)=>{
            const indice=Number(cb.value),produto=produtos[indice];
            if(!produto)return "";
            const preco=Number(produto.preco||0),conserto=Number(produto.precoConserto ?? produto.preco ?? 0),estoque=Number(produto.quantidade||0);
            return `<div class="itemEdicaoLote" data-indice="${indice}">
                <div class="cabecalhoItemEdicaoLote">
                    <div class="numeroItemEdicaoLote">${pos+1}</div>
                    <div class="imagemItemEdicaoLote"><img src="${produto.imagem||''}" alt=""></div>
                    <div class="nomeItemEdicaoLote"><strong>${escapeHTML(produto.nome||'Produto')}</strong><small>Valores atuais editáveis</small></div>
                </div>
                <div class="camposItemEdicaoLote">
                    <div class="campo">
                        <label>Preço de venda</label>
                        <input class="lotePrecoVenda" type="number" min="0" step="0.01" value="${preco}">
                    </div>
                    <div class="campo">
                        <label>Preço de conserto</label>
                        <input class="lotePrecoConserto" type="number" min="0" step="0.01" value="${conserto}">
                    </div>
                    <div class="campo">
                        <label>Estoque</label>
                        <input class="loteEstoque" type="number" min="0" step="1" value="${estoque}">
                    </div>
                </div>
            </div>`;
        }).join("");
    }
    modalEditarSelecionados?.classList.add("aberto");
}
function escapeHTML(valor){
    return String(valor??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[char]));
}
function fecharModalEditarSelecionadosFunc(){modalEditarSelecionados?.classList.remove("aberto")}
function salvarProdutosSelecionados(){
    const itens=Array.from(document.querySelectorAll("#listaEdicaoLote .itemEdicaoLote"));
    if(itens.length<2){mostrarAviso("Selecione pelo menos 2 produtos.");return}
    const produtos=pegarProdutos();
    let alterados=0;
    for(const item of itens){
        const indice=Number(item.dataset.indice),produto=produtos[indice];
        if(!produto)continue;
        const venda=Number(item.querySelector(".lotePrecoVenda")?.value);
        const conserto=Number(item.querySelector(".lotePrecoConserto")?.value);
        const estoque=Number(item.querySelector(".loteEstoque")?.value);
        if(!Number.isFinite(venda)||venda<0){mostrarAviso(`Preço de venda inválido em: ${produto.nome}`);return}
        if(!Number.isFinite(conserto)||conserto<0){mostrarAviso(`Preço de conserto inválido em: ${produto.nome}`);return}
        if(!Number.isFinite(estoque)||estoque<0){mostrarAviso(`Estoque inválido em: ${produto.nome}`);return}
        produto.preco=venda;produto.precoConserto=conserto;produto.quantidade=estoque;alterados++;
    }
    salvarProdutos(produtos);
    fecharModalEditarSelecionadosFunc();
    mostrarProdutosGerenciamento();mostrarProdutosLoja();mostrarCarrinho();
    mostrarNotificacaoProduto("Produtos atualizados com sucesso!",`${alterados} produtos editados` ,"✓");
}

function configurarModalEditar(){
    fecharModalEditar?.addEventListener("click",fecharModal);
    cancelarEdicao?.addEventListener("click",fecharModal);
    salvarEdicao?.addEventListener("click",salvarProdutoEditado);
    modalEditar?.querySelector(".modalFundo")?.addEventListener("click",fecharModal);

    botaoEditarSelecionados?.addEventListener("click",abrirModalEditarSelecionados);
    fecharModalEditarSelecionados?.addEventListener("click",fecharModalEditarSelecionadosFunc);
    cancelarEdicaoSelecionados?.addEventListener("click",fecharModalEditarSelecionadosFunc);
    salvarEdicaoSelecionados?.addEventListener("click",salvarProdutosSelecionados);
    modalEditarSelecionados?.querySelector(".modalFundo")?.addEventListener("click",fecharModalEditarSelecionadosFunc);

    document.addEventListener("keydown",event=>{
        if(event.key!=="Escape")return;
        if(modalEditar?.classList.contains("aberto"))fecharModal();
        if(modalEditarSelecionados?.classList.contains("aberto"))fecharModalEditarSelecionadosFunc();
    });
}

/* IMPRESSÃO */
function imprimirPedido(){
    const carrinho=pegarCarrinho(),produtos=pegarProdutos();
    if(!carrinho.length){mostrarAviso("Seu carrinho está vazio.");return}
    const agora=new Date(),data=agora.toLocaleDateString("pt-BR"),hora=agora.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"}),numeroPedido=String(Date.now()).slice(-6);
    let total=0,quantidadeTotal=0,itensHTML="";
    carrinho.forEach(item=>{
        const produto=produtos[Number(item.indice)];if(!produto)return;
        const quantidade=Number(item.quantidade)||0,tipo=tipoDoItemCarrinho(item),preco=tipo==="conserto"?Number(produto.precoConserto ?? produto.preco)||0:Number(produto.preco)||0,subtotal=preco*quantidade;
        total+=subtotal;quantidadeTotal+=quantidade;
        itensHTML+=`<tr><td><strong>${produto.nome}</strong><br><small>${tipo==="conserto"?"Conserto":"Venda"}</small></td><td class="centralizado">${quantidade}</td><td class="direita">${formatarPreco(preco)}</td><td class="direita">${formatarPreco(subtotal)}</td></tr>`;
    });
    const janela=window.open("","_blank","width=900,height=800");
    if(!janela){mostrarAviso("A janela de impressão foi bloqueada pelo navegador. Permita pop-ups para continuar.");return}
    janela.document.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Pedido ${numeroPedido} - GustavoCell</title><style>*{box-sizing:border-box}body{margin:0;padding:40px;background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif}.pedido{width:100%;max-width:850px;margin:auto}.cabecalho{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #111;padding-bottom:20px;margin-bottom:25px}.logo{display:flex;align-items:center;gap:10px;font-size:30px;font-weight:800}.logo img{width:55px;height:55px;object-fit:contain}.titulo{text-align:right}.titulo h1{margin:0;font-size:24px}.titulo p{margin-top:5px;color:#666}.informacoes{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-bottom:25px}.informacao{padding:15px;border:1px solid #ddd;border-radius:8px;background:#f7f7f7}.informacao span{display:block;color:#777;font-size:11px;text-transform:uppercase;margin-bottom:5px}table{width:100%;border-collapse:collapse}th{background:#111;color:#fff;padding:13px;text-align:left}td{padding:13px;border-bottom:1px solid #ddd}.centralizado{text-align:center}.direita{text-align:right}.totalArea{display:flex;justify-content:flex-end;gap:30px;align-items:center;margin-top:25px;padding-top:20px;border-top:2px solid #111}.totalArea strong{font-size:28px}.rodape{text-align:center;margin-top:50px;padding-top:20px;border-top:1px solid #ddd;color:#777;font-size:13px;line-height:1.6}@media print{body{padding:0}}</style></head><body><div class="pedido"><div class="cabecalho"><div class="logo"><img src="logo.png" alt="GC"><span>GustavoCell</span></div><div class="titulo"><h1>Pedido de compra</h1><p>Nº ${numeroPedido}</p></div></div><div class="informacoes"><div class="informacao"><span>Data</span><strong>${data}</strong></div><div class="informacao"><span>Hora</span><strong>${hora}</strong></div><div class="informacao"><span>Quantidade de itens</span><strong>${quantidadeTotal}</strong></div></div><table><thead><tr><th>Produto</th><th style="text-align:center">Qtd.</th><th style="text-align:right">Preço unitário</th><th style="text-align:right">Subtotal</th></tr></thead><tbody>${itensHTML}</tbody></table><div class="totalArea"><strong>TOTAL</strong><strong>${formatarPreco(total)}</strong></div><div class="rodape"><strong>GustavoCell Shop</strong><br>Pedido gerado em ${data} às ${hora}<br>Obrigado pela preferência!</div></div><script>window.onload=function(){setTimeout(function(){window.print()},300)};<\/script></body></html>`);
    janela.document.close();
    // O estoque já foi descontado ao adicionar os itens ao carrinho.
    // Finalizar a compra esvazia o carrinho sem devolver unidades ao estoque.
    salvarCarrinho([]);
    mostrarCarrinho();
    atualizarContadorCarrinho();
    mostrarProdutosLoja();
    mostrarProdutosGerenciamento();
    fecharPainelCarrinho();
}

function configurarEventosCarrinho(){
    botaoCarrinho?.addEventListener("click",abrirCarrinho);
    fecharCarrinho?.addEventListener("click",fecharPainelCarrinho);
    carrinhoOverlay?.addEventListener("click",event=>{if(event.target===carrinhoOverlay)fecharPainelCarrinho()});
    finalizarCompra?.addEventListener("click",imprimirPedido);
}


function pegarSolicitacoes(){
    try{
        const dados=localStorage.getItem("solicitacoesClientes");
        if(!dados)return [];
        const solicitacoes=JSON.parse(dados);
        return Array.isArray(solicitacoes)?solicitacoes:[];
    }catch(erro){console.error("Erro ao carregar solicitações:",erro);return []}
}
function salvarSolicitacoes(solicitacoes){localStorage.setItem("solicitacoesClientes",JSON.stringify(solicitacoes))}
function escaparHTML(valor){
    return String(valor??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
}
function formatarDataSolicitacao(data){
    const d=new Date(data);
    if(Number.isNaN(d.getTime()))return "";
    return d.toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"});
}
function renderizarSolicitacoes(){
    if(!listaSolicitacoes)return;
    const solicitacoes=pegarSolicitacoes().sort((a,b)=>Number(b.data||0)-Number(a.data||0));
    if(contadorSolicitacoes)contadorSolicitacoes.textContent=`${solicitacoes.length} ${solicitacoes.length===1?"solicitação":"solicitações"}`;
    listaSolicitacoes.innerHTML="";
    if(!solicitacoes.length){
        if(semSolicitacoes)semSolicitacoes.style.display="block";
        return;
    }
    if(semSolicitacoes)semSolicitacoes.style.display="none";
    solicitacoes.forEach(solicitacao=>{
        const item=document.createElement("article");
        item.className="solicitacaoCliente";
        item.innerHTML=`
            <div class="solicitacaoIcone">💬</div>
            <div class="solicitacaoInfo">
                <strong>${escaparHTML(solicitacao.produto)}</strong>
                <small>Solicitado em ${formatarDataSolicitacao(solicitacao.data)}</small>
            </div>
            <button type="button" class="btnAtenderSolicitacao" data-solicitacao-id="${escaparHTML(solicitacao.id)}">✓ Atendido</button>`;
        listaSolicitacoes.appendChild(item);
    });
}
function marcarTodasSolicitacoesAtendidas(){
    const solicitacoes=pegarSolicitacoes();
    if(!solicitacoes.length){
        mostrarAviso("Não há solicitações pendentes.");
        return;
    }
    if(!confirm(`Marcar todas as ${solicitacoes.length} solicitações como atendidas? Elas serão removidas da lista.`))return;
    salvarSolicitacoes([]);
    renderizarSolicitacoes();
    mostrarNotificacaoProduto("Todas atendidas!","Todas as solicitações foram removidas da lista.","✓");
}
function abrirModalNecessitaAlgo(){
    if(!modalNecessitaAlgo)return;
    modalNecessitaAlgo.classList.add("aberto");
    modalNecessitaAlgo.setAttribute("aria-hidden","false");
    if(abrirNecessitaAlgo)abrirNecessitaAlgo.setAttribute("aria-expanded","true");
    setTimeout(()=>produtoSolicitado?.focus(),50);
}
function fecharModalNecessitaAlgo(){
    if(!modalNecessitaAlgo)return;
    modalNecessitaAlgo.classList.remove("aberto");
    modalNecessitaAlgo.setAttribute("aria-hidden","true");
    if(abrirNecessitaAlgo)abrirNecessitaAlgo.setAttribute("aria-expanded","false");
}
function enviarSolicitacaoCliente(){
    const nome=String(produtoSolicitado?.value||"").trim();
    if(!nome){mostrarAviso("Digite o nome do produto que você procura.");produtoSolicitado?.focus();return}
    const solicitacoes=pegarSolicitacoes();
    solicitacoes.push({id:gerarId("solicitacao"),produto:nome,data:Date.now()});
    salvarSolicitacoes(solicitacoes);
    if(produtoSolicitado)produtoSolicitado.value="";
    fecharModalNecessitaAlgo();
    mostrarNotificacaoProduto("Solicitação enviada!",nome,"✓");
}
function gerarPDFDasSolicitacoes(){
    const solicitacoes=pegarSolicitacoes().sort((a,b)=>Number(b.data||0)-Number(a.data||0));
    if(!solicitacoes.length){
        mostrarAviso("Não há solicitações para gerar o PDF.");
        return;
    }

    const jspdf=window.jspdf;
    if(!jspdf?.jsPDF){
        mostrarAviso("O gerador de PDF ainda não foi carregado. Verifique sua conexão e tente novamente.");
        return;
    }

    const {jsPDF}=jspdf;
    const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
    const margem=14, larguraPagina=210, larguraUtil=larguraPagina-margem*2;
    const data=new Date();
    let y=18;

    doc.setFont("helvetica","bold");
    doc.setFontSize(20);
    doc.text("GustavoCell",margem,y);
    y+=8;
    doc.setFontSize(14);
    doc.text("SOLICITAÇÕES",margem,y);
    y+=6;
    doc.setFont("helvetica","normal");
    doc.setFontSize(9);
    doc.setTextColor(100,100,100);
    doc.text("O que os clientes estão procurando?",margem,y);
    y+=5;
    doc.text(`Gerado em ${data.toLocaleDateString("pt-BR")} às ${data.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})} - ${solicitacoes.length} ${solicitacoes.length===1?"solicitação":"solicitações"}`,margem,y);
    doc.setTextColor(0,0,0);
    y+=10;

    const alturaCab=10, alturaLinha=11;
    function desenharCabecalho(){
        doc.setFillColor(25,25,25);
        doc.rect(margem,y,larguraUtil,alturaCab,"F");
        doc.setTextColor(255,255,255);
        doc.setFont("helvetica","bold");
        doc.setFontSize(9);
        doc.text("#",margem+3,y+6.5);
        doc.text("O que o cliente procura",margem+14,y+6.5);
        doc.text("Data da solicitação",margem+128,y+6.5);
        doc.setTextColor(0,0,0);
        doc.setFont("helvetica","normal");
        y+=alturaCab;
    }

    desenharCabecalho();
    solicitacoes.forEach((solicitacao,index)=>{
        if(y+alturaLinha>282){
            doc.addPage();
            y=18;
            doc.setFont("helvetica","bold");
            doc.setFontSize(12);
            doc.text("GustavoCell - SOLICITAÇÕES (continuação)",margem,y);
            y+=8;
            desenharCabecalho();
        }
        if(index%2===0){
            doc.setFillColor(245,245,245);
            doc.rect(margem,y,larguraUtil,alturaLinha,"F");
        }
        doc.setFontSize(8.5);
        doc.text(String(index+1),margem+3,y+7);
        const nome=textoPDF(solicitacao.produto||"Produto não informado");
        const linhas=doc.splitTextToSize(nome,108);
        doc.text(linhas[0]||"Produto não informado",margem+14,y+7);
        doc.text(textoPDF(formatarDataSolicitacao(solicitacao.data)),margem+128,y+7);
        doc.setDrawColor(220,220,220);
        doc.line(margem,y+alturaLinha,margem+larguraUtil,y+alturaLinha);
        y+=alturaLinha;
    });

    doc.setFontSize(8);
    doc.setTextColor(110,110,110);
    doc.text("Documento gerado pelo painel de solicitações GustavoCell.",margem,290);
    doc.save(`GustavoCell-solicitacoes-${data.toISOString().slice(0,10)}.pdf`);
    doc.setTextColor(0,0,0);
    mostrarNotificacaoProduto("PDF gerado com sucesso!",`${solicitacoes.length} ${solicitacoes.length===1?"solicitação":"solicitações"}`,"📄");
}

function configurarSolicitacoes(){
    abrirNecessitaAlgo?.addEventListener("click",abrirModalNecessitaAlgo);
    fecharNecessitaAlgo?.addEventListener("click",fecharModalNecessitaAlgo);
    cancelarNecessitaAlgo?.addEventListener("click",fecharModalNecessitaAlgo);
    modalNecessitaAlgo?.querySelector(".fundoNecessitaAlgo")?.addEventListener("click",fecharModalNecessitaAlgo);
    enviarNecessitaAlgo?.addEventListener("click",enviarSolicitacaoCliente);
    produtoSolicitado?.addEventListener("keydown",event=>{if(event.key==="Enter")enviarSolicitacaoCliente()});
    document.addEventListener("keydown",event=>{if(event.key==="Escape"&&modalNecessitaAlgo?.classList.contains("aberto"))fecharModalNecessitaAlgo()});
    listaSolicitacoes?.addEventListener("click",event=>{
        const botao=event.target.closest(".btnAtenderSolicitacao");
        if(!botao)return;
        const id=botao.dataset.solicitacaoId;
        salvarSolicitacoes(pegarSolicitacoes().filter(item=>String(item.id)!==String(id)));
        renderizarSolicitacoes();
        mostrarNotificacaoProduto("Solicitação atendida!","O pedido foi removido da lista.","✓");
    });
    gerarPDFSolicitacoes?.addEventListener("click",gerarPDFDasSolicitacoes);
    todosAtendidosSolicitacoes?.addEventListener("click",marcarTodasSolicitacoesAtendidas);
    renderizarSolicitacoes();
}

function iniciarGustavoCell(){
    garantirIdsProdutos();
    carregarElementos();
    configurarBotoesProdutos();configurarEventosCarrinho();configurarLimparCarrinho();
    configurarFiltrosLoja();renderizarFiltrosLoja();
    configurarCadastro();configurarCadastroMultiplos();configurarImportadorPDF();configurarRemocao();configurarSelecionarTodos();configurarEventosListaProdutos();configurarModalEditar();configurarPreviewImagem();
    configurarFiltrosAdmin();configurarGeracaoPDFProdutos();configurarPainelFiltros();configurarGerenciamentoFiltros();
    configurarSolicitacoes();
    garantirPrecosConserto();
    configurarTiposCatalogo();
    mostrarProdutosLoja();mostrarProdutosGerenciamento();mostrarCarrinho();atualizarContadorCarrinho();
    console.log("GustavoCell Shop carregado.");
}
function sincronizarDadosEntreAbas(event){
    if(event.key==="filtrosLoja"){
        renderizarFiltrosLoja();
        renderizarCamposFiltrosProduto(camposFiltrosProduto);
        renderizarCamposFiltrosProduto(camposFiltrosEdicao);
        mostrarProdutosLoja();
    }
    if(event.key==="produtos"){
        mostrarProdutosLoja();
        mostrarProdutosGerenciamento();
        mostrarCarrinho();
        atualizarContadorCarrinho();
    }
    if(event.key==="solicitacoesClientes")renderizarSolicitacoes();
}
window.addEventListener("storage",sincronizarDadosEntreAbas);

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",iniciarGustavoCell);else iniciarGustavoCell();
