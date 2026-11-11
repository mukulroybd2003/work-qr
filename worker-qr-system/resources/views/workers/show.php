<?php require dirname(__DIR__) . '/layouts/header.php'; ?>

<div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
    <div class="d-flex align-items-center gap-3">
        <?php if (!empty($worker['photo'])): ?>
            <img src="<?= e($worker['photo']) ?>" alt="<?= e($worker['full_name']) ?>" class="rounded-circle border" style="width:56px; height:56px; object-fit:cover;">
        <?php else: ?>
            <div class="p-3 rounded-circle bg-emerald-100 text-emerald-800 fw-bold">
                <?= strtoupper(substr($worker['full_name'], 0, 2)) ?>
            </div>
        <?php endif; ?>
        <div>
            <h3 class="fw-bold text-dark mb-0"><?= e($worker['full_name']) ?></h3>
            <div class="small text-muted font-monospace"><?= e($worker['worker_code']) ?> &bull; <?= e($worker['profession']) ?></div>
        </div>
    </div>
    <div class="d-flex gap-2">
        <a href="<?= url("admin/workers/{$worker['id']}/edit") ?>" class="btn btn-outline-dark d-flex align-items-center gap-2">
            <i data-lucide="edit-3" style="width:16px; height:16px;"></i> Edit Dossier
        </a>
        <a href="<?= url('admin/workers') ?>" class="btn btn-outline-secondary">
            All Workers
        </a>
    </div>
</div>

