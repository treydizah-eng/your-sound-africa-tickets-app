<?php
/**
 * YorTicketsAfrica API – POST /yor-api/webhook.php
 * Handles refund and cancellation events from YorTicketsAfrica.
 * Called by NestJS when a refund or cancellation is processed.
 *
 * Expected JSON body:
 * {
 *   "event":      "REFUND" | "CANCEL",
 *   "bookingRef": "YT-2026-12345678",
 *   "reason":     "Customer requested refund"
 * }
 */

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    yor_error(405, 'Method not allowed');
}

yor_verify_key();

$raw  = file_get_contents('php://input');
$data = yor_body();

$event_type  = strtoupper($data['event'] ?? '');
$booking_ref = $data['bookingRef'] ?? '';

if (!in_array($event_type, ['REFUND', 'CANCEL'], true) || empty($booking_ref)) {
    yor_log($event_type ?: 'UNKNOWN', $booking_ref ?: null, $raw, 400, 'invalid body');
    yor_error(400, 'Invalid event type or missing bookingRef');
}

$db = yor_db();

// Find the sale
$find = $db->prepare("SELECT id, status FROM yor_sales WHERE booking_ref = ? LIMIT 1");
$find->bind_param('s', $booking_ref);
$find->execute();
$result = $find->get_result();
$sale   = $result->fetch_assoc();
$find->close();

if (!$sale) {
    yor_log($event_type, $booking_ref, $raw, 404, 'not found');
    yor_error(404, 'Sale not found');
}

$new_status = $event_type === 'REFUND' ? 'refunded' : 'cancelled';

$upd = $db->prepare("UPDATE yor_sales SET status = ? WHERE booking_ref = ?");
$upd->bind_param('ss', $new_status, $booking_ref);
$upd->execute();
$upd->close();

yor_log($event_type, $booking_ref, $raw, 200, 'updated to ' . $new_status);
yor_json(['success' => true, 'status' => $new_status]);
