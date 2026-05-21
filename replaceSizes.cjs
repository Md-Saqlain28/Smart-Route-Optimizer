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
      if (file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
};

const files = walk(path.join(__dirname, 'src'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content
    .replace(/text-\[8px\]/g, 'text-[0.6rem]')
    .replace(/text-\[9px\]/g, 'text-[0.7rem]')
    .replace(/text-\[10px\]/g, 'text-[0.8rem]')
    .replace(/text-\[11px\]/g, 'text-[0.9rem]');

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated sizes in ${file}`);
  }
});