<div class="row g-4 mb-4">
    <!-- Worker Details Card -->
    <div class="col-lg-8">
        <div class="card p-4 mb-4">
            <h5 class="fw-bold mb-3 border-bottom pb-2">Employee Information</h5>
            <div class="row g-3">
                <div class="col-sm-6">
                    <div class="small text-secondary fw-semibold">National ID / Residence</div>
                    <div class="fw-semibold font-monospace"><?= e($worker['id_number']) ?></div>
                </div>
                <div class="col-sm-6">
                    <div class="small text-secondary fw-semibold">Nationality</div>
                    <div class="fw-semibold"><?= e($worker['nationality']) ?></div>
                </div>
                <div class="col-sm-6">
                    <div class="small text-secondary fw-semibold">Gender</div>
                    <div class="fw-semibold"><?= e($worker['gender']) ?></div>
                </div>
                <div class="col-sm-6">
                    <div class="small text-secondary fw-semibold">Date of Birth</div>
                    <div class="fw-semibold"><?= e($worker['date_of_birth'] ?? 'Not Specified') ?></div>
                </div>
                <?php if (!empty($worker['notes'])): ?>
                    <div class="col-12">
                        <div class="small text-secondary fw-semibold">Administrative Notes</div>
                        <div class="p-2 bg-light rounded small"><?= nl2br(e($worker['notes'])) ?></div>
                    </div>
                <?php endif; ?>
            </div>
        </div>

        <!-- Permits Card -->
        <div class="card p-4 mb-4">
            <h5 class="fw-bold mb-3 border-bottom pb-2">Issued Permits & QR Verification Credentials</h5>
            <?php if (empty($permits)): ?>
                <div class="text-muted small">No permits recorded for this worker.</div>
            <?php else: ?>
                <?php foreach ($permits as $p): ?>
                    <div class="border rounded p-3 mb-3 bg-light">
                        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                            <div>
                                <span class="fw-bold"><?= e($p['permit_type']) ?></span>
                                <span class="badge bg-secondary font-monospace ms-2"><?= e($p['permit_number']) ?></span>
                            </div>
                            <div>
                                <?php if (strtotime($p['declaration_end_date']) >= strtotime('today')): ?>
                                    <span class="badge badge-active">Active</span>
                                <?php else: ?>
                                    <span class="badge badge-expired">Expired</span>
                                <?php endif; ?>
                            </div>
                        </div>
                        <div class="row g-2 small text-secondary mb-3">
                            <div class="col-sm-6">Start: <strong><?= e($p['declaration_start_date']) ?></strong></div>
                            <div class="col-sm-6">End: <strong><?= e($p['declaration_end_date']) ?></strong></div>
                        </div>

                        <!-- QR Actions for this Permit -->
                        <div class="d-flex flex-wrap align-items-center gap-2 pt-2 border-top">
                            <?php if (!empty($p['qr_id']) && !empty($p['qr_is_active'])): ?>
                                <span class="badge bg-success-subtle text-success d-flex align-items-center gap-1">
                                    <i data-lucide="check" style="width:14px; height:14px;"></i> QR Active
                                </span>
                                <a href="<?= url("admin/qr/{$p['id']}/print") ?>" class="btn btn-sm btn-outline-dark d-flex align-items-center gap-1">
                                    <i data-lucide="printer" style="width:14px; height:14px;"></i> Print Badge
                                </a>
                                <form action="<?= url("admin/qr/{$p['id']}/revoke") ?>" method="POST" class="d-inline" onsubmit="return confirm('Revoke this active QR code? Verification scans will fail until regenerated.');">
                                    <?= \App\Helpers\Security::csrfField() ?>
                                    <button type="submit" class="btn btn-sm btn-outline-danger">Revoke QR</button>
                                </form>
                                <form action="<?= url("admin/qr/{$p['id']}/generate") ?>" method="POST" class="d-inline" onsubmit="return confirm('Regenerate QR? This will revoke the existing token and issue a new one.');">
                                    <?= \App\Helpers\Security::csrfField() ?>
                                    <button type="submit" class="btn btn-sm btn-outline-primary">Regenerate Token</button>
                                </form>
                            <?php else: ?>
                                <span class="badge bg-warning-subtle text-warning">QR Inactive / Pending</span>
                                <form action="<?= url("admin/qr/{$p['id']}/generate") ?>" method="POST" class="d-inline">
                                    <?= \App\Helpers\Security::csrfField() ?>
                                    <button type="submit" class="btn btn-sm btn-success d-flex align-items-center gap-1 text-white">
                                        <i data-lucide="qr-code" style="width:14px; height:14px;"></i> Generate QR Code
                                    </button>
                                </form>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>

        <!-- Benefits Card -->
        <div class="card p-4">
            <h5 class="fw-bold mb-3 border-bottom pb-2">Benefits & Public Visibility</h5>
            <?php if (empty($benefits)): ?>
                <div class="text-muted small">No specific benefits attached to this worker.</div>
            <?php else: ?>
                <div class="row g-2">
                    <?php foreach ($benefits as $b): ?>
                        <div class="col-md-6">
                            <div class="p-2 border rounded bg-light">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <strong class="small"><?= e($b['benefit_name']) ?></strong>
                                    <?php if ($b['is_public']): ?>
                                        <span class="badge bg-success-subtle text-success" style="font-size:0.65rem;">Public</span>
                                    <?php else: ?>
                                        <span class="badge bg-secondary" style="font-size:0.65rem;">Private</span>
                                    <?php endif; ?>
                                </div>
                                <div class="text-secondary" style="font-size:0.75rem;"><?= e($b['benefit_description'] ?? $b['benefit_type']) ?></div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <!-- Right Column: Custom Field Summary -->
    <div class="col-lg-4">
        <div class="card p-4 mb-4">
            <h5 class="fw-bold mb-3 border-bottom pb-2">Custom Metrics</h5>
            <?php if (empty($customValues)): ?>
                <div class="text-muted small">No custom field values recorded.</div>
            <?php else: ?>
                <div class="d-flex flex-column gap-3">
                    <?php foreach ($customValues as $cv): ?>
                        <div>
                            <div class="small text-secondary fw-semibold">
                                <?= e($cv['field_name']) ?>
                                <?php if ($cv['is_public']): ?>
                                    <span class="badge bg-success-subtle text-success ms-1" style="font-size:0.65rem;">Public</span>
                                <?php endif; ?>
                            </div>
                            <div class="fw-semibold text-dark"><?= e($cv['field_value'] ?? '—') ?></div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>

        <div class="card p-4 bg-light border">
            <h6 class="fw-bold mb-2">QR Security Protocol</h6>
            <p class="small text-muted mb-0" style="font-size:0.8rem; line-height:1.4;">
                QR tokens are generated using 256 bits of cryptographic entropy. Only a SHA-256 hash is stored in MySQL. If a worker is soft deleted or a permit expires, public verification will automatically reject authorization requests.
            </p>
        </div>
    </div>
</div>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>
