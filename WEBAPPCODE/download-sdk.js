const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const appDir = __dirname;
const sdkDir = path.join(appDir, 'android-sdk');
const zipPath = path.join(appDir, 'sdk-tools.zip');
const sdkUrl = 'https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip';

console.log('--- Android SDK Downloader & Setup ---');

function download(url, dest, callback) {
  const request = https.get(url, (response) => {
    if (response.statusCode === 302 || response.statusCode === 301) {
      return download(response.headers.location, dest, callback);
    }
    if (response.statusCode !== 200) {
      console.error('Failed to download Android SDK Tools:', response.statusCode);
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

if (!fs.existsSync(path.join(sdkDir, 'cmdline-tools', 'latest', 'bin', 'sdkmanager.bat'))) {
  console.log('Downloading Android Command Line Tools...');
  download(sdkUrl, zipPath, () => {
    console.log('Download complete. Extracting Android SDK Tools...');
    const cmdlineLatest = path.join(sdkDir, 'cmdline-tools', 'latest');
    fs.mkdirSync(cmdlineLatest, { recursive: true });

    const tempExtract = path.join(appDir, 'sdk-temp');
    try { if (fs.existsSync(tempExtract)) fs.rmSync(tempExtract, { recursive: true, force: true }); } catch (e) {}
    execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${tempExtract}' -Force"`);

    const extractedCmdline = path.join(tempExtract, 'cmdline-tools');
    fs.cpSync(extractedCmdline, cmdlineLatest, { recursive: true });

    try { fs.rmSync(tempExtract, { recursive: true, force: true }); } catch (e) {}
    if (fs.existsSync(zipPath)) { try { fs.unlinkSync(zipPath); } catch (e) {} }

    console.log('Accepting Android SDK licenses and installing build-tools...');
    const jdkRoot = path.join(appDir, 'jdk21');
    function findJdkBin(dir) {
      const items = fs.readdirSync(dir);
      if (items.includes('bin') && fs.existsSync(path.join(dir, 'bin', 'java.exe'))) return dir;
      for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          const found = findJdkBin(fullPath);
          if (found) return found;
        }
      }
      return null;
    }
    const jdkHome = findJdkBin(jdkRoot);
    const env = { ...process.env, ANDROID_HOME: sdkDir, JAVA_HOME: jdkHome, PATH: `${path.join(jdkHome, 'bin')};${process.env.PATH}` };
    const sdkManager = path.join(cmdlineLatest, 'bin', 'sdkmanager.bat');

    try {
      execSync(`echo y | "${sdkManager}" --sdk_root="${sdkDir}" "platforms;android-34" "build-tools;34.0.0" "platform-tools"`, { env, stdio: 'inherit' });
      console.log('Android SDK platforms and build-tools installed successfully!');
    } catch (e) {
      console.error('Error installing SDK packages:', e.message);
    }
  });
} else {
  console.log('Android SDK folder already exists at:', sdkDir);
}
