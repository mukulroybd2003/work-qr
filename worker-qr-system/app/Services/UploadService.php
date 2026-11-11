<?php
declare(strict_types=1);

namespace App\Services;

use Exception;

class UploadService {
    public static function handlePhotoUpload(?array $file): ?string {
        if (empty($file) || $file['error'] === UPLOAD_ERR_NO_FILE) {
            return null;
        }

        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception("File upload failed with error code: " . $file['error']);
        }

        $maxSize = (int)app_config('security.uploads.max_size_bytes', 5242880);
        if ($file['size'] > $maxSize) {
            throw new Exception("Uploaded file exceeds maximum allowed size of 5MB.");
        }

        // Validate MIME type safely
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        $allowedMimes = app_config('security.uploads.allowed_mimes', ['image/jpeg', 'image/png', 'image/webp']);
        if (!in_array($mime, $allowedMimes, true)) {
            throw new Exception("Invalid file type. Only JPG, PNG, and WebP images are permitted.");
        }

        $ext = match ($mime) {
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp',
            default      => 'jpg',
        };

        $filename = 'worker_' . bin2hex(random_bytes(16)) . '.' . $ext;
        $destinationDir = app_config('app.upload_dir');

        if (!is_dir($destinationDir)) {
            mkdir($destinationDir, 0755, true);
        }

        $targetPath = $destinationDir . '/' . $filename;
        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            throw new Exception("Failed to save uploaded photo to storage.");
        }

        return url('uploads/' . $filename);
    }
}
