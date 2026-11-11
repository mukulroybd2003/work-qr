<?php require dirname(__DIR__) . '/layouts/header.php'; ?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h3 class="fw-bold text-dark mb-1">QR Verification Scanner</h3>
        <p class="text-muted small mb-0">Validate official worker credentials using live device camera or uploaded QR badge images.</p>
    </div>
</div>

<div class="row g-4">
    <!-- Scanner Viewport (Camera & Upload) -->
    <div class="col-lg-7">
        <div class="card p-4">
            <!-- Tabs -->
            <ul class="nav nav-pills mb-4" id="scannerTab" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active d-flex align-items-center gap-2" id="camera-tab" data-bs-toggle="pill" data-bs-target="#camera-pane" type="button" role="tab">
                        <i data-lucide="camera" style="width:16px; height:16px;"></i> Live Camera Scan
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link d-flex align-items-center gap-2" id="upload-tab" data-bs-toggle="pill" data-bs-target="#upload-pane" type="button" role="tab">
                        <i data-lucide="image" style="width:16px; height:16px;"></i> QR Image Upload
                    </button>
                </li>
            </ul>

            <div class="tab-content" id="scannerTabContent">
                <!-- CAMERA SCAN TAB -->
                <div class="tab-pane fade show active" id="camera-pane" role="tabpanel">
                    <div class="position-relative bg-dark rounded overflow-hidden mb-3" style="min-height: 340px; display:flex; align-items:center; justify-content:center;">
                        <video id="cameraVideo" style="width:100%; max-height:380px; object-fit:cover; display:none;" playsinline></video>
                        <canvas id="qrCanvas" style="display:none;"></canvas>

                        <!-- Idle Placeholder -->
                        <div id="cameraPlaceholder" class="text-center text-white p-4">
                            <div class="p-3 bg-secondary rounded-circle d-inline-flex mb-3">
                                <i data-lucide="camera-off" style="width:32px; height:32px;"></i>
                            </div>
                            <h6 class="fw-bold mb-1">Camera Inactive</h6>
                            <p class="text-secondary small mb-3">Click 'Start Camera Scan' below to request video permission.</p>
                        </div>

                        <!-- Scanning Reticle Overlay -->
                        <div id="scanReticle" class="position-absolute" style="display:none; width:220px; height:220px; border:2px solid #10b981; border-radius:12px; box-shadow:0 0 0 9999px rgba(0,0,0,0.5);">
                            <div class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-emerald-400 small fw-bold">
                                Align QR Code Here
                            </div>
                        </div>
                    </div>

                    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
                        <div class="d-flex gap-2">
                            <button type="button" class="btn text-white fw-semibold d-flex align-items-center gap-2" id="startCameraBtn" style="background:#059669;">
                                <i data-lucide="play" style="width:16px; height:16px;"></i> Start Camera Scan
                            </button>
                            <button type="button" class="btn btn-outline-danger d-flex align-items-center gap-2" id="stopCameraBtn" style="display:none;">
                                <i data-lucide="square" style="width:16px; height:16px;"></i> Stop Camera
                            </button>
                        </div>
                        <div id="cameraStatus" class="small text-muted">Ready</div>
                    </div>
                </div>

                <!-- IMAGE UPLOAD TAB -->
                <div class="tab-pane fade" id="upload-pane" role="tabpanel">
                    <div class="border-2 border-dashed rounded p-5 text-center mb-3 bg-light" id="dropArea" style="cursor:pointer;">
                        <input type="file" id="qrImageInput" accept="image/png,image/jpeg,image/webp" style="display:none;">
                        <div class="p-3 bg-emerald-50 text-emerald-600 rounded-circle d-inline-flex mb-3">
                            <i data-lucide="upload-cloud" style="width:36px; height:36px;"></i>
                        </div>
                        <h6 class="fw-bold mb-1">Upload Worker QR Badge</h6>
                        <p class="text-secondary small mb-0">Drag and drop a PNG, JPG, or WebP screenshot or click to browse.</p>
                    </div>

                    <div id="uploadPreviewBox" style="display:none;" class="text-center p-3 border rounded bg-white">
                        <img id="uploadPreviewImg" style="max-height:200px; max-width:100%; border-radius:8px;" alt="QR Preview">
                        <div class="mt-2 text-muted small" id="uploadStatus">Analyzing QR image...</div>
                    </div>
                </div>
            </div>

            <!-- Scan Result Banner -->
            <div id="scanResultBox" class="mt-4 p-3 rounded" style="display:none;"></div>
        </div>
    </div>

    <!-- Security Instructions & Verification Guidelines -->
    <div class="col-lg-5">
        <div class="card p-4 mb-4">
            <h5 class="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
                <i data-lucide="shield-check" style="width:20px; height:20px; color:#059669;"></i> Verification Protocols
            </h5>
            <ol class="small text-secondary ps-3 mb-0" style="line-height:1.7;">
                <li>Ensure the physical QR badge is well lit and squarely in view.</li>
                <li>Camera scanning uses high-speed edge detection; ensure camera lens is clean.</li>
                <li>When a valid QR code is recognized, the system strictly validates that the URL belongs to this domain (<code><?= e(url('verify/')) ?></code>).</li>
                <li>External URLs or malicious links are automatically quarantined and blocked.</li>
                <li>Upon successful hash match, you will be redirected to the official read-only verification certificate.</li>
            </ol>
        </div>

        <div class="card p-4 bg-light border">
            <h6 class="fw-bold mb-2">Camera Permissions Troubleshooting</h6>
            <p class="small text-muted mb-0" style="line-height:1.5;">
                If your browser blocks camera access, click the lock/tune icon next to the URL bar in Chrome/Safari/Edge, select <strong>Site Settings</strong>, and allow <strong>Camera</strong>. Note: Browser security policies require localhost or an active HTTPS connection.
            </p>
        </div>
    </div>
