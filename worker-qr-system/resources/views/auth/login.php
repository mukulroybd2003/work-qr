<?php require dirname(__DIR__) . '/layouts/header.php'; ?>

<div class="row justify-content-center align-items-center" style="min-height: 80vh;">
    <div class="col-md-5 col-lg-4">
        <div class="card p-4 shadow-sm border-0">
            <div class="text-center mb-4">
                <div class="d-inline-flex p-3 rounded-circle mb-3" style="background:#ecfdf5; color:#059669;">
                    <i data-lucide="shield-check" style="width:36px; height:36px;"></i>
                </div>
                <h4 class="fw-bold mb-1">Administrative Sign In</h4>
                <p class="text-muted small">Worker QR Verification Management System</p>
            </div>

            <?php if ($err = flash('error')): ?>
                <div class="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                    <i data-lucide="alert-circle" style="width:16px; height:16px;"></i>
                    <div><?= e($err) ?></div>
                </div>
            <?php endif; ?>

            <form action="<?= url('login') ?>" method="POST">
                <?= \App\Helpers\Security::csrfField() ?>
                
                <div class="mb-3">
                    <label class="form-label small fw-semibold text-secondary">Username or Email</label>
                    <div class="input-group">
                        <span class="input-group-text bg-white"><i data-lucide="user" style="width:16px; height:16px;"></i></span>
                        <input type="text" name="username" class="form-control" placeholder="admin" required autofocus>
                    </div>
                </div>

                <div class="mb-4">
                    <label class="form-label small fw-semibold text-secondary">Password</label>
                    <div class="input-group">
                        <span class="input-group-text bg-white"><i data-lucide="lock" style="width:16px; height:16px;"></i></span>
                        <input type="password" name="password" class="form-control" placeholder="••••••••••••" required>
                    </div>
                </div>

                <button type="submit" class="btn w-100 text-white fw-semibold py-2" style="background:#059669;">
                    Sign In to Dashboard
                </button>
            </form>

            <div class="mt-4 pt-3 border-top text-center text-muted" style="font-size:0.8rem;">
                Default Credentials: <code>admin</code> / <code>Password@123!</code>
            </div>
        </div>
    </div>
</div>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>
