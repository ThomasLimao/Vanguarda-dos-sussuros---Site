// ===== Verificação: o dados.js precisa estar na mesma pasta =====
if (typeof ITENS === "undefined" || typeof NOMES === "undefined") {
  document.body.insertAdjacentHTML("afterbegin",
    '<p style="background:#a32a2a;color:#fff;padding:12px;margin:0;font-family:sans-serif">' +
    'Erro: o arquivo dados.js não foi carregado. Ele precisa estar na mesma pasta do index.html.</p>');
  throw new Error("dados.js não foi carregado");
}

// ===== Regras (mude aqui se precisar) =====
const PONTOS_POR_NEX = 2;      // aumentos de atributo por subida de NEX
const MAX_ATRIBUTO = 5;
const NEX_MAXIMO = 99;
const CARGA_BASE = 15;         // peso que o corpo aguenta sem penalidade
const CARGA_POR_FORCA = 5;     // peso extra por ponto de Força
const LIMITE_MAXIMO = 2.0;     // não deixa guardar acima de 200% do limite
const CAMPOS = ["nome", "raca", "nacionalidade", "descricao", "tracos", "historia"];

// ===== Estado do personagem =====
const estado = {
  nex: 0,
  pontos: 0,
  periciasLivres: 0,
  atributos: { forca: 0, agilidade: 0, inteligencia: 0, presenca: 0, vigor: 0 },
  pericias: [],
  recipientes: ["bolsos"],  // recipientes que o personagem está levando
  guardado: {}              // id do recipiente -> { id do item: quantidade }
};

let filtroAtual = "Todos";
let destinoAtual = "auto";

// ===== Funções de apoio =====
function el(id) { return document.getElementById(id); }
function valor(id) { return el(id).value; }

function criar(tag, texto, classe) {
  const e = document.createElement(tag);
  if (texto !== undefined) e.textContent = texto;
  if (classe) e.className = classe;
  return e;
}

function quadradinhos(v) {
  return "■".repeat(v) + "□".repeat(MAX_ATRIBUTO - v);
}

function mostrarAviso(texto) { el("aviso").textContent = texto; }

function achar(lista, id) { return lista.find(x => x.id === id); }

// ===== Carga =====
function limiteCorpo() {
  return CARGA_BASE + estado.atributos.forca * CARGA_POR_FORCA;
}

function conteudo(recId) {
  if (!estado.guardado[recId]) estado.guardado[recId] = {};
  return estado.guardado[recId];
}

function usado(recId) {
  const itens = conteudo(recId);
  let total = 0;
  for (const id in itens) {
    const item = achar(ITENS, id);
    if (item) total += item.peso * itens[id];
  }
  return total;
}

function pesoTotal() {
  let total = 0;
  estado.recipientes.forEach(recId => {
    const rec = achar(RECIPIENTES, recId);
    if (rec) total += rec.peso + usado(recId);
  });
  return total;
}

function nivelCarga() {
  const razao = pesoTotal() / limiteCorpo();
  return NIVEIS_CARGA.find(n => razao <= n.ate);
}

function aceita(rec, item) {
  const tipoOk = !rec.tipos || rec.tipos.includes(item.tipo);
  const pesoOk = rec.maxPeso === null || item.peso <= rec.maxPeso;
  return tipoOk && pesoOk;
}

// ===== Condição =====
function calcularCondicao() {
  const a = estado.atributos;
  const n = estado.nex;
  const pen = nivelCarga().pen;
  return {
    vida: 10 + a.vigor * 3 + Math.floor(n / 10) * 2,
    lucidez: 8 + a.presenca * 2 + a.inteligencia + Math.floor(n / 10),
    folego: Math.max(0, 3 + a.agilidade + Math.floor(n / 20) - pen),
    defesa: 8 + a.agilidade - pen
  };
}

// ===== Desenho: Personagem =====
function desenharRaca() {
  const raca = valor("raca");
  el("sugestao").textContent =
    "Sugestão para " + raca + ": invista em " + NOMES[SUGESTOES[raca]] + ".";
  el("traco-nome").textContent = TRACOS[raca].nome;
  el("traco-texto").textContent = TRACOS[raca].texto;
}

function desenharNex() {
  el("nex").textContent = estado.nex;
  el("barra-nex").style.width = estado.nex + "%";
  el("pontos").textContent = estado.pontos;
  document.querySelectorAll(".js-pericias-livres").forEach(s => {
    s.textContent = estado.periciasLivres;
  });
}

