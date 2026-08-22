const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const appDir = __dirname;
const sdkDir = path.join(appDir, 'android-sdk');
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
const env = { 
  ...process.env, 
  ANDROID_HOME: sdkDir, 
  JAVA_HOME: jdkHome, 
  PATH: `${path.join(jdkHome, 'bin')};${process.env.PATH}` 
};

const sdkManager = path.join(sdkDir, 'cmdline-tools', 'latest', 'bin', 'sdkmanager.bat');

function runSdkManager(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(sdkManager, args, { env, shell: true });
    
    proc.stdout.on('data', (data) => {
      const str = data.toString();
      process.stdout.write(str);
      if (str.includes('(y/N)') || str.includes('Accept?')) {
        proc.stdin.write('y\n');
      }
    });

    proc.stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });

    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Exit code ${code}`));
    });

    // Send y every 500ms automatically for license prompts
    const interval = setInterval(() => {
      if (proc.stdin.writable) {
        proc.stdin.write('y\n');
      }
    }, 500);

    proc.on('exit', () => clearInterval(interval));
  });
}

async function main() {
  console.log('Accepting Android SDK licenses...');
  try {
    await runSdkManager(['--sdk_root=' + sdkDir, '--licenses']);
  } catch (e) {}

  console.log('Installing Android SDK 34 platform & build-tools via sdkmanager...');
  try {
    await runSdkManager(['--sdk_root=' + sdkDir, 'platforms;android-34', 'build-tools;34.0.0', 'platform-tools']);
    console.log('--- Android SDK platform and build-tools successfully installed! ---');
  } catch (err) {
    console.error('Failed to install SDK components:', err.message);
  }
}

main();
