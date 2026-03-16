import * as fs from 'fs';

const path = 'd:\\github\\salesforce\\src\\app\\service\\print\\[id]\\page.tsx';
let data = fs.readFileSync(path, 'utf8');

// replace text-[9px], text-[10px], text-xs
data = data.replace(/text-\[9px\]/g, 'text-sm')
           .replace(/text-\[10px\]/g, 'text-sm')
           .replace(/text-xs/g, 'text-sm');

fs.writeFileSync(path, data);
console.log('Replacements completed successfully');