function desenharAtributos() {
  const raca = valor("raca");
  const sugerido = SUGESTOES[raca];
  el("lista-atributos").innerHTML = Object.keys(NOMES).map(chave => `
    <div class="atributo">
      <span class="nome-attr">${NOMES[chave]}</span>
      <button type="button" data-acao="menos" data-attr="${chave}">−</button>
      <span class="pips">${quadradinhos(estado.atributos[chave])}</span>
      <button type="button" data-acao="mais" data-attr="${chave}">+</button>
      ${chave === sugerido ? `<span class="dica">★ sugerido para ${raca}</span>` : ""}
    </div>
  `).join("");
}

function desenharCondicao() {
  const c = calcularCondicao();
  const nivel = nivelCarga();
  el("vida").textContent = c.vida;
  el("lucidez").textContent = c.lucidez;
  el("folego").textContent = c.folego;
  el("defesa").textContent = c.defesa;
  el("efeito-carga").textContent = "Carga: " + nivel.nome + ". " + nivel.efeito;
}

// ===== Desenho: Perícias =====
function desenharPericias() {
  el("lista-pericias").innerHTML = PERICIAS.map(p => {
    const tem = estado.pericias.includes(p.id);
    return `
      <div class="cartao ${tem ? "marcada" : ""}">
        <div>
          <strong>${p.nome}</strong><span class="tag">${NOMES[p.atributo]}</span>
          <p>${p.descricao}</p>
        </div>
        <button type="button" data-id="${p.id}" class="${tem ? "secundario" : ""}">
          ${tem ? "Remover" : "Aprender"}
        </button>
      </div>`;
  }).join("");
}

// ===== Desenho: Mochila =====
function desenharMochila() {
  const total = pesoTotal();
  const limite = limiteCorpo();
  const nivel = nivelCarga();

  el("carga-texto").textContent = total + " / " + limite;
  el("barra-carga").style.width = Math.min(100, (total / (limite * LIMITE_MAXIMO)) * 100) + "%";
  el("barra-carga").classList.toggle("cheia", nivel.pen > 0);
  el("carga-nivel").textContent = nivel.nome;
  el("carga-efeito").textContent = nivel.efeito;

  // Recipientes disponíveis
  el("lista-recipientes").innerHTML = RECIPIENTES.map(r => {
    const levando = estado.recipientes.includes(r.id);
    const restricoes = [];
    if (r.tipos) restricoes.push("só " + r.tipos.join("/"));
    if (r.maxPeso !== null) restricoes.push("itens de peso até " + r.maxPeso);
    const botao = r.fixo
      ? '<span class="tag">Sempre</span>'
      : `<button type="button" class="${levando ? "secundario" : ""}"
           data-acao="${levando ? "tirar" : "levar"}" data-rec="${r.id}">
           ${levando ? "Tirar" : "Levar"}</button>`;
    return `
      <div class="cartao ${levando ? "marcada" : ""}">
        <div>
          <strong>${r.nome}</strong><span class="tag">Acesso: ${r.acesso}</span>
          <p>${r.descricao}</p>
          <p>Capacidade ${r.capacidade} • peso próprio ${r.peso}${restricoes.length ? " • " + restricoes.join(", ") : ""}</p>
        </div>
        ${botao}
      </div>`;
  }).join("");

  // O que está guardado, por recipiente e por categoria
  const levando = RECIPIENTES.filter(r => estado.recipientes.includes(r.id));
  el("lista-guardado").innerHTML = levando.map(r => {
    const itens = conteudo(r.id);
    const grupos = TIPOS.map(tipo => {
      const ids = Object.keys(itens).filter(id => {
        const item = achar(ITENS, id);
        return item && item.tipo === tipo;
      });
      if (ids.length === 0) return "";
      return `<h4 class="subtitulo">${tipo}</h4>` + ids.map(id => {
        const item = achar(ITENS, id);
        const qtd = itens[id];
        return `
          <div class="cartao">
            <div><strong>${item.nome}</strong> × ${qtd}<p>${item.descricao}</p></div>
            <span class="peso">${item.peso * qtd}</span>
            <button type="button" class="secundario" data-acao="soltar"
                    data-rec="${r.id}" data-id="${id}">Soltar</button>
          </div>`;
      }).join("");
    }).join("");

    return `
      <div class="recipiente">
        <h3 class="titulo-recipiente">${r.nome}
          <span class="tag">${usado(r.id)} / ${r.capacidade}</span></h3>
        ${grupos || '<p class="vazio">Vazio.</p>'}
      </div>`;
  }).join("");

  // Filtros do catálogo
  el("filtros").innerHTML = ["Todos"].concat(TIPOS).map(f => `
    <button type="button" class="chip ${f === filtroAtual ? "ativo" : ""}"
            data-acao="filtro" data-id="${f}">${f}</button>
  `).join("");

  // Destino ao guardar
  el("destino").innerHTML = '<option value="auto">Automático</option>' +
    levando.map(r => `<option value="${r.id}">${r.nome}</option>`).join("");
  if (!levando.some(r => r.id === destinoAtual)) destinoAtual = "auto";
  el("destino").value = destinoAtual;

  // Catálogo
  el("lista-itens").innerHTML = ITENS
    .filter(item => filtroAtual === "Todos" || item.tipo === filtroAtual)
    .map(item => `
      <div class="cartao">
        <div>
          <strong>${item.nome}</strong><span class="tag">${item.tipo}</span>
          <p>${item.descricao}</p>
        </div>
        <span class="peso">${item.peso}</span>
        <button type="button" data-acao="guardar" data-id="${item.id}">Guardar</button>
      </div>
    `).join("");
}

