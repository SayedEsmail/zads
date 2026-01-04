# Zads Platform - Deployment Checklist

Complete guide for deploying the Zads platform to production.

**Target Domain:** zads.app  
**Last Updated:** January 4, 2026

---

## 📋 Pre-Deployment Checklist

### 1. Domain & SSL Setup
- [ ] Register/verify domain: `zads.app`
- [ ] Configure DNS records:
  - [ ] `zads.app` → Dashboard/Landing
  - [ ] `api.zads.app` → API Server
  - [ ] `admin.zads.app` → Admin Dashboard (optional)
- [ ] Obtain SSL certificates (Let's Encrypt recommended)
- [ ] Configure HTTPS redirects

### 2. Server Requirements
- [ ] **API Server:**
  - [ ] Node.js 18+ installed
  - [ ] PostgreSQL 14+ installed & configured
  - [ ] PM2 or similar process manager
  - [ ] Nginx as reverse proxy
  - [ ] Minimum 2GB RAM, 20GB storage
- [ ] **Dashboard Server:**
  - [ ] Nginx or any static file server
  - [ ] Node.js 18+ (for build process)

---

## 🔵 Phase 1: API Deployment

### 1.1 Database Setup
```bash
# On production server
sudo -u postgres createdb zads_production
sudo -u postgres psql -c "CREATE USER zads_user WITH PASSWORD 'secure_password_here';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE zads_production TO zads_user;"
```

- [ ] Create production database
- [ ] Create database user with strong password
- [ ] Configure database backup strategy (daily recommended)
- [ ] Test database connection

### 1.2 Environment Configuration
Create `/var/www/zads-api/.env`:
```env
# Server
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://zads_user:SECURE_PASSWORD@localhost:5432/zads_production

# Authentication
JWT_SECRET=GENERATE_64_CHAR_RANDOM_STRING
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://zads.app,https://admin.zads.app

# Optional: Future services
# CLOUDINARY_URL=cloudinary://...
# FIREBASE_CONFIG=...
```

- [ ] Generate strong JWT_SECRET (64+ characters)
- [ ] Set proper CORS origins
- [ ] Configure all environment variables
- [ ] Secure .env file permissions (`chmod 600 .env`)

### 1.3 Deploy API Code
```bash
# Clone repository
cd /var/www
git clone <repository> zads-api
cd zads-api

# Install dependencies
npm ci --production

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed initial data
npx prisma db seed

# Start with PM2
pm2 start npm --name "zads-api" -- start
pm2 save
pm2 startup
```

- [ ] Clone repository to server
- [ ] Install production dependencies
- [ ] Run database migrations
- [ ] Seed initial data (subjects, stages, admin)
- [ ] Start with process manager (PM2)
- [ ] Configure PM2 to start on boot

### 1.4 Nginx Configuration
Create `/etc/nginx/sites-available/api.zads.app`:
```nginx
server {
    listen 80;
    server_name api.zads.app;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.zads.app;

    ssl_certificate /etc/letsencrypt/live/api.zads.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.zads.app/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

- [ ] Create Nginx config
- [ ] Enable site (`ln -s`)
- [ ] Test config (`nginx -t`)
- [ ] Reload Nginx

### 1.5 API Verification
- [ ] Test health endpoint: `curl https://api.zads.app/health`
- [ ] Test login endpoint with seeded admin
- [ ] Verify CORS headers work correctly
- [ ] Check logs for errors: `pm2 logs zads-api`

---

## 🟢 Phase 2: Dashboard Deployment

### 2.1 Build Dashboard
```bash
# On local machine or CI/CD
cd zads-dashboard

# Create production env
echo "VITE_API_BASE_URL=https://api.zads.app/api" > .env.production

# Install and build
pnpm install
pnpm build

# Output will be in /dist folder
```

- [ ] Set production API URL
- [ ] Build for production
- [ ] Verify build output

### 2.2 Deploy to Server
```bash
# Copy build files to server
scp -r dist/* user@server:/var/www/zads-dashboard/

# Or use rsync for updates
rsync -avz dist/ user@server:/var/www/zads-dashboard/
```

- [ ] Transfer build files to server
- [ ] Set correct file permissions

### 2.3 Nginx Configuration
Create `/etc/nginx/sites-available/admin.zads.app`:
```nginx
server {
    listen 80;
    server_name admin.zads.app;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name admin.zads.app;

    ssl_certificate /etc/letsencrypt/live/admin.zads.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.zads.app/privkey.pem;

    root /var/www/zads-dashboard;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

- [ ] Create Nginx config for dashboard
- [ ] Enable site
- [ ] Test and reload Nginx

### 2.4 Dashboard Verification
- [ ] Access `https://admin.zads.app`
- [ ] Test login with admin credentials
- [ ] Verify all pages load correctly
- [ ] Test CRUD operations
- [ ] Verify Arabic RTL rendering

---

## 🟡 Phase 3: Mobile App Deployment

### 3.1 Pre-Build Setup

#### Update API URL
Edit `lib/core/network/dio_client.dart`:
```dart
baseUrl: 'https://api.zads.app/api',
```

- [ ] Update production API URL
- [ ] Remove debug/development flags

### 3.2 Android Build

#### 3.2.1 Signing Configuration
```bash
# Generate keystore (one-time)
keytool -genkey -v -keystore ~/zads-upload-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias zads-key
```

Create `android/key.properties`:
```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=zads-key
storeFile=/path/to/zads-upload-keystore.jks
```

- [ ] Generate upload keystore
- [ ] Store keystore securely (backup!)
- [ ] Configure key.properties
- [ ] Add key.properties to .gitignore

#### 3.2.2 App Configuration
Update `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        applicationId "app.zads"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
}
```

- [ ] Set correct applicationId
- [ ] Update version code/name
- [ ] Configure signing in build.gradle

#### 3.2.3 Build APK/Bundle
```bash
# Build release APK
flutter build apk --release

# Build App Bundle for Play Store
flutter build appbundle --release
```

- [ ] Build release APK for testing
- [ ] Build App Bundle for Play Store
- [ ] Test APK on physical device

### 3.3 iOS Build

#### 3.3.1 Xcode Configuration
- [ ] Open `ios/Runner.xcworkspace` in Xcode
- [ ] Set Bundle Identifier: `app.zads`
- [ ] Configure signing with Apple Developer account
- [ ] Set deployment target: iOS 12.0+
- [ ] Update version and build number

#### 3.3.2 App Store Connect
- [ ] Create app in App Store Connect
- [ ] Configure app information
- [ ] Add screenshots (all required sizes)
- [ ] Write Arabic app description
- [ ] Set pricing (Free)
- [ ] Configure age rating

#### 3.3.3 Build & Upload
```bash
# Build iOS
flutter build ios --release

# Archive in Xcode
# Xcode > Product > Archive > Distribute App
```

- [ ] Build release iOS app
- [ ] Archive in Xcode
- [ ] Upload to App Store Connect
- [ ] Submit for review

### 3.4 Google Play Store

#### 3.4.1 Play Console Setup
- [ ] Create app in Google Play Console
- [ ] Complete app content declaration
- [ ] Add Arabic store listing
- [ ] Upload screenshots (all required sizes)
- [ ] Set content rating
- [ ] Configure pricing (Free)

#### 3.4.2 Release
- [ ] Upload AAB to internal testing
- [ ] Test internal release
- [ ] Promote to production
- [ ] Submit for review

### 3.5 App Assets Checklist
- [ ] App icon (all sizes for iOS & Android)
- [ ] Splash screen
- [ ] Feature graphic (Play Store)
- [ ] Screenshots for all device sizes
- [ ] Privacy Policy URL
- [ ] Terms of Service URL

---

## 🔒 Phase 4: Security Hardening

### 4.1 API Security
- [ ] Enable rate limiting
- [ ] Validate all inputs with Zod
- [ ] Sanitize database queries (Prisma handles this)
- [ ] Implement request size limits
- [ ] Enable HTTPS only
- [ ] Set secure CORS policy

### 4.2 Infrastructure Security
- [ ] Configure firewall (UFW)
  ```bash
  sudo ufw allow 22/tcp   # SSH
  sudo ufw allow 80/tcp   # HTTP
  sudo ufw allow 443/tcp  # HTTPS
  sudo ufw enable
  ```
- [ ] Disable root SSH login
- [ ] Use SSH key authentication
- [ ] Keep system packages updated
- [ ] Configure fail2ban

### 4.3 Database Security
- [ ] Use strong database password
- [ ] Restrict database access to localhost
- [ ] Enable database logging
- [ ] Schedule automated backups

---

## 📊 Phase 5: Monitoring & Maintenance

### 5.1 Monitoring Setup
- [ ] Configure PM2 monitoring
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure error logging (Sentry optional)
- [ ] Monitor server resources

### 5.2 Backup Strategy
- [ ] Database: Daily automated backups
  ```bash
  # Add to crontab
  0 3 * * * pg_dump zads_production > /backups/zads_$(date +\%Y\%m\%d).sql
  ```
- [ ] Store backups off-site (S3, Google Cloud)
- [ ] Test backup restoration monthly

### 5.3 Update Process
- [ ] Document deployment process
- [ ] Create rollback procedures
- [ ] Test updates in staging first

---

## ✅ Post-Launch Checklist

### Immediate (Day 1)
- [ ] Verify all services are running
- [ ] Test complete user flows (parent & teacher)
- [ ] Monitor error logs
- [ ] Check server load
- [ ] Verify email notifications (if applicable)

### First Week
- [ ] Monitor user signups
- [ ] Track error rates
- [ ] Gather initial user feedback
- [ ] Fix critical bugs immediately
- [ ] Update app store listings if needed

### First Month
- [ ] Analyze usage metrics
- [ ] Optimize performance bottlenecks
- [ ] Plan feature updates based on feedback
- [ ] Review security logs
- [ ] Update dependencies if needed

---

## 📱 App Store Information

### Arabic App Store Listing

**App Name:** زاد - معلمين خصوصيين

**Short Description:**
ابحث عن أفضل المعلمين الخصوصيين في مصر

**Full Description:**
```
زادك للتعليم - منصة تجمع أولياء الأمور بالمعلمين الخصوصيين

🎓 للأهالي:
• ابحث عن معلمين بالقرب منك
• قارن الأسعار والتقييمات
• تواصل مباشرة مع المعلم
• احفظ المعلمين المفضلين

👨‍🏫 للمعلمين:
• أنشئ ملفك الشخصي المجاني
• اعرض مؤهلاتك وخبراتك
• حدد أسعارك بمرونة
• استقبل طلبات التواصل

✨ مميزات التطبيق:
• واجهة عربية بالكامل
• بحث متقدم بالموقع والمادة
• تصفح آمن ومجاني
```

**Keywords:**
معلمين، دروس خصوصية، تعليم، مدرسين، ثانوية عامة، مصر، تدريس

**Category:** Education

---

## 🚀 Quick Deploy Commands

### API Update
```bash
cd /var/www/zads-api
git pull origin main
npm ci --production
npx prisma migrate deploy
pm2 restart zads-api
```

### Dashboard Update
```bash
# Local
cd zads-dashboard && pnpm build
rsync -avz dist/ user@server:/var/www/zads-dashboard/

# On server
sudo nginx -t && sudo systemctl reload nginx
```

---

## 📞 Emergency Contacts

| Role | Contact |
|------|---------|
| Server Admin | [Your contact] |
| Developer | [Your contact] |
| Domain Registrar | [Provider support] |

---

*Checklist created: January 4, 2026*
