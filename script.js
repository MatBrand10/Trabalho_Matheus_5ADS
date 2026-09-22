// Pega referencias dos elementos que ja existem no HTML
const formProduto = document.querySelector("#form-produto");
const listaProdutos = document.querySelector("#lista-produtos");
const campoNome = document.querySelector("#nome");
const campoPreco = document.querySelector("#preco");
const campoQuantidade = document.querySelector("#quantidade");
const campoCategoria = document.querySelector("#categoria");
const campoImagem = document.querySelector("#imagem");
const campoObservacao = document.querySelector("#observacao");
const botaoFormulario = document.querySelector("#botao-formulario");
const botaoCancelar = document.querySelector("#botao-cancelar");
const botaoTema = document.querySelector("#botao-tema");
const campoPesquisa = document.querySelector("#pesquisa-produto");
const botaoOrdenar = document.querySelector("#botao-ordenar");
const botaoPrecoMenor = document.querySelector("#botao-preco-menor");
const botaoPrecoMaior = document.querySelector("#botao-preco-maior");
const botaoEstoqueBaixo = document.querySelector("#botao-estoque-baixo");
const botaoMostrarTodos = document.querySelector("#botao-mostrar-todos");
const botaoImprimir = document.querySelector("#botao-imprimir");
const botaoLimparLista = document.querySelector("#botao-limpar-lista");
const contadorProdutos = document.querySelector("#contador-produtos");
const totalEstoque = document.querySelector("#total-estoque");
const valorEstoque = document.querySelector("#valor-estoque");
const listaVazia = document.querySelector("#lista-vazia");
const mensagemErro = document.querySelector("#mensagem-erro");
const mensagemSucesso = document.querySelector("#mensagem-sucesso");

const chaveStorage = "produtos-loja-simples";
const chaveTema = "tema-papelaria";
let produtos = [];
let idProdutoEditando = null;
let filtroEstoqueBaixo = false;
let temporizadorMensagem = null;

function formatarPreco(preco) {
  return Number(preco).toFixed(2).replace(".", ",");
}

