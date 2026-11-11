<?php require dirname(__DIR__) . '/layouts/header.php'; ?>

<div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
    <div>
        <h3 class="fw-bold text-dark mb-1">Worker Management</h3>
        <p class="text-muted small mb-0">Total <?= number_format($totalRecords) ?> registered workers in database.</p>
    </div>
    <div class="d-flex gap-2">
        <a href="<?= url('admin/workers/export/csv') ?>" class="btn btn-outline-secondary d-flex align-items-center gap-2">
            <i data-lucide="download" style="width:16px; height:16px;"></i> Export CSV
        </a>
        <a href="<?= url('admin/workers/create') ?>" class="btn text-white fw-semibold d-flex align-items-center gap-2" style="background:#059669;">
            <i data-lucide="user-plus" style="width:16px; height:16px;"></i> Add Worker
        </a>
    </div>
</div>

<!-- Search & Filters Bar -->
<div class="card p-3 mb-4">
    <form action="<?= url('admin/workers') ?>" method="GET" class="row g-2 align-items-end">
        <div class="col-md-4">
            <label class="form-label small fw-semibold text-secondary mb-1">Search Keywords</label>
            <div class="input-group">
                <span class="input-group-text bg-white"><i data-lucide="search" style="width:15px; height:15px;"></i></span>
                <input type="text" name="search" class="form-control form-control-sm" placeholder="Name, Code, ID, or Permit #..." value="<?= e($filters['search']) ?>">
            </div>
        </div>
        <div class="col-md-2">
            <label class="form-label small fw-semibold text-secondary mb-1">Nationality</label>
            <input type="text" name="nationality" class="form-control form-control-sm" placeholder="Filter country..." value="<?= e($filters['nationality']) ?>">
        </div>
        <div class="col-md-2">
            <label class="form-label small fw-semibold text-secondary mb-1">Profession</label>
            <input type="text" name="profession" class="form-control form-control-sm" placeholder="Filter role..." value="<?= e($filters['profession']) ?>">
        </div>
        <div class="col-md-2">
            <label class="form-label small fw-semibold text-secondary mb-1">Permit Status</label>
            <select name="permit_status" class="form-select form-select-sm">
                <option value="">All Permits</option>
                <option value="active" <?= $filters['permit_status'] === 'active' ? 'selected' : '' ?>>Active Only</option>
                <option value="expired" <?= $filters['permit_status'] === 'expired' ? 'selected' : '' ?>>Expired Only</option>
            </select>
        </div>
        <div class="col-md-2 d-flex gap-2">
            <button type="submit" class="btn btn-sm btn-dark w-100 fw-semibold">Filter</button>
            <a href="<?= url('admin/workers') ?>" class="btn btn-sm btn-outline-secondary">Reset</a>
        </div>
    </form>
</div>

<!-- Workers Table -->
<div class="card">
    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
            <thead class="table-light small text-secondary">
                <tr>
                    <th>Worker Code</th>
                    <th>Worker Name</th>
                    <th>ID / Residence</th>
                    <th>Profession</th>
                    <th>Nationality</th>
                    <th>Permit #</th>
                    <th>Expiry Date</th>
                    <th>Worker Status</th>
                    <th>QR Status</th>
                    <th class="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($workers)): ?>
                    <tr>
                        <td colspan="10" class="text-center py-5 text-muted">
                            <i data-lucide="user-x" style="width:36px; height:36px;" class="mb-2 text-secondary"></i>
                            <div>No matching worker records found.</div>
                        </td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($workers as $w): ?>
                        <tr>
                            <td class="font-monospace fw-bold text-emerald-700 small">
                                <a href="<?= url("admin/workers/{$w['id']}") ?>" class="text-decoration-none text-emerald-700">
                                    <?= e($w['worker_code']) ?>
                                </a>
                            </td>
                            <td>
                                <div class="fw-semibold text-dark"><?= e($w['full_name']) ?></div>
                                <div class="text-muted" style="font-size:0.75rem;"><?= e($w['gender']) ?></div>
                            </td>
                            <td class="font-monospace small text-secondary"><?= e($w['id_number']) ?></td>
                            <td class="small"><?= e($w['profession']) ?></td>
                            <td class="small"><?= e($w['nationality']) ?></td>
                            <td class="font-monospace small text-secondary"><?= e($w['permit_number'] ?? 'None') ?></td>
                            <td>
                                <?php if (!empty($w['declaration_end_date'])): ?>
                                    <?php $isExp = strtotime($w['declaration_end_date']) < strtotime('today'); ?>
                                    <span class="small <?= $isExp ? 'text-danger fw-bold' : 'text-dark' ?>">
                                        <?= e($w['declaration_end_date']) ?>
                                    </span>
                                <?php else: ?>
                                    <span class="text-muted small">N/A</span>
                                <?php endif; ?>
                            </td>
                            <td>
                                <?php if (!empty($w['is_active'])): ?>
                                    <span class="badge badge-active">Active</span>
                                <?php else: ?>
                                    <span class="badge bg-secondary">Inactive</span>
                                <?php endif; ?>
                            </td>
                            <td>
                                <?php if (!empty($w['qr_id']) && !empty($w['qr_is_active'])): ?>
                                    <span class="badge bg-success-subtle text-success">Generated</span>
                                <?php else: ?>
                                    <span class="badge bg-warning-subtle text-warning">Pending</span>
                                <?php endif; ?>
                            </td>
                            <td class="text-end">
                                <div class="btn-group btn-group-sm">
                                    <a href="<?= url("admin/workers/{$w['id']}") ?>" class="btn btn-light border" title="View Dossier">
                                        <i data-lucide="eye" style="width:14px; height:14px;"></i>
                                    </a>
                                    <a href="<?= url("admin/workers/{$w['id']}/edit") ?>" class="btn btn-light border" title="Edit Worker">
                                        <i data-lucide="edit-3" style="width:14px; height:14px;"></i>
                                    </a>
                                    <?php if (!empty($w['primary_permit_id'])): ?>
                                        <a href="<?= url("admin/qr/{$w['primary_permit_id']}/print") ?>" class="btn btn-light border" title="Print QR Badge">
                                            <i data-lucide="printer" style="width:14px; height:14px;"></i>
                                        </a>
                                    <?php endif; ?>
                                    <form action="<?= url("admin/workers/{$w['id']}/delete") ?>" method="POST" class="d-inline" onsubmit="return confirm('Are you sure you want to soft delete worker <?= e(addslashes($w['full_name'])) ?>?');">
                                        <?= \App\Helpers\Security::csrfField() ?>
                                        <button type="submit" class="btn btn-light border text-danger" title="Soft Delete">
                                            <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    <?php if ($totalPages > 1): ?>
        <div class="card-footer bg-white d-flex justify-content-between align-items-center py-3">
            <div class="small text-muted">Page <?= $page ?> of <?= $totalPages ?></div>
            <ul class="pagination pagination-sm mb-0">
                <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                    <li class="page-item <?= $i === $page ? 'active' : '' ?>">
                        <a class="page-link" href="<?= url("admin/workers?page={$i}&search=" . urlencode($filters['search'])) ?>"><?= $i ?></a>
                    </li>
                <?php endfor; ?>
            </ul>
        </div>
    <?php endif; ?>
</div>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>
