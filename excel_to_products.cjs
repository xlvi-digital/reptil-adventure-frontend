const xlsx = require('xlsx');
const fs = require('fs');
const path = 'C:\\Users\\MY LENOVO\\Downloads\\Thunderbit_be0e3c_20260604_032849.xlsx';
const workbook = xlsx.readFile(path);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

function mapCategory(title) {
  const t = title.toLowerCase();
  if (t.includes('tas') || t.includes('backpack') || t.includes('ransel') || t.includes('daypack') || t.includes('bag') || t.includes('backpack')) return 'Tas & Carrier';
  if (t.includes('tenda') || t.includes('flysheet') || t.includes('shelter')) return 'Tenda & Shelter';
  if (t.includes('jaket') || t.includes('jacket') || t.includes('rompi') || t.includes('celana') || t.includes('pakaian') || t.includes('shirt') || t.includes('cap') || t.includes('t-shirt') || t.includes('tee')) return 'Pakaian';
  return 'Aksesoris';
}

let products = [];
let counter = {};
rows.forEach((r, idx) => {
  const name = (r['Nama Produk'] || r['Nama Produk ']) || r['Nama Produk\ufeff'] || r['Product Name'] || '';
  if (!name) return;
  const url = r['URL Produk'] || r['URL Produk '] || r['URL Produk\ufeff'] || r['URL'] || '';
  const harga_diskon = Number(String(r['Harga Diskon (IDR)'] || r['Harga Diskon'] || r['Harga Diskon (IDR)'] || r['Harga Diskon (IDR)']).replace(/[^0-9.-]/g, '')) || 0;
  const harga_asli = Number(String(r['Harga Asli (IDR)'] || r['Harga Asli'] || r['Harga Asli (IDR)']).replace(/[^0-9.-]/g, '')) || harga_diskon;
  const diskon = Number(String(r['Persentase Diskon'] || r['Persentase Diskon '] || r['Persentase Diskon (%)'] || 0)) || 0;
  const rating = Number(r['Rating Produk'] || r['Rating Produk '] || r['Rating Produk(Rating)'] || 0) || 0;
  const reviews = Number(r['Jumlah Penilaian'] || r['Jumlah Penilaian '] || r['Jumlah Penilaian']) || 0;
  const gambar = (r['Gambar Produk'] || r['Gambar Produk '] || r['Gambar Produk\ufeff'] || '').toString().trim();
  const merek = (r['Merek'] || r['Brand'] || '').toString().trim() || 'REPTIL ADVENTURE';
  const bahan = (r['Bahan'] || r['Material'] || '').toString().trim() || null;
  const ukuran_tas = (r['Ukuran Tas'] || r['Ukuran Tas '] || r['Ukuran Tas\ufeff'] || '').toString().trim() || null;
  const negara = (r['Negara Asal'] || r['Country'] || '').toString().trim() || 'Indonesia';

  const category = mapCategory(name);

  // generate id prefix from brand initials
  const brandCode = (merek.match(/\b\w/g) || []).join('').toUpperCase() || 'RA';
  const catCode = category.split(' ')[0].slice(0,3).toUpperCase();
  counter[catCode] = (counter[catCode] || 0) + 1;
  const id = `${brandCode}-${catCode}-${String(counter[catCode]).padStart(3,'0')}`;

  products.push({
    id,
    name: name.toString().trim(),
    category,
    brand: merek,
    price: {
      original: harga_asli,
      discounted: harga_diskon,
      discount_percentage: diskon
    },
    specs: {
      material: bahan || null,
      size_capacity: ukuran_tas || null,
      origin: negara || 'Indonesia'
    },
    rating: {
      score: rating || 0,
      reviews_count: reviews || 0
    },
    images: gambar ? [gambar.replace(/@resize.*$/,'')] : [],
    availability: {
      status: 'in_stock',
      transaction_options: ['jual beli','sewa']
    },
    shopee_url: url || ''
  });
});

const out = { products };
fs.writeFileSync('reptil_products.json', JSON.stringify(out, null, 2), 'utf8');
console.log('Wrote reptil_products.json with', products.length, 'items');
