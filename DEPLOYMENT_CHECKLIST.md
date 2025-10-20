# 🚀 Deployment Checklist - BookBharat Platform

## ✅ **Pre-Deployment Verification**

### **All Builds Successful:**
- ✅ Frontend (Next.js) - Compiled successfully
- ✅ Backend (Laravel) - All routes registered
- ✅ Admin Panel (React) - Build complete

### **Database:**
- ✅ All migrations created
- ✅ Seeders ready
- ✅ Notification settings table created

### **Code Quality:**
- ✅ No syntax errors
- ✅ No linting errors (only minor warnings)
- ✅ TypeScript type safety maintained
- ✅ All API endpoints working

---

## 📋 **Deployment Steps**

### **1. Backend Deployment**

```bash
# Navigate to backend directory
cd bookbharat-backend

# Update dependencies
composer install --optimize-autoloader --no-dev

# Run migrations
php artisan migrate --force

# Seed notification settings
php artisan db:seed --class=NotificationSettingsSeeder

# Clear and optimize caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Set permissions
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### **2. Frontend Deployment**

```bash
# Navigate to frontend directory
cd bookbharat-frontend

# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
# OR deploy .next folder to hosting service
```

### **3. Admin Panel Deployment**

```bash
# Navigate to admin directory
cd bookbharat-admin

# Install dependencies
npm install

# Build for production
npm run build

# Deploy build folder to web server
# Point web server to build/index.html
```

---

## ⚙️ **Configuration**

### **1. Environment Variables**

#### **Backend (.env):**
```env
# Application
APP_NAME=BookBharat
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bookbharat
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

# Email (Can be configured via admin panel)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@bookbharat.com
MAIL_FROM_NAME="${APP_NAME}"

# SMS (Configure via admin panel - these are fallbacks)
SMS_ENABLED=false
SMS_API_ENDPOINT=
SMS_API_KEY=
SMS_SENDER_ID=BKBHRT

# WhatsApp (Configure via admin panel - these are fallbacks)
WHATSAPP_ENABLED=false
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=

# Queue
QUEUE_CONNECTION=database

# Session
SESSION_DRIVER=database
SESSION_LIFETIME=120
```

#### **Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api/v1
NEXT_PUBLIC_FRONTEND_URL=https://your-domain.com
```

#### **Admin (.env):**
```env
REACT_APP_ADMIN_API_URL=https://api.your-domain.com/api/v1/admin
REACT_APP_API_URL=https://api.your-domain.com/api/v1
```

### **2. Queue Worker Setup (Supervisor)**

Create `/etc/supervisor/conf.d/bookbharat-worker.conf`:

```ini
[program:bookbharat-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/bookbharat-backend/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/bookbharat-backend/storage/logs/worker.log
stopwaitsecs=3600
```

Then:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start bookbharat-worker:*
```

### **3. Cron Job Setup**

Add to crontab:
```bash
sudo crontab -e
```

Add this line:
```cron
* * * * * cd /var/www/bookbharat-backend && php artisan schedule:run >> /dev/null 2>&1
```

---

## 🔔 **Notification System Configuration**

### **Step 1: Email (SMTP)**

**Via Admin Panel:**
1. Login to admin panel
2. Go to Settings → Notifications → Email Config
3. Enter SMTP details:
   - Host: smtp.gmail.com (or your provider)
   - Port: 587
   - Username: your-email@gmail.com
   - Password: your-app-password
   - From Address: noreply@bookbharat.com
   - From Name: BookBharat
4. Click "Save Email Configuration"
5. Test by sending test email

**OR via .env file:**
- Configure MAIL_* variables in .env
- Restart server

### **Step 2: SMS (Optional)**

**Via Admin Panel:**
1. Get SMS gateway credentials from your provider
2. Go to Settings → Notifications → SMS Gateway
3. Enter:
   - Gateway URL: Your SMS API endpoint
   - API Key: Your API key
   - Sender ID: BKBHRT (or your approved ID)
   - Request Format: JSON or Form
4. Click "Save Configuration"
5. Test with your phone number

### **Step 3: WhatsApp (Optional)**

**Prerequisites:**
1. Create WhatsApp Business Account at https://business.facebook.com
2. Add and verify phone number
3. Create message templates in WhatsApp Manager
4. Wait for template approval (24-48 hours)
5. Get credentials from Developer Console

**Via Admin Panel:**
1. Go to Settings → Notifications → WhatsApp API
2. Enter:
   - API URL: https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID
   - Access Token: Your token
   - Phone Number ID: From Meta dashboard
   - Business Account ID: From Meta dashboard
3. Click "Save Configuration"
4. Click "Sync Templates"
5. Test with your WhatsApp number

### **Step 4: Enable Channels**

1. Go to Settings → Notifications → Event Channels
2. For each event, toggle desired channels:
   - Email (always recommended)
   - SMS (for urgent updates)
   - WhatsApp (for delivery updates)
3. Enable/disable events as needed

---

## 🧪 **Post-Deployment Testing**

### **1. Test Notifications:**

```bash
# SSH into server
cd /var/www/bookbharat-backend

