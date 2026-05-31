<?php
/**
 * LIVELLOZERO - Contact Form Handler
 * Antonio Ilacqua Portfolio 2026
 */

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Accesso negato."]);
    exit;
}

// Verifica reCAPTCHA v3
$recaptcha_secret = '6Ldsv7EsAAAAAGYUOoAzICPKneKlAD6OBj73nEDB';
$recaptcha_token  = $_POST['recaptcha_token'] ?? '';
if (!empty($recaptcha_token)) {
    $rc = json_decode(file_get_contents(
        "https://www.google.com/recaptcha/api/siteverify?secret={$recaptcha_secret}&response={$recaptcha_token}"
    ), true);
    if (!isset($rc['success']) || !$rc['success'] || ($rc['score'] ?? 0) < 0.5) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Verifica reCAPTCHA fallita. Riprova."]);
        exit;
    }
}

// Accetta sia nomi italiani che inglesi
$name    = htmlspecialchars(trim($_POST["nome"]      ?? $_POST["name"]    ?? ''), ENT_QUOTES, 'UTF-8');
$email   = filter_var(trim($_POST["email"] ?? ''), FILTER_SANITIZE_EMAIL);
$message = htmlspecialchars(trim($_POST["messaggio"] ?? $_POST["message"] ?? ''), ENT_QUOTES, 'UTF-8');

// Campi opzionali
$optional_map = [
    'progetto'     => 'Tipo di progetto',
    'subject'      => 'Oggetto',
    'telefono'     => 'Telefono',
    'sito'         => 'Sito attuale',
    'sede'         => 'Sede',
    'nome_azienda' => 'Nome Azienda',
];
$extra = '';
foreach ($optional_map as $key => $label) {
    if (!empty($_POST[$key])) {
        $val   = htmlspecialchars(trim($_POST[$key]), ENT_QUOTES, 'UTF-8');
        $extra .= "$label: $val\n";
    }
}

// Validazione
if (empty($name) || empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($message)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Per favore, compila tutti i campi correttamente."]);
    exit;
}

// Configurazione email
$recipient     = "info@antonioilacqua.it";
$email_subject = "Nuovo Messaggio dal Portfolio";

$email_content  = "Hai ricevuto un nuovo messaggio dal modulo di contatto.\n\n";
$email_content .= "Nome: $name\n";
$email_content .= "Email: $email\n";
$email_content .= $extra;
$email_content .= "\nMessaggio:\n$message\n";

$email_headers  = "From: $name <$email>\r\n";
$email_headers .= "Reply-To: $email\r\n";
$email_headers .= "X-Mailer: PHP/" . phpversion();

if (mail($recipient, $email_subject, $email_content, $email_headers)) {
    http_response_code(200);
    echo json_encode(["status" => "success", "message" => "Grazie! Il tuo messaggio è stato inviato correttamente."]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Ops! Qualcosa è andato storto e non abbiamo potuto inviare il messaggio."]);
}
?>