</div>

<!-- Include jsQR for client-side decoding -->
<script src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js"></script>

<script>
    const appUrl = '<?= rtrim(url(), '/') ?>';
    let videoStream = null;
    let isScanning = false;

    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('qrCanvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('startCameraBtn');
    const stopBtn = document.getElementById('stopCameraBtn');
    const placeholder = document.getElementById('cameraPlaceholder');
    const reticle = document.getElementById('scanReticle');
    const statusText = document.getElementById('cameraStatus');
    const resultBox = document.getElementById('scanResultBox');

    // Camera scanner
    startBtn.addEventListener('click', async () => {
        try {
            statusText.innerText = 'Requesting camera access...';
            videoStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            video.srcObject = videoStream;
            video.setAttribute('playsinline', true);
            await video.play();

            video.style.display = 'block';
            placeholder.style.display = 'none';
            reticle.style.display = 'block';
            startBtn.style.display = 'none';
            stopBtn.style.display = 'inline-flex';
            statusText.innerText = 'Scanning for QR code...';
            isScanning = true;
            requestAnimationFrame(scanVideoFrame);
        } catch (err) {
            statusText.innerText = 'Camera access denied or unavailable.';
            alert('Could not access camera: ' + err.message + '\nPlease ensure camera permission is enabled and page is accessed via localhost or HTTPS.');
        }
    });

    stopBtn.addEventListener('click', stopCamera);

    function stopCamera() {
        isScanning = false;
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
        }
        video.style.display = 'none';
        placeholder.style.display = 'block';
        reticle.style.display = 'none';
        startBtn.style.display = 'inline-flex';
        stopBtn.style.display = 'none';
        statusText.innerText = 'Stopped.';
    }

    function scanVideoFrame() {
        if (!isScanning) return;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
            });

            if (code && code.data) {
                stopCamera();
                handleScannedData(code.data);
                return;
            }
        }
        requestAnimationFrame(scanVideoFrame);
    }

    // Image Upload Scanner
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('qrImageInput');
    const previewBox = document.getElementById('uploadPreviewBox');
    const previewImg = document.getElementById('uploadPreviewImg');
    const uploadStatus = document.getElementById('uploadStatus');

    dropArea.addEventListener('click', () => fileInput.click());
    dropArea.addEventListener('dragover', (e) => { e.preventDefault(); dropArea.classList.add('border-primary'); });
    dropArea.addEventListener('dragleave', () => dropArea.classList.remove('border-primary'));
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('border-primary');
        if (e.dataTransfer.files.length) {
            handleUploadedFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleUploadedFile(fileInput.files[0]);
        }
    });

    function handleUploadedFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file (PNG, JPG, WebP).');
            return;
        }
        previewBox.style.display = 'block';
        uploadStatus.innerText = 'Reading image...';

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code && code.data) {
                    uploadStatus.innerHTML = '<span class="text-success fw-bold">QR Code Detected!</span>';
                    handleScannedData(code.data);
                } else {
                    uploadStatus.innerHTML = '<span class="text-danger fw-bold">No valid QR code could be found in this image.</span>';
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function handleScannedData(scannedUrl) {
        resultBox.style.display = 'block';
        resultBox.className = 'mt-4 p-3 rounded bg-light border';
        resultBox.innerHTML = `
            <div class="fw-bold mb-1">Scanned Payload:</div>
            <div class="font-monospace text-truncate small mb-2">${scannedUrl}</div>
            <div class="text-muted small">Validating route authority...</div>
        `;

        // Validate that the URL strictly matches this application
        const verifyPrefix = appUrl + '/verify/';
        if (scannedUrl.startsWith(verifyPrefix)) {
            const token = scannedUrl.substring(verifyPrefix.length);
            resultBox.className = 'mt-4 p-3 rounded alert alert-success';
            resultBox.innerHTML = `
                <div class="fw-bold"><i data-lucide="check-circle" style="width:16px; height:16px;"></i> Valid Verification Token Detected</div>
                <div class="small mt-1">Redirecting to public certificate...</div>
            `;
            if (window.lucide) lucide.createIcons();
            setTimeout(() => {
                window.location.href = scannedUrl;
            }, 900);
            return;
        }

        // Relative check /verify/{token}
        if (scannedUrl.startsWith('/verify/')) {
            window.location.href = appUrl + scannedUrl;
            return;
        }

        resultBox.className = 'mt-4 p-3 rounded alert alert-danger';
        resultBox.innerHTML = `
            <div class="fw-bold"><i data-lucide="shield-alert" style="width:16px; height:16px;"></i> Blocked Untrusted URL</div>
            <div class="small mt-1">This QR code does not belong to the official verification service. External redirects are restricted.</div>
        `;
        if (window.lucide) lucide.createIcons();
    }
</script>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>
