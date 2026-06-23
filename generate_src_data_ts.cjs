const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'reptil_products.json'), 'utf8'));

function cleanImage(image) {
  if (!image) return '';
  return image.toString().split(/\r?\n/)[0].trim();
}

function makeDescription(item) {
  if (!item.name) return 'Gear outdoor terbaik untuk petualangan Anda.';
  return item.name.toString().trim();
}

function makeSizes(category) {
  if (category === 'Pakaian') return ['S', 'M', 'L', 'XL'];
  if (category === 'Tas & Carrier') return ['One Size'];
  if (category === 'Tenda & Shelter') return ['One Size'];
  return ['One Size'];
}

function makeFeatures(category) {
  switch (category) {
    case 'Pakaian':
      return ['Bahan teknis bernafas', 'Potongan nyaman untuk aktivitas outdoor'];
    case 'Tas & Carrier':
      return ['Konstruksi ringkas dengan kompartemen terorganisir', 'Bahan anti abrasi dan tahan cuaca'];
    case 'Tenda & Shelter':
      return ['Waterproof premium', 'Rangka mudah dirakit'];
    default:
      return ['Didesain khusus untuk outdoor', 'Detail fungsional untuk kegiatan lapangan'];
  }
}

const products = data.products.map((item) => ({
  id: item.id,
  title: item.name.toString().trim(),
  price: Number(item.price.discounted || item.price.original || 0),
  originalPrice: item.price.discount_percentage > 0 ? Number(item.price.original) : undefined,
  category: item.category,
  image: cleanImage(item.images && item.images[0] ? item.images[0] : ''),
  description: makeDescription(item),
  colors: [
    { name: 'Earth Green', hex: '#2D3E35', bgClass: 'bg-[#2D3E35]' },
    { name: 'Stone Black', hex: '#111111', bgClass: 'bg-[#111111]' }
  ],
  sizes: makeSizes(item.category),
  features: makeFeatures(item.category)
}));

const heroSlides = [
  {
    id: 'hero-1',
    title: 'MAMBA 25 Daypack',
    subtitle: 'Essential Trail Backpack',
    image: cleanImage(products.find((p) => p.id === 'RA-TAS-001')?.image || ''),
    accentColor: '#2D3E35',
    description: 'Ransel harian yang ringan dan kuat untuk jalur teknis atau perjalanan weekend. Material anti lembap dan kompartemen terorganisir untuk semua kebutuhan outdoor.',
    price: 265000,
    colors: [
      { name: 'Forest Green', hex: '#2D3E35', bgClass: 'bg-[#2D3E35]' },
      { name: 'Onyx Black', hex: '#111111', bgClass: 'bg-[#111111]' },
      { name: 'Sand Khaki', hex: '#C2B29F', bgClass: 'bg-[#C2B29F]' }
    ],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 'hero-2',
    title: 'BURMA Ultralight Carrier',
    subtitle: 'Expedition Ready Pack',
    image: cleanImage(products.find((p) => p.id === 'RA-TAS-002')?.image || ''),
    accentColor: '#556B2F',
    description: 'Carrier serbaguna dengan rangka ringan, cocok untuk pendakian panjang dan perjalanan hiking. Dibuat untuk keseimbangan antara muatan dan kenyamanan.',
    price: 375000,
    colors: [
      { name: 'Army Drab', hex: '#556B2F', bgClass: 'bg-[#556B2F]' },
      { name: 'Charcoal', hex: '#3B3C36', bgClass: 'bg-[#3B3C36]' }
    ],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 'hero-3',
    title: 'BOA 15 Pack',
    subtitle: 'Fast-Paced Adventure Pack',
    image: cleanImage(products.find((p) => p.id === 'RA-TAS-003')?.image || ''),
    accentColor: '#4C5852',
    description: 'Tas daypack minimalis untuk aktivitas cepat, trail running, dan short hike. Ringan dengan ruang yang cukup untuk perlengkapan penting Anda.',
    price: 185000,
    colors: [
      { name: 'Sage Green', hex: '#4C5852', bgClass: 'bg-[#4C5852]' },
      { name: 'Desert Sand', hex: '#C2B29F', bgClass: 'bg-[#C2B29F]' }
    ],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 'hero-4',
    title: 'TAIPAN 25 Backpack',
    subtitle: 'All-Round Trekking Gear',
    image: cleanImage(products.find((p) => p.id === 'RA-TAS-004')?.image || ''),
    accentColor: '#2C3539',
    description: 'Backpack 25L serbaguna dengan detail ergonomis. Siap untuk ekspedisi, traveling, dan aktivitas lapangan sepanjang hari.',
    price: 265000,
    colors: [
      { name: 'Matte Black', hex: '#1C1C1C', bgClass: 'bg-[#1C1C1C]' },
      { name: 'Olive Drab', hex: '#556B2F', bgClass: 'bg-[#556B2F]' }
    ],
    sizes: ['S', 'M', 'L', 'XL']
  }
];

const testimonials = [
  {
    id: 't-1',
    name: 'Raka H.',
    role: 'Pendaki Bandung',
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=200&auto=format&fit=crop',
    review: 'MAMBA 25 sangat mendukung saat naik gunung. Kompartemennya rapih, pinggangnya nyaman, dan terasa kuat. Pengiriman dari Bandung cepat sampai.',
    rating: 5
  },
  {
    id: 't-2',
    name: 'Lestari W.',
    role: 'Backpacker Jawa Barat',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    review: 'Flysheet Tenda Reptil Adventure tahan hujan dan mudah dipasang. Terasa premium untuk harga lokal, cocok buat kemping keluarga.',
    rating: 5
  },
  {
    id: 't-3',
    name: 'Bagas P.',
    role: 'Trail Runner',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    review: 'Hydropack Turtle pas di badan, ringan, dan penyimpanan botolnya praktis sekali. Saya sekarang pakai setiap latihan lari gunung.',
    rating: 5
  }
];

const fileContent = `import { Product, HeroSlide, Testimonial } from './types';

export const HERO_SLIDES: HeroSlide[] = ${JSON.stringify(heroSlides, null, 2)};

export const PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};

export const TESTIMONIALS: Testimonial[] = ${JSON.stringify(testimonials, null, 2)};
`;

fs.writeFileSync(path.resolve(__dirname, 'src', 'data.ts'), fileContent, 'utf8');
console.log('Generated src/data.ts with', products.length, 'products.');
