<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($settings['public_page_title'] ?? 'Worker Information Verification') ?> - <?= e($record['full_name']) ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #f1f5f9;
            color: #0f172a;
            padding: 2rem 1rem;
        }
        .cert-card {
            max-width: 780px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
            overflow: hidden;
        }
        .cert-header {
            background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
            color: #ffffff;
            padding: 2.25rem 2.5rem;
        }
        .section-title {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #047857;
            font-weight: 700;
            border-bottom: 2px solid #ecfdf5;
            padding-bottom: 0.5rem;
            margin-bottom: 1.25rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .field-label {
            font-size: 0.8rem;
            color: #64748b;
            font-weight: 500;
            margin-bottom: 0.2rem;
        }
        .field-value {
            font-size: 0.95rem;
            color: #0f172a;
            font-weight: 600;
        }
        .worker-photo {
            width: 130px;
            height: 130px;
            object-fit: cover;
            border-radius: 12px;
            border: 3px solid #ffffff;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        .watermark-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.4rem 1rem;
            border-radius: 9999px;
            font-size: 0.85rem;
            font-weight: 700;
            letter-spacing: 0.02em;
        }
        .badge-valid { background-color: #dcfce7; color: #166534; border: 1px solid #86efac; }
        .badge-invalid { background-color: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
        @media print {
            body { background: #ffffff; padding: 0; }
            .cert-card { border: none; box-shadow: none; max-width: 100%; }
            .no-print { display: none !important; }
        }
    </style>
</head>
<body>

<div class="cert-card">
    <!-- Certificate Header -->
    <div class="cert-header">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
                <div class="text-emerald-200 small text-uppercase fw-semibold" style="letter-spacing: 0.05em;">
                    <?= e($settings['organization_name'] ?? 'Apex Global Workforce Services') ?>
                </div>
                <h3 class="fw-bold mb-0 text-white mt-1">WORKER INFORMATION RECORD</h3>
                <div class="small opacity-75 mt-1 font-monospace">Verification Token: <?= e($tokenSnippet) ?></div>
            </div>
            <div>
                <?php if ($permitStatus === 'active'): ?>
                    <span class="watermark-badge badge-valid">
                        <i data-lucide="shield-check" style="width:18px; height:18px;"></i> VERIFIED & ACTIVE
                    </span>
                <?php else: ?>
                    <span class="watermark-badge badge-invalid">
                        <i data-lucide="alert-octagon" style="width:18px; height:18px;"></i> PERMIT EXPIRED
                    </span>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <!-- Certificate Body -->
    <div class="p-4 p-md-5">

        <!-- SECTION 1: PERMIT DATA -->
        <div class="mb-4">
            <div class="section-title">
                <i data-lucide="file-check" style="width:18px; height:18px;"></i> SECTION 1: PERMIT & AUTHORIZATION DATA
            </div>
            <div class="row g-3">
                <div class="col-sm-6 col-md-3">
                    <div class="field-label">Permit Type</div>
                    <div class="field-value"><?= e($record['permit_type']) ?></div>
                </div>
                <div class="col-sm-6 col-md-3">
                    <div class="field-label">Permit Number</div>
                    <div class="field-value font-monospace"><?= e($record['permit_number']) ?></div>
                </div>
                <div class="col-sm-6 col-md-3">
                    <div class="field-label">Declaration Start Date</div>
                    <div class="field-value"><?= e($record['declaration_start_date']) ?></div>
                </div>
                <div class="col-sm-6 col-md-3">
                    <div class="field-label">Declaration End Date</div>
                    <div class="field-value <?= $isPermitExpired ? 'text-danger' : 'text-success' ?>">
                        <?= e($record['declaration_end_date']) ?>
                    </div>
                </div>
            </div>
        </div>

        <!-- SECTION 2: EMPLOYEE DATA -->
        <div class="mb-4">
            <div class="section-title">
                <i data-lucide="user-check" style="width:18px; height:18px;"></i> SECTION 2: EMPLOYEE IDENTITY DATA
            </div>
            <div class="row g-4 align-items-start">
                <?php if (!empty($settings['public_show_photo']) && !empty($record['photo'])): ?>
                    <div class="col-auto">
                        <img src="<?= e($record['photo']) ?>" alt="<?= e($record['full_name']) ?>" class="worker-photo">
                    </div>
                <?php endif; ?>
                <div class="col">
                    <div class="row g-3">
                        <div class="col-sm-6">
                            <div class="field-label">Full Name</div>
                            <div class="field-value fs-5"><?= e($record['full_name']) ?></div>
                        </div>
                        <div class="col-sm-6">
                            <div class="field-label">Worker System Code</div>
                            <div class="field-value font-monospace text-emerald-700 fw-bold"><?= e($record['worker_code']) ?></div>
                        </div>
                        <div class="col-sm-6">
                            <div class="field-label">Profession / Role</div>
                            <div class="field-value"><?= e($record['profession']) ?></div>
                        </div>
                        <div class="col-sm-6">
                            <div class="field-label">Nationality</div>
                            <div class="field-value"><?= e($record['nationality']) ?></div>
                        </div>
                        <?php if (!empty($settings['public_show_id_number'])): ?>
                            <div class="col-sm-6">
                                <div class="field-label">National / Residence ID</div>
                                <div class="field-value font-monospace"><?= e($record['id_number']) ?></div>
                            </div>
                        <?php endif; ?>
                        <?php if (!empty($settings['public_show_gender'])): ?>
                            <div class="col-sm-6">
                                <div class="field-label">Gender</div>
                                <div class="field-value"><?= e($record['gender']) ?></div>
                            </div>
                        <?php endif; ?>
                        <?php if (!empty($settings['public_show_dob']) && !empty($record['date_of_birth'])): ?>
                            <div class="col-sm-6">
                                <div class="field-label">Date of Birth</div>
                                <div class="field-value"><?= e($record['date_of_birth']) ?></div>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>

        <!-- SECTION 3: BENEFITS DATA (PUBLIC ONLY) -->
        <?php if (!empty($publicBenefits)): ?>
            <div class="mb-4">
                <div class="section-title">
                    <i data-lucide="heart-pulse" style="width:18px; height:18px;"></i> SECTION 3: APPROVED PUBLIC BENEFITS & COVERAGE
                </div>
                <div class="row g-3">
                    <?php foreach ($publicBenefits as $b): ?>
                        <div class="col-md-6">
                            <div class="p-3 bg-light rounded border border-slate-200">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <span class="fw-bold small"><?= e($b['benefit_name']) ?></span>
                                    <span class="badge bg-secondary" style="font-size:0.7rem;"><?= e($b['benefit_type']) ?></span>
                                </div>
                                <?php if (!empty($b['benefit_description'])): ?>
                                    <div class="small text-muted"><?= e($b['benefit_description']) ?></div>
                                <?php endif; ?>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endif; ?>

        <!-- SECTION 4: CUSTOM DATA (PUBLIC ONLY) -->
        <?php if (!empty($publicCustomFields)): ?>
            <div class="mb-4">
                <div class="section-title">
                    <i data-lucide="clipboard-list" style="width:18px; height:18px;"></i> SECTION 4: OPERATIONAL METRICS & CERTIFICATIONS
                </div>
                <div class="row g-3">
                    <?php foreach ($publicCustomFields as $cf): ?>
                        <?php if (!empty($cf['field_value'])): ?>
                            <div class="col-sm-6 col-md-4">
                                <div class="field-label"><?= e($cf['field_name']) ?></div>
                                <div class="field-value"><?= e($cf['field_value']) ?></div>
                            </div>
                        <?php endif; ?>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endif; ?>

        <!-- Legal Disclaimer & Print Button -->
        <div class="mt-4 pt-3 border-top">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div class="small text-muted" style="max-width: 480px; font-size: 0.75rem; line-height: 1.4;">
                    <strong>Independent Information Verification System:</strong> This record confirms that the worker credentials and permit declaration match registered organization database records. This document is an informational verification certificate and does not represent an official government identity document.
                </div>
                <div class="no-print">
                    <button onclick="window.print()" class="btn btn-outline-secondary d-flex align-items-center gap-2">
                        <i data-lucide="printer" style="width:16px; height:16px;"></i> Print Document
                    </button>
                </div>
            </div>
        </div>

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