function formatarData(data) {
  const partes = data.split("-");
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function dataAtual() {
  return new Date().toISOString().slice(0, 10);
}

function salvarProdutos() {
  localStorage.setItem(chaveStorage, JSON.stringify(produtos));
}

function aplicarTema(tema) {
  document.body.classList.toggle("tema-escuro", tema === "escuro");
  botaoTema.textContent = tema === "escuro" ? "Modo claro" : "Modo escuro";
  localStorage.setItem(chaveTema, tema);
}

function mostrarMensagem(elemento, texto) {
  clearTimeout(temporizadorMensagem);
  mensagemErro.textContent = "";
  mensagemSucesso.textContent = "";
  elemento.textContent = texto;

  temporizadorMensagem = setTimeout(function () {
    elemento.textContent = "";
  }, 3000);
}

function mostrarSucesso(texto) {
  mostrarMensagem(mensagemSucesso, texto);
}

function mostrarErro(texto) {
  mostrarMensagem(mensagemErro, texto);
}

function obterStatusEstoque(quantidade) {
  if (quantidade < 5) {
    return "Estoque baixo";
  }

  if (quantidade > 50) {
    return "Estoque alto";
  }

  return "Estoque normal";
}

function criarId() {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
}

function nomeJaExiste(nome, idIgnorado) {
  return produtos.some(function (produto) {
    return produto.nome.toLowerCase() === nome.toLowerCase() && produto.id !== idIgnorado;
  });
}

function atualizarResumo() {
  let quantidadeTotal = 0;
  let valorTotal = 0;

  produtos.forEach(function (produto) {
    quantidadeTotal = quantidadeTotal + produto.quantidade;
    valorTotal = valorTotal + produto.preco * produto.quantidade;
  });

  contadorProdutos.textContent = `Produtos cadastrados: ${produtos.length}`;
  totalEstoque.textContent = `Total de itens em estoque: ${quantidadeTotal}`;
  valorEstoque.textContent = `Valor total em estoque: R$ ${formatarPreco(valorTotal)}`;
  listaVazia.style.display = produtos.length === 0 ? "block" : "none";
}

function imagemPadrao(categoria) {
  const texto = categoria || "Papelaria";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="180" height="140" viewBox="0 0 180 140">
      <rect width="180" height="140" rx="18" fill="#fff4d6"/>
      <rect x="24" y="28" width="72" height="86" rx="8" fill="#4f7cac"/>
      <rect x="34" y="38" width="52" height="8" rx="4" fill="#ffffff"/>
      <path d="M120 30l18 10-48 82-18-10z" fill="#f2b84b"/>
      <path d="M138 40l12 7-11 7z" fill="#25313b"/>
      <text x="90" y="126" text-anchor="middle" font-family="Arial" font-size="13" fill="#25313b">${texto}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function produtoPassaNosFiltros(produto) {
  const termo = campoPesquisa.value.trim().toLowerCase();
  const nomeEncontrado = produto.nome.toLowerCase().includes(termo);
  const estoqueEncontrado = filtroEstoqueBaixo === false || produto.quantidade < 5;

  return nomeEncontrado && estoqueEncontrado;
}

function criarBotao(texto, classe, aoClicar) {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.textContent = texto;
  botao.classList.add(classe);
  botao.addEventListener("click", aoClicar);

  return botao;
}

function renderizarProdutos() {
  listaProdutos.innerHTML = "";

  produtos.forEach(function (produto) {
    if (produtoPassaNosFiltros(produto) === false) {
      return;
    }

    const item = document.createElement("li");
    const totalProduto = produto.preco * produto.quantidade;
    const statusTexto = obterStatusEstoque(produto.quantidade);

    item.classList.add("item-produto");
    item.classList.add(statusTexto.toLowerCase().replace(" ", "-"));

    const imagemProduto = document.createElement("img");
    imagemProduto.classList.add("produto-imagem");
    imagemProduto.src = produto.imagem || imagemPadrao(produto.categoria);
    imagemProduto.alt = `Imagem de ${produto.nome}`;
    imagemProduto.addEventListener("error", function () {
      imagemProduto.src = imagemPadrao(produto.categoria);
    });

    const informacoesProduto = document.createElement("div");
    informacoesProduto.classList.add("informacoes-produto");

    const textoProduto = document.createElement("span");
    textoProduto.textContent = `${produto.nome} - R$ ${formatarPreco(produto.preco)} (${produto.quantidade} un.)`;

    const detalhesProduto = document.createElement("small");
    detalhesProduto.textContent = `${produto.categoria} | Total: R$ ${formatarPreco(totalProduto)} | Cadastrado em: ${formatarData(produto.dataCadastro)}`;

    const statusEstoque = document.createElement("small");
    statusEstoque.textContent = statusTexto;
    statusEstoque.classList.add("status-estoque");

    informacoesProduto.appendChild(textoProduto);
    informacoesProduto.appendChild(detalhesProduto);
    informacoesProduto.appendChild(statusEstoque);

    if (produto.observacao !== "") {
      const observacaoProduto = document.createElement("small");
      observacaoProduto.textContent = `Obs: ${produto.observacao}`;
      informacoesProduto.appendChild(observacaoProduto);
    }

    const areaBotoes = document.createElement("div");
    areaBotoes.classList.add("acoes-produto");

    const botaoEditar = criarBotao("Editar", "botao-editar", function () {
      preencherFormulario(produto.id);
    });

    const botaoRemover = criarBotao("Remover", "botao-remover", function () {
      removerProduto(produto.id);
    });

    areaBotoes.appendChild(botaoEditar);
    areaBotoes.appendChild(botaoRemover);
    item.appendChild(imagemProduto);
    item.appendChild(informacoesProduto);
    item.appendChild(areaBotoes);
    listaProdutos.appendChild(item);
  });

  atualizarResumo();
}

function limparFormulario() {
  formProduto.reset();
  idProdutoEditando = null;
  botaoFormulario.textContent = "Adicionar produto";
  botaoCancelar.style.display = "none";
  campoNome.focus();
}

function preencherFormulario(id) {
  const produto = produtos.find(function (produtoAtual) {
    return produtoAtual.id === id;
  });

  if (produto === undefined) {
    return;
  }

  campoNome.value = produto.nome;
  campoPreco.value = produto.preco.toFixed(2);
  campoQuantidade.value = produto.quantidade;
  campoCategoria.value = produto.categoria;
  campoImagem.value = produto.imagem || "";
  campoObservacao.value = produto.observacao;
  idProdutoEditando = id;
  botaoFormulario.textContent = "Salvar alteracoes";
  botaoCancelar.style.display = "inline-block";
  mensagemErro.textContent = "";
  mensagemSucesso.textContent = "";
  campoNome.focus();
}

function removerProduto(id) {
  const confirmou = confirm("Deseja remover este produto?");

  if (confirmou === false) {
    return;
  }

  produtos = produtos.filter(function (produto) {
    return produto.id !== id;
  });

  if (idProdutoEditando === id) {
    limparFormulario();
  }

  salvarProdutos();
  renderizarProdutos();
  mostrarSucesso("Produto removido com sucesso.");
}

function ordenarProdutos(campo, direcao) {
  produtos.sort(function (produtoA, produtoB) {
    if (campo === "nome") {
      return produtoA.nome.localeCompare(produtoB.nome);
    }

    return produtoA.preco - produtoB.preco;
  });

  if (direcao === "desc") {
    produtos.reverse();
  }

  salvarProdutos();
  renderizarProdutos();
}

function normalizarProduto(produto) {
  return {
    id: produto.id || criarId(),
    nome: produto.nome,
    preco: Number(produto.preco),
    quantidade: Number(produto.quantidade),
    categoria: produto.categoria || "Material escolar",
    imagem: produto.imagem || "",
    observacao: produto.observacao || "",
    dataCadastro: produto.dataCadastro || dataAtual(),
  };
}

function carregarProdutosIniciais() {
  const produtosSalvos = localStorage.getItem(chaveStorage);

  if (produtosSalvos !== null) {
    produtos = JSON.parse(produtosSalvos).map(function (produto) {
      return normalizarProduto(produto);
    });
    return;
  }

  const itens = document.querySelectorAll("#lista-produtos li");

  itens.forEach(function (item) {
    const texto = item.textContent.trim();
    const dados = texto.match(/^(.+) - R\$ ([0-9.,]+) \((\d+) un\.\)$/);

    if (dados !== null) {
      produtos.push({
        id: criarId(),
        nome: dados[1],
        preco: Number(dados[2].replace(",", ".")),
        quantidade: Number(dados[3]),
        categoria: "Material escolar",
        imagem: "",
        observacao: "",
        dataCadastro: dataAtual(),
      });
    }
  });

  salvarProdutos();
}

formProduto.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const nome = campoNome.value.trim();
  const preco = Number(campoPreco.value);
  const quantidade = Number(campoQuantidade.value);
  const categoria = campoCategoria.value;
  const imagem = campoImagem.value.trim();
  const observacao = campoObservacao.value.trim();

  if (nome.length > 40) {
    mostrarErro("O nome deve ter no maximo 40 caracteres.");
    return;
  }

  if (preco <= 0) {
    mostrarErro("O preco deve ser maior que zero.");
    return;
  }

  if (quantidade <= 0) {
    mostrarErro("A quantidade deve ser maior que zero.");
    return;
  }

  if (idProdutoEditando !== null && nomeJaExiste(nome, idProdutoEditando)) {
    mostrarErro("Ja existe outro produto com esse nome.");
    return;
  }

  if (idProdutoEditando === null) {
    const produtoExistente = produtos.find(function (produto) {
      return produto.nome.toLowerCase() === nome.toLowerCase();
    });

    if (produtoExistente !== undefined) {
      produtoExistente.quantidade = produtoExistente.quantidade + quantidade;
      produtoExistente.preco = preco;
      produtoExistente.categoria = categoria;
      produtoExistente.imagem = imagem;
      produtoExistente.observacao = observacao;
      mostrarSucesso("Produto ja existia. Estoque atualizado com sucesso.");
    } else {
      produtos.push({
        id: criarId(),
        nome: nome,
        preco: preco,
        quantidade: quantidade,
        categoria: categoria,
        imagem: imagem,
        observacao: observacao,
        dataCadastro: dataAtual(),
      });

      mostrarSucesso("Produto adicionado com sucesso.");
    }
  } else {
    produtos = produtos.map(function (produto) {
      if (produto.id !== idProdutoEditando) {
        return produto;
      }

      return {
        id: produto.id,
        nome: nome,
        preco: preco,
        quantidade: quantidade,
        categoria: categoria,
        imagem: imagem,
        observacao: observacao,
        dataCadastro: produto.dataCadastro,
      };
    });

    mostrarSucesso("Produto atualizado com sucesso.");
  }

  salvarProdutos();
  renderizarProdutos();
  limparFormulario();
});

