<?php
declare(strict_types=1);

namespace App\Models;

use PDO;
use PDOException;
use Exception;

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $config = app_config('database');
            $dsn = "mysql:host={$config['host']};port={$config['port']};dbname={$config['database']};charset={$config['charset']}";

            try {
                self::$instance = new PDO($dsn, $config['username'], $config['password'], $config['options']);
            } catch (PDOException $e) {
                // Never expose database credentials or details in production
                error_log("Database connection failed: " . $e->getMessage());
                if (app_config('app.debug', false)) {
                    throw $e;
                }
                throw new Exception("Database connection could not be established. Please check configuration.");
            }
        }
        return self::$instance;
    }
}