// ===== Desenho: Arquivos (roda uma vez) =====
function desenharArquivos() {
  const caixa = el("arquivos");
  caixa.appendChild(criar("p", ARQUIVOS.intro, "intro"));

  ARQUIVOS.racas.forEach(r => {
    const bloco = criar("div", undefined, "arquivo-raca");
    bloco.appendChild(criar("h3", r.nome));
    bloco.appendChild(criar("p", r.origem));

    const colunas = criar("div", undefined, "colunas");
    [["Pontos fortes", r.fortes], ["Pontos fracos", r.fracos]].forEach(([titulo, lista]) => {
      const col = criar("div");
      col.appendChild(criar("h4", titulo));
      const ul = criar("ul");
      lista.forEach(texto => ul.appendChild(criar("li", texto)));
      col.appendChild(ul);
      colunas.appendChild(col);
    });

    bloco.appendChild(colunas);
    caixa.appendChild(bloco);
  });
}

// ===== Desenho: Ficha final =====
function desenharFicha() {
  const ficha = el("ficha");
  ficha.innerHTML = "";

  const raca = valor("raca");
  const c = calcularCondicao();
  const nome = valor("nome").trim() || "Sem nome";
  const nacionalidade = valor("nacionalidade").trim();

  ficha.appendChild(criar("h3", nome));
  ficha.appendChild(criar("p",
    raca + (nacionalidade ? " • " + nacionalidade : "") + " • NEX " + estado.nex + "%"));
  ficha.appendChild(criar("p", TRACOS[raca].nome + ": " + TRACOS[raca].texto));

  ficha.appendChild(criar("h4", "Condição"));
  ficha.appendChild(criar("p",
    "Vida " + c.vida + "  |  Lucidez " + c.lucidez + "  |  Fôlego " + c.folego + "  |  Defesa " + c.defesa));
  ficha.appendChild(criar("p", "Carga: " + nivelCarga().nome + " (" + pesoTotal() + " / " + limiteCorpo() + ")"));

  ficha.appendChild(criar("h4", "Atributos"));
  const listaAttr = criar("ul");
  for (const chave in estado.atributos) {
    listaAttr.appendChild(criar("li", NOMES[chave] + ": " + quadradinhos(estado.atributos[chave])));
  }
  ficha.appendChild(listaAttr);

  ficha.appendChild(criar("h4", "Perícias"));
  if (estado.pericias.length === 0) {
    ficha.appendChild(criar("p", "Nenhuma perícia aprendida."));
  } else {
    const etiquetas = criar("div", undefined, "etiquetas");
    estado.pericias.forEach(id => {
      const p = achar(PERICIAS, id);
      if (p) etiquetas.appendChild(criar("span", p.nome, "tag"));
    });
    ficha.appendChild(etiquetas);
  }

  ficha.appendChild(criar("h4", "Equipamento"));
  let temAlgo = false;
  estado.recipientes.forEach(recId => {
    const rec = achar(RECIPIENTES, recId);
    if (!rec) return;
    const itens = conteudo(recId);
    const ids = Object.keys(itens).filter(id => achar(ITENS, id));
    if (ids.length === 0) return;
    temAlgo = true;
    ficha.appendChild(criar("p", rec.nome + " (" + usado(recId) + " / " + rec.capacidade + ")"));
    const lista = criar("ul");
    ids.forEach(id => {
      lista.appendChild(criar("li", achar(ITENS, id).nome + " × " + itens[id]));
    });
    ficha.appendChild(lista);
  });
  if (!temAlgo) ficha.appendChild(criar("p", "Nada na mochila."));

  const tracos = valor("tracos").split(",").map(t => t.trim()).filter(t => t);
  if (tracos.length > 0) {
    ficha.appendChild(criar("h4", "Traços"));
    const etiquetas = criar("div", undefined, "etiquetas");
    tracos.forEach(t => etiquetas.appendChild(criar("span", t, "tag")));
    ficha.appendChild(etiquetas);
  }

  if (valor("descricao").trim()) {
    ficha.appendChild(criar("h4", "Descrição"));
    ficha.appendChild(criar("p", valor("descricao"), "texto-longo"));
  }

  if (valor("historia").trim()) {
    ficha.appendChild(criar("h4", "História"));
    ficha.appendChild(criar("p", valor("historia"), "texto-longo"));
  }
}

