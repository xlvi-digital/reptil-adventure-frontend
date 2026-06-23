const fs = require('fs');
const data = JSON.parse(fs.readFileSync('reptil_products.json', 'utf8'));
const cats = new Set();
for (const p of data.products) cats.add(p.category);
console.log(JSON.stringify([...cats].sort(), null, 2));
console.log('total', data.products.length);
