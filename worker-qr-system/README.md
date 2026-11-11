# Worker QR Verification Management System
### Enterprise Worker Information, Cryptographic QR Generation & Public Verification Engine

A complete, production-ready Full-Stack PHP 8.2+ / MySQL application designed for workforce management, permit authorization tracking, tamper-resistant QR code generation, camera & image-upload QR verification, and public read-only verification certificates.

---

## KEY ARCHITECTURAL FEATURES

### 1. Dual-Interface Architecture
- **Admin Panel**: Complete CRUD over workers, permits, multiple employee benefits, dynamic custom fields, security audit logs, QR code generation/revocation, database backups, and system settings.
- **Public Verification Portal (`/verify/{token}`)**: Publicly accessible without authentication. Displays approved public worker data, active/expired status calculation, organization branding, and printable certificates. Strictly prevents unauthorized edits or API exploitation.

### 2. Cryptographic Security Standards
- **Token Generation**: Uses PHP `random_bytes(32)` to generate 256-bit cryptographically secure entropy.
- **Storage Security**: Only **SHA-256 hashes** of tokens are saved in the database (`qr_codes.token_hash`). The raw token only exists in the physical/digital QR code payload URL (`APP_URL/verify/{token}`).
- **Zero Raw PII Exposure**: Database primary keys, social security numbers, internal IDs, and passwords are never exposed in QR URLs or public payloads.
- **Revocation & Anti-Replay**: Regenerating a QR code immediately revokes the preceding token. Revoked, expired, or deleted worker QRs render an instant security notice without exposing system internals.
- **Brute Force & Rate Limiting**: Automatic IP and username throttling with temporary lockouts.
- **CSRF & Prepared Statements**: 100% prepared PDO statements, session fixation protection via `session_regenerate_id()`, and CSRF verification tokens.

### 3. QR Scanner Module
- **Live Camera Scanner**: HTML5 video camera feed with automatic rear/environment camera selection on mobile devices, live viewfinder reticle, and instant verification redirection.
- **QR Image Upload Scanner**: Client-side image upload (PNG, JPG, WebP) with validation that prevents open redirects by verifying the destination URL is strictly a local verification route.

### 4. Modular Codebase Layout
```
worker-qr-system/
├── app/
│   ├── Controllers/    (Auth, Dashboard, Worker, Permit, QR, Scanner, Verification, Settings, CustomField)
│   ├── Models/         (Admin, Worker, Permit, Benefit, QRCode, CustomField, AuditLog, Setting, Database)
│   ├── Middleware/     (AuthMiddleware, CsrfMiddleware, GuestMiddleware)
│   ├── Services/       (QRService, WorkerService, UploadService)
│   └── Helpers/        (helpers.php, security.php, validation.php)
├── config/             (app.php, database.php, security.php)
├── database/           (schema.sql, seed.sql)
├── public/             (index.php, .htaccess, assets/, uploads/, qr-codes/)
├── resources/views/    (layouts/, auth/, dashboard/, workers/, qr/, scanner/, verification/, settings/)
├── routes/             (web.php)
├── composer.json
├── .env.example
├── INSTALLATION.md
└── README.md
```

---

## QUICK START ON LOCALHOST (XAMPP)

1. Copy `worker-qr-system` to `C:\xampp\htdocs\worker-qr-system`.
2. Start Apache and MySQL in XAMPP.
3. Import `database/schema.sql` and `database/seed.sql` into phpMyAdmin database `worker_qr_system`.
4. Copy `.env.example` to `.env` and verify database credentials.
5. Open `http://localhost/worker-qr-system/public/` in your browser.
6. Login: Username: `admin` | Password: `Password@123!`

For complete detailed steps, refer to `INSTALLATION.md`.
