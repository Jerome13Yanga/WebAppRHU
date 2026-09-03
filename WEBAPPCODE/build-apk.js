const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const appDir = __dirname;
const jdkRoot = path.join(appDir, 'jdk21');

console.log('--- RHU Native APK Builder ---');

// 1. Prepare web bundle
console.log('[1/3] Building web bundle...');
execSync('node build-www.js', { stdio: 'inherit', cwd: appDir });

// 2. Sync Capacitor Android project
console.log('[2/3] Syncing Capacitor native Android project...');
const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
execSync(`${npxCmd} cap sync android`, { stdio: 'inherit', cwd: appDir });

// 3. Locate Android SDK and JDK 21 if available
const sdkRoot = path.join(appDir, 'android-sdk');
const androidDir = path.join(appDir, 'android');
const localPropsPath = path.join(androidDir, 'local.properties');

let env = { ...process.env };

if (fs.existsSync(sdkRoot)) {
  const formattedSdkDir = sdkRoot.replace(/\\/g, '/');
  fs.writeFileSync(localPropsPath, `sdk.dir=${formattedSdkDir}\n`);
  env.ANDROID_HOME = sdkRoot;
  console.log(`Using Android SDK at: ${sdkRoot}`);
}

if (fs.existsSync(jdkRoot)) {
  function findJdkBin(dir) {
    const items = fs.readdirSync(dir);
    if (items.includes('bin') && fs.existsSync(path.join(dir, 'bin', 'java.exe'))) {
      return dir;
    }
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
  if (jdkHome) {
    console.log(`Using portable JDK 21 at: ${jdkHome}`);
    env.JAVA_HOME = jdkHome;
    env.PATH = `${path.join(jdkHome, 'bin')};${env.PATH}`;
  }
}

// 4. Compile APK using Gradle wrapper
console.log('[3/3] Compiling Android APK with Gradle wrapper...');
execSync('gradlew assembleDebug', { stdio: 'inherit', cwd: androidDir, env });

console.log('--- APK Build Finished! ---');
const apkOutput = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const targetApk = path.join(appDir, 'rhu-mother-app.apk');

if (fs.existsSync(apkOutput)) {
  fs.copyFileSync(apkOutput, targetApk);
  console.log(`SUCCESS: Installable APK created and copied to: ${targetApk}`);
} else {
  console.log(`Check ${androidDir}/app/build/outputs/apk/ for compiled output.`);
}
