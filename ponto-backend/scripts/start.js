const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting app...');
console.log('Node version:', process.version);
console.log('Current dir:', process.cwd());

const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
console.log('node_modules exists:', fs.existsSync(nodeModulesPath));
console.log('express exists:', fs.existsSync(path.join(nodeModulesPath, 'express')));

const appPath = path.join(__dirname, '..', 'src', 'app.js');
console.log('app.js exists:', fs.existsSync(appPath));

try {
  require('../src/app.js');
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}