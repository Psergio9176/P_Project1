const path = require('path');
const fs = require('fs');

console.log('=== Debug Start ===');
console.log('Node version:', process.version);
console.log('Current dir:', process.cwd());
console.log('App dir:', __dirname);

const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
console.log('\nnode_modules exists:', fs.existsSync(nodeModulesPath));

if (fs.existsSync(nodeModulesPath)) {
  const dirs = fs.readdirSync(nodeModulesPath).filter(f => !f.startsWith('.') && f.length < 10);
  console.log('node_modules packages (sample):', dirs.slice(0, 20));
}

const expressPath = path.join(nodeModulesPath, 'express');
console.log('express exists:', fs.existsSync(expressPath));

const appPath = path.join(__dirname, '..', 'dist', 'app.js');
console.log('\napp.js exists:', fs.existsSync(appPath));

console.log('\n=== Trying to require app ===');
try {
  require('../dist/app.js');
  console.log('App loaded successfully');
} catch (e) {
  console.error('Error:', e.message);
  console.error('Stack:', e.stack);
  process.exit(1);
}