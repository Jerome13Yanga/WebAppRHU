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
      if (['node_modules', 'android', 'www', '.git', '.vscode', '.gemini'].includes(childItemName)) {
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
  'src',
  'reference-templates',
  'CC Template.xlsx',
  'MC Template.xlsx'
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

// Post-process www/index.html for native Android APK:
// 1. Mark body as is-native-apk
// 2. Completely remove any "Download Mobile App (.apk)" buttons from all interfaces
const wwwIndexHtml = path.join(destDir, 'index.html');
if (fs.existsSync(wwwIndexHtml)) {
  let content = fs.readFileSync(wwwIndexHtml, 'utf8');

  // Add is-native-apk class to body
  content = content.replace(/<body([^>]*)>/i, '<body$1 class="is-native-apk">');

  // Remove authApkDownloadSection
  content = content.replace(/<!-- APK DOWNLOAD BUTTON ON LOGIN SCREEN -->[\s\S]*?<\/div>\s*<\/section>/i, '</section>');

  // Remove sidebarApkDownload
  content = content.replace(/<!-- SIDEBAR APK DOWNLOAD FOOTER -->[\s\S]*?<\/aside>/i, '</aside>');

  // Remove topbarApkDownload
  content = content.replace(/<a\s+[^>]*id="topbarApkDownload"[^>]*>[\s\S]*?<\/a>/i, '');

  fs.writeFileSync(wwwIndexHtml, content, 'utf8');
}

console.log('Successfully updated www/ directory for Capacitor native build (all APK download buttons removed).');
