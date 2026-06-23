const xlsx = require('xlsx');
const path = 'C:\\Users\\MY LENOVO\\Downloads\\Thunderbit_be0e3c_20260604_032849.xlsx';
const workbook = xlsx.readFile(path);
console.log('Sheets:', workbook.SheetNames);
for (const sheetName of workbook.SheetNames) {
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  console.log('---', sheetName, '---');
  data.slice(0, 11).forEach(row => console.log(row.join(' | ')));
}
