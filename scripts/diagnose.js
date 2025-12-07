// Diagnostic script for standalone build issues
const fs = require('fs');
const path = require('path');

console.log('🔍 Meridian Post Standalone Build Diagnostic\n');

const standalonePath = path.join(__dirname, '../.next/standalone');

// Check standalone folder exists
if (!fs.existsSync(standalonePath)) {
  console.log('❌ Standalone folder not found. Run: npm run build');
  process.exit(1);
}

console.log('✅ Standalone folder found:', standalonePath);

// Check critical files
const criticalFiles = [
  'server.js',
  'package.json',
  '.next/BUILD_ID',
  '.next/static/chunks',
  '.next/static/css',
  'public/logo.svg'
];

let allGood = true;

criticalFiles.forEach(file => {
  const filePath = path.join(standalonePath, file);
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${file}`);
  
  if (!exists) {
    allGood = false;
    
    // Try to find similar files
    if (file.includes('static')) {
      const staticPath = path.join(standalonePath, '.next');
      try {
        const items = fs.readdirSync(staticPath);
        console.log(`   📁 Contents of .next/: ${items.join(', ')}`);
      } catch (e) {
        console.log(`   ❌ Cannot read .next/ folder`);
      }
    }
  }
});

// Check CSS files specifically
const cssPath = path.join(standalonePath, '.next/static/css');
if (fs.existsSync(cssPath)) {
  try {
    const cssFiles = fs.readdirSync(cssPath).filter(f => f.endsWith('.css'));
    console.log(`✅ CSS files found: ${cssFiles.length}`);
    cssFiles.forEach(file => {
      console.log(`   📄 ${file}`);
    });
  } catch (e) {
    console.log('❌ Cannot read CSS folder');
    allGood = false;
  }
} else {
  console.log('❌ CSS folder not found');
  allGood = false;
}

// Check server.js content
const serverPath = path.join(standalonePath, 'server.js');
if (fs.existsSync(serverPath)) {
  try {
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    const hasNext = serverContent.includes('require(\'next\')');
    const hasStartServer = serverContent.includes('startServer');
    console.log(`✅ Server.js contains Next.js: ${hasNext ? 'Yes' : 'No'}`);
    console.log(`✅ Server.js contains startServer: ${hasStartServer ? 'Yes' : 'No'}`);
  } catch (e) {
    console.log('❌ Cannot read server.js');
    allGood = false;
  }
}

console.log('\n🎯 Summary:');
if (allGood) {
  console.log('✅ Standalone build looks correct!');
  console.log('\n🚀 To start server:');
  console.log('   npm run start');
  console.log('\n🌐 Access at:');
  console.log('   http://localhost:3000');
  console.log('\n🔧 If CSS still not loading:');
  console.log('   1. Open browser dev tools (F12)');
  console.log('   2. Check Network tab for 404 errors');
  console.log('   3. Look for failed CSS/JS file requests');
  console.log('   4. Try hard refresh (Ctrl+F5)');
} else {
  console.log('❌ Issues found. Try rebuilding:');
  console.log('   rm -rf .next');
  console.log('   npm run build');
  console.log('   npm run start');
}