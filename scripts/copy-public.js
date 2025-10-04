import { copy } from 'fs-extra';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure the public directory exists in the build output
const publicDir = join(__dirname, '..', 'public');
const buildDir = join(__dirname, '..', 'dist');

async function copyPublicFiles() {
  try {
    // Copy all files from public to build directory
    await copy(publicDir, buildDir, {
      filter: (src) => {
        const fileName = basename(src);
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