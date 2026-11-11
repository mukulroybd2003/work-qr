# INSTALLATION GUIDE — WORKER QR VERIFICATION MANAGEMENT SYSTEM

A comprehensive deployment manual for Windows 10 XAMPP (Local Development) and cPanel Linux Hosting (Production).

---

## SYSTEM PREREQUISITES

| Component | Minimum Version | Recommended |
|-----------|-----------------|-------------|
| **PHP** | 8.2.0 | 8.2 or 8.3 |
| **MySQL / MariaDB** | MySQL 8.0+ / MariaDB 10.5+ | MySQL 8.0 with InnoDB |
| **PHP Extensions** | `pdo_mysql`, `gd`, `json`, `mbstring`, `fileinfo` | All enabled |
| **Apache** | 2.4+ with `mod_rewrite` enabled | Enabled |
| **Web Browser** | Chrome, Edge, Safari, Firefox | Camera access enabled for scanner |

---

## METHOD A: WINDOWS 10 + XAMPP INSTALLATION (STEP-BY-STEP)

### Step 1: Install XAMPP
1. Download **XAMPP for Windows** (with PHP 8.2+) from [Apache Friends](https://www.apachefriends.org/).
2. Run the installer and ensure **Apache** and **MySQL** are selected.
3. Finish the installation (e.g., at `C:\xampp`).

### Step 2: Enable Required PHP Extensions
1. In XAMPP Control Panel, click **Config** next to Apache -> `php.ini`.
2. Ensure the following lines are NOT commented (remove `;` at the beginning):
   ```ini
   extension=pdo_mysql
   extension=gd
   extension=fileinfo
   extension=mbstring
   ```
3. Save the file and restart Apache.

### Step 3: Copy Project Files
1. Extract or clone this project into your XAMPP `htdocs` folder:
   ```
   C:\xampp\htdocs\worker-qr-system\
   ```
2. Verify that the following files exist:
   ```
   C:\xampp\htdocs\worker-qr-system\public\index.php
   C:\xampp\htdocs\worker-qr-system\database\schema.sql
   C:\xampp\htdocs\worker-qr-system\database\seed.sql
   ```

### Step 4: Create MySQL Database in phpMyAdmin
1. Open your browser and navigate to:
   ```
   http://localhost/phpmyadmin/
   ```
2. Click **New** in the left sidebar.
3. Enter database name: `worker_qr_system`.
4. Choose collation: `utf8mb4_unicode_ci`.
5. Click **Create**.

### Step 5: Import Database Schema & Seed Data
1. With `worker_qr_system` selected in phpMyAdmin, click the **Import** tab.
2. Click **Choose File** and select `C:\xampp\htdocs\worker-qr-system\database\schema.sql`.
3. Click **Import** at the bottom.
4. Repeat the import step with `C:\xampp\htdocs\worker-qr-system\database\seed.sql` to populate initial demo workers, system settings, and default administrator.

### Step 6: Configure Environment (.env)
1. In `C:\xampp\htdocs\worker-qr-system\`, copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
2. Open `.env` in a text editor (e.g., VS Code or Notepad) and configure:
   ```ini
   APP_NAME="Worker QR Verification Management System"
   APP_ENV=local
   APP_DEBUG=true
   APP_URL=http://localhost/worker-qr-system/public

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=worker_qr_system
   DB_USERNAME=root
   DB_PASSWORD=
   ```

### Step 7: (Optional) Install Composer Dependencies
If you have Composer installed:
```bash
cd C:\xampp\htdocs\worker-qr-system
composer install
```
*Note: The project includes a standalone PSR-4 autoloader and native SVG QR generator, allowing it to run out of the box even without running `composer install`.*

### Step 8: Access the Application
Open your browser and navigate to:
```
http://localhost/worker-qr-system/public/
```

**Default Admin Credentials:**
- **URL:** `http://localhost/worker-qr-system/public/login`
- **Username:** `admin`
- **Password:** `Password@123!`

---

## METHOD B: CPANEL HOSTING DEPLOYMENT

### Step 1: Upload Files
1. Compress `worker-qr-system` into a `.zip` archive.
2. In cPanel, open **File Manager**.
3. For primary domain:
   - Place files in `/home/username/public_html` or create a subdirectory (e.g. `public_html/worker-qr-system`).
4. Extract the archive.

### Step 2: Set PHP Version to 8.2 or 8.3
1. In cPanel, navigate to **Select PHP Version** or **MultiPHP Manager**.
2. Select PHP **8.2** or **8.3**.
3. In **PHP Extensions**, ensure `pdo_mysql`, `gd`, `fileinfo`, `mbstring`, and `openssl` are checked.

### Step 3: Create MySQL Database & User
1. In cPanel, open **MySQL Database Wizard**.
2. Create database: `cpaneluser_workerqr`.
3. Create database user: `cpaneluser_qruser` with a strong password.
4. Grant **ALL PRIVILEGES** to this user for the database.

### Step 4: Import SQL Schema
1. Open **phpMyAdmin** from cPanel.
2. Select your newly created database.
3. Import `database/schema.sql`, then import `database/seed.sql`.

### Step 5: Configure `.env` for Production
Create `.env` in your project root with your production details:
```ini
APP_NAME="Worker QR Verification Management System"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com/worker-qr-system/public

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=cpaneluser_workerqr
DB_USERNAME=cpaneluser_qruser
DB_PASSWORD="YourStrongPasswordHere"

SESSION_SECURE_COOKIE=true
```

### Step 6: Verify Permissions
Set directory permissions:
- `storage/` and subfolders: `755`
- `public/uploads/`: `755`
- `public/qr-codes/`: `755`
- `.env`: `600` (readable only by your server process)

### Step 7: Change the Default Administrator Password
Log in immediately to the admin panel with `admin` / `Password@123!`, navigate to **Settings**, and change the admin password.

---

## TROUBLESHOOTING & COMMON ISSUES

1. **"View Not Found" or 404 on Subpages**:
   - Check if Apache `mod_rewrite` is enabled.
   - Verify that `public/.htaccess` exists.
   - In Apache `httpd.conf`, verify that `AllowOverride All` is set for your web root.

2. **Camera scanner does not open on localhost**:
   - Modern browsers restrict camera access to `localhost` or `https://`.
   - On production cPanel, HTTPS SSL certificate must be active for camera access.

3. **Database connection error**:
   - Verify `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_DATABASE` in `.env`.
   - Test connecting with phpMyAdmin using the same credentials.
