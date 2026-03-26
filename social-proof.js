/* ============================================================
   social-proof.js — Profluxus Conexão
   - Contador de visitantes com prova social
   - Notificações toast rotativas (fictícios + leads reais)
   - Exit intent — abre modal ao tentar fechar a página
============================================================ */

(function () {

  /* ============================================================
     CONFIGURAÇÃO — edite aqui
  ============================================================ */
  var SP = {

    /* URL do contador PHP */
    contador_url: 'https://lp.profluxus.com/evento/conexao/contador.php',

    /* IDs dos elementos de contagem na página */
    el_contador:  'spContador',   // elemento que exibe o número
    el_label:     'spLabel',      // label abaixo do número

    /* Nomes fictícios usados enquanto não há leads reais suficientes */
    nomes_ficticios: [
      { nome: 'Ana Paula',    cidade: 'São Paulo, SP'        },
      { nome: 'Carlos',       cidade: 'Belo Horizonte, MG'   },
      { nome: 'Juliana',      cidade: 'Curitiba, PR'         },
      { nome: 'Marcos',       cidade: 'Rio de Janeiro, RJ'   },
      { nome: 'Fernanda',     cidade: 'Brasília, DF'         },
      { nome: 'Ricardo',      cidade: 'Salvador, BA'         },
      { nome: 'Patrícia',     cidade: 'Fortaleza, CE'        },
      { nome: 'Diego',        cidade: 'Porto Alegre, RS'     },
      { nome: 'Camila',       cidade: 'Recife, PE'           },
      { nome: 'Thiago',       cidade: 'Manaus, AM'           },
      { nome: 'Larissa',      cidade: 'Goiânia, GO'          },
      { nome: 'Bruno',        cidade: 'Florianópolis, SC'    },
      { nome: 'Vanessa',      cidade: 'Belém, PA'            },
      { nome: 'Felipe',       cidade: 'Vitória, ES'          },
      { nome: 'Renata',       cidade: 'Natal, RN'            },
      { nome: 'Gabriela',     cidade: 'Maceió, AL'           },
      { nome: 'Rodrigo',      cidade: 'São Luís, MA'         },
      { nome: 'Aline',        cidade: 'Teresina, PI'         },
      { nome: 'Leandro',      cidade: 'Campo Grande, MS'     },
      { nome: 'Priscila',     cidade: 'João Pessoa, PB'      },
      { nome: 'Anderson',     cidade: 'Aracaju, SE'          },
      { nome: 'Tatiane',      cidade: 'Cuiabá, MT'           },
      { nome: 'Fábio',        cidade: 'Porto Velho, RO'      },
      { nome: 'Mariana',      cidade: 'Macapá, AP'           },
      { nome: 'Gustavo',      cidade: 'Boa Vista, RR'        },
      { nome: 'Simone',       cidade: 'Rio Branco, AC'       },
      { nome: 'Eduardo',      cidade: 'Palmas, TO'           },
      { nome: 'Letícia',      cidade: 'Londrina, PR'         },
      { nome: 'Vinícius',     cidade: 'Campinas, SP'         },
      { nome: 'Débora',       cidade: 'Santos, SP'           },
      { nome: 'Henrique',     cidade: 'Ribeirão Preto, SP'   },
      { nome: 'Mônica',       cidade: 'Uberlândia, MG'       },
      { nome: 'Caio',         cidade: 'Joinville, SC'        },
      { nome: 'Isabela',      cidade: 'Sorocaba, SP'         },
      { nome: 'Alexandre',    cidade: 'Feira de Santana, BA' },
      { nome: 'Raquel',       cidade: 'Caxias do Sul, RS'    },
      { nome: 'Leonardo',     cidade: 'São José dos Campos, SP'},
      { nome: 'Bianca',       cidade: 'Niterói, RJ'          },
      { nome: 'Danilo',       cidade: 'Cascavel, PR'         },
      { nome: 'Sabrina',      cidade: 'Montes Claros, MG'    },
    ],
    
    mensagens: [
      '{nome} de {cidade} acabou de garantir sua vaga! 🔥',
      '{nome} acabou de entrar no grupo 🚀',
      '{nome} de {cidade} confirmou presença ✅',
      '{nome} garantiu acesso agora há pouco 👀',
      '{nome} de {cidade} está dentro! 🎯',
      '{nome} acabou de se inscrever 👏',
      '{nome} de {cidade} não quis perder essa 💡',
      'Mais um(a)! {nome} de {cidade} confirmou 🙌',
      '{nome} garantiu a vaga dela agora mesmo ⚡',
      '{nome} de {cidade} tá dentro do grupo 💬',
    ],

    /* Intervalo entre toasts (ms) */
    toast_intervalo: 16000,

    /* Intervalo para atualizar contador (ms) */
    contador_intervalo: 60000,

    /* Exit intent — ativa após quantos segundos na página */
    exit_delay: 10,

    /* Mínimo de leads reais para parar de usar fictícios */
    min_leads_reais: 7,
    
    /* Título e subtítulo exibidos na modal quando for exit intent */
    exit_pergunta:  'Espera! Antes de ir embora… 👀',
    exit_descricao: 'Só precisamos de 1 minuto seu. Esse conteúdo pode mudar seus resultados — e é 100% gratuito.',

  };

  /* ============================================================
     ESTADO
  ============================================================ */
  var leadsReais    = [];
  var toastTimer    = null;
  var exitAtivado   = false;
  var exitDisparado = false;
  var paginaEntrou  = Date.now();

  /* ============================================================
     CONTADOR — busca e atualiza
  ============================================================ */
  function buscarContador(incrementar) {
    var acao = incrementar ? 'visita' : 'stats';
    fetch(SP.contador_url + '?acao=' + acao)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (!data.ok) return;

        // Atualiza leads reais
        if (data.leads && data.leads.length > 0) {
          leadsReais = data.leads;
        }

        // Atualiza número na página
        animarContador(data.total);
      })
      .catch(function(e) {
        console.warn('[SP] Contador falhou:', e);
      });
  }

  function animarContador(total) {
    var el = document.getElementById(SP.el_contador);
    if (!el) return;

    var inicio  = parseInt(el.textContent.replace(/\D/g, '')) || 0;
    var fim     = total;
    var duracao = 1200;
    var passo   = Math.ceil((fim - inicio) / (duracao / 16));
    if (passo <= 0) passo = 1;

    var atual = inicio;
    var timer = setInterval(function() {
      atual += passo;
      if (atual >= fim) { atual = fim; clearInterval(timer); }
      el.textContent = atual.toLocaleString('pt-BR');
    }, 16);
  }

  /* ============================================================
     TOAST — notificação de prova social
  ============================================================ */
  function criarToastContainer() {
    if (document.getElementById('spToastWrap')) return;
    var wrap = document.createElement('div');
    wrap.id             = 'spToastWrap';
    wrap.style.cssText  =
      'position:fixed;bottom:90px;left:24px;z-index:999;' +
      'display:flex;flex-direction:column;gap:8px;pointer-events:none;';
    document.body.appendChild(wrap);
  }

  function proximoLead() {
    var lista = (leadsReais.length >= SP.min_leads_reais)
      ? leadsReais
      : SP.nomes_ficticios;
    var idx = Math.floor(Math.random() * lista.length);
    return lista[idx];
  }

  function mostrarToast() {
    var lead = proximoLead();
    var msg  = SP.mensagens[Math.floor(Math.random() * SP.mensagens.length)];
    msg = msg.replace('{nome}', lead.nome).replace('{cidade}', lead.cidade || 'Brasil');

    var wrap  = document.getElementById('spToastWrap');
    if (!wrap) return;

    var toast = document.createElement('div');
    toast.style.cssText =
      'background:rgba(8,14,30,0.96);' +
      'border:1px solid rgba(232,168,52,0.3);' +
      'border-left:3px solid #e8a834;' +
      'padding:12px 16px;' +
      'max-width:280px;' +
      'font-family:\'DM Sans\',sans-serif;' +
      'font-size:13px;' +
      'color:rgba(248,245,239,0.88);' +
      'line-height:1.4;' +
      'pointer-events:all;' +
      'box-shadow:0 4px 24px rgba(0,0,0,0.4);' +
      'opacity:0;transform:translateX(-20px);' +
      'transition:opacity 0.4s ease,transform 0.4s ease;';

    toast.innerHTML =
      '<div style="display:flex;align-items:flex-start;gap:10px;">' +
        '<span style="font-size:20px;flex-shrink:0;line-height:1;">🔔</span>' +
        '<span>' + msg + '</span>' +
      '</div>';

    wrap.appendChild(toast);

    // Anima entrada
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        toast.style.opacity   = '1';
        toast.style.transform = 'translateX(0)';
      });
    });

    // Remove após 5s
    setTimeout(function() {
      toast.style.opacity   = '0';
      toast.style.transform = 'translateX(-20px)';
      setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 400);
    }, 5000);
  }

  function iniciarToasts() {
    // Primeiro toast após 4s
    setTimeout(function() {
      mostrarToast();
      toastTimer = setInterval(mostrarToast, SP.toast_intervalo);
    }, 4000);
  }

  /* ============================================================
     EXIT INTENT
  ============================================================ */
  function iniciarExitIntent() {
    // Só ativa após SP.exit_delay segundos na página
    setTimeout(function() {
      exitAtivado = true;
    }, SP.exit_delay * 1000);

    document.addEventListener('mouseleave', function(e) {
      if (!exitAtivado)   return;
      if (exitDisparado)  return;
      if (e.clientY > 10) return; // só dispara se mouse saiu pelo topo

      exitDisparado = true;
      dispararExitIntent();
    });

    // Mobile: dispara ao clicar no botão voltar (popstate)
    window.addEventListener('beforeunload', function() {
      if (!exitDisparado) {
        exitDisparado = true;
        dispararExitIntent();
      }
    });
  }
  
  function dispararExitIntent() {
      var overlay = document.getElementById('modalOverlay');
      if (overlay && overlay.classList.contains('active')) return;
    
      /* Injeta temporariamente uma pergunta diferente no step 0 */
      var stepOriginal = CONFIG.modal.steps[0].pergunta;
      var subOriginal  = CONFIG.modal.steps[0].subtitulo;
    
      CONFIG.modal.steps[0].pergunta  = SP.exit_pergunta;
      CONFIG.modal.steps[0].subtitulo = SP.exit_descricao;
    
      var btn = document.querySelector('.js-open-modal');
      if (btn) btn.click();
    
      /* Restaura a pergunta original após abrir */
      setTimeout(function() {
        CONFIG.modal.steps[0].pergunta  = stepOriginal;
        CONFIG.modal.steps[0].subtitulo = subOriginal;
      }, 500);
    }

  /* ============================================================
     INIT
  ============================================================ */
  document.addEventListener('DOMContentLoaded', function() {
    criarToastContainer();
    buscarContador(true);   // incrementa visita
    iniciarToasts();
    iniciarExitIntent();

    // Atualiza contador periodicamente sem incrementar
    setInterval(function() {
      buscarContador(false);
    }, SP.contador_intervalo);
  });

})();