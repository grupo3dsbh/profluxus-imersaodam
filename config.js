/* ============================================================
   ██████╗  █████╗ ██████╗  █████╗ ███╗   ███╗███████╗████████╗██████╗  ██████╗ ███████╗
   ██╔══██╗██╔══██╗██╔══██╗██╔══██╗████╗ ████║██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗██╔════╝
   ██████╔╝███████║██████╔╝███████║██╔████╔██║█████╗     ██║   ██████╔╝██║   ██║███████╗
   ██╔═══╝ ██╔══██║██╔══██╗██╔══██║██║╚██╔╝██║██╔══╝     ██║   ██╔══██╗██║   ██║╚════██║
   ██║     ██║  ██║██║  ██║██║  ██║██║ ╚═╝ ██║███████╗   ██║   ██║  ██║╚██████╔╝███████║
   ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝
   Edite este bloco para personalizar toda a landing page
   ============================================================ */

const CONFIG = {

  /* ----------------------------------------------------------
     LINKS
  ---------------------------------------------------------- */
  links: {
    grupo_whatsapp: "https://chat.whatsapp.com/DCE6W0DITMs0wUeV7UklD5?mode=gi_t",   // Link do grupo do WhatsApp
    youtube_live:   "",   // Link da live no YouTube (opcional)
  },

  /* ----------------------------------------------------------
     IMAGENS DOS ESPECIALISTAS
     Use URL absoluta ou caminho relativo: './foto-gilson.jpg'
  ---------------------------------------------------------- */
  fotos: {
    gilson:     "img/gilsonj.webp",   // Ex: "https://..." ou "./gilson.jpg"
    ragner:     "img/ragner.webp",   // Ex: "https://..." ou "./ragner.jpg"
    alessandra: "img/alessandra.webp",   // Ex: "https://..." ou "./alessandra.jpg"
  },

  /* ----------------------------------------------------------
     TIPOGRAFIA
     Use qualquer nome de família disponível no Google Fonts
     (as fontes abaixo já estão sendo carregadas no <head>)
  ---------------------------------------------------------- */
  fontes: {
    titulo:  "'Playfair Display', serif",   // H1, títulos grandes
    display: "'Posterama', 'Space Mono', monospace", // Logo, badges, pilares
    corpo:   "'DM Sans', sans-serif",       // Parágrafos, textos
    botoes:  "'DM Sans', sans-serif",       // Texto dos botões
    mono:    "'Space Mono', monospace",     // Datas, labels técnicas
  },

  /* ----------------------------------------------------------
     CORES (sobrescrevem as CSS variables)
  ---------------------------------------------------------- */
  cores: {
    gold:        "#e8a834",
    gold_light:  "#f5c96a",
    teal:        "#00c6a2",
    deep:        "#05080f",   // Fundo principal
    navy:        "#080e1e",   // Fundo secundário
    white:       "#f8f5ef",   // Texto claro
  },

  /* ----------------------------------------------------------
     TEXTOS GERAIS
  ---------------------------------------------------------- */
  evento: {
    nome:  "Profluxus Conexão",
    data:  "27 de março",
    ano:   "2026",
    tipo:  "Evento Online Gratuito",
    badge_float: "🎟️ 27/MAR - 19H · GRATUITO",
  },

  /* ----------------------------------------------------------
     MODAL TYPEBOT — FLUXO DE CADASTRO
     Cada objeto em "steps" é uma tela da modal.

     Tipos disponíveis:
       "text"    → campo de texto livre
       "phone"   → campo de telefone
       "email"   → campo de e-mail
       "radio"   → seleção única (defina opções em "options")
       "confirm" → tela final de confirmação (sem input)

     Campo "key" → nome da variável salva nos dados do lead
  ---------------------------------------------------------- */
  modal: {
    btn_proximo:     "Continuar →",
    btn_entrar:      "💬 Entrar no grupo agora",

    /*
    ┌─────────────────────────────────────────────────────────────┐
    │  FLUXO ACoPeL — 6 steps + confirmação                      │
    │                                                             │
    │  Tipos de campo disponíveis por step:                       │
    │    tipo: "multi"  → vários campos numa tela só              │
    │    tipo: "radio"  → seleção única (auto-avança)             │
    │    tipo: "chips"  → seleção múltipla visual (não avança)    │
    │    tipo: "confirm"→ tela final                              │
    │                                                             │
    │  Dentro de "multi", cada campo tem:                         │
    │    key, label, input (text/email/phone/select), placeholder │
    │    obrigatorio, options (para select)                       │
    └─────────────────────────────────────────────────────────────┘
    */
    steps: [

      /* ── STEP 1 · ACOLHER ─────────────────────────────────── */
      {
        tipo:     "multi",
        icone:    "👋",
        pergunta: "Antes de tudo… quem é você?",
        subtitulo:"Só o básico pra gente te chamar pelo nome durante a live.",
        obrigatorio_geral: true,
        campos: [
          {
            key: "nome",
            label: "Primeiro nome",
            input: "text",
            placeholder: "Como quer ser chamado(a)?",
            obrigatorio: true,
          },
          {
            key: "email",
            label: "Seu melhor e-mail",
            input: "email",
            placeholder: "voce@email.com",
            obrigatorio: true,
          },
        ],
      },

      /* ── STEP 2 · CONEXÃO ─────────────────────────────────── */
      {
        tipo:     "multi",
        icone:    "📱",
        // {nome} será substituído pelo nome digitado
        pergunta: "Ótimo, {nome}! Agora me passa seu WhatsApp.",
        subtitulo:"O link da live chega direto aqui — promessa.",
        campos: [
          {
            key: "pais",
            label: "País",
            input: "select",
            obrigatorio: true,
            options: [
              { value: "+55",  label: "🇧🇷 Brasil (+55)" },
              { value: "+351", label: "🇵🇹 Portugal (+351)" },
              { value: "+1",   label: "🇺🇸 EUA/Canadá (+1)" },
              { value: "+44",  label: "🇬🇧 Reino Unido (+44)" },
              { value: "+34",  label: "🇪🇸 Espanha (+34)" },
              { value: "+54",  label: "🇦🇷 Argentina (+54)" },
              { value: "+598", label: "🇺🇾 Uruguai (+598)" },
              { value: "+595", label: "🇵🇾 Paraguai (+595)" },
              { value: "+56",  label: "🇨🇱 Chile (+56)" },
              { value: "+57",  label: "🇨🇴 Colômbia (+57)" },
            ],
          },
          {
            key: "whatsapp",
            label: "Número do WhatsApp",
            input: "phone",
            placeholder: "(11) 99999-9999",
            obrigatorio: true,
          },
        ],
      },

      /* ── STEP 3 · CONTEXTUALIZAR: Situação atual ─────────── */
      {
        tipo:     "radio",
        icone:    "💰",
        key:      "faturamento",
        pergunta: "Quanto você fatura hoje com vendas online?",
        subtitulo:"Sem julgamento — isso nos ajuda a calibrar o que vamos te mostrar na live.",
        obrigatorio: true,
        options: [
          { label: "Ainda estou começando",  value: "ate_5k",     emoji: "🌱" },
          { label: "R$ 5k – R$ 10k / mês",  value: "5k_10k",     emoji: "📈" },
          { label: "R$ 10k – R$ 20k / mês", value: "10k_20k",    emoji: "🚀" },
          { label: "R$ 20k – R$ 50k / mês", value: "20k_50k",    emoji: "💎" },
          { label: "Acima de R$ 50k / mês", value: "50k_plus",   emoji: "🏆" },
        ],
      },

      /* ── STEP 4 · CONTEXTUALIZAR: WhatsApp ───────────────── */
      {
        tipo:     "multi",
        icone:    "⚡",
        pergunta: "Agora me conta sobre o seu WhatsApp…",
        subtitulo:"Essas respostas vão determinar o que você precisa aprender primeiro na live.",
        campos: [
          {
            key: "banimentos",
            label: "Já foi banido ou restrito no WhatsApp?",
            input: "select",
            obrigatorio: true,
            options: [
              { value: "nunca",       label: "Nunca aconteceu" },
              { value: "1_vez",       label: "1 vez — levei um susto" },
              { value: "2_3_vezes",   label: "2 a 3 vezes" },
              { value: "4_mais",      label: "4+ vezes (tô cansado disso)" },
            ],
          },
          {
            key: "contatos_wpp",
            label: "Quantos contatos (leads) você tem no WhatsApp?",
            input: "select",
            obrigatorio: true,
            options: [
              { value: "ate_500",     label: "Menos de 500" },
              { value: "500_2k",      label: "500 – 2.000" },
              { value: "2k_10k",      label: "2.000 – 10.000" },
              { value: "10k_plus",    label: "Mais de 10.000" },
            ],
          },
        ],
      },

      /* ── STEP 5 · CONTEXTUALIZAR: Tráfego ────────────────── */
      {
        tipo:     "multi",
        icone:    "🎯",
        pergunta: "E no tráfego pago… como você está?",
        subtitulo:"4 perguntas rápidas — menos de 30 segundos. Vale muito a pena.",
        campos: [
          {
            key: "trafego_pago",
            label: "Trabalha com tráfego pago atualmente?",
            input: "select",
            obrigatorio: true,
            options: [
              { value: "sim_ativamente",  label: "Sim, ativamente" },
              { value: "sim_pouco",       label: "Sim, mas invisto pouco" },
              { value: "nao_mas_quero",   label: "Não, mas quero começar" },
              { value: "nao_terceirizo",  label: "Não, terceirizo" },
            ],
          },
          {
            key: "leads_dia",
            label: "Média de leads que você recebe por dia",
            input: "select",
            obrigatorio: false,
            options: [
              { value: "0_5",    label: "0 – 5 leads/dia" },
              { value: "5_20",   label: "5 – 20 leads/dia" },
              { value: "20_50",  label: "20 – 50 leads/dia" },
              { value: "50_plus",label: "Mais de 50 leads/dia" },
            ],
          },
          {
            key: "investimento_dia",
            label: "Investimento médio por dia em anúncios",
            input: "select",
            obrigatorio: false,
            options: [
              { value: "nao_invisto",  label: "Não invisto ainda" },
              { value: "ate_50",       label: "Até R$ 50/dia" },
              { value: "50_200",       label: "R$ 50 – R$ 200/dia" },
              { value: "200_plus",     label: "Acima de R$ 200/dia" },
            ],
          },
          {
            key: "curso_trafego",
            label: "Já fez algum curso de tráfego pago?",
            input: "select",
            obrigatorio: false,
            options: [
              { value: "sim_varios",  label: "Sim, vários" },
              { value: "sim_um",      label: "Sim, um ou dois" },
              { value: "nao",         label: "Ainda não" },
            ],
          },
        ],
      },

      /* ── STEP 6 · CONTEXTUALIZAR: CRM ────────────────────── */
      {
        tipo:     "radio",
        icone:    "🧩",
        key:      "usa_crm",
        pergunta: "Última pergunta — usa algum CRM ou ferramenta pra organizar seus leads?",
        subtitulo:"Isso vai mostrar em qual parte do método você vai ter o maior salto.",
        obrigatorio: true,
        options: [
          { label: "Sim, tenho um CRM rodando",       value: "sim",           emoji: "✅" },
          { label: "Uso planilha / improvisado",       value: "planilha",      emoji: "📊" },
          { label: "Não organizo — está tudo no WPP",  value: "nao_organizo",  emoji: "😅" },
          { label: "Não tenho leads ainda",            value: "sem_leads",     emoji: "🌱" },
        ],
      },

      /* ── CONFIRM ──────────────────────────────────────────── */
      {
        tipo:      "confirm",
        pergunta:  "Perfeito, {nome}! Você está dentro. 🔥",
        descricao: "Preparamos um conteúdo certeiro pro seu momento — você vai ver o porquê na live. Clique abaixo e entre no grupo exclusivo para receber o link.",
      },

    ], // fim steps

    /* Webhook n8n — deixe vazio para desativar */
    webhook_url: "https://webhook.n8ng3.com.br/webhook/evento-profluxus-conexao",  // Ex: "https://n8n.seudominio.com.br/webhook/profluxus-conexao"
  },

};
/* ============================================================
   FIM DOS PARÂMETROS — não é necessário editar abaixo disso
   (a menos que queira customizações avançadas)
   ============================================================ */
