// ===== Nomes dos atributos =====
const NOMES = {
  forca: "Força",
  agilidade: "Agilidade",
  inteligencia: "Inteligência",
  presenca: "Presença",
  vigor: "Vigor"
};

// ===== Sugestão de atributo por raça =====
const SUGESTOES = {
  "Humano": "agilidade",
  "Mascarado": "forca",
  "Sobre-humano": "presenca"
};

// ===== Traço de cada raça =====
const TRACOS = {
  "Humano": {
    nome: "Instinto de Sobrevivência",
    texto: "Uma vez por cena, repita um teste que acabou de falhar."
  },
  "Mascarado": {
    nome: "Pele Dura",
    texto: "Ignora 1 ponto de dano em cada golpe físico recebido."
  },
  "Sobre-humano": {
    nome: "Eco do Além",
    texto: "Sente algo anormal por perto. Custa 1 de Lucidez cada uso."
  }
};

// ===== Aba Arquivos (textos do mundo) =====
const ARQUIVOS = {
  intro: "Há um som que chega antes do medo. Quem o ouve primeiro o chama de sussurro: uma voz baixa demais para ser humana, clara demais para ser coincidência. A Vanguarda dos Sussurros nasceu de quem decidiu não fugir dele. São os primeiros a entrar onde o tempo falha, onde as horas se repetem, onde os mortos chegam antes de morrer.",
  racas: [
    {
      nome: "Humano",
      origem: "Pessoas comuns: enfermeiros, motoristas, arquivistas, estudantes. O anormal os encontrou por acidente, dívida ou curiosidade, e eles nunca mais souberam voltar. Não têm dom nenhum, só a teimosia de continuar.",
      fortes: [
        "Instinto de Sobrevivência: refazem um teste falho por cena",
        "Misturam-se a qualquer lugar sem chamar atenção",
        "Aprendem rápido com a experiência"
      ],
      fracos: [
        "Sem proteção natural contra o anormal: a Lucidez é a primeira a ceder",
        "Corpo comum, sem resistências especiais",
        "Sofrem mais quando agem sozinhos"
      ]
    },
    {
      nome: "Mascarado",
      origem: "Houve um tempo em que bastava cobrir o rosto para ser esquecido. Os Mascarados fizeram disso um pacto: abriram mão do próprio rosto em troca de um corpo que aguenta o que o mundo faz com ele. Dizem que a máscara não sai sozinha, e que o rosto por baixo já não é o mesmo.",
      fortes: [
        "Pele Dura: ignoram parte do dano físico",
        "Anonimato: ninguém os reconhece depois",
        "Aguentam dor e esforço além do normal"
      ],
      fracos: [
        "Dificuldade de criar vínculos de confiança",
        "O pacto cobra identidade: quanto mais usam a máscara, menos lembram quem eram",
        "Desconfiança de quem não entende o pacto"
      ]
    },
    {
      nome: "Sobre-humano",
      origem: "Ouviram um sussurro inteiro, do começo ao fim, e sobreviveram. O que ficou nos ouvidos nunca saiu: sentem o anormal antes de ele chegar, e é isso que os torna valiosos e perigosos.",
      fortes: [
        "Eco do Além: percebem o anormal à distância",
        "Presença que intimida quem está por perto",
        "Sentidos além do normal"
      ],
      fracos: [
        "Cada Eco cobra Lucidez",
        "Atraem a atenção do que sussurra",
        "O mundo comum parece distante e os vínculos humanos se desgastam"
      ]
    }
  ]
};

// ===== Tipos de item (ordem de exibição) =====
const TIPOS = ["Arma", "Cura", "Proteção", "Ferramenta", "Suprimento", "Estranho"];

// ===== Recipientes =====
// tipos: lista de tipos aceitos (null = aceita qualquer)
// maxPeso: peso máximo por item (null = sem limite)
const RECIPIENTES = [
  { id: "bolsos", nome: "Bolsos", capacidade: 4, peso: 0, tipos: null, maxPeso: 2, fixo: true,
    acesso: "Livre", descricao: "Só cabe o pequeno, mas está sempre à mão." },
  { id: "pochete", nome: "Pochete", capacidade: 10, peso: 1, tipos: null, maxPeso: 4,
    acesso: "Rápido", descricao: "Itens leves para sacar sem pensar." },
  { id: "bolsaMedica", nome: "Bolsa médica", capacidade: 8, peso: 1, tipos: ["Cura"], maxPeso: null,
    acesso: "Rápido", descricao: "Compartimentos para curativos e remédios." },
  { id: "estojoArmas", nome: "Estojo de armas", capacidade: 24, peso: 3, tipos: ["Arma"], maxPeso: null,
    acesso: "Ação", descricao: "Transporta armas e munição com segurança." },
  { id: "mochila", nome: "Mochila", capacidade: 30, peso: 3, tipos: null, maxPeso: null,
    acesso: "Ação", descricao: "Cabe de tudo, mas tirar algo de dentro leva tempo." }
];

// ===== Níveis de carga (ratio = peso total / limite do corpo) =====
const NIVEIS_CARGA = [
  { ate: 1.0, nome: "Leve", pen: 0,
    efeito: "Sem penalidades." },
  { ate: 1.5, nome: "Pesado", pen: 1,
    efeito: "−1 Defesa e −1 Fôlego. Deslocamento reduzido em 1/4." },
  { ate: 2.0, nome: "Sobrecarregado", pen: 2,
    efeito: "−2 Defesa e −2 Fôlego. Furtividade em desvantagem. Deslocamento pela metade." },
  { ate: Infinity, nome: "Imobilizado", pen: 3,
    efeito: "−3 Defesa e −3 Fôlego. Não consegue correr nem guardar mais itens." }
];

