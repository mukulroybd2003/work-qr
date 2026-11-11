<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Print Worker ID Badge - <?= e($worker['full_name']) ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: #f1f5f9;
            padding: 2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .badge-card {
            width: 360px;
            background: #ffffff;
            border-radius: 16px;
            border: 2px solid #0f172a;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            overflow: hidden;
            text-align: center;
        }
        .badge-header {
            background: #0f172a;
            color: #ffffff;
            padding: 1.25rem 1rem;
        }
        .badge-photo {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #059669;
            margin-top: -50px;
            background: #ffffff;
        }
        @media print {
            body { background: #ffffff; padding: 0; }
            .no-print { display: none !important; }
            .badge-card { box-shadow: none; margin: 0 auto; page-break-inside: avoid; }
        }
    </style>
</head>
<body>

<div class="no-print mb-4 d-flex gap-3">
    <button onclick="window.print()" class="btn btn-dark fw-semibold px-4">
        Print Badge Card
    </button>
    <a href="javascript:window.close()" class="btn btn-outline-secondary">
        Close Window
    </a>
</div>

<div class="badge-card">
    <div class="badge-header">
        <div class="text-uppercase small fw-bold text-emerald-400" style="letter-spacing:0.05em; color:#34d399;">
            <?= e(app_config('settings.organization_name', 'Workforce Services')) ?>
        </div>
        <div class="fs-6 fw-bold">AUTHORIZED WORKER BADGE</div>
    </div>

    <div class="p-4 pt-0">
        <div class="mb-3">
            <?php if (!empty($worker['photo'])): ?>
                <img src="<?= e($worker['photo']) ?>" alt="<?= e($worker['full_name']) ?>" class="badge-photo shadow-sm">
            <?php else: ?>
                <div class="badge-photo shadow-sm d-inline-flex align-items-center justify-content-center bg-light fw-bold fs-4 text-secondary">
                    <?= strtoupper(substr($worker['full_name'], 0, 2)) ?>
                </div>
            <?php endif; ?>
        </div>

        <h5 class="fw-bold text-dark mb-0"><?= e($worker['full_name']) ?></h5>
        <div class="text-emerald-700 font-monospace fw-bold small mt-1"><?= e($worker['worker_code']) ?></div>
        <div class="text-secondary small mt-1"><?= e($worker['profession']) ?></div>

        <hr class="my-3">

        <!-- Canvas for QR -->
        <div class="my-2 d-flex justify-content-center">
            <canvas id="qrBadgeCanvas" style="width:160px; height:160px;"></canvas>
        </div>

        <div class="font-monospace small fw-bold text-dark mt-2">
            Permit: <?= e($permit['permit_number']) ?>
        </div>
        <div class="text-muted" style="font-size:0.75rem;">
            Expires: <?= e($permit['declaration_end_date']) ?>
        </div>

        <div class="mt-3 pt-2 border-top text-muted" style="font-size:0.65rem;">
            Scan with smartphone camera to view official public verification certificate.
        </div>
    </div>
</div>

<script>
    // In production with token, URL is generated.
    // For print preview, retrieve or generate verification URL
    const verifyUrl = '<?= url("verify/" . ($qr["token_hash"] ?? "sample_verification_token")) ?>';
    QRCode.toCanvas(document.getElementById('qrBadgeCanvas'), verifyUrl, {
        width: 160,
        margin: 1,
        color: {
            dark: '#0f172a',
            light: '#ffffff'
        }
    });
</script>

</body>
</html>
