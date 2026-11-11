<?php require dirname(__DIR__) . '/layouts/header.php'; ?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h3 class="fw-bold text-dark mb-1">Executive Dashboard</h3>
        <p class="text-muted small mb-0">Workforce credential authorization, QR distribution, and validity metrics.</p>
    </div>
    <div class="d-flex gap-2">
        <a href="<?= url('admin/workers/create') ?>" class="btn text-white fw-semibold d-flex align-items-center gap-2" style="background:#059669;">
            <i data-lucide="user-plus" style="width:16px; height:16px;"></i> Register Worker
        </a>
        <a href="<?= url('admin/scanner') ?>" class="btn btn-outline-dark d-flex align-items-center gap-2">
            <i data-lucide="scan" style="width:16px; height:16px;"></i> Open Scanner
        </a>
    </div>
</div>

<!-- Statistics Cards -->
<div class="row g-3 mb-4">
    <div class="col-sm-6 col-xl-3">
        <div class="card p-3">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <div class="text-secondary small fw-medium">Total Workers</div>
                    <div class="fs-3 fw-bold text-dark mt-1"><?= number_format($totalWorkers) ?></div>
                </div>
                <div class="p-2 rounded" style="background:#ecfdf5; color:#059669;">
                    <i data-lucide="users" style="width:22px; height:22px;"></i>
                </div>
            </div>
            <div class="small text-muted mt-2">
                <span class="text-success fw-semibold"><?= $activeWorkers ?> Active</span> &bull; <span><?= $inactiveWorkers ?> Inactive</span>
            </div>
        </div>
    </div>

    <div class="col-sm-6 col-xl-3">
        <div class="card p-3">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <div class="text-secondary small fw-medium">Active Permits</div>
                    <div class="fs-3 fw-bold text-success mt-1"><?= number_format($activePermits) ?></div>
                </div>
                <div class="p-2 rounded" style="background:#f0fdf4; color:#16a34a;">
                    <i data-lucide="file-check" style="width:22px; height:22px;"></i>
                </div>
            </div>
            <div class="small text-muted mt-2">
                Out of <?= number_format($totalPermits) ?> total issued declarations
            </div>
        </div>
    </div>

    <div class="col-sm-6 col-xl-3">
        <div class="card p-3">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <div class="text-secondary small fw-medium">Expired Permits</div>
                    <div class="fs-3 fw-bold text-danger mt-1"><?= number_format($expiredPermits) ?></div>
                </div>
                <div class="p-2 rounded" style="background:#fef2f2; color:#dc2626;">
                    <i data-lucide="file-x" style="width:22px; height:22px;"></i>
                </div>
            </div>
            <div class="small text-muted mt-2">
                Requires renewal or extension
            </div>
        </div>
    </div>

    <div class="col-sm-6 col-xl-3">
        <div class="card p-3">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <div class="text-secondary small fw-medium">Active QR Codes</div>
                    <div class="fs-3 fw-bold text-dark mt-1"><?= number_format($generatedQRs) ?></div>
                </div>
                <div class="p-2 rounded" style="background:#eff6ff; color:#2563eb;">
                    <i data-lucide="qr-code" style="width:22px; height:22px;"></i>
                </div>
            </div>
            <div class="small text-muted mt-2">
                Tamper-resistant cryptographic tokens
            </div>
        </div>
    </div>
</div>

<div class="row g-4">
    <!-- Expiring Permits Warning -->
    <div class="col-lg-6">
        <div class="card h-100">
            <div class="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                <div class="fw-bold d-flex align-items-center gap-2 text-danger">
                    <i data-lucide="alert-circle" style="width:18px; height:18px;"></i> Permits Expiring Within 30 Days
                </div>
                <span class="badge bg-danger-subtle text-danger"><?= count($expiringPermits) ?> pending</span>
            </div>
            <div class="card-body p-0">
                <?php if (empty($expiringPermits)): ?>
                    <div class="p-4 text-center text-muted small">No permits expiring in the next 30 days.</div>
                <?php else: ?>
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light small text-secondary">
                                <tr>
                                    <th>Worker</th>
                                    <th>Permit #</th>
                                    <th>Expires</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($expiringPermits as $ep): ?>
                                    <tr>
                                        <td>
                                            <div class="fw-semibold small"><?= e($ep['full_name']) ?></div>
                                            <div class="text-muted font-monospace" style="font-size:0.75rem;"><?= e($ep['worker_code']) ?></div>
                                        </td>
                                        <td class="font-monospace small"><?= e($ep['permit_number']) ?></td>
                                        <td class="text-danger small fw-semibold"><?= e($ep['declaration_end_date']) ?></td>
                                        <td>
                                            <a href="<?= url("admin/workers/{$ep['worker_id']}") ?>" class="btn btn-sm btn-light border py-1 px-2 small">
                                                View
                                            </a>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <!-- Recently Registered Workers -->
    <div class="col-lg-6">
        <div class="card h-100">
            <div class="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                <div class="fw-bold d-flex align-items-center gap-2">
                    <i data-lucide="user-check" style="width:18px; height:18px; color:#059669;"></i> Recently Enrolled Workers
                </div>
                <a href="<?= url('admin/workers') ?>" class="small text-decoration-none text-emerald-600">View All</a>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light small text-secondary">
                            <tr>
                                <th>Worker</th>
                                <th>Profession</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($recentWorkers as $rw): ?>
                                <tr>
                                    <td>
                                        <div class="fw-semibold small"><?= e($rw['full_name']) ?></div>
                                        <div class="text-muted font-monospace" style="font-size:0.75rem;"><?= e($rw['worker_code']) ?></div>
                                    </td>
                                    <td class="small text-secondary"><?= e($rw['profession']) ?></td>
                                    <td>
                                        <span class="badge badge-active">Active</span>
                                    </td>
                                    <td>
                                        <a href="<?= url("admin/workers/{$rw['id']}") ?>" class="btn btn-sm btn-light border py-1 px-2 small">
                                            Dossier
                                        </a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>