// ===== Itens (peso em unidades) =====
const ITENS = [
  { id: "faca", nome: "Faca de campo", peso: 2, tipo: "Arma", descricao: "Curta, silenciosa, confiável." },
  { id: "cassetete", nome: "Cassetete reforçado", peso: 3, tipo: "Arma", descricao: "Para quem prefere não matar." },
  { id: "pistola", nome: "Pistola", peso: 10, tipo: "Arma", descricao: "Arma de fogo leve. Barulhenta." },
  { id: "espingarda", nome: "Espingarda", peso: 18, tipo: "Arma", descricao: "Pesada, mas derruba o que se aproxima." },
  { id: "municao", nome: "Caixa de munição", peso: 2, tipo: "Arma", descricao: "Munição para armas de fogo." },

  { id: "bandagem", nome: "Bandagem", peso: 1, tipo: "Cura", descricao: "Estanca sangramentos." },
  { id: "analgesico", nome: "Analgésico", peso: 1, tipo: "Cura", descricao: "Silencia a dor por um tempo." },
  { id: "tonico", nome: "Tônico de calma", peso: 1, tipo: "Cura", descricao: "Ajuda a recuperar a Lucidez." },
  { id: "kit", nome: "Kit de primeiros socorros", peso: 3, tipo: "Cura", descricao: "Ataduras, antisséptico e pouca esperança." },

  { id: "colete", nome: "Colete reforçado", peso: 12, tipo: "Proteção", descricao: "Absorve parte do impacto." },
  { id: "capacete", nome: "Capacete", peso: 4, tipo: "Proteção", descricao: "Protege o que não pode ser trocado." },

  { id: "lanterna", nome: "Lanterna", peso: 2, tipo: "Ferramenta", descricao: "Escuro demais para ir sem ela." },
  { id: "corda", nome: "Corda", peso: 4, tipo: "Ferramenta", descricao: "Quinze metros de corda resistente." },
  { id: "pedecabra", nome: "Pé de cabra", peso: 6, tipo: "Ferramenta", descricao: "Abre portas, caixas e crânios." },
  { id: "radio", nome: "Rádio portátil", peso: 4, tipo: "Ferramenta", descricao: "Às vezes capta frequências que não deveriam existir." },
  { id: "camera", nome: "Câmera instantânea", peso: 3, tipo: "Ferramenta", descricao: "As fotos às vezes mostram o que o olho não vê." },
  { id: "caderno", nome: "Caderno de campo", peso: 1, tipo: "Ferramenta", descricao: "Para anotar antes que a memória falhe." },

  { id: "racao", nome: "Ração de 3 dias", peso: 3, tipo: "Suprimento", descricao: "Comida que não estraga fácil." },
  { id: "cantil", nome: "Cantil", peso: 2, tipo: "Suprimento", descricao: "Água limpa vale mais que munição." },

  { id: "sal", nome: "Sal grosso", peso: 2, tipo: "Estranho", descricao: "Velho costume contra o que sussurra." },
  { id: "vidro", nome: "Fragmento de vidro fosco", peso: 1, tipo: "Estranho", descricao: "Embaça quando algo anormal se aproxima." },
  { id: "sino", nome: "Sino sem badalo", peso: 1, tipo: "Estranho", descricao: "Dizem que toca sozinho no silêncio absoluto." }
];

// ===== Perícias =====
const PERICIAS = [
  { id: "atletismo", nome: "Atletismo", atributo: "forca", descricao: "Escalar, saltar, nadar, forçar passagem." },
  { id: "luta", nome: "Luta", atributo: "forca", descricao: "Combate corpo a corpo, com ou sem arma." },
  { id: "pontaria", nome: "Pontaria", atributo: "agilidade", descricao: "Acertar o alvo à distância." },
  { id: "furtividade", nome: "Furtividade", atributo: "agilidade", descricao: "Mover-se sem ser notado." },
  { id: "reflexos", nome: "Reflexos", atributo: "agilidade", descricao: "Esquivar, desviar, reagir primeiro." },
  { id: "investigacao", nome: "Investigação", atributo: "inteligencia", descricao: "Achar pistas e ligar os pontos." },
  { id: "ocultismo", nome: "Ocultismo", atributo: "inteligencia", descricao: "Conhecimento sobre o anormal e seus rituais." },
  { id: "medicina", nome: "Medicina", atributo: "inteligencia", descricao: "Tratar ferimentos e reconhecer doenças." },
  { id: "tecnologia", nome: "Tecnologia", atributo: "inteligencia", descricao: "Eletrônicos, câmeras, rádios e sistemas." },
  { id: "mecanica", nome: "Mecânica", atributo: "inteligencia", descricao: "Consertar veículos, fechaduras e engrenagens." },
  { id: "percepcao", nome: "Percepção", atributo: "presenca", descricao: "Notar o que está fora do lugar." },
  { id: "persuasao", nome: "Persuasão", atributo: "presenca", descricao: "Convencer, negociar, acalmar." },
  { id: "intimidacao", nome: "Intimidação", atributo: "presenca", descricao: "Fazer os outros recuarem." },
  { id: "enganacao", nome: "Enganação", atributo: "presenca", descricao: "Mentir, blefar e disfarçar." },
  { id: "sobrevivencia", nome: "Sobrevivência", atributo: "vigor", descricao: "Rastrear, acampar, achar abrigo." },
  { id: "resistencia", nome: "Resistência", atributo: "vigor", descricao: "Aguentar dor, frio, fome e exaustão." }
];
