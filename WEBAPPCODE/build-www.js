const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const destDir = path.join(__dirname, 'www');

// Ensure www directory exists
if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}
fs.mkdirSync(destDir, { recursive: true });

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      // Exclude build dirs and dev dirs
      if (['node_modules', 'android', 'www', '.git', '.vscode', '.gemini', 'reference-templates'].includes(childItemName)) {
        return;
      }
      copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy web files
const filesToCopy = [
  'index.html',
  'app.js',
  'style.css',
  'manifest.json',
  'sw.js',
  'offline.html',
  'logo.jpg',
  'src'
];

fs.readdirSync(srcDir).forEach(file => {
  if (file.startsWith('icon-') || file.startsWith('screenshot-') || filesToCopy.includes(file)) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    if (fs.existsSync(srcPath)) {
      copyRecursive(srcPath, destPath);
    }
  }
});

console.log('Successfully updated www/ directory for Capacitor native build.');
