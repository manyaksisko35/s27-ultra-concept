// Galaxy S26 Ultra ve Galaxy S25 Ultra karşılaştırması.
// Kaynak: Samsung'un resmi sayfaları (samsung.com/us/smartphones/galaxy-s26-ultra/compare/,
// samsung.com/us/smartphones/galaxy-s25-ultra/compare/, samsung.com/nz/smartphones/galaxy-s25-ultra/specs/)
// highlight: S26 Ultra'nın öne çıktığı satırlar (vurgulu gösterilir)
export type CompareRow = { label: string; s26: string; s25: string; highlight?: boolean };

export const COMPARE_ROWS: CompareRow[] = [
  { label: 'Display', s26: '6.9" QHD+ Dynamic AMOLED 2X', s25: '6.9" QHD+ Dynamic AMOLED 2X' },
  { label: 'Peak brightness', s26: '2600 nits', s25: '2600 nits' },
  { label: 'Privacy Display', s26: 'Built-in', s25: '—', highlight: true },
  { label: 'Processor', s26: 'Snapdragon 8 Elite Gen 5 for Galaxy', s25: 'Snapdragon 8 Elite for Galaxy', highlight: true },
  { label: 'Main camera', s26: '200MP F1.4', s25: '200MP F1.7', highlight: true },
  { label: 'Ultra-wide', s26: '50MP', s25: '50MP F1.9' },
  { label: 'Telephoto', s26: '50MP 5x F2.9 + 10MP 3x', s25: '50MP 5x F3.4 + 10MP 3x', highlight: true },
  { label: 'Front camera', s26: '12MP', s25: '12MP' },
  { label: 'Battery', s26: '5,000mAh · up to 31h video', s25: '5,000mAh · up to 31h video' },
  { label: 'Wired charging', s26: '60W Super Fast Charging 3.0', s25: '45W Super Fast Charging 2.0', highlight: true },
  { label: 'Dimensions', s26: '163.6 x 78.1 x 7.9 mm', s25: '162.8 x 77.6 x 8.2 mm', highlight: true },
  { label: 'Weight', s26: '214g', s25: '218g', highlight: true },
];

// S26 Ultra'nın S25 Ultra'ya göre performans kazanımları (Samsung'un karşılaştırma sayfasından)
export const COMPARE_GAINS = [
  { value: '39%', label: 'faster AI (NPU)' },
  { value: '24%', label: 'better graphics (GPU)' },
  { value: '19%', label: 'faster processing (CPU)' },
];
