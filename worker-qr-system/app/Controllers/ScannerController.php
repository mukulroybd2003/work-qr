<?php
declare(strict_types=1);

namespace App\Controllers;

class ScannerController {
    public function index(): void {
        view('scanner.index', [
            'pageTitle' => 'QR Code Scanner & Verification'
        ]);
    }

    public function validateRedirect(): void {
        $scannedUrl = trim((string)($_POST['scanned_url'] ?? ''));
        $appUrl = rtrim(app_config('app.url'), '/');

        // Verify that the scanned URL starts with APP_URL/verify/
        $prefix = $appUrl . '/verify/';
        if (str_starts_with($scannedUrl, $prefix)) {
            $token = substr($scannedUrl, strlen($prefix));
            json_response([
                'success'      => true,
                'redirect_url' => url("verify/{$token}")
            ]);
        }

        // Also accept relative /verify/{token}
        if (preg_match('#^/verify/([a-f0-9]{64})$#i', $scannedUrl, $matches)) {
            json_response([
                'success'      => true,
                'redirect_url' => url("verify/{$matches[1]}")
            ]);
        }

        json_response([
            'success' => false,
            'error'   => 'The scanned QR code is not a valid verification link for this application. External redirects are blocked for safety.'
        ], 400);
    }
}
