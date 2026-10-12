export const stats = [
  { label: "Produksi Bulan Ini", value: "486", unit: "unit", note: "↑ 12,4% dari bulan lalu", tone: "positive" },
  { label: "Konsumsi Energi", value: "1.284", unit: "kWh", note: "↑ 4,2% dari bulan lalu", tone: "negative" },
  { label: "Biaya Energi", value: "Rp1,92 jt", unit: "", note: "Rp3.950 / unit", tone: "neutral" },
  { label: "Efisiensi Produksi", value: "87,6%", unit: "", note: "↑ 6,1% dari standar", tone: "positive" },
];

export const productionEnergy = [
  { month: "Apr", produksi: 45, energi: 38 },
  { month: "Mei", produksi: 53, energi: 43 },
  { month: "Jun", produksi: 60, energi: 49 },
  { month: "Jul", produksi: 67, energi: 56 },
  { month: "Agu", produksi: 76, energi: 67 },
  { month: "Sep", produksi: 88, energi: 73 },
];

export const orders = [
  { batch: "PO-0265", product: "Robot Edukasi R-01", qty: 20, energy: "48,2 kWh", cost: "Rp118.500", status: "Selesai", kind: "done" },
  { batch: "PO-0266", product: "Lengan Robot R-06", qty: 35, energy: "61,7 kWh", cost: "Rp86.200", status: "Produksi", kind: "process" },
  { batch: "PO-0267", product: "Robot Inspeksi V-02", qty: 15, energy: "—", cost: "Rp125.000", status: "Terencana", kind: "planned" },
];

export const processes = [
  { name: "Persiapan rangka robot", duration: "25 menit · selesai", energy: "4,2 kWh", width: 18, state: "complete" },
  { name: "Perakitan aktuator", duration: "48 menit · selesai", energy: "8,6 kWh", width: 30, state: "complete" },
  { name: "Integrasi kontrol", duration: "65 menit · berjalan", energy: "18,1 kWh", width: 59, state: "current" },
  { name: "Kalibrasi & uji beban", duration: "Target 40 menit", energy: "30,8 kWh", width: 100, state: "upcoming" },
];

export const costs = [
  ["Bahan baku", "Rp1.890.000"],
  ["Tenaga kerja", "Rp780.000"],
  ["Energi", "Rp92.550"],
  ["Overhead", "Rp255.450"],
  ["Total HPP", "Rp3.018.000"],
];