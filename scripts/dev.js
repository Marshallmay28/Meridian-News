// Cross-platform development script
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Meridian Post in development mode...');

// Create log file stream
const logStream = fs.createWriteStream('dev.log', { flags: 'w' });

// Start Next.js dev server
const devServer = spawn('npx', ['next', 'dev', '-p', '3000'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
});

// Handle stdout and stderr
devServer.stdout?.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);
  logStream.write(output);
});

devServer.stderr?.on('data', (data) => {
  const output = data.toString();
  process.stderr.write(output);
  logStream.write(output);
});

// Handle server close
devServer.on('close', (code) => {
  console.log(`\n📝 Development server exited with code ${code}`);
  logStream.end();
});

devServer.on('error', (error) => {
  console.error('Failed to start development server:', error);
  logStream.end();
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  devServer.kill('SIGINT');
  logStream.end();
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development server...');
  devServer.kill('SIGTERM');
  logStream.end();
});