// ===== Salvar / carregar =====
function salvar() {
  try {
    const perfil = {};
    CAMPOS.forEach(id => { perfil[id] = valor(id); });
    localStorage.setItem("fichaVanguarda", JSON.stringify({ perfil: perfil, estado: estado }));
  } catch (erro) {
    // sem localStorage: o site continua funcionando, só não salva
  }
}

function carregar() {
  try {
    const dados = JSON.parse(localStorage.getItem("fichaVanguarda"));
    if (!dados) return;
    CAMPOS.forEach(id => { if (dados.perfil[id] !== undefined) el(id).value = dados.perfil[id]; });
    estado.nex = dados.estado.nex || 0;
    estado.pontos = dados.estado.pontos || 0;
    estado.periciasLivres = dados.estado.periciasLivres || 0;
    Object.assign(estado.atributos, dados.estado.atributos);
    estado.pericias = dados.estado.pericias || [];
    estado.recipientes = dados.estado.recipientes || ["bolsos"];
    if (!estado.recipientes.includes("bolsos")) estado.recipientes.unshift("bolsos");
    estado.guardado = dados.estado.guardado || {};
  } catch (erro) {
    // se der erro, começa uma ficha nova
  }
}

// ===== Atualiza tudo =====
function atualizarTela() {
  desenharRaca();
  desenharNex();
  desenharAtributos();
  desenharCondicao();
  desenharPericias();
  desenharMochila();
  desenharFicha();
  salvar();
}

// ===== NEX =====
function subirNex(quanto) {
  if (estado.nex >= NEX_MAXIMO) {
    mostrarAviso("NEX já está no máximo.");
    return;
  }
  estado.nex = Math.min(estado.nex + quanto, NEX_MAXIMO);
  estado.pontos += PONTOS_POR_NEX;
  const novasPericias = quanto / 5;   // +5% = 1 perícia, +10% = 2
  estado.periciasLivres += novasPericias;
  mostrarAviso("NEX " + estado.nex + "%: +" + PONTOS_POR_NEX +
               " aumentos de atributo e +" + novasPericias + " perícia(s).");
  atualizarTela();
}

el("nex-5").addEventListener("click", () => subirNex(5));
el("nex-10").addEventListener("click", () => subirNex(10));

// ===== Atributos (+ e −) =====
el("lista-atributos").addEventListener("click", evento => {
  const botao = evento.target.closest("button[data-acao]");
  if (!botao) return;
  const nome = botao.dataset.attr;

  if (botao.dataset.acao === "mais") {
    if (estado.pontos > 0 && estado.atributos[nome] < MAX_ATRIBUTO) {
      estado.atributos[nome]++;
      estado.pontos--;
    }
  } else {
    if (estado.atributos[nome] > 0) {
      estado.atributos[nome]--;
      estado.pontos++;
    }
  }
  atualizarTela();
});

