<?php
/**
 * YorTicketsAfrica API – GET /yor-api/shows.php
 * Returns all published/confirmed shows with ticket pool data.
 * Called by NestJS to mirror show data into PostgreSQL.
 *
 * Authentication: x-api-key header required.
 */

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    yor_error(405, 'Method not allowed');
}

yor_verify_key();

$db = yor_db();

// Fetch shows that are confirmed/ongoing with a future (or recent past) date
$shows_stmt = $db->prepare("
    SELECT
        s.id,
        s.name,
        s.venue,
        s.city,
        s.show_date,
        s.status,
        s.venue_capacity,
        s.notes
    FROM shows s
    WHERE s.status IN ('confirmed', 'ongoing', 'completed')
      AND s.show_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    ORDER BY s.show_date ASC
    LIMIT 50
");

if (!$shows_stmt) {
    yor_error(500, 'Query preparation failed: ' . $db->error);
}

$shows_stmt->execute();
$shows_result = $shows_stmt->get_result();
$shows = [];

while ($show = $shows_result->fetch_assoc()) {
    // Fetch ticket pool for this show
    $pool_stmt = $db->prepare("
        SELECT
            stp.id          AS pool_id,
            stp.category_name,
            stp.price,
            stp.total_qty,
            stp.wristband_label,
            stp.sort_order,
            COALESCE(
                (SELECT SUM(ysi.quantity)
                 FROM yor_sale_items ysi
                 JOIN yor_sales ys ON ys.id = ysi.sale_id
                 WHERE ysi.pool_id = stp.id AND ys.status = 'paid'),
                0
            ) AS sold_qty
        FROM show_ticket_pool stp
        WHERE stp.show_id = ?
        ORDER BY stp.sort_order ASC, stp.id ASC
    ");
    $pool_stmt->bind_param('i', $show['id']);
    $pool_stmt->execute();
    $pool_result = $pool_stmt->get_result();
    $ticketTypes = [];

    while ($pool = $pool_result->fetch_assoc()) {
        $ticketTypes[] = [
            'ysamsPoolId' => (int)$pool['pool_id'],
            'name'        => $pool['category_name'],
            'price'       => (float)$pool['price'],
            'totalQty'    => (int)$pool['total_qty'],
            'soldQty'     => (int)$pool['sold_qty'],
            'color'       => $pool['wristband_label'],
            'sortOrder'   => (int)$pool['sort_order'],
        ];
    }
    $pool_stmt->close();

    // Map YSAMS status to YorTickets status
    $yor_status = match($show['status']) {
        'confirmed' => 'PUBLISHED',
        'ongoing'   => 'PUBLISHED',
        'completed' => 'COMPLETED',
        default     => 'DRAFT',
    };

    $shows[] = [
        'ysamsId'     => (int)$show['id'],
        'title'       => $show['name'],
        'venue'       => $show['venue'] ?? '',
        'city'        => $show['city'] ?? '',
        'showDate'    => $show['show_date'],
        'status'      => $yor_status,
        'capacity'    => (int)$show['venue_capacity'],
        'description' => $show['notes'],
        'ticketTypes' => $ticketTypes,
    ];
}
$shows_stmt->close();

yor_json([
    'success' => true,
    'count'   => count($shows),
    'shows'   => $shows,
]);
