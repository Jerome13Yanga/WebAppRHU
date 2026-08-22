const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const zipPath = path.join(__dirname, 'jdk21.zip');
const extractDir = path.join(__dirname, 'jdk21');
const jdkUrl = 'https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.4%2B7/OpenJDK21U-jdk_x64_windows_hotspot_21.0.4_7.zip';

console.log('Downloading JDK 21 portable zip for Android Gradle compatibility...');

function download(url, dest, callback) {
  const request = https.get(url, (response) => {
    if (response.statusCode === 302 || response.statusCode === 301) {
      return download(response.headers.location, dest, callback);
    }
    if (response.statusCode !== 200) {
      console.error('Failed to download JDK:', response.statusCode);
      return;
    }
    const file = fs.createWriteStream(dest);
    response.pipe(file);
    file.on('finish', () => {
      file.close(callback);
    });
  }).on('error', (err) => {
    fs.unlink(dest, () => {});
    console.error('Download error:', err.message);
  });
}

if (!fs.existsSync(extractDir)) {
  download(jdkUrl, zipPath, () => {
    console.log('Download complete. Extracting JDK 21...');
    execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${extractDir}' -Force"`);
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }
    console.log('JDK 21 extraction complete.');
  });
} else {
  console.log('JDK 21 directory already exists.');
}