// ===== Perícias =====
el("lista-pericias").addEventListener("click", evento => {
  const botao = evento.target.closest("button[data-id]");
  if (!botao) return;
  const id = botao.dataset.id;

  if (estado.pericias.includes(id)) {
    estado.pericias = estado.pericias.filter(p => p !== id);
    estado.periciasLivres++;
  } else if (estado.periciasLivres > 0) {
    estado.pericias.push(id);
    estado.periciasLivres--;
  } else {
    mostrarAviso("Sem perícias disponíveis. Suba o NEX para aprender mais.");
  }
  atualizarTela();
});

// ===== Mochila =====
function guardarItem(itemId) {
  const item = achar(ITENS, itemId);
  const tetoPeso = limiteCorpo() * LIMITE_MAXIMO;

  if (pesoTotal() + item.peso > tetoPeso) {
    mostrarAviso("Peso demais: ninguém carrega acima de 200% do limite do corpo.");
    return;
  }

  const levando = RECIPIENTES.filter(r => estado.recipientes.includes(r.id));
  let alvo;

  if (destinoAtual === "auto") {
    // recipientes especializados primeiro, depois os gerais
    const ordem = levando.filter(r => r.tipos).concat(levando.filter(r => !r.tipos));
    alvo = ordem.find(r => aceita(r, item) && usado(r.id) + item.peso <= r.capacidade);
    if (!alvo) {
      mostrarAviso("Nenhum recipiente que você leva aceita " + item.nome +
                   " ou tem espaço. Leve outra bolsa ou solte algo.");
      return;
    }
  } else {
    alvo = achar(RECIPIENTES, destinoAtual);
    if (!aceita(alvo, item)) {
      mostrarAviso(item.nome + " não pode ser guardado em " + alvo.nome + ".");
      return;
    }
    if (usado(alvo.id) + item.peso > alvo.capacidade) {
      mostrarAviso(alvo.nome + " está cheio.");
      return;
    }
  }

  const itens = conteudo(alvo.id);
  itens[itemId] = (itens[itemId] || 0) + 1;
  mostrarAviso(item.nome + " guardado em " + alvo.nome + ".");
}

function soltarItem(recId, itemId) {
  const itens = conteudo(recId);
  itens[itemId]--;
  if (itens[itemId] <= 0) delete itens[itemId];
}

function levarRecipiente(recId) {
  const rec = achar(RECIPIENTES, recId);
  if (pesoTotal() + rec.peso > limiteCorpo() * LIMITE_MAXIMO) {
    mostrarAviso("Peso demais para levar " + rec.nome + ".");
    return;
  }
  estado.recipientes.push(recId);
}

function tirarRecipiente(recId) {
  if (usado(recId) > 0) {
    mostrarAviso("Esvazie " + achar(RECIPIENTES, recId).nome + " antes de deixá-lo para trás.");
    return;
  }
  estado.recipientes = estado.recipientes.filter(id => id !== recId);
}

el("pagina-mochila").addEventListener("click", evento => {
  const botao = evento.target.closest("button[data-acao]");
  if (!botao) return;
  const acao = botao.dataset.acao;

  if (acao === "filtro") filtroAtual = botao.dataset.id;
  if (acao === "guardar") guardarItem(botao.dataset.id);
  if (acao === "soltar") soltarItem(botao.dataset.rec, botao.dataset.id);
  if (acao === "levar") levarRecipiente(botao.dataset.rec);
  if (acao === "tirar") tirarRecipiente(botao.dataset.rec);

  atualizarTela();
});

el("destino").addEventListener("change", () => {
  destinoAtual = valor("destino");
});

// ===== Abas =====
document.querySelectorAll(".aba").forEach(botao => {
  botao.addEventListener("click", () => {
    document.querySelectorAll(".aba").forEach(b => b.classList.remove("ativa"));
    document.querySelectorAll(".pagina").forEach(p => p.classList.remove("ativa"));
    botao.classList.add("ativa");
    el("pagina-" + botao.dataset.aba).classList.add("ativa");
    mostrarAviso("");
  });
});

// ===== Campos de texto =====
CAMPOS.forEach(id => {
  el(id).addEventListener("input", () => {
    if (id === "raca") {
      atualizarTela();
    } else {
      desenharFicha();
      salvar();
    }
  });
});

// ===== Botões finais =====
el("imprimir").addEventListener("click", () => window.print());

el("resetar").addEventListener("click", () => {
  if (!confirm("Apagar a ficha atual? Isso não pode ser desfeito.")) return;
  try { localStorage.removeItem("fichaVanguarda"); } catch (erro) {}
  location.reload();
});

// ===== Início =====
desenharArquivos();
carregar();
atualizarTela();
