<?php
declare(strict_types=1);

namespace App\Models;

use PDO;

class Setting {
    private PDO $db;
    private static array $cache = [];

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function getAll(): array {
        if (empty(self::$cache)) {
            $stmt = $this->db->query("SELECT setting_key, setting_value FROM system_settings");
            $rows = $stmt->fetchAll();
            foreach ($rows as $row) {
                self::$cache[$row['setting_key']] = $row['setting_value'];
            }
        }
        return self::$cache;
    }

    public function get(string $key, ?string $default = null): ?string {
        $settings = $this->getAll();
        return $settings[$key] ?? $default;
    }

    public function set(string $key, ?string $value): void {
        $stmt = $this->db->prepare("
            INSERT INTO system_settings (setting_key, setting_value, updated_at)
            VALUES (:key, :val, NOW())
            ON DUPLICATE KEY UPDATE setting_value = :val2, updated_at = NOW()
        ");
        $stmt->execute([
            ':key'  => $key,
            ':val'  => $value,
            ':val2' => $value,
        ]);
        self::$cache[$key] = $value;
    }

    public function setMany(array $settings): void {
        foreach ($settings as $key => $val) {
            $this->set($key, (string)$val);
        }
    }
}
