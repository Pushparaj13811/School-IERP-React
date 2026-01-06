const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

/**
 * Convert images to WebP format with high quality and small size
 * This script will:
 * 1. Find all JPG/JPEG/PNG files in the profiles directory
 * 2. Convert them to WebP with optimal compression
 * 3. Save them with the same name but .webp extension
 * 4. Optionally delete original files
 */

// Check for command line arguments
const args = process.argv.slice(2);
const shouldDeleteOriginals = args.includes('--delete') || args.includes('-d');

const CONFIG = {
  inputDir: './uploads/profile-pictures', // Updated path
  quality: 85, // 85 provides excellent quality with great compression
  effort: 6, // 0-6, higher = better compression but slower (6 recommended)
  deleteOriginals: shouldDeleteOriginals, // Controlled by --delete flag
  skipIfExists: true // Skip conversion if .webp version already exists
};

async function convertToWebP(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const baseName = path.basename(filePath, ext);
    const dirName = path.dirname(filePath);
    const outputPath = path.join(dirName, `${baseName}.webp`);

    // Check if webp already exists
    let webpExists = false;
    try {
      await fs.access(outputPath);
      webpExists = true;
    } catch {
      // File doesn't exist
    }

    // If WebP exists and we should skip conversion
    if (CONFIG.skipIfExists && webpExists) {
      console.log(`⏭️  Skipped (already exists): ${path.basename(outputPath)}`);
      
      // Delete original file if deleteOriginals is enabled
      if (CONFIG.deleteOriginals) {
        await fs.unlink(filePath);
        console.log(`🗑️  Deleted original (WebP exists): ${path.basename(filePath)}\n`);
        return { skipped: true, deletedOriginal: true };
      }
      
      return { skipped: true, deletedOriginal: false };
    }

    const startTime = Date.now();
    const stats = await fs.stat(filePath);
    const originalSize = stats.size;

    // Convert to WebP with optimal settings
    await sharp(filePath)
      .webp({
        quality: CONFIG.quality,
        effort: CONFIG.effort,
        lossless: false // Use lossy compression for smaller files
      })
      .toFile(outputPath);

    const outputStats = await fs.stat(outputPath);
    const newSize = outputStats.size;
    const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(2);
    const timeTaken = Date.now() - startTime;

    console.log(`✅ Converted: ${path.basename(filePath)}`);
    console.log(`   Original: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`   New: ${(newSize / 1024).toFixed(2)} KB`);
    console.log(`   Reduction: ${reduction}%`);
    console.log(`   Time: ${timeTaken}ms\n`);

    // Delete original file if configured
    if (CONFIG.deleteOriginals) {
      await fs.unlink(filePath);
      console.log(`🗑️  Deleted original: ${path.basename(filePath)}\n`);
    }

    return {
      file: path.basename(filePath),
      originalSize,
      newSize,
      reduction: parseFloat(reduction),
      skipped: false
    };
  } catch (error) {
    console.error(`❌ Error converting ${filePath}:`, error.message);
    return { error: error.message, file: path.basename(filePath) };
  }
}

async function processDirectory() {
  try {
    console.log('🚀 Starting image conversion to WebP...\n');
    console.log(`📁 Input directory: ${CONFIG.inputDir}`);
    console.log(`⚙️  Quality: ${CONFIG.quality}`);
    console.log(`⚙️  Effort: ${CONFIG.effort}`);
    console.log(`🗑️  Delete originals: ${CONFIG.deleteOriginals ? '✅ YES' : '❌ NO'}\n`);

    const files = await fs.readdir(CONFIG.inputDir);
    
    // Filter for image files
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png'].includes(ext);
    });

    if (imageFiles.length === 0) {
      console.log('❌ No image files found in the directory.');
      return;
    }

    console.log(`📸 Found ${imageFiles.length} images to convert\n`);
    console.log('─'.repeat(50) + '\n');

    const results = [];
    
    for (const file of imageFiles) {
      const filePath = path.join(CONFIG.inputDir, file);
      const result = await convertToWebP(filePath);
      results.push(result);
    }

    // Summary
    console.log('─'.repeat(50));
    console.log('\n📊 Conversion Summary:\n');
    
    const successful = results.filter(r => !r.error && !r.skipped);
    const skipped = results.filter(r => r.skipped && !r.deletedOriginal);
    const skippedAndDeleted = results.filter(r => r.skipped && r.deletedOriginal);
    const failed = results.filter(r => r.error);
    
    console.log(`✅ Successfully converted: ${successful.length}`);
    console.log(`⏭️  Skipped (already converted): ${skipped.length}`);
    if (skippedAndDeleted.length > 0) {
      console.log(`🗑️  Skipped but deleted original: ${skippedAndDeleted.length}`);
    }
    console.log(`❌ Failed: ${failed.length}`);
    
    if (successful.length > 0) {
      const totalOriginal = successful.reduce((sum, r) => sum + r.originalSize, 0);
      const totalNew = successful.reduce((sum, r) => sum + r.newSize, 0);
      const avgReduction = ((totalOriginal - totalNew) / totalOriginal * 100).toFixed(2);
      
      console.log(`\n💾 Total size reduction: ${avgReduction}%`);
      console.log(`   Original: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   New: ${(totalNew / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Saved: ${((totalOriginal - totalNew) / 1024 / 1024).toFixed(2)} MB`);
    }

    if (failed.length > 0) {
      console.log('\n❌ Failed files:');
      failed.forEach(f => console.log(`   - ${f.file}: ${f.error}`));
    }

    console.log('\n✨ Done!\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Run the conversion
processDirectory();

// Export for use as module
module.exports = { convertToWebP, processDirectory };