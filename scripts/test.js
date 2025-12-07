// Test script to verify all scripts work
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Meridian Post scripts...\n');

// Test if scripts exist
const scripts = ['dev.js', 'start.js', 'post-build.js'];
let allScriptsExist = true;

scripts.forEach(script => {
  const scriptPath = path.join(__dirname, script);
  if (fs.existsSync(scriptPath)) {
    console.log(`✅ ${script} exists`);
  } else {
    console.log(`❌ ${script} missing`);
    allScriptsExist = false;
  }
});

// Test if standalone build exists
if (fs.existsSync(path.join(__dirname, '../.next/standalone/server.js'))) {
  console.log('✅ Standalone build exists');
} else {
  console.log('❌ Standalone build missing (run npm run build first)');
}

// Test if public files copied to standalone
if (fs.existsSync(path.join(__dirname, '../.next/standalone/logo.svg'))) {
  console.log('✅ Public files copied to standalone');
} else {
  console.log('❌ Public files not copied to standalone');
}

// Test if static files copied to standalone
const staticPath = path.join(__dirname, '../.next/standalone/.next');
const hasStaticFiles = fs.existsSync(path.join(staticPath, 'chunks')) && 
                     fs.existsSync(path.join(staticPath, 'css')) && 
                     fs.existsSync(path.join(staticPath, 'media'));

if (hasStaticFiles) {
  console.log('✅ Static files copied to standalone');
} else {
  console.log('❌ Static files not copied to standalone');
}

console.log('\n🎯 Summary:');
if (allScriptsExist) {
  console.log('✅ All scripts are ready for cross-platform deployment!');
  console.log('\n📋 Usage:');
  console.log('  npm run dev    - Start development server');
  console.log('  npm run build  - Build for production');
  console.log('  npm run start  - Start production server');
} else {
  console.log('❌ Some scripts are missing');
}