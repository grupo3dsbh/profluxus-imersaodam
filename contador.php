<?php
/* ============================================================
   contador.php — Profluxus Conexão
   Incrementa visitas e gerencia lista de leads confirmados
   
   Endpoints:
     GET  ?acao=visita     → incrementa + retorna stats
     GET  ?acao=stats      → só retorna stats (sem incrementar)
     POST ?acao=lead       → adiciona lead real à lista
   
   Arquivo de dados: contador_data.json (mesma pasta)
============================================================ */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://lp.profluxus.com');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type, x-profluxus-token');

/* ── Segurança: token obrigatório para adicionar leads ── */
define('TOKEN_SECRET', 'sign@profluxus3DS'); // mesmo token do webhook n8n

/* ── Arquivo de dados ── */
define('DATA_FILE', __DIR__ . '/contador_data.json');

/* ── Lê ou inicializa dados ── */
function lerDados() {
  if (!file_exists(DATA_FILE)) {
    return [
      'visitas' => 0,
      'leads'   => [],
    ];
  }
  $json = file_get_contents(DATA_FILE);
  $data = json_decode($json, true);
  return $data ?: ['visitas' => 0, 'leads' => []];
}

/* ── Salva dados ── */
function salvarDados($data) {
  $result = file_put_contents(DATA_FILE, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
  if ($result === false) {
    error_log('[Profluxus] Falha ao salvar: ' . DATA_FILE . ' — ' . json_encode(error_get_last()));
  }
}

/* ── Retorna últimos N leads (só primeiro nome) ── */
function ultimosLeads($leads, $n = 10) {
  $ultimos = array_slice(array_reverse($leads), 0, $n);
  return array_map(function($l) {
    // Retorna só o primeiro nome por privacidade
    $partes = explode(' ', trim($l['nome']));
    $cidade = isset($l['cidade']) ? $l['cidade'] : '';
    return [
      'nome'   => $partes[0],
      'cidade' => $cidade,
      'hora'   => $l['hora'],
    ];
  }, $ultimos);
}

/* ── Roteamento ── */
$acao   = isset($_GET['acao']) ? $_GET['acao'] : 'stats';
$method = $_SERVER['REQUEST_METHOD'];

// OPTIONS preflight
if ($method === 'OPTIONS') {
  http_response_code(200);
  exit;
}

/* ── GET: visita ou stats ── */
if ($method === 'GET') {
  $data = lerDados();

  if ($acao === 'visita') {
    $data['visitas']++;
    salvarDados($data);
  }

  // Adiciona número fictício base para parecer mais cheio
  // (visitas reais + base configurável)
  $base    = 247; // ajuste como quiser
  $total   = $data['visitas'] + $base;

  echo json_encode([
    'ok'      => true,
    'total'   => $total,
    'visitas' => $data['visitas'],
    'leads'   => ultimosLeads($data['leads']),
  ]);
  exit;
}

/* ── POST: adiciona lead real ── */
if ($method === 'POST' && $acao === 'lead') {
  // Valida token
  $token = isset($_SERVER['HTTP_X_PROFLUXUS_TOKEN']) ? $_SERVER['HTTP_X_PROFLUXUS_TOKEN'] : '';
  if ($token !== TOKEN_SECRET) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'erro' => 'Token inválido']);
    exit;
  }

  $body = json_decode(file_get_contents('php://input'), true);
  $nome = isset($body['nome']) ? trim($body['nome']) : '';

  if (empty($nome)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'erro' => 'Nome obrigatório']);
    exit;
  }

  $data = lerDados();
  $data['leads'][] = [
    'nome'   => $nome,
    'cidade' => isset($body['cidade']) ? $body['cidade'] : '',
    'hora'   => date('H:i'),
  ];

  // Mantém só os últimos 200 leads
  if (count($data['leads']) > 200) {
    $data['leads'] = array_slice($data['leads'], -200);
  }

  salvarDados($data);
  echo json_encode(['ok' => true]);
  exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'erro' => 'Ação inválida']);