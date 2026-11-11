<?php
declare(strict_types=1);

namespace App\Helpers;

class Validator {
    private array $data;
    private array $errors = [];

    public function __construct(array $data) {
        $this->data = $data;
    }

    public function required(string $field, string $customMsg = ''): self {
        $val = trim((string)($this->data[$field] ?? ''));
        if ($val === '') {
            $this->errors[$field] = $customMsg ?: ucfirst(str_replace('_', ' ', $field)) . ' is required.';
        }
        return $this;
    }

    public function email(string $field, string $customMsg = ''): self {
        if (!empty($this->data[$field]) && !filter_var($this->data[$field], FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field] = $customMsg ?: 'Invalid email address.';
        }
        return $this;
    }

    public function date(string $field, string $customMsg = ''): self {
        if (!empty($this->data[$field])) {
            $d = \DateTime::createFromFormat('Y-m-d', $this->data[$field]);
            if (!($d && $d->format('Y-m-d') === $this->data[$field])) {
                $this->errors[$field] = $customMsg ?: 'Invalid date format (expected YYYY-MM-DD).';
            }
        }
        return $this;
    }

    public function dateAfter(string $field, string $otherField, string $customMsg = ''): self {
        if (!empty($this->data[$field]) && !empty($this->data[$otherField])) {
            if (strtotime($this->data[$field]) <= strtotime($this->data[$otherField])) {
                $this->errors[$field] = $customMsg ?: ucfirst(str_replace('_', ' ', $field)) . ' must be after ' . str_replace('_', ' ', $otherField) . '.';
            }
        }
        return $this;
    }

    public function passes(): bool {
        return empty($this->errors);
    }

    public function fails(): bool {
        return !empty($this->errors);
    }

    public function getErrors(): array {
        return $this->errors;
    }

    public function getFirstError(): ?string {
        return reset($this->errors) ?: null;
    }
}
