# YorTicketsAfrica → YSAMS PHP Connector

This folder contains the thin PHP REST API layer that bridges YorTicketsAfrica (NestJS) with the existing YSAMS (`music-bos`) MySQL database on `webzim.co.zw`.

## Deployment Steps

### 1. Run the SQL Migration
In phpMyAdmin on your `mbos` database, execute:
```
ysams-connector/migrate_yor_sync.sql
```
This creates `yor_sales`, `yor_sale_items`, and `yor_sync_log` tables.

### 2. Upload `yor-api/` to YSAMS Server
Upload the entire `yor-api/` folder into your YSAMS public directory, e.g.:
```
/public_html/yor-api/
```

### 3. Set the API Key
In `yor-api/config.php`, update the database credentials to match `config.php` in your YSAMS root. Then set the shared secret:
```php
define('YOR_API_KEY', 'your-strong-shared-secret-here');
```
This **must** match `YSAMS_API_KEY` in your NestJS `.env`.

### 4. Set Environment Variable on cPanel
In cPanel → PHP → Environment Variables (or in `.htaccess`):
```
SetEnv YOR_API_KEY your-strong-shared-secret-here
```

## API Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| `GET`  | `/yor-api/shows.php` | `x-api-key` | Returns confirmed shows + ticket pools |
| `POST` | `/yor-api/record-sale.php` | `x-api-key` | Records a completed online sale |
| `POST` | `/yor-api/webhook.php` | `x-api-key` | Handles refund/cancel events |

## Data Flow

```
YSAMS (PHP)                    NestJS API
    │                               │
    │  GET /yor-api/shows.php       │
    │◄──────────────────────────────│  (every 5 min cron)
    │  → shows + ticket pools       │
    │                               │
    │  POST /yor-api/record-sale    │
    │◄──────────────────────────────│  (after PayNow webhook)
    │  ← sale saved in yor_sales    │
```
