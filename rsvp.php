<?php
/* ============================================================
   rsvp.php — Profluxus Conexão
   Salva confirmações de presença em rsvp.json

   Endpoint:
     POST ?acao=salvar  → salva lead no rsvp.json
     GET  ?acao=stats   → retorna total de confirmados
============================================================ */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://lp.profluxus.com');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, x-profluxus-token');

/* ── Segurança ── */
define('TOKEN_SECRET', 'sign@profluxus3DS'); // mesmo token do contador.php

/* ── Arquivo de dados ── */
define('DATA_FILE', __DIR__ . '/rsvp.json');

/* ── OPTIONS preflight ── */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

/* ── Lê dados existentes ── */
function lerDados() {
  if (!file_exists(DATA_FILE)) return [];
  $json = file_get_contents(DATA_FILE);
  return json_decode($json, true) ?: [];
}

/* ── Salva dados ── */
function salvarDados($lista) {
  $result = file_put_contents(
    DATA_FILE,
    json_encode($lista, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
    LOCK_EX
  );
  if ($result === false) {
    error_log('[RSVP] Falha ao salvar: ' . DATA_FILE . ' — ' . json_encode(error_get_last()));
    return false;
  }
  return true;
}

$acao   = isset($_GET['acao']) ? $_GET['acao'] : 'salvar';
$method = $_SERVER['REQUEST_METHOD'];

/* ── GET: stats ── */
if ($method === 'GET' && $acao === 'stats') {
  $lista = lerDados();
  echo json_encode([
    'ok'    => true,
    'total' => count($lista),
  ]);
  exit;
}

/* ── POST: salvar lead ── */
if ($method === 'POST') {

  /* Valida token */
  $token = isset($_SERVER['HTTP_X_PROFLUXUS_TOKEN']) ? $_SERVER['HTTP_X_PROFLUXUS_TOKEN'] : '';
  if ($token !== TOKEN_SECRET) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'erro' => 'Token inválido']);
    exit;
  }

  /* Recebe payload */
  $body = json_decode(file_get_contents('php://input'), true);

  if (!$body || empty($body['nome'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'erro' => 'Nome obrigatório']);
    exit;
  }

  /* Verifica duplicidade por WhatsApp */
  $lista = lerDados();
  $wpp   = isset($body['whatsapp']) ? trim($body['whatsapp']) : '';

  if ($wpp) {
    foreach ($lista as $item) {
      if (isset($item['whatsapp']) && trim($item['whatsapp']) === $wpp) {
        // Já cadastrado — retorna ok sem duplicar
        echo json_encode([
          'ok'        => true,
          'total'     => count($lista),
          'duplicado' => true,
        ]);
        exit;
      }
    }
  }

  /* Adiciona metadados do servidor */
  $body['data_registro'] = date('Y-m-d H:i:s');
  $body['ip']            = isset($_SERVER['HTTP_X_FORWARDED_FOR'])
                           ? $_SERVER['HTTP_X_FORWARDED_FOR']
                           : (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '');

  /* Salva */
  $lista[] = $body;

  if (!salvarDados($lista)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'erro' => 'Falha ao salvar no servidor. Verifique as permissões do arquivo rsvp.json']);
    exit;
  }

  echo json_encode([
    'ok'    => true,
    'total' => count($lista),
  ]);
  exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'erro' => 'Método ou ação inválida']);