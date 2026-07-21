<?php
/**
 * YorTicketsAfrica API Connector – Configuration
 * Place this entire yor-api/ folder inside your YSAMS directory on webzim.co.zw.
 * e.g. /public_html/ysams/yor-api/
 *
 * The YSAMS_API_KEY here MUST match the YSAMS_API_KEY value in your NestJS .env file.
 */

// ─── Shared secret key (must match NestJS YSAMS_API_KEY env var) ─────────────
define('YOR_API_KEY', getenv('YOR_API_KEY') ?: 'REPLACE_WITH_YOUR_SHARED_SECRET');

// ─── CORS origin for the YorTicketsAfrica NestJS API ─────────────────────────
define('YOR_ALLOWED_ORIGIN', 'https://api.yoticketsafrica.com');

// ─── Database connection (same credentials as YSAMS config.php) ──────────────
define('DB_HOST', 'localhost');
define('DB_USER', 'root');         // cPanel: your MySQL username
define('DB_PASS', '');             // cPanel: your MySQL password
define('DB_NAME', 'mbos');         // cPanel: minister_MusicManagementDB

// ─── Helper: get database connection ─────────────────────────────────────────
function yor_db(): mysqli {
    static $conn = null;
    if ($conn === null) {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if ($conn->connect_error) {
            yor_error(500, 'Database connection failed');
        }
        $conn->set_charset('utf8mb4');
    }
    return $conn;
}

// ─── Helper: output JSON response ────────────────────────────────────────────
function yor_json(array $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function yor_error(int $code, string $message): void {
    yor_json(['error' => true, 'message' => $message], $code);
}

// ─── Helper: verify API key from request header ───────────────────────────────
function yor_verify_key(): void {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $key = $headers['x-api-key'] ?? $headers['X-Api-Key'] ?? $_SERVER['HTTP_X_API_KEY'] ?? '';
    if ($key !== YOR_API_KEY) {
        yor_error(401, 'Unauthorized');
    }
}

// ─── Helper: get JSON request body ───────────────────────────────────────────
function yor_body(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        yor_error(400, 'Invalid JSON body');
    }
    return $data;
}

// ─── Helper: log sync event ───────────────────────────────────────────────────
function yor_log(string $type, ?string $ref, string $body, int $code, string $response): void {
    $db = yor_db();
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $stmt = $db->prepare(
        "INSERT INTO yor_sync_log (event_type, booking_ref, request_body, response_code, response_body, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)"
    );
    $stmt->bind_param('sssiss', $type, $ref, $body, $code, $response, $ip);
    $stmt->execute();
    $stmt->close();
}

// ─── CORS headers ─────────────────────────────────────────────────────────────
header('Access-Control-Allow-Origin: ' . YOR_ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, x-api-key');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
