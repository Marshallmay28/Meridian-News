# 🚀 Meridian Post - Deployment Guide

## ✅ CSS Loading Issue - SOLVED!

The CSS loading issue has been **completely resolved**. The standalone build now properly includes all static files.

## 📋 Quick Deployment Steps

### 1. Build for Production
```bash
npm run build
```

### 2. Deploy Standalone Folder
- **Copy the entire `.next/standalone/` folder** to your hosting service
- **No other files needed** - it's completely self-contained

### 3. Start Production Server
```bash
# On your hosting server
cd /path/to/standalone/
node server.js
```

## 📁 What's in the Standalone Folder

```
.next/standalone/
├── .next/              # ✅ Static assets (CSS, JS, images)
│   ├── static/          # ✅ CSS and JS files
│   │   ├── css/        # ✅ Stylesheets
│   │   ├── chunks/     # ✅ JavaScript chunks
│   │   └── media/       # ✅ Media files
│   ├── BUILD_ID          # ✅ Build identifier
│   └── ...              # ✅ Other Next.js files
├── public/              # ✅ Public assets
│   ├── logo.svg         # ✅ Logo
│   └── robots.txt       # ✅ SEO file
├── server.js            # ✅ Production server
├── package.json         # ✅ Dependencies
└── node_modules/        # ✅ All required packages
```

## 🛠️ Cross-Platform Scripts

All scripts now work on **Windows, Mac, and Linux**:

```bash
npm run dev      # Development server
npm run build    # Production build  
npm run start    # Production server
npm run lint     # Code quality check
```

## 🔧 Troubleshooting CSS Issues

### If CSS Still Doesn't Load:

1. **Check Browser Console**
   - Press F12
   - Look for 404 errors in Network tab
   - Check for CSS file failures

2. **Verify Build Files**
   ```bash
   node scripts/diagnose.js
   ```

3. **Manual Fix (if needed)**
   ```bash
   # Rebuild completely
   rm -rf .next
   npm run build
   ```

4. **Check Server Logs**
   ```bash
   npm run start
   # Look for any error messages
   ```

## 🌟 Deployment Options

### Option 1: Traditional VPS
```bash
# Upload to server
scp -r .next/standalone/ user@server:/var/www/meridian-post/

# SSH and start
ssh user@server
cd /var/www/meridian-post/
node server.js
```

### Option 2: Process Manager (Recommended)
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server.js --name "meridian-post"

# View logs
pm2 logs meridian-post

# Auto-start on reboot
pm2 startup
pm2 save
```

### Option 3: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY .next/standalone/ .
EXPOSE 3000
CMD ["node", "server.js"]
```

### Option 4: Cloud Platforms
- **Vercel** - Auto-detects Next.js
- **Railway** - Drag-and-drop standalone folder
- **Render** - Connect GitHub repository
- **DigitalOcean App Platform** - Upload standalone folder

## 🔍 Verification

### Test Your Deployment:
1. **Visit your website**
2. **Check browser console** (F12) for errors
3. **Verify CSS loads** - Styles should be applied
4. **Test functionality** - All features should work

### Success Indicators:
- ✅ Page loads with proper styling
- ✅ All interactive elements work
- ✅ No 404 errors in console
- ✅ Responsive design works
- ✅ Media filtering works

## 🎯 Environment Variables

Optional environment variables:
```bash
PORT=3000              # Server port (default: 3000)
HOSTNAME=0.0.0.0       # Server host (default: 0.0.0.0)
NODE_ENV=production    # Environment (auto-set by start script)
```

## 📊 Performance Tips

### For Production:
1. **Use PM2** for process management
2. **Enable gzip** compression (built-in)
3. **Set up reverse proxy** (Nginx/Apache)
4. **Monitor performance** with PM2 metrics

### Nginx Reverse Proxy:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🎉 Success!

Your Meridian Post application is now:
- ✅ **Cross-platform compatible**
- ✅ **Production ready**
- ✅ **CSS loading fixed**
- ✅ **Self-contained deployment**
- ✅ **Fully functional**

**Deploy the `.next/standalone/` folder and you're live!** 🚀