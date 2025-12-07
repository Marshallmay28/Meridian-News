// Cross-platform start script for production
const { spawn } = require('child_process');
const path = require('path');

// Set production environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '3000';
process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

const standalonePath = path.join(__dirname, '../.next/standalone');
const serverPath = path.join(standalonePath, 'server.js');

console.log('🚀 Starting Meridian Post in production mode...');
console.log('📁 Server path:', serverPath);
console.log('🌐 Server will run on: http://' + process.env.HOSTNAME + ':' + process.env.PORT);

// Change to standalone directory to ensure proper relative paths
process.chdir(standalonePath);

// Start the server
const server = spawn('node', ['server.js'], {
  cwd: standalonePath, // Ensure we're in the right directory
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: 'inherit' // Show all output directly
});

// Handle server events
server.on('close', (code) => {
  console.log(`\n📋 Server process exited with code ${code}`);
  if (code !== 0) {
    console.log('❌ Server exited with error. Check the logs above.');
  }
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  
  if (error.code === 'EADDRINUSE') {
    console.log(`💡 Port ${process.env.PORT} is already in use.`);
    console.log('   Try a different port: PORT=3001 npm start');
    console.log('   Or kill the process using that port.');
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  server.kill('SIGTERM');
});

// Log server info after a short delay
setTimeout(() => {
  console.log('\n✨ Server should be running at:');
  console.log(`   🌐 Local: http://localhost:${process.env.PORT}`);
  console.log(`   🌐 Network: http://${process.env.HOSTNAME}:${process.env.PORT}`);
  console.log('\n💡 If CSS/styles are not loading:');
  console.log('   1. Check browser console for 404 errors');
  console.log('   2. Verify .next/standalone/.next/css/ folder exists');
  console.log('   3. Try accessing: http://localhost:' + process.env.PORT + '/_next/static/');
}, 2000);