-- ===========================================================================
-- YorTicketsAfrica → YSAMS Integration: New Tables
-- Run this in phpMyAdmin on your YSAMS database (mbos) BEFORE deploying
-- the yor-api/ folder to webzim.co.zw.
-- ===========================================================================

-- YorTicketsAfrica online sales (one row per order)
CREATE TABLE IF NOT EXISTS yor_sales (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    booking_ref     VARCHAR(30) NOT NULL UNIQUE,     -- e.g. YT-2026-12345678
    show_id         INT NOT NULL,
    customer_name   VARCHAR(200) NOT NULL,
    customer_email  VARCHAR(150) NOT NULL,
    customer_phone  VARCHAR(30)  NOT NULL,
    total_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
    currency        VARCHAR(10)  NOT NULL DEFAULT 'USD',
    payment_method  VARCHAR(30)  NOT NULL DEFAULT 'paynow_web',
    paynow_ref      VARCHAR(100) NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'paid', -- paid|refunded|cancelled
    synced_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ys_show (show_id),
    INDEX idx_ys_ref  (booking_ref),
    FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Individual ticket items per YorTickets sale
CREATE TABLE IF NOT EXISTS yor_sale_items (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    sale_id         INT NOT NULL,
    pool_id         INT NOT NULL,                    -- references show_ticket_pool.id
    ticket_type_name VARCHAR(100) NOT NULL,
    quantity        INT NOT NULL DEFAULT 1,
    unit_price      DECIMAL(10,2) NOT NULL DEFAULT 0,
    subtotal        DECIMAL(12,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (sale_id) REFERENCES yor_sales(id) ON DELETE CASCADE,
    FOREIGN KEY (pool_id) REFERENCES show_ticket_pool(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sync event log (audit trail of every inbound API call)
CREATE TABLE IF NOT EXISTS yor_sync_log (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    event_type      VARCHAR(30) NOT NULL,            -- SALE|REFUND|CANCEL|PING
    booking_ref     VARCHAR(30) NULL,
    request_body    TEXT NULL,
    response_code   INT NOT NULL DEFAULT 200,
    response_body   TEXT NULL,
    ip_address      VARCHAR(45) NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ysl_type (event_type),
    INDEX idx_ysl_ref  (booking_ref)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
