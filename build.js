#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building Outlook Planner Add-in...\n');

// Check if required files exist
const requiredFiles = [
    'package.json',
    'webpack.config.js',
    'manifest.xml',
    'src/taskpane/taskpane.js',
    'src/taskpane/taskpane.html'
];

console.log('📋 Checking required files...');
let allFilesExist = true;
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ❌ ${file} - MISSING`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.error('\n❌ Build failed: Missing required files');
    process.exit(1);
}

// Check Node.js version
console.log('\n🔍 Checking environment...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
console.log(`  Node.js version: ${nodeVersion}`);

if (majorVersion < 16) {
    console.warn(`  ⚠️  Warning: Node.js 16+ recommended (current: ${majorVersion})`);
}

// Install dependencies if node_modules doesn't exist
if (!fs.existsSync('node_modules')) {
    console.log('\n📦 Installing dependencies...');
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('  ✅ Dependencies installed');
    } catch (error) {
        console.error('  ❌ Failed to install dependencies');
        console.error(error.message);
        process.exit(1);
    }
} else {
    console.log('  ✅ Dependencies already installed');
}

// Validate manifest
console.log('\n📄 Validating manifest...');
try {
    const manifest = fs.readFileSync('manifest.xml', 'utf8');
    
    // Check for placeholder values
    const placeholders = [
        '12345678-1234-1234-1234-123456789012',
        'localhost:3000',
        'Your Company'
    ];
    
    let hasPlaceholders = false;
    placeholders.forEach(placeholder => {
        if (manifest.includes(placeholder)) {
            console.log(`  ⚠️  Warning: Placeholder detected: "${placeholder}"`);
            hasPlaceholders = true;
        }
    });
    
    if (hasPlaceholders) {
        console.log('  💡 Update manifest.xml with your production values');
    } else {
        console.log('  ✅ Manifest looks good');
    }
    
} catch (error) {
    console.warn('  ⚠️  Could not validate manifest:', error.message);
}

// Build the project
console.log('\n🏗️  Building project...');
try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('  ✅ Build successful');
} catch (error) {
    console.error('  ❌ Build failed');
    console.error(error.message);
    process.exit(1);
}

// Check build output
console.log('\n📁 Checking build output...');
const distFiles = [
    'dist/taskpane.html',
    'dist/taskpane.js',
    'dist/commands.html',
    'dist/commands.js',
    'dist/manifest.xml'
];

distFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        console.log(`  ✅ ${file} (${(stats.size / 1024).toFixed(1)}KB)`);
    } else {
        console.log(`  ❌ ${file} - MISSING`);
    }
});

// Create deployment package info
console.log('\n📦 Creating deployment info...');
const deploymentInfo = {
    buildDate: new Date().toISOString(),
    nodeVersion: process.version,
    files: distFiles.filter(f => fs.existsSync(f)).map(f => ({
        name: f,
        size: fs.statSync(f).size
    }))
};

fs.writeFileSync('dist/build-info.json', JSON.stringify(deploymentInfo, null, 2));
console.log('  ✅ Build info saved to dist/build-info.json');

console.log('\n🎉 Build completed successfully!');
console.log('\n📋 Next steps:');
console.log('  1. Test the add-in: npm run dev-server');
console.log('  2. Deploy files from dist/ folder to your web server');
console.log('  3. Update manifest.xml URLs to point to your server');
console.log('  4. Install via Microsoft 365 Admin Center or sideload for testing');
console.log('\n📖 See README.md for detailed deployment instructions');