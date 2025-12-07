# Meridian Post - Cross-Platform Build Scripts

## 🎯 Overview
The Meridian Post now includes cross-platform build scripts that work on **Windows, Mac, and Linux**. No more Unix command errors!

## 📋 Available Scripts

### Development
```bash
npm run dev
```
- Starts Next.js development server on port 3000
- Logs output to `dev.log` file
- Works on all platforms

### Production Build
```bash
npm run build
```
- Creates optimized production build
- Copies static files to standalone folder
- Prepares deployment-ready package
- Works on all platforms

### Production Server
```bash
npm run start
```
- Starts production server from standalone build
- Sets NODE_ENV=production
- Works on all platforms

### Other Scripts
```bash
npm run lint        # Run ESLint
npm run db:push     # Push database schema
npm run db:generate  # Generate Prisma client
```

## 🛠️ Script Files

### `/scripts/dev.js`
- Cross-platform development server
- Replaces Unix `| tee dev.log` command
- Handles graceful shutdown
- Logs to both console and file

### `/scripts/start.js`
- Cross-platform production server
- Replaces Unix `NODE_ENV=production` syntax
- Proper error handling
- Graceful shutdown support

### `/scripts/post-build.js`
- Cross-platform file copying
- Replaces Unix `cp -r` commands
- Copies static and public files to standalone
- Works on Windows, Mac, Linux

### `/scripts/test.js`
- Tests all scripts and build files
- Verifies cross-platform compatibility
- Useful for troubleshooting

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

4. **Start production server**
   ```bash
   npm run start
   ```

## 📁 Build Output

After running `npm run build`, you'll find:

```
.next/
├── standalone/           # Production-ready package
│   ├── .next/          # Static files (chunks, css, media)
│   ├── public/          # Public assets (logo.svg, robots.txt)
│   ├── server.js        # Production server
│   └── node_modules/    # Required dependencies
└── static/              # Development static files
```

## 🔧 Troubleshooting

### Port Already in Use
If you get `EADDRINUSE: address already in use`, the port is occupied:
```bash
# Windows
netstat -ano | findstr :3000

# Mac/Linux  
lsof -ti:3000 | xargs kill -9
```

### Build Fails
Ensure all dependencies are installed:
```bash
npm install
npm run lint  # Check for errors first
```

### Scripts Not Working
Test all scripts:
```bash
node scripts/test.js
```

## 🌟 Features

- ✅ **Cross-platform** - Works on Windows, Mac, Linux
- ✅ **Error handling** - Graceful error messages and recovery
- ✅ **Logging** - Development logs saved to file
- ✅ **Graceful shutdown** - Ctrl+C properly stops servers
- ✅ **Production ready** - Optimized builds for deployment

## 📦 Deployment

The standalone build in `.next/standalone/` contains everything needed for deployment:

1. Copy the entire `.next/standalone/` folder to your server
2. Install Node.js dependencies (already included in node_modules)
3. Run: `node server.js`

No need to copy source code - the standalone build is self-contained!

## 🎉 Success!

Your Meridian Post application is now ready for cross-platform development and deployment!