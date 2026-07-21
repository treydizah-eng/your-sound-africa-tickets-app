<?php
/**
 * YorTicketsAfrica API – POST /yor-api/record-sale.php
 * Records a confirmed YorTicketsAfrica online sale into YSAMS.
 * Called by NestJS after PayNow webhook confirms payment.
 *
 * Expected JSON body:
 * {
 *   "bookingRef":    "YT-2026-12345678",
 *   "showYsamsId":   12,
 *   "customerName":  "John Doe",
 *   "customerEmail": "john@example.com",
 *   "customerPhone": "+263771234567",
 *   "total":         30.00,
 *   "currency":      "USD",
 *   "paymentMethod": "paynow_web",
 *   "paynowRef":     "PAYNOW-XXXXXXXX",
 *   "items": [
 *     { "ysamsPoolId": 3, "ticketTypeName": "VIP", "quantity": 1, "unitPrice": 30.00, "subtotal": 30.00 }
 *   ],
 *   "soldAt": "2026-07-12T05:30:00.000Z"
 * }
 */

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    yor_error(405, 'Method not allowed');
}

yor_verify_key();

$raw  = file_get_contents('php://input');
$data = yor_body();

// ─── Validate required fields ────────────────────────────────────────────────
$required = ['bookingRef', 'showYsamsId', 'customerName', 'customerEmail', 'customerPhone', 'total', 'items'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        yor_log('SALE', $data['bookingRef'] ?? null, $raw, 400, "Missing: $field");
        yor_error(400, "Missing required field: $field");
    }
}

$db = yor_db();

// ─── Check for duplicate booking ref ────────────────────────────────────────
$dup = $db->prepare("SELECT id FROM yor_sales WHERE booking_ref = ? LIMIT 1");
$dup->bind_param('s', $data['bookingRef']);
$dup->execute();
$dup->store_result();
if ($dup->num_rows > 0) {
    $dup->close();
    yor_log('SALE', $data['bookingRef'], $raw, 200, 'duplicate');
    yor_json(['success' => true, 'message' => 'Already recorded']);
}
$dup->close();

// ─── Verify show exists ──────────────────────────────────────────────────────
$show_stmt = $db->prepare("SELECT id FROM shows WHERE id = ? LIMIT 1");
$show_stmt->bind_param('i', $data['showYsamsId']);
$show_stmt->execute();
$show_stmt->store_result();
if ($show_stmt->num_rows === 0) {
    $show_stmt->close();
    yor_log('SALE', $data['bookingRef'], $raw, 404, 'show not found');
    yor_error(404, 'Show not found in YSAMS');
}
$show_stmt->close();

// ─── Begin transaction ───────────────────────────────────────────────────────
$db->begin_transaction();

try {
    // Insert main sale record
    $booking_ref   = $data['bookingRef'];
    $show_id       = (int)$data['showYsamsId'];
    $cust_name     = $data['customerName'];
    $cust_email    = $data['customerEmail'];
    $cust_phone    = $data['customerPhone'];
    $total         = (float)$data['total'];
    $currency      = $data['currency'] ?? 'USD';
    $pay_method    = $data['paymentMethod'] ?? 'paynow_web';
    $paynow_ref    = $data['paynowRef'] ?? null;

    $ins = $db->prepare("
        INSERT INTO yor_sales
            (booking_ref, show_id, customer_name, customer_email, customer_phone,
             total_amount, currency, payment_method, paynow_ref, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid')
    ");
    $ins->bind_param('sisssdssss',
        $booking_ref, $show_id, $cust_name, $cust_email, $cust_phone,
        $total, $currency, $pay_method, $paynow_ref
    );
    $ins->execute();
    $sale_id = $db->insert_id;
    $ins->close();

    // Insert sale items
    foreach ($data['items'] as $item) {
        $pool_id   = (int)($item['ysamsPoolId'] ?? 0);
        $tt_name   = $item['ticketTypeName'] ?? '';
        $qty       = (int)($item['quantity'] ?? 1);
        $unit_price = (float)($item['unitPrice'] ?? 0);
        $subtotal  = (float)($item['subtotal'] ?? 0);

        $item_ins = $db->prepare("
            INSERT INTO yor_sale_items
                (sale_id, pool_id, ticket_type_name, quantity, unit_price, subtotal)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $item_ins->bind_param('iisidd', $sale_id, $pool_id, $tt_name, $qty, $unit_price, $subtotal);
        $item_ins->execute();
        $item_ins->close();
    }

    $db->commit();

    $response = json_encode(['success' => true, 'saleId' => $sale_id]);
    yor_log('SALE', $booking_ref, $raw, 201, $response);
    http_response_code(201);
    header('Content-Type: application/json');
    echo $response;

} catch (Exception $e) {
    $db->rollback();
    yor_log('SALE', $data['bookingRef'] ?? null, $raw, 500, $e->getMessage());
    yor_error(500, 'Failed to record sale: ' . $e->getMessage());
}
