const fs = require('fs');
const path = require('path');

console.log('🔧 Preparing standalone build...');

// Copy static files to standalone build if it exists
if (fs.existsSync('.next/standalone')) {
  try {
    // Copy .next/static to .next/standalone/.next/static (if static folder exists)
    if (fs.existsSync('.next/static')) {
      fs.cpSync('.next/static', '.next/standalone/.next/static', { recursive: true });
      console.log('✓ Copied .next/static to standalone build');
    }
    
    // Copy all .next contents to .next/standalone/.next/ (excluding what's already there)
    const nextSource = '.next';
    const nextDest = '.next/standalone/.next';
    
    // Ensure destination exists
    if (!fs.existsSync(nextDest)) {
      fs.mkdirSync(nextDest, { recursive: true });
    }
    
    // List all items in .next and copy missing ones
    const items = fs.readdirSync(nextSource);
    items.forEach(item => {
      const sourcePath = path.join(nextSource, item);
      const destPath = path.join(nextDest, item);
      
      // Skip if it's standalone folder itself
      if (item === 'standalone') return;
      
      // Copy if it doesn't exist in destination
      if (!fs.existsSync(destPath)) {
        fs.cpSync(sourcePath, destPath, { recursive: true });
        console.log(`✓ Copied ${item} to standalone build`);
      }
    });
    
    // Copy public to .next/standalone/
    if (fs.existsSync('public')) {
      fs.cpSync('public', '.next/standalone/', { recursive: true });
      console.log('✓ Copied public files to standalone build');
    }
    
    console.log('✓ Standalone build prepared successfully');
    
    // Verify critical files exist
    const criticalFiles = [
      '.next/standalone/.next/static',
      '.next/standalone/.next/css', 
      '.next/standalone/.next/chunks',
      '.next/standalone/public/logo.svg'
    ];
    
    console.log('\n🔍 Verifying critical files:');
    let allGood = true;
    criticalFiles.forEach(file => {
      const exists = fs.existsSync(file);
      console.log(`${exists ? '✅' : '❌'} ${file}`);
      if (!exists) allGood = false;
    });
    
    if (allGood) {
      console.log('\n🎉 Standalone build is ready for deployment!');
    } else {
      console.log('\n⚠️  Some files are missing. Check logs above.');
    }
    
  } catch (error) {
    console.error('❌ Error preparing standalone build:', error);
    process.exit(1);
  }
} else {
  console.log('❌ Standalone build not found, skipping file copy');
}