botaoCancelar.addEventListener("click", function () {
  limparFormulario();
  mensagemErro.textContent = "";
  mensagemSucesso.textContent = "";
});

campoPesquisa.addEventListener("input", function () {
  renderizarProdutos();
});

botaoOrdenar.addEventListener("click", function () {
  ordenarProdutos("nome", "asc");
  mostrarSucesso("Produtos ordenados por nome.");
});

botaoPrecoMenor.addEventListener("click", function () {
  ordenarProdutos("preco", "asc");
  mostrarSucesso("Produtos ordenados pelo menor preco.");
});

botaoPrecoMaior.addEventListener("click", function () {
  ordenarProdutos("preco", "desc");
  mostrarSucesso("Produtos ordenados pelo maior preco.");
});

botaoEstoqueBaixo.addEventListener("click", function () {
  filtroEstoqueBaixo = true;
  renderizarProdutos();
});

botaoMostrarTodos.addEventListener("click", function () {
  filtroEstoqueBaixo = false;
  campoPesquisa.value = "";
  renderizarProdutos();
});

botaoImprimir.addEventListener("click", function () {
  window.print();
});

botaoLimparLista.addEventListener("click", function () {
  const confirmou = confirm("Deseja remover todos os produtos?");

  if (confirmou === false) {
    return;
  }

  produtos = [];
  limparFormulario();
  salvarProdutos();
  renderizarProdutos();
  mostrarSucesso("Lista limpa com sucesso.");
});

botaoTema.addEventListener("click", function () {
  const temaAtual = document.body.classList.contains("tema-escuro") ? "escuro" : "claro";
  const proximoTema = temaAtual === "escuro" ? "claro" : "escuro";

  aplicarTema(proximoTema);
});

botaoCancelar.style.display = "none";
aplicarTema(localStorage.getItem(chaveTema) || "claro");
carregarProdutosIniciais();
renderizarProdutos();
