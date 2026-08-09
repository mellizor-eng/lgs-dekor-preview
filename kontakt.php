<?php
/**
 * kontakt.php — tar emot kontaktformuläret och mejlar till LGS.
 * Honeypot ("webbplats") + enkel rate limit per IP.
 */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

const MOTTAGARE = ['gottfrid@lgsdekoromaleri.se', 'lovisa@lgsdekoromaleri.se'];
const AVSANDARE = 'no-reply@lgsdekoromaleri.se';

function fail(string $msg, int $code = 400): never {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('Endast POST', 405);
if (trim((string)($_POST['webbplats'] ?? '')) !== '') { echo json_encode(['ok' => true]); exit; } // honeypot: låtsas ok

// Rate limit: max 5 per timme per IP.
$ip = $_SERVER['REMOTE_ADDR'] ?? '?';
$rlFile = sys_get_temp_dir() . '/lgs-kontakt-' . md5($ip);
$hits = is_file($rlFile) ? array_filter(explode("\n", (string)file_get_contents($rlFile)), fn($t) => (int)$t > time() - 3600) : [];
if (count($hits) >= 5) fail('För många försök — prova igen senare, eller ring oss.', 429);
$hits[] = (string)time();
file_put_contents($rlFile, implode("\n", $hits));

$namn    = trim((string)($_POST['namn'] ?? ''));
$epost   = trim((string)($_POST['epost'] ?? ''));
$telefon = trim((string)($_POST['telefon'] ?? ''));
$amne    = trim((string)($_POST['amne'] ?? 'Kontaktformulär'));
$medd    = trim((string)($_POST['meddelande'] ?? ''));

if ($namn === '' || $medd === '') fail('Fyll i namn och meddelande.');
if (!filter_var($epost, FILTER_VALIDATE_EMAIL)) fail('Ogiltig e-postadress.');
if (mb_strlen($medd) > 5000 || mb_strlen($namn) > 200) fail('För långt meddelande.');

$body = "Nytt meddelande via lgsdekoromaleri.com\n"
      . str_repeat('-', 40) . "\n"
      . "Namn:    $namn\n"
      . "E-post:  $epost\n"
      . ($telefon !== '' ? "Telefon: $telefon\n" : '')
      . "Ämne:    $amne\n"
      . str_repeat('-', 40) . "\n\n$medd\n";

$headers = "From: LG's Dekor & Måleri <" . AVSANDARE . ">\r\n"
         . "Reply-To: $namn <$epost>\r\n"
         . "Content-Type: text/plain; charset=UTF-8\r\n";

$subject = '=?UTF-8?B?' . base64_encode("Kontaktformulär: $amne — $namn") . '?=';
$ok = mail(implode(',', MOTTAGARE), $subject, $body, $headers);

if (!$ok) fail('Kunde inte skicka mejlet.', 500);
echo json_encode(['ok' => true]);