# Test email
php artisan tinker
>>> Mail::raw('Test email', function($m) { $m->to('your-email@example.com')->subject('Test'); });

# Test abandoned cart command
php artisan cart:send-abandoned-reminders --type=first

# Check queue
php artisan queue:work --once

# Check schedule
php artisan schedule:list
```

### **2. Verify in Admin Panel:**

- [ ] Login to admin panel
- [ ] Go to Settings → Notifications
- [ ] Verify all 4 tabs load
- [ ] Test email sending
- [ ] Test SMS (if configured)
- [ ] Test WhatsApp (if configured)
- [ ] Toggle channels and verify saves

### **3. Test User Flow:**

- [ ] Add items to cart
- [ ] Leave cart for 1+ hour
- [ ] Verify abandoned cart email received
- [ ] Complete an order
- [ ] Verify order confirmation email/SMS
- [ ] Wait 3-7 days (or manually test)
- [ ] Verify review request email

---

## 📊 **Monitoring Setup**

### **1. Log Monitoring:**

```bash
# View real-time logs
tail -f storage/logs/laravel.log

# Search for errors
grep "ERROR" storage/logs/laravel.log

# Search for notification logs
grep "notification" storage/logs/laravel.log
```

### **2. Queue Monitoring:**

```bash
# Check failed jobs
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all

# Monitor queue worker
supervisorctl status bookbharat-worker:*
```

### **3. Schedule Monitoring:**

```bash
# Check scheduled tasks
php artisan schedule:list

# Test schedule manually
php artisan schedule:run
```

---

## 🔒 **Security Checklist**

- [ ] APP_DEBUG=false in production
- [ ] Strong APP_KEY set
- [ ] Database credentials secure
- [ ] SMTP credentials secure
- [ ] SMS/WhatsApp API keys encrypted in database
- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] File permissions set correctly (775 for storage)
- [ ] .env file not publicly accessible

---

## 🎯 **Performance Optimization**

- [ ] Enable OPcache for PHP
- [ ] Enable Redis for caching (optional)
- [ ] Configure CDN for static assets
- [ ] Enable Gzip compression
- [ ] Optimize images
- [ ] Enable browser caching
- [ ] Configure queue workers (2+ processes)
- [ ] Set up log rotation

---

## 📱 **Mobile Testing**

Test on actual devices:
- [ ] iPhone Safari - Cart, checkout, gestures
- [ ] Android Chrome - Cart, checkout, gestures
- [ ] iPad - Responsive layout
- [ ] Various screen sizes

---

## 🆘 **Rollback Plan**

If issues occur:

1. **Database Rollback:**
   ```bash
   php artisan migrate:rollback --step=1
   ```

2. **Code Rollback:**
   ```bash
   git revert HEAD
   ```

3. **Clear All Caches:**
   ```bash
   php artisan config:clear
   php artisan cache:clear
   php artisan view:clear
   php artisan route:clear
   ```

---

## ✅ **Final Verification**

### **Backend:**
- [ ] API accessible: `curl https://api.your-domain.com/api/health`
- [ ] Admin routes working
- [ ] Database connected
- [ ] Queue worker running
- [ ] Scheduler running
- [ ] Logs writable

### **Frontend:**
- [ ] Site accessible
- [ ] Cart working
- [ ] Checkout working
- [ ] Mobile responsive
- [ ] Images loading

### **Admin:**
- [ ] Login working
- [ ] Notification settings accessible
- [ ] Products manageable
- [ ] Orders visible

### **Notifications:**
- [ ] Email sending
- [ ] SMS sending (if configured)
- [ ] WhatsApp sending (if configured)
- [ ] Scheduled tasks running
- [ ] Queue processing

---

## 📞 **Support Contacts**

### **Critical Issues:**
- Database: Check connection credentials
- Email: Verify SMTP settings in admin panel
- SMS: Check gateway logs and credentials
- WhatsApp: Verify token hasn't expired
- Queue: Check supervisor status
- Schedule: Verify cron job

### **Monitoring:**
- Application logs: `/var/www/bookbharat-backend/storage/logs/laravel.log`
- Worker logs: `/var/www/bookbharat-backend/storage/logs/worker.log`
- Web server logs: `/var/log/nginx/error.log` or `/var/log/apache2/error.log`

---

## 🎉 **Go Live!**

Once all checklist items are complete:

1. ✅ Announce to team
2. ✅ Monitor for first 24 hours
3. ✅ Check error logs hourly
4. ✅ Verify notifications sending
5. ✅ Test orders end-to-end
6. ✅ Monitor server resources
7. ✅ Collect user feedback

**Your platform is ready to serve customers!** 🚀

---

**Deployment Date:** _________________
**Deployed By:** _________________
**Status:** □ Complete □ Issues Found
**Notes:** _________________________________________________

