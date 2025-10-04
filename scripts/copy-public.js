const fs = require('fs-extra');
const path = require('path');

// Ensure the public directory exists in the build output
const publicDir = path.join(__dirname, 'public');
const buildDir = path.join(__dirname, 'dist');

async function copyPublicFiles() {
  try {
    // Copy all files from public to build directory
    await fs.copy(publicDir, buildDir, {
      filter: (src) => {
        const fileName = path.basename(src);
        return !fileName.startsWith('.') && fileName !== 'index.html';
      }
    });
    console.log('Successfully copied public files to build directory');
  } catch (err) {
    console.error('Error copying public files:', err);
    process.exit(1);
  }
}

copyPublicFiles();