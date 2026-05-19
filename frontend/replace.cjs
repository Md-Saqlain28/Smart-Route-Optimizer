const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.css') || file.endsWith('.html')) {
        results.push(file);
      }
    }
  });
  return results;
};

const files = walk(path.join(__dirname, 'src'));
files.push(path.join(__dirname, 'index.html'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content
    // Replace slate with neutral gray
    .replace(/slate/g, 'gray')
    // Change some primary green to red to mix red and green
    .replace(/bg-green-600/g, 'bg-red-600')
    .replace(/text-green-600/g, 'text-red-600')
    .replace(/border-green-600/g, 'border-red-600')
    .replace(/shadow-green-100/g, 'shadow-red-100')
    .replace(/bg-green-100/g, 'bg-red-100')
    .replace(/text-green-700/g, 'text-red-700')
    .replace(/text-green-100/g, 'text-red-100')
    .replace(/text-green-500/g, 'text-red-500')
    .replace(/bg-green-50/g, 'bg-red-50')
    .replace(/border-green-50/g, 'border-red-50')
    .replace(/bg-emerald-/g, 'bg-green-')
    .replace(/text-emerald-/g, 'text-green-')
    // Maybe make the app background pure white instead of gray-50
    .replace(/bg-gray-50/g, 'bg-white')
    .replace(/bg-gray-100/g, 'bg-gray-50')
    // Increase some font sizes if there are small ones
    .replace(/text-xs/g, 'text-sm')
    .replace(/text-\[10px\]/g, 'text-xs')
    .replace(/text-\[8px\]/g, 'text-[10px]')
    // Custom scrollbar
    .replace(/rgba\(34, 197, 94/g, 'rgba(239, 68, 68'); // change rgb for green to red in index.css

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${file}`);
  }
});
