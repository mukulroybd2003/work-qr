<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Notice - <?= e($settings['app_name'] ?? 'Worker QR System') ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #f8fafc;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
        }
        .card {
            max-width: 520px;
            width: 100%;
            border-radius: 16px;
            border: 1px solid #fee2e2;
            box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.08);
        }
    </style>
</head>
<body>

<div class="card p-4 p-md-5 text-center bg-white">
    <div class="d-inline-flex p-3 rounded-circle mx-auto mb-3" style="background:#fee2e2; color:#dc2626;">
        <i data-lucide="shield-alert" style="width:40px; height:40px;"></i>
    </div>
    
    <h4 class="fw-bold text-dark mb-2">Verification Notice</h4>
    <p class="text-danger fw-semibold mb-3"><?= e($message) ?></p>

    <div class="p-3 bg-light rounded text-muted small text-start mb-4" style="line-height:1.5;">
        <strong>Notice to verifier:</strong> The QR credentials presented could not be validated against active records. This may indicate the permit has lapsed, the QR code has been superseded by a newly issued card, or the authorization was revoked by administration.
    </div>

    <div class="small text-muted">
        If you believe this status is in error, please contact the issuing organization compliance office at:
        <div class="fw-bold mt-1 text-dark"><?= e($settings['contact_email'] ?? 'compliance@apexworkforce.org') ?></div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
    if (window.lucide) {
        lucide.createIcons();
    }
</script>
</body>
</html>
