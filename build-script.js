const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    let entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

try {
    console.log('Building frontend...');
    execSync('npm run build --workspace=frontend', { stdio: 'inherit' });

    const distPath = path.join(__dirname, 'frontend', 'dist');
    const publicPath = path.join(__dirname, 'public');

    console.log('Moving build artifacts to public...');
    if (fs.existsSync(publicPath)) {
        fs.rmSync(publicPath, { recursive: true, force: true });
    }

    copyDir(distPath, publicPath);

    console.log('Build complete. Artifacts in public/');
} catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
}
