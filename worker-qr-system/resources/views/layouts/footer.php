<?php if (!empty($_SESSION['admin_logged_in'])): ?>
    </div> <!-- /main-content -->
<?php else: ?>
    </div> <!-- /container -->
<?php endif; ?>

<!-- Bootstrap 5 Bundle JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
    // Initialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }
</script>
</body>
</html>
