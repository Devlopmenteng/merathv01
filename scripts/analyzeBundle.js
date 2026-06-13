#!/usr/bin/env node

/**
 * Bundle Size Analysis Script
 * This script analyzes the bundle size and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BUDGET_LIMITS = {
  js: 500 * 1024, // 500KB for JavaScript
  css: 100 * 1024, // 100KB for CSS
  total: 600 * 1024, // 600KB total
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function analyzeBundle(directory) {
  const distPath = path.join(process.cwd(), directory);
  
  if (!fs.existsSync(distPath)) {
    console.log(`❌ Build directory not found: ${distPath}`);
    console.log('Please run: npm run build:web');
    return;
  }

  let totalSize = 0;
  const fileSizes = {};

  function analyzeDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        analyzeDirectory(filePath);
      } else {
        const fileSize = stat.size;
        totalSize += fileSize;
        fileSizes[filePath] = fileSize;
      }
    }
  }

  analyzeDirectory(distPath);

  console.log('\n📊 Bundle Size Analysis');
  console.log('======================');
  console.log(`Total Bundle Size: ${formatBytes(totalSize)}`);
  console.log(`Budget Limit: ${formatBytes(BUDGET_LIMITS.total)}`);
  
  if (totalSize > BUDGET_LIMITS.total) {
    console.log(`❌ OVER BUDGET by ${formatBytes(totalSize - BUDGET_LIMITS.total)}`);
  } else {
    console.log(`✅ Within budget (${formatBytes(BUDGET_LIMITS.total - totalSize)} remaining)`);
  }

  console.log('\n📁 Largest Files:');
  const sortedFiles = Object.entries(fileSizes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);
  
  for (const [filePath, size] of sortedFiles) {
    const relativePath = path.relative(distPath, filePath);
    const percentage = ((size / totalSize) * 100).toFixed(1);
    console.log(`  ${relativePath}: ${formatBytes(size)} (${percentage}%)`);
  }

  // Optimization recommendations
  console.log('\n💡 Optimization Recommendations:');
  if (totalSize > BUDGET_LIMITS.total) {
    console.log('  • Consider code splitting for large modules');
    console.log('  • Remove unused dependencies');
    console.log('  • Optimize images and assets');
    console.log('  • Enable compression');
  } else if (totalSize > BUDGET_LIMITS.total * 0.8) {
    console.log('  • Monitor bundle size growth');
    console.log('  • Consider lazy loading for non-critical paths');
  } else {
    console.log('  • Bundle size is well optimized');
  }
}

// Run analysis
const distDir = process.argv[2] || 'dist';
analyzeBundle(distDir);